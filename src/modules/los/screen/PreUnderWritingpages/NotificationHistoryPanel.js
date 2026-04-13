import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { useSelector } from "react-redux";
import axios from "axios";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import { BASE_URL } from "../../api/Endpoints";

const THEME = {
    background: ["#071321", "#102742", "#15365C"],
    overlay: "rgba(7,19,33,0.76)",
    panel: "rgba(255,255,255,0.08)",
    border: "rgba(148,163,184,0.18)",
    text: "#F8FAFC",
    textSecondary: "#AFC0D7",
    textMuted: "#7C93B5",
    accent: "#8BD3FF",
    success: "#34D399",
    danger: "#FCA5A5",
    warning: "#FBBF24",
};

function formatSentTime(sentTime) {
    if (!Array.isArray(sentTime) || sentTime.length < 6) return "Unknown";

    return new Date(
        sentTime[0],
        sentTime[1] - 1,
        sentTime[2],
        sentTime[3],
        sentTime[4],
        sentTime[5]
    ).toLocaleString();
}

const HistoryCard = React.memo(({ item }) => {
    const statusColor =
        item.status === "SUCCESS" || item.status === "COMPLETED"
            ? THEME.success
            : item.status === "FAILED"
              ? THEME.danger
              : THEME.warning;

    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={styles.flexOne}>
                    <Text style={styles.title}>{item.title || "Untitled Notification"}</Text>
                    <Text style={styles.body}>{item.body || "No message body"}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: `${statusColor}22` }]}>
                    <Text style={[styles.statusText, { color: statusColor }]}>{item.status || "UNKNOWN"}</Text>
                </View>
            </View>

            <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={THEME.accent} />
                <Text style={styles.meta}>{formatSentTime(item.sentTime)}</Text>
            </View>

            <View style={styles.metaRow}>
                <Ionicons name="people-outline" size={14} color={THEME.accent} />
                <Text style={styles.meta}>{`Recipients: ${item.recipientCount ?? 0}`}</Text>
            </View>

            <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={14} color={THEME.accent} />
                <Text style={styles.meta}>{`Users: ${item.userName || "-"}`}</Text>
            </View>

            <View style={styles.summaryRow}>
                <View style={styles.summaryChip}>
                    <Text style={styles.summaryLabel}>Success</Text>
                    <Text style={[styles.summaryValue, { color: THEME.success }]}>{item.successCount ?? 0}</Text>
                </View>
                <View style={styles.summaryChip}>
                    <Text style={styles.summaryLabel}>Failed</Text>
                    <Text style={[styles.summaryValue, { color: THEME.danger }]}>{item.failureCount ?? 0}</Text>
                </View>
            </View>
        </View>
    );
});

export default function NotificationHistoryPanel() {
    const token = useSelector(state => state.auth.token);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotificationHistory = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${BASE_URL}notificationsHistory`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = Array.isArray(response?.data)
                ? response.data
                : Array.isArray(response?.data?.data)
                  ? response.data.data
                  : [];

            setHistory(data);
        } catch (error) {
            setHistory([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchNotificationHistory();
    }, [fetchNotificationHistory]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchNotificationHistory();
        setRefreshing(false);
    }, [fetchNotificationHistory]);

    const headerMeta = useMemo(() => {
        if (!history.length) return "No notifications logged";
        return `${history.length} notifications recorded`;
    }, [history]);

    return (
        <LinearGradient colors={THEME.background} style={styles.screen}>
            <FlatList
                data={history}
                keyExtractor={(item, index) => String(item.id ?? index)}
                renderItem={({ item }) => <HistoryCard item={item} />}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.accent} />}
                ListHeaderComponent={
                    <View style={styles.headerWrap}>
                        <View style={styles.heroCard}>
                            <Text style={styles.heroEyebrow}>Delivery Audit</Text>
                            <Text style={styles.heroTitle}>Notification History</Text>
                            <Text style={styles.heroSubtitle}>
                                Review sent messages, recipient count, and delivery outcomes for LOS notification operations.
                            </Text>
                        </View>

                        <View style={styles.metaCard}>
                            <Text style={styles.metaCardTitle}>History Summary</Text>
                            <Text style={styles.metaCardValue}>{headerMeta}</Text>
                        </View>
                    </View>
                }
                ListEmptyComponent={
                    loading ? (
                        <View style={styles.emptyState}>
                            <ActivityIndicator color={THEME.accent} />
                            <Text style={styles.emptyText}>Loading notification history...</Text>
                        </View>
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="notifications-off-outline" size={30} color={THEME.textMuted} />
                            <Text style={styles.emptyTitle}>No history available</Text>
                            <Text style={styles.emptyText}>Sent notifications will appear here once the backend returns history records.</Text>
                        </View>
                    )
                }
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            />
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
        flexGrow: 1,
    },
    flexOne: {
        flex: 1,
    },
    headerWrap: {
        marginBottom: 4,
    },
    heroCard: {
        borderRadius: 28,
        padding: 20,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.overlay,
        marginBottom: 14,
    },
    heroEyebrow: {
        color: THEME.accent,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    heroTitle: {
        marginTop: 8,
        color: THEME.text,
        fontSize: 28,
        fontWeight: "800",
    },
    heroSubtitle: {
        marginTop: 8,
        color: THEME.textSecondary,
        fontSize: 14,
        lineHeight: 21,
    },
    metaCard: {
        borderRadius: 20,
        padding: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.panel,
        marginBottom: 12,
    },
    metaCardTitle: {
        color: THEME.textSecondary,
        fontSize: 12,
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: 0.8,
    },
    metaCardValue: {
        marginTop: 8,
        color: THEME.text,
        fontSize: 18,
        fontWeight: "800",
    },
    card: {
        borderRadius: 24,
        padding: 16,
        backgroundColor: THEME.panel,
        borderWidth: 1,
        borderColor: THEME.border,
        marginBottom: 12,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 12,
        marginBottom: 10,
    },
    title: {
        color: THEME.text,
        fontSize: 17,
        fontWeight: "800",
    },
    body: {
        marginTop: 6,
        color: THEME.textSecondary,
        fontSize: 14,
        lineHeight: 20,
    },
    statusPill: {
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    statusText: {
        fontSize: 11,
        fontWeight: "800",
    },
    metaRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 6,
    },
    meta: {
        marginLeft: 8,
        color: THEME.textSecondary,
        fontSize: 13,
        flex: 1,
    },
    summaryRow: {
        flexDirection: "row",
        gap: 10,
        marginTop: 14,
    },
    summaryChip: {
        flex: 1,
        borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.05)",
        padding: 12,
    },
    summaryLabel: {
        color: THEME.textMuted,
        fontSize: 12,
        fontWeight: "700",
    },
    summaryValue: {
        marginTop: 6,
        fontSize: 18,
        fontWeight: "800",
    },
    emptyState: {
        flex: 1,
        minHeight: 240,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    emptyTitle: {
        marginTop: 12,
        color: THEME.text,
        fontSize: 18,
        fontWeight: "800",
    },
    emptyText: {
        marginTop: 8,
        color: THEME.textSecondary,
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
    },
});
