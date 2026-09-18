import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

/** 1–10 arası puanı altın bir yıldız + sayı olarak gösterir. Puan yoksa hiçbir şey. */
export function Rating({ value }: { value: number | null }) {
  const theme = useTheme();
  if (value == null) return null;

  return (
    <View style={styles.row}>
      <Feather name="star" size={12} color={theme.gold} />
      <AppText variant="caption" style={{ color: theme.gold }}>
        {value}
        <AppText variant="caption" color="textTertiary">
          {' / 10'}
        </AppText>
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});
