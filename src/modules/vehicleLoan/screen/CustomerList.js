import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

const MOCK_CUSTOMERS = [
  { id: "1", name: "Rahul Sharma", loanId: "VL-1021", status: "Active" },
  { id: "2", name: "Amit Verma", loanId: "VL-1022", status: "Pending" },
  { id: "3", name: "Neha Singh", loanId: "VL-1023", status: "Closed" },
];

export default function CustomerList() {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search) return MOCK_CUSTOMERS;
    return MOCK_CUSTOMERS.filter(item =>
      item.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.subText}>Loan ID: {item.loanId}</Text>
      </View>

      <View style={[
        styles.statusBadge,
        item.status === "Active" && styles.active,
        item.status === "Pending" && styles.pending,
        item.status === "Closed" && styles.closed,
      ]}>
        <Text style={styles.statusText}>{item.status}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Icon name="search-outline" size={18} color="#64748B" />
        <TextInput
          placeholder="Search customer..."
          placeholderTextColor="#94A3B8"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No customers found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    padding: 16,
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },

  searchInput: {
    marginLeft: 8,
    fontSize: 15,
    color: "#0F172A",
    flex: 1,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
  },

  subText: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },

  active: {
    backgroundColor: "#16A34A",
  },

  pending: {
    backgroundColor: "#F59E0B",
  },

  closed: {
    backgroundColor: "#DC2626",
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#64748B",
    fontSize: 14,
  },
});
