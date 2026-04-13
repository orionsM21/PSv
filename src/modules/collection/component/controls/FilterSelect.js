import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';
import {MultiSelect} from 'react-native-element-dropdown';

export default function FilterSelect({
  label,
  data,
  value,
  onChange,
  labelField,
  valueField,
  disabled = false,
}) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>

      <MultiSelect
        search
        disabled={disabled}
        data={data}
        labelField={labelField}
        valueField={valueField}
        placeholder={`Select ${label}`}
        searchPlaceholder="Search options"
        value={value}
        onChange={onChange}
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}
        placeholderStyle={styles.placeholder}
        selectedTextStyle={styles.selectedText}
        itemTextStyle={styles.itemText}
        selectedStyle={styles.selectedItem}
        containerStyle={styles.dropdownContainer}
        itemContainerStyle={styles.itemContainer}
        renderSelectedItem={(item, unSelect) => (
          <TouchableOpacity onPress={() => unSelect(item)} style={styles.chip}>
            <Text style={styles.chipText}>{item[labelField]}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldWrap: {
    marginTop: 12,
  },
  label: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  dropdown: {
    minHeight: 54,
    borderWidth: 1,
    borderRadius: 18,
    borderColor: '#D8E6F8',
    backgroundColor: '#F8FBFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dropdownDisabled: {
    backgroundColor: '#EEF2F7',
    borderColor: '#D5DEE9',
  },
  dropdownContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D8E6F8',
    overflow: 'hidden',
  },
  itemContainer: {
    paddingHorizontal: 8,
  },
  placeholder: {
    color: '#94A3B8',
    fontSize: 14,
  },
  itemText: {
    fontSize: 15,
    color: '#0F172A',
    fontWeight: '600',
  },
  selectedItem: {
    backgroundColor: '#0B2D6C',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 6,
    marginTop: 6,
  },
  selectedText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  chip: {
    backgroundColor: '#0B2D6C',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
    marginTop: 6,
  },
  chipText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});
