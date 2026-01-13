// PTP.js (Single-file, modular structure, responsive - uses react-native-size-matters)
import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  memo,
  useMemo,
} from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  TextInput,
  ScrollView,
  ActivityIndicator,
  LayoutAnimation,
  UIManager,
  Platform,
} from "react-native";
import { scale, verticalScale, ms } from "react-native-size-matters";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import moment from "moment";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import Geolocation from '@react-native-community/geolocation';
// --- Theme: adjust to your theme exports (kept names from your file) ---

import axios from "axios";
// import ToastNotification from "../Component/ToastAlert";

import { Primary, White, theme, white } from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';
import ToastNotification from "../component/ToastAlert";
// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width } = Dimensions.get("window");

const formatCurrency = (v) => {
  const n = parseFloat(v);
  if (Number.isFinite(n)) {
    return n.toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  return "--";
};

const clampAmountString = (text) => {
  // Allow only digits and single dot, at most 2 decimals
  const cleaned = (text || "").replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length > 1) {
    parts[1] = parts[1].slice(0, 2);
  }
  parts[0] = parts[0].replace(/^0+(?=\d)/, ""); // remove leading zeros
  const finalValue = parts.join(".");
  return finalValue === "." ? "0." : finalValue;
};

const ITEM_HEIGHT = verticalScale(92);

const COLORS = {
  primaryLeft: '#0D4EE0',   // blue
  primaryRight: '#7B2AF7',  // purple
  primary: '#0D4EE0',
  cardBg: '#FFFFFF',
  softBg: '#F5F7FA',
  border: '#E6EDF6',
  label: '#16324A',
  text: '#0B2338',
  subtle: '#7A8A99',
  success: '#0B8A3E',
  shadow: 'rgba(5,21,46,0.08)',
};


