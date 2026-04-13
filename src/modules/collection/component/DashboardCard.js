import React, {memo} from 'react';
import {View, Text, TouchableOpacity, Image, StyleSheet} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  scale,
  verticalScale,
  moderateScale,
  ms,
} from 'react-native-size-matters';

const formatCardValue = value => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }

  if (typeof value === 'number') {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
    }).format(value);
  }

  const parsedValue = Number(value);
  if (!Number.isNaN(parsedValue)) {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: Number.isInteger(parsedValue) ? 0 : 2,
    }).format(parsedValue);
  }

  return value;
};

const DashboardCard = ({
  icon,
  value,
  label,
  subLabel,
  onPress,
  disabled,
  valueColor = '#111',
  accentColor = '#0B2D6C',
  helperText,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      disabled={disabled}
      onPress={onPress}
      style={[styles.card, disabled && styles.cardDisabled]}>
      <LinearGradient
        colors={['#FFFFFF', '#F7FAFF']}
        style={styles.actionButton}>
        <View style={[styles.accentLine, {backgroundColor: accentColor}]} />

        <View style={styles.headerRow}>
          <View
            style={[styles.iconWrap, {backgroundColor: `${accentColor}14`}]}>
            {icon ? (
              <Image
                source={icon}
                style={[styles.icon, {tintColor: accentColor}]}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.dot, {backgroundColor: accentColor}]} />
            )}
          </View>

          {onPress ? (
            <Text style={[styles.tapHint, {color: accentColor}]}>Open</Text>
          ) : (
            <Text style={styles.tapHintMuted}>Snapshot</Text>
          )}
        </View>

        <View style={styles.content}>
          <Text numberOfLines={1} style={[styles.value, {color: valueColor}]}>
            {formatCardValue(value)}
          </Text>

          <Text numberOfLines={2} style={styles.label}>
            {label}
          </Text>

          {subLabel ? (
            <Text numberOfLines={1} style={styles.subLabel}>
              {subLabel}
            </Text>
          ) : null}

          {helperText ? (
            <Text numberOfLines={2} style={styles.helperText}>
              {helperText}
            </Text>
          ) : null}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

export default memo(DashboardCard);

const styles = StyleSheet.create({
  card: {
    width: '48.2%',
    marginBottom: moderateScale(10),
  },
  cardDisabled: {
    opacity: 0.7,
  },
  actionButton: {
    width: '100%',
    minHeight: verticalScale(146),
    paddingVertical: scale(12),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(20),
    borderWidth: 1,
    borderColor: '#E6EDF8',
    overflow: 'hidden',
    shadowColor: '#0B214A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: verticalScale(4),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconWrap: {
    width: scale(34),
    height: scale(34),
    borderRadius: scale(17),
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: scale(18),
    height: scale(18),
  },
  dot: {
    width: scale(10),
    height: scale(10),
    borderRadius: scale(5),
  },
  tapHint: {
    fontSize: ms(10),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  tapHintMuted: {
    fontSize: ms(10),
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  content: {
    marginTop: verticalScale(14),
  },
  value: {
    fontSize: ms(20),
    fontWeight: '800',
  },
  label: {
    marginTop: verticalScale(10),
    fontSize: ms(13),
    fontWeight: '700',
    color: '#0F172A',
    width: '100%',
  },
  subLabel: {
    marginTop: verticalScale(4),
    fontSize: ms(10),
    color: '#64748B',
    width: '100%',
  },
  helperText: {
    marginTop: verticalScale(8),
    fontSize: ms(10),
    color: '#94A3B8',
    lineHeight: ms(14),
    width: '100%',
  },
});
