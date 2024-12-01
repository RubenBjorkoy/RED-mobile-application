/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/Colors';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const colorFromProps = props["dark"];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors["dark"][colorName];
  }
}
