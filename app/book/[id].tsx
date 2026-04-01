import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

// Mock Data
const MOCK_STUDIO = {
  name: 'Neon Horizon Podcast Studio',
  location: 'Koramangala, Bangalore',
  basePrice: 800,
  image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop',
  facilities: ['Wi-Fi', 'AC', 'Microphones', 'Lighting'],
};

const MOCK_SLOTS = [
  { id: '1', time: '09:00-10:00', price: 900, status: 'available', is_flash_deal: false },
  { id: '2', time: '10:00-11:00', price: 850, status: 'available', is_flash_deal: false },
  { id: '3', time: '11:00-12:00', price: 800, status: 'booked', is_flash_deal: false },
  { id: '4', time: '12:00-13:00', price: 600, status: 'available', is_flash_deal: true }, // 25% discounted via pg_cron
  { id: '5', time: '14:00-15:00', price: 800, status: 'available', is_flash_deal: false },
  { id: '6', time: '15:00-16:00', price: 800, status: 'blocked', is_flash_deal: false },
];

export default function PublicBookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // State
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<typeof MOCK_SLOTS[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Generate Next 7 Days
  const dates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));
  }, []);

  const handlePayment = () => {
    if (!fullName || !phone || !selectedSlot) {
      Alert.alert('Missing Details', 'Please fill in your name and phone number.');
      return;
    }

    setIsProcessing(true);
    // Simulate API call for Payment + Database Insertion
    setTimeout(() => {
      setIsProcessing(false);
      router.replace('/book/success');
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      
      {/* Web responsive wrapper */}
      <View style={styles.webWrapper}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Hero Banner */}
          <ImageBackground
            source={{ uri: MOCK_STUDIO.image }}
            style={styles.heroBanner}
            imageStyle={{ borderRadius: BorderRadius.lg }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(10, 10, 15, 0.9)']}
              style={styles.heroOverlay}
            >
              <View style={styles.heroContent}>
                <Text style={styles.studioName} numberOfLines={2}>{MOCK_STUDIO.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color={Colors.textSecondary} />
                  <Text style={styles.locationText}>{MOCK_STUDIO.location}</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* Facilities */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.facilitiesScroll}
          >
            {MOCK_STUDIO.facilities.map((fac, i) => (
              <View key={i} style={styles.facilityPill}>
                <Text style={styles.facilityText}>{fac}</Text>
              </View>
            ))}
          </ScrollView>

          {/* Date Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Date</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.datesScroll}
            >
              {dates.map((date, idx) => {
                const isActive = selectedDateIdx === idx;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.dateCard, isActive && styles.dateCardActive]}
                    onPress={() => setSelectedDateIdx(idx)}
                  >
                    <Text style={[styles.dateDay, isActive && styles.dateTextActive]}>
                      {format(date, 'EEE')}
                    </Text>
                    <Text style={[styles.dateNumber, isActive && styles.dateTextActive]}>
                      {format(date, 'd')}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Availability Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Slots</Text>
            <View style={styles.slotsGrid}>
              {MOCK_SLOTS.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id;
                const isAvailable = slot.status === 'available';
                const isDiscounted = slot.price < MOCK_STUDIO.basePrice;

                return (
                  <TouchableOpacity
                    key={slot.id}
                    disabled={!isAvailable}
                    onPress={() => setSelectedSlot(slot)}
                    style={[
                      styles.slotCard,
                      !isAvailable && styles.slotCardDisabled,
                      isSelected && styles.slotCardActive,
                    ]}
                  >
                    <Text style={[
                      styles.slotTime,
                      !isAvailable && styles.slotTextDisabled,
                      isSelected && styles.slotTextActive,
                    ]}>
                      {slot.time}
                    </Text>
                    
                    <View style={styles.priceRow}>
                      <Text style={[
                        styles.slotPrice,
                        isDiscounted && { color: Colors.success },
                        !isAvailable && styles.slotTextDisabled,
                        isSelected && styles.slotTextActive,
                      ]}>
                        ₹{slot.price}
                      </Text>
                      {isDiscounted && isAvailable && !isSelected && (
                        <Ionicons name="flash" size={14} color={Colors.success} style={{ marginLeft: 4 }} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Checkout Form */}
          {selectedSlot && (
            <View style={styles.checkoutSection}>
              <Text style={styles.checkoutTitle}>Confirm Details</Text>
              <Card variant="glass" padding="lg">
                <Input 
                  label="Full Name" 
                  placeholder="Enter your name" 
                  value={fullName}
                  onChangeText={setFullName}
                />
                <Input 
                  label="Phone Number" 
                  placeholder="e.g. 9876543210" 
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
                <View style={styles.whatsappToggle}>
                  <Text style={styles.whatsappLabel}>Same as WhatsApp?</Text>
                  <TouchableOpacity onPress={() => setWhatsapp(phone)}>
                    <Ionicons name={whatsapp === phone && phone !== '' ? "checkbox" : "square-outline"} size={24} color={Colors.primary} />
                  </TouchableOpacity>
                </View>

                {/* Pricing Summary */}
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Amount</Text>
                    <Text style={styles.summaryValue}>₹{selectedSlot.price}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabelFocus}>50% Advance to Confirm</Text>
                    <Text style={styles.summaryValueFocus}>₹{selectedSlot.price / 2}</Text>
                  </View>
                </View>
              </Card>
            </View>
          )}

        </ScrollView>

        {/* Sticky Payment Footer */}
        {selectedSlot && (
          <View style={styles.stickyFooter}>
            <Button
              title={isProcessing ? "Processing..." : `Pay ₹${selectedSlot.price / 2} via UPI`}
              variant="primary"
              size="lg"
              onPress={handlePayment}
              disabled={isProcessing}
              icon={!isProcessing ? <Ionicons name="shield-checkmark" size={20} color={Colors.white} /> : undefined}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  webWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: 600, // Make it look like a mobile app even on desktop screens
    alignSelf: 'center',
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120, // Extra space for sticky footer
  },
  
  // Hero
  heroBanner: {
    width: '100%',
    height: 220,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  heroOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  heroContent: {
    gap: 4,
  },
  studioName: {
    color: Colors.textPrimary,
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.extraBold,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },

  // Facilities
  facilitiesScroll: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  facilityPill: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginRight: Spacing.sm,
  },
  facilityText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },

  // Generic Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  // Dates
  datesScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  dateCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  dateCardActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  dateDay: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  dateNumber: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  dateTextActive: {
    color: Colors.primary,
  },

  // Slots
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  slotCard: {
    width: '30%',
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  slotCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  slotCardDisabled: {
    opacity: 0.5,
    backgroundColor: Colors.background,
  },
  slotTime: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weight.medium,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotPrice: {
    fontSize: Typography.size.base,
    color: Colors.textPrimary,
    fontWeight: Typography.weight.bold,
  },
  slotTextActive: {
    color: Colors.white,
  },
  slotTextDisabled: {
    textDecorationLine: 'line-through',
    color: Colors.textTertiary,
  },

  // Checkout
  checkoutSection: {
    marginTop: Spacing.md,
  },
  checkoutTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },
  whatsappToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  whatsappLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  summaryBox: {
    backgroundColor: Colors.background,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
  },
  summaryValue: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.semiBold,
  },
  summaryLabelFocus: {
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semiBold,
  },
  summaryValueFocus: {
    color: Colors.accent,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
  },

  // Sticky Footer
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg,
    backgroundColor: Colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
});
