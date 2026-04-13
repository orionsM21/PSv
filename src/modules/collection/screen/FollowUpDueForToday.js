// FollowUpDueForToday.js
import React, {
    useCallback,
    useEffect,
    useRef,
    useMemo,
    useState,
    memo,
} from "react";
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Pressable,
    FlatList,
    Dimensions,
    Linking,
    BackHandler,
    StyleSheet,
    ActivityIndicator,
    Animated,
    Alert,
    StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import moment from "moment";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { theme } from "../utility/Theme";

const { width, height } = Dimensions.get("screen");

/* -------------------------
   Custom Collapse (Smooth Height)
   - Measures children once, then animates height
   - Props: expanded (bool), children
   ------------------------- */
const Collapse = ({ expanded, children, duration = 200 }) => {
    const measuredHeight = useRef(0);
    const anim = useRef(new Animated.Value(0)).current;
    const ready = useRef(false);

    // When measuredHeight changes (first layout) or expanded toggles, animate
    useEffect(() => {
        const toValue = expanded ? measuredHeight.current : 0;
        Animated.timing(anim, {
            toValue,
            duration,
            useNativeDriver: false,
        }).start();
    }, [expanded, anim, duration]);

    // If children change height after first render, update measuredHeight via onLayout
    const onLayout = useCallback((e) => {
        const h = e.nativeEvent.layout.height;
        if (h !== measuredHeight.current) {
            measuredHeight.current = h;
            // If currently expanded, set anim value to measured height (so new content fits)
            if (expanded) {
                anim.setValue(h);
            }
        }
        ready.current = true;
    }, [anim, expanded]);

    return (
        <Animated.View style={{ height: anim, overflow: "hidden" }}>
            <View onLayout={onLayout} style={{ width: "100%" }}>
                {children}
            </View>
        </Animated.View>
    );
};

/* ---------------------------------------------------------
   Reusable Follow Card
   - variant: 'visit' | 'ptp' | 'followup'
   - expanded: boolean
   - onToggle(index), onPress(item), onCall(number)
   --------------------------------------------------------- */
const FollowCard = memo(
    ({ item, index, expanded, onToggle, onPress, variant, onCall }) => {
        const statusColor =
            item?.scheduleStatus === "Pending"
                ? "orange"
                : item?.scheduleStatus === "Completed" || item?.status === "Approved"
                    ? "green"
                    : item?.status === "Rejected"
                        ? "red"
                        : theme.light.black;

        const renderLeft = () => {
            if (variant === "visit") {
                return (
                    <>
                        <Text style={styles.hintText}>{item?.name}</Text>
                        <Text numberOfLines={2} style={styles.subText}>
                            {item?.userName}
                        </Text>
                    </>
                );
            }
            // ptp or followup
            return (
                <>
                    <Text style={styles.hintText}>Name</Text>
                    <Text numberOfLines={2} style={styles.subText}>
                        {item?.name}
                    </Text>
                </>
            );
        };

        return (
            <TouchableOpacity activeOpacity={0.95} onPress={() => onPress(item)}>
                <LinearGradient
                    colors={["#FFFFFF", "#F4F2F2", "#F2EFEF", "#D0CCCC"]}
                    style={styles.card}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.cardLeft}>{renderLeft()}</View>

                        {variant === "visit" ? (
                            <View style={styles.cardCenter}>
                                <Text style={[styles.statusText, { color: statusColor }]}>
                                    {item?.scheduleStatus}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.cardCenter}>
                                <Text style={styles.hintTextSmall}>
                                    {variant === "ptp" ? item?.lenderName ?? "" : "Lender Name"}
                                </Text>
                                {variant === "ptp" && (
                                    <Text style={styles.subText}>{item?.lenderName}</Text>
                                )}
                            </View>
                        )}

                        <View style={styles.cardRight}>
                            <TouchableOpacity onPress={() => onToggle(index)}>
                                <MaterialCommunityIcons
                                    name={expanded ? "arrow-up-drop-circle" : "arrow-down-drop-circle"}
                                    size={28}
                                    color={theme.light.darkBlue}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Collapse expanded={expanded}>
                        <View style={styles.expanded}>
                            {variant === "visit" && (
                                <>
                                    <View style={styles.row}>
                                        <View style={styles.col50}>
                                            <Text style={styles.rowLabel}>Date</Text>
                                            <Text style={styles.rowValue}>
                                                {moment(item?.scheduleDate).format("DD-MM-YYYY")}
                                            </Text>
                                        </View>
                                        <View style={styles.col50}>
                                            <Text style={styles.rowLabel}>Time</Text>
                                            <Text style={styles.rowValue}>{item?.scheduleTime}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        <View style={{ width: "100%", marginTop: 8 }}>
                                            <Text style={styles.rowLabel}>Visiting Address</Text>
                                            <Text numberOfLines={2} style={styles.rowValue}>
                                                {item?.scheduleAddress}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}

                            {(variant === "ptp" || variant === "followup") && (
                                <>
                                    <View style={styles.row}>
                                        <View style={styles.col50}>
                                            <Text style={styles.rowLabel}>LAN</Text>
                                            <Text style={styles.rowValue}>{item?.loanAccountNumber}</Text>
                                        </View>
                                        <View style={styles.col50}>
                                            <Text style={styles.rowLabel}>Follow-Up Type</Text>
                                            <Text style={styles.rowValue}>{item?.callOutcome ?? "PTP"}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        <View style={{ width: "65%", marginTop: 8 }}>
                                            <Text style={styles.rowLabel}>Follow-Up Date</Text>
                                            <Text numberOfLines={1} style={styles.rowValue}>
                                                {item?.callFollowupDate ??
                                                    moment(item?.ptpFollowUpdate).format("DD-MM-YYYY hh:mm A")}
                                            </Text>
                                        </View>

                                        <View style={styles.callCol}>
                                            <TouchableOpacity
                                                onPress={() => onCall(item?.mobile)}
                                                style={styles.callBtn}
                                            >
                                                <Ionicons name="call" size={22} color={theme.light.orange} />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        <View style={{ width: "65%", marginTop: 4 }}>
                                            <Text style={styles.rowLabel}>Remarks</Text>
                                            <Text numberOfLines={2} style={styles.rowValue}>
                                                {item?.callOutcome ? item?.remarkCallFollwoup : item?.remarkPtpFollowUp}
                                            </Text>
                                        </View>
                                    </View>
                                </>
                            )}
                        </View>
                    </Collapse>
                </LinearGradient>
            </TouchableOpacity>
        );
    }
);

