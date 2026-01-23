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
  Text,
  TouchableOpacity,
  Image,
  Animated,
  FlatList,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
  RefreshControl,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { scale, verticalScale, moderateScale as ms } from "react-native-size-matters";
import { useNavigation, useRoute } from "@react-navigation/native";
import moment from "moment";
import { theme } from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';

const { width, height } = Dimensions.get("screen");

// ======================================================================
// MAIN SCREEN
// ======================================================================
const EventHistory = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { data1 } = route.params;

  const token = useSelector((s) => s.auth.token);

  const flatListRef = useRef();
  const scrollX = useRef(new Animated.Value(0)).current;

  const [currIndex, setCurrIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [evidenceData, setEvidenceData] = useState("");
  const [activity, setActivity] = useState([]);
  const [communication, setCommunication] = useState([]);
  const [callSummaryData, setCallSummaryData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  console.log(activity, 'activityactivity')
  // Single expanded card index
  const [expandedItem, setExpandedItem] = useState(null);
  const toggleExpand = (index) => {
    setExpandedItem((prev) => (prev === index ? null : index));
  };

  const apiHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ======================================================================
  // API CALLS
  // ======================================================================
  const loadCallSummary = async () => {
    try {
      const res = await apiClient.get(
        `getCallHistoryByLan/${data1.loanAccountNumber}`,
        { headers: apiHeaders }
      );
      setCallSummaryData(res.data?.data || []);
    } catch (err) {
      console.log("call summary error:", err);
    }
  };

  const loadActivityHistory = async () => {
    try {
      const lan = data1.loanAccountNumber;

      const [, communicationRes] = await Promise.all([
        apiClient.get(
          `getAllActivityHistoryByLoanAccountNumber/${lan}`,
          { headers: apiHeaders }
        ),
        apiClient.get(
          `communicationHistoryByLan/${lan}`,
          { headers: apiHeaders }
        ),
      ]);

      setCommunication(communicationRes?.data?.data ?? []);
    } catch (err) {
      console.log("activityHistory ERR:", err);
    }
  };

  const activityHistory = useCallback(async () => {
    try {
      // dispatch(showLoader(true));
      setRefreshing(true);


      const lan = data1?.loanAccountNumber;

      // Fetch both in PARALLEL → much faster
      const [activityRes, commRes] = await Promise.all([
        apiClient.get(`getAllActivityHistoryByLoanAccountNumber/${lan}`,
          { headers: apiHeaders }
        ),
        apiClient.get(`communicationHistoryByLan/${lan}`,
          { headers: apiHeaders }
        )
      ]);

      const activityList = activityRes?.data?.data || [];
      const communicationList = commRes?.data?.data || [];
      console.log(activityRes, commRes, data1?.loanAccountNumber, 'commRescommRes')
      setActivity(activityList);
      setCommunication(communicationList);
    } catch (err) {
      console.log("activityHistory error:", err);
    } finally {
      setRefreshing(false);
      // dispatch(showLoader(false));
    }
  }, [data1?.loanAccountNumber]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await Promise.all([loadActivityHistory(), loadCallSummary(), activityHistory()]);
    } finally {
      setRefreshing(false);
    }
  };


  useEffect(() => {
    onRefresh();
  }, []);
  const RowActivity = ({ lLabel, lValue, rLabel, rValue }) => (
    <View style={styles.row2}>
      <View style={styles.col}>
        <Text style={styles.label}>{lLabel}</Text>
        <Text style={styles.value}>{lValue}</Text>
      </View>

      <View style={styles.col}>
        <Text style={styles.label}>{rLabel}</Text>
        <Text style={styles.value}>{rValue}</Text>
      </View>
    </View>
  );



  const Row2 = ({ leftLabel, leftValue, rightLabel, rightValue }) => (
    <View style={styles.row2}>
      <View style={styles.col}>
        <Text style={styles.label}>{leftLabel}</Text>
        <Text style={styles.value}>{leftValue}</Text>
      </View>

      <View style={styles.col}>
        <Text style={styles.label}>{rightLabel}</Text>
        <Text style={styles.value}>{rightValue}</Text>
      </View>
    </View>
  );


  const Section = ({ label, value }) => (
    <View style={styles.section}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );


  const handleShowEvidence = useCallback(
    async (id, kind = "generic") => {
      if (!id) return;

      try {
        // show loader if you want
        // dispatch(showLoader(true));

        let res;
        switch (kind) {
          case "dispute":
          case "rtp":
            res = await apiClient.get(
              `getEvedenceDetailsByEvedenceId/${id}`,
              { headers: apiHeaders }
            );
            break;

          case "payment":
            res = await apiClient.get(
              `getPaymentDetailsByPaymentId/${id}`,
              { headers: apiHeaders }
            );
            break;

          case "request":
            res = await apiClient.get(
              `getRequestEvidance/${id}`,
              { headers: apiHeaders }
            );
            break;

          case "raiseException":
            res = await apiClient.get(
              `getEvedenceraiseExceptionEvedenceId/${id}`,
              { headers: apiHeaders }
            );
            break;

          default:
            // Try a generic endpoint (if you have) or fallback to dispute
            res = await apiClient.get(
              `getEvedenceDetailsByEvedenceId/${id}`,
              { headers: apiHeaders }
            );
        }

        // ---- parse response ----
        // Your backend earlier used base64 images; adjust below to match actual payload.
        // Try multiple common slots to be resilient:
        const payload = res?.data ?? {};
        const imgBase64 =
          payload?.data?.evidenceBase64 ||
          payload?.data?.image ||
          payload?.data?.evidence ||
          payload?.data; // fallback if API returns raw base64 string

        if (imgBase64) {
          setEvidenceData(imgBase64);
          setModalVisible(true);
        } else {
          // nothing to show — show toast / alert
          Alert.alert("No Evidence", "No evidence available for this item.");
        }
      } catch (err) {
        console.warn("evidence fetch error:", err);
        Alert.alert("Error", "Failed to fetch evidence.");
      } finally {
        // dispatch(showLoader(false));
      }
    },
    [apiHeaders]
  );




  // ======================================================================
  // CARD COMPONENTS
  // ======================================================================
  const ActivityHistoryCard = memo(({ item, index, expandedItem, toggleExpand, onShowEvidence }) => {
    const isExpanded = expandedItem === index;

    const data = useMemo(() => {
      try {
        return typeof item?.data === "string" ? JSON.parse(item.data) : item.data;
      } catch (e) {
        return {};
      }
    }, [item.data]);

    const headerTime = useMemo(() => {
      const time =
        item?.createdTime === item?.lastModifiedTime
          ? item?.createdTime
          : item?.lastModifiedTime;

      return moment(time).format("DD-MM-YYYY hh:mm A");
    }, [item.createdTime, item.lastModifiedTime]);

    const evImage = (
      <Image
        source={require("../../../asset/images/evidanceimg.png")}
        style={styles.evImg}
      />
    );

    // -------------------------------------------------------
    // CARD BODY SWITCH
    // -------------------------------------------------------
    const renderContent = () => {
      switch (item.activityType) {
        /** ------------------------------------------------------ */
        /** SCHEDULE VISIT */
        /** ------------------------------------------------------ */
        case "Schedule Visit":
          return (
            <>
              <RowActivity
                lLabel="Name"
                lValue={`${item?.user?.firstName ?? ""} ${item?.user?.lastName ?? ""}`}
                rLabel="Created Time"
                rValue={`${data?.date?.[2]}-0${data?.date?.[1]}-${data?.date?.[0]} ${data?.time}`}
              />

              <RowActivity
                lLabel="Customer Name"
                lValue={data?.name}
                rLabel="Visit Address"
                rValue={data?.address}
              />

              <RowActivity
                lLabel="Visit Date"
                lValue={`${data?.date?.[2]}-0${data?.date?.[1]}-${data?.date?.[0]}`}
                rLabel="Visit Time"
                rValue={data?.time}
              />

              <RowActivity
                lLabel="Status"
                lValue={data?.status}
                rLabel="Visit Outcome"
                rValue={data?.outcome ?? "---"}
              />

              <Section label="Remarks" value={data?.remark} />
            </>
          );

        /** ------------------------------------------------------ */
        /** DISPUTE / RTP */
        /** ------------------------------------------------------ */
        case "Dispute/RTP":
          return (
            <>
              <RowActivity
                lLabel="Name"
                lValue={`${item?.user?.firstName} ${item?.user?.lastName}`}
                rLabel="Updated Date Time"
                rValue={headerTime}
              />

              <RowActivity
                lLabel="Amount"
                lValue={
                  data?.amount != null
                    ? `₹${Number(data.amount).toFixed(2)}`
                    : "N/A"
                }
                rLabel="Dispute Reason"
                rValue={data?.disputeReason}
              />

              <RowActivity
                lLabel="Dispute Type"
                lValue={data?.disputeType}
                rLabel="Evidence"
                rValue={
                  <TouchableOpacity onPress={() => onShowEvidence?.(data?.disputeOrRtpId)}>
                    {evImage}
                  </TouchableOpacity>
                }
              />

              <Section label="Remarks" value={data?.remark} />
            </>
          );

        /** ------------------------------------------------------ */
        /** PAYMENT */
        /** ------------------------------------------------------ */
        case "Payment":
          return (
            <>
              <RowActivity
                lLabel="Name"
                lValue={`${item?.user?.firstName} ${item?.user?.lastName}`}
                rLabel="Created Time"
                rValue={moment(data?.createdTime).format("DD-MM-YYYY hh:mm A")}
              />

              <RowActivity
                lLabel="Date of Payment"
                lValue={
                  data?.paymentDate
                    ? moment(data.paymentDate).format("DD-MM-YYYY")
                    : "N/A"
                }
                rLabel="Time of Payment"
                rValue={
                  data?.timeOfPayment
                    ? moment(data.timeOfPayment, "HH:mm").format("h:mm A")
                    : "N/A"
                }
              />

              <RowActivity
                lLabel="Amount"
                lValue={
                  data?.amount != null
                    ? `₹${Number(data.amount).toFixed(2)}`
                    : "N/A"
                }
                rLabel="Status"
                rValue={data?.paymentStatus ?? data?.status}
              />

              <RowActivity
                lLabel="Payment Mode"
                lValue={data?.paymentMode}
                rLabel="Payment Type"
                rValue={data?.paymentType}
              />

              {data?.paymentMode !== "Digital" && (
                <RowActivity
                  lLabel="Deposition Status"
                  lValue={data?.depositionStatus}
                  rLabel="Evidence"
                  rValue={
                    <TouchableOpacity onPress={() => onShowEvidence?.(data?.paymentId)}>
                      {evImage}
                    </TouchableOpacity>
                  }
                />
              )}

              <Section
                label={item?.actionPerformed === "Updated" ? "RA Remarks" : "Remarks"}
                value={item?.actionPerformed === "Updated" ? data?.approvedRemark : data?.remark}
              />
            </>
          );

        /** ------------------------------------------------------ */
        /** PTP DETAILS */
        /** ------------------------------------------------------ */
        case "PtpDetail":
          return (
            <>
              <RowActivity
                lLabel="Name"
                lValue={`${item?.user?.firstName} ${item?.user?.lastName}`}
                rLabel="Updated Date Time"
                rValue={headerTime}
              />

              <RowActivity
                lLabel="PTP Amount"
                lValue={
                  data?.ptpAmount != null
                    ? `₹${Number(data.ptpAmount).toFixed(2)}`
                    : "N/A"
                }
                rLabel="PTP Date"
                rValue={data?.ptpDate}
              />

              <RowActivity
                lLabel="PTP Status"
                lValue={data?.status}
                rLabel="PTP Time"
                rValue={
                  data?.ptpTime
                    ? moment(data.ptpTime, "HH:mm").format("h:mm A")
                    : "N/A"
                }
              />

              <Section label="PTP Type" value={data?.ptpType} />
              <Section label="Remarks" value={data?.remark} />
            </>
          );

        /** ------------------------------------------------------ */
        /** RAISE EXCEPTION */
        /** ------------------------------------------------------ */
        case "Raise Exception":
          return (
            <>
              <RowActivity
                lLabel="Name"
                lValue={`${item?.user?.firstName} ${item?.user?.lastName}`}
                rLabel="Updated Date Time"
                rValue={headerTime}
              />

              <RowActivity
                lLabel="Exception Request"
                lValue={data?.request}
                rLabel="Evidence"
                rValue={
                  <TouchableOpacity onPress={() => onShowEvidence?.(data?.raiseExceptionId)}>
                    {evImage}
                  </TouchableOpacity>
                }
              />

              <Section label="Remarks" value={data?.remark} />
            </>
          );

        /** ------------------------------------------------------ */
        /** REQUEST TYPE */
        /** ------------------------------------------------------ */
        case "Request":
          return (
            <>
              <RowActivity
                lLabel="Name"
                lValue={`${item?.user?.firstName} ${item?.user?.lastName}`}
                rLabel="Updated Date Time"
                rValue={headerTime}
              />

              <RowActivity
                lLabel="Request"
                lValue={data?.requestType}
                rLabel="Evidence"
                rValue={
                  <TouchableOpacity onPress={() => onShowEvidence?.(data?.requestId)}>
                    {evImage}
                  </TouchableOpacity>
                }
              />

              {!["Legal", "Repossession", "Case Close", "Unallocate"].includes(
                data?.requestType
              ) && (
                  <RowActivity
                    lLabel="Old Value"
                    lValue={data?.oldValue}
                    rLabel="New Value"
                    rValue={data?.newValue}
                  />
                )}

              <Section label="Status" value={data?.status} />
              <Section label="Remarks" value={data?.remark} />
            </>
          );

        default:
          return <Section label="Info" value="Unknown activity type" />;
      }
    };

    // -------------------------------------------------------
    // CARD UI
    // -------------------------------------------------------
    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <Text style={styles.itemTitle}>{item.activityType}</Text>

          <View style={styles.headerRight}>
            <Text style={styles.itemDate}>{headerTime}</Text>

            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <MaterialCommunityIcons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={26}
                color={theme.light.darkBlue}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* BODY */}
        {isExpanded && <View style={styles.bodyWrap}>{renderContent()}</View>}
      </View>
    );
  });

  // ----------------------------------------------------------
  // CommunicationCard
  // ----------------------------------------------------------
  const CommunicationCard = memo(({ item, index, expandedItem, toggleExpand }) => {
    const isExpanded = expandedItem === index;

    const date = useMemo(
      () => moment(item.createdTime).format("DD-MM-YYYY hh:mm A"),
      [item.createdTime]
    );

    const statusColor =
      item?.data?.paymentStatus === "Approved"
        ? "green"
        : item?.data?.paymentStatus === "Pending"
          ? "orange"
          : item?.data?.paymentStatus === "Rejected"
            ? "red"
            : theme.light.black;

    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <Text style={styles.itemTitle}>{item.historyType}</Text>

          <View style={styles.headerRight}>
            <Text style={styles.itemDate}>{date}</Text>

            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <MaterialCommunityIcons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={26}
                color={theme.light.darkBlue}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* BODY */}
        {isExpanded && (
          <View style={styles.bodyWrap}>

            {/* Row 1: Loan A/C | History Type */}
            <Row2
              leftLabel="Loan A/C No"
              leftValue={item.loanAccountNumber}
              rightLabel="History Type"
              rightValue={item.historyType}
            />

            {/* Row 2: Status | Follow Up Time */}
            <Row2
              leftLabel="Status"
              leftValue={item?.status || "N/A"}
              rightLabel="Follow Up Time"
              rightValue={
                item?.followUp
                  ? moment(item.followUp).format("DD-MM-YYYY hh:mm A")
                  : "N/A"
              }
            />

            {/* Row 3: Message (Full width) */}
            <View style={{ marginTop: 8 }}>
              <Text style={styles.label}>Message</Text>
              <Text style={styles.value}>{item.msg}</Text>
            </View>

          </View>
        )}
      </View>
    );
  });


  // ----------------------------------------------------------
  // CallSummaryCard
  // ----------------------------------------------------------
  const CallSummaryCard = memo(({ item, index, expandedItem, toggleExpand }) => {
    const isExpanded = expandedItem === index;

    const dateValue =
      item.createdTime === item.lastModifiedTime
        ? item.createdTime
        : item.lastModifiedTime;

    const date = useMemo(
      () => moment(dateValue).format("DD-MM-YYYY hh:mm A"),
      [dateValue]
    );

    const statusColor =
      item?.data?.paymentStatus === "Approved"
        ? "green"
        : item?.data?.paymentStatus === "Pending"
          ? "orange"
          : item?.data?.paymentStatus === "Rejected"
            ? "red"
            : theme.light.black;

    return (
      <View style={styles.card}>
        {/* HEADER */}
        <View style={styles.cardHeader}>
          <Text style={styles.itemTitle}>{item.name}</Text>

          <View style={styles.headerRight}>
            <Text style={styles.itemDate}>{date}</Text>

            <TouchableOpacity onPress={() => toggleExpand(index)}>
              <MaterialCommunityIcons
                name={isExpanded ? "chevron-up" : "chevron-down"}
                size={26}
                color={theme.light.darkBlue}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* BODY */}
        {isExpanded && (
          <View style={styles.bodyWrap}>

            {/* Row 1 */}
            <Row2
              leftLabel="Mobile No"
              leftValue={item.number}
              rightLabel="Call Outcome"
              rightValue={item.callOutcome}
            />

            {/* Row 2 */}
            <Row2
              leftLabel="Status"
              leftValue={item.status}
              rightLabel="Follow Up Time"
              rightValue={
                item?.followUp
                  ? moment(item.followUp).format("DD-MM-YYYY hh:mm A")
                  : "N/A"
              }
            />

            {/* Row 3 */}
            {!!item?.remark && (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.label}>Remarks</Text>
                <Text style={styles.value}>{item.remark}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  });




  // ======================================================================
  // RENDERERS
  // ======================================================================

  const renderActivityItem = useCallback(
    ({ item, index }) => (
      <ActivityHistoryCard
        item={item}
        index={index}
        expandedItem={expandedItem}
        toggleExpand={toggleExpand}
        onShowEvidence={handleShowEvidence}
      />
    ),
    [expandedItem]
  );

  const renderCommunicationItem = useCallback(
    ({ item, index }) => (
      <CommunicationCard
        item={item}
        index={index}
        expandedItem={expandedItem}
        toggleExpand={toggleExpand}
      />
    ),
    [expandedItem]
  );

  const renderCallSummaryItem = useCallback(
    ({ item, index }) => (
      <CallSummaryCard
        item={item}
        index={index}
        expandedItem={expandedItem}
        toggleExpand={toggleExpand}
      />
    ),
    [expandedItem]
  );

  const renderActivities = () => (
    <View style={styles.centerBox}>
      <Text>No Activities Found</Text>
    </View>
  );

  const renderActivity = () => (
    <FlatList
      style={styles.listWrap}
      data={activity}
      keyExtractor={(_, i) => String(i)}
      renderItem={renderActivityItem}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );

  const renderCommunication = () => (
    <FlatList
      style={styles.listWrap}
      data={communication}
      keyExtractor={(_, i) => String(i)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={renderCommunicationItem}
    />
  );

  const renderCallSummary = () => (
    <FlatList
      style={styles.listWrap}
      data={callSummaryData}
      keyExtractor={(_, i) => String(i)}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={renderCallSummaryItem}
    />
  );

  // ======================================================================
  // UI RETURN
  // ======================================================================
  return (
    <>
      {/* HEADER */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={ms(22)} color="#444" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Event History</Text>

        <View style={{ width: 25 }} />
      </View> */}

      {/* SEGMENTED TABS */}
      <View style={styles.tabRow}>
        {["Activities", "Communications", "Call Summary"].map((t, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => {
              setCurrIndex(i);
              flatListRef.current?.scrollToOffset({
                offset: width * i,
                animated: true,
              });
            }}
            style={[
              styles.tabBtn,
              currIndex === i && styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                currIndex === i && styles.tabTextActive,
              ]}
            >
              {t}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PAGER */}
      <Animated.FlatList
        ref={flatListRef}
        data={[0, 1, 2]}
        horizontal
        pagingEnabled
        keyExtractor={(i) => String(i)}
        showsHorizontalScrollIndicator={false}
        snapToInterval={width}
        onMomentumScrollEnd={(e) => {
          setCurrIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={{ width, height: height * 0.75 }}>
            {item === 0
              ? renderActivity()
              : item === 1
                ? renderCommunication()
                : renderCallSummary()}
          </View>
        )}
      />

      {/* MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Evidence</Text>

              <Image
                source={{ uri: `data:image/png;base64,${evidenceData}` }}
                style={styles.modalImage}
                resizeMode="contain"
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
};

export default EventHistory;

// ======================================================================
// STYLES
// ======================================================================
const styles = {
  header: {
    height: verticalScale(55),
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: scale(12),
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  headerTitle: {
    fontSize: ms(18),
    fontWeight: "700",
    color: "#000",
  },

  tabRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: verticalScale(10),
    paddingHorizontal: scale(10),
  },

  tabBtn: {
    height: verticalScale(38),
    borderWidth: 1,
    borderColor: theme.light.darkBlue,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: scale(14),
  },

  tabActive: {
    backgroundColor: theme.light.darkBlue,
  },

  tabText: {
    fontSize: ms(12),
    fontWeight: "700",
    color: theme.light.darkBlue,
  },

  tabTextActive: {
    color: "#fff",
  },

  listWrap: {
    paddingHorizontal: scale(8),
  },

  centerBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    elevation: 1,
    backgroundColor: "#fff",
  },

  cardHeader: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#001D56",
  },

  itemDate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginRight: 6,
  },

  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },

  bodyWrap: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  /* ************** TEXT STYLES ************** */
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#001D56",
    marginBottom: 2,
  },

  value: {
    fontSize: 13,
    fontWeight: "500",
    color: "#444",
  },

  /* ************** ROW LAYOUT ************** */
  row2: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  col: {
    width: "48%",
  },

  /* ************** MODAL ************** */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalCard: {
    width: width * 0.85,
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    alignItems: "center",
  },

  modalTitle: {
    fontSize: ms(16),
    fontWeight: "700",
    marginBottom: 10,
  },

  modalImage: {
    width: width * 0.75,
    height: height * 0.5,
  },
};

