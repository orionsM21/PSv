import React, { useState, useEffect, Toast, useMemo, useCallback, useRef } from 'react'
import {
    StyleSheet, Text, View, Alert, TouchableOpacity, FlatList, Dimensions, TextInput,
    ScrollView, Animated, Easing, Modal, Button, SafeAreaView, useColorScheme,
    StatusBar
} from 'react-native'

import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native'

import { useSelector } from 'react-redux'
import axios from 'axios'
// import Tts from 'react-native-tts';
// import Voice from '@react-native-voice/voice';
import debounce from 'lodash.debounce';
import { Dropdown } from 'react-native-element-dropdown';
import { ActivityIndicator } from 'react-native-paper'
import { BASE_URL } from '../../api/Endpoints'
// import { BASE_URL } from '../../api/Endpoints'


const { width, height } = Dimensions.get('window');
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;


const scale = size => (width / guidelineBaseWidth) * size;
const verticalScale = size => (height / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

const SimpleModal = ({ visible, onClose, title, children }) => (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
                <Text style={styles.modalTitle}>{title}</Text>
                <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>{children}</ScrollView>
                <View style={styles.modalFooter}>
                    <Button title="Close" onPress={onClose} />
                </View>
            </View>
        </View>
    </Modal>
);

const CustomDropdown = ({
    data = [],
    value = null,
    onChange = () => { },
    label = '',
    placeholder = 'Select an option',
    labelField = 'label',
    valueField = 'value',
    style = {},
    ...rest
}) => {
    return (
        <View style={[styles.dropdowncontainer, style]}>
            {label ? <Text style={styles.label}>{label}</Text> : null}
            <Dropdown
                data={data}
                labelField={labelField}
                valueField={valueField}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                style={styles.dropdown}
                containerStyle={styles.dropdowncontainer}   // FIXED
                placeholderStyle={styles.dropdownText}
                selectedTextStyle={styles.dropdownText}
                itemTextStyle={styles.secondaryText}
                {...rest}
            />

        </View>
    );
};

const AIassistant = () => {
    const navigation = useNavigation();
    const [AllDataofApplication, setAllDataofApplication] = useState([])
    const colorScheme = useColorScheme();


    const isDark = colorScheme === 'dark';
    const colors = {
        background: isDark ? '#121212' : '#f7f7f7',
        card: isDark ? '#1E1E1E' : '#ffffff',
        text: isDark ? '#ffffff' : '#1A1A1A',
        border: isDark ? '#333333' : '#dddddd',
        accent: '#007bff',
    };

    const [applications, setApplications] = useState([]);
    const [OGDisbursed, setOGDisbursed] = useState([]);
    const [OGreject, setOGreject] = useState([]);
    const [DisbursedCase, setDisbursedCase] = useState([]);
    const [RejectedCase, setRejectedCase] = useState([]);
    const [forSales, setForSales] = useState([]);
    const [forCredits, setForCredit] = useState([]);
    const [finalApplication, setfinalApplication] = useState([]);
    const [finalApplicationInp, setfinalApplicationInp] = useState([]);
    const mkc = useSelector((state) => state.auth.losuserDetails);
    const token = useSelector((state) => state.auth.token);
    const isFocused = useIsFocused();
    const [IsLoading, setIsLoading] = useState(false);
    const [IsRefreshing, setIsRefreshing] = useState(false);
    const [recognizedText, setRecognizedText] = useState('');

    const [BusinessAmount, setBusinessAmount] = useState([]);
    const micScale = useRef(new Animated.Value(1)).current;
    const wasSpeakingRef = useRef(false);
    const [bottlenecks, setBottlenecks] = useState([]);


    const [userPerformanceData, setUserPerformanceData] = useState([]);
    const [stageDropData, setStageDropData] = useState([]);
    const [overAllleads, setoverAllleads] = useState([])
    const [TR, setTR] = useState([]);

    const [TAT, setTAT] = useState([]);

    const [forecastStage, setForecastStage] = useState(null);

    const [ttsRate, setTtsRate] = useState(0.6);
    const [voiceLang, setVoiceLang] = useState('en-IN');
    const dropdownOptions = [
        { label: 'Pending', value: 'PENDING' },
        { label: 'Disbursed', value: 'APPROVED' },
        { label: 'Rejected', value: 'REJECTED' },
    ];

    const [showThirdDropdown, setshowThirdDropdown] = useState(false);

    const [results, setResults] = useState([]); // final list
    const [lastResults, setLastResults] = useState([]); // for app selection in modals
    // const [AllDataofApplication] = useState([]); // full dataset


    const [dropoffModalVisible, setDropoffModalVisible] = useState(false);
    const [bottleneckModalVisible, setBottleneckModalVisible] = useState(false);
    const [userPerformanceVisible, setUserPerformanceVisible] = useState(false);
    const [forecastModalVisible, setForecastModalVisible] = useState(false);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [selectedSecondaryAction, setSelectedSecondaryAction] = useState(null);
    const [TatModalVisible, setTatModalVisible] = useState(false);
    const [TatInfoModalVisible, setTatInfoModalVisible] = useState(false);


    const [selectedAppData, setSelectedAppData] = useState(null);
    const [selectedAppNo, setSelectedAppNo] = useState(null);
    const [showApplicantDetails, setShowApplicantDetails] = useState(false);
    const [showIndividual, setShowIndividual] = useState(false);
    // 


    // Filters / dropdowns
    const [selectedValue, setSelectedValue] = useState(null);
    const [showSecondaryDropdown, setShowSecondaryDropdown] = useState(false);
    const [selectedFilterOption, setSelectedFilterOption] = useState(null);

    const [amountFilterType, setAmountFilterType] = useState(null);
    const [minAmountRaw, setMinAmountRaw] = useState('');
    const [maxAmountRaw, setMaxAmountRaw] = useState('');


    // Business amount
    // const [BusinessAmount] = useState(null);


    // Mock analytics arrays
    // const [stageDropData] = useState([
    //     { stage: 'DDE', entered: 120, exited: 100, dropOffCount: 20, dropOffRate: 16.7 },
    // ]);
    // const [bottlenecks] = useState([{ transition: 'DDE → UW', avgTime: 72, count: 34 }]);
    // const [userPerformanceData] = useState([{ user: 'Rahul', transitions: 120, avgTime: 48 }]);
    const [tatResults, setTatResults] = useState([]);

    const onStatusChange = (item) => {

        setSelectedValue(item.value);
        handleStatusFilter(item.value);
        setShowSecondaryDropdown(true);

    };
    // ---------- Helper utilities ----------
    const formatNumberWithCommas = (value) => {
        if (!value || isNaN(value)) return value; // Return original value if not a valid number
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
    };


    // Convert to number safely
    const toNumber = useCallback(val => {
        if (val === null || val === undefined || val === '') return null;
        const n = Number(String(val).replace(/,/g, ''));
        return Number.isNaN(n) ? null : n;
    }, []);

    // const handleMinChange = (text) => {
    //     const numeric = text.replace(/,/g, '');
    //     if (!isNaN(numeric)) {
    //         setMinAmountRaw(numeric);
    //     }
    // };

    // const handleMaxChange = (text) => {
    //     const numeric = text.replace(/,/g, '');
    //     if (!isNaN(numeric)) {
    //         setMaxAmountRaw(numeric);
    //     }
    // };

    const handleMinChange = (text) => {
        const cleanText = text.replace(/,/g, '');
        setMinAmountRaw(cleanText);
    };

    const handleMaxChange = (text) => {
        const cleanText = text.replace(/,/g, '');
        setMaxAmountRaw(cleanText);
    };

    // const [results, setResults] = useState([]);
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Fetch leads and applications in parallel
            const [leadsRes, appsRes] = await Promise.all([
                axios.get(`${BASE_URL}getLeads`, {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }),
                axios.get(`${BASE_URL}getAllApplication`, {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                }),
            ]);

            // ----------------- Leads -----------------
            const rawLeads = Array.isArray(leadsRes?.data?.data) ? leadsRes.data.data : [];

            const coLeadIds = new Set(
                rawLeads
                    .filter(lead => lead.applicantTypeCode === 'Co-Applicant')
                    .map(lead => lead.leadId)
            );

            const leadsData = rawLeads.filter(
                lead =>
                    lead.applicantTypeCode === 'Applicant' &&
                    lead.createdBy === mkc.userName &&
                    coLeadIds.has(lead.leadId)
            );

            const leadsDataAII = rawLeads?.filter(
                (lead) => lead.applicantTypeCode === 'Applicant'
            ) || [];

            // ----------------- Applications -----------------
            const apps = Array.isArray(appsRes?.data?.data) ? appsRes.data.data : [];

            const inProgress = [];
            const disbursed = [];
            const rejected = [];

            const filteredRejectedleads = leadsDataAII.filter(({ leadStatus }) => {
                const statusName = leadStatus?.leadStatusName?.trim()?.toLowerCase();
                return statusName === "rejected";
            });

            setoverAllleads(filteredRejectedleads)

            const TR = apps.filter(app => app.stage === "Rejected")
            setTR(TR);

            for (const app of apps) {
                if (app.stage === 'Closed') disbursed.push(app);
                else if (app.stage === 'Rejected') rejected.push(app);
                else inProgress.push(app);
            }

            // Update all state in one batch
            setApplications(inProgress);
            setOGDisbursed(disbursed);
            setOGreject(rejected);
            setAllDataofApplication(apps);

            // Optional: await log fetch
            if (apps.length > 0) {
                await getLogsDetailsByApplicationNumber(apps);
            }

        } catch (err) {
            console.error('fetchData error:', err);
            Alert.alert('Error', 'Failed to load data. Please try again.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [token, mkc.userName]);

    // Then call it in useEffect
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const getLogsDetailsByApplicationNumber = async (applications) => {
        try {
            if (!applications) {
                // 
                return;
            }

            const { data } = await axios.get(`${BASE_URL}getAllLogsDetails`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            const logsData = data?.data || [];

            // Filter logs to only include those created by the logged-in user
            const userLogs = logsData.filter(log => log.user === mkc.userName);
            const userAppNumbers = new Set(userLogs.map(log => log.applicationNumber));

            // Filter logs where applicationNumber matches any from userLogs
            const forlead = logsData.filter(k => userAppNumbers.has(k.applicationNumber));

            const filteredLeadSales = forlead.filter(log =>
                log.description === "Fee Details"
            );
            const filteredLeadCredit = [];
            const seenApplicationNumbers = new Set();

            forlead.forEach(log => {
                if (log.description === "InitiateVerification" && !seenApplicationNumbers.has(log.applicationNumber)) {
                    seenApplicationNumbers.add(log.applicationNumber);
                    filteredLeadCredit.push(log);
                }
            });


            const filteredLeadCreditRejectCase = [];
            const seenApplicationNumbersRejecteCase = new Set();

            forlead.forEach(log => {
                // Step 1: Check if the log's status is 'Rejected' and description is 'Decision Level 3'
                if (log.status === "Rejected" && log.description === "Decision Level 3") {
                    // Filter all logs with the same applicationNumber and 'Decision Level 3' description
                    const decisionLevel3Logs = forlead.filter(
                        l => l.applicationNumber === log.applicationNumber && l.description === "Decision Level 3"
                    );

                    // Step 2: If there are exactly 3 'Decision Level 3' logs for this application, push only one of them to the result array
                    if (decisionLevel3Logs.length >= 3 && !seenApplicationNumbersRejecteCase.has(log.applicationNumber)) {
                        // Push just one log, not all 3
                        seenApplicationNumbersRejecteCase.add(log.applicationNumber);
                        filteredLeadCreditRejectCase.push(decisionLevel3Logs[0]); // Only push one log
                    }
                }
            });

            // Step 3: If there are no 'Rejected' and 'Decision Level 3' logs or not enough, find other 'Rejected' cases with description not 'Decision Level 3'
            // List of excluded users
            const excludedUsers = ["Comittee1", "Comittee2", "Comittee3", "Comittee4"];

            forlead.forEach(log => {
                // Ensure the log's status is 'Rejected', the user is not one of the excluded users, and the description is not 'Decision Level 3'
                if (log.status === "Rejected" && !excludedUsers.includes(log.user) && log.description !== "Decision Level 3") {
                    // Avoid pushing duplicate applicationNumber
                    if (!seenApplicationNumbersRejecteCase.has(log.applicationNumber)) {
                        seenApplicationNumbersRejecteCase.add(log.applicationNumber);
                        filteredLeadCreditRejectCase.push(log);
                    }
                }
            });

            const filteredLeadCreditDisbursedCases = [];
            const seenApplicationNumbersDisbursedCase = new Set();

            forlead.forEach(log => {
                if (log.status === "Disbursed" && !seenApplicationNumbersDisbursedCase.has(log.applicationNumber)) {
                    seenApplicationNumbersDisbursedCase.add(log.applicationNumber);
                    filteredLeadCreditDisbursedCases.push(log);
                }
            });

            const matchedApplicationNumbers = new Set(filteredLeadCreditDisbursedCases.map(log => log.applicationNumber));

            filteredLeadCredit.forEach(log => {
                if (matchedApplicationNumbers.has(log.applicationNumber)) {
                    // If match is found, empty the filteredLeadCredit array
                    filteredLeadCredit.length = 0;  // This clears the array
                }
            })


            // Optimized lookup using Set
            const matchingAppNumbers = new Set(userLogs.map(log => log.applicationNumber));

            const filteredApplicationsSales = applications.filter(item =>
                matchingAppNumbers.has(item.applicationNo) &&
                item.stage !== "Disbursed" &&
                item.stage !== "Rejected"
            );

            // Filter applications based on the user's logs
            const filteredApplications = applications.filter(item =>
                matchingAppNumbers.has(item.applicationNo)
            );

            // Further filter Disbursed and Rejected cases based on the same user
            const DisbursedCases = filteredApplications.filter(item => item.stage === "Disbursed")
            const RejectedCases = filteredApplications.filter(item => item.stage === "Rejected")

            setForSales(filteredLeadSales);
            setForCredit(filteredLeadCredit);
            setRejectedCase(RejectedCases);
            setDisbursedCase(filteredLeadCreditDisbursedCases);

            setfinalApplication(filteredApplications);
            setfinalApplicationInp(filteredApplicationsSales)

            // 
        } catch (error) {
            console.error('Error fetching logs details:', error.message || error);
        }
    };
    const applyLoanFilter = () => {
        const min = toNumber(minAmountRaw);
        const max = toNumber(maxAmountRaw);


        const filtered = AllDataofApplication.filter(app => {
            const loan = Number(app.loanAmount || 0);
            if (amountFilterType === 'BETWEEN') {
                if (min === null || max === null) return false;
                return loan >= min && loan <= max;
            }
            if (amountFilterType === 'LESS_THAN') {
                if (max === null) return false;
                return loan <= max;
            }
            if (amountFilterType === 'GREATER_THAN') {
                if (min === null) return false;
                return loan >= min;
            }
            return false;
        });


        setResults(filtered);
        setLastResults(filtered);


        // Accessible feedback (simple)
        if (filtered.length > 0) {

        } else {

        }
    };

    // ---------- Memoized Renderers ----------
    const renderResultCard = useCallback(({ item }) => {
        return (
            <View style={styles.resultCard}>
                <Text style={styles.resultText}>Stage: {item.stage || item.leadStage || 'N/A'}</Text>
                <Text style={styles.resultText}>
                    Loan Amount: ₹ {formatNumberWithCommas(item.loanAmount?.toString() || '0')}
                </Text>

                <Text style={styles.resultText}>Status: {item.status || item.leadStatus?.leadStatusName || 'N/A'}</Text>
                {item.leadId && <Text style={styles.resultText}>LeadID: {item.leadId}</Text>}
                {item.applicationNo && <Text style={styles.resultText}>ApplicationNo: {item.applicationNo}</Text>}
            </View>
        );
    }, []);

    // useEffect(() => {
    //     Tts.getInitStatus()
    //         .then(() => Tts.voices())
    //         .then(voices => {
    //             const safeVoice = voices.find(v =>
    //                 v.language === 'en-US' &&
    //                 !v.notInstalled &&
    //                 !v.id.includes('x-')
    //             );

    //             if (safeVoice) {

    //                 Tts.setDefaultLanguage(safeVoice.language);
    //                 Tts.setDefaultVoice(safeVoice.id);
    //             }

    //             Tts.setDefaultRate(0.5);
    //             Tts.setDucking(true);
    //             Tts.setDefaultPitch(1.2); // ✅ Set pitch slightly higher for natural tone

    //             // ✅ Speak welcome message
    //             Tts.speak("Hello! I'm your assistant. How can I help you today?");
    //         })
    //         .catch(err => console.error('TTS Init Error:', err));

    //     Tts.addEventListener('tts-start', () => {
    //         wasSpeakingRef.current = true;

    //     });

    //     Tts.addEventListener('tts-finish', () => {
    //         wasSpeakingRef.current = false;

    //     });

    //     Tts.addEventListener('tts-cancel', () => {
    //         wasSpeakingRef.current = false;

    //     });

    //     return () => {
    //         Tts.removeAllListeners('tts-start');
    //         Tts.removeAllListeners('tts-finish');
    //         Tts.removeAllListeners('tts-cancel');
    //     };
    // }, []);

    const startMicAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(micScale, {
                    toValue: 1.3,
                    duration: 500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
                Animated.timing(micScale, {
                    toValue: 1,
                    duration: 500,
                    easing: Easing.linear,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const stopMicAnimation = () => {
        micScale.stopAnimation();
        micScale.setValue(1);
    };


    // const parseQuery = (rawQuery) => {
    //     const query = rawQuery.toLowerCase();

    //     // Check for stop command
    //     if (query.includes('stop')) {
    //         return {
    //             isStopCommand: true
    //         };
    //     }
    //     if (query.includes('tell me more') || query.includes('more about')) {
    //         return { isMoreInfoCommand: true };
    //     }


    //     let statusType = '';
    //     let minAmount = null;
    //     let maxAmount = null;

    //     // Status detection
    //     // if (query.includes('pending')) statusType = 'PENDING';
    //     if (query.match(/\b(pending|waiting|in progress)\b/)) statusType = 'PENDING';
    //     else if (query.includes('approved')) statusType = 'APPROVED';
    //     else if (query.includes('rejected')) statusType = 'REJECTED';

    //     // Amount detection
    //     const numberPattern = /\d{1,3}(,\d{3})*(\.\d+)?|\d+/g;
    //     const numberMatches = query.match(numberPattern);

    //     if (query.includes('more than') || query.includes('greater than')) {
    //         if (numberMatches?.length) {
    //             minAmount = parseInt(numberMatches[0].replace(/,/g, ''));
    //         }
    //     } else if (query.includes('less than')) {
    //         if (numberMatches?.length) {
    //             maxAmount = parseInt(numberMatches[0].replace(/,/g, ''));
    //         }
    //     }

    //     return {
    //         statusType,
    //         minAmount,
    //         maxAmount,
    //         isStopCommand: false,
    //         isMoreInfoCommand: false,
    //     };
    // };


    const parseQuery = (rawQuery) => {
        const query = rawQuery.toLowerCase().trim();

        const isStopCommand = query.includes('stop');
        const isMoreInfoCommand = query.includes('tell me more') || query.includes('more about');
        const isShowAllCommand = query.includes('show me all') || query.includes('list all');
        const isClearCommand = query.includes('clear results') || query.includes('reset');
        const isGoBackCommand = query.includes('go back') || query.includes('back');
        const isBusinessQuery = query.includes('how much business') || query.includes('total business');
        const isFutureBusinessQuery =
            query.includes('how much') ||
            (query.includes('will i make') ||
                query.includes('will i earn') ||
                query.includes('going to make') ||
                query.includes('gonna make') ||
                query.includes('forecast') ||
                query.includes('future business') ||
                query.includes('estimate'))






        let statusType = '';
        let minAmount = null;
        let maxAmount = null;

        // Status
        if (query.match(/\b(pending|waiting|in progress)\b/)) statusType = 'PENDING';
        else if (query.includes('approved')) statusType = 'APPROVED';
        else if (query.includes('rejected')) statusType = 'REJECTED';

        // Number detection
        const amountWords = query.match(/\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+/g)?.map(n => parseFloat(n.replace(/,/g, ''))) || [];

        if (query.includes('between') && amountWords.length >= 2) {
            minAmount = amountWords[0];
            maxAmount = amountWords[1];
        } else if (query.includes('more than') || query.includes('greater than')) {
            if (amountWords.length) minAmount = amountWords[0];
        } else if (query.includes('less than')) {
            if (amountWords.length) maxAmount = amountWords[0];
        } else if (amountWords.length) {
            minAmount = amountWords[0];
        }

        if (query.includes('lakh') || query.includes('lakhs')) {
            if (minAmount) minAmount *= 100000;
            if (maxAmount) maxAmount *= 100000;
        }

        return {
            statusType,
            minAmount,
            maxAmount,
            isStopCommand,
            isMoreInfoCommand,
            isShowAllCommand,
            isClearCommand,
            isGoBackCommand,
            isBusinessQuery,
            isFutureBusinessQuery,
            isEmpty: query.length === 0
        };
    };



    useEffect(() => {
        if (selectedAppData) {
            const { applicationNo, status, loanAmount } = selectedAppData;
            const msg = `Details for application number ${applicationNo}. Status is ${status}. Loan amount is ₹${(loanAmount / 100000).toFixed(2)} lakh.`;
            // Tts.speak(msg);
        }
    }, [selectedAppData]);

    // ✅ Matching Logic
    // const isMatch = (app, statusType, minAmount, isGreaterThan, isLessThan) => {
    //     const isClosed = app.stage === 'Disbursed' && app.status === 'Disbursed';
    //     const isPending = !isClosed;

    //     const amountCheck = isGreaterThan
    //         ? app.loanAmount > minAmount
    //         : isLessThan
    //             ? app.loanAmount < minAmount
    //             : app.loanAmount >= minAmount;

    //     switch (statusType) {
    //         case 'PENDING': return isPending && amountCheck;
    //         case 'APPROVED': return isClosed && amountCheck;
    //         case 'REJECTED': return app.status === 'REJECTED' && amountCheck;
    //         default: return false;
    //     }
    // };

    const isMatch = (app, statusType, minAmount, maxAmount) => {
        const isClosed = app.stage === 'Disbursed' && app.status === 'Disbursed';
        const isPending = !isClosed;
        const isRejected = app.stage === 'Rejected';


        const statusMatch =
            (statusType === 'PENDING' && isPending) ||
            (statusType === 'APPROVED' && isClosed) ||
            (statusType === 'REJECTED' && app.stage === 'Rejected') ||
            (statusType === '');

        const amount = app.loanAmount;
        const amountMatch =
            (minAmount === null || amount >= minAmount) &&
            (maxAmount === null || amount <= maxAmount);

        return statusMatch && amountMatch;
    };

    const speakInChunks = async (text, chunkSize = 300) => {
        const chunks = [];

        for (let i = 0; i < text.length; i += chunkSize) {
            chunks.push(text.substring(i, i + chunkSize));
        }

        for (const chunk of chunks) {
            await new Promise((resolve) => {
                // const subscription = Tts.addEventListener('tts-finish', () => {
                //     subscription.remove(); // ✅ Correct way now
                //     resolve();
                // });

                // Tts.speak(chunk);
            });
        }
    };

    // const handleQuery = useMemo(() =>
    //     debounce((query) => {
    //         const { statusType, minAmount, maxAmount, isStopCommand, isMoreInfoCommand } = parseQuery(query);

    //         if (isStopCommand) {
    //             if (wasSpeakingRef.current) {
    //                 Tts.stop();
    //                 stopMicAnimation?.();
    //             } else {
    //                 const msg = "I'm speaking with you now. Before this, I was not talking with you.";
    //                 Tts.speak(msg);
    //             }
    //             return;
    //         }

    //         // 🔍 Handle "tell me more" intent
    //         if (isMoreInfoCommand) {
    //             if (lastResults.length > 0) {
    //                 setInfoModalVisible(true);
    //                 Tts.speak("Please select an application number you want to know more about.");
    //             } else {
    //                 Tts.speak("No previous application results to show more information about.");
    //             }
    //             return;
    //         }

    //         const matchedApps = AllDataofApplication.filter(app =>
    //             isMatch(app, statusType, minAmount, null, maxAmount)
    //         );

    //         setResults(matchedApps);
    //         setLastResults(matchedApps);

    //         if (matchedApps.length > 0) {
    //             let responseText = `Found ${matchedApps.length} applications. `;
    //             matchedApps.slice(0, 10).forEach((app, i) => {
    //                 const amountInLakhs = (app.loanAmount / 100000).toFixed(2);
    //                 responseText += `Application ${i + 1}: ${app.status}, ${amountInLakhs} lakh rupees. `;
    //             });

    //             Tts.stop();
    //             speakInChunks(responseText).catch(err => console.warn('TTS Speak Error:', err));
    //         } else {
    //             Tts.stop();
    //             Tts.speak('No matching applications found.');
    //         }

    //     }, 300),
    //     [AllDataofApplication, navigation, lastResults]
    // );




    const handleQuery = useMemo(() => debounce((query) => {
        const {
            statusType,
            minAmount,
            maxAmount,
            isStopCommand,
            isMoreInfoCommand,
            isShowAllCommand,
            isClearCommand,
            isGoBackCommand,
            isEmpty,
            isBusinessQuery,
            isFutureBusinessQuery
        } = parseQuery(query);

        if (isEmpty) {
            // Tts.speak("I didn't catch that. Could you please say it again?");
            return;
        }

        if (isGoBackCommand) {
            navigation.goBack();
            // Tts.speak("Going back.");
            return;
        }

        if (isStopCommand) {
            if (wasSpeakingRef.current) {
                // Tts.stop();
                stopMicAnimation?.();
            } else {
                // Tts.speak("I wasn't speaking earlier, but now I am.");
            }
            return;
        }

        if (isClearCommand) {
            setResults([]);
            setLastResults([]);
            // Tts.speak("Results cleared.");
            return;
        }

        if (isMoreInfoCommand) {
            if (lastResults.length > 0) {
                setInfoModalVisible(true);
                // Tts.speak("Please select an application number you want to know more about.");
            } else {
                // Tts.speak("No previous application results to show more information about.");
            }
            return;
        }

        if (isFutureBusinessQuery) {

            setForecastModalVisible(true);
            // Tts.speak("Please select the stage to estimate your future business.");
            return;
        }


        if (isBusinessQuery) {
            const closedApps = AllDataofApplication.filter(app => app.stage === 'Disbursed');

            if (closedApps.length === 0) {
                // Tts.speak("No closed applications found, so no business yet.");
                return;
            }

            const totalAmount = closedApps.reduce((sum, app) => sum + Number(app.loanAmount || 0), 0);
            const amountInLakhs = (totalAmount / 100000).toFixed(2);

            // Tts.speak(`You have made a total business of ${amountInLakhs} lakh rupees from closed applications.`);
            setBusinessAmount(amountInLakhs);

            return;
        }




        if (isShowAllCommand) {
            setResults(AllDataofApplication);
            setLastResults(AllDataofApplication);
            // Tts.speak(`Showing all ${AllDataofApplication.length} applications.`);
            return;
        }

        const matchedApps = AllDataofApplication.filter(app =>
            isMatch(app, statusType, minAmount, maxAmount)
        );

        setResults(matchedApps);
        setLastResults(matchedApps);

        if (matchedApps.length > 0) {
            let responseText = `Found ${matchedApps.length} applications. `;
            matchedApps.slice(0, 10).forEach((app, i) => {
                const amountInLakhs = (app.loanAmount / 100000).toFixed(2);
                responseText += `Application number ${app.applicationNo}, ${app.status}, ${amountInLakhs} lakh rupees. `;
            });

            // Tts.stop();
            speakInChunks(responseText).catch(err => console.warn('TTS Speak Error:', err));
        } else {
            // Tts.stop();
            // Tts.speak('No matching applications found.');
        }




    }, 300), [AllDataofApplication, navigation, lastResults]);


    const handleStatusFilter = (statusType) => {

        const matchedApps = AllDataofApplication.filter(app => {
            const isClosed = app.stage === 'Disbursed' && app.status === 'Disbursed';
            const isPending = !isClosed;

            const statusMatch =
                (statusType === 'PENDING' && isPending) ||
                (statusType === 'APPROVED' && isClosed) ||
                (statusType === 'REJECTED' && app.stage === 'Rejected');

            return statusMatch;
        });



        if (statusType === 'REJECTED') {
            setResults([...matchedApps, ...overAllleads]);
        } else {
            setResults(matchedApps);
        }

        if (statusType === 'REJECTED') {
            setLastResults([...matchedApps, ...overAllleads]);
        } else {
            setLastResults(matchedApps);
        }
        // setLastResults(matchedApps);

        if (matchedApps.length > 0) {
            let responseText = `Found ${matchedApps.length} applications. `;
            matchedApps.slice(0, 10).forEach((app) => {
                const amountInLakhs = (app.loanAmount / 100000).toFixed(2);
                responseText += `Application number ${app.applicationNo}, ${app.status}, ${amountInLakhs} lakh rupees. `;
            });

            // Tts.stop();
            speakInChunks(responseText).catch(err => console.warn('TTS Speak Error:', err));
        } else {
            // Tts.stop();
            // Tts.speak('No matching applications found.');
        }
    };

    const handleSecondaryAction = (actionType) => {
        // Reset any old UI / modals / results before doing a new action
        setInfoModalVisible(false);
        setTatModalVisible(false);
        setForecastModalVisible(false);
        setDropoffModalVisible(false);
        setBottleneckModalVisible(false);
        setUserPerformanceVisible(false);
        setForecastStage(null)



        if (actionType === 'MORE_INFO') {
            if (lastResults.length > 0) {
                setInfoModalVisible(true);
                // Tts.speak("Please select an application number you want to know more about.");
            } else {
                // Tts.speak("No previous application results to show more information about.");
            }
        }

        if (actionType === 'SHOW_ALL') {
            setResults(AllDataofApplication);
            setLastResults(AllDataofApplication);
            // Tts.speak(`Showing all ${AllDataofApplication.length} applications.`);
        }

        if (actionType === 'FUTURE_BUSINESS') {
            setForecastModalVisible(true);
            // Tts.speak("Please select the stage to estimate your future business.");
        }

        if (actionType === 'TAT') {
            setTatModalVisible(true);
            setshowThirdDropdown(true);
            // Tts.speak("Please select the Application Number To Show TAT.");
        }

        if (actionType === 'Analyze_Bottlenecks') {
            const result = calculateStageDelays(TAT);
            setBottlenecks(result);
            setBottleneckModalVisible(true);
            // Tts.speak("Please select the Application Number To Analyze The BottleNeck.");
        }

        if (actionType === 'Performence') {
            const result = calculateUserPerformance(TAT);
            setUserPerformanceData(result);
            setUserPerformanceVisible(true);
            // Tts.speak("Please select the Application Number To Analyze The Performence.");
        }

        if (actionType === 'StageDrop') {
            const result = calculateStageDropOff(TAT);
            setStageDropData(result);
            setDropoffModalVisible(true);
            // Tts.speak("Please select the Application Number To Analyze The StageDrop.");
        }
    };


    const onSpeechResultsHandler = (e) => {
        stopMicAnimation();
        const spokenText = e.value[0];

        setRecognizedText(spokenText);

        if (spokenText.toLowerCase().includes('m21')) {
            navigation.navigate('AIassistant');
            return;
        }

        handleQuery(spokenText);
    };


   
    const startListening = async () => {
        if (!AllDataofApplication || AllDataofApplication.length === 0) {
            Alert.alert('Please wait', 'Data is still loading. Try again in a few seconds.');
            return;
        }

        try {
            startMicAnimation();
            // await Voice.start(voiceLang);

        } catch (e) {
            console.error('Voice start error:', e);
        }
    };

    const stopListening = async () => {
        stopMicAnimation();
        try {
            // await Voice.stop();
        } catch (err) {
            console.error('Voice stop error:', err);
        }
    };
    // ✅ Setup & Cleanup Voice Listener
    // useEffect(() => {
    //     Voice.onSpeechResults = onSpeechResultsHandler;
    //     return () => {
    //         Voice.destroy().then(Voice.removeAllListeners);
    //     };
    // }, []);





    const handleForecastStageSelect = (stage) => {
        // Close modal & set stage
        setForecastModalVisible(false);
        setForecastStage(stage);

        // Filter applications by selected stage
        const matchedApps = AllDataofApplication.filter(app => app.stage === stage);

        // Safely calculate total amount
        const totalAmount = matchedApps.reduce(
            (sum, app) => sum + (Number(app.loanAmount) || 0),
            0
        );

        // Convert to lakhs (1 lakh = 100,000)
        const amountInLakhs = (totalAmount);


        // : ₹${amountInLakhs}`);

        if (matchedApps.length > 0) {
            const speakAmount = amountInLakhs; // cleaner speech
            // Tts.speak(
            //     `If all applications in ${stage} stage close successfully, you'll make approximately ${speakAmount} lakh rupees.`
            // );

            // Update UI states
            setResults(matchedApps);
            setLastResults(matchedApps);
            setBusinessAmount(amountInLakhs);
        } else {
            // Tts.speak(`There are no applications currently in the ${stage} stage.`);
            setResults([]);
            setLastResults([]);
            setBusinessAmount(null);
        }
    };

    const getLogsDetailsByApplicationNumberInprogress = useCallback(async (applicationNo) => {
        try {
            const response = await axios.get(
                `${BASE_URL}getLogsDetailsByApplicationNumber/${applicationNo}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: 'Bearer ' + token,
                    }
                }
            );

            const data = response?.data?.data;

            setTAT(data)

            // if (!Array.isArray(data) || data.length === 0) {
            //     Alert.alert('No Logs', 'No logs available for this application.');
            //     return;
            // }

            // // Find the last status that is NOT "Completed"
            // const pendingEntry = data.find(entry => entry.status !== 'Completed');

            // const pendingStage = pendingEntry?.description || data[data.length - 1]?.description || 'Unknown stage';

            // Alert.alert('Pending Screen', `This case is pending at stage: ${pendingStage}`);
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to fetch application details.');
        }
    }, [token]);

    useEffect(() => {
        if (TAT.length > 0) {
            const tatResults = calculateTATPerStage(TAT);
            // Or store it in state for display
            setTatResults(tatResults);
            setTatInfoModalVisible(true);
        }
    }, [TAT]);

    const calculateTATPerStage = (tatLogs) => {
        // Step 1: Sort logs by createdTime
        const sortedLogs = [...tatLogs].sort((a, b) => a.createdTime - b.createdTime);

        const result = [];

        for (let i = 1; i < sortedLogs.length; i++) {
            const prev = sortedLogs[i - 1];
            const curr = sortedLogs[i];

            const tatInHours = (curr.createdTime - prev.createdTime) / (1000 * 60 * 60); // in hours

            result.push({
                fromStage: prev.stage,
                toStage: curr.stage,
                durationInHours: tatInHours.toFixed(2),
                fromTime: new Date(prev.createdTime).toLocaleString(),
                toTime: new Date(curr.createdTime).toLocaleString(),
                descriptionFrom: prev.description,  // Previous stage description
                descriptionTo: curr.description,    // Current stage description
            });
        }

        return result;
    };


    const calculateStageDelays = (allTATLogs) => {
        const delaysMap = {};

        // Group logs by applicationNumber
        const groupedByApp = {};
        allTATLogs.forEach(log => {
            if (!groupedByApp[log.applicationNumber]) {
                groupedByApp[log.applicationNumber] = [];
            }
            groupedByApp[log.applicationNumber].push(log);
        });

        // For each application, sort logs by createdTime and compute delays
        Object.values(groupedByApp).forEach(logs => {
            const sorted = logs.sort((a, b) => a.createdTime - b.createdTime);

            for (let i = 1; i < sorted.length; i++) {
                const from = sorted[i - 1];
                const to = sorted[i];

                const key = `${from.stage}→${to.stage}`;
                const delay = (to.createdTime - from.createdTime) / (1000 * 60 * 60); // in hours

                if (!delaysMap[key]) {
                    delaysMap[key] = { total: 0, count: 0 };
                }

                delaysMap[key].total += delay;
                delaysMap[key].count += 1;
            }
        });

        // Convert to array
        const results = Object.entries(delaysMap).map(([transition, data]) => ({
            transition,
            avgTime: (data.total / data.count).toFixed(2),
            count: data.count,
        }));

        // Sort by avgTime descending
        results.sort((a, b) => parseFloat(b.avgTime) - parseFloat(a.avgTime));

        return results;
    };



    const calculateUserPerformance = (tatLogs) => {
        const groupedByApp = {};

        // Group logs by applicationNumber
        tatLogs.forEach(log => {
            if (!groupedByApp[log.applicationNumber]) {
                groupedByApp[log.applicationNumber] = [];
            }
            groupedByApp[log.applicationNumber].push(log);
        });

        const userStats = {};

        // Process each application
        Object.values(groupedByApp).forEach(logs => {
            const sorted = logs.sort((a, b) => a.createdTime - b.createdTime);

            for (let i = 1; i < sorted.length; i++) {
                const from = sorted[i - 1];
                const to = sorted[i];

                const duration = (to.createdTime - from.createdTime) / (1000 * 60 * 60); // hours
                const responsibleUser = from.user; // assuming from.user is the executor

                if (!userStats[responsibleUser]) {
                    userStats[responsibleUser] = {
                        transitions: 0,
                        totalTime: 0,
                    };
                }

                userStats[responsibleUser].transitions += 1;
                userStats[responsibleUser].totalTime += duration;
            }
        });

        // Final format
        return Object.entries(userStats).map(([user, data]) => ({
            user,
            transitions: data.transitions,
            avgTime: (data.totalTime / data.transitions).toFixed(2),
        })).sort((a, b) => parseFloat(a.avgTime) - parseFloat(b.avgTime)); // fastest first
    };



    const calculateStageDropOff = (tatLogs) => {
        const stageStats = {};

        // Group by application number first
        const grouped = {};
        tatLogs.forEach(log => {
            if (!grouped[log.applicationNumber]) grouped[log.applicationNumber] = [];
            grouped[log.applicationNumber].push(log);
        });

        // Count how many apps entered & exited each stage
        Object.values(grouped).forEach(logs => {
            const sorted = logs.sort((a, b) => a.createdTime - b.createdTime);
            const visitedStages = new Set();

            for (let i = 0; i < sorted.length; i++) {
                const stage = sorted[i].stage;

                if (!stageStats[stage]) {
                    stageStats[stage] = { entered: 0, exited: 0 };
                }

                if (!visitedStages.has(stage)) {
                    stageStats[stage].entered += 1;
                    visitedStages.add(stage);
                }

                if (i < sorted.length - 1 && sorted[i + 1].stage !== stage) {
                    stageStats[stage].exited += 1;
                }
            }
        });

        // Calculate drop-off %
        return Object.entries(stageStats).map(([stage, { entered, exited }]) => {
            const dropOffCount = entered - exited;
            const dropOffRate = ((dropOffCount / entered) * 100).toFixed(2);

            return {
                stage,
                entered,
                exited,
                dropOffCount,
                dropOffRate,
            };
        }).sort((a, b) => b.dropOffRate - a.dropOffRate);
    };

    const handleCloseDropoffModal = () => {
        setDropoffModalVisible(false);
        setStageDropData([]); // clear previous stage drop data
    };

    const handleCloseBottleneckModal = () => {
        setBottleneckModalVisible(false);
        setBottlenecks([]); // clear previous bottleneck data
    };

    const handleCloseUserPerformanceModal = () => {
        setUserPerformanceVisible(false);
        setUserPerformanceData([]); // clear previous performance data
    };


    const handleCloseInfoModal = () => {
        setInfoModalVisible(false);
        setSelectedAppData(null);
        setSelectedAppNo(null);
        setShowApplicantDetails(false);
        setShowIndividual(false);
    };

    const handleCloseTatModal = () => {
        setTatModalVisible(false);
        // Optional reset if you want to clear previously selected state
        setSelectedAppNo(null);
    };

    const handleCloseTatInfoModal = () => {
        setTatInfoModalVisible(false);
        setTatResults([]);           // Clear TAT breakdown data
        setSelectedAppNo(null);      // Reset selected app number (optional)
    };

    const handleCloseForecastModal = () => {
        setForecastModalVisible(false);
        // setSelectedForecastStage(null);  // optional — only if you use this
        // setForecastResults([]);          // optional — clear previous data if applicable
    };
    const [isFiltering, setIsFiltering] = useState(false);

    const handleApplyFilter = useCallback(() => {
        setIsFiltering(true);

        // Use a short timeout to yield control to UI thread (prevents freeze)
        setTimeout(() => {
            const min = minAmountRaw;
            const max = maxAmountRaw;

            const filtered = AllDataofApplication.filter((app) => {
                const loan = Number(app.loanAmount || 0);

                switch (amountFilterType) {
                    case 'BETWEEN':
                        return min != null && max != null && loan >= min && loan <= max;
                    case 'LESS_THAN':
                        return max != null && loan <= max;
                    case 'GREATER_THAN':
                        return min != null && loan >= min;
                    default:
                        return false;
                }
            });

            setResults(filtered);
            setLastResults(filtered);

            const message =
                filtered.length > 0
                    ? `Found ${filtered.length} applications.`
                    : 'No applications found.';

            // Avoid overlapping TTS speech
            // Tts.stop();
            // Tts.speak(message);

            setIsFiltering(false);
        }, 50); // small delay keeps UI snappy
    }, [AllDataofApplication, minAmountRaw, maxAmountRaw, amountFilterType]);

    return (


        <SafeAreaView style={styles.container}>
            <StatusBar
                translucent
                backgroundColor="#2196F3"
                barStyle="light-content"
            />


            {/* <ScrollView contentContainerStyle={styles.scrollContainer} > */}

            <SimpleModal visible={dropoffModalVisible} onClose={handleCloseDropoffModal} title="🚧 Stage Conversion Drop-off">
                {stageDropData.map((item, i) => (
                    <View key={i} style={styles.tatItem}>
                        <Text style={styles.tatStage}>Stage: {item.stage}</Text>
                        <Text>Entered: {item.entered}</Text>
                        <Text>Exited: {item.exited}</Text>
                        <Text style={styles.dropOffText}>Drop-off: {item.dropOffCount} ({item.dropOffRate}%)</Text>
                    </View>
                ))}
            </SimpleModal>

            <SimpleModal visible={bottleneckModalVisible} onClose={handleCloseBottleneckModal} title="⏱️ Bottleneck Stage Transitions">
                {bottlenecks.map((item, i) => (
                    <View key={i} style={styles.tatItem}>
                        <Text style={styles.tatStage}>{item.transition}</Text>
                        <Text>Avg Time: {item.avgTime} hrs</Text>
                        <Text>Occurrences: {item.count}</Text>
                    </View>
                ))}
            </SimpleModal>


            <SimpleModal visible={userPerformanceVisible} onClose={handleCloseUserPerformanceModal} title="👤 User Performance Insights">
                {userPerformanceData.map((item, i) => (
                    <View key={i} style={styles.tatItem}>
                        <Text style={styles.tatStage}>User: {item.user}</Text>
                        <Text>Transitions: {item.transitions}</Text>
                        <Text>Avg Time: {item.avgTime} hrs</Text>
                    </View>
                ))}
            </SimpleModal>

            <SimpleModal visible={infoModalVisible} onClose={handleCloseInfoModal} >
                {selectedAppData ? (
                    <View>
                        {Object.entries(selectedAppData).map(([key, value]) => {
                            if (key === 'applicant' && Array.isArray(value)) {
                                return (
                                    <View key={key} style={{ marginBottom: 12 }}>
                                        <TouchableOpacity onPress={() => setShowApplicantDetails(v => !v)} style={styles.toggleApplicant}>
                                            <Text style={styles.toggleApplicantText}>{showApplicantDetails ? 'Hide' : 'Show'} Applicant Info</Text>
                                        </TouchableOpacity>


                                        {showApplicantDetails &&
                                            value.map((applicant, idx) => {


                                                return (
                                                    <View key={idx} style={styles.applicantCard}>
                                                        <Text style={styles.applicantTitle}>Applicant {idx + 1}</Text>

                                                        {Object.entries(applicant).map(([aKey, aVal]) => {
                                                            if (aKey === 'individualApplicant' && typeof aVal === 'object' && aVal !== null) {
                                                                return (
                                                                    <View key={aKey} style={{ marginTop: moderateScale(10) }}>
                                                                        <TouchableOpacity
                                                                            onPress={() => setShowIndividual(v => !v)}
                                                                            style={styles.toggleApplicant}
                                                                        >
                                                                            <Text style={styles.toggleApplicantText}>
                                                                                {showIndividual ? 'Hide' : 'Show'} Individual Applicant Info
                                                                            </Text>
                                                                        </TouchableOpacity>

                                                                        {showIndividual && (
                                                                            <View style={styles.individualSection}>
                                                                                {Object.entries(aVal).map(([iKey, iVal]) => (
                                                                                    <Text key={iKey} style={styles.appText}>
                                                                                        {iKey}: {String(iVal)}
                                                                                    </Text>
                                                                                ))}
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                );
                                                            }

                                                            // Normal applicant field
                                                            return (
                                                                <Text key={aKey} style={styles.appText}>
                                                                    {aKey}: {String(aVal)}
                                                                </Text>
                                                            );
                                                        })}
                                                    </View>
                                                );
                                            })}

                                    </View>
                                );
                            }
                            return (
                                <View key={key} style={{ marginBottom: 8 }}>
                                    <Text style={styles.label}>{key}: <Text style={styles.value}>{String(value)}</Text></Text>
                                </View>
                            );
                        })}
                    </View>
                ) : (
                    <View>
                        <Text style={styles.subHeading}>Select an Application Number</Text>
                        {lastResults.filter(app => !!app.applicationNo).map((app, idx) => (
                            <TouchableOpacity key={`${app.applicationNo}-${idx}`} style={styles.appItem} onPress={() => {
                                setSelectedAppNo(app.applicationNo);
                                const selected = AllDataofApplication.find(it => it.applicationNo === app.applicationNo);
                                setSelectedAppData(selected || null);
                                setShowApplicantDetails(false);
                            }}>
                                <Text style={styles.appText}>Application No: {app.applicationNo}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </SimpleModal>


            <SimpleModal visible={TatModalVisible} onClose={handleCloseTatModal} title="Select an Application Number For TAT">
                {lastResults.filter(app => !!app.applicationNo).map((app, idx) => (
                    <TouchableOpacity key={`${app.applicationNo}-${idx}`} style={styles.appItem} onPress={() => getLogsDetailsByApplicationNumberInprogress(app.applicationNo)}>
                        <Text style={styles.appText}>Application No: {app.applicationNo}</Text>
                    </TouchableOpacity>
                ))}
            </SimpleModal>

            <SimpleModal visible={TatInfoModalVisible} onClose={handleCloseTatInfoModal} title={tatResults.length > 0 ? `TAT Breakdown ${selectedAppNo || ''}` : 'TAT Info'}>
                {tatResults.map((tat, idx) => (
                    <View key={idx} style={styles.tatItem}>
                        <Text style={styles.tatStage}>From: {tat.fromStage}</Text>
                        <Text style={styles.tatDescription}>Description: {tat.descriptionFrom}</Text>


                        <Text style={styles.tatStage}>To: {tat.toStage}</Text>
                        <Text style={styles.tatDescription}>Description: {tat.descriptionTo}</Text>


                        <Text style={[styles.tatDuration, parseFloat(tat.durationInHours) > 48 && styles.tatDurationWarning]}>Duration: {tat.durationInHours} hours</Text>
                        <Text style={styles.tatTimestamp}>{tat.fromTime} → {tat.toTime}</Text>
                    </View>
                ))}
            </SimpleModal>

            {/* <AppModal visible={forecastModalVisible} title="Select a Stage" onClose={() => setForecastModalVisible(false)}> */}

            <SimpleModal visible={forecastModalVisible} onClose={handleCloseForecastModal} >
                {['DDE', 'Pre-UnderWriting', 'UnderWriting','Disbursement', 'Sanctioned', 'Disbursed', 'Rejected'].map(stage => (
                    <TouchableOpacity
                        key={stage}
                        onPress={() => handleForecastStageSelect(stage)}
                        style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}
                    >
                        <Text style={{ fontSize: 16, color: 'black', fontWeight: '500' }}>{stage}</Text>
                    </TouchableOpacity>

                ))}
            </SimpleModal>
            {/* </AppModal> */}


            {/* Filters area (modernized layout) */}
            <View style={styles.filterCard}>
                <Text style={styles.filterTitle}>Filters</Text>



                <CustomDropdown
                    label="Choose an Option"
                    data={dropdownOptions}
                    value={selectedValue}
                    onChange={onStatusChange}
                    placeholder="Select Status"
                />

                <CustomDropdown
                    data={[
                        { label: 'Tell me more', value: 'MORE_INFO' },
                        { label: 'Show me all', value: 'SHOW_ALL' },
                        { label: 'Will I make', value: 'FUTURE_BUSINESS' },
                        { label: 'TAT', value: 'TAT' },
                    ]}
                    placeholder="Select Action"
                    value={selectedSecondaryAction}
                    onChange={(item) => {
                        // 🧹 Reset all old states when switching actions
                        setSelectedSecondaryAction(null);

                        if (item?.value === 'SHOW_ALL') {
                            setSelectedValue(null);
                        }

                        if (item?.value === 'FUTURE_BUSINESS') {
                            setSelectedValue(null);
                            setForecastStage(null);
                            setResults([]);
                            setLastResults([]);
                            setBusinessAmount(null);
                        }

                        // Save new action
                        setSelectedSecondaryAction(item);

                        // Run respective logic
                        handleSecondaryAction(item.value);
                    }}
                />

                <CustomDropdown
                    data={[
                        { label: 'Between', value: 'BETWEEN' },
                        { label: 'Less than', value: 'LESS_THAN' },
                        { label: 'Greater than', value: 'GREATER_THAN' },
                    ]}
                    placeholder="Select Loan Filter Type"
                    value={selectedFilterOption} // 👈 controlled value
                    onChange={(item) => {
                        setSelectedFilterOption(item);       // store full selected item
                        setSelectedSecondaryAction(null)
                        setAmountFilterType(item.value);     // your logic
                        setForecastStage('')
                        setBusinessAmount('')
                        setMinAmountRaw('');
                        setMaxAmountRaw('');
                    }}
                />


                {/* Numeric inputs */}


                <TouchableOpacity
                    onPress={!isFiltering ? handleApplyFilter : null}
                    activeOpacity={0.8}
                    style={{
                        backgroundColor: isFiltering ? '#ccc' : '#007bff',
                        paddingVertical: moderateScale(10),
                        borderRadius: moderateScale(10),
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'row',
                        marginTop: moderateScale(12),
                    }}
                >
                    {isFiltering ? (
                        <>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={{ color: '#fff', marginLeft: 8, fontWeight: '600' }}>
                                Filtering...
                            </Text>
                        </>
                    ) : (
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                            Apply Loan Filter
                        </Text>
                    )}
                </TouchableOpacity>

                {BusinessAmount && parseFloat(BusinessAmount) > 0 && (
                    <View style={styles.businessCard}>
                        <Text style={styles.businessText}>
                            {(() => {
                                const amount = parseFloat(BusinessAmount);
                                let displayValue = "";
                                let unit = "";

                                if (amount >= 10000000) {
                                    // ≥ 1 crore
                                    displayValue = (amount / 10000000).toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    });
                                    unit = "Crores";
                                } else {
                                    // < 1 crore — show in lakhs
                                    displayValue = (amount / 100000).toLocaleString('en-IN', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                    });
                                    unit = "Lakhs";
                                }

                                return `💰 Total Business: ₹ ${displayValue} ${unit}`;
                            })()}
                        </Text>
                    </View>
                )}



            </View>

            {/* </ScrollView> */}

            {
                amountFilterType === 'BETWEEN' && (
                    <>
                        <TextInput
                            placeholder="Minimum Amount (in lakh, e.g. ₹6,50,000)"
                            keyboardType="numeric"
                            returnKeyType="done"
                            maxLength={9}
                            value={formatNumberWithCommas(minAmountRaw)}
                            onChangeText={handleMinChange}
                            placeholderTextColor='#888'
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Maximum Amount (in lakh, e.g. ₹6,50,000)"
                            keyboardType="numeric"
                            returnKeyType="done"
                            maxLength={9}
                            value={formatNumberWithCommas(maxAmountRaw)}
                            onChangeText={handleMaxChange}
                            placeholderTextColor='#888'
                            style={styles.input}
                        />
                    </>
                )
            }

            {
                amountFilterType === 'LESS_THAN' && (
                    <TextInput
                        placeholder="Maximum Amount (in lakh, e.g.  ₹6,50,000)"
                        keyboardType="numeric"
                        returnKeyType="done"
                        maxLength={9}
                        value={formatNumberWithCommas(maxAmountRaw)}
                        onChangeText={handleMaxChange}
                        placeholderTextColor='#888'
                        style={styles.input}
                    />
                )
            }

            {
                amountFilterType === 'GREATER_THAN' && (
                    <TextInput
                        placeholder="Minimum Amount (in lakh, e.g.  ₹6,50,000)"
                        keyboardType="numeric"
                        returnKeyType="done"
                        maxLength={9}
                        value={formatNumberWithCommas(minAmountRaw)}
                        onChangeText={handleMinChange}
                        placeholderTextColor='#888'
                        style={styles.input}
                    />
                )
            }


            {/* ✅ FIXED LIST AREA */}
            <View style={{ flex: 1, backgroundColor: '#fff', borderTopLeftRadius: moderateScale(12), borderTopRightRadius: moderateScale(12) }}>
                {forecastStage && (
                    <View style={styles.stageHeader}>
                        <Text style={styles.stageHeaderText}>
                            Showing applications in: <Text style={styles.stageHighlight}>{forecastStage}</Text> Stage
                        </Text>
                    </View>
                )}

                <FlatList
                    data={results}
                    keyExtractor={(item, i) => String(i)}
                    renderItem={renderResultCard}
                    contentContainerStyle={{
                        padding: moderateScale(12),
                        flexGrow: 1,
                        paddingBottom: moderateScale(20), // give breathing space
                    }}
                    ListEmptyComponent={() => (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No applications in this stage.</Text>
                        </View>
                    )}
                />
            </View>



        </SafeAreaView >
    )
}

export default AIassistant

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f7fb' },
    header: {
        height: verticalScale(60),
        backgroundColor: '#0b63d6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: moderateScale(12),
    },
    backArrow: { fontSize: moderateScale(22), color: 'white' },
    headerTitle: { fontSize: moderateScale(18), color: 'white', fontWeight: '700' },


    scrollContainer: { paddingBottom: moderateScale(90) },


    // Modal
    modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: moderateScale(16) },
    modalCard: { backgroundColor: 'white', borderRadius: moderateScale(12), padding: moderateScale(14), maxHeight: verticalScale(680) },
    modalTitle: { fontSize: moderateScale(16), color: '#888', fontWeight: '700', marginBottom: moderateScale(8), textAlign: 'center' },
    modalFooter: { marginTop: moderateScale(10) },


    // Cards
    filterCard: { backgroundColor: 'white', borderRadius: moderateScale(10), padding: moderateScale(12), marginBottom: moderateScale(10), elevation: 2 },
    filterTitle: { fontSize: moderateScale(16), fontWeight: '700', marginBottom: moderateScale(8) },

    dropdowncontainer: { marginVertical: 5 },
    dropdown: { height: verticalScale(44), borderWidth: 1, borderColor: '#e0e6ef', borderRadius: moderateScale(8), justifyContent: 'center', paddingHorizontal: moderateScale(10), backgroundColor: '#fafcff' },
    dropdownText: { fontSize: moderateScale(14), color: '#333' },
    secondaryList: { marginTop: moderateScale(8), backgroundColor: '#fff', borderRadius: moderateScale(8), overflow: 'hidden', borderWidth: 1, borderColor: '#eef2ff' },
    secondaryItem: { padding: moderateScale(10), borderBottomWidth: 1, borderBottomColor: '#f1f5ff' },
    secondaryText: { fontSize: moderateScale(14), color: 'black' },


    smallBtn: { paddingVertical: moderateScale(8), paddingHorizontal: moderateScale(8), borderRadius: moderateScale(8), borderWidth: 1, borderColor: '#d7def7' },
    smallBtnActive: { backgroundColor: '#eaf2ff', borderColor: '#9fc1ff' },
    smallBtnText: { fontSize: moderateScale(12) },
    smallBtnTextActive: { fontWeight: '700' },


    input: {
        // height: verticalScale(44),
        // color: '#333', fontSize: moderateScale(14), fontWeight: '700',
        // borderRadius: moderateScale(8), borderWidth: 1, borderColor: '#e6e9f2',
        // paddingHorizontal: moderateScale(8), marginTop: moderateScale(8),
        // backgroundColor: '#fff'

        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        color: '#000',
        fontSize: width < 380 ? 12 : 13,
        // width: '100%',
        minHeight: 36,
    },


    applyBtn: { marginTop: moderateScale(12), backgroundColor: '#0b63d6', paddingVertical: moderateScale(12), borderRadius: moderateScale(8), alignItems: 'center' },
    applyBtnText: { color: 'white', fontWeight: '700', fontSize: moderateScale(14) },


    businessCard: { marginTop: moderateScale(10), backgroundColor: '#eef6ff', padding: moderateScale(10), borderRadius: moderateScale(8) },
    businessText: { fontSize: moderateScale(14), fontWeight: '700', color: '#0b63d6' },


    // Result card
    listWrap: { height: height * 0.55, borderTopLeftRadius: moderateScale(12), borderTopRightRadius: moderateScale(12), backgroundColor: '#fff', overflow: 'hidden' },
    resultCard: { backgroundColor: '#fff', marginBottom: moderateScale(10), padding: moderateScale(12), borderRadius: moderateScale(8), elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: moderateScale(6) },
    resultText: { fontSize: moderateScale(13), color: '#333' },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: moderateScale(40),
    },

    emptyText: {
        fontSize: moderateScale(14),
        color: '#666',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    stageHeader: {
        paddingVertical: moderateScale(8),
        paddingHorizontal: moderateScale(12),
        backgroundColor: '#f2f7ff',
        borderRadius: moderateScale(8),
        marginHorizontal: moderateScale(12),
        marginBottom: moderateScale(6),
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },

    stageHeaderText: {
        fontSize: moderateScale(14),
        color: '#444',
        fontWeight: '500',
    },

    stageHighlight: {
        color: '#0066cc',
        fontWeight: '700',
    },



    // TAT / app listing
    tatItem: { backgroundColor: '#fbfdff', padding: moderateScale(12), marginBottom: moderateScale(10), borderRadius: moderateScale(8), borderLeftWidth: moderateScale(4), borderLeftColor: '#0b63d6' },
    tatStage: { fontSize: moderateScale(14), fontWeight: '600', color: '#0b2b45' },
    tatDuration: { fontSize: moderateScale(13), color: '#0b63d6', marginTop: moderateScale(6) },
    tatDurationWarning: { color: '#d9534f', fontWeight: '700' },
    tatTimestamp: { fontSize: moderateScale(12), color: '#6b7280', marginTop: moderateScale(6) },
    tatDescription: { fontSize: moderateScale(12), color: '#465669', marginTop: moderateScale(6) },
    dropOffText: { color: '#d9534f', fontWeight: '700', marginTop: moderateScale(6) },


    subHeading: { fontSize: moderateScale(15), fontWeight: '600', marginBottom: moderateScale(8) },


    appItem: { backgroundColor: '#f7f9ff', padding: moderateScale(12), borderRadius: moderateScale(8), marginVertical: moderateScale(6) },
    appText: { color: '#123', fontWeight: '600' },
    label: { fontSize: moderateScale(13), color: '#334155' },
    value: { fontWeight: '600' },


    toggleApplicant: { padding: moderateScale(8), backgroundColor: '#eef3ff', borderRadius: moderateScale(8) },
    toggleApplicantText: { fontWeight: '700', color: '#0b63d6' },
    applicantCard: { padding: moderateScale(8), marginTop: moderateScale(8), backgroundColor: '#fff', borderRadius: moderateScale(8) },
    applicantTitle: { fontWeight: '700', marginBottom: moderateScale(6) },
    dropdownContainer: {
        borderWidth: 1,
        borderColor: '#e0e6ef',
        borderRadius: 8,
        backgroundColor: '#fff'
    },

})