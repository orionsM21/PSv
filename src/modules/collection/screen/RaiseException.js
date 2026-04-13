// RaiseException.js - single-file, fully structured, interview-grade refactor

import React, { useEffect, useRef, useState, memo, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Animated,
  FlatList,
  Dimensions,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  BackHandler,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
// import ImagePicker from 'react-native-image-crop-picker';
import Geolocation from '@react-native-community/geolocation';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';




import { theme } from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';
const { width, height } = Dimensions.get('window');

/* ============================================================
   API LAYER - pure functions (no hooks). Easy to unit test.
   ============================================================ */
const ExceptionAPI = {
  getAllExceptionType: async (token) => {
    const res = await apiClient.get(`getAllExceptionType`, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    return res.data?.data || [];
  },

  getRaisedExceptionsByLoan: async (loanAccountNumber, token) => {
    const res = await apiClient.get(`getRaiseExceptionLoanAccountNumber/${loanAccountNumber}`, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    return res.data?.data || [];
  },

  createRaiseException: async (payload, token) => {
    const res = await apiClient.post(`createRaiseException`, payload, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    return res.data;
  },



  uploadEvidence: async (id, file, token) => {
    if (!id || !file) {
      Alert.alert("Error", "Please select a file before uploading.");
      return;
    }

    try {
      const fileType = file.type || "application/octet-stream";

      const hasExt = file.name && file.name.includes(".");
      const ext = fileType.split("/")[1] || "bin";
      const safeName = hasExt ? file.name : `${Date.now()}.${ext}`;

      console.log("Uploading Evidence:", {
        id,
        safeName,
        uri: file.uri,
        type: fileType,
      });

      // ✅ Call the apiClient.upload wrapper
      const res = await apiClient.upload(
        `upload-document-raise-exception/${id}`,
        {
          fieldName: "exceptionfile",
          file: {
            uri: file.uri,
            name: safeName,
            type: fileType,
          },
          token,
        }
      );

      console.log("Upload Evidence Response:", res);
      return res;

    } catch (error) {
      console.error("uploadEvidence error:", error);
      throw error;
    }
  },


  updateMyCase: async (url, userId, loanAccountNumber, token) => {
    const res = await apiClient.put(`${url}/${userId}/${loanAccountNumber}`, {}, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  addUserTracker: async (payload, token) => {
    const res = await apiClient.post(`addUserTracker`, payload, {
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

/* ============================================================
   useLocation Hook - encapsulate geolocation logic & retry
   ============================================================ */
const useLocation = () => {
  const [coords, setCoords] = useState({ latitude: null, longitude: null });
  const mounted = useRef(true);

  const getCurrentLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        if (!mounted.current) return;
        setCoords({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      (error) => {
        // minimal retry - don't spam requests
        setTimeout(() => {
          Geolocation.getCurrentPosition(
            (p) => mounted.current && setCoords({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
            () => { },
            { timeout: 5000 }
          );
        }, 1000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => {
    mounted.current = true;
    getCurrentLocation();
    return () => {
      mounted.current = false;
    };
  }, [getCurrentLocation]);

  return { coords, refresh: getCurrentLocation };
};

/* ============================================================
   useExceptionManager Hook - central business logic
   ============================================================ */
const useExceptionManager = ({ loanAccountNumber, token, userProfile, dispatch }) => {
  const [exceptionTypes, setExceptionTypes] = useState([]);
  const [exceptions, setExceptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { coords, refresh } = useLocation();

  const loadExceptionTypes = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await ExceptionAPI.getAllExceptionType(token);
      setExceptionTypes(res);
    } catch (e) {
      console.warn('loadExceptionTypes:', e);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loadExceptions = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await ExceptionAPI.getRaisedExceptionsByLoan(loanAccountNumber, token);
      setExceptions(Array.isArray(res) ? res : []);
    } catch (e) {
      console.warn('loadExceptions:', e);
      setExceptions([]);
    } finally {
      setIsLoading(false);
    }
  }, [loanAccountNumber, token]);

  const computeUpdateUrl = useCallback((roles, activityType) => {
    const role = roles?.[0];
    if (role === 'CA') return 'updateMyCaseForInProcessForCA';
    if (role === 'FA' && activityType === 'Calling') return 'updateMyCaseForInProcessForCA';
    if (role === 'FA' && activityType === 'Field') return 'updateMyCaseForInProcessForDRA';
    if (role === 'DRA') return 'updateMyCaseForInProcessForDRA';
    if (activityType === 'Field') return 'updateMyCaseForInProcessField';
    return 'updateMyCaseForInProcess';
  }, []);

  const submitException = useCallback(
    async ({ loanAccountNumber, remark, requestCode, requestDescription, file }) => {
      if (!remark || !requestCode) throw new Error('Validation: remark and request required');

      setIsLoading(true);
      try {
        const payload = {
          loanAccountNumber,
          remark,
          request: requestCode,
          user: { userId: userProfile?.id || userProfile?.userId },
          isDocument: file ? 'yes' : 'No',
          geoCoordinates: `${coords.latitude || ''},${coords.longitude || ''}`,
        };

        const createRes = await ExceptionAPI.createRaiseException(payload, token);

        const createdData = createRes?.data || {};
        const createdId = createdData?.raiseExceptionId;

        // best-effort updateMyCase
        try {
          const url = computeUpdateUrl(userProfile?.role?.map(r => r.roleCode), userProfile?.activityType);
          await ExceptionAPI.updateMyCase(url, userProfile?.id || userProfile?.userId, loanAccountNumber, token);
        } catch (e) {
          console.warn('updateMyCase failed', e);
        }

        // upload evidence if file exists
        if (file && createdId) {
          try {
            await ExceptionAPI.uploadEvidence(createdId, file, token);
          } catch (e) {
            console.warn('evidence upload failed', e);
          }
        }

        // fire location tracker asynchronously
        (async () => {
          try {
            let areaName = null;
            if (coords.latitude && coords.longitude) {
              const GOOGLE_MAPS_APIKEY = 'AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE';
              const geo = await axios.get(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_APIKEY}`
              );
              if (geo.data?.results?.length) areaName = geo.data.results[0].formatted_address;
            }

            const trackerPayload = {
              userId: userProfile?.id || userProfile?.userId,
              activity: 'Raise Exception',
              activityId: createdId,
              coordinates: `${coords.latitude || ''},${coords.longitude || ''}`,
              areaName,
              lan: loanAccountNumber?.toString(),
            };

            await ExceptionAPI.addUserTracker(trackerPayload, token);
          } catch (e) {
            console.warn('tracker error', e);
          }
        })();

        // refresh list
        await loadExceptions();
        return createRes;
      } finally {
        setIsLoading(false);
      }
    },
    [computeUpdateUrl, coords.latitude, coords.longitude, loadExceptions, token, userProfile]
  );

  useEffect(() => {
    loadExceptionTypes();
    loadExceptions();
  }, [loadExceptionTypes, loadExceptions]);

  return {
    exceptionTypes,
    exceptions,
    isLoading,
    loadExceptionTypes,
    loadExceptions,
    submitException,
    refreshLocation: refresh,
  };
};

/* ============================================================
   UI Components (memoized) - ExceptionItem, UploadButton, ExceptionForm
   ============================================================ */

const ExceptionItem = memo(({ item, onPress }) => {
  const date = useMemo(() => moment(item.createdTime).format('DD-MM-YYYY'), [item.createdTime]);
  const time = useMemo(() => moment(item.createdTime).format('LT'), [item.createdTime]);

  return (
    <TouchableOpacity style={styles.cardWrap} activeOpacity={0.9} onPress={() => onPress(item)}>
      <LinearGradient colors={['#FFFFFF', '#F8F9FB']} style={styles.card}>
        <View style={styles.row}>
          <View style={styles.leftCol}>
            <Text style={styles.cardTitle}>{item.request || item.requestDescription || 'Request'}</Text>
            <Text style={styles.cardSub} numberOfLines={2}>{item.requestDescription || item.request}</Text>
          </View>
          <View style={styles.rightCol}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaText}>{date}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.leftCol}>
            <Text style={styles.metaLabel}>Name</Text>
            <Text style={styles.metaText}>{item.user?.firstName} {item.user?.lastName}</Text>
          </View>
          <View style={styles.rightCol}>
            <Text style={styles.metaLabel}>Time</Text>
            <Text style={styles.metaText}>{time}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.leftCol, { flex: 1.2 }]}>
            <Text style={styles.metaLabel}>Remarks</Text>
            <Text style={styles.metaText} numberOfLines={3}>{item.remark}</Text>
          </View>
          <View style={styles.rightCol}>
            <Text style={styles.metaLabel}>Type</Text>
            <Text style={styles.metaText}>{item.request}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const UploadButton = memo(({ file, uploadScale, onOpen, onRemove }) => {
  return (
    <View style={styles.uploadContainer}>
      <Animated.View style={{ transform: [{ scale: uploadScale }] }}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onOpen}
          style={styles.uploadButton}
        >
          <MaterialIcons name="cloud-upload" size={20} color="#1D4ED8" style={{ marginRight: 8 }} />
          <Text style={styles.uploadText}>{file ? (file.name || 'Uploaded') : 'Upload Evidence'}</Text>
        </TouchableOpacity>
      </Animated.View>

      {file && (
        <TouchableOpacity onPress={onRemove} style={styles.removeFileBtn}>
          <MaterialCommunityIcons name="close-circle" size={22} color="#D7263D" />
        </TouchableOpacity>
      )}
    </View>
  );
});

const ExceptionForm = memo(({
  amount, setAmount, remark, setRemark,
  value, setValue, exceptionTypes,
  file, setFile,
  uploadScale, onOpenUpload, onRemoveFile,
  onSubmit, isLoading,
  amountRef, remarkRef
}) => {
  // local pickers for image/document
  const pickDocument = useCallback(async () => {
    try {
      const res = await DocumentPicker.pickSingle({ type: [DocumentPicker.types.images] });
      // DocumentPicker returns { uri: 'content://...' } on Android 13+ - keep it
      setFile({ uri: res.uri, name: res.name, type: res.type || res.mime, size: res.size });
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) console.warn('DocumentPicker error', e);
    }
  }, [setFile]);

  const pickFromGallery = useCallback(async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images], // gallery images only
      });

      setFile({
        uri: res.uri,
        name: res.name || res.uri.split('/').pop(),
        type: res.type,
        size: res.size,
      });

    } catch (err) {
      if (DocumentPicker.isCancel(err)) return;
      console.warn("Gallery pick error", err);
    }
  }, [setFile]);


  const takePhoto = useCallback(() => {

  }, [setFile]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.formWrap}>
        <Text style={styles.label}>Remark <Text style={{ color: 'red' }}>*</Text></Text>
        <TextInput
          ref={remarkRef}
          placeholder=""
          placeholderTextColor="#9AA3B2"
          selectionColor="#0B4D96"
          value={remark}
          onChangeText={setRemark}
          multiline
          style={styles.textArea}
        />

        <Text style={[styles.label, { marginTop: 12 }]}>Request <Text style={{ color: 'red' }}>*</Text></Text>
        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={exceptionTypes || []}
          maxHeight={300}
          labelField="description"
          valueField="code"
          placeholder={'Select request'}
          value={value}
          itemTextStyle={{
            color: theme.light.TextColor
          }}
          onChange={(item) => {
            setValue(item.code);
          }}
        />

        <UploadButton
          file={file}
          uploadScale={uploadScale}
          onOpen={() => onOpenUpload({ pickDocument, pickFromGallery, takePhoto })}
          onRemove={() => onRemoveFile()}
        />

        <View style={{ height: 18 }} />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { /* parent closes form */ }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

/* ============================================================
   MAIN SCREEN - RaiseException (refactored clean)
   ============================================================ */
const RaiseException = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const routes = useRoute();
  const { data, from } = routes.params || {};
  // const toast = useToast();

  const reduxData = useSelector(state => state.auth || {});
  const token = reduxData.token;
  const userProfile = reduxData.userProfile || {};

  // UI state
  const [showRaiseExcep, setShowRaiseExcep] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [uploadModalActions, setUploadModalActions] = useState(null); // { pickDocument, pickFromGallery, takePhoto }

  // form state
  const [value, setValue] = useState(null); // selected request code
  const [remark, setRemark] = useState('');
  const [file, setFile] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const amountRef = useRef(null);
  const remarkRef = useRef(null);

  const uploadScale = useRef(new Animated.Value(1)).current;
  const onUploadPressIn = useCallback(() => Animated.spring(uploadScale, { toValue: 0.97, useNativeDriver: true }).start(), [uploadScale]);
  const onUploadPressOut = useCallback(() => Animated.spring(uploadScale, { toValue: 1, friction: 6, useNativeDriver: true }).start(), [uploadScale]);

  // Use custom manager hook
  const {
    exceptionTypes,
    exceptions,
    isLoading: managerLoading,
    loadExceptions,
    submitException,
  } = useExceptionManager({ loanAccountNumber: data?.loanAccountNumber, token, userProfile, dispatch });

  // Back handler
  useEffect(() => {
    const onBack = () => {
      if (showRaiseExcep) {
        setShowRaiseExcep(false);
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', onBack);
  }, [showRaiseExcep]);

  // helpers
  const handleOpenUpload = useCallback(({ pickDocument, pickFromGallery, takePhoto }) => {
    setUploadModalActions({ pickDocument, pickFromGallery, takePhoto });
    setIsUploadModalVisible(true);
  }, []);

  const handleRemoveFile = useCallback(() => setFile(null), []);

  const handlePickDocumentFromModal = useCallback(async (actionName) => {
    setIsUploadModalVisible(false);
    try {
      if (!uploadModalActions) return;
      if (actionName === 'gallery' && uploadModalActions.pickFromGallery) {
        await uploadModalActions.pickFromGallery();
      } else if (actionName === 'camera' && uploadModalActions.takePhoto) {
        await uploadModalActions.takePhoto();
      } else if (actionName === 'document' && uploadModalActions.pickDocument) {
        await uploadModalActions.pickDocument();
      }
      // note: pickers set file via setFile closure
    } catch (e) {
      console.warn('picker action error', e);
    }
  }, [uploadModalActions]);

  // When DocumentPicker result or ImagePicker result calls setFile, ensure we normalize shape:
  useEffect(() => {
    // No-op - setFile is called from pickers directly
  }, [file]);

  // submit handler wrapper
  const handleSubmit = useCallback(async () => {
    if (!remark) {
      Alert.alert('Please enter remark');
      return;
    }
    if (!value) {
      Alert.alert('Please select request type');
      return;
    }

    setIsLoading(true);
    // dispatch(showLoader(true));
    try {
      // normalize file: if user used DocumentPicker, it returns {uri, name, type}
      // if ImagePicker returned {uri/path, name, mime}, ensure `uri` present
      const normalizedFile = file ? { uri: file.uri || file.path || file.fileCopyUri, name: file.name || file.filename || (file.path ? file.path.split('/').pop() : undefined), type: file.type || file.mime } : null;

      const res = await submitException({
        loanAccountNumber: data?.loanAccountNumber,
        remark,
        requestCode: value,
        requestDescription: exceptionTypes?.find(e => e.code === value)?.description || '',
        file: normalizedFile,
      });

      if (res?.msgKey && ['success', 'Success'].includes(res.msgKey)) {
        Alert.alert('Exception raised successfully');
        setShowRaiseExcep(false);
        setRemark('');
        setValue(null);
        setFile(null);
        loadExceptions();
      } else {
        const msg = res?.message || 'Failed to create exception';
        Alert.alert('Error', msg);
      }
    } catch (e) {
      console.warn('submitException catch', e);
      Alert.alert('Error', e?.message || 'Submission failed');
    } finally {
      setIsLoading(false);
      // dispatch(showLoader(false));
    }
  }, [remark, value, file, data?.loanAccountNumber, submitException, exceptionTypes, dispatch, loadExceptions]);

  // navigation to view
  const handlePressItem = useCallback((item) => {
    navigation.navigate('ViewException', { data: item, name: item.request });
  }, [navigation]);

  // stable key extractor
  const keyExtractor = useCallback((item) => String(item?.raiseExceptionId || item?.id || item?.exceptionId || Math.random()), []);

  // sorted exceptions newest first
  const sortedExceptions = useMemo(() => {
    return (exceptions || []).slice().sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime));
  }, [exceptions]);

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (!showRaiseExcep && from === 'caseDetails') navigation.goBack();
            else setShowRaiseExcep(false);
          }}
          style={styles.backBtn}
        >
          <MaterialIcons name="arrow-back-ios" size={24} color="#606060" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{showRaiseExcep ? 'Add Exception' : 'Raise Exception'}</Text>
      </View> */}

      <ScrollView contentContainerStyle={styles.contentContainer}>
        {showRaiseExcep ? (
          <>
            <ExceptionForm
              remark={remark}
              setRemark={setRemark}
              value={value}
              setValue={setValue}
              exceptionTypes={exceptionTypes}
              file={file}
              setFile={setFile}
              uploadScale={uploadScale}
              onOpenUpload={handleOpenUpload}
              onRemoveFile={handleRemoveFile}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              amountRef={amountRef}
              remarkRef={remarkRef}
            />

            <Modal transparent visible={isUploadModalVisible} animationType="slide" onRequestClose={() => setIsUploadModalVisible(false)}>
              <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsUploadModalVisible(false)} />
              <View style={styles.sheet}>
                <Text style={styles.sheetTitle}>Select Photo / Document</Text>
                {/* <TouchableOpacity style={styles.sheetOption} onPress={() => handlePickDocumentFromModal('gallery')}>
                  <Text style={styles.sheetOptionText}>Select from Gallery</Text>
                </TouchableOpacity> */}
                {/* <TouchableOpacity style={styles.sheetOption} onPress={() => handlePickDocumentFromModal('camera')}>
                  <Text style={styles.sheetOptionText}>Take Photo</Text>
                </TouchableOpacity>*/}
                <TouchableOpacity style={styles.sheetOption} onPress={() => handlePickDocumentFromModal('document')}>
                  <Text style={styles.sheetOptionText}>Select Document</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sheetCancel} onPress={() => setIsUploadModalVisible(false)}>
                  <Text style={styles.sheetCancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Modal>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.raiseBtn} onPress={() => setShowRaiseExcep(true)}>
              <Text style={styles.raiseBtnText}>Raise Exception</Text>
            </TouchableOpacity>

            <FlatList
              style={{ marginTop: 12 }}
              showsHorizontalScrollIndicator={false}
              data={sortedExceptions}
              keyExtractor={keyExtractor}
              renderItem={({ item }) => <ExceptionItem item={item} onPress={handlePressItem} />}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              ListEmptyComponent={() => (
                managerLoading ? (
                  <View style={styles.emptyWrap}><ActivityIndicator /></View>
                ) : (
                  <View style={styles.emptyWrap}><Text style={styles.emptyText}>No exceptions found.</Text></View>
                )
              )}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

/* ============================================================
   Styles
   ============================================================ */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    height: 60, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderBottomWidth: 0.5, borderBottomColor: '#E6E6E6', backgroundColor: '#fff'
  },
  backBtn: { width: 46, alignItems: 'flex-start' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#111827', marginLeft: 8 },

  contentContainer: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 32 },

  // raise button
  raiseBtn: {
    marginTop: 8, backgroundColor: '#001D56', borderRadius: 8, padding: 10, width: width * 0.34, alignSelf: 'flex-end', alignItems: 'center'
  },
  raiseBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // form
  formWrap: { width: '100%' },
  label: { fontSize: 14, color: '#6B7280', marginBottom: 6, fontWeight: '500' },
  textArea: {
    minHeight: 110,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    padding: 14,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E6E9EE',
  },

  dropdown: {
    backgroundColor: '#F8FAFF', borderRadius: 12, borderWidth: 1, borderColor: '#E6E9EE', paddingHorizontal: 12, height: 50, marginTop: 8,
  },
  placeholderStyle: { fontSize: 14, color: '#6B7280' },
  selectedTextStyle: { fontSize: 15, color: '#0B4D96', fontWeight: '700', marginLeft: 8 },
  inputSearchStyle: { height: 40, fontSize: 14 },
  iconStyle: { width: 20, height: 20 },

  // upload
  uploadContainer: {
    marginTop: 18, flexDirection: 'row', alignItems: 'center'
  },
  uploadButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#F8FAFF', paddingVertical: 12, paddingHorizontal: 16, minWidth: width * 0.60,
    borderWidth: 1, borderColor: '#E0E6F0', borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  uploadText: { fontSize: 15, fontWeight: '700', color: '#1D4ED8', letterSpacing: 0.3 },
  removeFileBtn: { marginLeft: 12, backgroundColor: '#FEE2E2', padding: 8, borderRadius: 50 },

  // modal sheet
  modalBackdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: 18, paddingBottom: Platform.OS === 'ios' ? 34 : 24 },
  sheetTitle: { fontSize: 16, color: '#888', fontWeight: '700', marginBottom: 12 },
  sheetOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEF2FF' },
  sheetOptionText: { fontSize: 16, color: '#888', fontWeight: '700', },
  sheetCancel: { marginTop: 8, alignItems: 'center', paddingVertical: 12 },
  sheetCancelText: { fontSize: 16, color: '#D7263D' },

  // buttons
  buttonRow: { flexDirection: 'row', marginTop: 18, alignItems: 'center' },
  cancelBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  cancelText: { color: '#374151', fontWeight: '700', fontSize: 16 },
  submitBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: '#0B4D96', alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  // cards
  cardWrap: { paddingHorizontal: 4 },
  card: { borderRadius: 14, padding: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EEF1F6', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3, marginVertical: 6 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  leftCol: { flex: 1, paddingRight: 8 },
  rightCol: { width: width * 0.28, alignItems: 'flex-end' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#0A3A78' },
  cardSub: { fontSize: 14, color: '#374151', marginTop: 6 },
  metaLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600', textTransform: 'uppercase' },
  metaText: { fontSize: 14, color: '#111827', marginTop: 4, fontWeight: '600' },

  emptyWrap: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#6B7280', fontSize: 15 },
});

export default memo(RaiseException);
