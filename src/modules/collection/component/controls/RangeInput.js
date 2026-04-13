import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

export default function RangeInput({
  label,
  enabled,
  setEnabled,
  min,
  max,
  setMin,
  setMax,
}) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        onPress={() => setEnabled(!enabled)}
        style={[styles.toggle, enabled && styles.toggleActive]}>
        <Text style={[styles.toggleText, enabled && styles.toggleTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>

      <View style={styles.inputsRow}>
        <TextInput
          placeholder="Min"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          editable={enabled}
          value={min}
          onChangeText={setMin}
          style={[styles.input, !enabled && styles.inputDisabled]}
        />

        <TextInput
          placeholder="Max"
          placeholderTextColor="#94A3B8"
          keyboardType="numeric"
          editable={enabled}
          value={max}
          onChangeText={setMax}
          style={[styles.input, !enabled && styles.inputDisabled]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  toggle: {
    width: 96,
    minHeight: 48,
    borderRadius: 16,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  toggleActive: {
    backgroundColor: '#0B2D6C',
    borderColor: '#0B2D6C',
  },
  toggleText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  inputsRow: {
    flex: 1,
    flexDirection: 'row',
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#D8E6F8',
    borderRadius: 16,
    backgroundColor: '#F8FBFF',
    paddingHorizontal: 12,
    color: '#0F172A',
    marginLeft: 10,
  },
  inputDisabled: {
    backgroundColor: '#EEF2F7',
    color: '#94A3B8',
  },
});
