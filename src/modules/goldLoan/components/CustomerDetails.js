import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    LayoutAnimation,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { GOLD_THEME } from "../theme/goldTheme";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomHeader from "../../../Drawer/CustomHeader";
import { useNavigation } from "@react-navigation/native";

if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const statusPalette = {
    Active: { bg: "rgba(47,133,90,0.16)", text: GOLD_THEME.success },
    Closed: { bg: "rgba(109,88,71,0.14)", text: GOLD_THEME.textSecondary },
    Pending: { bg: "rgba(192,122,23,0.16)", text: GOLD_THEME.warning },
};

const Card = ({ title, children }) => (
    <View style={styles.card}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {children}
    </View>
);

const Info = ({ label, value }) => (
    <View style={styles.infoRow}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
);

const Grid = ({ children }) => <View style={styles.grid}>{children}</View>;

const GridItem = ({ label, value }) => (
    <View style={styles.gridItem}>
        <Text style={styles.gridLabel}>{label}</Text>
        <Text style={styles.gridValue}>{value}</Text>
    </View>
);

const Divider = () => <View style={styles.divider} />;

const Score = ({ label, value }) => (
    <View style={styles.scoreBox}>
        <Text style={styles.scoreLabel}>{label}</Text>
        <Text style={styles.scoreValue}>{value}</Text>
    </View>
);

const Row = ({ label, value, color }) => (
    <View style={styles.amountRow}>
        <Text style={[styles.amountLabel, { color }]}>{label}</Text>
        <Text style={[styles.amountValue, { color }]}>{value}</Text>
    </View>
);

