import { StyleSheet, Text, View, Pressable, Image, } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient';

const formatDashboardValue = value => {
    if (value === null || value === undefined || value === '') {
        return '0';
    }

    if (typeof value === 'number') {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: Number.isInteger(value) ? 0 : 2,
        }).format(value);
    }

    const parsedValue = Number(value);
    if (!Number.isNaN(parsedValue)) {
        return new Intl.NumberFormat('en-IN', {
            maximumFractionDigits: Number.isInteger(parsedValue) ? 0 : 2,
        }).format(parsedValue);
    }

    return value;
};
const CoolectionHeader = React.memo(
    ({
        title,
        onOpenDrawer,
        userProfile,
        hasUser,
        hasLocation,
        allCasesCount,
    }) => (
        <LinearGradient
            colors={['#08245C', '#0B3D89', '#145C9E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}>

            {/* Top Bar */}
            <View style={styles.header}>
                <Pressable onPress={onOpenDrawer}>
                    <Image
                        source={require('../../../asset/icon/menus.png')}
                        style={styles.drawerIcon}
                    />
                </Pressable>
                <Text style={styles.headerTitle}>{title}</Text>
            </View>

            {/* Hero Section */}
            <View style={styles.heroHeaderRow}>
                <View style={styles.heroTextWrap}>
                    <Text style={styles.heroEyebrow}>Daily Dashboard</Text>

                    <Text style={styles.heroTitle}>
                        {hasUser
                            ? `Welcome back, ${userProfile.firstName}!`
                            : 'Preparing your dashboard'}
                    </Text>

                    <Text style={styles.heroSubtitle}>
                        {hasLocation
                            ? 'Location is synced and route actions are ready.'
                            : 'Syncing live location so visit actions stay accurate.'}
                    </Text>
                </View>

                <View style={styles.heroCaseBadge}>
                    <Text style={styles.heroCaseValue}>
                        {formatDashboardValue(allCasesCount)}
                    </Text>
                    <Text style={styles.heroCaseLabel}>All Cases</Text>
                </View>
            </View>
        </LinearGradient>
    )
);

export default CoolectionHeader

const styles = StyleSheet.create({
    /* ===== Gradient Container ===== */
    headerGradient: {
        paddingTop: 50, // for StatusBar space
        paddingBottom: 20,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
    },

    /* ===== Top Header Row ===== */
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 18,
    },

    drawerIcon: {
        width: 22,
        height: 22,
        tintColor: '#fff',
    },

    headerTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginLeft: 14,
        letterSpacing: 0.3,
    },

    /* ===== Hero Section ===== */
    heroHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    heroTextWrap: {
        flex: 1,
        paddingRight: 10,
    },

    heroEyebrow: {
        fontSize: 12,
        color: '#cbd5f5',
        marginBottom: 4,
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },

    heroTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#ffffff',
        marginBottom: 6,
    },

    heroSubtitle: {
        fontSize: 13,
        color: '#dbeafe',
        lineHeight: 18,
    },

    /* ===== Case Badge (Right Side) ===== */
    heroCaseBadge: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 70,
    },

    heroCaseValue: {
        fontSize: 18,
        fontWeight: '700',
        color: '#ffffff',
    },

    heroCaseLabel: {
        fontSize: 11,
        color: '#e0e7ff',
        marginTop: 2,
    },
});

