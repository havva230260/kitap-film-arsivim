import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { ChoiceGroup } from '@/components/ui/choice-group';
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
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import {
  READING_EASE_OPTIONS,
  WATCH_STATUS_OPTIONS,
  type NewBook,
  type NewWatchedItem,
  type ReadingEase,
  type WatchStatus,
  type WatchType,
} from '@/lib/types';

type Kind = 'book' | 'watched';
type FieldErrors = { title?: string; genre?: string; rating?: string; date?: string };

const SAVE_ERROR = 'Kayıt eklenemedi. Bağlantını kontrol edip tekrar dene.';

export default function AddScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();

  const [kind, setKind] = useState<Kind>('book');
  const [watchType, setWatchType] = useState<WatchType>('film');

  // Zorunlu alanlar
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  // Opsiyonel — ayrıntılar
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

  // Opsiyonel — notlar
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [summary, setSummary] = useState('');
  const [thoughts, setThoughts] = useState('');
  const [memorableScene, setMemorableScene] = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isBook = kind === 'book';

  async function handleSubmit() {
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

    if (!user) {
      setFormError('Oturum bulunamadı. Yeniden giriş yap.');
      return;
    }

    setSubmitting(true);

    if (isBook) {
      const payload = {
        user_id: user.id,
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
      } satisfies NewBook;

      const { error } = await supabase.from('books').insert(payload);
      if (error) {
        setFormError(SAVE_ERROR);
        setSubmitting(false);
        return;
      }
    } else {
      const payload = {
        user_id: user.id,
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
      } satisfies NewWatchedItem;

      const { error } = await supabase.from('watched_items').insert(payload);
      if (error) {
        setFormError(SAVE_ERROR);
        setSubmitting(false);
        return;
      }
    }

    router.back();
  }

  return (
    <Screen surface>
      <ScreenHeader
        title="Yeni kayıt"
        right={<IconButton icon="x" label="Kapat" onPress={() => router.back()} />}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}>
          <Segmented
            options={[
              { value: 'book', label: 'Kitap' },
              { value: 'watched', label: 'Film / Dizi' },
            ]}
            value={kind}
            onChange={setKind}
          />

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
            <RatingPicker
              label="Puan"
              value={rating}
              onChange={setRating}
              error={errors.rating}
            />
          </View>

          <Section title="Ayrıntılar" subtitle="İsteğe bağlı">
            {isBook ? (
              <TextField
                label="Yazar"
                value={author}
                onChangeText={setAuthor}
                placeholder="Yazarın adı"
              />
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
                <Feather
                  name="heart"
                  size={16}
                  color={isFavorite ? theme.accent : theme.textTertiary}
                />
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

          <Section title="Notlar" subtitle="Özet, alıntı, düşünceler">
            {isBook ? (
              <TextField
                label="Sevdiğin alıntı"
                value={favoriteQuote}
                onChangeText={setFavoriteQuote}
                placeholder="Aklında kalan bir cümle"
                multiline
              />
            ) : null}
            <TextField
              label="Özet"
              value={summary}
              onChangeText={setSummary}
              placeholder="Konusu kısaca"
              multiline
            />
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

          <Button label="Kaydet" onPress={handleSubmit} loading={submitting} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  required: { gap: Spacing.md },
  favRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.md,
  },
  favText: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  banner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.sm,
  },
});
