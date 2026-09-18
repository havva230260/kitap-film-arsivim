import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { AppText } from '@/components/ui/text';
import { TextField } from '@/components/ui/text-field';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

type Mode = 'signin' | 'signup';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignInScreen() {
  const theme = useTheme();
  const { signIn, signUp } = useAuth();
  const { height } = useWindowDimensions();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [intro] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 620,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [intro]);

  function switchMode(next: Mode) {
    setMode(next);
    setFormError(null);
    setNotice(null);
    setConfirm('');
  }

  async function handleSubmit() {
    setFormError(null);
    setNotice(null);

    if (!EMAIL_RE.test(email.trim())) {
      setFormError('Geçerli bir e-posta adresi gir.');
      return;
    }
    if (password.length < 6) {
      setFormError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (mode === 'signup' && password !== confirm) {
      setFormError('Şifreler eşleşmiyor.');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) setFormError(error);
        // başarılıysa yönlendirme otomatik (Stack.Protected)
      } else {
        const { error, needsConfirmation } = await signUp(email, password);
        if (error) {
          setFormError(error);
        } else if (needsConfirmation) {
          setNotice(
            'Hesabın oluşturuldu. E-postana gönderdiğimiz onay bağlantısına tıkla, sonra giriş yap.',
          );
          setMode('signin');
          setPassword('');
          setConfirm('');
        }
      }
    } finally {
      setSubmitting(false);
    }
  }

  const translateY = intro.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });

  return (
    <Screen edges={['top', 'bottom']} padded={false}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { minHeight: height * 0.9 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Animated.View style={{ opacity: intro, transform: [{ translateY }] }}>
            <View style={styles.brand}>
              <Emblem />
              <AppText variant="display" serif style={styles.brandTitle}>
                Arşiv
              </AppText>
              <AppText variant="callout" color="textSecondary" center>
                Okuduğun kitapları, izlediğin film ve dizileri{'\n'}bir daha unutma.
              </AppText>
            </View>

            <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.segment, { backgroundColor: theme.surfaceAlt }]}>
                {(['signin', 'signup'] as const).map((m) => {
                  const active = mode === m;
                  return (
                    <Pressable
                      key={m}
                      onPress={() => switchMode(m)}
                      style={[
                        styles.segmentItem,
                        active && { backgroundColor: theme.surface, borderColor: theme.border },
                      ]}>
                      <AppText
                        variant="label"
                        color={active ? 'text' : 'textTertiary'}
                        style={styles.segmentText}>
                        {m === 'signin' ? 'Giriş yap' : 'Kayıt ol'}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.fields}>
                <TextField
                  label="E-posta"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  placeholder="ornek@eposta.com"
                  returnKeyType="next"
                />
                <TextField
                  label="Şifre"
                  value={password}
                  onChangeText={setPassword}
                  secure
                  autoCapitalize="none"
                  textContentType={mode === 'signup' ? 'newPassword' : 'password'}
                  placeholder="En az 6 karakter"
                  returnKeyType={mode === 'signin' ? 'go' : 'next'}
                  onSubmitEditing={mode === 'signin' ? handleSubmit : undefined}
                />
                {mode === 'signup' && (
                  <TextField
                    label="Şifre (tekrar)"
                    value={confirm}
                    onChangeText={setConfirm}
                    secure
                    autoCapitalize="none"
                    textContentType="newPassword"
                    placeholder="Şifreyi tekrar gir"
                    returnKeyType="go"
                    onSubmitEditing={handleSubmit}
                  />
                )}
              </View>

              {formError && (
                <View style={[styles.banner, { backgroundColor: theme.accentSoft }]}>
                  <Feather name="alert-circle" size={15} color={theme.danger} />
                  <AppText variant="caption" style={{ color: theme.danger, flex: 1 }}>
                    {formError}
                  </AppText>
                </View>
              )}
              {notice && (
                <View style={[styles.banner, { backgroundColor: theme.surfaceAlt }]}>
                  <Feather name="mail" size={15} color={theme.gold} />
                  <AppText variant="caption" color="textSecondary" style={{ flex: 1 }}>
                    {notice}
                  </AppText>
                </View>
              )}

              <Button
                label={mode === 'signin' ? 'Giriş yap' : 'Hesap oluştur'}
                onPress={handleSubmit}
                loading={submitting}
              />
            </View>

            <Pressable onPress={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
              <AppText variant="callout" color="textSecondary" center style={styles.footer}>
                {mode === 'signin' ? 'Hesabın yok mu? ' : 'Zaten hesabın var mı? '}
                <AppText variant="callout" style={{ color: theme.accent }}>
                  {mode === 'signin' ? 'Kayıt ol' : 'Giriş yap'}
                </AppText>
              </AppText>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

/** İki kart üst üste: bir kitap kapağı + bir film karesi. */
function Emblem() {
  const theme = useTheme();
  return (
    <View style={styles.emblem}>
      <View
        style={[
          styles.emblemBook,
          { backgroundColor: theme.accent, borderColor: theme.border },
        ]}
      />
      <View
        style={[
          styles.emblemFilm,
          { backgroundColor: theme.surface, borderColor: theme.gold },
        ]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.perf, { backgroundColor: theme.gold }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  brandTitle: {
    marginTop: Spacing.sm,
    letterSpacing: 0.5,
  },
  emblem: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emblemBook: {
    position: 'absolute',
    width: 48,
    height: 62,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    transform: [{ rotate: '-9deg' }, { translateX: -8 }],
  },
  emblemFilm: {
    position: 'absolute',
    width: 46,
    height: 60,
    borderRadius: 6,
    borderWidth: 1,
    transform: [{ rotate: '8deg' }, { translateX: 10 }],
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  perf: {
    width: 5,
    height: 5,
    borderRadius: 1.5,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.sm + 1,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  segmentText: { textTransform: 'uppercase', letterSpacing: 0.8 },
  fields: { gap: Spacing.md },
  banner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.sm,
  },
  footer: { marginTop: Spacing.xl },
});
