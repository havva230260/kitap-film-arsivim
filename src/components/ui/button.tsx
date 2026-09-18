import { useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  /** Sol tarafta gösterilecek ikon (opsiyonel) */
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  fullWidth = true,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const [scale] = useState(() => new Animated.Value(1));

  const isDisabled = disabled || loading;

  const spring = (to: number) =>
    Animated.spring(scale, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 4 }).start();

  const palette: Record<Variant, { bg: string; fg: string; border: string }> = {
    primary: { bg: theme.accent, fg: theme.accentText, border: theme.accent },
    secondary: { bg: theme.surfaceAlt, fg: theme.text, border: theme.border },
    ghost: { bg: 'transparent', fg: theme.accent, border: 'transparent' },
  };
  const c = palette[variant];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && styles.fullWidth, style]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={() => spring(0.97)}
        onPressOut={() => spring(1)}
        style={[
          styles.base,
          size === 'md' && styles.md,
          { backgroundColor: c.bg, borderColor: c.border },
          isDisabled && styles.disabled,
        ]}
        {...rest}>
        {loading ? (
          <ActivityIndicator color={c.fg} />
        ) : (
          <View style={styles.content}>
            {icon}
            <AppText variant="label" style={{ color: c.fg, fontSize: size === 'lg' ? 15 : 14 }}>
              {label}
            </AppText>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: { alignSelf: 'stretch' },
  base: {
    minHeight: 52,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  md: { minHeight: 44, paddingHorizontal: Spacing.lg, borderRadius: Radius.sm },
  content: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  disabled: { opacity: 0.45 },
});
