import React, { useEffect, useContext, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    Alert,
    FlatList,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';

import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
import { DrawerContext } from '../../../../Drawer/DrawerContext.js';
import ApplicationCardDetail from '../Component/ApplicationCardDetail';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
const { width } = Dimensions.get('screen');

const Decison = () => {
    const token = useSelector((state) => state.auth.token);
    const userDetails = useSelector((state) => state.auth.losuserDetails);

    const navigation = useNavigation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [expandedCardIndex, setExpandedCardIndex] = useState(null);
    const [logDetails, setLogDetails] = useState([]);
    const { navigate, addListener } = useNavigation();
    const [filteredApplicatioNData, setfilteredApplicatioNData] = useState([]);
    const [overAllCasethisStage, setoverAllCasethisStage] = useState([]);
    const [idleApplicationList, setIdleApplicationList] = useState([]);

    const { openDrawer } = useContext(DrawerContext);
    // 
    const toggleDrawer = () => {
        setDrawerVisible(prevState => !prevState); // Make sure to toggle the state correctly
    };

    useEffect(() => {
        const unsubscribe = addListener('blur', () => {
            setDrawerVisible(false); // Close the drawer on screen blur
        });
        return unsubscribe;
    }, [addListener]);

    const [applicationData, setApplicationData] = useState([]);
    const [tableLogData, setTableLogData] = useState()

    const [loading, setLoading] = useState(false);
    const [TableData, setTableData] = useState([])

    const getAllApplication = useCallback(async () => {
        setLoading(true); // Start loader
        try {
            const response = await axios.get(`${BASE_URL}getAllApplication`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            // ✅ Filter only those with stage === "DDE"
            const allApplications = response.data?.data || [];
            const ddeApplications = allApplications.filter(app => app.stage !== "DDE");

            setApplicationData(allApplications); // Update state only with DDE applications
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch application data');
            console.error('API Call Error:', error);
        } finally {
            setLoading(false); // Always stop loader
        }
    }, [token]);


    const getLogsDetailsByApplicationNumber = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllLogsDetails`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const logsData = response.data?.data || [];
            setLogDetails(logsData);

            const appMap = new Map(); // For performance, store latest decision logs by appNo
            const decisionLogSet = new Set(); // For matching in decision logs filtering
            const allowedDescriptions = new Set([
                "decision",
                "decision approve",

            ]);

            // Track all logs created by this user
            const userLogs = logsData.filter(log => log.user === userDetails.userName);

            // Filter logs based on designation
            const decisionLog = userLogs.filter(log => {

                const desc = log.description?.trim().toLowerCase();
                return userDetails.designation === "Branch Operations"
                    ? desc === "decision approve"
                    : desc === "decision";
            });

            // Create set for fast lookup in app filtering
            decisionLog.forEach(log => decisionLogSet.add(log.applicationNumber));

            // Build a map of latest allowed decision logs per appNo for CEO/Sales Head
            if (["CEO", "Sales Head"].includes(userDetails?.designation)) {
                for (const log of logsData) {
                    const appNo = log.applicationNumber;
                    const desc = log.description?.trim().toLowerCase();
                    if (!allowedDescriptions.has(desc)) continue;

                    const existing = appMap.get(appNo);
                    if (!existing || log.createdTime > existing.createdTime) {
                        appMap.set(appNo, log);
                    }
                }
            }

            // Filter applications by:
            // - stage !== 'DDE'
            // - log exists in appMap
            // - log.user === mkc.userName
            const AllfilteredApplications = logsData.filter(
                (item) =>
                    item?.user === userDetails?.userName
                // item?.description ===
                // (userDetails.designation === 'Branch Operations' ? 'Decision Approve' : 'Decision'),
            )


            const applicationNumbersSet = new Set(AllfilteredApplications.map(log => log.applicationNumber));

            // Step 2: Filter full applications from applicationData
            const matchingApplications = applicationData.filter(app =>
                applicationNumbersSet.has(app.applicationNo)
            );

            const OverAllfilteredByDescription = logsData.filter(
                item => item.description === "Decision"
            );


            const OverAllfilteredApplications = applicationData.filter(item =>
                OverAllfilteredByDescription.some(log => log.applicationNumber === item.applicationNo)
            );
            // Step 3: Store in state
            setoverAllCasethisStage(OverAllfilteredApplications);

            // Filter applications by decision logs (user-specific)
            const filteredApplications = applicationData.filter(app =>
                decisionLogSet.has(app.applicationNo)
            );

            setfilteredApplicatioNData(matchingApplications);



        } catch (error) {
            console.error('❌ Error fetching logs details by application number:', error.message || error);
        }
    };

    useEffect(() => {
        if (!logDetails) {
            setTableLogData([])
            return
        }

        const filteredData = logDetails.filter(
            (item) =>
                item?.user === userDetails?.userName &&
                item?.description ===
                (userDetails?.designation === 'Credit Head' || userDetails?.designation === 'Branch Operations'
                    ? 'Decision Approve'
                    : 'Decision'),
        )

        if (userDetails?.designation === 'Sales Head') {
            setTableLogData(logDetails)
        } else {
            setTableLogData(filteredData)
        }
    }, [logDetails, userDetails])



    useEffect(() => {
        if (!applicationData || !tableLogData?.length) {
            setTableData([])
            return
        }

        const applicationNumbers = tableLogData.map((s) => s.applicationNumber)

        const filteredData = applicationData.filter((item) =>
            applicationNumbers.includes(item?.applicationNo),
        ).flatMap((item) => {
            let filteredApplicants = item?.applicant?.filter(
                (data) => data?.applicantTypeCode === 'Applicant',
            )

            if (filteredApplicants.length > 0) {
                return {
                    ...item,
                    applicant: filteredApplicants,
                }
            } else {
                return []
            }
        })

        setTableData(filteredData)

        // window.location.reload();
    }, [applicationData, tableLogData])

    useEffect(() => {
        getAllApplication();
    }, [getAllApplication]);

    useFocusEffect(
        useCallback(() => {
            // Clear the form fields when the page comes into focus
            getAllApplication();
        }, []),
    );

    useEffect(() => {
        if (applicationData.length > 0) {
            // Only fetch logs when applicationData is populated
            getLogsDetailsByApplicationNumber();
        }
    }, [applicationData]); // Trigger when applicationData changes




    const handleCardPress = useCallback(
        (item) => {
            if (item) {
                navigation.navigate('Decision ', { item });
            } else {
                console.warn('No item to pass to Decision');
            }
        },
        [navigation],
    );

    const toggleCard = index => {
        setExpandedCardIndex(prevIndex => (prevIndex === index ? null : index));
    };
    const [BusinessDate, setBusinessDate] = useState([]);
    useEffect(() => {
        const fetchData = async () => {
            try {
                await getBusinessDate(); // ✅ Waits for business date to finish
                await getIdleApplications(); // ✅ Runs only after the first one completes
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [overAllCasethisStage])
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

    const getIdleApplications = async () => {
        try {
            const { data } = await axios.get(`${BASE_URL}getAllLogsDetails`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });

            const [year, month, day] = BusinessDate?.businnessDate || [];
            const now = new Date(year, month - 1, day).getTime();
            const idleList = [];

            // const applications = ['CEO', 'Sales Head'].includes(userDetails?.designation)
            //   ? overAllCasethisStage
            //   : filteredApplicatioNData;

            applicationData.forEach(app => {
                const logs = data.data.filter(log => log.applicationNumber === app.applicationNo);
                // const logs = data?.data
                if (logs.length === 0) return;

                const pendingLogs = logs.filter(log => log.status === 'Pending');

                pendingLogs.forEach(log => {
                    const logCreatedTime = new Date(log.createdTime).getTime();
                    const idleMs = now - logCreatedTime;
                    const idleHours = idleMs / (1000 * 60 * 60);

                    const isUserMatch =
                        userDetails.designation === 'CEO';

                    const isStageValid = !["Disbursed", "Rejected", "Completed"].includes(log.status);

                    if (idleHours > 2 && isUserMatch && isStageValid) {
                        const totalHours = Math.floor(idleHours);
                        const days = Math.floor(totalHours / 24);
                        const hours = totalHours % 24;
                        const idleFormatted = `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;

                        const pendingDescriptions = logs
                            .filter(
                                l =>
                                    l.stage === log.stage &&
                                    l.status === 'Pending' &&
                                    l.applicationNumber === app.applicationNo
                            )
                            .map(l => l.description)
                            .filter((desc, idx, self) => desc && self.indexOf(desc) === idx);

                        idleList.push({
                            applicationNo: app.applicationNo,
                            stage: log.stage,
                            user: log.user,
                            idleHours: idleHours.toFixed(2),
                            idleTime: idleFormatted,
                            lastUpdate: new Date(log.createdTime).toLocaleString(),
                            descriptions: pendingDescriptions,
                        });
                    }


                });
            });



            setIdleApplicationList(idleList);
        } catch (error) {
            console.error('Error fetching idle applications:', error);
        }
    };

    const [expandedAppNo, setExpandedAppNo] = useState(null);

    const handleToggleExpand = (applicationNo) => {
        setExpandedAppNo(prev => (prev === applicationNo ? null : applicationNo));
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <StatusBar
                translucent
                backgroundColor="#2196F3"
                barStyle="light-content"
            />
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={openDrawer}>
                        {/* Custom Drawer Icon */}
                        <Image
                            source={require('../../asset/menus.png')}
                            style={styles.drawerIcon}
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Decision</Text>
                </View>

                {/* Drawer component */}

                <FlatList
                    // data={filteredApplicatioNData}
                    data={userDetails?.designation === "CEO" ? overAllCasethisStage : TableData}
                    // renderItem={renderCard}
                    renderItem={({ item }) => (
                        <ApplicationCardDetail
                            item={item}
                            idleApplicationList={idleApplicationList}
                            userDetails={userDetails}
                            isExpanded={expandedAppNo === item.applicationNo}
                            onToggleExpand={handleToggleExpand}
                            handleCardPress={handleCardPress}
                            currentPages={["Decision", "Decision Approve"]}
                        />
                    )}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.scrollContainer}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No applications found</Text>
                    }
                    initialNumToRender={10} // Render 10 items initially
                    maxToRenderPerBatch={10} // Max items to render per batch (for better performance)
                    windowSize={5} // Keep 5 items ahead and behind the visible ones
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#2196F3', // backgroundColor same as header for seamless look
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },

    // ----- Header -----
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: scale(15),
        paddingVertical: verticalScale(12),
        backgroundColor: '#2196F3',
        paddingTop:
            Platform.OS === 'android' ? StatusBar.currentHeight : verticalScale(5),
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 1 },
    },
    drawerIcon: {
        width: scale(22),
        height: scale(22),
        tintColor: '#FFFFFF',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    drawerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backdropColor: "rgba(0,0,0,0.5)", // Dimmed background
        zIndex: 2, // Increase zIndex so the drawer is above the content
    },

    menuIcon: {
        width: 30,
        height: 30,
    },

    collapsedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    expandIcon: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 10,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 8,
        color: 'black'
    },
    expandedContent: {
        marginTop: 10,
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: '#999999FF',
    },
    textRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    cardLabel: {
        fontWeight: '500',
        color: 'black',
        flex: 1, // Ensures labels are consistent width
    },
    cardValue: {
        color: 'black',
        flex: 3, // Allows value to take more space
        textAlign: 'left',
    },
    cardText: {
        fontSize: 14,
        marginBottom: 4,
        color: '#333',
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#999',
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    closedBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        alignSelf: 'flex-start',
        borderRadius: 5,
        marginBottom: 4,
    },

    closedBadgeText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
    },
});

export default Decison;
