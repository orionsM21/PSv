import React, { useMemo, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Modal,
    Image,
    StyleSheet,
    SafeAreaView,
    useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format as formatDateFns } from 'date-fns';
import PropTypes from 'prop-types';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

/*
  Refactored SanctionReportModal (React Native)
  - Separated concerns: small presentational components, helpers, and memoization
  - Sticky action button sits outside ScrollView for stable layout
  - Utilities for date formatting and currency
  - Light-weight table component using flex rows (responsive)
  - Uses safe-area insets for correct bottom spacing

  Usage:
  <SanctionReportModal visible={visible} onClose={onClose} decisionData={data} ... />
*/

/* ----------------------------- Helpers ------------------------------ */
const fmtDateFromArray = (arr, outputFormat = 'dd-MM-yyyy') => {
    if (!Array.isArray(arr) || arr.length < 3) return 'N/A';
    const [y, m, d] = arr;
    // Build native Date and format — month in array is 1-indexed
    try {
        const dt = new Date(Number(y), Number(m) - 1, Number(d));
        return formatDateFns(dt, outputFormat.replace('yyyy', 'yyyy'));
    } catch (e) {
        return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
    }
};

const currencyINR = (val) => {
    const n = Number(val || 0);
    return `₹ ${n.toLocaleString('en-IN')}`;
};

/* ------------------------- Presentational --------------------------- */
const H = ({ children, style }) => (
    <Text style={[styles.h, style]} numberOfLines={0}>
        {children}
    </Text>
);

const P = ({ children, style }) => (
    <Text style={[styles.p, style]}>{children}</Text>
);

const Small = ({ children, style }) => (
    <Text style={[styles.small, style]}>{children}</Text>
);

const TableRow = ({ children, style }) => (
    <View style={[styles.tableRow, style]}>{children}</View>
);

/* ------------------------- Hook / Data ------------------------------ */
const useSanctionData = (props) => {
    const { decisionData = {}, getOwnContribution = [], BusinessDate = {}, SanctionLetterByApplicationNo = {}, firstDueDate } = props;

    const sanctionAmount = decisionData?.data?.sanctionAmount || 0;
    const sanctionROI = decisionData?.data?.sanctionROI || 0;
    const tenor = decisionData?.data?.sanctionTenor || 0;
    const emi = decisionData?.data?.emi || 0;

    const schemeName = decisionData?.data?.productDetailsAndAmort?.scheme?.schemeName || 'N/A';

    const formattedBusinessDate = fmtDateFromArray(BusinessDate?.businnessDate || BusinessDate);

    const disbursement = getOwnContribution[0] || {};

    return {
        sanctionAmount,
        sanctionROI,
        tenor,
        emi,
        schemeName,
        formattedBusinessDate,
        disbursement,
        SanctionLetterByApplicationNo,
        firstDueDate,
    };
};

