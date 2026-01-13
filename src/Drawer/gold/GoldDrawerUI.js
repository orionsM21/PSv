import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet, Alert, InteractionManager
} from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { DrawerContext } from "../DrawerContext";
import { useDispatch } from "react-redux";
import { logout, logoutOnly } from "../../redux/moduleSlice";
export default function GoldDrawerUI() {
    const navigation = useNavigation();
    const { closeDrawer } = React.useContext(DrawerContext);
    const dispatch = useDispatch();
    const activeRoute = useNavigationState(
        (state) => state.routes[state.index]?.name
    );

    const go = React.useCallback((screen) => {
        navigation.navigate(screen);
        closeDrawer();
    }, [navigation, closeDrawer]);

    const MENU = React.useMemo(() => ([
        { label: "Dashboard", icon: "grid-outline", route: "Dashboard" },
        { label: "Customers", icon: "people-outline", route: "Customers" },
        { label: "Profile", icon: "person-circle-outline", route: "Profile" },
    ]), []);


    const MenuItem = React.memo(({ item, active, onPress }) => (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            style={[styles.menuItem, active && styles.menuItemActive]}
        >
            <Icon
                name={item.icon}
                size={22}
                color={active ? "#1A1815" : "#D4AF37"}
            />
            <Text style={[styles.menuText, active && styles.menuTextActive]}>
                {item.label}
            </Text>
            {active && <View style={styles.activeDot} />}
        </TouchableOpacity>
    ));


    const handleLogout = React.useCallback(() => {
        Alert.alert(
            "Logout",
            "Where do you want to go?",
            [
                {
                    text: "Module Selector",
                    onPress: () => {
                        closeDrawer();

                        InteractionManager.runAfterInteractions(() => {
                            dispatch(logout());
                        });
                    },
                },
                {
                    text: "Login Again",
                    onPress: () => {
                        closeDrawer();

                        InteractionManager.runAfterInteractions(() => {
                            dispatch(logoutOnly());
                        });
                    },
                },
                { text: "Cancel", style: "cancel" },
            ],
            { cancelable: true }
        );
    }, [closeDrawer, dispatch]);



    return (
        <LinearGradient
            colors={["#0F0E0C", "#1A1815"]}
            style={styles.container}
        >
            {/* HEADER */}
            <View style={styles.header}>
                <LinearGradient
                    colors={["#D4AF37", "#B8962E"]}
                    style={styles.avatar}
                >
                    <Text style={styles.avatarText}>G</Text>
                </LinearGradient>

                <Text style={styles.title}>Gold Loan</Text>
                <Text style={styles.subTitle}>Premium Lending</Text>
            </View>

            {/* MENU */}
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

            {/* FOOTER */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                <Icon name="log-out-outline" size={20} color="#1A1815" />
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 22,
    },

    header: {
        marginBottom: 28,
    },

    avatar: {
        height: 56,
        width: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
        shadowColor: "#FFD700",
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 10,
    },

    avatarText: {
        color: "#1A1815",
        fontSize: 22,
        fontWeight: "800",
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#F9FAF7",
    },

    subTitle: {
        fontSize: 13,
        color: "#C7B88A",
    },

    menu: {
        marginTop: 24,
    },

    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 14,
        marginBottom: 10,
        backgroundColor: "rgba(255, 215, 0, 0.05)",
    },

    menuItemActive: {
        backgroundColor: "#D4AF37",
        shadowColor: "#FFD700",
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 6,
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

    activeDot: {
        marginLeft: "auto",
        height: 8,
        width: 8,
        borderRadius: 4,
        backgroundColor: "#1A1815",
    },

    logoutBtn: {
        marginTop: "auto",
        backgroundColor: "#B91C1C",
        paddingVertical: 14,
        borderRadius: 14,
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
