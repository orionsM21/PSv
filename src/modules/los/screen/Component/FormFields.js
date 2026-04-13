import React from 'react';
import { View, Text, TextInput, StyleSheet, useColorScheme } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';

export const TextField = React.memo(({
    label,
    value,
    onChange,
    editable = true,
    placeholder = '',
    numeric = false,
    isEditable = true,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const fieldEditable = editable && isEditable;

    const dynamicStyles = getDynamicStyles(isDark);

    return (
        <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>{label}</Text>
            <TextInput
                style={[
                    dynamicStyles.input,
                    !fieldEditable && dynamicStyles.disabledInput,
                ]}
                value={value || ''}
                onChangeText={onChange}
                editable={fieldEditable}
                placeholder={placeholder}
                placeholderTextColor={isDark ? '#aaa' : '#888'}
                keyboardType={numeric ? 'numeric' : 'default'}
            />
        </View>
    );
});


export const DropdownField = React.memo(({
    label,
    data,
    value,
    onChange,
    placeholder = '',
    disabled = false,
    isEditable = true,
}) => {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';
    const fieldDisabled = disabled || !isEditable;

    const dynamicStyles = getDynamicStyles(isDark);

    return (
        <View style={dynamicStyles.formGroup}>
            <Text style={dynamicStyles.label}>{label}</Text>
            <Dropdown
                data={data}
                labelField="label"
                valueField="value"
                value={value}
                onChange={onChange}
                style={[
                    dynamicStyles.dropdown,
                    fieldDisabled && dynamicStyles.disabledInput,
                ]}
                placeholder={placeholder || `Select ${label}`}
                placeholderStyle={{ color: isDark ? '#aaa' : '#888' }}
                selectedTextStyle={{ color: isDark ? '#fff' : '#000' }}
                disabled={fieldDisabled}
                renderItem={(item) => (
                    <View style={dynamicStyles.dropdownItem}>
                        <Text style={dynamicStyles.dropdownItemText}>{item.label}</Text>
                    </View>
                )}
            />
        </View>
    );
});


// ------------------ DYNAMIC STYLES ------------------
const getDynamicStyles = (isDark) =>
    StyleSheet.create({
        formGroup: {
            marginBottom: 12,
        },
        label: {
            fontSize: 14,
            fontWeight: '600',
            color: isDark ? '#fff' : '#333',
            marginBottom: 4,
        },
        input: {
            borderWidth: 1,
            borderColor: isDark ? '#555' : '#ccc',
            borderRadius: 8,
            padding: 10,
            fontSize: 14,
            color: isDark ? '#fff' : '#000',
            backgroundColor: isDark ? '#222' : '#fff',
        },
        disabledInput: {
            backgroundColor: isDark ? '#333' : '#f0f0f0',
            color: isDark ? '#aaa' : '#666',
        },
        dropdown: {
            borderWidth: 1,
            borderColor: isDark ? '#555' : '#ccc',
            borderRadius: 8,
            paddingHorizontal: 10,
            height: 45,
            justifyContent: 'center',
            backgroundColor: isDark ? '#222' : '#fff',
        },
        dropdownItem: {
            padding: 10,
            backgroundColor: isDark ? '#111' : '#fff',
        },
        dropdownItemText: {
            fontSize: 14,
            color: isDark ? '#fff' : '#333',
        },
    });
