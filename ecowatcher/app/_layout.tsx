import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import analytics from '@react-native-firebase/analytics';
import { useEffect } from 'react';

export default function RootLayout() {
  useEffect(() => {
    analytics().logEvent('app_opened');
  }, []);

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
} 