const PTP = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { data = {}, initialMode = 0, ptpId, fromScreen, openEdit, filleddata } = route.params ?? {};
  console.log()
  // Redux
  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);

  // local state
  const [showPTP, setShowPTP] = useState(false);
  const [selIndex, setSelIndex] = useState(0);
  const [paymentType, setPaymentType] = useState(0);
  const [mode, setMode] = useState(initialMode || 0);
  const [amount, setAmountValue] = useState("");
  const [remark, setRemark] = useState("");
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [followUp, setFollowUp] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [ptpid, setptpid] = useState(0);
  const [otChrg, setOtChrg] = useState(true);
  const [dpc, setDpc] = useState(true);
  const [chqBnc, setChqBnc] = useState(true);

  const [ptpData, setPtpData] = useState([]); // feed with your data when available
  const [expandedCardIndex, setExpandedCardIndex] = useState(-1);

  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const [show, setShow] = useState(false);
  const [status, setStatus] = useState();
  const [type, setType] = useState();
  const [header, setHeader] = useState();
  const [body, setBody] = useState();

  // compute charges safely with memo
  // const { otherCharges, DPC, chequeBounceCharges, allCharges } = useMemo(() => {
  //   const o = parseFloat(data?.otherCharges) || 0;
  //   const d = parseFloat(data?.dpcOrLppOrDelayPaymentChargesOrLatePaymentPenalty) || 0;
  //   const c = parseFloat(data?.chequeBounceCharges) || 0;
  //   return { otherCharges: o, DPC: d, chequeBounceCharges: c, allCharges: o + d + c };
  // }, [data, fromScreen]);

  const { otherCharges, DPC, chequeBounceCharges, allCharges, } = useMemo(() => {

    // 🔥 EDIT MODE → ALWAYS use alldetail
    // if (fromScreen === "ViewPTP") {
    //   const o = parseFloat(alldetail?.otherCharges) || 0;
    //   const d = parseFloat(alldetail?.dcpLpp) || 0;
    //   const c = parseFloat(alldetail?.chequeBounce) || 0;

    //   return {
    //     otherCharges: o,
    //     DPC: d,
    //     chequeBounceCharges: c,
    //     allCharges: o + d + c,
    //   };
    // }

    // 🔥 ADD MODE → use DATA (loan details)
    const o = parseFloat(data?.otherCharges) || 0;
    const d = parseFloat(data?.dpcOrLppOrDelayPaymentChargesOrLatePaymentPenalty) || 0;
    const c = parseFloat(data?.chequeBounceCharges) || 0;

    return {
      otherCharges: o,
      DPC: d,
      chequeBounceCharges: c,
      allCharges: o + d + c,
    };


  }, [fromScreen, data]);




  console.log(data, fromScreen, openEdit, allCharges, 'openEditopenEdit')
  const currentRoles = useMemo(() =>
    userProfile?.role.map(a => a?.roleCode),
  );

  // map api ptpType -> selIndex used in your form
  const getTypeIndex = (type) => {
    switch (type) {
      case "Foreclosure": return 0;
      case "Total Outstanding":
      case "Total Overdue": return 1;
      case "Charges": return 2;
      case "Overdue EMI": return 3;
      case "Settlement": return 4;
      case "Other":
      case "Others": return 5;
      case "EMI": return 6;
      default: return 0;
    }
  };

  useEffect(() => {
    if (fromScreen === "ViewPTP" && openEdit) {
      setptpid(filleddata?.ptpId)
      setShowPTP(true);             // open form automatically
      setSelIndex(getTypeIndex(filleddata.ptpType));   // select PTP Type
      setAmountValue(String(filleddata.ptpAmount));    // prefill amount
      setMode(filleddata.ptpMode === "Full" ? 0 : 1);  // full or partial
      setDate(new Date(filleddata.ptpDate));           // ptp date
      setTime(moment(filleddata.ptpTime, "HH:mm").toDate());  // ptp time
      setFollowUp(filleddata.followUpDate);  // follow up
      setRemark(filleddata.remark);                    // remark
      setPaymentType(filleddata.fieldPickup ? 0 : 1);  // pickup or self-pay
    }
  }, [fromScreen, filleddata, openEdit]);



  // List helper
  const keyExtractor = useCallback((item) => String(item.ptpId), []);


  // open date/time picker
  const openPicker = useCallback((mode) => {
    setPickerMode(mode);
    setDatePickerVisible(true);
  }, []);

  const getPickerDate = useCallback(() => {
    if (pickerMode === "date") return date;
    if (pickerMode === "time") return time;
    return followUp;
  }, [pickerMode, date, time, followUp]);

  const handleDateConfirm = useCallback(
    (selected) => {
      setDatePickerVisible(false);
      if (!selected) return;
      if (pickerMode === "date") setDate(selected);
      else if (pickerMode === "time") setTime(selected);
      else setFollowUp(selected);
    },
    [pickerMode]
  );

  // type selection: updates selIndex and prefill amount when appropriate
  const handleTypeSelection = useCallback(
    (idx) => {
      setSelIndex(idx);
      // reset toggles if not charges type
      if (idx !== 2) {
        setOtChrg(true);
        setDpc(true);
        setChqBnc(true);
      }

      // prepare amount based on type
      let newAmount = "";
      switch (idx) {
        case 0: // Foreclosure
          newAmount = "";
          break;
        case 1: // Total Overdue
          newAmount = data?.totalOverdueAmount ? String(parseFloat(data.totalOverdueAmount).toFixed(2)) : "";
          break;
        case 2: // Charges
          newAmount = allCharges > 0 ? String(allCharges.toFixed(2)) : "";
          break;
        case 3: // Overdue EMI
          newAmount = data?.pendingEmiAmount ? String(parseFloat(data.pendingEmiAmount).toFixed(2)) : "";
          break;
        case 4: // Settlement
          if (mode === 0) newAmount = data?.settlementAmount ? String(parseFloat(data.settlementAmount).toFixed(2)) : "";
          break;
        case 5: // Others
          newAmount = "";
          break;
        case 6: // EMI
          if (mode === 0) newAmount = data?.emiAmount ? String(parseFloat(data.emiAmount).toFixed(2)) : "";
          break;
        default:
          newAmount = "";
      }
      setAmountValue(newAmount);
    },
    [data, allCharges, mode]
  );

  // toggles update amount in a stable way
  const updateAmountByDelta = useCallback((delta) => {
    setAmountValue((prev) => {
      const prevN = parseFloat(prev) || 0;
      const newN = +(prevN + delta).toFixed(2);
      return newN > 0 ? String(newN) : "";
    });
  }, []);

  const handleOtherCharges = useCallback(
    (checked) => {
      setOtChrg(checked);
      updateAmountByDelta(checked ? otherCharges : -otherCharges);
    },
    [otherCharges, updateAmountByDelta]
  );

  const handleDPC = useCallback(
    (checked) => {
      setDpc(checked);
      updateAmountByDelta(checked ? DPC : -DPC);
    },
    [DPC, updateAmountByDelta]
  );

  const handleChequeBounce = useCallback(
    (checked) => {
      setChqBnc(checked);
      updateAmountByDelta(checked ? chequeBounceCharges : -chequeBounceCharges);
    },
    [chequeBounceCharges, updateAmountByDelta]
  );

  const setModeFull = useCallback(() => {
    setMode(0);
    if (selIndex === 4 && data?.settlementAmount > 0) {
      setAmountValue(parseFloat(data.settlementAmount).toFixed(2));
    } else if (selIndex === 6 && data?.emiAmount > 0) {
      setAmountValue(parseFloat(data.emiAmount).toFixed(2));
    } else {
      setAmountValue("");
    }
  }, [selIndex, data]);

  const isAmountLocked = useMemo(() => {
    return (selIndex === 4 && mode === 0) || (selIndex === 6 && mode === 0);
  }, [selIndex, mode]);

  // amount input handling (safe)
  const handleAmountInput = useCallback((txt) => {
    setAmountValue(clampAmountString(txt));
  }, []);

  // press submit/update
  const handlePress = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (fromScreen === "ViewPTP") {
        await updatePTP();
      } else {
        await submitPTP();
      }

      await getCurrentLocation();
    } catch (err) {
      console.log("handlePress error:", err);
    } finally {
      setLoading(false);
    }
  };
  // =============================
  //  USE EFFECT: GET CURRENT LOCATION ONCE
  // =============================
  useEffect(() => {
    getCurrentLocation();
  }, []);


  // =============================
  //  GET CURRENT LOCATION (OPTIMIZED)
  // =============================
  // const getCurrentLocation = useCallback(() => {
  //   Geolocation.getCurrentPosition(
  //     (position) => {
  //       const lat = position.coords.latitude;
  //       const lng = position.coords.longitude;

  //       setLatitude(lat);
  //       setLongitude(lng);

  //       console.log("Current Location:", `${lat},${lng}`);
  //     },
  //     (error) => {
  //       console.error("Location Error:", error.message);

  //       // Retry only if PERMISSION_OR_TIMEOUT issue happens
  //       if (error.code === 1 || error.code === 3) {
  //         setTimeout(getCurrentLocation, 800);
  //       }
  //     },
  //     {
  //       enableHighAccuracy: true,
  //       timeout: 10000,
  //       maximumAge: 0,
  //     }
  //   );
  // }, []);
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        let locationData = `${position.coords.latitude},${position.coords.longitude}`;
        // liveLocationTracking(locationData);
        // setCurLat(position.coords.latitude);
        // setCurLong(position.coords.longitude);

        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        // console.log(locationData, 'locationDatalocationData')

      },
      error => {
        console.error('Error getting location:', error.message);
        // Retry fetching location after a delay
        setTimeout(getCurrentLocation, 1000); // Retry after 1 second (adjust as needed)
      },
    );
  };

  // =============================
  //  LIVE LOCATION TRACKING (OPTIMIZED)
  // =============================
  const liveLocationTracking = useCallback(
    async (curPtpId) => {
      if (!curPtpId || !userProfile?.userId || !latitude || !longitude) {
        console.warn("Missing tracking data");
        return;
      }

      const coordsString = `${latitude},${longitude}`;
      const GOOGLE_MAPS_APIKEY = "AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE";

      try {
        // 1. REVERSE GEOCODING
        let areaName = null;

        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordsString}&key=${GOOGLE_MAPS_APIKEY}`;

        const geoResponse = await axios.get(geocodeUrl);

        if (geoResponse?.data?.results?.length > 0) {
          areaName = geoResponse.data.results[0].formatted_address;
          console.log("Area Name:", areaName);
        }

        // 2. BUILD PAYLOAD
        const payload = {
          userId: userProfile?.userId,
          activity: "PTP",
          activityId: curPtpId,
          coordinates: coordsString,
          areaName: areaName,
          lan: data?.loanAccountNumber?.toString(),
          customerAddress: null,
          addressType: null,
          addressCoordinates: null,
          differenceInKm: null,
          exception: null,
        };

        // 3. CALL API
        const response = await apiClient.post(`${BASE_URL}addUserTracker`, payload, {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        });

        console.log("Live Location Tracking Success:", response.data);

      } catch (error) {
        console.error("Live tracking failed:", error);

      }
    },
    [latitude, longitude, data]
  );


  // =============================
  //  FOR DEBUGGING / USE ANYWHERE
  // =============================
  const coordinates = `${latitude},${longitude}`;
  console.log("Coordinates →", coordinates);


  const PTP_TYPES = {
    0: { type: "Foreclosure", mode: "Full", useCharges: false },
    1: { type: "Total Outstanding", mode: "Full", useCharges: false },
    2: { type: "Charges", mode: "", useCharges: true },
    3: { type: "Overdue EMI", mode: "", useCharges: false },
    4: { type: "Settlement", modeBased: true, useCharges: false },
    5: { type: "Other", mode: "", useCharges: false },
    6: { type: "EMI", modeBased: true, useCharges: false },
  };

  const buildPTPPayload = ({
    selIndex,
    mode,
    amount,
    date,
    time,
    followUp,
    data,
    userId,
    allCharges,
    otherCharges,
    DPC,
    chequeBounceCharges,
    latitude,
    longitude,
  }) => {

    const config = PTP_TYPES[selIndex];
    if (!config) throw new Error("Invalid selIndex");

    // Date formatting
    const ptpDate = moment(date).format("YYYY-MM-DD");
    const ptpTime = moment(time).isValid()
      ? moment(time).format("HH:mm")
      : "";

    const followUpDate = moment(followUp)
      .local()
      .format("YYYY-MM-DDTHH:mm");


    // Getting correct mode
    // const ptpMode = config.modeBased ? (mode === 0 ? "Full" : "Partial") : config.mode;
    const ptpMode = config.modeBased
      ? (mode === 0 ? "Full" : "Partial")
      : config.mode || "";


    // Charges
    const charges = config.useCharges ? {
      charges: allCharges,
      chequeBounce: chequeBounceCharges,
      dcpLpp: DPC,
      otherCharges: otherCharges,
    } : {
      charges: null,
      chequeBounce: null,
      dcpLpp: null,
      otherCharges: null,
    };

    return {
      ...charges,
      emiAmount: data?.emiAmount?.toString(),
      fieldPickup: "",
      followUpDate,
      loanAccountNumber: data?.loanAccountNumber?.toString(),
      pendingEmiAmount: data?.pendingEmiAmount?.toString(),
      ptpAmount: amount?.toString(),
      ptpDate,
      ptpMode,
      ptpTime,
      ptpType: config.type,
      remark,
      settlementAmount: data?.settlementAmount?.toString(),
      status: "Pending",
      totalOverdueAmount: data?.totalOverdueAmount?.toString(),
      user: { userId: Number(userId) },
      geoCoordinates:
        latitude && longitude
          ? `${latitude},${longitude}`
          : null,
      subType: "",

    };
  };

  const updateCaseStatus = async (loanAccountNumber) => {
    const role = currentRoles[0];
    const activity = userProfile?.activityType;

    const url =
      role === "CA" ||
        (role === "FA" && activity === "Calling")
        ? "updateMyCaseForInProcessForCA"
        : (role === "FA" && activity === "Field") || role === "DRA"
          ? "updateMyCaseForInProcessForDRA"
          : activity === "Field"
            ? "updateMyCaseForInProcessField"
            : "updateMyCaseForInProcess";

    await apiClient.put(
      `${BASE_URL}${url}/${userProfile.userId}/${loanAccountNumber}`,
      {},
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      }
    );
  };
  // SUCCESS POPUP / TOAST
  // success toast
  const showSuccess = (msg) => {
    setShow(true);
    setStatus("success");
    setType("SUCCESS");
    setHeader("SUCCESS");
    setBody(msg);
    hide();
  };

  // error toast
  const showError = (msg) => {
    setShow(true);
    setStatus("error");
    setType("ERROR");
    setHeader("ERROR");
    setBody(msg);
    hide();
  };

  // CLOSE modal after delay
  const hide = () => {
    setTimeout(() => {
      setShow(false);
    }, 1500);
  };




  const submitPTP = async () => {
    if (!amount || parseInt(amount) <= 0) {
      return showError("Please enter a valid amount");
    }

    if (!remark) {
      return showError("Please enter remark");
    }

    const payload = buildPTPPayload({
      selIndex,
      mode,
      amount,
      date,
      time,
      followUp,
      data,
      userId: userProfile.userId,
      allCharges,
      otherCharges,
      DPC,
      chequeBounceCharges,
      latitude,
      longitude,
    });
    console.log(payload, 'payloadpayload')
    try {
      const response = await apiClient.post(`${BASE_URL}addPtpDetails`, payload, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const newPTP = response.data.data;
      console.log(newPTP, response, 'newPTPnewPTP')
      // Track location
      liveLocationTracking(newPTP.ptpId);

      // Update case
      await updateCaseStatus(payload.loanAccountNumber);

      showSuccess("PTP added successfully");
      getAllPTP();
      setShowPTP(false);
    } catch (err) {
      console.log("submitPTP err:", err);
      showError("Something went wrong");
    }
  };

  const updatePTP = async () => {
    const payload = buildPTPPayload({
      selIndex,
      mode,
      amount,
      date,
      time,
      followUp,
      data,
      userId: userProfile.userId,
      allCharges,
      otherCharges,
      DPC,
      chequeBounceCharges,
      latitude,
      longitude,
    });

    try {
      await apiClient.put(`${BASE_URL}updatePtpDetails/${ptpid}`, payload, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      await updateCaseStatus(payload.loanAccountNumber);

      showSuccess("PTP updated successfully");
      getAllPTP();
      setShowPTP(false);
    } catch (err) {
      console.log("updatePTP err:", err);
      showError("Unable to update");
    }
  };


  // card toggle with animation
  const toggleCard = useCallback((index) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedCardIndex((prev) => (prev === index ? -1 : index));
  }, []);

  // Card press navigate
  const handleCardPress = useCallback((item) => {
    navigation.navigate("ViewPTP", { data: item, alldetail: data });
  }, [navigation]);

  // render item as memoized component
  const PTPCard = memo(({ item, index, expanded, onToggle, onPress }) => {
    const formattedTime = useMemo(() => {
      // item?.ptpTime maybe like "14:30" or Date string — adapt as needed
      if (!item?.ptpTime) return "--:--";
      return moment(item.ptpTime, ["HH:mm", moment.ISO_8601]).format("hh:mm A");
    }, [item]);

    const statusColor = item?.status === "Pending" ? "orange" : item?.status === "Paid" || item?.status === "Success" ? "green" : "#000";

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onPress(item)}
        style={[styles.card, expanded && styles.cardExpanded]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.col}>
            <Text style={styles.ptpType}>{item?.ptpType ?? "—"}</Text>
            <Text style={styles.cardLabel}>{(userProfile?.firstName ?? "") + " " + (userProfile?.lastName ?? "")}</Text>
          </View>

          <View style={[styles.col, styles.colRight]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item?.status === "Paid" ? "Paid" : item?.status === "Success" ? "Success" : item?.status === "Pending" ? "Pending" : "—"}
            </Text>
            <Text numberOfLines={1} style={styles.subSmall}>
              {item?.fieldPickup ? "FieldPickUp" : ""}
            </Text>
          </View>

          <TouchableOpacity onPress={() => onToggle(index)} style={styles.expandTouchable}>
            <Text style={styles.expandIcon}>{expanded ? "▲" : "▼"}</Text>
          </TouchableOpacity>
        </View>

        {expanded && (
          <View style={styles.cardBody}>
            <View style={styles.cardCol}>
              <Text style={styles.smallLabel}>Date</Text>
              <Text style={styles.smallValue}>{moment(item?.ptpDate).format("DD-MMM-YYYY")}</Text>
            </View>

            <View style={styles.cardCol}>
              <Text style={styles.smallLabel}>Time</Text>
              <Text style={styles.smallValue}>{formattedTime}</Text>
            </View>

            <View style={styles.cardCol}>
              <Text style={styles.smallLabel}>Amount</Text>
              <View style={styles.amountRow}>
                <View style={styles.rupeeCircle}>
                  <Image source={require("../../../asset/TrueBoardIcon/rupee.png")} style={styles.rupeeIcon} />
                </View>
                <Text style={styles.amountValue}>
                  {item?.ptpAmount ? parseFloat(item.ptpAmount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "--"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  });

  // renderCard for FlatList
  const renderCard = useCallback(({ item, index }) => {
    const expanded = expandedCardIndex === index;
    return (
      <PTPCard
        key={keyExtractor(item, index)}
        item={item}
        index={index}
        expanded={expanded}
        onToggle={toggleCard}
        onPress={handleCardPress}
      />
    );
  }, [expandedCardIndex, toggleCard, handleCardPress]);

  // Example: you should populate ptpData from props or API in useEffect
  useEffect(() => {
    // placeholder: set an empty array if not provided
    if (!Array.isArray(ptpData)) setPtpData([]);
  }, []);

  // responsive list empty component
  const ListEmptyComponent = useCallback(() => (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyText}>No PTPs available</Text>
    </View>
  ), []);

  useEffect(() => {
    getAllPTP();
  }, [])
  const getAllPTP = useCallback(async () => {
    try {
      const response = await apiClient.get(
        `${BASE_URL}getAllPtpDetailsByLoanAccountNumber/${data.loanAccountNumber}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      const list = response?.data?.data ?? [];
      console.log("PTP LIST ->", list);

      setPtpData(list);
    } catch (error) {
      console.log("getAllPTP error:", error);
    } finally {

    }
  }, [data?.loanAccountNumber, token]);

  const renderPTPForm = () => (
    <>
      <View style={styles.card}>
        <SectionHeader title="Pending Dues" />
        <CurrencyRow label="Total Overdue Amount" value={data?.totalOverdueAmount} />
        <CurrencyRow label="Pending EMI Amount" value={data?.pendingEmiAmount} dark />
        <CurrencyRow label="EMI Amount" value={data?.emiAmount} />
        <CurrencyRow label="Charges" value={allCharges} dark />
        <CurrencyRow label="Settlement Amount" value={data?.settlementAmount} />
      </View>

      <FieldLabel label="Type" required />
      <View style={styles.typeRowWrap}>
        {["Foreclosure", "Total Overdue", "Charges", "Overdue EMI", "Settlement", "Others", "EMI"].map(
          (t, i) => (
            <TypeButton
              key={t}
              title={t}
              index={i}
              selIndex={selIndex}
              onPress={() => handleTypeSelection(i)}
            />
          )
        )}
      </View>

      {(selIndex === 4 || selIndex === 6) && (
        <>
          <FieldLabel label="Measure" required />
          <View style={styles.measureRow}>
            <SmallButton title="Full" active={mode === 0} onPress={setModeFull} />
            <SmallButton title="Partial" active={mode === 1} onPress={() => setMode(1)} />
          </View>
        </>
      )}

      {selIndex === 2 && (
        <>
          <FieldLabel label="Charges Type" required />
          <ChargesCheckbox label="Other Charges" checked={otChrg} onToggle={handleOtherCharges} />
          <ChargesCheckbox label="DPC / LPP" checked={dpc} onToggle={handleDPC} />
          <ChargesCheckbox label="Cheque Bounce" checked={chqBnc} onToggle={handleChequeBounce} />
        </>
      )}

      <FieldLabel label="Amount" required />
      <TextInput
        placeholder=""
        placeholderTextColor={theme.light.commentPlaceholder}
        selectionColor={Primary}
        keyboardType="numeric"
        editable={!isAmountLocked}
        value={amount || ""}
        onChangeText={handleAmountInput}
        style={[styles.input, isAmountLocked && styles.inputDisabled]}
      />

      <FieldLabel label="PTP Date" required />
      <DateInput value={moment(date).format("ll")} onPress={() => openPicker("date")} />

      <FieldLabel label="PTP Time" required />
      <DateInput value={moment(time).format("LT")} onPress={() => openPicker("time")} />

      <FieldLabel label="Follow Up Date & Time" required />
      <DateInput value={moment(followUp).format("DD-MM-YYYY hh:mm A")} onPress={() => openPicker("datetime")} />

      <FieldLabel label="Payment Type" required />
      <View style={styles.paymentRow}>
        <SmallButton title="Pick Up" active={paymentType === 0} onPress={() => setPaymentType(0)} />
        <SmallButton title="Self Pay" active={paymentType === 1} onPress={() => setPaymentType(1)} />
      </View>

      <FieldLabel label="Remarks" required />
      <TextInput
        style={styles.remarkInput}
        value={remark}
        onChangeText={setRemark}
        multiline
      />

      <View style={styles.btnRow}>
        <PrimaryButton title="Cancel" onPress={() => setShowPTP(false)} />
        <PrimaryButton title={fromScreen === "ViewPTP" ? "Update" : "Submit"} onPress={handlePress} loading={loading} />
      </View>

      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode={pickerMode}
        date={getPickerDate()}
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible(false)}
      />
    </>
  );



  return (
    <>
      {/* MODE 1 — FORM (showPTP = true) */}
      {showPTP ? (
        <ScrollView
          style={styles.container}
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          {renderPTPForm()}
        </ScrollView>
      ) : (
        /* MODE 2 — LIST (showPTP = false) */
        <View style={{ flex: 1, margin: 6 }}>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowPTP(true)}>
            <Text style={styles.addBtnText}>Add PTP</Text>
          </TouchableOpacity>

          <FlatList
            data={ptpData}
            renderItem={renderCard}
            keyExtractor={keyExtractor}
            ListEmptyComponent={ListEmptyComponent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={ptpData.length ? undefined : { flexGrow: 1 }}
          />
        </View>
      )}

      {show && (
        <ToastNotification
          isModalVisible={true}
          type={type}
          header={header}
          body={body}
        />
      )}
    </>

  )
};

