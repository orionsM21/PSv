import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";

const MOCK_DATA = [
  { id: "1", name: "Rahul Sharma", phone: "9876543210" },
  { id: "2", name: "Amit Verma", phone: "9123456789" },
  { id: "3", name: "Neha Singh", phone: "9988776655" },
];

const CustomerItem = React.memo(({ item }) => {
  return (
    <TouchableOpacity style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.phone}>{item.phone}</Text>
    </TouchableOpacity>
  );
});

const CustomerList = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [customers, setCustomers] = useState(MOCK_DATA);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderItem = ({ item }) => <CustomerItem item={item} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={customers}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No customers found</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

export default CustomerList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  phone: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#9CA3AF",
  },
});
