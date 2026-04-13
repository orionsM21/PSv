import React, { useContext, useState, useMemo, useCallback, useEffect } from 'react'
import {
  StyleSheet, Alert, Image, PermissionsAndroid,
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
import { GOLD_THEME } from '../theme/goldTheme';
// import { detectDocumentType } from './OCR/configs/etectDocumentType';
// import { parsePanOCR } from './OCR/parser/parsePanOCR';
import OCRReviewScreen from './OCR/OCRReviewScreen';
import OCRManualSelectScreen from './OCR/OCRManualSelectScreen';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from "react-native-vector-icons/Ionicons";
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

const KpiCard = ({ label, value }) => (
  <View style={styles.kpiCard}>
    <Text style={styles.kpiValue}>{value}</Text>
    <Text style={styles.kpiLabel}>{label}</Text>
  </View>
);

const ActionBtn = ({ icon, label }) => (
  <TouchableOpacity style={styles.actionBtn}>
    <Ionicons name={icon} size={20} color="#F4C95D" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

const TaskItem = ({ title, status }) => (
  <View style={styles.taskItem}>
    <Text style={styles.taskTitle}>{title}</Text>
    <Text style={styles.taskStatus}>{status}</Text>
  </View>
);

/* ================= MAIN ================= */



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

  const [rawRows, setRawRows] = useState([]);   // Excel rows OR OCR lines
  const [fields, setFields] = useState({}); // Dynamic fields object
  const [recognizedText, setrecognizedText] = useState([])
  const [tasksd, setTasks] = useState([]);
  const [ocrDraft, setOcrDraft] = useState(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [ocrBlocks, setOcrBlocks] = useState([]);
  const [ocrImage, setOcrImage] = useState(null);
  const [showManualSelect, setShowManualSelect] = useState(false);
  const [originalImageSize, setOriginalImageSize] = useState(null);
  const [autoSelectedKeys, setAutoSelectedKeys] = useState([]);

  const [showReview, setShowReview] = useState(false);
  console.log(ocrDraft, 'ocrDraftocrDraft')
  const handleTextChange = useCallback((value, id) => {
    setOcrDraft(prev => {
      if (!prev) return prev;

      return {
        ...prev,
        [id]: {
          ...prev[id],
          value
        }
      };
    });
  }, []);

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

  const PAN_SCHEMA = {
    name: ['name'],
    father_name: ['father'],
  };
  const mergeNearbyBlocks = (baseBlock, blocks) => {
    const merged = [baseBlock.text];

    blocks.forEach(b => {
      if (b === baseBlock) return;

      const dy = Math.abs(b.box.top - baseBlock.box.top);

      if (dy < baseBlock.box.height * 1.2) {
        merged.push(b.text);
      }
    });

    return merged.join(' ');
  };
  const getRowKey = (top, height) =>
    Math.round(top / (height * 1.5));

  const findNearestRightOrBelow = (labelBlock, rows) => {
    let best = null;
    let minDistance = Infinity;

    const rowKey = getRowKey(labelBlock.box.top, labelBlock.box.height);

    const candidateRows = [
      rows[rowKey],
      rows[rowKey + 1],
      rows[rowKey - 1],
    ].flat().filter(Boolean);

    candidateRows.forEach(b => {
      if (b === labelBlock) return;

      const dx = b.box.left - labelBlock.box.left;
      const dy = b.box.top - labelBlock.box.top;

      const isRight = dx > 0 && Math.abs(dy) < labelBlock.box.height;
      const isBelow = dy > 0 && Math.abs(dx) < 100;

      if (!isRight && !isBelow) return;

      const distance = dx * dx + dy * dy;

      if (distance < minDistance) {
        minDistance = distance;
        best = b;
      }
    });

    return best;
  };
  const fuzzyIncludes = (text, keyword) =>
    text.includes(keyword) || text.replace(/\s/g, '').includes(keyword);

  const normalize = (text) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9:/ ]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  const extractFieldsFromBlocks = (blocks, schema) => {
    const results = {};
    const rows = groupByRows(blocks);

    Object.entries(schema).forEach(([field, keywords]) => {
      let bestMatch = null;
      let minDistance = Infinity;

      blocks.forEach(block => {
        const text = normalize(block.text);

        const isLabel = keywords.some(k => fuzzyIncludes(text, k));
        if (!isLabel) return;

        const valueBlock = findNearestRightOrBelow(block, rows);
        if (!valueBlock) return;

        const dx = valueBlock.box.left - block.box.left;
        const dy = valueBlock.box.top - block.box.top;
        const distance = dx * dx + dy * dy;

        if (distance < minDistance) {
          minDistance = distance;
          bestMatch = mergeNearbyBlocks(valueBlock, blocks);
        }
      });

      results[field] = {
        value: bestMatch || null,
        confidence: bestMatch ? 0.7 : 0,
      };
    });

    return results;
  };

  const mergeField = (spatial, regexValue, field, confidence = 0.95) => {
    if (regexValue) {
      return { value: regexValue, confidence };
    }
    return spatial[field] || { value: null, confidence: 0 };
  };

  const detectDocumentType = (lines) => {
    let scorePAN = 0;

    lines.forEach(line => {
      if (/[a-z]{5}[0-9]{4}[a-z]/i.test(line)) scorePAN += 5;

      if (fuzzyIncludes(line, 'incometax')) scorePAN += 2;
      if (fuzzyIncludes(line, 'permanentaccountnumber')) scorePAN += 3;
      if (fuzzyIncludes(line, 'govtofindia')) scorePAN += 1;
    });

    return scorePAN >= 5 ? 'PAN' : 'UNKNOWN';
  };

  const isFakePAN = (pan) => /^A{5}/.test(pan);

  const extractPAN = (lines) => {
    const candidates = [];

    lines.forEach((line, index) => {
      const match = line.match(/[A-Z]{5}[0-9]{4}[A-Z]/i);

      if (match) {
        const value = match[0].toUpperCase();

        if (isFakePAN(value)) return;

        candidates.push({ value, line, index });
      }
    });

    if (!candidates.length) return null;

    candidates.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;

      if (/permanent|account|number|pan/i.test(a.line)) scoreA += 3;
      if (/permanent|account|number|pan/i.test(b.line)) scoreB += 3;

      scoreA += Math.abs(5 - a.index);
      scoreB += Math.abs(5 - b.index);

      return scoreA - scoreB;
    });

    return candidates[0].value;
  };

  const extractDOB = (lines) => {
    for (let line of lines) {
      const match = line.match(/\d{2}\/\d{2}\/\d{4}/);
      if (match) return match[0];
    }
    return null;
  };

  const groupByRows = (blocks) => {
    const rows = {};

    blocks.forEach(b => {
      const key = getRowKey(b.box.top, b.box.height);
      if (!rows[key]) rows[key] = [];
      rows[key].push(b);
    });

    return rows;
  };

  const extractName = (lines) => {
    let best = null;
    let bestScore = -1;

    lines.forEach((line, index) => {
      const clean = line.toUpperCase();

      if (!/^[A-Z ]{3,}$/.test(clean)) return;
      if (clean.includes('GOVT') || clean.includes('INDIA')) return;

      let score = 0;

      // Prefer uppercase names
      score += 2;

      // Prefer shorter (real names vs sentences)
      score += Math.max(0, 20 - clean.length);

      // Prefer lines near PAN (center bias)
      score += Math.abs(5 - index);

      if (score > bestScore) {
        bestScore = score;
        best = clean;
      }
    });

    return best;
  };

  const parsedOCR = useMemo(() => {
    if (!recognizedText.length) return null;

    const cleanedLines = recognizedText.map(normalize);
    const docType = detectDocumentType(cleanedLines);

    if (docType === 'PAN') {
      const spatial = extractFieldsFromBlocks(ocrBlocks, PAN_SCHEMA);

      return {
        ...spatial,
        name: mergeField(spatial, extractName(cleanedLines), 'name', 0.85),
        pan: mergeField(spatial, extractPAN(cleanedLines), 'pan'),
        dob: mergeField(spatial, extractDOB(cleanedLines), 'dob', 0.9),
      };
    }

    return null;
  }, [recognizedText, ocrBlocks]);

  const openCameraAndScan = async (mode = 'AUTO') => {
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission Denied', 'Camera access is required.');
        return;
      }

      const result = await launchCamera({
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: false,
      });

      if (!result || result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Camera Error', result.errorMessage || 'Unknown error');
        return;
      }

      const imageUri = result.assets?.[0]?.uri;
      if (!imageUri) return;

      const ocrResult = await TextRecognition.recognize(imageUri);

      const ocrBlocks = ocrResult.blocks.flatMap(block => {
        if (!block.lines) return [];

        return block.lines.map(line => {
          let box;

          if (line.cornerPoints) {
            const xs = line.cornerPoints.map(p => p.x);
            const ys = line.cornerPoints.map(p => p.y);

            box = {
              left: Math.min(...xs),
              top: Math.min(...ys),
              width: Math.max(...xs) - Math.min(...xs),
              height: Math.max(...ys) - Math.min(...ys),
            };
          } else {
            box = line.boundingBox;
          }

          if (!box || !line.text?.trim()) return null;

          return { text: line.text.trim(), box };
        }).filter(Boolean);
      });

      const ocrLines = ocrBlocks.map(b => b.text);
      const cleanedLines = ocrLines.map(normalize);
      setrecognizedText(ocrLines);
      if (mode === 'MANUAL') {
        setOcrImage(imageUri);
        setOcrBlocks(ocrBlocks);
        setShowManualSelect(true);
        return;
      }

      // const docType = detectDocumentType(cleanedLines);

      // let parsedResult = {};
      const docType = detectDocumentType(cleanedLines);

      let parsedResult = null;
      // if (docType === 'PAN') {
      //   const spatial = extractFieldsFromBlocks(ocrBlocks, PAN_SCHEMA);

      //   parsedResult = {
      //     ...spatial,
      //     name: mergeField(
      //       spatial,
      //       extractName(cleanedLines),
      //       'name',
      //       0.85
      //     ),
      //     pan: mergeField(
      //       spatial,
      //       extractPAN(cleanedLines),
      //       'pan'
      //     ),

      //     dob: mergeField(
      //       spatial,
      //       extractDOB(cleanedLines),
      //       'dob',
      //       0.9
      //     ),
      //   };
      // } else {
      //   parsedResult = {
      //     rawText: {
      //       value: cleanedLines.join(' '),
      //       confidence: 0.3,
      //     },
      //   };
      // }

      // const autoKeys = Object.keys(parsedResult).filter(
      //   k => parsedResult[k]?.value
      // );


      if (docType === 'PAN') {
        const spatial = extractFieldsFromBlocks(ocrBlocks, PAN_SCHEMA);

        parsedResult = {
          ...spatial,
          name: mergeField(spatial, extractName(cleanedLines), 'name', 0.85),
          pan: mergeField(spatial, extractPAN(cleanedLines), 'pan'),
          dob: mergeField(spatial, extractDOB(cleanedLines), 'dob', 0.9),
        };
      } else {
        parsedResult = {
          rawText: {
            value: cleanedLines.join(' '),
            confidence: 0.3,
          },
        };
      }

      const autoKeys = Object.keys(parsedResult).filter(
        k => parsedResult[k]?.value
      );

      setAutoSelectedKeys(autoKeys);
      setOcrDraft(parsedResult); // ✅ FIXED
      setShowReview(true);
      // setAutoSelectedKeys(autoKeys);
      // setOcrDraft(parsedOCR);
      // setShowReview(true);

    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to scan document.');
    }
  };

  const onCameraPress = () => {
    Alert.alert(
      'OCR Mode',
      'How do you want to capture data?',
      [
        { text: 'Auto Capture', onPress: () => openCameraAndScan('AUTO') },
        { text: 'Manual Select', onPress: () => openCameraAndScan('MANUAL') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
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

  const hasApplicantData = useMemo(() => {
    if (!Array.isArray(FORM_FIELD_MAP_Input)) return false;

    return FORM_FIELD_MAP_Input.some(field => {
      const v = field.value;
      return v !== null && v !== undefined && String(v).trim() !== '';
    });
  }, [FORM_FIELD_MAP_Input]);

  useEffect(() => {
    if (!parsedOCR) return;

    const finalData = Object.fromEntries(
      Object.entries(parsedOCR)
        .filter(([_, v]) => v?.confidence > 0.8) // only high confidence
        .map(([k, v]) => [k, v.value])
    );

    if (Object.keys(finalData).length) {
      setFormData(prev => ({
        ...prev,
        ...finalData
      }));
    }
  }, [parsedOCR]);

  const tasks = useMemo(() => {
    if (!ocrDraft) return [];

    return Object.entries(ocrDraft).map(([key, value]) => ({
      id: key,
      label: key,
      value: value?.value || '',
      confidence: value?.confidence || 0
    }));
  }, [ocrDraft]);

  const stableHandleTextChange = useCallback(handleTextChange, []);

  const renderTask = useCallback(({ item }) => (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>
        {item.label} ({Math.round(item.confidence * 100)}%)
      </Text>

      <TextInput
        value={item.value}
        onChangeText={(text) => handleTextChange(text, item.id)}
        style={styles.input}
      />
    </View>
  ), [handleTextChange]);

  return (
    <LinearGradient
      colors={["#1A1207", "#3C2410", "#140D05"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
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

            {/* OCR LABEL */}
            {/* <Text style={styles.ocrLabel}>OCR</Text> */}

            {/* ACTION BUTTONS */}
            <View style={styles.actionRow}>
              <TouchableOpacity onPress={onCameraPress} activeOpacity={0.8}>
                <Text style={styles.actionText}>Camera</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={selectFileAutoPopulate} activeOpacity={0.8}>
                <Text style={styles.actionText}>Upload</Text>
              </TouchableOpacity>
            </View>



            {/* KPI */}
            <View style={styles.kpiRow}>
              <KpiCard label="Active Loans" value="124" />
              <KpiCard label="Disbursed" value="₹8.2L" />
              <KpiCard label="Collection" value="₹2.1L" />
            </View>


            {/* ACTIONS */}
            <View style={styles.actionsRow}>
              <ActionBtn icon="add-circle-outline" label="New Loan" />
              <ActionBtn icon="camera-outline" label="Scan" />
              <ActionBtn icon="people-outline" label="Customers" />
            </View>

            {/* TASKS */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tasks</Text>

              <TaskItem title="Verify Gold Valuation" status="Pending" />
              <TaskItem title="Approve Loan #1023" status="Review" />
            </View>

            {/* ACTIVITY */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>

              <Text style={styles.activityText}>Loan #1001 Disbursed</Text>
              <Text style={styles.activityText}>Customer Rahul Updated</Text>
            </View>



            {showManualSelect && (
              <OCRManualSelectScreen
                imageUri={ocrImage}
                blocks={ocrBlocks}
                originalImageSize={originalImageSize} // 🔥 REQUIRED
                autoSelectedKeys={autoSelectedKeys}     // 🔥 OPTIONAL (auto highlight)
                onConfirm={(manualData) => {
                  setOcrDraft(prev => ({ ...prev, ...manualData }));
                  setShowManualSelect(false);
                  setShowReview(true);
                }}
                onCancel={() => setShowManualSelect(false)}
              />
            )}



            {/* ========== TASKS SECTION ========== */}
            {Array.isArray(tasks) && tasks.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tasks</Text>

                <FlatList
                  data={tasks}
                  keyExtractor={(item) => item.id}
                  renderItem={renderTask}
                  extraData={tasks}
                  keyboardShouldPersistTaps="handled"
                />

              </View>)}

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
    </LinearGradient>
  );

}

export default Dashboard

const styles = StyleSheet.create({
  // safeContainer: {
  //   flex: 1,
  //   backgroundColor: "#F6EFE7",
  // },
  // contentContainer: {
  //   flex: 1,
  //   paddingHorizontal: 20,
  //   paddingTop: 16,
  // },
  // scrollContent: {
  //   paddingHorizontal: 16,
  //   paddingBottom: 120,
  // },
  ocrSection: {
    // marginTop: 12,
    marginBottom: 16,
    backgroundColor: 'pink'
  },

  ocrLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD_THEME.textSecondary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },

  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 8
  },

  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: GOLD_THEME.white,
  },

  section: {
    backgroundColor: GOLD_THEME.panel,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: GOLD_THEME.border,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GOLD_THEME.accentStrong,
    marginBottom: 12,
  },

  listContent: {
    paddingBottom: 40, // 🔥 VERY IMPORTANT
  },

  headerWrapper: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: '#24160C'
    // backgroundColor: '#7BFD0A'
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
    color: "#E7D7C2",
    fontSize: 13,
  },

  headerTitle: {
    color: GOLD_THEME.white,
    fontSize: 22,
    fontWeight: "800",
  },

  avatarWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: GOLD_THEME.accentSoft,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    color: GOLD_THEME.accentStrong,
    fontWeight: "800",
    fontSize: 16,
  },

  headerSummaryRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    color: "#E7D7C2",
    fontSize: 13,
  },

  summaryValue: {
    color: GOLD_THEME.white,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 4,
  },

  chip: {
    backgroundColor: GOLD_THEME.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  chipText: {
    fontWeight: "800",
    color: GOLD_THEME.accentStrong,
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
    color: GOLD_THEME.textSecondary,
    marginBottom: 4,
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: GOLD_THEME.border,
    borderRadius: 10,
    padding: 10,
    color: GOLD_THEME.textPrimary,
    backgroundColor: GOLD_THEME.white,
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
    backgroundColor: GOLD_THEME.panel,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: GOLD_THEME.border,
  },

  rawIndex: {
    fontSize: 12,
    fontWeight: '800',
    color: GOLD_THEME.accentStrong,
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
    color: GOLD_THEME.textSecondary,
    fontWeight: '700',
    flex: 1,
  },

  rawFieldValue: {
    fontSize: 12,
    color: GOLD_THEME.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  // input: {
  //   borderWidth: 1,
  //   borderColor: '#ccc',
  //   borderRadius: 8,
  //   padding: 10,
  //   fontSize: 16,
  //   backgroundColor: '#fff',
  // },
  confidence: {
    fontSize: 11,
    color: GOLD_THEME.textMuted,
    marginTop: 4,
  },











  safeContainer: {
    flex: 1,
    // paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  /* HEADER */
  // headerWrapper: {
  //   paddingHorizontal: 16,
  //   marginBottom: 16,
  // },

  // headerRow: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   alignItems: "center",
  // },

  // headerLeft: {
  //   flexDirection: "row",
  //   alignItems: "center",
  // },

  // drawerIcon: {
  //   width: 24,
  //   height: 24,
  //   marginRight: 10,
  // },

  // headerSubTitle: {
  //   color: "#9FB0C5",
  //   fontSize: 12,
  // },

  // headerTitle: {
  //   color: "#F8FAFC",
  //   fontSize: 16,
  //   fontWeight: "800",
  // },

  avatarWrapper: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#F4C95D",
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "#08111F",
    fontWeight: "800",
  },

  headerSummaryRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  summaryLabel: {
    color: "#9FB0C5",
    fontSize: 11,
  },

  summaryValue: {
    color: "#F8FAFC",
    fontSize: 16,
    fontWeight: "800",
  },

  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(244,201,93,0.18)",
  },

  chipText: {
    color: "#F4C95D",
    fontSize: 11,
    fontWeight: "700",
  },

  /* KPI */
  kpiRow: {
    flexDirection: "row",
    marginBottom: 16,
  },

  kpiCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 14,
    marginRight: 10,
  },

  kpiValue: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "800",
  },

  kpiLabel: {
    color: "#9FB0C5",
    fontSize: 11,
    marginTop: 4,
  },

  /* ACTIONS */
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  actionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginHorizontal: 4,
  },

  actionText: {
    marginTop: 6,
    fontSize: 12,
    color: "#9FB0C5",
  },

  /* SECTION */
  section: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#9FB0C5",
    marginBottom: 10,
    textTransform: "uppercase",
  },

  /* TASK */
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },

  taskTitle: {
    color: "#F8FAFC",
    fontSize: 13,
  },

  taskStatus: {
    color: "#F4C95D",
    fontSize: 12,
    fontWeight: "700",
  },

  /* ACTIVITY */
  activityText: {
    color: "#CFD8E3",
    fontSize: 12,
    marginBottom: 6,
  },

  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  kpiCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 18,
    padding: 14,
    marginRight: 8,
  },

  kpiCardLast: {
    marginRight: 0,
  },
})


