import 'react-native-gesture-handler';
import '@/global.css';

import {
  GoogleSans_400Regular,
  GoogleSans_500Medium,
  GoogleSans_600SemiBold,
  GoogleSans_700Bold,
  useFonts,
} from '@expo-google-fonts/google-sans';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import { Platform, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { DatabaseProvider } from '@/providers/database-provider';
import { buildTheme } from '@/theme/build-theme';

export const unstable_settings = {
  anchor: 'dashboard',
};

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';
  const palette = buildTheme(scheme);

  const [androidFontsLoaded] = useFonts(
    Platform.OS === 'android'
      ? {
          GoogleSans_400Regular,
          GoogleSans_500Medium,
          GoogleSans_600SemiBold,
          GoogleSans_700Bold,
        }
      : {},
  );
  const fontsLoaded = Platform.OS !== 'android' || androidFontsLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }
    document.documentElement.classList.toggle('dark', scheme === 'dark');
  }, [scheme]);

  const navigationTheme =
    scheme === 'dark'
      ? {
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            primary: palette.primary,
            background: palette.background,
            card: palette.card,
            text: palette.foreground,
            border: palette.border,
            notification: palette.destructive,
          },
        }
      : {
          ...DefaultTheme,
          colors: {
            ...DefaultTheme.colors,
            primary: palette.primary,
            background: palette.background,
            card: palette.card,
            text: palette.foreground,
            border: palette.border,
            notification: palette.destructive,
          },
        };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={navigationTheme}>
        <DatabaseProvider>
          <AnimatedSplashOverlay />
          <AppTabs />
        </DatabaseProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
