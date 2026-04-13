import React, { useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import axios from "axios";
import LinearGradient from "react-native-linear-gradient";
import Ionicons from "react-native-vector-icons/Ionicons";
import DropdownComponentNotificationPanel from "../Component/DropdownComponentNotificationPanel";
import { BASE_URL } from "../../api/Endpoints";

const THEME = {
    background: ["#071321", "#102742", "#15365C"],
    overlay: "rgba(7,19,33,0.76)",
    panel: "rgba(255,255,255,0.08)",
    panelSoft: "rgba(255,255,255,0.06)",
    border: "rgba(148,163,184,0.18)",
    text: "#F8FAFC",
    textSecondary: "#AFC0D7",
    textMuted: "#7C93B5",
    accent: "#8BD3FF",
    accentSoft: "rgba(139,211,255,0.14)",
    success: "#34D399",
};

export default function NotificationPanel() {
    const navigation = useNavigation();
    const token = useSelector(state => state.auth.token);

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [users, setUsers] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [sending, setSending] = useState(false);

    const [scheduleDate, setScheduleDate] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [tempDate, setTempDate] = useState(new Date());

    useEffect(() => {
        let isMounted = true;

        const fetchUsers = async () => {
            setLoadingUsers(true);
            try {
                const response = await axios.get(`${BASE_URL}getAllUsers`, {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!isMounted) return;

                const content = response?.data?.data?.content || [];
                const formatted = content
                    .filter(user => user.fcmToken?.trim())
                    .map(user => ({
                        label: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.userName,
                        value: user.userName,
                        subtitle: user.role?.[0]?.roleCode || "",
                    }));

                setUsers(formatted);
            } catch (error) {
                if (isMounted) {
                    Alert.alert("Error", "Failed to fetch users");
                }
            } finally {
                if (isMounted) {
                    setLoadingUsers(false);
                }
            }
        };

        fetchUsers();

        return () => {
            isMounted = false;
        };
    }, [token]);

    const selectedSummary = useMemo(() => {
        if (!selectedUsers.length) return "No recipients selected";
        if (selectedUsers.length === 1) return selectedUsers[0].label;
        return `${selectedUsers.length} recipients selected`;
    }, [selectedUsers]);

    const handleSendNotification = async () => {
        if (!title.trim() || !body.trim()) {
            Alert.alert("Validation", "Please enter both title and body.");
            return;
        }

        if (!selectedUsers.length) {
            Alert.alert("Validation", "Please select at least one user.");
            return;
        }

        setSending(true);

        try {
            const userNamesParam = selectedUsers.map(user => user.value).join(",");

            const tokenResponse = await axios.get(
                `${BASE_URL}getFcmTokenByUserName?userNames=${userNamesParam}`,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const tokens = Object.values(tokenResponse?.data?.data || {}).filter(Boolean);

            if (!tokens.length) {
                Alert.alert("Error", "No valid FCM tokens found for selected users.");
                return;
            }

            const payload = {
                title: title.trim(),
                body: body.trim(),
                tokens,
                scheduleTime: scheduleDate ? scheduleDate.toISOString() : null,
                priority: "HIGH",
                data: {
                    info: "Custom data if needed",
                    title: title.trim(),
                    body: body.trim(),
                },
                userName: userNamesParam,
            };

            await axios.post(`${BASE_URL}notificationsSend`, payload, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            Alert.alert("Success", "Notification sent successfully.");
            setTitle("");
            setBody("");
            setSelectedUsers([]);
            setScheduleDate(null);
        } catch (error) {
            Alert.alert("Error", "Failed to send notification.");
        } finally {
            setSending(false);
        }
    };

    return (
        <LinearGradient colors={THEME.background} style={styles.screen}>
            <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.heroCard}>
                    <Text style={styles.heroEyebrow}>Internal Notifications</Text>
                    <Text style={styles.heroTitle}>Notification Panel</Text>
                    <Text style={styles.heroSubtitle}>
                        Send operational alerts to selected LOS users and review delivery history from one workspace.
                    </Text>
                </View>

                <View style={styles.panel}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Compose Notification</Text>
                        <Text style={styles.sectionMeta}>{selectedSummary}</Text>
                    </View>

                    <Text style={styles.label}>Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter notification title"
                        placeholderTextColor={THEME.textMuted}
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text style={styles.label}>Body</Text>
                    <TextInput
                        style={[styles.input, styles.bodyInput]}
                        placeholder="Enter notification body"
                        placeholderTextColor={THEME.textMuted}
                        value={body}
                        onChangeText={setBody}
                        multiline
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>Recipients</Text>
                    {loadingUsers ? (
                        <View style={styles.loadingBox}>
                            <ActivityIndicator color={THEME.accent} />
                            <Text style={styles.loadingText}>Loading users...</Text>
                        </View>
                    ) : (
                        <DropdownComponentNotificationPanel
                            users={users}
                            selectedUsers={selectedUsers}
                            setSelectedUsers={setSelectedUsers}
                        />
                    )}

                    <Text style={styles.label}>Schedule Time</Text>
                    <TouchableOpacity style={styles.scheduleCard} onPress={() => setShowDatePicker(true)} activeOpacity={0.9}>
                        <Ionicons name="calendar-outline" size={18} color={THEME.accent} />
                        <Text style={styles.scheduleText}>
                            {scheduleDate ? scheduleDate.toLocaleString() : "Send immediately or pick a schedule time"}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker ? (
                        <DateTimePicker
                            value={tempDate}
                            mode="date"
                            display="default"
                            onChange={(event, date) => {
                                setShowDatePicker(false);
                                if (!date) return;
                                setTempDate(date);
                                if (Platform.OS === "android") {
                                    setShowTimePicker(true);
                                } else {
                                    setScheduleDate(date);
                                }
                            }}
                        />
                    ) : null}

                    {showTimePicker ? (
                        <DateTimePicker
                            value={tempDate}
                            mode="time"
                            display="default"
                            onChange={(event, time) => {
                                setShowTimePicker(false);
                                if (!time) return;
                                const finalDate = new Date(tempDate);
                                finalDate.setHours(time.getHours());
                                finalDate.setMinutes(time.getMinutes());
                                setScheduleDate(finalDate);
                            }}
                        />
                    ) : null}

                    <TouchableOpacity
                        style={[styles.primaryButton, sending && styles.disabledButton]}
                        onPress={handleSendNotification}
                        disabled={sending}
                        activeOpacity={0.9}
                    >
                        {sending ? <ActivityIndicator color="#08111F" /> : <Text style={styles.primaryButtonText}>Send Notification</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => navigation.navigate("NotificationHistoryPanel")}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.secondaryButtonText}>View Notification History</Text>
                    </TouchableOpacity>
                </View>
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
        borderColor: THEME.border,
        backgroundColor: THEME.overlay,
        marginBottom: 16,
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
    panel: {
        borderRadius: 24,
        padding: 18,
        backgroundColor: THEME.panel,
        borderWidth: 1,
        borderColor: THEME.border,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 14,
        gap: 12,
    },
    sectionTitle: {
        color: THEME.text,
        fontSize: 18,
        fontWeight: "800",
    },
    sectionMeta: {
        color: THEME.textMuted,
        fontSize: 12,
        flex: 1,
        textAlign: "right",
    },
    label: {
        color: THEME.textSecondary,
        fontSize: 13,
        fontWeight: "700",
        marginBottom: 8,
    },
    input: {
        minHeight: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: "#FFFFFF",
        paddingHorizontal: 14,
        color: "#0F172A",
        marginBottom: 16,
    },
    bodyInput: {
        minHeight: 110,
        paddingTop: 14,
    },
    loadingBox: {
        minHeight: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: "rgba(255,255,255,0.04)",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
    },
    loadingText: {
        color: THEME.textSecondary,
        marginLeft: 10,
        fontSize: 13,
    },
    scheduleCard: {
        minHeight: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.panelSoft,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        marginBottom: 18,
    },
    scheduleText: {
        color: THEME.textSecondary,
        fontSize: 14,
        marginLeft: 10,
        flex: 1,
    },
    primaryButton: {
        minHeight: 54,
        borderRadius: 16,
        backgroundColor: THEME.accent,
        alignItems: "center",
        justifyContent: "center",
    },
    disabledButton: {
        opacity: 0.65,
    },
    primaryButtonText: {
        color: "#08111F",
        fontSize: 15,
        fontWeight: "800",
    },
    secondaryButton: {
        minHeight: 52,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.panelSoft,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 12,
    },
    secondaryButtonText: {
        color: THEME.text,
        fontSize: 14,
        fontWeight: "700",
    },
});
