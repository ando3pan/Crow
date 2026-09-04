import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

let androidChannelConfigured = false;

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android' || androidChannelConfigured) return;
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Loaf & Focus',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  androidChannelConfigured = true;
}

async function ensurePermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function notifySessionComplete(finishedPhase: 'focus' | 'break'): Promise<void> {
  const content =
    finishedPhase === 'focus'
      ? { title: 'Focus session done!', body: 'The crow says it’s time for a break.' }
      : { title: 'Break’s over', body: 'The crow is ready to focus again.' };

  try {
    await ensureAndroidChannel();
    const granted = await ensurePermissions();
    if (granted) {
      await Notifications.scheduleNotificationAsync({ content, trigger: null });
    }
  } catch (error) {
    console.warn('Failed to schedule completion notification', error);
  }

  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.warn('Failed to trigger completion haptic', error);
  }
}
