import { Image, StyleSheet, Platform, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { tabBarHeight, topBarPadding } from '@/constants/Measures';
import i18next from '@/utils/localizations';

export default function FilteredScreen() {
  return (
    <View style={styles.container}>
    <ThemedView style={styles.titleContainer}>
      <ThemedText type="title">{i18next.t("welcome")}</ThemedText>
    </ThemedView>
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle">Step 1: Try it</ThemedText>
      <ThemedText>
        Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
        Press{' '}
        <ThemedText type="defaultSemiBold">
          {Platform.select({
            ios: 'cmd + d',
            android: 'cmd + m',
            web: 'F12'
          })}
        </ThemedText>{' '}
        to open developer tools.
      </ThemedText>
    </ThemedView>
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle">Step 2: Explore</ThemedText>
      <ThemedText>
        Tap the Explore tab to learn more about what's included in this starter app.
      </ThemedText>
    </ThemedView>
    <ThemedView style={styles.stepContainer}>
      <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
      <ThemedText>
        When you're ready, run{' '}
        <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
        <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
        <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
        <ThemedText type="defaultSemiBold">app-example</ThemedText>.
      </ThemedText>
    </ThemedView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
      marginBottom: tabBarHeight,
      paddingTop: topBarPadding,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
});
