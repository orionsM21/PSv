// src/components/AppButton.js
import React from 'react';
import {
  TouchableOpacity,
  Dimensions,
  Text,
  StyleSheet,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';

const { width } = Dimensions.get('screen');

/* ================= BUTTON ================= */

export const Button = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}) => {
  const bgColor = {
    primary: '#2563EB',
    secondary: '#E2E8F0',
    danger: '#DC2626',
    outline: 'transparent',
  }[variant];

  const textColor = variant === 'outline' ? '#2563EB' : '#fff';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled || loading}
      accessibilityRole="button"
      style={[
        styles.button,
        {
          backgroundColor: bgColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          borderColor: '#2563EB',
          opacity: disabled ? 0.6 : 1,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

/* ================= INPUT ================= */

export const InputField = ({
  placeholder,
  secureTextEntry,
  keyboardType,
  value,
  onChangeText,
  style,
}) => {
  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={[styles.input, style]}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

/* ================= CARD ================= */

export const Card = ({ title, children, style, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={onPress}
      style={[styles.card, style]}
    >
      {title && <Text style={styles.cardTitle}>{title}</Text>}
      {children}
    </TouchableOpacity>
  );
};

/* ================= SECTION TITLE ================= */

export const SectionTitle = ({ title, style }) => {
  return <Text style={[styles.sectionTitle, style]}>{title}</Text>;
};

/* ================= HOME BUTTON ================= */

export const HOmeScreenButton = ({
  title,
  onPress,
  variant = 'primary',
}) => {
  const bg = variant === 'primary' ? '#2563EB' : '#E5E7EB';
  const color = variant === 'primary' ? '#fff' : '#1F2937';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.homeButton,
        { backgroundColor: bg },
      ]}
    >
      <Text style={[styles.homeButtonText, { color }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
  /* ===== BUTTON ===== */
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  /* ===== INPUT ===== */
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#fff',
    color: '#0F172A',
  },

  /* ===== CARD ===== */
  card: {
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },

  /* ===== SECTION ===== */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 12,
  },

  /* ===== HOME BUTTON ===== */
  homeButton: {
    height: 46,
    width: width * 0.42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
