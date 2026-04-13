// FilteredResultsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window')
const FilteredResultsScreen = ({ route }) => {
    const navigation = useNavigation();
    const { results, query } = route.params;
    const uniqueResults = results.filter((value, index, self) =>
        index === self.findIndex((t) => t.applicationNo === value.applicationNo)
    );

    
    const [expandedCardIndex, setExpandedCardIndex] = useState(null);
    const toggleCard = index => {
        setExpandedCardIndex(prevIndex => (prevIndex === index ? null : index));
    };
    const statusOptions = [
        { label: 'DDE', value: 'DDE' },
        { label: 'Pre-UnderWriting', value: 'Pre-UnderWriting' },
        { label: 'UnderWriting', value: 'UnderWriting' },
        { label: 'Sanctioned', value: 'Sanctioned' },
        { label: 'Disbursement', value: 'Disbursement' },
        { label: 'Disbursed', value: 'Disbursed' },
    ];

    const stageOptions = query?.toLowerCase().includes('approved')
        ? statusOptions.filter(option => option.value === 'Disbursed')
        : query?.toLowerCase().includes('pending')
            ? statusOptions.filter(option => option.value !== 'Disbursed')
            : statusOptions;



    const [selectedStatus, setSelectedStatus] = useState(null);
    const [filteredApplications, setFilteredApplications] = useState([]);

    const handleDropdownChange = (item) => {
        setSelectedStatus(item.value);
        const filtered = uniqueResults.filter(app => app.stage === item.value);
        setFilteredApplications(filtered);
        
    };

    const renderCard = ({ index, item }) => {
        const applicant = item.applicant[0]?.individualApplicant;
        const aaplicantName = item.applicant?.find(a => a.applicantTypeCode === 'Applicant')
        const isExpanded = expandedCardIndex === index; // Check if this card is expanded
        return (
            <>
                <TouchableOpacity
                    // onPress={() => handleCardPress(item)}
                    style={styles.card}>
                    <View style={styles.collapsedHeader}>
                        <View>
                            <Text style={styles.cardTitle}>
                                Application Number: {item.applicationNo}
                            </Text>

                            <Text style={styles.cardText}>
                                Name: {aaplicantName?.individualApplicant?.firstName} {aaplicantName?.individualApplicant?.middleName} {aaplicantName?.individualApplicant?.lastName}
                            </Text>

                            <Text style={styles.cardText}>Stage: {item.stage}</Text>
                        </View>

                        {/* Expand/Collapse icon */}
                        <TouchableOpacity onPress={() => toggleCard(index)}>
                            <Text style={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                    </View>
                    {isExpanded && (
                        <>
                            <View style={styles.expandedContent}>
                                <View style={styles.textRow}>
                                    <Text style={styles.cardLabel}>Product:</Text>
                                    <Text style={styles.cardValue}>{item.productName}</Text>
                                </View>
                                <View style={styles.textRow}>
                                    <Text style={styles.cardLabel}>Portfolio:</Text>
                                    <Text style={styles.cardValue}>
                                        {item.portfolioDescription}
                                    </Text>
                                </View>
                                <View style={styles.textRow}>
                                    <Text style={styles.cardLabel}>Category:</Text>
                                    <Text style={styles.cardValue}>
                                        {item.applicant[0]?.applicantCategoryCode}
                                    </Text>
                                </View>
                                <View style={styles.textRow}>
                                    <Text style={styles.cardLabel}>Mobile No:</Text>
                                    <Text style={styles.cardValue}>{applicant?.mobileNumber}</Text>
                                </View>

                                <View style={styles.textRow}>
                                    <Text style={styles.cardLabel}>PAN:</Text>
                                    <Text style={styles.cardValue}>{applicant?.pan}</Text>
                                </View>

                                <View style={styles.textRow}>
                                    <Text style={styles.cardLabel}>LoanAmount:</Text>
                                    <Text style={styles.cardValue}>{item?.loanAmount}</Text>
                                </View>
                            </View>
                        </>
                    )}
                </TouchableOpacity>
            </>
        );
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
                <Dropdown
                    style={styles.dropdown}
                    data={stageOptions}
                    labelField="label"
                    valueField="value"
                    placeholder="Select Status"
                    value={selectedStatus}
                    onChange={handleDropdownChange}
                />


                <FlatList
                    data={selectedStatus ? filteredApplications : uniqueResults}
                    keyExtractor={(item) => item.applicationNo}
                    renderItem={renderCard}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No applications found</Text>
                    }
                    initialNumToRender={10} // Render 10 items initially
                    maxToRenderPerBatch={10} // Max items to render per batch (for better performance)
                />
            </View>
        </View>
    );
};

export default FilteredResultsScreen;

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
    title: { fontSize: 14, fontWeight: '900', marginBottom: 12, },
    label: { fontWeight: 'bold' },
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
        // marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        width: width * 0.95
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: 'black'
    },
    cardText: {
        fontSize: 14,
        marginBottom: 4,
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
    dropdown: {
        height: 50,
        borderColor: '#007bff',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
});
