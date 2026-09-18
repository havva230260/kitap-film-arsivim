import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SearchFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

/** Kompakt arama kutusu — form alanlarından ayrı, ikon + temizle düğmeli. */
export function SearchField({ value, onChangeText, placeholder = 'Ara' }: SearchFieldProps) {
  const theme = useTheme();

  return (
    <View
      style={[styles.row, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
      <Feather name="search" size={17} color={theme.textTertiary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textTertiary}
        selectionColor={theme.accent}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="never"
        style={[styles.input, { color: theme.text, fontFamily: Fonts.sans }]}
      />
      {value.length > 0 ? (
        <Pressable
          hitSlop={10}
          onPress={() => onChangeText('')}
          accessibilityRole="button"
          accessibilityLabel="Aramayı temizle">
          <Feather name="x" size={16} color={theme.textTertiary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    height: 46,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
});
