import React, { memo, useState, useCallback } from "react";
import {
    View,
    Text,
    Pressable,
    StyleSheet,
    Platform,
    LayoutAnimation,
    UIManager,
    Image,
    TouchableWithoutFeedback,
} from "react-native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import moment from "moment";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const SwipeablePaymentItem = ({
    item,
    onNavigate,
    onEmail,
    onSMS,
    theme,
}) => {
    const [expanded, setExpanded] = useState(false);

    const toggleExpand = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded((p) => !p);
    }, []);

    const getStatusColor = useCallback((status) => {
        switch (status) {
            case "Pending":
                return "#F39C12";
            case "Success":
                return "#27AE60";
            case "Rejected":
                return "#E74C3C";
            default:
                return "#6B7280";
        }
    }, []);

    /** LEFT ACTION - EMAIL */
    const renderLeftActions = useCallback(() => (
        <RectButton style={styles.leftAction} onPress={() => onEmail(item)}>
            <MaterialIcons name="email" size={24} color="#fff" />
            <Text style={styles.actionTxt}>Email</Text>
        </RectButton>
    ), [item, onEmail]);

    /** RIGHT ACTION - SMS */
    const renderRightActions = useCallback(() => (
        <RectButton style={styles.rightAction} onPress={() => onSMS(item)}>
            <MaterialIcons name="sms" size={24} color="#fff" />
            <Text style={styles.actionTxt}>SMS</Text>
        </RectButton>
    ), [item, onSMS]);


    return (
        <Swipeable
            renderLeftActions={renderLeftActions}
            renderRightActions={renderRightActions}
            overshootLeft={false}
            overshootRight={false}
        >
            <TouchableWithoutFeedback onPress={() => onNavigate(item)}>
                <View style={styles.card}>


                    {/* TOP ROW */}
                    <View style={styles.row}>
                        <Text style={styles.lanText}>{item.loanAccountNumber}</Text>
                        <Text style={styles.amountText}>₹{Number(item.amount).toFixed(2)}</Text>
                    </View>

                    {/* SUB ROW */}
                    <View style={styles.row}>
                        <Text style={styles.subText}>
                            {item.paymentType} • {item.paymentMode}
                        </Text>
                        <Text
                            style={[
                                styles.statusText,
                                { color: getStatusColor(item.paymentStatus) },
                            ]}
                        >
                            {item.paymentStatus}
                        </Text>
                    </View>

                    {/* DATE */}
                    <Text style={styles.dateText}>
                        {item.paymentDate} • {item.timeOfPayment}
                    </Text>

                    {/* EXPAND ICON */}
                    <Pressable
                        onPress={(e) => {
                            e.stopPropagation(); // prevents navigation
                            toggleExpand();
                        }}
                        hitSlop={10}
                        style={styles.expandButton}
                    >
                        <MaterialIcons
                            name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                            size={26}
                            color="#333"
                        />
                    </Pressable>

                    {expanded && (
                        <View style={styles.expandedWrap}>
                            {/* NAME + CREATED */}
                            <View style={styles.rowBetween}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Name</Text>
                                    <Text style={styles.value}>
                                        {`${item.user?.firstName ?? ""} ${item.user?.lastName ?? ""}`}
                                    </Text>
                                </View>

                                <View style={{ flex: 1, alignItems: "flex-end" }}>
                                    <Text style={styles.label}>Created Date Time</Text>
                                    <Text style={styles.value}>
                                        {moment(item?.createdTime)?.format("DD-MM-YYYY hh:mm A")}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* AMOUNT + STATUS */}
                            <View style={styles.rowBetween}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Amount</Text>
                                    <View style={styles.amountRow}>
                                        <Image
                                            source={require("../../../../../asset/icon/rupee.png")}
                                            style={styles.rupeeIcon}
                                        />
                                        <Text style={[styles.value, { color: theme.light.voilet }]}>
                                            {item.amount}
                                        </Text>
                                    </View>
                                </View>

                                <View style={{ flex: 1, alignItems: "flex-end" }}>
                                    <Text style={styles.label}>Status</Text>
                                    <Text
                                        style={[
                                            styles.value,
                                            { color: getStatusColor(item.paymentStatus) },
                                        ]}
                                    >
                                        {item.paymentStatus}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* MODE + TYPE */}
                            <View style={styles.rowBetween}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Payment Mode</Text>
                                    <Text style={[styles.value, { color: theme.light.voilet }]}>
                                        {item.paymentMode}
                                    </Text>
                                </View>

                                <View style={{ flex: 1, alignItems: "flex-end" }}>
                                    <Text style={styles.label}>Payment Type</Text>
                                    <Text style={[styles.value, { color: theme.light.voilet }]}>
                                        {item.paymentType}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* REMARKS + BUTTONS */}
                            <View style={[styles.rowBetween, { alignItems: "center" }]}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.label}>Remarks</Text>
                                    <Text style={[styles.value, { color: theme.light.voilet }]}>
                                        {item.remark}
                                    </Text>
                                </View>

                                {item.paymentStatus === "Success" && (
                                    <View style={styles.actionRow}>
                                        <Pressable onPress={() => onSMS(item)}>
                                            <Text style={styles.expandAction}>SMS</Text>
                                        </Pressable>

                                        <Pressable onPress={() => onEmail(item)}>
                                            <Text style={styles.expandAction}>Email</Text>
                                        </Pressable>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            </TouchableWithoutFeedback>
        </Swipeable>
    );
};


