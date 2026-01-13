import React, { useContext, useState, useCallback, useEffect, useRef, useMemo, memo } from 'react';
import {
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    StatusBar,
    StyleSheet,
    Platform,
    TextInput,
    FlatList, Modal, ScrollView, Dimensions, Switch, Alert
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DrawerContext } from '../Drawer/DrawerContext';
import GlassInput from '../Component/GlassInput';
import GlassDropdown from '../Component/GlassDropdown';
import DateOfBirthInput from '../Component/GlassDatePicker';
const { width, height, } = Dimensions.get('window');
const isSmallScreen = width < 768;
const MAX_WIDTH = 640;
const MAX_HEIGHT_RATIO = 1;
const dummyLeads = [
    { id: "1", name: "Amit Sharma", product: "Personal Loan", status: "Pending", date: "Today" },
    { id: "2", name: "Riya Verma", product: "Business Loan", status: "In Review", date: "Yesterday" },
    { id: "3", name: "Sunil Kumar", product: "Home Loan", status: "Approved", date: "27 Jan" },
];

const Lead = () => {
    const { openDrawer } = useContext(DrawerContext);
    const [isModalVisiblecreate, setIsModalVisiblecreate] = useState(false);
    const [Category, setCategory] = useState([]);
    const [finaloccupation, setfinaloccupation] = useState('');
    const [finaloccupationCo, setfinaloccupationCo] = useState('');
    const [portfolioDescriptions, setPortfolioDescriptions] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [products, setproduct] = useState([]);
    const [selectedportfolio, setSelectedportfolio] = useState(''); // State for selected dropdown value
    const [selectedproduct, setSelectedproduct] = useState('');
    const [payloadportfolio, setpayloadportfolio] = useState('');
    const [payloadproduct, setpayloadproduct] = useState('')
    const [cateselec, setcatselct] = useState('');
    const [indtype, setindtype] = useState([]);
    const [selectedindtype, setselectedindtype] = useState('')
    const [payloadind, setpayloadind] = useState('')
    const [segtype, setsegtype] = useState([]);
    const [LeadDropdown, setLeadDropdown] = useState([]);
    const [BranchName, setBranchname] = useState([]);
    const [SelectdbranchName, setSelectedbranchName] = useState('')
    const [getByType, setgetByType] = useState([]);
    const [getByTypeCo, setgetByTypeCo] = useState([]);
    const [indtypeco, setindtypeco] = useState([]);
    const [selectedindtypeco, setselectedindtypeco] = useState('')
    const [payloadindco, setpayloadindco] = useState('')
    const [segtypeco, setsegtypeco] = useState([]);
    const [LeadSource, setLeadSource] = useState('');
    const [loanPurpose, setLoanPurpose] = useState('');
    const [branchName, setBranchName] = useState('');
    const [dateErrors, setDateErrors] = useState({});
    const [selectedCoApplicant, setSelectedCoApplicant] = useState({});
    const [activeTab, setActiveTab] = useState('Applicant');
    const [applicantForms, setApplicantForms] = useState([]);
    const [showSubmitButton, setShowSubmitButton] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingf, setloading] = useState(false);
    const [loadingCo, setLoadingCo] = useState(false);
    const [CoApllicant, setCoApplicant] = useState(false);
    const [isSettlement, setIsSettlement] = useState(false);
    const [BusinessDate, setBusinessDate] = useState([]);

    const toggleSwitch = () => {
        const nextState = !isSettlement;
        setIsSettlement(nextState);
        setShowSubmitButton(nextState); // Show the button when switch is ON (true), hide when OFF (false)
    };

    const [Pincode, setPincode] = useState([]);
    const [findApplicantByCategoryCod, setFindApplicantByCategoryCod] = useState({
        data: {
            cityName: '',
            stateName: '',
            countryName: '',
            areaName: ''
        }
    });

    const handleSave = () => {

    }
    const handleSubmit = () => {

    }
    const [cofindApplicantByCategoryCod, setcoFindApplicantByCategoryCod] = useState({
        data: {
            cityName: '',
            stateName: '',
            countryName: '',
            areaName: ''
        }
    });
    const [findApplicantByCategoryCodeview, setFindApplicantByCategoryCodView] = useState({
        data: {
            cityName: '',
            stateName: '',
            countryName: '',
            areaName: ''
        }
    });
    const [cofindApplicantByCategoryCodView, setcoFindApplicantByCategoryCodView] = useState({
        data: {
            cityName: '',
            stateName: '',
            countryName: '',
            areaName: ''
        }
    });
    const [coPincode, setcoPincode] = useState([]);
    const safePincodeArray = Array.isArray(Pincode) ? Pincode : [];
    const safePincodeArrayCo = Array.isArray(coPincode) ? coPincode : [];
    const transformedPincodes = safePincodeArray.length === 1
        ? [{
            label: safePincodeArray[0].pincode.toString(),
            value: safePincodeArray[0].pincodeId // Use pincodeId as the value
        }]
        : safePincodeArray.map(({ pincodeId, pincode }) => ({
            label: pincode.toString(),
            value: pincodeId // Use pincodeId as the value
        }));


    const transformedPincodesCo = safePincodeArrayCo.length === 1
        ? [{
            label: safePincodeArrayCo[0].pincode.toString(),
            value: safePincodeArrayCo[0].pincodeId // Use pincodeId as the value
        }]
        : safePincodeArrayCo.map(({ pincodeId, pincode }) => ({
            label: pincode.toString(),
            value: pincodeId // Use pincodeId as the value
        }));


    const formatNumberWithCommas = (value) => {
        if (!value || isNaN(value)) return value; // Return original value if not a valid number
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
    };

    const renderRows = (fields, customColumns, baseSpacing = 10) => {
        if (!fields || fields.length === 0) return null;

        const isSmallDevice = width < 380;
        const isTablet = width > 768;

        // 🧩 Adaptive layout configuration
        const columns = customColumns || (isTablet ? 3 : isSmallDevice ? 1 : 2);

        // 🧩 Dynamic spacing for smaller devices
        const spacing = isSmallDevice ? baseSpacing * 0.4 : baseSpacing * 0.8;
        const rowGap = isSmallDevice ? baseSpacing * 0.35 : baseSpacing * 0.6;

        const rows = [];

        for (let i = 0; i < fields.length; i += columns) {
            const chunk = fields.slice(i, i + columns);
            const emptyCount = columns - chunk.length;

            rows.push(
                <View key={i} style={[styles.row, { marginBottom: rowGap }]}>
                    {chunk.map((field, idx) => (
                        <View
                            key={idx}
                            style={[
                                styles.cell,
                                {
                                    paddingHorizontal: spacing / 2,
                                    flex: 1 / columns,
                                },
                            ]}
                        >
                            {field}
                        </View>
                    ))}

                    {/* Fill empty columns for alignment */}
                    {Array.from({ length: emptyCount }).map((_, idx) => (
                        <View
                            key={`empty-${idx}`}
                            style={{
                                flex: 1 / columns,
                                paddingHorizontal: spacing / 2,
                            }}
                        />
                    ))}
                </View>
            );
        }

        return rows;
    };

    const renderLeadCard = ({ item }) => (
        <View style={styles.leadCard}>
            <View style={styles.leadRow}>
                <Text style={styles.leadName}>{item.name}</Text>
                <View style={[styles.badge, styles['badge_' + item.status.replace(" ", "")]]}>
                    <Text style={styles.badgeText}>{item.status}</Text>
                </View>
            </View>

            <Text style={styles.productText}>{item.product}</Text>

            <View style={styles.leadFooter}>
                <Text style={styles.leadDate}>{item.date}</Text>
                <TouchableOpacity style={styles.viewBtn}>
                    <Text style={styles.viewBtnText}>View</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const handleCategoryChange = useCallback((item) => {
        setSelectedCategory(item.value);
        setcatselct(item.label);

        setFormData((prev) => {
            const isOrganization = (item.label || "").toLowerCase() === "organization";

            // Fields specific to Organization
            const organizationFields = [
                "industryType",
                "otherIndustryType",
                "segmentType",
                "segtypetxt",
                "orgName",
                "regNumber",
                "CINnumber",
                "incorpDate",
                "keyPartnerDob",
                "businessDuration",
                "pan",
                "contactPerson",
                "designation",
                "gender",
                "aadhaarNo",
            ];

            // Fields specific to Individual
            const individualFields = [
                "firstName",
                "middleName",
                "lastName",
                "dob",
                "gender",
                "aadhaarNo",
                "pan",
            ];

            // Determine which fields to reset
            const fieldsToReset = isOrganization ? individualFields : organizationFields;

            // Reset only the relevant fields
            const updated = { ...prev, applicantCategory: item };
            fieldsToReset.forEach((key) => {
                updated[key] = "";
            });

            return updated;
        });
    }, []);


    const handleProductchange = useCallback((item) => {
        console.log(item, 'itemitem')
        setSelectedproduct(item.value);
        setpayloadproduct(item.label);
        setApplicantForms(prevForms =>
            prevForms.map(form => ({
                ...form,
                product: item.label,
                productid: item.value,
            }))
        );
    }, []);
    const handleOccupationChange = (item) => {
        setselectsetgetByType(item.value); // Set the selected gender value
        setfinaloccupation(item.label);
    };

    const handleOccupationChangeCo = (item) => {
        setselectsetgetByTypeCo(item.value); // Set the selected gender value
        setfinaloccupationCo(item.label);
    };


    const [formData, setFormData] = useState({
        applicantCategory: "",
        otherApplicantType: "",
        portfolio: "",
        product: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        orgName: "",
        regNumber: "",
        CINnumber: "",
        incorpDate: "",
        keyPartnerDob: "",
        industryType: "",
        otherIndustryType: "",
        segmentType: "",
        nofmonthinbusiness: "",
        nofyearinbusiness: "",
        designation: "", // for sole proprietor / llp occupations
        contactPerson: "",
        mobileNumber: "",
        gender: "",
        email: "",
        aadhaarNo: "",
        pan: "",
        loanPurpose: "",
        leadSource: "",
        branchName: "",
        pincode: "",
        country: "",
        city: "",
        state: "",
        area: "",
    });

    const handleInputChange = (key, value) => {
        setFormData((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handlePanValidation = async (panNumber) => {
        try {
            const response = await axios.get(`${BASE_URL}getLeadsByPan`, {
                params: { pan: panNumber },
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + token,
                },
            });

            const data = response.data?.data || [];

            if (Array.isArray(data) && data.length > 0) {
                const item = data[0];
                console.log(item, 'itemPAnvalidation')
                // Set data for modal
                setExistingCustomerData({
                    pan: panNumber,
                    applicationNo: item?.appId,
                    name: `${item?.firstName}${' '}${item?.lastName}`,
                    loginDate: formatDateForce(item?.createdTime),
                    caseType: item?.productName,
                    caseStatus: item?.applicationStage,
                    executive: item?.createdBy,
                    dealer: item?.leadSourceName,
                });

                // Show modal
                setExistsModalVisible(true);
            }

            // Set dropdown (your existing logic)
            setAllDesignation(response.data.data);

        } catch (error) {
            console.error('❌ Error fetching PAN details:', error);
            Alert.alert('Error', 'Failed to fetch data for given PAN.');
        }
    };
    const handleIndustry = (item) => {
        setselectedindtype(item.value)
        setpayloadind(item.label)
    }
    const [payloadsegtype, setpayloadsegtype] = useState('')

    const handlesegmenttype = (item) => {

        setselectedsegtype(item.value)
        setpayloadsegtype(item.label)
    }
    const [payloadorgtypeco, setpayloadorgtypeco] = useState('')
    const handleIndustryco = (item) => {
        setselectedindtypeco(item.value)
        setpayloadindco(item.label)
    }
    const [payloadsegtypeco, setpayloadsegtypeco] = useState('')
    const handlesegmenttypeco = (item) => {
        // setselectedsegtypeco(item.value)
        setpayloadsegtypeco(item.label)
    }
    const handleGenderChange = (item) => {
        setSelectedgenders(item.value); // Set the selected gender value

    };
    const [selecteddesignation, setselecteddesignation] = useState('');
    const handleDesignationChange = (item) => {
        setselecteddesignation(item.value); // Set the selected gender value
        setdesign(item.label)
    };

    const [selecteddesignationco, setselecteddesignationco] = useState('');
    const handleDesignationChangeco = (item) => {
        setselecteddesignationco(item.value); // Set the selected gender value
        setdesignco(item.label)
    };
    const handleGenderChangeCo = (item) => {
        setcoSelectedgenders(item.value); // Set the selected gender value
    };
    const handleLeadStatusChange = (item) => {
        setSelectedLeadSourceDropdown(item.value); // Set the selected gender value
        setLeadSourceId(item.value); // Set the
        setLeadSource(item.label)
    };
    const handleBranchNameChange = (item) => {
        setSelectedbranchName(item.value); // Set the selected gender value
        // setLeadSourceId(item.value); // Set the
        setBranchName(item.label);
    };

    const handleDropdownChangePincode = (item) => {
        setSelectedPincodes(item); // store the full object
    };

    const handleDropdownChangePincodeCo = (item) => {
        setcoSelectedPincodes({
            value: item.value,   // Set selected pincode ID
            label: item.label,   // Set selected pincode label
        }); // Set selected pincodeId
        //  // Debugging output
    };
    const handleClosePress = () => {
        setApplicantForms([])
        setIsModalVisiblecreate(false)
        // setorgname('');
        // setorgnameco('');

        // setselectedorgtype('');
        // setselectedorgtypeco('');
        // setorgtype([]);
        // setorgtypeco([]);

        // setregnumber('');
        // setregnumberco('');

        // setincorpratedat('')
        // setincorpratedatco('');

        // setkeybusinessparnerdob('');
        // setkeybusinessparnerdobco('');

        // setnumberofemp('');
        // setnumberofempco('');

        // setselectedindtype('');
        // setselectedindtypeco('');

        // setorgtype([]);
        // setorgtypeco([]);
        // setselectedsegtype('');
        // setselectedsegtypeco('');

        // setcontactperson('');
        // setcontactpersonco('');

        // setdesign('');
        // setdesignco('');

        // setfax('');
        // setfaxco('');

        // setnofmonthinbusiness('')
        // setnofmonthinbusinessco('')

        // setnofyearinbusiness('')
        // setnofyearinbusinessco('');



        // setLoadingCo(false);
        // setgetByType([]);
        // setgetByTypeCo([]);
        // setselectsetgetByType('');
        // setSelectedCategory('');
        // setcatselct('');
        // setfinaloccupation('');
        // setfinaloccupationCo('');
        // setCardVisible(false); // Remove
        // setIsModalVisible(false);
        // setSelectedPincodes('');
        // setcoSelectedPincodes('');

        // setSelectedApplicantType(''); // remove
        // setSelectedExistinguser('');
        // setSelectedportfolio('');
        // setSelectedproduct('');
        // setpayloadportfolio('');
        // setpayloadproduct('');
        // setSelectedsalutation('');
        // setSelectedgenders('');
        // setSelectedbranch('');
        // setSelectedloanpurpose('');
        // setSelectedsourceType('');

        // setFirstName('');
        // setMiddleName('');
        // setLastName('');
        // setMobileNumber('');
        // setEmail('');
        // setPan('');
        // setAadhaarNo('');
        // setDobError('')
        // setcoDobError(''),
        //     setDob('');
        // setGender('');
        // setLoanAmount('');

        // setFindApplicantByCategoryCod('');
        // setcoFindApplicantByCategoryCod('');
        // setFirstName('');
        // setMiddleName('');
        // setLastName('');
        // setMobileNumber('');
        // setEmail('');
        // setPan('');
        // setAadhaarNo('');
        // setDob('');
        // setSelectedgenders('')
        // setSelectedPincodes('');

        // setFindApplicantByCategoryCod('');

        // setcoFirstName('');
        // setcoMiddleName('')
        // setcoLastName('');
        // setcoMobileNumber('');
        // setcoEmail('');
        // setcoPan('');
        // setcoAadhaarNo('');
        // setcoDob('');
        // setcoSelectedgenders('')
        // setcoSelectedPincodes('');

        // setcoFindApplicantByCategoryCod('');

        // setErrors({});
        // setActiveTabView('Applicant');
        // setActiveTab('Applicant');
        // setSelectedLeadSourceDropdown('')
        // setSelectedLoanPurposeName('');
        // setSelectedbranchName('');
        // setLoanPurpose('');
        // setBranchName('');
        // setLeadSource('')
        // setIsSettlement(false); // Reset the Switch to OFF
        // setShowSubmitButton(false); // Hide the Submit button
        // getAllLeads();
        // setisSubmittingApplicant(false); //
        // setCoApplicant(false); // Reset the CoApplicant

        setFormData({
            applicantCategory: "",
            otherApplicantType: "",
            portfolio: "",
            product: "",
            firstName: "",
            middleName: "",
            lastName: "",
            dob: "",
            orgName: "",
            regNumber: "",
            CINnumber: "",
            incorpDate: "",
            keyPartnerDob: "",
            industryType: "",
            otherIndustryType: "",
            segmentType: "",
            nofmonthinbusiness: "",
            nofyearinbusiness: "",
            designation: "",
            contactPerson: "",
            mobileNumber: "",
            gender: "",
            email: "",
            aadhaarNo: "",
            pan: "",
            loanPurpose: "",
            leadSource: "",
            branchName: "",
            pincode: "",
            country: "",
            city: "",
            state: "",
            area: "",
        });

        setFormDataCo({
            applicantCategory: "",
            otherApplicantType: "",
            portfolio: "",
            product: "",
            firstName: "",
            middleName: "",
            lastName: "",
            dob: "",
            orgName: "",
            regNumber: "",
            CINnumber: "",
            incorpDate: "",
            keyPartnerDob: "",
            industryType: "",
            otherIndustryType: "",
            segmentType: "",
            nofmonthinbusiness: "",
            nofyearinbusiness: "",
            designation: "",
            contactPerson: "",
            mobileNumber: "",
            gender: "",
            email: "",
            aadhaarNo: "",
            pan: "",
            loanPurpose: "",
            leadSource: "",
            branchName: "",
            pincode: "",
            country: "",
            city: "",
            state: "",
            area: "",
        });

        // Optional: reset other state variables if needed

        setDateErrors({})
    };
    const formConfig = useMemo(() => {
        const isOrganization = (cateselec || "").toLowerCase() === "organization";
        const isOrg = (cateselec || "").toLowerCase() === "organization";
        const labelText = isOrg ? "Registration Type" : "Primary Occupation";
        return [
            {
                section: "Applicant Info",
                fields: [
                    { key: "applicantCategory", type: "dropdown", label: "Applicant Category", options: Category, handler: handleCategoryChange },
                    {
                        key: "getByType",
                        type: "dropdown",
                        label: labelText,
                        options: getByType,
                        handler: handleOccupationChange,
                        show: getByType?.length > 0
                    },
                    { key: "otherApplicantType", type: "input", label: "Other Applicant Type", placeholder: "Enter Industry Type", show: finaloccupation === "Other" },
                    { key: "portfolio", type: "input", label: "Portfolio", value: portfolioDescriptions[0]?.label || "N/A", editable: false },
                    { key: "product", type: "dropdown", label: "Product", options: products, handler: handleProductchange, show: products?.length > 0 },
                ]
            },
            {
                section: "Organization Info",
                fields: [
                    { key: "industryType", type: "dropdown", label: "Industry Type", options: indtype, handler: handleIndustry, show: isOrganization },
                    { key: "otherIndustryType", type: "input", label: "Other Industry Type", placeholder: "Enter Industry Type", show: payloadind === "Other", required: payloadind === "Other" ? true : false, },
                    { key: "segmentType", type: "dropdown", label: "Segment Type", options: segtype, handler: handlesegmenttype, show: isOrganization && payloadind !== "Other" },
                    { key: "segtypetxt", type: "input", label: "Segment Type", placeholder: "Enter Segment", show: payloadind === "Other", required: payloadind === "Other" ? true : false, },

                    { key: "orgName", type: "input", label: "Organization Name", placeholder: "Enter Organization", show: isOrganization, required: isOrganization ? true : false, },
                    { key: "regNumber", type: "input", label: "Registration Number", placeholder: "Enter Reg Number", show: isOrganization, },
                    { key: "CINnumber", type: "input", label: "CIN Number", placeholder: "Enter CIN Number", show: isOrganization, },
                    { key: "incorpDate", type: "date", label: "Incorporation Date", show: isOrganization, },
                    { key: "keyPartnerDob", type: "date", label: "Key Business Partner DOB", show: isOrganization && !["Private Limited", "Limited"].includes(finaloccupation), },
                    { key: "businessDuration", type: "custom", show: isOrganization },
                    // PAN should move here if organization
                    { key: "pan", type: "input", label: "PAN Number", placeholder: 'Enter PAN Number ', inputType: "pan", show: isOrganization },
                ]
            },
            {
                section: "Personal Info",
                fields: [
                    { key: "firstName", type: "input", label: "First Name", placeholder: "Enter first name", show: !isOrganization, required: !isOrganization ? true : false, },
                    { key: "middleName", type: "input", label: "Middle Name", placeholder: "Enter middle name", show: !isOrganization },
                    { key: "lastName", type: "input", label: "Last Name", placeholder: "Enter last name", show: !isOrganization, required: !isOrganization ? true : false, },
                    { key: "dob", type: "date", label: "DOB", show: !isOrganization },
                    // Gender + Aadhaar should move to Contact Info if organization
                    { key: "gender", type: "dropdown", label: "Gender", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Transgender", value: "Transgender" }], handler: handleGenderChange, show: !isOrganization, isRequired: true },
                    { key: "aadhaarNo", type: "input", label: "Aadhar Number", placeholder: 'Enter Aadhaar Number', inputType: "aadhaar", show: !isOrganization },
                    // PAN stays here if individual
                    { key: "pan", type: "input", label: "PAN Number", placeholder: 'Enter PAN Number ', inputType: "pan", show: !isOrganization, required: !isOrganization ? true : false, },
                ]
            },
            {
                section: "Contact Info",
                fields: [
                    { key: "contactPerson", type: "input", label: "Contact Person", placeholder: "Enter Contact Person", show: isOrganization, required: isOrganization ? true : false, },
                    {
                        key: "designation", type: "dropdown", label: "Designation", options: [
                            { label: "Director", value: "Director" },
                            { label: "Sole Proprietor", value: "Sole Proprietor" },
                            { label: "Partner", value: "Partner" }
                        ], handler: handleDesignationChange, show: isOrganization && ["sole proprietor", "llp", "partnership firm"].includes((finaloccupation || "").toLowerCase()),
                    },
                    { key: "mobileNumber", type: "input", label: "Mobile Number", placeholder: "Enter 10-digit number", inputType: "mobile", required: true, },
                    { key: "email", type: "input", label: "Email", placeholder: 'Enter Email', inputType: "email" },
                    // Move designation, gender, aadhaar here if organization

                    { key: "gender", type: "dropdown", label: "Gender", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Transgender", value: "Transgender" }], handler: handleGenderChange, show: isOrganization && ["LLP", "Sole Proprietor", "Partnership Firm"].includes(finaloccupation), required: false, },
                    { key: "aadhaarNo", type: "input", label: "Aadhar Number", placeholder: 'Enter Aadhaar Number', inputType: "aadhaar", show: isOrganization && ["hh"].includes(finaloccupation) },
                ]
            },
            {
                section: "Loan Details",
                fields: [
                    { key: "loanPurpose", type: "input", label: "Loan Purpose", placeholder: "Enter Loan Purpose", required: true, },
                    { key: "leadSource", type: "dropdown", label: "Lead Source", options: LeadDropdown, handler: handleLeadStatusChange },
                    { key: "branchName", type: "dropdown", label: "Sourcing Branch", options: BranchName, handler: handleBranchNameChange },
                ]
            },
            {
                section: "Applicant Location Info",
                fields: [
                    { key: "pincode", type: "dropdown", label: "Pincode", options: transformedPincodes, handler: handleDropdownChangePincode },
                    { key: "country", type: "input", label: "Country", value: findApplicantByCategoryCod.data?.countryName || "", editable: false },
                    { key: "city", type: "input", label: "City", value: findApplicantByCategoryCod.data?.cityName || "", editable: false },
                    { key: "state", type: "input", label: "State", value: findApplicantByCategoryCod.data?.stateName || "", editable: false },
                    { key: "area", type: "input", label: "Area", value: findApplicantByCategoryCod.data?.areaName || "", editable: false },
                ]
            }
        ];
    }, [Category, finaloccupation, portfolioDescriptions, products, cateselec, payloadind, indtype, segtype, LeadDropdown, BranchName, transformedPincodes, findApplicantByCategoryCod]);

    const renderFieldQDEentry = (field) => {
        if (field.show === false) return null;

        let value = formData[field.key] ?? field.value ?? "";

        // Auto-fill location fields
        if (["country", "city", "state", "area"].includes(field.key)) {
            value = findApplicantByCategoryCod.data?.[`${field.key}Name`] ?? "";
        }
        if (field.key === "portfolio") {
            value = portfolioDescriptions[0]?.label ?? "N/A";
        }

        /** -------------------------
         *  🔵 GLASS INPUT
         * -------------------------*/
        if (field.type === "input") {
            return (
                <GlassInput
                    key={field.key}
                    label={field.label}
                    value={value}
                    onChange={(val) => handleInputChange(field.key, val)}
                    placeholder={field.placeholder}
                    required={field.required}
                    editable={field.editable ?? true}
                    onBlur={() => {
                        if (field.key === "pan" && formData.pan?.length === 10) {
                            handlePanValidation(formData.pan);
                        }
                    }}
                />
            );
        }

        /** -------------------------
         *  🔵 GLASS DROPDOWN
         * -------------------------*/
        if (field.type === "dropdown") {
            return (
                <GlassDropdown
                    key={field.key}
                    label={field.label}
                    data={field.options}
                    selectedValue={value}
                    required={field.isRequired}
                    onChange={(val) => {
                        handleInputChange(field.key, val);
                        field.handler?.(val);
                    }}
                />
            );
        }

        /** -------------------------
         *  🔵 GLASS DATE PICKER
         * -------------------------*/
        if (field.type === "date") {
            let minAge = 0;
            let maxAge = 100;

            // dynamic age logic
            if (field.key === "dob") {
                if (formData.product?.label === "Personal Loan") {
                    minAge = 21;
                    maxAge = 60;
                } else if (formData.product?.label === "Business Loan") {
                    minAge = 21;
                    maxAge = 58;
                }
            }

            if (field.key === "incorpDate") {
                if (
                    formData.product?.label === "Business Loan" &&
                    formData.applicantCategory?.label === "Organization"
                ) {
                    minAge = 1;
                    maxAge = 80;
                }
            }

            return (
                <DateOfBirthInput
                    key={field.key}
                    label={field.label}
                    value={formData[field.key]}
                    onChange={(val) => handleInputChange(field.key, val)}
                    setError={(err) =>
                        setDateErrors((prev) => ({ ...prev, [field.key]: err }))
                    }
                    error={dateErrors[field.key]}
                    type={field.key}
                    businessDate={BusinessDate.businnessDate}
                    minAge={minAge}
                    maxAge={maxAge}
                    hideAsterisk={field.key === "keyPartnerDob"}
                />

            );
        }

        /** -------------------------
         *  🔵 BUSINESS DURATION (NO CHANGE)
         * -------------------------*/
        if (field.type === "custom" && field.key === "businessDuration") {
            return (
                <BusinessDurationInput
                    key={field.key}
                    monthValue={formData.nofmonthinbusiness}
                    setMonthValue={(val) => handleInputChange("nofmonthinbusiness", val)}
                    yearValue={formData.nofyearinbusiness}
                    setYearValue={(val) => handleInputChange("nofyearinbusiness", val)}
                />
            );
        }

        return null;
    };

    const [formDataCo, setFormDataCo] = useState({
        applicantCategory: "",
        finalOccupation: "",
        otherApplicantType: "",
        firstName: "",
        middleName: "",
        lastName: "",
        dob: "",
        orgName: "",
        regNumber: "",
        CINnumber: "",
        incorpDate: "",
        keyPartnerDob: "",
        designation: "",
        industryType: "",
        otherIndustryType: "",
        segmentType: "",
        segmentTypeOther: "",
        nofmonthinbusiness: "",
        nofyearinbusiness: "",
        contactPerson: "",
        mobileNumber: "",
        gender: "",
        email: "",
        aadhaarNo: "",
        pan: "",
        loanPurpose: "",
        leadSource: "",
        branchName: "",
        pincode: "",
        country: "",
        city: "",
        state: "",
        area: "",
    });

    const handleInputChangeCo = (key, value) => {
        setFormDataCo((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const formConfigCo = useMemo(() => {
        const isOrganization = (cateselec || "").toLowerCase() === "organization";
        const isOrg = (cateselec || "").toLowerCase() === "organization";
        const labelText = isOrg ? "Registration Type" : "Primary Occupation";
        return [
            {
                section: "Applicant Info",
                fields: [
                    { key: "applicantCategory", type: "input", label: "Applicant Category", value: cateselec || "N/A", editable: false },
                    {
                        key: "getByType",
                        type: "dropdown",
                        label: labelText,
                        options: getByTypeCo,
                        handler: handleOccupationChangeCo,
                        show: getByTypeCo?.length > 0
                    },
                    { key: "otherApplicantType", type: "input", label: "Other Primary Occupation", placeholder: "Enter Industry Type", show: finaloccupationCo === "Other" },
                    { key: "portfolio", type: "input", label: "Portfolio", value: portfolioDescriptions[0]?.label || "N/A", editable: false },
                    { key: "product", type: "input", label: "Product", value: payloadproduct || "NA", editable: false },
                ]
            },
            {
                section: "Organization Info",
                fields: [
                    { key: "industryType", type: "dropdown", label: "Industry Type", options: indtypeco, handler: handleIndustryco, show: isOrganization },
                    { key: "otherIndustryType", type: "input", label: "Other Industry Type", placeholder: "Enter Industry Type", show: payloadindco === "Other" },
                    { key: "segmentType", type: "dropdown", label: "Segment Type", options: segtypeco, handler: handlesegmenttypeco, show: isOrganization && payloadindco !== "Other" },
                    { key: "segtypetxt", type: "input", label: "Other Segment Type", placeholder: "Enter Segment", show: payloadindco === "Other" },

                    { key: "orgName", type: "input", label: "Organization Name", placeholder: "Enter Organization", show: isOrganization, required: isOrganization ? true : false, },
                    { key: "regNumber", type: "input", label: "Registration Number", placeholder: "Enter Reg Number", show: isOrganization, },
                    { key: "CINnumber", type: "input", label: "CIN Number", placeholder: "Enter CIN Number", show: isOrganization, },
                    { key: "incorpDate", type: "date", label: "Incorporation Date", show: isOrganization },
                    { key: "keyPartnerDob", type: "date", label: "Key Business Partner DOB", show: isOrganization && !["Private Limited", "Limited"].includes(finaloccupationCo), },
                    { key: "businessDuration", type: "custom", show: isOrganization },
                    // PAN goes here if Organization
                    { key: "pan", type: "input", label: "PAN Number", placeholder: "Enter PAN Number", inputType: "pan", show: isOrganization, required: isOrganization ? true : false, },
                ]
            },
            {
                section: "Personal Info",
                fields: [
                    { key: "firstName", type: "input", label: "First Name", placeholder: "Enter first name", show: !isOrganization, required: !isOrganization ? true : false, },
                    { key: "middleName", type: "input", label: "Middle Name", placeholder: "Enter middle name", show: !isOrganization },
                    { key: "lastName", type: "input", label: "Last Name", placeholder: "Enter last name", show: !isOrganization, required: !isOrganization ? true : false, },
                    { key: "dob", type: "date", label: "DOB", show: !isOrganization },
                    // Gender + Aadhaar move to Contact Info if Organization
                    { key: "gender", type: "dropdown", label: "Gender", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Transgender", value: "Transgender" }], handler: handleGenderChangeCo, show: !isOrganization, isRequired: true },
                    { key: "aadhaarNo", type: "input", label: "Aadhar Number", placeholder: "Enter Aadhaar Number", inputType: "aadhaar", show: !isOrganization },
                    // PAN stays here if Individual
                    { key: "pan", type: "input", label: "PAN Number", placeholder: "Enter PAN Number", inputType: "pan", show: !isOrganization, required: !isOrganization ? true : false, },
                ]
            },
            {
                section: "Contact Info",
                fields: [
                    { key: "contactPerson", type: "input", label: "Contact Person", placeholder: "Enter Contact Person", show: isOrganization, required: isOrganization ? true : false, },
                    {
                        key: "designation", type: "dropdown", label: "Designation", options: [
                            { label: "Director", value: "Director" },
                            { label: "Sole Proprietor", value: "Sole Proprietor" },
                            { label: "Partner", value: "Partner" }
                        ], handler: handleDesignationChangeco, show: isOrganization && ["sole proprietor", "llp", "partnership firm"].includes((finaloccupationCo || "").toLowerCase())
                    },
                    { key: "mobileNumber", type: "input", label: "Mobile Number", placeholder: "Enter 10-digit number", inputType: "mobile", required: true, },
                    { key: "email", type: "input", label: "Email", placeholder: "Enter Email", inputType: "email" },
                    // Gender + Aadhaar here if Organization
                    { key: "gender", type: "dropdown", label: "Gender", options: [{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Transgender", value: "Transgender" }], handler: handleGenderChange, show: isOrganization && ["LLP", "Sole Proprietor", "Partnership Firm"].includes(finaloccupationCo), isRequired: false },
                    { key: "aadhaarNo", type: "input", label: "Aadhar Number", placeholder: 'Enter Aadhaar Number', inputType: "aadhaar", show: isOrganization && ['hh'].includes(finaloccupationCo) },
                ]
            },
            {
                section: "Loan Details",
                fields: [
                    { key: "loanPurpose", type: "input", label: "Loan Purpose", value: formData?.loanPurpose, editable: false },
                    { key: "leadSource", type: "input", label: "Lead Source", value: LeadSource, editable: false },
                    { key: "branchName", type: "input", label: "Sourcing Branch", value: branchName, editable: false },
                ]
            },
            {
                section: "Applicant Location Info",
                fields: [
                    { key: "pincode", type: "dropdown", label: "Pincode", options: transformedPincodesCo, handler: handleDropdownChangePincodeCo },
                    { key: "country", type: "input", label: "Country", value: cofindApplicantByCategoryCod.data?.countryName || "", editable: false },
                    { key: "city", type: "input", label: "City", value: cofindApplicantByCategoryCod.data?.cityName || "", editable: false },
                    { key: "state", type: "input", label: "State", value: cofindApplicantByCategoryCod.data?.stateName || "", editable: false },
                    { key: "area", type: "input", label: "Area", value: cofindApplicantByCategoryCod.data?.areaName || "", editable: false },
                ]
            }
        ];
    }, [
        cateselec,
        getByTypeCo,
        payloadproduct,
        LeadSource,
        branchName,
        transformedPincodesCo,
        cofindApplicantByCategoryCod,
        payloadindco,
        finaloccupationCo,
    ]);

    const renderFieldQDEentryCo = (field) => {
        if (field.show === false) return null;

        let value = formDataCo[field.key] ?? field.value ?? "";

        if (["country", "city", "state", "area"].includes(field.key)) {
            value = cofindApplicantByCategoryCod.data?.[`${field.key}Name`] ?? "";
        }

        /** INPUT */
        if (field.type === "input") {
            return (
                <GlassInput
                    key={field.key}
                    label={field.label}
                    value={value}
                    onChange={(val) => handleInputChangeCo(field.key, val)}
                    placeholder={field.placeholder}
                    required={field.required}
                    editable={field.editable ?? true}
                />
            );
        }

        /** DROPDOWN */
        if (field.type === "dropdown") {
            return (
                <GlassDropdown
                    key={field.key}
                    label={field.label}
                    data={field.options}
                    selectedValue={value}
                    required={field.isRequired}
                    onChange={(val) => {
                        handleInputChangeCo(field.key, val);
                        field.handler?.(val);
                    }}
                />
            );
        }

        /** DATE PICKER */
        if (field.type === "date") {
            return (
                <DateOfBirthInput
                    key={field.key}
                    label={field.label}
                    value={formDataCo[field.key]}
                    onChange={(val) => handleInputChangeCo(field.key, val)}
                    setError={(err) =>
                        setDateErrors((prev) => ({ ...prev, [field.key]: err }))
                    }
                    error={dateErrors[field.key]}
                    type={field.key}
                    businessDate={BusinessDate.businnessDate}
                    minAge={1}
                    maxAge={80}
                    hideAsterisk={field.key === "keyPartnerDob"}
                />

            );
        }

        /** CUSTOM */
        if (field.type === "custom") {
            return (
                <BusinessDurationInput
                    monthValue={formDataCo.nofmonthinbusiness}
                    setMonthValue={(val) => handleInputChangeCo("nofmonthinbusiness", val)}
                    yearValue={formDataCo.nofyearinbusiness}
                    setYearValue={(val) => handleInputChangeCo("nofyearinbusiness", val)}
                />
            );
        }

        return null;
    };


    const validateFields = () => {
        const missingFields = [];
        const {
            product,
            firstName,
            lastName,
            dob,
            gender,
            mobileNumber,
            pan,
            loanPurpose,
            leadSource,
            branchName,
            pincode,
            industryType,
            segmentType,
            orgName,
            regNumber,
            CINnumber,
            incorpDate,
            contactPerson,
            otherApplicantType
        } = formData;

        const isEmpty = (val) =>
            val === undefined || val === null || (typeof val === "string" && !val.trim());

        const occ = (finaloccupation || "").trim().toLowerCase();

        // ✅ CONFIG: Occupation → Required Fields
        const validationMap = {
            "salaried": [
                "product", "firstName", "lastName", "mobileNumber", "gender", "pan",
                "dob", "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "self employment": [
                "product", "firstName", "lastName", "mobileNumber", "gender", "pan",
                "dob", "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "house wife": [
                "product", "firstName", "lastName", "mobileNumber", "gender", "pan",
                "dob", "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "other": [
                "product", "firstName", "lastName", "mobileNumber", "gender", "pan",
                "dob", "leadSource", "loanPurpose", "branchName", "pincode", "otherApplicantType"
            ],

            "llp": [
                "product", "industryType", "segmentType", "orgName",
                "incorpDate", "pan", "contactPerson", "mobileNumber",
                "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "sole proprietor": [
                "product", "industryType", "segmentType", "orgName",
                "incorpDate", "pan", "contactPerson", "mobileNumber",
                "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "limited": [
                "product", "industryType", "segmentType", "orgName",
                "incorpDate", "pan", "contactPerson", "mobileNumber",
                "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "private limited": [
                "product", "industryType", "segmentType", "orgName",
                "incorpDate", "pan", "contactPerson", "mobileNumber",
                "leadSource", "loanPurpose", "branchName", "pincode",
            ],
            "partnership firm": [
                "product", "industryType", "segmentType", "orgName",
                "incorpDate", "pan", "contactPerson", "mobileNumber",
                "leadSource", "loanPurpose", "branchName", "pincode",
            ],
        };

        // ✅ Field Labels for Better Error Messages
        const fieldLabels = {
            product: "Product",
            firstName: "First Name",
            lastName: "Last Name",
            dob: "Date of Birth",
            gender: "Gender",
            mobileNumber: "Mobile Number",
            pan: "PAN",
            loanPurpose: "Loan Purpose",
            leadSource: "Lead Source",
            branchName: "Sourcing Branch",
            pincode: "Pincode",
            industryType: "Industry Type",
            segmentType: "Segment Type",
            orgName: "Organization Name",
            regNumber: "Registration Number",
            CINnumber: "CIN Number",
            incorpDate: "Incorporation Date",
            contactPerson: "Contact Person",
            finaloccupation: "Applicant Type",
            otherApplicantType: 'Other Applicant Type',
        };

        // ✅ Dropdown Fields — will use “select” instead of “enter”
        const dropdownFields = [
            "pincode",
            "branchName",
            "leadSource",
            "industryType",
            "segmentType",
            "product",
            "finaloccupation",
            "dob", // if DOB is picked via date picker, treat as select
        ];

        // ✅ Validate occupation
        if (isEmpty(finaloccupation)) {
            missingFields.push("Please select Applicant Type");
        }

        const requiredFields = validationMap[occ];
        if (!requiredFields) {
            missingFields.push("Invalid occupation type selected.");
        } else {
            requiredFields.forEach((field) => {
                const value = formData[field];
                if (isEmpty(value)) {
                    const action = dropdownFields.includes(field) ? "select" : "enter";
                    missingFields.push(`Please ${action} ${fieldLabels[field]}`);
                }
            });
        }

        // ✅ Pattern Validations
        if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
            missingFields.push("Mobile Number must be a 10-digit number.");
        }

        if (pan && !/^([A-Z]{5}\d{4}[A-Z])$/.test(pan)) {
            missingFields.push("Invalid PAN format.");
        }

        return missingFields.length > 0 ? missingFields : true;
    };



    const validateFieldsCoApplicant = () => {
        const missingFields = [];
        const {
            applicantCategory,
            otherApplicantType,
            portfolio,
            product,
            firstName,
            middleName,
            lastName,
            dob,
            orgName,
            regNumber,
            CINnumber,
            incorpDate,
            keyPartnerDob,
            industryType,
            otherIndustryType,
            segmentType,
            segtypetxt,
            contactPerson,
            mobileNumber,
            gender,
            email,
            aadhaarNo,
            pan,
            loanPurpose,
            leadSource,
            branchName,
            pincode,
        } = formDataCo;

        const occ = (finaloccupationCo || "").trim().toLowerCase();
        const isOrg = (cateselec || "").toLowerCase() === "organization";

        const isEmpty = (val) =>
            val === undefined || val === null || (typeof val === "string" && !val.trim());

        // 🏷 Field Labels
        const fieldLabels = {
            product: "Product",
            firstName: "First Name",
            lastName: "Last Name",
            dob: "Date of Birth",
            gender: "Gender",
            mobileNumber: "Mobile Number",
            email: "Email",
            pan: "PAN",
            orgName: "Organization Name",
            regNumber: "Registration Number",
            CINnumber: "CIN Number",
            incorpDate: "Incorporation Date",
            industryType: "Industry Type",
            otherIndustryType: "Other Industry Type",
            segmentType: "Segment Type",
            segtypetxt: "Segment Type",
            contactPerson: "Contact Person",
            // loanPurpose: "Loan Purpose",
            // leadSource: "Lead Source",
            // branchName: "Sourcing Branch",
            pincode: "Pincode",
            otherApplicantType: 'Other Applicant Type',
        };

        // 🧩 Dropdown Fields (use “select”)
        const dropdownFields = [
            "finaloccupationCo",
            "industryType",
            "segmentType",
            "segtypetxt",
            "pincode",
        ];

        // 🗂 Occupation-based Required Fields
        const validationMap = {
            "salaried": ["firstName", "lastName", "mobileNumber", "gender", "pan", "dob", "pincode"],
            "self employment": ["firstName", "lastName", "mobileNumber", "gender", "pan", "dob", "pincode"],
            "house wife": ["firstName", "lastName", "mobileNumber", "gender", "pan", "dob", "pincode"],
            "other": ["firstName", "lastName", "mobileNumber", "gender", "pan", "dob", "pincode", "otherApplicantType"],

            "llp": ["industryType", "segmentType", "orgName", "incorpDate", "pan", "contactPerson", "mobileNumber", "pincode"],
            "sole proprietor": ["industryType", "segmentType", "orgName", "incorpDate", "pan", "contactPerson", "mobileNumber", "pincode"],
            "limited": ["industryType", "segmentType", "orgName", "incorpDate", "pan", "contactPerson", "mobileNumber", "pincode"],
            "private limited": ["industryType", "segmentType", "orgName", "incorpDate", "pan", "contactPerson", "mobileNumber", "pincode"],
            "partnership firm": ["industryType", "segmentType", "orgName", "incorpDate", "pan", "contactPerson", "mobileNumber", "pincode"],
        };

        // 🔹 Check Occupation
        if (isEmpty(finaloccupationCo)) {
            const labelText = isOrg ? "Registration Type" : "Primary Occupation";
            missingFields.push(`Please select a ${labelText}`);
        }

        const requiredFields = validationMap[occ];
        if (!requiredFields) {
            missingFields.push("Invalid co-applicant occupation type selected.");
        } else {
            requiredFields.forEach((field) => {
                if (isEmpty(formDataCo[field])) {
                    const action = dropdownFields.includes(field) ? "select" : "enter";
                    missingFields.push(`Please ${action} ${fieldLabels[field]}`);
                }
            });
        }

        // 🔸 Conditional Extra Fields for “Other” Industry Type
        if (isOrg) {
            if (payloadindco === "Other") {
                if (isEmpty(otherIndustryType))
                    missingFields.push(`Please enter ${fieldLabels.otherIndustryType}`);
                if (isEmpty(segtypetxt))
                    missingFields.push(`Please select ${fieldLabels.segtypetxt}`);
            } else if (isEmpty(segmentType)) {
                missingFields.push(`Please select ${fieldLabels.segmentType}`);
            }
        }

        // 🧾 Pattern Validations
        if (email && email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            missingFields.push("Invalid email format.");
        }

        if (mobileNumber && !/^\d{10}$/.test(mobileNumber)) {
            missingFields.push("Mobile Number must be a 10-digit number.");
        }

        if (pan && !/^([A-Z]{5}\d{4}[A-Z])$/.test(pan)) {
            missingFields.push("Invalid PAN format.");
        }

        return missingFields.length > 0 ? missingFields : true;
    };

    const renderApplicantView = () => {
        return (
            <>
                {formConfig.map((section) => {
                    const visibleFields = section.fields
                        .map(renderFieldQDEentry)
                        .filter(Boolean);
                    if (!visibleFields.length) return null;
                    if (
                        section.section === 'Organization Info' &&
                        (cateselec || '').toLowerCase() === 'individual'
                    )
                        return null;

                    return (
                        <View key={section.section} style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>{section.section}</Text>
                            <View style={styles.fieldContainer}>{renderRows(visibleFields)}</View>
                        </View>
                    );
                })}

                {/* Save / Submit Buttons */}
                <View style={styles.buttonSection}>
                    {!showSubmitButton ? (
                        loading ? (
                            <ActivityIndicator size="large" color="#007AFF" />
                        ) : (
                            <TouchableOpacity
                                style={[styles.button,]}
                                onPress={handleSave}
                            >
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                        )
                    ) : loadingf ? (
                        <ActivityIndicator size="large" color="#4CAF50" />
                    ) : (
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Co-Applicant Toggle */}
                {!CoApllicant && (
                    <View style={styles.switchOuter}>
                        <View style={styles.switchContainer}>
                            <Text style={styles.switchLabel}>
                                {isSettlement
                                    ? 'Going Without Co-Applicant'
                                    : 'Without Co-Applicant Lead'}
                            </Text>
                            <Switch
                                value={isSettlement}
                                onValueChange={toggleSwitch}
                                trackColor={{ false: '#D1D1D6', true: '#81b0ff' }}
                                thumbColor={isSettlement ? '#FFD700' : '#f4f3f4'}
                            />
                        </View>
                    </View>
                )}
            </>
        );
    }

    // 🧩 Co-Applicant Tab Content
    const renderCoApplicantView = () => {
        return (
            <>
                {formConfigCo.map((section) => {
                    const visibleFields = section.fields
                        .map(renderFieldQDEentryCo)
                        .filter(Boolean);
                    if (!visibleFields.length) return null;
                    if (
                        section.section === 'Organization Info' &&
                        (cateselec || '').toLowerCase() === 'individual'
                    )
                        return null;

                    return (
                        <View key={section.section} style={styles.sectionCard}>
                            <Text style={styles.sectionHeader}>{section.section}</Text>
                            <View style={styles.fieldContainer}>{renderRows(visibleFields)}</View>
                        </View>
                    );
                })}

                <View style={styles.buttonSection}>
                    {loadingCo ? (
                        <ActivityIndicator size="large" color="#007AFF" />
                    ) : (
                        <TouchableOpacity
                            style={[styles.button,]}
                            onPress={handleSaveCoApplicant}
                        >
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </>
        );
    }
    return (
        <SafeAreaView style={styles.safeContainer}>
            <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

            {/* 🔵 DELUXE HEADER */}
            <LinearGradient colors={["#005BEA", "#003A8C"]} style={styles.headerWrapper}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.headerLeft} onPress={openDrawer} activeOpacity={0.85}>
                        <Image source={require('../../asset//menus.png')} style={styles.drawerIcon} />
                        <Text style={styles.headerTitle}>Leads</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Box */}
                {/* Search + Create Button Row */}
                {/* Search Row */}
                <View style={styles.searchCreateRow}>
                    <View style={styles.searchBox}>
                        <TextInput
                            placeholder="Search leads..."
                            placeholderTextColor="#ccc"
                            style={styles.searchInput}
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.createBtn}
                        onPress={() => setIsModalVisiblecreate(true)}
                    >
                        <Text style={styles.createBtnText}>+ Create</Text>
                    </TouchableOpacity>
                </View>


                {/* Quick Filters */}
                <View style={styles.filterRow}>
                    <TouchableOpacity style={[styles.filterChip, styles.activeChip]}>
                        <Text style={styles.activeChipText}>All</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.chipText}>Pending</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.chipText}>In Review</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.filterChip}>
                        <Text style={styles.chipText}>Approved</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* MAIN CONTENT */}
            <View style={styles.mainContainer}>
                <FlatList
                    data={dummyLeads}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    renderItem={renderLeadCard}
                    contentContainerStyle={{ paddingBottom: 40 }}
                />
            </View>

            {/* CREATE LEAD MODAL */}
            <Modal
                animationType="fade"
                transparent
                visible={isModalVisiblecreate}
                onRequestClose={() => setIsModalVisiblecreate(false)}
            >
                <View style={styles.glassOverlay}>
                    <View style={styles.modalBackdropShield} />
                    <SafeAreaView style={styles.modalContainer}>

                        {/* HEADER */}
                        <LinearGradient
                            colors={["#005BEA", "#003A8C"]}
                            style={styles.modalHeader}
                        >
                            <Text style={styles.modalTitle}>Lead Creation</Text>

                            <TouchableOpacity onPress={handleClosePress}>
                                <Text style={styles.closeBtn}>✕</Text>
                            </TouchableOpacity>
                        </LinearGradient>

                        {/* GLASS CARD */}
                        <View style={styles.glassContentCard}>

                            {/* TOP TABS */}
                            <View style={styles.tabRow}>
                                {["Applicant", "Co-Applicant"].map((tab) => {
                                    if (tab === "Co-Applicant" && showSubmitButton) return null;

                                    return (
                                        <TouchableOpacity
                                            key={tab}
                                            style={[styles.tabItem, activeTab === tab && styles.tabActive]}
                                            onPress={() => {
                                                if (tab === "Co-Applicant") {
                                                    const missing = validateFields?.() || [];
                                                    if (missing.length > 0) {
                                                        Alert.alert(
                                                            "Alert ⚠️",
                                                            missing.map((f) => `• ${f}`).join("\n")
                                                        );
                                                        return;
                                                    }
                                                    if (!CoApllicant) {
                                                        Alert.alert("Alert ⚠️", "Please save the Applicant first!");
                                                        return;
                                                    }
                                                }
                                                setActiveTab(tab);
                                            }}
                                        >
                                            <Text
                                                style={[
                                                    styles.tabText,
                                                    activeTab === tab && styles.tabTextActive,
                                                ]}
                                            >
                                                {tab}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>

                            {/* SCROLL CONTENT */}
                            <ScrollView
                                showsVerticalScrollIndicator={false}
                                contentContainerStyle={{ paddingBottom: 60 }}
                            >
                                <View style={styles.glassScrollCard}>
                                    {activeTab === "Applicant"
                                        ? renderApplicantView()
                                        : renderCoApplicantView()}
                                </View>
                            </ScrollView>

                        </View>
                    </SafeAreaView>
                </View>
            </Modal>



        </SafeAreaView>
    );
};

export default Lead;

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
        backgroundColor: '#005BEA',
    },

    /** HEADER */
    headerWrapper: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 20,
        paddingBottom: 20,
        paddingHorizontal: 16,
        backgroundColor: '#005BEA',
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    drawerIcon: {
        width: 24,
        height: 24,
        tintColor: '#FFFFFF',
        marginRight: 10,
    },

    headerTitle: {
        fontSize: 22,
        color: '#FFFFFF',
        fontWeight: '700',
    },

    /** SEARCH BAR */
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.12)',
        borderRadius: 14,
        marginTop: 18,
        paddingHorizontal: 12,
        height: 42,
    },

    searchIcon: { width: 18, height: 18, tintColor: '#fff' },

    searchInput: {
        flex: 1,
        color: '#fff',
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '500',
    },

    /** FILTERS */
    filterRow: {
        flexDirection: 'row',
        marginTop: 14,
    },

    filterChip: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.18)',
        marginRight: 10,
    },

    chipText: {
        color: '#eee',
        fontSize: 13,
        fontWeight: '500',
    },

    activeChip: {
        backgroundColor: '#fff',
    },

    activeChipText: {
        color: '#005BEA',
        fontSize: 13,
        fontWeight: '700',
    },

    /** MAIN AREA */
    mainContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 16,
    },

    /** LEAD CARD */
    leadCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 3,
    },

    leadRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    leadName: {
        fontSize: 17,
        fontWeight: '600',
        color: '#222',
    },

    productText: {
        fontSize: 13,
        marginTop: 8,
        color: '#555',
    },

    leadFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        alignItems: 'center',
    },

    leadDate: {
        fontSize: 12,
        color: '#777',
    },

    viewBtn: {
        paddingVertical: 6,
        paddingHorizontal: 14,
        backgroundColor: '#005BEA',
        borderRadius: 10,
    },

    viewBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 13,
    },

    /** BADGES */
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 10,
        borderRadius: 20,
    },

    badgeText: {
        fontSize: 11,
        color: '#fff',
        fontWeight: '700',
    },

    badge_Pending: { backgroundColor: '#F59E0B' },
    badge_InReview: { backgroundColor: '#3B82F6' },
    badge_Approved: { backgroundColor: '#10B981' },

    /** Search + Create Row */
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 18,
    },

    createBtn: {
        marginLeft: 10,
        backgroundColor: '#FFFFFF',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    createBtnText: {
        color: '#005BEA',
        fontSize: 14,
        fontWeight: '700',
    },

    /** Modal Overlay */
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },

    modalWrapper: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '92%',
        paddingBottom: 10,
    },

    /** Tabs */
    tabContainer: {
        flexDirection: 'row',
        marginTop: 12,
        paddingHorizontal: 10,
    },

    tab: {
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        backgroundColor: '#EEE',
        marginRight: 10,
    },

    activeTab: {
        backgroundColor: '#005BEA',
    },

    tabText: {
        color: '#555',
        fontSize: 14,
        fontWeight: '600',
    },

    activeTabText: {
        color: '#fff',
        fontWeight: '700',
    },
    /****************************************************
     🔹 OVERLAY BACKDROP
    ****************************************************/

    glassWrapper: {
        flex: 1,
        justifyContent: "flex-start",
    },

    /****************************************************
     🔹 MODAL HEADER (Gradient)
    ****************************************************/
    modalHeader: {
        padding: 16,
        paddingTop: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },

    closeBtn: {
        fontSize: 22,
        color: "#fff",
        fontWeight: "800",
    },

    /****************************************************
     🔹 GLASS CARD CONTAINER
    ****************************************************/
    glassCard: {
        flex: 1,
        backgroundColor: "rgba(255,255,255,0.18)",
        borderRadius: 22,
        marginTop: -10,
        padding: 16,
        backdropFilter: "blur(18px)", // iOS only
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 12,
    },

    /****************************************************
     🔹 TABS 
    ****************************************************/
    tabRow: {
        flexDirection: "row",
        backgroundColor: "rgba(255,255,255,0.12)",
        padding: 6,
        borderRadius: 18,
        marginBottom: 14,
    },

    tabItem: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 14,
        alignItems: "center",
    },

    tabActive: {
        backgroundColor: "#fff",
    },

    tabText: {
        color: "#eee",
        fontSize: 14,
        fontWeight: "500",
    },

    tabTextActive: {
        color: "#005BEA",
        fontWeight: "700",
    },

    /****************************************************
     🔹 SEARCH + CREATE BUTTON ROW
    ****************************************************/
    searchCreateRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 16,
    },

    createBtn: {
        marginLeft: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: "#fff",
        justifyContent: "center",
    },

    createBtnText: {
        color: "#005BEA",
        fontWeight: "700",
        fontSize: 13,
    },
    glassInput: {
        backgroundColor: "rgba(255,255,255,0.20)",
        borderRadius: 14,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
    },
    glassLabel: {
        color: "#fff",
        fontSize: 13,
        opacity: 0.8,
    },
    glassValue: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },
    /** 🔹 Full screen blur background */
    glassOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",  // strong dim
        justifyContent: "flex-end",           // modal at bottom (cleaner)
    },
    /** 🔹 Outer modal rounded container */
    modalContainer: {
        flex: 1,
        borderRadius: 26,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.06)",
    },

    /** 🔹 Gradient header */
    modalHeader: {
        padding: 18,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#fff",
    },
    closeBtn: {
        fontSize: 26,
        color: "#fff",
        marginRight: 4,
    },

    /** 🔹 Middle Card Container */
    glassContentCard: {
        flex: 1,
        marginTop: 6,
        backgroundColor: "rgba(250,250,250,0.94)",  // NEW: solid form background
        borderTopLeftRadius: 26,
        borderTopRightRadius: 26,
        paddingTop: 10,
        overflow: "hidden",
    },

    /** 🔹 Tabs */
    tabRow: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginBottom: 10,
        backgroundColor: "rgba(255,255,255,0.10)",
        borderRadius: 18,
        padding: 4,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 15,
        alignItems: "center",
    },
    tabActive: {
        backgroundColor: "#fff",
    },
    tabText: {
        fontSize: 14,
        color: "#fff",
        opacity: 0.7,
        fontWeight: "600",
    },
    tabTextActive: {
        color: "#005BEA",
        fontWeight: "700",
        opacity: 1,
    },

    /** 🔹 The main scroll card (THIS FIXES YOUR PROBLEM) */
    glassScrollCard: {
        backgroundColor: "transparent", // NEW
        padding: 16,
        marginHorizontal: 12,
        borderRadius: 22,
        marginTop: 10,
        overflow: "hidden",
    },
    sectionCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 10,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionHeader: {
        fontSize: 15,
        fontWeight: "700",
        color: "#111827",
        marginBottom: 6
    },
    fieldContainer: {
        gap: 8
    },
});
