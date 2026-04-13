import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
    moderateScale,
    verticalScale,
    scale,
} from "react-native-size-matters";

const MobileInput = ({ form, update }) => {
    const [focused, setFocused] = useState(false);
    const animated = useRef(new Animated.Value(form.mobile ? 1 : 0)).current; // 🔥 FIXED

    const handleFocus = () => {
        setFocused(true);
        Animated.timing(animated, {
            toValue: 1,
            duration: 180,
            useNativeDriver: false,
        }).start();
    };

    const handleBlur = () => {
        if (!form.mobile) {
            Animated.timing(animated, {
                toValue: 0,
                duration: 180,
                useNativeDriver: false,
            }).start();
        }
        setFocused(false);
    };

    const labelTop = animated.interpolate({
        inputRange: [0, 1],
        outputRange: [13, -4],
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
                Mobile No <Text style={{ color: "red" }}>*</Text>
            </Animated.Text>

            <LinearGradient
                colors={focused ? ["#001B5E", "#2743A6"] : ["#D9D9D9", "#D9D9D9"]}
                style={styles.border}
            >
                <View style={styles.inputWrapper}>
                    <MaterialIcons
                        name="phone-android"
                        size={scale(20)}
                        color={focused ? "#001B5E" : "#777"}
                        style={styles.icon}
                    />

                    <TextInput
                        value={form.mobile}
                        keyboardType="number-pad"
                        maxLength={10}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder=""
                        style={styles.input}
                        onChangeText={(v) => update("mobile", v.replace(/[^0-9]/g, ""))}
                    />

                </View>
            </LinearGradient>
        </View>
    );
};


export default React.memo(MobileInput);

const styles = StyleSheet.create({
    container: {
        marginTop: verticalScale(16),
        position: "relative",
    },

    label: {
        position: "absolute",
        left: moderateScale(18),
        backgroundColor: "#fff",
        paddingHorizontal: moderateScale(4),
        zIndex: 8,
        fontWeight: "700",
        textAlign: 'center'
    },

    border: {
        borderRadius: moderateScale(14),
        padding: scale(1.4), // gradient border thickness
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: moderateScale(12),
        // paddingHorizontal: moderateScale(6),
        // height: verticalScale(48),
        gap: 6,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
        // backgroundColor:'red'
    },

    icon: {
        marginRight: scale(6),
    },

    input: {
        flex: 1,
        fontSize: moderateScale(15),
        fontWeight: "700",
        color: "#1C1C1E",
    },
});
