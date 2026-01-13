import React, { useEffect, memo, useCallback } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    BackHandler,
    Image,
    Dimensions,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { scale, moderateScale, verticalScale } from "react-native-size-matters";

const { width, height } = Dimensions.get("screen");

const COLORS = {
    primary: "#001D56",
    text: "#001D56",
    bg: "#FFFFFF",
    rowLight: "#FFFFFF",
    rowDark: "#EDEDED",
    headerBg: "#F3F7FF",
    sectionHeader: "#001D56",
};

// ---------------------------------------------------
// 🔹 Universal Row Component
// ---------------------------------------------------
const InfoRow = memo(({ label, value, isDark, isMoney }) => {
    return (
        <View
            style={[
                styles.row,
                { backgroundColor: isDark ? COLORS.rowDark : COLORS.rowLight },
            ]}
        >
            <Text style={styles.label}>{label}</Text>

            {/* 🔥 Auto money format + icon */}
            {isMoney ? (
                <View style={styles.moneyWrap}>
                    <View style={styles.moneyIcon}>
                        <Image
                            source={require("../../../asset/TrueBoardIcon/rupee.png")}
                            style={{ width: 13, height: 13, tintColor: "#fff" }}
                        />
                    </View>
                    <Text style={styles.value}>
                        {" "}
                        {value ? Number(value).toLocaleString("en-IN") : "--"}
                    </Text>
                </View>
            ) : (
                <Text style={styles.value}>{value || "--"}</Text>
            )}
        </View>
    );
});

// ---------------------------------------------------
// 🔹 Section Header Component
// ---------------------------------------------------
const SectionHeader = memo(({ title }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
));

// ---------------------------------------------------
// 🔥 MAIN MERGED SCREEN
// ---------------------------------------------------
const ApplicationData = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { data, section } = route.params;

    const handleBack = useCallback(() => {
        navigation.goBack();
        return true;
    }, []);

    useEffect(() => {
        BackHandler.addEventListener("hardwareBackPress", handleBack);
        return () =>
            BackHandler.removeEventListener("hardwareBackPress", handleBack);
    }, []);

    const applicationFields = [
        ["Lender ID", data.lenderId],
        ["Lender Name", data.lenderName],
        ["LMS ID", data.lmsApplicationId],
        ["Loan Account No", data.loanAccountNumber],
        ["Name", data.name],
        ["Customer ID", data.lmsCustomerId],
        ["Bank Account No", data.bankAccountNumber],
        ["Pincode", data.pincode],
        ["PAN", data.pan?.toUpperCase()],
        ["Aadhar", data.aadhar],
    ];

    const loanHistoryFields = [
        ["Loan Product", data.loanProduct],
        ["Loan Amount", data.loanAmount, true],
        ["Date of Disbursement", data.dateOfDisbursement],
        ["Interest", data.interest],
        ["Tenure", data.tenure ? `${data.tenure} months` : "--"],
        ["Repayment Type", data.repaymentType],
        ["Collateral", data.collateral],
        ["Frequency", data.frequency],
        ["Disbursed Amount", data.disbursedAmount, true],

        // Repayment
        ["Bank IFSC", data.bankIfsc],
        ["Bank UPI Address", data.bankUpiAddress],
        ["DPD", data.dpd],
        ["Total Overdue Amount", data.totalOverdueAmount, true],
        ["Pending EMI Amount", data.pendingEmiAmount, true],
        ["Pending EMI Principle Amount", data.pendingEmiPrincipleAmount, true],
        ["Pending EMI Interest Amount", data.pendingEmiInterestAmount, true],
        ["Other Charges", data.otherCharges, true],
        ["DPC / LPP", data.dpcOrLppOrDelayPaymentChargesOrLatePaymentPenalty, true],
        ["Cheque Bounce Charges", data.chequeBounceCharges, true],
        ["Outstanding Principal", data.totalOutstandingPrincipal, true],
        ["Outstanding Interest", data.totalOutstandingInterest, true],
        ["Closure Amount", data.closureAmount, true],
        ["Settlement Amount", data.settlementAmount, true],
        ["EMI Amount", data.emiAmount, true],
        ["Last Payment Amount", data.lastPaymentAmount, true],
    ];

    const renderSection = (title, fields) => (
        <View style={styles.card}>
            <SectionHeader title={title} />
            {fields.map(([label, value, isMoney], index) => (
                <InfoRow
                    key={label}
                    label={label}
                    value={value}
                    isMoney={isMoney}
                    isDark={index % 2 === 1}
                />
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}


            <ScrollView>
                {section === "application" &&
                    renderSection("Application Data", applicationFields)}

                {section === "loanhistory" &&
                    renderSection("Loan History", loanHistoryFields)}

                {/* If you want BOTH when no section passed */}
                {!section && (
                    <>
                        {renderSection("Application Data", applicationFields)}
                        {renderSection("Loan History", loanHistoryFields)}
                    </>
                )}
            </ScrollView>
        </View>
    );

};

export default memo(ApplicationData);

// ---------------------------------------------------
// 🔹 Styles
// ---------------------------------------------------
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.bg },

    header: {
        height: verticalScale(55),
        flexDirection: "row",
        alignItems: "center",
        borderBottomWidth: 0.6,
        borderColor: "#DDD",
        backgroundColor: COLORS.bg,
        elevation: 3,
        paddingHorizontal: moderateScale(10),
    },

    backBtn: {
        width: 40,
        justifyContent: "center",
    },

    headerTitle: {
        fontSize: scale(17),
        fontWeight: "700",
        color: COLORS.primary,
    },

    card: {
        marginTop: verticalScale(15),
        marginHorizontal: moderateScale(12),
        borderWidth: 1,
        borderColor: COLORS.primary,
        borderRadius: 10,
        backgroundColor: COLORS.bg,
        overflow: "hidden",
        marginBottom: verticalScale(15),
    },

    sectionHeader: {
        padding: moderateScale(12),
        backgroundColor: COLORS.sectionHeader,
    },

    sectionHeaderText: {
        fontSize: scale(16),
        fontWeight: "700",
        color: "#fff",
    },

    row: {
        flexDirection: "row",
        paddingVertical: verticalScale(10),
        paddingHorizontal: moderateScale(12),
        alignItems: "center",
    },

    label: {
        width: "45%",
        fontSize: scale(14),
        fontWeight: "600",
        color: COLORS.text,
    },

    value: {
        width: "55%",
        fontSize: scale(15),
        fontWeight: "700",
        color: COLORS.text,
    },

    moneyWrap: {
        flexDirection: "row",
        alignItems: "center",
        width: "55%",
    },

    moneyIcon: {
        width: width * 0.045,
        height: height * 0.02,
        borderRadius: 100,
        backgroundColor: COLORS.primary,
        justifyContent: "center",
        alignItems: "center",
    },
});

