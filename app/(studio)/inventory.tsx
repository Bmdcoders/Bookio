import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetBackdrop, BottomSheetTextInput } from '@gorhom/bottom-sheet';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIME_SLOTS = [
  '09:00-10:00',
  '10:00-11:00',
  '11:00-12:00',
  '12:00-13:00',
  '14:00-15:00',
  '15:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
];

export default function InventoryScreen() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['45%'], []);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotPrice, setSlotPrice] = useState('800');

  const handleSlotPress = (slot: string, currentState: string) => {
    // Only open editor for available or blocked slots
    if (currentState === 'booked') return;
    
    setSelectedSlot(slot);
    // Reset or set pricing logic here
    bottomSheetRef.current?.expand();
  };

  const handleManualPriceUpdate = () => {
    // Phase 4: Setting a manual price should trigger:
    // UPDATE inventory SET current_price = slotPrice, is_price_locked = true WHERE id = slot.id
    console.log(`[Phase 4] Manual Override: Setting ${selectedSlot} to ₹${slotPrice} (Locks price from Happy Hour algorithm)`);
    bottomSheetRef.current?.close();
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.6}
      />
    ),
    []
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Inventory</Text>
            <Text style={styles.subtitle}>Manage your time slots</Text>
          </View>
          <TouchableOpacity style={styles.addSlotBtn}>
            <Ionicons name="add-circle" size={20} color={Colors.accent} />
            <Text style={styles.addSlotText}>Add Slots</Text>
          </TouchableOpacity>
        </View>

        {/* Week Selector */}
        <View style={styles.weekSelector}>
          <TouchableOpacity>
            <Ionicons
              name="chevron-back"
              size={22}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
          <Text style={styles.weekLabel}>This Week</Text>
          <TouchableOpacity>
            <Ionicons
              name="chevron-forward"
              size={22}
              color={Colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Day Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayTabs}
        >
          {DAYS.map((day, idx) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayTab, idx === 0 && styles.dayTabActive]}
            >
              <Text
                style={[
                  styles.dayTabText,
                  idx === 0 && styles.dayTabTextActive,
                ]}
              >
                {day}
              </Text>
              <Text
                style={[
                  styles.dayTabDate,
                  idx === 0 && styles.dayTabDateActive,
                ]}
              >
                {idx + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Legend */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: Colors.success }]}
            />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: Colors.primary }]}
            />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: Colors.textTertiary }]}
            />
            <Text style={styles.legendText}>Blocked</Text>
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.slotsContainer}>
          {TIME_SLOTS.map((slot, idx) => {
            // Simulate different states for visual demo
            const states = ['available', 'available', 'booked', 'available', 'available', 'blocked', 'available', 'available'];
            const state = states[idx];
            const stateColor =
              state === 'booked'
                ? Colors.primary
                : state === 'blocked'
                  ? Colors.textTertiary
                  : Colors.success;
            const stateBg =
              state === 'booked'
                ? Colors.primaryMuted
                : state === 'blocked'
                  ? Colors.glass
                  : Colors.successMuted;

            return (
              <TouchableOpacity 
                key={slot} 
                activeOpacity={0.7}
                onPress={() => handleSlotPress(slot, state)}
              >
                <Card variant="outlined" padding="md" style={styles.slotCard}>
                  <View style={styles.slotRow}>
                    <View style={styles.slotTimeCol}>
                      <Ionicons
                        name="time-outline"
                        size={16}
                        color={stateColor}
                      />
                      <Text style={styles.slotTime}>{slot}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: stateBg }]}>
                      <View
                        style={[
                          styles.statusBadgeDot,
                          { backgroundColor: stateColor },
                        ]}
                      />
                      <Text
                        style={[styles.statusBadgeText, { color: stateColor }]}
                      >
                        {state.charAt(0).toUpperCase() + state.slice(1)}
                      </Text>
                    </View>
                    <Text style={styles.slotPrice}>₹800</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Bulk Actions */}
        <Card variant="glass" padding="lg" style={styles.bulkCard}>
          <Text style={styles.bulkTitle}>Quick Actions</Text>
          <View style={styles.bulkButtons}>
            <Button
              title="Block All"
              variant="ghost"
              size="sm"
              onPress={() => {}}
              fullWidth={false}
              icon={
                <Ionicons
                  name="close-circle-outline"
                  size={16}
                  color={Colors.textSecondary}
                />
              }
            />
            <Button
              title="Open All"
              variant="secondary"
              size="sm"
              onPress={() => {}}
              fullWidth={false}
              icon={
                <Ionicons
                  name="checkmark-circle-outline"
                  size={16}
                  color={Colors.primaryLight}
                />
              }
            />
          </View>
        </Card>
      </ScrollView>

      {/* Dynamic Pricing / Slot Manager Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1} // Closed by default
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBg}
        handleIndicatorStyle={styles.bottomSheetIndicator}
      >
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Manage Slot: {selectedSlot}</Text>
          <Text style={styles.sheetSubtitle}>
            Update the price based on demand, or mark as unavailable.
          </Text>

          <View style={styles.sheetForm}>
            <Text style={styles.inputLabel}>Custom Price (₹)</Text>
            <View style={styles.priceInputContainer}>
              <Ionicons name="pricetag-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <BottomSheetTextInput
                style={styles.priceInput}
                value={slotPrice}
                onChangeText={setSlotPrice}
                keyboardType="numeric"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.sheetActions}>
            <Button
              title="Block Slot"
              variant="danger"
              onPress={() => bottomSheetRef.current?.close()}
              icon={<Ionicons name="close-circle-outline" size={18} color={Colors.white} />}
            />
            <Button
              title="Update Price"
              variant="primary"
              onPress={handleManualPriceUpdate}
            />
          </View>
        </View>
      </BottomSheet>
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

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  addSlotText: {
    color: Colors.accent,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },

  // Week
  weekSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  weekLabel: {
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semiBold,
  },

  // Days
  dayTabs: {
    gap: Spacing.sm,
    paddingBottom: Spacing.base,
    marginBottom: Spacing.base,
  },
  dayTab: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.glass,
    minWidth: 50,
  },
  dayTabActive: {
    backgroundColor: Colors.primaryMuted,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dayTabText: {
    color: Colors.textTertiary,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  dayTabTextActive: {
    color: Colors.primary,
  },
  dayTabDate: {
    color: Colors.textSecondary,
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.bold,
    marginTop: Spacing.xs,
  },
  dayTabDateActive: {
    color: Colors.primary,
  },

  // Legend
  legend: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: Colors.textTertiary,
    fontSize: Typography.size.xs,
  },

  // Slots
  slotsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  slotCard: {
    borderColor: Colors.glassBorder,
  },
  slotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotTimeCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  slotTime: {
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.medium,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  slotPrice: {
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    minWidth: 60,
    textAlign: 'right',
  },

  // Bulk
  bulkCard: {},
  bulkTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.md,
  },
  bulkButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  // Bottom Sheet
  bottomSheetBg: {
    backgroundColor: Colors.surfaceElevated,
    borderRadius: BorderRadius.xl,
  },
  bottomSheetIndicator: {
    backgroundColor: Colors.textTertiary,
    width: 40,
  },
  sheetContent: {
    padding: Spacing.xl,
    flex: 1,
  },
  sheetTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  sheetSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  sheetForm: {
    marginBottom: Spacing['2xl'],
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginBottom: Spacing.sm,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  priceInput: {
    flex: 1,
    height: 48,
    color: Colors.textPrimary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semiBold,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: 'auto',
  },
});
