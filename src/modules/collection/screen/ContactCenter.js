
// ContactCentreScreen.js
import React, { useEffect, useState, useCallback, useRef } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Alert,
    ScrollView,
    Platform, TextInput
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSelector } from "react-redux";
import Modal from "react-native-modal";
import Entypo from "react-native-vector-icons/Entypo";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { Dropdown } from "react-native-element-dropdown";
// import Ionicons from "react-native-vector-icons/Ionicons";


import { theme, white } from '../utility/Theme';
import apiClient from '../../../common/hooks/apiClient';
import { BASE_URL } from '../service/api';
const { width, height } = Dimensions.get("screen");

// ----------------------
// Small helper UI pieces
// ----------------------
const IconButton = ({ icon, onPress, size = 20, color = theme.light.orange }) => {
    // support MaterialCommunityIcons / Ionicons / Entypo basic names
    const library = {
        "email-outline": "MaterialCommunityIcons",
    };
    // we'll render with MaterialCommunityIcons for common icons,
    // fallback to Ionicons for 'phone', Entypo for 'plus' etc.
    // In practice, pass icons that exist in MaterialCommunityIcons or Ionicons.
    return (
        <TouchableOpacity onPress={onPress} style={{ marginLeft: 8 }}>
            <MaterialCommunityIcons name={icon} size={size} color={color} />
        </TouchableOpacity>
    );
};

const SectionHeader = ({ title, onAdd }) => (
    <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
        {onAdd ? (
            <TouchableOpacity onPress={onAdd} style={styles.addBtn}>
                <Entypo name="plus" size={22} color="#fff" />
            </TouchableOpacity>
        ) : null}
    </View>
);

// A simple flexible row: label on left, value (auto wrap) + children (icons) on right
const InfoRowSimple = ({ label, value, isDark, children }) => (
    <View style={[styles.row, { backgroundColor: isDark ? "#F5F5F5" : "#FFFFFF" }]}>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.valueAndIcons}>
            <Text style={styles.value} selectable>
                {value ?? "--"}
            </Text>

            <View style={styles.iconWrap}>{children}</View>
        </View>
    </View>
);

