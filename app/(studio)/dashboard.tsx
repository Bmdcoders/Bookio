import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import Card from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

const QUICK_STATS = [
  {
    label: 'Revenue',
    value: '₹0',
    icon: 'trending-up',
    color: Colors.success,
    bgColor: Colors.successMuted,
  },
  {
    label: 'Bookings',
    value: '0',
    icon: 'calendar',
    color: Colors.primary,
    bgColor: Colors.primaryMuted,
  },
  {
    label: 'Occupancy',
    value: '0%',
    icon: 'pie-chart',
    color: Colors.accent,
    bgColor: Colors.accentMuted,
  },
  {
    label: 'Reviews',
    value: '0',
    icon: 'star',
    color: Colors.warning,
    bgColor: Colors.warningMuted,
  },
];

export default function DashboardScreen() {
  const { profile } = useAuth();
  const router = useRouter();

  const handleCopyLink = async () => {
    const url = `https://bookio.app/studio/${profile?.id || 'demo'}`;
    await Clipboard.setStringAsync(url);
    Alert.alert('Link Copied!', 'Your booking link has been copied to clipboard.');
  };

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
            <Text style={styles.greeting}>
              Welcome back 🎙️
            </Text>
            <Text style={styles.headerName}>
              {profile?.name || 'Studio Owner'}
            </Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(studio)/manage-studio')}>
            <LinearGradient
              colors={[Colors.accent, Colors.primary]}
              style={styles.addBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={24} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Revenue Overview Banner */}
        <TouchableOpacity>
          <LinearGradient
            colors={[Colors.surfaceElevated, Colors.surface]}
            style={styles.revenueBanner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.revenueTop}>
              <Text style={styles.revenueLabel}>Total Earnings</Text>
              <View style={styles.periodTag}>
                <Text style={styles.periodText}>This Month</Text>
              </View>
            </View>
            <Text style={styles.revenueAmount}>₹0.00</Text>
            
            <View style={styles.payoutRow}>
              <View style={styles.payoutItem}>
                <Text style={styles.payoutLabel}>Pending Payout</Text>
                <Text style={styles.payoutValue}>₹0.00</Text>
              </View>
              <View style={styles.payoutDivider} />
              <View style={styles.payoutItem}>
                <Text style={styles.payoutLabel}>Next Payout</Text>
                <Text style={styles.payoutValue}>-</Text>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Stats Grid */}
        <View style={styles.statsGrid}>
          {QUICK_STATS.map((stat) => (
            <Card
              key={stat.label}
              variant="glass"
              padding="md"
              style={styles.statCard}
            >
              <View
                style={[
                  styles.statIcon,
                  { backgroundColor: stat.bgColor },
                ]}
              >
                <Ionicons
                  name={stat.icon as any}
                  size={18}
                  color={stat.color}
                />
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Link-in-Bio Section */}
        <Card variant="glass" padding="lg" style={styles.linkCard}>
          <View style={styles.linkHeader}>
            <View style={styles.linkIconBg}>
              <Ionicons name="link" size={20} color={Colors.accent} />
            </View>
            <View style={styles.linkInfo}>
              <Text style={styles.linkTitle}>
                Your Booking Link
              </Text>
              <Text style={styles.linkSubtitle}>
                Share on Instagram, Twitter, or anywhere
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.linkUrl} onPress={handleCopyLink}>
            <Text style={styles.linkUrlText} numberOfLines={1}>
              bookio.app/studio/{profile?.id ? profile.id.slice(0, 8) : 'demo'}
            </Text>
            <Ionicons
              name="copy-outline"
              size={18}
              color={Colors.accent}
            />
          </TouchableOpacity>
        </Card>

        {/* Upcoming Bookings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Bookings</Text>
          <Card variant="glass" padding="lg">
            <View style={styles.emptyActivity}>
              <Ionicons
                name="calendar-clear-outline"
                size={36}
                color={Colors.textTertiary}
              />
              <Text style={styles.emptyText}>
                No upcoming bookings yet. Share your link to get started!
              </Text>
            </View>
          </Card>
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
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing['4xl'],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  headerName: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: Spacing.xs,
  },
  addBtn: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  addBtnGradient: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Revenue Banner
  revenueBanner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    marginBottom: Spacing.xl,
  },
  revenueTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  revenueLabel: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.weight.medium,
  },
  periodTag: {
    backgroundColor: Colors.accentMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  periodText: {
    color: Colors.accent,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  revenueAmount: {
    fontSize: Typography.size['3xl'],
    fontWeight: Typography.weight.extraBold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  payoutRow: {
    flexDirection: 'row',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
  },
  payoutItem: {
    flex: 1,
  },
  payoutDivider: {
    width: 1,
    backgroundColor: Colors.glassBorder,
    marginHorizontal: Spacing.md,
  },
  payoutLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  payoutValue: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
    color: Colors.textSecondary,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: '47%',
    flexGrow: 1,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: Spacing.xs,
    fontWeight: Typography.weight.medium,
  },

  // Link-in-Bio
  linkCard: {
    marginBottom: Spacing.xl,
  },
  linkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.base,
  },
  linkIconBg: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semiBold,
    color: Colors.textPrimary,
  },
  linkSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  linkUrl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  linkUrlText: {
    flex: 1,
    color: Colors.accent,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
    marginRight: Spacing.sm,
  },

  // Section
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
    color: Colors.textPrimary,
    marginBottom: Spacing.base,
  },
  emptyActivity: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  emptyText: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
    textAlign: 'center',
  },
});
