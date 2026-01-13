// 📁 components/VerificationSectionComponent.js

import React from 'react';
import { View, Text, TextInput, StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const ApplicationDetails = ({
    title,
    fields = [],
    columns = 2,
    spacing = 10,
    isEditable = false,
    style,
}) => {
    // 🔍 Automatically adjust columns based on screen width
    const dynamicColumns = width < 380 ? 1 : columns; // small phones → 1 column

    const renderTextField = (
        label,
        value,
        editable = true,
        placeholder = '',
        keyboardType = 'default',
        required = true
    ) => {
        return (
            <View style={styles.formGroup}>
                <Text style={styles.label}>
                    {label} {required && <Text style={styles.required}>*</Text>}
                </Text>
                <TextInput
                    style={[
                        styles.input,
                        !editable && styles.disabledInput,
                        {
                            height: 'auto',
                            textAlignVertical: 'center',
                            flexWrap: 'wrap',
                        },
                    ]}
                    value={value || ''}
                    editable={editable}
                    placeholder={placeholder}
                    placeholderTextColor="#888"
                    keyboardType={keyboardType}
                    multiline
                    scrollEnabled={false}
                />
            </View>
        );
    };

    const renderRows = (fields, columns, spacing) => {
        if (!fields || fields.length === 0) return null;

        const rows = [];
        for (let i = 0; i < fields.length; i += columns) {
            const rowFields = fields.slice(i, i + columns);
            const isSingle = rowFields.length === 1;

            rows.push(
                <View
                    key={i}
                    style={[styles.row, { flexDirection: 'row', justifyContent: 'space-between' }]}
                >
                    {rowFields.map((field, idx) => (
                        <View
                            key={idx}
                            style={{
                                flex: isSingle ? 1 : 1 / columns,
                                paddingHorizontal: spacing / 2,
                            }}
                        >
                            {renderTextField(
                                field.label,
                                field.value,
                                isEditable,
                                field.placeholder || '',
                                field.keyboardType || 'default',
                                field.required ?? false
                            )}
                        </View>
                    ))}

                    {/* fill empty column space if not complete row */}
                    {!isSingle &&
                        rowFields.length < columns &&
                        Array(columns - rowFields.length)
                            .fill(null)
                            .map((_, idx) => (
                                <View
                                    key={`empty-${idx}`}
                                    style={{ flex: 1 / columns, paddingHorizontal: spacing / 2 }}
                                />
                            ))}
                </View>
            );
        }

        return rows;
    };

    return (
        <View style={[styles.sectionWrapper, style]}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {renderRows(fields, dynamicColumns, spacing)}
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: width < 380 ? 17 : 20,
        fontWeight: 'bold',
        color: '#007BFFBB',
        marginBottom: 16,
        alignItems: 'center',
        // backgroundColor:'pink',
        textAlign: 'center'
    },
    sectionWrapper: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 18,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 3,
        marginVertical: 10,
        paddingHorizontal: 10
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    formGroup: {
        flex: 1,
        marginVertical: 5,
    },
    label: {
        fontSize: width < 380 ? 12 : 13,
        fontWeight: '500',
        color: '#444',
        marginBottom: 4,
        flexWrap: 'wrap',
        maxWidth: '90%',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        color: '#000',
        fontSize: width < 380 ? 12 : 13,
        width: '100%',
        minHeight: 36,
    },
    disabledInput: {
        backgroundColor: '#f3f3f3',
        color: '#555',
    },
    required: {
        color: 'red',
    },
});

export default ApplicationDetails;
