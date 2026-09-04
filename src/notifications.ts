import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';

export async function notifySessionComplete(finishedPhase: 'focus' | 'break'): Promise<void> {
  const content =
    finishedPhase === 'focus'
      ? { title: 'Focus session done!', body: 'The crow says it’s time for a break.' }
      : { title: 'Break’s over', body: 'The crow is ready to focus again.' };

  await Notifications.scheduleNotificationAsync({ content, trigger: null });
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
}
