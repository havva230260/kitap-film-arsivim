import { Feather } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type EmptyStateProps = {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon = 'inbox', title, description, action }: EmptyStateProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconRing, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}>
        <Feather name={icon} size={26} color={theme.textTertiary} />
      </View>
      <AppText variant="heading" serif center>
        {title}
      </AppText>
      {description ? (
        <AppText variant="callout" color="textSecondary" center style={styles.desc}>
          {description}
        </AppText>
      ) : null}
      {action ? <View style={styles.action}>{action}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.huge,
  },
  iconRing: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  desc: { maxWidth: 300 },
  action: { marginTop: Spacing.md, alignSelf: 'stretch', alignItems: 'center' },
});
