import React, { useCallback, useEffect, useContext, useState, memo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  BackHandler,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";
// import Entypo from "react-native-vector-icons/Entypo";
import { useDispatch, useSelector } from "react-redux";
// import { showDrawer, showLoader } from "../redux/action";
import { DrawerContext } from '../../../Drawer/DrawerContext';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
import { useFocusEffect, useNavigation } from "@react-navigation/native";
// import Drawer from "./Drawer";

import { theme } from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';

const { width, height } = Dimensions.get("screen");

const Deposition = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);
  const { isDrawerVisible, openDrawer, closeDrawer } = useContext(DrawerContext);
  const [summary, setSummary] = useState(null);

  /** ---------------- BACK HANDLER ---------------- */
  useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };

    const sub = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );

    return () => sub.remove();
  }, []);

  /** ---------------- API CALL ---------------- */
  const fetchSummary = useCallback(() => {
    if (!userProfile?.userId) return;

    // dispatch(showLoader(true));

    apiClient
      .get(`${BASE_URL}getDepositionSummeryByUserId/${userProfile?.userId}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      })
      .then((res) => {
        setSummary(res?.data?.response || {});
        // dispatch(showLoader(false));
      })
      .catch(() => {
        // dispatch(showLoader(false));
      });
  }, [userProfile?.userId, token]);

  /** Run on screen focus */
  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary])
  );

  /** ---------------- COMPONENTS ---------------- */

  const SummaryRow = memo(({ label, count, amount, bg }) => (
    <View style={[styles.rowWrapper, { backgroundColor: bg }]}>
      <Text style={styles.leftText}>{`${label} (${count ?? 0})`}</Text>

      <View style={styles.amountContainer}>
        <View style={styles.iconCircle}>
          <Image
            style={styles.rupeeIcon}
            source={require("../../../asset/TrueBoardIcon/rupee.png")}
          />
        </View>
        <Text style={styles.amountText}>
          {amount?.toLocaleString("en-IN") || "0"}
        </Text>
      </View>
    </View>
  ));

  const SummaryCard = memo(({ title, data }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardHeaderText}>{title}</Text>
      </View>

      <SummaryRow
        label="Pending"
        count={data?.pendingCount}
        amount={data?.pendingAmount}
        bg="#F5F5F5"
      />

      <SummaryRow
        label="Approved"
        count={data?.approvedCount}
        amount={data?.approvedAmount}
        bg="#E0E0E0"
      />

      <SummaryRow
        label="Rejected"
        count={data?.rejectedCount}
        amount={data?.rejectedAmount}
        bg="#F5F5F5"
      />
    </View>
  ));

  /** ---------------- RENDER ---------------- */

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar
        translucent
        backgroundColor="#001D56"
        barStyle="light-content"
      />
      <View style={styles.container}>


        {/* <View style={styles.container}> */}
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer}>
            <Image
              source={require('../../../asset/icon/menus.png')}
              style={styles.drawerIcon}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deposition</Text>

        </View>
        {/* </View> */}

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* TODAY SUMMARY */}
          <SummaryCard
            title="Today's Depositions"
            data={summary?.currentDepositionSummery}
          />

          {/* TOTAL SUMMARY */}
          <SummaryCard
            title="Total Depositions"
            data={summary?.totalDepositionSummery}
          />

          {/* BUTTONS */}
          <TouchableOpacity
            onPress={() => navigation.navigate("PaymentDeposition")}
            style={styles.btnPrimary}
          >
            <Text style={styles.btnText}>Add Deposition</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate("DepositionHistory")}
            style={styles.btnSecondary}
          >
            <Text style={styles.btnText}>Deposition History</Text>
          </TouchableOpacity>

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* <Drawer /> */}
      </View>
    </SafeAreaView>
  );
};

export default memo(Deposition);

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: theme.light.darkBlue, // backgroundColor same as  for seamless look
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  /** HEADER */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: scale(15),
    paddingVertical: verticalScale(12),
    backgroundColor: theme.light.darkBlue,
    paddingTop:
      Platform.OS === 'android' ? StatusBar.currentHeight : verticalScale(5),
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  drawerIcon: {
    width: scale(22),
    height: scale(22),
    tintColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: scale(8),
  },


  /** CARD */
  card: {
    marginHorizontal: 10,
    marginVertical: 12,
    borderWidth: 0.8,
    borderRadius: 8,
    borderColor: "#C8C8C8",
    backgroundColor: "#fff",
  },
  cardHeader: {
    backgroundColor: theme.light.darkBlue,
    padding: 12,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  cardHeaderText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },

  /** ROWS */
  rowWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  leftText: {
    width: "50%",
    fontSize: 14,
    color: theme.light.voilet,
    fontWeight: "500",
  },

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconCircle: {
    width: width * 0.04,
    height: height * 0.018,
    backgroundColor: "#001D56",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
  },
  rupeeIcon: {
    width: 13,
    height: 13,
  },
  amountText: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: "600",
    color: theme.dark.searchContainerColor,
  },

  /** BUTTONS */
  btnPrimary: {
    width: width * 0.95,
    height: height * 0.05,
    backgroundColor: theme.light.darkBlue,
    borderRadius: 10,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  btnSecondary: {
    width: width * 0.95,
    height: height * 0.05,
    backgroundColor: "#3C4BD6",
    borderRadius: 10,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
  },
  btnText: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#fff",
  },
});
