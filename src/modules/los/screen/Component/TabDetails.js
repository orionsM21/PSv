import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';
import { useSelector } from 'react-redux';
import ApplicationCardDetail from './ApplicationCardDetail';
import Card from './Card';
const { width } = Dimensions.get('window');

// ✅ LeadCard (Pure + Memoized)
const LeadCard = React.memo(({ item, expandedItem, toggleExpand, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={() => onPress(item)}>
            {/* Collapsed Header */}
            <View style={styles.collapsedHeader}>
                <View style={{ flex: 1 }}>
                    {item?.organizationName ? (
                        <Text style={styles.cardTitle}>
                            Organization Name: <Text style={styles.cardText}>{item.organizationName}</Text>
                        </Text>
                    ) : (
                        <Text style={styles.cardTitle}>
                            Lead Name:{' '}
                            <Text style={styles.cardText}>
                                {item.firstName} {item?.middleName} {item.lastName}
                            </Text>
                        </Text>
                    )}

                    <Text style={styles.cardTitle}>
                        Lead ID: <Text style={styles.cardText}>{item.leadId}</Text>
                    </Text>

                    {item?.applicantCategoryCode && (
                        <Text style={styles.cardTitle}>
                            Applicant Category: <Text style={styles.cardText}>{item.applicantCategoryCode}</Text>
                        </Text>
                    )}

                    {item?.appId && (
                        <Text style={styles.cardTitle}>
                            Application Number: <Text style={styles.cardText}>{item.appId}</Text>
                        </Text>
                    )}

                    {item?.assignTo?.userName && (
                        <Text style={styles.cardTitle}>
                            Pending at: <Text style={styles.cardText}>{item.assignTo?.userName}</Text>
                        </Text>
                    )}
                </View>

                {/* Expand / Collapse */}
                <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                    <Text style={styles.expandIcon}>
                        {expandedItem === item.id ? '▲' : '▼'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Expanded Content */}
            {expandedItem === item.id && (
                <View style={styles.expandedContent}>
                    {[
                        ['Gender', item.gender],
                        ['Mobile Number', item.mobileNo],
                        ['Email', item.email],
                        ['Lead Stage', item.leadStage],
                        ['Lead Status', item?.leadStatus?.leadStatusName],
                        ['PAN', item.pan],
                        [
                            'Assigned To',
                            `${item.assignTo?.firstName || ''} ${item.assignTo?.lastName || 'N/A'}`,
                        ],
                    ].map(([label, value], index) => (
                        <View key={index} style={styles.textRow}>
                            <Text style={styles.cardLabel}>{label}:</Text>
                            <Text style={styles.cardValue} numberOfLines={2}>
                                {value || 'N/A'}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </TouchableOpacity>
    );
});

const TabDetails = ({ route }) => {
    const { data } = route.params;

    const [selectedLead, setSelectedLead] = useState(null);
    const [leadDetails, setLeadDetails] = useState([]);
    const [deviation, setDeviation] = useState([]);
    const [rejectReasons, setRejectReasons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedItem, setExpandedItem] = useState(null);
    const token = useSelector((state) => state.auth.token);
    const navigation = useNavigation();

    const selectedLeadId = useMemo(() => selectedLead?.leadId, [selectedLead]);

    // 🔁 Expand/Collapse Toggle
    const toggleExpand = useCallback(
        (itemId) => setExpandedItem((prev) => (prev === itemId ? null : itemId)),
        []
    );

    // 📍 Navigate to Lead
    const handleCardPress = useCallback(
        (item) => navigation.navigate('Lead', { selectedLeadfromtab: item }),
        [navigation]
    );

    // 📡 Fetch Lead Details
    const fetchLeadDetails = useCallback(async (leadId) => {
        if (!leadId) return;
        setLoading(true);
        try {
            const headers = {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            };

            const [leadByIdRes, leadRes, deviationRes, rejectRes] = await Promise.all([
                axios.get(`${BASE_URL}getLeadByLeadId/${leadId}`, { headers }),
                axios.get(`${BASE_URL}lead/${leadId}`, { headers }),
                axios.get(`${BASE_URL}getDeviationByLeadId/${leadId}`, { headers }),
                axios.get(`${BASE_URL}getAllRejectReason`, { headers }),
            ]);

            setLeadDetails(leadByIdRes.data.data || []);
            setDeviation(deviationRes.data.data || []);

            const reasons = rejectRes.data?.data?.content?.map((r) => ({
                label: r.rejectReasonName,
                value: r.rejectReasonId,
            })) || [];
            setRejectReasons(reasons);
        } catch (err) {
            console.error('Error fetching lead details:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (selectedLeadId) fetchLeadDetails(selectedLeadId);
    }, [selectedLeadId, fetchLeadDetails]);

    return (
        <Provider>
            <View style={styles.container}>
                <FlatList
                    data={data || []}
                    keyExtractor={(item, index) => item?.leadId?.toString() || index.toString()}
                    renderItem={({ item, index }) => (
                        <Card
                            item={item}
                            index={index}
                            handleCardPress={handleCardPress}
                            expandedItem={expandedItem}
                            toggleExpand={toggleExpand}
                            isExpanded={expandedItem === index}
                        />
                    )}
                    ListEmptyComponent={<Text style={styles.emptyListText}>No leads found</Text>}
                    showsVerticalScrollIndicator={false}
                    initialNumToRender={10}
                    removeClippedSubviews
                />
            </View>
        </Provider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingTop: 10,
    },
    card: {
        backgroundColor: '#fff',
        marginHorizontal: 10,
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 8,
        elevation: 4,
        marginVertical: 6,
        borderWidth: 0.6,
        borderColor: '#E8EAF0',
    },
    collapsedHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1E293B',
        marginBottom: 2,
    },
    cardText: {
        fontSize: 14,
        color: '#334155',
        fontWeight: '500',
    },
    expandIcon: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    expandedContent: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    textRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
        marginVertical: 4,
    },
    cardLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#475569',
        flex: 1,
    },
    cardValue: {
        fontSize: 14,
        color: '#0F172A',
        flex: 1.5,
    },
    emptyListText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 17,
        fontWeight: '600',
        color: '#94A3B8',
    },
});

export default TabDetails;
