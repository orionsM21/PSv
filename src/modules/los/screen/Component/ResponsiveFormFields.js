import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions, useColorScheme, UIManager, Platform, LayoutAnimation } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { scale, moderateScale, verticalScale } from 'react-native-size-matters';
// const { width } = Dimensions.get('window');
// const scale = width / 380; // Base width for scaling

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}
const { width } = Dimensions.get('window');
// --- Text Field ---
const BASE_INPUT_HEIGHT = verticalScale(35);
const AUTO_MULTILINE_THRESHOLD = 40; // 🧠 characters after which we expand
export const RenderTextField = ({
  label,
  value,
  onChange,
  editable = true,
  placeholder = '',
  numeric = false,
  maxLength,
  isEditable = true,
  required = true,
  multiline: multilineProp, // optional manual override
}) => {
  const fieldEditable = editable && isEditable;
  const [inputHeight, setInputHeight] = useState(BASE_INPUT_HEIGHT);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isMultiline, setIsMultiline] = useState(!!multilineProp);


  const colors = {
    text: isDark ? '#F3F3F3' : '#000',
    placeholder: isDark ? '#AAA' : '#888',
    border: isDark ? '#666' : '#CCC',
    background: isDark ? '#1C1C1C' : '#FFF',
    disabledBg: isDark ? '#2A2A2A' : '#F3F3F3',
  };

  // 🧠 Auto-detect multiline based on value length or line breaks
  // useEffect(() => {
  //   const shouldBeMultiline =
  //     multilineProp ||
  //     (typeof value === 'string' &&
  //       (value.length > AUTO_MULTILINE_THRESHOLD || value.includes('\n')));

  //   if (shouldBeMultiline !== isMultiline) {
  //     LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  //     setIsMultiline(shouldBeMultiline);
  //   }
  // }, [value, multilineProp, isMultiline]);
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>

      <TextInput
        style={[
          styles.fieldBase,
          styles.input,
          !fieldEditable && styles.disabledField,
          // {
          //   // minHeight: BASE_INPUT_HEIGHT,
          //   // height: isMultiline ? Math.max(BASE_INPUT_HEIGHT, inputHeight) : BASE_INPUT_HEIGHT,
          //   textAlignVertical: isMultiline ? 'top' : 'center',
          //   paddingTop: isMultiline ? verticalScale(6) : verticalScale(8),
          //   // paddingBottom: verticalScale(8),
          // color: colors.text,
          // borderColor: colors.border,
          // backgroundColor: fieldEditable ? colors.background : colors.disabledBg,
          // },
          {
            height: 'auto',
            textAlignVertical: 'center',
            flexWrap: 'wrap',
            borderColor: colors.border,
            color: colors.text,
            backgroundColor: fieldEditable ? colors.background : colors.disabledBg,
          },
        ]}
        value={String(value ?? '')}
        onChangeText={(text) => {
          if (numeric) onChange(text.replace(/[^0-9]/g, ''));
          else onChange(text);
        }}
        editable={fieldEditable}
        placeholder={placeholder}
        placeholderTextColor={colors.placeholder}
        keyboardType={numeric ? 'numeric' : 'default'}
        multiline={isMultiline}
        scrollEnabled={isMultiline}
        maxLength={maxLength}
      // onContentSizeChange={
      //   isMultiline
      //     ? (e) => {
      //       const newHeight = e.nativeEvent.contentSize.height + verticalScale(6);
      //       if (Math.abs(newHeight - inputHeight) > 2) {
      //         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      //         setInputHeight(newHeight);
      //       }
      //     }
      //     : undefined
      // }
      />
    </View>
  );
};

