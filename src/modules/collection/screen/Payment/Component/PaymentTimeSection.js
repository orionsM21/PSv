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
import { scale, moderateScale, verticalScale } from "react-native-size-matters";

const UltraTimeOnlyInput = ({ label, value, onChange }) => {
    const [show, setShow] = useState(false);
    const [focused, setFocused] = useState(false);

    const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

    const animate = (v) =>
        Animated.timing(anim, {
            toValue: v,
            duration: 180,
            useNativeDriver: false,
        }).start();

    const open = () => {
        setFocused(true);
        animate(1);
        setShow(true);
    };

    const handleConfirm = (picked) => {
        setShow(false);
        setFocused(false);
        onChange(picked);
    };

    const labelStyle = {
        top: anim.interpolate({ inputRange: [0, 1], outputRange: [20, -8] }),
        fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [15, 12] }),
        color: anim.interpolate({ inputRange: [0, 1], outputRange: ["#777", "#001B5E"] }),
    };

    return (
        <View style={styles.container}>
            <Animated.Text style={[styles.label, labelStyle]}>
                {label} <Text style={{ color: "red" }}>*</Text>
            </Animated.Text>

            <LinearGradient
                colors={focused ? ["#001B5E", "#2743A6"] : ["#D9D9D9", "#D9D9D9"]}
                style={styles.border}
            >
                <TouchableOpacity activeOpacity={0.9} onPress={open}>
                    <View style={styles.inputWrapper}>
                        <MaterialIcons
                            name="access-time"
                            size={scale(22)}
                            color={focused ? "#001B5E" : "#777"}
                        />

                        <Text
                            style={[
                                styles.valueText,
                                { color: value ? "#000" : "#999" },
                            ]}
                        >
                            {value
                                ? moment(value).format("hh:mm A")
                                : "Select Time"}
                        </Text>
                    </View>
                </TouchableOpacity>
            </LinearGradient>

            <DateTimePickerModal
                isVisible={show}
                mode="time"
                date={value || new Date()}
                onConfirm={handleConfirm}
                onCancel={() => {
                    setShow(false);
                    setFocused(false);
                    if (!value) animate(0);
                }}
            />
        </View>
    );
};

export default UltraTimeOnlyInput;

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
    valueText: {
        marginLeft: scale(10),
        fontSize: moderateScale(14.5),
        fontWeight: "600",
    },
});
