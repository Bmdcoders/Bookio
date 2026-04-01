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

import { useAuth } from '@/contexts/AuthContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

type AuthMode = 'email' | 'phone';
type PhoneStep = 'enter' | 'verify';

export default function LoginScreen() {
  const { signInWithEmail, signInWithPhone, verifyOtp } = useAuth();

  const [mode, setMode] = useState<AuthMode>('email');
  const [phoneStep, setPhoneStep] = useState<PhoneStep>('enter');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Email fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone fields
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleEmailLogin = async () => {
    setAuthError(null);
    if (!email.trim() || !password.trim()) {
      setAuthError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    const { error } = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (error) {
      setAuthError(error);
    }
  };

  const handleSendOtp = async () => {
    if (!phone.trim()) {
      Alert.alert('Missing phone', 'Please enter your phone number.');
      return;
    }
    setLoading(true);
    const { error } = await signInWithPhone(phone.trim());
    setLoading(false);
    if (error) {
      Alert.alert('OTP Failed', error);
    } else {
      setPhoneStep('verify');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Missing OTP', 'Please enter the verification code.');
      return;
    }
    setLoading(true);
    const { error } = await verifyOtp(phone.trim(), otp.trim());
    setLoading(false);
    if (error) {
      Alert.alert('Verification Failed', error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Background gradient orbs */}
      <View style={styles.orbContainer}>
        <LinearGradient
          colors={[Colors.primary, Colors.transparent]}
          style={[styles.orb, styles.orbTopRight]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <LinearGradient
          colors={[Colors.accent, Colors.transparent]}
          style={[styles.orb, styles.orbBottomLeft]}
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
          {/* Logo / Brand */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[Colors.primary, Colors.accent]}
                style={styles.logoGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="musical-notes" size={32} color={Colors.white} />
              </LinearGradient>
            </View>
            <Text style={styles.brandName}>Bookio</Text>
            <Text style={styles.tagline}>
              Book Creative Studios Instantly
            </Text>
          </View>

          {/* Auth Card */}
          <Card variant="glass" padding="lg" style={styles.authCard}>
            {/* Mode Toggle */}
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  mode === 'email' && styles.modeTabActive,
                ]}
                onPress={() => {
                  setMode('email');
                  setPhoneStep('enter');
                }}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={mode === 'email' ? Colors.primary : Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.modeTabText,
                    mode === 'email' && styles.modeTabTextActive,
                  ]}
                >
                  Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeTab,
                  mode === 'phone' && styles.modeTabActive,
                ]}
                onPress={() => setMode('phone')}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color={mode === 'phone' ? Colors.primary : Colors.textTertiary}
                />
                <Text
                  style={[
                    styles.modeTabText,
                    mode === 'phone' && styles.modeTabTextActive,
                  ]}
                >
                  Phone
                </Text>
              </TouchableOpacity>
            </View>

            {/* Email Login */}
            {mode === 'email' && (
              <View style={styles.form}>
                {authError && (
                  <Text style={styles.errorText}>{authError}</Text>
                )}
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
                  placeholder="Enter your password"
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
                <Button
                  title="Sign In"
                  onPress={handleEmailLogin}
                  loading={loading}
                  style={styles.submitBtn}
                />
              </View>
            )}

            {/* Phone OTP Login */}
            {mode === 'phone' && phoneStep === 'enter' && (
              <View style={styles.form}>
                <Input
                  label="Phone Number"
                  placeholder="+91 XXXXX XXXXX"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  hint="Include country code (e.g., +91)"
                  icon={
                    <Ionicons
                      name="call-outline"
                      size={20}
                      color={Colors.textTertiary}
                    />
                  }
                />
                <Button
                  title="Send OTP"
                  onPress={handleSendOtp}
                  loading={loading}
                  style={styles.submitBtn}
                />
              </View>
            )}

            {mode === 'phone' && phoneStep === 'verify' && (
              <View style={styles.form}>
                <Text style={styles.otpSentText}>
                  OTP sent to {phone}
                </Text>
                <Input
                  label="Verification Code"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  icon={
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={20}
                      color={Colors.textTertiary}
                    />
                  }
                />
                <Button
                  title="Verify & Sign In"
                  onPress={handleVerifyOtp}
                  loading={loading}
                  style={styles.submitBtn}
                />
                <TouchableOpacity
                  onPress={() => setPhoneStep('enter')}
                  style={styles.backLink}
                >
                  <Text style={styles.backLinkText}>
                    ← Change phone number
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>

          {/* Sign Up Link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Create one</Text>
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
    justifyContent: 'center',
    padding: Spacing.xl,
    paddingTop: Spacing['5xl'],
  },

  // Background orbs
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.12,
  },
  orbTopRight: {
    top: -80,
    right: -80,
  },
  orbBottomLeft: {
    bottom: -80,
    left: -80,
  },

  // Header / Brand
  header: {
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  logoContainer: {
    marginBottom: Spacing.base,
  },
  logoGradient: {
    width: 68,
    height: 68,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: Typography.size.base,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    letterSpacing: 0.2,
  },

  // Auth Card
  authCard: {
    marginBottom: Spacing.xl,
  },

  // Mode Toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm - 2,
    gap: Spacing.sm,
  },
  modeTabActive: {
    backgroundColor: Colors.primaryMuted,
  },
  modeTabText: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  modeTabTextActive: {
    color: Colors.primary,
  },

  // Form
  form: {
    gap: Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.sm,
  },
  otpSentText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    textAlign: 'center',
    marginBottom: Spacing.base,
  },
  backLink: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  backLinkText: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: Typography.size.sm,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    fontWeight: Typography.weight.semiBold,
  },

  // Sign Up Row
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
  },
  signupLink: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semiBold,
  },
});
