// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'camera.fill': 'camera',
  'camera.rotate.fill': 'flip-camera-ios',
  'bolt.fill': 'flash-on',
  'bolt.slash.fill': 'flash-off',
  'slider.horizontal.3': 'filter-list',
  'line.horizontal.3': 'filter-list-off'
  'map.fill': 'map',
  'gear.circle.fill': 'settings',
  'location.fill': 'my-location',
  'pin.fill': 'person-pin-circle',
  'xmark': 'close',
  'arrow.down.circle' : 'file-download',
  'checkmark.circle' : 'file-download-done',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'eye.fill': 'visibility',
  'eye.slash.fill': 'visibility-off',
  'arrow.2.circlepath': 'refresh',
} as Partial<
  Record<
    import('expo-symbols').SymbolViewProps['name'],
    React.ComponentProps<typeof MaterialIcons>['name']
  >
>;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
