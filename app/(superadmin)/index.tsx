import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

// ─── Phase 6 Mathematical Engine ────────────────────────
const PLATFORM_FEE_PERCENTAGE = 0.05;

// Mock Macro Data
const GLOBAL_METRICS = {
  activeStudios: 142,
  bookingsToday: 89,
  gmvThisMonth: 1250000, 
};

// Calculated Net Revenue for Bookio
const platformRevenue = GLOBAL_METRICS.gmvThisMonth * PLATFORM_FEE_PERCENTAGE;

// Mock Studio Approval Queue
const INITIAL_PENDING_STUDIOS = [
  { id: 's-101', name: 'Rhythm Space', owner: 'Rahul K.', location: 'Andheri West' },
  { id: 's-102', name: 'Lens Hub', owner: 'Priya S.', location: 'Indiranagar' },
];

// Mock Ledger for Payouts
// Logic: Creator paid 50% advance online. The platform keeps 5% of GMV as fee.
// Bookio owes the Studio = (Advance Collected) - (5% Platform Fee of Total GMV).
const LEDGER = [
  {
    bookingId: 'BKN-8001',
    studioName: 'Neon Horizon',
    totalGmv: 10000,
    advanceCollected: 5000,
    status: 'unpaid', // 'unpaid' | 'paid'
  },
  {
    bookingId: 'BKN-8002',
    studioName: 'Vibe Records',
    totalGmv: 4000,
    advanceCollected: 2000,
    status: 'paid',
  },
  {
    bookingId: 'BKN-8003',
    studioName: 'Frame Studio',
    totalGmv: 12000,
    advanceCollected: 6000,
    status: 'unpaid',
  },
];

