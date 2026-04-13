import React, { useMemo, useState } from "react";
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import SpendingChart from "../components/SpendingChart";
import ChartSkeleton from "../components/ChartSkeleton";
import { getChartDataFromTransactions } from "../components/utills/spendingUtils";
import { PAYMENT_THEME } from "../theme/paymentTheme";
import { SafeAreaView } from "react-native-safe-area-context";

const ACCOUNTS = [
    { id: "acc-1", title: "Axis Bank", subtitle: "Savings Account", balance: "Rs 24,100" },
    { id: "acc-2", title: "Wallet Balance", subtitle: "Payments Wallet", balance: "Rs 3,200" },
];

const TRANSACTIONS = [
    { id: "txn-1", title: "Starbucks", amount: -240, meta: "Food" },
    { id: "txn-2", title: "Uber", amount: -310, meta: "Travel" },
    { id: "txn-3", title: "Electricity Bill", amount: -1800, meta: "Bills" },
];

const FILTERS = [7, 30];

const SectionHeader = React.memo(({ title }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
));

const AccountCard = React.memo(({ item }) => (
    <View style={styles.panelCard}>
        <View style={styles.accountIcon}>
            <Ionicons name="wallet-outline" size={18} color={PAYMENT_THEME.accent} />
        </View>
        <View style={styles.flexOne}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowMeta}>{item.subtitle}</Text>
        </View>
        <Text style={styles.rowAmount}>{item.balance}</Text>
    </View>
));

const TransactionRow = React.memo(({ item }) => (
    <View style={styles.panelCard}>
        <View style={styles.accountIcon}>
            <Ionicons
                name={item.amount < 0 ? "arrow-up-outline" : "arrow-down-outline"}
                size={18}
                color={item.amount < 0 ? PAYMENT_THEME.danger : PAYMENT_THEME.success}
            />
        </View>
        <View style={styles.flexOne}>
            <Text style={styles.rowTitle}>{item.title}</Text>
            <Text style={styles.rowMeta}>{item.meta}</Text>
        </View>
        <Text style={[styles.rowAmount, { color: item.amount < 0 ? PAYMENT_THEME.danger : PAYMENT_THEME.success }]}>
            {`${item.amount < 0 ? "-" : "+"}Rs ${Math.abs(item.amount)}`}
        </Text>
    </View>
));