/* -------------------------
   Main screen component
   ------------------------- */
const FollowUpDueForToday = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { screenName = "", data = [] } = route?.params ?? {};

    const token = useSelector((s) => s.auth?.token);

    const [listData, setListData] = useState(Array.isArray(data) ? data : []);
    const [expandedIndex, setExpandedIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        navigation.setOptions({
            title: screenName,
            headerShown: true,
            headerTitleAlign: "center",
        });
    }, [screenName]);
    // back handler
    useEffect(() => {
        const onBack = () => {
            navigation.goBack();
            return true;
        };
        BackHandler.addEventListener("hardwareBackPress", onBack);
        return () => BackHandler.removeEventListener("hardwareBackPress", onBack);
    }, [navigation]);

    // update list when route changes
    useEffect(() => {
        setListData(Array.isArray(data) ? data : []);
    }, [data]);

    const onToggle = useCallback((index) => {
        // purely local expand state now
        setExpandedIndex((prev) => (prev === index ? -1 : index));
    }, []);

    const goToDetails = useCallback(
        (item) => navigation.navigate("CaseDetails", { data: item }),
        [navigation]
    );

    const onCall = useCallback(async (mobile) => {
        if (!mobile) {
            return Alert.alert("No mobile number available");
        }
        try {
            await Linking.openURL(`tel:${mobile}`);
        } catch (e) {
            Alert.alert("Unable to open dialer");
        }
    }, []);

    const variant = useMemo(() => {
        if (screenName === "Visits due for today") return "visit";
        if (screenName === "PTPs due for today") return "ptp";
        return "followup";
    }, [screenName]);

    const renderItem = useCallback(
        ({ item, index }) => (
            <FollowCard
                item={item}
                index={index}
                expanded={expandedIndex === index}
                onToggle={onToggle}
                onPress={goToDetails}
                variant={variant}
                onCall={onCall}
            />
        ),
        [expandedIndex, onToggle, goToDetails, variant, onCall]
    );

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar
                translucent
                backgroundColor="#007BFF"
                barStyle="light-content"
            />

            {/* HEADER */}


            {/* CONTENT AREA */}
            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={theme.light.darkBlue} />
                </View>
            ) : (
                <FlatList
                    data={listData}
                    keyExtractor={(item, idx) =>
                        String(item?.loanAccountNumber ?? item?.id ?? idx)
                    }
                    renderItem={renderItem}
                    contentContainerStyle={{
                        paddingBottom: 60,
                        paddingHorizontal: 10,
                    }}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </SafeAreaView>

    );
};

export default memo(FollowUpDueForToday);

/* -----------------------------
   Styles
   ----------------------------- */
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    screen: {
        flex: 1,
        backgroundColor: theme.light.white || "#ffffff",
    },
    header: {
        flexDirection: "row",
        height: 60,
        alignItems: "center",
        borderBottomColor: theme.light.black,
        borderBottomWidth: 0.5,
        paddingHorizontal: 10,
        backgroundColor: theme.light.white || "#ffffff",
    },
    backBtn: {
        width: 50,
        marginLeft: 6,
        justifyContent: "center",
        alignItems: "flex-start",
    },
    title: {
        fontSize: 20,
        fontWeight: "600",
        color: theme.light.black,
        marginLeft: 6,
    },
    listWrap: {
        flex: 1,
        width,
        alignSelf: "center",
    },

    card: {
        marginVertical: 8,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#E6E6E6",
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    cardLeft: {
        width: width * 0.45,
    },
    cardCenter: {
        flex: 1,
        paddingHorizontal: 6,
    },
    cardRight: {
        width: 48,
        alignItems: "flex-end",
    },

    hintText: {
        fontSize: 15,
        fontWeight: "600",
        color: theme.light.black,
    },
    hintTextSmall: {
        fontSize: 13,
        fontWeight: "500",
        color: theme.light.msgTime,
    },
    subText: {
        fontSize: 14,
        color: theme.light.msgTime,
        marginTop: 4,
    },

    statusText: {
        fontSize: 14,
        fontWeight: "700",
    },

    expanded: {
        marginTop: 6,
        paddingTop: 4,
        borderTopWidth: 0.5,
        borderTopColor: "#EEE",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 6,
    },
    col50: {
        width: "48%",
    },

    rowLabel: {
        fontSize: 14,
        color: theme.light.msgTime,
    },
    rowValue: {
        fontSize: 15,
        fontWeight: "600",
        color: theme.light.black,
        marginTop: 4,
    },

    callCol: {
        width: width * 0.28,
        justifyContent: "center",
        alignItems: "flex-end",
    },
    callBtn: {
        padding: 6,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },

    loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
});
