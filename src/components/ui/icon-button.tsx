import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type IconButtonProps = {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  label: string;
  variant?: 'plain' | 'filled';
  tint?: string;
};

export function IconButton({ icon, onPress, label, variant = 'plain', tint }: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      style={({ pressed }) => [
        styles.base,
        variant === 'filled' && { backgroundColor: theme.surfaceAlt },
        pressed && { opacity: 0.6 },
      ]}>
      <Feather name={icon} size={20} color={tint ?? theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
