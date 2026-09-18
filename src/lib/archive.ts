import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';
import type { Book, WatchedItem } from '@/lib/types';

/** '' → null; 'YYYY-MM-DD' veya 'GG.AA.YYYY' → ISO; geçersizse ok:false. */
export function parseDate(input: string): { value: string | null; ok: boolean } {
  const raw = input.trim();
  if (!raw) return { value: null, ok: true };

  let iso: string | null = null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) iso = raw;
  const dotted = raw.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotted) iso = `${dotted[3]}-${dotted[2]}-${dotted[1]}`;

  if (!iso || Number.isNaN(Date.parse(iso))) return { value: null, ok: false };
  return { value: iso, ok: true };
}

/** Boş metni null'a çevirir (opsiyonel alanlar için). */
export function clean(text: string): string | null {
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}

type ArchiveState = {
  books: Book[];
  watched: WatchedItem[];
  /** İlk yükleme sürerken true (pull-to-refresh sırasında false). */
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

/**
 * Kullanıcının kitap ve film/dizi kayıtlarını Supabase'ten çeker.
 * RLS sayesinde sorgu yalnızca oturum sahibinin satırlarını döndürür.
 * Ekran her odağa geldiğinde (ör. ekleme modalından dönünce) tazelenir.
 */
export function useArchive(): ArchiveState {
  const [books, setBooks] = useState<Book[]>([]);
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Yarışan isteklerde yalnızca en sonuncusunun sonucu uygulanır.
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;

    const [booksRes, watchedRes] = await Promise.all([
      supabase.from('books').select('*').order('sort_order', { ascending: false }),
      supabase.from('watched_items').select('*').order('sort_order', { ascending: false }),
    ]);

    if (id !== requestId.current) return;

    if (booksRes.error || watchedRes.error) {
      setError('Arşiv yüklenemedi. Bağlantını kontrol edip tekrar dene.');
    } else {
      setError(null);
      setBooks((booksRes.data ?? []) as Book[]);
      setWatched((watchedRes.data ?? []) as WatchedItem[]);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  const refetch = useCallback(async () => {
    setRefreshing(true);
    await load();
  }, [load]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { books, watched, loading, refreshing, error, refetch };
}
