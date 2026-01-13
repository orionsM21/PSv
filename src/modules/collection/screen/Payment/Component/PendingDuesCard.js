import React, { useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { scale, moderateScale, verticalScale } from "react-native-size-matters";

const formatAmount = (val) => {
    if (val === null || val === undefined || val === "") return "--";
    return Number(val).toLocaleString("en-IN");
};



const PendingDuesCard = ({ data }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const pressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.97,
            useNativeDriver: true,
        }).start();
    };

    const pressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 6,
            useNativeDriver: true,
        }).start();
    };


    const ot = data?.otherCharges ? Number(data?.otherCharges || 0) : 0;
    const dpc = data?.dpcOrLppOrDelayPaymentChargesOrLatePaymentPenalty ? Number(data?.dpcOrLppOrDelayPaymentChargesOrLatePaymentPenalty || 0) : 0;
    const bounce = data?.chequeBounceCharges ? Number(data?.chequeBounceCharges || 0) : 0;

    const totalCharges = ot + dpc + bounce;
    return (
        <Pressable
            onPressIn={pressIn}
            onPressOut={pressOut}
            style={styles.pressWrapper}
        >
            <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>

                {/* Gradient Header */}
                <LinearGradient
                    colors={["#001B5E", "#2743A6", "#6F2DBD"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.header}
                >
                    <Text style={styles.headerText}>Pending Dues</Text>

                    <MaterialIcons
                        name="account-balance-wallet"
                        size={scale(26)}
                        color="#fff"
                    />

                    {/* Shine Sweep */}
                    <LinearGradient
                        colors={["rgba(255,255,255,0.35)", "transparent"]}
                        style={styles.shine}
                    />
                </LinearGradient>

                {/* Content Section */}
                <View style={styles.content}>
                    {/* Each Row */}
                    <Row
                        icon="error-outline"
                        label="Total OverDue Amount"
                        value={formatAmount(data?.totalOverdueAmount)}
                    />


                    <Divider />

                    <Row
                        icon="error-outline"
                        label="Pending EMI amount"
                        value={formatAmount(data?.pendingEmiAmount)}
                    />
                    <Divider />
                    <Row
                        icon="payments"
                        label="EMI Amount"
                        value={formatAmount(data?.emiAmount)}
                    />

                    <Divider />

                    <Row
                        icon="receipt-long"
                        label="Charges"
                        value={formatAmount(totalCharges)}
                    />

                    <Divider />

                    <Row
                        icon="verified"
                        label="Settlement Amount"
                        value={formatAmount(data?.settlementAmount)}
                        highlight
                    />
                </View>

            </Animated.View>
        </Pressable>
    );
};

export default React.memo(PendingDuesCard);

const Row = ({ icon, label, value, highlight }) => (
    <View style={styles.row}>
        <View style={styles.leftRow}>
            <MaterialIcons
                name={icon}
                size={scale(18)}
                color={highlight ? "#0A8A1A" : "#555"}
                style={styles.rowIcon}
            />
            <Text style={highlight ? styles.labelBold : styles.label}>
                {label}
            </Text>
        </View>

        <Text style={highlight ? styles.valueBold : styles.value}>
            ₹{value}
        </Text>
    </View>
);

const Divider = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
    pressWrapper: {
        marginVertical: verticalScale(8),
    },

    /* COMPACT CARD */
    card: {
        borderRadius: moderateScale(14),   // reduced from 18
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.92)",

        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
        elevation: 6,

        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.35)",
    },

    /* COMPACT HEADER */
    header: {
        paddingVertical: verticalScale(10),  // reduced from 14
        paddingHorizontal: moderateScale(12), // reduced
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
        minHeight: verticalScale(40),        // consistent across devices
    },

    headerText: {
        color: "#fff",
        fontSize: moderateScale(16),         // reduced from 18
        fontWeight: "800",
    },

    shine: {
        position: "absolute",
        top: 0,
        left: 0,
        height: "45%",
        width: "100%",
        opacity: 0.35,
    },

    /* CONTENT AREA (COMPACT) */
    content: {
        paddingVertical: verticalScale(8),    // reduced from 12
        paddingHorizontal: moderateScale(12),
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: verticalScale(6),   // reduced from 8
    },

    leftRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    rowIcon: {
        marginRight: scale(6),                // reduced spacing
    },

    label: {
        fontSize: moderateScale(13),
        fontWeight: "600",
        color: "#505050",
    },

    labelBold: {
        fontSize: moderateScale(14),
        fontWeight: "800",
        color: "#0A8A1A",
    },

    value: {
        fontSize: moderateScale(14),
        fontWeight: "700",
        color: "#002060",
    },

    valueBold: {
        fontSize: moderateScale(15),
        fontWeight: "900",
        color: "#0A8A1A",
    },

    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#E5E5E5",
        marginVertical: verticalScale(3),    // reduced
    },
});

