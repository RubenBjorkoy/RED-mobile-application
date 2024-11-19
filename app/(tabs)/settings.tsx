import { StyleSheet, Image, Text, TouchableOpacity, Button, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect, useContext } from 'react';

import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { tabBarHeight } from '@/constants/Measures';
import i18next from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabRefreshContext } from '@/utils/TabRefreshContext';

interface User {
    image: string;
    name: string;
    role: string;
    group: string;
    theme: string;
    language: string;
}

export default function SettingsScreen() {
    const { refreshTabs } = useContext(TabRefreshContext);
    const [user, setUser] = useState<User>({
        image: '',
        name: '',
        role: '',
        group: 'dataengineering',
        theme: 'dark',
        language: i18next.language,
    });

    useEffect(() => {
        console.log(user);
        changeLanguage(user.language);
    }, [user]);

    const changeLanguage = async (newLocale: string) => {
        i18next.changeLanguage(newLocale);
        await AsyncStorage.setItem('userLanguage', newLocale);
    }

    const apply = () => {
        console.log('Apply pressed');
        refreshTabs();
    }

    const PROFILE_PICTURE = require('@/assets/images/react-logo.png');

    return (
        <GestureHandlerRootView>
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
                <View style={styles.container}>
                    <ThemedView style={styles.titleContainer}>
                        <ThemedText type="title">{i18next.t("settings")}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.inputContainer}>
                        <ThemedText>{i18next.t("profilePicture")}</ThemedText>
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
                        <ThemedText>{i18next.t("username")}</ThemedText>
                            <TextInput 
                                style={{ height: 40, borderColor: 'gray', borderWidth: 1, color: 'white' }}
                                placeholder={i18next.t("username")}
                                placeholderTextColor={'gray'}
                                value={user.name}
                                onChange={(e) => setUser({ ...user, name: e.nativeEvent.text })}
                            />
                    </ThemedView>
                    <ThemedView style={styles.inputContainer}>
                        <ThemedText>{i18next.t("group")}</ThemedText>
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
                        <ThemedText>{i18next.t("role")}</ThemedText>
                            <TextInput
                                style={{ height: 40, borderColor: 'gray', borderWidth: 1, color: 'white' }}
                                placeholder={i18next.t("role")}
                                placeholderTextColor={'gray'}
                                value={user.role}
                                onChange={(e) => setUser({ ...user, role: e.nativeEvent.text })}
                            />
                    </ThemedView>
                    <ThemedView style={styles.inputContainer}>
                        <ThemedText>{i18next.t("theme")}</ThemedText>
                            <Picker
                                style={{ width: '100%', color: 'white' }}
                                onValueChange={(itemValue: string) => setUser({ ...user, theme: itemValue })}
                                selectedValue={user.theme}
                            >
                                <Picker.Item label={i18next.t("dark")} value="dark" />
                                <Picker.Item label={i18next.t("light")} value="light" />
                            </Picker>
                    </ThemedView>
                    <ThemedView style={styles.inputContainer}>
                        <ThemedText>{i18next.t("language")}</ThemedText>
                            <Picker
                                style={{ width: '100%', color: 'white' }}
                                onValueChange={(itemValue: string) => setUser({ ...user, language: itemValue })}
                                selectedValue={user.language}
                            >
                                <Picker.Item label={i18next.t("english")} value="en" />
                                <Picker.Item label={i18next.t("norwegian")} value="no" />
                            </Picker>
                    </ThemedView>
                    <ThemedView style={styles.inputContainer}>
                        <Button title={i18next.t("cancel")} color="#cc0000" onPress={() => console.log('Cancel pressed')} />
                        <Button title={i18next.t("apply")} color="#00bb00" onPress={apply} />
                    </ThemedView>
                </View>
            </ParallaxScrollView>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: tabBarHeight
    },
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