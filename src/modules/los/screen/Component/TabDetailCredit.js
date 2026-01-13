import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Button, Divider, Provider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Card from './Card';
import axios from 'axios';
import { BASE_URL } from '../../api/Endpoints';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window')
const TabDetailsCredit = ({ route }) => {
    const { selectedLeadfromtab } = route.params;

    // Wrap it in an array because FlatList expects an array
    const data = selectedLeadfromtab;
    const leads = Array.isArray(selectedLeadfromtab) ? selectedLeadfromtab : [selectedLeadfromtab];

    console.log(data, selectedLeadfromtab, 'selectedLeadfromtabselectedLeadfromtab')
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
    const [expandedItem, setExpandedItem] = useState(null);
    const toggleExpand = (leadId) => {
        setExpandedItem(prev => prev === leadId ? null : leadId);
    };


    const handleCardPress = (item) => {
        if (item.appId) {
            // Navigate to Credit Lead page if appId exists
            navigation.navigate('Credit Lead', { selectedLeadfromtab: item });
        } else {
            // Navigate to Lead page if appId is missing
            navigation.navigate('Credit Lead', { selectedLeadfromtab: item });
        }
    };




    return (
        <Provider>

            <View style={styles.container}>
                {/* <Text>{data?.leadId}</Text> */}
                <FlatList
                    data={leads}
                    keyExtractor={(item) => item?.leadId}
                    // renderItem={({ item }) => <LeadCard item={item} navigation={navigation} />}
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
        fontWeight: '500',
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

export default TabDetailsCredit;
