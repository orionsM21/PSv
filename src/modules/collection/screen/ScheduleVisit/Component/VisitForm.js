// /components/VisitForm.js
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
} from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { Dropdown } from "react-native-element-dropdown";
import moment from "moment-timezone";
import { theme, white } from "../../../utility/Theme";
import { scale, moderateScale, verticalScale } from 'react-native-size-matters';
export default function VisitForm({
    isEdit = false,
    initialValues = {},
    nameList,
    addressTypeList,
    addressList,
    outcomeTypes,
    onAddressTypeChange,        // fetchAddressTypes(applicantType)
    onAddressTypeSelected,      // fetchAddresses(addressType, applicantType)
    onSubmit,
    getLatLngFromAddress,
    editItem
}) {
    console.log(nameList, addressTypeList, addressList, initialValues, 'Fromeddit')
    // -----------------------------
    // STATE
    // -----------------------------
    const [selectedNameObj, setSelectedNameObj] = useState(null);
    const [name, setName] = useState(null);

    const [addressType, setAddressType] = useState(null);
    const [address, setAddress] = useState(null);

    const [remark, setRemark] = useState("");
    const [status, setStatus] = useState(null);
    const [outcomeValue, setOutcomeValue] = useState(null);

    const [dateTime, setDateTime] = useState(new Date());
    const [pickerVisible, setPickerVisible] = useState(false);

    console.log(status, 'statusstatusstatus')
    // ===========================================================
    // 🔥 AUTO-SELECT VALUES IN EDIT MODE (FULL MATCHING FIXED)
    // ===========================================================
    // AUTO-SELECT (RUN ONLY ONCE)

    useEffect(() => {
        if (editItem) {
            setAddress(editItem?.address)
        }
    }, [editItem])
    useEffect(() => {
        if (!isEdit) return;

        // Run only when data lists are loaded
        if (!nameList?.length) return;

        // 1️⃣ Name auto-select
        const foundName = nameList.find(n => n.name === initialValues.name);
        if (foundName) {
            setSelectedNameObj(foundName);
            setName(foundName.name);

            // Fetch address types only once
            onAddressTypeChange(foundName.applicantType);
        }

    }, [isEdit, initialValues, nameList]);   // run once when nameList arrives



    // SECOND EFFECT — when addressTypeList loads
    useEffect(() => {
        if (!isEdit) return;
        if (!addressTypeList?.length) return;

        const foundType = addressTypeList.find(
            t => t.addressType === initialValues.addressType
        );

        if (foundType) {
            setAddressType(foundType);

            // Fetch addresses once
            onAddressTypeSelected?.(
                foundType.addressType,
                initialValues.applicantType
            );
        }

    }, [isEdit, initialValues, addressTypeList]);



    // THIRD EFFECT — when addressList loads
    useEffect(() => {
        if (!isEdit) return;

        // 1️⃣ No address list yet → do nothing
        if (!addressList || addressList.length === 0) return;

        // 2️⃣ Try to find a match from the list
        const matched = addressList.find(
            (a) => a.address === (initialValues?.address || editItem?.address)
        );

        // 3️⃣ Pick matched or fallback to editItem.address
        const selectedAddress = matched?.address || editItem?.address;

        if (selectedAddress) {
            setAddress(selectedAddress);
            getLatLngFromAddress(selectedAddress);
        }

    }, [isEdit, addressList]);




    // 4️⃣ Setup simple fields (run once)
    useEffect(() => {
        if (!isEdit) return;

        if (initialValues.remark) setRemark(initialValues.remark);

        if (initialValues.dateTime) {
            setDateTime(
                moment(initialValues.dateTime, "YYYY-MM-DD HH:mm").toDate()
            );
        }

        setStatus(
            initialValues.status === "ReScheduled" ? 0 :
                initialValues.status === "Completed" ? 1 :
                    initialValues.status === "Rejected" ? 2 : null
        );

        if (initialValues.outcome && outcomeTypes?.length) {
            const foundOutcome = outcomeTypes.find(
                o => o.description === initialValues.outcome
            );
            if (foundOutcome) setOutcomeValue(foundOutcome);
        }

    }, [isEdit, initialValues]);

    // -----------------------------
    // VALIDATION
    // -----------------------------
    const validate = () => {
        if (!name) {
            Alert.alert("Validation", "Please select Name");
            return false;
        }

        if (!addressType) {
            Alert.alert("Validation", "Please select Address Type");
            return false;
        }

        if (!address) {
            Alert.alert("Validation", "Please select Address");
            return false;
        }

        if (!remark?.trim()) {
            Alert.alert("Validation", "Please enter Remarks");
            return false;
        }
        if (isEdit) {
            if (status === null)
                return Alert.alert("Validation", "Please select Visit Status");
        }


        if (status === 1 && !outcomeValue) {
            Alert.alert("Validation", "Please select visit outcome");
            return false;
        }

        return true;
    };

    // -----------------------------
    // SUBMIT PAYLOAD
    // -----------------------------
    const handleSubmit = () => {
        if (!validate()) return;

        const payload = {
            name,
            addressType: addressType?.addressType,
            address,
            remark,
            date: moment(dateTime).format("YYYY-MM-DD"),
            time: moment(dateTime).format("LT"),
            status:
                status === 0
                    ? "ReScheduled"
                    : status === 1
                        ? "Completed"
                        : "Cancelled",
            outcome: status === 1 ? outcomeValue?.description : null,
        };

        onSubmit(payload);
    };

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <View style={{ paddingVertical: 10 }}>

            {/* DATE & TIME */}
            <Text style={styles.label}>Select Date & Time <Text style={styles.star}>*</Text></Text>

            <TouchableOpacity
                style={styles.dateTimeBox}
                onPress={() => setPickerVisible(true)}
            >
                <Text style={styles.dateTimeText}>
                    {moment(dateTime).format("DD MMM YYYY, LT")}
                </Text>
            </TouchableOpacity>

            <DateTimePickerModal
                isVisible={pickerVisible}
                mode="datetime"
                date={dateTime}
                minimumDate={new Date()}
                onConfirm={(d) => {
                    setDateTime(d);
                    setPickerVisible(false);
                }}
                onCancel={() => setPickerVisible(false)}
            />

            {/* NAME */}
            <Text style={styles.label}>Name <Text style={styles.star}>*</Text></Text>
            <Dropdown
                style={styles.dropdown}
                data={nameList}
                labelField="name"
                valueField="name"
                placeholder="Select Name"
                value={name}
                onChange={(item) => {
                    setSelectedNameObj(item);
                    setName(item.name);
                    onAddressTypeChange(item.applicantType);
                }}

                // 🔥 MAKE DROPDOWN VISIBLE
                containerStyle={styles.dropdownContainer}
                itemTextStyle={styles.dropdownItemText}
                selectedTextStyle={styles.dropdownSelectedText}

                renderItem={(item) => (
                    <View style={styles.dropdownItem}>
                        <Text style={styles.dropdownItemText}>{item.name}</Text>
                    </View>
                )}
            />


            {/* ADDRESS TYPE */}
            <Text style={styles.label}>Address Type <Text style={styles.star}>*</Text></Text>
            <Dropdown
                style={styles.dropdown}
                data={addressTypeList}
                labelField="addressType"
                valueField="id"
                placeholder="Select Address Type"
                value={addressType}
                onChange={(item) => {
                    setAddressType(item);
                    onAddressTypeSelected?.(
                        item.addressType,
                        selectedNameObj?.applicantType
                    );
                }}
                  // 🔥 MAKE DROPDOWN VISIBLE
                containerStyle={styles.dropdownContainer}
                itemTextStyle={styles.dropdownItemText}
                selectedTextStyle={styles.dropdownSelectedText}
            />

            {/* ADDRESS */}
            <Text style={styles.label}>Address <Text style={styles.star}>*</Text></Text>
            <Dropdown
                style={styles.dropdown}
                data={
                    addressList?.length
                        ? addressList
                        : editItem?.address
                            ? [{ address: editItem.address }]
                            : []
                }
                labelField="address"
                valueField="address"
                placeholder="Select Address"
                value={address}
                onChange={async (item) => {
                    setAddress(item.address);
                    await getLatLngFromAddress(item.address);
                }}
                  // 🔥 MAKE DROPDOWN VISIBLE
                containerStyle={styles.dropdownContainer}
                itemTextStyle={styles.dropdownItemText}
                selectedTextStyle={styles.dropdownSelectedText}
            />


            {/* STATUS */}
            {editItem?.name && (
                <>
                    <Text style={styles.label}>Visit Status <Text style={styles.star}>*</Text></Text>

                    <View style={styles.row}>
                        {["ReSchedule", "Completed", "Cancelled"].map((text, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.statusBtn,
                                    status === idx && styles.statusActive,
                                ]}
                                onPress={() => setStatus(idx)}
                            >
                                <Text
                                    style={[
                                        styles.statusText,
                                        status === idx && styles.statusTextActive,
                                    ]}
                                >
                                    {text}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </>
            )}

            {/* OUTCOME ONLY FOR COMPLETED */}
            {status === 1 && (
                <>
                    <Text style={styles.label}>Visit Outcome <Text style={styles.star}>*</Text></Text>
                    <Dropdown
                        style={styles.dropdown}
                        data={outcomeTypes}
                        labelField="description"
                        valueField="id"
                        placeholder="Select Outcome"
                        value={outcomeValue}
                        onChange={(item) => setOutcomeValue(item)}
                    />
                </>
            )}

            {/* REMARK */}
            <Text style={styles.label}>Remarks <Text style={styles.star}>*</Text></Text>
            <TextInput
                style={styles.remarkBox}
                value={remark}
                onChangeText={setRemark}
                multiline
            />

            {/* SUBMIT */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.light.black,
        marginTop: 12,
    },
    dropdown: {
        height: 50,
        borderWidth: 0.8,
        borderColor: "#ccc",
        borderRadius: 10,
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        marginTop: 6,
    },
    dateTimeBox: {
        height: 50,
        borderWidth: 0.8,
        borderColor: "#ccc",
        borderRadius: 10,
        backgroundColor: "#fff",
        justifyContent: "center",
        paddingHorizontal: 12,
        marginTop: 6,
    },
    dateTimeText: {
        fontSize: 14,
        fontWeight: "500",
        color: theme.light.TextColor,
    },
    row: {
        flexDirection: "row",
        marginTop: 6,
    },
    statusBtn: {
        flex: 1,
        paddingVertical: 10,
        marginHorizontal: 5,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: theme.light.darkBlue,
        alignItems: "center",
    },
    statusActive: {
        backgroundColor: theme.light.darkBlue,
    },
    statusText: {
        fontSize: 14,
        fontWeight: "600",
        color: theme.light.darkBlue,
    },
    statusTextActive: {
        color: white,
    },
    remarkBox: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        backgroundColor: "#fff",
        padding: 10,
        marginTop: 6,
        minHeight: 80,
        fontSize: 14,
    },
    submitBtn: {
        height: 50,
        borderRadius: 10,
        backgroundColor: theme.light.darkBlue,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
    },
    submitText: {
        color: white,
        fontWeight: "700",
        fontSize: 16,
    },
    star: {
        color: "red",
    },
    itemTextStyle: {
        fontSize: moderateScale(13),
        color: '#222',
    },

    // 🔹 Dropdown item container
    dropdownItem: {
        paddingVertical: verticalScale(8),
        paddingHorizontal: scale(10),
    },

    // 🔹 Dropdown item text (inside item)
    dropdownContainer: {
        backgroundColor: "#FFFFFF",
        borderRadius: 10,
        elevation: 5,             // android shadow
        shadowColor: "#000",      // iOS shadow
        shadowOpacity: 0.1,
        shadowRadius: 4,
        paddingVertical: 6,
    },

    dropdownItem: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: "#F5F5F5",
        borderBottomWidth: 0.5,
        borderBottomColor: "#ddd",
    },

    dropdownItemText: {
        color: "#333",            // 🔥 visible text color
        fontSize: 14,
    },

    dropdownSelectedText: {
        color: "#000",            // selected item text color
        fontWeight: "600",
    },

});
