import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  VehicleBadge,
  VehiclePanel,
  VehicleSectionHeader,
} from '../../components/VehicleUi';
import {withOpacity} from '../../theme/uiTheme';

export default function VehicleTaskList({tasks = [], theme, onSelectTask}) {
  return (
    <VehiclePanel theme={theme}>
      <VehicleSectionHeader
        title="Officer Work Queue"
        subtitle="High-priority follow-ups for KYC, credit, sanction, and disbursal."
        theme={theme}
      />

      {tasks.map((item, index) => (
        <Pressable
          key={item.id}
          onPress={() => onSelectTask?.(item)}
          style={[
            styles.taskCard,
            {
              backgroundColor: theme.surfaceAlt,
              borderColor: theme.borderColor,
            },
            index === tasks.length - 1 && styles.lastTaskCard,
          ]}>
          <View style={styles.taskHeader}>
            <View style={styles.taskIdWrap}>
              <Text style={[styles.taskId, {color: theme.accentStrong}]}>
                {item.id}
              </Text>
              <VehicleBadge
                label={item.stage}
                stage={item.stage}
                theme={theme}
              />
            </View>
            <VehicleBadge
              label={item.status}
              tone={
                item.status === 'Completed'
                  ? 'success'
                  : item.status === 'In Progress'
                  ? 'warning'
                  : 'danger'
              }
              theme={theme}
            />
          </View>

          <Text style={[styles.customerName, {color: theme.textPrimary}]}>
            {item.name}
          </Text>
          <Text style={[styles.taskText, {color: theme.textSecondary}]}>
            {item.task}
          </Text>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.priorityPill,
                {
                  backgroundColor: withOpacity(
                    theme.warning,
                    theme.isDark ? 0.18 : 0.1,
                  ),
                },
              ]}>
              <Ionicons name="flash-outline" size={14} color={theme.warning} />
              <Text style={[styles.priorityText, {color: theme.warning}]}>
                {item.priority} Priority
              </Text>
            </View>

            <Text style={[styles.etaText, {color: theme.textMuted}]}>
              {item.eta}
            </Text>
          </View>
        </Pressable>
      ))}
    </VehiclePanel>
  );
}

const styles = StyleSheet.create({
  taskCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  lastTaskCard: {
    marginBottom: 0,
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  taskIdWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  taskId: {
    fontSize: 12,
    fontWeight: '800',
    marginRight: 8,
  },
  customerName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  taskText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priorityPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  etaText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
