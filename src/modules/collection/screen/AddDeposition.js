import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Image,
    TextInput,
    Alert,
    Platform,
    Modal,
    Pressable,
    BackHandler,
    ScrollView,
    ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute, useFocusEffect } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
// import ImagePicker from "react-native-image-crop-picker";
// import { showLoader } from "../redux/action";
import apiClient from '../../../common/hooks/apiClient';
import { Primary, theme } from "../utility/Theme";
import DocumentPicker from 'react-native-document-picker';
import { BASE_URL } from "../service/api";

const { width, height } = Dimensions.get("screen");

/* --------------------- Small Presentational Helpers --------------------- */
const Label = ({ children, required }) => (
    <Text style={styles.label}>
        {children}
        {required ? <Text style={styles.required}>*</Text> : null}
    </Text>
);

const Input = React.memo(({ value, onChangeText, placeholder, editable = true, keyboardType = "default", style }) => (
    <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.light.commentPlaceholder}
        selectionColor={Primary}
        editable={editable}
        keyboardType={keyboardType}
        style={[styles.input, style]}
    />
));

const AmountRow = React.memo(({ amount }) => (
    <View style={styles.amountWrap}>
        <View style={styles.iconCircle}>
            <Image style={styles.rupeeIcon} source={require("../../../asset/TrueBoardIcon/rupee.png")} />
        </View>
        <Text style={styles.amountText}>{amount != null ? amount.toLocaleString("en-IN") : "0"}</Text>
    </View>
));

