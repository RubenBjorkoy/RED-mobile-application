import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import apiUrl from '@/utils/apiUrls';
import { ErrorProps, CommentProps } from '@/utils/types';
import { ThemedText } from '@/components/ThemedText';
import { ImageProps } from '@/utils/types';
import i18next from 'i18next';
import { ThemedView } from '@/components/ThemedView';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ErrorDetails() {
  const { errorId } = useGlobalSearchParams();

  const [errorDetails, setErrorDetails] = useState<ErrorProps>();
  const [imageUrl, setImageUrl] = useState('');
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [newComment, setNewComment] = useState<CommentProps>({
    id: '',
    comment: '',
    user: '',
    errorId: '',
    timestamp: 0,
  });
  const [author, setAuthor] = useState<string>('');
  const [user, setUser] = useState<string>('');
  const [idUserMap, setIdUserMap] = useState<{ [key: string]: string }>({});
  const [reloading, setReloading] = useState<boolean>(false);

  const fetchDetails = async () => {
    setReloading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        setUser(userToken);
      }

      const errorResponse = await fetch(`${apiUrl}/errors/${errorId}`);
      if (!errorResponse.ok) throw new Error('Error fetching error details');
      const errorData = await errorResponse.json();
      setErrorDetails(errorData);

      const authorResponse = await fetch(`${apiUrl}/users/${errorData.user}`);
      if (!authorResponse.ok) throw new Error('Error fetching author');
      const authorData = await authorResponse.json();
      setAuthor(authorData.username);

      const allUsersResponse = await fetch(`${apiUrl}/users`);
      if (!allUsersResponse.ok) throw new Error('Error fetching users');
      const allUsersData = await allUsersResponse.json();
      const idUserMap: { [key: string]: string } = {};
      allUsersData.forEach((user: any) => {
        idUserMap[user.id] = user.username;
      });
      setIdUserMap(idUserMap);

      const imageResponse = await fetch(`${apiUrl}/images/${errorData.image}`);
      if (!imageResponse.ok) throw new Error('Error fetching image');
      const imageData: ImageProps = await imageResponse.json();
      setImageUrl(imageData.image);

      const commentsResponse = await fetch(`${apiUrl}/comments?errorId=${errorId}`);
      if (!commentsResponse.ok) throw new Error('Error fetching comments');
      const commentsData = await commentsResponse.json();
      // console.log(commentsData[0]);
      setComments(commentsData);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', error as string);
    }
    setReloading(false);
  };

  useEffect(() => {
    fetchDetails();
  }, [errorId]);

  // Add a new comment
  const handleAddComment = async () => {
    if (!newComment.comment.trim()) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }

    try {
      const freshComment = { 
        ...newComment,
        errorId: Array.isArray(errorId) ? errorId[0] : errorId,
        user: user,
        timestamp: Date.now(),
      };
      const response = await fetch(`${apiUrl}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(freshComment),
      });
      if (!response.ok) throw new Error('Error adding comment');
      // const updatedComments = await fetch(`${apiUrl}/comments?errorId=${errorId}`);

      // const updatedCommentsJson = await updatedComments.json();
      // setComments(updatedCommentsJson);
      setNewComment({
        id: '',
        comment: '',
        user: '',
        errorId: '',
        timestamp: 0,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add comment');
    }
  };

  if (!errorDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      refreshControl={<RefreshControl refreshing={reloading} onRefresh={fetchDetails} />}
      contentContainerStyle={styles.container}>
      <ThemedText style={styles.title}>{errorDetails.title}</ThemedText>
      <ThemedText style={styles.system}>{author}</ThemedText>
      <ThemedText style={styles.system}>{errorDetails.system}</ThemedText>
      <ThemedText style={styles.subsystem}>{errorDetails.subsystem}</ThemedText>
      <Image source={{ uri: `data:image/jpeg;base64,${imageUrl}` }} style={styles.image} />

      <ThemedView style={styles.commentsSection}>
        <ThemedText style={styles.sectionTitle}>{i18next.t('comments')}</ThemedText>
        {comments && comments.length > 0 &&
          comments.map((comment, index) => (
            <ThemedView key={index} style={styles.comment}>
              <ThemedText>{comment.comment}</ThemedText>
              <ThemedText style={styles.commentAuthor}>
                - {idUserMap[comment.user]} ({new Date(comment.timestamp).toLocaleString()})
              </ThemedText>
            </ThemedView>
          ))}
        {user && (
          <>
            <TextInput
              style={styles.commentInput}
              placeholder={`${i18next.t('writeComment')}...`}
              placeholderTextColor={'gray'}
              value={newComment.comment}
              onChangeText={(currComment: string) =>
                setNewComment({ ...newComment, comment: currComment })
              }
            />
            <Button title={i18next.t('addComment')} onPress={handleAddComment} />
          </>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
        // backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    system: {
        fontSize: 18,
        marginBottom: 8,
    },
    subsystem: {
        fontSize: 16,
        marginBottom: 8,
    },
    image: {
        width: '100%',
        height: "auto",
        borderRadius: 8,
        marginBottom: 16,
        aspectRatio: 1,
        objectFit: 'contain',
    },
    description: {
        fontSize: 16,
        marginBottom: 24,
    },
    commentsSection: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    comment: {
        padding: 12,
        backgroundColor: '#444',
        borderRadius: 8,
        marginBottom: 8,
    },
    commentInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 8,
        marginBottom: 8,
        color: 'white',
    },
    commentAuthor: {
      fontSize: 12,
      color: 'gray',
    },
});