// import React, { useContext, useState, useMemo, useRef, useCallback, useEffect } from 'react'
// import {
//   StyleSheet, Alert, SafeAreaView, Image, PermissionsAndroid,
//   PERMISSIONS, Platform, TouchableOpacity, TextInput, FlatList, StatusBar, Text, View,
//   KeyboardAvoidingView, Dimensions, BackHandler,
//   ScrollView, Animated, Pressable, Modal,
//   PanResponder
// } from 'react-native'


// import Slider from "@react-native-community/slider";

// import Pdf from 'react-native-pdf';
// import { captureRef } from 'react-native-view-shot';
// import TextRecognition from '@react-native-ml-kit/text-recognition';
// import { moderateScale, verticalScale } from "react-native-size-matters";
// import RNFS from 'react-native-fs';
// import DocumentPicker from 'react-native-document-picker';
// import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
// import Clipboard from '@react-native-clipboard/clipboard';
// import XLSX from 'xlsx';
// import RNFetchBlob from 'rn-fetch-blob';
// import FormInput from '../components/FormInput';
// import { detectDocumentType } from './OCR/configs/etectDocumentType';
// import { parsePanOCR } from './OCR/parser/parsePanOCR';
// import OCRReviewScreen from './OCR/OCRReviewScreen';
// import OCRManualSelectScreen from './OCR/OCRManualSelectScreen';
// import DateTimePicker from "@react-native-community/datetimepicker";
// import HapticFeedback from "react-native-haptic-feedback";
// import CustomSlider from '../components/CustomeSlider';
// import RangeSlider from '../components/CustomeSlider';
// import { useNavigation } from '@react-navigation/native';
// import { DrawerContext } from '../DrawerContext';
// const { width, height } = Dimensions.get('window')
// const LEADS_DATA = [
//   {
//     id: 1,
//     name: "Ramesh Kumar",
//     amount: 3.2,
//     status: "Approved",
//     itemType: "Gold Necklace",
//     itemCategory: "Jewellery",
//     scheme: "Regular Gold Loan",
//     repayment: "Monthly EMI",
//     date: "2024-01-10",
//   },
//   {
//     id: 2,
//     name: "Sunita Devi",
//     amount: 1.5,
//     status: "Pending",
//     itemType: "Gold Ring",
//     itemCategory: "Jewellery",
//     scheme: "Express Gold Loan",
//     repayment: "Bullet",
//     date: "2024-01-12",
//   },
//   {
//     id: 3,
//     name: "Amit Verma",
//     amount: 2.1,
//     status: "Rejected",
//     itemType: "Gold Chain",
//     itemCategory: "Jewellery",
//     scheme: "Regular Gold Loan",
//     repayment: "Monthly EMI",
//     date: "2024-01-14",
//   },
// ];


