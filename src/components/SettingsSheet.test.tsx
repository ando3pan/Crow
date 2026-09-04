import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SettingsSheet from './SettingsSheet';

test('saves edited minute values as numbers', async () => {
  const onSave = jest.fn();
  const { getByTestId } = await render(
    <SettingsSheet
      visible={true}
      focusMinutes={25}
      breakMinutes={5}
      onClose={jest.fn()}
      onSave={onSave}
    />
  );
  await fireEvent.changeText(getByTestId('focus-minutes-input'), '15');
  await fireEvent.changeText(getByTestId('break-minutes-input'), '3');
  await fireEvent.press(getByTestId('save-settings-button'));
  expect(onSave).toHaveBeenCalledWith(15, 3);
});

test('close button calls onClose', async () => {
  const onClose = jest.fn();
  const { getByTestId } = await render(
    <SettingsSheet
      visible={true}
      focusMinutes={25}
      breakMinutes={5}
      onClose={onClose}
      onSave={jest.fn()}
    />
  );
  await fireEvent.press(getByTestId('close-settings-button'));
  expect(onClose).toHaveBeenCalledTimes(1);
});
