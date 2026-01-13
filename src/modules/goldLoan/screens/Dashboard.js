import React, { useContext, useState, useMemo, useCallback, useEffect } from 'react'
import {
  StyleSheet, Alert, SafeAreaView, Image, PermissionsAndroid,
  PERMISSIONS, Platform, TouchableOpacity, TextInput, FlatList, StatusBar, Text, View,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native'
import { DrawerContext } from '../../../Drawer/DrawerContext';


import Pdf from 'react-native-pdf';
import { captureRef } from 'react-native-view-shot';
import TextRecognition from '@react-native-ml-kit/text-recognition';

import RNFS from 'react-native-fs';
import DocumentPicker from 'react-native-document-picker';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import Clipboard from '@react-native-clipboard/clipboard';
import XLSX from 'xlsx';
import RNFetchBlob from 'rn-fetch-blob';
import FormInput from '../components/FormInput';
import { detectDocumentType } from './OCR/configs/etectDocumentType';
import { parsePanOCR } from './OCR/parser/parsePanOCR';
import OCRReviewScreen from './OCR/OCRReviewScreen';

// Gender dropdown
export const GenderList = [
  { label: 'Male', value: 'M' },
  { label: 'Female', value: 'F' },
  { label: 'Other', value: 'O' },
];

// Lead Source dropdown
export const LeadDropdown = [
  { label: 'Walk-in', value: 'WALKIN' },
  { label: 'Agent', value: 'AGENT' },
  { label: 'Online', value: 'ONLINE' },
];

// Branch dropdown
export const BranchName = [
  { label: 'Mumbai', value: 'MUM' },
  { label: 'Delhi', value: 'DEL' },
  { label: 'Pune', value: 'PUN' },
];

const pincodesFromApi = [
  { pincode: 400001 },
  { pincode: 110001 },
];

const Dashboard = () => {
  const { openDrawer, } = useContext(DrawerContext);
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    dob: '',
    mobileNo: '',
    email: '',
    aadhar: '',
    pan: '',
    loanPurpose: '',
  });
  const updateField = useCallback((key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const [selectedgenders, setSelectedgenders] = useState(null);
  const [selectedLeadSourceDropdown, setSelectedLeadSourceDropdown] = useState(null);
  const [selectedbranchName, setSelectedbranchName] = useState(null);
  const [selectedPincodes, setSelectedPincodes] = useState(null);
  // console.log(firstName, middleName, 'firstNamefirstName')
  const [rawRows, setRawRows] = useState([]);   // Excel rows OR OCR lines
  const [fields, setFields] = useState({}); // Dynamic fields object
  const [recognizedText, setrecognizedText] = useState([])
  const [tasks, setTasks] = useState([]);
  const [ocrDraft, setOcrDraft] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const [showReview, setShowReview] = useState(false);
  console.log(recognizedText, 'uploadfieldsFiledata')
  const handleTextChange = useCallback((value, index) => {
    setTasks(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  }, []);


  const FORM_FIELD_MAP = [
    { key: 'firstName' },
    { key: 'lastName' },
    { key: 'middleName' },
    { key: 'dob' },
    { key: 'mobileNo' },
    { key: 'email' },
    { key: 'aadhar' },
    { key: 'pan' },
    { key: 'loanPurpose' },
  ];


  const FORM_FIELD_MAP_Input = useMemo(() => ([
    {
      key: 'firstName',
      label: 'First Name',
      value: formData.firstName,
      setter: v => updateField('firstName', v),
      placeholder: 'Enter first name',
    },
    {
      key: 'middleName',
      label: 'Middle Name',
      value: formData.middleName,
      setter: v => updateField('middleName', v),
      placeholder: 'Enter middle name',
    },
    {
      key: 'lastName',
      label: 'Last Name',
      value: formData.lastName,
      setter: v => updateField('lastName', v),
      placeholder: 'Enter last name',
    },
    {
      key: 'dob',
      label: 'Date of Birth',
      value: formData.dob,
      setter: v => updateField('dob', v),
      placeholder: 'DD/MM/YYYY',
    },
    {
      key: 'mobileNo',
      label: 'Mobile Number',
      value: formData.mobileNo,
      setter: v => updateField('mobileNo', v?.toString() || ''),
      keyboardType: 'numeric',
      maxLength: 10,
      placeholder: 'Enter mobile number',
    },
    {
      key: 'email',
      label: 'Email',
      value: formData.email,
      setter: v => updateField('email', v),
      keyboardType: 'email-address',
      placeholder: 'Enter email',
    },
    {
      key: 'aadhar',
      label: 'Aadhaar Number',
      value: formData.aadhar,
      setter: v => updateField('aadhar', v),
      keyboardType: 'numeric',
      maxLength: 12,
      placeholder: 'Enter Aadhaar',
    },
    {
      key: 'pan',
      label: 'PAN',
      value: formData.pan,
      setter: v => updateField('pan', v),
      placeholder: 'Enter PAN',
    },
    {
      key: 'loanPurpose',
      label: 'Loan Purpose',
      value: formData.loanPurpose,
      setter: v => updateField('loanPurpose', v),
      placeholder: 'Enter loan purpose',
    },
  ]), [formData, updateField]);

  const mapDropdownValue = (list, label) => {
    if (!label) return null;
    return list.find(item => item.label === label) || {
      label,
      value: label,
    };
  };

  const transformedPincodes = useMemo(() => {
    return pincodesFromApi.map(p => ({
      label: p.pincode.toString(),
      value: p.pincode,
    }));
  }, [pincodesFromApi]);

  const requestCameraPermission = async () => {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "App needs access to your camera to scan documents.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const openCameraAndScan = async () => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert("Permission Denied", "Camera access is required.");
        return;
      }

      const result = await launchCamera({
        mediaType: "photo",
        quality: 1,
        saveToPhotos: false,
      });

      if (!result || result.didCancel) return;

      if (result.errorCode) {
        Alert.alert("Camera Error", result.errorMessage || "Unknown error");
        return;
      }

      if (!result.assets?.length) {
        Alert.alert("Error", "No image captured.");
        return;
      }

      const imageUri = result.assets[0].uri;

      // 🔥 ML Kit OCR
      const ocrResult = await TextRecognition.recognize(imageUri);


      /**
       * PERFORMANCE NOTE:
       * - flatMap avoids nested loops
       * - join once
       */
      const recognizedText = ocrResult.blocks
        .flatMap(block => block.lines)
        .map(line => line.text)
        .join('\n');


      setrecognizedText(recognizedText);

      const docType = detectDocumentType(recognizedText);
      let parsedResult = {};

      switch (docType) {
        case 'PAN':
          parsedResult = parsePanOCR(recognizedText);
          break;
        default:
          return;
      }

      setOcrDraft(parsedResult);
      setShowReview(true);

    } catch (err) {
      console.error("OCR Error:", err);
      Alert.alert("Error", "Failed to scan document.");
    }
  };

  const normalizeExcelRow = (row = {}) => ({
    firstName: row.firstName || row['First Name'] || '',
    middleName: row.middleName || row['Middle Name'] || '',
    lastName: row.lastName || row['Last Name'] || '',
    dob: row.dob || row['Date of Birth'] || '',
    mobileNo: row.mobileNo || row['Mobile Number']?.toString() || '',
    email: row.email || row['Email'] || '',
    aadhar: row.aadhar || row['Aadhaar Number'] || '',
    pan: row.pan || row['PAN'] || '',
    loanPurpose: row.loanPurpose || row['Loan Purpose'] || '',
  });



  const selectFileAutoPopulate = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });

      const fileUri = res.uri;
      const fileName = res.name;
      const extension = fileName.split('.').pop().toLowerCase();

      const fileData = await RNFetchBlob.fs.readFile(fileUri, 'base64');
      const decoded = RNFetchBlob.base64.decode(fileData);

      if (extension === 'xlsx' || extension === 'xls') {
        const workbook = XLSX.read(decoded, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON with keys from header row
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        console.log(jsonData, 'jsonDatajsonData')
        if (!jsonData || jsonData.length === 0) {
          Alert.alert('Empty File', 'No data found in the Excel sheet.');
          return;
        }

        populateFormFromRow(jsonData);
        // setRawRows(jsonData);
        const normalizedRows = jsonData.map(normalizeExcelRow);

        // ✅ Store all rows (preview / bulk)
        setRawRows(normalizedRows);
      } else {
        Alert.alert('Unsupported', 'Please select an Excel (.xlsx or .xls) file.');
      }
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        console.error("File Picker Error:", err);
        Alert.alert("Error", "Failed to read Excel file.");
      }
    }
  };

  const populateFormFromRow = (row = {}) => {
    setFormData(prev => {
      const updated = { ...prev };

      FORM_FIELD_MAP_Input.forEach(field => {
        if (row[field.key] !== undefined) {
          updated[field.key] =
            field.key === 'mobileNo'
              ? row[field.key]?.toString() || ''
              : row[field.key];
        }
      });

      return updated;
    });
  };



  const processedOCRData = useMemo(() => {
    if (!Array.isArray(recognizedText)) return [];

    return recognizedText
      .map(text =>
        text
          .replace(/\n/g, ' ')          // remove new lines
          .replace(/\bA\b/g, ' A ')     // spacing safety
          .replace(/\s+/g, ' ')         // normalize spaces
          .trim()
      )
      .filter(text =>
        text.length > 2 &&              // remove junk
        !text.toLowerCase().includes('things to do') // remove title
      );
  }, [recognizedText]);

  const extractedCode = useMemo(() => {
    return processedOCRData.find(text =>
      /^CMPO\d+$/i.test(text)
    );
  }, [processedOCRData]);

  const taskList = useMemo(() => {
    return processedOCRData.filter(
      text => !/^CMPO\d+$/i.test(text)
    );
  }, [processedOCRData]);

  useEffect(() => {
    if (taskList.length) {
      setTasks(taskList);
    }
  }, [taskList, extractedCode]);



  const hasApplicantData = useMemo(() => {
    if (!Array.isArray(FORM_FIELD_MAP_Input)) return false;

    return FORM_FIELD_MAP_Input.some(field => {
      const v = field.value;
      return v !== null && v !== undefined && String(v).trim() !== '';
    });
  }, [FORM_FIELD_MAP_Input]);

  console.log(hasApplicantData, FORM_FIELD_MAP_Input, 'hasApplicantDatahasApplicantData')
  const renderTask = useCallback(({ item, index }) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>Task {index + 1}</Text>
      <TextInput
        value={item}
        onChangeText={text => handleTextChange(text, index)}
        style={styles.input}
      />
    </View>
  ), [handleTextChange]);

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ================= HEADER ================= */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.headerLeft}
            onPress={openDrawer}
            activeOpacity={0.85}
          >
            <Image
              source={require("../../../asset/icon/menus.png")}
              style={styles.drawerIcon}
            />
            <View>
              <Text style={styles.headerSubTitle}>Welcome back,</Text>
              <Text style={styles.headerTitle}>Gold Loan User</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarText}>MM</Text>
          </View>
        </View>

        <View style={styles.headerSummaryRow}>
          <View>
            <Text style={styles.summaryLabel}>Today's Overview</Text>
            <Text style={styles.summaryValue}>8 Active Pipelines</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>Live</Text>
          </View>
        </View>
      </View>

      {/* ================= CONTENT ================= */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ACTION BUTTONS */}
          <View style={styles.ocrSection}>
            {/* OCR LABEL */}
            <Text style={styles.ocrLabel}>OCR</Text>

            {/* ACTION BUTTONS */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={openCameraAndScan} activeOpacity={0.8}>
                <Text style={styles.actionText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={selectFileAutoPopulate} activeOpacity={0.8}>
                <Text style={styles.actionText}>Upload</Text>
              </TouchableOpacity>
            </View>
          </View>


          {/* ========== TASKS SECTION ========== */}
          {Array.isArray(tasks) && tasks.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tasks</Text>

              <FlatList
                data={tasks}
                keyExtractor={(_, i) => `task-${i}`}
                renderItem={renderTask}
                keyboardShouldPersistTaps="handled"
              />

            </View>
          )}

          {/* ========== RAW FILE DATA ========== */}
          {Array.isArray(rawRows) && rawRows.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Uploaded Applicants</Text>

              {rawRows.map((row, index) => {
                const isSelected = index === selectedRowIndex;

                return (
                  <TouchableOpacity
                    key={`raw-${index}`}
                    activeOpacity={0.85}
                    style={[
                      styles.rawCard,
                      isSelected && styles.rawCardSelected,
                    ]}
                    onPress={() => {
                      setSelectedRowIndex(index);
                      populateFormFromRow(row);
                    }}
                  >
                    {/* HEADER */}
                    <View style={styles.rawHeader}>
                      <Text style={styles.rawIndex}>Applicant {index + 1}</Text>
                      {isSelected && <Text style={styles.selectedBadge}>Selected</Text>}
                    </View>

                    {/* ALL DATA FIELDS */}
                    {Object.entries(row).map(([key, value]) => (
                      <View key={key} style={styles.rawFieldRow}>
                        <Text style={styles.rawFieldKey}>{key}</Text>
                        <Text style={styles.rawFieldValue}>
                          {value !== null && value !== undefined && value !== ''
                            ? String(value)
                            : '—'}
                        </Text>
                      </View>
                    ))}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}


          {showReview && ocrDraft && (
            <OCRReviewScreen
              data={ocrDraft}
              onCancel={() => setShowReview(false)}
              onConfirm={(finalData) => {
                setFormData(prev => ({
                  ...prev,
                  ...Object.fromEntries(
                    Object.entries(finalData).map(([k, v]) => [k, v.value])
                  ),
                }));
                setShowReview(false);
              }}
            />
          )}

          {/* ========== FORM INPUTS ========== */}
          {hasApplicantData && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Applicant Details</Text>

              {FORM_FIELD_MAP_Input.map(field => {
                const isEmpty =
                  field.value === null ||
                  field.value === undefined ||
                  String(field.value).trim() === '';

                return (
                  <FormInput
                    key={field.key}
                    label={field.label}
                    value={field.value}
                    onChangeText={field.setter}
                    placeholder={field.placeholder}
                    keyboardType={field.keyboardType}
                    maxLength={field.maxLength}
                    style={[
                      isEmpty && styles.missingField, // 🔥 highlight missing
                    ]}
                  />
                );
              })}
            </View>
          )}


        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

}

export default Dashboard

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  ocrSection: {
    marginTop: 12,
    marginBottom: 16,
  },

  ocrLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 16,
  },

  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },

  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 12,
  },

  listContent: {
    paddingBottom: 40, // 🔥 VERY IMPORTANT
  },

  headerWrapper: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    backgroundColor: '#2196F3'
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  drawerIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
    tintColor: "#fff",
  },

  headerSubTitle: {
    color: "#cce4ff",
    fontSize: 13,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  avatarWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: "#2196F3",
    fontWeight: "700",
    fontSize: 16,
  },

  headerSummaryRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    color: "#e5e5e5",
    fontSize: 13,
  },

  summaryValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },

  chip: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  chipText: {
    fontWeight: "700",
    color: "#2196F3",
  },

  mainContainer: {
    flex: 1,
    marginTop: -20,
    backgroundColor: "#F5F7FA",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputWrapper: {
    marginBottom: 12,
  },
  label: {
    color: '#555',
    marginBottom: 4,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    color: '#000',
    backgroundColor: '#fff',
  },
  ocrtext: {
    color: "#0A0A0A",
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  rawCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    elevation: 2,
  },

  rawIndex: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 6,
  },

  rawValue: {
    fontSize: 12,
    color: '#333',
    lineHeight: 18,
  },
  rawFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  rawFieldKey: {
    fontSize: 12,
    color: '#555',
    fontWeight: '600',
    flex: 1,
  },

  rawFieldValue: {
    fontSize: 12,
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },

})