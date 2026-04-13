// Dispute.js  (single-file, refactored, clean-architecture inside same file)

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  memo,
  useMemo,
} from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  FlatList,
  Dimensions,
  TextInput,
  Platform,
  ScrollView,
  Modal,
  Alert,
  BackHandler,
  ActivityIndicator,
  KeyboardAvoidingView,
  Pressable,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
import DocumentPicker from 'react-native-document-picker';
import { Dropdown } from 'react-native-element-dropdown';
import axios from 'axios';
import moment from 'moment';
import LinearGradient from 'react-native-linear-gradient';
import ImageViewer from 'react-native-image-zoom-viewer';
import Geolocation from '@react-native-community/geolocation';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RNFS from 'react-native-fs';
import BlobUtil from 'react-native-blob-util';
import { theme } from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';
const { width, height } = Dimensions.get('window');

/* -----------------------------
   API LAYER (pure functions)
   No hooks here. Easy to test.
   ----------------------------- */
const api = {
  fetchDisputeReasons: async (token) => {
    const res = await apiClient.get(`getAllDisputeReasonMaster`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    return res.data.data;
  },

  fetchDisputesByLoan: async (loanAccountNumber, token) => {
    const res = await apiClient.get(
      `getByDisputeOrRtpLoanAccountNumber/${loanAccountNumber}`,
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      }
    );
    return res.data.data;
  },

  createDispute: async (payload, token) => {
    const res = await apiClient.post(`createDisputeOrRtp`, payload, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    return res.data;
  },

  updateMyCase: async (url, userId, loanAccountNumber, token) => {
    const res = await apiClient.put(
      `${url}/${userId}/${loanAccountNumber}`,
      {},
      {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
      }
    );
    return res.data;
  },




  // uploadEvidence: async (id, file, token) => {
  //   try {
  //     if (!id) {
  //       Alert.alert("Error", "Invalid dispute ID.");
  //       return;
  //     }

  //     if (!file) {
  //       Alert.alert("Error", "Please select a file before uploading.");
  //       return;
  //     }

  //     const fileType = file.type || "application/octet-stream";
  //     const hasExt = file.name?.includes(".");
  //     const ext = fileType.split("/")[1] || "bin";
  //     const safeName = hasExt ? file.name : `${Date.now()}.${ext}`;

  //     console.log("📤 Uploading Evidence", {
  //       id,
  //       fileName: safeName,
  //       uri: file.uri,
  //       mime: fileType,
  //     });

  //     const response = await apiClient.upload(
  //       `upload-document-dispute/${id}`,
  //       {
  //         fieldName: "disputefile",
  //         file: {
  //           uri: file.uri,
  //           name: safeName,
  //           type: fileType,
  //         },
  //         token: token || "",
  //       }
  //     );

  //     console.log("✅ Upload Evidence Response", response);
  //     return response;

  //   } catch (error) {
  //     console.error("❌ uploadEvidence FAILED", error?.message || error);
  //     Alert.alert("Upload Failed", error?.message || "Something went wrong");
  //     throw error;
  //   }
  // },

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
        `upload-document-dispute/${id}`,
        {
          fieldName: "disputefile",
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




  fetchDocument: async (documentId, token) => {
    const res = await apiClient.get(`getdocumentDisputeByDisputeOrRtpId/${documentId}`, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    return res.data;
  },

  addUserTracker: async (payload, token) => {
    const res = await apiClient.post(`addUserTracker`, payload, {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token,
      },
    });
    return res.data;
  },
};

/* -----------------------------
   Location Hook
   ----------------------------- */
const useLocation = () => {
  const [coords, setCoords] = useState({ latitude: null, longitude: null });

  const getCurrentLocation = useCallback(() => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ latitude, longitude });
      },
      (error) => {
        console.warn('Error getting locationDispute:', error?.message);
        // minimal retry strategy
        setTimeout(() => {
          Geolocation.getCurrentPosition(
            (pos) => setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
            () => { }, // ignore repeated failures silently
            { timeout: 5000, maximumAge: 10000 }
          );
        }, 1000);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 10000 }
    );
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return { coords, refresh: getCurrentLocation };
};

/* -----------------------------
   Dispute Manager Hook
   Encapsulates state + business logic
   ----------------------------- */
