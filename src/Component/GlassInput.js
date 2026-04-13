import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Platform } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const GlassInput = ({ label, value, onChange, placeholder, required, editable = true }) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={styles.wrapper}>
            {/* Floating Label */}
            {value?.length > 0 || focused ? (
                <Text style={styles.floatingLabel}>
                    {label} {required ? "*" : ""}
                </Text>
            ) : null}

            {/* Glass Container */}
            <LinearGradient
                colors={["rgba(255,255,255,0.15)", "rgba(255,255,255,0.06)"]}
                style={[
                    styles.glassBox,
                    focused && styles.focusedGlass,
                    !editable && { opacity: 0.6 }
                ]}
            >
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    placeholder={placeholder || label}
                    placeholderTextColor="#333"
                    editable={editable}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </LinearGradient>
        </View>
    );
};

export default GlassInput;

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 16,
    },
    glassBox: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
        ...Platform.select({
            ios: { backdropFilter: "blur(14px)" },
            android: {}
        })
    },
    focusedGlass: {
        borderColor: "#fff",
        shadowColor: "#005BEA",
        shadowOpacity: 0.2,
        shadowRadius: 10,
    },
    floatingLabel: {
        color: "#888",
        fontSize: 12,
        marginBottom: 4,
        opacity: 0.8,
        fontWeight: "600",
    },
    input: {
        color: "#fff",
        fontSize: 15,
        fontWeight: "500",
        // backgroundColor:'#888',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 6
    },
});