// // Gender dropdown
// export const GenderList = [
//   { label: 'Male', value: 'M' },
//   { label: 'Female', value: 'F' },
//   { label: 'Other', value: 'O' },
// ];

// // Lead Source dropdown
// export const LeadDropdown = [
//   { label: 'Walk-in', value: 'WALKIN' },
//   { label: 'Agent', value: 'AGENT' },
//   { label: 'Online', value: 'ONLINE' },
// ];

// // Branch dropdown
// export const BranchName = [
//   { label: 'Mumbai', value: 'MUM' },
//   { label: 'Delhi', value: 'DEL' },
//   { label: 'Pune', value: 'PUN' },
// ];

// const pincodesFromApi = [
//   { pincode: 400001 },
//   { pincode: 110001 },
// ];

// const COLORS = {
//   bg: "#F6F7FB",
//   card: "#FFFFFF",
//   textPrimary: "#1C1E21",
//   textSecondary: "#6B7280",
//   divider: "#E5E7EB",
//   gold: "#C9A23F",
//   goldSoft: "#F4EBD0",
//   danger: "#D32F2F",
//   success: "#2E7D32",
// };


// const Dashboard = () => {
//   const { openDrawer } = useContext(DrawerContext);
//   const navigation = useNavigation();
//   const [loading, setLoading] = useState(true);
//   const [filterModalVisible, setFilterModalVisible] = useState(false);
//   const [sortBy, setSortBy] = useState("LATEST");
//   const overlayOpacity = useRef(new Animated.Value(0)).current;

