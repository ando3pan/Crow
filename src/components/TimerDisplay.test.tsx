import React from 'react';
import { render } from '@testing-library/react-native';
import TimerDisplay, { formatRemaining } from './TimerDisplay';

test('formatRemaining pads seconds and shows mm:ss', () => {
  expect(formatRemaining(0)).toBe('00:00');
  expect(formatRemaining(5_000)).toBe('00:05');
  expect(formatRemaining(65_000)).toBe('01:05');
  expect(formatRemaining(25 * 60_000)).toBe('25:00');
});

test('renders formatted remaining time', async () => {
  const { getByTestId } = await render(<TimerDisplay remainingMs={65_000} />);
  expect(getByTestId('timer-display').props.children).toEqual('01:05');
});
