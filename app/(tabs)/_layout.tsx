// import { Tabs } from 'expo-router';
import React, { useState, createContext, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { TabRefreshContext } from '@/utils/TabRefreshContext';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MapScreen from './map';
import FilteredScreen from './filtered';
import HomeScreen from '.';
import UnfilteredScreen from './unfiltered';
import SettingsScreen from './settings';
import { tabBarHeight } from '@/constants/Measures';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [tabKey, setTabKey] = useState(0);
  const { navigate } = useNavigation<any>();

  const refreshTabs = () => {
    setTabKey((prev) => prev + 1);
  }

  useEffect(() => {
    const fetchUserToken = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        navigate('login');
      }
    }
    fetchUserToken();
  }, []);

  return (
    <TabRefreshContext.Provider value={{ refreshTabs }}>
      <Tab.Navigator
        key={tabKey}
        initialRouteName='index'
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].text,
          tabBarIndicatorStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].tint,
          },
          tabBarStyle: {
            backgroundColor: Colors[colorScheme ?? 'light'].background,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: tabBarHeight,
            elevation: Platform.OS === 'android' ? 5 : 0,
          },
          tabBarShowLabel: false,
          swipeEnabled: true,
        }}
      >
        <Tab.Screen
          name="map"
          options={{
            tabBarShowLabel: false,
            title: 'Map',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
          }}
          component={MapScreen}
        />
        <Tab.Screen
          name="filtered"
          options={{
            title: 'Your Errors',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="slider.horizontal.3" color={color} />,
          }}
          component={FilteredScreen}
        />
        <Tab.Screen
          name="index"
          options={{
            title: 'Camera',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
          }}
          component={HomeScreen}
        />
        <Tab.Screen
          name="unfiltered"
          options={{
            title: 'All Errors',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="line.horizontal.3" color={color} />,
          }}
          component={UnfilteredScreen}
        />
        <Tab.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear.circle.fill" color={color} />,
          }}
          component={SettingsScreen}
        />
      </Tab.Navigator>
    </TabRefreshContext.Provider>
  );
}