export default PTP;

/* ----------------------------
   Subcomponents (memoized)
   ---------------------------- */

const SectionHeader = memo(({ title }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
));

const FieldLabel = memo(({ label, required }) => (
  <Text style={styles.fieldLabel}>
    {label}
    {required && <Text style={{ color: "red" }}>*</Text>}
  </Text>
));

const CurrencyRow = memo(({ label, value, dark }) => (
  <View style={[styles.currencyRow, dark && styles.currencyRowDark]}>
    <Text style={styles.currencyLabel}>{label}</Text>
    <View style={styles.currencyValueWrap}>
      {value > 0 && (
        <View style={styles.rupeeCircle}>
          <Image source={require("../../../asset/icon/rupee.png")} style={styles.rupeeIcon} />
        </View>
      )}
      <Text style={styles.currencyValue}>{formatCurrency(value)}</Text>
    </View>
  </View>
));

const TypeButton = memo(({ title, index, selIndex, onPress }) => (
  <TouchableOpacity
    onPress={() => onPress(index)}
    style={[styles.typeBtn, selIndex === index && styles.typeBtnActive]}
    activeOpacity={0.85}
  >
    <Text style={[styles.typeBtnText, selIndex === index && styles.typeBtnTextActive]}>{title}</Text>
  </TouchableOpacity>
));

