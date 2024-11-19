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
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const loadLanguagePreference = async () => {
      const savedLocale = await AsyncStorage.getItem('userLanguage');
      const intialLocale: string = savedLocale || Localization.getLocales()[0].languageCode || "n"; //Defaults to English if savedLocale is null and for some reason the device locale is not available
      setLocale(intialLocale);
      i18next.changeLanguage(intialLocale);
    }

    loadLanguagePreference();

    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  const changeLanguage = async (newLocale: string) => {
    setLocale(newLocale);
    i18next.changeLanguage(newLocale);
    await AsyncStorage.setItem('userLanguage', newLocale);
  }

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
