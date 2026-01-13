import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
    View,
    ScrollView,
    StyleSheet,
    Alert,
    Dimensions,
    useColorScheme,
    Keyboard, TouchableOpacity, ActivityIndicator, TextInput, Text, Image, Modal, FlatList, RefreshControl
} from 'react-native';
import { Divider, Provider, Button, } from 'react-native-paper';
import axios from 'axios';
import { Dropdown } from 'react-native-element-dropdown';
import { useSelector } from 'react-redux';
import { BASE_URL } from '../../api/Endpoints';

const { height, width } = Dimensions.get('screen');

const renderInputField = (
    label,
    value,
    onChangeText,
    editable = true,
    placeholder = '',
    keyboardType = 'default',
    maxLength = null,
    fieldName = '',
    error = ''
) => {
    const colorScheme = useColorScheme();
    const placeholderColor = colorScheme === 'dark' ? '#d3d3d3' : '#808080';

    return (
        <View style={styles.inputField}>
            <Text style={styles.labelformodal}>
                {label}
                <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
                value={value}
                onChangeText={
                    typeof onChangeText === 'function' ? onChangeText : () => { }
                }
                editable={editable}
                placeholder={placeholder}
                placeholderTextColor={placeholderColor}
                style={[
                    styles.inputformodal,
                    { borderColor: error ? 'red' : 'gray', fontSize: 10, borderWidth: 1 },
                ]}
                keyboardType={keyboardType}
                maxLength={maxLength ?? undefined}
            />
            {!!error && (
                <Text style={styles.errorText}>
                    {error}
                </Text>
            )}
        </View>
    );
};


const renderInput = (label, value, isValid = null, editable = false, multiline = false) => (
    <View style={{ flex: 1, paddingHorizontal: 5 }}>
        <Text style={styles.labelformodal}>
            {label}
            {isValid && (
                <Image
                    source={require('../../asset/greencheck.png')} // Replace with your tick icon path
                    style={{ width: 10, height: 10, marginLeft: 5 }}
                />
            )}
        </Text>

        {/* Displaying the value in a TextInput */}
        <TextInput
            style={[
                styles.inputformodal,
                multiline && styles.inputMultiline,
            ]}
            value={value !== null && value !== undefined ? String(value) : ''}
            editable={editable}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'} // Align text to the top for multiline inputs
        />
    </View>
);

