import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
    FlatList,

    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { GOLD_THEME } from "../theme/goldTheme";
import LinearGradient from "react-native-linear-gradient";
import CustomHeader from "../../../Drawer/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";

const MOCK_DATA = [
    {
        id: "1",
        name: "Rahul Sharma",
        phone: "9876543210",
        customerId: "GL-1001",
        branch: "Mumbai",
        city: "Mumbai",
        pincode: "400001",
        customerType: "Individual",
        riskSegment: "Low Risk",
        cibil: 782,
        crif: 768,
        bureauStatus: "Approved",
        loan: {
            loanId: "LN-9001",
            appliedAmount: 160000,
            approvedAmount: 150000,
            disbursedAmount: 148000,
            processingFee: 2000,
            netDisbursal: 146000,
            tenure: 12,
            ltv: "75%",
            status: "Active",
            goldWeight: "45 gm",
            interestRate: 1.2,
            product: "Gold Loan",
            loanType: "Term Loan",
            startDate: "01 Jan 2026",
            nextEmiDate: "01 Feb 2026",
            dpd: 0,
        },
    },
    {
        id: "2",
        name: "Amit Verma",
        phone: "9123456789",
        customerId: "GL-1002",
        branch: "Delhi",
        city: "New Delhi",
        pincode: "110001",
        customerType: "Self Employed",
        riskSegment: "Medium Risk",
        cibil: 742,
        crif: 695,
        bureauStatus: "Review Required",
        loan: {
            loanId: "LN-9002",
            appliedAmount: 100000,
            approvedAmount: 90000,
            disbursedAmount: 88000,
            processingFee: 2000,
            netDisbursal: 86000,
            tenure: 6,
            ltv: "70%",
            status: "Pending",
            goldWeight: "28 gm",
            interestRate: 1.3,
            product: "Gold Loan",
            loanType: "Short Term",
            startDate: "10 Jan 2026",
            nextEmiDate: "10 Feb 2026",
            dpd: 5,
        },
    },
];

const statusPalette = {
    Active: { bg: "rgba(47,133,90,0.14)", text: GOLD_THEME.success },
    Pending: { bg: "rgba(192,122,23,0.16)", text: GOLD_THEME.warning },
    Closed: { bg: "rgba(156,135,116,0.18)", text: GOLD_THEME.textSecondary },
};

const CustomerItem = React.memo(({ item, onPress }) => {
    const palette = statusPalette[item.loan.status] || statusPalette.Pending;

    return (
        <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={() => onPress(item)}>
            <View style={styles.rowBetween}>
                <View style={styles.flexOne}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.customerId}>{`${item.customerId} • ${item.branch}`}</Text>
                </View>

                <View style={[styles.statusPill, { backgroundColor: palette.bg }]}>
                    <Text style={[styles.statusText, { color: palette.text }]}>{item.loan.status}</Text>
                </View>
            </View>

            <Text style={styles.subText}>{`Phone ${item.phone}`}</Text>

            <View style={styles.loanBox}>
                <View style={styles.loanRow}>
                    <Text style={styles.loanAmount}>{`Rs ${item.loan.disbursedAmount.toLocaleString("en-IN")}`}</Text>
                    <Text style={styles.loanTenure}>{`${item.loan.tenure} months`}</Text>
                </View>

                <Text style={styles.loanMeta}>{`Loan ID ${item.loan.loanId} • LTV ${item.loan.ltv}`}</Text>
                <Text style={styles.loanMeta}>{`Gold ${item.loan.goldWeight} • ROI ${item.loan.interestRate}% / month`}</Text>
            </View>
        </TouchableOpacity>
    );
});

