// Premium CaseDetails UI v2.0 — Clean, Modern, Polished, Responsive
// Includes: Spacing system, elevation, color hierarchy, component polish
// Premium CaseDetails UI v2.0 — Clean, Modern, Polished, Responsive
// Includes: Spacing system, elevation, color hierarchy, component polish

import React, { useRef, useState, memo, useCallback, useEffect } from "react";
import { View, Text, ScrollView, Image, FlatList, NativeModules, TouchableOpacity, Platform, Dimensions, StyleSheet, Alert, PermissionsAndroid, Linking, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import IntentLauncher from "react-native-intent-launcher";
// import Carousel, { Pagination } from "react-native-snap-carousel";
import { scale, verticalScale, moderateScale } from "react-native-size-matters";
import LinearGradient from "react-native-linear-gradient";
import RNHTMLtoPDF from 'react-native-html-to-pdf'
import RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
// import Share from 'react-native-share';
import moment from 'moment';
import scheduleVisitIcon from "../../../asset/updateicons/schedulevisit.png";
import ptpIcon from "../../../asset/updateicons/ptp.png";
import repaymentIcon from "../../../asset/updateicons/repayment.png";
import eventHistoryIcon from "../../../asset/updateicons/schedulevisit.png";
import paymentIcon from "../../../asset/updateicons/payment.png";
import disputeIcon from "../../../asset/updateicons/rtp.png";
import exceptionIcon from "../../../asset/updateicons/exception.png";
import requestIcon from "../../../asset/updateicons/request.png";
import apiClient from '../../../common/hooks/apiClient';
import { useSelector } from "react-redux";
import FileViewer from 'react-native-file-viewer';
// import { openPdfAuto } from "../utility/pdfOpener";
import { BASE_URL } from "../service/api";
const { width, height } = Dimensions.get("screen");

const SPACING = {
  xs: moderateScale(6),
  sm: moderateScale(10),
  md: moderateScale(14),
  lg: moderateScale(18),
  xl: moderateScale(24),
};

const COLORS = {
  textPrimary: "#111",
  textSecondary: "#555",
  border: "#E0E0E0",
  bgLight: "#FAFAFA",
  white: "#FFFFFF",
  accent: "#FF6600",
};

const { FileProviderModule } = NativeModules;

export const openPdfSecure = async (filePath) => {
  try {
    const contentUri = await FileProviderModule.getContentUri(filePath);

    await IntentLauncher.startActivity({
      action: "android.intent.action.VIEW",
      data: contentUri,
      type: "application/pdf",
      flags: 1 | 2 | 3, // grant read permission
    });
  } catch (e) {
    Alert.alert("PDF Error", "Could not open PDF. Install a PDF reader.");
  }
};

const Row = React.memo(({ label, value, multiline }) => (
  <View style={styles.rowItem}>
    <Text style={styles.label}>{label}</Text>
    <Text
      style={styles.value}
      numberOfLines={multiline ? 4 : 1}
    >
      {value || "-"}
    </Text>
  </View>
));
const carouselData = [
  { id: "1", type: "APPLICANT" },
  { id: "2", type: "CO_APPLICANT" },
  { id: "3", type: "GUARANTOR" },
];

const CaseDetails = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { data, selectedTab } = route.params || {};
  console.log(data, selectedTab, 'DatafromAllocation')
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef(null);
  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);
  const [isPdfLoading, setPdfLoading] = useState(false);
  // const carouselData = [
  //   { label: "Daily", id: "1" },
  //   { label: "Current Week", id: "2" },
  //   { label: "Current Month", id: "3" },
  // ];
  const [lenderDetails, setlenderDetails] = useState({});


  useEffect(() => {
    getLenderApi();
  }, [data]);

  const getLenderApi = async () => {
    // dispatch(showLoader(true));

    try {
      const res = await apiClient.get(`getLender/${data?.lenderId}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const apiData = res?.data?.data ?? null;
      setlenderDetails(apiData);
    } catch (err) {
      console.log("❌ getLenderApi error:", err?.message || err);
    } finally {
      // dispatch(showLoader(false));
    }
  };

  const safe = (val) => escapeHtml(String(val ?? "-"));
  const escapeHtml = (str = "") =>
    str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const formatCurrency = (num) =>
    Number(num || 0).toLocaleString("en-IN");


  const buildHtml = (stat = {}, data = {}) => {
    const payments = Array.isArray(stat.paymentStats) ? stat.paymentStats.slice(0, 200) : [];
    const ptps = Array.isArray(stat.ptpStats) ? stat.ptpStats.slice(0, 200) : [];
    const raises = Array.isArray(stat.raiseExceptionStats) ? stat.raiseExceptionStats.slice(0, 200) : [];
    const disputes = Array.isArray(stat.disputeOrRtpStatsDto) ? stat.disputeOrRtpStatsDto.slice(0, 200) : [];

    return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>

<style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 16px;
    color: #1a1a1a;
    background: #fafafa;
  }

  /* ---------- WATERMARK ---------- */
  body::before {
    content: "AFPL";
    position: fixed;
    top: 30%;
    left: 10%;
    font-size: 120px;
    font-weight: 900;
    color: rgba(0,0,0,0.05);
    transform: rotate(-25deg);
    z-index: -1;
  }

  /* ---------- HEADER ---------- */
  .header {
    padding: 12px 16px;
    background: #001d56;
    color: white;
    font-size: 20px;
    font-weight: 700;
    border-radius: 6px;
    margin-bottom: 18px;
    text-align: center;
  }

  /* ---------- SECTIONS ---------- */
  .section-title {
    font-size: 17px;
    font-weight: 700;
    margin: 20px 0 10px;
    padding-bottom: 4px;
    border-bottom: 2px solid #001d56;
    color: #001d56;
  }

  /* ---------- TABLES ---------- */
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 12px;
    font-size: 13px;
    background: white;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0px 2px 5px rgba(0,0,0,0.07);
  }

  th {
    background: #f0f3ff;
    padding: 8px;
    text-align: left;
    font-weight: 700;
    border-bottom: 1px solid #dfe4ff;
  }

  td {
    padding: 8px;
    border-bottom: 1px solid #efefef;
    vertical-align: top;
  }

  tr:last-child td {
    border-bottom: 0;
  }

  /* ---------- BADGES ---------- */
  .badge {
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    color: white;
  }
  .badge-green { background: #008e3b; }
  .badge-red { background: #e53935; }
  .badge-blue { background: #1e88e5; }
  .badge-grey { background: #666; }

  /* ---------- FOOTER ---------- */
  .footer {
    margin-top: 40px;
    font-size: 12px;
    color: #666;
    text-align: center;
  }
</style>
</head>

<body>

<div class="header">STAT CARD — ${safe(data.loanAccountNumber)}</div>

<!-- ───────────────────────────────────────── -->
<h3 class="section-title">Customer Profile</h3>
<table>
  <tr><th>Name</th><td>${safe(data.name)}</td></tr>
  <tr><th>Primary Mobile</th><td>${safe(data.mobile)}</td></tr>
  <tr><th>Pincode</th><td>${safe(data.pincode)}</td></tr>
  <tr><th>Bucket</th><td>${safe(data.bucket)}</td></tr>
</table>

<!-- ───────────────────────────────────────── -->
<h3 class="section-title">Loan Details</h3>
<table>
  <tr><th>Loan Account No</th><td>${safe(data.loanAccountNumber)}</td></tr>
  <tr><th>Loan Amount</th><td>₹ ${formatCurrency(data.loanAmount)}</td></tr>
  <tr><th>EMI</th><td>₹ ${formatCurrency(data.emiAmount)}</td></tr>
  <tr><th>Pending EMI</th><td>₹ ${formatCurrency(data.pendingEmiAmount)}</td></tr>
  <tr><th>DPD</th><td>${safe(data.dpd)}</td></tr>
</table>

<!-- ───────────────────────────────────────── -->
<h3 class="section-title">Payments (${payments.length})</h3>
<table>
  <tr><th>Date</th><th>Amount</th><th>Type</th><th>Mode</th><th>Status</th></tr>
  ${payments.map(p => `
    <tr>
      <td>${safe(p.paymentDate)}</td>
      <td>₹ ${formatCurrency(p.paymentAmount)}</td>
      <td>${safe(p.paymentType)}</td>
      <td>${safe(p.paymentMode)}</td>
      <td>
        <span class="badge ${p.paymentStatus?.toLowerCase() === "success" ? "badge-green" :
        p.paymentStatus?.toLowerCase() === "failed" ? "badge-red" :
          "badge-blue"
      }">${safe(p.paymentStatus)}</span>
      </td>
    </tr>
  `).join("")}
</table>

<!-- ───────────────────────────────────────── -->
<h3 class="section-title">PTP (${ptps.length})</h3>
<table>
  <tr><th>Amount</th><th>Date</th><th>Status</th><th>Type</th></tr>
  ${ptps.map(i => `
    <tr>
      <td>₹ ${formatCurrency(i.ptpAmount)}</td>
      <td>${safe(i.ptpDate)}</td>
      <td>${safe(i.ptpStatus)}</td>
      <td>${safe(i.ptpType)}</td>
    </tr>
  `).join("")}
</table>

<!-- ───────────────────────────────────────── -->
<h3 class="section-title">Raise Exception (${raises.length})</h3>
<table>
  <tr><th>Date</th><th>Time</th><th>Request</th></tr>
  ${raises.map(i => `
    <tr>
      <td>${safe(i.raiseExceptionDate)}</td>
      <td>${safe(i.time)}</td>
      <td>${safe(i.request)}</td>
    </tr>
  `).join("")}
</table>

<!-- ───────────────────────────────────────── -->
<h3 class="section-title">Dispute / RTP (${disputes.length})</h3>
<table>
  <tr><th>Date</th><th>Time</th><th>Reason</th></tr>
  ${disputes.map(i => `
    <tr>
      <td>${safe(i.time)}</td>
      <td>${safe(i.time)}</td>
      <td>${safe(i.reason)}</td>
    </tr>
  `).join("")}
</table>

<!-- ───────────────────────────────────────── -->
<div class="footer">
  Generated on ${moment().format("DD-MM-YYYY HH:mm")}<br/>
  This is a system-generated document.
</div>

</body>
</html>`;
  };

  // Android MediaStore API for scoped storage
  const createPDF = async () => {
    try {
      setPdfLoading(true);  // 🔥 SHOW LOADER
      if (!data?.loanAccountNumber) {
        Alert.alert("Missing LAN", "Loan number is required.");
        return;
      }

      // 1) fetch stats
      const res = await apiClient.get(`getStatsByLan/${data.loanAccountNumber}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const stat = res?.data?.data ?? {};
      const html = buildHtml(stat, data);

      const safeName = `STAT_${String(data.loanAccountNumber).replace(/[^a-z0-9_-]/gi, "_")}`;

      // 2) generate PDF
      const file = await RNHTMLtoPDF.convert({
        html,
        fileName: safeName,
        base64: false,
        directory: "Documents", // avoids /data/user/0 problem
      });

      const generatedPath = file.filePath;
      console.log("Generated PDF path:", generatedPath);

      if (!generatedPath) throw new Error("PDF not generated");

      // 3) COPY to external storage (required for RNFetchBlob + MediaStore)
      const externalPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${safeName}.pdf`;

      await RNFS.copyFile(generatedPath, externalPath);
      console.log("Copied to:", externalPath);

      // 4) SAVE IN DOWNLOADS (MediaStore)
      await RNFetchBlob.android.addCompleteDownload({
        title: `${safeName}.pdf`,
        description: "STAT Card PDF",
        mime: "application/pdf",
        path: externalPath,  // MUST be external path
        showNotification: true,
      });

      await openPdfSecure(externalPath);

    } catch (err) {
      console.error("createPDF error", err);
      Alert.alert("Error", err?.message || "Failed to create PDF");
    } finally {
      setPdfLoading(false)
    }
  };
  const getCardDataByType = (type, data) => {
    switch (type) {
      case "APPLICANT":
        return {
          title: data?.name,
          mobile: data?.mobile,
          address: data?.primaryAddress,
          pincode: data?.pincode,
          bucket: data?.bucket,
          lan: data?.loanAccountNumber,
          overdue: data?.totalOverdueAmount,
        };

      case "CO_APPLICANT":
        return {
          title: data?.coApplicantName,
          mobile: data?.coApplicantMobile,
          address: data?.coApplicantAddress,
          email: data?.coApplicantEmail,
        };

      case "GUARANTOR":
        return {
          title: data?.guarantorName,
          mobile: data?.guarantorMobile,
          address: data?.guarantorAddress,
          email: data?.guarantorEmail,
        };

      default:
        return {};
    }
  };

  const renderCarouselItem = ({ item }) => {
    const cardData = getCardDataByType(item.type, data);

    return (
      <View style={styles.cardContainer}>
        <Image
          source={require("../../../asset/images/user1.jpeg")}
          style={styles.avatar}
        />

        <View style={styles.cardContent}>
          <Text style={styles.titleText}>
            {cardData?.title || "-"}
          </Text>

          {/* Mobile */}
          <Row label="Mobile No:-" value={cardData?.mobile} />

          {/* Address */}
          <Row
            label="Address:-"
            value={cardData?.address}
            multiline
          />

          {/* Email (CO & GUARANTOR only) */}
          {cardData?.email !== undefined && (
            <Row label="Email:-" value={cardData?.email || "-"} />
          )}

          {/* Applicant-only fields */}
          {item.type === "APPLICANT" && (
            <>
              <Row label="LAN:-" value={cardData?.lan} />
              <Row label="Pincode:-" value={cardData?.pincode} />
              <Row label="Bucket:-" value={cardData?.bucket} />
              <Row
                label="Overdue:-"
                value={`₹ ${cardData?.overdue || 0}`}
              />
            </>
          )}
        </View>
      </View>
    );
  };


  const ProfileButton = memo(({ title, onPress, icon }) => {
    return (
      <LinearGradient colors={[COLORS.white, COLORS.bgLight, "#FFFFFF", "#DDDBDBFF",]} style={styles.gradient}>
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.85}
          style={{ alignItems: 'center' }}
        >

          {!!icon && <Image source={icon} style={[styles.iconrupee, {
            width: scale(18),
            height: scale(18),
          }]} />}
          <Text numberOfLines={2} style={[styles.title,]}>
            {title}
          </Text>

        </TouchableOpacity>
      </LinearGradient>
    );
  });

  // --------------------- INFO CARD (PREMIUM) ----------------------
  const InfoCard = ({ label, value, showRupee = false }) => {
    if (value == null || value === "null") return null;
    const formatted = showRupee ? Number(value).toLocaleString("en-IN") : value;

    return (
      <View style={styles.infoCard}>
        <Text style={styles.infoCardLabel}>{label}</Text>
        <View style={styles.infoCardValueRow}>
          {showRupee &&
            <View style={styles.iconCircle}>
              <Image source={require("../../../asset/icon/rupee.png")} style={styles.rupeeIcon} />
            </View>
          }
          <Text style={styles.infoCardValue}>{formatted}</Text>
        </View>
      </View>
    );
  };

  // --------------------- INFO ROW ----------------------
  const InfoRow = ({ label, value }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoRowLabel}>{label}</Text>
      <Text style={styles.infoRowValue}>{value || "-"}</Text>
    </View>
  );

  // --------------------- BUTTONS ----------------------
  const buttons = [
    { title: "Schedule Visit", icon: scheduleVisitIcon, onPress: () => navigation.navigate("ScheduleVisit", { data }) },
    { title: "PTP", icon: ptpIcon, onPress: () => navigation.navigate("PTP", { data }) },
    { title: "Repayment Info", icon: repaymentIcon, onPress: () => navigation.navigate("RepaymentInfo", { data }) },
    { title: "Event History", icon: eventHistoryIcon, onPress: () => navigation.navigate("EventHistory", { data1: data }) },
    { title: "Payment", icon: paymentIcon, onPress: () => navigation.navigate("Payment", { data, fromScreen: 'caseDetails' }) },
    { title: "Dispute/RTP", icon: disputeIcon, onPress: () => navigation.navigate("Dispute", { data }) },
    { title: "Raise Exception", icon: exceptionIcon, onPress: () => navigation.navigate("RaiseException", { data }) },
    { title: "Request", icon: requestIcon, onPress: () => navigation.navigate("Requet", { data }) },
  ];


  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems?.length > 0) {
      setActiveSlide(viewableItems[0].index);
    }
  }).current;

  const viewConfigRef = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;

  const ITEM_WIDTH = width * 0.9;

  const renderItem = useCallback(
    ({ item }) => renderCarouselItem({ item }),
    [data]
  );
  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ backgroundColor: COLORS.white }}>

      {/* ------------------ CAROUSEL ------------------ */}
      <View style={styles.sectionWrapper}>
        {/* ✅ CAROUSEL */}
        <FlatList
          ref={carouselRef}
          data={carouselData}
          horizontal
          pagingEnabled
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}   // ✅ stable key
          renderItem={renderItem}
          contentContainerStyle={{
            paddingHorizontal: width * 0.05,
          }}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewConfigRef.current}
          removeClippedSubviews
          initialNumToRender={1}
          maxToRenderPerBatch={2}
          windowSize={3}
        />

        {/* ✅ PAGINATION */}
        <View style={styles.pagination}>
          {carouselData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                activeSlide === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>
      {isPdfLoading && (
        <View style={styles.loaderOverlay}>
          <View style={styles.loaderBox}>
            <ActivityIndicator size="large" color="#0047AB" />
            <Text style={styles.loaderText}>Generating PDF...</Text>
          </View>
        </View>
      )}

      {/* ------------------ PROFILE SECTION ------------------ */}
      <Text style={styles.sectionTitle}>Customer Profile</Text>
      <View style={styles.row}>
        <ProfileButton title="Application Data" onPress={() => navigation.navigate('ApplicationData', { data, section: "application", })} />
        <ProfileButton title="Loan History" onPress={() => navigation.navigate('ApplicationData', { data, section: "loanhistory", })} />
        <ProfileButton title="Contact Centre" onPress={() => navigation.navigate('ContactCenter', { data, maskingMobileNum: lenderDetails?.maskingMobileNo, })} />
      </View>

      <View style={styles.row}>
        <ProfileButton title="Collateral Details" onPress={() => navigation.navigate('CollateralDetails', { data })} />
        <ProfileButton title="Stat Card" icon={require('../../../asset/TrueBoardIcon/SC.png')} onPress={() => createPDF()} />
      </View>

      {/* ------------------ COLLECTION STATUS ------------------ */}
      <Text style={styles.sectionTitle}>Collection Status</Text>
      <View style={styles.collectionCard}>
        <View style={styles.rowBetween}>
          <InfoCard label="Total Overdue Amount" value={data?.totalOverdueAmount} showRupee />
          <InfoCard label="Pending EMI Amount" value={data?.pendingEmiAmount} showRupee />
        </View>
        <View style={styles.rowBetween}>
          <InfoCard label="Principal Outstanding" value={data?.totalOutstandingPrincipal} showRupee />
          <InfoCard label="DPD/Bucket" value={`${data?.dpd || "-"} / ${data?.bucket || "-"}`} />
        </View>
        {data?.lastVisitDate && <InfoRow label="Last Visit Date" value={data?.lastVisitDate} />}
      </View>

      {/* ------------------ CASE ACTIVITY ------------------ */}
      <Text style={styles.sectionTitle}>Case Activity</Text>
      <View style={styles.buttonGrid}>
        {buttons.map((btn, i) => (
          <TouchableOpacity key={i} activeOpacity={0.85} onPress={btn.onPress} style={styles.actionButtonWrapper}>
            <LinearGradient colors={["#FFFFFF", "#F4F2F2"]} style={styles.actionButton}>
              <Image source={btn.icon} style={styles.actionIcon} />
              <Text style={styles.actionTitle} numberOfLines={2}>{btn.title}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>

    </ScrollView>
  );
};

export default CaseDetails;

// ------------------------- STYLES ----------------------------

const styles = StyleSheet.create({
  sectionWrapper: {
    alignItems: "center",
    paddingVertical: SPACING.md,
  },

  carouselCard: {
    backgroundColor: COLORS.white,
    borderRadius: moderateScale(12),
    padding: SPACING.md,
    flexDirection: "row",
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  cardContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: moderateScale(12),
    borderRadius: moderateScale(10),
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: verticalScale(110),
  },
  cardContent: { flex: 1 },
  avatar: {
    width: scale(55),
    height: scale(55),
    borderRadius: scale(30),
    marginRight: SPACING.md,
  },
  titleText: {
    fontSize: scale(18),
    fontWeight: "700",
    marginBottom: verticalScale(6),
    color: '#111',
  },
  rowItem: {
    flexDirection: "row",
    // justifyContent: "center",
    paddingVertical: verticalScale(4),
    // alignItems: 'center',
  },
  label: {
    fontSize: scale(12),
    fontWeight: "500",
    flex: 0.4,
    color: '#333',
  },
  value: {
    fontSize: scale(12),
    fontWeight: "600",
    flex: 0.9,
    color: '#111',
  },
  carouselName: {
    fontSize: scale(18),
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  carouselSub: {
    fontSize: scale(13),
    color: COLORS.textSecondary,
    marginTop: verticalScale(4),
  },
  dotStyle: {
    width: scale(8),
    height: scale(8),
    borderRadius: scale(4),
    backgroundColor: COLORS.accent,
  },

  sectionTitle: {
    fontSize: scale(16),
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginLeft: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },

  // profile buttons row
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    gap: 7
  },
  profileButtonWrapper: {
    flex: 1,
    marginHorizontal: moderateScale(6),
  },
  profileButton: {
    borderRadius: moderateScale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: moderateScale(8),
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    minHeight: verticalScale(52),
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
  },
  profileButtonIcon: {
    width: scale(18),
    height: scale(18),
    marginRight: moderateScale(8),
    resizeMode: "contain",
  },
  profileButtonText: {
    fontSize: scale(14),
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    // flexShrink: 1,
  },

  // collection
  collectionCard: {
    marginHorizontal: SPACING.md,
    padding: SPACING.md,
    borderRadius: moderateScale(10),
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.sm,
  },

  infoCardLabel: {
    fontSize: scale(13),
    color: COLORS.textSecondary,
    fontWeight: "600",
  },


  infoCardValue: {
    fontSize: scale(15),
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: verticalScale(8),
    paddingHorizontal: SPACING.sm,
  },
  infoRowLabel: {
    fontSize: scale(14),
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  infoRowValue: {
    fontSize: scale(14),
    color: COLORS.textPrimary,
    fontWeight: "700",
  },

  // action grid
  buttonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  actionButtonWrapper: {
    // width: (width - SPACING.xl) / 2,
    width: (width - moderateScale(30)) / 2,
    // height: height * 0.3 ,
    padding: moderateScale(6),
    alignItems: "center",
    justifyContent: "center",

  },
  actionButton: {
    width: "100%",
    height: verticalScale(110),
    borderRadius: moderateScale(12),
    alignItems: "center",
    justifyContent: "center",
    padding: moderateScale(8),
    // borderWidth: 1,
    // borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    // backgroundColor:'red',
    height: height * 0.12,
    borderWidth: 1,
    borderColor: '#888'
  },
  actionIcon: {
    width: scale(34),
    height: scale(34),
    marginBottom: verticalScale(8),
    resizeMode: "contain",
  },
  actionTitle: {
    fontSize: scale(13),
    textAlign: "center",
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  // small helpers

  iconCircle: {
    width: moderateScale(22),
    height: moderateScale(22),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#001D56',
    marginRight: moderateScale(8),
  },
  collectionCard: {
    marginTop: verticalScale(16),
    paddingHorizontal: moderateScale(8), // Reduced from 12
    paddingVertical: verticalScale(12),
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 8,
    backgroundColor: '#F8F8F8',
  },

  infoCard: {
    width: width * 0.45,
    height: height * 0.08,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // padding: 10,
    borderWidth: 1,
    borderRadius: 8,
    // flex: 1, padding: 6
  },

  infoCardValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginTop: verticalScale(6),
  },
  rupeeIcon: {
    width: scale(14),
    height: scale(14),
    // marginRight: moderateScale(6),
    resizeMode: 'contain',
  },
  infoCardValue: {
    fontSize: scale(15),
    fontWeight: '700',
    color: '#111',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(6),
  },
  infoRowLabel: {
    fontSize: scale(14),
    color: '#333',
    fontWeight: '500',
  },
  infoRowValue: {
    fontSize: scale(14),
    color: '#111',
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    // justifyContent: 'space-evenly',
    paddingHorizontal: moderateScale(12),
    marginBottom: verticalScale(20),
  },
  touchWrapper: {
    width: (width - moderateScale(30)) / 2,   // Balanced width
    height: verticalScale(105),             // Fixed height ensures balance
    padding: moderateScale(6),
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    width: width * 0.3,
    height: height * 0.07,
    borderRadius: moderateScale(10),
    alignItems: 'center',
    paddingVertical: verticalScale(8),
    paddingHorizontal: moderateScale(4),
    borderRadius: moderateScale(10),
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: COLORS.white,
    minHeight: verticalScale(42),
    elevation: 2,
    borderWidth: 1,
    borderColor: '#888'
  },
  icon: {
    width: scale(32),
    height: scale(32),
    marginBottom: verticalScale(6),
  },

  title: {
    textAlign: "center",
    fontSize: scale(14),
    fontWeight: "700",
    color: "#111",
    flexShrink: 1,
  },
  loaderOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },

  loaderBox: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    width: 180,
  },

  loaderText: {
    marginTop: 10,
    fontSize: 15,
    color: "#222",
    fontWeight: "600",
  },
  /* ------------------ CARD ------------------ */
  cardContainer: {
    width: width * 0.9,
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginRight: 10,
    elevation: 4,                 // Android shadow
    shadowColor: "#000",          // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  /* ------------------ AVATAR ------------------ */
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
  },

  /* ------------------ CONTENT ------------------ */
  cardContent: {
    flex: 1,
  },

  titleText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 8,
  },

  /* ------------------ ROWS ------------------ */
  rowItem: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "flex-start",
  },

  label: {
    width: 95,
    fontSize: 13,
    fontWeight: "500",
    color: "#6B7280",
  },

  value: {
    flex: 1,
    fontSize: 13,
    color: "#111827",
    lineHeight: 18,
  },
});

