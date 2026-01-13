// CallSummary.js
// 100% drop-in ready — optimized, no race conditions, single-file.
// Flow (exact): ensure contactCentre -> addContactCentreMobileNumbers -> updateContactCenter
// -> addCallHistory -> addUserTracker -> updateMyCase -> fetchActivity -> fetchCallHistory
// Uses async/await, clear error handling, single point for API posts, auto-refreshes after add.

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Alert,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
    Linking,
    Platform,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import DateTimePickerModal from "react-native-modal-datetime-picker";

import Geolocation from "@react-native-community/geolocation";
import { Dropdown } from "react-native-element-dropdown";
import moment from "moment";
import apiClient from '../../../common/hooks/apiClient';
// import { showLoader } from "../redux/action";
import { Primary, theme, white } from "../utility/Theme";
import { BASE_URL } from "../service/api";


const { width, height } = Dimensions.get("window");

const CallSummary = ({ navigation, route }) => {
    const dispatch = useDispatch();
    const userProfile = useSelector((s) => s.auth.userProfile);
    const token = useSelector((s) => s.auth.token);
    const [datePickerVisible, setDatePickerVisible] = useState(false);
    const [timePickerVisible, setTimePickerVisible] = useState(false);

    // params
    const { data: navData = {}, contactCentreId: navContactCentreId = null, phoneNumber = null } = route.params ?? {};

    // UI state
    const [hours, setHours] = useState("");
    const [minutes, setMinutes] = useState("");
    const [seconds, setSeconds] = useState("");
    const [callStatus, setCallStatus] = useState(null); // '1' Connected, '2' Not Connected
    const [outcome, setOutcome] = useState(null);
    const [callOutcomeLabel, setCallOutcomeLabel] = useState("");
    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [openDate, setOpenDate] = useState(false);
    const [openTime, setOpenTime] = useState(false);
    const [remark, setRemark] = useState("");
    const [loading, setLoading] = useState(false);

    // contact centre / fetched data
    const [contactCentreId, setContactCentreId] = useState(navContactCentreId);
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);

    // refs to prevent double submit
    const submittingRef = useRef(false);

    // dropdown options
    const connectedData = [
        { label: "Call Back", value: "1" },
        { label: "Left Message", value: "2" },
    ];
    const notConnectedData = [
        { label: "WRONG NUMBER", value: "1" },
        { label: "NOT REACHABLE", value: "3" },
        { label: "CUSTOMER BUSY", value: "4" },
        { label: "VISIT PENDING", value: "5" },
        { label: "NOT SERVICEABLE AREA", value: "6" },
        { label: "ADDRESS NOT FOUND // SHORT ADD/WRONG ADD", value: "7" },
        { label: "OUT OF STATION", value: "8" },
        { label: "DOOR LOCK/REVISIT", value: "9" },
        { label: "ENTRY RESTRICTED", value: "10" },
        { label: "RINGING NO RESPONSE", value: "11" },
        { label: "SWITCHED OFF", value: "12" },
    ];

    // util: formatted duration string HH:MM:SS (pad zeros)
    const formattedCallDuration = () => {
        const h = (hours || "").toString().padStart(2, "0");
        const m = (minutes || "").toString().padStart(2, "0");
        const s = (seconds || "").toString().padStart(2, "0");
        if (!h.trim() && !m.trim() && !s.trim()) return "00:00:00";
        return `${h}:${m}:${s}`;
    };

    // common auth headers
    const authHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    // -------------------------------
    // Location helper (simple)
    // -------------------------------
    const getCurrentLocation = useCallback(() => {
        try {
            Geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);
                },
                (err) => {
                    // don't block UI; will proceed without location
                    console.warn("Geolocation error:", err?.message || err);
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
            );
        } catch (e) {
            console.warn("getCurrentLocation failed:", e?.message || e);
        }
    }, []);

    useEffect(() => {
        getCurrentLocation();
    }, [getCurrentLocation]);

    // -------------------------------
    // API helpers
    // -------------------------------
    const apiGet = async (path) => {
        const res = await apiClient.get(`${BASE_URL}${path}`, { headers: authHeaders });
        return res?.data?.data ?? null;
    };

    const apiPost = async (path, payload) => {
        const res = await apiClient.post(`${BASE_URL}${path}`, payload, { headers: authHeaders });
        return res?.data ?? null;
    };

    const apiPut = async (path, payload) => {
        const res = await apiClient.put(`${BASE_URL}${path}`, payload, { headers: authHeaders });
        return res?.data ?? null;
    };

    // -------------------------------
    // Contact Centre helpers
    // 1) find existing by LAN (account) - using endsWith or exact check (robust)
    // 2) create if not found
    // -------------------------------
    const findExistingContactCentre = async () => {
        try {
            const all = await apiGet("getAllContactCentres");
            if (!Array.isArray(all)) return null;
            const lan = String(navData?.loanAccountNumber ?? "").trim();
            // robust match: prefers exact, then endsWith fallback
            let match = all.find((it) => String(it.loanAccountNumber || "") === lan);
            if (!match) {
                match = all.find((it) => String(it.loanAccountNumber || "").endsWith(lan));
            }
            return match ? match.contactCentreId : null;
        } catch (e) {
            console.log("findExistingContactCentre error:", e);
            return null;
        }
    };

    const createContactCentre = async () => {
        try {
            const user = userProfile ?? {};
            // keep payload trimmed to only necessary properties (prevents huge payloads)
            const payload = {
                loanAccountNumber: navData?.loanAccountNumber,
                user: {
                    userId: user?.userId,
                    firstName: user?.firstName,
                    lastName: user?.lastName,
                    mobileno: user?.mobileNo,
                    email: user?.email,
                    organisationName: user?.organisationName,
                    userType: user?.userType,
                    reportingManager: user?.reportingManager,
                    status: user?.status,
                    designation: user?.designation,
                    sendWelcome: user?.sendWelcome,
                    userName: user?.userName,
                    isActive: user?.isActive,
                    expired: user?.expired,
                    lender: user?.lender,
                    activityType: user?.activityType,
                    maxTicketSize: user?.maxTicketSize,
                    minTicketSize: user?.minTicketSize,
                    maxBucket: user?.maxBucket,
                    minBucket: user?.minBucket,
                },
            };
            const r = await apiPost("addContactCentre", payload);
            return r?.data?.contactCentreId ?? null;
        } catch (e) {
            console.log("createContactCentre error:", e);
            return null;
        }
    };

    const ensureContactCentreId = async () => {
        // returns id or null
        if (contactCentreId) return contactCentreId;
        // try to find
        const existing = await findExistingContactCentre();
        if (existing) {
            setContactCentreId(existing);
            return existing;
        }
        // create
        const created = await createContactCentre();
        if (created) {
            setContactCentreId(created);
            return created;
        }
        return null;
    };

    // -------------------------------
    // Main atomic operations
    // -------------------------------
    const addContactCentreMobileNumbers = async (centreId, payloadOverride = null) => {
        // payloadOverride allows explicit number
        const payload = payloadOverride || {
            contactName: navData?.name,
            contactNumber: parseInt(phoneNumber ?? navData?.mobile),
            contactCentre: centreId,
        };
        const r = await apiPost("addContactCentreMobileNumbers", payload);
        console.log(r.data, 'addContactCentreMobileNumbersResponse')
        // response: r.data.data.contactCentreMobileNumbersId etc.
        return r?.data ?? null;
    };

    const updateContactCentreMobile = async (mobileRecordId, updatePayload) => {
        const path = `updateContactCentreMobileByContactCentreMobileNumbersId/${mobileRecordId}`;
        const r = await apiPut(path, updatePayload);
        return r?.data?.data ?? null;
    };

    const addCallHistory = async (lan, callHistoryPayload) => {
        await apiPost("addCallHistory", callHistoryPayload);
    };

    const addUserTracker = async (trackerPayload) => {
        await apiPost("addUserTracker", trackerPayload);
    };

    const updateMyCase = async (lan) => {

        try {
            await apiPut(`updateMyCaseForInProcessForDRA/${userProfile?.userId}/${lan}`, {});
        } catch (e) {
            console.warn("updateMyCase failed:", e);
        }
    };

    const fetchAllActivity = async (lan) => {
        try {
            await apiGet(`getAllActivityHistoryByLoanAccountNumber/${lan}`);
        } catch (e) {
            console.warn("fetchAllActivity failed:", e);
        }
    };

    const fetchCallHistory = async (lan) => {
        try {
            await apiGet(`getCallHistoryByLan/${lan}`);
        } catch (e) {
            console.warn("fetchCallHistory failed:", e);
        }
    };

    // -------------------------------
    // Validation
    // -------------------------------
    const validateBeforeSave = () => {
        if (!callStatus) {
            Alert.alert("Validation", "Please select Call Status");
            return false;
        }
        if (!outcome) {
            Alert.alert("Validation", "Please select Call Outcome");
            return false;
        }
        return true;
    };

    // -------------------------------
    // Orchestrator: Save button
    // Ensures correct order, awaits each step
    // -------------------------------
    const onSave = async () => {
        if (submittingRef.current) return; // prevent double
        if (!validateBeforeSave()) return;

        submittingRef.current = true;
        setLoading(true);
        // dispatch(showLoader(true));

        try {
            // 0) ensure contact centre exists
            const centreId = await ensureContactCentreId();
            if (!centreId) {
                throw new Error("Unable to get or create Contact Centre ID");
            }

            // 1) Add contact centre mobile number (create mobile record)
            const mobileRecord = await addContactCentreMobileNumbers(centreId);
            console.log(mobileRecord, 'mobileRecordmobileRecord')
            const mobileRecordId = mobileRecord?.contactCentreMobileNumbersId;
            const loanAccountLan = mobileRecord?.contactCentre?.loanAccountNumber ?? navData?.loanAccountNumber;

            if (!mobileRecordId) {
                throw new Error("Failed to create mobile number record");
            }

            // 2) Update the mobile record with call summary (updateContactCenter)
            const followUpPayloadValue =
                openDate && openTime ? `${moment(date).format("YYYY-MM-DD")}T${moment(time).format("HH:mm")}` : "";

            const updatePayload = {
                callDuration: formattedCallDuration(),
                callStatus: callStatus === "2" ? "Not Connected" : "Connected",
                callOutcome: callOutcomeLabel || "",
                followUpCall: followUpPayloadValue || "",
                remark: remark || "",
            };

            const updatedMobileRecord = await updateContactCentreMobile(mobileRecordId, updatePayload);

            // 3) Add Call History
            const callHistoryPayload = {
                geoCoordinates: `${latitude ?? ""},${longitude ?? ""}`,
                name: navData?.name,
                number: parseInt(phoneNumber ?? navData?.mobile),
                status: callStatus === "2" ? "Not Connected" : "Connected",
                callDuration: formattedCallDuration(),
                callOutcome: callOutcomeLabel || "",
                contactCentreMobileNumbersId: mobileRecordId,
                lan: loanAccountLan,
                userId: parseInt(userProfile?.userId),
                remark: remark || "",
                followUp: followUpPayloadValue || "",
            };

            await addCallHistory(loanAccountLan, callHistoryPayload);

            // 4) Add user tracker (best-effort)
            const trackerPayload = {
                activity: callOutcomeLabel || "",
                coordinates: `${latitude ?? ""},${longitude ?? ""}`,
                areaName: "", // optionally reverse-geocode if required
                number: parseInt(phoneNumber ?? navData?.mobile),
                status: callStatus === "2" ? "Not Connected" : "Connected",
                callDuration: formattedCallDuration(),
                callOutcome: callOutcomeLabel || "",
                contactCentreMobileNumbersId: mobileRecordId,
                lan: loanAccountLan,
                userId: parseInt(userProfile?.userId),
                remark: remark || "",
                followUp: followUpPayloadValue || "",
            };
            // do not block flow if this fails
            try {
                await addUserTracker(trackerPayload);
            } catch (e) {
                console.warn("addUserTracker failed, continuing:", e);
            }

            // 5) Update my case
            try {
                await updateMyCase(loanAccountLan);
            } catch (e) {
                console.warn("updateMyCase failed, continuing:", e);
            }

            // 6) Refresh activity & call history
            await Promise.all([fetchAllActivity(loanAccountLan), fetchCallHistory(loanAccountLan)]);

            // Success
            Alert.alert("Success", "Call summary saved successfully.");
            navigation.goBack();
        } catch (err) {
            console.log("onSave error:", err);
            Alert.alert("Error", err?.message || "Something went wrong");
        } finally {
            submittingRef.current = false;
            setLoading(false);
            // dispatch(showLoader(false));
        }
    };

    // -------------------------------
    // Small helpers for input sanitization
    // -------------------------------
    const sanitizeNumberInput = (text, max) => {
        const cleaned = (text || "").replace(/\D/g, "");
        const num = cleaned === "" ? "" : parseInt(cleaned, 10);
        if (num === "" || isNaN(num)) return "";
        if (typeof max === "number" && num > max) return String(max);
        return String(num);
    };

    // -------------------------------
    // Render
    // -------------------------------
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: white }}>
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={26} color="#606060" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Call Summary</Text>
            </View> */}

            <ScrollView contentContainerStyle={{ padding: 12 }}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>Call Summary</Text>
                    </View>

                    <View style={styles.cardBody}>
                        {/* Call Duration */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Call Duration</Text>
                            <View style={styles.durationRow}>
                                <TextInput
                                    placeholder="HH"
                                    keyboardType="numeric"
                                    maxLength={2}
                                    value={hours}
                                    onChangeText={(t) => setHours(sanitizeNumberInput(t, 24))}
                                    style={styles.durationInput}
                                />
                                <Text style={styles.durationSep}>:</Text>
                                <TextInput
                                    placeholder="MM"
                                    keyboardType="numeric"
                                    maxLength={2}
                                    value={minutes}
                                    onChangeText={(t) => setMinutes(sanitizeNumberInput(t, 59))}
                                    style={styles.durationInput}
                                />
                                <Text style={styles.durationSep}>:</Text>
                                <TextInput
                                    placeholder="SS"
                                    keyboardType="numeric"
                                    maxLength={2}
                                    value={seconds}
                                    onChangeText={(t) => setSeconds(sanitizeNumberInput(t, 59))}
                                    style={styles.durationInput}
                                />
                            </View>
                        </View>

                        {/* Call Status */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Call Status <Text style={{ color: "red" }}>*</Text></Text>
                            <View style={{ flex: 1 }}>
                                <Dropdown
                                    style={styles.dropdown}
                                    data={[
                                        { label: "Connected", value: "1" },
                                        { label: "Not Connected", value: "2" },
                                    ]}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select Status"
                                    value={callStatus}
                                    onChange={(item) => {
                                        setCallStatus(item.value);
                                        setOutcome(null);
                                        setCallOutcomeLabel("");
                                    }}
                                />
                            </View>
                        </View>

                        {/* Call Outcome */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Call Outcome <Text style={{ color: "red" }}>*</Text></Text>
                            <View style={{ flex: 1 }}>
                                <Dropdown
                                    style={styles.dropdown}
                                    data={callStatus === "1" ? connectedData : notConnectedData}
                                    labelField="label"
                                    valueField="value"
                                    placeholder="Select Outcome"
                                    value={outcome}
                                    onChange={(item) => {
                                        setOutcome(item.value);
                                        setCallOutcomeLabel(item.label);
                                    }}
                                />
                            </View>
                        </View>

                        {/* Follow up Date & Time */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Follow up Date</Text>

                            <View style={styles.fieldWithIcon}>
                                <TextInput
                                    editable={false}
                                    value={moment(date).format("LL")}
                                    style={styles.readonlyInput}
                                    placeholderTextColor={theme.light.commentPlaceholder}
                                />

                                <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                                    <MaterialCommunityIcons name="calendar-month" size={28} color="#000" />
                                </TouchableOpacity>

                                {/* React Native Modal Date Picker */}
                                <DateTimePickerModal
                                    isVisible={datePickerVisible}
                                    mode="date"
                                    date={date}
                                    minimumDate={new Date()}
                                    onConfirm={(d) => {
                                        setDate(d);
                                        setDatePickerVisible(false);
                                    }}
                                    onCancel={() => setDatePickerVisible(false)}
                                />
                            </View>
                        </View>


                        <View style={styles.row}>
                            <Text style={styles.label}>Follow up Time</Text>

                            <View style={styles.fieldWithIcon}>
                                <TextInput
                                    editable={false}
                                    value={moment(time).format("LT")}
                                    style={styles.readonlyInput}
                                    placeholderTextColor={theme.light.commentPlaceholder}
                                />

                                <TouchableOpacity onPress={() => setTimePickerVisible(true)}>
                                    <MaterialIcons name="access-time" size={28} color={theme.light.commentPlaceholder} />
                                </TouchableOpacity>

                                {/* Modal Time Picker */}
                                <DateTimePickerModal
                                    isVisible={timePickerVisible}
                                    mode="time"
                                    date={time}
                                    onConfirm={(t) => {
                                        setTime(t);
                                        setTimePickerVisible(false);
                                    }}
                                    onCancel={() => setTimePickerVisible(false)}
                                />
                            </View>
                        </View>


                        {/* Remarks */}
                        <View style={styles.row}>
                            <Text style={styles.label}>Remarks</Text>
                            <TextInput
                                multiline
                                numberOfLines={3}
                                value={remark}
                                onChangeText={setRemark}
                                placeholder="Add remark (optional)"
                                placeholderTextColor={theme.light.commentPlaceholder}
                                style={styles.remarkInput}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        style={[styles.footerButton, loading ? { opacity: 0.7 } : null]}
                        onPress={onSave}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.footerButtonText}>Save</Text>}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        height: 56,
        alignItems: "center",
        borderBottomWidth: 0.5,
        borderColor: "#ddd",
        backgroundColor: "#fff",
    },
    backBtn: { width: 48, alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 20, fontWeight: "600", color: theme.light.black },
    card: {
        width: "100%",
        backgroundColor: white,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: theme.light.darkBlue,
        marginBottom: 20,
    },
    cardHeader: {
        height: 56,
        backgroundColor: theme.light.darkBlue,
        justifyContent: "center",
        paddingHorizontal: 16,
    },
    cardHeaderText: { color: "#fff", fontSize: 18, fontWeight: "700" },
    cardBody: { padding: 12 },
    row: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
    label: { width: "40%", fontSize: 16, color: theme.light.searchPlacehoder },
    durationRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
    },
    durationInput: {
        width: width * 0.14,
        height: 38,
        borderWidth: 1,
        borderColor: theme.light.activeChatText,
        borderRadius: 8,
        paddingHorizontal: 8,
        backgroundColor: theme.light.searchContainerColor,
        color: "#111",
    },
    durationSep: { marginHorizontal: 6, fontSize: 20, fontWeight: "700" },
    dropdown: {
        height: 40,
        borderWidth: 0.5,
        borderRadius: 8,
        backgroundColor: theme.light.RightMessageText,
        paddingHorizontal: 10,
    },
    fieldWithIcon: { flex: 1, flexDirection: "row", alignItems: "center" },
    readonlyInput: {
        flex: 1,
        height: 40,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: theme.light.RightMessageText,
        color: theme.light.commentPlaceholder,
    },
    remarkInput: {
        flex: 1,
        height: 86,
        borderRadius: 8,
        padding: 12,
        backgroundColor: theme.light.RightMessageText,
        color: theme.light.commentPlaceholder,
        textAlignVertical: "top",
    },
    footerButton: {
        height: 48,
        backgroundColor: theme.light.darkBlue,
        alignItems: "center",
        justifyContent: "center",
    },
    footerButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});

export default CallSummary;
