import { StyleSheet, Image, Text, TouchableOpacity, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect } from 'react';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';

interface User {
    image: string;
    name: string;
    role: string;
    group: string;
    theme: string;
    language: string;
}

export default function SettingsScreen() {
    const [user, setUser] = useState<User>({
        image: '',
        name: '',
        role: '',
        group: 'dataengineering',
        theme: 'dark',
        language: 'en',
    });

    useEffect(() => {
        console.log(user);
    }, [user]);

    const PROFILE_PICTURE = require('@/assets/images/react-logo.png');

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ParallaxScrollView
                headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
                headerImage={
                    <IconSymbol
                        size={310}
                        color="#808080"
                        name="gear.circle.fill"
                        style={styles.headerImage}
                    />
            }>
                <ThemedView style={styles.titleContainer}>
                    <ThemedText type="title">Settings</ThemedText>
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <ThemedText>Profile Picture</ThemedText>
                    <TouchableOpacity
                        onPress={() => console.log('Profile Picture pressed')}
                        style={{ width: '100%' }}
                    >
                        <Image
                            source={PROFILE_PICTURE}
                            style={styles.profileAvatar}
                        />
                    </TouchableOpacity>
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <ThemedText>Username</ThemedText>
                        <TextInput 
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1, color: 'white' }}
                            placeholder="Username"
                            placeholderTextColor={'gray'}
                            value={user.name}
                            onChange={(e) => setUser({ ...user, name: e.nativeEvent.text })}
                        />
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <ThemedText>Group</ThemedText>
                        <Picker
                            style={{ width: '100%', color: 'white' }}
                            onValueChange={(itemValue: string) => setUser({ ...user, group: itemValue })}
                            selectedValue={user.group}
                        >
                            <Picker.Item label="Board" value="board" />
                            <Picker.Item label="Marketing" value="marketing" />
                            <Picker.Item label="Embedded Electronics" value="embeddedelectronics" />
                            <Picker.Item label="Powertrain" value="powertrain" />
                            <Picker.Item label="Aerodynamics" value="aerodynamics" />
                            <Picker.Item label="Chassis" value="chassis" />
                            <Picker.Item label="Suspension" value="suspension" />
                            <Picker.Item label="Drivetrain" value="drivetrains" />
                            <Picker.Item label="Control Systems" value="controlsystems" />
                            <Picker.Item label="Data Engineering" value="dataengineering" />
                            <Picker.Item label="Autonomous Systems" value="autonomoussystems" />
                        </Picker>
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <ThemedText>Role</ThemedText>
                        <TextInput
                            style={{ height: 40, borderColor: 'gray', borderWidth: 1, color: 'white' }}
                            placeholder="Role"
                            placeholderTextColor={'gray'}
                            value={user.role}
                            onChange={(e) => setUser({ ...user, role: e.nativeEvent.text })}
                        />
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <ThemedText>Theme</ThemedText>
                        <Picker
                            style={{ width: '100%', color: 'white' }}
                            onValueChange={(itemValue: string) => setUser({ ...user, theme: itemValue })}
                            selectedValue={user.theme}
                        >
                            <Picker.Item label="Dark" value="dark" />
                            <Picker.Item label="Light" value="light" />
                        </Picker>
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <ThemedText>Language</ThemedText>
                        <Picker
                            style={{ width: '100%', color: 'white' }}
                            onValueChange={(itemValue: string) => setUser({ ...user, language: itemValue })}
                            selectedValue={user.language}
                        >
                            <Picker.Item label="English" value="en" />
                            <Picker.Item label="Norwegian" value="no" />
                        </Picker>
                </ThemedView>
                <ThemedView style={styles.inputContainer}>
                    <Button title="Cancel" color="#cc0000" onPress={() => console.log('Cancel pressed')} />
                    <Button title="Apply" color="#00bb00" onPress={() => console.log('Save pressed')} />
                </ThemedView>
            </ParallaxScrollView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    inputContainer: {
        gap: 8,
        color: 'white',
    },
    headerImage: {
      color: '#808080',
      bottom: -90,
      left: -35,
      position: 'absolute',
    },
    profileAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
    }
})