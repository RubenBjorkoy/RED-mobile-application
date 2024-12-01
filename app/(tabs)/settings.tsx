import { StyleSheet, Image, Text, TouchableOpacity, Button, View, SafeAreaView, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import React, { useState, useEffect, useContext } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { GestureHandlerRootView, TextInput } from 'react-native-gesture-handler';
import { tabBarHeight, topBarPadding } from '@/constants/Measures';
import i18next from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabRefreshContext } from '@/utils/TabRefreshContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { User } from '@/utils/types';
import { IconSymbol } from '@/components/ui/IconSymbol';
import apiUrl from '@/utils/apiUrls';
import { Alert } from 'react-native';

export default function SettingsScreen({ navigation }: any) {
    const { refreshTabs } = useContext(TabRefreshContext);
    const [user, setUser] = useState<User>({
        id: '',
        username: '',
        password: '',
        role: '',
        group: 'dataengineering',
        language: i18next.language,
    });
    const [staticUser, setStaticUser] = useState<User>({
        id: '',
        username: '',
        password: '',
        role: '',
        group: 'dataengineering',
        language: i18next.language,
    });
    const [hidePassword, setHidePassword] = useState<boolean>(true);

    useEffect(() => {
        (async () => {
            try {
                const userToken = await AsyncStorage.getItem('userToken');
                if (!userToken) {
                    navigation.replace('login');
                } else {
                    const response = await fetch(`${apiUrl}/users/${userToken}`);
                    const data = await response.json();
                    setUser({
                        id: userToken,
                        username: data.username,
                        password: data.password,
                        role: data.role,
                        group: data.group,
                        language: i18next.language,
                    });
                    setStaticUser({
                        id: userToken,
                        username: data.username,
                        password: data.password,
                        role: data.role,
                        group: data.group,
                        language: i18next.language,
                    });
                }
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    useEffect(() => {
        changeLanguage(user.language);
    }, [user]);

    const changeLanguage = async (newLocale: string) => {
        i18next.changeLanguage(newLocale);
        await AsyncStorage.setItem('userLanguage', newLocale);
    };

    const cancel = () => {
        setUser(staticUser);
    };

    const apply = async () => {
        try {
            //Check if the username is already taken
            const allUsers = await fetch(`${apiUrl}/users`);
            const allUsersJson = await allUsers.json();
            if (allUsersJson.some((u: any) => u.username === user.username && u.id !== user.id)) {
                Alert.alert('Error', 'Username is already taken.');
                return;
            }
            await fetch(`${apiUrl}/users/${user.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });
            refreshTabs();
        } catch (error) {
            console.error(error);
        }
    };

    const handleLogout = async () => {
        await AsyncStorage.removeItem('userToken');
        navigation.replace('login');
    };

    return (
        <SafeAreaView>
            <ScrollView 
                contentContainerStyle={styles.contentContainer}
                style={styles.container}>
                <GestureHandlerRootView>
                    <View style={styles.container}>
                        <View style={styles.titleContainer}>
                            <ThemedText type="title">{i18next.t("settings")}</ThemedText>
                        </View>
                        <View style={styles.inputContainer}>
                            <ThemedText>{i18next.t("username")}</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder={i18next.t("username")}
                                placeholderTextColor={'gray'}
                                value={user.username}
                                onChange={(e) => setUser({ ...user, username: e.nativeEvent.text })}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <ThemedText>{i18next.t("password")}</ThemedText>
                            <View>
                                <TextInput
                                    secureTextEntry={hidePassword}
                                    style={styles.input}
                                    placeholder={i18next.t("password")}
                                    placeholderTextColor={'gray'}
                                    value={user.password}
                                    onChange={(e) => setUser({ ...user, password: e.nativeEvent.text })}
                                />
                                <TouchableOpacity onPress={() => {setHidePassword(!hidePassword)}} style={styles.showPasswordIcon}>
                                    <ThemedText><IconSymbol name={hidePassword ? 'eye.slash.fill' : 'eye.fill'} color="white" size={20} /> </ThemedText>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <ThemedText>{i18next.t("group")}</ThemedText>
                            <View style={styles.picker}>
                                <Picker
                                    style={styles.picker}
                                    onValueChange={(itemValue: string) => setUser({ ...user, group: itemValue })}
                                    selectedValue={user.group}
                                    dropdownIconColor={'white'}
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
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <ThemedText>{i18next.t("role")}</ThemedText>
                            <TextInput
                                style={styles.input}
                                placeholder={i18next.t("role")}
                                placeholderTextColor={'gray'}
                                value={user.role}
                                onChange={(e) => setUser({ ...user, role: e.nativeEvent.text })}
                            />
                        </View>
                        <View style={styles.inputContainer}>
                            <ThemedText>{i18next.t("language")}</ThemedText>
                            <View style={styles.picker}>
                                <Picker
                                    style={styles.picker}
                                    onValueChange={(itemValue: string) => setUser({ ...user, language: itemValue })}
                                    selectedValue={user.language}
                                    dropdownIconColor={'white'}
                                >
                                    <Picker.Item label={i18next.t("english")} value="en" />
                                    <Picker.Item label={i18next.t("norwegian")} value="no" />
                                </Picker>
                            </View>
                        </View>
                        <View style={styles.inputContainer}>
                            <Button title={i18next.t("cancel")} color="#cc0000" onPress={cancel} />
                            <Button title={i18next.t("apply")} color="#00bb00" onPress={apply} />
                        </View>
                        <View style={styles.logoutContainer}>
                            <Button title={i18next.t("signout")} color="#ff0000" onPress={handleLogout} />
                        </View>
                    </View>
                </GestureHandlerRootView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: tabBarHeight,
        paddingTop: topBarPadding,
    },
    contentContainer: {
        flexGrow: 1,
        paddingBottom: tabBarHeight * 2,
    },
    titleContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    inputContainer: {
        gap: 8,
        color: 'white',
    },
    input: {
        height: 60,
        borderColor: 'gray',
        borderWidth: 1,
        color: 'white',
        paddingHorizontal: 16,
        backgroundColor: '#333',
        fontSize: 16,
    },
    picker: {
        gap: 8,
        height: Platform.OS === 'ios' ? 210 : 60, //The picker on IOS is a wheel, so it just overflows beneath the other elements. This way should fix that
        color: 'white',
        width: '100%',
        borderColor: 'gray',
        backgroundColor: '#333',
        borderWidth: 1,
        fontSize: 16,
    },
    headerImage: {
        color: '#808080',
        bottom: -90,
        left: -35,
        position: 'absolute',
    },
    logoutContainer: {
        marginTop: 100,
    },
    showPasswordIcon: {
        position: 'absolute',
        right: 16,
        top: 20,
    },
});
