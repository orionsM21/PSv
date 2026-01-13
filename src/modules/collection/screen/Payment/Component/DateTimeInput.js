import React, { useState, useRef } from "react";
import {
    View,
    Text,
    Animated,
    StyleSheet,
    TouchableOpacity,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { scale, moderateScale, verticalScale } from "react-native-size-matters";

const UltraDateTimeInput = ({ label, value, onChange, containerStyle }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState("date");
    const [selectedDate, setSelectedDate] = useState(null);
    const [focused, setFocused] = useState(false);

    const animated = useRef(new Animated.Value(value ? 1 : 0)).current;

    const animateTo = (v) => {
        Animated.timing(animated, {
            toValue: v,
            duration: 180,
            useNativeDriver: false,
        }).start();
    };

    /* 🔥 Always start at DATE */
    const openPicker = () => {
        setPickerMode("date");
        setFocused(true);
        animateTo(1);
        setShowPicker(true);
    };

    /* 🔥 Auto Step: Date → Time → Final */
    const handleConfirm = (picked) => {
        if (pickerMode === "date") {
            // CLOSE date picker cleanly
            setShowPicker(false);

            // store selected date for later
            setSelectedDate(picked);

            // Immediately update UI with selected date
            onChange(picked);

            // Open TIME picker with minimal delay (no flicker)
            setTimeout(() => {
                setPickerMode("time");
                setShowPicker(true);
            }, 50);

        } else {
            // Combine stored date + selected time
            const final = new Date(selectedDate);
            final.setHours(picked.getHours());
            final.setMinutes(picked.getMinutes());

            setShowPicker(false);
            setFocused(false);
            setPickerMode("date");
            setSelectedDate(null);

            onChange(final);
        }
    };

    /* ANIMATIONS */
    const labelTop = animated.interpolate({
        inputRange: [0, 1],
        outputRange: [20, -8],
    });

    const labelSize = animated.interpolate({
        inputRange: [0, 1],
        outputRange: [15, 12],
    });

    const labelColor = animated.interpolate({
        inputRange: [0, 1],
        outputRange: ["#777", "#001B5E"],
    });

    return (
        <View style={[styles.container, containerStyle]}>
            {/* Floating Label */}
            <Animated.Text
                style={[
                    styles.label,
                    {
                        top: labelTop,
                        fontSize: labelSize,
                        color: labelColor,
                    },
                ]}
            >
                {label} <Text style={{ color: "red" }}>*</Text>
            </Animated.Text>

            {/* Gradient Border */}
            <LinearGradient
                colors={
                    focused ? ["#001B5E", "#2743A6"] : ["#D9D9D9", "#D9D9D9"]
                }
                style={styles.border}
            >
                <TouchableOpacity activeOpacity={0.9} onPress={openPicker}>
                    <View style={styles.inputWrapper}>
                        <MaterialIcons
                            name="calendar-month"
                            size={scale(22)}
                            color={focused ? "#001B5E" : "#777"}
                            style={styles.icon}
                        />

                        <Text
                            style={[
                                styles.valueText,
                                { color: value ? "#000" : "#999" },
                            ]}
                        >
                            {value
                                ? moment(value).format("DD MMM YYYY, hh:mm A")
                                : "Select date & time"}
                        </Text>
                    </View>
                </TouchableOpacity>
            </LinearGradient>

            {/* Modal Picker */}
            <DateTimePickerModal
                isVisible={showPicker}
                mode={pickerMode}
                date={pickerMode === "date" ? new Date() : selectedDate || new Date()}
                minimumDate={new Date()}
                onConfirm={handleConfirm}
                onCancel={() => {
                    setShowPicker(false);
                    if (!value) animateTo(0);
                    setPickerMode("date");
                    setSelectedDate(null);
                    setFocused(false);
                }}
            />
        </View>
    );
};

export default React.memo(UltraDateTimeInput);

const styles = StyleSheet.create({
    container: {
        marginTop: verticalScale(16),
        position: "relative",
    },

    label: {
        position: "absolute",
        left: moderateScale(14),
        backgroundColor: "#fff",
        paddingHorizontal: moderateScale(4),
        fontWeight: "700",
        zIndex: 20,
    },

    border: {
        borderRadius: moderateScale(14),
        padding: scale(1.4),
        marginTop: verticalScale(10),
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: moderateScale(12),
        height: verticalScale(48),
        paddingHorizontal: moderateScale(12),
    },

    icon: {
        marginRight: scale(8),
    },

    valueText: {
        fontSize: moderateScale(14.5),
        fontWeight: "600",
        flex: 1,
    },
});