//   const onCLose = () => {
//     setFilterModalVisible(false)
//   }
//   const closeModal = () => {
//     HapticFeedback.trigger("impactLight");
//     onCLose();
//   };

//   useEffect(() => {
//     const backAction = () => {
//       onCLose();
//       return true; // prevent default back
//     };

//     const sub = BackHandler.addEventListener(
//       "hardwareBackPress",
//       backAction
//     );

//     return () => sub.remove();
//   }, []);

//   useEffect(() => {
//     Animated.timing(overlayOpacity, {
//       toValue: 1,
//       duration: 200,
//       useNativeDriver: true,
//     }).start();
//   }, []);

//   const panY = useRef(new Animated.Value(0)).current;

//   const panResponder = useRef(
//     PanResponder.create({
//       onMoveShouldSetPanResponder: (_, g) => g.dy > 5,
//       onPanResponderMove: (_, g) => {
//         if (g.dy > 0) panY.setValue(g.dy);
//       },
//       onPanResponderRelease: (_, g) => {
//         if (g.dy > 120) {
//           closeModal();
//         } else {
//           Animated.spring(panY, {
//             toValue: 0,
//             useNativeDriver: true,
//           }).start();
//         }
//       },
//     })
//   ).current;


//   /* 🔥 SINGLE SOURCE OF TRUTH */
//   const [filters, setFilters] = useState({
//     status: "ALL",
//     itemType: "ALL",
//     itemCategory: "ALL",
//     scheme: "ALL",
//     repayment: "ALL",
//     fromDate: null,
//     toDate: null,
//     minAmount: null,
//     maxAmount: null,
//   });

//   /* SIMULATE API */
//   useEffect(() => {
//     const t = setTimeout(() => setLoading(false), 1000);
//     return () => clearTimeout(t);
//   }, []);

//   /* FILTER LOGIC */
//   const filteredLeads = useMemo(() => {
//     let data = LEADS_DATA.filter(item => {
//       if (filters.status !== "ALL" && item.status !== filters.status)
//         return false;

//       if (filters.itemType !== "ALL" && item.itemType !== filters.itemType)
//         return false;

//       if (
//         filters.itemCategory !== "ALL" &&
//         item.itemCategory !== filters.itemCategory
//       )
//         return false;

//       if (filters.scheme !== "ALL" && item.scheme !== filters.scheme)
//         return false;

//       if (filters.repayment !== "ALL" && item.repayment !== filters.repayment)
//         return false;

//       // ✅ Amount range (safe)
//       if (filters.minAmount && item.amount < filters.minAmount)
//         return false;

//       if (filters.maxAmount && item.amount > filters.maxAmount)
//         return false;

//       // ✅ Date range
//       if (filters.fromDate && new Date(item.date) < filters.fromDate)
//         return false;

//       if (filters.toDate && new Date(item.date) > filters.toDate)
//         return false;

//       return true;
//     });

//     // ✅ SORTING
//     if (sortBy === "AMOUNT") {
//       data = [...data].sort((a, b) => b.amount - a.amount);
//     } else {
//       data = [...data].sort(
//         (a, b) => new Date(b.date) - new Date(a.date)
//       );
//     }

//     return data;
//   }, [filters, sortBy]);


//   /* KPI DISTRIBUTION */
//   const kpis = useMemo(() => ({
//     total: filteredLeads.length,
//     approved: filteredLeads.filter(l => l.status === "Approved").length,
//     pending: filteredLeads.filter(l => l.status === "Pending").length,
//     rejected: filteredLeads.filter(l => l.status === "Rejected").length,
//   }), [filteredLeads]);

//   const RESET_FILTERS = {
//     status: "ALL",
//     itemType: "ALL",
//     itemCategory: "ALL",
//     scheme: "ALL",
//     repayment: "ALL",
//     fromDate: null,
//     toDate: null,
//     minAmount: null,
//     maxAmount: null,
//   };

//   const FILTER_LABELS = {
//     status: "Status",
//     itemType: "Item",
//     itemCategory: "Category",
//     scheme: "Scheme",
//     repayment: "Repayment",
//     minAmount: "Min ₹",
//     maxAmount: "Max ₹",
//     fromDate: "From",
//     toDate: "To",
//   };


//   return (
//     <SafeAreaView style={styles.safeContainer}>
//       <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

//       {/* ================= HEADER ================= */}
//       <View style={styles.headerWrapper}>
//         <View style={styles.headerRow}>
//           <TouchableOpacity
//             style={styles.headerLeft}
//             onPress={openDrawer}
//             activeOpacity={0.85}
//           >
//             <Image
//               source={require("../asset/icon/menus.png")}
//               style={styles.drawerIcon}
//             />
//             <View>
//               <Text style={styles.headerSubTitle}>Welcome back,</Text>
//               <Text style={styles.headerTitle}>Gold Loan User</Text>
//             </View>
//           </TouchableOpacity>

