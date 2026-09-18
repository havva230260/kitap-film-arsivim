/** Supabase tablolarının uygulama tarafı tipleri (schema.sql ile eşleşir). */

export type ReadingEase = 'kolay' | 'orta' | 'zor';
export type WatchType = 'film' | 'dizi';
export type WatchStatus = 'izleniyor' | 'tamamlandi';

export const READING_EASE_OPTIONS: readonly { value: ReadingEase; label: string }[] = [
  { value: 'kolay', label: 'Kolay' },
  { value: 'orta', label: 'Orta' },
  { value: 'zor', label: 'Zor' },
];

export const WATCH_STATUS_OPTIONS: readonly { value: WatchStatus; label: string }[] = [
  { value: 'izleniyor', label: 'İzleniyor' },
  { value: 'tamamlandi', label: 'Tamamlandı' },
];

export type Book = {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  genre: string | null;
  rating: number | null;
  start_date: string | null;
  finish_date: string | null;
  favorite_quote: string | null;
  summary: string | null;
  reading_ease: ReadingEase | null;
  thoughts: string | null;
  cover_url: string | null;
  is_favorite: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type WatchedItem = {
  id: string;
  user_id: string;
  title: string;
  type: WatchType;
  director_or_creator: string | null;
  genre: string | null;
  rating: number | null;
  watch_date: string | null;
  start_date: string | null;
  status: WatchStatus | null;
  season_progress: string | null;
  summary: string | null;
  thoughts: string | null;
  memorable_scene: string | null;
  poster_url: string | null;
  is_favorite: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

/** Yeni kayıt eklerken kullanılan alanlar (id / tarihler sunucuda üretilir). */
export type NewBook = Omit<Book, 'id' | 'created_at' | 'updated_at' | 'sort_order'> &
  Partial<Pick<Book, 'sort_order'>>;

export type NewWatchedItem = Omit<
  WatchedItem,
  'id' | 'created_at' | 'updated_at' | 'sort_order'
> &
  Partial<Pick<WatchedItem, 'sort_order'>>;

/** Ana listede iki koleksiyonu tek tipte gezebilmek için yardımcı ayrım. */
export type ArchiveEntry =
  | ({ kind: 'book' } & Book)
  | ({ kind: 'watched' } & WatchedItem);
