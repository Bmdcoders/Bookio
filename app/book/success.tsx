import React from 'react';
import { View, Text, StyleSheet, Platform, Linking, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 

import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import Button from '@/components/ui/Button';

export default function BookingSuccessScreen() {
  const router = useRouter();

  const handleWhatsApp = () => {
    // In production, this would use the studio's actual phone number
    Linking.openURL('https://wa.me/1234567890?text=Hi, I just booked a slot at your studio!');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.success} />
        </View>
        
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your studio slot has been successfully reserved. We've sent a confirmation to your phone.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Next Steps</Text>
          <Text style={styles.cardText}>
            1. Keep your booking ID handy: #BKN-{Math.floor(1000 + Math.random() * 9000)}{'\n'}
            2. Reach out to the studio for any specific technical requirements.{'\n'}
            3. Arrive 10 minutes early!
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.whatsappBtn} onPress={handleWhatsApp}>
          <MaterialCommunityIcons name="whatsapp" size={24} color={Colors.white} />
          <Text style={styles.whatsappBtnText}>Message Studio on WhatsApp</Text>
        </TouchableOpacity>
        
        <Button 
          title="Book Another Slot" 
          variant="secondary" 
          onPress={() => router.replace('/book/demo')} 
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
    maxWidth: 600,
    width: '100%',
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.successMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.size.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing['2xl'],
    lineHeight: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    width: '100%',
  },
  cardTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  cardText: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    width: '100%',
    maxWidth: 600,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.xl,
    gap: Spacing.md,
  },
  whatsappBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#25D366', // Official WhatsApp color
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  whatsappBtnText: {
    color: Colors.white,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
});
