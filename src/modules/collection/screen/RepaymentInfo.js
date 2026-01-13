import React, { useMemo, useState, memo, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";



// import { showLoader } from "../redux/action";


import { scale, verticalScale, ms } from "react-native-size-matters";



import { theme, white } from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';
import ToastNotification from "../component/ToastAlert";
/* ---------------------------------------------------
   HELPERS
----------------------------------------------------- */

const getInProcessUrl = (roles, profile) => {
  const r = roles?.[0];
  const act = profile?.activityType;

  if (r === "CA") return "updateMyCaseForInProcessForCA";
  if (r === "FA" && act === "Calling") return "updateMyCaseForInProcessForCA";
  if (r === "FA" && act === "Field") return "updateMyCaseForInProcessForDRA";
  if (r === "DRA") return "updateMyCaseForInProcessForDRA";

  if (act === "Field") return "updateMyCaseForInProcessField";

  return "updateMyCaseForInProcess";
};

/* ---------------------------------------------------
   Reusable LABEL + VALUE Row
----------------------------------------------------- */
const InfoRow = memo(({ label, value, dark }) => (
  <View style={[styles.row, dark && styles.rowAlt]}>
    <Text style={styles.rowLabel}>{label}</Text>
    <Text style={styles.rowValue}>{value}</Text>
  </View>
));

/* ---------------------------------------------------
   MAIN SCREEN
----------------------------------------------------- */
const RepaymentInfo = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { params } = useRoute();
  const { data } = params;


  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);
  /* Toast States */
  const [show, setShow] = useState(false);
  const [type, setType] = useState("");
  const [header, setHeader] = useState("");
  const [body, setBody] = useState("");

  /* Hide Toast */
  const hide = useCallback(() => {
    setTimeout(() => setShow(false), 2500);
  }, []);

  /* Roles Optimized */
  const currentRoles = useMemo(() => {
    return Array.isArray(userProfile?.role)
      ? userProfile.role.map((r) => r?.roleCode)
      : [];
  }, [userProfile]);

  /* --------------------------
     Send Payment Link API
  ---------------------------- */
  const sendPaymentLink = useCallback(async () => {
    try {
      // dispatch(showLoader(true));

      const payload = {
        bankAccountNumber: data.bankAccountNumber,
        bankIfsc: data.bankIfsc,
        bankUpiAddress: data.bankUpiAddress,
        lenderId: data.lenderId,
        lenderName: data.lenderName,
        loanAccountNumber: data.loanAccountNumber,
        smsFlag: true,
        user: { userId: userProfile.userId },
      };

      /** 1️⃣ -- Send Payment Details */
      await apiClient.post(`${BASE_URL}addPaymentInfo`, payload, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      /** 2️⃣ -- Update Case (Role-based API) */
      const url = getInProcessUrl(currentRoles, userProfile);

      await apiClient.put(
        `${BASE_URL}${url}/${userProfile.userId}/${data.loanAccountNumber}`,
        {},
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /** 3️⃣ -- Show Success Toast */
      setType("SUCCESS");
      setHeader("SUCCESS");
      setBody("Repayment details sent successfully");
      setShow(true);
      hide();
    } catch (err) {
      console.log("sendPaymentLink ERROR:", err);
    } finally {
      // dispatch(showLoader(false));
    }
  }, [data, userProfile, currentRoles, hide, dispatch]);


  return (
    <>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>Details</Text>
          </View>

          <InfoRow label="Lender Name" value={data.lenderName} dark={false} />
          <InfoRow
            label="Bank A/C No"
            value={data.bankAccountNumber}
            dark={true}
          />
          <InfoRow label="Bank IFSC" value={data.bankIfsc} dark={false} />
          <InfoRow
            label="Bank UPI Address"
            value={data.bankUpiAddress}
            dark={true}
          />
        </View>

        {/* Button */}
        <TouchableOpacity style={styles.btn} onPress={sendPaymentLink}>
          <Text style={styles.btnText}>Send Repayment Info</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Toast */}
      {show && (
        <ToastNotification
          isModalVisible={true}
          type={type}
          header={header}
          body={body}
        />
      )}
    </>
  );
};

/* ---------------------------------------------------
   STYLES
----------------------------------------------------- */
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    height: verticalScale(55),
    alignItems: "center",
    backgroundColor: white,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
    paddingHorizontal: scale(10),
  },
  backBtn: {
    width: scale(40),
  },
  headerTitle: {
    fontSize: ms(20),
    fontWeight: "700",
    color: theme.light.black,
  },

  scrollContent: {
    paddingHorizontal: scale(12),
    paddingBottom: verticalScale(20),
  },

  card: {
    borderWidth: 1,
    borderColor: theme.light.activeChatText,
    borderRadius: scale(8),
    backgroundColor: white,
    marginTop: verticalScale(12),
  },

  cardHeader: {
    padding: scale(12),
    backgroundColor: theme.light.darkBlue,
    borderTopLeftRadius: scale(8),
    borderTopRightRadius: scale(8),
  },
  cardHeaderText: {
    fontSize: ms(14),
    fontWeight: "700",
    color: white,
  },

  row: {
    flexDirection: "row",
    padding: scale(10),
    alignItems: "center",
  },
  rowAlt: {
    backgroundColor: theme.light.searchContainerColor,
  },
  rowLabel: {
    width: "50%",
    fontSize: ms(12),
    color: theme.light.voilet,
    fontFamily: "Calibri",
  },
  rowValue: {
    width: "50%",
    fontSize: ms(14),
    fontWeight: "700",
    color: theme.dark.voilet,
    fontFamily: "Calibri",
  },

  btn: {
    height: verticalScale(45),
    backgroundColor: theme.light.darkBlue,
    borderRadius: scale(8),
    justifyContent: "center",
    alignItems: "center",
    marginTop: verticalScale(20),
  },
  btnText: {
    fontSize: ms(16),
    fontWeight: "800",
    color: white,
  },
});

export default memo(RepaymentInfo);
