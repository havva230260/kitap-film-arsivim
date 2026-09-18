import { Feather } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type TabMeta = { label: string; icon: keyof typeof Feather.glyphMap };

const TABS: Record<string, TabMeta> = {
  index: { label: 'Arşiv', icon: 'book-open' },
  favorites: { label: 'Favoriler', icon: 'heart' },
  stats: { label: 'İstatistik', icon: 'bar-chart-2' },
};

export function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, Spacing.sm),
        },
      ]}>
      {state.routes.map((route, index) => {
        const meta = TABS[route.name];
        if (!meta) return null;

        const focused = state.index === index;
        const color = focused ? theme.accent : theme.textTertiary;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={meta.label}
            style={styles.item}>
            <View
              style={[
                styles.iconPad,
                focused && { backgroundColor: theme.accentSoft },
              ]}>
              <Feather name={meta.icon} size={20} color={color} />
            </View>
            <AppText variant="caption" style={{ color, fontSize: 11 }}>
              {meta.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
    paddingVertical: Spacing.xs,
  },
  iconPad: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs + 1,
    borderRadius: Radius.pill,
  },
});
