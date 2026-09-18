import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { ChoiceGroup } from '@/components/ui/choice-group';
import { EmptyState } from '@/components/ui/empty-state';
import { IconButton } from '@/components/ui/icon-button';
import { RatingPicker } from '@/components/ui/rating-picker';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { Section } from '@/components/ui/section';
import { Segmented } from '@/components/ui/segmented';
import { AppText } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { clean, parseDate } from '@/lib/archive';
import { supabase } from '@/lib/supabase';
import {
  READING_EASE_OPTIONS,
  WATCH_STATUS_OPTIONS,
  type Book,
  type ReadingEase,
  type WatchStatus,
  type WatchType,
  type WatchedItem,
} from '@/lib/types';

type Kind = 'book' | 'watched';
type FieldErrors = { title?: string; genre?: string; rating?: string; date?: string };
type Record_ = Book | WatchedItem;

const SAVE_ERROR = 'Değişiklikler kaydedilemedi. Bağlantını kontrol edip tekrar dene.';

export default function ItemDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { id, kind: kindParam } = useLocalSearchParams<{ id: string; kind?: string }>();

  const kind: Kind = kindParam === 'watched' ? 'watched' : 'book';
  const table = kind === 'book' ? 'books' : 'watched_items';
  const isBook = kind === 'book';

  const [record, setRecord] = useState<Record_ | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const [watchType, setWatchType] = useState<WatchType>('film');
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [author, setAuthor] = useState('');
  const [director, setDirector] = useState('');
  const [startDate, setStartDate] = useState('');
  const [finishDate, setFinishDate] = useState('');
  const [watchDate, setWatchDate] = useState('');
  const [readingEase, setReadingEase] = useState<ReadingEase | null>(null);
  const [status, setStatus] = useState<WatchStatus | null>(null);
  const [seasonProgress, setSeasonProgress] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [summary, setSummary] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [memorableScene, setMemorableScene] = useState('');

  const applyRecord = useCallback(
    (rec: Record_) => {
      setTitle(rec.title);
      setGenre(rec.genre ?? '');
      setRating(rec.rating);
      setIsFavorite(rec.is_favorite);
      setSummary(rec.summary ?? '');
      setThoughts(rec.thoughts ?? '');
      if (isBook) {
        const book = rec as Book;
        setAuthor(book.author ?? '');
        setStartDate(book.start_date ?? '');
        setFinishDate(book.finish_date ?? '');
        setFavoriteQuote(book.favorite_quote ?? '');
        setReadingEase(book.reading_ease);
        setCoverUrl(book.cover_url ?? '');
      } else {
        const watched = rec as WatchedItem;
        setWatchType(watched.type);
        setDirector(watched.director_or_creator ?? '');
        setWatchDate(watched.watch_date ?? '');
        setStartDate(watched.start_date ?? '');
        setStatus(watched.status);
        setSeasonProgress(watched.season_progress ?? '');
        setMemorableScene(watched.memorable_scene ?? '');
        setPosterUrl(watched.poster_url ?? '');
      }
    },
    [isBook],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle();
      if (!active) return;
      if (error) {
        setLoadError('Kayıt yüklenemedi. Bağlantını kontrol edip tekrar dene.');
      } else if (!data) {
        setNotFound(true);
      } else {
        const rec = data as Record_;
        setRecord(rec);
        applyRecord(rec);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id, table, applyRecord]);

  function cancelEdit() {
    if (record) applyRecord(record);
    setErrors({});
    setFormError(null);
    setEditing(false);
  }

  async function handleSave() {
    if (!record) return;
    setFormError(null);

    const next: FieldErrors = {};
    if (!title.trim()) next.title = 'Başlık gerekli.';
    if (!genre.trim()) next.genre = 'Tür gerekli.';
    if (rating == null) next.rating = 'Puan seç.';

    const dateChecks = isBook
      ? [parseDate(startDate), parseDate(finishDate)]
      : watchType === 'film'
        ? [parseDate(watchDate)]
        : [parseDate(startDate)];
    if (dateChecks.some((d) => !d.ok)) next.date = 'Tarihi 2026-09-08 biçiminde gir.';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);

    if (isBook) {
      const payload = {
        title: title.trim(),
        genre: genre.trim(),
        rating,
        author: clean(author),
        start_date: parseDate(startDate).value,
        finish_date: parseDate(finishDate).value,
        favorite_quote: clean(favoriteQuote),
        summary: clean(summary),
        reading_ease: readingEase,
        thoughts: clean(thoughts),
        cover_url: clean(coverUrl),
        is_favorite: isFavorite,
      };

      const { data, error } = await supabase
        .from('books')
        .update(payload)
        .eq('id', record.id)
        .select()
        .single();
      if (error || !data) {
        setFormError(SAVE_ERROR);
        setSaving(false);
        return;
      }
      setRecord(data as Book);
    } else {
      const payload = {
        title: title.trim(),
        type: watchType,
        genre: genre.trim(),
        rating,
        director_or_creator: clean(director),
        watch_date: watchType === 'film' ? parseDate(watchDate).value : null,
        start_date: watchType === 'dizi' ? parseDate(startDate).value : null,
        status: watchType === 'dizi' ? status : null,
        season_progress: watchType === 'dizi' ? clean(seasonProgress) : null,
        summary: clean(summary),
        thoughts: clean(thoughts),
        memorable_scene: clean(memorableScene),
        poster_url: clean(posterUrl),
        is_favorite: isFavorite,
      };

      const { data, error } = await supabase
        .from('watched_items')
        .update(payload)
        .eq('id', record.id)
        .select()
        .single();
      if (error || !data) {
        setFormError(SAVE_ERROR);
        setSaving(false);
        return;
      }
      setRecord(data as WatchedItem);
    }

    setSaving(false);
    setEditing(false);
  }

  function confirmDelete() {
    if (deleting) return;
    Alert.alert('Kaydı sil', 'Bu kaydı silmek istediğine emin misin? Bu işlem geri alınamaz.', [
      { text: 'Vazgeç', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => void handleDelete() },
    ]);
  }

  async function handleDelete() {
    if (!record) return;
    setDeleting(true);
    const { error } = await supabase.from(table).delete().eq('id', record.id);
    if (error) {
      setDeleting(false);
      Alert.alert('Hata', 'Kayıt silinemedi. Bağlantını kontrol edip tekrar dene.');
      return;
    }
    router.back();
  }

  async function toggleFavorite() {
    if (!record) return;
    const previous = record;
    const next = { ...record, is_favorite: !record.is_favorite };
    setRecord(next);
    setIsFavorite(next.is_favorite);

    const { error } = await supabase
      .from(table)
      .update({ is_favorite: next.is_favorite })
      .eq('id', record.id);
    if (error) {
      setRecord(previous);
      setIsFavorite(previous.is_favorite);
      Alert.alert('Hata', 'Favori durumu güncellenemedi.');
    }
  }

  async function quickSetRating(value: number) {
    if (!record) return;
    const previous = record;
    const next = { ...record, rating: value };
    setRecord(next);
    setRating(value);

    const { error } = await supabase.from(table).update({ rating: value }).eq('id', record.id);
    if (error) {
      setRecord(previous);
      setRating(previous.rating);
      Alert.alert('Hata', 'Puan güncellenemedi.');
    }
  }

  const image = record ? (isBook ? (record as Book).cover_url : (record as WatchedItem).poster_url) : null;
  const subtitleBits = record
    ? [
        !isBook ? ((record as WatchedItem).type === 'dizi' ? 'Dizi' : 'Film') : null,
        record.genre,
      ].filter((v): v is string => Boolean(v))
    : [];

  const headerLeft = <IconButton icon="arrow-left" label="Geri" onPress={() => router.back()} />;
  const headerRight = editing ? (
    <IconButton icon="x" label="Vazgeç" onPress={cancelEdit} />
  ) : record ? (
    <View style={styles.headerActions}>
      <IconButton icon="trash-2" label="Sil" onPress={confirmDelete} tint={theme.danger} />
      <IconButton icon="edit-2" label="Düzenle" onPress={() => setEditing(true)} />
    </View>
  ) : undefined;

  if (loading) {
    return (
      <Screen edges={['top']}>
        <ScreenHeader title="Detay" left={headerLeft} />
        <View style={styles.center}>
          <ActivityIndicator color={theme.accent} />
        </View>
      </Screen>
    );
  }

  if (loadError || notFound) {
    return (
      <Screen edges={['top']}>
        <ScreenHeader title="Detay" left={headerLeft} />
        <View style={styles.center}>
          <EmptyState
            icon={notFound ? 'help-circle' : 'wifi-off'}
            title={notFound ? 'Kayıt bulunamadı' : 'Bağlantı sorunu'}
            description={notFound ? 'Bu kayıt silinmiş olabilir.' : (loadError ?? undefined)}
          />
        </View>
      </Screen>
    );
  }

  if (!record) return null;

  return (
    <Screen surface={editing} edges={['top']}>
      <ScreenHeader
        title={editing ? 'Düzenle' : record.title}
        subtitle={editing ? undefined : subtitleBits.join(' · ') || undefined}
        left={headerLeft}
        right={headerRight}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          {editing ? (
            <>
              {!isBook ? (
                <Segmented
                  options={[
                    { value: 'film', label: 'Film' },
                    { value: 'dizi', label: 'Dizi' },
                  ]}
                  value={watchType}
                  onChange={setWatchType}
                />
              ) : null}

              <View style={styles.required}>
                <TextField
                  label="Başlık"
                  value={title}
                  onChangeText={setTitle}
                  error={errors.title}
                  placeholder={isBook ? 'Kitabın adı' : 'Film ya da dizinin adı'}
                  autoCapitalize="sentences"
                  returnKeyType="next"
                />
                <TextField
                  label="Tür"
                  value={genre}
                  onChangeText={setGenre}
                  error={errors.genre}
                  placeholder="Roman, bilim kurgu, dram…"
                  autoCapitalize="sentences"
                  returnKeyType="next"
                />
                <RatingPicker label="Puan" value={rating} onChange={setRating} error={errors.rating} />
              </View>

              <Section title="Ayrıntılar" subtitle="İsteğe bağlı" defaultOpen>
                {isBook ? (
                  <TextField label="Yazar" value={author} onChangeText={setAuthor} placeholder="Yazarın adı" />
                ) : (
                  <TextField
                    label={watchType === 'dizi' ? 'Yaratıcı' : 'Yönetmen'}
                    value={director}
                    onChangeText={setDirector}
                    placeholder="Ad soyad"
                  />
                )}

                {isBook ? (
                  <>
                    <TextField
                      label="Başlangıç tarihi"
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="2026-09-08"
                      hint="Boş bırakabilirsin"
                      error={errors.date}
                    />
                    <TextField
                      label="Bitiş tarihi"
                      value={finishDate}
                      onChangeText={setFinishDate}
                      placeholder="2026-09-20"
                    />
                    <ChoiceGroup
                      label="Okuma kolaylığı"
                      options={READING_EASE_OPTIONS}
                      value={readingEase}
                      onChange={setReadingEase}
                    />
                  </>
                ) : watchType === 'film' ? (
                  <TextField
                    label="İzleme tarihi"
                    value={watchDate}
                    onChangeText={setWatchDate}
                    placeholder="2026-09-08"
                    hint="Boş bırakabilirsin"
                    error={errors.date}
                  />
                ) : (
                  <>
                    <TextField
                      label="Başlangıç tarihi"
                      value={startDate}
                      onChangeText={setStartDate}
                      placeholder="2026-09-08"
                      hint="Boş bırakabilirsin"
                      error={errors.date}
                    />
                    <ChoiceGroup
                      label="Durum"
                      options={WATCH_STATUS_OPTIONS}
                      value={status}
                      onChange={setStatus}
                    />
                    <TextField
                      label="Sezon durumu"
                      value={seasonProgress}
                      onChangeText={setSeasonProgress}
                      placeholder="örn. 3. sezon"
                    />
                  </>
                )}

                <TextField
                  label={isBook ? 'Kapak görseli bağlantısı' : 'Afiş görseli bağlantısı'}
                  value={isBook ? coverUrl : posterUrl}
                  onChangeText={isBook ? setCoverUrl : setPosterUrl}
                  placeholder="https://…"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />

                <View style={[styles.favRow, { borderColor: theme.border }]}>
                  <View style={styles.favText}>
                    <Feather name="heart" size={16} color={isFavorite ? theme.accent : theme.textTertiary} />
                    <AppText variant="callout">Favorilere ekle</AppText>
                  </View>
                  <Switch
                    value={isFavorite}
                    onValueChange={setIsFavorite}
                    trackColor={{ true: theme.accent, false: theme.border }}
                    thumbColor={theme.surface}
                  />
                </View>
              </Section>

              <Section title="Notlar" subtitle="Özet, alıntı, düşünceler" defaultOpen>
                {isBook ? (
                  <TextField
                    label="Sevdiğin alıntı"
                    value={favoriteQuote}
                    onChangeText={setFavoriteQuote}
                    placeholder="Aklında kalan bir cümle"
                    multiline
                  />
                ) : null}
                <TextField label="Özet" value={summary} onChangeText={setSummary} placeholder="Konusu kısaca" multiline />
                <TextField
                  label="Düşüncelerin"
                  value={thoughts}
                  onChangeText={setThoughts}
                  placeholder="Sana ne hissettirdi?"
                  multiline
                />
                {!isBook ? (
                  <TextField
                    label="Akılda kalan sahne"
                    value={memorableScene}
                    onChangeText={setMemorableScene}
                    placeholder="Unutamadığın an"
                    multiline
                  />
                ) : null}
              </Section>

              {formError ? (
                <View style={[styles.banner, { backgroundColor: theme.accentSoft }]}>
                  <Feather name="alert-circle" size={15} color={theme.danger} />
                  <AppText variant="caption" style={{ color: theme.danger, flex: 1 }}>
                    {formError}
                  </AppText>
                </View>
              ) : null}

              <Button label="Kaydet" onPress={handleSave} loading={saving} />
            </>
          ) : (
            <>
              {image ? (
                <View style={[styles.cover, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
                  <Image source={{ uri: image }} style={StyleSheet.absoluteFill} contentFit="cover" transition={180} />
                </View>
              ) : null}

              <View style={styles.viewSection}>
                {isBook ? (
                  <DetailRow label="Yazar" value={(record as Book).author} />
                ) : (
                  <DetailRow
                    label={(record as WatchedItem).type === 'dizi' ? 'Yaratıcı' : 'Yönetmen'}
                    value={(record as WatchedItem).director_or_creator}
                  />
                )}

                <RatingPicker label="Puan" value={record.rating} onChange={quickSetRating} />

                <View style={[styles.favRow, { borderColor: theme.border }]}>
                  <View style={styles.favText}>
                    <Feather
                      name="heart"
                      size={16}
                      color={record.is_favorite ? theme.accent : theme.textTertiary}
                    />
                    <AppText variant="callout">Favorilere ekle</AppText>
                  </View>
                  <Switch
                    value={record.is_favorite}
                    onValueChange={toggleFavorite}
                    trackColor={{ true: theme.accent, false: theme.border }}
                    thumbColor={theme.surface}
                  />
                </View>

                {isBook ? (
                  <>
                    <DetailRow label="Başlangıç tarihi" value={(record as Book).start_date} />
                    <DetailRow label="Bitiş tarihi" value={(record as Book).finish_date} />
                    <DetailRow
                      label="Okuma kolaylığı"
                      value={
                        READING_EASE_OPTIONS.find((o) => o.value === (record as Book).reading_ease)?.label ?? null
                      }
                    />
                  </>
                ) : (record as WatchedItem).type === 'film' ? (
                  <DetailRow label="İzleme tarihi" value={(record as WatchedItem).watch_date} />
                ) : (
                  <>
                    <DetailRow label="Başlangıç tarihi" value={(record as WatchedItem).start_date} />
                    <DetailRow
                      label="Durum"
                      value={
                        WATCH_STATUS_OPTIONS.find((o) => o.value === (record as WatchedItem).status)?.label ?? null
                      }
                    />
                    <DetailRow label="Sezon durumu" value={(record as WatchedItem).season_progress} />
                  </>
                )}
              </View>

              {isBook && (record as Book).favorite_quote ? (
                <Section title="Sevdiğin alıntı" defaultOpen>
                  <AppText variant="body" serif>
                    “{(record as Book).favorite_quote}”
                  </AppText>
                </Section>
              ) : null}

              {record.summary ? (
                <Section title="Özet" defaultOpen>
                  <AppText variant="body" color="textSecondary">
                    {record.summary}
                  </AppText>
                </Section>
              ) : null}

              {record.thoughts ? (
                <Section title="Düşüncelerin" defaultOpen>
                  <AppText variant="body" color="textSecondary">
                    {record.thoughts}
                  </AppText>
                </Section>
              ) : null}

              {!isBook && (record as WatchedItem).memorable_scene ? (
                <Section title="Akılda kalan sahne" defaultOpen>
                  <AppText variant="body" color="textSecondary">
                    {(record as WatchedItem).memorable_scene}
                  </AppText>
                </Section>
              ) : null}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {deleting ? (
        <View style={[styles.overlay, { backgroundColor: theme.overlay }]}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : null}
    </Screen>
  );
}

function DetailRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <View style={styles.detailRow}>
      <AppText variant="label" color="textSecondary" style={styles.detailLabel}>
        {label}
      </AppText>
      <AppText variant="callout">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  required: { gap: Spacing.md },
  viewSection: { gap: Spacing.md },
  detailRow: { gap: 2 },
  detailLabel: { textTransform: 'uppercase', letterSpacing: 0.8 },
  cover: {
    width: '100%',
    aspectRatio: 3 / 2,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
  },
  favText: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  banner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.sm,
  },
});
