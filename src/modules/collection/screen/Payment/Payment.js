// Payment.js (final, production-ready)
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  FlatList,
  ScrollView,
  Alert,
  StyleSheet,
  Dimensions,
  PixelRatio,
  TouchableOpacity,
  Text,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import moment from "moment";

import usePaymentForm from "./UsePaymentForm";


import PendingDuesCard from "./Component/PendingDuesCard";
import PaymentTypeSelector from "./Component/PaymentTypeSelector";
import PaymentModeSelector from "./Component/PaymentModeSelector";
import ChargesSelector from "./Component/ChargesSelector";
import CollectionModeSection from "./Component/CollectionModeSection";
import ChequeSection from "./Component/ChequeSection";
import DigitalSection from "./Component/DigitalSection";
import RemarksSection from "./Component/RemarksSection";
import EvidenceUpload from "./Component/EvidenceUpload";
import SubmitButtons from "./Component/SubmitButtons";
import AmountInput from "./Component/AmountInput";
import DateTimeInput from "./Component/DateTimeInput";
import SwipeablePaymentItem from "./Component/SwipeablePaymentItem";
import MobileInput from "./Component/MobileInput";
import { theme } from "../../utility/Theme";
import RNFetchBlob from "rn-fetch-blob";
import BlobUtil from "react-native-blob-util";
import apiClient from "../../../../common/hooks/apiClient";
import { BASE_URL } from "../../service/api";
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const fontScale = (size) => size / PixelRatio.getFontScale();

const mapPaymentType = (typeIndex) => {
  switch (typeIndex) {
    case 0: return "Foreclosure";
    case 1: return "Total Outstanding";
    case 2: return "Charges";
    case 3: return "Overdue EMI";
    case 4: return "Settlement";
    case 5: return "Others";
    case 6: return "EMI";
    default: return "Payment";
  }
};

