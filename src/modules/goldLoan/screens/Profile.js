import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useDispatch } from "react-redux";

import LinearGradient from "react-native-linear-gradient";
import Icon from "react-native-vector-icons/Ionicons";
import { logout, logoutOnly } from "../../../redux/moduleSlice";

const Profile = () => {
  const dispatch = useDispatch();

  const user = {
    name: "Rahul Verma",
    role: "Agent",
    email: "rahul@company.com",
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Where do you want to go?",
      [
        {
          text: "Module Selector",
          onPress: () => dispatch(logout()),
        },
        {
          text: "Login Again",
          onPress: () => dispatch(logoutOnly()),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient
        colors={["#2563EB", "#1E40AF"]}
        style={styles.header}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.name.charAt(0)}
          </Text>
        </View>

        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.role}>{user.role}</Text>
      </LinearGradient>

      {/* DETAILS */}
      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user.email}</Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Role</Text>
        <Text style={styles.value}>{user.role}</Text>
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Icon name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  header: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },

  avatar: {
    height: 80,
    width: 80,
    borderRadius: 40,
    backgroundColor: "#1E3A8A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },

  avatarText: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "700",
  },

  name: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  role: {
    color: "#CBD5E1",
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 16,
    padding: 16,
    elevation: 3,
  },

  label: {
    color: "#6B7280",
    fontSize: 13,
  },

  value: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 12,
  },

  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 12,
  },

  logoutBtn: {
    marginTop: 20,
    marginHorizontal: 16,
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
