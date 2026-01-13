import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Animated, Easing, Modal, Button } from 'react-native'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native'
import { BASE_URL } from '../../api/Endpoints'
import { useSelector } from 'react-redux'
import axios from 'axios'
// import Tts from 'react-native-tts';
// import Voice from '@react-native-voice/voice';
import { debounce } from 'lodash';

const AIassistant = () => {
    const navigation = useNavigation();
    const [AllDataofApplication, setAllDataofApplication] = useState([])
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
    const [results, setResults] = useState([]);
    const [lastResults, setLastResults] = useState([]);
    const [BusinessAmount, setBusinessAmount] = useState([]);
    const micScale = useRef(new Animated.Value(1)).current;
    const wasSpeakingRef = useRef(false);
    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [selectedAppNo, setSelectedAppNo] = useState(null);
    const [selectedAppData, setSelectedAppData] = useState(null);
    const [showApplicantDetails, setShowApplicantDetails] = useState(false);
    const [forecastModalVisible, setForecastModalVisible] = useState(false);

    const [forecastStage, setForecastStage] = useState(null);

    const [ttsRate, setTtsRate] = useState(0.6);
    const [voiceLang, setVoiceLang] = useState('en-IN');
    // const [results, setResults] = useState([]);
    useEffect(() => {
        // if (isFocused && token) {
        fetchData();
        // getAllApliction();
        // }
    }, []);
    const fetchData = async () => {
        setIsLoading(true); // Start loading indicator

        try {
            // Step 1: Fetch Leads
            const leadsResponse = await axios.get(`${BASE_URL}getLeads`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const leadsData = leadsResponse?.data?.data?.filter((lead) => {
                if (lead.applicantTypeCode !== 'Applicant' || lead.createdBy !== mkc.userName) {
                    return false; // Keep only 'Applicant' leads created by the current user
                }

                // Check if there's a matching Co-Applicant with the same leadId
                return leadsResponse?.data?.data?.some(
                    (coLead) => coLead.applicantTypeCode === 'Co-Applicant' && coLead.leadId === lead.leadId
                );
            }) || [];


            if (!Array.isArray(leadsData) || leadsData.length === 0) {
                // 
                // Alert.alert('No Data', 'No leads found.');
                setIsLoading(false);
                return;
            }

            // Step 2: Fetch Applications
            const applicationsResponse = await axios.get(`${BASE_URL}getAllApplication`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            let applicationsData = applicationsResponse?.data?.data;

            // Ensure applicationsData is always an array
            if (!Array.isArray(applicationsData)) {
                applicationsData = [];
            }

            if (applicationsData.length === 0) {
                // 
                // Alert.alert('No Data', 'No applications found.');
                setIsLoading(false);
                return;
            }

            // 


            // Update state after fetching both leads and applications
            const InprogresapplicationsData = applicationsData.filter(app => app.stage !== "Closed" && app.stage !== "Rejected");
            const disbursedCase = applicationsData.filter(app => app.stage === 'Closed')
            const rejectedCase = applicationsData.filter(app => app.stage === 'Rejected')
            // setLeads(leadsData);
            setApplications(InprogresapplicationsData);
            setOGDisbursed(disbursedCase)
            setOGreject(rejectedCase)
            setAllDataofApplication(applicationsData)

            // Step 3: Fetch Logs Details (Only after leads & applications are fetched)
            await getLogsDetailsByApplicationNumber(applicationsData);
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load data. Please try again.');
        } finally {
            setIsLoading(false); // Stop loading indicator
            setIsRefreshing(false); // Stop refreshing
        }
    };

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

            // 
            // 
            // 
            // 
            // 
            // 
            // 
            // // 
            // 
            // 
            // 

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

    const useMicAnimation = () => {
        const pulseAnim = useRef(new Animated.Value(1)).current;

        const startMicAnimation = () => {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.5,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        };

        const stopMicAnimation = () => {
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();
        };

        return { pulseAnim, startMicAnimation, stopMicAnimation };
    };

    // useEffect(() => {
    //     Tts.getInitStatus()
    //         .then(() => Tts.voices())
    //         .then(voices => {
    //             const safeVoice = voices.find(v =>
    //                 v.language === 'en-US' &&
    //                 !v.notInstalled &&
    //                 !v.id.includes('x-')
    //             );

    // if (safeVoice) {

    // Tts.setDefaultLanguage(safeVoice.language);
    // Tts.setDefaultVoice(safeVoice.id);
    // }

    // Tts.setDefaultRate(0.5);
    // Tts.setDucking(true);
    // Tts.setDefaultPitch(1.2); // ✅ Set pitch slightly higher for natural tone

    // ✅ Speak welcome message
    // Tts.speak("Hello! I'm your assistant. How can I help you today?");
    // })
    // .catch(err => console.error('TTS Init Error:', err));

    // Tts.addEventListener('tts-start', () => {
    //     wasSpeakingRef.current = true;

    // });

    // Tts.addEventListener('tts-finish', () => {
    //     wasSpeakingRef.current = false;

    // });

    // Tts.addEventListener('tts-cancel', () => {
    //     wasSpeakingRef.current = false;

    // });

    //     return () => {
    //         // Tts.removeAllListeners('tts-start');
    //         // Tts.removeAllListeners('tts-finish');
    //         // Tts.removeAllListeners('tts-cancel');
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

        const statusMatch =
            (statusType === 'PENDING' && isPending) ||
            (statusType === 'APPROVED' && isClosed) ||
            (statusType === 'REJECTED' && app.status === 'REJECTED') ||
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

    // useEffect(() => {
    //     if (!handleQuery) return;

    //     Voice.onSpeechResults = onSpeechResultsHandler;

    //     return () => {
    //         Voice.destroy().then(Voice.removeAllListeners);
    //     };
    // }, [handleQuery]); // 👈 depend on the finalized handleQuery

    // ✅ Voice Results Handler
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


    // ✅ Start Voice
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


    // 2. Voice Tips Component
    const VoiceTips = () => (
        <View style={styles.tipsWrapper}>
            <Text style={styles.tip}>🗣 Try saying:</Text>
            <Text style={styles.tip}>"Show pending applications above 5 lakhs"</Text>
            <Text style={styles.tip}>"Tell me more about application 2"</Text>
            <Text style={styles.tip}>"Clear results" or "Stop"</Text>
        </View>
    );

    // 3. TTS Rate Selector
    const TTSRateControl = ({ rate, onChange }) => (
        <View style={styles.rateControl}>
            <Text style={styles.rateText}>Voice Speed:</Text>
            {[0.4, 0.6, 0.8, 1].map(r => (
                <TouchableOpacity
                    key={r}
                    onPress={() => {
                        // Tts.setDefaultRate(r);
                        onChange(r);
                    }}
                    style={[styles.rateButton, rate === r && styles.rateSelected]}
                >
                    <Text>{r}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    // 4. Language Picker
    const LanguagePicker = ({ selected, onLanguageChange }) => (
        <View style={styles.langControl}>
            <Text style={styles.langText}>Language:</Text>
            {['en-IN', 'hi-IN', 'ta-IN'].map(lang => (
                <TouchableOpacity
                    key={lang}
                    onPress={() => onLanguageChange(lang)}
                    style={[styles.langButton, selected === lang && styles.langSelected]}
                >
                    <Text>{lang}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const handleForecastStageSelect = (stage) => {
        setForecastModalVisible(false);
        setForecastStage(stage);

        const matchedApps = AllDataofApplication.filter(app => app.stage === stage);
        const totalAmount = matchedApps.reduce((sum, app) => sum + Number(app.loanAmount || 0), 0);
        const amountInLakhs = (totalAmount / 100000).toFixed(2);

        if (matchedApps.length > 0) {
            // Tts.speak(`If all applications in ${stage} stage close successfully, you'll make ${amountInLakhs} lakh rupees.`);
            setResults(matchedApps); // Optional: Show in UI
            setLastResults(matchedApps);
            setBusinessAmount(amountInLakhs); // Reuse same state if you want
        } else {
            // Tts.speak(`There are no applications in ${stage} stage currently.`);
            setResults([]);
            setLastResults([]);
            setBusinessAmount(null);
        }
    };

    return (
        <View style={styles.container}>

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                {/* <Text style={styles.headerTitle}></Text> */}
            </View>

            <View style={{ padding: 10 }}>
                <Animated.View style={{ transform: [{ scale: micScale }], alignSelf: 'center' }}>
                    <TouchableOpacity
                        onPress={startListening}
                        onLongPress={stopListening}
                        style={styles.listenButton}
                    >
                        <Text style={styles.listenText}>🎙️ Speak</Text>
                    </TouchableOpacity>
                </Animated.View>


                {/* Voice Tips */}
                <VoiceTips />

                {/* TTS Rate Control */}
                {/* <TTSRateControl rate={ttsRate} onChange={setTtsRate} /> */}

                {/* Language Picker */}
                {/* <LanguagePicker selected={voiceLang} onLanguageChange={setVoiceLang} /> */}

                <Modal
                    visible={forecastModalVisible}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setForecastModalVisible(false)}
                >
                    <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <View style={{ margin: 20, backgroundColor: '#fff', borderRadius: 10, padding: 20 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>Select a Stage:</Text>

                            {['DDE', 'Pre-UnderWriting', 'UnderWriting', 'Sanctioned'].map(stage => (
                                <TouchableOpacity
                                    key={stage}
                                    onPress={() => handleForecastStageSelect(stage)}
                                    style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}
                                >
                                    <Text style={{ fontSize: 16, color: 'black', fontWeight: '500' }}>{stage}</Text>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity onPress={() => setForecastModalVisible(false)} style={{ marginTop: 20 }}>
                                <Text style={{ textAlign: 'center', color: 'red' }}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal visible={infoModalVisible} animationType="slide" transparent>
                    <View style={styles.modalContainer}>
                        <ScrollView>
                            {selectedAppData ? (
                                <View style={styles.modalContent}>
                                    <Text style={styles.heading}>Application Info</Text>

                                    {Object.entries(selectedAppData).map(([key, value]) => {
                                        if (key === 'applicant' && Array.isArray(value)) {
                                            return (
                                                <View key={key} style={{ marginBottom: 12 }}>
                                                    <TouchableOpacity
                                                        onPress={() => setShowApplicantDetails(!showApplicantDetails)}
                                                        style={{ padding: 10, backgroundColor: '#eee', borderRadius: 6 }}
                                                    >
                                                        <Text style={{ fontWeight: 'bold', color: 'black' }}>
                                                            {showApplicantDetails ? 'Hide' : 'Show'} Applicant Info
                                                        </Text>
                                                    </TouchableOpacity>

                                                    {showApplicantDetails && value.map((applicant, index) => (
                                                        <View key={index} style={{ marginTop: 10, paddingLeft: 10 }}>
                                                            <Text style={{ fontWeight: 'bold', color: 'black' }}>Applicant {index + 1}</Text>

                                                            {Object.entries(applicant).map(([appKey, appVal]) => {
                                                                if (appKey === 'individualApplicant' && typeof appVal === 'object' && appVal !== null) {
                                                                    return (
                                                                        <View key={appKey} style={{ marginTop: 8, paddingLeft: 10 }}>
                                                                            <Text style={{ fontWeight: '600', color: 'black', marginBottom: 4 }}>
                                                                                Individual Applicant:
                                                                            </Text>
                                                                            {Object.entries(appVal).map(([indKey, indVal]) => (
                                                                                <Text key={indKey} style={{ marginLeft: 10, color: 'black' }}>
                                                                                    {indKey}: {String(indVal)}
                                                                                </Text>
                                                                            ))}
                                                                        </View>
                                                                    );
                                                                }

                                                                return (
                                                                    <Text key={appKey} style={{ marginLeft: 10, color: 'black' }}>
                                                                        {appKey}: {String(appVal)}
                                                                    </Text>
                                                                );
                                                            })}
                                                        </View>
                                                    ))}
                                                </View>
                                            );
                                        }

                                        // Normal fields outside of 'applicant'
                                        return (
                                            <View key={key} style={{ marginBottom: 8 }}>
                                                <Text style={styles.label}>{key}:{String(value)}</Text>
                                                {/* <Text style={styles.value}>{String(value)}</Text> */}
                                            </View>
                                        );
                                    })}

                                    <Button
                                        title="Close"
                                        onPress={() => {
                                            setInfoModalVisible(false);
                                            setSelectedAppNo(null);
                                            setSelectedAppData(null);
                                            setShowApplicantDetails(false);
                                        }}
                                    />
                                </View>
                            ) : (
                                <View style={styles.modalContent}>
                                    <Text style={styles.heading}>Select an Application Number</Text>
                                    {lastResults.map((app, index) => (
                                        <TouchableOpacity
                                            key={`${app.applicationNo}-${index}`}
                                            style={styles.appItem}
                                            onPress={() => {
                                                setSelectedAppNo(app.applicationNo);
                                                const selected = AllDataofApplication.find(
                                                    item => item.applicationNo === app.applicationNo
                                                );
                                                setSelectedAppData(selected);
                                                setShowApplicantDetails(false);
                                            }}
                                        >
                                            <Text style={{ color: 'black', fontWeight: '500' }}>
                                                Application No: {app.applicationNo}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}

                                    <Button title="Cancel" onPress={() => setInfoModalVisible(false)} />
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </Modal>




                {BusinessAmount && (
                    <View style={{ padding: 10, backgroundColor: '#eef', borderRadius: 8, marginBottom: 10 }}>
                        <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'black' }}>
                            Total Business: ₹ {BusinessAmount} Lakhs
                        </Text>
                    </View>
                )}


                <ScrollView contentContainerStyle={{ padding: 10 }}>
                    {results.map((app, index) => (
                        <View key={index} style={styles.resultCard}>
                            <Text style={styles.resultText}>Stage: {app.stage}</Text>
                            <Text style={styles.resultText}>Loan Amount: ₹{app.loanAmount}</Text>
                            <Text style={styles.resultText}>Status: {app.status}</Text>
                        </View>
                    ))}
                </ScrollView>
            </View>
        </View>
    )
}

export default AIassistant

const styles = StyleSheet.create({
    container: { flex: 1, },
    header: {
        height: 60,
        backgroundColor: '#007bff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginVertical: 0,
    },
    backArrow: {
        fontSize: 24,
        color: 'white',
    },

    listenButton: {
        marginTop: 20,
        alignSelf: 'center',
        backgroundColor: '#007bff',
        padding: 12,
        borderRadius: 8,
    },
    listenText: { color: '#fff', fontSize: 16 },
    queryText: {
        marginTop: 15,
        textAlign: 'center',
        fontSize: 16,
        color: '#333',
    },
    resultCard: {
        backgroundColor: '#fff',
        marginVertical: 8,
        padding: 12,
        borderRadius: 8,
        elevation: 3,
    },
    resultText: {
        fontSize: 14,
        color: '#444',
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
        padding: 20
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10
    },
    appItem: {
        padding: 10,
        borderBottomColor: '#ccc',
        borderBottomWidth: 1
    },
    label: {
        fontWeight: '500',
        color: 'black',
    },
    langText: {
        fontWeight: '500',
        color: 'black',

    },
    tip: {
        fontWeight: '500',
        color: 'black',
    }


})