// ----------------------
// Main Screen
// ----------------------
export default function ContactCentreScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { data } = route.params ?? {};


    const userProfile = useSelector((s) => s.auth.userProfile);
    const token = useSelector((s) => s.auth.token);
    const authHeaders = {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
    };

    // local state
    const [contactCentreId, setContactCentreId] = useState("");
    const [allMobileNumbers, setAllMobileNumbers] = useState([]);
    const [alternetMobile, setAlternetMobile] = useState([]);
    const [addressFromContactCenter, setAddressFromContactCenter] = useState([]);
    const [emailData, setemailData] = useState([]);
    const [referenceData, setReferenceData] = useState([]);

    // modals + inputs
    const [showAddress, setShowAddress] = useState(false);
    const [showPhone, setShowPhone] = useState(false);
    const [showEmail, setShowEmail] = useState(false);
    const [showRef, setShowRef] = useState(false);

    const [add, setAdd] = useState("");
    const [addType, setAddType] = useState(null);

    const [phone, setPhone] = useState("");
    const [phoneName, setPhoneNam] = useState("");

    const [emailNew, setEmailNew] = useState("");

    const [refName, setRefName] = useState("");
    const [refEmail, setRefEmail] = useState("");
    const [refPhone, setRefPhone] = useState("");
    const [refAddress, setRefAddress] = useState("");

    // masking UI states
    const [maskedPhone, setMaskedPhone] = useState(true);
    const [maskedAltPhones, setMaskedAltPhones] = useState({});

    const [maskPrimaryEmail, setMaskPrimaryEmail] = useState(true);
    const [maskedEmailIndex, setMaskedEmailIndex] = useState({});

    // safety mounted ref to avoid setState after unmount
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // ----------------------
    // Small UI helpers
    // ----------------------
    const showSuccess = (msg) => {
        Alert.alert("Success", msg);
    };
    const showError = (msg) => {
        Alert.alert("Error", msg);
    };

    // ----------------------
    // API helpers
    // ----------------------
    const get = useCallback(
        async (url) => {
            const res = await apiClient.get(`${url}`, { headers: authHeaders });
            return res?.data?.data ?? [];
        },
        [token]
    );



    // Attempt to find existing contact centre id for this LAN.
    const getExistingContactCentreId = useCallback(async () => {
        try {
            const res = await apiClient.get(`getAllContactCentres`, { headers: authHeaders });
            const list = res?.data?.data ?? [];
            const lan = String(data?.loanAccountNumber ?? "").trim();

            // The API might store full LAN or longer values; we match by "endsWith" to be robust
            const match = list.find((item) => {
                if (!item?.loanAccountNumber) return false;
                return String(item.loanAccountNumber).endsWith(lan);
            });

            return match ? match.contactCentreId : null;
        } catch (e) {
            console.log("getExistingContactCentreId error", e);
            return null;
        }
    }, [data, token]);

    // Create contact centre only when not present
    const createContactCentre = useCallback(async () => {
        try {
            const user = userProfile || {};
            const payload = {
                loanAccountNumber: data.loanAccountNumber,
                user: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    mobileno: user.mobileNo,
                    email: user.email,
                    organisationName: user.organisationName,
                    userType: user.userType,
                    reportingManager: user.reportingManager,
                    status: user.status,
                    designation: user.designation,
                    sendWelcome: user.sendWelcome,
                    userName: user.userName,
                    isActive: user.isActive,
                    expired: user.expired,
                    lender: user.lender,
                    activityType: user.activityType,
                    maxTicketSize: user.maxTicketSize,
                    minTicketSize: user.minTicketSize,
                    maxBucket: user.maxBucket,
                    minBucket: user.minBucket,
                },
            };

            const res = await apiClient.post(`addContactCentre`, payload, { headers: authHeaders });
            const newId = res?.data?.data?.contactCentreId;
            if (mountedRef.current && newId) {
                setContactCentreId(newId);
            }
            return newId;
        } catch (e) {
            console.log("createContactCentre error", e);
            return null;
        }
    }, [data, userProfile, token]);

    // init contact centre: get existing or create
    const initContactCentre = useCallback(async () => {
        try {
            const existingId = await getExistingContactCentreId();
            if (existingId) {
                if (mountedRef.current) setContactCentreId(existingId);
                return existingId;
            }
            const created = await createContactCentre();
            return created;
        } catch (e) {
            console.log("initContactCentre error", e);
            return null;
        }
    }, [getExistingContactCentreId, createContactCentre]);

    // Fetch contact centre ID again (useful after POST actions)
    const fetchContactCentreId = useCallback(async () => {
        try {
            const existingId = await getExistingContactCentreId();
            if (mountedRef.current && existingId) {
                setContactCentreId(existingId);
                return existingId;
            }
            return null;
        } catch (e) {
            console.log("fetchContactCentreId error", e);
            return null;
        }
    }, [getExistingContactCentreId]);

    // Load all data once contactCentreId is ready
    const loadAllContactCentreData = useCallback(
        async (id) => {
            if (!id) return;
            try {
                // run parallel fetches
                const [
                    emailsRes,
                    refsRes,
                    addressesRes,
                    mobilesRes,
                ] = await Promise.all([
                    get(`getContactCentreEmailBycontactCentreId/${id}`),
                    get(`getContactCentreReferenceBycontactCentreId/${id}`),
                    get(`getContactCentreAddressBycontactCentreId/${id}`),
                    get(`getContactCentreMobileNumbersBycontactCentreId/${id}`),
                ]);

                if (!mountedRef.current) return;

                setemailData(Array.isArray(emailsRes) ? emailsRes : []);
                setReferenceData(Array.isArray(refsRes) ? refsRes : []);
                setAddressFromContactCenter(Array.isArray(addressesRes) ? addressesRes : []);
                setAllMobileNumbers(Array.isArray(mobilesRes) ? mobilesRes : []);
            } catch (e) {
                console.log("loadAllContactCentreData error", e);
            }
        },
        [token]
    );

    // fetch alternate mobiles by LAN (separate API)
    const fetchAlternateMobiles = useCallback(async () => {
        try {
            const res = await get(`getAllMobileNumberbyLan/${data?.loanAccountNumber}`);
            if (mountedRef.current) setAlternetMobile(res ?? []);
        } catch (e) {
            console.log("fetchAlternateMobiles error", e);
        }
    }, [data, token]);

    // ----------------------
    // Side effects (order matters)
    // 1) init contact centre (create if needed)
    // 2) when contactCentreId changes -> loadAllData
    // 3) fetch alternate mobiles always
    // ----------------------
    useEffect(() => {
        initContactCentre();
    }, []);

    useEffect(() => {
        if (contactCentreId) {
            loadAllContactCentreData(contactCentreId);
        }
    }, [contactCentreId]);

    useEffect(() => {
        fetchAlternateMobiles();
    }, []);

    // ----------------------
    // Unified POST helper: runs POST, shows success, refreshes id & data
    // ----------------------
    const postDataAndRefresh = useCallback(
        async (endpoint, payload, successMessage) => {
            try {
                const res = await apiClient.post(endpoint, payload, { headers: authHeaders });
                if (res?.data) {
                    showSuccess(successMessage || "Saved");
                    // re-fetch ID (in case creation happened) and then load data
                    const newId = await fetchContactCentreId();
                    if (newId) {
                        await loadAllContactCentreData(newId);
                    }
                    return res.data;
                }
                throw new Error("Empty response");
            } catch (e) {
                console.log("postDataAndRefresh error", e);
                showError(e?.message || "Something went wrong");
                return null;
            }
        },
        [token, contactCentreId]
    );

    // ----------------------
    // Add handlers (use the unified postDataAndRefresh)
    // ----------------------
    const addAddress = useCallback(async () => {
        // ensure contact centre exists (init asynchronously but do not block UI)
        if (!contactCentreId) await initContactCentre();

        if (!add) return showError("Please enter address");
        if (!addType) return showError("Please select address type");

        await postDataAndRefresh(
            `addContactCentreAddress`,
            { address: add, addressType: addType.name || addType, contactCentre: contactCentreId },
            "Address added successfully"
        );

        setShowAddress(false);
        // reset inputs
        setAdd("");
        setAddType(null);
    }, [add, addType, contactCentreId]);

    const addPhone = useCallback(async () => {
        if (!contactCentreId) await initContactCentre();

        if (!phone) return showError("Please enter mobile number");
        if (!phoneName) return showError("Please enter contact name");

        await postDataAndRefresh(
            `addContactCentreMobileNumbers`,
            { contactName: phoneName, contactNumber: phone, contactCentre: contactCentreId },
            "Phone number added successfully"
        );

        setShowPhone(false);
        setPhone("");
        setPhoneNam("");
    }, [phone, phoneName, contactCentreId]);

    const addEmail = useCallback(async () => {
        if (!contactCentreId) await initContactCentre();
        if (!emailNew) return showError("Please enter email");

        await postDataAndRefresh(
            `addContactCentreEmail`,
            { emailAddress: emailNew, contactCentre: contactCentreId },
            "Email added successfully"
        );

        setShowEmail(false);
        setEmailNew("");
    }, [emailNew, contactCentreId]);

    const addRef = useCallback(async () => {
        if (!contactCentreId) await initContactCentre();
        if (!refName) return showError("Please enter name");
        if (!refEmail) return showError("Please enter email");
        if (!refPhone) return showError("Please enter phone");
        if (!refAddress) return showError("Please enter address");

        await postDataAndRefresh(
            `addContactCentreReference`,
            {
                referenceAddress: refAddress,
                referenceEmail: refEmail,
                referenceMobile: refPhone,
                refrenceName: refName,
                contactCentre: contactCentreId,
            },
            "Reference added successfully"
        );

        setShowRef(false);
        setRefName("");
        setRefEmail("");
        setRefPhone("");
        setRefAddress("");
    }, [refName, refEmail, refPhone, refAddress, contactCentreId]);

    // utility for toggling mask on alternate numbers
    const toggleMaskforPhone = (index) => {
        setMaskedAltPhones((prev) => ({ ...prev, [index]: !prev[index] }));
    };
    const toggleEmailMask = (index) => {
        setMaskedEmailIndex(prev => ({
            ...prev,
            [index]: !prev[index],
        }));
    };
    // ----------------------
    // Row renderers
    // ----------------------
    const renderMobileRow = ({ item, index }) => {
        const isMasked = maskedAltPhones[index] ?? true;
        const fullPhoneNumber = item?.contactNumber;
        const phoneNumberToShow = isMasked ? maskPhoneNumber(fullPhoneNumber) : fullPhoneNumber;
        return (
            <InfoRowSimple
                label={item?.contactName || "Alternate Number"}
                value={phoneNumberToShow}
                isDark={index % 2 === 1}
            >
                <IconButton icon={isMasked ? "eye-off" : "eye"} onPress={() => toggleMaskforPhone(index)} />
                <IconButton icon="phone" onPress={() => Linking.openURL(`tel:${fullPhoneNumber}`)} />
                <TouchableOpacity
                    onPress={() =>
                        navigation.navigate("CallSummary", { data: data, contactCentreId, phoneNumber: fullPhoneNumber })
                    }
                    style={{ marginLeft: 8 }}
                >
                    <Image source={require("../../../asset/images/support.png")} style={{ height: 20, width: 20 }} />
                </TouchableOpacity>
            </InfoRowSimple>
        );
    };

    const renderReferenceRow = ({ item, index }) => {
        return (
            <View key={index}>
                <InfoRowSimple label="Name" value={item.refrenceName} isDark={index % 2 === 1} />
                <InfoRowSimple label="Address" value={item.referenceAddress} isDark={index % 2 === 0}>
                    <IconButton icon="map-marker" onPress={() => openMapWithDirections(item.referenceAddress)} />
                </InfoRowSimple>
                <InfoRowSimple label="Email" value={item.referenceEmail} isDark={index % 2 === 1}>
                    <IconButton icon="email-outline" onPress={() => Linking.openURL(`mailto:${item.referenceEmail}`)} />
                </InfoRowSimple>
                <InfoRowSimple label="Mobile" value={item.referenceMobile} isDark={index % 2 === 0}>
                    <IconButton icon="phone" onPress={() => Linking.openURL(`tel:${item.referenceMobile}`)} />
                </InfoRowSimple>
            </View>
        );
    };

    const renderPrimaryEmailRow = () => {
        const email = data?.email || "--";

        // Masking logic — same as alternate emails
        const masked =
            email.length > 4 ? `****${email.slice(4)}` : "****";

        const valueToShow = maskPrimaryEmail ? masked : email;

        return (
            <InfoRowSimple label="Email" value={valueToShow}>
                {/* 👁 Toggle visibility */}
                <IconButton
                    icon={maskPrimaryEmail ? "eye-off" : "eye"}
                    onPress={() => setMaskPrimaryEmail(!maskPrimaryEmail)}
                />

                {/* ✉ Open email app */}
                <IconButton
                    icon="email-outline"
                    onPress={() => Linking.openURL(`mailto:${email}`)}
                />
            </InfoRowSimple>
        );
    };
    const renderEmailRow = ({ item, index }) => {
        const email = item.emailAddress || "";
        const masked = email.length > 4 ? `****${email.slice(4)}` : "****";

        const isMasked = maskedEmailIndex[index] ?? true;

        return (
            <InfoRowSimple
                label="Alternate Email"
                value={isMasked ? masked : email}
                isDark={index % 2 === 1}
            >
                {/* toggle eye */}
                <IconButton
                    icon={isMasked ? "eye-off" : "eye"}
                    onPress={() =>
                        setMaskedEmailIndex((prev) => ({
                            ...prev,
                            [index]: !prev[index],
                        }))
                    }
                />

                {/* open mail */}
                <IconButton
                    icon="email-outline"
                    onPress={() => Linking.openURL(`mailto:${email}`)}
                />
            </InfoRowSimple>
        );
    };


    // small helpers
    function openMapWithDirections(addr) {
        if (!addr) return;
        const scheme = Platform.select({ ios: "maps://0,0?q=", android: "geo:0,0?q=" });
        const url = Platform.select({
            ios: `${scheme}${encodeURIComponent(addr)}`,
            android: `${scheme}${encodeURIComponent(addr)}`,
        });
        Linking.openURL(url).catch((e) => console.log("openMap error", e));
    }

    function maskPhoneNumber(p = "") {
        const s = String(p);
        if (!s) return "--";
        if (s.length <= 4) return s;
        return "****" + s.slice(-4);
    }

    // ----------------------
    // UI
    // ----------------------

    const renderAddressRow = ({ item, index }) => (
        <InfoRowSimple
            label={item.addressType || "Address"}
            value={item.address}
            isDark={index % 2 === 1}
        >
            <IconButton
                icon="map-marker"
                size={28}
                onPress={() => openMapWithDirections(item.address)}
            />
        </InfoRowSimple>
    );



    return (
        <View style={{ flex: 1, backgroundColor: white }}>
            <FlatList
                data={[1]}   // dummy data so FlatList renders once
                keyExtractor={() => "dummy"}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={() => (
                    <>
                        {/* Phone Card */}
                        <View style={styles.card}>
                            <SectionHeader title="Phone" onAdd={() => setShowPhone(true)} />

                            <InfoRowSimple
                                label={data?.name ?? "Primary"}
                                value={maskedPhone ? maskPhoneNumber(data?.mobile) : data?.mobile}
                            >
                                <IconButton icon={maskedPhone ? "eye-off" : "eye"} onPress={() => setMaskedPhone(v => !v)} />
                                <IconButton icon="phone" onPress={() => Linking.openURL(`tel:${data?.mobile}`)} />
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("CallSummary", { data, contactCentreId })
                                    }>
                                    <Image source={require("../../../asset/images/support.png")} style={{ height: 20, width: 20 }} />
                                </TouchableOpacity>
                            </InfoRowSimple>

                            {/* Mobile Numbers List */}
                            <FlatList
                                data={allMobileNumbers}
                                renderItem={renderMobileRow}
                                keyExtractor={(i, idx) => String(idx)}
                                scrollEnabled={false}     // <-- IMPORTANT
                            />
                        </View>

                        {/* Address Card */}
                        <View style={styles.card}>
                            <SectionHeader title="Address" onAdd={() => setShowAddress(true)} />

                            <InfoRowSimple label="Home Primary Address" value={data?.primaryAddress}>
                                <IconButton icon="map-marker" size={28} onPress={() => openMapWithDirections(data?.primaryAddress)} />
                            </InfoRowSimple>

                            <InfoRowSimple label="Office Primary Address" value={data?.officeAddress} isDark>
                                <IconButton icon="map-marker" size={28} onPress={() => openMapWithDirections(data?.officeAddress)} />
                            </InfoRowSimple>

                            {/* Address List */}
                            <FlatList
                                data={addressFromContactCenter}
                                renderItem={renderAddressRow}
                                keyExtractor={(i, idx) => String(idx)}
                                scrollEnabled={false}     // <-- IMPORTANT
                            />
                        </View>

                        {/* Email Card */}
                        <View style={styles.card}>
                            <SectionHeader title="Email" onAdd={() => setShowEmail(true)} />

                            {renderPrimaryEmailRow()}

                            <FlatList
                                data={emailData}
                                renderItem={renderEmailRow}
                                keyExtractor={(i, idx) => String(idx)}
                                scrollEnabled={false}    // <-- IMPORTANT
                            />
                        </View>

                        {/* Reference Card */}
                        <View style={styles.card}>
                            <SectionHeader title="Reference" onAdd={() => setShowRef(true)} />

                            <FlatList
                                data={referenceData}
                                renderItem={renderReferenceRow}
                                keyExtractor={(i, idx) => String(idx)}
                                scrollEnabled={false}    // <-- IMPORTANT
                                ListEmptyComponent={<InfoRowSimple label="Reference" value="--" />}
                            />
                        </View>
                    </>
                )}
            />


            {/* ---------- Modals ---------- */}

            {/* Add Address */}
            <Modal isVisible={showAddress} onBackdropPress={() => setShowAddress(false)}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Add Address</Text>

                    <View style={{ width: "90%", marginTop: 12 }}>
                        <Text style={{ marginBottom: 6 }}>Address</Text>
                        <TextInputLite value={add} onChangeText={setAdd} placeholder="Enter address" />
                    </View>

                    {/* <View style={{ width: "90%", marginTop: 12 }}>
                        <Text style={{ marginBottom: 6 }}>Address Type</Text>
                        <TouchableOpacity
                            style={styles.select}
                            onPress={() =>
                                setAddType({ id: 1, name: "Home Secondary Address" }) 
                            }
                        >
                            <Text>{addType?.name ?? "Select address type (tap to pick demo)"}</Text>
                        </TouchableOpacity>
                    </View>  */}

                    <Dropdown
                        style={styles.dropdown}
                        placeholderStyle={styles.placeholderStyle}
                        selectedTextStyle={styles.selectedTextStyle}
                        inputSearchStyle={styles.inputSearchStyle}
                        iconStyle={styles.iconStyle}
                        itemTextStyle={styles.itemTextStyle}
                        data={[
                            { id: 1, name: 'Home Secondary Address' },
                            { id: 2, name: 'Office Secondary Address' },
                        ]}
                        value={addType}
                        maxHeight={400}
                        labelField="name"
                        valueField="name"
                        placeholder={'Select Address Type'}
                        // value={value}
                        onChange={item => {
                            setAddType(item);
                            // getAddressType(item.applicantType);
                        }}
                    />

                    <View style={styles.modalBtns}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAddress(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.okBtn} onPress={addAddress}>
                            <Text style={styles.okText}>Add Address</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Phone */}
            <Modal isVisible={showPhone} onBackdropPress={() => setShowPhone(false)}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Add Phone</Text>

                    <View style={{ width: "90%", marginTop: 12 }}>
                        <Text style={{ marginBottom: 6 }}>Mobile</Text>
                        <TextInputLite value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="Enter mobile" maxLength={10} />
                    </View>

                    <View style={{ width: "90%", marginTop: 12 }}>
                        <Text style={{ marginBottom: 6 }}>Contact Name</Text>
                        <TextInputLite value={phoneName} onChangeText={setPhoneNam} placeholder="Enter name" />
                    </View>

                    <View style={styles.modalBtns}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowPhone(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.okBtn} onPress={addPhone}>
                            <Text style={styles.okText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Email */}
            <Modal isVisible={showEmail} onBackdropPress={() => setShowEmail(false)}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Add Email</Text>

                    <View style={{ width: "90%", marginTop: 12 }}>
                        <Text style={{ marginBottom: 6 }}>Email</Text>
                        <TextInputLite value={emailNew} onChangeText={setEmailNew} placeholder="Enter email" />
                    </View>

                    <View style={styles.modalBtns}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowEmail(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.okBtn} onPress={addEmail}>
                            <Text style={styles.okText}>Add</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Add Reference */}
            <Modal isVisible={showRef} onBackdropPress={() => setShowRef(false)}>
                <View style={styles.modalCard}>
                    <Text style={styles.modalTitle}>Add Reference</Text>

                    <View style={{ width: "90%", marginTop: 12 }}>
                        <Text style={{ marginBottom: 6 }}>Name</Text>
                        <TextInputLite value={refName} onChangeText={setRefName} placeholder="Name" />
                    </View>

                    <View style={{ width: "90%", marginTop: 12 }}>
                        <Text style={{ marginBottom: 6 }}>Email</Text>
                        <TextInputLite value={refEmail} onChangeText={setRefEmail} placeholder="Email" />
                    </View>

                    <View style={{ width: "90%", marginTop: 12 }}>
                        <Text style={{ marginBottom: 6 }}>Phone</Text>
                        <TextInputLite value={refPhone} onChangeText={setRefPhone} placeholder="Phone" keyboardType="phone-pad" maxLength={10} />
                    </View>

                    <View style={{ width: "90%", marginTop: 12 }}>
                        <Text style={{ marginBottom: 6 }}>Address</Text>
                        <TextInputLite value={refAddress} onChangeText={setRefAddress} placeholder="Address" />
                    </View>

                    <View style={styles.modalBtns}>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowRef(false)}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.okBtn} onPress={addRef}>
                            <Text style={styles.okText}>Add Reference</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

