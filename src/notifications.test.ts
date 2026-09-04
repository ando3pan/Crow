import * as Notifications from 'expo-notifications';
import * as Haptics from 'expo-haptics';
import { notifySessionComplete } from './notifications';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  setNotificationChannelAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  AndroidImportance: { DEFAULT: 3 },
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
}));
jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

beforeEach(() => {
  jest.clearAllMocks();
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
});

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

test('does not schedule a notification when permission is denied, but still fires the haptic', async () => {
  (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
  (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
  await notifySessionComplete('focus');
  expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
});

test('still fires the haptic if scheduling the notification throws', async () => {
  (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(new Error('boom'));
  await notifySessionComplete('focus');
  expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
});
