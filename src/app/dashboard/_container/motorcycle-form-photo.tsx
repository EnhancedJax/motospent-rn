import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { Motorcycle } from 'phosphor-react-native';
import React from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { FormField, FormInput } from '@/components/ui/form';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { radius } from '@/theme/radius';

export type ImageSourceMode = 'library' | 'url';

const MODES: { value: ImageSourceMode; label: string }[] = [
  { value: 'library', label: 'Library' },
  { value: 'url', label: 'URL' },
];

export function inferImageSourceMode(imageUrl?: string): ImageSourceMode {
  if (!imageUrl?.trim()) {
    return 'library';
  }
  return /^https?:\/\//i.test(imageUrl.trim()) ? 'url' : 'library';
}

type MotorcycleFormPhotoProps = {
  mode: ImageSourceMode;
  onModeChange: (mode: ImageSourceMode) => void;
  imageUrl?: string;
  onImageUrlChange: (url: string | undefined) => void;
  error?: string;
};

export function MotorcycleFormPhoto({
  mode,
  onModeChange,
  imageUrl,
  onImageUrlChange,
  error,
}: MotorcycleFormPhotoProps) {
  const theme = useTheme();

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo library access to add a motorcycle image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      onImageUrlChange(result.assets[0].uri);
    }
  };

  const clearImage = () => {
    onImageUrlChange(undefined);
  };

  return (
    <FormField label="Photo" error={error}>
      <View style={[styles.segmented, { backgroundColor: theme.muted }]}>
        {MODES.map((option) => {
          const isSelected = mode === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onModeChange(option.value)}
              style={[
                styles.segment,
                isSelected && {
                  backgroundColor: theme.card,
                  shadowColor: theme.border,
                },
              ]}>
              <ThemedText type="smallBold" themeColor={isSelected ? 'text' : 'textSecondary'}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.preview, { backgroundColor: theme.muted, borderColor: theme.border }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.previewImage} contentFit="cover" />
        ) : (
          <View style={styles.previewPlaceholder}>
            <Motorcycle size={40} color={theme.mutedForeground} />
            <ThemedText type="small" themeColor="textSecondary">
              {mode === 'url' ? 'Enter an image URL below' : 'Choose a photo from your library'}
            </ThemedText>
          </View>
        )}
      </View>

      {mode === 'library' ? (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={() => void pickImage()}
            style={[styles.actionButton, { backgroundColor: theme.muted, borderColor: theme.border }]}>
            <ThemedText type="smallBold">{imageUrl ? 'Change photo' : 'Choose from library'}</ThemedText>
          </Pressable>
          {imageUrl ? (
            <Pressable accessibilityRole="button" onPress={clearImage}>
              <ThemedText type="linkPrimary">Remove photo</ThemedText>
            </Pressable>
          ) : null}
        </View>
      ) : (
        <View style={styles.actions}>
          <FormInput
            value={imageUrl ?? ''}
            onChangeText={(text) => onImageUrlChange(text.length > 0 ? text : undefined)}
            placeholder="https://example.com/photo.jpg"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            textContentType="URL"
          />
          {imageUrl ? (
            <Pressable accessibilityRole="button" onPress={clearImage}>
              <ThemedText type="linkPrimary">Clear URL</ThemedText>
            </Pressable>
          ) : null}
        </View>
      )}
    </FormField>
  );
}

const styles = StyleSheet.create({
  segmented: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  preview: {
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: 'hidden',
    height: 160,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  actions: {
    gap: Spacing.two,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
});