// ----------------------
// Tiny text input (no external dependency)
// replace with your UsrnmTxtInp component if you like.
// ----------------------
const TextInputLite = ({
    value,
    onChangeText,
    placeholder,
    keyboardType = "default",
    maxLength,
}) => {
    return (
        <View style={styles.inputLiteWrap}>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#888"
                keyboardType={keyboardType}
                style={styles.inputLite}
                autoCapitalize="none"
                maxLength={maxLength}
            />
        </View>
    );
};

// ----------------------
// Styles
// ----------------------
const styles = StyleSheet.create({
    card: {
        marginHorizontal: 10,
        marginTop: 20,
        borderWidth: 1,
        borderColor: theme.light.activeChatText,
        borderRadius: 8,
        backgroundColor: white,
        overflow: "hidden",
    },
    sectionHeader: {
        flexDirection: "row",
        padding: 12,
        alignItems: "center",
        backgroundColor: theme.light.darkBlue,
        justifyContent: "space-between",
    },
    sectionHeaderText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#fff",
    },
    addBtn: {
        padding: 4,
        borderRadius: 6,
    },
    row: {
        flexDirection: "row",
        padding: 10,
        alignItems: "center",
    },
    label: {
        width: width * 0.32,
        fontSize: 14,
        fontWeight: "500",
        color: theme.light.voilet,
        fontFamily: "Calibri",
    },
    valueAndIcons: {
        width: width * 0.55,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    value: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: "#001D56",
        paddingRight: 8,
        flexWrap: "wrap",
    },
    iconWrap: {
        flexDirection: "row",
        alignItems: "center",
    },
    modalCard: {
        width: "90%",
        alignSelf: "center",
        alignItems: "center",
        borderRadius: 10,
        backgroundColor: "white",
        paddingVertical: 18,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: theme.light.darkBlue,
    },
    modalBtns: {
        flexDirection: "row",
        width: "90%",
        justifyContent: "space-between",
        marginTop: 16,
    },
    cancelBtn: {
        flex: 1,
        marginRight: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.light.darkBlue,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    okBtn: {
        flex: 1,
        marginLeft: 8,
        borderRadius: 8,
        backgroundColor: theme.light.darkBlue,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    cancelText: { color: theme.light.darkBlue, fontWeight: "700" },
    okText: { color: white, fontWeight: "700" },

    inputLiteWrap: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        height: 44,
        justifyContent: "center",
        paddingHorizontal: 12,
        backgroundColor: "#fff",
    },
    select: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        height: 44,
        justifyContent: "center",
        paddingHorizontal: 12,
        backgroundColor: "#fff",
    },
    dropdown: {
        // flex: 1,
        marginTop: 12,
        height: 50,
        width: '93%',
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        borderColor: theme.light.vanishModeText,
        backgroundColor: theme.light.RightMessageText,
        fontSize: 16,
    },

    placeholderStyle: {
        fontSize: 16,
        color: theme.light.TextColor,
    },
    selectedTextStyle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.light.headerText,
        marginLeft: 10,
    },
    inputSearchStyle: {
        height: 40,
        fontSize: 16,
        color: theme.light.TextColor,
        backgroundColor: theme.light.RightMessageText,
    },
    itemTextStyle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.light.TextColor,
    },
});