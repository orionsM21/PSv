import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Animated,
    StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const UltraDateRangeInput = ({ value = {}, onChange }) => {
    const [picker, setPicker] = useState({
        visible: false,
        mode: "from",
    });

    const fromAnim = useRef(new Animated.Value(value.from ? 1 : 0)).current;
    const toAnim = useRef(new Animated.Value(value.to ? 1 : 0)).current;

    const animate = (ref, v) =>
        Animated.timing(ref, {
            toValue: v,
            duration: 180,
            useNativeDriver: false,
        }).start();

    const openPicker = (mode) => {
        setPicker({ visible: true, mode });
        if (mode === "from") animate(fromAnim, 1);
        else animate(toAnim, 1);
    };

    const handleConfirm = (picked) => {
        const newRange = { ...value };

        if (picker.mode === "from") {
            newRange.from = picked;

            // auto fix TO (always >= FROM)
            if (newRange.to && moment(newRange.to).isBefore(picked)) {
                newRange.to = picked;
            }
        } else {
            newRange.to = picked;
        }

        onChange(newRange);
        setPicker({ visible: false, mode: "from" });
    };

    const closePicker = () => {
        setPicker({ visible: false, mode: "from" });

        if (!value.from) animate(fromAnim, 0);
        if (!value.to) animate(toAnim, 0);
    };

    const labelStyle = (anim) => ({
        top: anim.interpolate({ inputRange: [0, 1], outputRange: [20, -8] }),
        fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [15, 12] }),
        color: anim.interpolate({ inputRange: [0, 1], outputRange: ["#777", "#001B5E"] }),
    });

    return (
        <View style={{ marginTop: verticalScale(16) }}>
            {/* ------------------- FROM -------------------- */}
            <View style={{ marginBottom: verticalScale(16), position: "relative" }}>
                <Animated.Text style={[styles.label, labelStyle(fromAnim)]}>
                    From Date <Text style={{ color: "red" }}>*</Text>
                </Animated.Text>

                <LinearGradient
                    colors={value.from ? ["#001B5E", "#2743A6"] : ["#D9D9D9", "#D9D9D9"]}
                    style={styles.border}
                >
                    <TouchableOpacity onPress={() => openPicker("from")} activeOpacity={0.9}>
                        <View style={styles.inputWrapper}>
                            <MaterialIcons
                                name="event"
                                size={scale(22)}
                                color={value.from ? "#001B5E" : "#777"}
                            />
                            <Text style={styles.valueText}>
                                {value.from
                                    ? moment(value.from).format("DD MMM YYYY")
                                    : "Select From Date"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {/* ------------------- TO -------------------- */}
            <View style={{ marginTop: verticalScale(4), position: "relative" }}>
                <Animated.Text style={[styles.label, labelStyle(toAnim)]}>
                    To Date <Text style={{ color: "red" }}>*</Text>
                </Animated.Text>

                <LinearGradient
                    colors={value.to ? ["#001B5E", "#2743A6"] : ["#D9D9D9", "#D9D9D9"]}
                    style={styles.border}
                >
                    <TouchableOpacity
                        onPress={() => value.from && openPicker("to")}
                        activeOpacity={value.from ? 0.9 : 1}
                    >
                        <View style={styles.inputWrapper}>
                            <MaterialIcons
                                name="event-available"
                                size={scale(22)}
                                color={value.to ? "#001B5E" : "#777"}
                            />
                            <Text style={styles.valueText}>
                                {value.to
                                    ? moment(value.to).format("DD MMM YYYY")
                                    : "Select To Date"}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {/* Picker */}
            <DateTimePickerModal
                isVisible={picker.visible}
                mode="date"
                date={new Date()}
                onConfirm={handleConfirm}
                onCancel={closePicker}
            />
        </View>
    );
};

export default UltraDateRangeInput;

const styles = StyleSheet.create({
    label: {
        position: "absolute",
        left: moderateScale(14),
        paddingHorizontal: moderateScale(4),
        fontWeight: "700",
        backgroundColor: "#fff",
        zIndex: 20,
    },
    border: {
        padding: scale(1.4),
        borderRadius: moderateScale(14),
    },
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: moderateScale(12),
        height: verticalScale(48),
        paddingHorizontal: moderateScale(12),
    },
    valueText: {
        marginLeft: scale(10),
        fontSize: moderateScale(14.5),
        fontWeight: "600",
        color: "#000",
    },
});
