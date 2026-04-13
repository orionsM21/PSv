import React, { useState, useRef } from "react";
import {
    View,
    TextInput,
    Animated,
    StyleSheet, Text
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";

const RemarksSection = ({ form, update }) => {
    const [focused, setFocused] = useState(false);
    const animated = useRef(new Animated.Value(form.remark ? 1 : 0)).current;

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
        if (!form.remark?.trim()) {
            Animated.timing(animated, {
                toValue: 0,
                duration: 170,
                useNativeDriver: false,
            }).start();
        }
    };

    // Floating label animations
    const labelTop = animated.interpolate({
        inputRange: [0, 1],
        outputRange: [13, -6],
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
            {/* Floating label */}
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
                Remarks <Text style={{ color: "red" }}>*</Text>
            </Animated.Text>

            {/* Gradient Border */}
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
                        name="edit-note"
                        size={scale(24)}
                        color={focused ? "#001B5E" : "#777"}
                        style={styles.icon}
                    />

                    <TextInput
                        multiline
                        value={form.remark}
                        onChangeText={(v) => {
                            update("hasUserEditedAmount", true);
                            update("remark", v);
                        }}

                        style={styles.input}
                        placeholder=""
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        textAlignVertical="top"
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

export default React.memo(RemarksSection);

const styles = StyleSheet.create({
    container: {
        marginTop: verticalScale(18),
        position: "relative",
    },

    /* Floating Label */
    label: {
        position: "absolute",
        left: moderateScale(40), // shifted due to icon
        backgroundColor: "#fff",
        paddingHorizontal: moderateScale(4),
        zIndex: 10,
        fontWeight: "700",
    },

    /* Gradient Border */
    border: {
        borderRadius: moderateScale(14),
        padding: scale(1.4),
    },

    /* Input Area */
    inputWrapper: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#fff",
        borderRadius: moderateScale(12),
        paddingHorizontal: moderateScale(12),
        // paddingTop: verticalScale(20),

        minHeight: verticalScale(30),

        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },

    icon: {
        marginRight: moderateScale(8),
        marginTop: verticalScale(8),
        // marginBottom: moderateScale(30)
    },

    input: {
        flex: 1,
        fontSize: moderateScale(15),
        color: "#222",
        fontWeight: "600",
        paddingBottom: verticalScale(8),
    },
});
