import { Feather } from '@expo/vector-icons';
import { useState, type PropsWithChildren } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SectionProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
}>;

/** Katlanabilir form bölümü — zorunlu alanları sade tutup gerisini gizler. */
export function Section({ title, subtitle, defaultOpen = false, children }: SectionProps) {
  const theme = useTheme();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={[styles.wrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="bodyMedium" serif>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color="textTertiary">
              {subtitle}
            </AppText>
          ) : null}
        </View>
        <Feather
          name="chevron-down"
          size={20}
          color={theme.textTertiary}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>

      {open ? (
        <Animated.View entering={FadeIn.duration(160)} style={styles.body}>
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  headerText: { flex: 1, gap: 2 },
  body: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
});