const Enquiry = () => {
    const colorScheme = useColorScheme();
    const placeholderColor = colorScheme === 'dark' ? '#d3d3d3' : '#808080';
    const token = useSelector((state) => state.auth.token);
    const mkc = useSelector((state) => state.auth.losuserDetails);
    const [portfolios, setPortfolios] = useState([]);
    const [products, setProducts] = useState([]);
    const [pincodes, setPincodes] = useState([]);
    const [isModalVisiblecreate, setIsModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAllLeads, setShowAllLeads] = useState(false);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedPincode, setSelectedPincode] = useState(null);
    
    const [mobileNumber, setMobileNumber] = useState('');
    const [firstName, setFirstName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [lastName, setLastName] = useState('');
    const [refreshing, setrefreshing] = useState(false);
    const [EnquiryData, setEnquiryData] = useState([]);
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedLead, setSelectedLead] = useState([]);
    const [isLoadingsendotp, setIsLoadingsentotp] = useState(false);
    const [loading, setloading] = useState(false);
    
    const onRefresh = useCallback(async () => {
        setrefreshing(true);
        try {
            await getAllEnquiry(); // Wait for the worklist to be fetched
        } catch (error) {
            console.error("Failed to refresh worklist:", error);
        } finally {
            setrefreshing(false); // Ensure refreshing is turned off
        }
    }, []);
    const [drawerVisible, setDrawerVisible] = useState(false);

    const toggleDrawer = () => {
        setDrawerVisible(!drawerVisible);
    };
    const [locationData, setLocationData] = useState({
        cityName: '',
        stateName: '',
        countryName: '',
        areaName: ''
    });

    const transformedPincodes = useMemo(() => {
        return pincodes.map(({ pincodeId, pincode }) => ({
            label: pincode.toString(),
            value: pincodeId
        }));
    }, [pincodes]);

    const getAllPortfolios = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllPortfolios`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const portfolios = response.data?.data?.content || [];
            const mapped = portfolios.map(p => ({
                label: p.portfolioDescription,
                value: p.portfolioId
            }));
            setPortfolios(mapped);
        } catch {
            Alert.alert('Error', 'Failed to load portfolios');
        }
    }, [token]);

    const getProductsByPortfolioId = useCallback(async () => {
        if (!selectedPortfolio?.value) return;

        try {
            const response = await axios.get(`${BASE_URL}getProductDetailsByPortfolioId/${selectedPortfolio.value}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const allProducts = response.data?.data || [];
            const filtered = allProducts.filter(p => p.active === "true");
            const mapped = filtered.map(p => ({
                label: p.productName,
                value: p.productId
            }));
            setProducts(mapped);
        } catch {
            Alert.alert('Error', 'Failed to load products');
        }
    }, [selectedPortfolio, token]);

    const getAllPincodes = useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllPincodes`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const content = response.data?.data?.content || [];
            const transformed = content.map(p => ({
                pincodeId: p.pincodeId,
                pincode: p.pincode
            }));
            setPincodes(transformed);
        } catch {
            Alert.alert('Error', 'Failed to load pincodes');
        }
    }, [token]);

    const getLocationByPincode = useCallback(async () => {
        const pincodeToUse = selectedPincode?.label || selectedLead?.pincode?.pincode;

        if (!pincodeToUse) return;

        try {
            const response = await axios.get(`${BASE_URL}findAreaNameCityStateRegionZoneCountryByPincode/${pincodeToUse}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setLocationData(response.data?.data || {});
        } catch {
            Alert.alert('Error', 'Failed to fetch location data');
        }
    }, [selectedPincode, selectedLead, token]);


    const getAllEnquiry = async () => {
        try {
            const response = await axios.get(`${BASE_URL}getAllEnquiry`, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token, // Add the token to the Authorization header
                }
            });

            const allLeads = response.data.data;
            // const updatedLead = allLeads.filter(val => val.enquiryStatus.enquiryStatusName !== 'Closed' && val.isConvertedToLead !== true)
            setEnquiryData(allLeads)
            
        } catch (error) {
            console.error('Error fetching leads:', error);
            Alert.alert('Error', 'Failed to fetch leads');
        }
    };

    useEffect(() => {
        getAllPortfolios();
        getAllPincodes();
        getAllEnquiry();
    }, [getAllPortfolios, getAllPincodes]);

    useEffect(() => {
        getProductsByPortfolioId();
    }, [getProductsByPortfolioId]);

    useEffect(() => {
        getLocationByPincode();
    }, [getLocationByPincode]);

    const renderDropdown = (label, data, value, setValue, placeholder) => (
        <View style={styles.inputField}>
            <Text style={styles.labelformodal}>
                {label}
                <Text style={styles.required}>*</Text>
            </Text>
            <Dropdown
                data={data}
                labelField="label"
                valueField="value"
                value={value}
                placeholder={placeholder}
                onChange={setValue}
                search
                style={styles.dropdown1}
                placeholderStyle={styles.placeholderStyle}
                selectedTextStyle={styles.selectedText}
                inputSearchStyle={styles.searchInput}
                renderItem={({ label }) => (
                    <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>{label}</Text>
                    </View>
                )}
            />
        </View>
    );
    const handlCreatEnquiryCancel = async () => {
        setIsModalVisible(false);
        setFirstName('');
        setLastName('');
        setMiddleName('');
        setMobileNumber('');
        setSelectedPincode(null);
        setSelectedPortfolio(null);
        setSelectedProduct(null);
        setLocationData({
            cityName: '',
            stateName: '',
            countryName: '',
            areaName: ''
        });
        setSelectedLead([]);
    }



    const handleSubmit = async () => {
        if (!selectedPortfolio || !selectedProduct || !selectedPincode || !mobileNumber || !firstName || !lastName) {
            Alert.alert("Validation Error", "Please fill all required fields.");
            return;
        }
        setIsLoadingsentotp(true);
        setloading(true);
        const payload = {
            createdBy: mkc?.userName, // You can replace this with the logged-in user's ID if available from Redux
            firstName: firstName.trim(),
            middleName: middleName.trim(),
            lastName: lastName.trim(),
            mobileNo: mobileNumber.trim(),
            portfolioId: selectedPortfolio.value,
            pincodeId: selectedPincode.value,
            product: selectedProduct.value,
            cityName: locationData.cityName,
            id: ""
        };

        try {
            const response = await axios.post(`${BASE_URL}createEnquiry`, payload, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });
            
            if (response.data.msgKey === 'Success') {
                Alert.alert("Success", "Enquiry created successfully");
                handlCreatEnquiryCancel();
                // Optionally reset form here
                getAllEnquiry();
                setIsLoadingsentotp(false);
                setloading(false);
            } else {
                Alert.alert("Error", response.data?.message || "Something went wrong");
                setIsLoadingsentotp(false);
                setloading(false);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to create enquiry");
            setIsLoadingsentotp(false);
            setloading(false);
        }
    };

    const handleClose = () => {
        setModalVisible(false);
        setSelectedLead([]);
    }
    const handleCreatePress = () => {
        setIsModalVisible(true);
        // setActiveTab('Applicant');
        // setAllLoeds([]);
        // setLeadsWithLoanAmount([]);
    };

    const handleSearch = (text) => {
        setSearchQuery(text);
    };

    const filteredData = EnquiryData.filter((item) => {
        if (!searchQuery) return true; // ✅ Show all items if there's no search

        const query = searchQuery.toLowerCase();

        return (
            item?.firstName?.toLowerCase().includes(query) ||
            item?.lastName?.toLowerCase().includes(query) ||
            item?.mobileNo?.toLowerCase().includes(query) ||
            item?.enquiryStatus?.enquiryStatusName?.toLowerCase().includes(query) ||
            item?.enquiryId?.toLowerCase().includes(query) ||
            item?.product?.productName?.toLowerCase().includes(query) ||
            item?.assignTo?.userName?.toLowerCase().includes(query) ||
            item?.cityName?.toLowerCase().includes(query)

            // || (item?.dateOfBirth && calculateAge(item.dateOfBirth) === parseInt(query))
        );
    });


    const handleCardPress = (item) => {
          // Log before setting state
        setSelectedLead(item);  // Set selected lead
        setModalVisible(true);  // Show modal
        // setActiveTabView('Applicant');
    };
    const LeadCard = ({ item }) => {
        const [expandedItem, setExpandedItem] = useState(null);
        const toggleExpand = (itemId) => {
            setExpandedItem(prevState => prevState === itemId ? null : itemId);
        };
        return (
            <TouchableOpacity style={styles.card} onPress={() => handleCardPress(item)}>
                {/* Collapsed View */}

                <View style={styles.collapsedHeader}>
                    <View>
                        <Text style={styles.cardTitle}>
                            Lead Name:  <Text style={styles.cardText} >{item.firstName} {item.lastName} </Text>
                        </Text>
                        <Text style={styles.cardTitle}>
                            Enquiry id: <Text style={styles.cardText}>{item.enquiryId}</Text>
                        </Text>
                        {item?.enquiryStatus?.enquiryStatusName && (
                            <Text style={styles.cardTitle}>
                                EnquiryStatus:  <Text style={styles.cardText}>{item.enquiryStatus.enquiryStatusName} </Text>
                            </Text>
                        )}
                    </View>
                    <TouchableOpacity onPress={() => toggleExpand(item.id)}>
                        <Text style={styles.expandIcon}>
                            {expandedItem === item.id ? '▲' : '▼'} {/* Toggle icon */}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Expanded View */}
                {expandedItem === item.id && (

                    <View style={styles.expandedContent}>

                        {/* <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>EnquiryStatus:</Text>
                            <Text style={styles.cardValue}>{item?.enquiryStatus?.enquiryStatusName || 'N/A'}</Text>
                        </View> */}

                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>MobileNumber:</Text>
                            <Text style={styles.cardValue}>{item?.mobileNo || 'N/A'}</Text>
                        </View>
                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>product:</Text>
                            <Text style={styles.cardValue}>{item?.product?.productName || 'N/A'}</Text>
                        </View>

                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>City:</Text>
                            <Text style={styles.cardValue}>{item?.cityName || 'N/A'}</Text>
                        </View>


                        <View style={styles.textRow}>
                            <Text style={styles.cardLabel}>Assigned To:</Text>
                            <Text style={styles.cardValue}>
                                {/* {item.assignTo?.firstName || ''} {item.assignTo?.lastName || 'N/A'} */}
                                {item.assignTo?.userName || 'N/A'}

                            </Text>
                        </View>
                    </View>
                )}
            </TouchableOpacity>
        );
    };


    return (

        <Provider>
            <View style={styles.firstrow}>
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search..."
                    placeholderTextColor={'#888'}
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                {/* <TouchableOpacity style={styles.createButton} onPress={handleCreatePress}>
                    <Text style={styles.createButtonText}>Create</Text>
                </TouchableOpacity> */}

            </View>

            {/* <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>
                    {showAllLeads ? '' : ''}
                </Text>
                <Switch
                    value={showAllLeads}
                    onValueChange={(value) => setShowAllLeads(value)}
                />
            </View>*/}

            <FlatList
                // data={EnquiryData}
                data={filteredData}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <LeadCard item={item} />}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={<Text style={styles.emptyListText}>No data available</Text>}

            />


            <Modal transparent visible={isLoadingsendotp}>
                <View style={styles.loaderFullScreen}>
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#040675FF" />
                        <Text style={styles.loadingText}>Processing...</Text>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isModalVisiblecreate}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainerdetail}>
                    <View style={styles.modalContentdetail}>
                        <ScrollView >
                            <Text style={styles.title}>Create Enquiry</Text>

                            <View style={styles.row}>
                                {renderInputField("First Name", firstName, setFirstName, true, "Enter your first name", "default", undefined, "firstName")}
                                {/* {renderInputField("Middle Name", middleName, setMiddleName, true, "Enter your middle name")} */}
                                <View style={{ flex: 1, paddingHorizontal: 5 }}>
                                    <View style={{ flexDirection: 'column' }}>
                                        <Text style={styles.labelformodal}>{'Middle Name'}</Text>
                                        <TextInput
                                            style={[
                                                styles.inputformodal, { borderWidth: 1, fontSize: 10, borderColor: 'gray' }
                                            ]}
                                            value={middleName}
                                            onChangeText={setMiddleName}
                                            placeholder='Enter Your Middle Name'
                                            placeholderTextColor={'#888'}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.row}>
                                {renderInputField("Last Name", lastName, setLastName, true, "Enter your last name")}
                                {renderInputField("Mobile Number", mobileNumber, (text) => {
                                    const clean = text.replace(/[^0-9]/g, '');
                                    if (clean.length <= 10) setMobileNumber(clean);
                                }, true, "Enter 10-digit number", "numeric", 10)}
                            </View>

                            <View style={styles.row}>
                                {renderDropdown("Portfolio", portfolios, selectedPortfolio, setSelectedPortfolio, "Select Portfolio")}
                                {renderDropdown("Product", products, selectedProduct, setSelectedProduct, "Select Product")}
                            </View>

                            <View style={styles.row}>
                                {renderDropdown("Pincode", transformedPincodes, selectedPincode, setSelectedPincode, "Select Pincode")}
                                {renderInputField("Country", locationData.countryName, () => { }, false, "Country")}
                            </View>

                            <View style={styles.row}>
                                {renderInputField("City", locationData.cityName, () => { }, false, "City")}
                                {renderInputField("State", locationData.stateName, () => { }, false, "State")}
                            </View>

                            <View style={styles.buttonContainer}>
                                {loading ? (
                                    <ActivityIndicator size="large" color="#4CAF50" />
                                ) : (
                                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                                        <Text style={styles.submitText}>Submit</Text>
                                    </TouchableOpacity>
                                )}
                                {/* <Button mode="outlined" style={styles.cancelButton} onPress={handlCreatEnquiryCancel}>
                                    Cancel
                                </Button> */}

                                <TouchableOpacity style={styles.cancelButton} onPress={handlCreatEnquiryCancel}>
                                    <Text style={styles.submitText}>Cancel</Text>
                                </TouchableOpacity>

                            </View>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainerdetail}>
                    <View style={styles.modalContentdetail}>
                        {selectedLead && (
                            <>
                                <ScrollView >
                                    <View style={styles.row}>
                                        {renderInputField("Name", `${selectedLead?.firstName} `, false)}

                                        {/* {renderInputField("Middle Name", `${selectedLead?.middleName} `, false)} */}
                                        <View style={{ flex: 1, paddingHorizontal: 5 }}>
                                            <View style={{ flexDirection: 'column' }}>
                                                <Text style={styles.labelformodal}>{'Middle Name'}</Text>
                                                <TextInput
                                                    style={[
                                                        styles.inputformodal, { borderWidth: 1, fontSize: 10, borderColor: 'gray' }
                                                    ]}
                                                    value={selectedLead?.middleName}
                                                    // onChangeText={setMiddleName}
                                                    placeholder='Enter Your Middle Name'
                                                    placeholderTextColor={placeholderColor}

                                                    editable={false}
                                                />
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.row}>
                                        {renderInputField("Last Name", `${selectedLead?.lastName} `, false)}
                                        {renderInputField("MobileNo", `${selectedLead?.mobileNo} `, false)}
                                    </View>

                                    <View style={styles.row}>
                                        {renderInputField("Portfolio", `${selectedLead?.portfolio?.portfolioDescription} `, false)}
                                        {renderInputField("Product", `${selectedLead?.product?.productName} `, false)}
                                    </View>

                                    <View style={styles.row}>
                                        {renderInputField("Enquiry ID", `${selectedLead?.enquiryId} `, false)}
                                        {renderInputField("Assign To", `${selectedLead?.assignTo?.userName} `, false)}
                                    </View>

                                    <View style={styles.row}>
                                        {/* {selectedLead?.loanAmount != null && */}
                                        {renderInputField("Loan Amount", String(selectedLead?.loanAmount), false)}
                                        {/* } */}


                                        {renderInputField("Pincode", `${selectedLead?.pincode?.pincode} `, false)}
                                    </View>

                                    <View style={styles.row}>
                                        {renderInputField("Area", `${selectedLead?.pincode?.areaName} `, false)}
                                        {renderInputField("City", locationData.cityName, () => { }, false, "City")}

                                    </View>



                                    <View style={styles.row}>

                                        {renderInputField("State", locationData.stateName, () => { }, false, "State")}
                                        {renderInputField("Country", locationData.countryName, () => { }, false, "Country")}
                                    </View>



                                    {/* <View style={styles.row}>
                                        {renderInput("City", `${selectedLead?.cityName} `, false)}
                                        {renderInput("Country", `${'India'} `, false)}
                                    </View>
                                    <View style={styles.row}>
                                        {renderInput("State", `${selectedLead?.pincode?.pincode} `, false)}

                                    </View> */}
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity style={styles.submitButton} onPress={handleClose}>
                                            <Text style={styles.submitText}>Cancel</Text>
                                        </TouchableOpacity>
                                    </View>
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>

        </Provider >
    );
};

