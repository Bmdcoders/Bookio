import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { format, addDays } from 'date-fns';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';

export default function PublicBookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();

  // Core Data State
  const [studio, setStudio] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Flow State
  const [selectedDateIdx, setSelectedDateIdx] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [fullName, setFullName] = useState(user?.user_metadata?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [whatsapp, setWhatsapp] = useState('');

  // 1. Generate Next 7 Days seamlessly
  const dates = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(new Date(), i));
  }, []);

  // 2. Fetch Live Studio Data
  useEffect(() => {
    async function fetchStudio() {
      if (!id) return;
      setIsLoading(true);

      // If ID is demo (from static marketplace), we load the first real studio or fail gracefully
      let queryId = id;
      if (queryId === 'demo') {
        const { data: firstStudio } = await supabase.from('studios').select('id').limit(1).single();
        if (firstStudio) queryId = firstStudio.id;
      }

      const { data, error } = await supabase
        .from('studios')
        .select('*')
        .eq('id', queryId)
        .single();
        
      if (data) {
        setStudio(data);
      } else {
        Alert.alert('Studio Not Found', 'This studio is no longer available.');
        router.back();
      }
      setIsLoading(false);
    }
    fetchStudio();
  }, [id]);

  // 3. Fetch Real-time Inventory Slots triggered by Swiping Dates
  useEffect(() => {
    async function fetchInventory() {
      if (!studio) return;
      setSelectedSlot(null); // Reset selected slot on date change
      
      const targetDate = format(dates[selectedDateIdx], 'yyyy-MM-dd');
      const { data } = await supabase
        .from('inventory')
        .select('*')
        .eq('studio_id', studio.id)
        .eq('date', targetDate)
        .order('start_time', { ascending: true });
        
      if (data) {
        setSlots(data);
      } else {
        setSlots([]);
      }
    }
    fetchInventory();
  }, [studio, selectedDateIdx]);

  // 4. Secure Checkout Action
  const handlePayment = async () => {
    if (!user) {
      Alert.alert(
        'Sign In Required',
        'You must verify your account to secure this inventory slot.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Sign In', onPress: () => router.push('/(auth)/login') }
        ]
      );
      return;
    }

    if (!fullName || !phone || !selectedSlot) {
      Alert.alert('Missing Details', 'Please fill in your name and phone number.');
      return;
    }

    setIsProcessing(true);

    try {
      // Logic: 50% Advance calculation, 5% platform fee
      const advance = selectedSlot.current_price / 2;
      const platformFee = selectedSlot.current_price * 0.05;

      const { error: bookingError } = await supabase.from('bookings').insert({
        studio_id: studio.id,
        creator_id: user.id,
        inventory_id: selectedSlot.id,
        total_amount: selectedSlot.current_price,
        advance_paid: advance,
        platform_fee: platformFee,
        payment_status: 'advance_paid',
        booking_status: 'confirmed'
      });

      if (bookingError) throw bookingError;

      // Lock the inventory
      const { error: invError } = await supabase
        .from('inventory')
        .update({ status: 'booked' })
        .eq('id', selectedSlot.id);

      if (invError) throw invError;
      
      router.replace('/book/success');

    } catch (e: any) {
      Alert.alert('Transaction Failed', e.message || 'Unable to secure booking.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !studio) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Handle default string arrays gracefully
  const facilities = Array.isArray(studio.facilities) ? studio.facilities : [];
  const heroImage = Array.isArray(studio.photos) && studio.photos.length > 0 
    ? studio.photos[0] 
    : 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2670&auto=format&fit=crop';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar style="light" />
      <View style={styles.webWrapper}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Hero Banner */}
          <ImageBackground
            source={{ uri: heroImage }}
            style={styles.heroBanner}
            imageStyle={{ borderRadius: BorderRadius.lg }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(10, 10, 15, 0.9)']}
              style={styles.heroOverlay}
            >
              <View style={styles.heroContent}>
                <Text style={styles.studioName} numberOfLines={2}>{studio.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color={Colors.textSecondary} />
                  <Text style={styles.locationText}>{studio.location}</Text>
                </View>
              </View>
            </LinearGradient>
          </ImageBackground>

          {/* Facilities */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.facilitiesScroll}>
            {facilities.length > 0 ? (
               facilities.map((fac: string, i: number) => (
                 <View key={i} style={styles.facilityPill}>
                   <Text style={styles.facilityText}>{fac}</Text>
                 </View>
               ))
            ) : (
                <View style={styles.facilityPill}>
                   <Text style={styles.facilityText}>Standard Studio</Text>
                 </View>
            )}
          </ScrollView>

          {/* Date Picker Component */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Processing Date</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.datesScroll}>
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

          {/* Intelligent Slots Grid (Heatmap Flash Deals) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Live Inventory Slots</Text>
            {slots.length === 0 ? (
               <Text style={{color: Colors.textTertiary}}>No inventory scheduled for this date.</Text>
            ) : (
              <View style={styles.slotsGrid}>
                {slots.map((slot) => {
                  const isSelected = selectedSlot?.id === slot.id;
                  const isAvailable = slot.status === 'available';
                  const isFlash = slot.is_flash_deal;

                  return (
                    <TouchableOpacity
                      key={slot.id}
                      disabled={!isAvailable}
                      onPress={() => setSelectedSlot(slot)}
                      style={[
                        styles.slotCard,
                        !isAvailable && styles.slotCardDisabled,
                        isSelected && styles.slotCardActive,
                        isFlash && !isSelected && isAvailable && styles.slotCardNeon,
                      ]}
                    >
                      <Text style={[
                        styles.slotTime,
                        !isAvailable && styles.slotTextDisabled,
                        isSelected && styles.slotTextActive,
                      ]}>
                        {slot.time_slot}
                      </Text>
                      
                      <View style={styles.priceRow}>
                        {isFlash && isAvailable && (
                           <Text style={[styles.slotOldPrice]}>₹{slot.base_price}</Text>
                        )}
                        <Text style={[
                          styles.slotPrice,
                          !isAvailable && styles.slotTextDisabled,
                          isSelected && styles.slotTextActive,
                          isFlash && isAvailable && !isSelected && styles.slotTextNeon,
                        ]}>
                          ₹{slot.current_price}
                        </Text>
                        {isFlash && isAvailable && !isSelected && (
                          <Ionicons name="flash" size={14} color="#00ffcc" style={{ ml: 4, textShadowColor: '#00ffcc', textShadowRadius: 8 }} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Fast Checkout Form */}
          {selectedSlot && (
            <View style={styles.checkoutSection}>
              <Text style={styles.checkoutTitle}>Secure Slot</Text>
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
                
                {/* 50% Advance Summary */}
                <View style={styles.summaryBox}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Amount</Text>
                    <Text style={styles.summaryValue}>₹{selectedSlot.current_price}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabelFocus}>50% Advance via UPI</Text>
                    <Text style={styles.summaryValueFocus}>₹{selectedSlot.current_price / 2}</Text>
                  </View>
                </View>
              </Card>
            </View>
          )}

        </ScrollView>

        {/* Action Engine */}
        {selectedSlot && (
          <View style={styles.stickyFooter}>
            <Button
              title={isProcessing ? "Authenticating..." : `Pay ₹${selectedSlot.current_price / 2} via UPI`}
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
  container: { flex: 1, backgroundColor: Colors.background },
  webWrapper: { flex: 1, width: '100%', maxWidth: 600, alignSelf: 'center', backgroundColor: Colors.background },
  scrollContent: { padding: Spacing.lg, paddingBottom: 150 },
  
  heroBanner: { width: '100%', height: 220, marginBottom: Spacing.md, borderRadius: BorderRadius.lg, overflow: 'hidden' },
  heroOverlay: { flex: 1, justifyContent: 'flex-end', padding: Spacing.lg },
  heroContent: { gap: 4 },
  studioName: { color: Colors.textPrimary, fontSize: Typography.size['2xl'], fontWeight: Typography.weight.extraBold },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: Colors.textSecondary, fontSize: Typography.size.sm },

  facilitiesScroll: { gap: Spacing.sm, marginBottom: Spacing.xl },
  facilityPill: { backgroundColor: Colors.surface, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full, borderWidth: 1, borderColor: Colors.surfaceBorder, marginRight: Spacing.sm },
  facilityText: { color: Colors.textSecondary, fontSize: Typography.size.xs, fontWeight: Typography.weight.medium },

  section: { marginBottom: Spacing.xl },
  sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },

  datesScroll: { gap: Spacing.sm, paddingRight: Spacing.lg },
  dateCard: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: BorderRadius.md, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, alignItems: 'center', marginRight: Spacing.sm },
  dateCardActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  dateDay: { fontSize: Typography.size.xs, color: Colors.textTertiary, marginBottom: 4, textTransform: 'uppercase' },
  dateNumber: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary },
  dateTextActive: { color: Colors.primary },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  slotCard: { width: '30%', flexGrow: 1, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.surfaceBorder, borderRadius: BorderRadius.sm, paddingVertical: Spacing.md, alignItems: 'center', gap: 4 },
  slotCardActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  slotCardDisabled: { opacity: 0.3, backgroundColor: Colors.background },
  slotCardNeon: { borderColor: '#00ffcc', backgroundColor: 'rgba(0, 255, 204, 0.05)', shadowColor: '#00ffcc', shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
  
  slotTime: { fontSize: Typography.size.sm, color: Colors.textSecondary, fontWeight: Typography.weight.medium },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  slotOldPrice: { fontSize: Typography.size.xs, color: Colors.textTertiary, textDecorationLine: 'line-through' },
  slotPrice: { fontSize: Typography.size.base, color: Colors.textPrimary, fontWeight: Typography.weight.bold },
  slotTextActive: { color: Colors.white },
  slotTextDisabled: { textDecorationLine: 'line-through', color: Colors.textTertiary },
  slotTextNeon: { color: '#00ffcc' },

  checkoutSection: { marginTop: Spacing.md },
  checkoutTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: Colors.textPrimary, marginBottom: Spacing.md },
  summaryBox: { backgroundColor: Colors.background, padding: Spacing.md, borderRadius: BorderRadius.sm, gap: Spacing.sm, marginTop: Spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: Colors.textTertiary, fontSize: Typography.size.sm },
  summaryValue: { color: Colors.textSecondary, fontSize: Typography.size.sm, fontWeight: Typography.weight.semiBold },
  summaryLabelFocus: { color: Colors.textPrimary, fontSize: Typography.size.base, fontWeight: Typography.weight.semiBold },
  summaryValueFocus: { color: Colors.accent, fontSize: Typography.size.lg, fontWeight: Typography.weight.bold },

  stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: Spacing.lg, paddingBottom: Platform.OS === 'ios' ? 34 : Spacing.lg, backgroundColor: Colors.surfaceElevated, borderTopWidth: 1, borderTopColor: Colors.glassBorder },
});
