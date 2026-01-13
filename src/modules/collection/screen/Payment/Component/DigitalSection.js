import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Pressable,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import {
    moderateScale,
    verticalScale,
    scale,
} from "react-native-size-matters";

const MODES = [
    { label: "NEFT", icon: "swap-horiz" },
    { label: "RTGS", icon: "sync-alt" },
    { label: "IMPS", icon: "bolt" },
    { label: "UPI", icon: "qr-code-scanner" },
];

const DigitalSection = ({ form, update }) => {
    const [focused, setFocused] = useState(false);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                Digital Payment Mode <Text style={{ color: "red" }}>*</Text>
            </Text>

            {/* ----------- 2-per-row grid ----------- */}
            <View style={styles.grid}>
                {MODES.map((m, i) => {
                    const active = form.digitalMode === i;

                    return (
                        <Pressable
                            key={m.label}
                            onPress={() => update("digitalMode", i)}
                            style={({ pressed }) => [
                                styles.cardPress,
                                { transform: [{ scale: pressed ? 0.96 : 1 }] },
                            ]}
                        >
                            {active ? (
                                <LinearGradient
                                    colors={["#001B5E", "#2743A6", "#6F2DBD"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.activeCard}
                                >
                                    <MaterialIcons
                                        name={m.icon}
                                        size={scale(18)}
                                        color="#fff"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.activeText}>{m.label}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.inactiveCard}>
                                    <MaterialIcons
                                        name={m.icon}
                                        size={scale(18)}
                                        color="#555"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.inactiveText}>{m.label}</Text>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>

            {/* ----------- Reference No ----------- */}
            <Text style={styles.label}>
                Reference No <Text style={{ color: "red" }}>*</Text>
            </Text>

            <View style={[styles.inputWrapper, focused && styles.inputFocused]}>
                <MaterialIcons
                    name="confirmation-number"
                    size={scale(20)}
                    color={focused ? "#2743A6" : "#666"}
                    style={styles.inputIcon}
                />

                <TextInput
                    value={form.referenceNo}
                    onChangeText={(v) => update("referenceNo", v)}
                    style={styles.input}
                    placeholder="Enter Reference No"
                    placeholderTextColor="#A0A0A0"
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                />
            </View>
        </View>
    );
};

export default React.memo(DigitalSection);

const styles = StyleSheet.create({
    container: {
        marginTop: verticalScale(14),
    },

    title: {
        fontSize: moderateScale(15.5),
        fontWeight: "800",
        color: "#222",
        marginBottom: verticalScale(6),
    },

    /* -------- GRID: 2 per row -------- */
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: verticalScale(6),
    },

    cardPress: {
        width: "47%",                 // ⭐ Perfect for 2 per row
        marginBottom: verticalScale(10),
        borderRadius: moderateScale(14),
        overflow: "hidden",
    },

    /* ACTIVE */
    activeCard: {
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(14),
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 5,
    },

    activeText: {
        color: "#fff",
        fontSize: moderateScale(12.5),
        fontWeight: "700",
        marginTop: verticalScale(3),
    },

    /* INACTIVE */
    inactiveCard: {
        paddingVertical: verticalScale(10),
        backgroundColor: "#F3F4F6",
        borderRadius: moderateScale(14),
        borderWidth: scale(1),
        borderColor: "#E4E4E4",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },

    inactiveText: {
        color: "#444",
        fontSize: moderateScale(12.5),
        fontWeight: "600",
        marginTop: verticalScale(3),
    },

    icon: {
        marginBottom: verticalScale(3),
    },

    /* -------- Reference Input -------- */
    label: {
        fontSize: moderateScale(15),
        fontWeight: "700",
        marginTop: verticalScale(12),
        color: "#222",
    },

    inputWrapper: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: scale(1),
        borderColor: "#D6D6D6",
        backgroundColor: "#F9F9F9",
        borderRadius: moderateScale(14),
        paddingHorizontal: moderateScale(12),
        marginTop: verticalScale(6),
        height: verticalScale(48),

        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
        elevation: 2,
    },

    inputFocused: {
        borderColor: "#2743A6",
        backgroundColor: "#fff",

        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 6,
    },

    inputIcon: {
        marginRight: moderateScale(8),
    },

    input: {
        flex: 1,
        fontSize: moderateScale(14),
        fontWeight: "600",
        color: "#222",
    },
});