const CustomerDetails = ({ route }) => {
    const { customer } = route.params;
    const { loan } = customer;
    const [showBreakup, setShowBreakup] = useState(false);
    const navigation = useNavigation();
    const statusStyle = statusPalette[loan.status] || statusPalette.Pending;

    const emiSchedule = useMemo(() => {
        const principal = Number(loan.disbursedAmount || 0);
        const rate = Number(loan.interestRate || 0);
        const tenure = Number(loan.tenure || 0);

        if (!principal || !rate || !tenure) return [];

        const monthlyRate = rate / 12 / 100;
        const emi = Math.round(
            (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
            (Math.pow(1 + monthlyRate, tenure) - 1)
        );

        let balance = principal;

        return Array.from({ length: tenure }).map((_, index) => {
            const interest = Math.round(balance * monthlyRate);
            const principalPaid = emi - interest;
            balance -= principalPaid;
            return {
                month: index + 1,
                emi,
                principalPaid,
                interest,
                balance: Math.max(balance, 0),
            };
        });
    }, [loan]);

    const outstanding = emiSchedule.length ? emiSchedule[emiSchedule.length - 1].balance : 0;

    const toggleBreakup = useCallback(() => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowBreakup(current => !current);
    }, []);

    const verifyPayment = useCallback(amount => {
        setTimeout(() => {
            Alert.alert("Success", `Payment of Rs ${amount} recorded`);
        }, 1200);
    }, []);

    const initiatePayment = useCallback(
        async amount => {
            try {
                const upiUrl = `upi://pay?pa=sm8115884@oksbi&pn=LoanPay&am=${amount}&cu=INR`;
                const supported = await Linking.canOpenURL(upiUrl);
                if (!supported) {
                    Alert.alert("Error", "No UPI app found");
                    return;
                }
                await Linking.openURL(upiUrl);
                verifyPayment(amount);
            } catch {
                Alert.alert("Payment Failed", "Something went wrong");
            }
        },
        [verifyPayment]
    );

    const handlePayEMI = useCallback(() => {
        if (!emiSchedule.length) {
            Alert.alert("Error", "No EMI data available");
            return;
        }

        if (loan.status !== "Active") {
            Alert.alert("Invalid", "Loan is not active");
            return;
        }

        const emiAmount = emiSchedule[0]?.emi;
        Alert.alert("Confirm Payment", `Pay Rs ${emiAmount}?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Pay", onPress: () => initiatePayment(emiAmount) },
        ]);
    }, [emiSchedule, initiatePayment, loan.status]);

    return (
        // <LinearGradient colors={["#F6EFE7", "#F3E8D7"]} style={styles.screen}>
        <LinearGradient
            colors={["#1A1207", "#3C2410", "#140D05"]}
            style={styles.screen}
        >
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />
            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <CustomHeader
                    title="CustomersList"
                    subtitle="Gold Loan Portfolio"
                    onBack={() => navigation.goBack()}
                    rightIcon="filter-outline"
                    onRightPress={() => console.log("Filter")}
                />
                <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <LinearGradient colors={GOLD_THEME.background} style={styles.headerCard}>
                        <View style={styles.headerRow}>
                            <View style={styles.flexOne}>
                                <Text style={styles.customerName}>{customer.name}</Text>
                                <Text style={styles.customerId}>{`ID • ${customer.customerId}`}</Text>
                            </View>
                            <View style={[styles.statusPill, { backgroundColor: statusStyle.bg }]}>
                                <Text style={[styles.statusText, { color: statusStyle.text }]}>{loan.status}</Text>
                            </View>
                        </View>
                        <Text style={styles.headerSubtitle}>{`Branch ${customer.branch} • ${customer.customerType}`}</Text>
                    </LinearGradient>

                    <Card title="Customer Profile">
                        <Grid>
                            <GridItem label="Mobile" value={customer.phone} />
                            <GridItem label="Branch" value={customer.branch} />
                            <GridItem label="City" value={customer.city} />
                            <GridItem label="Pincode" value={customer.pincode} />
                            <GridItem label="Customer Type" value={customer.customerType} />
                            <GridItem label="Risk Segment" value={customer.riskSegment} />
                        </Grid>
                    </Card>

                    <View style={styles.creditCard}>
                        <Text style={styles.sectionTitle}>Credit Bureau</Text>
                        <View style={styles.scoreRow}>
                            <Score label="CIBIL" value={customer.cibil} />
                            <Score label="CRIF" value={customer.crif} />
                        </View>
                        <Text style={styles.bureauStatus}>{`Bureau Status: ${customer.bureauStatus}`}</Text>
                    </View>

                    <Card title="Loan Financials">
                        <Info label="Applied Amount" value={`Rs ${loan.appliedAmount}`} />
                        <Info label="Approved Amount" value={`Rs ${loan.approvedAmount}`} />
                        <Info label="Disbursed Amount" value={`Rs ${loan.disbursedAmount}`} />
                        <Info label="Processing Fee" value={`Rs ${loan.processingFee}`} />
                        <Divider />
                        <Info label="Net Disbursal" value={`Rs ${loan.disbursedAmount - loan.processingFee}`} />
                    </Card>

                    <Card title="Loan Status">
                        <Grid>
                            <GridItem label="Product" value={loan.product} />
                            <GridItem label="Loan Type" value={loan.loanType} />
                            <GridItem label="Start Date" value={loan.startDate} />
                            <GridItem label="Next EMI Due" value={loan.nextEmiDate} />
                            <GridItem label="DPD" value={`${loan.dpd} Days`} />
                            <GridItem label="Outstanding" value={`Rs ${outstanding}`} />
                        </Grid>
                    </Card>

                    <View style={styles.emiCard}>
                        <Text style={styles.emiTitle}>EMI Summary</Text>
                        {/* <Info label="Monthly EMI" value={`Rs ${emiSchedule[0]?.emi || 0}`} /> */}
                        <Info label="Monthly EMI" value={`Rs ${22}`} />
                        <Info label="Tenure" value={`${loan.tenure} Months`} />
                    </View>

                    <TouchableOpacity style={styles.payBtn} onPress={handlePayEMI} activeOpacity={0.9}>
                        <Text style={styles.payBtnText}>Pay EMI</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.breakupBtn} onPress={toggleBreakup} activeOpacity={0.9}>
                        <Text style={styles.breakupText}>{showBreakup ? "Hide EMI Breakup" : "View EMI Breakup"}</Text>
                    </TouchableOpacity>

                    {showBreakup ? (
                        <View style={styles.breakupCard}>
                            {emiSchedule.map(item => (
                                <View key={item.month} style={styles.breakupRow}>
                                    <Text style={styles.month}>{`Month ${item.month}`}</Text>
                                    <Row label="Principal" value={`Rs ${item.principalPaid}`} color={GOLD_THEME.success} />
                                    <Row label="Interest" value={`Rs ${item.interest}`} color={GOLD_THEME.danger} />
                                    <Row label="Balance" value={`Rs ${item.balance}`} color={GOLD_THEME.accentStrong} />
                                </View>
                            ))}
                        </View>
                    ) : null}
                </ScrollView>

            </SafeAreaView>

        </LinearGradient>
    );
};

export default CustomerDetails;

// const styles = StyleSheet.create({
//     screen: {
//         flex: 1,
//     },
//     container: {
//         flex: 1,
//     },
//     content: {
//         padding: 16,
//         paddingBottom: 28,
//     },
//     flexOne: {
//         flex: 1,
//     },
//     headerCard: {
//         borderRadius: 24,
//         padding: 20,
//         marginBottom: 16,
//     },
//     headerRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         gap: 12,
//     },
//     customerName: {
//         fontSize: 22,
//         fontWeight: "800",
//         color: GOLD_THEME.white,
//     },
//     customerId: {
//         fontSize: 12,
//         color: "#E7D7C2",
//         marginTop: 6,
//     },
//     headerSubtitle: {
//         marginTop: 10,
//         color: "#E7D7C2",
//         fontSize: 13,
//     },
//     statusPill: {
//         paddingHorizontal: 14,
//         paddingVertical: 8,
//         borderRadius: 999,
//         alignSelf: "flex-start",
//     },
//     statusText: {
//         fontWeight: "800",
//         fontSize: 12,
//     },
//     card: {
//         backgroundColor: GOLD_THEME.panel,
//         borderRadius: 22,
//         padding: 16,
//         marginBottom: 16,
//         borderWidth: 1,
//         borderColor: GOLD_THEME.border,
//     },
//     sectionTitle: {
//         fontSize: 16,
//         fontWeight: "800",
//         color: GOLD_THEME.textPrimary,
//         marginBottom: 12,
//     },
//     infoRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         marginBottom: 8,
//         gap: 12,
//     },
//     label: {
//         color: GOLD_THEME.textSecondary,
//         fontSize: 13,
//     },
//     value: {
//         fontWeight: "700",
//         color: GOLD_THEME.textPrimary,
//         fontSize: 13,
//     },
//     divider: {
//         height: 1,
//         backgroundColor: GOLD_THEME.border,
//         marginVertical: 8,
//     },
//     grid: {
//         flexDirection: "row",
//         flexWrap: "wrap",
//         justifyContent: "space-between",
//     },
//     gridItem: {
//         width: "48%",
//         backgroundColor: GOLD_THEME.panelSoft,
//         borderRadius: 14,
//         padding: 12,
//         marginBottom: 10,
//     },
//     gridLabel: {
//         fontSize: 12,
//         color: GOLD_THEME.textSecondary,
//     },
//     gridValue: {
//         fontWeight: "800",
//         color: GOLD_THEME.textPrimary,
//         marginTop: 4,
//     },
//     creditCard: {
//         backgroundColor: GOLD_THEME.panelTint,
//         borderRadius: 22,
//         padding: 16,
//         marginBottom: 16,
//         borderWidth: 1,
//         borderColor: GOLD_THEME.border,
//     },
//     scoreRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//     },
//     scoreBox: {
//         width: "48%",
//         backgroundColor: GOLD_THEME.white,
//         borderRadius: 16,
//         padding: 14,
//         alignItems: "center",
//     },
//     scoreLabel: {
//         color: GOLD_THEME.textSecondary,
//         fontSize: 12,
//     },
//     scoreValue: {
//         fontSize: 22,
//         fontWeight: "900",
//         color: GOLD_THEME.success,
//         marginTop: 6,
//     },
//     bureauStatus: {
//         marginTop: 10,
//         fontWeight: "700",
//         color: GOLD_THEME.accentStrong,
//     },
//     emiCard: {
//         backgroundColor: GOLD_THEME.panel,
//         borderRadius: 22,
//         padding: 16,
//         marginBottom: 12,
//         borderWidth: 1,
//         borderColor: GOLD_THEME.border,
//     },
//     emiTitle: {
//         color: GOLD_THEME.textPrimary,
//         fontWeight: "800",
//         marginBottom: 10,
//     },
//     payBtn: {
//         backgroundColor: GOLD_THEME.accentStrong,
//         paddingVertical: 14,
//         borderRadius: 18,
//         alignItems: "center",
//         marginTop: 4,
//     },
//     payBtnText: {
//         color: GOLD_THEME.white,
//         fontWeight: "800",
//         fontSize: 16,
//     },
//     breakupBtn: {
//         alignItems: "center",
//         marginVertical: 14,
//     },
//     breakupText: {
//         color: GOLD_THEME.accentStrong,
//         fontWeight: "800",
//     },
//     breakupCard: {
//         backgroundColor: GOLD_THEME.panel,
//         borderRadius: 22,
//         padding: 12,
//         marginBottom: 20,
//         borderWidth: 1,
//         borderColor: GOLD_THEME.border,
//     },
//     breakupRow: {
//         backgroundColor: GOLD_THEME.panelSoft,
//         borderRadius: 16,
//         padding: 14,
//         marginBottom: 10,
//         borderLeftWidth: 4,
//         borderLeftColor: GOLD_THEME.accentStrong,
//     },
//     month: {
//         fontWeight: "800",
//         color: GOLD_THEME.textPrimary,
//         marginBottom: 8,
//     },
//     amountRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         marginBottom: 4,
//     },
//     amountLabel: {
//         fontWeight: "700",
//     },
//     amountValue: {
//         fontWeight: "800",
//     },
// });

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },

    container: {
        flex: 1,
    },

    content: {
        padding: 16,
        paddingBottom: 28,
    },

    flexOne: {
        flex: 1,
    },

    /* ================= HEADER ================= */
    headerCard: {
        borderRadius: 26,
        padding: 18,
        marginBottom: 16,
        backgroundColor: "rgba(255, 248, 220, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    customerName: {
        fontSize: 20,
        fontWeight: "800",
        color: "#F8FAFC",
    },

    customerId: {
        fontSize: 12,
        color: "#9FB0C5",
        marginTop: 4,
    },

    headerSubtitle: {
        marginTop: 8,
        color: "#CFD8E3",
        fontSize: 13,
    },

    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },

    statusText: {
        fontWeight: "800",
        fontSize: 11,
    },

    /* ================= CARD ================= */
    card: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 22,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "transparent",
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#9FB0C5",
        marginBottom: 10,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },

    /* ================= INFO ================= */
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    label: {
        color: "#9FB0C5",
        fontSize: 12,
    },

    value: {
        fontWeight: "700",
        color: "#F8FAFC",
        fontSize: 12,
    },

    divider: {
        height: 1,
        backgroundColor: "rgba(255,255,255,0.08)",
        marginVertical: 8,
    },

    /* ================= GRID ================= */
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    gridItem: {
        width: "48%",
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
    },

    gridLabel: {
        fontSize: 11,
        color: "#9FB0C5",
    },

    gridValue: {
        fontWeight: "800",
        color: "#F8FAFC",
        marginTop: 4,
        fontSize: 12,
    },

    /* ================= CREDIT ================= */
    creditCard: {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 22,
        padding: 16,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
    },

    scoreRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    scoreBox: {
        width: "48%",
        backgroundColor: "rgba(244, 201, 93, 0.18)",
        borderRadius: 16,
        padding: 14,
        alignItems: "center",
    },

    scoreLabel: {
        color: "#9FB0C5",
        fontSize: 11,
    },

    scoreValue: {
        fontSize: 20,
        fontWeight: "900",
        color: "#F4C95D",
        marginTop: 6,
    },

    bureauStatus: {
        marginTop: 10,
        fontWeight: "700",
        color: "#F4C95D",
    },

    /* ================= EMI ================= */
    emiCard: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 22,
        padding: 16,
        marginBottom: 12,
    },

    emiTitle: {
        color: "#F8FAFC",
        fontWeight: "800",
        marginBottom: 10,
    },

    payBtn: {
        backgroundColor: "#F4C95D",
        paddingVertical: 14,
        borderRadius: 18,
        alignItems: "center",
        marginTop: 6,
    },

    payBtnText: {
        color: "#08111F",
        fontWeight: "800",
        fontSize: 15,
    },

    breakupBtn: {
        alignItems: "center",
        marginVertical: 14,
    },

    breakupText: {
        color: "#F4C95D",
        fontWeight: "800",
    },

    breakupCard: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 22,
        padding: 12,
        marginBottom: 20,
    },

    breakupRow: {
        backgroundColor: "rgba(255,255,255,0.06)",
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        borderLeftWidth: 3,
        borderLeftColor: "#F4C95D",
    },

    month: {
        fontWeight: "800",
        color: "#F8FAFC",
        marginBottom: 6,
    },

    amountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 3,
    },

    amountLabel: {
        fontSize: 11,
        color: "#9FB0C5",
    },

    amountValue: {
        fontSize: 11,
        fontWeight: "700",
    },
});