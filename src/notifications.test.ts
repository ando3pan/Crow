import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { notifySessionComplete } from './notifications';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));

test('notifies with a focus-complete message and fires a haptic', async () => {
  await notifySessionComplete('focus');
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
    expect.objectContaining({
      content: expect.objectContaining({ title: expect.stringContaining('Focus') }),
      trigger: null,
    })
  );
  expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
});

test('notifies with a break-complete message', async () => {
  await notifySessionComplete('break');
  expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
    expect.objectContaining({
      content: expect.objectContaining({ title: expect.stringContaining('Break') }),
      trigger: null,
    })
  );
});
