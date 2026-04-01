import React from 'react';
import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/theme';

export default function SuperAdminLayout() {
  const { profile, isLoading } = useAuth();

  // Show nothing or a loading state while we establish Auth
  if (isLoading) return null;

  // STRICT ROUTE GUARD: Blackhole access if not explicitly 'super_admin'
  if (!profile || profile.role !== 'super_admin') {
    console.warn("[SECURITY] Blocked non-superadmin from accessing Phase 6 God-Mode.");
    // Fall back to the default router behavior (which handles Creator/Studio rules in _layout)
    return <Redirect href="/(auth)/login" />;
  }

  // The SuperAdmin Tab Architecture
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.surfaceBorder,
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'God-Mode',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="pie-chart" size={size} color={color} />
          ),
        }}
      />
      
      {/* Optional: Future dedicated screens for pure ledger/users */}
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          href: null, // Hides this from the tab bar but keeps the route active
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
