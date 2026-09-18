import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { supabase } from '@/lib/supabase';

type AuthResult = { error: string | null };
type SignUpResult = AuthResult & { needsConfirmation: boolean };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  /** İlk oturum kontrolü sürerken true. Splash bu süre boyunca açık tutulur. */
  initializing: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Supabase İngilizce hata mesajlarını kısa Türkçe karşılıklarına çevirir. */
function localizeAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'E-posta veya şifre hatalı.';
  if (m.includes('email not confirmed')) return 'E-posta adresini henüz onaylamadın.';
  if (m.includes('user already registered')) return 'Bu e-posta ile bir hesap zaten var.';
  if (m.includes('password should be at least')) return 'Şifre en az 6 karakter olmalı.';
  if (m.includes('unable to validate email address')) return 'Geçersiz e-posta adresi.';
  if (m.includes('email rate limit')) return 'Çok fazla deneme yapıldı, biraz bekle.';
  if (m.includes('network')) return 'Bağlantı hatası. İnternetini kontrol et.';
  return message;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setInitializing(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error ? localizeAuthError(error.message) : null };
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    if (error) {
      return { error: localizeAuthError(error.message), needsConfirmation: false };
    }
    // Oturum döndüyse e-posta onayı kapalıdır; kullanıcı doğrudan içeri girer.
    const needsConfirmation = !data.session;
    return { error: null, needsConfirmation };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      initializing,
      signIn,
      signUp,
      signOut,
    }),
    [session, initializing, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth yalnızca <AuthProvider> içinde kullanılabilir.');
  }
  return ctx;
}
