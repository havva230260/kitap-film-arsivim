import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { ArchiveCard } from '@/components/archive/archive-card';
import { ArchiveFilterSheet } from '@/components/archive/archive-filter-sheet';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { SearchField } from '@/components/ui/search-field';
import { Segmented } from '@/components/ui/segmented';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useArchive } from '@/lib/archive';
import type { ArchiveEntry } from '@/lib/types';

type Tab = 'books' | 'watched';

function normalize(text: string) {
  return text.toLowerCase().trim();
}

export default function ArchiveScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { books, watched, loading, refreshing, error, refetch } = useArchive();

  const [tab, setTab] = useState<Tab>('books');
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState<string | null>(null);
  const [minRating, setMinRating] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);

  function changeTab(next: Tab) {
    setTab(next);
    setGenre(null);
    setMinRating(0);
  }

  const entries = useMemo<ArchiveEntry[]>(
    () =>
      tab === 'books'
        ? books.map((book) => ({ kind: 'book', ...book }))
        : watched.map((item) => ({ kind: 'watched', ...item })),
    [tab, books, watched],
  );

  const genres = useMemo(() => {
    const set = new Set<string>();
    entries.forEach((entry) => {
      if (entry.genre) set.add(entry.genre);
    });
    return [...set].sort((a, b) => a.localeCompare(b, 'tr'));
  }, [entries]);

  const filtered = useMemo(() => {
    const q = normalize(query);
    return entries.filter((entry) => {
      if (q && !normalize(entry.title).includes(q)) return false;
      if (genre && entry.genre !== genre) return false;
      if (minRating > 0 && (entry.rating ?? 0) < minRating) return false;
      return true;
    });
  }, [entries, query, genre, minRating]);

  const hasFilter = genre !== null || minRating > 0;
  const searching = query.trim().length > 0;

  return (
    <Screen edges={['top']}>
      <ScreenHeader
        title="Arşiv"
        subtitle={`${books.length + watched.length} kayıt`}
        right={
          <IconButton
            icon="sliders"
            label="Süz"
            variant={hasFilter ? 'filled' : 'plain'}
            tint={hasFilter ? theme.accent : undefined}
            onPress={() => setFilterOpen(true)}
          />
        }
      />

      <View style={styles.controls}>
        <SearchField value={query} onChangeText={setQuery} placeholder="Başlık ara" />
        <Segmented
          options={[
            { value: 'books', label: `Okuduklarım · ${books.length}` },
            { value: 'watched', label: `İzlediklerim · ${watched.length}` },
          ]}
          value={tab}
          onChange={changeTab}
        />
      </View>

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
              <Button
                label="Tekrar dene"
                variant="secondary"
                onPress={refetch}
                fullWidth={false}
              />
            }
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
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
          keyboardDismissMode="on-drag"
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
              icon={searching || hasFilter ? 'search' : tab === 'books' ? 'book-open' : 'film'}
              title={
                searching || hasFilter
                  ? 'Sonuç yok'
                  : tab === 'books'
                    ? 'Henüz kitap eklemedin'
                    : 'Henüz film ya da dizi eklemedin'
              }
              description={
                searching || hasFilter
                  ? 'Arama ya da süzgeç ölçütlerini değiştirmeyi dene.'
                  : 'Sağ alttaki + düğmesiyle ilk kaydını ekle.'
              }
            />
          }
        />
      )}

      <ArchiveFilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        genres={genres}
        genre={genre}
        onGenreChange={setGenre}
        minRating={minRating}
        onMinRatingChange={setMinRating}
      />
    </Screen>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  controls: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },
  center: { flex: 1 },
  list: {
    flexGrow: 1,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxxl,
  },
  separator: { height: Spacing.sm },
});
