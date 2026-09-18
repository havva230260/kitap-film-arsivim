/**
 * Kitap & Film Arşivim — tasarım sistemi
 *
 * Palet, koyu bir sinema salonu ve eski bir kütüphanenin tonlarından ilham alır:
 * sıcak kâğıt beyazları, mürekkep, deri ciltler ve pirinç/altın detaylar.
 * Parlak ya da çocuksu renklerden kaçınılır.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    /** Sayfa zemini — hafif kırık, yaşlanmış kâğıt beyazı */
    background: '#F7F2E9',
    /** Kart / yüzey */
    surface: '#FFFFFF',
    /** İkincil yüzey (alan içi kutular, input zemini) */
    surfaceAlt: '#F1E9D8',
    /** Ana metin — koyu espresso mürekkebi */
    text: '#2B2521',
    /** İkincil metin */
    textSecondary: '#6E6154',
    /** Üçüncül metin / ipuçları */
    textTertiary: '#9C8E7B',
    /** İnce ayraç çizgileri */
    border: '#E4D9C4',
    /** Vurgu — pişmiş toprak / deri cilt kırmızısı */
    accent: '#A8452C',
    /** Vurgu üzerindeki metin rengi */
    accentText: '#FBF6EC',
    /** Vurgunun yumuşak zemin tonu */
    accentSoft: '#EFDDD1',
    /** Altın — puan yıldızları, ince süslemeler */
    gold: '#A9803F',
    /** Hata / yıkıcı işlem */
    danger: '#9B2C22',
    /** Modal arkası karartma */
    overlay: 'rgba(30, 24, 18, 0.38)',
    /** Gölge rengi */
    shadow: '#3A2E1F',

    // --- eski starter bileşenleriyle uyumluluk için ---
    backgroundElement: '#F1E9D8',
    backgroundSelected: '#E7DCC5',
  },
  dark: {
    /** Sayfa zemini — perde kapanmış salon karanlığı, sıcak siyah */
    background: '#151210',
    /** Kart / yüzey */
    surface: '#1F1B17',
    /** İkincil yüzey */
    surfaceAlt: '#28221D',
    /** Ana metin — kâğıt beyazı, kırık */
    text: '#ECE3D4',
    /** İkincil metin */
    textSecondary: '#A99C88',
    /** Üçüncül metin / ipuçları */
    textTertiary: '#7A6E5D',
    /** İnce ayraç çizgileri */
    border: '#352D25',
    /** Vurgu — köz / bakır */
    accent: '#CE6B47',
    /** Vurgu üzerindeki metin rengi */
    accentText: '#1A1310',
    /** Vurgunun yumuşak zemin tonu */
    accentSoft: '#3A251C',
    /** Altın — puan yıldızları */
    gold: '#C9A25C',
    /** Hata / yıkıcı işlem */
    danger: '#D9705F',
    /** Modal arkası karartma */
    overlay: 'rgba(0, 0, 0, 0.55)',
    /** Gölge rengi */
    shadow: '#000000',

    // --- eski starter bileşenleriyle uyumluluk için ---
    backgroundElement: '#28221D',
    backgroundSelected: '#322A23',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

/**
 * Tipografi. Başlıklar serif (kütüphane hissi), gövde metni sistem sans-serif.
 * İleride bir bundle font (ör. Fraunces / EB Garamond) eklenerek daha da
 * kişisel bir görünüm kazandırılabilir; şimdilik platform serif'i kullanıyoruz.
 */
export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'Georgia',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
})!;

/** 4pt tabanlı boşluk ölçeği */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  huge: 64,
  // eski isimler
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  pill: 999,
} as const;

/** Tipografi ölçeği — bileşenlerde tutarlı kullanım için */
export const Type = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '600' as const },
  title: { fontSize: 26, lineHeight: 32, fontWeight: '600' as const },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: '600' as const },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMedium: { fontSize: 16, lineHeight: 24, fontWeight: '500' as const },
  callout: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  label: { fontSize: 13, lineHeight: 16, fontWeight: '600' as const },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' as const },
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 720;