/* --------------------- UploadBox Component --------------------- */
const UploadBox = React.memo(({ file, onPick, onRemove, uploading }) => (
    <View style={styles.uploadContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={onPick} disabled={uploading}>
            {file ? (
                <Text style={styles.uploadText}>{uploading ? "Uploading..." : "Change Evidence"}</Text>
            ) : (
                <>
                    <MaterialIcons name="cloud-upload" size={22} color="#3b5998" />
                    <Text style={[styles.uploadText, { marginLeft: 8 }]}>{uploading ? "Uploading..." : "Upload Evidence"}</Text>
                </>
            )}
        </TouchableOpacity>

        {file ? (
            <Pressable onPress={onRemove} style={styles.removeBtn}>
                <Image source={require("../../../asset/icon/cross.png")} style={styles.removeIcon} />
            </Pressable>
        ) : null}
    </View>
));

/* --------------------- Main Screen --------------------- */
const AddDeposition = () => {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const route = useRoute();
    const { data = [], lenderName = "" } = route.params ?? {};
    const userProfile = useSelector((s) => s.auth.userProfile);
    const token = useSelector((s) => s.auth.token);
    const userId = userProfile?.userId
    // Form state (single object helps pass around)
    const [form, setForm] = useState({
        bankName: "",
        branchName: "",
        paymentCollectionMode: "",
        amount: 0,
        remark: "",
        lenderName: lenderName || "",
    });

    const [sumData, setSumData] = useState(null);
    const [file, setFile] = useState(null); // object from image picker
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);

    /* --------------------- BackHandler --------------------- */
    useEffect(() => {
        const onBack = () => {
            navigation.goBack();
            return true;
        };
        const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
        return () => sub.remove();
    }, [navigation]);

    /* --------------------- Fetching amount summary --------------------- */
    const fetchDepositionSum = useCallback(async () => {
        if (!userId) return;
        // dispatch(showLoader(true));
        try {
            const payload = { payments: data };
            const res = await apiClient.post(`${BASE_URL}getDepositionAmountSum`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });
            const resp = res?.data?.response ?? {};
            setSumData(resp);
            // Pre-fill form values once
            setForm((prev) => ({
                ...prev,
                amount: resp?.amount ?? prev.amount,
                paymentCollectionMode: resp?.paymentMode ?? prev.paymentCollectionMode,
                lenderName: resp?.lenderName ?? prev.lenderName,
            }));
        } catch (err) {
            console.warn("getDepositionAmountSum error:", err?.message || err);
        } finally {
            // dispatch(showLoader(false));
        }
    }, [userId]);

    useFocusEffect(
        useCallback(() => {
            fetchDepositionSum();
        }, [fetchDepositionSum])
    );

    /* --------------------- File picker handlers --------------------- */
    const pickFromGallery = useCallback(async () => {
        try {
            const res = await DocumentPicker.pickSingle({
                type: [DocumentPicker.types.images], // gallery images only
            });

            setFile({
                uri: res.uri,
                name: res.name || res.uri.split('/').pop(),
                type: res.type,
                size: res.size,
            });

        } catch (err) {
            if (DocumentPicker.isCancel(err)) return;
            console.warn("Gallery pick error", err);
        }
    }, [setFile]);



    const removeFile = useCallback(() => setFile(null), []);

    /* --------------------- Small helpers --------------------- */
    const updateForm = useCallback((key, value) => setForm((p) => ({ ...p, [key]: value })), []);

    const validate = useCallback(() => {
        if (!form.bankName?.trim()) return "Bank Name is required.";
        if (!form.branchName?.trim()) return "Branch Name is required.";
        if (!form.remark?.trim()) return "Remarks is required.";
        if (!form.amount || Number(form.amount) <= 0) return "Amount should be greater than 0.";
        return null;
    }, [form]);

    /* --------------------- Upload evidence helper --------------------- */


    const uploadEvidence = async (id) => {
        if (!id) {
            Alert.alert("Error", "Invalid deposition ID.");
            return;
        }

        if (!file) {
            Alert.alert("Error", "Please select a file before uploading.");
            return;
        }

        try {
            const fileType = file.type || "application/octet-stream";
            const hasExtension = file.name?.includes(".");
            const ext = fileType.split("/")[1] || "bin";
            const safeName = hasExtension ? file.name : `${Date.now()}.${ext}`;

            console.log("📤 Uploading Evidence:", {
                id,
                name: safeName,
                uri: file.uri,
                type: fileType,
            });

            const payload = {
                uri: file.uri,
                name: safeName,
                type: fileType,
            };

            const res = await apiClient.upload(
                `${BASE_URL}addDepositionEvidence/${id}`,
                {
                    fieldName: "depositionfile",
                    file: payload,
                    token: token ?? "",
                }
            );

            console.log("✅ Upload Evidence Response:", res);
            return res;

        } catch (error) {
            console.error("❌ uploadEvidence error:", error);
            throw error;
        }
    };

    /* --------------------- Submit handler --------------------- */
    const handleSubmit = useCallback(async () => {
        // guard double submissions
        if (isSubmitting) return;
        const err = validate();
        if (err) {
            Alert.alert("Validation", err);
            return;
        }

        setIsSubmitting(true);
        // dispatch(showLoader(true));

        try {
            const payload = {
                bankName: form.bankName,
                branchName: form.branchName,
                paymentCollectionMode: form.paymentCollectionMode,
                amount: form.amount,
                remark: form.remark,
                userId,
                payments: data,
                lenderName: form.lenderName,
            };

            const res = await apiClient.post(`${BASE_URL}addDeposition`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`, Accept: "application/json",
                    "Content-Type": "application/json",
                },
            });

            if (res?.status === 200) {
                const newId = res?.data?.response;
                // upload evidence if exists (fire-and-wait)
                if (file) {
                    await uploadEvidence(newId);
                }
                Alert.alert("Success", "Deposition added successfully.");
                navigation.goBack();
            } else {
                console.warn("addDeposition unexpected response", res);
                Alert.alert("Error", "Failed to add deposition.");
            }
        } catch (err) {
            console.warn("addDeposition error:", err);
            Alert.alert("Error", "Something went wrong while saving.");
        } finally {
            setIsSubmitting(false);
            // dispatch(showLoader(false));
        }
    }, [isSubmitting, validate, form, userId, data, token, dispatch, file, uploadEvidence, navigation]);

    /* --------------------- derived memo values --------------------- */
    const pendingAmount = useMemo(() => sumData?.amount ?? form.amount, [sumData, form.amount]);

    return (
        <View style={styles.screen}>
            {/* HEADER */}
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back-ios" size={24} color="#606060" />
                </TouchableOpacity>
                <Text style={styles.title}>Add Deposition</Text>
            </View> */}

            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                {/* BANK NAME */}
                <Label required>Bank Name</Label>
                <Input value={form.bankName} onChangeText={(t) => updateForm("bankName", t)} placeholder="Enter bank name" />

                {/* BRANCH NAME */}
                <Label required>Branch Name</Label>
                <Input value={form.branchName} onChangeText={(t) => updateForm("branchName", t)} placeholder="Enter branch name" />

                {/* PAYMENT MODE (readonly) */}
                <Label required>Payment Collection Mode</Label>
                <Input
                    value={form.paymentCollectionMode}
                    onChangeText={(t) => updateForm("paymentCollectionMode", t)}
                    editable={false}
                    placeholder=""
                />

                {/* AMOUNT */}
                <Label>Amount</Label>
                <AmountRow amount={pendingAmount} />

                {/* PAYMENT IDS */}
                <Label>Payment Ids</Label>
                <View style={styles.tagsWrap}>
                    {data?.map((it, idx) => (
                        <TouchableOpacity
                            key={it?.paymentId ?? idx}
                            onPress={() => navigation.navigate("ViewPaymentDepositionDetails", { paymentData: it })}
                            style={styles.tag}
                        >
                            <Text style={styles.tagText}>{it.paymentId}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* REMARKS */}
                <Label required>Remarks</Label>
                <Input value={form.remark} onChangeText={(t) => updateForm("remark", t)} placeholder="Enter remarks" />

                {/* UPLOAD */}
                <UploadBox
                    file={file}
                    onPick={() => setIsModalVisible(true)}
                    onRemove={removeFile}
                    uploading={isUploadingEvidence}
                />

                {/* ACTIONS */}
                <View style={styles.actions}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.btn, styles.btnOutline]}>
                        <Text style={[styles.btnText, styles.btnTextOutline]}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        style={[styles.btn, isSubmitting ? styles.btnDisabled : styles.btnPrimary]}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Save</Text>}
                    </TouchableOpacity>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* IMAGE PICKER MODAL */}
            <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <TouchableOpacity style={styles.modalOption} onPress={pickFromGallery}>
                            <Text style={styles.modalText}>Select from Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalCancel} onPress={() => setIsModalVisible(false)}>
                            <Text style={styles.modalCancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default AddDeposition;

/* --------------------- Styles --------------------- */
const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#fff" },
    header: {
        height: 60,
        flexDirection: "row",
        alignItems: "center",
        borderBottomColor: theme.light.black,
        borderBottomWidth: 0.5,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
    },
    backBtn: { width: 44, justifyContent: "center" },
    title: { fontSize: 20, fontWeight: "600", color: theme.light.black },

    content: { padding: 16 },

    label: { fontSize: 15, fontWeight: "600", color: theme.light.black, marginTop: 12 },
    required: { color: "red", marginLeft: 4 },

    input: {
        height: height * 0.055,
        width: width * 0.94,
        borderWidth: 1,
        borderColor: theme.light.activeChatText,
        borderRadius: 8,
        paddingHorizontal: 12,
        marginTop: 8,
        color: theme.light.commentPlaceholder,
        backgroundColor: "#fff",
    },

    amountWrap: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
        height: height * 0.055,
        width: width * 0.94,
        borderWidth: 1,
        borderColor: theme.light.searchContainerColor,
        borderRadius: 8,
        paddingHorizontal: 10,
        backgroundColor: theme.light.searchContainerColor,
    },
    iconCircle: {
        width: width * 0.04,
        height: height * 0.018,
        backgroundColor: "#001D56",
        borderRadius: 100,
        justifyContent: "center",
        alignItems: "center",
    },
    rupeeIcon: { width: 13, height: 13 },
    amountText: { marginLeft: 8, fontSize: 16, fontWeight: "600", color: theme.dark.searchContainerColor },

    tagsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
    tag: {
        backgroundColor: theme.light.searchContainerColor,
        paddingHorizontal: 14,
        height: height * 0.04,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: theme.light.activeChatText,
        marginRight: 8,
        marginTop: 6,
    },
    tagText: { color: "#000", fontSize: 14 },

    uploadContainer: {
        marginTop: 14,
        width: width * 0.94,
        height: height * 0.06,
        borderRadius: 8,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#d0d0d0",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
    },
    uploadButton: { flexDirection: "row", alignItems: "center" },
    uploadText: { fontSize: 16, fontWeight: "700", color: "#3b5998" },
    removeBtn: { marginLeft: 12 },
    removeIcon: { width: 18, height: 18 },

    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
        width: width * 0.94,
    },
    btn: {
        width: width * 0.44,
        height: height * 0.055,
        borderRadius: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    btnPrimary: { backgroundColor: theme.light.darkBlue },
    btnOutline: { backgroundColor: "#fff", borderWidth: 0.8, borderColor: "#000" },
    btnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    btnTextOutline: { color: "#000" },
    btnDisabled: { backgroundColor: "#8aa0ff" },

    modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
    modalBox: { backgroundColor: "#fff", paddingBottom: 20, paddingTop: 10, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
    modalOption: { paddingVertical: 16, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: "#eee" },
    modalText: { fontSize: 16, color: "#222" },
    modalCancel: { paddingVertical: 14, alignItems: "center" },
    modalCancelText: { fontSize: 16, color: "red" },
});