const useDisputeManager = ({ loanAccountNumber, token, userProfile }) => {
  const [disputes, setDisputes] = useState([]);
  const [disputeReasons, setDisputeReasons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const isDark = theme.mode === "dark";   // adjust based on your app
  const { coords, refresh: refreshLocation } = useLocation();

  const loadDisputeReasons = useCallback(async () => {
    try {
      setIsLoading(true);
      const reasons = await api.fetchDisputeReasons(token);
      setDisputeReasons(reasons || []);
    } catch (e) {
      console.warn('loadDisputeReasons error', e);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const loadDisputes = useCallback(async () => {
    if (!loanAccountNumber) {
      setDisputes([]);
      return;
    }
    try {
      setIsLoading(true);
      const data = await api.fetchDisputesByLoan(loanAccountNumber, token);
      setDisputes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn('loadDisputes error', e);
    } finally {
      setIsLoading(false);
    }
  }, [loanAccountNumber, token]);

  // helper to compute the URL for updating case based on roles/activity
  const computeUpdateUrl = useCallback(
    (currentRoles, userProfileActivity) => {
      const role = currentRoles?.[0];
      if (role === 'CA') return 'updateMyCaseForInProcessForCA';
      if (role === 'FA' && userProfileActivity === 'Calling') return 'updateMyCaseForInProcessForCA';
      if (role === 'FA' && userProfileActivity === 'Field') return 'updateMyCaseForInProcessForDRA';
      if (role === 'DRA') return 'updateMyCaseForInProcessForDRA';
      if (userProfileActivity === 'Field') return 'updateMyCaseForInProcessField';
      return 'updateMyCaseForInProcess';
    },
    []
  );

  const submitDispute = useCallback(
    async ({
      amount,
      disputeReason,
      disputeType,
      remark,
      file,
    }) => {
      if (!amount || !disputeReason || !remark) {
        throw new Error('Validation: amount, reason and remark are required');
      }

      setSubmitLoading(true);
      try {
        const payload = {
          amount,
          disputeReason,
          disputeType,
          loanAccountNumber,
          remark,
          status: 'Approved',
          isDocument: file ? 'yes' : 'No',
          user: { userId: userProfile.userId },
          geoCoordinates: `${coords.latitude || ''},${coords.longitude || ''}`,
        };

        const createRes = await api.createDispute(payload, token);

        // if success do follow ups - update case and upload evidence if present
        if (['success', 'Success'].includes(createRes?.msgKey)) {
          const disputeId = createRes?.data?.disputeOrRtpId;
          const updateUrl = computeUpdateUrl(
            userProfile?.role?.map((r) => r?.roleCode) || [],
            userProfile?.activityType
          );
          // update case (best-effort)
          try {
            await api.updateMyCase(updateUrl, userProfile?.userId, loanAccountNumber, token);
          } catch (e) {
            console.warn('update my case failed', e);
          }

          if (file && disputeId) {
            try {
              await api.uploadEvidence(disputeId, file, token);
            } catch (e) {
              console.warn('evidence upload failed', e);
              // don't block user: notify but continue
            }
          }

          // track location afterwards (non-blocking)
          (async () => {
            try {
              const GOOGLE_MAPS_APIKEY = 'AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE'; // keep or move to env
              let areaName = null;
              if (coords.latitude && coords.longitude) {
                const geocodeResponse = await axios.get(
                  `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_APIKEY}`
                );
                if (geocodeResponse.data.results?.length) {
                  areaName = geocodeResponse.data.results[0].formatted_address;
                }
              }

              const trackerPayload = {
                userId: userProfile?.userId,
                activity: 'Dispute/RTP',
                activityId: createRes?.data?.disputeOrRtpId,
                coordinates: `${coords.latitude || ''},${coords.longitude || ''}`,
                areaName,
                lan: loanAccountNumber?.toString(),
                customerAddress: null,
                addressType: null,
                addressCoordinates: null,
                differenceInKm: null,
                exception: null,
              };

              await api.addUserTracker(trackerPayload, token);
            } catch (e) {
              console.warn('track location error', e);
            }
          })();

          // refresh disputes list
          await loadDisputes();
          return createRes;
        } else {
          return createRes;
        }
      } finally {
        setSubmitLoading(false);
      }
    },
    [coords.latitude, coords.longitude, computeUpdateUrl, loadDisputes, loanAccountNumber, token, userProfile]
  );

  useEffect(() => {
    loadDisputeReasons();
    loadDisputes();
  }, [loadDisputeReasons, loadDisputes]);

  return {
    disputes,
    disputeReasons,
    isLoading,
    submitLoading,
    loadDisputes,
    loadDisputeReasons,
    submitDispute,
    refreshLocation,
  };
};

/* -----------------------------
   UI Subcomponents (memoized)
   ----------------------------- */

const DisputeItem = memo(function DisputeItem({ item, onPress }) {
  const date = useMemo(
    () => moment(item.createdTime).format("DD-MM-YYYY"),
    [item.createdTime]
  );
  const time = useMemo(
    () => moment(item.createdTime).format("LT"),
    [item.createdTime]
  );

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onPress(item)}
      style={styles.listItemWrap}
    >
      <LinearGradient
        colors={["#FFFFFF", "#F8F9FB"]}
        style={styles.listCard}
      >
        {/* Row 1 : Reason + Date (perfect alignment) */}
        <View style={styles.listRow}>
          <View style={styles.leftCol}>
            <Text style={styles.listTitle}>{item.disputeType} Reason</Text>
            <Text style={styles.listSubtitle} numberOfLines={2}>
              {item.disputeReason}
            </Text>
          </View>

          <View style={styles.rightCol}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaText}>{date}</Text>
          </View>
        </View>

        {/* Row 2 : Name + Time */}
        <View style={styles.listRow}>
          <View style={styles.leftCol}>
            <Text style={styles.metaLabel}>Name</Text>
            <Text style={styles.metaText} numberOfLines={2}>
              {item.user?.firstName} {item.user?.lastName}
            </Text>
          </View>

          <View style={styles.rightCol}>
            <Text style={styles.metaLabel}>Time</Text>
            <Text style={styles.metaText}>{time}</Text>
          </View>
        </View>

        {/* Row 3 : Remarks + Dispute Type */}
        <View style={styles.listRow}>
          <View style={styles.leftCol}>
            <Text style={styles.metaLabel}>Remarks</Text>
            <Text style={styles.metaText} numberOfLines={2}>
              {item.remark}
            </Text>
          </View>

          <View style={styles.rightCol}>
            <Text style={styles.metaLabel}>Dispute Type</Text>
            <Text style={styles.metaText} numberOfLines={2}>
              {item.disputeType}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const AddDisputeForm = memo(
  ({
    amount,
    setAmount,
    recordType,
    setRecordType,
    disputeReasonValue,
    setDisputeReasonValue,
    disputeReasons,
    remark,
    setRemark,
    file,
    setFile,
    isModalVisible,
    setIsModalVisible,
    onSubmit,
    loading,
    uploadScale,
    onUploadPressIn,
    onUploadPressOut,
    openUploadModal,
    removeUploadedFile,
    amountRef,
    remarkRef,
  }) => {
    const pickDocument = useCallback(async () => {
      try {
        const results = await DocumentPicker.pickSingle({
          type: [DocumentPicker.types.images],
        });
        setFile(results);
        setIsModalVisible(false);
      } catch (err) {
        if (!DocumentPicker.isCancel(err)) {
          console.warn('DocumentPicker error:', err);
        }
      }
    }, [setFile, setIsModalVisible]);

    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView keyboardShouldPersistTaps="handled" style={styles.formWrap}>
          <Text style={styles.label}>
            Amount <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TextInput
            ref={amountRef}
            placeholder=""
            placeholderTextColor="#9AA3B2"
            selectionColor="#0B4D96"
            value={amount}
            onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
            keyboardType="phone-pad"
            returnKeyType="next"
            onSubmitEditing={() => remarkRef.current?.focus()}
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 12 }]}>
            Record <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <View style={styles.segmentRow}>
            <Pressable
              accessibilityRole="button"
              onPress={() => setRecordType(0)}
              style={[styles.segmentBtn, recordType === 0 && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentText, recordType === 0 && styles.segmentTextActive]}>RTP</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setRecordType(1)}
              style={[styles.segmentBtn, recordType === 1 && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentText, recordType === 1 && styles.segmentTextActive]}>Dispute</Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { marginTop: 12 }]}>
            Reason <Text style={{ color: 'red' }}>*</Text>
          </Text>


          <Dropdown
            style={[
              styles.dropdown,
              // isDark && {
              //   backgroundColor: theme.dark.searchContainerColor,
              //   borderColor: theme.dark.searchContainerBorder
              // }
            ]}

            placeholderStyle={[
              styles.placeholderStyle,
              // { color: isDark ? theme.dark.searchPlaceHolderText : theme.light.searchPlaceHolderText }
            ]}

            selectedTextStyle={[
              styles.selectedTextStyle,
              // { color: isDark ? theme.dark.TextColor : theme.light.TextColor }
            ]}

            itemTextStyle={{
              color: theme.light.TextColor
            }}

            inputSearchStyle={[
              styles.inputSearchStyle,
              // { color: isDark ? theme.dark.TextColor : theme.light.TextColor }
            ]}

            iconStyle={styles.iconStyle}

            data={disputeReasons}
            maxHeight={300}
            labelField="description"
            valueField="code"
            placeholder="Select reason"
            value={disputeReasonValue}
            onChange={(item) => setDisputeReasonValue(item.code)}
          />



          <Text style={[styles.label, { marginTop: 18 }]}>
            Remarks <Text style={{ color: 'red' }}>*</Text>
          </Text>
          <TextInput
            ref={remarkRef}
            placeholder=""
            placeholderTextColor="#9AA3B2"
            selectionColor="#0B4D96"
            multiline
            onChangeText={(t) => setRemark(t)}
            style={[styles.input, styles.textArea]}
            value={remark}
          />

          <View style={styles.uploadContainer}>
            <Animated.View style={{ transform: [{ scale: uploadScale }] }}>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={openUploadModal}
                onPressIn={onUploadPressIn}
                onPressOut={onUploadPressOut}
                style={styles.uploadButton}
              >
                <MaterialIcons
                  name="cloud-upload"
                  size={22}
                  style={styles.uploadIcon}
                />
                <Text style={styles.uploadText}>
                  {file ? (file.name || "Uploaded") : "Upload Evidence"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Remove file button */}
            {file && (
              <TouchableOpacity style={styles.removeFileBtn} onPress={removeUploadedFile}>
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color="#B91C1C"
                />
              </TouchableOpacity>
            )}
          </View>


          <Modal transparent visible={isModalVisible} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
            <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setIsModalVisible(false)} />
            <View style={styles.sheet}>
              <Text style={styles.sheetTitle}>Select Photo / Document</Text>
              <TouchableOpacity style={styles.sheetOption} onPress={pickDocument}>
                <Text style={styles.sheetOptionText}>Select from Gallery</Text>
              </TouchableOpacity>
              {/* <TouchableOpacity style={styles.sheetOption} onPress={pickDocument}>
                <Text style={styles.sheetOptionText}>Take Photo</Text>
              </TouchableOpacity> */}

              <TouchableOpacity style={styles.sheetCancel} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => { /* parent will close form */ }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.submitBtn}
              onPress={onSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
);