/* --------------------------- Main Component ------------------------- */
export default function SanctionReportModal(props) {
    const insets = useSafeAreaInsets();
    const { width } = useWindowDimensions();

    const {
        visible,
        onClose,
        decisionData,
        aaplicantName,
        formattedAddress,
        textColor = '#000',
        getOwnContribution,
        tempSanctionROI,
        SanctionLetterByApplicationNo,
        totalInsurance,
        generateSanctionLetterHTML,
        openFileSanction,
        filePathSanction,
        BusinessDate,
        firstDueDate,
        // insuranceDetails
    } = props;

    const data = useSanctionData({ decisionData, getOwnContribution, BusinessDate, SanctionLetterByApplicationNo, firstDueDate });
    console.log(firstDueDate, 'FirstPDCDatw')
    const onDownload = useCallback(() => {
        if (typeof generateSanctionLetterHTML === 'function') generateSanctionLetterHTML();
    }, [generateSanctionLetterHTML]);

    const onOpenFile = useCallback(() => {
        if (typeof openFileSanction === 'function') openFileSanction();
    }, [openFileSanction]);
    const safeNum = (v) => Number(v || 0);
    // const insCharge = safeNum(insuranceDetails?.[0]?.insurancePremiumAmount);
    // const gstInsCharge = safeNum(insuranceDetails?.[0]?.insurancePremiumTaxAmount);

    const updateRows = SanctionLetterByApplicationNo?.updateDisbursement
        ? [SanctionLetterByApplicationNo.updateDisbursement]   // wrap SINGLE object
        : [];

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
            <SafeAreaView style={styles.modalContainer}>
                <ScrollView contentContainerStyle={[styles.scrollContainer, { paddingBottom: insets.bottom + 120 }]} showsVerticalScrollIndicator={false}>

                    {/* Actions (top) */}
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.primaryButton} onPress={onDownload} accessibilityRole="button">
                            <Text style={styles.primaryButtonText}>Download Sanction Letter</Text>
                        </TouchableOpacity>

                        {filePathSanction ? (
                            <TouchableOpacity style={[styles.primaryButton, styles.openButton]} onPress={onOpenFile} accessibilityRole="button">
                                <Text style={styles.primaryButtonText}>📂 Open PDF</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Image source={require('../../asset/afieon.png')} style={styles.logo} resizeMode="contain" />
                        <View style={styles.addressBlock}>
                            <Small>505, 5th Floor, Ecstasy Business Park,</Small>
                            <Small>JSD Road, Next to City Of Joy, Ashok Nagar,</Small>
                            <Small>Mulund West, Mumbai, Maharashtra 400080.</Small>
                            <Small>Email: customercare@aphelionfinance.com</Small>
                            <Small>Phone: 9321193211 / 022-256562</Small>
                        </View>
                    </View>

                    <H style={{ color: '#2563EB' }}>Aphelion Finance Pvt. Ltd.</H>
                    <H style={{ marginBottom: verticalScale(8) }}>(Sanction Letter)</H>

                    {/* Applicant Info */}
                    <View style={styles.section}>
                        <P style={{ fontWeight: '700' }}>Date: {data.formattedBusinessDate}</P>

                        <P style={{ marginTop: verticalScale(6), color: textColor }}>To,</P>
                        <P style={{ color: textColor }}>
                            {aaplicantName?.individualApplicant
                                ? `${aaplicantName?.individualApplicant?.firstName || ''} ${aaplicantName?.individualApplicant?.middleName || ''} ${aaplicantName?.individualApplicant?.lastName || ''}`.trim()
                                : aaplicantName?.organizationApplicant?.organizationName || 'N/A'}
                        </P>

                        <P style={{ color: textColor }}>{formattedAddress}</P>

                        <P style={{ color: textColor }}>
                            <Text style={styles.bold}>Phone: </Text>
                            {aaplicantName?.individualApplicant?.mobileNumber || aaplicantName?.organizationApplicant?.mobileNumber || 'N/A'}
                        </P>
                    </View>

                    {/* Loan Details */}
                    <View style={styles.section}>
                        <P>Dear Customer,</P>
                        <P>
                            We are pleased to inform you that your application for a <Text style={styles.bold}>{data.schemeName}</Text> at Aphelion Finance Pvt Ltd. has been accepted and sanctioned. The key details of Aphelion’s PL -Salaried scheme are as follows:
                        </P>

                        <P>
                            Loan Account No.: <Text style={styles.highlight}>{data.disbursement?.loanAccountNumber || 'N/A'}</Text>
                        </P>

                        <P>
                            Loan Amount: <Text style={styles.highlight}>{currencyINR(data.disbursement?.disbursementAmount || 0)}</Text>
                        </P>

                        <P>
                            Period Of Coverage/Tenure: <Text style={styles.highlight}>{data.tenor} Months</Text>
                        </P>

                        <P>
                            Rate of Interest: <Text style={styles.highlight}>{tempSanctionROI}% p.a</Text>
                        </P>

                        <P>
                            Equated Monthly Installment (EMI): <Text style={styles.highlight}>{currencyINR(data.emi)}*{data.tenor} Monthly</Text>
                        </P>
                    </View>

                    {/* Table */}
                    <P style={[styles.bold, { marginTop: verticalScale(12) }]}>Net Loan Amount Disbursed:</P>

                    <View style={styles.tableWrapper}>

                        {/* Header */}
                        <View style={[styles.row, styles.headerRow]}>
                            <Text style={[styles.cell, styles.colSmall, styles.headerText]}>Sr.No.</Text>
                            <Text style={[styles.cell, styles.colMedium, styles.headerText]}>Issued To</Text>
                            <Text style={[styles.cell, styles.colLarge, styles.headerText]}>Chq/NEFT/RTGS No.</Text>
                            <Text style={[styles.cell, styles.colMedium, styles.headerText]}>Loan Agreement Date</Text>
                            <Text style={[styles.cell, styles.colSmall, styles.headerText]}>Loan Disbursal Amount(₹)</Text>
                        </View>

                        {/* Rows */}
                        {updateRows.length > 0 ? (
                            updateRows.map((item, index) => (
                                <View key={index} style={styles.row}>

                                    {/* Sr.No */}
                                    <Text style={[styles.cell, styles.colSmall]}>
                                        {index + 1}
                                    </Text>

                                    {/* Issued To */}
                                    <Text style={[styles.cell, styles.colMedium]}>
                                        {aaplicantName?.individualApplicant
                                            ? `${aaplicantName?.individualApplicant?.firstName || ''} ${aaplicantName?.individualApplicant?.middleName || ''
                                                } ${aaplicantName?.individualApplicant?.lastName || ''}`.trim()
                                            : aaplicantName?.organizationApplicant?.organizationName || 'N/A'}
                                    </Text>

                                    {/* Cheque/NEFT */}
                                    <Text style={[styles.cell, styles.colLarge]}>
                                        {item?.utrNumber || 'N/A'}
                                    </Text>

                                    {/* Date */}
                                    <Text style={[styles.cell, styles.colMedium]}>
                                        {Array.isArray(item?.utrNumberDate)
                                            ? `${String(item.utrNumberDate[2]).padStart(2, '0')}-${String(
                                                item.utrNumberDate[1]
                                            ).padStart(2, '0')}-${item.utrNumberDate[0]}`
                                            : 'N/A'}
                                    </Text>

                                    {/* Amount */}
                                    <Text style={[styles.cell, styles.colSmall]}>
                                        ₹ {Number(item?.actualAmountDisbursed || 0).toLocaleString('en-IN')}
                                    </Text>

                                </View>
                            ))
                        ) : (
                            <View style={styles.row}>
                                <Text style={styles.cell}>N/A</Text>
                            </View>
                        )}

                    </View>



                    {/* Deductions */}
                    <P style={{ marginTop: verticalScale(12) }}>The following have been deducted from the loan amount sanctioned:</P>

                    <View style={styles.section}>
                        <P>Processing Charges: {currencyINR((SanctionLetterByApplicationNo?.processingFeeDetails?.totalFee || 0) - (SanctionLetterByApplicationNo?.processingFeeDetails?.taxAmt || 0))}</P>
                        <P>GST (As per Invoice) on Processing Charges: {currencyINR(SanctionLetterByApplicationNo?.processingFeeDetails?.taxAmt || 0)}</P>
                        <P>ECS Charges: {currencyINR((SanctionLetterByApplicationNo?.nachFee?.totalFee || 0) + (SanctionLetterByApplicationNo?.stampDutyFee?.totalFee || 0))}</P>
                        <P>GST (As per Invoice) on ECS Charges : ₹ 0 </P>
                        <P>Insurance Charges: {currencyINR(SanctionLetterByApplicationNo?.insuranceDetailList?.[0]?.insurancePremiumAmount || 0)}</P>
                        <P>GST (As per Invoice) on Ins Charges(₹) : {currencyINR(SanctionLetterByApplicationNo?.insuranceDetailList?.[0]?.insurancePremiumTaxAmount || 0)}</P>
                        <P >GST (As per Invoice) on Ins Charges : ₹ 0 </P>
                        <P>Advance EMI: {currencyINR(0)}</P>
                    </View>

                    <View style={styles.section}>
                        <P>Please note that the above processing charges include Insurance Premium Charges.</P>
                        <P style={{ marginVertical: verticalScale(6) }}>It is understood that you have read and are aware of all the terms & conditions mentioned in the {data.schemeName} agreement & will abide by the same.</P>
                        <P style={{ marginVertical: verticalScale(6) }}>We are also pleased to provide you with the following additional details to help you understand your loan account better :</P>
                        <P style={{ marginVertical: verticalScale(6) }}>My First PDC Date: <Text style={styles.bold}>{firstDueDate || 'N/A'}</Text></P>
                        <P>Repayment schedule enclosed which is part of the Sanction Letter.</P>
                    </View>

                    <View style={{ marginTop: verticalScale(20), alignItems: 'flex-end' }}>
                        <P>Accept & Confirm by ME/US</P>
                    </View>

                    <View style={styles.footer}>
                        <P>Yours Sincerely,</P>
                        <P>For Aphelion Finance Pvt. Ltd.</P>
                        <P style={styles.signature}>Authorized Signatory</P>
                    </View>

                </ScrollView>

                {/* Sticky actions area (outside scroll) */}
                <View style={[styles.stickyBottom, { paddingBottom: insets.bottom || 12 }]}>
                    <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityRole="button">
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>

            </SafeAreaView>
        </Modal>
    );
}

