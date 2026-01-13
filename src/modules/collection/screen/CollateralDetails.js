import React, { useEffect, useState, memo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,
    Dimensions,
    StyleSheet,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { theme , white} from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from "../service/api";
const { width, height } = Dimensions.get("screen");

const Row = ({ label, value, index }) => (
    <View
        style={{
            flexDirection: "row",
            padding: 10,
            alignItems: "center",
            backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#E0E0E0",
        }}
    >
        <Text style={styles.labelCell}>{label}</Text>
        <Text style={styles.valueCell}>{value ?? "--"}</Text>
    </View>
);

const Section = ({ title, rows }) => (
    <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>{title}</Text>
        </View>

        {rows.map((row, i) => (
            <Row key={i} index={i} label={row.label} value={row.value} />
        ))}
    </View>
);

const CollateralDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { data } = route.params;
    const dispatch = useDispatch();
    const userProfile = useSelector((s) => s.auth.userProfile);
    const token = useSelector((s) => s.auth.token);

    const [details, setDetails] = useState(null);

    const getAllCollateral = () => {
        apiClient
            .get(`${BASE_URL}getCollatralDetailsByLoanAccountNumber/${data.loanAccountNumber}`, {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token,
                },
            })
            .then((res) => {
                setDetails(res.data.data);
                // dispatch(showLoader(false));
            })
            .catch((err) => {
                console.log("Collateral Error:", err);
                // dispatch(showLoader(false));
            });
    };

    useEffect(() => {
        getAllCollateral();
    }, []);

    if (!details) return null;

    // -------------------------
    // AUTO SECTION DATA
    // -------------------------
    const autoRows = [
        { label: "Manufacturer", value: data.manufacturer },
        { label: "Vehicle Reg No", value: data.vehicleRegNo },
        {
            label: "Valuation",
            value: data.vehicleValuation?.toLocaleString("en-IN"),
        },
        { label: "Engine No", value: data.engineNumber },
        { label: "Make Model Name", value: data.makeModelName },
        { label: "Used/New", value: data.usedOrNew },
        { label: "Vehicle Chassis No", value: data.vehicleChassisNumber },
        {
            label: "Vehicle Manufacturing Year",
            value: data.vehicleManufacturingYear,
        },
        { label: "Owner Name(1)", value: data.owner1Name },
        { label: "Mobile Number", value: data.owner1Mobile },
        { label: "Email", value: data.owner1Email },
        { label: "Address", value: data.owner1Address },
        { label: "Owner Name(2)", value: data.owner2Name },
        { label: "Mobile Number", value: data.owner2Mobile },
        { label: "Email", value: data.owner2Email },
        { label: "Address", value: data.owner2Address },
    ];

    // -------------------------
    // HOUSING SECTION DATA
    // -------------------------
    const housingRows = [
        { label: "LTV", value: data.ltv },
        { label: "Storage", value: data.propertyLocation },
        { label: "Valuation", value: data.propertyValue },
        { label: "Owner Name(1)", value: data.owner1Name },
        { label: "Mobile Number", value: data.owner1Mobile },
        { label: "Email", value: data.owner1Email },
        { label: "Address", value: data.owner1Address },
        { label: "Owner Name(2)", value: data.owner2Name },
        { label: "Mobile Number", value: data.owner2Mobile },
        { label: "Email", value: data.owner2Email },
        { label: "Address", value: data.owner2Address },
    ];

    return (
        <>
            <ScrollView contentContainerStyle={{ marginHorizontal: 10 }}>
                <Section title="Auto" rows={autoRows} />
                <Section title="Housing" rows={housingRows} />
                <View style={{ height: 20 }} />
            </ScrollView>
        </>
    );
};

// -----------------------------------------------------
// STYLES
// -----------------------------------------------------
const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        height: 60,
        alignItems: "center",
        backgroundColor: white,
        borderBottomColor: theme.light.black,
        borderBottomWidth: 0.5,
    },
    headerText: {
        fontSize: 24,
        fontWeight: "600",
        color: theme.light.black,
    },

    sectionCard: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: theme.light.activeChatText,
        borderRadius: 8,
        backgroundColor: white,
    },

    sectionHeader: {
        flexDirection: "row",
        padding: 12,
        alignItems: "center",
        backgroundColor: theme.light.darkBlue,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },

    sectionHeaderText: {
        width: "50%",
        fontSize: 18,
        fontWeight: "600",
        color: white,
        fontFamily: "Calibri",
    },

    labelCell: {
        width: "50%",
        fontSize: 14,
        fontWeight: "400",
        color: "#001D56",
        fontFamily: "Calibri",
    },

    valueCell: {
        width: "50%",
        fontSize: 16,
        fontWeight: "600",
        color: "#001D56",
        fontFamily: "Calibri",
    },
});

export default memo(CollateralDetails);
