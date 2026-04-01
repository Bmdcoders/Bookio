import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Card from '@/components/ui/Card';
import { Colors, Typography, Spacing, BorderRadius } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';

// Categories
const CATEGORIES = [
  { id: 'all', name: 'All Studios', icon: 'grid' },
  { id: 'podcast', name: 'Podcast', icon: 'mic' },
  { id: 'music', name: 'Music', icon: 'musical-notes' },
  { id: 'photo', name: 'Photo', icon: 'camera' },
  { id: 'video', name: 'Video', icon: 'videocam' },
];

// Quick Filters
const QUICK_FILTERS = [
  'Flash Deals ⚡',
  'Available Today',
  'Has Mics',
  'Has Lighting',
  'Price: Low to High',
];

// Enhanced Mock Data mapped for Discovery & Booking
const FEATURED_STUDIOS = [
  {
    id: 'demo', // Hardcoded ID to map to Phase 3 Web Widget seamlessly
    name: 'Neon Horizon Podcast Studio',
    location: 'Koramangala, Bangalore',
    price: 800,
    rating: 4.8,
    type: 'Podcast',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=600',
    is_flash_deal: true,
    has_mics: true,
    has_lighting: false,
  },
  {
    id: 'vibe-records',
    name: 'Vibe Records',
    location: 'Bandra, Mumbai',
    price: 1200,
    rating: 4.9,
    type: 'Music',
    image: 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?q=80&w=600',
    is_flash_deal: false,
    has_mics: true,
    has_lighting: false,
  },
  {
    id: 'frame-studio',
    name: 'Frame Studio',
    location: 'Hauz Khas, Delhi',
    price: 600,
    rating: 4.7,
    type: 'Photo',
    image: 'https://images.unsplash.com/photo-1606822453621-e37bf4cb00cc?q=80&w=600',
    is_flash_deal: true,
    has_mics: false,
    has_lighting: true,
  },
];

