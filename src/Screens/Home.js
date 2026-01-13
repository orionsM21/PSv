import React, { useContext } from 'react';
import {
    SafeAreaView,
    TouchableOpacity,
    StatusBar,
    Image,
    StyleSheet,
    Text,
    View,
    Platform,
    ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DrawerContext } from '../Drawer/DrawerContext';

const Home = () => {
    const { openDrawer } = useContext(DrawerContext);

    return (
        <SafeAreaView style={styles.safeContainer}>
            <StatusBar
                backgroundColor="transparent"
                barStyle="light-content"
                translucent
            />

            {/* 🔵 DELUXE HEADER */}
            <LinearGradient
                colors={['#005BEA', '#003A8C']}
                style={styles.headerWrapper}
            >
                <View style={styles.headerRow}>
                    {/* Menu + Title */}
                    <TouchableOpacity
                        style={styles.headerLeft}
                        onPress={openDrawer}
                        activeOpacity={0.85}
                    >
                        <Image
                            source={require('../../asset/menus.png')}
                            style={styles.drawerIcon}
                        />
                        <View>
                            <Text style={styles.headerSubTitle}>Welcome back,</Text>
                            <Text style={styles.headerTitle}>Dashboard</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Right-side avatar / initials */}
                    <View style={styles.avatarWrapper}>
                        <Text style={styles.avatarText}>SM</Text>
                    </View>
                </View>

                {/* Small summary row under header */}
                <View style={styles.headerSummaryRow}>
                    <View>
                        <Text style={styles.summaryLabel}>Today’s Overview</Text>
                        <Text style={styles.summaryValue}>4 Active Pipelines</Text>
                    </View>
                    <View style={styles.chip}>
                        <Text style={styles.chipText}>Live</Text>
                    </View>
                </View>
            </LinearGradient>

            {/* 🧊 FLOATING CONTENT */}
            <View style={styles.mainContainer}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 24 }}
                >
                    {/* KPI CARDS */}
                    <Text style={styles.sectionTitle}>Summary</Text>
                    <View style={styles.kpiGrid}>
                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiLabel}>Total Leads</Text>
                            <Text style={styles.kpiValue}>128</Text>
                            <Text style={styles.kpiSub}>+12 today</Text>
                        </View>

                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiLabel}>In Progress</Text>
                            <Text style={styles.kpiValue}>34</Text>
                            <Text style={styles.kpiSub}>8 follow-ups</Text>
                        </View>

                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiLabel}>Disbursed</Text>
                            <Text style={styles.kpiValue}>19</Text>
                            <Text style={styles.kpiSub}>₹ 84.2L total</Text>
                        </View>

                        <View style={styles.kpiCard}>
                            <Text style={styles.kpiLabel}>Rejected</Text>
                            <Text style={styles.kpiValue}>7</Text>
                            <Text style={styles.kpiSub}>3 new today</Text>
                        </View>
                    </View>

                    {/* QUICK ACTIONS */}
                    <Text style={styles.sectionTitle}>Quick Actions</Text>
                    <View style={styles.quickRow}>
                        <TouchableOpacity activeOpacity={0.9} style={styles.quickCard}>
                            <LinearGradient
                                colors={['#FF9A9E', '#FAD0C4']}
                                style={styles.quickGradient}
                            >
                                <Text style={styles.quickTitle}>New Lead</Text>
                                <Text style={styles.quickSub}>Create fresh entry</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity activeOpacity={0.9} style={styles.quickCard}>
                            <LinearGradient
                                colors={['#A18CD1', '#FBC2EB']}
                                style={styles.quickGradient}
                            >
                                <Text style={styles.quickTitle}>View Pipeline</Text>
                                <Text style={styles.quickSub}>Track current cases</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>

                    {/* RECENT SECTION */}
                    <Text style={styles.sectionTitle}>Recent Activity</Text>
                    <View style={styles.activityCard}>
                        <View style={styles.activityDot} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.activityTitle}>Lead #AFPL-1023 moved to Under Review</Text>
                            <Text style={styles.activityMeta}>10 min ago · by You</Text>
                        </View>
                    </View>

                    <View style={styles.activityCard}>
                        <View style={styles.activityDot} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.activityTitle}>Application #LN-9845 disbursed</Text>
                            <Text style={styles.activityMeta}>1 hr ago · Ticket size ₹8.5L</Text>
                        </View>
                    </View>

                    <View style={styles.activityCard}>
                        <View style={styles.activityDot} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.activityTitle}>3 leads pending document upload</Text>
                            <Text style={styles.activityMeta}>Today · Follow-up required</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

export default Home;

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#005BEA',
    },

    /** HEADER */
    headerWrapper: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
        paddingBottom: 18,
        paddingHorizontal: 16,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    drawerIcon: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
        marginRight: 10,
    },

    headerTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    headerSubTitle: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.75)',
    },

    avatarWrapper: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    avatarText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 14,
    },

    headerSummaryRow: {
        marginTop: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    summaryLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: 13,
    },

    summaryValue: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginTop: 2,
    },

    chip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: 'rgba(0,0,0,0.18)',
    },

    chipText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },

    /** MAIN CONTENT */
    mainContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 16,
        paddingTop: 18,
    },

    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#222',
        marginBottom: 10,
        marginTop: 4,
    },

    /** KPI GRID */
    kpiGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    kpiCard: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
    },

    kpiLabel: {
        fontSize: 13,
        color: '#6B7280',
    },

    kpiValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
        marginTop: 4,
    },

    kpiSub: {
        marginTop: 4,
        fontSize: 12,
        color: '#9CA3AF',
    },

    /** QUICK ACTIONS */
    quickRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 18,
    },

    quickCard: {
        width: '48%',
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },

    quickGradient: {
        paddingVertical: 16,
        paddingHorizontal: 12,
    },

    quickTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#111827',
    },

    quickSub: {
        fontSize: 12,
        marginTop: 4,
        color: '#374151',
    },

    /** ACTIVITY */
    activityCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: 0.6,
        borderColor: '#E5E7EB',
    },

    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
        marginRight: 10,
        marginTop: 6,
    },

    activityTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#111827',
    },

    activityMeta: {
        marginTop: 2,
        fontSize: 12,
        color: '#6B7280',
    },
});
