import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function SectionTitle({title, subtitle}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 8,
  },
  title: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  subtitle: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
});
