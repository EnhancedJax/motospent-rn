import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAppStore } from '@/stores/app-store';
import { useSettingsStore } from '@/stores/settings-store';

type DatabaseProviderProps = {
  children: React.ReactNode;
};

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const initializeApp = useAppStore((state) => state.initializeApp);
  const dbReady = useAppStore((state) => state.dbReady);
  const initError = useAppStore((state) => state.initError);
  const subscribeToSettings = useSettingsStore((state) => state.subscribeToSettings);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let unsubscribeSettings: (() => void) | undefined;

    const bootstrap = async () => {
      try {
        await initializeApp();
        unsubscribeSettings = subscribeToSettings();
      } catch {
        // initError is stored in app store
      } finally {
        setIsInitializing(false);
      }
    };

    void bootstrap();

    return () => {
      unsubscribeSettings?.();
    };
  }, [initializeApp, subscribeToSettings]);

  if (isInitializing || !dbReady) {
    if (initError) {
      return null;
    }

    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
