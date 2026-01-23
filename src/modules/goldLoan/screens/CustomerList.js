import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native";

/* ================= MOCK DATA ================= */
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

      tenure: 12,                 // months (number)
      ltv: "75%",
      status: "Active",

      goldWeight: "45 gm",
      interestRate: 1.2,          // monthly %

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

    cibil: 42,
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



/* ================= CUSTOMER CARD ================= */
const CustomerItem = React.memo(({ item, onPress }) => {
  const isActive = item.loan.status === "Active";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() => onPress(item)}
    >
      {/* HEADER */}
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.customerId}>
            {item.customerId} • {item.branch}
          </Text>
        </View>

        <View
          style={[
            styles.statusPill,
            isActive ? styles.active : styles.pending,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isActive ? styles.activeText : styles.pendingText,
            ]}
          >
            {item.loan.status}
          </Text>
        </View>
      </View>

      {/* CONTACT */}
      <Text style={styles.subText}>📞 {item.phone}</Text>

      {/* LOAN SUMMARY */}
      <View style={styles.loanBox}>
        <View style={styles.loanRow}>
          <Text style={styles.loanAmount}>
            ₹ {item.loan.disbursedAmount.toLocaleString()}
          </Text>
          <Text style={styles.loanTenure}>
            {item.loan.tenure} Months
          </Text>
        </View>

        <Text style={styles.loanMeta}>
          Loan ID: {item.loan.loanId} • LTV {item.loan.ltv}
        </Text>

        <Text style={styles.loanMeta}>
          Gold: {item.loan.goldWeight} • ROI {item.loan.interestRate}% / month
        </Text>
      </View>
    </TouchableOpacity>
  );
});


/* ================= MAIN SCREEN ================= */
const CustomerList = () => {
  const navigation = useNavigation();

  const [customers] = useState(MOCK_DATA);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  /* ===== SEARCH ===== */
  const filteredCustomers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return customers;

    return customers.filter(
      c =>
        c.name.toLowerCase().includes(keyword) ||
        c.phone.includes(keyword) ||
        c.customerId.toLowerCase().includes(keyword)
    );
  }, [search, customers]);

  /* ===== REFRESH ===== */
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  /* ===== NAVIGATION ===== */
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
    <View style={styles.container}>
      {/* SEARCH */}
      <TextInput
        placeholder="Search name, phone or customer ID"
        value={search}
        onChangeText={setSearch}
        style={styles.searchInput}
        placeholderTextColor="#9CA3AF"
      />

      {/* LIST */}
      <FlatList
        data={filteredCustomers}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No customers found</Text>
        }
        contentContainerStyle={
          filteredCustomers.length === 0 && styles.emptyContainer
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CustomerList;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6FA",
    padding: 16,
  },

  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    marginBottom: 12,
    elevation: 2,
  },

  /* CARD */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    elevation: 3,
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },

  customerId: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  subText: {
    fontSize: 13,
    color: "#6B7280",
    marginTop: 6,
  },

  /* STATUS */
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "800",
  },

  active: {
    backgroundColor: "#DCFCE7",
  },

  activeText: {
    color: "#166534",
  },

  pending: {
    backgroundColor: "#FEF3C7",
  },

  pendingText: {
    color: "#92400E",
  },

  /* LOAN BOX */
  loanBox: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
  },

  loanRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  loanAmount: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },

  loanTenure: {
    fontSize: 12,
    color: "#475569",
    fontWeight: "700",
  },

  loanMeta: {
    fontSize: 12,
    color: "#475569",
    marginTop: 4,
  },

  /* EMPTY */
  emptyContainer: {
    flexGrow: 1,
    justifyContent: "center",
  },

  emptyText: {
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 14,
  },
});
