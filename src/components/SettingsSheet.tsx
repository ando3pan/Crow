import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable } from 'react-native';

export interface SettingsSheetProps {
  visible: boolean;
  focusMinutes: number;
  breakMinutes: number;
  onClose: () => void;
  onSave: (focusMinutes: number, breakMinutes: number) => void;
}

export default function SettingsSheet({
  visible,
  focusMinutes,
  breakMinutes,
  onClose,
  onSave,
}: SettingsSheetProps) {
  const [focusText, setFocusText] = useState(String(focusMinutes));
  const [breakText, setBreakText] = useState(String(breakMinutes));

  useEffect(() => {
    setFocusText(String(focusMinutes));
    setBreakText(String(breakMinutes));
  }, [focusMinutes, breakMinutes, visible]);

  const focusValue = Number(focusText);
  const breakValue = Number(breakText);
  const isValid =
    Number.isFinite(focusValue) && focusValue > 0 && Number.isFinite(breakValue) && breakValue > 0;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ marginTop: 'auto', backgroundColor: 'white', padding: 24, gap: 12 }}>
        <Text>Focus minutes</Text>
        <TextInput
          testID="focus-minutes-input"
          keyboardType="numeric"
          value={focusText}
          onChangeText={setFocusText}
        />
        <Text>Break minutes</Text>
        <TextInput
          testID="break-minutes-input"
          keyboardType="numeric"
          value={breakText}
          onChangeText={setBreakText}
        />
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Pressable
            testID="save-settings-button"
            disabled={!isValid}
            onPress={() => {
              if (isValid) onSave(focusValue, breakValue);
            }}
          >
            <Text>Save</Text>
          </Pressable>
          <Pressable testID="close-settings-button" onPress={onClose}>
            <Text>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
