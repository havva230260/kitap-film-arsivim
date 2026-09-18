import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useArchive } from '@/lib/archive';
import { useAuth } from '@/lib/auth';

export default function StatsScreen() {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const { books, watched, loading, refreshing, error, refetch } = useArchive();

  const stats = useMemo(() => {
    const filmCount = watched.filter((item) => item.type === 'film').length;
    const diziCount = watched.filter((item) => item.type === 'dizi').length;
    const favoriteCount =
      books.filter((book) => book.is_favorite).length +
      watched.filter((item) => item.is_favorite).length;

    const ratings = [...books, ...watched]
      .map((entry) => entry.rating)
      .filter((value): value is number => value != null);
    const avgRating = ratings.length
      ? Math.round((ratings.reduce((sum, value) => sum + value, 0) / ratings.length) * 10) / 10
      : null;

    return {
      bookCount: books.length,
      filmCount,
      diziCount,
      favoriteCount,
      avgRating,
      ratedCount: ratings.length,
      total: books.length + watched.length,
    };
  }, [books, watched]);

  function confirmSignOut() {
    Alert.alert('Çıkış yap', 'Oturumu kapatmak istediğine emin misin?', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Çıkış yap', style: 'destructive', onPress: () => void signOut() },
    ]);
  }

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="İstatistik"
        subtitle={user?.email ?? 'Yılın özeti'}
        right={<IconButton icon="log-out" label="Çıkış yap" onPress={confirmSignOut} />}
      />

      {loading && !refreshing ? (
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <EmptyState
            icon="wifi-off"
            title="Bağlantı sorunu"
            description={error}
            action={
              <Button label="Tekrar dene" variant="secondary" onPress={refetch} fullWidth={false} />
            }
          />
        </View>
      ) : stats.total === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="bar-chart-2"
            title="Gösterecek veri yok"
            description="Kayıt eklemeye başladığında bu yıl kaç kitap okuduğun ve kaç film izlediğin burada görünecek."
          />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.headline, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.headlineIcon, { backgroundColor: theme.accentSoft }]}>
              <Feather name="star" size={20} color={theme.gold} />
            </View>
            <View style={styles.headlineText}>
              <AppText variant="display" serif>
                {stats.avgRating != null ? stats.avgRating.toFixed(1) : '—'}
                <AppText variant="callout" color="textSecondary">
                  {' / 10'}
                </AppText>
              </AppText>
              <AppText variant="callout" color="textSecondary">
                Ortalama puan
                {stats.ratedCount > 0
                  ? ` · ${stats.ratedCount} kayıt üzerinden`
                  : ''}
              </AppText>
            </View>
          </View>

          <View style={styles.grid}>
            <StatTile icon="book-open" value={String(stats.bookCount)} label="Kitap" />
            <StatTile icon="film" value={String(stats.filmCount)} label="Film" />
            <StatTile icon="tv" value={String(stats.diziCount)} label="Dizi" />
            <StatTile icon="heart" value={String(stats.favoriteCount)} label="Favori" />
          </View>
        </ScrollView>
      )}
    </Screen>
  );
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: keyof typeof Feather.glyphMap;
  value: string;
  label: string;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.tileIcon, { backgroundColor: theme.surfaceAlt }]}>
        <Feather name={icon} size={16} color={theme.textSecondary} />
      </View>
      <AppText variant="heading" serif>
        {value}
      </AppText>
      <AppText variant="caption" color="textSecondary">
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  scroll: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  headlineIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineText: { flex: 1, gap: 2 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  tile: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: Spacing.xs,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tileIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
