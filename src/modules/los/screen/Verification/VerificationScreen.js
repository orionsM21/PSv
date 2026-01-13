import React, {
    useCallback,
    useState,
    useMemo,
    useEffect,
    useContext,
    useRef,
} from "react";
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    RefreshControl,
    useColorScheme,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { useSelector } from "react-redux";
import { Dropdown } from "react-native-element-dropdown";

import { BASE_URL } from "../../api/Endpoints";
import { VERIFICATION_CONFIG } from "./verificationConfig";
import Header from "../Component/Header";
import ApplicationCardDetail from "../Component/ApplicationCardDetail";
import { DrawerContext } from "../../../../Drawer/DrawerContext";

/* ───────────────── FILTER CHIPS ───────────────── */

const FILTERS = ["All", "Pending", "Completed",];

const VerificationScreen = ({ route }) => {
    const { configKey } = route.params || {};
    const config = VERIFICATION_CONFIG[configKey];

    const navigation = useNavigation();
    const { openDrawer } = useContext(DrawerContext);
    const colorScheme = useColorScheme();
    const isDarkMode = colorScheme === "dark";

    const token = useSelector(s => s.auth.token);
    const userDetails = useSelector(s => s.auth.losuserDetails);
    const [pinnedSet, setPinnedSet] = useState(new Set());
    const togglePin = useCallback(appNo => {
        setPinnedSet(prev => {
            const next = new Set(prev);
            next.has(appNo) ? next.delete(appNo) : next.add(appNo);
            return next;
        });
    }, []);

    const [applications, setApplications] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [overallData, setOverallData] = useState([]);

    const [expandedAppNo, setExpandedAppNo] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    /* ───────────── SEARCH (DEBOUNCED) ───────────── */

    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedQuery, setDebouncedQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery.toLowerCase());
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    /* ───────────── FILTER CHIP STATE ───────────── */

    const [activeFilter, setActiveFilter] = useState("All");

    /* ───────────── FETCH APPLICATIONS ───────────── */

    const getAllApplications = useCallback(async () => {
        const res = await axios.get(`${BASE_URL}getAllApplication`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(res.data.data || []);
    }, [token]);

    /* ───────────── FETCH LOGS & DERIVE DATA ───────────── */

    const getLogs = useCallback(async () => {
        const res = await axios.get(`${BASE_URL}getAllLogsDetails`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        const logs = res.data.data || [];
        const relevantLogs = logs.filter(
            l => l.description === config.description
        );

        const myTaskSet = new Set(
            relevantLogs
                .filter(
                    l =>
                        userDetails.designation === "CEO" ||
                        l.user === userDetails.userName
                )
                .map(l => l.applicationNumber)
        );

        const overallSet = new Set(
            relevantLogs.map(l => l.applicationNumber)
        );

        setFilteredData(
            applications.filter(a => myTaskSet.has(a.applicationNo))
        );

        setOverallData(
            applications.filter(a => overallSet.has(a.applicationNo))
        );
    }, [applications, config.description, userDetails, token]);

    useEffect(() => {
        getAllApplications();
    }, [configKey]);

    useEffect(() => {
        if (applications.length) getLogs();
    }, [applications]);

    /* ───────────── DATA SOURCE BASED ON ROLE ───────────── */

    const baseData = useMemo(() => {
        return ["CEO", "Sales Head"].includes(userDetails?.designation)
            ? overallData
            : filteredData;
    }, [overallData, filteredData, userDetails]);

    /* ───────────── APPLY FILTER CHIP ───────────── */

    // const chipFilteredData = useMemo(() => {
    //     switch (activeFilter) {
    //         case "My Tasks":
    //             return filteredData;
    //         case "Completed":
    //             return baseData.filter(i => i.status === "Completed");
    //         case "Pending":
    //             return baseData.filter(i => i.status !== "Completed");
    //         default:
    //             return baseData;
    //     }
    // }, [activeFilter, baseData, filteredData]);

    const chipFilteredData = useMemo(() => {
        switch (activeFilter) {


            case "Completed":
                return baseData.filter(i =>
                    i?.status === "Completed" ||
                    i?.stage === "Disbursed" ||
                    i?.leadStage === "Disbursed"
                );

            case "Pending":
                return baseData.filter(i =>
                    i?.status !== "Completed" &&
                    i?.stage !== "Disbursed" &&
                    i?.leadStage !== "Disbursed"
                );

            default:
                return baseData;
        }
    }, [activeFilter, baseData, filteredData]);


    /* ───────────── APPLY SEARCH ───────────── */

    const finalData = useMemo(() => {
        if (!debouncedQuery) return chipFilteredData;

        return chipFilteredData.filter(item => {
            const applicants = item?.applicant || [];
            const searchText = [
                item.applicationNo,
                item.productName,
                ...applicants.flatMap(a => [
                    a?.individualApplicant?.firstName,
                    a?.individualApplicant?.lastName,
                    a?.individualApplicant?.pan,
                    a?.individualApplicant?.mobileNumber,
                ]),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchText.includes(debouncedQuery);
        });
    }, [chipFilteredData, debouncedQuery]);


    // ✅ NOW safe to use
    const sortedData = useMemo(() => {
        if (!Array.isArray(finalData)) return [];

        return [...finalData].sort((a, b) => {
            const aPinned = pinnedSet.has(a.applicationNo);
            const bPinned = pinnedSet.has(b.applicationNo);

            if (aPinned && !bPinned) return -1;
            if (!aPinned && bPinned) return 1;
            return 0;
        });
    }, [finalData, pinnedSet]);


    /* ───────────── HANDLERS ───────────── */

    const onToggleExpand = useCallback(appNo => {
        setExpandedAppNo(prev => (prev === appNo ? null : appNo));
    }, []);

    const handleCardPress = useCallback(
        item => {
            navigation.navigate(config.navigateTo, { item });
        },
        [navigation, config.navigateTo]
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await getAllApplications();
        setRefreshing(false);
    };

    /* ───────────────── RENDER ───────────────── */
    const dynamicStyles = StyleSheet.create({
        dropdown: {
            height: 50, borderColor: isDarkMode ? '#444' : '#ccc',
            backgroundColor: isDarkMode ? '#1e1e1e' : '#fff',
            borderWidth: 1, borderRadius: 8, paddingHorizontal: 12,
        },
        placeholderStyle: { color: isDarkMode ? '#aaa' : '#666', fontSize: 16, },
        selectedTextStyle: { color: isDarkMode ? 'red' : '#1e1e1e', fontSize: 16, },
        dropdownContainer: { backgroundColor: isDarkMode ? '#727272' : '#fff', borderColor: isDarkMode ? '#444' : '#ccc', },
        itemTextStyle: { color: isDarkMode ? '#000' : '#000', },
    });
    return (
        <SafeAreaView style={styles.container}>
            <Header title={config.title} onMenuPress={openDrawer} />

            {/* FILTER CHIPS */}
            <View style={styles.filterRow}>
                {FILTERS.map(f => (
                    <TouchableOpacity
                        key={f}
                        onPress={() => setActiveFilter(f)}
                        style={[
                            styles.chip,
                            activeFilter === f && styles.chipActive,
                        ]}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                activeFilter === f && styles.chipTextActive,
                            ]}
                        >
                            {f}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* SEARCH DROPDOWN */}
            <Dropdown
                style={styles.dropdown}
                data={finalData.map(d => ({
                    label: d.applicationNo,
                    value: d.applicationNo,
                    record: d,
                }))}
                labelField="label"
                valueField="value"
                search
                searchPlaceholder="Search App No / PAN / Name"
                onChangeText={setSearchQuery}
                onChange={opt => handleCardPress(opt.record)}
                placeholderStyle={dynamicStyles.placeholderStyle}
                selectedTextStyle={dynamicStyles.selectedTextStyle}
                containerStyle={dynamicStyles.dropdownContainer}
                itemTextStyle={dynamicStyles.itemTextStyle}
                inputSearchStyle={{ color: '#111827', backgroundColor: '#E2E2E2', borderRadius: 8, }}
            />

            {/* LIST */}
            {/* {loading ? (
                <SkeletonList count={6} />
            ) : ( */}
            <FlatList
                // data={finalData}
                data={sortedData}
                keyExtractor={item => item.applicationNo}
                renderItem={({ item }) => (
                    <ApplicationCardDetail
                        item={item}
                        userDetails={userDetails}
                        handleCardPress={handleCardPress}
                        onToggleExpand={onToggleExpand}
                        isExpanded={expandedAppNo === item.applicationNo}
                        currentPages={config.currentPage}
                        isPinned={pinnedSet.has(item.applicationNo)}   // ⭐
                        onTogglePin={togglePin}                        // ⭐
                    />

                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                contentContainerStyle={{ paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
            />
            {/* )} */}
        </SafeAreaView>
    );
};

export default VerificationScreen;

/* ───────────────── STYLES ───────────────── */

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F6F8FC" },

    filterRow: {
        flexDirection: "row",
        padding: 10,
        gap: 8,
    },
    chip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: "#E5E7EB",
    },
    chipActive: {
        backgroundColor: "#2563EB",
    },
    chipText: {
        color: "#111827",
        fontWeight: "500",
    },
    chipTextActive: {
        color: "#fff",
    },

    dropdown: {
        marginHorizontal: 12,
        marginBottom: 6,
        height: 50,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
    },
});
