import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import apiUrl from '@/utils/apiUrls';
import { ThemedText } from '@/components/ThemedText';
import i18next from 'i18next';

export default function LoginScreen() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigation = useNavigation<any>();

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Error', 'Please enter both username and password.');
            return;
        }

        const allUsers = await fetch(`${apiUrl}/users`);
        const allUsersJson = await allUsers.json();
        if (allUsersJson.some((user: any) => user.username === username && user.password === password)) {
            const user = allUsersJson.find((user: any) => user.username === username);
            await AsyncStorage.setItem('userToken', user.id);
            navigation.navigate('(tabs)');
        } else {
            Alert.alert('Error', 'Invalid username or password.');
        }
    };

    const IMAGE_URL = require('@/assets/images/revolve-logo.png');

    return (
        <View style={styles.container}>
            <Image source={IMAGE_URL} style={styles.image} />
            <ThemedText style={styles.title}>{i18next.t('signin')}</ThemedText>
            <TextInput
                style={styles.input}
                placeholder={i18next.t('username')}
                placeholderTextColor="gray"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder={i18next.t('password')}
                placeholderTextColor="gray"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
            />
            <TouchableOpacity onPress={handleLogin} style={styles.button}>
                <Text style={styles.buttonText}>{i18next.t('signin')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('register')} style={styles.button}>
                <Text style={styles.buttonText}>{i18next.t('signup')}</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 16 
    },
    title: { 
        fontSize: 24, 
        marginBottom: 20 
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
        borderRadius: 4,
        color: 'white',
        backgroundColor: '#333',
    },
    button: {
        backgroundColor: '#FFCF26',
        padding: 10,
        borderRadius: 4,
        marginTop: 10,
        width: '50%',
        minWidth: 100,
    },
    buttonText: {
        color: 'black',
        textAlign: 'center',
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 40,
    }
});
