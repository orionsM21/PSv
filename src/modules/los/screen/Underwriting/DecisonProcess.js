import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import {
    SafeAreaView, View, Text, TextInput, Modal, TouchableOpacity, ScrollView, FlatList, Alert,
    ActivityIndicator, StyleSheet, Dimensions, Animated, Button, Image,
    PixelRatio,
    Vibration,
    Platform,
    PermissionsAndroid,
    useColorScheme,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';
import { useSelector } from 'react-redux';
import TableHeader from '../Component/TableHeader.js';
import TableRowAmort from '../Component/AmorttableRow.js';
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import RNFetchBlob from 'rn-fetch-blob';
import RNFS from 'react-native-fs';
import IntentLauncher, { IntentConstant } from 'react-native-intent-launcher';
import { format } from 'date-fns';
import ApplicationDetails from '../Component/ApplicantDetailsComponent.js';
import { RenderDropdownField, RenderTextField } from '../Component/ResponsiveFormFields.js';
import SanctionReportModal from '../Component/SanctionReport.js';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
// --- Reusable Components ---
import * as XLSX from 'xlsx';
import FileViewer from 'react-native-file-viewer';
import ReportTable from '../Component/CSRReportTable.js';

import ViewShot from "react-native-view-shot";
import { PDFDocument, PageSizes } from "react-native-pdf-lib"; // CLI only
import DetailHeader from '../Component/DetailHeader.js';
import ProductDetailsCard from '../Component/ProductDetailsCard.js';
import LinearGradient from 'react-native-linear-gradient';
// import Share from 'react-native-share';
const renderLabelInput = (
    label,
    value,
    isMultiLine = false,
    disableStyle = false,
    editable = true
) => (
    <View style={styles.formColumncam}>
        <Text style={styles.label}>{label}</Text>
        <TextInput
            style={[
                styles.input,
                disableStyle && styles.disabledInput,
                {
                    flexWrap: 'wrap', // ✅ allows wrapping when text overflows
                    textAlignVertical: 'center', // ✅ aligns text nicely when multiline
                    minHeight: isMultiLine ? 60 : 40, // ensures proper spacing
                },
            ]}
            value={value || 'N/A'}
            editable={editable}
            multiline={true} // ✅ always multiline to allow wrapping naturally
            numberOfLines={isMultiLine ? 3 : 1}
            scrollEnabled={false} // ✅ prevent scrolling inside input
        />
    </View>
);

const formatNumberWithCommas = (value) => {
    if (!value || isNaN(value)) return value; // Return original value if not a valid number
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
};

const DetailCard = ({ title, data }) => (
    <View style={styles.bigCard}>
        {title && <Text style={styles.cardTitle}>{title}</Text>}

        {Object.entries(data).map(([label, value], idx) => (
            <View key={idx} style={styles.row}>
                <Text style={styles.label}>{label}:</Text>
                <Text style={styles.value}>{value || "N/A"}</Text>
            </View>
        ))}
    </View>
);


const PrimaryButton = ({ title, onPress, loading = false, disabled = false, style }) => (
    <TouchableOpacity
        activeOpacity={0.8}
        style={[
            styles.button,
            disabled && styles.buttonDisabled,
            style,
        ]}
        onPress={onPress}
        disabled={disabled || loading}
    >
        {loading ? (
            <ActivityIndicator color="#FFF" size="small" />
        ) : (
            <Text
                style={[
                    styles.buttonText,
                    disabled && styles.buttonTextDisabled,
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {title}
            </Text>
        )}
    </TouchableOpacity>
);

// --- Product Row Component ---
const ProductRow = ({
    item,
    schemedata,
    SchemeSelectAPI,
    sanctionAmount,
    handleSanctionAmountChange,
    handleSanctionROIChange,
    handleSanctionTenureChange,
    handleCycleDayChange,
    validateSanctionROI,
    validateSanctionTenure,
    tempSanctionROI,
    tempSanctionTenure,
    isDisabled,
    CycleDays,
    SelectedCycleDays,
    handleAmortButtonPress,
    loading,
    amortdata,
    amortDetails,
    error,
    eligibility,
    mappedDropdownScheme,
    selecteddropdownScheme,
    handleDropdownScheme,
    handleCalculatePress,
    isLoading,
    irr,
    handleirr
}) => {
    const [focusedField, setFocusedField] = useState(null);

    // Always prioritize SchemeSelectAPI
    const activeScheme = SchemeSelectAPI?.data || schemedata?.data || {};

    const formatNumberWithCommas = (value) => {
        if (!value || isNaN(value)) return value;
        return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(value);
    };

    return (



        <ProductDetailsCard
            title="Product Details"
        // gradientColors={["#FF5100FF", "#005BEA"]} // same style as DetailHeader
        >

            {/* Row 1: Product & Scheme */}
            <View style={styles.productDetailrow}>
                <RenderTextField
                    label="Product"
                    value={Array.isArray(item) && item[0] ? item[0].product : 'N/A'}
                    editable={false}
                    isEditable={false}
                />

                <RenderDropdownField
                    label="Scheme"
                    data={mappedDropdownScheme || []}
                    value={selecteddropdownScheme}
                    onChange={handleDropdownScheme}
                    placeholder="Select Scheme"
                    isEditable={!isDisabled}
                />
            </View>

            {/* Row 2: Tenure & ROI */}
            <View style={styles.productDetailrow}>
                <RenderTextField
                    label="Tenure"
                    value={activeScheme?.minTenure ? `${activeScheme.minTenure} Months` : "N/A"}
                    editable={false}
                    isEditable={false}
                />

                <RenderTextField
                    label="ROI"
                    value={activeScheme?.defaultInterestRate ? `${activeScheme.defaultInterestRate} %` : "N/A"}
                    editable={false}
                    isEditable={false}
                />
            </View>

            {/* Row 3: Loan & Eligibility */}
            <View style={styles.productDetailrow}>
                <RenderTextField
                    label="Applied Loan Amount"
                    value={
                        item?.length > 0 && item[0]?.appliedLoanAmount
                            ? `₹ ${formatNumberWithCommas(item[0].appliedLoanAmount)}`
                            : '—'
                    }
                    editable={false}
                    isEditable={false}
                />

                <RenderTextField
                    label="Eligibility Amount"
                    value={`₹ ${formatNumberWithCommas(eligibility ? eligibility : 0)}`}
                    editable={false}
                    isEditable={false}
                />
            </View>

            {/* Row 4: Sanction Details */}
            <View style={styles.productDetailrow}>
                <RenderTextField
                    label="Sanction Amount"
                    value={sanctionAmount ? String(formatNumberWithCommas(sanctionAmount)) : ""}
                    onChange={handleSanctionAmountChange}
                    numeric
                    placeholder="Enter Amount"
                    editable={!isDisabled}
                    required
                />

                <RenderTextField
                    label="Sanction ROI"
                    value={tempSanctionROI ? String(tempSanctionROI) : ""}
                    onChange={handleSanctionROIChange}
                    numeric
                    placeholder="Enter ROI"
                    editable={!isDisabled}
                    required
                />
            </View>

            {/* Row 5: Tenure & Billing Cycle */}
            <View style={styles.productDetailrow}>
                <RenderTextField
                    label="Sanction Tenure"
                    value={tempSanctionTenure ? String(tempSanctionTenure) : ""}
                    onChange={handleSanctionTenureChange}
                    numeric
                    placeholder="Enter Tenure"
                    editable={!isDisabled}
                    required
                />

                <RenderDropdownField
                    label="Billing Cycle"
                    data={CycleDays}
                    value={SelectedCycleDays}
                    onChange={handleCycleDayChange}
                    placeholder="Select Cycle"
                    isEditable={!isDisabled}
                />

                <RenderTextField
                    label="IRR"
                    value={irr ? String(irr) : ""}
                    onChange={handleirr}
                    keyboardType="decimal-pad"
                    placeholder="Enter IRR"
                    editable={!isDisabled}
                    required
                />
            </View>

            {/* Buttons */}
            {/* <PrimaryButton
                    title="Amort"
                    onPress={() => handleAmortButtonPress(item)}
                    loading={loading}
                    style={{ backgroundColor: '#4CAF50' }}
                    disabled={!(amortdata?.content?.length > 0 || amortDetails?.data?.content?.length > 0)}
                /> */}

            <PrimaryButton
                title="Amort"
                onPress={() => handleAmortButtonPress(item)}
                loading={loading}
                disabled={!amortdata?.content?.length > 0}
                style={{
                    backgroundColor: amortdata?.content?.length > 0 ? '#4CAF50' : '#BDBDBD', // green : grey
                }}
            />

            <PrimaryButton
                title="Calculate"
                onPress={() => handleCalculatePress(item)}
                loading={isLoading}
            />

        </ProductDetailsCard>

    );
};

const DynamicTable = ({ title, headers = [], rows = [], columnWidths = [] }) => {
    const tableTextStyle = { fontSize: moderateScale(14), color: '#333', textAlign: 'center' };

    return (
        <ScrollView horizontal>
            <View style={{
                marginVertical: verticalScale(8),
                borderWidth: 1,
                borderColor: "#d0d0d0",
                borderRadius: scale(6),
                backgroundColor: "#fff",
                overflow: "hidden",
                minWidth: width * 0.95,
            }}>
                {/* Table Title */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 1,
                    borderRadius: scale(6),
                    backgroundColor: "#f0f4ff",
                    overflow: "hidden",
                    minWidth: width * 0.95,
                }}>
                    <Text style={{
                        // width: 400,
                        textAlign: 'center',
                        padding: 10,
                        fontWeight: 'bold',
                        color: '#007bff',
                        fontSize: moderateScale(14),
                    }}>
                        {title}
                    </Text>
                </View>

                {/* Table Header */}
                {headers.length > 0 && (
                    <View style={{
                        flexDirection: "row",
                        backgroundColor: "#E8F0FF",
                    }}>
                        {headers.map((header, i) => (
                            <Text key={i} style={{
                                width: columnWidths[i] || 150,
                                borderLeftWidth: i === 0 ? 1 : 0,  // first  left border
                                borderRightWidth: 1,
                                // borderTopWidth: 1,
                                // borderBottomWidth: 1,
                                textAlign: 'center',
                                fontWeight: 'bold',
                                color: '#007bff',
                                padding: 8,
                                fontSize: moderateScale(12),
                            }}>
                                {header}
                            </Text>
                        ))}
                    </View>
                )}

                {/* Table Body */}

                {rows.length > 0 ? (
                    rows.map((row, rowIndex) => (
                        <View key={rowIndex} style={{ flexDirection: 'row', backgroundColor: rowIndex % 2 === 0 ? "#fff" : "#f9fafb", }}>
                            {row.map((cell, i) => (
                                <View
                                    key={i}
                                    style={{
                                        width: columnWidths[i] || 150,
                                        borderLeftWidth: i === 0 ? 1 : 0,  // first  left border
                                        borderRightWidth: 1,
                                        borderTopWidth: 1,
                                        borderBottomWidth: 1,
                                        // borderColor: "#e2e8f0",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        paddingVertical: verticalScale(6),
                                        paddingHorizontal: scale(6),
                                    }}
                                >
                                    <Text style={tableTextStyle}>{cell ?? 'N/A'}</Text>
                                </View>
                            ))}
                        </View>
                    ))
                ) : (
                    <View style={{ flexDirection: 'row' }}>
                        {headers.map((_, i) => (
                            <View
                                key={i}
                                style={{
                                    width: columnWidths[i] || 150,
                                    borderLeftWidth: i === 0 ? 1 : 0,
                                    borderRightWidth: 1,
                                    borderTopWidth: 1,
                                    borderBottomWidth: 1,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: 8,
                                }}
                            >
                                <Text style={tableTextStyle}>N/A</Text>
                            </View>
                        ))}
                    </View>
                )}

            </View>
        </ScrollView>
    );
};


const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;
const scale = (size) => (width / guidelineBaseWidth) * size;
const verticalScale = (size) => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) =>
    size + (scale(size) - size) * factor;
// --- Main Component ---

const DecisionProcess = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { item } = route?.params || {}; // Safe fallback

    const API_BASE_URL = BASE_URL;
    const colorScheme = useColorScheme();
    const textColor = colorScheme === 'dark' ? '#fff' : '#000';
    const backgroundColor = colorScheme === 'dark' ? '#121212' : '#f9f9f9';
    const sectionBackground = colorScheme === 'dark' ? '#1e1e1e' : '#fff';
    const highlightColor = '#007bff';
    // --- States ---
    const [isDisabled, setIsDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    const [applicationByid, setApplicationByid] = useState(null);

    const [applicationData, setApplicationData] = useState([]);
    const [flagData, setFlagData] = useState(null);
    const [DDE, setDDE] = useState([]);
    const [InitiateVerification, setInitiateVerification] = useState([])
    const [logDetails, setLogDetails] = useState(null);
    const [AllLogs, setAllLogs] = useState(null);
    const [Overallliablity, setterr] = useState('');
    const token = useSelector((state) => state.auth.token);
    const userDetails = useSelector((state) => state.auth.losuserDetails);
    const mkc = useSelector(state => state.auth.losuserDetails);
    const aaplicantName = item?.applicant?.find(a => a.applicantTypeCode === 'Applicant')

    const [eligibilityAmount, setEligibilityAmount] = useState('');
    const [foir, setFoir] = useState(null);
    const [error, setError] = useState(false);
    const [CombineSalary, setCombineSalary] = useState('');
    const [ltv, setltv] = useState('');
    const [EMI, setEMI] = useState('');

    const [finalFoir, setFinalFoir] = useState('');
    const [totalObligation, settotalObligation] = useState('');
    const [sanctionROI, setSanctionROI] = useState(''); // Initialize as an empty string or number
    const [sanctionTenure, setSanctionTenure] = useState(''); // Initialize as an empty string or number
    const [tempSanctionTenure, setTempSanctionTenure] = useState('');
    const [tempSanctionROI, setTempSanctionROI] = useState('');
    const [amortdata, setamortdata] = useState([]);
    console.log(amortdata, 'amortdataamortdata')
    const [firstDueDate, setfirstDueDate] = useState('')
    const [lastDueate, setlastDueate] = useState('')
    const [sanctionAmount, setSanctionAmount] = useState(''); // Initialize as an empty string or number
    const [irr, setirr] = useState('')
    const [BusinessDate, setBusinessDate] = useState([]);
    console.log(BusinessDate, 'BusinessDateBusinessDate')
    const [user, setuser] = useState([]);
    const [camReport, setCamReport] = useState([]);
    const [productdetails, setproductdetails] = useState([]);
    const [officeVerification, setofficeVerification] = useState([]);
    const agentNames = officeVerification?.map(item => item.fieldAgentName) || [];

    // const [loginFeeDetails, setloginFeeDetails] = useState([]);
    const [insuranceDetails, setinsuranceDetails] = useState([]);
    const [processingFeeDetails, setprocessingFeeDetails] = useState([]);
    const [stampDutyFeeDetails, setstampDutyFeeDetails] = useState([]);
    const [updateDisbursementDtolist, setupdateDisbursementDtolist] = useState([])
    const lan = updateDisbursementDtolist?.map(item => item.lan) || [];
    const [nach, setnach] = useState([]);
    const [cersaiFees, setcersaiFee] = useState();
    const [cibilReports, setcibilReports] = useState([]);

    const [InitiateDisbursementFinal, setInitiateDisbursementFinal] = useState([]);
    const [feeDetails, setFeeDetails] = useState(null);
    const [MKC, setMKC] = useState([]);
    const [loginUser, setloginUser] = useState([]);
    const [ceoUser, setceoUser] = useState([]);
    console.log(loginUser, 'loginUserloginUserloginUser')
    const [feeTypes, setFeeTypes] = useState([]);
    const [authorizations, setAuthorizations] = useState([]);
    const [creditUserList, setCreditUserList] = useState([]);
    const [creditDecisions, setCreditDecisions] = useState([]);
    const [decisionData, setDecisionData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [manmera, setmanmera] = useState(false);
    const [camReportVisible, setCamReportVisible] = useState(false);
    const [camReportData, setCamReportData] = useState(null);
    const [SanctionReportVisible, setSanctionReportVisible] = useState(false);
    const [SanctionAddress, setSanctionAddress] = useState([]);
    const [decisionFlagData, setDecisionFlagData] = useState([]);
    const [amortDetails, setAmortDetails] = useState([]);
    const [schemedata, setschemedata] = useState([]);
    console.log(decisionData, 'decisionDatadecisionData')
    const [Allloaner, setAllloaner] = useState([]);
    const [applicantTypes, setApplicantTypes] = useState([]);
    const [CoapplicantTypes, setCoApplicantTypes] = useState([]);
    const [Guarantor, setGuarantors] = useState([]);

    const [combinedAverage, setcombinedAverage] = useState('');
    const [foirafleon, setfoirafleon] = useState(0);
    const [eligibility, seteligibility] = useState(0);
    const [CycleDays, setCycleDays] = useState([]);
    const [SelectedCycleDays, setSelectedCycleDays] = useState(null); // selected option

    const [schemeDataLoaded, setSchemeDataLoaded] = useState(false);
    const [schemeData, setSchemeData] = useState([]);

    const [dropdownScheme, setDropdownScheme] = useState([]);
    const [selectedDropdownScheme, setSelectedDropdownScheme] = useState({});
    const [SchemeSelectAPI, setSchemeSelectAPI] = useState([])


    const mappedDropdownScheme = useMemo(() => {
        return dropdownScheme.map(s => ({
            label: s.schemeName,
            value: String(s.schemeId),
        }));
    }, [dropdownScheme]);


    const insets = useSafeAreaInsets();




    const schemeNamesFromApplications = applicationData?.data?.map(item => item?.scheme.schemeName);
    const schemeid = schemeData?.data?.content?.filter(scheme =>
        schemeNamesFromApplications?.includes(scheme?.schemeName)
    );
    const [feeTypeData, setFeeTypeData] = useState([]);
    const [feeData, setFeeData] = useState([]);
    const [isDataFetched, setIsDataFetched] = useState(false);
    const [LUNGI, setLUNGI] = useState([]);
    const [DecisonPrroevtest, setDecisonPrroevtest] = useState([]);
    const [Disbursed, setDisbursed] = useState([]);
    const [DecisionApprove, setDecisionApprove] = useState([]);
    const [InitiateDisbursement, setInitiateDisbursement] = useState([]);
    const [LUNGIReject, setLUNGIReject] = useState([]);
    const [IsDataFetchedReject, setIsDataFetchedReject] = useState([]);
    const [Rejected, setRejected] = useState([]);
    const [remarkHeight, setRemarkHeight] = useState(40);
    const [approvalRemarkHeight, setApprovalRemarkHeight] = useState(40);
    const [sendBack, setSendBack] = useState('');
    const [ApprovalRemark, setApprovalRemark] = useState('');

    const [CAMsendBack, setCAmSendBack] = useState('');
    const [CEOsendBack, setCEOSendBack] = useState('');
    const [ComitteesendBack, setComitteeSendBack] = useState('');
    const sendDDE = DDE[0]
    const sendintiate = InitiateVerification[0]
    const [ApplicantArray, setApplicantArray] = useState([]); // T store

    const [isLoadingsave, setIsLoadingsave] = useState(false);
    const [isLoadingsubmit, setIsLoadingsubmit] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState('');
    const AplliedLoanAmount = applicationData?.data?.map(item => item.appliedLoanAmount)
    const productDetailsId = applicationData?.data?.map(item => item.productDetailsId)
    const productName = applicationData?.data?.map(item => item.scheme.product.productName)
    const SchemeCode = applicationData?.data?.map(item => item.scheme.schemeCode)
    const [selectedCyclePerApplication, setSelectedCyclePerApplication] = useState({});
    const [selectedSchemePerApplication, setselectedSchemePerApplication] = useState({})
    const billingCycle = applicationData?.data?.map(item => item.billingCycle)





    const BKC = MKC?.data?.[0]
    const [filePath, setFilePath] = useState(null);
    const [base64Data, setBase64Data] = useState(null);
    const [pdfOptions, setPDFOptions] = useState({
        pageSize: 'A4',
        backgroundColor: '#f8f8f8',
        textColor: '#333',
        headerColor: '#0D82FF',
        highlightColor: '#0D82FF',
        tableHeaderGradient: ['#0D82FF', '#66B2FF'],
        fontFamily: 'Arial, sans-serif',
        fontSize: 11,
        lineHeight: 1.4,
        showLogo: true,
        logoSize: { width: 120, height: 50 }
    });
    const [filePathSanction, setFilePathSanction] = useState(null);
    const [base64DataSanction, setBase64DataSanction] = useState(null);

    const schemeIds = useMemo(() => {
        return schemeid?.map(scheme => scheme.schemeId) || [];
    }, [schemeid]);
    const [calculatedFees, setCalculatedFees] = useState({
        processingFee: 0,
        disbursementAmount: sanctionAmount || 0,
    });

    const fetchedSchemeIdsRef = useRef(new Set)

    const [options, setOptions] = useState({
        sendBackOptions: [],
        loanApprovalOptions: [],
        rejectReasonOptions: []
    });

    const [selectedOptions, setSelectedOptions] = useState({
        selectedSendBack: "",
        selectedLoanApproval: "",
        selectedRejectReason: ""
    });

    const [cofindApplicantByCategoryCodView, setcoFindApplicantByCategoryCodView] = useState({
        data: {
            cityName: '',
            stateName: '',
            countryName: '',
            areaName: ''
        }
    });

    const fetchApplicantDataByPincode = useCallback(async (pincodeId, setState) => {
        if (!pincodeId) {
            console.warn("Pincode ID is not available.");
            return;
        }
        try {
            const response = await axios.get(`${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincodeId}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                },
            );
            setState({ data: response.data.data });
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch application data for pincode');
        }
    }, []);

    useEffect(() => {
        // Handle both applicants in one useEffect to avoid redundancy
        if (SanctionAddress?.pincode?.pincode) {
            fetchApplicantDataByPincode(SanctionAddress?.pincode?.pincode, setcoFindApplicantByCategoryCodView);
        }

    }, [SanctionAddress?.pincode?.pincode, fetchApplicantDataByPincode]);


    useEffect(() => {
        fetchFeeData()
    }, [])
    const fetchFeeData = async () => {
        try {
            // Call getAllFeeType API
            const feeTypeResponse = await axios.get(`${BASE_URL}getAllFeeType`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                }
            );
            const feeTypeData = feeTypeResponse.data.data.content; // Handle the data as required
            setFeeTypeData(feeTypeData)


            // Call getAllFee API
            const feeResponse = await axios.get(`${BASE_URL}getAllFee`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                }

            );
            const feeData = feeResponse.data.data.content; // Handle the data as required
            setFeeData(feeData)


            return { feeTypeData, feeData };
        } catch (error) {
            console.error('Error fetching fee data:', error);
            throw error; // Handle error appropriately
        }
    };

    const [cycleDay, setCycleDay] = useState(null);


    useEffect(() => {
        // Run the calculation only if data is available
        if (feeTypeData?.length && feeData?.length) {
            const calculateFees = () => {
                let totalProcessingFee = 0;
                let totalDisbursementAmount = sanctionAmount || 0; // Start with sanctionAmount

                feeTypeData.forEach((feeType) => {
                    feeData.forEach((feeItem) => {
                        const sanctionAmountValue = sanctionAmount || 0; // Ensure a valid sanction amount
                        let processingFee = 0; // Declare and initialize processing fee
                        let disbursementAmount = sanctionAmountValue;

                        if (feeType?.taxComputation === 'Exclusive') {
                            if (feeItem?.calculationBasis === 'Parcent') {
                                // Calculate processing fee using percentageValueForFlat
                                const percentage = feeItem?.percentageValueForFlat || 0;
                                processingFee += (sanctionAmountValue * percentage) / 100;
                            } else if (feeItem?.calculationBasis === 'Amount') {
                                // Deduct a flat fee from sanctionAmount
                                const flatFee = feeItem?.amountValueForFlat || 0;
                                if (flatFee > 0 && flatFee <= sanctionAmountValue) {
                                    disbursementAmount -= flatFee;
                                }
                            }
                        }

                        // Update totalProcessingFee and totalDisbursementAmount
                        totalProcessingFee += processingFee;
                        totalDisbursementAmount -= processingFee; // Adjust disbursement amount based on fees
                    });
                });

                return {
                    processingFee: totalProcessingFee,
                    disbursementAmount: totalDisbursementAmount,
                };
            };

            // Update the state with calculated fees
            setCalculatedFees(calculateFees());
        }
    }, [feeTypeData, feeData, sanctionAmount]);
    // const parseDateSafe = (dateInput) => {
    //     if (!dateInput) return null;

    //     const dateString = String(dateInput); // ensure string

    //     // Match DD/MM/YYYY or DD-MM-YYYY
    //     const parts = dateString.split(/[\/\-]/);
    //     if (parts.length === 3) {
    //         let [day, month, year] = parts.map(p => p.trim());
    //         const parsedDate = new Date(`${year}-${month}-${day}`);
    //         return isNaN(parsedDate.getTime()) ? null : parsedDate;
    //     }

    //     // Fallback: try default constructor
    //     const d = new Date(dateInput);
    //     return isNaN(d.getTime()) ? null : d;
    // };

    const parseDateSafe = (dateInput) => {
        if (!dateInput) return null;

        // If it's already a Date
        if (dateInput instanceof Date) {
            return isNaN(dateInput.getTime()) ? null : dateInput;
        }

        // If it's an array [year, month, day] (1-based month)
        if (Array.isArray(dateInput) && dateInput.length === 3) {
            const [year, month, day] = dateInput;
            const d = new Date(year, month - 1, day); // JS months are 0-indexed
            return isNaN(d.getTime()) ? null : d;
        }

        // Otherwise, treat as string
        const dateString = String(dateInput).trim();

        // Match DD/MM/YYYY or DD-MM-YYYY
        const parts = dateString.split(/[\/\-]/);
        if (parts.length === 3) {
            let [day, month, year] = parts.map(p => p.trim());
            const d = new Date(`${year}-${month}-${day}`);
            return isNaN(d.getTime()) ? null : d;
        }

        // Fallback: default Date constructor
        const d = new Date(dateInput);
        return isNaN(d.getTime()) ? null : d;
    };


    useEffect(() => {
        if (applicationByid?.createdDate && schemedata?.data?.billingCycleDataDTO) {
            const createdDate = parseDateSafe(applicationByid.createdDate);

            if (!createdDate) {
                console.error('Invalid createdDate:', applicationByid.createdDate);
                return;
            }

            const dayOfMonth = createdDate.getDate();

            const cycleData = schemedata.data.billingCycleDataDTO.find(cycle =>
                dayOfMonth >= cycle.isFrom && dayOfMonth <= cycle.isTo
            );



            if (cycleData) {
                // setCycleDay(cycleData.cycleDay);
                // setSelectedCycleDays({ label: String(cycleData.cycleDay), value: String(cycleData.cycleDay) });
            }
        }
    }, [applicationByid, schemedata]);




    const applicationDataObject = Array.isArray(applicationData?.data)
        ? applicationData?.data.reduce((acc, item) => {
            acc = item
            return acc
        }, {})
        : applicationData?.data


    useEffect(() => {
        if (applicationDataObject) {
            const option = schemedata?.data?.billingCycleDataDTO
                ?.map((val) => ({
                    label: val?.cycleDay,
                    value: val?.cycleDay,
                }))
                ?.find((opt) => opt.value === applicationDataObject?.billingCycle)
            setCycleDay(option)
        }
    }, [applicationDataObject, schemedata])




    useEffect(() => {
        getApplicationByid();
    }, [getApplicationByid]);




    const getApplicationByid = useCallback(async () => {
        try {
            const response = await axios.get(
                `${BASE_URL}getApplicationById/${item.id}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    },
                }
            );

            const data = response?.data?.data;

            setApplicationByid(data);

            const applicants = data?.applicant || [];
            setApplicantArray(applicants);


            const safeFilter = (arr, type) => {
                if (!Array.isArray(arr)) return [];
                return arr.filter(app => app && app.applicantTypeCode === type);
            };

            setApplicantTypes(safeFilter(applicants, 'Applicant'));
            setCoApplicantTypes(safeFilter(applicants, 'Co-Applicant'));
            setGuarantors(safeFilter(applicants, 'Guarantor'));


        } catch (error) {
            console.error('Error fetching application data:', error);
            Alert.alert('Error', 'Failed to fetch application data');
        }
    }, [item.id]);


    useEffect(() => {
        if (schemedata?.data?.billingCycleDataDTO) {
            const extractedCycleDays = schemedata.data.billingCycleDataDTO.map(cycle => ({
                label: String(cycle.cycleDay),   // convert number to string
                value: String(cycle.cycleDay)    // convert number to string
            }));


            setCycleDays(extractedCycleDays);

        }
    }, [schemedata]);
    const calculateAverageIncome = (applicants = []) => {
        let total = 0;
        let count = 0;

        applicants.forEach(applicant => {
            // ---- Organization Applicant ----
            if (applicant.applicantCategoryCode === "Organization") {
                const orgDetails = applicant.organizationApplicant?.organizationIncomeDetails || [];

                if (orgDetails.length === 1 && orgDetails[0]?.grossIncome != null) {
                    // ✅ Special case: only one object with grossIncome
                    total += Number(orgDetails[0].grossIncome);
                    count += 1;
                } else {
                    orgDetails.forEach(income => {
                        if (income?.grossIncome != null) {
                            total += Number(income.grossIncome);
                            count += 1;
                        }
                    });
                }
            }

            // ---- Individual Applicant ----
            if (applicant.applicantCategoryCode === "Individual") {
                const indDetails = applicant.individualApplicant?.individualIncomeDetails || [];

                if (indDetails.length === 1 && indDetails[0]?.netMonthlySalary != null) {
                    // ✅ Special case: only one object with netMonthlySalary
                    total += Number(indDetails[0].netMonthlySalary);
                    count += 1;
                } else {
                    indDetails.forEach(income => {
                        if (income?.netMonthlySalary != null) {
                            total += Number(income.netMonthlySalary);
                            count += 1;
                        }
                    });
                }
            }
        });

        return count > 0 ? total / count : 0;
    };

    // ✅ Combined function for Applicant + Co-Applicant
    const calculateCombinedAverageIncome = (applicants = [], coApplicants = []) => {
        let totalIncome = 0;
        let count = 0;

        const allApplicants = [...applicants, ...coApplicants];

        allApplicants.forEach(applicant => {
            // Organization
            if (applicant.organizationApplicant?.organizationIncomeDetails?.length > 0) {
                applicant.organizationApplicant.organizationIncomeDetails.forEach(income => {
                    if (income.grossRevenue != null) {
                        totalIncome += Number(income.grossRevenue);
                        count++;
                    }
                });
            }

            // Individual
            if (applicant.individualApplicant?.individualIncomeDetails?.length > 0) {
                applicant.individualApplicant.individualIncomeDetails.forEach(income => {
                    if (income.basicSalary != null) {
                        totalIncome += Number(income.basicSalary);
                        count++;
                    }
                });
            }
        });

        return count > 0 ? totalIncome / count : 0;
    };

    // Helper: calculate total liabilities (EMIs) for an array of applicants
    const calculateTotalLiabilities = (applicants = []) => {
        let totalLiability = 0;

        applicants.forEach(applicant => {
            // Individual Applicant
            if (applicant.individualApplicant?.liabilityLoanDetails?.length > 0) {
                totalLiability += applicant.individualApplicant.liabilityLoanDetails
                    .filter(l => l.forObligation)
                    .reduce((sum, loan) => sum + (loan.emi || 0), 0);
            }

            // Organization Applicant
            if (applicant.organizationApplicant?.liabilityLoanDetails?.length > 0) {
                totalLiability += applicant.organizationApplicant.liabilityLoanDetails
                    .filter(l => l.forObligation)
                    .reduce((sum, loan) => sum + (loan.emi || 0), 0);
            }
        });

        return totalLiability;
    };

    const calculateEligibility = (applicants = [], coApplicants = [], applicationData) => {
        const combinedAvgIncome = calculateCombinedAverageIncome(applicants, coApplicants);
        const totalLiabilities = calculateTotalLiabilities(applicants) + calculateTotalLiabilities(coApplicants);

        // Get tenor from applicationData.data
        const tenorArray = Array.isArray(applicationData?.data) ? applicationData.data.map(a => Number(a.tenor) || 0) : [];
        const totalTenor = tenorArray.length > 0 ? tenorArray.reduce((sum, t) => sum + t, 0) / tenorArray.length : 1; // Average tenor if multiple


        // Formula: (AverageIncome * 50% - liability) * tenor
        return ((combinedAvgIncome * 0.5 - totalLiabilities) * totalTenor);
    };


    const calculateFOIR = (applicants = [], coApplicants = []) => {
        const combinedAverageIncome = calculateCombinedAverageIncome(applicants, coApplicants);

        const totalLiabilities = calculateTotalLiabilities(applicants) + calculateTotalLiabilities(coApplicants);

        if (combinedAverageIncome === 0) return 0;

        return (totalLiabilities / combinedAverageIncome) * 100; // FOIR in percentage
    };

    useEffect(() => {
        const avgApplicantIncome = calculateAverageIncome(applicantTypes);
        const avgCoApplicantIncome = calculateAverageIncome(CoapplicantTypes);
        const foir = calculateFOIR(applicantTypes, CoapplicantTypes);
        const eligibility = calculateEligibility(applicantTypes, CoapplicantTypes, applicationData);
        const combinedAverage = calculateCombinedAverageIncome(applicantTypes, CoapplicantTypes);
        const IRR = applicationData?.data?.[0]?.irrValue
        setirr(IRR)
        setfoirafleon(foir)
        seteligibility(eligibility)
        setcombinedAverage(combinedAverage)


        // :", combinedAverage);
        // :", foir.toFixed(2));
        // );

    }, [applicantTypes, CoapplicantTypes, applicationData]);


    useEffect(() => {
        if (!schemeDataLoaded || !Array.isArray(schemeIds) || schemeIds.length === 0) return;

        const newSchemeIds = schemeIds.filter(
            id => !fetchedSchemeIdsRef.current.has(id)
        );

        if (newSchemeIds.length === 0) return;

        // Mark them as fetched
        newSchemeIds.forEach(id => fetchedSchemeIdsRef.current.add(id));

        // Fetch for each new ID
        newSchemeIds.forEach(id => {
            fetchData(`getSchemeLoanInterestAmortizationBySchemeId/${id}`, setschemedata);
        });
    }, [schemeDataLoaded, JSON.stringify(schemeIds)]); // ✅ ensures re-run when schemeIds array content changes


    useEffect(() => {
        if (decisionData) {

            setTempSanctionROI(decisionData?.data?.sanctionROI);
            setTempSanctionTenure(decisionData?.data?.sanctionTenor);
            setSanctionAmount(decisionData?.data?.sanctionAmount);
            setEligibilityAmount(decisionData?.data?.sanctionAmount);
            setltv(decisionData?.data?.ltv);
            setCAmSendBack(decisionData?.data?.decisionCamRemark)
            if (decisionData?.data?.finalFOIR !== undefined) {
                setFinalFoir(decisionData.data.finalFOIR);

            }
            if (decisionData?.data?.foir !== undefined) {
                setFoir(decisionData.data.foir);

            }
            setSendBack(decisionData?.data?.remark || '');
            setApprovalRemark(decisionData?.data?.ceoRemark)
            setCEOSendBack(decisionData?.data?.ceoRemark || '');
            setComitteeSendBack(decisionData?.data?.committeeRemark || '');
            setEMI(decisionData?.data?.emi)
            setSelectedCycleDays({
                label: String(decisionData?.data?.dateOfEmi || 0),
                value: String(decisionData?.data?.dateOfEmi || 0),
            });

            setSelectedOptions(prevState => ({
                ...prevState,
                selectedLoanApproval: getSelectedOption(options.loanApprovalOptions, decisionData?.data?.loanApproval),
                selectedSendBack: getSelectedOption(options.sendBackOptions, decisionData?.data?.sendBack),
                selectedRejectReason: getSelectedOption(options.rejectReasonOptions, decisionData?.data?.rejectionReason)
            }));
        }
    }, [decisionData, options]); // Dependency on options to ensure updates

    const getSelectedOption = (optionsArray, label) => {
        return optionsArray.find(option => option.label === label)?.value || '';
    };

    useEffect(() => {
        getBusinessDate();
    }, [])

    const getBusinessDate = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getBusinessDate`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                    }
                }
            );
            setBusinessDate(response.data.data);

        } catch (error) {
            console.error('Error fetching lead Designation:', error);
            Alert.alert('Error', 'Failed to fetch Designation');
        }
    }

    const getPendingOrCompletedLog = (logs) => {
        if (!logs || logs.length === 0) return null;

        // Prioritize Pending logs
        const pendingLog = logs.find(log => log.status === "Pending");
        if (pendingLog) return pendingLog;

        // If no Pending log, return the first Completed or available log
        return logs.find(log => log.status === "Completed") || logs[0];
    };

    const fetchData = async (url, setData, method = "GET", payload = null) => {
        try {

            const options = {
                method,
                url: `${API_BASE_URL}${url}`,


                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },

                ...(payload && { data: payload }),
            };
            const response = await axios(options);
            setData(response.data);
        } catch (error) {
            console.error(`Error fetching ${url}:`, error);
        }
    };


    useEffect(() => {
        if (!schemeData?.data?.content) return;
        const matchedScheme = schemeData.data.content.filter(
            scheme => scheme?.productName === applicationByid?.product?.productName
        );
        setDropdownScheme(matchedScheme);
    }, [schemeData, applicationByid?.product?.productName]);

    useEffect(() => {
        const initialSelected = applicationData?.data?.map(item =>
            mappedDropdownScheme.find(s => s.label === item.scheme?.schemeName)
        ).find(Boolean) || {};
        setselectedSchemePerApplication(initialSelected);
    }, [applicationData, CycleDays]);


    // Handle scheme change
    const handleDropdownScheme = useCallback((item) => {


        // Update the selected 
        setSelectedDropdownScheme({ label: String(item.label), value: String(item.value) });

        // Call API with selected scheme value
        if (item.value) {
            fetchData(
                `getSchemeLoanInterestAmortizationBySchemeId/${item.value}`,
                (data) => {
                    const secheme = data?.data;
                    setSchemeSelectAPI(data), // setData callback
                        'GET' // method
                });
        }
    }, []);



    // const SchemeAPI = fetchData(`getSchemeLoanInterestAmortizationBySchemeIdAPI/${}`, setloginUser);
    const [getOwnContribution, setgetOwnContribution] = useState([]);
    const [SanctionLetterByApplicationNo, setSanctionLetterByApplicationNo] = useState([]);
    console.log(SanctionLetterByApplicationNo, 'SanctionLetterByApplicationNoSanctionLetterByApplicationNo')
    const totalInsurance = SanctionLetterByApplicationNo?.insuranceDetailList?.reduce(
        (sum, item) => sum + (item.insuranceAmount || 0),
        0
    );


    useEffect(() => {
        if (!item?.id) return; // Avoid running if item is not ready

        const fetchDataSequentially = async () => {
            try {
                await fetchAllData();

            } catch (error) {
                console.error("Error in fetching data:", error);
            }
        };

        fetchDataSequentially();


        // ✅ Only runs when item changes
    }, [item]);

    const fetchCamReport = async () => {

        if (!amortContent || amortContent.length === 0) {
            Alert.alert("Alert", "Please calculate Amort!");
            return;
        }


        await fetchData(`getUserDetailByUserName/${applicationByid?.createdBy?.userName}`, setloginUser);
        await fetchData(`getUserDetailByRoleName/CEO`, setceoUser);
        await fetchData(`getCamReportByApplicationNo/${item.applicationNo}`, (data) => {

            const report = data?.data;
            const productdetail = data?.data?.decision;
            const officeVerification = data?.data?.officeVerification;
            const processingFeeDetails = data?.data?.processingFeeDetails
            // const loginFeeDetails = data?.data?.loginFeeDetails
            const stampDutyFeeDetails = report?.stampDutyFee || {};
            const insuranceDetails = data?.data?.insuranceDetails
            const cersaiFee = data?.data?.cersaiFee || {};
            const natch = data?.data?.nachFee || {}
            const cibil = data?.data?.cibilReports;
            const updateDisbursementDtolist = data?.data?.updateDisbursementDtoList || [];
            setCamReportVisible(true);
            // setCamReportData(report);
            setproductdetails(productdetail);
            setofficeVerification(officeVerification);
            // setcersaiFee(cersaiFee)
            setprocessingFeeDetails(processingFeeDetails)
            setinsuranceDetails(insuranceDetails)
            setstampDutyFeeDetails(stampDutyFeeDetails)
            setupdateDisbursementDtolist(updateDisbursementDtolist)
            setnach(natch)
            setcibilReports(cibil)
        });
    };

    const fetchSanctioneport = async () => {
        setSanctionReportVisible(true)
        await fetchData(`getScheduleByApplicationNumber/${item.applicationNo}?page=1&size=1000`, (data) => {
            if (data) {

                const decisionRemarks = data?.response;
                setgetOwnContribution(decisionRemarks)
            }
        });
        await fetchData(`getSanctionLetterByApplicationNo?applicationNo=${item.applicationNo}`, (data) => {
            if (data) {

                const decisionRemarks = data?.data;
                setSanctionLetterByApplicationNo(decisionRemarks)
            }
        });

    }
    const fetchAllData = async () => {
        try {
            if (!item?.applicationNo) {
                console.error("Application number is missing.");
                return;
            }

            // Fetch data sequentially
            await fetchData("getAllScheme", (data) => {
                setSchemeData(data); // Set scheme data
                setSchemeDataLoaded(true); // Mark the scheme data as loaded
            });

            await fetchData(`getByApplicationNumber/${item.applicationNo}`, setApplicationData);
            await fetchData(`getFlagDataOfProductAmortByApplicationNumber/${item.applicationNo}`, setFlagData);
            await fetchData(`getLogsDetailsByApplicationNumber/${item.applicationNo}`, (data) => {
                const logs = data.data;

                setAllLogs(logs);

                // Filter DDE logs
                const DDE = logs.filter(d => d.description === 'DDE');
                setDDE(DDE);

                const InitiateVerification = logs.filter(d => d.description === 'InitiateVerification');

                setInitiateVerification(InitiateVerification)


                // Filter Initiate Disbursement logs
                const InitiateDisbursement = logs.filter(log => log.description === "Initiate Disbursement");
                setInitiateDisbursementFinal(InitiateDisbursement);
                const Committeedata = logs.filter(log => log?.description === "Decision Approve");
                setDecisionApprove(Committeedata)
                const Disbursed = logs.filter(log => log?.description === "Case is Disbursed");
                setDisbursed(Disbursed)
                const completedCount = Committeedata.filter(log => log?.status === "Completed").length;
                setLUNGI(completedCount);
                setDecisonPrroevtest(Committeedata)
                // Find decision logs
                let decisionLogs = logs.filter(
                    log => log.description === "Decision" || log.description === "Decision Approve"
                );

                if (decisionLogs.length > 0) {
                    // Sort by createdAt (latest first). Remove this if logs are already in order.
                    decisionLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                    // Find latest Pending or Completed log
                    const latestDecisionLog = getPendingOrCompletedLog(decisionLogs);




                    setLogDetails(latestDecisionLog);
                } else {
                    setLogDetails(null);
                }

            });
            await fetchData("getAllFee", setFeeDetails);
            await fetchData("getAllFeeType", setFeeTypes);
            await fetchData("getAllAuthorizations", setAuthorizations);
            await fetchData("getAllCreditUserList", setCreditUserList);
            await fetchData("getAllCreditLevelDecisions", setCreditDecisions);
            await fetchData(`getDecisionByApplicationNumber/${item.applicationNo}`, setDecisionData);
            await fetchData(`getAllAmortDetails/${item.applicationNo}`, setAmortDetails);

            await fetchData(`getUserDetailByRoleName/Credit Head`, setuser);
            await fetchData("getByType?lookupType=SendBack", (data) => {
                setOptions(prevState => ({
                    ...prevState,
                    sendBackOptions: data?.data?.map(({ lookupCode, lookupName }) => ({ value: lookupName, label: lookupName })) || []
                }));
            });

            await fetchData("getByType?lookupType=LoanApproval", (data) => {
                setOptions(prevState => ({
                    ...prevState,
                    loanApprovalOptions: data?.data?.map(({ lookupCode, lookupName }) => ({ value: lookupName, label: lookupName })) || []
                }));
            });

            await fetchData("getByType?lookupType=RejectReason", (data) => {
                setOptions(prevState => ({
                    ...prevState,
                    rejectReasonOptions: data?.data?.map(({ lookupCode, lookupName }) => ({ value: lookupName, label: lookupName })) || []
                }));
            });

            // await getApplicationByid();
            await fetchData(`deleteAmortDetailsOnApplicationNumber/${item.applicationNo}`, console.log, "DELETE");

        } catch (error) {
            console.error("Error in fetching data:", error);
        }
    };
    const [sanctionAddressMap, setSanctionAddressMap] = useState({});

    useEffect(() => {
        const normalize = value => Array.isArray(value) ? value : value ? [value] : [];

        const allApplicants = [
            ...normalize(applicantTypes),
            ...normalize(CoapplicantTypes),
            ...normalize(Guarantor)
        ];

        const map = {};

        allApplicants.forEach(applicant => {
            const currentAddress = applicant?.address?.find(
                addr => addr?.addressType === 'CURRENT'
            );

            if (currentAddress) {
                const key = applicant?.id
                    ?? applicant?.individualApplicant?.id
                    ?? applicant?.organizationApplicant?.id
                    ?? Math.random();

                map[key] = currentAddress;
            }
        });

        setSanctionAddressMap(map);
    }, [applicantTypes, CoapplicantTypes, Guarantor]);

    const calculateAge = (dateString) => {
        if (!dateString) return null;

        const today = new Date();
        const date = new Date(dateString);
        let age = today.getFullYear() - date.getFullYear();
        const monthDiff = today.getMonth() - date.getMonth();

        // Adjust if the current month/day is before the birth/incorporation month/day
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
            age--;
        }

        return age;
    };

    const renderCAMReport = () => {
        // if (!camReportData) return null;

        const allApplicants = [
            ...(Array.isArray(applicantTypes) ? applicantTypes : [applicantTypes]),
            ...(Array.isArray(CoapplicantTypes) ? CoapplicantTypes : [CoapplicantTypes]),
            ...(Array.isArray(Guarantor) ? Guarantor : Guarantor ? [Guarantor] : [])
        ].filter(Boolean);

        const customerHeaders = [
            'Customer Name',
            'Applicant Category',
            'Applicant Type',
            'Date Of Birth',
            'Age',
            'Address'
        ];

        const customerData = allApplicants.map(val => {
            // 1️⃣ Identify applicant type
            const isOrganization = val?.applicantCategoryCode === 'Organization';
            const isIndividual = val?.applicantCategoryCode === 'Individual';

            // 2️⃣ Pick address type based on category
            const registeredAddress = val?.address?.find(
                addr => addr?.addressType === 'Registered Address'
            );

            const permanentAddress = val?.address?.find(
                addr => addr?.addressType === 'PERMANENT'
            );
            const dateValue = isOrganization
                ? val?.organizationApplicant?.incorporationDates
                : val?.individualApplicant?.dateOfBirths;

            // const isOrganization = val?.applicantCategoryCode === 'Organization';






            // 3️⃣ Build full formatted addresses
            const fullAddressOrganization = registeredAddress
                ? `${registeredAddress.addressLine1 || ''}${registeredAddress.addressLine2 ? ', ' + registeredAddress.addressLine2 : ''}${registeredAddress.addressLine3 ? ', ' + registeredAddress.addressLine3 : ''
                }, ${registeredAddress.pincode?.areaName || ''}, ${registeredAddress.pincode?.pincode || ''}`
                : 'N/A';

            const fullAddressIndividual = permanentAddress
                ? `${permanentAddress.addressLine1 || ''}${permanentAddress.addressLine2 ? ', ' + permanentAddress.addressLine2 : ''}${permanentAddress.addressLine3 ? ', ' + permanentAddress.addressLine3 : ''
                }, ${permanentAddress.pincode?.areaName || ''}, ${permanentAddress.pincode?.pincode || ''}`
                : 'N/A';

            // 4️⃣ Choose which one to display
            const formattedAddress = isOrganization
                ? fullAddressOrganization
                : isIndividual
                    ? fullAddressIndividual
                    : 'N/A';

            // const formattedDate = dateValue;
            const formattedDate =
                dateValue
                    ? new Date(dateValue)
                        .toLocaleDateString('en-GB') // gives DD/MM/YYYY
                        .replace(/\//g, '-')          // replace / with -
                    : 'N/A';
            const age = calculateAge(dateValue);


            // 5️⃣ Build the row data
            return [
                val?.individualApplicant
                    ? `${val?.individualApplicant?.firstName || ''} ${val?.individualApplicant?.middleName || ''} ${val?.individualApplicant?.lastName || ''}`.trim()
                    : val?.organizationApplicant?.organizationName || 'N/A',
                val?.applicantCategoryCode || 'N/A',
                val?.applicantTypeCode || 'N/A',
                formattedDate,
                age,
                formattedAddress,
            ];
        });

        const Customerempdetails = ['Customer Name', 'Applicant Category', 'Applicant Type', 'Company Name', 'Designation', 'Company Address'];

        const Customerempdetailsdata = officeVerification.map(reference => {
            const applicant = reference?.applicant?.individualApplicant;
            const applicantName = [applicant?.firstName, applicant?.lastName].filter(Boolean).join(' ') || 'N/A';
            const organizationApplicant = reference?.applicant?.organizationApplicant


            const Name = reference?.applicant?.individualApplicant
                ? `${reference?.applicant?.individualApplicant?.firstName || ''} ${reference?.applicant?.individualApplicant?.middleName || ''} ${reference?.applicant?.individualApplicant?.lastName || ''}`.trim()
                : reference?.applicant?.organizationApplicant?.organizationName || 'N/A'


            const officeAddress = reference?.applicant?.address?.find(
                addr => addr.addressType?.toLowerCase() === "office" || "Operation Address"
            );
            const formattedCompanyAddress = [
                officeAddress?.addressLine1,
                officeAddress?.addressLine2,
                officeAddress?.addressLine3,
                officeAddress?.pincode?.pincode,
                officeAddress?.pincode?.areaName,
                officeAddress?.pincode?.City?.cityName,
                officeAddress?.pincode?.City?.state?.stateName,
            ].filter(Boolean).join(", ");

            return {
                applicantName: Name,
                applicantCategory: reference?.applicant?.applicantCategoryCode || 'N/A',
                applicantType: reference?.applicant?.applicantTypeCode || 'N/A',
                companyName: reference?.officeName || 'N/A',
                designation: reference?.applicantDesignation || 'N/A',
                companyAddress: formattedCompanyAddress,
            };
        });

        // Convert objects to arrays for DynamicTable
        const rows = Customerempdetailsdata.map(item => [
            item.applicantName,
            item.applicantCategory,
            item.applicantType,
            item.companyName,
            item.designation,
            item.companyAddress
        ]);


        const chargeHeaders = ['Charge Description', 'Applicant Type', 'Total Fee'];
        const chargeData = [
            processingFeeDetails && Object.keys(processingFeeDetails).length > 0 ? [
                processingFeeDetails?.feeType || 'N/A',
                processingFeeDetails?.applicantTypeCode || 'Applicant',
                processingFeeDetails?.totalFee || '0',
            ] : [],
            stampDutyFeeDetails && Object.keys(stampDutyFeeDetails).length > 0 ? [
                stampDutyFeeDetails?.feeType || 'N/A',
                stampDutyFeeDetails?.applicantTypeCode || 'Applicant',
                stampDutyFeeDetails?.totalFee || '0',
            ] : [],
            nach && Object.keys(nach).length > 0 ? [
                nach?.feeType || 'N/A',
                nach?.applicantTypeCode || 'Applicant',
                nach?.totalFee || '0',
            ] : [],
            ...(insuranceDetails?.map(insurance => [
                insurance?.insuranceName || 'N/A',
                insurance?.applicantTypeCode || 'Customer',
                insurance?.insuranceAmount || '0',
            ]) || []),
        ];

        const bankheaders = ['Applicant Type', 'Account Holder Name', 'Account Number', 'Bank Name', 'Account Type', 'IFSC Code'];
        const bankData = ApplicantArray.flatMap(applicant => {
            const individualBanks = applicant?.individualApplicant?.bankDetails || [];
            const organizationBanks = applicant?.organizationApplicant?.bankDetails || [];

            const allBanks = [...individualBanks, ...organizationBanks];

            return allBanks.map(bank => [
                applicant?.applicantTypeCode || 'N/A',
                bank?.accountHolderName || 'N/A',
                bank?.accountNumber || 'N/A',
                bank?.bankName || 'N/A',
                bank?.accountType || 'N/A',
                bank?.ifsc || 'N/A',
            ]);
        });

        const individualIncomeHeaders = [
            'Applicant Type', 'Year', 'Month', 'Basic Salary', 'Allowances', 'Taxes',
            'Other Deduction', 'Other Income', 'Net Monthly Salary', 'Net Annual Salary'
        ];

        const organizationIncomeHeaders = [
            'Applicant Type', 'Year', 'Gross Revenue', 'Cost Of Sales', 'Gross Income',
            'Admin & Gen Expenses', 'Interest', 'Depreciation', 'Tax', 'Net Income'
        ];

        const incomeDetailsRows = ApplicantArray.flatMap(applicant => {
            if (applicant.individualApplicant?.individualIncomeDetails?.length > 0) {
                return applicant.individualApplicant.individualIncomeDetails.map(detail => [
                    'Individual',
                    detail.year || '-',
                    detail.month || '-',
                    detail.basicSalary || '-',
                    detail.allowances || '-',
                    detail.taxes || '-',
                    detail.otherDeductions || '-',
                    detail.otherMonthlyIncome || '-',
                    detail.netMonthlySalary || '-',
                    detail.netAnnualSalary || '-',
                ]);
            }

            if (applicant.organizationApplicant?.organizationIncomeDetails?.length > 0) {
                return applicant.organizationApplicant.organizationIncomeDetails.map(detail => [
                    'Organization',
                    detail.yearEnding || '-',
                    detail.grossRevenue || '-',
                    detail.costOfSales || '-',
                    detail.grossIncome || '-',
                    detail.adminGenExpenses || '-',
                    detail.interest || '-',
                    detail.depreciation || '-',
                    detail.tax || '-',
                    detail.netIncome || '-',
                ]);
            }

            return [];
        });

        // ✅ Removed inner ScrollView here
        return (
            <View>
                <DynamicTable title="Customer Details" headers={customerHeaders} rows={customerData} />
                <DynamicTable title="Customer Employment Details" headers={Customerempdetails} rows={rows} />
                <DynamicTable title="Charge Details" headers={chargeHeaders} rows={chargeData} />
                {bankData.length > 0 && <DynamicTable title="Bank Details" headers={bankheaders} rows={bankData} />}
                <DynamicTable
                    title="Income Details"
                    headers={
                        ApplicantArray.some(a => a.individualApplicant?.individualIncomeDetails?.length > 0)
                            ? individualIncomeHeaders
                            : organizationIncomeHeaders
                    }
                    rows={incomeDetailsRows}
                />
            </View>
        );
    };


    const getCurrentDate = (businessDate) => {
        if (businessDate?.length === 3) {
            const [year, month, day] = businessDate; // Destructure the array
            return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`; // Format YYYY-MM-DD
        }
        return null; // Return null if businessDate is not valid
    };

    const handleSanctionROIChange = useCallback((value) => {
        setTempSanctionROI(value);
    }, []);
    useEffect(() => {
        const initialSelected = applicationData?.data
            ?.map(item => {
                const cycle = String(item.billingCycle);
                const matched = CycleDays.find(opt => opt.value === cycle);
                if (matched) {

                }
                return matched;
            })
            .find(Boolean) || {};


        setSelectedCyclePerApplication(initialSelected);
    }, [applicationData, CycleDays]);


    const handleCycleDayChange = useCallback((item) => {
        setSelectedCycleDays({ label: String(item.label), value: String(item.value) });
        setCycleDay(String(item.value));
    }, []);
    const handleSanctionTenureChange = useCallback((value) => {
        setTempSanctionTenure(value);
    }, []);

    const shakeAnimROI = useRef(new Animated.Value(0)).current;
    const shakeAnimTenure = useRef(new Animated.Value(0)).current;

    const [roiBorderColor, setRoiBorderColor] = useState('#ccc');
    const [tenureBorderColor, setTenureBorderColor] = useState('#ccc');

    const triggerShake = (animRef, setBorderColor) => {
        Vibration.vibrate(80);
        setBorderColor('red');
        Animated.sequence([
            Animated.timing(animRef, { toValue: 10, duration: 50, useNativeDriver: true }),
            Animated.timing(animRef, { toValue: -10, duration: 50, useNativeDriver: true }),
            Animated.timing(animRef, { toValue: 6, duration: 50, useNativeDriver: true }),
            Animated.timing(animRef, { toValue: -6, duration: 50, useNativeDriver: true }),
            Animated.timing(animRef, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start(() => {
            setTimeout(() => setBorderColor('#ccc'), 1000);
        });
    };

    const validateSanctionROI = () => {
        if (tempSanctionROI === '') {
            setSanctionROI('');
            return;
        }

        const numericValue = parseFloat(tempSanctionROI);
        const minRate = schemedata?.data?.minInterestRate ?? 11.5;
        const maxRate = schemedata?.data?.maxInterestRate ?? 13;

        if (!isNaN(numericValue)) {
            if (numericValue >= minRate && numericValue <= maxRate) {
                setSanctionROI(numericValue);
            } else {
                setTempSanctionROI('');
                setSanctionROI('');
                triggerShake(shakeAnimROI, setRoiBorderColor);
                Alert.alert('Error', `ROI must be between ${minRate} to ${maxRate}`);
            }
        }
    };

    const validateSanctionTenure = () => {
        if (tempSanctionTenure === '') {
            setSanctionTenure('');
            return;
        }

        const numericValue = parseInt(tempSanctionTenure, 10);
        const minTenure = schemedata?.data?.minTenure;
        const maxTenure = schemedata?.data?.maxTenure;

        if (!isNaN(numericValue)) {
            if (numericValue >= minTenure && numericValue <= maxTenure) {
                setSanctionTenure(numericValue);
            } else {
                setTempSanctionTenure('');
                setSanctionTenure('');
                triggerShake(shakeAnimTenure, setTenureBorderColor);
                Alert.alert('Error', `Tenure must be between ${minTenure} to ${maxTenure}`);
            }
        }
    };


    const handleSanctionAmountChange = useCallback((value) => {
        const rawValue = value.replace(/[^0-9.]/g, '');
        const numericValue = parseFloat(rawValue) || 0;
        if (numericValue > item.loanAmount) {
            setError(true);
        } else {
            setError(false);
            setSanctionAmount(isNaN(numericValue) ? '' : numericValue);
        }
    }, [item.loanAmount]);

    const handleirr = (text) => {
        let cleaned = text.replace(/[^0-9.]/g, "");

        const parts = cleaned.split(".");
        if (parts.length > 2) {
            cleaned = parts[0] + "." + parts[1];
        }

        setirr(cleaned);
    };


    const ResidenceValidation = () => {
        const missingFields = [];

        // Step 1: Validate Required Fields
        if (!sanctionAmount) {
            missingFields.push('Sanction Amount cannot be empty');
        } else if (sanctionAmount > item?.loanAmount) {
            missingFields.push(`Sanction Amount cannot be greater than  Applied Loan Amount (${item?.loanAmount})`);
        }

        if (sanctionAmount > eligibility) {
            missingFields.push('Sanction Amount cannot be greater then a Eligibility Amount');
        }

        if (!tempSanctionROI) {
            missingFields.push('Sanction ROI cannot be Empty');
        }

        if (!tempSanctionTenure) {
            missingFields.push('Sanction Tenure cannot be Empty');
        }

        // Step 2: Validate Sanction Amount against Applied Loan Amount
        if (sanctionAmount > AplliedLoanAmount) {
            missingFields.push('Sanction Amount cannot be greater than the Applied Loan Amount');
        }

        return missingFields.length ? missingFields : true;
    };

    const handleCalculatePress = async () => {

        const residenceValidationResult = ResidenceValidation();
        const missingFields = Array.isArray(residenceValidationResult) ? residenceValidationResult : [];

        if (missingFields.length) {
            // Format Alert ⚠️ into a styled list
            const formattedMissingFields = missingFields
                .map((field, index) => `\u2022 ${field}`) // Add bullet points
                .join('\n'); // Join with new lines

            Alert.alert(
                'Alert ⚠️',
                `${formattedMissingFields}`,
                [{ text: 'OK', style: 'cancel' }] // Optionally, add a cancel 
            );
        } else {

            setIsLoading(true); // Show loader

            try {
                // Step 1: Delete amort details
                const deleteResponse = await axios.delete(
                    `${BASE_URL}deleteAmortDetailsOnApplicationNumber/${item.applicationNo}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );

                if (deleteResponse.status !== 200) {
                    throw new Error('Failed to delete amort details');
                }


                const currentDate = BusinessDate.businnessDate ? getCurrentDate(BusinessDate.businnessDate) : null;
                const appliedLoanAmount = applicationData.data[0]?.appliedLoanAmount;
                if (!appliedLoanAmount) {
                    throw new Error('Applied loan amount is missing');
                }

                // Step 2: Add first amort details
                const addFirstAmortResponse = await axios.post(`${BASE_URL}addFirstAmortDetails`,
                    {
                        tenor: null,
                        totalTenor: tempSanctionTenure,
                        rateOfInterest: tempSanctionROI,
                        requiredDays: 0,
                        dueDate: currentDate,
                        emi: 0,
                        interest: 0,
                        principal: 0,
                        openingBalance: sanctionAmount,
                        closingBalance: sanctionAmount,
                        disbursementAmount: sanctionAmount,
                        specifier: 'S',
                        applicationNumber: item.applicationNo,
                    },
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );
                if (addFirstAmortResponse.status !== 200) {
                    throw new Error('Failed to add first amort details');
                }

                // Step 3: Add amort details
                const addAmortResponse = await axios.post(`${BASE_URL}addAmortDetails/${item.applicationNo}`, {
                    cycleDays: cycleDay?.label || SelectedCycleDays?.label,
                    irrValue: Number(irr) ?? null,
                },
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );
                if (addAmortResponse.status !== 200) {
                    throw new Error('Failed to add amort details');
                }

                // Step 4: Get all amort details
                const getAmortResponse = await axios.get(`${BASE_URL}getAllAmortDetails/${item.applicationNo}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );
                if (getAmortResponse.status !== 200) {
                    throw new Error('Failed to get amort details');
                }
                const amortData = getAmortResponse.data.data;
                setamortdata(amortData);

                console.log(getAmortResponse, 'getAmortResponsegetAmortResponse')


                // Final FOIR Calculation
                // const salaryData = (applicantTypes?.individualApplicant?.monthlySalary || 0) + (CoapplicantTypes?.individualApplicant?.monthlySalary || 0);
                const totalCoApplicantSalary = Array.isArray(CoapplicantTypes)
                    ? CoapplicantTypes.reduce((total, coapplicant) =>
                        total + (coapplicant?.individualApplicant?.monthlySalary || 0) +
                        (coapplicant?.individualApplicant?.otherIncome || 0), 0)
                    : (CoapplicantTypes?.individualApplicant?.monthlySalary || 0) + (CoapplicantTypes?.individualApplicant?.otherIncome || 0);

                const salaryData =
                    (applicantTypes?.individualApplicant?.monthlySalary || 0) +
                    (applicantTypes?.individualApplicant?.otherIncome || 0) +
                    totalCoApplicantSalary;


                const result = Array.isArray(amortData?.content)
                    ? amortData.content.find(entry => entry?.specifier === "R") || null
                    : null;


                const totalEmiApplicant = Array.isArray(applicantTypes?.individualApplicant?.liabilityLoanDetails)
                    ? applicantTypes.individualApplicant.liabilityLoanDetails
                        .filter(applicant => applicant.forObligation === true)  // Filter based on forObligation
                        .reduce((total, applicant) => total + (applicant.emi || 0), 0)  // Sum the EMI values
                    : 0;




                const totalEmiCoApplicant = Array.isArray(CoapplicantTypes)
                    ? CoapplicantTypes.reduce((total, coapplicant) =>
                        total + (Array.isArray(coapplicant?.individualApplicant?.liabilityLoanDetails)
                            ? coapplicant.individualApplicant.liabilityLoanDetails
                                .filter(loan => loan.forObligation === true)  // Filter loans with forObligation = true
                                .reduce((subTotal, loan) => subTotal + (loan.emi || 0), 0) // Sum EMI values for each co-applicant
                            : 0),
                        0)
                    : (Array.isArray(CoapplicantTypes?.individualApplicant?.liabilityLoanDetails)
                        ? CoapplicantTypes.individualApplicant.liabilityLoanDetails
                            .filter(loan => loan.forObligation === true)
                            .reduce((total, loan) => total + (loan.emi || 0), 0)
                        : 0);




                const liabilityData = totalEmiApplicant + totalEmiCoApplicant

                const Cashflows = applicantTypes?.individualApplicant?.monthlySalary + applicantTypes?.individualApplicant?.otherIncome + CoapplicantTypes?.individualApplicant?.monthlySalary + CoapplicantTypes?.individualApplicant?.otherIncome
                settotalObligation(salaryData)

                const totalLiabilities = liabilityData + result?.emi
                const FinalFOIR = (totalLiabilities / salaryData) * 100; // Ensure no division by zero

                setFinalFoir(FinalFOIR.toFixed(2));
                setEMI(result?.emi)
                setCombineSalary(salaryData)

                setterr(liabilityData)


                Alert.alert('Amortization Details', 'Calculation successful!');
            } catch (error) {
                console.error('Error:', error);
                Alert.alert('Error', error.message || 'An error occurred');
            } finally {
                setIsLoading(false); // Hide loader
            }
        }
    };

    const Loader = () => (
        <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#007bff" />
        </View>
    );

    const handleCloseModal = async () => {
        setModalVisibleAmort({ isVisible: false, item: null }); // Reset modal state
        await fetchData(`deleteAmortDetailsOnApplicationNumber/${item.applicationNo}`, console.log, "DELETE");
        // setamortdata([])
        // setSanctionROI('');
        // setSanctionTenure('');
        // setFinalFoir('');
    };

    const headers = [
        'Due Date',
        'EMI',
        'Interest',
        'Principle',
        'Opening Balance',
        'Closing Balance',
        'Disbursement Amount',
        'Specifier',
        'Tenor',
    ];

    const [modalVisibleAmort, setModalVisibleAmort] = useState({ isVisible: false, item: null });
    const handleAmortButtonPress = (item) => {
        setLoading(true); // Show loader before setting modal
        // Set a delay for the modal to appear after showing the loader
        setTimeout(() => {
            setModalVisibleAmort({ isVisible: true, item }); // Set modal state to visible
            setLoading(false); // Hide the loader
        }, 500); // Adjust the timeout as needed to allow loader to show first
    };
    const MemoizedTableRowAmort = React.memo(TableRowAmort);
    const amortContent = amortdata?.content?.length > 0 ? amortdata.content : amortDetails?.data?.content;
    useEffect(() => {


        if (Array.isArray(amortContent) && amortContent.length > 0) {

            const firstDueObj = amortContent.find(item => item?.specifier === "R");
            const lastDueObj = amortContent.find(item => item?.specifier === "M");

            const formatDate = (arr) => {
                if (!Array.isArray(arr) || arr.length < 3) return null;
                const [y, m, d] = arr;
                return `${String(d).padStart(2, "0")}-${String(m).padStart(2, "0")}-${y}`;
            };

            const firstDueDate = formatDate(firstDueObj?.dueDate);
            const lastDueDate = formatDate(lastDueObj?.dueDate);

            setfirstDueDate(firstDueDate);
            setlastDueate(lastDueDate);

            console.log("First Due Date:", firstDueDate);
            console.log("Last Due Date:", lastDueDate);
        }


    }, [amortContent])


    console.log(amortContent, 'amortContentamortContent')
    const renderItem = useCallback(({ item }) => {

        const safe = (v) => (v == null ? "-" : v);

        const description = safe(
            item?.dueDate
                ? `${item.dueDate[0]}-${String(item.dueDate[1]).padStart(2, '0')}-${String(item.dueDate[2]).padStart(2, '0')}`
                : "-"
        );

        const stage = safe(item?.emi?.toFixed(2));
        const type = safe(item?.interest?.toFixed(2));
        const status = safe(item?.principal?.toFixed(2));
        const user = safe(item?.openingBalance?.toFixed(2));
        const closingBalance = safe(item?.closingBalance?.toFixed(2));
        const disbursementAmount = safe(item?.disbursementAmount?.toFixed(2));
        const specifier = safe(item?.specifier);
        const tenor = safe(item?.tenor);

        return (
            <MemoizedTableRowAmort
                data={{
                    description,
                    stage,
                    type,
                    status,
                    user,
                    closingBalance,
                    disbursementAmount,
                    specifier,
                    tenor,
                }}
            />
        );
    }, []);






    const handleOptionChange = (key, item) => {
        setSelectedOptions(prevState => {
            const updatedState = {
                ...prevState,
                [key]: item.value,
            };


            if (key === 'selectedLoanApproval') {
                updatedState.selectedSendBack = null; // Clear the "Send Back" selection
                updatedState.selectedRejectReason = null;
            }

            return updatedState;
        });
    };

    const OfficeValidation = () => {
        const missingFields = [];

        // Basic Field Validations
        if (!tempSanctionROI) {
            missingFields.push('Sanction ROI cannot be empty');
        }

        if (!tempSanctionTenure) {
            missingFields.push('Sanction Tenure cannot be empty');
        }

        if (!sanctionAmount) {
            missingFields.push('Sanction Amount cannot be empty');
        }

        if (!sendBack) {
            missingFields.push('Remark cannot be empty');
        }
        const hasApproved = DecisionApprove?.some(
            (item) => item.user === userDetails?.userName
        );

        if (hasApproved) {
            if (!ApprovalRemark || ApprovalRemark.trim() === "") {
                Alert.alert("⚠️ Missing Remark", "Please enter an approval remark before proceeding.");
                return;
            }

            // ✅ Continue with your logic here

        }

        // if (!CAMsendBack) {
        //     missingFields.push('Decision CAM Remark cannot be empty');
        // }

        // Loan Approval Validation
        if (!selectedOptions?.selectedLoanApproval) {
            missingFields.push('Loan Approval must be selected');
        } else {
            if (selectedOptions.selectedLoanApproval === 'Send Back' && !selectedOptions.selectedSendBack) {
                missingFields.push('Send Back Reason cannot be empty');
            }

            if (selectedOptions.selectedLoanApproval === 'Rejected' && !selectedOptions.selectedRejectReason) {
                missingFields.push('Rejection Reason cannot be empty');
            }
        }

        // Return Alert ⚠️ or True
        return missingFields.length ? missingFields : true;
    };

    const handleSaveButtonPress = async () => {

        const residenceValidationResult = OfficeValidation();
        const missingFields = Array.isArray(residenceValidationResult) ? residenceValidationResult : [];

        if (missingFields.length) {
            // Format Alert ⚠️ into a styled list
            const formattedMissingFields = missingFields
                .map((field, index) => `\u2022 ${field}`) // Add bullet points
                .join('\n'); // Join with new lines

            Alert.alert(
                'Alert ⚠️',
                `${formattedMissingFields}`,
                [{ text: 'OK', style: 'cancel' }] // Optionally, add a cancel 
            );
        } else {
            setIsLoadingsave(true);
            try {
                const currentDate = BusinessDate.businnessDate ? getCurrentDate(BusinessDate.businnessDate) : null;
                const appliedLoanAmount = applicationData.data[0]?.appliedLoanAmount;
                if (!appliedLoanAmount) {
                    throw new Error('Applied loan amount is missing');
                }


                // Step 2: Add Decision
                if (decisionData?.data?.decisionId) {

                    // const matchingCommitteeRemarkObj = committeeRemarks?.find(
                    //     (remark) => remark.userName === mkc.userName
                    // );

                    const updatedecisionResponse = await axios.put(
                        `${BASE_URL}updateDecision/${decisionData?.data?.decisionId}`,
                        {
                            roi: schemedata?.data?.defaultInterestRate,
                            sanctionAmount: sanctionAmount,
                            sanctionROI: tempSanctionROI,
                            sanctionTenor: tempSanctionTenure,
                            foir: foir,
                            ltv: ltv,
                            emi: EMI,
                            eligibility: eligibilityAmount,
                            applicationNumber: `${item.applicationNo}`,
                            finalFOIR: finalFoir,
                            loanApproval: selectedOptions.selectedLoanApproval,
                            decisionCamRemark: CAMsendBack,
                            remark: sendBack,
                            ceoRemark: ApprovalRemark,
                            // ceoRemark: CEOsendBack,
                            // committeeRemark: newRemarks[mkc.userName] || matchingCommitteeRemarkObj?.committeeRemark || "",

                            sendBack: selectedOptions.selectedSendBack ? selectedOptions.selectedSendBack : '',
                            rejectionReason: selectedOptions.selectedRejectReason ? selectedOptions.selectedRejectReason : '',
                            productDetailsAndAmort: { productDetailsId: Number(productDetailsId) },
                            processingFee: calculatedFees?.processingFee,
                            disbursementAmount: calculatedFees?.disbursementAmount,
                            irrValue: Number(irr),
                            dateOfEmi: SelectedCycleDays?.label
                        },
                        {
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + token,
                            },
                        }
                    );
                    if (updatedecisionResponse.data.msgKey !== 'Success') {
                        console.error('Add Decision API failed:', updatedecisionResponse.data.message);
                        Alert.alert('Error', 'Failed to add decision');
                        return; // Exit if Add Decision API fails
                    } else {
                        // RemarkAPI()
                    }

                } else {

                }

                if (!decisionData?.data?.decisionId) {
                    // const matchingCommitteeRemarkObj = committeeRemarks?.find(
                    //     (remark) => remark.userName === mkc.userName
                    // );
                    const decisionResponse = await axios.post(
                        `${BASE_URL}addDecision`,
                        {
                            roi: schemedata?.data?.defaultInterestRate,
                            sanctionAmount: sanctionAmount,
                            sanctionROI: tempSanctionROI,
                            sanctionTenor: tempSanctionTenure,
                            foir: foir,
                            ltv: ltv,
                            emi: EMI,
                            eligibility: eligibilityAmount,
                            applicationNumber: `${item.applicationNo}`,
                            finalFOIR: finalFoir,
                            loanApproval: selectedOptions.selectedLoanApproval,
                            decisionCamRemark: CAMsendBack,
                            remark: sendBack, // Sending the remark value
                            ceoRemark: ApprovalRemark,
                            // ceoRemark: CEOsendBack,
                            // committeeRemark: newRemarks[mkc.userName] || matchingCommitteeRemarkObj?.committeeRemark || "",

                            sendBack: selectedOptions.selectedSendBack ? selectedOptions.selectedSendBack : '',
                            rejectionReason: selectedOptions.selectedRejectReason ? selectedOptions.selectedRejectReason : '',
                            productDetailsAndAmort: { productDetailsId: Number(productDetailsId) },
                            processingFee: calculatedFees?.processingFee,
                            disbursementAmount: calculatedFees?.disbursementAmount,
                            irrValue: Number(irr),
                            dateOfEmi: SelectedCycleDays?.label
                        },
                        {
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + token,
                            },
                        }
                    );
                    if (decisionResponse.data.msgKey !== 'Success') {
                        console.error('Add Decision API failed:', decisionResponse.data.message);
                        Alert.alert('Error', 'Failed to add decision');
                        fetchData(`getDecisionByApplicationNumber/${item.applicationNo}`, setDecisionData);
                        return; // Exit if Add Decision API fails
                    } else {
                        // RemarkAPI()
                    }


                }



                const decisionByAppResponse = await axios.get(
                    `${BASE_URL}getDecisionByApplicationNumber/${item.applicationNo}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );
                if (decisionByAppResponse.data.data.finalFOIR !== 0) {
                    setDecisionData(decisionByAppResponse.data)

                } else {
                    console.error('Failed to fetch decision by application:', decisionByAppResponse.data.message);
                    Alert.alert('Error', 'Failed to fetch decision by application');
                    return; // Exit if Get Decision By Application Number API fails
                }


                // await getApplicationByid()
                const camReportResponse = await axios.get(
                    `${BASE_URL}getCamReportByApplicationNo/${item.applicationNo}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );
                if (camReportResponse.data.msgKey !== 'Success') {
                    console.error('Failed to fetch CAM report:', camReportResponse.data.message);
                    Alert.alert('Error', 'Failed to fetch CAM report');
                    return; // Exit if CSR Report API fails
                }

                const addFirstAmortDetails = async () => {
                    try {
                        // Prepare the schemeId to send
                        const schemeId = selectedDropdownScheme?.value
                            ? selectedDropdownScheme.value
                            : selectedSchemePerApplication?.value;

                        // Prepare billing cycle value
                        const billingCycle = cycleDay?.label || SelectedCycleDays?.label

                        // Make API request
                        const response = await axios.put(
                            `${BASE_URL}addAllProductDetailsAndAmort`,
                            {
                                applicationNumber: item.applicationNo,
                                product: item?.productName,
                                scheme: { schemeId }, // schemeId selected correctly
                                tenor:
                                    SchemeSelectAPI?.data?.minTenure !== 0 && SchemeSelectAPI?.data?.minTenure != null
                                        ? SchemeSelectAPI.data.minTenure
                                        : schemedata?.data?.minTenure || 0,

                                appliedLoanAmount: item?.loanAmount?.toString() || '',
                                repaymentFrequency: 'Monthly',
                                pmtNo: 0,
                                paymentDate: '',
                                openingBalance: 0,
                                emi: 0,
                                update: true,
                                billingCycle: billingCycle || '',
                                principal: 0,
                                interest: SchemeSelectAPI?.data?.defaultInterestRate || schemedata?.data?.defaultInterestRate || 0,
                                closingBalance: 0,
                                portfolio: item?.portfolioDescription || '',
                                irrValue: Number(irr)
                            },
                            {
                                headers: {
                                    Accept: 'application/json',
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );

                        // Check API response
                        if (response.data.msgKey !== 'Success') {
                            console.error(
                                'Add First Amort Details API failed:',
                                response.data.message
                            );
                            Alert.alert('Error', 'Failed to add first amort details');
                            return; // Stop execution if failed
                        }



                    } catch (error) {
                        console.error('Add First Amort Details API error:', error);
                        Alert.alert('Error', 'Something went wrong while adding amort details');
                    }
                };

                await addFirstAmortDetails();

                const deleteResponse = await axios.delete(`${BASE_URL}deleteAmortDetailsOnApplicationNumber/${item.applicationNo}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );
                if (deleteResponse.status !== 200) {
                    throw new Error('Failed to delete amort details');
                }




                // Step 3: Add First Amort Details
                const amortResponse = await axios.post(
                    `${BASE_URL}addFirstAmortDetails`,
                    {
                        tenor: null,
                        totalTenor: tempSanctionTenure,
                        rateOfInterest: tempSanctionROI,
                        requiredDays: 0,
                        dueDate: currentDate,
                        emi: 0,
                        interest: 0,
                        principal: 0,
                        openingBalance: appliedLoanAmount,
                        closingBalance: appliedLoanAmount,
                        disbursementAmount: appliedLoanAmount,
                        specifier: 'S',
                        applicationNumber: item.applicationNo,
                    },
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );
                if (amortResponse.data.msgKey !== 'Success') {
                    console.error('Add First Amort Details API failed:', amortResponse.data.message);
                    Alert.alert('Error', 'Failed to add first amort details');
                    return; // Exit if Add First Amort Details API fails
                }




                const addAmortResponse = await axios.post(
                    `${BASE_URL}addAmortDetails/${item.applicationNo}`,
                    {
                        cycleDays: cycleDay?.label || SelectedCycleDays?.label,
                        irrValue: Number(irr) ?? null
                    },
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );
                if (addAmortResponse.data.msgKey !== 'Success') {
                    console.error('Failed to add amort details:', addAmortResponse.data.message);
                    Alert.alert('Error', 'Failed to add amort details');
                    return; // Exit if Add Amort Details API fails
                }

                // 

                // Step 4: Get All Amort Details
                const allAmortResponse = await axios.get(
                    `${BASE_URL}getAllAmortDetails/${item.applicationNo}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: 'Bearer ' + token,
                        },
                    }
                );
                if (allAmortResponse.data.msgKey !== 'Success') {
                    console.error('Failed to fetch all amort details:', allAmortResponse.data.message);
                    Alert.alert('Error', 'Failed to fetch all amort details');
                    return; // Exit if Get All Amort Details API fails
                }
                // await fetchData(`getDecisionRemark/${item.applicationNo}`, (data) => {
                //     if (data) {
                //         const decisionRemarks = data?.data;

                //         // Find matching object where mkc.userName matches API response userName
                //         const matchedRemark = decisionRemarks.find(
                //             (entry) => entry.userName === userDetails?.userName
                //         );

                //         // Save matched object in state
                //         setDecisionDataRemarkdata(matchedRemark || {});

                //         // Create a mapping of committee remarks based on userName
                //         const remarksMap = {};
                //         data?.data?.forEach((entry) => {
                //             const index = committeeMembers.indexOf(entry.userName);
                //             if (index !== -1) {
                //                 remarksMap[index] = entry.committeeRemark || ""; // Use committeeRemark if available
                //             }
                //         });

                //         setCommitteeRemarks(remarksMap);
                //     }
                // });

                // await fetchData(`getDecisionRemark/${item.applicationNo}`, (data) => {
                //     if (data) {
                //         const decisionRemarks = data?.data;
                //         
                //         // const filteredRemarks = decisionRemarks.filter(entry => !entry.remark);
                //         const filteredRemarks = decisionRemarks
                //         setCamdecisiondata(filteredRemarks)
                //         // Find matching object where mkc.userName matches API response userName
                //         const matchedRemark = decisionRemarks.find(
                //             (entry) => entry.userName === userDetails?.userName
                //         );

                //         // Save matched object in state
                //         setDecisionDataRemarkdata(matchedRemark || {});

                //         // Create a mapping of committee remarks based on userName
                //         const remarksMap = {};
                //         data?.data?.forEach((entry) => {
                //             const index = committeeMembers.indexOf(entry.userName);
                //             if (index !== -1) {
                //                 remarksMap[index] = entry.committeeRemark || ""; // Use committeeRemark if available
                //             }
                //         });

                //         const remarksWithCommitteeRemark = decisionRemarks.filter(
                //             (entry) => String(entry.committeeRemark || "").trim() !== ""
                //         );
                //         setCommitteeRemarks(remarksWithCommitteeRemark);

                //         // setNewspecialRemarks(decisionRemarks);
                //     }
                // });

                // await fetchData(`getOwnContributionDetailByApplicationNumber/${item.applicationNo}`, (data) => {
                //     setIsLoadingsubmit(true);
                //     if (data) {
                //         const decisionRemarks = data?.data;
                //         setgetOwnContribution(decisionRemarks)

                //     }
                // });

                // 

            } catch (error) {
                console.error('Error during API calls:', error);
                Alert.alert('Error', 'An error occurred while making the API calls');
            }
            finally {
                setIsLoadingsave(false); // Step 3: Set loading to false when the process is complete
                setIsLoadingsubmit(true); // Step
            }
        }
    };

    const handleSubmitButtonPress = async () => {
        setmanmera(true);

        const showError = (message, details) => {
            console.error("❌ " + message, details);
            Alert.alert("Error", message);
        };



        try {
            // ---------------- Step 1: Update Decision Flag ----------------


            const updateDecisionFlagResponse = await axios.put(
                `${BASE_URL}updateDecisionFlag/${item.applicationNo}`,
                {
                    applicationNumber: `${item.applicationNo}`,
                    active: true,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                }
            );

            if (updateDecisionFlagResponse.data.msgKey !== "Success") {
                showError("Failed to update decision flag", updateDecisionFlagResponse.data.message);
                setmanmera(false);
                return;
            }

            const userName = updateDecisionFlagResponse.data?.data?.userName;
            setDecisionFlagData(updateDecisionFlagResponse?.data?.data);


            // ---------------- Step 2: Update Log Activity ----------------


            const updateLogActivityResponse = await axios.put(
                `${BASE_URL}updateLogActivityById/${logDetails?.id}`,
                {
                    status: "Completed",
                    stage: "UnderWriting",
                    type: "User",
                    user: logDetails?.user,
                    description: logDetails?.description,
                    applicationNumber: logDetails?.applicationNumber,
                },
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + token,
                    },
                }
            );

            if (updateLogActivityResponse.data.msgKey !== "Success") {
                showError("Failed to update log activity", updateLogActivityResponse.data.message);
                setmanmera(false);
                return;
            }



            // ---------------- Step 3: Fetch Logs and Set Data ----------------


            const fetchLogs = async () => {
                try {
                    const response = await axios.get(
                        `${BASE_URL}getLogsDetailsByApplicationNumber/${item.applicationNo}`,
                        {
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + token,
                            },
                        }
                    );

                    const data = response.data?.data || [];


                    setAllLogs(data);

                    const Committeedata = data.filter(log => log?.description === "Decision Approve");
                    const completedCount = Committeedata.filter(log => log?.status === "Completed").length;
                    setLUNGI(completedCount);
                    setDecisonPrroevtest(Committeedata)

                    const Disbursed = data.filter(log => log?.description === "Case is Disbursed");
                    setDisbursed(Disbursed)

                    setIsDataFetched(true);

                    const CommitteedataReject = data.filter(log => log?.description === "Case is Rejected");
                    const completedCountReject = CommitteedataReject.filter(log => log?.status === "Rejected").length;
                    setLUNGIReject(completedCountReject);
                    setIsDataFetchedReject(true);

                    const InitiateDisbursement = data.filter(log => log?.stage === "Disbursement");
                    setInitiateDisbursement(InitiateDisbursement);

                    const RejectedCase = data.filter(log => log?.description === "Case is Rejected");
                    setRejected(RejectedCase);


                    return true;
                } catch (error) {
                    console.error("❌ Error fetching logs:", error.message);
                    showError("Failed to fetch log details", error.message);
                    return false;
                }
            };

            const logsFetched = await fetchLogs();
            if (!logsFetched) {
                console.warn("⚠️ Logs fetch failed, continuing anyway...");
            }



            // ---------------- Step 4: Conditional Flow Based on Selections ----------------


            // --- Send Back to DDE ---
            if (selectedOptions.selectedLoanApproval === "Send Back" && selectedOptions.selectedSendBack === "DDE") {


                const applicationNumber = item.applicationNo;
                try {
                    const completedLogResponse = await axios.post(
                        `${BASE_URL}addLogActivity`,
                        {
                            status: "Completed",
                            stage: "DDE",
                            type: "User",
                            user: mkc?.userName,
                            description: "Case Send Back to DDE",
                            applicationNumber,
                        },
                        {
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + token,
                            },
                        }
                    );

                    if (completedLogResponse.data.msgKey !== "Success") {
                        console.error("❌ Failed to add Completed log activity (DDE)");
                        return;
                    }

                    const pendingLogResponse = await axios.post(
                        `${BASE_URL}addLogActivity`,
                        {
                            status: "Pending",
                            stage: "DDE",
                            type: "User",
                            user: sendDDE?.user,
                            description: "DDE",
                            applicationNumber,
                        },
                        {
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + token,
                            },
                        }
                    );

                    if (pendingLogResponse.data.msgKey !== "Success") {
                        console.error("❌ Failed to add Pending log activity (DDE)");
                        return;
                    }


                } catch (error) {
                    console.error("❌ Error during Send Back to DDE:", error.message);
                }
            }

            // --- Send Back to Pre-Underwriting ---
            if (selectedOptions.selectedLoanApproval === "Send Back" && selectedOptions.selectedSendBack === "Pre-Underwriting") {


                const applicationNumber = item.applicationNo;
                try {
                    const completedLogResponse = await axios.post(
                        `${BASE_URL}addLogActivity`,
                        {
                            status: "Completed",
                            stage: "Pre-Underwriting",
                            type: "User",
                            user: mkc?.userName,
                            description: "Case Send Back to Pre-UW",
                            applicationNumber,
                        },
                        {
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + token,
                            },
                        }
                    );

                    if (completedLogResponse.data.msgKey !== "Success") {
                        console.error("❌ Failed to add Completed log activity (Pre-UW)");
                        return;
                    }

                    const pendingLogResponse = await axios.post(
                        `${BASE_URL}addLogActivity`,
                        {
                            status: "Pending",
                            stage: "Pre-Underwriting",
                            type: "User",
                            user: sendintiate?.user,
                            description: "InitiateVerification",
                            applicationNumber,
                        },
                        {
                            headers: {
                                Accept: "application/json",
                                "Content-Type": "application/json",
                                Authorization: "Bearer " + token,
                            },
                        }
                    );

                    if (pendingLogResponse.data.msgKey !== "Success") {
                        console.error("❌ Failed to add Pending log activity (Pre-UW)");
                        return;
                    }


                } catch (error) {
                    console.error("❌ Error during Send Back to Pre-Underwriting:", error.message);
                }
            }

            // --- Loan Approved Flow ---
            let addLogActivityCalled = false;
            if (selectedOptions.selectedLoanApproval === "Approved" && DecisonPrroevtest.length === 0) {


                const applicationNumber = logDetails?.applicationNumber;
                const basePayload = {
                    status: "Pending",
                    stage: "UnderWriting",
                    type: "User",
                    description: "Decision Approve",
                    applicationNumber,
                };

                try {
                    if (!addLogActivityCalled && userDetails?.designation === "Credit") {
                        const userNameToUse = sanctionAmount > 500000 ? "APH105" : user?.data[0]?.userName;

                        const addLogActivityResponse = await axios.post(
                            `${BASE_URL}addLogActivity`,
                            { ...basePayload, user: userNameToUse },
                            {
                                headers: {
                                    Accept: "application/json",
                                    "Content-Type": "application/json",
                                    Authorization: "Bearer " + token,
                                },
                            }
                        );

                        if (addLogActivityResponse.data.msgKey !== "Success") {
                            showError("Failed to add log activity", addLogActivityResponse.data.message);
                            return;
                        }


                        addLogActivityCalled = true;
                    }
                } catch (error) {
                    console.error("❌ Error adding Loan Approval log:", error.message);
                }
            }

            // ---------------- Step 8: Navigation ----------------

            navigation.navigate("PreUnderwriting");
        } catch (error) {
            showError("Error during API calls", error.message);
        } finally {
            setmanmera(false);

        }
    };


    const isLogActivityCalledRef = useRef(false);

    useEffect(() => {
        if (
            !isLogActivityCalledRef.current &&
            isDataFetched &&
            LUNGI === 1 &&
            Array.isArray(InitiateDisbursement) &&
            InitiateDisbursement.length === 0 &&
            (selectedOptions.selectedLoanApproval === 'Approved' || selectedOptions.selectedLoanApproval === 'Recommendation') // New condition added
        ) {

            addLogActivityResponse();
            isLogActivityCalledRef.current = true; // Mark API call as done
        }
    }, [isDataFetched, LUNGI, InitiateDisbursement, selectedOptions]);

    const addLogActivityResponse = async () => {
        try {
            const applicationNumber = logDetails?.applicationNumber; // Fetch application number dynamically

            // Check if a similar "Pending" log already exists
            const existingPendingLog = InitiateDisbursement.find(
                (log) => log.applicationNumber === applicationNumber && log.status === "Pending"
            );

            if (existingPendingLog) {

                return; // Skip the API call
            }

            // Check if there is any "Rejected" log with the description "Case is Rejected"
            const existingRejectedLog = Rejected.find(
                (log) =>
                    log.applicationNumber === applicationNumber &&
                    log.status === "Rejected" &&
                    log.description === "Case is Rejected"
            );

            if (existingRejectedLog) {

                return; // Skip the API call
            }

            // If no existing logs found, proceed with the API call
            const payload = {
                status: "Pending",
                stage: "Disbursement",
                type: "User",
                user: decisionFlagData?.userName,
                description: "Initiate Disbursement",
                applicationNumber: applicationNumber,
            };

            const response = await axios.post(`${BASE_URL}addLogActivity`, payload, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            });

            const updateStageOfApplicationbyApplicationNumber = async () => {
                try {
                    const response = await axios.put(
                        `${BASE_URL}updateStageOfApplicationByApplicationNumber/${item.applicationNo}/Disbursement`,
                        null,
                        {
                            headers: {
                                Accept: 'application/json',
                                'Content-Type': 'application/json',
                                Authorization: 'Bearer ' + token,
                            },
                        },
                    );
                } catch (error) {
                    console.error('Error in updateStageOfApplicationByApplicationNumber:', error.message || error);
                }
            }

            // await updateStageOfApplicationbyApplicationNumber();
            if (response.data.msgKey === 'Success' || response.status === 200 || response.status === 201) {
                // fetchLogs()
                // updateStageOfApplicationbyApplicationNumber();
                updateStageOfApplicationbyApplicationNumber();


                navigation.navigate('PreUnderwriting'); // Navigate to the next screen
                setmanmera(false);
            }
        } catch (error) {
            console.error("Error updating log activity:", error);
        }
    };

    const caseVisitedByuserName = cibilReports?.length > 0 ? cibilReports?.[0]?.doneByUserName : 'N/A';




    const [formattedAddress, setformattedAddress] = useState('');
    useEffect(() => {
        const allApplicants = [
            ...(Array.isArray(applicantTypes) ? applicantTypes : [applicantTypes]),
            ...(Array.isArray(CoapplicantTypes) ? CoapplicantTypes : [CoapplicantTypes]),
            ...(Array.isArray(Guarantor) ? Guarantor : Guarantor ? [Guarantor] : [])
        ].filter(Boolean);
        const customerData = allApplicants.map(val => {
            const isOrganization = val?.applicantCategoryCode === 'Organization';
            const isIndividual = val?.applicantCategoryCode === 'Individual';

            const registeredAddress = val?.address?.find(addr => addr?.addressType === 'Registered Address');
            const permanentAddress = val?.address?.find(addr => addr?.addressType === 'PERMANENT');

            const fullAddressOrganization = registeredAddress
                ? `${registeredAddress.addressLine1 || ''}${registeredAddress.addressLine2 ? ', ' + registeredAddress.addressLine2 : ''}${registeredAddress.addressLine3 ? ', ' + registeredAddress.addressLine3 : ''}, ${registeredAddress.pincode?.areaName || ''}, ${registeredAddress.pincode?.pincode || ''}`
                : 'N/A';

            const fullAddressIndividual = permanentAddress
                ? `${permanentAddress.addressLine1 || ''}${permanentAddress.addressLine2 ? ', ' + permanentAddress.addressLine2 : ''}${permanentAddress.addressLine3 ? ', ' + permanentAddress.addressLine3 : ''}, ${permanentAddress.pincode?.areaName || ''}, ${permanentAddress.pincode?.pincode || ''}`
                : 'N/A';

            const formattedAddress = isOrganization ? fullAddressOrganization : isIndividual ? fullAddressIndividual : 'N/A';
            setformattedAddress(formattedAddress)
        })
    }, [applicantTypes,])









    const generateSanctionLetterHTML = async () => {
        try {
            const iosBase64Logo = 'iVBORw0KGgoAAAANSUhEUgAA...'; // replace full base64 
            const logoSrc =
                Platform.OS === 'android'
                    ? 'file:///android_res/drawable/afieon.png'
                    : `data:image/png;base64,${iosBase64Logo}`;

            const formattedDate = new Date().toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });

            const formatBusinessDate = (dateArr) => {
                if (!Array.isArray(dateArr) || dateArr.length !== 3) return "N/A";

                const [year, month, day] = dateArr;

                const dd = String(day).padStart(2, "0");
                const mm = String(month).padStart(2, "0");
                const yy = String(year).slice(-2);

                return `${dd}-${mm}-${yy}`;
            };

            const sanctionTenorByThirtyAmt = decisionData?.data?.sanctionTenor
            const emi = decisionData?.data?.emi
            const EDICalculation1 =
                (decisionData?.data?.sanctionAmount * (decisionData?.data?.sanctionROI / 100) * sanctionTenorByThirtyAmt) /
                360
            const EDICalculation2 = EDICalculation1 + decisionData?.data?.sanctionAmount
            const finalEDICalculation = EDICalculation2 / sanctionTenorByThirtyAmt
            const tomorrowDate = new Date();
            tomorrowDate.setDate(tomorrowDate.getDate() + 1);
            const formattedTomorrow = tomorrowDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
            });

            const applicantName =
                aaplicantName?.individualApplicant
                    ? `${aaplicantName?.individualApplicant?.firstName || ''} ${aaplicantName?.individualApplicant?.middleName || ''} ${aaplicantName?.individualApplicant?.lastName || ''}`.trim()
                    : aaplicantName?.organizationApplicant?.organizationName || 'N/A';

            const applicantPhone =
                aaplicantName?.individualApplicant?.mobileNumber ||
                aaplicantName?.organizationApplicant?.mobileNumber ||
                'N/A';

            const disbursement = SanctionLetterByApplicationNo?.updateDisbursement;
            const processingFee = SanctionLetterByApplicationNo?.processingFeeDetails?.totalFee || 0;
            const taxAmt = SanctionLetterByApplicationNo?.processingFeeDetails?.taxAmt || 0;
            const ecsCharges = (SanctionLetterByApplicationNo?.nachFee?.totalFee || 0) + (SanctionLetterByApplicationNo?.stampDutyFee?.totalFee || 0);
            const insuranceCharge = totalInsurance || 0;

            const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>Sanction Letter</title>
