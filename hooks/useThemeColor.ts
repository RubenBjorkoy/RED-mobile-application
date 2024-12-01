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
