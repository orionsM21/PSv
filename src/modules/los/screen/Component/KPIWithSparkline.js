// components/ui/KPIWithSparkline.js
import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import Sparkline from './Sparkline';

const KPI = ({ icon, label, count, trendData = [], onPress }) => {
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {icon && <Image source={icon} style={styles.icon} />}
          <View style={{ marginLeft: 8 }}>
            <Text style={styles.count}>{count ?? 0}</Text>
            <Text style={styles.label}>{label}</Text>
          </View>
        </View>
        <Sparkline data={trendData} width={64} height={22} stroke="#2E86DE" />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  icon: { width: 36, height: 36, resizeMode: 'contain' },
  count: { fontSize: 20, fontWeight: '800', color: '#2196F3' },
  label: { fontSize: 13, color: '#444', marginTop: 4 },
});

export default memo(KPI);
