import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type RatingPickerProps = {
  label: string;
  value: number | null;
  onChange: (value: number) => void;
  error?: string | null;
};

const SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

/** 1–10 arası puan seçici (iki sıra hâlinde sarar). */
export function RatingPicker({ label, value, onChange, error }: RatingPickerProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <AppText variant="label" color="textSecondary" style={styles.label}>
          {label}
        </AppText>
        {value != null ? (
          <View style={styles.current}>
            <Feather name="star" size={12} color={theme.gold} />
            <AppText variant="caption" style={{ color: theme.gold }}>
              {value} / 10
            </AppText>
          </View>
        ) : null}
      </View>

      <View style={styles.grid}>
        {SCORES.map((score) => {
          const active = value === score;
          return (
            <Pressable
              key={score}
              onPress={() => onChange(score)}
              accessibilityRole="button"
              accessibilityLabel={`${score} puan`}
              accessibilityState={{ selected: active }}
              style={[
                styles.cell,
                {
                  backgroundColor: active ? theme.accent : theme.surfaceAlt,
                  borderColor: active ? theme.accent : theme.border,
                },
              ]}>
              <AppText
                variant="bodyMedium"
                style={{ color: active ? theme.accentText : theme.textSecondary }}>
                {score}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      {error ? (
        <AppText variant="caption" style={{ color: theme.danger }}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { textTransform: 'uppercase', letterSpacing: 0.8 },
  current: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  cell: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
