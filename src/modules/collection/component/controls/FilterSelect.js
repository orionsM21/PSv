// src/components/modals/controls/FilterSelect.js
import React from "react";
import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { MultiSelect } from "react-native-element-dropdown";

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
    <>
      {/* LABEL */}
      <Text style={styles.label}>{label}</Text>

      {/* MULTISELECT */}
      <MultiSelect
        search
        disabled={disabled}
        data={data}
        labelField={labelField}
        valueField={valueField}
        placeholder={`Select ${label}`}
        searchPlaceholder="Search..."
        value={value}
        onChange={onChange}

        // 🔥 important fix #1 – make space inside dropdown for chips
        style={[styles.dropdown, disabled && styles.dropdownDisabled]}

        placeholderStyle={styles.placeholder}
        itemTextStyle={styles.itemText}
        selectedStyle={styles.selectedItem}
        selectedTextStyle={styles.selectedText}

        // 🔥 important fix #2 – this forces chips to respect padding
        containerStyle={{ paddingHorizontal: 10, }}
        itemContainerStyle={{ paddingHorizontal: 10 }}

        // 🔥 important fix #3 – custom chip renderer stays aligned
        renderSelectedItem={(item, unSelect) => (
          <TouchableOpacity
            onPress={() => unSelect(item)}
            style={styles.chip}>
            <Text style={styles.chipText}>{item[labelField]}</Text>
          </TouchableOpacity>
        )}
      />

    </>
  );
}

const styles = StyleSheet.create({
  label: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "500",
    color: "#555",
    marginHorizontal: 12,
  },

  dropdown: {
    height: 48,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#ccc",
    marginHorizontal: 10,
    backgroundColor: "#fff",
    paddingHorizontal: 12,      // 🔥 Key fix to align chips properly
  },

  dropdownDisabled: {
    backgroundColor: "#eee",
    borderColor: "#d0d0d0",
  },

  dropdownContainer: {
    borderRadius: 10,
    paddingVertical: 6,
  },

  itemContainer: {
    paddingHorizontal: 12,
  },

  placeholder: {
    color: "#999",
    fontSize: 15,
  },

  itemText: {
    fontSize: 16,
    color: "#001D56",
    fontWeight: "500",
  },

  selectedItem: {
    backgroundColor: "#001D56",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 6,
    marginTop: 6,
    marginLeft: 0,
  },

  selectedText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },

  // 🔥 Best and cleanest chip style
  chip: {
    backgroundColor: "#001D56",
    // backgroundColor:'red',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 4,
    // marginLeft: 0,
    marginLeft: 8
  },

  chipText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
});