export default function MoneyScreen() {
    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [filterDays, setFilterDays] = useState(7);
    const [loadingChart, setLoadingChart] = useState(false);

    const chartInput = useMemo(
        () =>
            TRANSACTIONS.map((item, index) => ({
                ...item,
                category: item.meta,
                timestamp: Date.now() - (index + 2) * 86400000,
            })),
        []
    );

    const chartData = useMemo(
        () => getChartDataFromTransactions(chartInput, filterDays),
        [chartInput, filterDays]
    );

    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1200);
    };

    const onFilterChange = days => {
        setLoadingChart(true);
        setFilterDays(days);
        setTimeout(() => setLoadingChart(false), 250);
    };

    return (

        <LinearGradient colors={PAYMENT_THEME.background} style={styles.screen}>
            <SafeAreaView />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={PAYMENT_THEME.accent} />}
            >
                <LinearGradient colors={["rgba(139,211,255,0.14)", "rgba(255,255,255,0.04)"]} style={styles.heroCard}>
                    <Text style={styles.heroEyebrow}>Portfolio Overview</Text>
                    <Text style={styles.heroTitle}>Money Hub</Text>
                    <Text style={styles.heroSubtitle}>Track balances, monitor spend trends, and move funds with one consistent payments experience.</Text>

                    <Text style={styles.balanceLabel}>Total Balance</Text>
                    <Text style={styles.balanceAmount}>Rs 54,320.50</Text>

                    <View style={styles.actionRow}>
                        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("FundTransfer")} activeOpacity={0.9}>
                            <Text style={styles.primaryButtonText}>Add Money</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate("FundTransfer")} activeOpacity={0.9}>
                            <Text style={styles.secondaryButtonText}>Send</Text>
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                <SectionHeader title="Linked Accounts" />
                {ACCOUNTS.map(item => (
                    <AccountCard key={item.id} item={item} />
                ))}

                <SectionHeader title="Recent Transactions" />
                {TRANSACTIONS.map(item => (
                    <TransactionRow key={item.id} item={item} />
                ))}

                <SectionHeader title="Spending Analytics" />
                <View style={styles.filterRow}>
                    {FILTERS.map(days => {
                        const active = filterDays === days;
                        return (
                            <TouchableOpacity
                                key={days}
                                onPress={() => onFilterChange(days)}
                                style={[styles.filterChip, active && styles.filterChipActive]}
                                activeOpacity={0.9}
                            >
                                <Text style={[styles.filterText, active && styles.filterTextActive]}>{`Last ${days} days`}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.chartPanel}>
                    {loadingChart ? <ChartSkeleton /> : <SpendingChart chartData={chartData} isDark />}
                </View>

                <SectionHeader title="Spending Insights" />
                <View style={styles.insightPanel}>
                    <Text style={styles.insightHeadline}>You spent Rs 8,420 this month.</Text>
                    <Text style={styles.insightBody}>Your biggest payment categories were food, travel, and utility bills over the selected range.</Text>
                </View>
            </ScrollView>

        </LinearGradient>

    );
}

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
    heroCard: {
        borderRadius: 28,
        padding: 20,
        borderWidth: 1,
        borderColor: PAYMENT_THEME.border,
        backgroundColor: PAYMENT_THEME.overlay,
        marginBottom: 18,
    },
    heroEyebrow: {
        color: PAYMENT_THEME.accent,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    heroTitle: {
        marginTop: 8,
        color: PAYMENT_THEME.textPrimary,
        fontSize: 28,
        fontWeight: "800",
    },
    heroSubtitle: {
        marginTop: 8,
        color: PAYMENT_THEME.textSecondary,
        fontSize: 14,
        lineHeight: 21,
    },
    balanceLabel: {
        marginTop: 18,
        color: PAYMENT_THEME.textMuted,
        fontSize: 12,
        fontWeight: "600",
    },
    balanceAmount: {
        marginTop: 8,
        color: PAYMENT_THEME.textPrimary,
        fontSize: 34,
        fontWeight: "800",
    },
    actionRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 18,
    },
    primaryButton: {
        flex: 1,
        minHeight: 50,
        borderRadius: 18,
        backgroundColor: PAYMENT_THEME.accentMint,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButtonText: {
        color: "#071321",
        fontSize: 15,
        fontWeight: "800",
    },
    secondaryButton: {
        flex: 1,
        minHeight: 50,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: PAYMENT_THEME.border,
        backgroundColor: PAYMENT_THEME.panelStrong,
        alignItems: "center",
        justifyContent: "center",
    },
    secondaryButtonText: {
        color: PAYMENT_THEME.textPrimary,
        fontSize: 15,
        fontWeight: "800",
    },
    sectionTitle: {
        marginBottom: 12,
        color: PAYMENT_THEME.textPrimary,
        fontSize: 19,
        fontWeight: "800",
        marginTop: 4,
    },
    panelCard: {
        borderRadius: 22,
        padding: 16,
        marginBottom: 12,
        backgroundColor: PAYMENT_THEME.panel,
        borderWidth: 1,
        borderColor: PAYMENT_THEME.border,
        flexDirection: "row",
        alignItems: "center",
    },
    accountIcon: {
        width: 42,
        height: 42,
        borderRadius: 16,
        backgroundColor: PAYMENT_THEME.accentSoft,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    rowTitle: {
        color: PAYMENT_THEME.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    rowMeta: {
        marginTop: 4,
        color: PAYMENT_THEME.textMuted,
        fontSize: 12,
    },
    rowAmount: {
        marginLeft: 12,
        color: PAYMENT_THEME.textPrimary,
        fontSize: 15,
        fontWeight: "800",
    },
    filterRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: PAYMENT_THEME.panel,
        borderWidth: 1,
        borderColor: PAYMENT_THEME.border,
    },
    filterChipActive: {
        backgroundColor: PAYMENT_THEME.accentSoft,
    },
    filterText: {
        color: PAYMENT_THEME.textSecondary,
        fontSize: 13,
        fontWeight: "700",
    },
    filterTextActive: {
        color: PAYMENT_THEME.accent,
    },
    chartPanel: {
        borderRadius: 24,
        padding: 14,
        backgroundColor: PAYMENT_THEME.panel,
        borderWidth: 1,
        borderColor: PAYMENT_THEME.border,
        marginBottom: 18,
    },
    insightPanel: {
        borderRadius: 24,
        padding: 18,
        backgroundColor: PAYMENT_THEME.panel,
        borderWidth: 1,
        borderColor: PAYMENT_THEME.border,
    },
    insightHeadline: {
        color: PAYMENT_THEME.textPrimary,
        fontSize: 18,
        fontWeight: "800",
    },
    insightBody: {
        marginTop: 8,
        color: PAYMENT_THEME.textSecondary,
        fontSize: 14,
        lineHeight: 21,
    },
});
