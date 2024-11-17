// import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import MapScreen from './map';
import FilteredScreen from './filtered';
import HomeScreen from '.';
import UnfilteredScreen from './unfiltered';
import SettingsScreen from './settings';
import { tabBarHeight } from '@/constants/measures';

const Tab = createMaterialTopTabNavigator();

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
      tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].text,
      tabBarIndicatorStyle: {
        backgroundColor: Colors[colorScheme ?? 'light'].tint,
      },
      tabBarStyle: {
        backgroundColor: Colors[colorScheme ?? 'light'].background,
        position: 'absolute', // Make the tab bar float
        bottom: 0,            // Position it at the bottom
        left: 0,
        right: 0,
        height: tabBarHeight,
        elevation: Platform.OS === 'android' ? 5 : 0, // Add shadow on Android
      },
      tabBarShowLabel: false, // Hide labels
      swipeEnabled: true, // Enable swipe gestures
    }}
  >
    <Tab.Screen
      name="map"
      options={{
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
  );
}
