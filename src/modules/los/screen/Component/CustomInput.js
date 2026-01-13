import React, { useState } from "react";
import { View, Text, TextInput, Image, Keyboard, StyleSheet, Dimensions } from "react-native";
import { validateAadhaar, validatePan, validateCIN } from "../utils/validators.js";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const { height } = Dimensions.get("window");

const CustomInput = ({
    label,
    value,
    setValue,
    placeholder = "",
    editable = true,
    required = true,
    multiline = false,
    type = "text",
    isVerified = false,
    placeholderColor = "#808080",
    style,
    onEndEditing
}) => {

    const [error, setError] = useState("");
    const [dynamicHeight, setDynamicHeight] = useState(verticalScale(45));

    // ---------------- VALIDATION ----------------
    const handleValidation = (text) => {
        switch (type) {
            case "aadhaar": setError(validateAadhaar(text) ? "" : "Invalid Aadhaar"); break;
            case "pan": setError(validatePan(text) ? "" : "Invalid PAN"); break;
            case "cin": setError(validateCIN(text) ? "" : "Invalid CIN"); break;
            case "mobile": setError(text.length === 10 ? "" : "Mobile must be 10 digits"); break;
            default: setError("");
        }
    };

    // ---------------- ON CHANGE ----------------
    const handleChange = (text) => {
        let newValue = text;

        if (["pan", "cin"].includes(type)) newValue = newValue.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        if (["mobile", "aadhaar"].includes(type)) newValue = newValue.replace(/[^0-9]/g, "");

        setValue(newValue);
        handleValidation(newValue);

        if (type === "mobile" && newValue.length === 10) Keyboard.dismiss();
        if (type === "pan" && newValue.length === 10) Keyboard.dismiss();
        if (type === "aadhaar" && newValue.length === 12) Keyboard.dismiss();
    };

    // ---------------- KEYBOARD TYPE ----------------
    const getKeyboardType = () => {
        if (type === "mobile" || type === "aadhaar") return "numeric";
        if (type === "email") return "email-address";
        return "default";
    };

    const getMaxLength = () => {
        switch (type) {
            case "mobile": return 10;
            case "aadhaar": return 12;
            case "pan": return 10;
            case "cin": return 21;
            default: return undefined;
        }
    };

    // ---------------- AUTO HEIGHT FOR MULTILINE ----------------
    const onContentSize = (e) => {
        if (!multiline) return;
        const newHeight = e.nativeEvent.contentSize.height;
        setDynamicHeight(
            Math.min(
                Math.max(verticalScale(45), newHeight + verticalScale(8)),
                verticalScale(200)
            )
        );
    };

    return (
        <View style={styles.inputField}>

            {/* Label + Verified Icon */}
            <View style={styles.labelRow}>
                <Text style={styles.label}>{label}
                    {required && (
                        <Text style={styles.required}>*</Text>
                    )}
                </Text>
                {isVerified && (
                    <Image
                        source={require("../../asset/greencheck.png")}
                        style={styles.checkIcon}
                    />
                )}
            </View>

            {/* Input Box */}
            <TextInput
                style={[
                    styles.input,
                    {
                        height: multiline ? dynamicHeight : verticalScale(30),
                        textAlignVertical: multiline ? "top" : "center",
                        borderColor: error ? "red" : "#bbb",
                        // backgroundColor:'red'
                    },
                    !editable && { backgroundColor: "#EDEDED" },
                    style
                ]}
                value={typeof value === "string" ? value : String(value || "")}
                onChangeText={handleChange}
                onContentSizeChange={onContentSize}
                editable={editable}
                multiline={multiline}
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                keyboardType={getKeyboardType()}
                maxLength={getMaxLength()}
                scrollEnabled={false}
                onEndEditing={(e) => onEndEditing?.(e.nativeEvent.text)}
            />

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    );
};

export default CustomInput;

const styles = StyleSheet.create({
    inputField: {
        width: "100%",            // FULL WIDTH → consistent across devices
        marginVertical: 6,
    },
    labelRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        // marginBottom: verticalScale(6),
    },
    required: {
        color: "red",
        marginLeft: scale(2),
    },
    label: {

        fontSize: moderateScale(13),
        color: "#333",
        marginBottom: 4,
        fontWeight: "600",
    },
    input: {
        width: "100%",
        minHeight: verticalScale(34),
        paddingVertical: verticalScale(6),
        paddingHorizontal: scale(8),
        fontSize: moderateScale(12),
        borderWidth: 1,
        borderRadius: scale(6),
        color: "#333",
    },
    checkIcon: {
        width: scale(16),
        height: scale(16),
        tintColor: "#16a34a",
    },
    errorText: {
        color: "red",
        fontSize: moderateScale(11),
        marginTop: verticalScale(4),
    },
});
