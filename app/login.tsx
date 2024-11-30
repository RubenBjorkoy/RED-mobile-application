import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import apiUrl from '@/utils/apiUrls';

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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="gray"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="gray"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                autoCapitalize="none"
            />
            <Button title="Log In" onPress={handleLogin} />
            <Button
                title="Register"
                onPress={() => {
                    navigation.navigate('register'); // Navigate to the Register screen
                }}
            />
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
});
