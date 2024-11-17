import { Vibration, Platform } from 'react-native';

export function vibrate(length: number) {
  if (Platform.OS === 'android') {
    Vibration.vibrate(length);
  } else if (Platform.OS === 'ios') {
    Vibration.vibrate([length], false);
  }
}