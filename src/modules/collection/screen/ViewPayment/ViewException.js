import React, { useState, useEffect, memo } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Modal,
    Image,
    TouchableWithoutFeedback,
    Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { useDispatch, useSelector } from "react-redux";

// import apiClient from "../../api/apiClient";
// import { showLoader } from "../redux/action";
// import ToastNotification from "../../Component/ToastAlert";
import { theme, white } from "../../utility/Theme";
// import { BASE_URL } from "../../api/Endpoint";
import apiClient from "../../../../common/hooks/apiClient";
import { BASE_URL } from "../../service/api";
import ToastNotification from "../../component/ToastAlert";

const { width, height } = Dimensions.get("window");

// --------------------------------------------------
// 🔁 Reusable Row Component
// --------------------------------------------------
const Row = memo(({ label, value, highlight }) => (
    <View style={[styles.row, highlight && styles.rowHighlight]}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
    </View>
));

// --------------------------------------------------
// MAIN SCREEN
// --------------------------------------------------
const ViewException = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { data, name } = useRoute().params;

    const auth = useSelector((state) => state.auth);

    const [evidenceData, setEvidenceData] = useState("");
    const [modalVisible, setModalVisible] = useState(false);

    const [toast, setToast] = useState({ show: false, type: "", header: "", body: "" });

    // Auto-hide toast
    const hideToast = () => setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 2500);

    // --------------------------------------------------
    // 📌 Fetch Exception Evidence
    // --------------------------------------------------
    useEffect(() => {
        fetchEvidenceFile();
    }, []);

    const fetchEvidenceFile = async () => {
        try {
            // dispatch(showLoader(true));

            if (!data?.raiseExceptionId) return;

            const res = await apiClient.get(
                `getdocumentRaiseExceptionByRaiseExceptionId/${data.raiseExceptionId}`,
                {
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${auth.token}`,
                    },
                }
            );

            setEvidenceData(res?.data?.exceptionfile || "");
        } catch (error) {
            console.log("Error fetching evidence:", error);
        } finally {
            // dispatch(showLoader(false));
        }
    };

    // --------------------------------------------------
    // 📌 Show Evidence Modal
    // --------------------------------------------------
    const showEvidence = () => {
        if (!evidenceData) {
            Alert.alert("Document not found");
            return;
        }
        setModalVisible(true);
    };

    // --------------------------------------------------
    // UI
    // --------------------------------------------------
    return (
        <>
            {/* HEADER */}


            {/* BODY */}
            <ScrollView contentContainerStyle={styles.body}>
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>Details</Text>
                    </View>

                    <Row label="Exception Request" value={name} />
                    <Row highlight label="Loan Account No" value={data.loanAccountNumber} />
                    <Row label="Remarks" value={data.remark} />
                </View>

                {/* VIEW DOCUMENT BUTTON */}
                {(data?.isDocument === "yes" || evidenceData) && (
                    <TouchableOpacity style={styles.viewBtn} onPress={showEvidence}>
                        <Text style={styles.viewBtnText}>View Document</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            {/* EVIDENCE MODAL */}
            <Modal transparent animationType="fade" visible={modalVisible}>
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Evidence</Text>
                        </View>

                        <View style={styles.modalContent}>
                            <Image
                                source={{ uri: `data:image/png;base64,${evidenceData}` }}
                                style={styles.modalImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* TOAST */}
            {toast.show && (
                <ToastNotification isModalVisible type={toast.type} header={toast.header} body={toast.body} />
            )}
        </>
    );
};

// --------------------------------------------------
// STYLES
// --------------------------------------------------
const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        height: 60,
        alignItems: "center",
        backgroundColor: theme.light.white,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.light.black,
    },
    backBtn: { width: 50, marginLeft: 20 },
    headerText: {
        fontSize: 22,
        fontWeight: "600",
        color: theme.light.black,
    },

    body: {
        paddingHorizontal: 12,
    },

    card: {
        marginTop: 20,
        borderWidth: 1,
        borderColor: theme.light.activeChatText,
        backgroundColor: white,
        borderRadius: 8,
    },
    cardHeader: {
        padding: 12,
        backgroundColor: theme.light.darkBlue,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    cardHeaderText: {
        color: white,
        fontSize: 18,
        fontWeight: "700",
    },

    row: {
        flexDirection: "row",
        padding: 12,
        alignItems: "center",
    },
    rowHighlight: {
        backgroundColor: theme.light.searchContainerColor,
    },
    label: {
        width: "50%",
        fontSize: 14,
        color: theme.light.voilet,
        fontFamily: "Calibri",
    },
    value: {
        width: "50%",
        fontSize: 16,
        fontWeight: "700",
        fontFamily: "Calibri",
        color: theme.dark.voilet,
    },

    viewBtn: {
        width: width * 0.5,
        height: height * 0.045,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.light.darkBlue,
        alignSelf: "center",
        marginVertical: 20,
        borderRadius: 8,
    },
    viewBtnText: {
        color: white,
        fontSize: 14,
        fontWeight: "700",
    },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalHeader: {
        backgroundColor: theme.light.darkBlue,
        paddingVertical: 12,
        width: width * 0.9,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalTitle: {
        textAlign: "center",
        color: white,
        fontWeight: "700",
        fontSize: 20,
    },
    modalContent: {
        backgroundColor: white,
        width: width * 0.9,
        alignItems: "center",
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        paddingVertical: 20,
    },
    modalImage: {
        width: width * 0.75,
        height: width * 0.75,
    },
});

export default memo(ViewException);
