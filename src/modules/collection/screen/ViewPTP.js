import React, { useState, memo } from "react";
import {
    View,
    StyleSheet,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";

// import ToastNotification from "../Component/ToastAlert";
// import { showLoader } from "../redux/action";

import { scale, verticalScale, moderateScale, ms } from "react-native-size-matters";

import { theme, white } from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';
import ToastNotification from "../component/ToastAlert";
const ViewPTP = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { params } = useRoute();
    const { data, alldetail } = params;

    const userProfile = useSelector((s) => s.auth.userProfile);
    const token = useSelector((s) => s.auth.token);

    const [show, setShow] = useState(false);
    const [type, setType] = useState();
    const [header, setHeader] = useState();
    const [body, setBody] = useState();

    const hide = () => {
        setTimeout(() => setShow(false), 2000);
    };

    const showSuccess = (msg) => {
        setShow(true);
        setType("SUCCESS");
        setHeader("SUCCESS");
        setBody(msg);
        hide();
    };

    const sendPaymentLink = async () => {
        // dispatch(showLoader(true));

        const payload = {
            bankAccountNumber: data.bankAccountNumber,
            bankIfsc: data.bankIfsc,
            bankUpiAddress: data.bankUpiAddress,
            lenderId: data.lenderId,
            lenderName: data.lenderName,
            loanAccountNumber: data.loanAccountNumber,
            smsFlag: true,
            user: { userId: userProfile.userId },
        };

        try {
            await apiClient.post(`addPaymentInfo`, payload, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            });

            // dispatch(showLoader(false));
            showSuccess("Repayment details sent successfully");
        } catch (err) {
            console.log("addPaymentInfo Err:", err);
            // dispatch(showLoader(false));
        }
    };

    const formatTime = (t) => moment(t, "HH:mm").format("h:mm A");

    const followDateObj = new Date(data?.followUpDate);
    const followTime = followDateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <>


            {/* MAIN CONTENT */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {data?.status === "Pending" && (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("PTP", {
                                // data,
                                data: alldetail,
                                filleddata: data,
                                ptpId: data.ptpId,
                                fromScreen: "ViewPTP",
                                initialMode: 1,
                                openEdit: true,   // triggers auto-fill
                            })

                        }
                        style={styles.editBtn}
                    >
                        <Text style={styles.editText}>Edit PTP</Text>
                    </TouchableOpacity>

                )}

                {/* PTP CARD */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>{data?.status}</Text>
                        <Text style={styles.cardHeaderText}>
                            Event Date: {moment(data?.lastModifiedTime).format("DD-MM-YYYY hh:mm A")}
                        </Text>
                    </View>

                    {/* FIELDS */}
                    {renderRow("Agent Name", `${userProfile.firstName} ${userProfile.lastName}`)}
                    {renderRowAlt("PTP Type", data.ptpType)}
                    {renderRow("PTP Measures", data.ptpMode)}
                    {renderAmountRow("Amount", data.ptpAmount)}
                    {renderRow("PTP Id", data.ptpId)}
                    {renderStatusRow("Status", data.status)}
                    {renderRowAlt("PTP Date", moment(data.ptpDate).format("DD-MMM-YYYY"))}
                    {renderRow("PTP Time", data.ptpTime ? formatTime(data.ptpTime) : "")}
                    {renderRowAlt("Follow Up Date", moment(data.followUpDate).format("DD-MMM-YYYY"))}
                    {renderRow("Follow Up Time", followTime)}
                    {renderRowAlt("Remark", data.remark)}
                </View>

                {/* MAKE PAYMENT */}
                {!(data.status === "Broken" || data.status === "Success" || data.status === "Paid") && (
                    <TouchableOpacity
                        onPress={() =>
                            navigation.navigate("Payment", {
                                data: data,
                                fromScreen: "ViewPTP",
                                initialMode: 1,
                                resetMobile: true,
                            })
                        }
                        style={styles.paymentBtn}
                    >
                        <Text style={styles.paymentBtnText}>Make Payment</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {show && <ToastNotification isModalVisible={true} type={type} header={header} body={body} />}
        </>
    );
};

const renderRow = (label, value) => (
    <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
    </View>
);

const renderRowAlt = (label, value) => (
    <View style={styles.rowAlt}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
    </View>
);

const renderStatusRow = (label, status) => (
    <View style={styles.row}>
        <Text style={styles.rowLabel}>{label}</Text>

        <Text
            style={[
                styles.rowValue,
                {
                    color:
                        status === "Pending"
                            ? "orange"
                            : status === "Paid" || status === "Success"
                                ? "green"
                                : "black",
                },
            ]}
        >
            {status}
        </Text>
    </View>
);

const renderAmountRow = (label, amt) => (
    <View style={styles.rowAlt}>
        <Text style={styles.rowLabel}>{label}</Text>

        <View style={styles.amountWrapper}>
            <View style={styles.rupeeCircle}>
                <Image source={require("../../../asset/icon/rupee.png")} style={styles.rupeeIcon} />
            </View>

            <Text style={styles.rowValue}>
                {" "}
                {amt ? parseFloat(amt).toLocaleString("en-IN", { minimumFractionDigits: 2 }) : ""}
            </Text>
        </View>
    </View>
);

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: "row",
        height: verticalScale(55),
        alignItems: "center",
        backgroundColor: white,
        borderBottomColor: "#ddd",
        borderBottomWidth: 0.8,
    },
    backBtn: {
        width: scale(40),
        marginLeft: scale(15),
    },
    headerTitle: {
        fontSize: ms(20),
        fontWeight: "700",
        color: theme.light.black,
    },

    scrollContent: {
        paddingHorizontal: scale(12),
    },

    editBtn: {
        alignItems: "flex-end",
        marginTop: verticalScale(10),
    },
    editText: {
        fontSize: ms(14),
        fontWeight: "700",
        color: theme.light.darkBlue,
    },

    card: {
        borderWidth: 1,
        borderColor: theme.light.activeChatText,
        borderRadius: scale(8),
        backgroundColor: white,
        marginTop: verticalScale(10),
    },

    cardHeader: {
        padding: scale(12),
        backgroundColor: theme.light.darkBlue,
        borderTopLeftRadius: scale(8),
        borderTopRightRadius: scale(8),
        flexDirection: "row",
        justifyContent: "space-between",
    },
    cardHeaderText: {
        fontSize: ms(12),
        fontWeight: "600",
        color: white,
    },

    row: {
        flexDirection: "row",
        padding: scale(10),
        alignItems: "center",
    },
    rowAlt: {
        flexDirection: "row",
        padding: scale(10),
        alignItems: "center",
        backgroundColor: theme.light.searchContainerColor,
    },
    rowLabel: {
        width: "50%",
        fontSize: ms(12),
        color: theme.light.voilet,
        fontFamily: "Calibri",
    },
    rowValue: {
        fontSize: ms(14),
        fontWeight: "700",
        color: theme.dark.voilet,
        fontFamily: "Calibri",
        flexShrink: 1,
    },

    rupeeCircle: {
        width: scale(18),
        height: scale(18),
        borderRadius: 100,
        backgroundColor: "#001D56",
        justifyContent: "center",
        alignItems: "center",
        marginRight: scale(5),
    },
    rupeeIcon: {
        width: scale(12),
        height: scale(12),
        tintColor: white,
    },
    amountWrapper: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        justifyContent: "flex-start",
    },

    paymentBtn: {
        height: verticalScale(44),
        borderRadius: scale(8),
        backgroundColor: theme.light.darkBlue,
        alignItems: "center",
        justifyContent: "center",
        marginVertical: verticalScale(20),
    },
    paymentBtnText: {
        fontSize: ms(16),
        fontWeight: "800",
        color: white,
    },
});

export default memo(ViewPTP);