const styles = StyleSheet.create({
    header: {
        height: 60,
        backgroundColor: '#007bff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    drawerIcon: {
        width: 30,
        height: 30,
        tintColor: 'white'
    },
    backArrow: {
        fontSize: 24,
        color: 'white',
    },
    headerTitle: {
        color: 'white',
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
        backdropColor:"rgba(0,0,0,0.5)",
        zIndex: 1,  // Ensure the drawer appears above other content
    },
    scrollContainer: {
        marginTop: 100,
    },
    menuIcon: {
        width: 30,
        height: 30,
    },
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#615E5EFF'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
        gap: 10,
    },
    inputField: {
        flex: 1,
        paddingHorizontal: 5,
    },
    labelformodal: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        color: 'black',
        marginLeft: 10
    },
    required: {
        color: 'red',
    },
    inputformodal: {
        height: height * 0.05,
        borderRadius: 5,
        paddingHorizontal: 10,
        fontSize: 12,
        backgroundColor: '#f9f9f9',
        fontWeight: 'bold',
        color: 'black',
    },
    dropdown1: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        padding: 6,
        backgroundColor: '#f9f9f9',
        height: height * 0.05,
    },
    dropdownItem: {
        padding: 6,
        backgroundColor: '#fff',
    },
    dropdownItemText: {
        fontSize: 12,
        color: 'black',
    },
    selectedText: {
        fontSize: 12,
        color: 'black',
    },
    searchInput: {
        fontSize: 12,
        color: 'black',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginTop: 5,
    },

    submitButton: {
        flex: 1,
        backgroundColor: '#1976d2',
    },
    cancelButton: {
        flex: 1,
        borderColor: '#d32f2f',
    },
    submitButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
    },
    submitText: {
        color: 'white',
        fontWeight: 'bold',
    },
    firstrow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width * 0.9,
        marginHorizontal: 15,
        marginVertical: 15, // Use percentage to ensure responsive layout
    },
    searchBar: {
        flex: 1,
        height: height * 0.05,
        borderColor: '#ccc',
        borderWidth: 1,
        paddingHorizontal: 10,
        marginRight: 10,
        borderRadius: 5,
        color: 'black'
    },

    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginVertical: 10,
        color: 'black'
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    inputGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        top: 15,
    },
    inputField: {
        flex: 1, paddingHorizontal: 5, width: width * 0.25,
    },
    labelmodal: {
        fontSize: 12,
        marginBottom: 4,
        color: 'black',
        fontWeight: 'bold',
    },
    value: {
        fontSize: 14,
        color: 'gray',
    },

    inputmodal: {
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        fontSize: 12,
        backgroundColor: '#f9f9f9',
        color: 'black',
        width: width * 0.4,
        height: height * 0.042,

    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',


    },
    button: {
        marginHorizontal: 5,
    },
    required: {
        color: 'red',
    },
    createButton: {
        borderWidth: 1,
        borderColor: 'black',
        padding: 8,
        borderRadius: 6,
    },
    createButtonText: {
        color: 'black',
        fontSize: 12,
        fontWeight: '500',
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
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0C0C0CFF',
    },
    cardText: {
        fontSize: 13,
        color: '#353333FF',
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
    modalContainerdetail: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backdropColor:"rgba(0,0,0,0.5)",
    },
    modalContentdetail: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        width: width * 1,
        // height: height * 0.9, // Prevent modal from overflowing
    },
    modalTitledetail: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },

    modalContainerdetail: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)', // Semi-transparent backdrop
    },

    modalContentdetail: {
        width: '90%',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        maxHeight: '80%',
    },

    submitText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
    },

    submitButton: {
        backgroundColor: '#1976d2',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'center',
    },

    modalContainerdetail: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backdropColor:"rgba(0,0,0,0.5)",
    },
    modalContentdetail: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        maxHeight: '90%',
    },
    submitButton: {
        backgroundColor: '#1976d2',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginRight: 5,
    },
    cancelButton: {
        backgroundColor: '#d32f2f',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        alignItems: 'center',
        marginRight: 5,
    },
    submitText: {
        color: 'white',
        fontWeight: 'bold',
    },

    placeholderStyle: {
        color: 'black',
        fontSize: 12,
    },
    loaderContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backdropColor:"rgba(0,0,0,0.5)", // Semi-transparent background
        justifyContent: 'center',
        alignItems: 'center',
    },

    loaderFullScreen: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
    },

    loaderOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: 'black',
        fontSize: 16,
    },

});

