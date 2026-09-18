import type { PropsWithChildren } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ScreenProps = PropsWithChildren<{
  edges?: readonly Edge[];
  padded?: boolean;
  style?: ViewStyle;
  /** Zemin rengini yüzey tonuna çeker (form ekranları için hoş) */
  surface?: boolean;
}>;

/** Tüm ekranların ortak dış kabı: güvenli alan + tema zemini + max genişlik. */
export function Screen({
  children,
  edges = ['top', 'bottom'],
  padded = true,
  surface = false,
  style,
}: ScreenProps) {
  const theme = useTheme();
  return (
    <SafeAreaView
      edges={edges}
      style={[styles.root, { backgroundColor: surface ? theme.surface : theme.background }]}>
      <View style={[styles.inner, padded && styles.padded, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inner: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  padded: { paddingHorizontal: Spacing.xl },
});