//           <View style={styles.avatarWrapper}>
//             <Text style={styles.avatarText}>MM</Text>
//           </View>
//         </View>

//         <View style={styles.headerSummaryRow}>
//           <View>
//             <Text style={styles.summaryLabel}>Today's Overview</Text>
//             <Text style={styles.summaryValue}>8 Active Pipelines</Text>
//           </View>
//           <View style={styles.chip}>
//             <Text style={styles.chipText}>Live</Text>
//           </View>
//         </View>
//       </View>

//       {/* ================= CONTENT ================= */}
//       <KeyboardAvoidingView
//         style={{ flex: 1 }}
//         behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
//       >
//         <ScrollView
//           keyboardShouldPersistTaps="handled"
//           showsVerticalScrollIndicator={false}
//           contentContainerStyle={styles.scrollContent}
//         >
//           {loading ? (
//             <DashboardSkeleton />
//           ) : (
//             <>
//               {/* TODAY PERFORMANCE */}
//               <TodayPerformance />

//               {/* DISBURSED */}
//               <View style={styles.amountCard}>
//                 <Text style={styles.amountLabel}>Total Disbursed</Text>
//                 <Text style={styles.amountValue}>₹ 2.45 Cr</Text>
//               </View>

//               {/* STATUS + FILTER BUTTON */}
//               <View style={styles.filterHeader}>
//                 <StatusTabs
//                   value={filters.status}
//                   onChange={status =>
//                     setFilters(prev => ({ ...prev, status }))
//                   }
//                 />
//                 <TouchableOpacity
//                   style={styles.filterButton}
//                   onPress={() => setFilterModalVisible(true)}
//                 >
//                   <Text style={styles.filterButtonText}>Filter</Text>
//                 </TouchableOpacity>
//               </View>

//               <TouchableOpacity
//                 style={styles.sortButton}
//                 onPress={() =>
//                   setSortBy(prev => (prev === "LATEST" ? "AMOUNT" : "LATEST"))
//                 }
//               >
//                 <Text style={styles.sortText}>
//                   Sort: {sortBy === "LATEST" ? "Latest" : "Amount"}
//                 </Text>
//               </TouchableOpacity>

//               {/* APPLIED FILTER CHIPS */}
//               <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                 <View style={styles.appliedFiltersRow}>
//                   {Object.entries(filters).some(
//                     ([_, value]) => value !== "ALL" && value !== null
//                   ) && (
//                       <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//                         <View style={styles.appliedFiltersRow}>
//                           {Object.entries(filters).map(([key, value]) => {
//                             if (value === "ALL" || value === null) return null;

//                             const displayValue =
//                               value instanceof Date
//                                 ? value.toDateString()
//                                 : key === "minAmount" || key === "maxAmount"
//                                   ? `₹${value}L`
//                                   : value;

//                             return (
//                               <AnimatedFilterTag
//                                 key={key}
//                                 label={`${FILTER_LABELS[key]}: ${displayValue}`}
//                                 onRemove={() =>
//                                   setFilters(prev => ({
//                                     ...prev,
//                                     [key]: RESET_FILTERS[key],
//                                   }))
//                                 }
//                               />
//                             );
//                           })}
//                         </View>
//                       </ScrollView>
//                     )}

//                 </View>

//               </ScrollView>

//               <ScrollView showsVerticalScrollIndicator={false}>
//                 {/* KPI */}
//                 <View style={styles.cardRow}>
//                   <StatCard title="Total Leads" value={kpis.total} />
//                   <StatCard title="Approved" value={kpis.approved} />
//                 </View>
//                 <View style={styles.cardRow}>
//                   <StatCard title="Pending" value={kpis.pending} />
//                   <StatCard title="Rejected" value={kpis.rejected} />
//                 </View>

//                 {/* ACTIONS */}
//                 <Text style={styles.sectionTitle}>Quick Actions</Text>
//                 <View style={styles.actionRow}>
//                   <ActionButton
//                     title="Create Lead"
//                     onPress={() =>
//                       navigation.navigate("NewLoan", {
//                         triggerCreate: true,
//                       })
//                     }
//                   />

//                   <ActionButton
//                     title="Upload Docs"
//                     onPress={() => navigation.navigate("DocumentUpload")}
//                   />
//                 </View>

//                 {/* LEADS */}
//                 <Text style={styles.sectionTitle}>Recent Leads</Text>
//                 {filteredLeads.length === 0 ? (
//                   <View style={styles.emptyState}>
//                     <Text style={styles.emptyText}>
//                       No leads match these filters
//                     </Text>

//                     <TouchableOpacity
//                       style={styles.clearBtn}
//                       onPress={() =>
//                         setFilters({
//                           status: "ALL",
//                           itemType: "ALL",
//                           itemCategory: "ALL",
//                           scheme: "ALL",
//                           repayment: "ALL",
//                         })
//                       }
//                     >
//                       <Text style={styles.clearBtnText}>Clear Filters</Text>
//                     </TouchableOpacity>
//                   </View>

//                 ) : (
//                   filteredLeads.map(item => (
//                     <LeadRow key={item.id} {...item} />
//                   ))
//                 )}
//               </ScrollView>
//             </>
//           )}
//         </ScrollView>
//       </KeyboardAvoidingView>
//       {/* FILTER MODAL */}
//       {filterModalVisible && (
//         <FilterModal
//           filters={filters}
//           onApply={f => {
//             setFilters(f);
//             setFilterModalVisible(false);
//           }}
//           onClose={() => onCLose()}
//           opacity={overlayOpacity}
//           panResponder={panResponder}
//           panY={panY}

//         />
//       )}

//     </SafeAreaView>
//   );




// }

// export default Dashboard


// const TodayPerformance = () => (
//   <View style={styles.todayCard}>
//     <View>
//       <Text style={styles.todayLabel}>Today’s Leads</Text>
//       <Text style={styles.todayValue}>12</Text>
//     </View>
//     <View>
//       <Text style={styles.todayLabel}>Today’s Disbursed</Text>
//       <Text style={styles.todayAmount}>₹18.5L</Text>
//     </View>
//   </View>
// );

// const StatusTabs = ({ value, onChange }) => {
//   const tabs = ["ALL", "Approved", "Pending", "Rejected"];
//   return (
//     <View style={styles.tabsRow}>
//       {tabs.map(tab => (
//         <TouchableOpacity
//           key={tab}
//           style={[
//             styles.tabChip,
//             value === tab && styles.activeTabChip,
//           ]}
//           onPress={() => onChange(tab)}
//         >
//           <Text
//             style={[
//               styles.tabText,
//               value === tab && styles.activeTabText,
//             ]}
//           >
//             {tab}
//           </Text>
//         </TouchableOpacity>
//       ))}
//     </View>
//   );
// };

// const StatCard = ({ title, value }) => (
//   <View style={styles.statCard}>
//     <Text style={styles.cardTitle}>{title}</Text>
//     <Text style={styles.cardValue}>{value}</Text>
//   </View>
// );

// const ActionButton = ({ title, onPress }) => (
//   <TouchableOpacity style={styles.actionButton} onPress={onPress}>
//     <Text style={styles.actionText}>{title}</Text>
//   </TouchableOpacity>
// );

