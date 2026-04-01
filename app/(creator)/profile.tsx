import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function CreatorProfileScreen() {
  const { profile, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  const menuItems = [
    { icon: 'person-outline', label: 'Edit Profile', chevron: true },
    { icon: 'card-outline', label: 'Payment Methods', chevron: true },
    { icon: 'heart-outline', label: 'Favorites', chevron: true },
    { icon: 'notifications-outline', label: 'Notifications', chevron: true },
    { icon: 'help-circle-outline', label: 'Help & Support', chevron: true },
    { icon: 'document-text-outline', label: 'Terms of Service', chevron: true },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.title}>Profile</Text>

        {/* Profile Card */}
        <Card variant="glass" padding="lg" style={styles.profileCard}>
          <View style={styles.profileRow}>
            <LinearGradient
              colors={[Colors.primary, Colors.accent]}
              style={styles.avatar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.avatarText}>
                {(profile?.name || 'U').charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {profile?.name || 'User'}
              </Text>
              <Text style={styles.profileEmail}>
                {profile?.email || 'No email'}
              </Text>
              <View style={styles.roleTag}>
                <Ionicons name="mic-outline" size={12} color={Colors.primary} />
                <Text style={styles.roleText}>Creator</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Menu Items */}
        <Card variant="glass" padding="none" style={styles.menuCard}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity key={item.label} style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <Ionicons
                  name={item.icon as any}
                  size={20}
                  color={Colors.textSecondary}
                />
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              {item.chevron && (
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={Colors.textTertiary}
                />
              )}
              {idx < menuItems.length - 1 && (
                <View style={styles.menuDivider} />
              )}
            </TouchableOpacity>
          ))}
        </Card>

        {/* Sign Out */}
        <Button
          title="Sign Out"
          variant="danger"
          onPress={handleSignOut}
          icon={<Ionicons name="log-out-outline" size={20} color={Colors.error} />}
          style={styles.signOutBtn}
        />

        <Text style={styles.version}>Bookio v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xl,
    letterSpacing: -0.5,
  },

  // Profile Card
  profileCard: {
    marginBottom: Spacing.xl,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.white,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: Colors.textPrimary,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
  },
  profileEmail: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
    marginTop: 2,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryMuted,
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  roleText: {
    color: Colors.primary,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },

  // Menu
  menuCard: {
    marginBottom: Spacing.xl,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.base,
  },
  menuDivider: {
    position: 'absolute',
    bottom: 0,
    left: Spacing['3xl'] + Spacing.md,
    right: 0,
    height: 0.5,
    backgroundColor: Colors.glassBorder,
  },

  // Sign out
  signOutBtn: {
    marginBottom: Spacing.xl,
  },

  // Version
  version: {
    textAlign: 'center',
    color: Colors.textTertiary,
    fontSize: Typography.size.xs,
  },
});
