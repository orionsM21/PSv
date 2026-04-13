import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet, Alert
} from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { DrawerContext } from "../DrawerContext";
import { useDispatch } from "react-redux";


import { logout, logoutOnly } from "../../redux/moduleSlice";
const VEHICLE_DRAWER = {
    title: "Vehicle Loan", subtitle: "Auto Finance System",
    avatar: "V",
    menus: [
        { label: "Dashboard", route: "Dashboard", icon: "speedometer-outline" },
        { label: "Customers", route: "Customers", icon: "people-outline" },
        { label: "Applications", route: "Applications", icon: "car-outline" },
        { label: "Profile", route: "Profile", icon: "person-circle-outline" },
    ],
};
export default function VehicleDrawerUI() {
    const navigation = useNavigation();
    const { closeDrawer } = React.useContext(DrawerContext);
    const dispatch = useDispatch();

    const activeRoute = useNavigationState(
        state => state?.routes[state.index]?.name
    );

    const go = (screen) => {
        closeDrawer();
        navigation.navigate(screen);
    };

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Where do you want to go?",
            [
                {
                    text: "Module Selector",
                    onPress: async () => {
                        closeDrawer();

                        // wait for drawer animation to finish
                        await new Promise(resolve => setTimeout(resolve, 250));

                        dispatch(logout());
                    },
                },
                {
                    text: "Login Again",
                    onPress: async () => {
                        closeDrawer();

                        await new Promise(resolve => setTimeout(resolve, 250));

                        dispatch(logoutOnly());
                    },
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
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>V</Text>
                </View>

                <Text style={styles.title}>Vehicle Loan</Text>
                <Text style={styles.subTitle}>Auto Finance System</Text>
            </View>

            {/* MENU */}
            <View style={styles.menu}>
                {VEHICLE_DRAWER.menus.map(item => {
                    const active = activeRoute === item.route;

                    return (
                        <TouchableOpacity
                            key={item.route}
                            onPress={() => go(item.route)}
                            style={[
                                styles.menuItem,
                                active && styles.menuItemActive,
                            ]}
                        >
                            <Icon
                                name={item.icon}
                                size={22}
                                color={active ? "#1E3A8A" : "#64748B"}
                            />
                            <Text
                                style={[
                                    styles.menuText,
                                    active && styles.menuTextActive,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>


            {/* LOGOUT */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Icon name="log-out-outline" size={20} color="#fff" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#F1F5F9",
    },

    header: {
        marginBottom: 24,
    },

    avatar: {
        height: 56,
        width: 56,
        borderRadius: 28,
        backgroundColor: "#1E3A8A",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    avatarText: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "700",
    },

    title: {
        fontSize: 20,
        fontWeight: "700",
        color: "#1642AA",
    },

    subTitle: {
        fontSize: 13,
        color: "#010811",
    },

    menu: {
        marginTop: 20,
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: "#FFFFFF",
    },

    menuItemActive: {
        backgroundColor: "#DBEAFE",
        borderLeftWidth: 4,
        borderLeftColor: "#1E3A8A",
    },

    menuText: {
        marginLeft: 12,
        fontSize: 15,
        color: "#1F2022",
        fontWeight: "500",
    },

    menuTextActive: {
        color: "#1E3A8A",
        fontWeight: "700",
    },

    logoutBtn: {
        marginTop: "auto",
        backgroundColor: "#DC2626",
        paddingVertical: 14,
        borderRadius: 12,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },

    logoutText: {
        color: "#fff",
        marginLeft: 8,
        fontSize: 15,
        fontWeight: "600",
    },
});



