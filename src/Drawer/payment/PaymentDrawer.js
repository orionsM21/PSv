import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  InteractionManager,
  Pressable,
} from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { DrawerContext } from "../DrawerContext";
import { useDispatch } from "react-redux";
import { logout, logoutOnly } from "../../redux/moduleSlice";

const MenuItem = React.memo(({ item, active, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        active && styles.menuItemActive,
        pressed && styles.menuItemPressed,
      ]}
    >
      {active && <View style={styles.activeBar} />}

      <Ionicons
        name={item.icon}
        size={22}
        color={active ? "#1A1815" : "#FACC15"}
      />

      <Text style={[styles.menuText, active && styles.menuTextActive]}>
        {item.label}
      </Text>

      {active && <View style={styles.activeDot} />}
    </Pressable>
  );
});

export default function PaymentDrawer() {
  const navigation = useNavigation();
  const { closeDrawer } = React.useContext(DrawerContext);
  const dispatch = useDispatch();

  const activeRoute = useNavigationState(
    state => state?.routes?.[state.index]?.name ?? ""
  );

  const MENU = React.useMemo(
    () => [
      { label: "Dashboard", icon: "home-outline", route: "Dashboard" },
      { label: "Customers", icon: "people-outline", route: "Customers" },
      { label: "Recent Transactions", icon: "receipt-outline", route: "RecentTransaction" },
      { label: "Fund Transfer", icon: "swap-horizontal-outline", route: "FundTransfer" },
      { label: "Profile", icon: "person-circle-outline", route: "User" },
    ],
    []
  );

  const go = React.useCallback(
    route => {
      closeDrawer();
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate(route);
      });
    },
    [navigation, closeDrawer]
  );

  const handleLogout = React.useCallback(() => {
    Alert.alert(
      "Logout",
      "Where do you want to go?",
      [
        {
          text: "Module Selector",
          onPress: () => {
            closeDrawer();
            InteractionManager.runAfterInteractions(() => dispatch(logout()));
          },
        },
        {
          text: "Login Again",
          onPress: () => {
            closeDrawer();
            InteractionManager.runAfterInteractions(() => dispatch(logoutOnly()));
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }, [closeDrawer, dispatch]);

  return (
    <LinearGradient colors={["#0B0F1A", "#161A25"]} style={styles.container}>
      {/* ===== HEADER ===== */}
      <View style={styles.header}>
        <LinearGradient colors={["#FACC15", "#EAB308"]} style={styles.avatar}>
          <Ionicons name="wallet-outline" size={26} color="#1A1815" />
        </LinearGradient>

        <Text style={styles.title}>Payments</Text>
        <Text style={styles.subTitle}>Smart Digital Wallet</Text>
      </View>

      {/* ===== MENU ===== */}
      <View style={styles.menu}>
        {MENU.map(item => (
          <MenuItem
            key={item.route}
            item={item}
            active={activeRoute === item.route}
            onPress={() => go(item.route)}
          />
        ))}
      </View>

      {/* ===== FOOTER ===== */}
      <Pressable style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
  },

  /* ===== HEADER ===== */
  header: {
    marginBottom: 32,
  },

  avatar: {
    height: 60,
    width: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    elevation: 10,
    shadowColor: "#FACC15",
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#F9FAFB",
  },

  subTitle: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
  },

  /* ===== MENU ===== */
  menu: {
    marginTop: 12,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  menuItemPressed: {
    opacity: 0.85,
  },

  menuItemActive: {
    backgroundColor: "#FACC15",
    elevation: 8,
    shadowColor: "#FACC15",
    shadowOpacity: 0.6,
    shadowRadius: 12,
  },

  menuText: {
    marginLeft: 14,
    fontSize: 15,
    color: "#E5E7EB",
    fontWeight: "500",
  },

  menuTextActive: {
    color: "#1A1815",
    fontWeight: "700",
  },

  activeBar: {
    position: "absolute",
    left: 0,
    top: 8,
    bottom: 8,
    width: 4,
    borderRadius: 4,
    backgroundColor: "#1A1815",
  },

  activeDot: {
    marginLeft: "auto",
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#1A1815",
  },

  /* ===== FOOTER ===== */
  logoutBtn: {
    marginTop: "auto",
    backgroundColor: "#EF4444",
    paddingVertical: 14,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },

  logoutText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 15,
    fontWeight: "600",
  },
});
