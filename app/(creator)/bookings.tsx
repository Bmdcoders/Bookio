import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';

// Mock Bookings Data
const MOCK_BOOKINGS = [
  {
    id: 'BKN-5985',
    status: 'upcoming', // 'upcoming' | 'past'
    date: '31 Oct, 2024',
    time: '09:00 - 10:00 (1hr)',
    studio_id: 'demo',
    studio_name: 'Neon Horizon Podcast Studio',
    location: 'Koramangala, Bangalore',
    advance_paid: 450,
  },
  {
    id: 'BKN-1022',
    status: 'past',
    date: '15 Oct, 2024',
    time: '14:00 - 18:00 (4hrs)',
    studio_id: 'vibe-records',
    studio_name: 'Vibe Records',
    location: 'Bandra, Mumbai',
    advance_paid: 2400,
  },
  {
    id: 'BKN-0899',
    status: 'past',
    date: '02 Sep, 2024',
    time: '10:00 - 12:00 (2hrs)',
    studio_id: 'frame-studio',
    studio_name: 'Frame Studio',
    location: 'Hauz Khas, Delhi',
    advance_paid: 600,
  },
];

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const filteredBookings = MOCK_BOOKINGS.filter((b) => b.status === activeTab);

  const handleDirections = (location: string) => {
    Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(location)}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Sessions</Text>
      </View>

      {/* Segmented Control */}
      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'upcoming' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.segmentText, activeTab === 'upcoming' && styles.segmentTextActive]}>
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'past' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('past')}
        >
          <Text style={[styles.segmentText, activeTab === 'past' && styles.segmentTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bookings List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filteredBookings.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={48} color={Colors.surfaceBorder} />
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming' 
                ? 'Your next creative session will appear here.'
                : 'You have not completed any sessions yet.'}
            </Text>
            {activeTab === 'upcoming' && (
              <Button 
                title="Find a Studio" 
                variant="primary" 
                onPress={() => router.push('/(creator)/marketplace')}
                style={{ marginTop: Spacing.xl }}
              />
            )}
          </View>
        ) : (
          filteredBookings.map((booking) => (
            <Card key={booking.id} variant="glass" padding="lg" style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <View style={styles.badgeRow}>
                  <Ionicons 
                    name={activeTab === 'upcoming' ? 'time' : 'checkmark-circle'} 
                    size={16} 
                    color={activeTab === 'upcoming' ? Colors.warning : Colors.success} 
                  />
                  <Text style={[
                     styles.statusBadgeText,
                     { color: activeTab === 'upcoming' ? Colors.warning : Colors.success }
                  ]}>
                    {activeTab === 'upcoming' ? 'CONFIRMED' : 'COMPLETED'}
                  </Text>
                </View>
                <Text style={styles.bookingId}>{booking.id}</Text>
              </View>

              <Text style={styles.studioName}>{booking.studio_name}</Text>
              
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>{booking.date} • {booking.time}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Ionicons name="cash-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.detailText}>Paid ₹{booking.advance_paid} Advance</Text>
              </View>

              <View style={styles.actionsBox}>
                {activeTab === 'upcoming' ? (
                  <>
                    <Button 
                      title="Get Directions" 
                      variant="primary" 
                      icon={<Ionicons name="navigate" size={16} color={Colors.background} />}
                      onPress={() => handleDirections(booking.location)}
                      flex={1}
                    />
                    <Button 
                      title="Reschedule" 
                      variant="secondary"
                      flex={1}
                    />
                  </>
                ) : (
                  <>
                    <Button 
                      title="Re-book" 
                      variant="primary" 
                      icon={<Ionicons name="refresh" size={16} color={Colors.background} />}
                      onPress={() => router.push(`/book/${booking.studio_id}`)}
                      flex={1}
                    />
                    <Button 
                      title="Leave Review" 
                      variant="secondary"
                      flex={1}
                    />
                  </>
                )}
              </View>
            </Card>
          ))
        )}
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: Typography.size['2xl'],
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
  },
  
  // Segmented Control
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    padding: 4,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentBtnActive: {
    backgroundColor: Colors.surfaceElevated,
  },
  segmentText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  segmentTextActive: {
    color: Colors.textPrimary,
    fontWeight: Typography.weight.bold,
  },

  // List
  scrollContent: {
    padding: Spacing.lg,
    paddingTop: 0,
    paddingBottom: Spacing['4xl'],
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    opacity: 0.6,
  },
  emptyTitle: {
    color: Colors.textSecondary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.semiBold,
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
    marginTop: Spacing.xs,
    textAlign: 'center',
    maxWidth: '80%',
  },

  // Booking Card
  bookingCard: {
    marginBottom: Spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surfaceBorder,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
  },
  bookingId: {
    fontSize: Typography.size.sm,
    color: Colors.textTertiary,
  },
  studioName: {
    color: Colors.textPrimary,
    fontSize: Typography.size.lg,
    fontWeight: Typography.weight.bold,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  detailText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
  },
  actionsBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
});