SanctionReportModal.propTypes = {
    visible: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    decisionData: PropTypes.object,
    aaplicantName: PropTypes.object,
    formattedAddress: PropTypes.string,
    textColor: PropTypes.string,
    getOwnContribution: PropTypes.array,
    tempSanctionROI: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    SanctionLetterByApplicationNo: PropTypes.object,
    totalInsurance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    generateSanctionLetterHTML: PropTypes.func,
    openFileSanction: PropTypes.func,
    filePathSanction: PropTypes.string,
    BusinessDate: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    firstDueDate: PropTypes.string,
};

/* --------------------------- Styles -------------------------------- */
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContainer: {
        paddingHorizontal: moderateScale(12),
        paddingTop: verticalScale(12),
    },
    actionsRow: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: moderateScale(8),
        marginBottom: verticalScale(8),
    },
    primaryButton: {
        backgroundColor: '#2563EB',
        paddingVertical: verticalScale(10),
        paddingHorizontal: moderateScale(12),
        borderRadius: moderateScale(8),
        // alignItems: 'center',
    },
    openButton: { backgroundColor: '#22C55E' },
    primaryButtonText: { color: '#fff', fontWeight: '700' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(8),
    },
    logo: {
        width: scale(70),
        height: verticalScale(70),
    },
    addressBlock: {
        flex: 1,
        marginLeft: scale(12),
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    h: {},
    hText: {},
    p: {},
    h: { fontSize: scale(18), fontWeight: '700', textAlign: 'center', marginVertical: verticalScale(6) },
    p: { fontSize: scale(13), color: '#1E293B', lineHeight: verticalScale(18) },
    small: { fontSize: scale(12), color: '#334155', lineHeight: verticalScale(16) },
    bold: { fontWeight: '700', color: '#0F172A' },
    highlight: { color: '#2563EB', fontWeight: '700' },
    section: { marginTop: verticalScale(12) },
    table: { borderWidth: 1, borderColor: '#CBD5E1', marginTop: verticalScale(8), borderRadius: moderateScale(6), overflow: 'hidden', backgroundColor: '#fff' },
    tableHeaderRow: { backgroundColor: '#0D82FF' },

    headerRow: {
        backgroundColor: "#F5F5F5",
    },
    tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
    cell: { paddingVertical: verticalScale(8), paddingHorizontal: moderateScale(6), textAlign: 'center', fontSize: scale(11), color: '#1E293B' },
    tableHeader: { fontWeight: '600', color: '#FFFFFF', textAlign: 'center', fontSize: scale(11) },
    colSmall: { flex: 0.8 },
    colMedium: { flex: 1.3 },
    colLarge: { flex: 1.8 },
    footer: { marginVertical: verticalScale(20) },
    signature: { marginTop: verticalScale(20), textAlign: 'left', fontWeight: '700', color: '#0F172A' },
    stickyBottom: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: moderateScale(12), backgroundColor: 'transparent', alignItems: 'center' },
    closeButton: { backgroundColor: '#dc3545', paddingVertical: verticalScale(12), paddingHorizontal: moderateScale(22), borderRadius: moderateScale(8) },
    closeButtonText: { color: '#fff', fontWeight: '700' },
    vDivider: {
        borderRightWidth: 1,
        borderRightColor: "#CCC",
    },

    tableWrapper: {
        borderWidth: 1,
        borderColor: "#D0D0D0",
        borderRadius: 4,
        overflow: "hidden",
        marginTop: 10,
    },

    row: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#E0E0E0",
        minHeight: 45,
        alignItems: "center",
        backgroundColor: "#fff",
    },

    headerRow: {
        backgroundColor: "#F5F5F5",
    },

    headerText: {
        fontWeight: "700",
        color: "#333",
    },

    cell: {
        paddingVertical: 8,
        paddingHorizontal: 6,
        borderRightWidth: 1,
        borderColor: "#D0D0D0",
        fontSize: 13,
        color: "#000",
    },

    colSmall: {
        flex: 0.8,
    },

    colMedium: {
        flex: 1.5,
    },

    colLarge: {
        flex: 2,
    },

});






