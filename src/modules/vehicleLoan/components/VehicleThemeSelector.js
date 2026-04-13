import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';

import {setUITheme} from '../../../redux/moduleSlice';
import {VEHICLE_THEME_OPTIONS, withOpacity} from '../theme/uiTheme';

export default function VehicleThemeSelector({theme}) {
  const dispatch = useDispatch();
  const activeTheme = useSelector(state => state.module.uiTheme);

  return (
    <View>
      <Text style={[styles.title, {color: theme.textPrimary}]}>
        Visual Preset
      </Text>
      <Text style={[styles.subtitle, {color: theme.textSecondary}]}>
        Keep the full vehicle flow in one style while switching between
        demo-ready presets.
      </Text>

      <View style={styles.row}>
        {VEHICLE_THEME_OPTIONS.map(option => {
          const active = option.id === activeTheme;

          return (
            <Pressable
              key={option.id}
              onPress={() => dispatch(setUITheme(option.id))}
              style={[
                styles.chip,
                {
                  backgroundColor: active
                    ? withOpacity(
                        theme.accentStrong,
                        theme.isDark ? 0.22 : 0.12,
                      )
                    : theme.surfaceAlt,
                  borderColor: active
                    ? withOpacity(theme.accentStrong, 0.36)
                    : theme.borderColor,
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  {color: active ? theme.accentStrong : theme.textSecondary},
                ]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
