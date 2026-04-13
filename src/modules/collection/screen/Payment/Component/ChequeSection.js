import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    Animated,
    StyleSheet,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
    moderateScale,
    verticalScale,
    scale,
} from "react-native-size-matters";

const ChequeSection = ({ form, update }) => {
    const [focused, setFocused] = useState(false);
    const animated = useRef(new Animated.Value(form.chequeNo ? 1 : 0)).current;

    const handleFocus = () => {
        setFocused(true);
        Animated.timing(animated, {
            toValue: 1,
            duration: 170,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        setFocused(false);
        if (!form.chequeNo) {
            Animated.timing(animated, {
                toValue: 0,
                duration: 170,
                useNativeDriver: false,
            }).start();
        }
    };

    const labelTop = animated.interpolate({
        inputRange: [0, 1],
        outputRange: [19, -8],
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
        <View style={styles.container}>
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
                Cheque Number <Text style={{ color: "red" }}>*</Text>
            </Animated.Text>

            <LinearGradient
                colors={
                    focused
                        ? ["#001B5E", "#2743A6"]
                        : ["#D9D9D9", "#D9D9D9"]
                }
                style={styles.border}
            >
                <View style={styles.inputWrapper}>
                    <MaterialIcons
                        name="receipt-long"
                        size={scale(22)}
                        color={focused ? "#001B5E" : "#777"}
                        style={styles.icon}
                    />

                    <TextInput
                        value={form.chequeNo}
                        keyboardType="number-pad"
                        maxLength={6}
                        placeholder=""
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onChangeText={(v) =>
                            update("chequeNo", v.replace(/\D/g, ""))
                        }
                        style={styles.input}
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

export default React.memo(ChequeSection);

const styles = StyleSheet.create({
    container: {
        marginTop: verticalScale(18),
        position: "relative",
    },

    /* Floating Label */
    label: {
        position: "absolute",
        left: moderateScale(23),
        backgroundColor: "#fff",
        paddingHorizontal: moderateScale(4),
        zIndex: 8,
        fontWeight: "700",
        textAlign: 'center'
    },

    /* Gradient Border */
    border: {
        borderRadius: moderateScale(14),
        padding: scale(1.4),
    },

    /* Input Container */
    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: moderateScale(12),
        // paddingHorizontal: moderateScale(12),
        height: verticalScale(50),

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },

    icon: {
        marginRight: scale(8),
        marginBottom: scale(6)
    },

    input: {
        flex: 1,
        fontSize: moderateScale(15),
        color: "#111",
        fontWeight: "700",
    },
});