const SmallButton = memo(({ title, active, onPress }) => (
  <TouchableOpacity onPress={onPress} style={[styles.smallBtn, active && styles.smallBtnActive]} activeOpacity={0.85}>
    <Text style={[styles.smallBtnText, active && styles.smallBtnTextActive]}>{title}</Text>
  </TouchableOpacity>
));

const ChargesCheckbox = memo(({ label, checked, onToggle }) => (
  <View style={styles.chargesRow}>
    <BouncyCheckbox isChecked={checked} fillColor={theme.light.darkBlue} onPress={(c) => onToggle(!checked)} />
    <Text style={styles.chargesLabel}>{label}</Text>
  </View>
));

const DateInput = memo(({ value, onPress }) => (
  <TouchableOpacity style={styles.input} onPress={onPress} activeOpacity={0.8}>
    <Text style={styles.fakeInputText}>{value}</Text>
  </TouchableOpacity>
));

const PrimaryButton = memo(({ title, onPress, loading }) => (
  <TouchableOpacity onPress={onPress} style={styles.primaryBtn} disabled={loading} activeOpacity={0.85}>
    {loading ? <ActivityIndicator color={White || "#fff"} /> : <Text style={styles.primaryBtnText}>{title}</Text>}
  </TouchableOpacity>
));

