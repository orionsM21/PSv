// ReportTable.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const ReportTable = ({ title, headers, rows }) => {
  if (!rows?.length) return null;

  return (
    <View style={styles.tableContainer}>
      {title && <Text style={styles.tableTitle}>{title}</Text>}

      {/* Header Row */}
      <View style={styles.headerRow}>
        {headers.map((header, i) => (
          <Text key={i} style={[styles.cell, styles.headerCell]}>
            {header}
          </Text>
        ))}
      </View>

      {/* Data Rows */}
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.dataRow}>
          {row.map((cell, colIndex) => (
            <Text key={colIndex} style={styles.cell}>
              {cell ?? '-'}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    marginBottom: verticalScale(10),
    borderRadius: moderateScale(4),
    overflow: 'hidden',
  },
  tableTitle: {
    backgroundColor: '#F3F4F6',
    fontWeight: '700',
    fontSize: moderateScale(12),
    color: '#111',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
  },
  headerCell: {
    fontWeight: '600',
    backgroundColor: '#E5E7EB',
  },
  dataRow: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    fontSize: moderateScale(10),
    color: '#333',
    borderRightWidth: 1,
    borderColor: '#D1D5DB',
    paddingVertical: verticalScale(6),
    paddingHorizontal: scale(6),
  },
});

export default ReportTable;