// import React from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
// import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

// const { width } = Dimensions.get('window');
// const isSmallDevice = width < 360;

// const SanctionReportModal = ({
//     onClose,
//     SanctionLetterByApplicationNo,
//     aaplicantName,
//     textColor = '#000',
// }) => {
//     const disbursement = SanctionLetterByApplicationNo?.updateDisbursement || {};

//     const formatDate = (dateArray) =>
//         dateArray ? `${dateArray[2]}-${dateArray[1]}-${dateArray[0]}` : 'N/A';

//     const formatAmount = (amount) =>
//         amount
//             ? `₹ ${Number(amount).toLocaleString('en-IN', {
//                 minimumFractionDigits: 2,
//                 maximumFractionDigits: 2,
//             })}`
//             : '₹ 0.00';

//     return (
//         <ScrollView
//             style={styles.container}
//             contentContainerStyle={styles.scrollContainer}
//             showsVerticalScrollIndicator={false}
//         >
//             {/* Header */}
//             <View style={styles.header}>
//                 <Text style={styles.headerTitle}>Loan Sanction Summary</Text>
//                 <TouchableOpacity onPress={onClose}>
//                     <Text style={styles.closeBtn}>✕</Text>
//                 </TouchableOpacity>
//             </View>

//             {/* Section */}
//             <View style={styles.section}>
//                 <Text style={styles.bold}>Net Loan Amount Disbursed:</Text>

