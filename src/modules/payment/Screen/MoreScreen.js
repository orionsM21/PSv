import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    SectionList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Switch,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

import { PAYMENT_THEME } from "../theme/paymentTheme";

/**
 * -----------------------------
 * SETTINGS CONFIG (Scalable)
 * -----------------------------
 */
const SETTINGS_CONFIG = [
    {
        id: "security",
        title: "Security",
        data: [
            { id: "change_password", icon: "lock-reset", label: "Change Password", type: "nav" },
            { id: "biometric", icon: "fingerprint", label: "Biometric Login", type: "toggle" },
            { id: "devices", icon: "shield-account", label: "Manage Devices", type: "nav" },
        ],
    },
    {
        id: "preferences",
        title: "Preferences",
        data: [
            { id: "theme", icon: "theme-light-dark", label: "Dark Mode", type: "toggle" },
            { id: "language", icon: "translate", label: "Language", type: "nav" },
        ],
    },
    {
        id: "support",
        title: "Support",
        data: [
            { id: "support", icon: "headset", label: "Contact Support", type: "nav" },
            { id: "about", icon: "information-outline", label: "About App", type: "nav" },
        ],
    },
    {
        id: "legal",
        title: "Legal",
        data: [
            { id: "privacy", icon: "file-document-outline", label: "Privacy Policy", type: "nav" },
            { id: "terms", icon: "file-certificate-outline", label: "Terms & Conditions", type: "nav" },
        ],
    },
];

/**
 * -----------------------------
 * OPTION CARD (Optimized)
 * -----------------------------
 */
const OptionCard = React.memo(({ item, onPress, value, onToggle }) => {
    return (
        <TouchableOpacity
            style={styles.optionCard}
            activeOpacity={0.9}
            onPress={() => item.type === "nav" && onPress(item.id)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
        >
            <View style={styles.optionIconWrap}>
                <MaterialCommunityIcons
                    name={item.icon}
                    size={20}
                    color={PAYMENT_THEME.accent}
                />
            </View>

            <Text style={styles.optionLabel}>{item.label}</Text>

            {item.type === "toggle" ? (
                <Switch value={value} onValueChange={() => onToggle(item.id)} />
            ) : (
                <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={PAYMENT_THEME.textMuted}
                />
            )}
        </TouchableOpacity>
    );
});

/**
 * -----------------------------
 * MAIN SCREEN
 * -----------------------------
 */
export default function MoreScreen() {
    const navigation = useNavigation();

    // Toggle States (should come from secure storage in real app)
    const [toggles, setToggles] = useState({
        biometric: false,
        theme: false,
    });

    /**
     * -----------------------------
     * ACTION HANDLERS (Stable)
     * -----------------------------
     */
    const handleNavigate = useCallback((id) => {
        const routes = {
            change_password: "ChangePassword",
            devices: "ManageDevices",
            language: "Language",
            support: "Support",
            about: "About",
            privacy: "PrivacyPolicy",
            terms: "Terms",
        };

        if (routes[id]) {
            navigation.navigate(routes[id]);
        }
    }, [navigation]);

    const handleToggle = useCallback((id) => {
        setToggles((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));

        // TODO: persist to secure storage
    }, []);

    const confirmLogout = useCallback(() => {
        Alert.alert("Logout", "Are you sure you want to logout?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Logout",
                style: "destructive",
                onPress: async () => {
                    try {
                        // TODO: real logout flow
                        // await logoutAPI();
                        // await clearSecureStorage();
                        // reset navigation stack

                        console.log("User logged out");
                    } catch (e) {
                        console.error("Logout error", e);
                    }
                },
            },
        ]);
    }, []);

    /**
     * -----------------------------
     * RENDERERS
     * -----------------------------
     */
    const renderItem = useCallback(
        ({ item }) => (
            <OptionCard
                item={item}
                onPress={handleNavigate}
                onToggle={handleToggle}
                value={toggles[item.id]}
            />
        ),
        [handleNavigate, handleToggle, toggles]
    );

    const renderSectionHeader = useCallback(({ section }) => (
        <Text style={styles.sectionTitle}>{section.title}</Text>
    ), []);

    const keyExtractor = useCallback((item) => item.id, []);

    const ListHeader = useMemo(() => (
        <View style={styles.heroCard}>
            <Text style={styles.heroEyebrow}>Settings and Controls</Text>
            <Text style={styles.heroTitle}>More</Text>
            <Text style={styles.heroSubtitle}>
                Security, support, preferences, and policy controls in one place.
            </Text>
        </View>
    ), []);

    /**
     * -----------------------------
     * UI
     * -----------------------------
     */
    return (

        <LinearGradient colors={PAYMENT_THEME.background} style={styles.screen}>
            <SafeAreaView />
            <SectionList
                sections={SETTINGS_CONFIG}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                renderSectionHeader={renderSectionHeader}
                ListHeaderComponent={ListHeader}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                stickySectionHeadersEnabled
            />

            <TouchableOpacity
                style={styles.logoutCard}
                onPress={confirmLogout}
                activeOpacity={0.9}
            >
                <View style={styles.logoutIconWrap}>
                    <MaterialCommunityIcons
                        name="logout"
                        size={20}
                        color={PAYMENT_THEME.danger}
                    />
                </View>
                <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.disclaimer}>
                This application follows RBI-mandated security standards.
            </Text>
        </LinearGradient>
    );
}

/**
 * -----------------------------
 * STYLES
 * -----------------------------
 */
const styles = StyleSheet.create({
    screen: { flex: 1 },
    container: { padding: 16, paddingBottom: 40 },

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
    },

    sectionTitle: {
        color: PAYMENT_THEME.textPrimary,
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 10,
    },

    optionCard: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 22,
        padding: 16,
        marginBottom: 10,
        backgroundColor: PAYMENT_THEME.panel,
        borderWidth: 1,
        borderColor: PAYMENT_THEME.border,
    },
    optionIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 16,
        backgroundColor: PAYMENT_THEME.accentSoft,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    optionLabel: {
        flex: 1,
        color: PAYMENT_THEME.textPrimary,
        fontSize: 15,
        fontWeight: "700",
    },

    logoutCard: {
        borderRadius: 22,
        padding: 16,
        margin: 16,
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: PAYMENT_THEME.danger,
    },
    logoutIconWrap: {
        width: 42,
        height: 42,
        borderRadius: 16,
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
        textAlign: "center",
        color: PAYMENT_THEME.textMuted,
        fontSize: 12,
        marginBottom: 10,
    },
});