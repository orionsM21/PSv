import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Button, Card, Divider, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';


import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window')
const Credithistory = ({ route }) => {
    const { data, label } = route.params;
    // console.log(data, 'finalApplicationCredit')
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [ApplicantleadByLeadiD, setApplicantleadByLeadiD] = useState([])
    const [leadByLeadiD, setleadByLeadiD] = useState([]);
    const [leadDetails, setLeadDetails] = useState(null); // Instead of separate states for lead details
    const navigation = useNavigation();
    const selectedLeadId = useMemo(() => selectedLead?.leadId, [selectedLead]);
    const [loading, setLoading] = useState(false);
    const token = useSelector((state) => state.auth.token);
    const toggleDrawer = useCallback(() => {
        setDrawerVisible(prev => !prev);
    }, []);


    const handleCardPress = (item) => {
        navigation.navigate('Applicationhistory', { selectedLeadfromtab: item });
    };
    const [expandedCardIndex, setExpandedCardIndex] = useState(null);

    const toggleCard = index => {
        setExpandedCardIndex(prevIndex => (prevIndex === index ? null : index)); // Only allow one card to expand
    };

    const LeadCard = ({ index, item }) => {
        const applicant = item.applicant[0]?.individualApplicant;
        const applicantName = item.applicant?.find(a => a.applicantTypeCode === 'Applicant');
        const isExpanded = expandedCardIndex === index; // Check if this card is expanded
        const aaplicantName = item.applicant?.find(a => a.applicantTypeCode === 'Applicant')
        return (
            <TouchableOpacity onPress={() => handleCardPress(item)} style={styles.card}>
                <View style={styles.collapsedHeader}>
                    <View>
                        <Text style={styles.cardTitle}>
                            Application Number: {item.applicationNo}
                        </Text>
                        <Text style={styles.cardText}>
                            {/* Name: {applicant?.firstName} {applicant?.lastName} */}
                            Name:  {aaplicantName?.individualApplicant
                                ? `${aaplicantName?.individualApplicant?.firstName || ""} ${aaplicantName?.individualApplicant?.middleName || ""} ${aaplicantName?.individualApplicant?.middleName || ""} ${aaplicantName?.individualApplicant?.lastName || ""}`.trim()
                                : aaplicantName?.organizationApplicant?.organizationName || "N/A"}
                        </Text>

                    </View>

                    {/* Expand/Collapse icon */}
                    <TouchableOpacity onPress={() => toggleCard(index)}>
                        <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                    </TouchableOpacity>
                </View>

                {isExpanded && (
                    <View style={styles.expandedContent}>
                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>Product:</Text>
                            <Text style={styles.cardValue}>{item.productName}</Text>
                        </View>
                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>Portfolio:</Text>
                            <Text style={styles.cardValue}>{item.portfolioDescription}</Text>
                        </View>
                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>Category:</Text>
                            <Text style={styles.cardValue}>{item.applicant[0]?.applicantCategoryCode}</Text>
                        </View>
                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>Mobile No:</Text>
                            <Text style={styles.cardValue}>{applicant?.mobileNumber}</Text>
                        </View>
                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>Stage:</Text>
                            <Text style={styles.cardValue}>{item.stage}</Text>
                        </View>
                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>PAN:</Text>
                            <Text style={styles.cardValue}>{applicant?.pan}</Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <Provider>
         


            <View style={styles.container}>

                {/* <FlatList
                    data={data}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <LeadCard item={item} />}
                /> */}
                <FlatList
                    data={data}
                    // data={applicationData}
                    renderItem={LeadCard}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.scrollContainer}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No applications found</Text>
                    }

                />
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 20,
        backgroundColor: '#fff',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    headerDrawer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#007bff',
    },
    item: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    drawerIcon: {
        tintColor: 'white',
        width: 30,
        height: 30,
    },
    drawerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backdropColor: "rgba(0,0,0,0.5)", // Optional background for drawer
    },
    card: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        marginVertical: 5,
        marginHorizontal: 8,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        width: width * 0.95,

    },
    collapsedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'black',
    },
    cardText: {
        fontSize: 14,
        color: 'black',
        marginTop: 4,
    },
    expandIcon: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
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
        flex: 2, // Allows value to take more space
        textAlign: 'left',
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#888',
    },
    headerTitle: {
        fontWeight: 'bold',
        fontSize: 24,
        color: 'black'
    }
});

export default Credithistory;
