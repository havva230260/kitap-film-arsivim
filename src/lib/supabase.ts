import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Supabase yapılandırması eksik. .env dosyasında EXPO_PUBLIC_SUPABASE_URL ve ' +
      'EXPO_PUBLIC_SUPABASE_KEY tanımlı olmalı.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Mobilde oturum bilgisini okuyacak bir URL yok.
    detectSessionInUrl: false,
  },
});

// Token yenileme döngüsünü yalnızca uygulama önplandayken çalıştır.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
