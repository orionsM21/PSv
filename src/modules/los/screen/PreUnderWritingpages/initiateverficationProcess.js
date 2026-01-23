// // import { StyleSheet, Text, View } from 'react-native'
// // import React from 'react'

// // const initiateverficationProcess = () => {
// //   return (
// //     <View>
// //       <Text>initiateverficationProcess</Text>
// //     </View>
// //   )
// // }

// // export default initiateverficationProcess

// // const styles = StyleSheet.create({})

// import React from 'react';
// import { View, Text, StyleSheet } from 'react-native';

// const initiateverficationProcess = ({ route }) => {
//   // Access the passed 'item' data using route.params
//   const { item } = route.params;

//   // You can now use the `item` data to display the application information
//   const applicant = item.applicant[0]?.individualApplicant;

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>Application Details</Text>
//       <Text style={styles.detailText}>Application No: {item.applicationNo}</Text>
//       <Text style={styles.detailText}>Name: {applicant?.firstName} {applicant?.lastName}</Text>
//       <Text style={styles.detailText}>Product: {item.productName}</Text>
//       <Text style={styles.detailText}>Category: {item.applicant[0]?.applicantCategoryCode}</Text>
//       <Text style={styles.detailText}>Mobile: {applicant?.mobileNumber}</Text>
//       <Text style={styles.detailText}>Stage: {item.stage}</Text>
//       <Text style={styles.detailText}>ID: {item.id}</Text>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 16,
//     backgroundColor: 'white',
//   },
//   title: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     marginBottom: 16,
//   },
//   detailText: {
//     fontSize: 16,
//     marginBottom: 8,
//   },
// });

// export default initiateverficationProcess;

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity, ActivityIndicator, Alert,
  SafeAreaView
} from 'react-native';
// import CheckBox from '@react-native-community/checkbox';
import { Dropdown } from 'react-native-element-dropdown';
import { BASE_URL } from '../../api/Endpoints';
import axios from 'axios';
import { useNavigation, useFocusEffect, } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import ApplicationDetails from '../Component/ApplicantDetailsComponent';
import { RenderDropdownField, RenderTextField } from '../Component/ResponsiveFormFields';
import DetailHeader from '../Component/DetailHeader';

const { width, height } = Dimensions.get('window');

const FormField = ({
  label,
  value,
  editable = true,
  onChange,
  placeholder,
  type = 'text', // 'text' or 'dropdown'
  data = [],
  disabled = false,
  selectedTextStyle,
  keyboardType = 'default', // <-- add this
}) => {
  return (
    <View style={styles.formGroup}>
      <Text style={styles.label}>
        {label}
        {!editable && <Text style={styles.required}>*</Text>}
      </Text>
      {type === 'dropdown' ? (
        <Dropdown
          data={data}
          labelField="label"
          valueField="value"
          value={value}
          onChange={onChange}
          style={[
            styles.dropdown,
            disabled && styles.disabledDropdown, // greyed out if disabled
          ]}
          placeholder={placeholder || `${label}`}
          placeholderStyle={{ color: '#888' }} // proper placeholder color
          selectedTextStyle={selectedTextStyle || { color: 'black' }}
          disabled={disabled}
          renderItem={(item) => (
            <View style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </View>
          )}
        />
      ) : (
        <TextInput
          style={[
            styles.input,
            !editable && styles.disabledInput,
          ]}
          value={value || ''}
          onChangeText={onChange}
          editable={editable}
          placeholder={placeholder}
          placeholderTextColor="#888"
          keyboardType={keyboardType} // <-- pass it here
        />
      )}
    </View>
  );
};

// ---------------- Checkbox Item ----------------
const CheckboxItem = ({ label, checked, onPress, disabled }) => (
  <TouchableOpacity
    style={styles.checkboxContainer}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[styles.checkbox, checked && styles.checked]}>
      {checked ? '✓' : ''}
    </Text>
    <Text style={styles.checkboxLabel}>{label}</Text>
  </TouchableOpacity>
);

// ---------------- Section Wrapper ----------------
const VerificationSection = ({
  title,
  children,
  style,

}) => (
  <View style={[styles.sectionWrapper, style]}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);


const VerificationBlock = React.memo(({
  title,
  isCheckedInternal,
  isCheckedWaiver,
  toggleInternal,
  toggleWaiver,
  noOfInstance,
  handleNoOfInstanceChange,
  waiverData,
  selectedWaiver,
  handleDropdownChange,
  remark,
  setRemark,
  disabled,
  renderRows,
  isEditable = true // 👈 added default for safety
}) => {
  const fields = [
    <RenderTextField
      key="noOfInstance"
      label="No of Instance"
      value={String(noOfInstance)}
      onChange={handleNoOfInstanceChange}
      editable={!disabled}
      isEditable={isEditable}
      numeric
    />,

    <RenderDropdownField
      key="waiverReason"
      label="Waiver Reason"
      data={waiverData}
      value={selectedWaiver}
      onChange={handleDropdownChange}
      isEditable={isEditable && !isCheckedInternal} // disable when internal checked
      placeholder="Select Waiver Reason"
      enableSearch
    />,

    <RenderTextField
      key="remark"
      label="Remark"
      value={remark}
      onChange={setRemark}
      editable={!disabled}
      isEditable={isEditable}
      placeholder="Enter Remark"
    />
  ];

  return (
    <VerificationSection title={title} style={{ marginVertical: 5 }}>
      <View style={styles.checkboxRow}>
        <CheckboxItem
          label="Internal"
          checked={isCheckedInternal}
          onPress={toggleInternal}
          disabled={disabled}
        />
        <CheckboxItem
          label="Waiver"
          checked={isCheckedWaiver}
          onPress={toggleWaiver}
          disabled={disabled}
        />
      </View>

      {/* Render fields in 2-column responsive layout */}
      {renderRows(fields, 2, 10)}
    </VerificationSection>
  );
});