/* -----------------------------
   MAIN SCREEN
   ----------------------------- */

const Dispute = () => {
  const navigation = useNavigation();
  const routes = useRoute();
  const dispatch = useDispatch();

  const { data } = routes.params || {};
  const loanAccountNumber = data?.loanAccountNumber;

  const token = useSelector((s) => s.auth.token);
  const userProfile = useSelector((s) => s.auth.userProfile || {});

  // local UI state for AddForm modal toggle & document viewer
  const [addRecord, setAddRecord] = useState(false);
  const [documentVisible, showDocument] = useState(false);
  const [documentImage, setDocumentImage] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // form states (lifted to screen for demo; still managed cleanly)
  const [amount, setAmount] = useState('');
  const [recordType, setRecordType] = useState(0); // 0 RTP, 1 Dispute
  const [disputeReasonValue, setDisputeReasonValue] = useState('');
  const [remark, setRemark] = useState('');
  const [file, setFile] = useState(null);
  console.log(file, 'filefilefile')
  const amountRef = useRef(null);
  const remarkRef = useRef(null);

  const uploadScale = useRef(new Animated.Value(1)).current;

  const onUploadPressIn = useCallback(() => {
    Animated.spring(uploadScale, { toValue: 0.97, useNativeDriver: true }).start();
  }, [uploadScale]);

  const onUploadPressOut = useCallback(() => {
    Animated.spring(uploadScale, { toValue: 1, friction: 6, useNativeDriver: true }).start();
  }, [uploadScale]);

  const openUploadModal = useCallback(() => setIsModalVisible(true), []);
  const removeUploadedFile = useCallback(() => setFile(null), []);

  // Dispute manager hook
  const {
    disputes,
    disputeReasons,
    isLoading,
    submitLoading,
    loadDisputes,
    submitDispute,
    refreshLocation,
  } = useDisputeManager({ loanAccountNumber, token, userProfile });

  // Back handler
  useEffect(() => {
    const handleBack = () => {
      if (addRecord) {
        setAddRecord(false);
        return true;
      }
      return false;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => BackHandler.removeEventListener('hardwareBackPress', handleBack);
  }, [addRecord]);

  // mount behavior
  useEffect(() => {
    // ensure we refresh list when token or loan changes
    if (loanAccountNumber && token) {
      loadDisputes();
    }
  }, [loanAccountNumber, token, loadDisputes]);

  // navigation to view dispute
  const handlePressItem = useCallback(
    (item) => {
      navigation.navigate('ViewDispute', { data: item, name: item.disputeReason });
    },
    [navigation]
  );

  // form submission wrapper
  const onSubmitForm = useCallback(async () => {
    // basic validation & friendly alerts
    if (!amount) {
      Alert.alert('Error', 'Please enter amount');
      return;
    }
    if (!disputeReasonValue) {
      Alert.alert('Error', 'Please select reason');
      return;
    }
    if (!remark) {
      Alert.alert('Error', 'Please enter remarks');
      return;
    }

    try {
      const res = await submitDispute({
        amount,
        disputeReason: disputeReasonValue,
        disputeType: recordType === 0 ? 'RTP' : 'Dispute',
        remark,
        file,
      });

      if (res?.msgKey && ['success', 'Success'].includes(res.msgKey)) {
        Alert.alert('Success', 'Dispute/RTP raised successfully');
        // reset form
        setAmount('');
        setDisputeReasonValue('');
        setRemark('');
        setFile(null);
        setAddRecord(false);
      } else {
        Alert.alert('Error', res?.message || 'Something went wrong');
      }
    } catch (e) {
      Alert.alert('Error', e.message || 'Submission failed');
    }
  }, [amount, disputeReasonValue, recordType, remark, file, submitDispute]);

  // key extractor stable
  const keyExtractor = useCallback((item) => String(item.disputeOrRtpId || item.id || item.disputeId || ''), []);

  // render item
  const renderDisputeItem = useCallback(
    ({ item }) => <DisputeItem item={item} onPress={handlePressItem} />,
    [handlePressItem]
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {addRecord ? (
          <AddDisputeForm
            amount={amount}
            setAmount={setAmount}
            recordType={recordType}
            setRecordType={setRecordType}
            disputeReasonValue={disputeReasonValue}
            setDisputeReasonValue={setDisputeReasonValue}
            disputeReasons={disputeReasons}
            remark={remark}
            setRemark={setRemark}
            file={file}
            setFile={setFile}
            isModalVisible={isModalVisible}
            setIsModalVisible={setIsModalVisible}
            onSubmit={onSubmitForm}
            loading={submitLoading}
            uploadScale={uploadScale}
            onUploadPressIn={onUploadPressIn}
            onUploadPressOut={onUploadPressOut}
            openUploadModal={openUploadModal}
            removeUploadedFile={removeUploadedFile}
            amountRef={amountRef}
            remarkRef={remarkRef}
          />
        ) : (
          <>
            <View style={styles.addButtonWrap}>
              <TouchableOpacity style={styles.addBtn} onPress={() => setAddRecord(true)}>
                <Text style={styles.addBtnText}>Add Dispute / RTP</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={disputes}
              renderItem={renderDisputeItem}
              keyExtractor={keyExtractor}
              contentContainerStyle={{ paddingBottom: 80 }}
              ListEmptyComponent={() =>
                isLoading ? (
                  <View style={styles.emptyWrap}>
                    <ActivityIndicator />
                  </View>
                ) : (
                  <View style={styles.emptyWrap}>
                    <Text style={styles.emptyText}>No disputes found.</Text>
                  </View>
                )
              }
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}

        <Modal visible={documentVisible} transparent>
          <View style={styles.fullscreenModal}>
            <TouchableOpacity style={styles.closeDocBtn} onPress={() => showDocument(false)}>
              <MaterialCommunityIcons name="close-circle" size={36} color="#fff" />
            </TouchableOpacity>
            <ImageViewer imageUrls={documentImage} style={{ flex: 1 }} />
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  contentContainer: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 32 },

  // Add form
  formWrap: { width: '100%' },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F6F8FA',
    borderWidth: 1,
    borderColor: '#E6E9EE',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#111827',
  },
  textArea: { minHeight: 100, textAlignVertical: 'top' },

  // segmented control
  segmentRow: { flexDirection: 'row', marginTop: 6 },
  segmentBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  segmentBtnActive: {
    backgroundColor: "#0046A5",
    shadowColor: "#0046A5",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { height: 2, width: 0 },
  },
  segmentText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
  },
  segmentTextActive: { color: "#FFFFFF", },

  dropdown: {
    backgroundColor: '#F6F8FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8E0',
    paddingHorizontal: 8,
    height: 50,
    color: '#888'
  },
  placeholderStyle: { fontSize: 14, color: '#6B7280' },
  selectedTextStyle: { fontSize: 15, color: '#0B4D96' },
  iconStyle: { width: 20, height: 20 },
  inputSearchStyle: { height: 40, fontSize: 14 },

  uploadContainer: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
  },

  uploadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#F8FAFF",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minWidth: width * 0.60,

    borderWidth: 1,
    borderColor: "#E0E6F0",
    borderRadius: 14,

    // Soft shadow (premium UI)
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },

  uploadIcon: {
    marginRight: 8,
    color: "#1D4ED8",
  },

  uploadText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1D4ED8",
    letterSpacing: 0.3,
  },

  removeFileBtn: {
    marginLeft: 12,
    backgroundColor: "#FEE2E2",
    padding: 8,
    borderRadius: 50,
  },

  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    padding: 18,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#888', marginBottom: 12 },
  sheetOption: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEF2FF' },
  sheetOptionText: { fontSize: 16, fontWeight: '700', color: '#888', },
  sheetCancel: { marginTop: 8, alignItems: 'center', paddingVertical: 12 },
  sheetCancelText: { fontSize: 16, color: '#D7263D' },

  buttonRow: { flexDirection: 'row', marginTop: 18, alignItems: 'center' },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  cancelText: { color: '#111827', fontWeight: '800', fontSize: 16 },
  submitBtn: {
    flex: 1,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#0B4D96',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // list
  addButtonWrap: { alignItems: 'flex-end', marginBottom: 12 },
  addBtn: {
    backgroundColor: '#001D56',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  listItemWrap: { paddingHorizontal: 4 },

  listCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",

    // Soft shadow like CRED
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,

    borderWidth: 1,
    borderColor: "#EEF1F6",
  },

  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },

  listTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0A3A78",
    letterSpacing: 0.3,
  },

  listSubtitle: {
    fontSize: 15,
    color: "#374151",
    marginTop: 6,
    lineHeight: 20,
  },

  metaCol: {
    width: width * 0.30,
    alignItems: "flex-end",
  },

  metaLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  metaText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    marginTop: 4,
  },

  // section separator subtle line
  separatorLine: {
    height: 1,
    backgroundColor: "#EDEFF3",
    marginVertical: 8,
  },

  remarksSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  leftCol: {
    flex: 1,
  },

  rightCol: {
    width: width * 0.30,
    alignItems: "flex-end",
  },

  listRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",   // ensures PERFECT SAME-LINE alignment
    marginTop: 12,
  },

  listCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEF1F6",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  listTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0A3A78",
  },
  listSubtitle: {
    fontSize: 15,
    color: "#374151",
    marginTop: 6,
    lineHeight: 20,
  },

  metaLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  metaText: {
    fontSize: 14,
    color: "#111827",
    marginTop: 4,
    fontWeight: "600",
  },

});

export default memo(Dispute);