const CustomerList = () => {
    const navigation = useNavigation();
    const [customers] = useState(MOCK_DATA);
    const [search, setSearch] = useState("");
    const [refreshing, setRefreshing] = useState(false);
    const filteredCustomers = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return customers;

        return customers.filter(
            customer =>
                customer.name.toLowerCase().includes(keyword) ||
                customer.phone.includes(keyword) ||
                customer.customerId.toLowerCase().includes(keyword)
        );
    }, [customers, search]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 900);
    }, []);

    const onCustomerPress = useCallback(
        customer => {
            navigation.navigate("CustomerDetails", { customer });
        },
        [navigation]
    );
    const renderItem = useCallback(
        ({ item }) => (
            <CustomerItem item={item} onPress={onCustomerPress} />
        ),
        [onCustomerPress]
    );
    return (
        <LinearGradient
            colors={["#1A1207", "#3C2410", "#140D05"]}
            style={{ flex: 1 }}
        >
            <StatusBar
                translucent
                backgroundColor="transparent"
                barStyle="light-content"
            />

            <SafeAreaView style={{ flex: 1 }}>

                {/* HEADER */}
                <CustomHeader
                    title="Customers"
                    subtitle="Gold Loan Portfolio"
                    onBack={() => navigation.goBack()}
                    rightIcon="filter-outline"
                    onRightPress={() => console.log("Filter")}
                />

                {/* LIST */}
                <FlatList
                    data={filteredCustomers}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    initialNumToRender={8}
                    windowSize={5}
                    removeClippedSubviews
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor="#F4C95D"
                        />
                    }
                    ListHeaderComponent={
                        <View>
                            <View style={styles.heroCard}>
                                <Text style={styles.heroEyebrow}>Customer Portfolio</Text>
                                <Text style={styles.heroTitle}>Gold Loan Customers</Text>
                                <Text style={styles.heroSubtitle}>
                                    Review live accounts, borrower quality, and active loan exposure.
                                </Text>
                            </View>

                            <View style={styles.searchShell}>
                                <Ionicons
                                    name="search-outline"
                                    size={18}
                                    color="#9FB0C5"
                                    style={styles.searchIcon}
                                />
                                <TextInput
                                    placeholder="Search by name, phone, or customer ID"
                                    placeholderTextColor="#9FB0C5"
                                    value={search}
                                    onChangeText={setSearch}
                                    style={styles.searchInput}
                                />
                            </View>
                        </View>
                    }
                    contentContainerStyle={styles.content}
                    showsVerticalScrollIndicator={false}
                />

            </SafeAreaView>
        </LinearGradient>
    );
};

export default CustomerList;

// const styles = StyleSheet.create({

//     screen: {
//         flex: 1,
//     },

//     content: {
//         padding: 16,
//         paddingBottom: 28,
//     },

//     /* ================= HERO ================= */
//     heroCard: {
//         borderRadius: 26,
//         padding: 18,
//         backgroundColor: "rgba(255,255,255,0.06)",
//         borderWidth: 1,
//         borderColor: "rgba(255,255,255,0.1)",
//         marginBottom: 14,
//     },

//     heroEyebrow: {
//         color: "#F4C95D",
//         fontSize: 11,
//         fontWeight: "700",
//         textTransform: "uppercase",
//         letterSpacing: 0.8,
//     },

//     heroTitle: {
//         marginTop: 6,
//         color: "#F8FAFC",
//         fontSize: 24,
//         fontWeight: "800",
//     },

//     heroSubtitle: {
//         marginTop: 6,
//         color: "#CFD8E3",
//         fontSize: 13,
//         lineHeight: 18,
//     },

//     /* ================= SEARCH ================= */
//     searchShell: {
//         height: 52,
//         borderRadius: 18,
//         backgroundColor: "rgba(255,255,255,0.05)",
//         borderWidth: 1,
//         borderColor: "rgba(255,255,255,0.08)",
//         flexDirection: "row",
//         alignItems: "center",
//         paddingHorizontal: 14,
//         marginBottom: 12,
//     },

//     searchIcon: {
//         marginRight: 10,
//     },

//     searchInput: {
//         flex: 1,
//         color: "#F8FAFC",
//         fontSize: 14,
//     },

