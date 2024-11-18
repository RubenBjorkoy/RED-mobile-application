import * as Haptics from 'expo-haptics';

export default class Vibrate {
  static light() {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  static medium() {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }

  static heavy() {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  static rigid() {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
  }

  static soft() {
    return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
  }

  static error() {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  static success() {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  static warning() {
    return Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
}