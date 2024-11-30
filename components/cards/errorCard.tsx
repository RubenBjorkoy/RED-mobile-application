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

    return (
        <ThemedView style={styles.container}>
            {
                error.resolved === '' ? (
                    <ThemedText style={styles.notResolved}>Not resolved</ThemedText>
                ) : (
                    <ThemedText style={styles.resolved}>Resolved</ThemedText>
                )
            }
            <ThemedText style={styles.setColorDark} type="subtitle">{error.title}</ThemedText>
            <ThemedText style={styles.setColorDark}>{error.system}</ThemedText>
            <ThemedText style={styles.setColorDark}>{error.subsystem}</ThemedText>
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
    setColorDark: {
        color: '#aaaaaa',
    },
    notResolved: {
        color: 'red',
    },
    resolved: {
        color: 'green',
    }
});