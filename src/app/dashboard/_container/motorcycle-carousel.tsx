import { Image } from 'expo-image';
import { Motorcycle } from 'phosphor-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { MotorcycleDTO } from '@/core/database/types';
import { useTheme } from '@/hooks/use-theme';

const CAROUSEL_HEIGHT = Math.round(Dimensions.get('window').height * 0.42);
const FALLBACK_WIDTH = Dimensions.get('window').width;

type CarouselItem = MotorcycleDTO | { id: 'empty'; isEmpty: true };

type MotorcycleCarouselProps = {
  motorcycles: MotorcycleDTO[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function MotorcycleCarousel({ motorcycles, selectedId, onSelect }: MotorcycleCarouselProps) {
  const theme = useTheme();
  const listRef = useRef<FlatList<CarouselItem>>(null);
  const [slideWidth, setSlideWidth] = useState(FALLBACK_WIDTH);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const width = event.nativeEvent.layout.width;
    if (width > 0 && width !== slideWidth) {
      setSlideWidth(width);
    }
  };

  const data: CarouselItem[] =
    motorcycles.length > 0
      ? motorcycles
      : [{ id: 'empty', isEmpty: true as const }];

  const selectedIndex = selectedId
    ? Math.max(
        0,
        data.findIndex((item) => !('isEmpty' in item) && item.id === selectedId),
      )
    : 0;

  useEffect(() => {
    if (selectedIndex < 0 || data.length === 0) {
      return;
    }
    listRef.current?.scrollToIndex({ index: selectedIndex, animated: true });
  }, [selectedId, selectedIndex, data.length, slideWidth]);

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / slideWidth);
    const item = data[index];
    if (item && !('isEmpty' in item)) {
      onSelect(item.id);
    }
  };

  const renderItem: ListRenderItem<CarouselItem> = ({ item }) => {
    if ('isEmpty' in item) {
      return (
        <View style={[styles.slide, { width: slideWidth, backgroundColor: theme.muted }]}>
          <View style={styles.emptyContent}>
            <Motorcycle size={56} color={theme.mutedForeground} />
            <ThemedText type="default" themeColor="textSecondary" style={styles.emptyText}>
              Add your first motorcycle
            </ThemedText>
          </View>
        </View>
      );
    }

    return (
      <View style={[styles.slide, { width: slideWidth }]}>
        <View style={[styles.imageFrame, { backgroundColor: theme.muted }]}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="contain" />
          ) : (
            <View style={[styles.image, styles.placeholder]}>
              <Motorcycle size={64} color={theme.mutedForeground} />
            </View>
          )}
        </View>
        <View style={styles.gradient} pointerEvents="none" />
      </View>
    );
  };

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <FlatList
        ref={listRef}
        data={data}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_data, index) => ({
          length: slideWidth,
          offset: slideWidth * index,
          index,
        })}
        onScrollToIndexFailed={(info) => {
          setTimeout(() => {
            listRef.current?.scrollToIndex({ index: info.index, animated: false });
          }, 100);
        }}
      />
    </View>
  );
}

export const motorcycleCarouselHeight = CAROUSEL_HEIGHT;

const styles = StyleSheet.create({
  container: {
    height: CAROUSEL_HEIGHT,
    width: '100%',
    overflow: 'hidden',
  },
  slide: {
    height: CAROUSEL_HEIGHT,
    overflow: 'hidden',
  },
  imageFrame: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: CAROUSEL_HEIGHT * 0.5,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  emptyContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  emptyText: {
    textAlign: 'center',
  },
});
