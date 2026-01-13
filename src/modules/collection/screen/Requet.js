// Request.js — single-file clean refactor (DocumentPicker only)

import React, { useCallback, useEffect, useMemo, useRef, useState, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  FlatList,
  Dimensions,
  ActivityIndicator,
  BackHandler,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import DocumentPicker from "react-native-document-picker";
import { Dropdown } from "react-native-element-dropdown";
import axios from "axios";
import LinearGradient from "react-native-linear-gradient";
import moment from "moment";
import Geolocation from "@react-native-community/geolocation";

import BlobUtil from "react-native-blob-util";
// import { showLoader } from "../redux/action";
// import { useToast } from "native-base";
// import ToastNotification from "../components/ToastAlert";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { theme } from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';

const { width, height } = Dimensions.get("window");

/* ===========================
   API LAYER (pure functions)
   =========================== */
const RequestAPI = {
  getAllRequestTypes: async (token) => {
    const res = await apiClient.get(`${BASE_URL}getAllRequestType`, {
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return res.data?.data || [];
  },

  getByLoanRequests: async (loanAccountNumber, token) => {
    const res = await apiClient.get(`${BASE_URL}getByRequestLoanAccountNumber/${loanAccountNumber}`, {
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return res.data?.data || [];
  },

  createRequest: async (payload, token) => {
    const res = await apiClient.post(`${BASE_URL}createRequest`, payload, {
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
        `upload-document-request/${id}`,
        {
          fieldName: "rfile",
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
    const res = await apiClient.put(`${BASE_URL}${url}/${userId}/${loanAccountNumber}`, {}, {
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  addUserTracker: async (payload, token) => {
    const res = await apiClient.post(`${BASE_URL}addUserTracker`, payload, {
      headers: { Accept: "application/json", "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    });
    return res.data;
  },
};

/* ===========================
   useLocation Hook
   =========================== */
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
        // retry once after short delay (non-blocking)
        setTimeout(() => {
          Geolocation.getCurrentPosition(
            (pos) => mounted.current && setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
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

/* ===========================
   useRequestManager Hook
   =========================== */
const useRequestManager = ({ loanAccountNumber, token, userProfile }) => {
  const [requestTypes, setRequestTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { coords } = useLocation();

  const loadRequestTypes = useCallback(async (screenName) => {
    try {
      setLoading(true);
      const data = await RequestAPI.getAllRequestTypes(token);
      // If caller needs filtering by screenName it's done externally; return raw by default
      setRequestTypes(data || []);
    } catch (e) {
      console.warn("loadRequestTypes", e);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadRequests = useCallback(async () => {
    if (!loanAccountNumber) return setRequests([]);
    try {
      setLoading(true);
      const data = await RequestAPI.getByLoanRequests(loanAccountNumber, token);
      setRequests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.warn("loadRequests", e);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [loanAccountNumber, token]);

  const computeUpdateUrl = useCallback((roles, activityType) => {
    const role = roles?.[0];
    if (role === "CA") return "updateMyCaseForInProcessForCA";
    if (role === "FA" && activityType === "Calling") return "updateMyCaseForInProcessForCA";
    if (role === "FA" && activityType === "Field") return "updateMyCaseForInProcessForDRA";
    if (role === "DRA") return "updateMyCaseForInProcessForDRA";
    if (activityType === "Field") return "updateMyCaseForInProcessField";
    return "updateMyCaseForInProcess";
  }, []);

  const submitRequest = useCallback(async ({ payload, file }) => {
    if (!payload) throw new Error("Payload missing");
    setLoading(true);
    try {
      const res = await RequestAPI.createRequest(payload, token);
      const createdId = res?.data?.requestId;

      // update case (best-effort)
      try {
        const url = computeUpdateUrl(userProfile?.role?.map(r => r.roleCode), userProfile?.activityType);
        await RequestAPI.updateMyCase(url, userProfile?.id || userProfile?.userId, payload.loanAccountNumber, token);
      } catch (e) {
        console.warn("updateMyCase failed", e);
      }

      // upload evidence if present
      if (file && createdId) {
        try {
          await RequestAPI.uploadEvidence(createdId, file, token);
        } catch (e) {
          console.warn("evidence upload failed", e);
        }
      }

      // fire user tracker async (non-blocking)
      (async () => {
        try {
          let areaName = null;
          if (coords.latitude && coords.longitude) {
            const GOOGLE_MAPS_APIKEY = "AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE";
            const geo = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_APIKEY}`
            );
            if (geo.data?.results?.length) areaName = geo.data.results[0].formatted_address;
          }

          const trackerPayload = {
            userId: userProfile?.id || userProfile?.userId,
            activity: "Request",
            activityId: createdId,
            coordinates: `${coords.latitude || ""},${coords.longitude || ""}`,
            areaName,
            lan: payload.loanAccountNumber?.toString(),
          };

          await RequestAPI.addUserTracker(trackerPayload, token);
        } catch (e) {
          console.warn("tracker error", e);
        }
      })();

      // refresh list
      await loadRequests();
      return res;
    } finally {
      setLoading(false);
    }
  }, [computeUpdateUrl, coords.latitude, coords.longitude, loadRequests, token, userProfile]);

  useEffect(() => {
    loadRequestTypes();
    loadRequests();
  }, [loadRequestTypes, loadRequests]);

  return {
    requestTypes,
    requests,
    loading,
    loadRequestTypes,
    loadRequests,
    submitRequest,
  };
};

/* ===========================
   UI Components (memoized)
   =========================== */

const RequestCard = memo(({ item, onPress, getName }) => {
  const date = useMemo(() => moment(item.createdTime).format("DD-MM-YYYY"), [item.createdTime]);
  const time = useMemo(() => moment(item.createdTime).format("LT"), [item.createdTime]);

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={() => onPress(item)} style={styles.cardWrap}>
      <LinearGradient colors={["#FFFFFF", "#F8F9FB"]} style={styles.card}>
        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.cardTitle}>Request</Text>
            <Text style={styles.cardSubtitle} numberOfLines={2}>
              {getName(item.requestType) || item.requestType}
            </Text>
          </View>

          <View style={styles.cardMeta}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaText}>{date}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.cardLeft}>
            <Text style={styles.metaLabel}>Name</Text>
            <Text style={styles.metaText}>{item.user?.firstName} {item.user?.lastName}</Text>
          </View>

          <View style={styles.cardMeta}>
            <Text style={styles.metaLabel}>Time</Text>
            <Text style={styles.metaText}>{time}</Text>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={[styles.cardLeft, { flex: 1.2 }]}>
            <Text style={styles.metaLabel}>Remarks</Text>
            <Text style={styles.metaText} numberOfLines={2}>{item.remark}</Text>
          </View>

          <View style={styles.cardMeta}>
            <Text style={styles.metaLabel}>Status</Text>
            <Text style={[styles.metaText, { color: item.status === "Pending" ? "orange" : item.status === "Approved" ? "green" : "#111827" }]}>
              {item.status}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
});

const UploadBox = memo(({ file, onOpenPicker, onRemove }) => {
  return (
    <View style={styles.uploadContainer}>
      <TouchableOpacity onPress={onOpenPicker} style={styles.uploadButton}>
        <MaterialIcons name="cloud-upload" size={20} color="#1D4ED8" style={{ marginRight: 8 }} />
        <Text style={styles.uploadText}>{file ? (file.name || "Uploaded") : "Upload Evidence"}</Text>
      </TouchableOpacity>

      {file && (
        <TouchableOpacity onPress={onRemove} style={styles.removeFileBtn}>
          <MaterialCommunityIcons name="close-circle" size={22} color="#D7263D" />
        </TouchableOpacity>
      )}
    </View>
  );
});

const RequestForm = memo(({
  values,
  setValues,
  newName, setNewName,
  newContact, setNewContact,
  newHomeSecAddress, setNewHomeSecAddress,
  newOfcSecAddress, setNewOfcSecAddress,
  remark, setRemark,
  selectedType, setSelectedType,
  requestTypes,
  file, setFile,
  onOpenDocumentPicker,
  onRemoveFile,
  onSubmit,
  loading
}) => {
  // Render conditional fields based on selectedType (similar to your original logic)
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" style={styles.formWrap}>
        <Text style={styles.label}>Request <Text style={{ color: "red" }}>*</Text></Text>

        <Dropdown
          style={styles.dropdown}
          placeholderStyle={styles.placeholderStyle}
          selectedTextStyle={styles.selectedTextStyle}
          inputSearchStyle={styles.inputSearchStyle}
          iconStyle={styles.iconStyle}
          data={requestTypes || []}
          maxHeight={400}
          labelField="description"
          valueField="code"
          placeholder={"Select request"}
          value={selectedType}
          itemTextStyle={{
            color: theme.light.TextColor
          }}
          onChange={(item) => {
            setSelectedType(item.code);
            // keep values.description for UI use if needed
            setValues(item.description);
          }}
        />

        {/* Conditional fields */}
        {selectedType === "NC01" && (
          <>
            <Text style={styles.fieldLabel}>Old Name</Text>
            <TextInput style={styles.inputDisabled} value={values?.oldValue || ""} editable={false} />
            <Text style={styles.fieldLabel}>New Name <Text style={{ color: "red" }}>*</Text></Text>
            <TextInput style={styles.input} placeholder="" value={newName} onChangeText={setNewName} />
          </>
        )}

        {selectedType === "NC02" && (
          <>
            <Text style={styles.fieldLabel}>Old Contact</Text>
            <TextInput style={styles.inputDisabled} value={values?.oldValue || ""} editable={false} />
            <Text style={styles.fieldLabel}>New Contact <Text style={{ color: "red" }}>*</Text></Text>
            <TextInput style={styles.input} placeholder="" value={newContact} onChangeText={setNewContact} keyboardType="phone-pad" maxLength={10} />
          </>
        )}

        {selectedType === "NC" && (
          <>
            <Text style={styles.fieldLabel}>Exception Request <Text style={{ color: "red" }}>*</Text></Text>
            <Dropdown
              style={styles.dropdown}
              placeholderStyle={styles.placeholderStyle}
              selectedTextStyle={styles.selectedTextStyle}
              data={[{ id: 1, name: "Home Secondary Address" }, { id: 2, name: "Office Secondary Address" }]}
              labelField="name"
              valueField="id"
              placeholder="Select request"
              itemTextStyle={{
                color: theme.light.TextColor
              }}


              onChange={(item) => setValues(item.name)}
            />
            <Text style={styles.fieldLabel}>Old Address</Text>
            <TextInput style={styles.inputDisabled} value={values?.oldValue || ""} editable={false} />
            <Text style={styles.fieldLabel}>New Address <Text style={{ color: "red" }}>*</Text></Text>
            <TextInput style={styles.input} placeholder="" value={newHomeSecAddress} onChangeText={setNewHomeSecAddress} />
          </>
        )}

        <Text style={styles.fieldLabel}>Remarks <Text style={{ color: "red" }}>*</Text></Text>
        <TextInput style={[styles.input, styles.textArea]} value={remark} onChangeText={setRemark} multiline />

        <UploadBox file={file} onOpenPicker={onOpenDocumentPicker} onRemove={onRemoveFile} />

        <View style={{ height: 18 }} />

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => { /* parent closes form */ }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.submitBtn} onPress={onSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit</Text>}
          </TouchableOpacity>
        </View>

        <View style={{ height: 24 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

/* ===========================
   MAIN SCREEN
   =========================== */
const Request = () => {
  const navigation = useNavigation();
  const routes = useRoute();
  const dispatch = useDispatch();
  // const toast = useToast();

  const { data, from, screennn } = routes.params || {};
  const reduxData = useSelector((s) => s.auth || {});
  const token = reduxData.token;
  const userProfile = reduxData.userProfile || {};

  // UI / form state
  const [showRaise, setShowRaise] = useState(false);
  const [isPickerVisible, setIsPickerVisible] = useState(false);

  const [selectedType, setSelectedType] = useState(null);
  const [values, setValues] = useState(""); // description or helper payload
  const [newName, setNewName] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newHomeSecAddress, setNewHomeSecAddress] = useState("");
  const [newOfcSecAddress, setNewOfcSecAddress] = useState("");
  const [remark, setRemark] = useState("");
  const [file, setFile] = useState(null);

  const [loading, setLoading] = useState(false);

  const { coords, refresh: refreshLocation } = useLocation();

  const { requestTypes, requests, loading: managerLoading, submitRequest, loadRequests } = useRequestManager({
    loanAccountNumber: data?.loanAccountNumber,
    token,
    userProfile,
  });

  // Back handler
  useEffect(() => {
    const onBack = () => {
      if (showRaise) {
        setShowRaise(false);
        return true;
      }
      return false;
    };
    BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => BackHandler.removeEventListener("hardwareBackPress", onBack);
  }, [showRaise]);

  useEffect(() => {
    // refresh whenever showRaise toggles or screen mounts
    loadRequests();
  }, [showRaise, loadRequests]);

  // DocumentPicker (gallery/documents only)
  const openDocumentPicker = useCallback(async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.images, DocumentPicker.types.pdf, DocumentPicker.types.plainText],
      });
      // normalize file object
      setFile({
        uri: res.uri,
        name: res.name || res.uri.split("/").pop(),
        type: res.type,
        size: res.size,
      });
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // user cancelled
        return;
      } else {
        console.warn("DocumentPicker error", err);
        Alert.alert("Error", "Unable to pick document");
      }
    }
  }, []);

  const removeFile = useCallback(() => setFile(null), []);

  // Helper: compute readable request name from code or description
  const getName = useCallback((requestCode) => {
    const types = requestTypes || [];
    const match = types.find((t) => t.code === requestCode || t.description === requestCode);
    return match?.description || requestCode;
  }, [requestTypes]);

  // Live location tracking helper (non-blocking)
  const liveLocationTracking = useCallback(async (activityId) => {
    try {
      if (!activityId || !reduxData?.id) return;
      let areaName = null;
      if (coords.latitude && coords.longitude) {
        const GOOGLE_MAPS_APIKEY = "AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE";
        const geo = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_APIKEY}`
        );
        if (geo.data?.results?.length) areaName = geo.data.results[0].formatted_address;
      }

      const trackerPayload = {
        userId: reduxData?.id,
        activity: "Request",
        activityId,
        coordinates: `${coords.latitude || ""},${coords.longitude || ""}`,
        areaName,
        lan: data?.loanAccountNumber?.toString(),
      };

      await RequestAPI.addUserTracker(trackerPayload, token);
    } catch (e) {
      console.warn("liveLocationTracking error", e);
    }
  }, [coords.latitude, coords.longitude, reduxData?.id, data?.loanAccountNumber, token]);

  // Submit wrapper
  const handleSubmit = useCallback(async () => {
    // basic validation: request type + remark + conditional fields
    if (!selectedType) {
      Alert.alert("Validation", "Please select request type");
      return;
    }
    if (!remark) {
      Alert.alert("Validation", "Please enter remarks");
      return;
    }

    // additional validations for certain types
    if (selectedType === "NC01" && !newName) {
      Alert.alert("Validation", "Please enter new name");
      return;
    }
    if (selectedType === "NC02" && !newContact) {
      Alert.alert("Validation", "Please enter new contact");
      return;
    }
    if (selectedType === "NC" && !newHomeSecAddress && !newOfcSecAddress) {
      Alert.alert("Validation", "Please enter new address");
      return;
    }

    setLoading(true);
    // dispatch(showLoader(true));
    try {
      const payload = {
        requestType: selectedType,
        oldValue:
          selectedType === "NC01" ? data.name :
            selectedType === "NC02" ? data.mobile :
              selectedType === "NC" && values === "Home Secondary Address" ? data.secondaryAddress : data.officeAddress2,
        newValue:
          selectedType === "NC01" ? newName :
            selectedType === "NC02" ? newContact :
              selectedType === "NC" && values === "Home Secondary Address" ? newHomeSecAddress : newOfcSecAddress,
        addressType: values === "Home Secondary Address" ? "Home Secondary Address" : "Office Secondary Address",
        remark,
        isDocument: file ? "yes" : "No",
        loanAccountNumber: data?.loanAccountNumber,
        status: "Pending", // backend determines final status based on role; keep Pending here
        user: reduxData?.userProfile,
        geoCoordinates: `${coords.latitude || ""},${coords.longitude || ""}`,
      };

      const res = await submitRequest({ payload, file });
      const createdId = res?.data?.requestId || res?.data?.requestId;

      // location tracking
      if (createdId) liveLocationTracking(createdId);

      // success UI
      Alert.alert("Success", "Request raised successfully");
      setShowRaise(false);
      // reset form
      setSelectedType(null);
      setValues("");
      setNewName("");
      setNewContact("");
      setNewHomeSecAddress("");
      setNewOfcSecAddress("");
      setRemark("");
      setFile(null);

      // refresh list
      await loadRequests();
    } catch (e) {
      console.warn("submitRequest error", e);
      Alert.alert("Error", e?.message || "Unable to raise request");
    } finally {
      setLoading(false);
      // dispatch(showLoader(false));
    }
  }, [
    selectedType, remark, newName, newContact, newHomeSecAddress, newOfcSecAddress,
    values, file, data?.loanAccountNumber, reduxData?.userProfile, submitRequest, liveLocationTracking, dispatch, coords.latitude, coords.longitude, loadRequests
  ]);

  // Navigation handler
  const handlePressItem = useCallback((item) => {
    navigation.navigate("ViewRequest", { data: item, name: getName(item.requestType) });
  }, [navigation, getName]);

  const keyExtractor = useCallback((item) => String(item?.requestId || item?.id || Math.random()), []);

  // sorted requests newest first
  const sortedRequests = useMemo(() => (requests || []).slice().sort((a, b) => new Date(b.createdTime) - new Date(a.createdTime)), [requests]);

  return (
    <View style={styles.screenContainer}>


      <ScrollView contentContainerStyle={styles.contentContainer}>
        {showRaise ? (
          <>
            <RequestForm
              values={values}
              setValues={setValues}
              newName={newName}
              setNewName={setNewName}
              newContact={newContact}
              setNewContact={setNewContact}
              newHomeSecAddress={newHomeSecAddress}
              setNewHomeSecAddress={setNewHomeSecAddress}
              newOfcSecAddress={newOfcSecAddress}
              setNewOfcSecAddress={setNewOfcSecAddress}
              remark={remark}
              setRemark={setRemark}
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              requestTypes={requestTypes?.filter(rt => {
                // filter NC05/999 out if required (mimic original logic)
                if (screennn !== "My Cases") return rt.code !== "NC05" && rt.code !== "999";
                return true;
              })}
              file={file}
              setFile={setFile}
              onOpenDocumentPicker={() => openDocumentPicker()}
              onRemoveFile={() => removeFile()}
              onSubmit={handleSubmit}
              loading={loading}
            />

            {/* Modal sheet not needed - DocumentPicker handles selection */}
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.raiseButton} onPress={() => setShowRaise(true)}>
              <Text style={styles.raiseButtonText}>Add Request</Text>
            </TouchableOpacity>

            <FlatList
              style={{ marginTop: 12 }}
              showsHorizontalScrollIndicator={false}
              data={sortedRequests}
              keyExtractor={keyExtractor}
              renderItem={({ item }) => <RequestCard item={item} onPress={handlePressItem} getName={getName} />}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              ListEmptyComponent={() => (
                managerLoading ? <View style={styles.emptyWrap}><ActivityIndicator /></View> : <View style={styles.emptyWrap}><Text style={styles.emptyText}>No requests found.</Text></View>
              )}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

/* ===========================
   Styles
   =========================== */
const styles = StyleSheet.create({
  screenContainer: { flex: 1, backgroundColor: "#fff" },
  header: { height: 60, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderBottomWidth: 0.5, borderBottomColor: "#E6E6E6", backgroundColor: "#fff" },
  backBtn: { width: 46, alignItems: "flex-start" },
  headerTitle: { fontSize: 20, fontWeight: "600", color: "#111827", marginLeft: 8 },

  contentContainer: { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 32 },

  raiseButton: { alignSelf: "flex-end", backgroundColor: "#001D56", paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8 },
  raiseButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  formWrap: { width: "100%" },
  label: { fontSize: 14, color: "#6B7280", marginBottom: 6, fontWeight: "500" },
  fieldLabel: { fontSize: 15, fontWeight: "600", color: "#374151", marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: "#E6E9EE", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: "#111827", backgroundColor: "#fff", marginTop: 8
  },
  inputDisabled: {
    borderWidth: 1, borderColor: "#E6E9EE", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: "#6B7280", backgroundColor: "#F6F8FA", marginTop: 8
  },
  textArea: { minHeight: 110, textAlignVertical: "top", marginTop: 8 },

  dropdown: { backgroundColor: "#F8FAFF", borderRadius: 12, color: '#888', borderWidth: 1, borderColor: "#E6E9EE", paddingHorizontal: 12, height: 50, marginTop: 8 },
  placeholderStyle: { fontSize: 14, color: "#6B7280" },
  selectedTextStyle: { fontSize: 15, color: "#0B4D96", fontWeight: "700" },
  inputSearchStyle: { height: 40, fontSize: 14 },
  iconStyle: { width: 20, height: 20 },

  uploadContainer: { marginTop: 18, flexDirection: "row", alignItems: "center" },
  uploadButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#F8FAFF", paddingVertical: 12, paddingHorizontal: 16, minWidth: width * 0.60,
    borderWidth: 1, borderColor: "#E0E6F0", borderRadius: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3,
  },
  uploadText: { fontSize: 15, fontWeight: "700", color: "#1D4ED8", letterSpacing: 0.3 },
  removeFileBtn: { marginLeft: 12 },

  buttonRow: { flexDirection: "row", marginTop: 18, alignItems: "center" },
  cancelBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center", marginRight: 10 },
  cancelText: { color: "#374151", fontWeight: "700", fontSize: 16 },
  submitBtn: { flex: 1, height: 50, borderRadius: 12, backgroundColor: "#0B4D96", alignItems: "center", justifyContent: "center" },
  submitText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  // cards
  cardWrap: { paddingHorizontal: 4, marginVertical: 6 },
  card: { borderRadius: 14, padding: 14, backgroundColor: "#fff", borderWidth: 1, borderColor: "#EEF1F6", shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardLeft: { flex: 1, paddingRight: 8 },
  cardMeta: { width: width * 0.28, alignItems: "flex-end" },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0A3A78" },
  cardSubtitle: { fontSize: 14, color: "#374151", marginTop: 6 },
  metaLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600", textTransform: "uppercase" },
  metaText: { fontSize: 14, color: "#111827", marginTop: 4 },

  emptyWrap: { padding: 24, alignItems: "center" },
  emptyText: { color: "#6B7280", fontSize: 15 },
});

export default memo(Request);
