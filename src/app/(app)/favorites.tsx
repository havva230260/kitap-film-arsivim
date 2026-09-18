import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ArchiveCard } from '@/components/archive/archive-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useArchive } from '@/lib/archive';
import type { ArchiveEntry } from '@/lib/types';

export default function FavoritesScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { books, watched, loading, refreshing, error, refetch } = useArchive();

  const favorites = useMemo<ArchiveEntry[]>(() => {
    const entries: ArchiveEntry[] = [
      ...books.filter((book) => book.is_favorite).map((book) => ({ kind: 'book' as const, ...book })),
      ...watched
        .filter((item) => item.is_favorite)
        .map((item) => ({ kind: 'watched' as const, ...item })),
    ];
    return entries.sort((a, b) => b.sort_order - a.sort_order);
  }, [books, watched]);

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Favoriler"
        subtitle={favorites.length > 0 ? `${favorites.length} kayıt` : 'Kalbini bırakanlar'}
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
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <ArchiveCard
              entry={item}
              index={index}
              onPress={() =>
                router.push({
                  pathname: '/item/[id]',
                  params: { id: item.id, kind: item.kind },
                })
              }
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={Separator}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refetch}
              tintColor={theme.accent}
              colors={[theme.accent]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon="heart"
              title="Henüz favorin yok"
              description="Bir kaydın detayında kalp simgesine dokunarak favorilerine ekleyebilirsin."
            />
          }
        />
      )}
    </Screen>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  center: { flex: 1 },
  list: {
    flexGrow: 1,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxxl,
  },
  separator: { height: Spacing.sm },
});
