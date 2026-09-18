import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type Choice<T extends string> = { value: T; label: string };

type ChoiceGroupProps<T extends string> = {
  label?: string;
  options: readonly Choice<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  /** Seçili seçeneğe tekrar dokununca seçimi kaldırır (opsiyonel alanlar için). */
  clearable?: boolean;
};

/** Pill biçiminde tekli seçim — opsiyonel alanlarda (seçimi kaldırılabilir). */
export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  clearable = true,
}: ChoiceGroupProps<T>) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View style={styles.row}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(active && clearable ? null : option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={[
                styles.chip,
                {
                  borderColor: active ? theme.accent : theme.border,
                  backgroundColor: active ? theme.accentSoft : 'transparent',
                },
              ]}>
              <AppText
                variant="caption"
                style={{ color: active ? theme.accent : theme.textSecondary }}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  label: { textTransform: 'uppercase', letterSpacing: 0.8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
