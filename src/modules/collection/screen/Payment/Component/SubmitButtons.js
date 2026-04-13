import React, { useRef } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import {
    moderateScale,
    scale,
    verticalScale,
} from "react-native-size-matters";

const ULTRA_GRADIENT = ["#001B5E", "#2743A6", "#6F2DBD"];

const SubmitButtons = ({ onCancel, onSubmit, loading, isUpdate }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const pressIn = () =>
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();

    const pressOut = () =>
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
        }).start();

    return (
        <View style={styles.container}>

            {/* -------- Cancel Button -------- */}
            <Pressable
                onPress={onCancel}
                style={({ pressed }) => [
                    styles.cancelWrapper,
                    { transform: [{ scale: pressed ? 0.97 : 1 }] },
                ]}
            >
                <View style={styles.cancelBtn}>
                    <Text style={styles.cancelText}>Cancel</Text>
                </View>
            </Pressable>

            {/* -------- Submit Button -------- */}
            <Pressable
                disabled={loading}
                onPressIn={pressIn}
                onPressOut={pressOut}
                onPress={onSubmit}
                style={styles.submitWrapper}
            >
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    <LinearGradient
                        colors={ULTRA_GRADIENT}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitBtn}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.submitText}>
                                {isUpdate ? "Update" : "Submit"}
                            </Text>
                        )}

                        {/* Gloss Shine Layer */}
                        <LinearGradient
                            colors={["rgba(255,255,255,0.25)", "transparent"]}
                            style={styles.shineOverlay}
                        />
                    </LinearGradient>
                </Animated.View>
            </Pressable>
        </View>
    );
};

export default React.memo(SubmitButtons);

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        marginTop: verticalScale(20),
        marginBottom: verticalScale(30),
    },

    /* ------------ CANCEL BUTTON ------------ */
    cancelWrapper: {
        flex: 1,
    },

    cancelBtn: {
        height: verticalScale(48),
        backgroundColor: "#F3F4F6",
        borderRadius: moderateScale(14),
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },

    cancelText: {
        fontSize: moderateScale(14.5),
        fontWeight: "700",
        color: "#333",
    },

    /* ------------ SUBMIT BUTTON ------------ */
    submitWrapper: {
        flex: 1,
        marginLeft: scale(10),
    },

    submitBtn: {
        height: verticalScale(48),
        borderRadius: moderateScale(14),
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000",
        shadowOpacity: 0.22,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 7,
        position: "relative",
        overflow: "hidden",
    },

    submitText: {
        color: "#fff",
        fontSize: moderateScale(15),
        fontWeight: "800",
        letterSpacing: 0.3,
    },

    shineOverlay: {
        position: "absolute",
        top: 0,
        height: "45%",
        width: "100%",
        left: 0,
        borderTopLeftRadius: 14,
        borderTopRightRadius: 14,
    },
});
