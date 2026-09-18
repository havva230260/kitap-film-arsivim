import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type SegmentOption<T extends string> = { value: T; label: string };

type SegmentedProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** Ekran içi iki/üç durumlu seçici (alt tab bar'dan ayrı, sayfa başlığının altında). */
export function Segmented<T extends string>({ options, value, onChange }: SegmentedProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.wrap, { backgroundColor: theme.surfaceAlt }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.item,
              active && { backgroundColor: theme.surface, borderColor: theme.border },
            ]}>
            <AppText
              variant="label"
              color={active ? 'text' : 'textTertiary'}
              style={styles.text}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  item: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm + 1,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  text: { textTransform: 'uppercase', letterSpacing: 0.6 },
});