export default function MarketplaceScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  
  // Filtering States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Active Discovery Algorithm (Frontend filtering simulation)
  const filteredStudios = useMemo(() => {
    return FEATURED_STUDIOS.filter((studio) => {
      // 1. Text Search matching
      const matchesSearch = 
        studio.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        studio.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Category matching
      const matchesCat = activeCategory === 'all' || studio.type.toLowerCase() === activeCategory;

      // 3. Quick Filter Logic
      let matchesFilter = true;
      if (activeFilter === 'Flash Deals ⚡') matchesFilter = studio.is_flash_deal;
      if (activeFilter === 'Has Mics') matchesFilter = studio.has_mics;
      if (activeFilter === 'Has Lighting') matchesFilter = studio.has_lighting;
      
      return matchesSearch && matchesCat && matchesFilter;
    }).sort((a, b) => {
      if (activeFilter === 'Price: Low to High') return a.price - b.price;
      return 0; // Default sorting
    });
  }, [searchQuery, activeCategory, activeFilter]);


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
            <Text style={styles.greeting}>Good evening 👋</Text>
            <Text style={styles.headerTitle}>{profile?.name || 'Creator'}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={Colors.textSecondary}
            />
            {/* Notification Badge */}
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* Global Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={Colors.textTertiary}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search studios, locations..."
            placeholderTextColor={Colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== '' && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} style={{ marginRight: Spacing.sm }} />
            </TouchableOpacity>
          )}
        </View>

        {/* Categories (Horizontal) */}
        <View style={styles.section}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity 
                  key={cat.id} 
                  style={[styles.categoryCard, isActive && styles.categoryCardActive]}
                  onPress={() => setActiveCategory(cat.id)}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={20}
                    color={isActive ? Colors.background : Colors.primary}
                  />
                  <Text style={[styles.categoryName, isActive && { color: Colors.background, fontWeight: Typography.weight.bold }]}>
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Quick Context Filters (Pills) */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {QUICK_FILTERS.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterPill, isActive && styles.filterPillActive]}
                  onPress={() => setActiveFilter(isActive ? null : filter)}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{filter}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Last-Minute Deals Hero Banner */}
        {activeFilter === null && searchQuery === '' && activeCategory === 'all' && (
          <TouchableOpacity 
            style={styles.dealBanner}
            onPress={() => setActiveFilter('Flash Deals ⚡')}
          >
            <LinearGradient
              colors={[Colors.primaryDark, Colors.accent]}
              style={styles.dealGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.dealContent}>
                <View style={styles.dealTag}>
                  <Ionicons name="flash" size={14} color={Colors.warning} />
                  <Text style={styles.dealTagText}>YIELD DEALS</Text>
                </View>
                <Text style={styles.dealTitle}>Up to 25% Off</Text>
                <Text style={styles.dealSubtitle}>
                  Grab unbooked slots in the next 48 hours for a fraction of the price!
                </Text>
              </View>
              <Ionicons
                name="arrow-forward-circle"
                size={36}
                color="rgba(255,255,255,0.8)"
              />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Featured Studios Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filteredStudios.length} {filteredStudios.length === 1 ? 'Studio' : 'Studios'} Found
            </Text>
            {activeFilter && (
              <TouchableOpacity onPress={() => setActiveFilter(null)}>
                 <Text style={styles.seeAll}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {filteredStudios.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="planet-outline" size={48} color={Colors.surfaceBorder} />
              <Text style={styles.emptyTitle}>No Studios Found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or filters.</Text>
            </View>
          ) : (
            filteredStudios.map((studio) => (
              <TouchableOpacity 
                key={studio.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/book/${studio.id}`)}
              >
                <Card
                  variant="glass"
                  padding="md"
                  style={styles.studioCard}
                >
                  {/* Studio Image */}
                  <View style={styles.studioImageWrapper}>
                    <LinearGradient
                      colors={[Colors.primaryMuted, Colors.accentMuted]}
                      style={styles.studioImageGradient}
                    >
                      <Ionicons name="business" size={32} color={Colors.primary} />
                    </LinearGradient>
                    
                    {/* Flash Deal Overlay from Phase 4 Logic */}
                    {studio.is_flash_deal && (
                       <View style={styles.flashBadge}>
                         <Ionicons name="flash" size={12} color={Colors.background} />
                         <Text style={styles.flashBadgeText}>Flash Deal</Text>
                       </View>
                    )}
                  </View>

                  {/* Studio Info Block */}
                  <View style={styles.studioInfo}>
                    <View style={styles.studioTypeTag}>
                      <Text style={styles.studioTypeText}>{studio.type}</Text>
                    </View>
                    <Text style={styles.studioName} numberOfLines={1}>{studio.name}</Text>
                    
                    <View style={styles.studioMeta}>
                      <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
                      <Text style={styles.studioLocation} numberOfLines={1}>{studio.location}</Text>
                    </View>
                    
                    <View style={styles.studioBottom}>
                      <View style={styles.studioRating}>
                        <Ionicons name="star" size={14} color={Colors.warning} />
                        <Text style={styles.ratingText}>{studio.rating}</Text>
                      </View>
                      <Text style={styles.studioPrice}>
                        ₹{studio.price}
                        <Text style={styles.perHour}>/hr</Text>
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            ))
          )}
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
  headerTitle: {
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
    marginTop: Spacing.xs,
  },
  notifBtn: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1,
    borderColor: Colors.surfaceElevated,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    height: 24,
  },

  // Categories Horizontal
  section: {
    marginBottom: Spacing.xl,
  },
  categoryScroll: {
    gap: Spacing.sm,
    paddingRight: Spacing.lg,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    gap: Spacing.xs,
  },
  categoryCardActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryName: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },

  // Filters Horizontal
  filterSection: {
    marginBottom: Spacing.xl,
  },
  filterScroll: {
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    borderStyle: 'dashed',
  },
  filterPillActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
    borderStyle: 'solid',
  },
  filterText: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
  },
  filterTextActive: {
    color: Colors.primary,
    fontWeight: Typography.weight.semiBold,
  },

  // Deal Banner
  dealBanner: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  dealGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  dealContent: {
    flex: 1,
  },
  dealTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  dealTagText: {
    color: Colors.warning,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.bold,
    letterSpacing: 1,
  },
  dealTitle: {
    color: Colors.white,
    fontSize: Typography.size.xl,
    fontWeight: Typography.weight.bold,
    letterSpacing: -0.5,
  },
  dealSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: Typography.size.sm,
    marginTop: Spacing.xs,
  },

  // Feed Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: Typography.weight.semiBold,
    color: Colors.textPrimary,
  },
  seeAll: {
    color: Colors.primary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
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
  },

  // Studio Cards
  studioCard: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    gap: Spacing.base,
  },
  studioImageWrapper: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    position: 'relative',
  },
  studioImageGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flashBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  flashBadgeText: {
    fontSize: 9,
    color: Colors.background,
    fontWeight: Typography.weight.bold,
    textTransform: 'uppercase',
  },
  studioInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  studioTypeTag: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  studioTypeText: {
    color: Colors.primary,
    fontSize: Typography.size.xs,
    fontWeight: Typography.weight.medium,
  },
  studioName: {
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.semiBold,
  },
  studioMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  studioLocation: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
    flex: 1,
  },
  studioBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studioRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  ratingText: {
    color: Colors.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.medium,
  },
  studioPrice: {
    color: Colors.textPrimary,
    fontSize: Typography.size.base,
    fontWeight: Typography.weight.bold,
  },
  perHour: {
    color: Colors.textTertiary,
    fontSize: Typography.size.sm,
    fontWeight: Typography.weight.regular,
  },
});
