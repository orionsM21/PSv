// src/components/ChartSkeleton.js
import React from 'react';
import { View, StyleSheet } from 'react-native';

const ChartSkeleton = () => (
    <View style={styles.skeleton} />
);

export default ChartSkeleton;

const styles = StyleSheet.create({
    skeleton: {
        height: 220,
        borderRadius: 16,
        backgroundColor: '#E5E7EB',
    },
});