/* ----------------------------
   Styles (size-matters)
   ---------------------------- */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: scale(10),
    paddingBottom: verticalScale(24),
    backgroundColor: white || "#fff",
  },

  list: {
    marginTop: verticalScale(12),
  },

  // Card
  card: {
    marginTop: verticalScale(12),
    borderWidth: 1,
    borderColor: theme.light.activeChatText,
    borderRadius: scale(8),
    backgroundColor: white || "#fff",
    padding: scale(8),
    minHeight: ITEM_HEIGHT,
    justifyContent: "center",
  },
  cardExpanded: {
    // no fixed height; rely on content
    paddingBottom: verticalScale(12),
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  col: {
    flex: 1,
  },
  colRight: {
    alignItems: "flex-end",
  },
  ptpType: {
    fontSize: ms(14),
    fontWeight: "700",
    color: theme.light.black,
  },
  cardLabel: {
    marginTop: verticalScale(4),
    fontSize: ms(12),
    color: "#556",
  },
  statusText: {
    fontSize: ms(16),
    fontWeight: "600",
  },
  subSmall: {
    marginTop: verticalScale(2),
    fontSize: ms(12),
    color: theme.light.black,
  },
  expandTouchable: {
    paddingHorizontal: scale(8),
    justifyContent: "center",
  },
  expandIcon: {
    fontSize: ms(14),
    color: "#333",
  },

  // expanded body
  cardBody: {
    marginTop: verticalScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardCol: {
    width: (width - scale(40)) / 3 - scale(6),
  },
  smallLabel: {
    fontSize: ms(12),
    color: "#667",
  },
  smallValue: {
    marginTop: verticalScale(6),
    fontSize: ms(13),
    fontWeight: "700",
    color: '#000'
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: verticalScale(6),
  },
  amountValue: {
    fontSize: ms(14),
    fontWeight: "700",
    color: '#000'
  },

  // rupee
  rupeeCircle: {
    width: scale(18),
    height: scale(18),
    borderRadius: 100,
    backgroundColor: "#001D56",
    justifyContent: "center",
    alignItems: "center",
    marginRight: scale(6),
  },
  rupeeIcon: {
    width: scale(12),
    height: scale(12),
    tintColor: "#fff",
  },

  // Section header
  sectionHeader: {
    backgroundColor: theme.light.darkBlue,
    padding: verticalScale(10),
    paddingHorizontal: scale(12),
    borderRadius: scale(6),
  },
  sectionTitle: {
    fontSize: ms(16),
    fontWeight: "700",
    color: White || "#fff",
  },

  // Currency rows
  currencyRow: {
    flexDirection: "row",
    padding: verticalScale(10),
    alignItems: "center",
    justifyContent: "space-between",
  },
  currencyRowDark: {
    backgroundColor: "#E9EEF2",
  },
  currencyLabel: {
    width: "55%",
    fontSize: ms(13),
    color: "#001D56",
  },
  currencyValueWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  currencyValue: {
    fontSize: ms(14),
    fontWeight: "700",
    color: "#001D56",
  },

  // Field label
  fieldLabel: {
    marginTop: verticalScale(12),
    fontSize: ms(15),
    fontWeight: "700",
    color: theme.light.black,
  },

  // Type buttons
  typeRowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: verticalScale(8),
  },
  typeBtn: {
    minWidth: (width - scale(48)) / 3,
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    backgroundColor: theme.light.searchContainerColor,
    margin: scale(4),
    alignItems: "center",
    justifyContent: "center",
  },
  typeBtnActive: {
    backgroundColor: theme.light.darkBlue,
  },
  typeBtnText: {
    fontSize: ms(12),
    fontWeight: "600",
    color: "#001D56",
  },
  typeBtnTextActive: {
    color: white || "#fff",
  },

  // small buttons
  measureRow: {
    flexDirection: "row",
    marginTop: verticalScale(8),
  },
  smallBtn: {
    width: scale(110),
    paddingVertical: verticalScale(8),
    borderRadius: scale(8),
    backgroundColor: theme.light.searchContainerColor,
    alignItems: "center",
    marginRight: scale(10),
  },
  smallBtnActive: {
    backgroundColor: theme.light.darkBlue,
  },
  smallBtnText: {
    fontSize: ms(13),
    fontWeight: "700",
    color: "#001D56",
  },
  smallBtnTextActive: {
    color: white || "#fff",
  },

  // charges
  chargesRow: {
    flexDirection: "row",
    // alignItems: "center",
    marginTop: verticalScale(10),
  },
  chargesLabel: {
    fontSize: ms(13),
    fontWeight: "700",
    color: theme.light.black,
    marginLeft: scale(8),
    // backgroundColor: 'red'
  },

  // inputs
  input: {
    borderWidth: 1,
    borderRadius: scale(8),
    borderColor: theme.light.activeChatText,
    backgroundColor: "#ffffff",
    padding: scale(12),
    marginTop: verticalScale(8),
    color: '#000'
  },
  inputDisabled: {
    backgroundColor: theme.light.searchContainerColor,
  },
  fakeInputText: {
    color: theme.light.commentPlaceholder,
    fontSize: ms(13),
  },

  paymentRow: {
    flexDirection: "row",
    marginTop: verticalScale(8),
  },

  remarkInput: {
    borderWidth: 1,
    borderRadius: scale(8),
    padding: scale(12),
    backgroundColor: "#fff",
    minHeight: verticalScale(80),
    textAlignVertical: "top",
    marginTop: verticalScale(8),
    color: '#000'
  },

  btnRow: {
    flexDirection: "row",
    marginTop: verticalScale(16),
    marginBottom: verticalScale(20),
    gap: scale(12),
  },

  primaryBtn: {
    flex: 1,
    height: verticalScale(48),
    borderRadius: scale(8),
    backgroundColor: theme.light.darkBlue,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: White || "#fff",
    fontSize: ms(16),
    fontWeight: "800",
  },

  addBtn: {
    marginTop: verticalScale(8),
    backgroundColor: "#001D56",
    width: width * 0.32,
    borderRadius: scale(8),
    paddingVertical: verticalScale(8),
    alignSelf: "flex-end",
    alignItems: "center",
  },
  addBtnText: {
    fontSize: ms(15),
    fontWeight: "700",
    color: "#FFFFFF",
  },

  emptyWrap: {
    padding: verticalScale(40),
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: ms(14),
    color: "#777",
  },
});
