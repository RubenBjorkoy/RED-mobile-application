import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import i18next from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNavigation } from '@react-navigation/native';
import apiUrl from '@/utils/apiUrls';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function RegisterScreen() {
  const [user, setUser] = useState({
    username: '',
    password: '',
    role: '',
    group: 'dataengineering',
  });
  const [hidePassword, setHidePassword] = useState<boolean>(true);
  const navigation = useNavigation<any>();

  const handleRegister = async () => {
    if (!user.username || !user.password || !user.role) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    const allUsers = await fetch(`${apiUrl}/users`);
    const allUsersJson = await allUsers.json();
    if (allUsersJson.some((u: any) => u.username === user.username)) {
      Alert.alert('Error', 'Username already exists.');
      return;
    }

    try {
      const newUser = { ...user };
      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      const data = await response.json();
      const id = data.id;

      await AsyncStorage.setItem('userToken', id);
      navigation.replace('(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Something went wrong during registration.');
      console.error(error);
    }
  };

  const cancel = () => {
    navigation.goBack();
  };

  const IMAGE_URL = require('@/assets/images/revolve-logo.png');

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
        <GestureHandlerRootView>
          <View style={styles.container}>
            <Image source={IMAGE_URL} style={styles.image} />

            <View style={styles.inputContainer}>
              <ThemedText type='defaultSemiBold'>{i18next.t('username')}</ThemedText>
              <TextInput
                style={styles.input}
                placeholder={i18next.t('username')}
                placeholderTextColor={'gray'}
                value={user.username}
                onChangeText={(text) => setUser({ ...user, username: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type='defaultSemiBold'>{i18next.t('password')}</ThemedText>
              <View>
                <TextInput
                  secureTextEntry={hidePassword}
                  style={styles.input}
                  placeholder={i18next.t('password')}
                  placeholderTextColor={'gray'}
                  value={user.password}
                  onChangeText={(text) => setUser({ ...user, password: text })}
                />
                <TouchableOpacity
                  onPress={() => setHidePassword(!hidePassword)}
                  style={styles.showPasswordIcon}
                >
                  <IconSymbol name={hidePassword ? 'eye.slash.fill' : 'eye.fill'} color="white" size={20} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <ThemedText type='defaultSemiBold'>{i18next.t('group')}</ThemedText>
              <Picker
                style={styles.picker}
                selectedValue={user.group}
                onValueChange={(itemValue) => setUser({ ...user, group: itemValue })}
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

            <View style={styles.inputContainer}>
              <ThemedText type='defaultSemiBold'>{i18next.t('role')}</ThemedText>
              <TextInput
                style={styles.input}
                placeholder={i18next.t('role')}
                placeholderTextColor={'gray'}
                value={user.role}
                onChangeText={(text) => setUser({ ...user, role: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <TouchableOpacity onPress={handleRegister} style={styles.approveButton}>
                <Text style={styles.buttonText}>{i18next.t('signup')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cancel} style={styles.cancelButton}>
                <Text style={styles.buttonText}>{i18next.t('cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </GestureHandlerRootView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    height: 60,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: 'white',
    backgroundColor: '#333',
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 60,
    color: 'white',
    backgroundColor: '#333',
    padding: 0,
  },
  showPasswordIcon: {
    position: 'absolute',
    right: 16,
    top: 20,
  },
  image: {
    width: 150,
    height: 150,
    alignSelf: 'center',
  },
  approveButton: {
    backgroundColor: '#FFCF26',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
    marginBottom: 20,
    width: '100%',
    minWidth: 100,
  },
  cancelButton: {
    backgroundColor: '#ff2020',
    padding: 10,
    borderRadius: 4,
    marginTop: 10,
    width: '100%',
    minWidth: 100,
  },
  buttonText: {
    color: 'black',
    textAlign: 'center',
  },
});
