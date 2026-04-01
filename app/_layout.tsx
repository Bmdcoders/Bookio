import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { session, profile, isLoading, isProfileLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  // Show loading spinner while determining auth state
  if (isLoading || (session && isProfileLoading && !profile)) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  const isAuthenticated = !!session;
  const isCreator = profile?.role === 'creator';
  const isStudioOwner = profile?.role === 'studio_owner';
  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Auth screens — shown when NOT logged in */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>

        {/* Creator screens — shown when logged in as Creator */}
        <Stack.Protected guard={isAuthenticated && (isCreator || (!isStudioOwner && !isSuperAdmin))}>
          <Stack.Screen name="(creator)" />
        </Stack.Protected>

        {/* Studio Owner screens — shown when logged in as StudioOwner */}
        <Stack.Protected guard={isAuthenticated && isStudioOwner}>
          <Stack.Screen name="(studio)" />
        </Stack.Protected>

        {/* SuperAdmin screens — God Mode */}
        <Stack.Protected guard={isAuthenticated && isSuperAdmin}>
          <Stack.Screen name="(superadmin)" />
        </Stack.Protected>

        {/* Public Web Widget Routes (Unguarded) */}
        <Stack.Screen name="book/[id]" />
        <Stack.Screen name="book/success" />
      </Stack>
      <StatusBar style="light" />
    </>
  );
}

import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
