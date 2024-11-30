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
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import i18next from 'i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useNavigation } from '@react-navigation/native';
import apiUrl from '@/utils/apiUrls';

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

  return (
    <SafeAreaView style={{flex: 1}}>
      <ScrollView contentContainerStyle={styles.contentContainer} style={styles.container}>
        <GestureHandlerRootView>
          <View style={styles.container}>
            <Text style={styles.title}>{i18next.t('register')}</Text>

            <View style={styles.inputContainer}>
              <Text>{i18next.t('username')}</Text>
              <TextInput
                style={styles.input}
                placeholder={i18next.t('username')}
                placeholderTextColor={'gray'}
                value={user.username}
                onChangeText={(text) => setUser({ ...user, username: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text>{i18next.t('password')}</Text>
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
              <Text>{i18next.t('group')}</Text>
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
              <Text>{i18next.t('role')}</Text>
              <TextInput
                style={styles.input}
                placeholder={i18next.t('role')}
                placeholderTextColor={'gray'}
                value={user.role}
                onChangeText={(text) => setUser({ ...user, role: text })}
              />
            </View>

            <View style={styles.inputContainer}>
              <Button title={i18next.t('cancel')} color="#cc0000" onPress={cancel} />
              <Button title={i18next.t('register')} color="#00bb00" onPress={handleRegister} />
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
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    color: 'white',
    backgroundColor: '#333',
  },
  picker: {
    height: 50,
    color: 'white',
    backgroundColor: '#333',
  },
  showPasswordIcon: {
    position: 'absolute',
    right: 16,
    top: 14,
  },
});
