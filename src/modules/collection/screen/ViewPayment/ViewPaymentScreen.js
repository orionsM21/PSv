////Experimental
import React, { useRef, useState, memo, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  Alert,
  PermissionsAndroid,
  Platform,
  Animated,
} from "react-native";

import { theme, white } from "../../utility/Theme";
import { useDispatch, useSelector } from "react-redux";
// import { showLoader } from "../redux/action";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";


import {
  BLEPrinter,
  USBPrinter,
  NetPrinter
} from "react-native-thermal-receipt-printer";


// import apiClient from "../../api/apiClient";
// import ToastNotification from "../../Component/ToastAlert";
import LinearGradient from "react-native-linear-gradient";
// import { BASE_URL } from "../../api/Endpoint";
import apiClient from "../../../../common/hooks/apiClient";
import { BASE_URL } from "../../service/api";
import ToastNotification from "../../component/ToastAlert";

const { width, height } = Dimensions.get("screen");

const ViewPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();

  // const reduxData = useSelector((state) => state.auth);
  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);

  const { data, name } = route.params;

  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    type: "",
    header: "",
    body: "",
  });

  const [shortURL, setShortURL] = useState("");
  const [smsEmailData, setSmsEmailData] = useState({});
  const [paymentEvidence, setPaymentEvidence] = useState("");

  const [modalVisible, setModalVisible] = useState(false);

  const [printers, setPrinters] = useState([]);
  const [currentPrinter, setCurrentPrinter] = useState(null);
  const [bluetoothVisible, setBluetoothVisible] = useState(false);

  const [receiptData, setReceiptData] = useState(null);
  const [amountInWordsTxt, setAmountInWordsTxt] = useState("");

  // ---------------------------------------------------------
  // HELPERS
  // ---------------------------------------------------------

  const showToastMessage = (type, header, body) => {
    setToastConfig({ type, header, body });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const numberToWords = useCallback((num) => {
    const units = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const teens = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];

    const convert = (num) => {
      if (num < 10) return units[num];
      if (num < 20) return teens[num - 10];
      if (num < 100)
        return tens[Math.floor(num / 10)] + (num % 10 ? " " + units[num % 10] : "");
      if (num < 1000)
        return (
          units[Math.floor(num / 100)] +
          " Hundred" +
          (num % 100 ? " " + convert(num % 100) : "")
        );
      if (num < 100000)
        return (
          convert(Math.floor(num / 1000)) +
          " Thousand" +
          (num % 1000 ? " " + convert(num % 1000) : "")
        );
      if (num < 10000000)
        return (
          convert(Math.floor(num / 100000)) +
          " Lakh" +
          (num % 100000 ? " " + convert(num % 100000) : "")
        );
      return (
        convert(Math.floor(num / 10000000)) +
        " Crore" +
        (num % 10000000 ? " " + convert(num % 10000000) : "")
      );
    };

    const [integerPart, decimalPart] = num.toString().split(".");
    let result = convert(parseInt(integerPart));

    if (decimalPart && parseInt(decimalPart) !== 0) {
      const decimalWords = decimalPart
        .split("")
        .map((d) => units[parseInt(d)])
        .join(" ");
      result += ` and ${decimalWords} Paise`;
    }

    setAmountInWordsTxt(result);
    return result;
  }, []);

  // ---------------------------------------------------------
  // PRINTING
  // ---------------------------------------------------------
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (bluetoothVisible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }).start();
    }
  }, [bluetoothVisible]);
  const initBluetooth = async () => {
    try {
      await BLEPrinter.init();
      const deviceList = await BLEPrinter.getDeviceList();
      setPrinters(deviceList);
      console.log('Bluetooth initialization successful');
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
    }
  };

  const requestBluetoothPermission = async () => {
    if (Platform.OS !== "android") return initBluetooth();
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) initBluetooth();
    } catch (err) {
      console.log("Bluetooth permission error:", err);
    }
  };

  const connectPrinter = (printer) => {
    setBluetoothVisible(false);
    BLEPrinter.connectPrinter(printer.inner_mac_address)
      .then(() => setCurrentPrinter(printer))
      .catch((err) => console.log("Printer connect error:", err));
  };

  const printReceipt = useCallback(() => {
    if (!currentPrinter || !receiptData) return;

    const dateTime = `${receiptData.paymentDate} ${receiptData.timeOfPayment}`;
    BLEPrinter.printBill(`
-- Receipt --
Name: ${receiptData.customerName}
Amount: ₹${receiptData.amount}
Amount in Words: ${amountInWordsTxt} only
Payment Type: ${receiptData.paymentType}
Payment Mode: ${receiptData.paymentMode}
Date: ${moment(dateTime).format("DD-MM-YYYY hh:mm A")}
----------------------
      `);
  }, [currentPrinter, receiptData, amountInWordsTxt]);

  // ---------------------------------------------------------
  // API CALLS
  // ---------------------------------------------------------

  const getReceiptData = useCallback(() => {
    if (!data?.paymentId) return;

    apiClient
      .get(`getReceiptByPaymentId/${data.paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const payData = res.data?.data;
        setReceiptData(payData);
        numberToWords(payData.amount);
      })
      .catch((err) => console.log("Receipt fetch error:", err));
  }, [data?.paymentId]);

  const getEvidence = () => {
    // dispatch(showLoader(true));
    apiClient
      .get(`getDocumentByPaymentId/${data.paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setPaymentEvidence(res.data?.paymentfile || "");
      })
      .catch((e) => console.log("Evidence error:", e))
    // .finally(() => );
  };

  const getSuccessContacts = () => {
    apiClient
      .get(`getSuccessDataByLoanNumber/${data.loanAccountNumber}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSmsEmailData(res.data?.data || {}));
  };

  useEffect(() => {
    getReceiptData();
    getEvidence();
    getSuccessContacts();
    requestBluetoothPermission();
  }, []);

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  const navigateBack = () => navigation.goBack();

  const openEvidence = () => {
    if (!paymentEvidence) return Alert.alert("Document not found");
    setModalVisible(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: white }}>
      {/* Header */}


      {/* MAIN CONTENT */}
      <ScrollView>
        {/* Payment Info Card */}
        <View style={styles.card}>
          {/* HEADER */}
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Details</Text>
          </View>

          {/* Fields */}
          <PaymentRow label="User Name" value={`${data?.user?.firstName} ${data?.user?.lastName}`} />
          <PaymentRow label="Loan A/c No." value={data?.loanAccountNumber} alternate />
          <PaymentRow label="Amount" value={`₹ ${data?.amount}`} />
          <PaymentRow label="Payment Type" value={data?.paymentType} alternate />

          <PaymentRow
            label="Payment Date"
            value={moment(data?.paymentDate).format("DD-MM-YYYY")}
          />
          <PaymentRow
            label="Payment Time"
            value={moment(data?.timeOfPayment, "HH:mm").format("hh:mm A")}
            alternate
          />

          <PaymentRow label="Collection Mode" value={data?.paymentMode} />
          <PaymentRow label="Digital Mode" value={data?.digitalPaymentMode || "-"} alternate />
          <PaymentRow label="Reference No." value={data?.referenceNumber || "-"} />
          <PaymentRow label="Cheque No." value={data?.chequeNumber || "-"} alternate />
          <PaymentRow
            label="Payment Status"
            value={data?.paymentStatus}
            color={
              data.paymentStatus === "Pending"
                ? "orange"
                : data.paymentStatus === "Success"
                  ? "green"
                  : "red"
            }
          />

          <PaymentRow label="Phone No" value={data?.phoneNumber} alternate />
          <PaymentRow label="Remarks" value={data?.remark} />
        </View>

        {/* Evidence */}
        {(data?.isDocument === "yes" || paymentEvidence) && (
          <View style={styles.centerWrap}>
            <TouchableOpacity onPress={openEvidence}>
              <View style={styles.btnPrimary}>
                <Text style={styles.btnPrimaryText}>View Document</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Print */}
        {data.paymentStatus === "Success" && (
          <TouchableOpacity onPress={() => setBluetoothVisible(true)}>
            <View style={styles.btnPrint}>
              <Text style={styles.btnPrintText}>Print Receipt</Text>
            </View>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* EVIDENCE MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Evidence</Text>
              <Image
                source={{ uri: `data:image/png;base64,${paymentEvidence}` }}
                style={styles.evidenceImg}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* BLUETOOTH PRINTER MODAL */}
      <Modal
        visible={bluetoothVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.overlay}>
          <Animated.View style={[styles.modalContainer, { transform: [{ scale: scaleAnim }] }]}>

            {/* HEADER */}
            <LinearGradient
              colors={["#0B2A79", "#1748A3", "#1E5BC8"]}
              style={styles.header}
            >
              <Text style={styles.headerText}>Select Printer</Text>
            </LinearGradient>

            {/* PRINTER LIST */}
            <ScrollView style={{ maxHeight: height * 0.32 }}>
              {printers?.map((p) => (
                <TouchableOpacity
                  key={p.inner_mac_address}
                  style={styles.printerItem}
                  onPress={() => connectPrinter(p)}
                >
                  <MaterialIcons name="print" size={22} color="#1E5BC8" />
                  <Text style={styles.printerLabel}>{p.device_name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* CLOSE BUTTON */}
            <TouchableOpacity
              onPress={() => setBluetoothVisible(false)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>



      {/* Toast */}
      {showToast && (
        <ToastNotification
          isModalVisible
          type={toastConfig.type}
          header={toastConfig.header}
          body={toastConfig.body}
        />
      )}
    </View>
  );
};

export default memo(ViewPaymentScreen);

const PaymentRow = memo(({ label, value, alternate, color }) => (
  <View
    style={[styles.row, alternate && { backgroundColor: "#F9FAFB" }]}
  >
    <Text style={styles.label}>{label}</Text>
    <Text style={[styles.value, color && { color }]}>{value}</Text>
  </View>
));

const styles = StyleSheet.create({

  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#000",
  },
  card: {
    margin: 12,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    backgroundColor: white,
    overflow: "hidden",
  },
  cardHeader: {
    padding: 12,
    backgroundColor: theme.light.darkBlue,
  },
  cardHeaderText: {
    fontSize: 18,
    color: white,
    fontWeight: "700",
  },
  row: {
    padding: 10,
    flexDirection: "row",
  },
  label: {
    width: "50%",
    fontSize: 14,
    color: "#666",
  },
  value: {
    width: "50%",
    fontSize: 16,
    fontWeight: "700",
    color: "#000",
  },
  centerWrap: { alignItems: "center" },
  btnPrimary: {
    width: width * 0.5,
    height: height * 0.045,
    backgroundColor: theme.light.darkBlue,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    marginVertical: 14,
  },
  btnPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: white,
  },
  btnPrint: {
    width: width * 0.4,
    height: height * 0.045,
    backgroundColor: "#07B0CF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    alignSelf: "center",
    marginVertical: 14,
  },
  btnPrintText: {
    fontSize: 14,
    fontWeight: "700",
    color: white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalTitle: {
    backgroundColor: theme.light.darkBlue,
    color: white,
    paddingVertical: 10,
    fontSize: 20,
    textAlign: "center",
    fontWeight: "700",
  },
  evidenceImg: { width: "100%", height: 300 },


  modalBox: {
    width: "92%",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 22,
    paddingBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    backdropFilter: "blur(20px)", // works on iOS; android auto falls back
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },



  printerName: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  closeText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  modalContainer: {
    width: width * 0.85,
    backgroundColor: "rgba(255,255,255,0.22)",
    borderRadius: 22,
    paddingBottom: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 25,
    backdropFilter: "blur(25px)",      // works on iOS
  },

  header: {
    paddingVertical: 14,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
  },

  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },

  printerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255,255,255,0.65)",
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  printerLabel: {
    fontSize: 16,
    marginLeft: 12,
    fontWeight: "600",
    color: "#1E3A8A",
  },

  closeBtn: {
    height: 44,
    backgroundColor: "#FF4E4E",
    marginHorizontal: 50,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#FF4E4E",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  closeBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