export const RenderDropdownField = ({
  label,
  data = [],
  value,
  onChange,
  placeholder = '',
  disabled = false,
  isEditable = true,
  enableSearch = true,
  required = true,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const fieldDisabled = disabled || !isEditable;

  const dropdownRef = React.useRef(null);

  const colors = {
    text: isDark ? '#F3F3F3' : '#000',
    placeholder: isDark ? '#333' : '#888',
    border: isDark ? '#666' : '#CCC',
    background: isDark ? '#1C1C1C' : '#FFF',
    dropdownItemBg: isDark ? '#2C2C2C' : '#FFF',
    disabledBg: isDark ? '#2A2A2A' : '#F3F3F3',
    searchTextColor: isDark ? '#FFF' : '#000',
    searchBg: isDark ? '#1C1C1C' : '#FFF',
  };

  // 💡 Fix for invisible typed text in dark mode:
  React.useEffect(() => {
    const input = dropdownRef.current?._search || dropdownRef.current?._textInput;
    if (input?.setNativeProps) {
      input.setNativeProps({
        style: {
          color: colors.searchTextColor,
          backgroundColor: colors.searchBg,
        },
      });
    }
  }, [isDark]);

  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}>*</Text>}
      </Text>

      <Dropdown
        ref={dropdownRef}
        data={data}
        labelField="label"
        valueField="value"
        value={value}
        onChange={onChange}
        style={[
          styles.fieldBase,
          styles.dropdown,
          { backgroundColor: colors.background, borderColor: colors.border },
          fieldDisabled && { backgroundColor: colors.disabledBg },
        ]}
        placeholder={placeholder || `Select ${label}`}
        selectedTextStyle={[styles.selectedTextStyle, { color: colors.text }]}
        itemTextStyle={[styles.itemTextStyle, { color: colors.text }]}
        disabled={fieldDisabled}
        search
        searchPlaceholder="Search..."
        searchPlaceholderTextColor={colors.placeholder}
        searchTextInputStyle={[
          styles.searchInputStyle,
          {
            color: colors.searchTextColor,
            backgroundColor: colors.searchBg,
            borderColor: colors.border,
            borderWidth: 1,
            borderRadius: 6,
          },
        ]}
        placeholderStyle={[
          styles.placeholderStyle,
          { color: colors.placeholder },
        ]}
        renderItem={(item) => (
          <View style={[styles.dropdownItem, { backgroundColor: colors.dropdownItemBg }]}>
            <Text style={[styles.dropdownItemText, { color: colors.text }]}>{item.label}</Text>
          </View>
        )}
      />
    </View>
  );
};


// --- Unified Styles ---
export const styles = StyleSheet.create({
  // 🔹 Container for each field
  formGroup: {
    flex: 1,
    marginVertical: verticalScale(5),
  },

  // 🔹 Field label
  label: {
    fontSize: moderateScale(12),
    fontWeight: '500',
    color: '#444',
    marginBottom: verticalScale(4),
    flexWrap: 'wrap',
    maxWidth: '90%',
  },

  // 🔹 Required asterisk
  required: {
    color: 'red',
  },

  // 🔹 Common base for input fields
  fieldBase: {
    borderWidth: 1,
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(10),
    fontSize: moderateScale(12),
    width: '95%',
    minHeight: verticalScale(35),
    justifyContent: 'center',
    alignItems: 'center'
  },

  // 🔹 Text input specific
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    // color: '#000',
    fontSize: width < 380 ? 12 : 13,
    // width: '100%',
    minHeight: 36,
  },

  // 🔹 Disabled field style
  disabledField: {
    backgroundColor: '#f3f3f3',
    color: '#555',
  },

  // 🔹 Dropdown field container
  dropdown: {
    // minHeight: verticalScale(45),
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(10),
  },

  // 🔹 Placeholder (dropdown or input)
  placeholderStyle: {
    fontSize: moderateScale(13),
    color: '#888',
    flexWrap: 'wrap',
    flexShrink: 1,
  },

  // 🔹 Selected text in dropdown
  selectedTextStyle: {
    fontSize: moderateScale(13),
    color: '#000',
    flexWrap: 'wrap',
  },

  // 🔹 Dropdown item text
  itemTextStyle: {
    fontSize: moderateScale(13),
    color: '#222',
  },

  // 🔹 Dropdown item container
  dropdownItem: {
    paddingVertical: verticalScale(8),
    paddingHorizontal: scale(10),
  },

  // 🔹 Dropdown item text (inside item)
  dropdownItemText: {
    fontSize: moderateScale(13),
    color: '#333',
  },

  // 🔹 Search box inside dropdown (for searchable dropdowns)
  searchInputStyle: {
    fontSize: moderateScale(13),
    borderWidth: 1,
    borderRadius: moderateScale(6),
    paddingHorizontal: scale(8),
    marginHorizontal: scale(6),
    marginVertical: verticalScale(6),
    backgroundColor: '#FFF',
    color: '#444',
  },
});

export default styles;