export default Enquiry;


// import React, { useState, useRef } from 'react';
// import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Platform } from 'react-native';
// import { TextInput, Button, Text, ActivityIndicator, HelperText, Chip } from 'react-native-paper';
// import { Formik } from 'formik';
// import * as Yup from 'yup';
// import axios from 'axios';
// import DocumentPicker from 'react-native-document-picker';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// // ---- CONFIG ----
// // Replace with your API base url
// const BASE_URL = 'https://api.example.com';

// // ---- Utilities ----
// const calculateEMI = (principal, annualRate, months) => {
//   const P = Number(principal) || 0;
//   const r = Number(annualRate) / 12 / 100 || 0;
//   const n = Number(months) || 0;
//   if (!P || !n || r === 0) return (P / n) || 0;
//   const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
//   return emi;
// };

// // ---- Validation Schema ----
// const validationSchema = Yup.object().shape({
//   firstName: Yup.string().required('First name is required'),
//   mobile: Yup.string()
//     .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit mobile number')
//     .required('Mobile is required'),
//   loanAmount: Yup.number().min(1, 'Enter valid amount').required('Loan amount is required'),
//   tenure: Yup.number().min(1, 'Tenure must be >= 1').required('Tenure is required'),
//   goldWeight: Yup.number().min(0.1, 'Enter weight').required('Gold weight is required'),
// });

