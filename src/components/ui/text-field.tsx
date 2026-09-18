import { forwardRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

import { AppText } from '@/components/ui/text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string | null;
  hint?: string;
  /** Şifre alanları için göster/gizle düğmesi ekler */
  secure?: boolean;
  /** Çok satırlı alan (özet, düşünceler vb.) */
  multiline?: boolean;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(function TextField(
  { label, error, hint, secure = false, multiline = false, style, onFocus, onBlur, ...rest },
  ref,
) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  const borderColor = error
    ? theme.danger
    : focused
      ? theme.accent
      : theme.border;

  return (
    <View style={styles.wrap}>
      <AppText variant="label" color="textSecondary" style={styles.label}>
        {label}
      </AppText>

      <View
        style={[
          styles.inputRow,
          { backgroundColor: theme.surfaceAlt, borderColor },
          multiline && styles.inputRowMultiline,
          focused && styles.focused,
        ]}>
        <TextInput
          ref={ref}
          placeholderTextColor={theme.textTertiary}
          selectionColor={theme.accent}
          secureTextEntry={hidden}
          multiline={multiline}
          style={[
            styles.input,
            { color: theme.text, fontFamily: Fonts.sans },
            multiline && styles.inputMultiline,
            style,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {secure && (
          <Pressable
            hitSlop={10}
            onPress={() => setHidden((h) => !h)}
            accessibilityRole="button"
            accessibilityLabel={hidden ? 'Şifreyi göster' : 'Şifreyi gizle'}>
            <Feather
              name={hidden ? 'eye' : 'eye-off'}
              size={18}
              color={theme.textTertiary}
            />
          </Pressable>
        )}
      </View>

      {error ? (
        <AppText variant="caption" style={{ color: theme.danger }}>
          {error}
        </AppText>
      ) : hint ? (
        <AppText variant="caption" color="textTertiary">
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  label: { textTransform: 'uppercase', letterSpacing: 0.8 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.lg,
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
  },
  focused: {
    borderWidth: 1.5,
  },
  input: {
    flex: 1,
    paddingVertical: Spacing.md + 2,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
});
