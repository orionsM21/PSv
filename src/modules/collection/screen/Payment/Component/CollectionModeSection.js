import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

const MODES = [
    { label: "Cash", icon: "payments" },
    { label: "Cheque", icon: "assignment" },
    { label: "Digital", icon: "online-prediction" },
    { label: "Demand Draft", icon: "description" },
];

const CollectionModeSection = ({ form, update }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Collection Mode</Text>

            <View style={styles.row}>
                {MODES.map((m, index) => {
                    const active = form.collectionMode === index;

                    return (
                        <Pressable
                            key={m.label}
                            onPress={() => update("collectionMode", index)}
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
                                        color="#666"
                                        style={styles.icon}
                                    />
                                    <Text style={styles.inactiveText}>{m.label}</Text>
                                </View>
                            )}
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

export default React.memo(CollectionModeSection);

const styles = StyleSheet.create({
    container: {
        marginTop: verticalScale(14),
    },

    title: {
        fontSize: moderateScale(16),
        fontWeight: "800",
        color: "#222",
        marginBottom: verticalScale(8),
    },

    row: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between", // perfect 2 per row
    },

    item: {
        width: "47%", // compact and clean
        marginBottom: verticalScale(12),
        borderRadius: moderateScale(12),
        overflow: "hidden",
    },

    /* ACTIVE CARD */
    activeCard: {
        paddingVertical: verticalScale(10), // reduced
        borderRadius: moderateScale(12),
        alignItems: "center",
        justifyContent: "center",

        shadowColor: "#000",
        shadowOpacity: 0.15, // reduced shadow
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 5,
        elevation: 5,
    },

    activeText: {
        color: "#fff",
        fontSize: moderateScale(12.5), // compact
        fontWeight: "700",
        marginTop: verticalScale(3),
    },

    /* INACTIVE CARD */
    inactiveCard: {
        paddingVertical: verticalScale(10), // compact
        backgroundColor: "#F4F5F7",
        borderRadius: moderateScale(12),
        borderWidth: scale(1),
        borderColor: "#D9DDE2",
        alignItems: "center",

        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },

    inactiveText: {
        color: "#333",
        fontSize: moderateScale(12.5), // compact
        fontWeight: "600",
        marginTop: verticalScale(3),
    },

    icon: {
        marginBottom: verticalScale(2),
    },
});
