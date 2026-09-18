import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Spacing } from '@/constants/theme';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  /** Sol üstte aksiyon (ör. geri) */
  left?: React.ReactNode;
  /** Sağ üstte aksiyon (ör. çıkış, filtre) */
  right?: React.ReactNode;
};

export function ScreenHeader({ title, subtitle, left, right }: ScreenHeaderProps) {
  return (
    <View style={styles.wrap}>
      {left ? <View>{left}</View> : null}
      <View style={styles.textCol}>
        <AppText variant="title" serif numberOfLines={1}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="callout" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  textCol: { flex: 1, gap: 2 },
});
