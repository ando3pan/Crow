import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Controls from './Controls';

test('shows Start and calls onStart when not running', async () => {
  const onStart = jest.fn();
  const { getByTestId, queryByTestId } = await render(
    <Controls isRunning={false} onStart={onStart} onPause={jest.fn()} onReset={jest.fn()} />
  );
  expect(queryByTestId('pause-button')).toBeNull();
  fireEvent.press(getByTestId('start-button'));
  expect(onStart).toHaveBeenCalledTimes(1);
});

test('shows Pause and calls onPause when running', async () => {
  const onPause = jest.fn();
  const { getByTestId, queryByTestId } = await render(
    <Controls isRunning={true} onStart={jest.fn()} onPause={onPause} onReset={jest.fn()} />
  );
  expect(queryByTestId('start-button')).toBeNull();
  fireEvent.press(getByTestId('pause-button'));
  expect(onPause).toHaveBeenCalledTimes(1);
});

test('reset button always calls onReset', async () => {
  const onReset = jest.fn();
  const { getByTestId } = await render(
    <Controls isRunning={false} onStart={jest.fn()} onPause={jest.fn()} onReset={onReset} />
  );
  fireEvent.press(getByTestId('reset-button'));
  expect(onReset).toHaveBeenCalledTimes(1);
});