const InitiateverficationProcess = ({ route }) => {
  const { item } = route.params;
  const aaplicantName = item.applicant?.find(a => a.applicantTypeCode === 'Applicant')
  const userDetails = useSelector((state) => state.auth.losuserDetails);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation(); // Access navigation to go back

  const [residid, setresidid] = useState([]);
  const applicant = item.applicant[0]?.individualApplicant;
  const [applicationByid, setApplicationByid] = useState(null);
  const [firstNames, setFirstNames] = useState([]);
  const token = useSelector((state) => state.auth.token);
  // 
  const [getInitiateVerificationByApplicantidd, setgetInitiateVerificationByApplicantidd] = useState([]);
  const [residence, setresidence] = useState([]);
  const [office, setoffice] = useState([]);
  // 
  const [Cibilid, setCibilid] = useState('');
  const [applicantCategoryCode, setApplicantCategoryCode] = useState('');
  const [applicantidindividualApplicant, setApplicantidIndividualApplicant] = useState([]);


  const [ApplicantArray, setApplicantArray] = useState([]); // To store
  const [AgnecyForLengthOffice, setAgnecyForLengthOffice] = useState([]);

  const [applicantidApplicant, setApplicantidApplicant] = useState(null);
  const [selectedApplicantType, setSelectedApplicantType] = useState('');
  const [applicantTypes, setApplicantTypes] = useState([]); // To store applicant types for dropdown
  const [fullName, setFullName] = useState('');

  const [selectedExistinguser, setSelectedExistinguser] = useState('');
  // 

  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [isChecked3, setIsChecked3] = useState(false);

  const [isChecked1o, setIsChecked1o] = useState(false);
  const [isChecked2o, setIsChecked2o] = useState(false);
  const [isChecked3o, setIsChecked3o] = useState(false);


  const [dropdownData, setDropdownData] = useState([]);
  const [dropdownDataOfficeext, setDropdownDataOfficeext] = useState([]);


  const [remark, setremark] = useState('');
  const [remarko, setremarko] = useState('')

  // const [residextAgencytype, setResidextAgencytype] = useState('');
  const [officeextAgencytype, setOfficeextAgencytype] = useState('');

  const [noofInstance, setnoofInstance] = useState('');
  const [OfficenoofInstance, setOfficenoofInstance] = useState('');

  // const [residenceextagency, setResidenceExtagency] = useState([]);
  const [selectedResidenceExtagency, setselectedResidenceExtagency] =
    useState('');
  // 

  const [residencewaiver, setResidenceWaiver] = useState([]);
  const [selectedResidenceWaiver, setselectedResidenceWaiver] = useState('');
  // 

  const [Officeextagency, setOfficeExtagency] = useState([]);
  const [selectedOfficeExtagency, setselectedOfficeExtagency] = useState('');

  const [residenceExternalAgencyTypes, setResidenceExternalAgencyType] = useState('');
  const [officeExternalAgencyTypes, setOfficeExternalAgencyType] = useState('');

  // 

  const [officewaiveragency, setofficewaiveragency] = useState([]);
  const [selectedofficewaiveragency, setselectedofficewaiveragency] = useState('');

  const [waiverDetailsByApplicant, setWaiverDetailsByApplicant] = useState({});



  const [dropdownDataresidenceWaiv, setDropdownDataresidenceWaiv] = useState(
    [],
  );
  const [dropdownDataOfficeWaiv, setDropdownDataOfficeWaiv] = useState([]);

  const [selectedApplicantTyperesidence, setSelectedApplicantTyperesidence] =
    useState(null);
  const [selectedApplicantTypeoffice, setSelectedApplicantTypeoffice] =
    useState(null);
  // 

  const [
    selectedApplicantTyperesidenceWaiv,
    setSelectedApplicantTyperesidenceWaiv,
  ] = useState(null);
  const [selectedApplicantTypeofficewaiv, setSelectedApplicantTypeofficeWaiv] =
    useState(null);

  const [isDropdownDisabled, setIsDropdownDisabled] = useState(true);

  const isDropdownDisabledWaiv = isChecked1 || isChecked2;

  const [logdetails, setLogDetails] = useState([]);
  const [AllAgency, settAllAGency] = useState([]);
  const [uniqueAgencyNames, setUniqueAgencyNames] = useState([]);
  const [residextAgencytype, setResidextAgencytype] = useState(null);
  const [AgencyOptions, setAgencyOptions] = useState([]);
  const [AgencyOptionsOffice, setAgencyOptionsOffice] = useState([]);
  const isPending = residid.status === 'Pending';
  // 

  const [savedStatus, setSavedStatus] = useState({
    applicant: false,
    coApplicant: false,
    guarantor: false,
  });

  // 
  useEffect(() => {
    getApplicationByid();
    getLogsDetailsByApplicationNumber();
  }, []);
  // useEffect(() => {
  //   if (applicantidApplicant) {
  //     getInitiateVerificationByApplicantid();
  //   }
  // }, [applicantidApplicant]);

  useEffect(() => {
    // Find the "Residence Verification" object
    const residenceVerification = getInitiateVerificationByApplicantidd.find(
      item => item.verificationLists === 'Residence_Verification',
    );
    // 

    if (residenceVerification && residenceVerification.externalAgency) {
      getAllAgency();
      setFilteredAgencies([
        {
          label: residenceVerification.externalAgency,
          value: residenceVerification.externalAgency,
        },
      ]);
      // setselectedResidenceExtagency(residenceVerification.externalAgency);

      setselectedResidenceExtagency(residenceVerification.externalAgency);
      const existingType = agencyTypes.find(
        type => type.label === residenceVerification.externalAgencyType
      );

      // If not, add it to the options
      if (!existingType) {
        setAgencyTypes(prev => [
          ...prev,
          {
            label: residenceVerification.externalAgencyType,
            value: residenceVerification.externalAgencyType,
          },
        ]);
      }

      // Set the selected value
      setResidextAgencytype(residenceVerification.externalAgencyType);
    } else {
      setselectedResidenceExtagency('');
    }

    if (residenceVerification && residenceVerification.waiverReason) {
      setResidenceWaiver([
        {
          label: residenceVerification.waiverReason,
          value: residenceVerification.waiverReason, // Ensure this matches the dropdown's valueField
        },
      ]);
      setselectedResidenceWaiver(residenceVerification.waiverReason); // Set the correct value
    } else {
      setResidenceWaiver([]);
      setselectedResidenceWaiver('');
    }

    //     if(officeVerifcation && officeVerifcation)
  }, [getInitiateVerificationByApplicantidd]);

  useEffect(() => {
    const officeVerifcation = getInitiateVerificationByApplicantidd.find(
      item => item.verificationLists === 'Office_Verification',
    );

    if (officeVerifcation && officeVerifcation.externalAgency) {
      setOfficeExtagency([
        {
          label: officeVerifcation.externalAgency,
          value: officeVerifcation.externalAgency,
        },
      ]);
      setselectedOfficeExtagency(officeVerifcation.externalAgency);
    } else {
      setselectedOfficeExtagency('');
    }

    if (officeVerifcation && officeVerifcation.externalAgency) {
      getAllAgencyoffice();
      setFilteredAgenciesOffice([
        {
          label: officeVerifcation.externalAgency,
          value: officeVerifcation.externalAgency,
        },
      ]);
      // setselectedResidenceExtagency(officeVerifcation.externalAgency);

      setselectedOfficeExtagency(officeVerifcation.externalAgency);
      const existingType = agencyTypes.find(
        type => type.label === officeVerifcation.externalAgencyType
      );

      // If not, add it to the options
      if (!existingType) {
        setAgencyTypesOffice(prev => [
          ...prev,
          {
            label: officeVerifcation.externalAgencyType,
            value: officeVerifcation.externalAgencyType,
          },
        ]);
      }

      // Set the selected value
      setOfficeextAgencytype(officeVerifcation.externalAgencyType);
    } else {
      setselectedOfficeExtagency('');
    }

    if (officeVerifcation && officeVerifcation.waiverReason) {
      setofficewaiveragency([
        {
          label: officeVerifcation.waiverReason,
          value: officeVerifcation.waiverReason,
        },
      ]);

      setselectedofficewaiveragency(officeVerifcation.waiverReason);
    } else {
      setselectedofficewaiveragency('');
    }

    // 
  }, [getInitiateVerificationByApplicantidd]);

  const handleDropdownChangeResidence = (item) => {
    setselectedResidenceExtagency(item.value); // Update the selected agency state
    // For further processing
  };


  const handleDropdownChangeOffice = item => {
    setselectedOfficeExtagency(item.label);
  };

  const handleDropdownChangeResidenceWaiv = item => {
    setselectedResidenceWaiver(item.label);
    setSelectedApplicantTyperesidenceWaiv(item.value);
  };

  const handleDropdownChangeOfficeWaiv = async item => {
    setselectedofficewaiveragency(item.label);

    // Call the API when a Waiver Reason is selected

    // getWaiverReasonData(); // Fetch waiver reason data based on the selected value

  };


  const getApplicationByid = useCallback(async () => {
    if (!item || !item.id) {
      console.error('Item ID is missing');
      return; // Exit early if item or item.id is undefined
    }

    try {
      const response = await axios.get(
        `${BASE_URL}getApplicationById/${item.id}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );
      const data = response.data.data;
      setApplicationByid(data);
      const filterHouseWife = data?.applicant?.filter(
        (val) => val?.individualApplicant?.primaryOccupation === 'House Wife',
      )
      setAgnecyForLengthOffice(filterHouseWife);
      // 

      // Ensure that data is valid before proceeding
      if (!data) {
        throw new Error('Application data not found');
      }

      const applicants = data?.applicant || [];
      const applicationNumber = data?.applicationNo || '';
      const userName = data?.createdBy?.userName || '';

      setApplicantArray(applicants);
      // if (applicants.length > 0) setApplicant(applicants[0]);
      // if (applicants.length > 1) setCoApplicant(applicants[1]);
      // if (applicants.length > 2) setguarantor(applicants[2]);
      const applicantCodes = applicants.map(app => ({
        type: app.applicantTypeCode,
        id: app.id
      }));

      // Check if mapping works
      setApplicantTypes(applicantCodes);
      // setApplicationDetails(Array.isArray(data) ? data : [data || {}]);

      // Now call addLogActivity with applicationNumber and userName
      // await addLogActivity(applicationNumber, userName);
      // await updateStageMainTainByApplicationNumber();
    } catch (error) {
      console.error('Error fetching application data:', error);
      Alert.alert('Error', 'Failed to fetch application data');
    }
  }, []);


  const getInitiateVerificationByApplicantid = async (userid) => {
    try {
      const response = await axios.get(
        `${BASE_URL}getInitiateVerificationByApplicantId/${userid}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response?.data?.data;

      // 🔹 Handle empty or invalid data
      if (!Array.isArray(data) || data.length === 0) {
        setgetInitiateVerificationByApplicantidd([]);
        setIsChecked1(false);
        setIsChecked2(false);
        setIsChecked3(false);
        setIsChecked1o(false);
        setIsChecked2o(false);
        setIsChecked3o(false);
        return;
      }

      setgetInitiateVerificationByApplicantidd(data);

      // 🔹 Extract Residence and Office verifications
      const Residence = data.find(item => item?.verificationLists === 'Residence_Verification');
      const Office = data.find(item => item?.verificationLists === 'Office_Verification');



      // 🔹 Update waiver details for this applicant
      if (Residence || Office) {
        setWaiverDetailsByApplicant(prev => ({
          ...prev,
          [userid]: {
            label: Residence?.applicantName || Office?.applicantName || userid,
            residence: {
              internal: Residence?.internal ?? false,
              external: Residence?.external ?? false,
              waiver: Residence?.waiver ?? false,
              noOfInstances: Residence?.noOfInstances ?? '',
              waiverReason: Residence?.waiverReason ?? '',
              remarks: Residence?.remarks ?? '',
            },
            office: {
              internal: Office?.internal ?? false,
              external: Office?.external ?? false,
              waiver: Office?.waiver ?? false,
              noOfInstances: Office?.noOfInstances ?? '',
              waiverReason: Office?.waiverReason ?? '',
              remarks: Office?.remarks ?? '',
            },
          },
        }));
      }

      // 🔹 Set Residence/Office states
      setresidence(Residence);
      setoffice(Office);

      // 🔹 Update checkbox states safely
      const safeCheck = (item, key) => (item ? item[key] || false : false);
      setIsChecked1(safeCheck(Residence, 'internal'));
      setIsChecked2(safeCheck(Residence, 'external'));
      setIsChecked3(safeCheck(Residence, 'waiver'));
      setIsChecked1o(safeCheck(Office, 'internal'));
      setIsChecked2o(safeCheck(Office, 'external'));
      setIsChecked3o(safeCheck(Office, 'waiver'));

      // 🔹 Extract full name if individual applicant exists
      if (data[0]?.individualApplicant) {
        const { firstName, lastName, middleName } = data[0].individualApplicant;
        setFullName(`${firstName || ''} ${middleName || ''} ${lastName || ''}`.trim());
      }

    } catch (error) {
      console.error('❌ Error fetching getInitiateVerificationByApplicantId data:', error);

      // Reset states on failure
      setgetInitiateVerificationByApplicantidd([]);
      setIsChecked1(false);
      setIsChecked2(false);
      setIsChecked3(false);
      setIsChecked1o(false);
      setIsChecked2o(false);
      setIsChecked3o(false);
    }
  };




  const getLogsDetailsByApplicationNumber = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}getLogsDetailsByApplicationNumber/${item.applicationNo}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }
      );
      const data = response.data.data;
      setLogDetails(data);

      // Filter objects with description "InitiateVerification"
      const residenceVerifications = data.filter(
        (log) => log?.description === "InitiateVerification"
      );

      const FeeDetails = data.filter(
        (log) => log?.description === "Fee Details"
      );

      const isPending = FeeDetails.some((detail) => detail.status === "Pending");

      if (isPending) {
        Alert.alert(
          "Pending Fee Details",
          "Fee Details have a pending status. Please complete the required actions.",
          [
            {
              text: "OK",
              onPress: () => navigation.goBack(), // Navigate to the previous page
            },
          ],
          { cancelable: false } // Prevent dismissing the alert by tapping outside
        );
      }

      if (residenceVerifications.length === 1) {
        // Only one object, handle as before
        setresidid(residenceVerifications[0]);
      } else if (residenceVerifications.length > 1) {
        // Multiple objects, check their status
        const pendingVerification = residenceVerifications.find(
          (log) => log?.status === "Pending"
        );

        if (pendingVerification) {
          setresidid(pendingVerification);
        } else {
          // If no pending status found, pick the first one
          setresidid(residenceVerifications[0]);
        }
      } else {
        console.warn("Residence Verification object not found");
      }
    } catch (error) {
      console.error(
        'Error fetching logs details by application number:',
        error
      );
    }
  };


  const handleDropdownChange = async (item) => {
    try {


      // Reset all states
      setSelectedApplicantType(item.value);
      setgetInitiateVerificationByApplicantidd([]);
      setIsChecked1(false);
      setIsChecked2(false);
      setIsChecked3(false);
      setIsChecked1o(false);
      setIsChecked2o(false);
      setIsChecked3o(false);
      setresidence([]);
      setoffice([]);

      const userid = item.value;

      // Find the selected applicant in the array
      const selectedApplicant = ApplicantArray.find(app =>
        (aaplicantName?.applicantCategoryCode === 'Organization'
          ? app.organizationApplicant
          : app.individualApplicant) && app.id === userid
      );

      if (!selectedApplicant) {
        // console.error('Selected applicant not found');
        setApplicantCategoryCode('');
        setFullName('');
        return;
      }

      // Fetch verification data
      await getInitiateVerificationByApplicantid(userid);

      // Common IDs
      const applicantId = selectedApplicant.id;
      setApplicantidApplicant(applicantId);
      setApplicantidIndividualApplicant(applicantId);
      setCibilid(applicantId);

      // Set category and full name depending on type
      if (aaplicantName?.applicantCategoryCode === 'Organization') {
        const { organizationApplicant } = selectedApplicant;
        setApplicantCategoryCode(organizationApplicant?.primaryOccupation || '');
        setFullName(organizationApplicant?.organizationName || '');
      } else {
        const { individualApplicant } = selectedApplicant;
        setApplicantCategoryCode(individualApplicant?.primaryOccupation || '');
        const { firstName, middleName, lastName } = individualApplicant || {};
        setFullName(`${firstName || ''} ${middleName || ''} ${lastName || ''}`.trim());
      }

    } catch (error) {
      console.error('Error handling dropdown change:', error);
    }
  };




  const coApplicantCountMap = {};
  const guarantorCountMap = {};

  const applicantTypess = applicantTypes.map(({ type, id }) => {
    if (type === "Co-Applicant") {
      coApplicantCountMap[type] = (coApplicantCountMap[type] || 0) + 1;
      return { label: `Co-Applicant ${coApplicantCountMap[type]}`, value: id };
    } else if (type === "Guarantor") {
      guarantorCountMap[type] = (guarantorCountMap[type] || 0) + 1;
      return { label: `Guarantor ${guarantorCountMap[type]}`, value: id };
    } else {
      return { label: type, value: id }; // Ensure id is used as value
    }
  });










  const toggleCheckbox = async (setCheckboxState, checkboxType) => {
    setCheckboxState(prevState => {
      const newState = !prevState; // Toggle the current checkbox state

      if (newState) {
        // When checkbox is checked
        if (checkboxType === 'internal') {
          setIsChecked2(false); // Disable External
          setIsChecked3(false); // Disable Waiver
          setFilteredAgencies([]);
          setselectedResidenceExtagency('');
          setResidenceWaiver([]);
          setAgencyTypes([]);

          setselectedResidenceWaiver('');
          setResidextAgencytype(''); // Clear External Agency Type
          getAgencyByAgencyName('Internal%20User');

        } else if (checkboxType === 'external') {
          setIsChecked1(false); // Disable Internal
          setIsChecked3(false); // Disable Waiver
          setResidenceWaiver([]);
          setselectedResidenceWaiver('');
          getAgencyByAgencyName('External%20User');
          getAllAgency();

        } else if (checkboxType === 'waiver') {
          setIsChecked1(false); // Disable Internal
          setIsChecked2(false); // Disable External
          setFilteredAgencies([]);
          setAgencyTypes([]);
          setselectedResidenceExtagency('');
          setResidextAgencytype(''); // Clear External Agency Type
          getWaiverReasonData(); // Call the Waiver Reason API
        } else {
          setIsChecked1(false); // Disable Internal
          setIsChecked2(false); // Disable External
          setAgencyTypes([]);
          setFilteredAgencies([]);
          setselectedResidenceExtagency('');
          setResidenceWaiver([]);
          setselectedResidenceWaiver('');
          setResidextAgencytype(''); // Clear External Agency Type
        }
      } else {
        // If checkbox is unchecked, clear the External Agency Type
        setAgencyTypes([]);
        setFilteredAgencies([]);
        setselectedResidenceExtagency('');
        setResidenceWaiver([]);
        setselectedResidenceWaiver('');
        setResidextAgencytype(''); // Clear External Agency Type
      }

      return newState; // Return the updated state
    });
  };


  const toggleCheckboxo = async (setCheckboxState, checkboxType) => {
    setCheckboxState(prevState => {
      const newState = !prevState; // Toggle the current checkbox state

      // If the checkbox is being checked
      if (newState) {
        if (checkboxType === 'internal') {
          setIsChecked2o(false); // Disable External
          setIsChecked3o(false); // Disable Waiver
          // setOfficeExtagency([]); // Clear dropdown data
          setAgencyTypesOffice([]);
          setFilteredAgenciesOffice([]); // Clear dropdown data
          setselectedOfficeExtagency(''); // Clear selected value
          setofficewaiveragency([]);  // Clear the dropdown
          setselectedofficewaiveragency('');  // Clear the selected value
          // Call the API for 'internal'
          setOfficeextAgencytype('')
          getAgencyByAgencyName('Internal%20User');

        } else if (checkboxType === 'external') {
          setIsChecked1o(false); // Disable Internal
          setIsChecked3o(false); // Disable Waiver
          setofficewaiveragency([]);  // Clear the dropdown
          setselectedofficewaiveragency('');  // Clear the selected value
          // Call the API for 'external'
          // setOfficeextAgencytype('Legal')
          getAgencyByAgencyName('External%20User');
          getAllAgencyoffice();

        } else if (checkboxType === 'waiver') {
          // Only call the API for Waiver when this checkbox is checked
          setIsChecked1o(false); // Disable Internal
          setIsChecked2o(false); // Disable External
          // setOfficeExtagency([]); // Clear dropdown data
          setAgencyTypesOffice([]);
          setFilteredAgenciesOffice([]); // Clear dropdown data
          setselectedOfficeExtagency(''); // Clear selected valu
          setOfficeextAgencytype('')
          // Call the API for Waiver
          getWaiverReasonData();  // Call your Waiver Reason API

        } else {
          setIsChecked1o(false); // Disable Internal
          setIsChecked2o(false); // Disable External
          setAgencyTypesOffice([]);
          // setOfficeExtagency([]); // Clear dropdown data
          setFilteredAgenciesOffice([]); // Clear dropdown data
          setselectedOfficeExtagency(''); // Clear selected value
          setofficewaiveragency([]);  // Clear the dropdown
          setselectedofficewaiveragency('');  // Clear the selected value
          setOfficeextAgencytype('')

        }
      } else {
        setAgencyTypesOffice([]);
        // setOfficeExtagency([]); // Clear dropdown data
        setFilteredAgenciesOffice([]); // Clear dropdown data
        setofficewaiveragency([]);
        setselectedOfficeExtagency(''); // Clear selected value
        setselectedofficewaiveragency('');  // Clear the selected value
      }

      return newState; // Return the updated state
    });
  };




  const getAgencyByAgencyName = async (userType) => {
    try {
      const response = await axios.get(
        `${BASE_URL}getAgencyByAgencyName/${userType}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );


      // If the API returns valid data for the "external" agency
      if (userType === 'External%20User' && response.data && response.data.data && response.data.data.length > 0) {
        // Map the array of agencies to the expected format for the dropdown
        const agencyData = response.data.data.map(agency => ({
          label: `${agency.firstName} ${agency.lastName}`,  // Assuming the response contains 'firstName' and 'lastName'
          value: agency.userId,    // Assuming the response contains 'userId'
        }));


        // Update dropdown data
        // setOfficeExtagency(agencyData);
        // setResidenceExtagency(agencyData);

        // Set default selection to the first value in the list (if available)
        // setselectedOfficeExtagency(agencyData.length > 0 ? agencyData[0].value : '');
      } else {
        // Handle the case when no external agency data is found or returned
        // setOfficeExtagency([]); // Clear the dropdown data
        // setFilteredAgenciesOffice([]); // Clear dropdown data
        // // setResidenceExtagency([]);
        // setFilteredAgencies([]);
        // setselectedOfficeExtagency(''); // Clear the selected value
      }
    } catch (error) {
      console.error('Error fetching agency data:', error);
    }
  };

  const getWaiverReasonData = async waiverType => {
    try {
      const response = await axios.get(`${BASE_URL}getByType?lookupType=WaiverReason`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );


      // If the API returns valid data for Waiver Reason
      if (response.data && response.data.data && response.data.data.length > 0) {
        const waiverData = response.data.data.map(waiver => ({
          label: waiver.lookupName,  // Assuming the response contains 'lookupName'
          value: waiver.lookupCode,    // Assuming the response contains 'lookupId'
        }));

        setofficewaiveragency(waiverData);  // Update dropdown data
        // setselectedofficewaiveragency(waiverData.length > 0 ? waiverData[0].value : '');  // Set default selection

        setResidenceWaiver(waiverData); //
      } else {
        // Handle case when no waiver reason data is found
        setofficewaiveragency([]);  // Clear the dropdown
        setselectedofficewaiveragency('');  // Clear the selected value
        setResidenceWaiver([]); // Clear the dropdown
        setselectedResidenceWaiver('')

      }
    } catch (error) {
      console.error('Error fetching waiver reason data:', error);
    }
  };


  const [agencyData, setAgencyData] = useState([]);
  const [agencyDataOffice, setAgencyDataOfiice] = useState([]);

  const [agencyTypes, setAgencyTypes] = useState([]);
  const [agencyTypeOffice, setAgencyTypesOffice] = useState([]);

  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [filteredAgenciesOffice, setFilteredAgenciesOffice] = useState([]);

  // ✅ Fetch the agency data
  const getAllAgency = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getAllAgency`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      const data = response.data.data.content;
      setAgencyData(data);

      // ✅ Extract unique agency types
      const uniqueAgencyTypes = [
        ...new Map(data.map(item => [item.agencyType.agencyTypeName, item.agencyType])).values(),
      ];
      setAgencyTypes(uniqueAgencyTypes);


    } catch (error) {
      console.error('Error fetching agencies:', error);
    }
  };

  const getAllAgencyoffice = async () => {
    try {
      const response = await axios.get(`${BASE_URL}getAllAgency`, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      });

      const data = response.data.data.content;
      setAgencyDataOfiice(data);

      // ✅ Extract unique agency types
      const uniqueAgencyTypes = [
        ...new Map(data.map(item => [item.agencyType.agencyTypeName, item.agencyType])).values(),
      ];

      setAgencyTypesOffice(uniqueAgencyTypes);

    } catch (error) {
      console.error('Error fetching agencies:', error);
    }
  };

  // ✅ Filter agencies based on selected agency type
  const handleAgencyTypeChange = (value) => {
    if (!value || typeof value.value !== 'string') return;

    setResidextAgencytype(value.value);

    // Filter agencyData based on the selected agencyTypeName
    const filtered = agencyData.filter(
      item => item.agencyType?.agencyTypeName?.toLowerCase().trim() === value.value.toLowerCase().trim()
    );

    // Update the filtered agencies
    setFilteredAgencies(
      filtered.map(item => ({
        label: item.agencyName,
        value: item.agencyName,
      }))
    );


  };



  const handleAgencyTypeChangeOffice = (value) => {
    if (!value || typeof value.value !== 'string') return;
    setOfficeextAgencytype(value.value);
    const filtered = agencyDataOffice.filter(
      item => item.agencyType?.agencyTypeName?.toLowerCase().trim() === value.value.toLowerCase().trim()
    );

    // Update the filtered agencies
    setFilteredAgenciesOffice(
      filtered.map(item => ({
        label: item.agencyName,
        value: item.agencyName,
      }))
    );


  };


  useEffect(() => {
    const residenceRemarks =
      getInitiateVerificationByApplicantidd.find(
        item => item?.verificationLists === 'Residence_Verification',
      )?.remarks || ''; // Default to an empty string if not found
    setremark(residenceRemarks);

    const officeRemarks =
      getInitiateVerificationByApplicantidd.find(
        item => item?.verificationLists === 'Office_Verification',
      )?.remarks || ''; // Default to an empty string if not found
    setremarko(officeRemarks);
  }, [getInitiateVerificationByApplicantidd]); // Re-run if `getInitiateVerificationByApplicantidd` changes



  useEffect(() => {
    const residenceExternalAgencyType =
      getInitiateVerificationByApplicantidd.find(
        item => item?.verificationLists === 'Residence_Verification',
      )?.externalAgencyType || ''; // Default to an empty string if not found
    setResidextAgencytype(residenceExternalAgencyType);

    const officeExternalAgencyType =
      getInitiateVerificationByApplicantidd.find(
        item => item.verificationLists === 'Office_Verification',
      )?.externalAgencyType || ''; // Default to an empty string if not found
    setOfficeextAgencytype(officeExternalAgencyType);


    const residenceNoOfinstance =
      getInitiateVerificationByApplicantidd.find(
        item => item.verificationLists === 'Residence_Verification',
      )?.noOfInstances || ''; // Default to an empty string if not found
    setnoofInstance(residenceNoOfinstance);

    const officeNoOfInstance =
      // getInitiateVerificationByApplicantidd.find(
      //   item => item.verificationLists === 'Office_Verification',
      // )?.noOfInstances || '';

      getInitiateVerificationByApplicantidd.find(
        item => item?.verificationLists === 'Office_Verification',
      )?.noOfInstances || '';// Default to an empty string if not found
    setOfficenoofInstance(officeNoOfInstance)

  }, [getInitiateVerificationByApplicantidd]);



  // Function to make the API call
  const createInitiateVerification = async () => {
    // Check if agency data is available for the applicant
    const hasAgencyData = AgnecyForLengthOffice?.[0]?.id === applicantidApplicant;


    // Base DTO structure
    const dto = {
      applicantId: applicantidApplicant,
      applicationNumber: item?.applicationNo,
      initiateVerificationLists: [
        {
          initiateVerificationId: residence?.initiateVerificationId || '',
          verificationLists: "Residence_Verification",
          internal: !!isChecked1,
          external: !!isChecked2,
          waiver: !!isChecked3,
          noOfInstances: noofInstance,
          waiverReason: selectedResidenceWaiver,
          remarks: remark
        }
      ]
    };

    // Conditionally include Office_Verification block
    if (!hasAgencyData) {
      dto.initiateVerificationLists.push({
        initiateVerificationId: office?.initiateVerificationId || '',
        verificationLists: "Office_Verification",
        internal: !!isChecked1o,
        external: !!isChecked2o,
        waiver: !!isChecked3o,
        noOfInstances: OfficenoofInstance,
        waiverReason: selectedofficewaiveragency,
        remarks: remarko
      });
    }

    try {
      setLoading(true);


      const response = await RNFetchBlob.fetch(
        "PUT",
        `createInitiateVerification`,
        {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        [
          {
            name: "dto",
            data: JSON.stringify(dto),
            type: "application/json"
          }
        ]
      );

      const responseData = await response.json();


      if (responseData?.msgKey === "Success") {
        Alert.alert("Success", responseData.message || "Data saved successfully!");

      } else {
        // Alert.alert("Error", responseData.message || "Failed to save data.");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error creating verification:", error);
      Alert.alert("Error", "An error occurred while saving the data.");
    } finally {
      setLoading(false);
    }
  };


  useFocusEffect(
    React.useCallback(() => {
      getLogsDetailsByApplicationNumber();

    }, []) // Empty dependency array to ensure this runs every time the screen is focused
  );

  const updatenitiateVerificationFlag = async () => {
    try {
      const payload = {
        active: true,
        applicationNumber: residid?.applicationNumber,
      };
      const response = await axios.put(
        `${BASE_URL}updateInitiateResidentAndOfficeVerificationFlag/${residid?.applicationNumber}`,
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        },
      );

      if (response.data.msgKey === 'Success') {
        const msgKey = response?.data?.msgKey;
        const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
        // Alert.alert(msgKey, successMessage);
        await updateLogActivityById();
      } else {
        setLoading(false);
      }


    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };

  const updateLogActivityById = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        stage: residid.stage, // Example value, you may want to dynamically set it
        status: 'Completed', // Example value, adjust as needed
        type: residid?.type, // Example value
        user: residid?.user, // Example value
        description: residid?.description, // Fixed value in your case
        applicationNumber: residid?.applicationNumber, // Example application number, adjust dynamically if needed
      };

      // Make the API call to update the log activity by ID
      const response = await axios.put(
        `${BASE_URL}updateLogActivityById/${residid?.id}`,  // Assuming PUT request to update
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }, // Send the payload as the request body
      );

      if (response.data.msgKey === 'Success') {
        // alert('Log activity updated successfully!'); // Show success alert
        const msgKey = response?.data?.msgKey;
        const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
        // Alert.alert(msgKey, successMessage);
        await updateStageMainTainByApplicationNumber();
      } else {
        setLoading(false);
      }



    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };

  const addLogActivity = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        status: "Pending", // Example value, you may want to dynamically set it
        stage: "Pre-Underwriting", // Example value, adjust as needed
        type: residid?.type, // Example value
        user: residid?.user, // Example value
        description: "Residence Verification", // Fixed value in your case
        applicationNumber: residid?.applicationNumber, // Example application number, adjust dynamically if needed
      };

      // Make the API call to update the log activity by ID
      const response = await axios.post(
        `${BASE_URL}addLogActivity`,  // Assuming PUT request to update
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }, // Send the payload as the request body
      );

      if (response?.data?.msgKey === 'Success') {
        const msgKey = response?.data?.msgKey;
        const successMessage = response?.data?.message || 'Residence verification flag updated successfully!';

        const shouldSkipLog = applicantCategoryCode === 'House Wife';

        // if (!shouldSkipLog) {
        //   try {
        await addLogActivityOffice();
        //     
        //   } catch (error) {
        //     console.error('❌ Error calling log activity:', error);
        //   }
        // } else {
        //   
        //   navigation.navigate('ResidenceVerification');
        //   setLoading(false); // Hide loader
        // }
      }




    } catch (error) {
      console.error("Error updating log activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const addLogActivityOffice = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        status: "Pending", // Example value, you may want to dynamically set it
        stage: "Pre-Underwriting", // Example value, adjust as needed
        type: residid?.type, // Example value
        user: residid?.user, // Example value
        description: "Office Verification", // Fixed value in your case
        applicationNumber: residid?.applicationNumber, // Example application number, adjust dynamically if needed
      };

      // Make the API call to update the log activity by ID
      const response = await axios.post(
        `${BASE_URL}addLogActivity`,  // Assuming PUT request to update
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }, // Send the payload as the request body
      );

      if (response.data.msgKey === 'Success') {
        const msgKey = response?.data?.msgKey;
        const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
        // Alert.alert(msgKey, successMessage);
        navigation.replace('Residence Verification', { item, item });
        setLoading(false); // Hide loader
      }


    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };


  const addLogActivityVerificationWaiver = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        status: "Pending", // Example value, you may want to dynamically set it
        stage: "Pre-Underwriting", // Example value, adjust as needed
        type: residid?.type, // Example value
        user: residid?.user, // Example value
        description: "Verification Waiver", // Fixed value in your case
        applicationNumber: residid?.applicationNumber, // Example application number, adjust dynamically if needed
      };

      // Make the API call to update the log activity by ID
      const response = await axios.post(
        `${BASE_URL}addLogActivity`,  // Assuming PUT request to update
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }, // Send the payload as the request body
      );

      if (response.data.msgKey === 'Success') {
        const msgKey = response?.data?.msgKey;
        const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
        // Alert.alert(msgKey, successMessage);
        // await addLogActivityOffice();

        navigation.replace('VerificationWaiver ', { item: item });
        setLoading(false); // Hide loader
      }



    } catch (error) {
      console.error("Error updating log activity:", error);
    }
  };


  const updateStageMainTainByApplicationNumber = async () => {
    try {
      // Define the payload based on the data structure you provided
      const payload = {
        stage: "ResidenceVerification",
        applicationNumber: residid?.applicationNumber, // Example application number, adjust dynamically if needed
      };

      // Make the API call to update the log activity by ID
      const response = await axios.put(
        `${BASE_URL}updateStageMainTainByApplicationNumber/${residid?.applicationNumber}`,  // Assuming PUT request to update
        payload,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
        }, // Send the payload as the request body
      );

      // if (response.data.msgKey === 'Success') {
      const msgKey = response?.data?.msgKey;
      const successMessage = response.data?.message || 'Residence verification flag updated successfully!';
      // Alert.alert(msgKey, successMessage);

      // ✅ Check if ALL waiver fields in waiverDetailsByApplicant are true
      const anyWaived = Object.values(waiverDetailsByApplicant).some(applicant =>
        applicant?.residence?.waiver === true || applicant?.office?.waiver === true
      );

      if (anyWaived) {
        await addLogActivityVerificationWaiver();  // 👈 Call waiver activity logger if any waiver is true
      } else {
        await addLogActivity();  // 👈 Call default logger
      }

      // }


    } catch (error) {
      console.error("Error updating log activity:", error);
    } finally {
      setLoading(false);
    }
  };

  const ResidenceValidation = () => {
    const missingFields = [];

    // Step 1: Validate Required Fields
    if (!selectedApplicantType) {
      missingFields.push('Applicant Type');
    }

    if (!fullName) {
      missingFields.push('Applicant Name');
    }

    if (!isChecked1 && !isChecked3) {
      missingFields.push('At least Check one checkbox  in Residence');
    }

    // if (isChecked2 && (!residextAgencytype || !selectedResidenceExtagency)) {
    //   missingFields.push('Issue in External Agency in Residence');
    // }


    if (!noofInstance) {
      missingFields.push('Number of Instances in Residence');
    }

    // Step 3: Conditional Validations for Disabled Fields
    if (isChecked3 && !selectedResidenceWaiver) {
      // Skip Waiver Reason validation if Waiver is not checked
      missingFields.push('please selecte a Waiver Reason in Residence');
    }

    // if (isChecked3 && !selectedResidenceExtagency && !isChecked1) {
    //   // Skip External Agency validation if Internal is checked
    //   missingFields.push('External Agency when "Waiver" is checked in Residence');
    // }

    if (!remark) {
      missingFields.push('Remarks in Residence');
    }

    return missingFields.length ? missingFields : true;
  };

  const OfficeValidation = () => {
    const missingFields = [];


    if (!isChecked1o && !isChecked3o) {
      missingFields.push('At least Check one checkbox  in Office');
    }

    // if (isChecked2o && (!officeextAgencytype || !selectedOfficeExtagency)) {
    //   // Skip External Agency Type validation if Internal or Waiver is selected
    //   missingFields.push('issue in  External Agency in Office');
    // }

    if (!OfficenoofInstance) {
      missingFields.push('Number of Instances in Office');
    }

    // Step 3: Conditional Validations for Disabled Fields
    if (isChecked3o && !selectedofficewaiveragency) {
      // Skip Waiver Reason validation if Waiver is not checked
      missingFields.push('Please select a Waiver Reason in Office');
    }

    // if (isChecked3o && !selectedOfficeExtagency && !isChecked1o) {
    //   // Skip External Agency validation if Internal is checked
    //   missingFields.push('External Agency when "Waiver" is checked in Office');
    // }

    if (!remarko) {
      missingFields.push('Remarks in Office');
    }

    return missingFields.length ? missingFields : true;
  };

  // Handle Save Button click
  const handleSaveClick = async () => {
    const residenceValidationResult = ResidenceValidation();
    const officeValidationResult =
      applicantCategoryCode === 'House Wife' ? [] : OfficeValidation();

    const missingFields = [
      ...(Array.isArray(residenceValidationResult) ? residenceValidationResult : []),
      ...(Array.isArray(officeValidationResult) ? officeValidationResult : []),
    ];

    if (missingFields.length) {
      const formattedMissingFields = missingFields
        .map(field => `\u2022 ${field}`)
        .join('\n');

      Alert.alert('⚠️ Alert', formattedMissingFields, [
        { text: 'OK', style: 'cancel' },
      ]);
      return;
    }

    try {
      setLoading(true);

      // ✅ Save waiver details locally first
      setWaiverDetailsByApplicant(prev => ({
        ...prev,
        [applicantidApplicant]: {
          label: applicantidApplicant,
          residence: {
            internal: isChecked1,
            external: isChecked2,
            waiver: isChecked3,
            noOfInstances: noofInstance,
            waiverReason: selectedResidenceWaiver,
            remarks: remark,
          },
          office: {
            internal: isChecked1o,
            external: isChecked2o,
            waiver: isChecked3o,
            noOfInstances: OfficenoofInstance,
            waiverReason: selectedofficewaiveragency,
            remarks: remarko,
          },
        },
      }));

      // ✅ Call API to create verification
      await createInitiateVerification();
      // await createInitiateVerification();

      // ✅ Refresh initiate verification data for the same applicant
      await getInitiateVerificationByApplicantid(applicantidApplicant);

      // ✅ Find next applicant (or stay on current if none)
      const currentIndex = applicantTypes.findIndex(
        applicant => applicant.id === selectedApplicantType
      );
      const nextIndex = currentIndex + 1;
      const hasNext = nextIndex < applicantTypes.length;
      const nextType = hasNext
        ? applicantTypes[nextIndex]
        : applicantTypes[currentIndex];

      // ✅ Mark saved status
      setSavedStatus(prev => ({
        ...prev,
        [selectedApplicantType.toString()]: true,
      }));

      // ✅ Switch to next or stay on same dropdown
      setSelectedApplicantType(nextType.id);
      handleDropdownChange({ value: nextType.id, label: nextType.type });

      // ✅ Optionally show success alert when done
      if (!hasNext) {
        Alert.alert('✅ Success', 'All applicants processed successfully!');
      }

    } catch (error) {
      console.error('Error saving verification:', error);
      Alert.alert('Error', 'Something went wrong while saving verification.');
    } finally {
      setLoading(false);
    }
  };




  const showSubmitButton = applicantTypes?.every(applicant =>
    savedStatus[applicant?.id?.toString()] // Ensure it checks `id`, not `type`
  );






  const handleSubmitClick = async () => {
    if (fullName) {
      // Only call the API if the required fields are filled


      setLoading(true); // Show loader
      try {
        updatenitiateVerificationFlag();;

        // Alert.alert('Success', 'All APIs were executed successfully!');
      } catch (error) {
        console.error('Error in submitting form:', error.message || error);
        Alert.alert('Error', error.message || 'Something went wrong!');
      }

    } else {
      Alert.alert('Please enter full name before saving');
    }
  };

  {
    (isChecked1 || isChecked3) && (
      <View style={[styles.dropdown, { backgroundColor: '#e0e0e0' }]}>
        <Text style={{ fontSize: 10, color: 'black' }}>
          {residextAgencytype || "Select Agency Type"}
        </Text>
      </View>
    )
  }

  {
    (isChecked1o || isChecked3o) && (
      <View style={[styles.dropdown, { backgroundColor: '#e0e0e0' }]}>
        <Text style={{ fontSize: 10, color: 'black' }}>
          {officeextAgencytype || "Select Agency Type"}
        </Text>
      </View>
    )
  }

  const handleNoofInstanceChange = (text) => {
    // Allow only numbers and prevent "0" as input
    if (text === '' || parseInt(text, 10) > 0) {
      setnoofInstance(text); // Update state with valid number
    } else {
      // Optionally show an alert or message when "0" is entered
      Alert.alert('Invalid Input', 'Zero is not a valid number');
    }
  };

  const handleOfficenoofInstanceChange = (text) => {
    // Allow only numbers and prevent "0" as input
    if (text === '' || parseInt(text, 10) > 0) {
      setOfficenoofInstance(text); // Update state with valid number
    } else {
      // Optionally show an alert or message when "0" is entered
      Alert.alert('Invalid Input', 'Zero is not a valid number');
    }
  };
  const formatNumberWithCommas = (value) => {
    if (!value || isNaN(value)) return value; // Return original value if not a valid number
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(value);
  };

  const isEditable = isPending && userDetails?.designation !== 'Sales Head';
  const isDisabled = !isPending || userDetails?.designation === 'Sales Head';

  const renderDropdownField = (label, data, value, onChange, placeholder = '', disabled = false) => {
    const fieldDisabled = disabled || !isEditable; // disable if not pending or forced
    return (
      <View style={styles.formGroup}>
        <Text style={styles.label}>{label}</Text>
        <Dropdown
          data={data}
          labelField="label"
          valueField="value"
          value={value}
          onChange={onChange}
          style={[
            styles.dropdown,
            fieldDisabled, // greyed out if disabled
          ]}
          placeholder={placeholder || `${label}`}
          placeholderStyle={{ color: '#888' }} // proper placeholder color
          selectedTextStyle={{ color: 'black' }}
          disabled={fieldDisabled}
          renderItem={(item) => (
            <View style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>{item.label}</Text>
            </View>
          )}
        />

      </View>
    );
  };


  const renderRows = (fields, columns = 2, spacing = 10) => {
    if (!fields || fields.length === 0) return null;

    const rows = [];
    for (let i = 0; i < fields.length; i += columns) {
      const rowFields = fields.slice(i, i + columns);
      const isSingle = rowFields.length === 1;

      rows.push(
        <View
          key={i}
          style={[styles.row, { flexDirection: 'row', justifyContent: 'space-between' }]}
        >
          {rowFields.map((field, idx) => (
            <View
              key={idx}
              style={{
                flex: isSingle ? 1 : 1 / columns, // full width if single
                paddingHorizontal: spacing / 2,
              }}
            >
              {field}
            </View>
          ))}

          {/* Fill empty space if needed for 2-column rows only */}
          {!isSingle &&
            rowFields.length < columns &&
            Array(columns - rowFields.length)
              .fill(null)
              .map((_, idx) => (
                <View key={`empty-${idx}`} style={{ flex: 1 / columns, paddingHorizontal: spacing / 2 }} />
              ))}
        </View>
      );
    }

    return rows;
  };

  const isVerificationDisabled = !fullName || !isPending;

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

  return (
    <SafeAreaView>
      <ScrollView>
        <View style={styles.container}>
          {/* Read-only Fields */}
          {/* <View style={styles.cardWrapper}>{renderReadOnlyFields()}</View> */}
          {/* <ApplicationDetails
            title="Application Detail"
            isEditable={false} // 🔒 read-only or true for editable
            style={styles.sectionWrapper}
            fields={[
              { label: 'Application Number', value: item?.applicationNo },
              {
                label: 'Name',
                value: aaplicantName?.individualApplicant
                  ? `${aaplicantName.individualApplicant.firstName || ""} ${aaplicantName?.individualApplicant?.middleName || ""} ${aaplicantName.individualApplicant.lastName || ""}`.trim()
                  : aaplicantName?.organizationApplicant?.organizationName || "N/A"
              },
              {
                label: 'Loan Amount',
                value: item?.loanAmount
                  ? `₹ ${formatNumberWithCommas(item.loanAmount.toString())}`
                  : '₹ 0'
              },
              { label: 'Source Branch', value: item?.branchName },
              { label: 'Category', value: item.applicant[0]?.applicantCategoryCode },
              { label: 'Source Type', value: item?.sourceType },
              { label: 'Date Created', value: applicationByid?.createdDate?.replace(/\//g, '-') },
              { label: 'Status', value: item?.status },
              { label: 'Stage', value: item?.stage },
            ]}
          /> */}
          <DetailHeader
            title="Application Detail"
            subTitle={item?.applicationNo || "—"}
            status={item?.status || "Pending"}
            chips={headerChips}
          // gradientColors={["#003A8C", "#005BEA"]}
          />
          {/* Initiate Verification */}
          <VerificationSection title="Initiate Verification" style={{ marginVertical: 10 }}>
            {/* {renderRows( */}
            {/* [ */}
            {renderDropdownField(
              'Applicant Type',
              applicantTypess,
              selectedApplicantType,
              handleDropdownChange,
              'Applicant Type'
            )}
            <FormField
              key="applicantName"
              label="Applicant Name"
              value={fullName}
              editable={false}
            />
            {/* ], */}
            {/* 2, // 2 columns
              10 // spacing between columns
            )} */}
          </VerificationSection>


          {/* Residence Verification */}
          <VerificationBlock
            title="Residence Verification"
            isCheckedInternal={isChecked1}
            isCheckedWaiver={isChecked3}
            toggleInternal={() => toggleCheckbox(setIsChecked1, 'internal')}
            toggleWaiver={() => toggleCheckbox(setIsChecked3, 'waiver')}
            noOfInstance={noofInstance}
            handleNoOfInstanceChange={handleNoofInstanceChange}
            waiverData={residencewaiver}
            selectedWaiver={selectedResidenceWaiver}
            handleDropdownChange={handleDropdownChangeResidenceWaiv}
            remark={remark}
            setRemark={setremark}
            disabled={isVerificationDisabled}
            renderRows={renderRows}
          />

          {/* Office Verification */}
          {applicantCategoryCode !== 'House Wife' && (
            <VerificationBlock
              title="Office Verification"
              isCheckedInternal={isChecked1o}
              isCheckedWaiver={isChecked3o}
              toggleInternal={() => toggleCheckboxo(setIsChecked1o, 'internal')}
              toggleWaiver={() => toggleCheckboxo(setIsChecked3o, 'waiver')}
              noOfInstance={OfficenoofInstance}
              handleNoOfInstanceChange={handleOfficenoofInstanceChange}
              waiverData={officewaiveragency}
              selectedWaiver={selectedofficewaiveragency}
              handleDropdownChange={handleDropdownChangeOfficeWaiv}
              remark={remarko}
              setRemark={setremarko}
              disabled={isVerificationDisabled}
              renderRows={renderRows}
            />
          )}

          {/* Save / Submit Buttons */}
          {residid.status === 'Pending' && (
            <View style={styles.saveSection}>
              {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
              ) : (
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveClick}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              )}

              {showSubmitButton && (
                <View style={styles.submitWrapper}>
                  {loading ? (
                    <ActivityIndicator size="large" color="#4CAF50" />
                  ) : (
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmitClick}>
                      <Text style={styles.submitButtonText}>Submit</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // marginBottom: 50,
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 60,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    // paddingHorizontal: 15,
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




  placeholderStyle: {
    color: '#888',
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },

  dropdownItem: {
    padding: 10,
    backgroundColor: '#fff',
  },

  dropdownItemText: {
    color: 'black',
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },

  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  checked: {
    backgroundColor: '#333',
    color: 'white',
  },

  selectedTextStyle: {
    color: 'black', // Set to a visible color for both light and dark modes
    fontSize: 16,
    // fontWeight: 'bold',
  },





















  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, padding: 10 },
  backArrow: { fontSize: 20, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '600' },



  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  checkbox: { width: 20, height: 20, borderWidth: 1, borderColor: '#000', marginRight: 5, textAlign: 'center' },
  checked: { backgroundColor: '#007bff', color: '#fff' },
  checkboxLabel: { fontSize: 14, color: '#383838FF' },
  checkboxRow: { flexDirection: 'row', justifyContent: 'space-evenly', marginVertical: 5, marginBottom: 10 },
  saveButton: { backgroundColor: '#007bff', padding: 10, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '400' },
  submitButton: { backgroundColor: '#4CAF50', padding: 10, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  saveSection: {
    marginBottom: 20,
  },
  submitWrapper: {
    marginVertical: 10,
  },


  container: {
    flex: 1,
    padding: 16,
    marginBottom: 50,
    backgroundColor: '#f5f5f5',
  },
  cardWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  formGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    marginLeft: 5
  },
  required: {
    color: 'red',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: 'black',
    backgroundColor: '#fff',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: "#DDDBDBFF", // gray background when disabled
    color: "black",
    fontWeight: '500'
  },
  disabledDropdown: {
    backgroundColor: "#DDDBDBFF", // gray background when disabled
  },
  dropdown1: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  placeholderStyle: {
    color: '#888',
    fontSize: 14,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007BFFBB',
    marginBottom: 16,
  },
  sectionWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    color: 'black',
    marginVertical: 10,
    paddingLeft: 8,
    borderRadius: 6,
  },
  documentsSection: {
    padding: 16,
    marginVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  documentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  documentText: {
    color: '#000',
    flex: 1,
  },
  downloadButton: {
    backgroundColor: '#4A90E2',
    padding: 8,
    borderRadius: 5,
  },
  downloadAllButton: {
    backgroundColor: '#4A90E2',
    padding: 10,
    marginTop: 20,
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  uploadSection: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  uploadColumn: {
    flex: 1,
    flexDirection: 'column',
  },
  documentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 6,
    marginVertical: 6,
  },
  iconStyle: {
    width: 20,
    height: 20,
    marginRight: 8,
    tintColor: '#fff',
  },
  downloadbuttonLODA: {
    backgroundColor: '#4A90E2',
    padding: 10,
    borderRadius: 6,
  },
  centerAlign: {
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  downloadIcon: {
    width: 24,
    height: 24,
    tintColor: '#fff',
  },
  cameraIcon: {
    width: 24,
    height: 24,
  },
  fileNameText: {
    fontSize: 12,
    color: '#000',
    marginVertical: 2,
  },
  photoFileList: {
    width: width * 0.4,
    height: height * 0.15,
    color: 'black',
    textAlignVertical: 'center',
    fontSize: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 6,
  },
});

export default InitiateverficationProcess;
