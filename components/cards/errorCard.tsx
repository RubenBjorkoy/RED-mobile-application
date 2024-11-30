import * as React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ErrorProps, ImageProps } from '@/utils/types';
import { tabBarHeight } from '@/constants/Measures';
import Vibrate from '@/utils/vibrate';
import apiUrl from '@/utils/apiUrls';
import i18next from 'i18next';
import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { ThemedView } from '../ThemedView';

export default function ErrorCard(error: ErrorProps) {
    const [expanded, setExpanded] = React.useState(false);
    const [image, setImage] = React.useState<ImageProps | null>(null);
    const navigation = useNavigation<any>();
    const router = useRouter();

    const onPress = () => {
        Vibrate.light();
        // setExpanded(!expanded);
        // if(!image) {
        //     fetchImage();
        // }
        // navigation.navigate(`${error.id}`);
        // if (error.id) {
        //     router.push(`/(tabs)/errors/[${error.id}]`);
        // }
    }

    const fetchImage = async () => {
        try {
            const response = await fetch(`${apiUrl}/images/${error.image}`);
            const data = await response.json();
            setImage(data);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <ThemedView style={styles.container}>
            <ThemedText style={styles.setColorDark} type="subtitle">{error.title}</ThemedText>
            <ThemedText style={styles.setColorDark}>{error.system}</ThemedText>
            <ThemedText style={styles.setColorDark}>{error.subsystem}</ThemedText>
            {
                // expanded && (
                //     <>
                //         <ThemedText style={styles.setColorDark}>{i18next.t('user')}: {error.user}</ThemedText>
                //         {
                //             image && (
                //                 <Image
                //                     source={{ uri: `data:image/jpeg;base64,${image.image}` }}
                //                     style={styles.image}
                //                 />
                //             )
                //         }
                //     </>
                // )
            }
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: 'auto',
        padding: 16,
        borderTopColor: '#aaaaaa',
        borderTopWidth: 1,
        borderBottomColor: '#aaaaaa',
        borderBottomWidth: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    stepContainer: {
        gap: 8,
    },
    setColorDark: {
        color: '#aaaaaa',
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        objectFit: 'contain',
    }
});