// export default function Enquiry({ navigation }) {
//   const [uploading, setUploading] = useState(false);
//   const [docs, setDocs] = useState([]);
//   const [emiPreview, setEmiPreview] = useState(null);
//   const formikRef = useRef();

//   const pickDocument = async () => {
//     try {
//       const res = await DocumentPicker.pickMultiple({
//         type: [DocumentPicker.types.images, DocumentPicker.types.pdf],
//       });
//       // normalize
//       const mapped = res.map(r => ({
//         uri: r.uri,
//         name: r.name || `doc_${Date.now()}`,
//         size: r.size,
//         type: r.type || (r.name?.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'),
//       }));
//       setDocs([...docs, ...mapped]);
//     } catch (err) {
//       if (!DocumentPicker.isCancel(err)) {
//         Alert.alert('Error', 'Unable to pick document');
//       }
//     }
//   };

//   const removeDoc = (index) => {
//     const copy = [...docs];
//     copy.splice(index, 1);
//     setDocs(copy);
//   };

//   const saveOffline = async (values) => {
//     try {
//       const pending = JSON.parse(await AsyncStorage.getItem('pendingGoldLoans')) || [];
//       pending.push({ id: Date.now(), values, docs });
//       await AsyncStorage.setItem('pendingGoldLoans', JSON.stringify(pending));
//       Alert.alert('Saved', 'Application saved locally. Will submit when online.');
//     } catch (e) {
//       console.warn(e);
//       Alert.alert('Error', 'Failed to save locally');
//     }
//   };

