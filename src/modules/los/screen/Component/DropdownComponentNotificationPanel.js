import React, { useMemo, useState } from "react";
import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import CheckBox from "@react-native-community/checkbox";

const THEME = {
    overlay: "rgba(2, 6, 23, 0.62)",
    card: "#FFFFFF",
    cardMuted: "#F8FAFC",
    border: "#D8E1EB",
    text: "#0F172A",
    textSecondary: "#5B6B80",
    textMuted: "#8A99AC",
    primary: "#0F62FE",
    primarySoft: "#E7F0FF",
};

export default function DropdownComponentNotificationPanel({
    users,
    selectedUsers,
    setSelectedUsers,
}) {
    const [modalVisible, setModalVisible] = useState(false);
    const [tempSelected, setTempSelected] = useState(selectedUsers);
    const [searchText, setSearchText] = useState("");

    const toggleUser = user => {
        const exists = tempSelected.some(current => current.value === user.value);
        if (exists) {
            setTempSelected(tempSelected.filter(current => current.value !== user.value));
            return;
        }
        setTempSelected([...tempSelected, user]);
    };

    const openSelector = () => {
        setTempSelected(selectedUsers);
        setModalVisible(true);
    };

    const onDone = () => {
        setSelectedUsers(tempSelected);
        setModalVisible(false);
        setSearchText("");
    };

    const filteredUsers = useMemo(() => {
        const keyword = searchText.trim().toLowerCase();
        const list = users || [];
        const base = !keyword
            ? list
            : list.filter(
                user =>
                    user.label?.toLowerCase().includes(keyword) ||
                    user.value?.toLowerCase().includes(keyword) ||
                    user.subtitle?.toLowerCase().includes(keyword)
            );

        return [...base].sort((a, b) => {
            const aSelected = tempSelected.some(item => item.value === a.value);
            const bSelected = tempSelected.some(item => item.value === b.value);

            if (aSelected && !bSelected) return -1;
            if (!aSelected && bSelected) return 1;
            return (a.label || "").localeCompare(b.label || "");
        });
    }, [searchText, tempSelected, users]);

    const allSelected = users.length > 0 && tempSelected.length === users.length;

    return (
        <View style={styles.wrapper}>
            <TouchableOpacity style={styles.trigger} onPress={openSelector} activeOpacity={0.9}>
                <Text numberOfLines={2} style={[styles.triggerText, !selectedUsers.length && styles.placeholder]}>
                    {selectedUsers.length
                        ? selectedUsers.map(user => user.label).join(", ")
                        : "Select users"}
                </Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalTitle}>Select Recipients</Text>

                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name or user ID"
                            placeholderTextColor={THEME.textMuted}
                            value={searchText}
                            onChangeText={setSearchText}
                        />

                        <TouchableOpacity
                            style={styles.selectAllButton}
                            onPress={() => setTempSelected(allSelected ? [] : [...users])}
                            activeOpacity={0.9}
                        >
                            <Text style={styles.selectAllText}>{allSelected ? "Clear All" : "Select All"}</Text>
                        </TouchableOpacity>

                        <FlatList
                            data={filteredUsers}
                            keyExtractor={item => item.value}
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={<Text style={styles.emptyText}>No users found</Text>}
                            renderItem={({ item }) => {
                                const checked = tempSelected.some(current => current.value === item.value);
                                return (
                                    <Pressable style={styles.optionRow} onPress={() => toggleUser(item)}>
                                        <CheckBox value={checked} onValueChange={() => toggleUser(item)} />
                                        <View style={styles.optionCopy}>
                                            <Text style={styles.optionTitle}>{item.label}</Text>
                                            <Text style={styles.optionMeta}>{`ID: ${item.value}`}</Text>
                                        </View>
                                    </Pressable>
                                );
                            }}
                        />

                        <TouchableOpacity style={styles.doneButton} onPress={onDone} activeOpacity={0.9}>
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 18,
    },
    trigger: {
        minHeight: 54,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.card,
        justifyContent: "center",
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    triggerText: {
        color: THEME.text,
        fontSize: 14,
        lineHeight: 20,
    },
    placeholder: {
        color: THEME.textMuted,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        backgroundColor: THEME.overlay,
        paddingHorizontal: 18,
    },
    modalCard: {
        maxHeight: "78%",
        borderRadius: 24,
        backgroundColor: THEME.card,
        padding: 18,
    },
    modalTitle: {
        color: THEME.text,
        fontSize: 20,
        fontWeight: "800",
        marginBottom: 12,
    },
    searchInput: {
        minHeight: 50,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: THEME.border,
        backgroundColor: THEME.cardMuted,
        paddingHorizontal: 14,
        color: THEME.text,
        marginBottom: 10,
    },
    selectAllButton: {
        alignSelf: "flex-end",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: THEME.primarySoft,
        marginBottom: 8,
    },
    selectAllText: {
        color: THEME.primary,
        fontSize: 13,
        fontWeight: "700",
    },
    optionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#EEF2F7",
    },
    optionCopy: {
        marginLeft: 8,
        flex: 1,
    },
    optionTitle: {
        color: THEME.text,
        fontSize: 15,
        fontWeight: "700",
    },
    optionMeta: {
        color: THEME.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    emptyText: {
        textAlign: "center",
        color: THEME.textMuted,
        fontSize: 14,
        marginVertical: 20,
    },
    doneButton: {
        minHeight: 50,
        borderRadius: 16,
        backgroundColor: THEME.primary,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 14,
    },
    doneText: {
        color: "#FFFFFF",
        fontSize: 15,
        fontWeight: "800",
    },
});
