import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { verticalScale, scale, moderateScale } from "react-native-size-matters";

const PaymentModeSelector = ({ form, update }) => {
    const modes = [
        { label: "Full", index: 0, icon: "credit-score" },
        { label: "Partial", index: 1, icon: "pie-chart-outline" },
    ];

    return (
        <View style={styles.container}>
            {modes.map((m) => {
                const active = form.mode === m.index;

                return (
                    <Pressable
                        key={m.index}
                        onPress={() => update("mode", m.index)}
                        style={({ pressed }) => [
                            styles.item,
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
                                    size={scale(18)}   // ⭐ Smaller icon
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
    );
};

export default React.memo(PaymentModeSelector);

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: verticalScale(12),
    },

    item: {
        width: "47%",                     // ⭐ Perfect 2 per row
        borderRadius: moderateScale(12),
        overflow: "hidden",
    },

    /* ACTIVE CARD */
    activeCard: {
        paddingVertical: verticalScale(10), // ⭐ Compact height
        borderRadius: moderateScale(12),
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 5,
    },

    /* INACTIVE CARD */
    inactiveCard: {
        paddingVertical: verticalScale(10),
        backgroundColor: "#F4F5F7",
        borderRadius: moderateScale(12),
        borderWidth: scale(1),
        borderColor: "#DADDE2",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 2,
    },

    icon: {
        marginBottom: verticalScale(2), // ⭐ Compact spacing
    },

    activeText: {
        color: "#fff",
        fontSize: moderateScale(12.5), // ⭐ Smaller text
        fontWeight: "700",
        letterSpacing: 0.3,
        marginTop: verticalScale(2),
    },

    inactiveText: {
        color: "#555",
        fontSize: moderateScale(12.5),
        fontWeight: "600",
        marginTop: verticalScale(2),
    },
});
