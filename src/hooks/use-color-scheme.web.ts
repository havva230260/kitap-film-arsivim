import { useSyncExternalStore } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';

const emptySubscribe = () => () => {};

/**
 * Statik (SSR) render'ı desteklemek için bu değerin istemci tarafında yeniden
 * hesaplanması gerekir. Hidrasyon durumunu `useSyncExternalStore` ile ayırt
 * ederek sunucuda 'light', istemcide gerçek şema döndürülür.
 */
export function useColorScheme() {
  const hasHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const colorScheme = useRNColorScheme();
  return hasHydrated ? colorScheme : 'light';
}
