import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

const getBorderColor = (confidence = 0) => {
  if (confidence >= 0.8) return '#2ecc71';   // green
  if (confidence >= 0.5) return '#f39c12';   // orange
  return '#e74c3c';                          // red
};

const OCRReviewScreen = ({ data = {}, onConfirm, onCancel }) => {
  // ✅ clone data into local editable state
  const [editableData, setEditableData] = useState(() =>
    JSON.parse(JSON.stringify(data))
  );

  const handleChange = (key, value) => {
    setEditableData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }));
  };

  const reviewedFields = useMemo(
    () => Object.entries(editableData),
    [editableData]
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OCR Review</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {reviewedFields.map(([key, field]) => (
          <View key={key} style={styles.fieldBlock}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>{key}</Text>
              <Text style={styles.confidence}>
                {Math.round((field.confidence || 0) * 100)}%
              </Text>
            </View>

            <TextInput
              value={field.value}
              onChangeText={(v) => handleChange(key, v)}
              style={[
                styles.input,
                { borderColor: getBorderColor(field.confidence) },
              ]}
              placeholder={`Enter ${key}`}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onConfirm(editableData)}
          style={styles.confirmBtn}
        >
          <Text style={styles.confirmText}>Confirm</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OCRReviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    color: '#555',
  },
  confidence: {
    fontSize: 11,
    color: '#999',
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 10,
    color: '#000',
    backgroundColor: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelBtn: {
    padding: 12,
  },
  confirmBtn: {
    padding: 12,
    backgroundColor: '#2ecc71',
    borderRadius: 6,
  },
  cancelText: {
    color: '#e74c3c',
    fontWeight: '600',
  },
  confirmText: {
    color: '#fff',
    fontWeight: '700',
  },
});
