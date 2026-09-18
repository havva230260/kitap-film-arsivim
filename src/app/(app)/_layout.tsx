import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTabBar } from '@/components/app-tab-bar';
import { Radius } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function AppTabsLayout() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.root}>
      <Tabs
        tabBar={(props) => <AppTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: theme.background },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Arşiv' }} />
        <Tabs.Screen name="favorites" options={{ title: 'Favoriler' }} />
        <Tabs.Screen name="stats" options={{ title: 'İstatistik' }} />
      </Tabs>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Yeni kayıt ekle"
        onPress={() => router.push('/add')}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: theme.accent,
            bottom: 64 + Math.max(insets.bottom, 8),
            shadowColor: theme.shadow,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.96 : 1 }],
          },
        ]}>
        <Feather name="plus" size={24} color={theme.accentText} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
