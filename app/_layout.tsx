import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useState } from 'react';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-reanimated';
import * as Localization from 'expo-localization'
import i18next from '@/utils/localizations';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [locale, setLocale] = useState(Localization.getLocales()[0].languageCode);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded] = useFonts({
    SpaceGrotesk: require('@/assets/fonts/Space_Grotesk/static/SpaceGrotesk-Regular.ttf'),
  });

  useEffect(() => {
    const loadAppState = async () => {
      const userToken = await AsyncStorage.getItem('userToken');
      setIsLoggedIn(!!userToken);

      const savedLocale = await AsyncStorage.getItem('userLanguage');
      const initialLocale = savedLocale || Localization.getLocales()[0].languageCode || "en";
      setLocale(initialLocale);
      i18next.changeLanguage(initialLocale);

      if (loaded) {
        SplashScreen.hideAsync();
      }
    };
    if(loaded) {
      loadAppState();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <Stack>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" options={{ headerShown: false }}  />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