//   const submitToServer = async (values) => {
//     setUploading(true);
//     try {
//       // 1) Submit application data
//       const payload = {
//         ...values,
//         goldPurity: values.goldPurity || '916',
//       };

//       const { data: appResponse } = await axios.post(`${BASE_URL}/applyLoan`, payload, {
//         headers: { 'Content-Type': 'application/json' },
//       });

//       const applicationId = appResponse?.data?.applicationId || appResponse?.applicationId;

//       // 2) Upload documents if present
//       if (docs.length > 0 && applicationId) {
//         const formData = new FormData();
//         docs.forEach((d, idx) => {
//           // When using fetch or axios with FormData on React Native, make sure uri and name are set
//           formData.append('files', {
//             uri: Platform.OS === 'android' ? d.uri : d.uri.replace('file://', ''),
//             name: d.name,
//             type: d.type,
//           });
//         });
//         formData.append('applicationId', applicationId);

//         await axios.post(`${BASE_URL}/uploadDocuments`, formData, {
//           headers: { 'Content-Type': 'multipart/form-data' },
//         });
//       }

//       Alert.alert('Success', 'Application submitted successfully');
//       // reset
//       setDocs([]);
//       formikRef.current?.resetForm();
//     } catch (err) {
//       console.warn(err);
//       Alert.alert('Submit failed', 'Unable to submit. Save offline or try again.');
//     } finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
//       <Formik
//         innerRef={formikRef}
//         initialValues={{
//           firstName: '',
//           middleName: '',
//           lastName: '',
//           dob: '',
//           gender: '',
//           mobile: '',
//           email: '',
//           address: '',
//           state: '',
//           city: '',
//           pincode: '',
//           loanAmount: '',
//           tenure: '',
//           purpose: '',
//           goldType: 'Ornaments',
//           goldWeight: '',
//           goldPurity: '916',
//         }}
//         validationSchema={validationSchema}
//         onSubmit={async (values) => {
//           // calculate EMI preview
//           const emi = calculateEMI(values.loanAmount, 12.0, values.tenure || 12); // example 12% default
//           setEmiPreview(emi);