//                 {/* Table with Horizontal Scroll */}
//                 <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                     <View style={styles.table}>
//                         {/* Table Header */}
//                         <View style={[styles.tableRow, styles.tableHeaderRow]}>
//                             <Text style={[styles.cell, styles.tableHeader]}>Sr.No.</Text>
//                             <Text style={[styles.cell, styles.tableHeader]}>Issued To</Text>
//                             <Text style={[styles.cell, styles.tableHeader]}>
//                                 Chq/NEFT/RTGS No.
//                             </Text>
//                             <Text style={[styles.cell, styles.tableHeader]}>
//                                 Loan Agreement Date
//                             </Text>
//                             <Text style={[styles.cell, styles.tableHeader]}>Amount</Text>
//                         </View>

//                         {/* Table Row */}
//                         <View style={styles.tableRow}>
//                             <Text style={[styles.cell, styles.center, { color: textColor }]}>1</Text>
//                             <Text style={[styles.cell, styles.center, { color: textColor }]}>
//                                 {aaplicantName?.individualApplicant
//                                     ? `${aaplicantName?.individualApplicant?.firstName || ''} ${aaplicantName?.individualApplicant?.lastName || ''
//                                         }`.trim()
//                                     : aaplicantName?.organizationApplicant?.organizationName || 'N/A'}
//                             </Text>
//                             <Text style={[styles.cell, styles.center, { color: textColor }]}>
//                                 {disbursement?.utrNumber || 'N/A'}
//                             </Text>
//                             <Text style={[styles.cell, styles.center, { color: textColor }]}>
//                                 {formatDate(disbursement?.utrNumberDate)}
//                             </Text>
//                             <Text style={[styles.cell, styles.center, { color: textColor }]}>
//                                 {formatAmount(disbursement?.actualAmountDisbursed)}
//                             </Text>
//                         </View>
//                     </View>
//                 </ScrollView>
//             </View>
//         </ScrollView>
//     );
// };

// const styles = {
//     container: {
//         flex: 1,
//         backgroundColor: '#fff',
//     },
//     scrollContainer: {
//         paddingVertical: verticalScale(16),
//         paddingHorizontal: moderateScale(12),
//         alignItems: 'center',
//     },
//     header: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         width: '100%',
//         maxWidth: 600,
//         marginBottom: verticalScale(10),
//     },
//     headerTitle: {
//         fontSize: moderateScale(16),
//         fontWeight: 'bold',
//         color: '#0D82FF',
//     },
//     closeBtn: {
//         fontSize: moderateScale(18),
//         color: '#999',
//     },
//     section: {
//         width: '100%',
//         maxWidth: 600,
//         marginTop: verticalScale(10),
//     },
//     bold: {
//         fontWeight: 'bold',
//         marginBottom: verticalScale(4),
//         fontSize: moderateScale(13),
//     },
//     table: {
//         borderWidth: 1,
//         borderColor: '#ccc',
//         borderRadius: moderateScale(6),
//         overflow: 'hidden',
//         minWidth: moderateScale(340),
//     },
//     tableRow: {
//         flexDirection: 'row',
//         borderBottomWidth: 1,
//         borderColor: '#eee',
//     },
//     tableHeaderRow: {
//         backgroundColor: '#0D82FF',
//     },
//     tableHeader: {
//         color: '#fff',
//         fontWeight: '600',
//         textAlign: 'center',
//         fontSize: moderateScale(12),
//     },
//     cell: {
//         flex: 1,
//         paddingVertical: verticalScale(8),
//         paddingHorizontal: moderateScale(6),
//         fontSize: moderateScale(12),
//     },
//     center: {
//         textAlign: 'center',
//     },
// };

// export default SanctionReportModal;