export default function SuperAdminDashboard() {
  const [pendingStudios, setPendingStudios] = useState(INITIAL_PENDING_STUDIOS);
  const [ledger, setLedger] = useState(LEDGER);

  const handleVerify = (id: string, name: string) => {
    console.log(`[Phase 6] Verified Studio: ${name}. It is now live in Phase 5 Marketplace.`);
    setPendingStudios((prev) => prev.filter((s) => s.id !== id));
  };

  const handleReject = (id: string, name: string) => {
    console.log(`[Phase 6] Rejected Studio: ${name}.`);
    setPendingStudios((prev) => prev.filter((s) => s.id !== id));
  };

  const markAsPaid = (id: string) => {
    setLedger((prev) =>
      prev.map((entry) =>
        entry.bookingId === id ? { ...entry, status: 'paid' } : entry
      )
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      
      {/* Top Navigation */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bookio Operations</Text>
          <Text style={styles.headerTitle}>God-Mode</Text>
        </View>
        <View style={styles.shieldIcon}>
          <Ionicons name="shield-checkmark" size={24} color={Colors.warning} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 1. Global Metrics Ribbon */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Global Metrics Overview</Text>
          
          <View style={styles.metricGrid}>
            <Card variant="glass" padding="md" style={styles.metricCard}>
              <Ionicons name="business" size={20} color={Colors.primary} />
              <Text style={styles.metricValue}>{GLOBAL_METRICS.activeStudios}</Text>
              <Text style={styles.metricLabel}>Live Studios</Text>
            </Card>
            
            <Card variant="glass" padding="md" style={styles.metricCard}>
              <Ionicons name="calendar" size={20} color={Colors.accent} />
              <Text style={styles.metricValue}>{GLOBAL_METRICS.bookingsToday}</Text>
              <Text style={styles.metricLabel}>Bookings Today</Text>
            </Card>
          </View>

          <View style={styles.financeGrid}>
            <Card variant="glass" padding="lg" style={styles.financeCard}>
              <Text style={styles.financeLabel}>Total Traded (GMV)</Text>
              <Text style={styles.financeValueGmv}>₹{(GLOBAL_METRICS.gmvThisMonth / 100000).toFixed(1)}L</Text>
              <Text style={styles.financeSub}>Monthly Volume</Text>
            </Card>
            <Card variant="elevated" padding="lg" style={StyleSheet.flatten([styles.financeCard, { backgroundColor: Colors.primaryMuted }])}>
              <Text style={[styles.financeLabel, { color: Colors.primary }]}>Bookio Revenue (5%)</Text>
              <Text style={[styles.financeValueRev, { color: Colors.primary }]}>
                ₹{(platformRevenue / 1000).toFixed(1)}k
              </Text>
              <Text style={styles.financeSub}>Collected Fees</Text>
            </Card>
          </View>
        </View>

        {/* 2. Studio Approval Queue */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verification Queue ({pendingStudios.length})</Text>
          {pendingStudios.length === 0 ? (
            <View style={styles.emptyBox}>
              <Ionicons name="checkmark-done" size={24} color={Colors.success} />
              <Text style={styles.emptyText}>All studios verified.</Text>
            </View>
          ) : (
            pendingStudios.map((studio) => (
              <Card key={studio.id} variant="glass" padding="md" style={styles.queueCard}>
                <View style={styles.queueInfo}>
                  <Text style={styles.queueName}>{studio.name}</Text>
                  <Text style={styles.queueMeta}>By {studio.owner} • {studio.location}</Text>
                </View>
                <View style={styles.queueActions}>
                  <TouchableOpacity 
                    style={[styles.miniBtn, { borderColor: Colors.error }]}
                    onPress={() => handleReject(studio.id, studio.name)}
                  >
                    <Ionicons name="close" size={18} color={Colors.error} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.miniBtn, { borderColor: Colors.success, backgroundColor: Colors.success }]}
                    onPress={() => handleVerify(studio.id, studio.name)}
                  >
                    <Ionicons name="checkmark" size={18} color={Colors.background} />
                  </TouchableOpacity>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* 3. Payout Ledger */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payout Ledger</Text>
          <Text style={styles.ledgerFormulaHelper}>Owed = Advance (50%) - Platform Fee (5%)</Text>

          {ledger.map((entry) => {
            const platformFee = entry.totalGmv * PLATFORM_FEE_PERCENTAGE;
            const payoutOwed = entry.advanceCollected - platformFee;
            const isPaid = entry.status === 'paid';

            return (
              <Card key={entry.bookingId} variant="glass" padding="md" style={styles.ledgerCard}>
                <View style={styles.ledgerHeader}>
                  <Text style={styles.ledgerId}>#{entry.bookingId} • {entry.studioName}</Text>
                  <View style={[styles.statusTag, isPaid && styles.statusTagPaid]}>
                    <Text style={[styles.statusTagText, isPaid && { color: Colors.success }]}>
                      {isPaid ? 'CLEARED' : 'PENDING'}
                    </Text>
                  </View>
                </View>

                <View style={styles.ledgerMath}>
                  <View style={styles.mathCol}>
                    <Text style={styles.mathDigit}>₹{entry.totalGmv}</Text>
                    <Text style={styles.mathLabel}>GMV</Text>
                  </View>
                  <Text style={styles.mathSymbol}>-</Text>
                  <View style={styles.mathCol}>
                    <Text style={styles.mathDigit}>₹{platformFee}</Text>
                    <Text style={styles.mathLabel}>5% Fee</Text>
                  </View>
                  <Text style={styles.mathSymbol}>=</Text>
                  <View style={styles.mathColFinal}>
                    <Text style={[styles.mathDigit, { color: Colors.warning, fontSize: Typography.size.lg }]}>
                      ₹{payoutOwed}
                    </Text>
                    <Text style={styles.mathLabel}>Payout Due</Text>
                  </View>
                </View>

                {!isPaid && (
                  <Button
                    title={`Mark ₹${payoutOwed} as Paid`}
                    variant="primary"
                    onPress={() => markAsPaid(entry.bookingId)}
                    style={{ marginTop: Spacing.md }}
                  />
                )}
              </Card>
            );
          })}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.white,
  },
  shieldIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing['4xl'],
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  
  // Metrics Grid
  metricGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  metricCard: {
    flex: 1,
    gap: Spacing.sm,
  },
  metricValue: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.white,
  },
  metricLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textSecondary,
  },
  financeGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  financeCard: {
    flex: 1,
    justifyContent: 'center',
  },
  financeLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  financeValueGmv: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.white,
  },
  financeValueRev: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
  },
  financeSub: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 4,
  },

  // Queue
  queueCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  queueInfo: {
    flex: 1,
  },
  queueName: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semiBold,
    color: Colors.textPrimary,
  },
  queueMeta: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  queueActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  miniBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },

  // Ledger
  ledgerFormulaHelper: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
    marginTop: -8,
  },
  ledgerCard: {
    marginBottom: Spacing.md,
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  ledgerId: {
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    color: Colors.textSecondary,
  },
  statusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
  },
  statusTagPaid: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    color: Colors.warning,
  },
  ledgerMath: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  mathCol: {
    alignItems: 'center',
  },
  mathColFinal: {
    alignItems: 'flex-end',
  },
  mathDigit: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  mathLabel: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
    textTransform: 'uppercase',
  },
  mathSymbol: {
    fontSize: Typography.size.lg,
    color: Colors.textTertiary,
    fontWeight: Typography.weight.bold,
    marginBottom: 12,
  },
});
