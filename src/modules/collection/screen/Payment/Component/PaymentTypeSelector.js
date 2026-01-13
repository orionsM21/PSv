import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { moderateScale, verticalScale, scale } from "react-native-size-matters";

const TYPES = [
    { label: "Foreclosure", index: 0, icon: "gavel" },
    { label: "Total Overdue", index: 1, icon: "warning-amber" },
    { label: "Charges", index: 2, icon: "receipt-long" },
    { label: "Overdue EMI", index: 3, icon: "payments" },
    { label: "Settlement", index: 4, icon: "verified" },
    { label: "Others", index: 5, icon: "category" },
    { label: "EMI", index: 6, icon: "account-balance" },
];

const PaymentTypeSelector = ({ form, update }) => {
    return (
        <View style={styles.container}>
            {TYPES.map((t) => {
                const active = form.type === t.index;

                return (
                    <Pressable
                        key={t.index}
                        onPress={() => update("type", t.index)}
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
                                    name={t.icon}
                                    size={scale(18)}
                                    color="#fff"
                                    style={styles.icon}
                                />
                                <Text style={styles.activeText}>{t.label}</Text>
                            </LinearGradient>
                        ) : (
                            <View style={styles.inactiveCard}>
                                <MaterialIcons
                                    name={t.icon}
                                    size={scale(18)}
                                    color="#555"
                                    style={styles.icon}
                                />
                                <Text style={styles.inactiveText}>{t.label}</Text>
                            </View>
                        )}
                    </Pressable>
                );
            })}
        </View>
    );
};

export default React.memo(PaymentTypeSelector);

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: verticalScale(12),
    },

    item: {
        width: "31%", // ⭐ Perfect 3-per-row layout
        marginBottom: verticalScale(10),
        borderRadius: moderateScale(12),
        overflow: "hidden",
    },

    /* ACTIVE STATE */
    activeCard: {
        paddingVertical: verticalScale(10), // ⭐ Compact height
        paddingHorizontal: moderateScale(6),
        alignItems: "center",
        justifyContent: "center",
        borderRadius: moderateScale(12),

        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 6,
    },

    activeText: {
        color: "#fff",
        fontSize: moderateScale(11.5),
        marginTop: verticalScale(3),
        fontWeight: "700",
        textAlign: "center",
    },

    /* INACTIVE */
    inactiveCard: {
        paddingVertical: verticalScale(10),
        paddingHorizontal: moderateScale(6),
        backgroundColor: "#F4F5F7",
        borderRadius: moderateScale(12),
        alignItems: "center",
        borderWidth: scale(1),
        borderColor: "#E4E6EA",

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 2,
    },

    inactiveText: {
        color: "#555",
        fontSize: moderateScale(11.5),
        marginTop: verticalScale(3),
        fontWeight: "600",
        textAlign: "center",
    },

    icon: {
        marginBottom: verticalScale(2),
    },
});
