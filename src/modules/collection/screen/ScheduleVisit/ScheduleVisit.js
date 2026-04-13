// /screens/ScheduleVisit.js
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useNavigation, useRoute } from "@react-navigation/native";
import VisitForm from "./Component/VisitForm";
import VisitHistoryList from "./Component/VisitHistoryList";
import useGeoLocation from "./hooks/useGeoLocation";
import useVisitApi from "./hooks/useVisitApi";
import { theme, white } from "../../utility/Theme";
import moment from "moment";
import { useSelector } from "react-redux";

const { width } = Dimensions.get("window");

export default function ScheduleVisit() {
  const navigation = useNavigation();
  const { params } = useRoute();
  const { data } = params;


  const userProfile = useSelector((s) => s.auth.userProfile);
  const token = useSelector((s) => s.auth.token);

  const [tab, setTab] = useState(0);
  const [addMode, setAddMode] = useState(false);
  const [editItem, setEditItem] = useState(null);

  console.log(editItem, 'editItemeditItem')
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // GEO LOCATION HOOK
  // -----------------------------
  const {
    coords,                      // {lat, lng}
    address: currentAddress,     // reverse geocoded location
    refresh,                     // fetchCurrentLocation()
    getLatLngFromAddress,
    calculateDistance,
  } = useGeoLocation();

  // -----------------------------
  // VISIT API HOOK
  // -----------------------------
  const {
    todayVisits,
    monthlyVisits,
    yearlyVisits,
    nameList,
    addressTypeList,
    addressList,
    outcomeTypes,
    fetchNames,
    fetchAddressTypes,
    fetchAddresses,
    fetchVisitHistory,
    fetchOutcomeTypes,
    addVisit,
    updateVisit,
    addUserTracker,
  } = useVisitApi(userProfile, data.loanAccountNumber, userProfile.userId);

  useEffect(() => {
    fetchNames();
    fetchVisitHistory();
    fetchOutcomeTypes();
  }, []);

  // -----------------------------
  // SUBMIT VISIT (ADD + UPDATE)
  // -----------------------------
  const handleSubmit = async (form) => {
    try {
      setLoading(true);
      await refresh();

      const {
        name,
        addressType,
        address,
        remark,
        date,
        time,
        status,
        outcome,
      } = form;

      const { lat, lng } = coords;

      // Fetch lat/lng of customer address
      const addressCoords = await getLatLngFromAddress(address);

      const distKm = addressCoords
        ? calculateDistance(lat, lng, addressCoords.lat, addressCoords.lng)
        : 0;

      const fullPayload = {
        date,
        time,
        name,
        addressType,
        address,
        remark,
        geoCordinates: `${addressCoords?.lat},${addressCoords?.lng}`,
        lan: data.loanAccountNumber,
        userId: userProfile.userId,
        status,
        outcome: outcome || null,
      };

      // UPDATE VISIT
      if (editItem) {
        const res = await updateVisit(editItem.visitId, fullPayload);

        await addUserTracker({
          userId: userProfile.userId,
          activity: "ScheduleVisit",
          activityId: editItem.visitId,
          coordinates: `${lat},${lng}`,
          areaName: currentAddress,
          lan: data.loanAccountNumber.toString(),
          customerAddress: address,
          addressType,
          addressCoordinates: `${addressCoords?.lat},${addressCoords?.lng}`,
          differenceInKm: distKm,
          exception: null,
          fromActivityPerformedlocation: `${lat},${lng}`,
          ...fullPayload,
        });

        Alert.alert("Success", "Visit updated successfully");
      }

      // ADD VISIT
      else {
        const res = await addVisit(fullPayload);

        await addUserTracker({
          userId: userProfile.userId,
          activity: "ScheduleVisit",
          activityId: res.visitId,
          coordinates: `${lat},${lng}`,
          areaName: currentAddress,
          lan: data.loanAccountNumber.toString(),
          customerAddress: address,
          addressType,
          addressCoordinates: `${addressCoords?.lat},${addressCoords?.lng}`,
          differenceInKm: distKm,
          exception: null,
          fromActivityPerformedlocation: `${lat},${lng}`,
          ...fullPayload,
        });

        Alert.alert("Success", "Visit scheduled successfully", [
          { text: "OK", onPress: () => navigation.goBack() },
        ]);
      }

      fetchVisitHistory();
      setAddMode(false);
      setEditItem(null);

    } catch (err) {
      console.log("Submit visit error:", err);
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // ON SELECT HISTORY VISIT
  // -----------------------------
  const handleSelectVisit = async (item) => {
    if (item.status === "Completed") return;

    setEditItem({
      ...item,
      dateTime: moment(item.date + " " + item.time, "YYYY-MM-DD LT").toDate(),
    });

    await getLatLngFromAddress(item.address);
    setAddMode(true);
  };

  // SELECT LIST BASED ON TAB
  const listData = useMemo(() => {
    if (tab === 0) return todayVisits;
    if (tab === 1) return monthlyVisits;
    return yearlyVisits;
  }, [tab, todayVisits, monthlyVisits, yearlyVisits]);

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      {/* <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back-ios" size={26} color="#606060" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Schedule Visit</Text>
      </View> */}

      <View style={{ flex: 1, paddingHorizontal: 12 }}>
        {/* ADD BUTTON */}
        {!addMode && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => {
              setEditItem(null);
              setAddMode(true);
            }}
          >
            <Text style={styles.addBtnText}>Add Visit</Text>
          </TouchableOpacity>
        )}

        {/* FORM MODE */}
        {addMode ? (
          <VisitForm
            isEdit={!!editItem}
            initialValues={editItem || {}}
            nameList={nameList}
            addressTypeList={addressTypeList}
            addressList={addressList}
            outcomeTypes={outcomeTypes}
            onAddressTypeChange={fetchAddressTypes}
            onAddressTypeSelected={(addrType, applicantType) =>
              fetchAddresses(addrType, applicantType)
            }
            onAddressChange={(address) => getLatLngFromAddress(address)}
            onSubmit={handleSubmit}
            getLatLngFromAddress={getLatLngFromAddress}
            editItem={editItem}
          />
        ) : (
          <>
            {/* TABS */}
            <View style={styles.tabRow}>
              {["Today", "This Month", "This Year"].map((t, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => setTab(i)}
                  style={[styles.tabBtn, tab === i && styles.tabBtnActive]}
                >
                  <Text
                    style={[styles.tabText, tab === i && styles.tabTextActive]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* LIST */}
            <VisitHistoryList data={listData} onSelect={handleSelectVisit} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.6,
    paddingHorizontal: 14,
    borderColor: "#ccc",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginLeft: 10,
    color: theme.light.black,
  },

  addBtn: {
    alignSelf: "flex-end",
    backgroundColor: theme.light.darkBlue,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },

  addBtnText: {
    color: white,
    fontWeight: "700",
    fontSize: 14,
  },

  tabRow: {
    flexDirection: "row",
    marginTop: 14,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#E6E6E6",
    marginHorizontal: 5,
    alignItems: "center",
  },

  tabBtnActive: {
    backgroundColor: theme.light.darkBlue,
  },

  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },

  tabTextActive: {
    color: white,
  },
});
