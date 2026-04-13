import React, { useCallback } from "react";
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useDispatch } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { logout, logoutOnly } from "../../../redux/moduleSlice";
import CustomHeader from "../../../Drawer/CustomHeader";
import { SafeAreaView } from "react-native-safe-area-context";






const PROFILE_ITEMS = [
    { id: "email", label: "Email", value: "rahul@company.com", icon: "mail-outline" },
    { id: "role", label: "Role", value: "Agent", icon: "briefcase-outline" },
    { id: "branch", label: "Branch", value: "Mumbai Gold Hub", icon: "business-outline" },
];

const Action = ({ icon, label }) => (
    <TouchableOpacity style={styles.actionItem}>
        <Ionicons name={icon} size={18} color={"#F4C95D"} />
        <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
);

export default function Profile({ navigation }) {
    const dispatch = useDispatch();

    const user = {
        name: "Rahul Verma",
        role: "Agent",
    };

    const handleLogout = useCallback(() => {
        Alert.alert("Logout", "Where do you want to go?", [
            { text: "Module Selector", onPress: () => dispatch(logout()) },
            { text: "Login Again", onPress: () => dispatch(logoutOnly()) },
            { text: "Cancel", style: "cancel" },
        ]);
    }, [dispatch]);

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
                    title="Profile"
                    subtitle="Gold Loan Portfolio"
                    onBack={() => navigation.goBack()}
                    rightIcon="filter-outline"
                    onRightPress={() => console.log("Filter")}
                />

                <View style={styles.container}>

                    <ScrollView >

                        {/* HERO */}
                        <View style={styles.heroCard}>
                            <Text style={styles.heroEyebrow}>Identity and Access</Text>
                            <Text style={styles.heroTitle}>Profile</Text>
                            <Text style={styles.heroSubtitle}>
                                Manage personal identity and secure actions.
                            </Text>
                        </View>

                        {/* PROFILE CARD */}
                        <View style={styles.profileCard}>
                            <View style={styles.avatarWrap}>
                                <Text style={styles.avatarText}>{user.name.charAt(0)}</Text>
                            </View>

                            <Text style={styles.name}>{user.name}</Text>
                            <Text style={styles.role}>{user.role}</Text>

                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>Active</Text>
                            </View>
                        </View>

                        {/* QUICK ACTIONS */}
                        <View style={styles.quickActions}>
                            <Action icon="create-outline" label="Edit" />
                            <Action icon="lock-closed-outline" label="Security" />
                            <Action icon="settings-outline" label="Settings" />
                        </View>

                        {/* DETAILS */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Personal Info</Text>

                            {PROFILE_ITEMS.map(item => (
                                <View key={item.id} style={styles.infoRow}>
                                    <View style={styles.infoIcon}>
                                        <Ionicons name={item.icon} size={18} color={"#F4C95D"} />
                                    </View>

                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.infoLabel}>{item.label}</Text>
                                        <Text style={styles.infoValue}>{item.value}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        {/* APP INFO */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>App Info</Text>
                            <Text style={styles.metaText}>Version 1.0.0</Text>
                            <Text style={styles.metaText}>Build 2026.04</Text>
                        </View>

                        {/* LOGOUT */}
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <Ionicons name="log-out-outline" size={20} color="#FFF7F7" />
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>

                    </ScrollView>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 18,
    },

    /* HERO */
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
    },

    /* PROFILE */
    profileCard: {
        borderRadius: 24,
        padding: 18,
        alignItems: "center",
        marginBottom: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
    },

    avatarWrap: {
        width: 80,
        height: 80,
        borderRadius: 24,
        backgroundColor: "#F4C95D",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },

    avatarText: {
        color: "#08111F",
        fontSize: 28,
        fontWeight: "800",
    },

    name: {
        color: "#F8FAFC",
        fontSize: 18,
        fontWeight: "800",
    },

    role: {
        marginTop: 4,
        color: "#9FB0C5",
        fontSize: 12,
    },

    badge: {
        marginTop: 6,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: "rgba(244, 201, 93, 0.18)",
    },

    badgeText: {
        color: "#F4C95D",
        fontSize: 10,
        fontWeight: "700",
    },

    /* ACTIONS */
    quickActions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    actionItem: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        marginHorizontal: 4,
    },

    actionText: {
        marginTop: 6,
        fontSize: 11,
        color: "#9FB0C5",
    },

    /* DETAILS */
    section: {
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 20,
        padding: 14,
        marginBottom: 14,
    },

    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#9FB0C5",
        marginBottom: 10,
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
    },

    infoIcon: {
        width: 40,
        height: 40,
        borderRadius: 14,
        backgroundColor: "rgba(244, 201, 93, 0.18)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 10,
    },

    infoLabel: {
        color: "#9FB0C5",
        fontSize: 11,
    },

    infoValue: {
        marginTop: 2,
        color: "#F8FAFC",
        fontSize: 13,
        fontWeight: "700",
    },

    metaText: {
        color: "#9FB0C5",
        fontSize: 12,
        marginTop: 4,
    },

    /* LOGOUT */
    logoutButton: {
        borderRadius: 18,
        backgroundColor: "#C9353F",
        paddingVertical: 14,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        marginTop: 10,
    },

    logoutText: {
        marginLeft: 8,
        color: "#FFF7F7",
        fontSize: 14,
        fontWeight: "800",
    },
});