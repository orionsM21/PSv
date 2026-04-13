import React, { useCallback } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Entypo from "react-native-vector-icons/Entypo";
import LinearGradient from "react-native-linear-gradient";
import { PAYMENT_THEME } from "../theme/paymentTheme";
import { SafeAreaView } from "react-native-safe-area-context";

const PROFILE_ACTIONS = [
    { id: "password", icon: <Ionicons name="lock-closed-outline" size={20} color={PAYMENT_THEME.accent} />, label: "Change Password" },
    { id: "biometric", icon: <Ionicons name="finger-print-outline" size={20} color={PAYMENT_THEME.accent} />, label: "Enable Biometric Login" },
    { id: "devices", icon: <MaterialIcons name="security" size={20} color={PAYMENT_THEME.accent} />, label: "Manage Login Devices" },
];

const ActionCard = React.memo(({ item }) => (
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.9}>
        <View style={styles.actionIconWrap}>{item.icon}</View>
        <Text style={styles.actionText}>{item.label}</Text>
        <Ionicons name="chevron-forward" size={18} color={PAYMENT_THEME.textMuted} />
    </TouchableOpacity>
));

export default function UserScreen() {
    const user = {
        name: "Shivam Mishra",
        email: "shivam@example.com",
        phone: "+91 ••••• 43210",
        joined: "15 Jan 2024",
        avatar: "https://i.pravatar.cc/150?img=3",
    };

    const handleLogout = useCallback(() => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            { text: "Logout", style: "destructive", onPress: () => { } },
        ]);
    }, []);

    return (
   
        <LinearGradient colors={PAYMENT_THEME.background} style={styles.screen}>
            <SafeAreaView />
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.heroCard}>
                    <Text style={styles.heroEyebrow}>Profile and Security</Text>
                    <Text style={styles.heroTitle}>Account Profile</Text>
                    <Text style={styles.heroSubtitle}>
                        Manage your identity, security posture, and device access from the payments workspace.
                    </Text>
                </View>

                <View style={styles.profileCard}>
                    <Image source={{ uri: user.avatar }} style={styles.avatar} />
                    <Text style={styles.name}>{user.name}</Text>
                    <Text style={styles.email}>{user.email}</Text>
                    <Text style={styles.phone}>{user.phone}</Text>

                    <View style={styles.memberRow}>
                        <Entypo name="calendar" size={16} color={PAYMENT_THEME.accent} />
                        <Text style={styles.memberText}>{`Member since ${user.joined}`}</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Security</Text>
                {PROFILE_ACTIONS.map(item => (
                    <ActionCard key={item.id} item={item} />
                ))}

                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.9}>
                    <View style={styles.logoutIconWrap}>
                        <Ionicons name="exit-outline" size={20} color={PAYMENT_THEME.danger} />
                    </View>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

                <Text style={styles.disclaimer}>
                    Your personal data is encrypted and protected in line with RBI-aligned security expectations.
                </Text>
            </ScrollView>
        </LinearGradient>
       
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    container: {
        padding: 16,
        paddingBottom: 28,
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
    profileCard: {
        borderRadius: 28,
        padding: 20,
        alignItems: "center",
        backgroundColor: PAYMENT_THEME.panel,
        borderWidth: 1,
        borderColor: PAYMENT_THEME.border,
        marginBottom: 18,
    },
    avatar: {
        width: 92,
        height: 92,
        borderRadius: 46,
        marginBottom: 14,
    },
    name: {
        color: PAYMENT_THEME.textPrimary,
        fontSize: 22,
        fontWeight: "800",
    },
    email: {
        marginTop: 4,
        color: PAYMENT_THEME.textSecondary,
        fontSize: 14,
    },
    phone: {
        marginTop: 4,
        color: PAYMENT_THEME.textMuted,
        fontSize: 14,
    },
    memberRow: {
        marginTop: 16,
        borderRadius: 999,
        backgroundColor: PAYMENT_THEME.accentSoft,
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    memberText: {
        marginLeft: 8,
        color: PAYMENT_THEME.textPrimary,
        fontSize: 13,
        fontWeight: "700",
    },
    sectionTitle: {
        color: PAYMENT_THEME.textPrimary,
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 12,
    },
    actionCard: {
        borderRadius: 22,
        padding: 16,
        marginBottom: 10,
        backgroundColor: PAYMENT_THEME.panel,
        borderWidth: 1,
        borderColor: PAYMENT_THEME.border,
        flexDirection: "row",
        alignItems: "center",
    },
    actionIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 16,
        backgroundColor: PAYMENT_THEME.accentSoft,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    actionText: {
        flex: 1,
        color: PAYMENT_THEME.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },
    logoutButton: {
        marginTop: 8,
        borderRadius: 22,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(252,165,165,0.34)",
        backgroundColor: "rgba(252,165,165,0.06)",
        flexDirection: "row",
        alignItems: "center",
    },
    logoutIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 16,
        backgroundColor: "rgba(252,165,165,0.12)",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    logoutText: {
        color: PAYMENT_THEME.danger,
        fontSize: 15,
        fontWeight: "800",
    },
    disclaimer: {
        marginTop: 24,
        color: PAYMENT_THEME.textMuted,
        fontSize: 12,
        lineHeight: 18,
        textAlign: "center",
        marginBottom: 8,
    },
});
