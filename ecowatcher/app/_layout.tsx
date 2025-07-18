import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Analytics from 'expo-firebase-analytics';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    Analytics.logEvent('app_opened');
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
} 