//     /* ================= CARD ================= */
//     card: {
//         backgroundColor: "rgba(255,255,255,0.05)",
//         borderRadius: 18,
//         padding: 16,
//         marginBottom: 12,
//         borderWidth: 1,
//         borderColor: "transparent",
//     },

//     rowBetween: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//     },

//     flexOne: {
//         flex: 1,
//     },

//     name: {
//         fontSize: 15,
//         fontWeight: "800",
//         color: "#F8FAFC",
//     },

//     customerId: {
//         fontSize: 12,
//         color: "#9FB0C5",
//         marginTop: 3,
//     },

//     subText: {
//         fontSize: 12,
//         color: "#CFD8E3",
//         marginTop: 6,
//     },

//     /* ================= STATUS ================= */
//     statusPill: {
//         paddingHorizontal: 12,
//         paddingVertical: 6,
//         borderRadius: 999,
//     },

//     statusText: {
//         fontSize: 11,
//         fontWeight: "800",
//     },

//     /* ================= LOAN ================= */
//     loanBox: {
//         marginTop: 10,
//         padding: 12,
//         borderRadius: 14,
//         backgroundColor: "rgba(255,255,255,0.06)",
//     },

//     loanRow: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         alignItems: "center",
//     },

//     loanAmount: {
//         fontSize: 16,
//         fontWeight: "900",
//         color: "#F8FAFC",
//     },

//     loanTenure: {
//         fontSize: 11,
//         color: "#9FB0C5",
//         fontWeight: "700",
//     },

//     loanMeta: {
//         fontSize: 11,
//         color: "#CFD8E3",
//         marginTop: 4,
//     },

//     emptyText: {
//         textAlign: "center",
//         color: "#9FB0C5",
//         fontSize: 14,
//         marginTop: 24,
//     },
// });



const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },

    content: {
        padding: 16,
        paddingBottom: 28,
    },

    /* ================= HERO ================= */
    heroCard: {
        borderRadius: 26,
        padding: 18,
        backgroundColor: "rgba(255, 248, 220, 0.12)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
        marginBottom: 14,
    },

    heroEyebrow: {
        color: "#F4C95D",
        fontSize: 11,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },

    heroTitle: {
        marginTop: 6,
        color: "#F8FAFC",
        fontSize: 24,
        fontWeight: "800",
    },

    heroSubtitle: {
        marginTop: 6,
        color: "#CFD8E3",
        fontSize: 13,
        lineHeight: 18,
    },

    /* ================= SEARCH ================= */
    searchShell: {
        height: 52,
        borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        marginBottom: 12,
    },

    searchIcon: {
        marginRight: 10,
    },

    searchInput: {
        flex: 1,
        color: "#F8FAFC",
        fontSize: 14,
    },

    /* ================= CARD ================= */
    card: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "transparent",
    },

    rowBetween: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    flexOne: {
        flex: 1,
    },

    name: {
        fontSize: 15,
        fontWeight: "800",
        color: "#F8FAFC",
    },

    customerId: {
        fontSize: 12,
        color: "#9FB0C5",
        marginTop: 3,
    },

    subText: {
        fontSize: 12,
        color: "#CFD8E3",
        marginTop: 6,
    },

    /* ================= STATUS ================= */
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
    },

    statusText: {
        fontSize: 11,
        fontWeight: "800",
    },

    /* ================= LOAN ================= */
    loanBox: {
        marginTop: 10,
        padding: 12,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.06)",
    },

    loanRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    loanAmount: {
        fontSize: 16,
        fontWeight: "900",
        color: "#F4C95D", // 🔥 highlight key number
    },

    loanTenure: {
        fontSize: 11,
        color: "#9FB0C5",
        fontWeight: "700",
    },

    loanMeta: {
        fontSize: 11,
        color: "#CFD8E3",
        marginTop: 4,
    },

    emptyText: {
        textAlign: "center",
        color: "#9FB0C5",
        fontSize: 14,
        marginTop: 24,
    },
});
