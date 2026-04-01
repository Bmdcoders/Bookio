import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth, UserRole } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

export default function SignupScreen() {
  const { signUpWithEmail } = useAuth();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('creator');

  const handleSignup = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error } = await signUpWithEmail(
      email.trim(),
      password,
      name.trim(),
      role
    );
    setLoading(false);

    if (error) {
      Alert.alert('Signup Failed', error);
    } else {
      Alert.alert(
        'Account Created!',
        'Check your email for a confirmation link, then sign in.',
        [{ text: 'OK', onPress: () => router.push('/(auth)/login') }]
      );
    }
  };

  const roles: { key: UserRole; label: string; icon: string; desc: string }[] =
    [
      {
        key: 'creator',
        label: 'Creator',
        icon: 'mic-outline',
        desc: 'Book studio time',
      },
      {
        key: 'studio_owner',
        label: 'Studio Owner',
        icon: 'business-outline',
        desc: 'List your studio',
      },
    ];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background gradient orbs */}
      <View style={styles.orbContainer}>
        <LinearGradient
          colors={[Colors.accent, Colors.transparent]}
          style={[styles.orb, styles.orbTopLeft]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={[Colors.primary, Colors.transparent]}
          style={[styles.orb, styles.orbBottomRight]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              style={styles.backButton}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join Bookio and start creating
            </Text>
          </View>

          {/* Role Selection */}
          <View style={styles.roleSection}>
            <Text style={styles.roleLabel}>I am a...</Text>
            <View style={styles.roleGrid}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  style={[
                    styles.roleCard,
                    role === r.key && styles.roleCardActive,
                  ]}
                  onPress={() => setRole(r.key)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      role === r.key
                        ? [Colors.primaryMuted, Colors.glass]
                        : [Colors.glass, Colors.glass]
                    }
                    style={styles.roleCardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <Ionicons
                      name={r.icon as any}
                      size={28}
                      color={
                        role === r.key
                          ? Colors.primary
                          : Colors.textTertiary
                      }
                    />
                    <Text
                      style={[
                        styles.roleTitle,
                        role === r.key && styles.roleTitleActive,
                      ]}
                    >
                      {r.label}
                    </Text>
                    <Text style={styles.roleDesc}>{r.desc}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Signup Form */}
          <Card variant="glass" padding="lg" style={styles.formCard}>
            <Input
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              icon={
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors.textTertiary}
                />
              }
            />
            <Input
              label="Email"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              icon={
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={Colors.textTertiary}
                />
              }
            />
            <Input
              label="Password"
              placeholder="Min. 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={Colors.textTertiary}
                />
              }
            />
            <Input
              label="Confirm Password"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon={
                <Ionicons
                  name="shield-checkmark-outline"
                  size={20}
                  color={Colors.textTertiary}
                />
              }
            />
            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.submitBtn}
            />
          </Card>

          {/* Login Link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.xl,
    paddingTop: Spacing['4xl'],
  },

  // Background
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    opacity: 0.1,
  },
  orbTopLeft: {
    top: -60,
    left: -60,
  },
  orbBottomRight: {
    bottom: -60,
    right: -60,
  },

  // Header
  header: {
    marginBottom: Spacing.xl,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },

  // Role Selection
  roleSection: {
    marginBottom: Spacing.xl,
  },
  roleLabel: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    letterSpacing: 0.3,
  },
  roleGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  roleCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
  },
  roleCardActive: {
    borderColor: Colors.primary,
  },
  roleCardGradient: {
    padding: Spacing.base,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  roleTitle: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semiBold,
    color: Colors.textSecondary,
  },
  roleTitleActive: {
    color: Colors.primary,
  },
  roleDesc: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
  },

  // Form
  formCard: {
    marginBottom: Spacing.xl,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },

  // Login Link
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: Spacing['2xl'],
  },
  loginText: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
  },
  loginLink: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semiBold,
  },
});