<style>
@page { size: A4; margin: 12mm 12mm 12mm 12mm; }
body { font-family: Arial, sans-serif; font-size: 10px; line-height:1.5; color:#000; margin:0; padding:0; }

.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:20px; }
.logo { width:120px; height:auto; }
.company { text-align:right; font-size:11px; line-height:1.3; color:#333; }
.company-name { font-weight:bold; color:#0D82FF; font-size:14px; margin-bottom:3px; }

h1 { font-size:20px; font-weight:bold; color:#0D82FF; text-align:center; margin:0; }
h2 { font-size:18px; font-weight:bold; color:#0D82FF; text-align:center; margin:0 0 20px 0; }

.section { margin-top:10px; }
.bold { font-weight:bold; }
.highlight { color:#0D82FF; font-weight:bold; }

.table { width:100%; border-collapse:collapse; font-size:11px; margin-top:5px; }
.table th, .table td {
  border: 1px solid #999;
  padding: 6px;
  text-align: center; /* center both headers and values */
  vertical-align: middle; /* vertically center text */
}

.table th { background-color:#0D82FF; color:#fff; text-align:center; }

.closing { margin-top:30px; }
.signature { font-style:italic; font-weight:bold; margin-top:30px; }

.text-right { text-align:right; }
</style>
</head>
<body>

<!-- Header -->
<div class="header">
  <img src="${logoSrc}" class="logo" />
  <div class="company">
    <div class="company-name">Aphelion Finance Pvt. Ltd.</div>
    <div>505, 5th Floor, Ecstasy Business Park,</div>
    <div>JSD Road, Next to City Of Joy, Ashok Nagar,</div>
    <div>Mulund West, Mumbai, Maharashtra 400080.</div>
    <div>Email: customercare@aphelionfinance.com</div>
    <div>Phone: 9321193211 / 022-256562</div>
  </div>
</div>


<!-- Title -->
<h1>Aphelion Finance Pvt. Ltd.</h1>
<h2>(Sanction Letter)</h2>

<!-- Applicant Info -->
<div class="section">
  <p><span class="bold">Date:</span> ${formatBusinessDate(BusinessDate?.businnessDate)}</p>
  <p><span class="bold">To,</span></p>
  <p class="bold">${applicantName}</p>
  <p>${formattedAddress}</p>
  <p><span class="bold">Phone:</span> ${applicantPhone}</p>
</div>

<!-- Loan Details -->
<div class="section">
  <p>Dear Customer,</p>
  <p>We are pleased to inform you that your application for a ${schemeNamesFromApplications} at Aphelion Finance Pvt Ltd. has been accepted and sanctioned. The key details of Aphelion’s PL -Salaried scheme are as follows:</p>

  <p>Loan Account No.: <span class="highlight">${getOwnContribution?.[0]?.loanAccountNumber || 'N/A'}</span></p>
  <p>Loan Amount: <span class="highlight">₹ ${getOwnContribution?.[0]?.disbursementAmount || 0}</span></p>
  <p>Period Of Coverage/Tenure: <span class="highlight">${sanctionTenorByThirtyAmt}Months</span></p>
  <p>Rate of Interest: <span class="highlight">${tempSanctionROI || 'N/A'}% p.a.</span></p>
  <p>Equated Daily Installment (EDI): <span class="highlight">₹ ${Math.round(emi)} × ${sanctionTenorByThirtyAmt} Monthly</span></p>
</div>

<!-- Table -->
<div class="section">
  <p class="bold">Net Loan Amount Disbursed:</p>
  <table class="table">
    <thead>
      <tr>
        <th>Sr.No.</th>
        <th>Issued To</th>
        <th>Chq/NEFT/RTGS No.</th>
        <th>Loan Agreement Date</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${[disbursement].map((item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${applicantName}</td>
          <td>${item?.utrNumber || 'N/A'}</td>
          <td>${item?.utrNumberDate ? `${item.utrNumberDate[2]}-${item.utrNumberDate[1]}-${item.utrNumberDate[0]}` : 'N/A'}</td>
          <td>₹${item?.actualAmountDisbursed || 0}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
</div>

<!-- Deductions -->
<div class="section">
  <p>The following have been deducted from the loan amount sanctioned:</p>
<p>Processing Charges: ₹ ${Number(processingFee || 0) - Number(taxAmt || 0)}</p>

  <p>GST (As per Invoice) on Processing Charges: ₹ ${taxAmt}</p>
 <!-- <p>ECS Charges: ₹ ${ecsCharges}</p> -->
 <!-- <p>GST (As per Invoice) on ECS Charges: ₹ 0</p> -->
 <!-- <p>Insurance Charges: ₹ ${insuranceCharge}</p> -->
  <!--<p>GST (As per Invoice) on Ins Charges: ₹ 0</p> -->
   <!-- <p>Advance EMI: ₹ 0</p> -->

     <!--  <P>Processing Charges: ${SanctionLetterByApplicationNo?.processingFeeDetails?.totalFee || 0} - ${SanctionLetterByApplicationNo?.processingFeeDetails?.taxAmt || 0}</P> -->
      <!--  <P>GST (As per Invoice) on Processing Charges: ${SanctionLetterByApplicationNo?.processingFeeDetails?.taxAmt || 0}</P> -->
     <p>ECS Charges: ₹ ${ecsCharges}</p>
     <P>GST (As per Invoice) on ECS Charges : ₹ 0 </P>
     <P>Insurance Charges: ₹ ${SanctionLetterByApplicationNo?.insuranceDetailList?.[0]?.insurancePremiumAmount || 0}</P>
     <P>GST (As per Invoice) on Ins Charges :₹ ${SanctionLetterByApplicationNo?.insuranceDetailList?.[0]?.insurancePremiumTaxAmount || 0}</P>

     <P>Advance EMI:₹ 0</P >
</div >

< !--Final Notes-- >
<div class="section">
  <p>Please note that the above processing charges include Insurance Premium Charges.</p>
  <p>It is understood that you have read and are aware of all the terms & conditions mentioned in the ${schemeNamesFromApplications} agreement & will abide by the same.</p>
  <p>We are also pleased to provide you with the following additional details to help you understand your loan account better:</p>
  <p>My First PDC Date: <span class="bold">${firstDueDate}</span></p>
  <p>Repayment schedule enclosed which is part of the Sanction Letter.</p>
</div>

<!--Closing -->
<div class="text-right section">
  <p>Accept & Confirm by ME/US</p>
</div>

<div class="closing">
  <p>Yours Sincerely,</p>
  <p>For Aphelion Finance Pvt. Ltd.</p>
  <p class="signature">Authorized Signatory</p>
</div>

</body >
</html >
    `;

            const file = await RNHTMLtoPDF.convert({
                html: htmlContent,
                fileName: 'Sanction_Letter',
                directory: 'Documents',
                base64: true,
            });

            setFilePathSanction(file.filePath);
            setBase64DataSanction(file.base64);
            Alert.alert('Success', `PDF generated at ${file.filePath} `);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to generate PDF');
        }
    };





    const openAllFilesAccessSettings = () => {
        if (Platform.OS === 'android' && Platform.Version >= 30) {
            try {
                IntentLauncher.startActivity({
                    action: IntentConstant.MANAGE_ALL_FILES_ACCESS_PERMISSION,
                });
            } catch (error) {
                console.error("Error opening All Files Access settings:", error);
            }
        } else {

        }
    };

    const requestAndroidPermissions = async () => {
        if (Platform.OS !== 'android') return true; // iOS doesn't need permissions

        try {
            if (Platform.Version >= 30) {
                // Check if "All Files Access" is already granted
                const hasManageFilesAccess = await RNFetchBlob.fs.exists(RNFetchBlob.fs.dirs.DownloadDir);

                if (!hasManageFilesAccess) {
                    Alert.alert(
                        "Permission Required",
                        "To open files, please grant 'All Files Access' in Settings.",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Open Settings", onPress: openAllFilesAccessSettings }
                        ]
                    );
                    return false;
                }
                return true;
            } else {
                // For Android 10 & below, request normal storage permissions
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);
                return (
                    granted["android.permission.WRITE_EXTERNAL_STORAGE"] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted["android.permission.READ_EXTERNAL_STORAGE"] === PermissionsAndroid.RESULTS.GRANTED
                );
            }
        } catch (err) {
            console.warn("Permission error:", err);
            return false;
        }
    };

    const openFileCAM = async () => {
        if (!base64Data || !filePath) {
            Alert.alert("No file available to preview");
            return;
        }

        try {
            const hasPermission = await requestAndroidPermissions();
            if (!hasPermission) return;

            // Use the path from PDF generation directly
            const path = filePath;

            // Make sure file exists (optional check)
            const exists = await RNFetchBlob.fs.exists(path);
            if (!exists) {
                Alert.alert("File not found", "The PDF file could not be located.");
                return;
            }

            const mimeType = "application/pdf";
            await RNFetchBlob.android.actionViewIntent(path, mimeType);

        } catch (error) {
            console.error("Error opening file:", error);
            Alert.alert("Failed to open file", "Something went wrong.");
        }
    };

    const openFileSanction = async () => {
        if (!base64DataSanction || !filePathSanction) {
            Alert.alert("No file available to preview");
            return;
        }

        try {
            // Use app-specific storage path
            const path = Platform.OS === 'android'
                ? `${RNFetchBlob.fs.dirs.DocumentDir}/Sanction_Letter.pdf`
                : `${RNFetchBlob.fs.dirs.DocumentDir}/Sanction_Letter.pdf`;

            // Write base64 PDF to file
            await RNFetchBlob.fs.writeFile(path, base64DataSanction, 'base64');

            // Open the PDF
            const mimeType = "application/pdf";
            await RNFetchBlob.android.actionViewIntent(path, mimeType);

        } catch (error) {
            console.error("Error opening file:", error);
            Alert.alert("Failed to open file", "Something went wrong.");
        }
    };

    const parseDDMMYYYY = (dateStr) => {
        if (!dateStr) return null;
        const [day, month, year] = dateStr.split('/');
        const parsedDate = new Date(`${year}-${month}-${day}`); // ISO format
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    };

    // Usage
    const createdDateObj = parseDDMMYYYY(applicationByid?.createdDate);
    const createdDateFormatted = createdDateObj
        ? format(createdDateObj, 'dd-MM-yyyy')

        : 'N/A';


    // const handleExportToExcel = async () => {
    //     try {
    //         if (!amortContent || amortContent.length === 0) {
    //             Alert.alert("No Data", "There is no amortization data to export.");
    //             return;
    //         }

    //         // 🧠 Format date from array [YYYY, MM, DD]
    //         const formatDate = (arr) => {
    //             if (!Array.isArray(arr) || arr.length < 3) return '';
    //             const [y, m, d] = arr;
    //             return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
    //         };

    //         // ✅ Prepare export data
    //         const dataToExport = amortContent.map((item, index) => ({
    //             '#': index + 1,
    //             'Application No': item.applicationNumber || '',
    //             'Due Date': formatDate(item.dueDate),
    //             'EMI': item.emi ?? '',
    //             'Interest': item.interest ?? '',
    //             'Principal': item.principal ?? '',
    //             'Opening Balance': item.openingBalance ?? '',
    //             'Closing Balance': item.closingBalance ?? '',
    //             'Disbursement Amount': item.disbursementAmount ?? '',
    //             'Rate of Interest (%)': item.rateOfInterest ?? '',
    //             'Required Days': item.requiredDays ?? '',
    //             'Specifier': item.specifier ?? '',
    //             'Tenor': item.tenor ?? '',
    //             'Total Tenor': item.totalTenor ?? '',
    //         }));

    //         // ✅ Create workbook and sheet
    //         const ws = XLSX.utils.json_to_sheet(dataToExport);
    //         const wb = XLSX.utils.book_new();
    //         XLSX.utils.book_append_sheet(wb, ws, 'Amortization');

    //         // Auto-adjust column widths
    //         ws['!cols'] = Object.keys(dataToExport[0]).map((k) => ({ wch: Math.max(k.length, 15) }));

    //         // Write workbook
    //         const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });

    //         // Binary conversion helper
    //         const s2ab = (s) => {
    //             const buf = new ArrayBuffer(s.length);
    //             const view = new Uint8Array(buf);
    //             for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
    //             return buf;
    //         };

    //         // ✅ Construct applicant name for file
    //         const displayName =
    //             aaplicantName?.individualApplicant
    //                 ? `${aaplicantName?.individualApplicant?.firstName || ''} ${aaplicantName?.individualApplicant?.lastName || ''}`.trim()
    //                 : aaplicantName?.organizationApplicant?.organizationName || 'N/A';

    //         // 🧹 Sanitize name for file system
    //         const safeName = displayName.replace(/[<>:"/\\|?*]+/g, '_').replace(/\s+/g, '_') || 'Applicant';

    //         // ✅ Final file path
    //         const filePath = `${RNFS.DownloadDirectoryPath}/Amortization_${safeName}.xlsx`;



    //         // ✅ Save file
    //         await RNFS.writeFile(filePath, wbout, 'ascii');
    //         
    //         try {
    //             const downloadsPath = `${RNFS.DownloadDirectoryPath}/Amortization_${safeName}.xlsx`;
    //             await RNFS.copyFile(filePath, downloadsPath);
    //             
    //         } catch (err) {
    //             console.warn('⚠️ Could not copy to Downloads (scoped storage restrictions)', err);
    //         }
    //         Alert.alert("✅ Success", `Excel exported as ${safeName}.xlsx`);

    //         // ✅ Open the file automatically
    //         await FileViewer.open(filePath);
    //     } catch (error) {
    //         console.error("❌ Error exporting Excel:", error);
    //         Alert.alert("Error", "Failed to export Excel file.");
    //     }
    // };
    const sanitize = (v) =>
        v === null || v === undefined
            ? "-"
            : typeof v === "object"
                ? Object.values(v).join(", ")
                : String(v);

    // const renderTableHeader = (headers) => (
    //     <View style={styles.tableHeader}>
    //         {headers.map((h, i) => (
    //             <Text key={i} style={[styles.tableCell, styles.tableHeaderText]}>
    //                 {h}
    //             </Text>
    //         ))}
    //     </View>
    // );

    // const renderTableRow = (row, i) => (
    //     <View
    //         key={i}
    //         style={[styles.tableRow, { backgroundColor: i % 2 ? "#F9FAFB" : "#FFF" }]}
    //     >
    //         {row.map((cell, j) => (
    //             <Text key={j} style={styles.tableCell}>
    //                 {sanitize(cell)}
    //             </Text>
    //         ))}
    //     </View>
    // );

    // 🧮 Compute totals and values using useMemo (for optimization)
    const totalDisbursed = useMemo(
        () =>
            (updateDisbursementDtolist || []).reduce(
                (sum, d) => sum + (d?.actualAmountDisbursed || 0),
                0
            ),
        [updateDisbursementDtolist]
    );

    const chargeValues = useMemo(() => {
        const safeNum = (v) => Number(v || 0);

        const processingFee = safeNum(processingFeeDetails?.totalFee) - safeNum(processingFeeDetails?.taxAmt);
        const gstServ = safeNum(processingFeeDetails?.taxAmt);
        const insCharge = safeNum(insuranceDetails?.[0]?.insurancePremiumAmount);
        const gstInsCharge = safeNum(insuranceDetails?.[0]?.insurancePremiumTaxAmount);
        const stampDuty = safeNum(stampDutyFeeDetails?.totalFee);
        const nachMandate = safeNum(nach?.totalFee) - safeNum(nach?.taxAmt);
        const gstNach = safeNum(nach?.taxAmt);

        const deductionsDueTo =
            processingFee +
            gstServ +
            insCharge +
            gstInsCharge +
            stampDuty +
            nachMandate +
            gstNach;

        const fmt = (v) => `₹ ${safeNum(v).toLocaleString("en-IN")}`;

        return [
            ["Processing Charge", fmt(processingFee)],
            ["GST on Processing Charge", fmt(gstServ)],
            ["Insurance Charge", fmt(insCharge)],
            ["GST on Insurance Charge", fmt(gstInsCharge)],
            ["Stamp Duty Charge", fmt(stampDuty)],
            ["Nach Mandate", fmt(nachMandate)],
            ["GST on Nach Mandate", fmt(gstNach)],
            ["Deductions Due To", fmt(deductionsDueTo)],
        ];
    }, [processingFeeDetails, stampDutyFeeDetails, nach, insuranceDetails]);


    const paymentRows = useMemo(
        () =>
            (updateDisbursementDtolist || []).map((row, i) => {
                const dateArr = row?.utrNumberDate || row?.disbursementDate;
                const formattedDate = Array.isArray(dateArr)
                    ? new Date(dateArr[0], dateArr[1] - 1, dateArr[2])
                        .toLocaleDateString("en-GB")
                        .replace(/\//g, "-")
                    : "N/A";

                return {
                    srNo: i + 1,
                    amount: `₹ ${Number(row?.actualAmountDisbursed || 0).toLocaleString(
                        "en-IN"
                    )}`,
                    date: formattedDate,
                    utr: row?.utrNumber || "N/A",
                };
            }),
        [updateDisbursementDtolist]
    );

    // 🧩 Helper: Table Renderer
    const renderTableHeader = (headers) => (
        <View style={styles.tableHeader}>
            {headers.map((h, i) => (
                <Text key={i} style={[styles.tableCell, styles.tableHeaderText]}>
                    {h}
                </Text>
            ))}
        </View>
    );

    const renderTableRow = (values, i) => (
        <View
            key={i}
            style={[
                styles.tableRow,
                { backgroundColor: i % 2 === 0 ? "#FFF" : "#F9FAFB" },
            ]}
        >
            {values.map((val, idx) => (
                <Text key={idx} style={styles.tableCell}>
                    {val || "N/A"}
                </Text>
            ))}
        </View>
    );

    // 🧾 Format helper
    const fmt = (val) =>
        val ? `₹ ${Number(val).toLocaleString("en-IN")}` : "₹ 0";

    // 🧩 Loan Details Data
    const loanRows = [
        ["Loan Scheme", schemeId || "N/A"],
        ["Loan", fmt(sanctionAmount)],
        ["ROI", tempSanctionROI ? `${tempSanctionROI}%` : "N/A"],
        ["Tenure", tempSanctionTenure ? `${tempSanctionTenure} Months` : "N/A"],
        ["Advance EMI", item?.advanceEmi || "-"],
        ["Net Disbursed Amt", fmt(totalDisbursed)],
        [
            "EMI",
            EMI ? `₹ ${Number(EMI).toLocaleString()} x ${tempSanctionTenure} Months` : "N/A",
        ],
        ["Remark", "-"],
        ["IRR", irr ? `${irr}%` : "N/A"],
    ];



    const handleExportToExcel = async () => {
        try {
            if (!amortContent || amortContent.length === 0) {
                Alert.alert("No Data", "There is no amortization data to export.");
                return;
            }

            // 🧠 Format date [YYYY, MM, DD]
            const formatDate = (arr) => {
                if (!Array.isArray(arr) || arr.length < 3) return '';
                const [y, m, d] = arr;
                return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
            };

            // ✅ Prepare export data
            const dataToExport = amortContent.map((item, index) => ({
                // '#': index + 1,
                // 'Application No': item.applicationNumber || '',
                'Due Date': formatDate(item.dueDate),
                'EMI': item.emi ?? '',
                'Interest': item.interest ?? '',
                'Principal': item.principal ?? '',
                'Opening Balance': item.openingBalance ?? '',
                'Closing Balance': item.closingBalance ?? '',
                'Disbursement Amount': item.disbursementAmount ?? '',
                // 'Rate of Interest (%)': item.rateOfInterest ?? '',
                // 'Required Days': item.requiredDays ?? '',
                'Specifier': item.specifier ?? '',
                'Tenor': item.tenor ?? '',
                // 'Total Tenor': item.totalTenor ?? '',
            }));

            // ✅ Create workbook
            const ws = XLSX.utils.json_to_sheet(dataToExport);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, 'Amortization');

            // 🧩 Auto column width
            ws['!cols'] = Object.keys(dataToExport[0]).map((key) => ({
                wch: Math.max(key.length + 2, 15),
            }));

            // ✅ Apply center alignment to all cells
            Object.keys(ws)
                .filter((cell) => cell[0] !== '!') // skip metadata
                .forEach((cell) => {
                    if (!ws[cell].s) ws[cell].s = {};
                    ws[cell].s.alignment = { horizontal: 'center', vertical: 'center' };
                });

            // 🧠 Header bold + center
            const headerRange = XLSX.utils.decode_range(ws['!ref']);
            for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
                const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
                if (ws[cellAddress]) {
                    ws[cellAddress].s = {
                        ...ws[cellAddress].s,
                        alignment: { horizontal: 'center', vertical: 'center' },
                        font: { bold: true },
                    };
                }
            }

            // Convert workbook to binary
            const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
            const s2ab = (s) => {
                const buf = new ArrayBuffer(s.length);
                const view = new Uint8Array(buf);
                for (let i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xff;
                return buf;
            };

            // ✅ Construct applicant name
            const displayName =
                aaplicantName?.individualApplicant
                    ? `${aaplicantName?.individualApplicant?.firstName || ''} ${aaplicantName?.individualApplicant?.middleName || ''} ${aaplicantName?.individualApplicant?.lastName || ''}`.trim()
                    : aaplicantName?.organizationApplicant?.organizationName || 'N/A';

            const safeName = displayName.replace(/[<>:"/\\|?*]+/g, '_').replace(/\s+/g, '_') || 'Applicant';

            // ✅ Choose safe storage path (works without special permission)
            const filePath = `${RNFS.DocumentDirectoryPath}/Amortization_${safeName}.xlsx`;

            // ✅ Ask permissions (Android 13+ or lower)


            // ✅ Write Excel file
            await RNFS.writeFile(filePath, wbout, 'ascii');


            // ✅ Optional: Copy to Downloads (if allowed)
            try {
                const downloadsPath = `${RNFS.DownloadDirectoryPath}/Amortization_${safeName}.xlsx`;
                await RNFS.copyFile(filePath, downloadsPath);

            } catch (err) {
                console.warn('⚠️ Could not copy to Downloads (Scoped Storage restriction)', err);
            }

            Alert.alert("✅ Success", `Excel exported as ${safeName}.xlsx`);
            await FileViewer.open(filePath);

        } catch (error) {
            console.error("❌ Error exporting Excel:", error);
            Alert.alert("Error", "Failed to export Excel file.");
        }
    };

    // 🧠 Helper: safely format address
    const formatAddress = (addressArray) => {
        if (!Array.isArray(addressArray)) return "N/A";

        // Prefer Permanent > Current > Office
        const permanent = addressArray.find(
            (a) => a.addressType?.toLowerCase() === "permanent"
        );

        const RegisteredAddress = addressArray.find(
            (a) => a.addressType === "Registered Address"
        );
        // const current = addressArray.find(
        //     (a) => a.addressType?.toLowerCase() === "current"
        // );
        // const office = addressArray.find(
        //     (a) => a.addressType?.toLowerCase() === "office"
        // );

        // const selected = permanent || current || office;
        const selected = permanent || RegisteredAddress

        if (!selected) return "N/A";

        return [
            selected.addressLine1,
            selected.addressLine2,
            selected.addressLine3,
            selected.pincode?.areaName,
            selected.pincode?.City?.cityName,
            selected.pincode?.City?.state?.stateName,
            selected.pincode?.pincode,
        ]
            .filter(Boolean)
            .join(", ");
    };

    // 🧠 Helper: safely extract name + email + phone + income
    const extractApplicantDetails = (item) => {

        const name = item?.individualApplicant
            ? `${item.individualApplicant.firstName || ""} ${item.individualApplicant.middleName || ""} ${item.individualApplicant.lastName || ""}`.trim()
            : item?.organizationApplicant?.organizationName || "N/A";

        const address = formatAddress(item.address);
        const email =
            item?.individualApplicant?.email ||
            item?.organizationApplicant?.email ||
            "N/A";

        const phone =
            item?.address?.find((a) => a.phoneNumber)?.phoneNumber || "N/A";

        const income =
            item?.individualApplicant?.individualIncomeDetails?.[0]?.basicSalary ||
            item?.organizationApplicant?.organizationIncomeDetails?.[0]?.grossRevenue ||
            0;

        const org =
            item?.organizationApplicant?.organizationName ||
            item?.individualApplicant?.occupation ||
            "N/A";

        return {
            name,
            address,
            email,
            phone,
            org,
            income,
        };
    };

    // 🧩 Build formatted arrays for tables
    const applicantData = (applicantTypes || []).map(extractApplicantDetails);
    const coApplicantData = (CoapplicantTypes || []).map(extractApplicantDetails);
    const guarantorData = (Guarantor || []).map(extractApplicantDetails);

    const schemeId = selectedDropdownScheme?.label
        ? selectedDropdownScheme?.label
        : selectedSchemePerApplication?.label;

    const currencyFormatter = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
    });

    const intFormatter = new Intl.NumberFormat("en-IN");

    // helper: safe value
    const safe = (v) =>
        v !== undefined && v !== null && v !== "" ? v : "N/A";

    const safeNum = (v) => {
        const n = Number(v);
        return Number.isFinite(n) ? n : 0;
    };

    // helper: date normalization -> returns dd-mm-yyyy or "N/A"
    const fmtDate = (d) => {
        if (!d) return "N/A";
        // if it's ISO string "yyyy-mm-dd..." or "yyyy-mm-dd"
        if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}/.test(d)) {
            const [y, m, dayRest] = d.split("-");
            const day = dayRest?.slice(0, 2) ?? "01";
            return `${day}-${m}-${y}`;
        }
        // if it's a Date object
        if (d instanceof Date && !isNaN(d)) {
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            return `${dd}-${mm}-${yyyy}`;
        }
        // array [year, month, day]
        if (Array.isArray(d) && d.length >= 3) {
            return `${String(d[2]).padStart(2, "0")}-${String(d[1]).padStart(2, "0")}-${d[0]}`;
        }
        return String(d);
    };

    // helper: format currency with ₹ and grouping
    const fmtCurrency = (v) => currencyFormatter.format(safeNum(v));
    const fmtCurrencyInt = (v) => `₹ ${intFormatter.format(safeNum(v))}`;

    // helper: escape values inserted into HTML
    const escapeHTML = (str) => {
        if (str === null || str === undefined) return "";
        return String(str)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    };


    const generatePDFCAM = async () => {
        try {
            // ---------------------------
            // LOGO HANDLING
            // ---------------------------
            const iosBase64Logo = "iVBORw0KGgoAAAANSUhEUgAA..."; // replace
            const logoSrc =
                Platform.OS === "android"
                    ? "file:///android_res/drawable/afieon.png"
                    : `data:image/png;base64,${iosBase64Logo}`;

            // ---------------------------
            // HELPERS (FORMATTERS)
            // ---------------------------
            const safe = (v) =>
                v !== undefined && v !== null && v !== "" ? v : "N/A";

            const fmt = (v) =>
                `₹ ${Number(v || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`;

            const fmtInt = (v) =>
                `₹ ${Number(v || 0).toLocaleString("en-IN")}`;

            const fmtDate = (d) => {
                if (!d) return "N/A";

                if (typeof d === "string" && d.includes("-")) {
                    const [y, m, day] = d.split("-");
                    return `${day}-${m}-${y}`;
                }

                if (Array.isArray(d)) {
                    return `${d[2]}-${String(d[1]).padStart(2, "0")}-${d[0]}`;
                }

                return safe(d);
            };



            // ---------------------------
            // LOAN DETAILS TABLE
            // ---------------------------
            const loanRows = [
                ["Loan Scheme", safe(schemeId)],
                ["Loan Amount", fmt(sanctionAmount)],
                ["ROI", tempSanctionROI ? `${tempSanctionROI}%` : "N/A"],
                ["Tenure", tempSanctionTenure ? `${tempSanctionTenure} Months` : "N/A"],
                ["Net Disbursed Amt", fmt(totalDisbursed)],
                ["EMI", EMI ? `${fmtInt(EMI)} x ${tempSanctionTenure} Months` : "N/A"],
                ["Advance EMI", safe(item?.advanceEmi)],
                ["Remark", "-"],
                ["IRR", irr ? `${irr}%` : "N/A"],
            ];

            const pfTotal = safeNum(processingFeeDetails?.totalFee);
            const pfTax = safeNum(processingFeeDetails?.taxAmt);
            const processingFee = pfTotal - pfTax;
            const gstOnProcessing = pfTax;

            const insuranceAmt = safeNum(insuranceDetails?.[0]?.insurancePremiumAmount);
            const gstOnInsurance = safeNum(
                insuranceDetails?.[0]?.insurancePremiumTaxAmount
            );

            const stampDuty = safeNum(stampDutyFeeDetails?.totalFee);

            const nachTotal = safeNum(nach?.totalFee);
            const nachTax = safeNum(nach?.taxAmt);
            const nachMandate = nachTotal - nachTax;
            const gstOnNach = nachTax;

            const deductionsDueTo =
                processingFee +
                gstOnProcessing +
                insuranceAmt +
                gstOnInsurance +
                stampDuty +
                nachMandate +
                gstOnNach;

            // rows as label + numeric value (format later once)
            const chargeRows = [
                ["Processing Charge", processingFee],
                ["GST on Processing Charge", gstOnProcessing],
                ["Insurance Charge", insuranceAmt],
                ["GST on Insurance Charge", gstOnInsurance],
                ["Stamp Duty Charge", stampDuty],
                ["Nach Mandate", nachMandate],
                ["GST on Nach Mandate", gstOnNach],
                ["Deductions Due To", deductionsDueTo],
            ];

            // ---------------------------
            // PAYMENT TABLE
            // ---------------------------
            const paymentRowsHTML = paymentRows?.length
                ? paymentRows
                    .map(
                        (r, i) => `
            <tr style="background:${i % 2 ? "#f9fbff" : "#fff"};">
                <td>${safe(r.srNo)}</td>
                <td style="text-align:right;">${fmt(r.amount)}</td>
                <td>${fmtDate(r.date)}</td>
                <td>${safe(r.utr)}</td>
            </tr>`
                    )
                    .join("")
                : `<tr><td colspan="4" style="text-align:center;">No Payment Data</td></tr>`;

            // ---------------------------
            // APPLICANT / CO-APPLICANT TABLES
            // ---------------------------
            const renderApplicantTable = (title, data) => {
                if (!data?.length) return "";

                return `
        <div style="margin-top:10px;">
            <div style="
                background:#007AFF;
                color:white;
                text-align:center;
                font-weight:bold;
                padding:6px 0;
                border-radius:6px 6px 0 0;
            ">
                ${title}
            </div>

            <table style="width:100%; border-collapse:collapse; font-size:10px;">
                <thead>
                    <tr style="background:#e0e7ff;">
                        <th>Name</th>
                        <th>Address</th>
                        <th>Email Id</th>
                        <th>Phone No.</th>
                        <th>Off/Busi Org.</th>
                        <th>Income</th>
                    </tr>
                </thead>

                <tbody>
                    ${data
                        .map(
                            (r, i) => `
                        <tr style="background:${i % 2 ? "#f9fafb" : "#fff"};">
                            <td>${safe(r.name)}</td>
                            <td>${safe(r.address)}</td>
                            <td>${safe(r.email)}</td>
                            <td>${safe(r.phone)}</td>
                            <td>${safe(r.org)}</td>
                            <td style="text-align:right;">${fmt(r.income)}</td>
                        </tr>`
                        )
                        .join("")}
                </tbody>
            </table>
        </div>`;
            };

            // ---------------------------
            // META INFO BLOCK
            // ---------------------------
            const metaSection = `
        <div style="display:flex; justify-content:space-between; border:1px solid #ccc; border-radius:6px; padding:8px; margin-top:10px;">
            
            <div style="width:48%;">
                <div>Marketing Exec : 
                    <b>${safe(
                loginUser?.data?.firstName
                    ? `${loginUser?.data?.firstName} ${loginUser?.data?.lastName}`
                    : "N/A"
            )}</b>
                </div>

                <div>FCI Exec : <b>${safe(agentNames)}</b></div>

                <div>Dealer : <b>${safe(item?.sourceType)}</b></div>

                <div>Dealer Code : <b>${safe(applicationByid?.dealerCode)}</b></div>
            </div>

            <div style="width:48%; text-align:right;">
                <div>First PDC Date : <b>${fmtDate(firstDueDate)}</b></div>
                <div>Last PDC Date : <b>${fmtDate(lastDueate)}</b></div>
                <div>Loan Disbursement Date : <b>${fmtDate(paymentRows?.[0]?.date)}</b></div>
                <div>Dealer Incentive :
                    <b>${fmt(applicationByid?.dealerIncentive)}</b>
                </div>
            </div>
        </div>
        `;

            // ---------------------------
            // HEADER SECTION
            // ---------------------------
            const headerSection = `
        <div style="width:100%; margin-bottom:10px;">
            <div style="display:flex; align-items:center; justify-content:space-between;">
                
                <img src="${logoSrc}" style="width:100px; height:50px;" />

                <div style="font-size:10px; text-align:right; line-height:1.4;">
                    <div>505, 5th Floor, Ecstasy Business Park</div>
                    <div>JSD Road, Ashok Nagar, Mulund West, Mumbai 400080</div>
                    <div>Email: customercare@aphelionfinance.com</div>
                    <div>Phone: 9321193211</div>
                </div>
            </div>

            <div style="border-bottom:1px solid #000; margin:6px 0;"></div>

            <div style="text-align:center;">
                <div style="font-weight:bold;color:#0D82FF; font-size:14px;">Aphelion Finance Pvt. Ltd.</div>
                <div style="font-size:12px;color:#0D82FF;">CSR Report</div>
            </div>
        </div>
        `;

            // ---------------------------
            // FINAL HTML PAYLOAD
            // ---------------------------
            const html = `
        <html>
        <head>
            <meta charset="UTF-8" />
            <style>
                body { font-family: Arial; font-size: 10px; margin: 10px; color: #000; }
                .info-header { display:flex; justify-content:space-between; padding:6px 0; font-size:10px; }
                .card-container { display:flex; justify-content:space-between; margin-top:12px; }
                .card { width:48%; border:1px solid #ddd; border-radius:8px; padding:8px; background:#fff; }
                .card-header { background:#007AFF; color:#fff; text-align:center; font-weight:bold; padding:5px; border-radius:4px; margin-bottom:6px; }
                .row { display:flex; justify-content:space-between; margin-bottom:4px; }
                table { width:100%; border-collapse:collapse; font-size:9.5px; margin-top:10px; }
                th, td { border:1px solid #ccc; padding:4px; text-align:center; }
                th { background:#007AFF; color:white; }
            </style>
        </head>

        <body>

            ${headerSection}

            <!-- Login Section -->
            <div class="info-header">
                <div><b>Login No:</b> ${safe(item?.applicationNo)}</div>
                <div><b>Applicant:</b> ${aaplicantName?.individualApplicant
                    ? `${safe(aaplicantName.individualApplicant.firstName)} ${safe(aaplicantName.individualApplicant.lastName)}`
                    : safe(aaplicantName?.organizationApplicant?.organizationName)
                }</div>
                <div><b>Case No:</b>${lan}</div>
            </div>

            ${metaSection}

            <!-- Loan + Charge Cards -->
            <div class="card-container">

                <div class="card">
                    <div class="card-header">LOAN DETAILS</div>
                    ${loanRows
                    .map(
                        ([label, value]) => `
                        <div class="row">
                            <span>${label}</span>
                            <span>${value}</span>
                        </div>`
                    )
                    .join("")}
                </div>

                <div class="card">
                    <div class="card-header">CHARGE DETAILS</div>
                    ${chargeRows
                    .map(
                        ([label, value]) => `
                        <div class="row">
                            <span>${label}</span>
                            <span>${value}</span>
                        </div>`
                    )
                    .join("")}
                </div>

            </div>

            <!-- Payment Table -->
            <div style="margin-top:14px;">
                <table>
                    <thead>
                        <tr>
                            <th>Sr. No.</th>
                            <th>Amount (₹)</th>
                            <th>Date</th>
                            <th>Cheque / RTGS No.</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${paymentRowsHTML}
                    </tbody>
                </table>
            </div>

            <!-- Applicant Tables -->
            ${renderApplicantTable("APPLICANT DETAILS", applicantData)}
            ${renderApplicantTable("CO-APPLICANT DETAILS", coApplicantData)}
            ${renderApplicantTable("GUARANTOR DETAILS", guarantorData)}

        </body>
        </html>`;

            // ---------------------------
            // GENERATE PDF
            // ---------------------------
            const file = await RNHTMLtoPDF.convert({
                html,
                fileName: `CSR_Report_${item?.applicationNo || "Report"}`,
                directory: "Documents",
                base64: true,
            });

            setFilePath(file.filePath);
            setBase64Data(file.base64);
            Alert.alert("✅ PDF Generated", `Saved to: ${file.filePath}`);

        } catch (err) {
            console.error("PDF generation failed:", err);
            Alert.alert("Error", "Failed to generate PDF");
        }
    };

    const headerChips = [
        {
            label: "Name",
            value: aaplicantName?.individualApplicant
                ? `${aaplicantName.individualApplicant.firstName || ""} ${aaplicantName.individualApplicant.middleName || ""
                    } ${aaplicantName.individualApplicant.lastName || ""}`.trim()
                : aaplicantName?.organizationApplicant?.organizationName || "N/A",
        },
        {
            label: "Loan Amount",
            value: item?.loanAmount
                ? `₹ ${formatNumberWithCommas(item.loanAmount.toString())}`
                : "₹ 0",
        },
        { label: "Source Branch", value: item?.branchName || "—" },
        {
            label: "Category",
            value: item?.applicant?.[0]?.applicantCategoryCode || "—",
        },
        { label: "Source Type", value: item?.sourceType || "—" },
        {
            label: "Date Created",
            value: applicationByid?.createdDate?.replace(/\//g, "-") || "—",
        },
        { label: "Stage", value: item?.stage || "—" },
    ];

    const decisionOverview = [
        { label: "Application No", value: item?.applicationNo || "N/A" },
        {
            label: "Applicant",
            value: aaplicantName?.individualApplicant
                ? `${aaplicantName.individualApplicant.firstName || ""} ${aaplicantName.individualApplicant.lastName || ""}`.trim()
                : aaplicantName?.organizationApplicant?.organizationName || "N/A",
        },
        { label: "Stage", value: item?.stage || "N/A" },
        { label: "Source Branch", value: item?.branchName || "—" },
        {
            label: "Category",
            value: item?.applicant?.[0]?.applicantCategoryCode || "—",
        },
        {
            label: "Loan Amount",
            value: item?.loanAmount
                ? `â‚¹ ${formatNumberWithCommas(item.loanAmount.toString())}`
                : "â‚¹ 0",
        },
    ];

    const decisionStatusText = item?.status || item?.stage || 'Pending';
    const decisionApplicantName = aaplicantName?.individualApplicant
        ? `${aaplicantName.individualApplicant.firstName || ""} ${aaplicantName.individualApplicant.lastName || ""}`.trim()
        : aaplicantName?.organizationApplicant?.organizationName || "N/A";
    const decisionCreatedDate = applicationByid?.createdDate?.replace(/\//g, "-") || "N/A";
    const decisionSourceType = item?.sourceType || "N/A";
    const decisionStageTone = decisionStatusText.toLowerCase().includes('approve')
        || decisionStatusText.toLowerCase().includes('sanction')
        || decisionStatusText.toLowerCase().includes('disbursed')
        ? styles.decisionStagePillSuccess
        : decisionStatusText.toLowerCase().includes('reject')
            ? styles.decisionStagePillDanger
            : styles.decisionStagePillNeutral;
    const decisionOverviewDisplay = decisionOverview.map(detail => {
        if (detail.label === 'Applicant') {
            return { ...detail, value: decisionApplicantName };
        }

        if (detail.label === 'Loan Amount') {
            return {
                ...detail,
                value: item?.loanAmount
                    ? `Rs ${formatNumberWithCommas(item.loanAmount.toString())}`
                    : 'Rs 0',
            };
        }

        return detail;
    });

    return (
        <SafeAreaView style={styles.container}>
            {/* 🔹 Top Button Row */}
            <View style={styles.buttonRow}>
                <PrimaryButton title="CSR Report" onPress={fetchCamReport} />

                {Disbursed?.length > 0 && (
                    <PrimaryButton title="Sanction Letter" onPress={fetchSanctioneport} />
                )}

                <PrimaryButton
                    title="Document Report"
                    onPress={() =>
                        navigation.navigate("Document Store", {
                            applicationNo: item?.applicationNo,
                        })
                    }
                />
            </View>
            <ScrollView style={styles.scrollContainer}>


                {/* 🔹 CSR Report Modal */}
                {camReportVisible && (
                    <Modal
                        visible={camReportVisible}
                        onRequestClose={() => setCamReportVisible(false)}
                    >
                        <SafeAreaView style={styles.modalSafeArea}>
                            <ScrollView
                                style={styles.scrollContainer}
                                contentContainerStyle={{
                                    paddingBottom: insets.bottom + 80, // dynamically adjusts for  height + safe area
                                }}
                            >
                                {/* Action Buttons */}
                                <TouchableOpacity
                                    onPress={generatePDFCAM}
                                    style={[styles.actionButton, { backgroundColor: "#007bff" }]}
                                >
                                    <Text style={styles.actionButtonText}>📄 Generate PDF</Text>
                                </TouchableOpacity>

                                {filePath && (
                                    <TouchableOpacity
                                        onPress={openFileCAM}
                                        style={[styles.actionButton, { backgroundColor: "#28a745" }]}
                                    >
                                        <Text style={styles.actionButtonText}>📂 Open PDF</Text>
                                    </TouchableOpacity>
                                )}

                                <View style={styles.headerCAM}>
                                    <Image
                                        source={require('../../asset/afieon.png')}
                                        style={styles.logo}
                                        resizeMode="contain"
                                    />
                                    <View style={styles.addressBlock}>
                                        <Text style={styles.companyTextCAM}>505, 5th Floor, Ecstasy Business Park,</Text>
                                        <Text style={styles.companyTextCAM}>JSD Road, Next to City Of Joy, Ashok Nagar,</Text>
                                        <Text style={styles.companyTextCAM}>Mulund West, Mumbai, Maharashtra 400080.</Text>
                                        <Text style={styles.companyTextCAM}>Email: customercare@aphelionfinance.com</Text>
                                        <Text style={styles.companyTextCAM}>Phone: 9321193211 / 022-256562</Text>
                                    </View>

                                </View>

                                {/* Header */}
                                <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
                                    {/* 🔹 HEADER */}
                                    <View style={styles.header}>
                                        <Text style={styles.company}>Aphelion Finance Pvt. Ltd.</Text>
                                        <Text style={styles.contact}>
                                            Contact No.: +91 93211 93211 | Email ID: info@aphelion.in
                                        </Text>
                                        <Text style={styles.reportTitle}>CSR Report</Text>
                                    </View>

                                    {/* 🔹 LOGIN INFO */}
                                    <View style={styles.loginInfo}>
                                        <View style={styles.infoGroup}>
                                            <Text style={styles.bold}>Login No: </Text>
                                            <Text style={styles.infoText}>{item?.applicationNo}</Text>
                                        </View>

                                        <View style={styles.infoGroup}>
                                            <Text style={styles.bold}>Applicant: </Text>
                                            <Text style={styles.infoText}>
                                                {aaplicantName?.individualApplicant
                                                    ? `${aaplicantName?.individualApplicant?.firstName || ""} ${aaplicantName?.individualApplicant?.middleName || ""} ${aaplicantName?.individualApplicant?.lastName || ""}`.trim()
                                                    : aaplicantName?.organizationApplicant?.organizationName || "N/A"}
                                            </Text>
                                        </View>

                                        <View style={styles.infoGroup}>
                                            <Text style={styles.bold}>Case No: </Text>
                                            <Text style={styles.infoText}>{lan}</Text>
                                        </View>
                                    </View>


                                    {/* 🔹 MARKETING & DEALER INFO SECTION */}
                                    <View style={styles.metaSection}>
                                        {/* Left Column */}
                                        <View style={styles.metaColumn}>
                                            <View style={styles.metaRow}>
                                                <Text style={styles.metaLabel}>Marketing Exec :</Text>
                                                <Text style={styles.metaValue}>
                                                    {loginUser?.data?.firstName
                                                        ? `${loginUser?.data?.firstName} ${loginUser?.data?.lastName || ""}`.trim()
                                                        : "N/A"}
                                                </Text>

                                            </View>

                                            <View style={styles.metaRow}>
                                                <Text style={styles.metaLabel}>FCI Exec :</Text>
                                                <Text style={styles.metaValue}>
                                                    {agentNames || "N/A"}
                                                </Text>
                                            </View>

                                            <View style={styles.metaRow}>
                                                <Text style={styles.metaLabel}>Dealer :</Text>
                                                <Text style={styles.metaValue}>
                                                    {item?.sourceType || "N/A"}
                                                </Text>
                                            </View>

                                            <View style={styles.metaRow}>
                                                <Text style={styles.metaLabel}>Dealer Code :</Text>
                                                <Text style={styles.metaValue}>
                                                    {applicationByid?.dealerCode || "N/A"}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Right Column */}
                                        <View style={styles.metaColumn}>
                                            <View style={styles.metaRow}>
                                                <Text style={styles.metaLabel}>First PDC Date :</Text>
                                                <Text style={styles.metaValue}>
                                                    {firstDueDate || "N/A"}
                                                </Text>
                                            </View>

                                            <View style={styles.metaRow}>
                                                <Text style={styles.metaLabel}>Last PDC Date :</Text>
                                                <Text style={styles.metaValue}>
                                                    {lastDueate || "N/A"}
                                                </Text>
                                            </View>

                                            <View style={styles.metaRow}>
                                                <Text style={styles.metaLabel}>Loan Disbursement Date :</Text>
                                                <Text style={styles.metaValue}>
                                                    {(() => {
                                                        if (!paymentRows || paymentRows.length === 0) return "N/A";

                                                        // Get first (earliest) payment date
                                                        const firstDate = paymentRows[0]?.date;

                                                        // Optional: ensure format "DD-MM-YYYY"
                                                        if (!firstDate || firstDate === "N/A") return "N/A";
                                                        return firstDate;
                                                    })()}
                                                </Text>
                                            </View>


                                            <View style={styles.metaRow}>
                                                <Text style={styles.metaLabel}>Dealer Incentive :</Text>
                                                <Text style={styles.metaValue}>
                                                    {applicationByid?.dealerIncentive
                                                        ? `₹ ${Number(applicationByid?.dealerIncentive).toLocaleString("en-IN")}`
                                                        : "0"}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>


                                    {/* 🔹 2 COLUMN LOAN + CHARGE */}
                                    <View style={styles.dualContainer}>
                                        {/* 🔹 Loan Details */}
                                        <View style={styles.card}>
                                            <Text style={styles.cardHeader}>LOAN DETAILS</Text>

                                            {/* 🔹 Loan Overview */}
                                            {[
                                                ["Loan Scheme", schemeId || "N/A"],
                                                ["Loan Amount", fmt(sanctionAmount)],
                                                ["ROI", tempSanctionROI ? `${tempSanctionROI}%` : "N/A"],
                                                ["Tenure", tempSanctionTenure ? `${tempSanctionTenure} Months` : "N/A"],
                                            ].map(([label, value], i) => (
                                                <View key={`group1-${i}`} style={styles.infoRow}>
                                                    <Text style={styles.infoLabel}>{label} :</Text>
                                                    <Text style={styles.infoValue}>{value}</Text>
                                                </View>
                                            ))}

                                            {[
                                                ["Net Disbursed Amt", fmt(totalDisbursed)],
                                                [
                                                    "EMI",
                                                    EMI
                                                        ? `₹ ${Number(EMI).toLocaleString()} x ${tempSanctionTenure} Months`
                                                        : "N/A",
                                                ],
                                            ].map(([label, value], i) => (
                                                <View key={`group2-${i}`} style={styles.infoRow}>
                                                    <Text style={styles.infoLabel}>{label} :</Text>
                                                    <Text style={styles.infoValue}>{value}</Text>
                                                </View>
                                            ))}

                                            {[
                                                ["Advance EMI", item?.advanceEmi || "-"],
                                                ["Remark", "-"],
                                                ["IRR", irr ? `${irr}%` : "N/A"],
                                            ].map(([label, value], i) => (
                                                <View key={`group3-${i}`} style={styles.infoRow}>
                                                    <Text style={styles.infoLabel}>{label} :</Text>
                                                    <Text style={styles.infoValue}>{value}</Text>
                                                </View>
                                            ))}
                                        </View>


                                        {/* 🔹 Charge Details */}
                                        <View style={styles.card}>
                                            <Text style={styles.cardHeader}>CHARGE DETAILS</Text>
                                            {chargeValues.map(([label, value], i) => (
                                                <View key={i} style={styles.infoRow}>
                                                    <Text style={styles.infoLabel}>{label} :</Text>
                                                    <Text style={styles.infoValue}>{value}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>


                                    {/* 🔹 Payment Details Table */}
                                    {paymentRows.length > 0 && (
                                        <>
                                            <Text style={styles.sectionHeader}>PAYMENT DETAILS</Text>

                                            {paymentRows.map((row, i) => (
                                                <DetailCard
                                                    key={i}
                                                    data={{
                                                        "Sr. No": row.srNo,
                                                        "Amount (₹)": row.amount,
                                                        "Date": row.date,
                                                        "Cheque / RTGS No": row.utr,
                                                    }}
                                                />
                                            ))}
                                        </>
                                    )}

                                    {applicantData?.length > 0 && (
                                        <>
                                            <Text style={styles.sectionHeader}>APPLICANT DETAILS</Text>

                                            {applicantData.map((a, i) => (
                                                <DetailCard
                                                    key={i}
                                                    data={{
                                                        "Name": a.name,
                                                        "Address": a.address,
                                                        "Email Id": a.email,
                                                        "Phone No": a.phone,
                                                        "Off./Busi Org.": a.org,
                                                        "Income": a.income,
                                                    }}
                                                />
                                            ))}
                                        </>
                                    )}

                                    {coApplicantData?.length > 0 && (
                                        <>
                                            <Text style={styles.sectionHeader}>CO-APPLICANT DETAILS</Text>

                                            {coApplicantData.map((a, i) => (
                                                <DetailCard
                                                    key={i}
                                                    data={{
                                                        "Name": a.name,
                                                        "Address": a.address,
                                                        "Email Id": a.email,
                                                        "Phone No": a.phone,
                                                        "Off./Busi Org.": a.org,
                                                        "Income": a.income,
                                                    }}
                                                />
                                            ))}
                                        </>
                                    )}

                                    {guarantorData?.length > 0 && (
                                        <>
                                            <Text style={styles.sectionHeader}>GUARANTOR DETAILS</Text>

                                            {guarantorData.map((a, i) => (
                                                <DetailCard
                                                    key={i}
                                                    data={{
                                                        "Name": a.name,
                                                        "Address": a.address,
                                                        "Email Id": a.email,
                                                        "Phone No": a.phone,
                                                        "Off./Busi Org.": a.org,
                                                        "Income": a.income,
                                                    }}
                                                />
                                            ))}
                                        </>
                                    )}

                                </ScrollView>
                                {/* Close Button */}

                            </ScrollView>

                            <View style={styles.fixedBottomButtonContainer}>
                                <TouchableOpacity
                                    onPress={() => setCamReportVisible(false)}
                                    style={styles.closeButton}
                                >
                                    <Text style={styles.closeButtonText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </SafeAreaView>
                    </Modal>
                )}

                {/* 🔹 Sanction Report Modal */}

                <SanctionReportModal
                    visible={SanctionReportVisible}
                    onClose={() => setSanctionReportVisible(false)}
                    decisionData={decisionData}
                    aaplicantName={aaplicantName}
                    formattedAddress={formattedAddress}
                    textColor="#222"
                    getOwnContribution={getOwnContribution}
                    tempSanctionROI={tempSanctionROI}
                    SanctionLetterByApplicationNo={SanctionLetterByApplicationNo}  // ✔ Correct
                    totalInsurance={totalInsurance}
                    generateSanctionLetterHTML={generateSanctionLetterHTML}
                    openFileSanction={openFileSanction}
                    filePathSanction={filePathSanction}
                    BusinessDate={BusinessDate}
                    firstDueDate={firstDueDate}
                // insuranceDetails={insuranceDetails}
                />


                {/* 🔹 Scrollable Main Content */}
                {/* <ScrollView style={styles.scrollContainer}> */}
                <View style={styles.innerContainer}>

                    <DetailHeader
                        title="Application Detail"
                        subTitle={item?.applicationNo || "—"}
                        status={item?.status || "Pending"}
                        chips={headerChips}
                        gradientColors={['#0B4D96', '#1E6FD9', '#78B9FF']}
                    />
                    {/* Product Row */}
                    <ProductRow
                        item={applicationData?.data}
                        schemedata={schemedata}
                        SchemeSelectAPI={SchemeSelectAPI}
                        sanctionAmount={sanctionAmount}
                        handleSanctionAmountChange={handleSanctionAmountChange}
                        irr={irr}
                        handleirr={handleirr}
                        handleSanctionROIChange={handleSanctionROIChange}
                        handleSanctionTenureChange={handleSanctionTenureChange}
                        handleCycleDayChange={handleCycleDayChange}
                        CycleDays={CycleDays}
                        SelectedCycleDays={selectedCyclePerApplication}
                        validateSanctionROI={validateSanctionROI}
                        validateSanctionTenure={validateSanctionTenure}
                        isDisabled={isDisabled}
                        handleAmortButtonPress={handleAmortButtonPress}
                        loading={loading}
                        amortdata={amortdata}
                        amortDetails={amortDetails}
                        error={error}
                        tempSanctionROI={tempSanctionROI}
                        tempSanctionTenure={tempSanctionTenure}
                        eligibility={eligibility}
                        mappedDropdownScheme={mappedDropdownScheme}
                        selecteddropdownScheme={selectedSchemePerApplication}
                        handleDropdownScheme={handleDropdownScheme}
                        handleCalculatePress={handleCalculatePress}
                        isLoading={isLoading}
                    />

                    {/* 🔹 Sanction Approval Section */}
                    <View style={styles.cardWrapper}>
                        <Text style={styles.sectionTitle}>Sanction Approval Details</Text>

                        {/* Row 1 */}
                        <View style={styles.row}>
                            <RenderTextField
                                label="FOIR"
                                value={`${Number(foirafleon ?? 0).toFixed(2)}%`}
                                isEditable={false}
                            />

                            <RenderDropdownField
                                label="Loan Approval"
                                data={options.loanApprovalOptions}
                                value={selectedOptions.selectedLoanApproval}
                                onChange={(item) =>
                                    handleOptionChange("selectedLoanApproval", item)
                                }
                                placeholder="Select Loan Approval"
                                isEditable
                                enableSearch
                            />
                        </View>

                        {/* Row 2 */}
                        <View style={styles.row}>
                            <RenderDropdownField
                                label="Send Back"
                                data={options.sendBackOptions}
                                value={selectedOptions.selectedSendBack}
                                onChange={(item) =>
                                    handleOptionChange("selectedSendBack", item)
                                }
                                placeholder="Select Send Back"
                                isEditable={
                                    !["Approved", "Recommendation", "Rejected"].includes(
                                        selectedOptions.selectedLoanApproval
                                    )
                                }
                                enableSearch
                            />

                            <RenderDropdownField
                                label="Reject Reason"
                                data={options.rejectReasonOptions}
                                value={selectedOptions.selectedRejectReason}
                                onChange={(item) =>
                                    handleOptionChange("selectedRejectReason", item)
                                }
                                placeholder="Select Reject Reason"
                                isEditable={
                                    !["Approved", "Recommendation", "Send Back"].includes(
                                        selectedOptions.selectedLoanApproval
                                    )
                                }
                                enableSearch
                            />
                        </View>

                        {/* Remarks */}
                        <RenderTextField
                            label="Remark"
                            value={sendBack}
                            onChange={setSendBack}
                            placeholder="Remark"
                            isEditable={
                                logDetails?.status === "Pending" &&
                                mkc?.designation === "Credit"
                            }
                            multiline
                        />

                        {DecisionApprove?.some(
                            (item) => item.user === userDetails?.userName
                        ) && (
                                <RenderTextField
                                    label="Approval Decision Remark"
                                    value={ApprovalRemark}
                                    onChange={setApprovalRemark}
                                    placeholder="Approval Decision Remark"
                                    isEditable={logDetails?.status === "Pending"}
                                    multiline
                                />
                            )}

                        {/* Buttons */}
                        {logDetails?.status === "Pending" && (
                            <View style={styles.buttonContainer}>
                                {isLoadingsave ? (
                                    <ActivityIndicator size="large" color="#007bff" />
                                ) : (
                                    <PrimaryButton
                                        title="Save"
                                        onPress={handleSaveButtonPress}
                                    />
                                )}

                                {manmera ? (
                                    <ActivityIndicator size="large" color="#007bff" />
                                ) : (
                                    isLoadingsubmit && (
                                        <PrimaryButton
                                            title="Submit"
                                            onPress={handleSubmitButtonPress}
                                            style={{ backgroundColor: "#4CAF50" }}
                                        />
                                    )
                                )}
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* 🔹 Amortization Modal */}
            <Modal
                animationType="slide"
                transparent
                visible={modalVisibleAmort?.isVisible}
                onRequestClose={handleCloseModal}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainerAmort}>
                        <Text style={styles.modalTitle}>Amortization Details</Text>

                        <View style={styles.tableWrapper}>
                            <ScrollView horizontal>
                                <View style={{ paddingRight: 16 }}>
                                    <TableHeader headers={headers} />
                                    <FlatList
                                        data={amortContent}
                                        keyExtractor={(item) => item.amortId}
                                        renderItem={renderItem}
                                        ListEmptyComponent={<Text>No application data available.</Text>}
                                    />
                                </View>
                            </ScrollView>
                        </View>

                        {/* ✅ Fixed position button container */}
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#007bff' }]}
                                onPress={handleExportToExcel}
                            >
                                <Text style={styles.closeButtonText}>Download Excel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { backgroundColor: '#dc3545' }]}
                                onPress={handleCloseModal}
                            >
                                <Text style={styles.closeButtonText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: verticalScale(12),
    },
    button: {
        flex: 1,
        backgroundColor: '#0B4D96',
        paddingVertical: Platform.OS === 'ios' ? 13 : 11,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
        marginVertical: 8,
        shadowColor: '#0B4D96',
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 10,
        elevation: 4,
        minWidth: width * 0.28,
        borderWidth: 1,
        borderColor: '#9DCEFF',
    },
    buttonDisabled: {
        backgroundColor: '#B0B0B0',
        shadowOpacity: 0.05,
    },
    buttonText: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: moderateScale(12),
        letterSpacing: 0.2,
    },
    buttonTextDisabled: {
        color: '#EEE',
    },
    productDetailrow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-evenly',
        gap: 5,
        marginBottom: 14,
    },
    required: {
        color: '#DC2626',
    },
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContainerAmort: {
        width: width * 0.95,
        backgroundColor: '#FFF',
        borderRadius: 12,
        padding: 16,
        elevation: 3,
        justifyContent: 'space-between',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#000',
        marginBottom: 12,
    },
    // tableWrapper: {
    //     flex: 1, // 👈 limits scroll area height
    // },
    tableContainer: {
        flexGrow: 1,
        marginVertical: 8,
    },
    formColumncam: {
        flex: 1,
        marginVertical: 6,
    },
    label: {
        fontSize: 13,
        color: '#333',
        fontWeight: '700',
        marginBottom: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        color: 'black',
        fontSize: 13,
        width: '100%',
        flexWrap: 'wrap', // ✅ text wraps instead of overflowing
        textAlignVertical: 'center',
    },
    disabledInput: {
        backgroundColor: "#DDDBDBFF", // gray background when disabled
        color: "black",
        fontWeight: '500'
    },
    container: {
        flex: 1,
        backgroundColor: '#EDF4FB',
    },
    buttonRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        // marginTop: 12,
        // marginBottom: 12,
        // paddingHorizontal: 14,
        gap: 10,
    },
    decisionHeroCard: {
        marginHorizontal: 14,
        marginBottom: 14,
        borderRadius: 24,
        padding: 18,
        overflow: 'hidden',
        shadowColor: '#0B4D96',
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 16,
        elevation: 5,
    },
    decisionHeroTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    decisionHeroCopy: {
        flex: 1,
    },
    decisionHeroEyebrow: {
        fontSize: 11,
        fontWeight: '800',
        color: 'rgba(255,255,255,0.84)',
        textTransform: 'uppercase',
        letterSpacing: 0.7,
    },
    decisionHeroTitle: {
        marginTop: 6,
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    decisionHeroSubtitle: {
        marginTop: 8,
        fontSize: 13,
        lineHeight: 20,
        color: 'rgba(255,255,255,0.84)',
    },
    decisionStagePill: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
    },
    decisionStagePillText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '800',
    },
    decisionStagePillSuccess: {
        backgroundColor: 'rgba(34,197,94,0.28)',
    },
    decisionStagePillDanger: {
        backgroundColor: 'rgba(244,63,94,0.28)',
    },
    decisionStagePillNeutral: {
        backgroundColor: 'rgba(255,255,255,0.14)',
    },
    decisionMetaRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    decisionMetaPill: {
        flex: 1,
        minWidth: 140,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
    },
    decisionMetaLabel: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.72)',
    },
    decisionMetaValue: {
        marginTop: 6,
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    decisionHeroGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 16,
    },
    decisionHeroTile: {
        width: '47%',
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.16)',
    },
    decisionHeroTileLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: 'rgba(255,255,255,0.72)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    decisionHeroTileValue: {
        marginTop: 6,
        fontSize: 14,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerLogo: {
        width: width * 0.2,
        height: width * 0.2 * 0.5,
    },
    headerAddressContainer: {
        flex: 1,
        marginLeft: 10,
    },
    headerAddressText: {
        fontSize: 12,
        color: '#555',
    },
    headerDivider: {
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        marginVertical: 8,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerCompany: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#0D82FFFF',
    },
    headerReport: {
        fontSize: 14,
        color: '#007bff',
        marginTop: 2,
    },
    cardWrapper: {
        backgroundColor: '#fff',
        borderRadius: 22,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 12,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#D7E5F2',
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '800',
        color: '#0B4D96',
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },


    modalSafeArea: {
        flex: 1,
        backgroundColor: '#F4F8FC',
    },
    scrollContainer: {
        flex: 1,
        paddingHorizontal: 14,
        backgroundColor: '#F4F8FC',
    },
    actionButton: {
        padding: 14,
        borderRadius: 18,
        alignItems: 'center',
        marginVertical: 6,
        shadowColor: '#0F172A',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 3,
    },
    actionButtonText: {
        color: '#fff',
        fontWeight: '800',
        fontSize: 14,
    },
    headerCAM: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(18),
        paddingHorizontal: scale(10),
    },
    logo: {
        width: scale(70),
        height: verticalScale(70),
        resizeMode: 'contain',
    },
    addressBlock: {
        flex: 1,
        marginLeft: scale(12),
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    companyTextCAM: {
        fontSize: scale(13),
        color: '#334155',
        lineHeight: verticalScale(18),
        textAlign: 'right',
    },
    fixedBottomButtonContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    closeButton: {
        position: 'absolute',
        bottom: 20,
        alignSelf: 'center',
        backgroundColor: '#DC2626',
        paddingVertical: verticalScale(12),
        paddingHorizontal: scale(24),
        borderRadius: 8,
    },
    closeButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: moderateScale(15),
    },
    headerContainer: {
        marginTop: 16,
        marginBottom: 12,
        borderBottomWidth: 1,
        borderColor: '#ddd',
        paddingBottom: 8,
    },
    cardContainer: {
        marginTop: 20,
    },
    formRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    columncam: {
        flex: 1,
        minWidth: '48%',
        paddingHorizontal: 4,
    },

    ////// CSR Report ////
    // page: {
    //     flex: 1,
    //     backgroundColor: "#fff",
    //     padding: scale(12),
    // },
    // header: {
    //     alignItems: "center",
    //     paddingVertical: verticalScale(6),
    // },
    // company: {
    //     fontSize: moderateScale(15),
    //     fontWeight: "700",
    //     color: "#0047AB",
    // },
    // contact: {
    //     fontSize: moderateScale(10),
    //     color: "#333",
    //     marginVertical: verticalScale(2),
    // },
    // reportTitle: {
    //     fontSize: moderateScale(13),
    //     fontWeight: "700",
    //     color: "#000",
    //     marginBottom: verticalScale(6),
    // },
    // loginInfo: {
    //     flexDirection: "row",
    //     justifyContent: "space-between",
    //     borderBottomWidth: 1,
    //     borderColor: "#ccc",
    //     paddingVertical: verticalScale(6),
    //     marginBottom: verticalScale(6),
    // },
    // infoText: {
    //     fontSize: moderateScale(10.5),
    //     color: "#111",
    // },
    // bold: { fontWeight: "700" },
    // dualContainer: {
    //     flexDirection: "row",
    //     justifyContent: "space-between",
    //     marginVertical: verticalScale(8),
    // },
    // card: {
    //     flex: 0.48,
    //     backgroundColor: "#fff",
    //     borderWidth: 1,
    //     borderColor: "#D1D5DB",
    //     borderRadius: moderateScale(6),
    //     padding: scale(8),
    //     elevation: 2,
    // },
    // cardHeader: {
    //     backgroundColor: "#007AFF",
    //     color: "#fff",
    //     fontWeight: "700",
    //     textAlign: "center",
    //     paddingVertical: verticalScale(4),
    //     borderRadius: moderateScale(4),
    //     marginBottom: verticalScale(6),
    //     fontSize: moderateScale(11),
    // },
    // row: {
    //     flexDirection: "row",
    //     justifyContent: "space-between",
    //     marginBottom: verticalScale(3),
    // },
    // label: {
    //     fontSize: moderateScale(10),
    //     fontWeight: "600",
    //     color: "#222",
    // },
    // value: {
    //     fontSize: moderateScale(10),
    //     color: "#333",
    //     textAlign: "right",
    // },
    // tableSection: {
    //     borderWidth: 1,
    //     borderColor: "#D1D5DB",
    //     borderRadius: moderateScale(6),
    //     marginBottom: verticalScale(12),
    // },
    // tableHeader: {
    //     flexDirection: "row",
    //     backgroundColor: "#C1C1C2FF",
    //     paddingVertical: verticalScale(6),
    // },
    // tableHeaderText: {
    //     color: "#333",
    //     fontWeight: "700",
    // },
    // tableRow: {
    //     flexDirection: "row",
    //     borderBottomWidth: 1,
    //     borderColor: "#eee",
    //     paddingVertical: verticalScale(4),
    // },
    // tableCell: {
    //     flex: 1,
    //     textAlign: "center",
    //     fontSize: moderateScale(10),
    //     color: "#333",
    // },
    // blueHeader: {
    //     backgroundColor: "#007AFF",
    //     color: "#fff",
    //     fontWeight: "700",
    //     paddingVertical: verticalScale(4),
    //     textAlign: "center",
    //     borderRadius: moderateScale(4),
    //     marginBottom: verticalScale(4),
    // },
    // // tableSection: {
    // //     borderWidth: 1,
    // //     borderColor: "#D1D5DB",
    // //     borderRadius: moderateScale(6),
    // //     overflow: "hidden",
    // //     marginTop: verticalScale(10),
    // //     marginBottom: verticalScale(12),
    // // },
    // blueHeader: {
    //     backgroundColor: "#007AFF",
    //     color: "#fff",
    //     fontWeight: "700",
    //     paddingVertical: verticalScale(5),
    //     textAlign: "center",
    //     borderRadius: moderateScale(4),
    //     marginTop: verticalScale(6),
    //     fontSize: moderateScale(11),
    // },



    page: {
        flex: 1,
        backgroundColor: "#fff",
        padding: scale(12),
        paddingBottom: verticalScale(40),
    },
    header: {
        alignItems: "center",
        paddingVertical: verticalScale(6),
    },
    company: {
        fontSize: moderateScale(15),
        fontWeight: "700",
        color: "#0047AB",
    },
    contact: {
        fontSize: moderateScale(10),
        color: "#333",
        marginVertical: verticalScale(2),
    },
    reportTitle: {
        fontSize: moderateScale(13),
        fontWeight: "700",
        color: "#000",
        marginBottom: verticalScale(6),
    },
    loginInfo: {
        flexDirection: "row",
        flexWrap: "wrap",   // ⭐ allows auto line-breaks
        alignItems: "flex-start",
        rowGap: verticalScale(6),  // spacing between rows
        columnGap: scale(12),      // spacing between columns

        borderBottomWidth: 1,
        borderColor: "#ccc",
        paddingVertical: verticalScale(6),
        marginBottom: verticalScale(6),
    },

    infoGroup: {
        flexDirection: "row",
        flexShrink: 1,     // ⭐ text shrinks instead of overflowing
        maxWidth: "48%",   // ⭐ ensures 2 items per row on larger screens
    },

    bold: {
        fontWeight: "700",
        color: "#333",
    },

    infoText: {
        color: "#555",
        flexShrink: 1,
        flexWrap: "wrap",
    },
    dualContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginVertical: verticalScale(8),
        gap: scale(8), // adds equal spacing between cards for all devices
    },

    card: {
        flexBasis: "48%",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: moderateScale(8),
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(8),
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        minHeight: verticalScale(180),
    },

    cardHeader: {
        backgroundColor: "#007AFF",
        color: "#fff",
        fontWeight: "700",
        textAlign: "center",
        paddingVertical: verticalScale(5),
        borderRadius: moderateScale(4),
        marginBottom: verticalScale(8),
        fontSize: moderateScale(11.5),
        letterSpacing: 0.3,
    },
    divider: {
        height: 1,
        backgroundColor: "#E5E7EB",
        marginVertical: verticalScale(6),
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: verticalScale(5),
        flexWrap: "wrap",
    },

    infoLabel: {
        flex: 0.6,
        fontSize: moderateScale(10.5),
        fontWeight: "600",
        color: "#222",
        lineHeight: verticalScale(14),
        flexWrap: "wrap",
    },

    infoValue: {
        flex: 0.4,
        fontSize: moderateScale(10.5),
        color: "#333",
        textAlign: "right",
        lineHeight: verticalScale(14),
        flexWrap: "wrap",
    },

    tableSection: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: moderateScale(6),
        marginBottom: verticalScale(12),
    },
    // divider: {
    //     height: 1,
    //     backgroundColor: "#D1D5DB", // light grey line
    //     width: "100%",
    // },
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#C1C1C2FF",
        paddingVertical: verticalScale(6),
    },
    tableHeaderText: {
        color: "#333",
        fontWeight: "700",
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#eee",
        paddingVertical: verticalScale(4),
    },
    tableCell: {
        flex: 1,
        textAlign: "center",
        fontSize: moderateScale(10),
        color: "#333",
    },
    blueHeader: {
        backgroundColor: "#007AFF",
        color: "#fff",
        fontWeight: "700",
        paddingVertical: verticalScale(5),
        textAlign: "center",
        borderRadius: moderateScale(4),
        marginTop: verticalScale(6),
        fontSize: moderateScale(11),
    },

    metaSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: moderateScale(6),
        backgroundColor: "#fff",
        paddingVertical: verticalScale(6),
        paddingHorizontal: scale(8),
        marginBottom: verticalScale(10),
        flexWrap: "wrap",
    },

    metaColumn: {
        flex: 0.48,
    },

    metaRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: verticalScale(3),
    },

    metaLabel: {
        fontSize: moderateScale(10),
        fontWeight: "600",
        color: "#222",
        width: "55%",
    },

    metaValue: {
        fontSize: moderateScale(10),
        color: "#333",
        width: "45%",
        textAlign: "right",
    },















    // 🔹 Dual card container (two cards per row)
    dualContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginVertical: verticalScale(8),
        gap: scale(8),
    },

    // 🔹 Card design (perfectly responsive)
    card: {
        flexGrow: 1,
        flexBasis: "48%",
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: moderateScale(8),
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(8),
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
        minHeight: verticalScale(180),
    },

    // 🔹 Card header
    cardHeader: {
        backgroundColor: "#007AFF",
        color: "#fff",
        fontWeight: "700",
        textAlign: "center",
        paddingVertical: verticalScale(6),
        borderRadius: moderateScale(4),
        marginBottom: verticalScale(8),
        fontSize: moderateScale(11.5),
        letterSpacing: 0.3,
    },

    // 🔹 Divider (single unified definition)
    divider: {
        height: 1,
        backgroundColor: "#D1D5DB",
        width: "100%",
        marginVertical: verticalScale(6),
    },

    // 🔹 Info row inside card
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: verticalScale(5),
        flexWrap: "wrap",
    },

    infoLabel: {
        flex: 0.6,
        fontSize: moderateScale(10.5),
        fontWeight: "600",
        color: "#222",
        lineHeight: verticalScale(14),
        flexWrap: "wrap",
    },

    infoValue: {
        flex: 0.4,
        fontSize: moderateScale(10.5),
        color: "#333",
        textAlign: "right",
        lineHeight: verticalScale(14),
        flexWrap: "wrap",
    },

    // 🔹 Table outer wrapper
    tableSection: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: moderateScale(6),
        overflow: "hidden",
        marginBottom: verticalScale(12),
        backgroundColor: "#fff",
    },

    // 🔹 Table header
    tableHeader: {
        flexDirection: "row",
        backgroundColor: "#C1C1C2",
        paddingVertical: verticalScale(6),
        borderBottomWidth: 1,
        borderBottomColor: "#D1D5DB",
    },

    tableHeaderText: {
        flex: 1,
        textAlign: "center",
        fontWeight: "700",
        fontSize: moderateScale(10.5),
        color: "#333",
    },

    // 🔹 Table row styling
    tableRow: {
        flexDirection: "row",
        paddingVertical: verticalScale(5),
    },

    tableCell: {
        flex: 1,
        textAlign: "center",
        fontSize: moderateScale(10),
        color: "#333",
        paddingHorizontal: scale(4),
    },

    // 🔹 Blue section header (Applicant / Co-Applicant)
    blueHeader: {
        backgroundColor: "#007AFF",
        color: "#fff",
        fontWeight: "700",
        paddingVertical: verticalScale(6),
        textAlign: "center",
        borderRadius: moderateScale(6),
        marginTop: verticalScale(10),
        fontSize: moderateScale(11.5),
        marginBottom: verticalScale(6),
        letterSpacing: 0.3,
    },
    bigCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: moderateScale(12),
        padding: scale(14),
        marginBottom: verticalScale(14),
        borderWidth: 0.8,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },


    cardTitle: {
        fontSize: moderateScale(12),
        fontWeight: "700",
        color: "#007AFF",
        marginBottom: verticalScale(8),
        textAlign: "center",
    },

    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: verticalScale(4),
    },


    label: {
        fontSize: moderateScale(11),
        fontWeight: "600",
        color: "#374151",
        flex: 1,
    },

    value: {
        fontSize: moderateScale(11),
        color: "#111827",
        flex: 1,
        // textAlign: "right",
        fontWeight: "500",
    },


    sectionHeader: {
        backgroundColor: "#0077FF",
        color: "#fff",
        fontWeight: "700",
        paddingVertical: verticalScale(8),
        textAlign: "center",
        borderRadius: moderateScale(8),
        fontSize: moderateScale(13),
        marginVertical: verticalScale(10),
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 1 },
        elevation: 2,
    }

});

export default DecisionProcess;