//           Alert.alert(
//             'Confirm',
//             `EMI will be approximately ₹${emi.toFixed(2)}. Submit application?`,
//             [
//               { text: 'Cancel', style: 'cancel' },
//               {
//                 text: 'Save offline',
//                 onPress: () => saveOffline(values),
//               },
//               {
//                 text: 'Submit',
//                 onPress: () => submitToServer(values),
//               },
//             ]
//           );
//         }}
//       >
//         {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
//           <View>
//             <Text style={styles.heading}>Gold Loan Application</Text>

//             <TextInput
//               label="First Name"
//               value={values.firstName}
//               onChangeText={handleChange('firstName')}
//               onBlur={handleBlur('firstName')}
//               style={styles.input}
//             />
//             {touched.firstName && errors.firstName && <HelperText type="error">{errors.firstName}</HelperText>}

//             <TextInput
//               label="Middle Name"
//               value={values.middleName}
//               onChangeText={handleChange('middleName')}
//               onBlur={handleBlur('middleName')}
//               style={styles.input}
//             />

//             <TextInput
//               label="Last Name"
//               value={values.lastName}
//               onChangeText={handleChange('lastName')}
//               onBlur={handleBlur('lastName')}
//               style={styles.input}
//             />

//             <TextInput
//               label="Date of Birth (YYYY-MM-DD)"
//               value={values.dob}
//               onChangeText={handleChange('dob')}
//               onBlur={handleBlur('dob')}
//               style={styles.input}
//             />