// const LeadRow = ({ name, amount, status }) => {
//   const color =
//     status === "Approved"
//       ? "#2E7D32"
//       : status === "Pending"
//         ? "#ED6C02"
//         : "#D32F2F";

//   return (
//     <Pressable
//       style={({ pressed }) => [
//         styles.leadRow,
//         pressed && styles.leadRowActive,
//       ]}
//       onLongPress={() => alert("Call / View / Upload Docs")}
//     >
//       <View>
//         <Text style={styles.leadName}>{name}</Text>
//         <Text style={styles.leadAmount}>₹{amount}L</Text>
//       </View>

//       <Text style={[styles.leadStatus, { color }]}>{status}</Text>
//     </Pressable>
//   );
// };

// /* ===================== FILTER MODAL ===================== */
// const FilterModal = ({ filters, onApply, onClose, overlayOpacity, panResponder, panY, }) => {
//   const [local, setLocal] = useState(filters);

//   const [activeDropdown, setActiveDropdown] = useState(null);
//   const [showDatePicker, setShowDatePicker] = useState(null);
//   const slideAnim = useRef(new Animated.Value(0)).current;
//   const [amountVisible, setAmountVisible] = useState(false);
//   const [isSliding, setIsSliding] = useState(false);

//   const toggleDropdown = (key) => {
//     setActiveDropdown(prev => (prev === key ? null : key));
//   };

//   const update = (key, value) => {
//     setLocal(prev => ({ ...prev, [key]: value }));
//     setActiveDropdown(null);
//   };
//   const openAmountRange = () => {
//     setAmountVisible(true);
//     Animated.timing(slideAnim, {
//       toValue: 1,
//       duration: 250,
//       useNativeDriver: true,
//     }).start();
//   };

//   const closeAmountRange = () => {
//     Animated.timing(slideAnim, {
//       toValue: 0,
//       duration: 200,
//       useNativeDriver: true,
//     }).start(() => {
//       setAmountVisible(false);
//     });
//   };


//   return (
//     <Modal transparent animationType="fade">
//       <View style={styles.modalOverlay}>

//         {/* 🔹 BACKDROP (click outside to close modal) */}
//         <Pressable
//           style={StyleSheet.absoluteFill}
//           onPress={() => {
//             setActiveDropdown(null);
//             setAmountVisible(false);
//             onClose();
//           }}
//         />
//         <Animated.View
//           {...panResponder.panHandlers}
//           style={[
//             styles.modalCard,
//             { transform: [{ translateY: panY }] }
//           ]}
//         >


//           <Text style={styles.modalTitle}>Filters</Text>

//           <DropdownField
//             label="Amount Range"
//             value={
//               local.minAmount || local.maxAmount
//                 ? `₹${local.minAmount || 0}L - ₹${local.maxAmount || "∞"}L`
//                 : "Select Range"
//             }
//             onPress={openAmountRange}
//           />


//           {/* ITEM TYPE */}
//           <DropdownField
//             label="Item Type"
//             value={local.itemType}
//             // onPress={() => setActiveDropdown("itemType")}
//             onPress={() => toggleDropdown("itemType")}

//           />

//           {activeDropdown === "itemType" && (
//             <DropdownList
//               options={["ALL", "Gold Necklace", "Gold Ring", "Gold Chain"]}
//               onSelect={v => update("itemType", v)}
//             />
//           )}

//           {/* SCHEME */}
//           <DropdownField
//             label="Scheme"
//             value={local.scheme}
//             onPress={() => toggleDropdown("scheme")}
//           />

//           {activeDropdown === "scheme" && (
//             <DropdownList
//               options={["ALL", "Regular Gold Loan", "Express Gold Loan"]}
//               onSelect={v => update("scheme", v)}
//             />
//           )}

//           {/* REPAYMENT */}
//           <DropdownField
//             label="Repayment Type"
//             value={local.repayment}
//             onPress={() => toggleDropdown("repayment")}
//           />

//           {activeDropdown === "repayment" && (
//             <DropdownList
//               options={["ALL", "Monthly EMI", "Bullet"]}
//               onSelect={v => update("repayment", v)}
//             />
//           )}

//           {/* DATE RANGE */}
//           <Text style={styles.filterLabel}>Date Range</Text>

//           <View style={styles.dateRow}>
//             <TouchableOpacity
//               style={styles.dateBtn}
//               onPress={() => setShowDatePicker("from")}
//             >
//               <Text style={styles.dateText}>
//                 {local.fromDate
//                   ? local.fromDate.toDateString()
//                   : "From Date"}
//               </Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={styles.dateBtn}
//               onPress={() => setShowDatePicker("to")}
//             >
//               <Text style={styles.dateText}>
//                 {local.toDate
//                   ? local.toDate.toDateString()
//                   : "To Date"}
//               </Text>
//             </TouchableOpacity>
//           </View>

//           {showDatePicker && (
//             <DateTimePicker
//               value={new Date()}
//               mode="date"
//               display={Platform.OS === "ios" ? "spinner" : "default"}
//               onChange={(_, selectedDate) => {
//                 if (selectedDate) {
//                   setLocal(prev => ({
//                     ...prev,
//                     [showDatePicker === "from" ? "fromDate" : "toDate"]:
//                       selectedDate,
//                   }));
//                 }
//                 setShowDatePicker(null);
//               }}
//             />
//           )}

//           {/* ACTIONS */}
//           <View style={styles.modalActions}>
//             <TouchableOpacity onPress={onClose}>
//               <Text style={styles.cancelText}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               onPress={() =>
//                 onApply({
//                   status: "ALL",
//                   itemType: "ALL",
//                   itemCategory: "ALL",
//                   scheme: "ALL",
//                   repayment: "ALL",
//                   fromDate: null,
//                   toDate: null,
//                   minAmount: null,
//                   maxAmount: null,
//                 })

//               }
//             >
//               <Text style={styles.resetText}>Clear All</Text>
//             </TouchableOpacity>


//             <TouchableOpacity
//               style={styles.applyBtn}
//               onPress={() => onApply(local)}
//             >
//               <Text style={styles.applyText}>Apply Filters</Text>
//             </TouchableOpacity>
//           </View>
//         </Animated.View>

//         {/* {amountVisible && (
//           <Pressable
//             style={StyleSheet.absoluteFill}
//             onPress={closeAmountRange}
//           />
//         )} */}


//         {/* 🔹 AMOUNT RANGE SLIDER (TOP MOST) */}
//         {amountVisible && (
//           <>
//             {/* Backdrop */}
//             <Pressable
//               style={[StyleSheet.absoluteFill, { zIndex: 1 }]}
//               onPress={() => {
//                 if (!isSliding) {
//                   closeAmountRange();
//                 }
//               }}
//             />

//             {/* Sheet */}
//             <Animated.View
//               style={[
//                 styles.amountSheet,
//                 {
//                   zIndex: 2,
//                   transform: [
//                     {
//                       translateY: slideAnim.interpolate({
//                         inputRange: [0, 1],
//                         outputRange: [250, 0],
//                       }),
//                     },
//                   ],
//                 },
//               ]}
//             >

//               <Text style={styles.sheetTitle}>Amount Range (₹ Lakhs)</Text>

//               <Text style={styles.amountValuePreview}>
//                 Up to ₹{local.maxAmount || 0} Lakhs
//               </Text>