const Payment = () => {
  const navigation = useNavigation();
  const { params } = useRoute();
  const routes = useRoute();
  // const { data = {}, fromScreen = "" } = params || {};
  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);
  const lastAutoFillRef = useRef('')
  // form hook
  const {
    form,
    update,
    validate,
    resetForm,
    setProgrammaticAmount,
    clearAmountAndTracking,
  } = usePaymentForm();
  const {
    data,
    fromScreen,
    evidanceDataFromViewPayment,
    initialMode,
    resetMobile,
  } = routes.params;
  console.log('testing--==>', data, 'fromScreen==>', fromScreen);

  // local UI
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  // refs to avoid double-fetch in dev StrictMode and to remember prev type
  const didLoadRef = useRef(false);
  const prevTypeRef = useRef(null);

  // derived backend numbers
  const otherCharges = Number(data?.otherCharges || 0);
  const DPC = Number(data?.dpcOrLppOrDelayPaymentChargesOrLatePaymentPenalty || 0);
  const chequeBounceCharges = Number(data?.chequeBounceCharges || 0);

  // load history (guarded to prevent double call in StrictMode dev)
  const loadHistory = useCallback(async () => {
    try {
      if (!data?.loanAccountNumber) {
        setHistory([]);
        return;
      }
      const resp = await apiClient.get(
        `getAllPaymentByLoanAccountNumber/${data.loanAccountNumber}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHistory(resp?.data?.data || []);
    } catch (err) {
      console.warn("loadHistory error:", err?.message || err);
    }
  }, [data?.loanAccountNumber, token]);
  const PTP_TYPE_MAP = {
    "Foreclosure": 0,
    "Total Outstanding": 1,
    "Charges": 2,
    "Overdue EMI": 3,
    "Settlement": 4,
    "Other": 5,
    "EMI": 6,
  };


  useEffect(() => {
    if (fromScreen == 'ViewPTP') {
      console.log('Test_data===>', data);
      setShowPayment(true);
      // setMobile(data?.user?.mobileno);
    }
  }, [fromScreen, routes]);


  useEffect(() => {
    if (fromScreen !== "ViewPTP") return;

    /* ---------------- Amount ---------------- */
    if (data?.ptpAmount) {
      setProgrammaticAmount(String(data.ptpAmount));
      update("hasUserEditedAmount", true); // 🔥 lock auto-fill

    }

    /* ---------------- Date ---------------- */
    if (data?.ptpDate && data?.ptpTime) {
      const combined = moment(
        `${data.ptpDate} ${data.ptpTime}`,
        ["YYYY-MM-DD HH:mm", "YYYY-MM-DD HH:mm:ss"],
        true
      );

      if (combined.isValid()) {
        update("dateTime", combined.toDate());
      }
    }

    /* ---------------- Remark ---------------- */
    update("remark", data?.remark || "");

    /* ---------------- Type ---------------- */
    const resolvedType = PTP_TYPE_MAP[data?.ptpType];
    if (resolvedType !== undefined) {
      update("type", resolvedType);
    }

    /* ---------------- Mode (Settlement / EMI) ---------------- */
    if (data?.ptpMode === "Partial") {
      update("mode", 1);
    } else {
      update("mode", 0);
    }

  }, [fromScreen, data]);


  useEffect(() => {
    if (didLoadRef.current) return;
    didLoadRef.current = true;
    loadHistory();
    // note: we intentionally don't depend on loadHistory ref to avoid dev double-run
    // if you want to reload on loanAccountNumber change in prod, remove the guard and add deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // amount autofill logic
  useEffect(() => {
    const prevType = prevTypeRef.current;
    prevTypeRef.current = form.type;

    const settlementValue = Number(data?.settlementAmount || 0);
    const emiValue = Number(data?.emiAmount || 0);
    const overdueValue = Number(data?.totalOverdueAmount || 0);
    const overdueEmiValue = Number(data?.pendingEmiAmount || 0);

    const autoTypes = [1, 2, 3, 4, 6];
    const isAuto = autoTypes.includes(form.type);
    const wasAuto = autoTypes.includes(prevType);

    // ⭐ if switching between auto-types AND user never edited, reset tracking
    if (isAuto && wasAuto && !form.hasUserEditedAmount) {
      lastAutoFillRef.current = null;
    }

    const shouldAuto = !form.hasUserEditedAmount;

    // NON-AUTO TYPES
    if (!isAuto) {
      if (!form.hasUserEditedAmount && fromScreen !== "ViewPTP") {
        clearAmountAndTracking();
      }
      update("amountDisabled", false);
      return;
    }


    // AUTO FILL CASES
    switch (form.type) {
      case 4:
        if (shouldAuto) setProgrammaticAmount(settlementValue);
        update("amountDisabled", form.mode === 0);
        break;

      case 6:
        if (shouldAuto) setProgrammaticAmount(emiValue);
        update("amountDisabled", form.mode === 0);
        break;

      case 1:
        if (shouldAuto) setProgrammaticAmount(overdueValue);
        update("amountDisabled", form.mode === 0);
        break;

      case 3:
        if (shouldAuto) setProgrammaticAmount(overdueEmiValue);
        update("amountDisabled", form.mode === 0);
        break;

      case 2:
        const ot = form.charges?.ot ? Number(data?.otherCharges || 0) : 0;
        const dpcVal = form.charges?.dpc
          ? Number(data?.dpcOrLppOrDelayPaymentChargesOrLatePaymentPenalty || 0)
          : 0;
        const bounce = form.charges?.chequeBounce ? Number(data?.chequeBounceCharges || 0) : 0;
        const totalCharges = ot + dpcVal + bounce;

        if (shouldAuto) setProgrammaticAmount(totalCharges);

        update("amountDisabled", true);
        break;
    }
  }, [
    form.type,
    form.mode,
    form.charges?.ot,
    form.charges?.dpc,
    form.charges?.chequeBounce,
    form.hasUserEditedAmount,
    data?.settlementAmount,
    data?.emiAmount,
    data?.totalOverdueAmount,
    data?.pendingEmiAmount,
    otherCharges,
    DPC,
    chequeBounceCharges,
  ]);





  const uploadPaymentEvidence = async (id, file, token) => {
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
        `upload-document-payment/${id}`,
        {
          fieldName: "paymentfile",
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
  };

  const handleSubmit = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      // -----------------------------
      // 1) Yup Validation
      // -----------------------------
      await validate(form);

      const amountNum = Number(form.amount || 0);
      if (!amountNum || amountNum <= 0) throw new Error("Entered amount cannot be 0.");

      // Business checks
      if (form.collectionMode === 1 && !form.chequeNo)
        throw new Error("Please enter cheque no");
      if ((form.collectionMode === 2 || form.collectionMode === 3) && !form.referenceNo)
        throw new Error("Please enter reference no");
      if (!form.mobile) throw new Error("Please enter mobile no");
      if (!form.remark) throw new Error("Please enter remark");

      // -----------------------------
      // 2) Role permission
      // -----------------------------
      const menoallocation = (() => {
        try {
          return JSON.parse(String(userProfile?.role?.[0]?.access || "{}"));
        } catch (e) {
          return {};
        }
      })();

      const checkIsrequestPermission = ["F", "E"].includes(
        menoallocation?.requestmanagement_requestmanagement
      );

      // -----------------------------
      // 3) Data used in payload
      // -----------------------------
      const digitalText =
        form.digitalMode === 0 ? "NEFT" :
          form.digitalMode === 1 ? "RTGS" :
            form.digitalMode === 2 ? "IMPS" : "UPI";

      const ot = Number(data?.otherCharges || 0);
      const dpc = Number(data?.dpcOrLppOrDelayPaymentChargesOrLatePaymentPenalty || 0);
      const bounce = Number(data?.chequeBounceCharges || 0);
      const allCharges = ot + dpc + bounce;

      // -----------------------------
      // 4) FINAL PAYLOAD (matches original EXACTLY)
      // -----------------------------
      const payload = {
        amount: parseFloat(form.amount),

        // Charges category
        charges: form.type === 2 ? allCharges : null,
        chequeBounce: form.type === 2 ? data?.chequeBounceCharges : null,
        dcpLpp: form.type === 2 ? dpc : null,
        otherCharges: form.type === 2 ? ot : null,

        // Cheque
        chequeNumber: form.collectionMode === 1 ? form.chequeNo : null,

        // Digital
        digitalPaymentMode: form.collectionMode === 2 ? digitalText : "",

        // EMI
        emiAmount: data?.emiAmount,

        // Core fields
        loanAccountNumber: data?.loanAccountNumber,

        // Category
        paymentCategory: fromScreen === "ViewPTP" ? "PTP" : "Payment",

        // Date
        paymentDate: moment(form.dateTime).format("YYYY-MM-DD"),

        // Full/partial
        paymentMeasure:
          form.type === 4 || form.type === 6
            ? form.mode === 0 ? "Full" : "Partial"
            : null,

        // Mode
        paymentMode:
          form.collectionMode === 0
            ? "Cash"
            : form.collectionMode === 1
              ? "Cheque"
              : form.collectionMode === 2
                ? "Digital"
                : "Demand Draft",

        // Status
        paymentStatus: checkIsrequestPermission ? "Success" : "Pending",

        // Payment type label
        paymentType: mapPaymentType(form.type),

        // values from backend
        pendingEmiAmount: data?.pendingEmiAmount,
        totalOverdueAmount: data?.totalOverdueAmount,
        settlementAmount: data?.settlementAmount,

        // Contact
        phoneNumber: form.mobile,
        referenceNumber:
          form.collectionMode === 2 || form.collectionMode === 3
            ? form.referenceNo
            : null,

        remark: form.remark,
        status: "",
        subType: "",

        // Time
        timeOfPayment: moment(form.dateTime).format("HH:mm"),

        // User
        user: { userId: userProfile?.userId },

        // Geo
        userGeoCoOrdinates: form.geoCoordinates || "",
        geoCrordinates: form.geoCoordinates || "",

        // Evidence
        isDocument: form.evidence ? "yes" : "No",
      };

      // -----------------------------
      // 5) CALL addPayment
      // -----------------------------
      const resp = await apiClient.post(`addPayment`, payload, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const addData = resp?.data?.data;

      if (!addData?.paymentId) throw new Error("Invalid payment response");

      // Live tracking (wrap safely)
      try {
        global?.liveLocationTracking?.(addData.paymentId);
      } catch (e) { }

      // -----------------------------
      // 6) UPDATE CASE STATUS (same as old)
      // -----------------------------
      const currentRoles = userProfile?.role || [];
      const role0 = currentRoles[0]?.roleCode;

      const url =
        role0 === "CA" ||
          (role0 === "FA" && userProfile?.activityType === "Calling")
          ? "updateMyCaseForInProcessForCA"
          : (role0 === "FA" && userProfile?.activityType === "Field") ||
            role0 === "DRA"
            ? "updateMyCaseForInProcessForDRA"
            : userProfile?.activityType === "Field"
              ? "updateMyCaseForInProcessField"
              : "updateMyCaseForInProcess";

      await apiClient.put(
        `${url}/${userProfile?.userId}/${data?.loanAccountNumber}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // -----------------------------
      // 7) REQUEST MANAGEMENT
      // -----------------------------
      const reqPayload = {
        activityId: addData.paymentId,
        activityType: "Payment",
        lan: addData.loanAccountNumber,
        remark: form.remark,
        reportingManagerOfUser: "",
        requestRaisedUserId: parseInt(userProfile?.userId),
        requestid: new Date().getTime().toString().slice(-5),
        selectedFieldAgentId: "",
        status:
          ["FA", "ATL", "DRA", "CA"].includes(role0)
            ? "Pending"
            : "Success",
        userType: role0,
        isDocument: form.evidence ? "yes" : "No",
      };

      const reqResp = await apiClient.post(`addRequestManagement`, reqPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // -----------------------------
      // 8) EVIDENCE UPLOAD
      // -----------------------------
      if (form.evidence) {
        try {
          await uploadPaymentEvidence(addData.paymentId, form.evidence, token);
        } catch (error) {
          console.warn("Evidence upload failed:", error);
        }
      }

      // -----------------------------
      // 9) SUCCESS UX
      // -----------------------------
      Alert.alert("Success", "Payment added successfully");
      resetForm();
      setShowPayment(false);
      loadHistory();

    } catch (err) {
      const msg =
        (err?.inner && err.inner.map((e) => e.message).join("\n")) ||
        err.message ||
        "Something went wrong";
      Alert.alert("Error", msg);
      console.error("handleSubmit error:", err);
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    validate,
    form,
    token,
    data,
    resetForm,
    loadHistory,
  ]);

  const handleSendSms = (item) => {
    console.log("SMS clicked for:", item.paymentId);
    // your SMS logic here
  };

  const handleSendEmail = (item) => {
    console.log("Email clicked for:", item.paymentId);
    // your email logic here
  };


  // Add Payment button pressed
  const handleAddPaymentPress = useCallback(() => {
    resetForm();
    // ensure programmatic auto-fill tracking cleared
    clearAmountAndTracking();
    setShowPayment(true);
    setHistory([]);
  }, [resetForm, clearAmountAndTracking]);

  // Render header button
  const renderHeader = () => {
    if (showPayment) return null;
    return (
      <TouchableOpacity onPress={handleAddPaymentPress} style={styles.addButton}>
        <Text style={styles.addText}>Add Payment</Text>
      </TouchableOpacity>
    );
  };

  // Payment form view
  const renderForm = () => {
    if (!showPayment) return null;
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <PendingDuesCard data={data} />

        <PaymentTypeSelector form={form} update={update} />

        {(form.type === 4 || form.type === 6) && <PaymentModeSelector form={form} update={update} />}

        {form.type === 2 && <ChargesSelector form={form} update={update} />}

        <AmountInput form={form} update={update} />
        <MobileInput form={form} update={update} />

        <CollectionModeSection form={form} update={update} />

        {form.collectionMode === 1 && <ChequeSection form={form} update={update} />}
        {form.collectionMode === 2 && <DigitalSection form={form} update={update} />}

        <DateTimeInput label="Payment Date & Time" value={form.dateTime} onChange={(d) => update("dateTime", d)} />

        <RemarksSection form={form} update={update} />

        <EvidenceUpload form={form} update={update} />

        <SubmitButtons
          onSubmit={handleSubmit}
          onCancel={() => {
            resetForm();
            clearAmountAndTracking();
            setShowPayment(false);
            loadHistory();
          }}
          loading={loading}
        />

        <View style={{ height: 20 }} />
      </ScrollView>
    );
  };

  return (
    <View style={styles.screen}>
      {!showPayment && renderHeader()}

      {showPayment ? (
        renderForm()
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => String(item.id || Math.random())}
          renderItem={({ item }) => (
            <SwipeablePaymentItem
              item={item}
              theme={theme}

              // required props !!!
              onEmail={(itm) => handleSendEmail(itm)}
              onSMS={(itm) => handleSendSms(itm)}

              onNavigate={() =>
                navigation.navigate("ViewPaymentScreen", {
                  data: item,
                  name: data.name,
                  chequenumber: item.chequeNumber,
                })
              }
            />
          )}
        />

      )}
    </View>
  );
};

export default Payment;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#FAFAFB" },
  container: { padding: 16 },
  addButton: {
    marginTop: 8,
    alignSelf: "flex-end",
    backgroundColor: "#001D56",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
});