//             <TextInput
//               label="Mobile"
//               keyboardType="phone-pad"
//               value={values.mobile}
//               onChangeText={handleChange('mobile')}
//               onBlur={handleBlur('mobile')}
//               style={styles.input}
//             />
//             {touched.mobile && errors.mobile && <HelperText type="error">{errors.mobile}</HelperText>}

//             <TextInput
//               label="Email"
//               value={values.email}
//               onChangeText={handleChange('email')}
//               onBlur={handleBlur('email')}
//               style={styles.input}
//             />

//             <TextInput
//               label="Address"
//               value={values.address}
//               onChangeText={handleChange('address')}
//               onBlur={handleBlur('address')}
//               multiline
//               style={[styles.input, { height: 80 }]}
//             />

//             <Text style={styles.subHeading}>Loan Details</Text>

//             <TextInput
//               label="Loan Amount (₹)"
//               keyboardType="numeric"
//               value={String(values.loanAmount)}
//               onChangeText={handleChange('loanAmount')}
//               onBlur={handleBlur('loanAmount')}
//               style={styles.input}
//             />
//             {touched.loanAmount && errors.loanAmount && <HelperText type="error">{errors.loanAmount}</HelperText>}

//             <TextInput
//               label="Tenure (months)"
//               keyboardType="numeric"
//               value={String(values.tenure)}
//               onChangeText={handleChange('tenure')}
//               onBlur={handleBlur('tenure')}
//               style={styles.input}
//             />
//             {touched.tenure && errors.tenure && <HelperText type="error">{errors.tenure}</HelperText>}

//             <TextInput
//               label="Purpose"
//               value={values.purpose}
//               onChangeText={handleChange('purpose')}
//               onBlur={handleBlur('purpose')}
//               style={styles.input}
//             />

//             <Text style={styles.subHeading}>Gold Details</Text>

//             <TextInput
//               label="Gold Type"
//               value={values.goldType}
//               onChangeText={handleChange('goldType')}
//               onBlur={handleBlur('goldType')}
//               style={styles.input}
//             />

//             <TextInput
//               label="Gold Weight (grams)"
//               keyboardType="numeric"
//               value={String(values.goldWeight)}
//               onChangeText={handleChange('goldWeight')}
//               onBlur={handleBlur('goldWeight')}
//               style={styles.input}
//             />
//             {touched.goldWeight && errors.goldWeight && <HelperText type="error">{errors.goldWeight}</HelperText>}

//             <TextInput
//               label="Gold Purity (e.g. 916)"
//               keyboardType="numeric"
//               value={values.goldPurity}
//               onChangeText={handleChange('goldPurity')}
//               onBlur={handleBlur('goldPurity')}
//               style={styles.input}
//             />

//             <View style={{ marginVertical: 10 }}>
//               <Text style={{ marginBottom: 6 }}>Documents</Text>
//               <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
//                 {docs.map((d, idx) => (
//                   <Chip key={idx} onClose={() => removeDoc(idx)} style={styles.chip}>
//                     {d.name}
//                   </Chip>
//                 ))}
//               </View>

//               <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
//                 <Button mode="outlined" onPress={pickDocument} style={{ flex: 1 }}>
//                   Pick Documents
//                 </Button>
//                 <Button
//                   mode="contained"
//                   onPress={() => setDocs([])}
//                   style={{ marginLeft: 8 }}
//                 >
//                   Clear
//                 </Button>
//               </View>
//             </View>

//             <View style={{ marginVertical: 12 }}>
//               <Button mode="contained" onPress={handleSubmit} disabled={uploading}>
//                 {uploading ? 'Processing...' : 'Preview & Submit'}
//               </Button>
//             </View>

//             {emiPreview !== null && (
//               <View style={{ padding: 10 }}>
//                 <Text>EMI Preview: ₹{emiPreview.toFixed(2)}</Text>
//               </View>
//             )}

//             {uploading && (
//               <View style={{ marginTop: 12 }}>
//                 <ActivityIndicator animating size="large" />
//               </View>
//             )}
//           </View>
//         )}
//       </Formik>
//     </ScrollView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { padding: 16, backgroundColor: '#fff' },
//   heading: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
//   subHeading: { marginTop: 12, fontWeight: '600', marginBottom: 6 },
//   input: { marginBottom: 10 },
//   chip: { marginTop: 6 },
// });

