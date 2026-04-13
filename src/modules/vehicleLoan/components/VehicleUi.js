import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {getBadgePalette, getStageTone, withOpacity} from '../theme/uiTheme';

export function VehiclePanel({children, style, theme}) {
  return (
    <View
      style={[
        styles.panel,
        {
          backgroundColor: theme.surface,
          borderColor: theme.borderColor,
        },
        theme.shadow,
        style,
      ]}>
      {children}
    </View>
  );
}

export function VehicleSectionHeader({
  title,
  subtitle,
  actionLabel,
  onActionPress,
  theme,
}) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionCopy}>
        <Text style={[styles.sectionTitle, {color: theme.textPrimary}]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[styles.sectionSubtitle, {color: theme.textSecondary}]}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {actionLabel ? (
        <Pressable
          onPress={onActionPress}
          style={[
            styles.linkButton,
            {
              backgroundColor: withOpacity(
                theme.accent,
                theme.isDark ? 0.18 : 0.1,
              ),
            },
          ]}>
          <Text style={[styles.linkButtonText, {color: theme.accentStrong}]}>
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function VehicleBadge({label, theme, tone, stage}) {
  const palette = getBadgePalette(theme, tone || getStageTone(stage || label));

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
        },
      ]}>
      <Text style={[styles.badgeText, {color: palette.color}]}>{label}</Text>
    </View>
  );
}

export function VehicleMetricPill({label, value, theme}) {
  return (
    <View
      style={[
        styles.metricPill,
        {
          backgroundColor: withOpacity(
            theme.textInverse,
            theme.isDark ? 0.14 : 0.12,
          ),
        },
      ]}>
      <Text style={[styles.metricValue, {color: theme.textInverse}]}>
        {value}
      </Text>
      <Text
        style={[
          styles.metricLabel,
          {color: withOpacity(theme.textInverse, 0.72)},
        ]}>
        {label}
      </Text>
    </View>
  );
}

export function VehicleInfoRow({icon, label, value, theme, isLast}) {
  return (
    <View
      style={[
        styles.infoRow,
        !isLast && styles.infoRowDivider,
        !isLast && {borderBottomColor: theme.borderColor},
      ]}>
      <View style={styles.infoLabelWrap}>
        <View
          style={[
            styles.infoIcon,
            {
              backgroundColor: withOpacity(
                theme.accent,
                theme.isDark ? 0.2 : 0.1,
              ),
            },
          ]}>
          <Ionicons name={icon} size={14} color={theme.accentStrong} />
        </View>
        <Text style={[styles.infoLabel, {color: theme.textSecondary}]}>
          {label}
        </Text>
      </View>
      <Text style={[styles.infoValue, {color: theme.textPrimary}]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionCopy: {
    flex: 1,
    paddingRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 19,
  },
  linkButton: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
  },
  linkButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  metricPill: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginRight: 10,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoRow: {
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRowDivider: {
    borderBottomWidth: 1,
  },
  infoLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
  },
  infoIcon: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '700',
  },
});