//               <RangeSlider
//                 min={0}
//                 max={10}
//                 step={0.5}
//                 minValue={local.minAmount ?? 0}
//                 maxValue={local.maxAmount ?? 10}
//                 onChange={({ minAmount, maxAmount }) =>
//                   setLocal(prev => ({
//                     ...prev,
//                     minAmount,
//                     maxAmount,
//                   }))
//                 }
//               />



//               <TouchableOpacity
//                 onPress={closeAmountRange}
//                 style={styles.doneBtn}
//               >
//                 <Text style={styles.doneText}>Done</Text>
//               </TouchableOpacity>
//             </Animated.View>
//           </>
//         )}

//       </View>
//     </Modal>
//   );
// };


// const DropdownField = ({ label, value, onPress }) => (
//   <>
//     <Text style={styles.filterLabel}>{label}</Text>

//     <TouchableOpacity style={styles.dropdown} onPress={onPress}>
//       <Text style={styles.dropdownText}>{value}</Text>

//       {/* 🔽 Arrow */}
//       <Text style={styles.dropdownArrow}>▾</Text>
//     </TouchableOpacity>
//   </>
// );

// const DropdownList = ({ options, onSelect }) => (
//   <View style={styles.dropdownList}>
//     {options.map(opt => (
//       <Pressable
//         key={opt}
//         style={styles.dropdownItem}
//         onPress={() => onSelect(opt)}
//       >
//         <Text style={styles.dropdownItemText}>{opt}</Text>
//       </Pressable>
//     ))}
//   </View>
// );

// const AnimatedFilterTag = ({ label, onRemove }) => {
//   const scale = useRef(new Animated.Value(0)).current;
//   const opacity = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.parallel([
//       Animated.spring(scale, {
//         toValue: 1,
//         useNativeDriver: true,
//       }),
//       Animated.timing(opacity, {
//         toValue: 1,
//         duration: 200,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, []);

//   const handleRemove = () => {
//     Animated.parallel([
//       Animated.timing(scale, {
//         toValue: 0,
//         duration: 150,
//         useNativeDriver: true,
//       }),
//       Animated.timing(opacity, {
//         toValue: 0,
//         duration: 150,
//         useNativeDriver: true,
//       }),
//     ]).start(onRemove);
//   };

//   return (
//     <Animated.View
//       style={[
//         styles.filterTag,
//         { transform: [{ scale }], opacity },
//       ]}
//     >
//       <Pressable onPress={handleRemove}>
//         <Text style={styles.filterTagText}>{label} ✕</Text>
//       </Pressable>
//     </Animated.View>
//   );
// };

// const AppliedFilters = ({ filters, setFilters }) => {
//   const active = Object.entries(filters).filter(
//     ([_, v]) => v && v !== "ALL"
//   );

//   if (!active.length) return null;

//   return (
//     <ScrollView horizontal showsHorizontalScrollIndicator={false}>
//       <View style={styles.appliedFiltersRow}>
//         {active.map(([key, value]) => (
//           <AnimatedFilterTag
//             key={key}
//             label={`${FILTER_LABELS[key]}: ${value instanceof Date ? value.toDateString() : value
//               }`}
//             onRemove={() =>
//               setFilters(prev => ({ ...prev, [key]: RESET_FILTERS[key] }))
//             }
//           />
//         ))}
//       </View>
//     </ScrollView>
//   );
// };

// const DashboardSkeleton = () => (
//   <>
//     {[...Array(4)].map((_, i) => (
//       <View key={i} style={styles.skeletonCard} />
//     ))}
//   </>
// );

// const styles = StyleSheet.create({
//   safeContainer: {
//     flex: 1,
//     backgroundColor: "#F5F7FA",
//   },
//   contentContainer: {
//     flex: 1,
//     paddingHorizontal: 20,
//     paddingTop: 16,
//   },
//   scrollContent: {
//     paddingHorizontal: 16,
//     paddingBottom: 120,
//   },
//   ocrSection: {
//     marginTop: 12,
//     marginBottom: 16,
//   },

//   ocrLabel: {
//     fontSize: 14,
//     fontWeight: '700',
//     color: '#555',
//     marginBottom: 8,
//     letterSpacing: 0.5,
//   },

//   actionRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginVertical: 16,
//   },

//   actionText: {
//     fontSize: 14,
//     fontWeight: '600',
//     color: '#2196F3',
//   },

//   section: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 14,
//     padding: 16,
//     marginBottom: 16,
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 4 },

//   },

//   sectionTitle: {
//     fontSize: 15,
//     fontWeight: '700',
//     color: '#2196F3',
//     marginBottom: 12,
//   },

//   listContent: {
//     paddingBottom: 40, // 🔥 VERY IMPORTANT
//   },

//   headerWrapper: {
//     paddingTop: 48,
//     paddingBottom: 28,
//     paddingHorizontal: 20,
//     borderBottomLeftRadius: 24,
//     borderBottomRightRadius: 24,
//     backgroundColor: "#1F3C88", // deep royal blue (banking tone)
//   },
//   headerRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },

//   drawerIcon: {
//     width: 26,
//     height: 26,
//     marginRight: 12,
//     tintColor: "#fff",
//   },

//   headerSubTitle: {
//     color: "#DCE4FF",
//     fontSize: 13,
//   },


//   headerTitle: {
//     color: "#FFFFFF",
//     fontSize: 22,
//     fontWeight: "700",
//     letterSpacing: 0.3,
//   },

//   avatarWrapper: {
//     width: 42,
//     height: 42,
//     borderRadius: 21,
//     backgroundColor: "#fff",
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   avatarText: {
//     color: "#2196F3",
//     fontWeight: "700",
//     fontSize: 16,
//   },

//   headerSummaryRow: {
//     marginTop: 20,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   summaryLabel: {
//     color: "#e5e5e5",
//     fontSize: 13,
//   },

//   summaryValue: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "700",
//     marginTop: 4,
//   },

//   chip: {
//     backgroundColor: "rgba(255,255,255,0.15)",
//     paddingHorizontal: 14,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },

//   chipText: {
//     color: "#FFFFFF",
//     fontWeight: "700",
//   },


//   label: {
//     color: '#555',
//     marginBottom: 4,
//     fontSize: 12,
//   },

//   row: {
//     flexDirection: 'row',
//     justifyContent: 'space-between'
//   },










//   todayCard: {
//     backgroundColor: "#FFF",
//     borderRadius: moderateScale(14),
//     padding: moderateScale(16),
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: verticalScale(14),
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 4 },

//   },
//   todayLabel: {
//     fontSize: moderateScale(12),
//     color: "#777",
//   },
//   todayValue: {
//     fontSize: moderateScale(22),
//     fontWeight: "700",
//     color: "#333",
//   },
//   todayAmount: {
//     fontSize: moderateScale(22),
//     fontWeight: "800",
//     color: "#C9A23F",
//   },




//   skeletonCard: {
//     height: verticalScale(80),
//     backgroundColor: "#EAEAEA",
//     borderRadius: moderateScale(12),
//     marginBottom: verticalScale(12),
//   },
//   cardRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: verticalScale(14),
//   },
//   statCard: {
//     width: "48%",
//     backgroundColor: "#FFF",
//     borderRadius: moderateScale(14),
//     padding: moderateScale(16),
//     elevation: 3,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowRadius: 10,
//     shadowOffset: { width: 0, height: 4 },

