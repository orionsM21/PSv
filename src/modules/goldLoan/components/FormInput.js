import React, { memo } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const FormInput = memo(({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    editable = true,
    maxLength,
    error,
}) => {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                keyboardType={keyboardType}
                editable={editable}
                maxLength={maxLength}
                style={[
                    styles.input,
                    !editable && styles.disabled,
                    error && styles.errorBorder,
                ]}
            />

            {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
});

export default FormInput;

const styles = StyleSheet.create({
    container: {
        marginBottom: 14,
    },
    label: {
        fontSize: 13,
        marginBottom: 6,
        color: '#333',
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#000',
    },
    disabled: {
        backgroundColor: '#F2F2F2',
    },
    errorBorder: {
        borderColor: 'red',
    },
    errorText: {
        marginTop: 4,
        fontSize: 11,
        color: 'red',
    },
});
