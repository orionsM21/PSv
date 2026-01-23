import React, { useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    LayoutAnimation,
    UIManager,
    Platform,
} from "react-native";

if (Platform.OS === "android") {
    UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const CustomerDetails = ({ route }) => {
    const { customer } = route.params;
    const { loan } = customer;
    console.log(loan, customer, 'loanloan')
    const [showBreakup, setShowBreakup] = useState(false);

    /* ===== STATUS ===== */
    const statusStyle =
        loan.status === "Active"
            ? styles.active
            : loan.status === "Closed"
                ? styles.closed
                : styles.pending;

    /* ===== EMI CALC ===== */
    const calculateEMI = (P, rate, months) => {
        const r = rate / 12 / 100;
        return Math.round(
            (P * r * Math.pow(1 + r, months)) /
            (Math.pow(1 + r, months) - 1)
        );
    };

    const emiSchedule = useMemo(() => {
        const principal = Number(loan.disbursedAmount || 0);
        const rate = Number(loan.interestRate || 0);
        const tenure = Number(loan.tenure || 0);

        if (!principal || !rate || !tenure) return [];

        // ✅ STEP 1: Calculate EMI ONCE
        const monthlyRate = rate / 12 / 100;

        const emi = Math.round(
            (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) /
            (Math.pow(1 + monthlyRate, tenure) - 1)
        );

        // ✅ STEP 2: Generate schedule
        let balance = principal;

        return Array.from({ length: tenure }).map((_, i) => {
            const interest = Math.round(balance * monthlyRate);
            const principalPaid = emi - interest;
            balance -= principalPaid;

            return {
                month: i + 1,
                emi,
                principalPaid,
                interest,
                balance: Math.max(balance, 0),
            };
        });
    }, [loan]);


    const toggleBreakup = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowBreakup(prev => !prev);
    };
    const outstanding =
        emiSchedule.length > 0
            ? emiSchedule[emiSchedule.length - 1].balance
            : 0;

    return (
        <ScrollView style={styles.container}>

            {/* ===== HEADER ===== */}
            <View style={styles.headerCard}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.customerName}>{customer.name}</Text>
                        <Text style={styles.customerId}>ID • {customer.customerId}</Text>
                    </View>

                    <View style={[styles.statusPill, statusStyle]}>
                        <Text style={styles.statusText}>{loan.status}</Text>
                    </View>
                </View>
            </View>

            {/* ===== CUSTOMER PROFILE ===== */}
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

            {/* ===== CREDIT ===== */}
            <View style={styles.creditCard}>
                <Text style={styles.sectionTitle}>Credit Bureau</Text>
                <View style={styles.scoreRow}>
                    <Score label="CIBIL" value={customer.cibil} />
                    <Score label="CRIF" value={customer.crif} />
                </View>
                <Text style={styles.bureauStatus}>
                    Bureau Status: {customer.bureauStatus}
                </Text>
            </View>

            {/* ===== FINANCIALS ===== */}
            <Card title="Loan Financials">
                <Info label="Applied Amount" value={`₹ ${loan.appliedAmount}`} />
                <Info label="Approved Amount" value={`₹ ${loan.approvedAmount}`} />
                <Info label="Disbursed Amount" value={`₹ ${loan.disbursedAmount}`} />
                <Info label="Processing Fee" value={`₹ ${loan.processingFee}`} />
                <Divider />
                <Info
                    label="Net Disbursal"
                    value={`₹ ${loan.disbursedAmount - loan.processingFee}`}
                />
            </Card>

            {/* ===== LOAN STATUS ===== */}
            <Card title="Loan Status">
                <Grid>
                    <GridItem label="Product" value={loan.product} />
                    <GridItem label="Loan Type" value={loan.loanType} />
                    <GridItem label="Start Date" value={loan.startDate} />
                    <GridItem label="Next EMI Due" value={loan.nextEmiDate} />
                    <GridItem label="DPD" value={`${loan.dpd} Days`} />
                    <GridItem label="Outstanding" value={`₹ ${outstanding}`} />
                </Grid>
            </Card>

            {/* ===== EMI SUMMARY ===== */}
            <View style={styles.emiCard}>
                <Text style={styles.emiTitle}>EMI Summary</Text>
                <Info label="Monthly EMI" value={`₹ ${emiSchedule[0]?.emi}`} />
                <Info label="Tenure" value={`${loan.tenure} Months`} />
            </View>

            {/* ===== EMI BREAKUP ===== */}
            <TouchableOpacity style={styles.breakupBtn} onPress={toggleBreakup}>
                <Text style={styles.breakupText}>
                    {showBreakup ? "Hide EMI Breakup ▲" : "View EMI Breakup ▼"}
                </Text>
            </TouchableOpacity>

            {showBreakup && (
                <View style={styles.breakupCard}>
                    {emiSchedule.map(item => (
                        <View key={item.month} style={styles.breakupRow}>
                            <Text style={styles.month}>Month {item.month}</Text>

                            <Row label="Principal" value={`₹ ${item.principalPaid}`} color="#16A34A" />
                            <Row label="Interest" value={`₹ ${item.interest}`} color="#DC2626" />
                            <Row label="Balance" value={`₹ ${item.balance}`} color="#1E3A8A" />
                        </View>
                    ))}
                </View>
            )}

        </ScrollView>
    );
};

/* ================= COMPONENTS ================= */

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

const Grid = ({ children }) => (
    <View style={styles.grid}>{children}</View>
);

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

/* ================= STYLES ================= */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F6FA", padding: 16 },

    headerCard: {
        backgroundColor: "#1E40AF",
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
    },

    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    customerName: { fontSize: 22, fontWeight: "800", color: "#fff" },
    customerId: { fontSize: 12, color: "#BFDBFE", marginTop: 6 },

    statusPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
    },

    statusText: { fontWeight: "700", color: "#fff" },

    active: { backgroundColor: "#16A34A" },
    closed: { backgroundColor: "#6B7280" },
    pending: { backgroundColor: "#F59E0B" },

    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: "800",
        marginBottom: 12,
    },

    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },

    label: { color: "#64748B" },
    value: { fontWeight: "700", color: "#0F172A" },

    divider: { height: 1, backgroundColor: "#E5E7EB", marginVertical: 8 },

    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },

    gridItem: {
        width: "48%",
        backgroundColor: "#F8FAFC",
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },

    gridLabel: { fontSize: 12, color: "#64748B" },
    gridValue: { fontWeight: "800", color: "#111111", marginTop: 4 },

    creditCard: {
        backgroundColor: "#ECFEFF",
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
    },

    scoreRow: {
        flexDirection: "row",
        justifyContent: "space-between",
    },

    scoreBox: {
        width: "48%",
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 14,
        alignItems: "center",
    },

    scoreLabel: { color: "#64748B" },
    scoreValue: { fontSize: 22, fontWeight: "900", color: "#15803D" },

    bureauStatus: {
        marginTop: 10,
        fontWeight: "700",
        color: "#166534",
    },

    emiCard: {
        backgroundColor: "#FFF7ED",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },

    emiTitle: { fontWeight: "800", marginBottom: 10 },

    breakupBtn: { alignItems: "center", marginBottom: 10 },

    breakupText: { color: "#2563EB", fontWeight: "700" },

    breakupCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        marginBottom: 20,
    },

    breakupRow: {
        backgroundColor: "#F8FAFC",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#2563EB",
    },

    month: { fontWeight: "800", marginBottom: 8 },

    amountRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 4,
    },

    amountLabel: { fontWeight: "700" },
    amountValue: { fontWeight: "800" },
});

export default CustomerDetails;
