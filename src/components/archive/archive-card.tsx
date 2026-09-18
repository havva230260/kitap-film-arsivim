import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Rating } from '@/components/ui/rating';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import type { ArchiveEntry } from '@/lib/types';

type ArchiveCardProps = {
  entry: ArchiveEntry;
  /** Listedeki sıra (0 tabanlı) — kartta "01, 02, …" olarak gösterilir. */
  index: number;
  onPress: () => void;
};

function ArchiveCardBase({ entry, index, onPress }: ArchiveCardProps) {
  const theme = useTheme();

  const isBook = entry.kind === 'book';
  const image = isBook ? entry.cover_url : entry.poster_url;
  const subtitle = isBook ? entry.author : entry.director_or_creator;
  const typeLabel = isBook ? null : entry.type === 'dizi' ? 'Dizi' : 'Film';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={entry.title}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && { opacity: 0.86, transform: [{ scale: 0.995 }] },
      ]}>
      <AppText serif variant="heading" style={[styles.number, { color: theme.textTertiary }]}>
        {String(index + 1).padStart(2, '0')}
      </AppText>

      <View
        style={[styles.thumb, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
        {image ? (
          <Image
            source={{ uri: image }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            transition={180}
          />
        ) : (
          <Feather name={isBook ? 'book' : 'film'} size={18} color={theme.textTertiary} />
        )}
      </View>

      <View style={styles.body}>
        <AppText serif variant="bodyMedium" numberOfLines={1}>
          {entry.title}
        </AppText>
        {subtitle ? (
          <AppText variant="callout" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}

        <View style={styles.meta}>
          {typeLabel ? (
            <View style={[styles.chip, { backgroundColor: theme.surfaceAlt }]}>
              <AppText variant="caption" color="textSecondary">
                {typeLabel}
              </AppText>
            </View>
          ) : null}
          {entry.genre ? (
            <View style={[styles.chip, { backgroundColor: theme.surfaceAlt }]}>
              <AppText variant="caption" color="textSecondary" numberOfLines={1}>
                {entry.genre}
              </AppText>
            </View>
          ) : null}
          <Rating value={entry.rating} />
        </View>
      </View>

      <View style={styles.right}>
        {entry.is_favorite ? (
          <Feather name="heart" size={14} color={theme.accent} />
        ) : null}
        <Feather name="chevron-right" size={18} color={theme.textTertiary} />
      </View>
    </Pressable>
  );
}

export const ArchiveCard = memo(ArchiveCardBase);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  number: {
    width: 26,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  thumb: {
    width: 44,
    height: 62,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 3 },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 2,
  },
  chip: {
    maxWidth: 160,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