// ⭐ CUSTOM PROPS COMPARATOR → Huge list performance boost
const areEqual = (prev, next) =>
    prev.item === next.item &&
    prev.theme === next.theme;

export default memo(SwipeablePaymentItem, areEqual);


const styles = StyleSheet.create({
    card: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginVertical: 6,
        padding: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        ...Platform.select({
            ios: {
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 6,
            },
            android: { elevation: 3 },
        }),
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: verticalScale(10),
    },

    lanText: {
        fontSize: moderateScale(15),
        fontWeight: "700",
        color: "#001B5E",
    },

    subText: {
        fontSize: moderateScale(12),
        color: "#6B7280",
    },

    amountText: {
        fontSize: moderateScale(16),
        fontWeight: "800",
        color: "#0B57A4",
    },

    statusText: {
        fontSize: moderateScale(12),
        fontWeight: "700",
    },

    dateText: {
        marginTop: 6,
        fontSize: moderateScale(11),
        color: "#9CA3AF",
    },

    expandButton: {
        alignSelf: "center",
        marginTop: 6,
    },

    expandedWrap: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: "#EEE",
    },

    label: {
        fontSize: moderateScale(13),
        fontWeight: "600",
        color: "#666",
    },
    value: {
        fontSize: moderateScale(14),
        fontWeight: "500",
        color: "#111",
        marginTop: 2,
    },

    divider: {
        height: 1,
        backgroundColor: "#EEE",
        marginVertical: verticalScale(4),
    },

    rupeeIcon: {
        width: scale(13),
        height: scale(13),
        tintColor: "#001D56",
    },

    amountRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingBottom: 2,
    },

    expandAction: {
        fontSize: moderateScale(14),
        fontWeight: "700",
        color: "#007AFF",
    },

    actionRow: {
        flexDirection: "row",
        gap: scale(15),
    },

    // Swipe Actions
    leftAction: {
        flex: 1,
        backgroundColor: "#0A84FF",
        justifyContent: "center",
        paddingLeft: 18,
    },
    rightAction: {
        flex: 1,
        backgroundColor: "#0A8A1A",
        justifyContent: "center",
        alignItems: "flex-end",
        paddingRight: 18,
    },
    actionTxt: {
        color: "#fff",
        fontWeight: "700",
        marginTop: 2,
    },
});
