import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'glass' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export default function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
}: CardProps) {
  const paddingValues = {
    none: 0,
    sm: Spacing.md,
    md: Spacing.base,
    lg: Spacing.xl,
  };

  const variantStyles: Record<string, ViewStyle> = {
    default: {
      backgroundColor: Colors.surface,
    },
    elevated: {
      backgroundColor: Colors.surfaceElevated,
      ...Shadows.md,
    },
    glass: {
      backgroundColor: Colors.glass,
      borderWidth: 1,
      borderColor: Colors.glassBorder,
    },
    outlined: {
      backgroundColor: Colors.transparent,
      borderWidth: 1,
      borderColor: Colors.surfaceBorder,
    },
  };

  return (
    <View
      style={[
        styles.base,
        variantStyles[variant],
        { padding: paddingValues[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
});
