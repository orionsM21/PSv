import React, { useCallback, useEffect, useMemo, useState, memo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    FlatList,
    Dimensions,
    StyleSheet,
    BackHandler,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
// import DatePicker from "react-native-date-picker";
import moment from "moment";
import LinearGradient from "react-native-linear-gradient";
import { Dropdown } from "react-native-element-dropdown";
import { useDispatch, useSelector } from "react-redux";
// import { showLoader } from "../redux/action";
import { theme } from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';
import UltraDateTimeInput from "./Payment/Component/DateTimeInput";
const { width, height } = Dimensions.get("screen");

/* --------------------------------------------------------- */
/*  HISTORY ITEM (Memoized for Best Performance)             */
/* --------------------------------------------------------- */
const HistoryCard = memo(({ item, index, collapsed, toggle, onPress }) => {
    const statusColor =
        item.status === "Approved" || item.status === "Completed"
            ? "green"
            : item.status === "Pending"
                ? "orange"
                : item.status === "Rejected"
                    ? "red"
                    : theme.light.black;

    return (
        <TouchableOpacity onPress={() => onPress(item)}>
            <LinearGradient
                colors={["#FFFFFF", "#F4F2F2", "#F2EFEF", "#D0CCCC"]}
                style={styles.cardWrap}
            >
                <View style={styles.cardRow}>
                    <View style={styles.cardLeft}>
                        <Text numberOfLines={2} style={styles.bankText}>
                            {item.bankName}
                        </Text>
                        <Text numberOfLines={2} style={[styles.statusText, { color: statusColor }]}>
                            {item.status}
                        </Text>
                    </View>

                    <TouchableOpacity onPress={() => toggle(index)}>
                        <MaterialCommunityIcons
                            name={collapsed ? "arrow-up-drop-circle" : "arrow-down-drop-circle"}
                            size={30}
                            color={theme.light.darkBlue}
                        />
                    </TouchableOpacity>
                </View>

                {/* Amount & Mode */}
                <View style={styles.cardRow}>
                    <Text style={styles.amountText}>
                        <Image
                            source={require("../../../asset/TrueBoardIcon/rupee.png")}
                            style={styles.rupeeIcon}
                        />{" "}
                        {item.amount?.toLocaleString("en-IN")}
                    </Text>
                    <Text style={styles.modeText}>{item.paymentCollectionMode}</Text>
                </View>

                {/* Date & Time */}
                <View style={styles.cardRow}>
                    <Text style={styles.dateLabel}>Date</Text>
                    <Text style={styles.dateLabel}>Time</Text>
                </View>

                <View style={styles.cardRow}>
                    <Text style={styles.dateValue}>{item.createdDate}</Text>
                    <Text style={styles.dateValue}>{item.createdTime}</Text>
                </View>

                {/* Remarks */}
                {collapsed && (
                    <View style={styles.remarksWrap}>
                        <Text style={styles.remarksLabel}>Remarks</Text>
                        <Text style={styles.remarksValue}>{item.remark}</Text>
                    </View>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
});

/* --------------------------------------------------------- */
/*  MAIN SCREEN                                              */
/* --------------------------------------------------------- */
const DepositionHistory = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { id, token } = useSelector((s) => s.auth);

    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [openStart, setOpenStart] = useState(false);
    const [openEnd, setOpenEnd] = useState(false);

    const [statusValue, setStatusValue] = useState(null);
    const [isFocus, setIsFocus] = useState(false);

    const [historyList, setHistoryList] = useState([]);
    const [collapsedIndexes, setCollapsedIndexes] = useState([]);

    /* ---------------- BACK HANDLER ---------------- */
    useEffect(() => {
        const backPress = () => {
            navigation.goBack();
            return true;
        };
        BackHandler.addEventListener("hardwareBackPress", backPress);
        return () => BackHandler.removeEventListener("hardwareBackPress", backPress);
    }, [navigation]);

    /* ---------------- API: FETCH ALL HISTORY ---------------- */
    const fetchHistory = useCallback(async () => {
        if (!id) return;
        try {
            // dispatch(showLoader(true));
            const res = await apiClient.get(`getDepositionHistory/${id}`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json', Authorization: `Bearer ${token}`
                },
            });
            setHistoryList(res?.data?.response || []);
        } catch (e) {
            console.log("fetchHistory error:", e);
        } finally {
            // dispatch(showLoader(false));
        }
    }, [id, token, dispatch]);

    /* ---------------- API: FILTERED SEARCH ---------------- */
    const fetchFiltered = useCallback(async () => {
        if (!id || !statusValue) return;

        const from = moment(startDate).format("YYYY-MM-DD");
        const to = moment(endDate).format("YYYY-MM-DD");

        try {
            // dispatch(showLoader(true));
            const res = await apiClient.get(
                `getDepositionHistory/${id}/${statusValue.label}?from=${from}&to=${to}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json', Authorization: `Bearer ${token}`
                    }
                }
            );
            setHistoryList(res?.data?.response || []);
        } catch (e) {
            console.log("fetchFiltered error:", e);
        } finally {
            // dispatch(showLoader(false));
        }
    }, [id, token, startDate, endDate, statusValue, dispatch]);

    /* ---------------- USEFOCUSEFFECT: REFRESH ON FOCUS ---------------- */
    useFocusEffect(
        useCallback(() => {
            fetchHistory();
        }, [fetchHistory])
    );

    /* ---------------- Collapse Toggle ---------------- */
    const toggleCollapse = useCallback(
        (index) => {
            setCollapsedIndexes((prev) =>
                prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
            );
        },
        [setCollapsedIndexes]
    );

    /* ---------------- Navigate to Details ---------------- */
    const onPressDetails = useCallback(
        (item) =>
            navigation.navigate("ViewDepositionDetails", {
                DepositionDetails: item,
            }),
        [navigation]
    );

    /* ---------------- Status Dropdown Options ---------------- */
    const STATUS_OPTIONS = useMemo(
        () => [
            { label: "Pending", value: "pending" },
            { label: "Approved", value: "approved" },
            { label: "Rejected", value: "rejected" },
        ],
        []
    );

    /* ---------------- RenderItem ---------------- */
    const renderItem = useCallback(
        ({ item, index }) => (
            <HistoryCard
                item={item}
                index={index}
                collapsed={collapsedIndexes.includes(index)}
                toggle={toggleCollapse}
                onPress={onPressDetails}
            />
        ),
        [collapsedIndexes, toggleCollapse, onPressDetails]
    );

    return (
        <View style={styles.container}>
            {/* HEADER */}

            {/* FILTERS */}


            <View style={styles.filterContainer}>
                {/* ROW 1: Start + End */}
                <View style={styles.row}>
                    <UltraDateTimeInput
                        label="Start Date"
                        value={startDate}
                        onChange={setStartDate}
                        containerStyle={styles.dateInput}
                    />

                    <UltraDateTimeInput
                        label="End Date"
                        value={endDate}
                        onChange={setEndDate}
                        containerStyle={styles.dateInput}
                    />
                </View>

                {/* ROW 2: Status + Search */}
                <View style={styles.rowBottom}>
                    <Dropdown
                        style={[styles.dropdown, isFocus && { borderColor: "#007AFF" }]}
                        data={STATUS_OPTIONS}
                        labelField="label"
                        valueField="value"
                        placeholder="Status"
                        value={statusValue}
                        onFocus={() => setIsFocus(true)}
                        onBlur={() => setIsFocus(false)}
                        onChange={(item) => {
                            setStatusValue(item);
                            setIsFocus(false);
                        }}
                    />

                    <TouchableOpacity onPress={fetchFiltered} style={styles.searchBtn}>
                        <Image
                            source={require("../../../asset/icon/searchIcon.png")}
                            style={styles.searchIcon}
                        />
                    </TouchableOpacity>
                </View>
            </View>


            {/* LIST */}
            <FlatList
                data={historyList}
                renderItem={renderItem}
                keyExtractor={(item, index) => String(index)}
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

export default DepositionHistory;

/* --------------------------------------------------------- */
/*  STYLES (Ultra-Clean)                                     */
/* --------------------------------------------------------- */
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff" },

    header: {
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 0.5,
        borderBottomColor: theme.light.black,
        paddingHorizontal: 12,
    },
    backBtn: { width: 45 },
    headerTitle: { fontSize: 22, fontWeight: "600", color: theme.light.black },

    filterRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 12,
        marginTop: 12,
    },

    dateBtn: {
        width: width * 0.22,
        height: height * 0.045,
        borderRadius: 10,
        backgroundColor: theme.light.RightMessageText,
        justifyContent: "center",
        alignItems: "center",
    },

    dateText: { fontSize: 12, fontWeight: "600", color: theme.light.black },
    dropdown: {
        width: width * 0.26,
        height: height * 0.045,
        borderWidth: 0.4,
        borderColor: "gray",
        borderRadius: 8,
        paddingHorizontal: 6,
        backgroundColor: theme.light.RightMessageText,
    },
    searchIcon: { width: 25, height: 25, marginTop: 5 },

    /* HISTORY CARD */
    cardWrap: {
        borderWidth: 1,
        marginVertical: 6,
        marginHorizontal: 12,
        borderRadius: 10,
        padding: 12,
    },
    cardRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    cardLeft: { width: width * 0.55 },
    bankText: { fontSize: 15, fontWeight: "700", color: theme.light.black },
    statusText: { fontSize: 14, fontWeight: "700", marginTop: 2 },

    rupeeIcon: { height: 18, width: 18, tintColor: "#001D56" },
    amountText: { fontSize: 14, fontWeight: "500", color: theme.light.black },

    modeText: { fontSize: 14, fontWeight: "500", color: theme.light.black },

    dateLabel: { fontSize: 13, color: theme.light.black },
    dateValue: { fontSize: 14, fontWeight: "600", color: theme.light.black },

    remarksWrap: { marginTop: 6, paddingVertical: 4 },
    remarksLabel: { fontSize: 14, color: theme.light.black },
    remarksValue: { fontSize: 14, fontWeight: "600", color: theme.light.black },

    filterContainer: {
        paddingHorizontal: 12,
        marginTop: 12,
    },

    /* Row with two date inputs side-by-side */
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },

    dateInput: {
        width: "48%",
        // subtle white background + rounded box like screenshot
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 2,
    },

    /* bottom row that contains dropdown + search icon */
    rowBottom: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 12,
    },

    dropdown: {
        width: width * 0.6,        // wider control to match the screenshot look
        height: height * 0.05,
        borderWidth: 0.4,
        borderColor: "gray",
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: "#F0F0F0",
    },

    searchBtn: {
        width: width * 0.12,
        height: height * 0.05,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 8,
        backgroundColor: "transparent",
    },

    searchIcon: {
        width: 26,
        height: 26,
        tintColor: "#000",
    },
});
