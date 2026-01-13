import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    Modal,
    Platform, Dimensions
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Dropdown } from 'react-native-element-dropdown';
const { width, height } = Dimensions.get('window')
const GlassDropdown = ({
    label,
    data,
    selectedValue,
    onChange,
    placeholder,
    isRequired = true,
    hideAsterisk = false,
}) => {
    return (
        <View style={styles.wrapper}>

            {/* Floating Label */}
            {(selectedValue || false) && (
                <Text style={styles.floatingLabel}>
                    {label}
                    {isRequired && !hideAsterisk && <Text style={styles.required}>*</Text>}
                </Text>
            )}

            <LinearGradient
                colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.06)"]}
                style={styles.glassBox}
            >
                <Dropdown
                    style={styles.dropdown}
                    data={data}
                    labelField="label"
                    valueField="value"
                    value={selectedValue}
                    placeholder={placeholder || label}
                    placeholderStyle={styles.placeholderStyle}
                    selectedTextStyle={styles.selectedTextStyle}
                    itemTextStyle={styles.itemTextStyle}
                    search
                    searchPlaceholder="Search..."
                    onChange={(item) => onChange(item)}
                />
            </LinearGradient>
        </View>
    );
};


export default GlassDropdown;

const styles = StyleSheet.create({
    wrapper: {
        width: "100%",            // FULL WIDTH → consistent across devices
        marginVertical: 6,
    },

    floatingLabel: {
        fontSize: 13,
        color: "#333",
        opacity: 0.8,
        marginBottom: 6,
        fontWeight: "600",
    },

    required: {
        color: "#ff6b6b",
    },

    glassBox: {
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.20)",
        ...Platform.select({
            ios: { backdropFilter: "blur(14px)" },
            android: {},
        }),
    },

    dropdown: {
        height: height * 0.06,
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6
    },

    placeholderStyle: {
        color: "#666",
        fontSize: 14,
    },

    selectedTextStyle: {
        color: "#888",
        fontSize: 15,
        fontWeight: "500",
    },

    itemTextStyle: {
        color: "#000",
        fontSize: 14,
    },
});