//   },
//   cardTitle: {
//     fontSize: moderateScale(13),
//     color: "#888",
//   },
//   cardValue: {
//     fontSize: moderateScale(22),
//     fontWeight: "700",
//     color: "#C9A23F",
//   },
//   amountCard: {
//     backgroundColor: COLORS.card,
//     borderRadius: 18,
//     padding: 20,
//     marginBottom: 20,
//     borderLeftWidth: 4,
//     borderLeftColor: COLORS.gold,
//   },

//   amountLabel: {
//     color: COLORS.textSecondary,
//     fontSize: 13,
//   },

//   amountValue: {
//     color: COLORS.gold,
//     fontSize: 28,
//     fontWeight: "800",
//   },

//   sectionTitle: {
//     fontSize: moderateScale(16),
//     fontWeight: "600",
//     marginBottom: verticalScale(10),
//     color: '#000'
//   },
//   actionRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: verticalScale(20),
//   },
//   actionButton: {
//     width: "48%",
//     backgroundColor: "#FFF",
//     borderRadius: moderateScale(14),
//     paddingVertical: verticalScale(14),
//     alignItems: "center",
//     elevation: 3,
//   },
//   actionText: {
//     fontSize: moderateScale(14),
//     fontWeight: "600",
//     color: '#000'
//   },
//   leadRow: {
//     backgroundColor: COLORS.card,
//     borderRadius: 14,
//     padding: 16,
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: 12,
//   },

//   leadName: {
//     fontSize: 15,
//     fontWeight: "600",
//     color: COLORS.textPrimary,
//   },

//   leadAmount: {
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },


//   leadRowActive: {
//     backgroundColor: "#F9F6EE", // subtle gold tint on press
//   },


//   leadStatus: {
//     fontSize: moderateScale(13),
//     fontWeight: "700",
//   },



//   emptyText: {
//     textAlign: "center",
//     marginTop: verticalScale(20),
//     color: "#888",
//   },

//   filterHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginBottom: verticalScale(12),
//   },

//   filterButton: {
//     backgroundColor: COLORS.card,
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: COLORS.divider,
//   },

//   filterButtonText: {
//     color: COLORS.textPrimary,
//     fontWeight: "600",
//   },

//   modalOverlay: {
//     position: "absolute",
//     top: 0,
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "rgba(0,0,0,0.5)",
//     justifyContent: "flex-end",
//   },

//   modalCard: {
//     backgroundColor: COLORS.card,
//     borderTopLeftRadius: moderateScale(26),
//     borderTopRightRadius: moderateScale(26),
//     padding: moderateScale(20),
//   },

//   modalTitle: {
//     fontSize: moderateScale(18),
//     fontWeight: "700",
//     marginBottom: verticalScale(12),
//   },







//   modalActions: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: verticalScale(16),
//   },

//   applyBtn: {
//     backgroundColor: "#C9A23F",
//     paddingHorizontal: moderateScale(20),
//     paddingVertical: verticalScale(10),
//     borderRadius: moderateScale(20),
//   },

//   applyText: {
//     color: "#FFF",
//     fontWeight: "700",
//   },

//   cancelText: {
//     fontWeight: "600",
//     color: "#666",
//   },
//   tabsRow: { flexDirection: "row" },
//   tabChip: {
//     backgroundColor: "#EEF1F6",
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 22,
//     marginRight: 8,
//   },

//   activeTabChip: {
//     backgroundColor: COLORS.goldSoft,
//   },

//   tabText: {
//     fontSize: 13,
//     color: COLORS.textSecondary,
//   },

//   activeTabText: {
//     color: COLORS.gold,
//     fontWeight: "700",
//   },

//   filterLabel: {
//     fontSize: moderateScale(13),
//     fontWeight: "600",
//     marginTop: verticalScale(12),
//     marginBottom: verticalScale(6),
//     color: "#333",
//   },

//   dropdown: {
//     backgroundColor: "#F3F3F3",
//     borderRadius: moderateScale(10),
//     paddingVertical: verticalScale(12),
//     paddingHorizontal: moderateScale(14),
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },

//   dropdownArrow: {
//     fontSize: moderateScale(16),
//     color: "#555",
//   },

//   resetText: {
//     fontSize: moderateScale(14),
//     fontWeight: "700",
//     color: "#D32F2F",
//   },



//   dropdownText: {
//     fontSize: moderateScale(14),
//     color: "#000",
//   },

//   dropdownList: {
//     backgroundColor: "#FFF",
//     borderRadius: moderateScale(10),
//     marginTop: verticalScale(6),
//     elevation: 4,
//   },

//   dropdownItem: {
//     paddingVertical: verticalScale(12),
//     paddingHorizontal: moderateScale(14),
//     borderBottomWidth: 0.5,
//     borderBottomColor: "#EEE",
//   },

//   dropdownItemText: {
//     fontSize: moderateScale(14),
//     color: "#000",
//   },

//   dateRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginTop: verticalScale(8),
//   },

//   dateBtn: {
//     width: "48%",
//     backgroundColor: "#F3F3F3",
//     paddingVertical: verticalScale(12),
//     borderRadius: moderateScale(10),
//     alignItems: "center",
//   },

//   dateText: {
//     fontSize: moderateScale(13),
//     color: "#333",
//   },


//   appliedFiltersRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginBottom: verticalScale(12),
//     height: height * 0.05

//   },

//   filterTag: {
//     backgroundColor: COLORS.goldSoft,
//     paddingHorizontal: moderateScale(14),
//     paddingVertical: verticalScale(6),
//     borderRadius: moderateScale(18),
//     marginRight: moderateScale(8),
//   },

//   filterTagText: {
//     color: COLORS.gold,
//     fontSize: moderateScale(12),
//     fontWeight: "600",
//   },
//   sortButton: {
//     backgroundColor: "#FFF",
//     paddingHorizontal: moderateScale(12),
//     paddingVertical: verticalScale(6),
//     borderRadius: moderateScale(16),
//     elevation: 2,
//     marginLeft: moderateScale(8),
//   },

//   sortText: {
//     fontSize: moderateScale(12),
//     fontWeight: "600",
//     color: "#333",
//   },




//   emptyState: {
//     alignItems: "center",
//     marginTop: verticalScale(40),
//   },

//   emptyText: {
//     fontSize: moderateScale(14),
//     color: "#777",
//     marginBottom: verticalScale(12),
//     textAlign: "center",
//   },

//   clearBtn: {
//     backgroundColor: "#111",
//     paddingHorizontal: moderateScale(18),
//     paddingVertical: verticalScale(8),
//     borderRadius: moderateScale(20),
//   },

//   clearBtnText: {
//     color: "#FFD700",
//     fontWeight: "700",
//     fontSize: moderateScale(13),
//   },

//   amountSheet: {
//     position: "absolute",
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: "#FFFFFF",
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 28, // 🔥 gives space to slider
//     elevation: 12,
//   },


//   sheetTitle: {
//     fontSize: 16,
//     fontWeight: "700",
//     marginBottom: 12,
//   },


//   doneBtn: {
//     backgroundColor: "#C9A23F",
//     marginTop: 16,
//     paddingVertical: 12,
//     borderRadius: 20,
//     alignItems: "center",
//   },

//   doneText: {
//     color: "#FFF",
//     fontWeight: "700",
//   },

//   amountValuePreview: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#333",
//     textAlign: "center",
//     marginBottom: 12,
//   },

// })