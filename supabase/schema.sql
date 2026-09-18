-- ============================================================================
--  Kitap & Film Arşivim — Supabase / Postgres şeması
--  Supabase Dashboard > SQL Editor içinde tek seferde çalıştırın.
--  Tekrar çalıştırılabilir (idempotent): DROP POLICY IF EXISTS + CREATE.
-- ============================================================================

-- ----------------------------------------------------------------------------
--  0. Yardımcı: updated_at kolonunu her UPDATE'te otomatik güncelleyen trigger
-- ----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
--  1. BOOKS — Okunan kitaplar
-- ============================================================================
create table if not exists public.books (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,

  title          text not null,
  author         text,
  genre          text,
  rating         smallint check (rating between 1 and 10),

  start_date     date,
  finish_date    date,

  favorite_quote text,
  summary        text,
  -- Okuma kolaylığı: 'kolay' | 'orta' | 'zor'
  reading_ease   text check (reading_ease in ('kolay', 'orta', 'zor')),
  thoughts       text,
  cover_url      text,

  is_favorite    boolean not null default false,

  -- Kullanıcının elle sıralaması için. Araya öğe eklenebilsin diye float;
  -- yeni kayıtlar en sona düşsün diye epoch (saniye) ile başlatılır.
  sort_order     double precision not null default extract(epoch from now()),

  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists books_user_sort_idx
  on public.books (user_id, sort_order desc);
create index if not exists books_user_created_idx
  on public.books (user_id, created_at desc);
create index if not exists books_user_favorite_idx
  on public.books (user_id) where is_favorite;

drop trigger if exists books_set_updated_at on public.books;
create trigger books_set_updated_at
  before update on public.books
  for each row execute function public.set_updated_at();

-- ============================================================================
--  2. WATCHED_ITEMS — İzlenen film & diziler ("type" ile ayrılır)
-- ============================================================================
create table if not exists public.watched_items (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users (id) on delete cascade,

  title               text not null,
  -- 'film' | 'dizi'
  type                text not null check (type in ('film', 'dizi')),
  director_or_creator text,
  genre               text,
  rating              smallint check (rating between 1 and 10),

  -- Film için izlenme tarihi
  watch_date          date,
  -- Dizi için başlangıç tarihi + durum
  start_date          date,
  -- 'izleniyor' | 'tamamlandi'  (dizi için)
  status              text check (status in ('izleniyor', 'tamamlandi')),
  season_progress     text,   -- örn: "3. sezon"

  summary             text,
  thoughts            text,
  memorable_scene     text,
  poster_url          text,

  is_favorite         boolean not null default false,

  -- Ana sayfada elle sıralama için (kitaplarla aynı mantık)
  sort_order          double precision not null default extract(epoch from now()),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists watched_user_sort_idx
  on public.watched_items (user_id, sort_order desc);
create index if not exists watched_user_created_idx
  on public.watched_items (user_id, created_at desc);
create index if not exists watched_user_type_idx
  on public.watched_items (user_id, type);
create index if not exists watched_user_favorite_idx
  on public.watched_items (user_id) where is_favorite;

drop trigger if exists watched_items_set_updated_at on public.watched_items;
create trigger watched_items_set_updated_at
  before update on public.watched_items
  for each row execute function public.set_updated_at();

-- ============================================================================
--  3. ROW LEVEL SECURITY
--  Her kullanıcı YALNIZCA kendi satırlarını göreb/ekleyeb/güncelleyeb/silebilir.
-- ============================================================================
alter table public.books         enable row level security;
alter table public.watched_items enable row level security;

-- ---- books politikaları ----
drop policy if exists "books_select_own" on public.books;
create policy "books_select_own" on public.books
  for select using (auth.uid() = user_id);

drop policy if exists "books_insert_own" on public.books;
create policy "books_insert_own" on public.books
  for insert with check (auth.uid() = user_id);

drop policy if exists "books_update_own" on public.books;
create policy "books_update_own" on public.books
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "books_delete_own" on public.books;
create policy "books_delete_own" on public.books
  for delete using (auth.uid() = user_id);

-- ---- watched_items politikaları ----
drop policy if exists "watched_select_own" on public.watched_items;
create policy "watched_select_own" on public.watched_items
  for select using (auth.uid() = user_id);

drop policy if exists "watched_insert_own" on public.watched_items;
create policy "watched_insert_own" on public.watched_items
  for insert with check (auth.uid() = user_id);

drop policy if exists "watched_update_own" on public.watched_items;
create policy "watched_update_own" on public.watched_items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "watched_delete_own" on public.watched_items;
create policy "watched_delete_own" on public.watched_items
  for delete using (auth.uid() = user_id);

-- ============================================================================
--  4. (OPSİYONEL) Kapak/poster görselleri için Storage bucket
--  Kullanıcı kendi cihazından görsel yükleyecekse çalıştırın. Sadece harici
--  URL (Open Library / TMDB vb.) kullanacaksanız bu bölüm gerekmez.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "covers_public_read" on storage.objects;
create policy "covers_public_read" on storage.objects
  for select using (bucket_id = 'covers');

drop policy if exists "covers_user_insert" on storage.objects;
create policy "covers_user_insert" on storage.objects
  for insert with check (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "covers_user_update" on storage.objects;
create policy "covers_user_update" on storage.objects
  for update using (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "covers_user_delete" on storage.objects;
create policy "covers_user_delete" on storage.objects
  for delete using (
    bucket_id = 'covers'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================================
--  Bitti. Kontrol için:
--    select * from public.books;
--    select * from public.watched_items;
-- ============================================================================