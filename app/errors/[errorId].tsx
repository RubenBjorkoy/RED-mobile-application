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
  TouchableOpacity,
  BackHandler
} from 'react-native';
import { useRouter, useGlobalSearchParams } from 'expo-router';
import apiUrl from '@/utils/apiUrls';
import { ErrorProps, CommentProps } from '@/utils/types';
import { ThemedText } from '@/components/ThemedText';
import { ImageProps } from '@/utils/types';
import i18next from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

function useBackButton(handler: () => void) {
  useEffect(() => {
      const listener = () => {
          handler();
          return true;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', listener);

      return () => backHandler.remove();
  }, [handler]);
}

export default function ErrorDetails() {
  const { errorId } = useGlobalSearchParams();

  const [errorDetails, setErrorDetails] = useState<ErrorProps>();
  const [imageUrl, setImageUrl] = useState('');
  const [comments, setComments] = useState<CommentProps[]>([]);
  const [newComment, setNewComment] = useState<CommentProps>({
    comment: '',
    user: '',
    errorId: '',
    timestamp: 0,
  });
  const [author, setAuthor] = useState<string>('');
  const [user, setUser] = useState<string>('');
  const [idUserMap, setIdUserMap] = useState<{ [key: string]: {name: string, role: string} }>({});
  const [reloading, setReloading] = useState<boolean>(false);
  const router = useRouter();

  const backButtonHandler = () => {
    router.back();
    return false;
  };

  useBackButton(backButtonHandler);

  const fetchDetails = async () => {
    setReloading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (userToken) {
        setUser(userToken);
      }
  
      const errorPromise = fetch(`${apiUrl}/errors/${errorId}`);
      const allUsersPromise = fetch(`${apiUrl}/users`);
      const commentsPromise = fetch(`${apiUrl}/comments?errorId=${errorId}`);
  
      const errorResponse = await errorPromise;
      if (!errorResponse.ok) throw new Error('Error fetching error details');
      const errorData = await errorResponse.json();
      setErrorDetails(errorData);
  
      const authorPromise = fetch(`${apiUrl}/users/${errorData.user}`);
      const imagePromise = fetch(`${apiUrl}/images/${errorData.image}`);
  
      const [authorResponse, allUsersResponse, imageResponse, commentsResponse] = await Promise.all([
        authorPromise,
        allUsersPromise,
        imagePromise,
        commentsPromise,
      ]);
  
      if (!authorResponse.ok) throw new Error('Error fetching author');
      const authorData = await authorResponse.json();
      setAuthor(authorData.username);
  
      if (!allUsersResponse.ok) throw new Error('Error fetching users');
      const allUsersData = await allUsersResponse.json();
      const idUserMap: { [key: string]: {name: string, role: string} } = {};
      allUsersData.forEach((user: any) => {
        idUserMap[user.id] = {"name": user.username, "role": user.role};
      });
      setIdUserMap(idUserMap);
  
      if (!imageResponse.ok) throw new Error('Error fetching image');
      const imageData: ImageProps = await imageResponse.json();
      setImageUrl(imageData.image);
  
      if (!commentsResponse.ok) throw new Error('Error fetching comments');
      const commentsData = await commentsResponse.json();
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
      const updatedComments = await fetch(`${apiUrl}/comments?errorId=${errorId}`);

      const updatedCommentsJson = await updatedComments.json();
      setComments(updatedCommentsJson);
      setNewComment({
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

  const handleDeleteComment = async (commentId: string) => {
    if(!commentId || commentId === '') {
      Alert.alert('Error', 'Invalid comment ID');
      return;
    }
    try {
      const response = await fetch(`${apiUrl}/comments/${commentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error deleting comment');
      const updatedComments = await fetch(`${apiUrl}/comments?errorId=${errorId}`);

      const updatedCommentsJson = await updatedComments.json();
      setComments(updatedCommentsJson);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to delete comment');
    }
  }

  const handleMarkSolution = async (commentId: string) => {
    if(!commentId || commentId === '') {
      Alert.alert('Error', 'Invalid comment ID');
      return;
    }
    if(errorDetails?.resolved === commentId) {
      try {
        const response = await fetch(`${apiUrl}/errors/${errorDetails?.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({...errorDetails, resolved: ''}),
        });
        if(!response.ok) throw new Error('Error removing solution');
        const updatedError = await fetch(`${apiUrl}/errors/${errorId}`);

        const updatedErrorJson = await updatedError.json();
        setErrorDetails(updatedErrorJson);
        return;
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to remove solution');
        return;
      }
    }
    try {
      const response = await fetch(`${apiUrl}/errors/${errorDetails?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({...errorDetails, resolved: commentId}),
      });
      if(!response.ok) throw new Error('Error marking solution');
      const updatedError = await fetch(`${apiUrl}/errors/${errorId}`);

      const updatedErrorJson = await updatedError.json();
      setErrorDetails(updatedErrorJson);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to mark solution');
    }
  }

  const handleDeleteError = async (errorId: string) => {
    if(!errorId || errorId === '') {
      Alert.alert('Error', 'Invalid error ID');
      return;
    }
    try {
      //Delete all comments for the error as well
      const commentsResponse = await fetch(`${apiUrl}/comments?errorId=${errorId}`);
      if (!commentsResponse.ok) throw new Error('Error fetching comments');
      const commentsData = await commentsResponse.json();
      commentsData.forEach(async (comment: CommentProps) => {
        const response = await fetch(`${apiUrl}/comments/${comment.id}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Error deleting comment');
      });

      const response = await fetch(`${apiUrl}/errors/${errorId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error deleting error');
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to delete error');
    }
  }

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
      {
        errorDetails.resolved && (errorDetails.resolved !== '') && (
          <ThemedText style={styles.resolved}>{i18next.t('resolved')}</ThemedText>
        ) || (
          <ThemedText style={styles.notResolved}>{i18next.t('notResolved')}</ThemedText>
        )
      }
      <ThemedText style={styles.title}>{errorDetails.title}</ThemedText>
      <ThemedText style={styles.system}>{author} ({errorDetails.user && idUserMap[errorDetails.user]?.role})</ThemedText>
      <ThemedText style={styles.system}>{errorDetails.system}</ThemedText>
      <ThemedText style={styles.subsystem}>{errorDetails.subsystem}</ThemedText>

      {
        imageUrl && (
          <Image
            source={{ uri: `data:image/jpeg;base64,${imageUrl}` }}
            style={styles.image}
          />
        ) || (
          reloading ? <ThemedText>{i18next.t('loadingImage')}</ThemedText> : <ThemedText>{i18next.t('noImage')}</ThemedText>
        )
      }
      <TouchableOpacity 
          onPress={() => router.push(`../(tabs)/map?latitude=${errorDetails.location.latitude}&longitude=${errorDetails.location.longitude}&errorId=${errorDetails.id}`)} 
          style={styles.mapButton}>
          <ThemedText style={{color: 'white', textAlign: 'center'}}>View in Map</ThemedText>
      </TouchableOpacity>
      {
        errorDetails.user === user && (
          <TouchableOpacity onPress={() => handleDeleteError(errorDetails.id || '')} style={styles.deleteButton}>
            <ThemedText style={{color: 'white', textAlign: 'center'}}>{i18next.t('delete')}</ThemedText>
          </TouchableOpacity>
        )
      }

      {
        errorDetails.resolved && (errorDetails.resolved !== '') && (
          <View>
            <ThemedText style={styles.sectionTitle}>{i18next.t('solution')}</ThemedText>
            <ThemedText>{comments.find((comment) => comment.id === errorDetails.resolved)?.comment}</ThemedText>
            <ThemedText style={styles.commentAuthor}>
              - {idUserMap[comments.find((comment) => comment.id === errorDetails.resolved)?.user || '']?.name} ({idUserMap[comments.find((comment) => comment.id === errorDetails.resolved)?.user || '']?.role}) ({new Date(comments.find((comment) => comment.id === errorDetails.resolved)?.timestamp || 0).toLocaleString()})
            </ThemedText>
            {
              errorDetails.user === user && (
                <TouchableOpacity onPress={() => handleMarkSolution(errorDetails.resolved)} style={styles.approveButton}>
                  <ThemedText style={{color: 'white', textAlign: 'center'}}>{i18next.t('removeSolution')}</ThemedText>
                </TouchableOpacity>
              )
            }
          </View>
        )
      }
        

      <View style={styles.commentsSection}>
        <ThemedText style={styles.sectionTitle}>{i18next.t('comments')}</ThemedText>
        {comments && comments.length > 0 &&
          comments.map((comment, index) => (
            <View key={index} style={styles.comment}>
              <ThemedText>{comment.comment}</ThemedText>
              <ThemedText style={styles.commentAuthor}>
                - {idUserMap[comment.user].name} ({idUserMap[comment.user].role}) ({new Date(comment.timestamp).toLocaleString()})
              </ThemedText>
              {
                errorDetails.user === user && (
                  errorDetails.resolved === comment.id ? (
                    <TouchableOpacity onPress={() => handleMarkSolution(comment.id || '')} style={styles.approveButton}>
                      <ThemedText style={{color: 'white', textAlign: 'center'}}>{i18next.t('removeSolution')}</ThemedText>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity onPress={() => handleMarkSolution(comment.id || '')} style={styles.approveButton}>
                      <ThemedText style={{color: 'white', textAlign: 'center'}}>{i18next.t('addSolution')}</ThemedText>
                    </TouchableOpacity>
                  )
                )
              }
              {
                comment.user === user && (
                  <TouchableOpacity onPress={() => handleDeleteComment(comment.id || '')} style={styles.deleteButton}>
                    <ThemedText style={{color: 'white', textAlign: 'center'}}>{i18next.t('delete')}</ThemedText>
                  </TouchableOpacity>
                )
              }
            </View>
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
              multiline={true}
              numberOfLines={4}
            />
            <TouchableOpacity onPress={handleAddComment} style={styles.addButton}>
              <ThemedText style={{color: 'black', textAlign: 'center'}}>{i18next.t('addComment')}</ThemedText>
            </TouchableOpacity>
            {/* <Button title={i18next.t('addComment')} onPress={handleAddComment} /> */}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 16,
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
        // height: 40,
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
    deleteButton: {
      marginBottom: 16,
      backgroundColor: '#cc1010',
      color: 'white',
      borderRadius: 2,
      padding: 8,
      textAlign: 'center',
      width: 'auto',
      elevation: 5,
    },
    approveButton: {
      marginBottom: 16,
      backgroundColor: '#107710',
      color: 'green',
      borderRadius: 2,
      padding: 8,
      textAlign: 'center',
      width: 'auto',
    },
    addButton: {
      marginBottom: 16,
      backgroundColor: '#FFCF26',
      color: 'green',
      borderRadius: 2,
      padding: 8,
      textAlign: 'center',
      width: 'auto',
    },
    notResolved: {
        color: 'red',
    },
    resolved: {
        color: 'green',
    },
    mapButton: {
      marginBottom: 16,
      backgroundColor: '#007bff',
      borderRadius: 4,
      padding: 12,
      alignItems: 'center',
  },
});
