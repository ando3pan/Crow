import React from 'react';
import { render } from '@testing-library/react-native';
import CrowDisplay from './CrowDisplay';

const idleSource = require('../../assets/crow/idle.png');
const focusSource = require('../../assets/crow/focus.png');
const breakSource = require('../../assets/crow/break.png');
const completeSource = require('../../assets/crow/complete.png');

test.each([
  ['idle', idleSource],
  ['focus', focusSource],
  ['break', breakSource],
  ['complete', completeSource],
] as const)('renders the %s pose', async (phase, expectedSource) => {
  const { getByTestId } = await render(<CrowDisplay phase={phase} />);
  expect(getByTestId('crow-image').props.source).toBe(expectedSource);
});
