import { Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, Type, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Variant = keyof typeof Type;

export type AppTextProps = TextProps & {
  variant?: Variant;
  /** Serif aile — başlıklarda kütüphane hissi için */
  serif?: boolean;
  color?: ThemeColor;
  center?: boolean;
};

/**
 * Uygulamanın tek metin bileşeni. Tipografi ölçeğini (`Type`) ve tema
 * renklerini tek yerden uygular.
 */
export function AppText({
  variant = 'body',
  serif = false,
  color = 'text',
  center = false,
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();

  const base: TextStyle = {
    ...Type[variant],
    color: theme[color],
    fontFamily: serif ? Fonts.serif : Fonts.sans,
  };
  if (serif) {
    // Serif gövdeler biraz daha ferah nefes alsın
    base.letterSpacing = 0.2;
  }

  return <Text style={[base, center && { textAlign: 'center' }, style]} {...rest} />;
}
