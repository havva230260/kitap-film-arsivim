import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ArchiveFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  genres: string[];
  genre: string | null;
  onGenreChange: (genre: string | null) => void;
  minRating: number;
  onMinRatingChange: (rating: number) => void;
};

const RATING_STEPS = [0, 6, 7, 8, 9];

export function ArchiveFilterSheet({
  visible,
  onClose,
  genres,
  genre,
  onGenreChange,
  minRating,
  onMinRatingChange,
}: ArchiveFilterSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const hasFilter = genre !== null || minRating > 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { backgroundColor: theme.overlay }]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Süzgeci kapat"
      />

      <View
        style={[
          styles.sheet,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            paddingBottom: insets.bottom + Spacing.lg,
          },
        ]}>
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: theme.border }]} />
        </View>

        <View style={styles.headerRow}>
          <AppText variant="heading" serif>
            Süz
          </AppText>
          {hasFilter ? (
            <Pressable
              hitSlop={8}
              onPress={() => {
                onGenreChange(null);
                onMinRatingChange(0);
              }}>
              <AppText variant="label" style={{ color: theme.accent }}>
                Temizle
              </AppText>
            </Pressable>
          ) : null}
        </View>

        <AppText variant="label" color="textSecondary" style={styles.groupLabel}>
          TÜR
        </AppText>
        {genres.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}>
            <FilterChip label="Hepsi" active={genre === null} onPress={() => onGenreChange(null)} />
            {genres.map((item) => (
              <FilterChip
                key={item}
                label={item}
                active={genre === item}
                onPress={() => onGenreChange(item)}
              />
            ))}
          </ScrollView>
        ) : (
          <AppText variant="caption" color="textTertiary">
            Kayıtlarında henüz tür bilgisi yok.
          </AppText>
        )}

        <AppText variant="label" color="textSecondary" style={styles.groupLabel}>
          EN AZ PUAN
        </AppText>
        <View style={styles.chipRow}>
          {RATING_STEPS.map((step) => (
            <FilterChip
              key={step}
              label={step === 0 ? 'Hepsi' : `${step}+`}
              active={minRating === step}
              onPress={() => onMinRatingChange(step)}
            />
          ))}
        </View>
      </View>
    </Modal>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
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
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  handleWrap: { alignItems: 'center', paddingBottom: Spacing.sm },
  handle: { width: 36, height: 4, borderRadius: Radius.pill },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  groupLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  chipRow: {
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
