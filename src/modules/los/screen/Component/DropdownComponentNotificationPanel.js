import React, { useState } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    TextInput
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';

const DropdownComponentNotificationPanel = ({ users, selectedUsers, setSelectedUsers }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [tempSelected, setTempSelected] = useState([...selectedUsers]);
    const [searchText, setSearchText] = useState(""); // 🔍 search text

    const toggleUser = (user) => {
        const exists = tempSelected.some(u => u.value === user.value);
        if (exists) {
            setTempSelected(tempSelected.filter(u => u.value !== user.value));
        } else {
            setTempSelected([...tempSelected, user]);
        }
    };

    const onDone = () => {
        setSelectedUsers(tempSelected);
        setModalVisible(false);
        setSearchText(""); // reset search
    };

    const isChecked = (user) =>
        tempSelected.some(u => u.value === user.value);

    // 🔍 filter users
    const filteredUsers = users.filter(u =>
        u.label.toLowerCase().includes(searchText.toLowerCase()) ||
        u.role.toLowerCase().includes(searchText.toLowerCase()) ||
        u.value.toLowerCase().includes(searchText.toLowerCase())
    );

    const sortedUsers = filteredUsers.sort((a, b) => {
        const aSelected = tempSelected.some(u => u.value === a.value);
        const bSelected = tempSelected.some(u => u.value === b.value);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        return a.label.localeCompare(b.label); // keep alphabetical order
    });

    return (
        <View style={styles.dropdownWrapper}>
            <TouchableOpacity
                style={[styles.dropdown, { minHeight: 50, paddingVertical: 10 }]}
                onPress={() => {
                    setTempSelected([...selectedUsers]);
                    setModalVisible(true);
                }}
            >
                <Text style={styles.dropdownText}>
                    {selectedUsers.length > 0
                        ? selectedUsers.map(u => u.label).join(', ')
                        : 'Select users'}
                </Text>
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>Select Users</Text>

                        {/* 🔍 Search bar */}
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name, role, or ID..."
                            value={searchText}
                            onChangeText={setSearchText}
                        />

                        {/* 🔁 Select All / Clear All */}
                        <TouchableOpacity
                            onPress={() => {
                                if (tempSelected.length === users.length) {
                                    setTempSelected([]);
                                } else {
                                    setTempSelected([...users]);
                                }
                            }}
                            style={styles.selectAllButton}
                        >
                            <Text style={styles.selectAllText}>
                                {tempSelected.length === users.length ? 'Clear All' : 'Select All'}
                            </Text>
                        </TouchableOpacity>

                        <FlatList
                            data={sortedUsers}   // ⬅️ use sortedUsers instead of filteredUsers
                            keyExtractor={(item) => item.value}
                            ListEmptyComponent={<Text style={styles.noResults}>No results found</Text>}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => toggleUser(item)}
                                >
                                    <CheckBox
                                        value={isChecked(item)}
                                        onValueChange={() => toggleUser(item)}
                                    />
                                    <View>
                                        <Text style={styles.optionText}>{item.label} ({item.role})</Text>
                                        <Text style={[styles.optionText, { fontSize: 12, color: '#272626FF' }]}>
                                            ID: {item.value}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />


                        <TouchableOpacity style={styles.doneButton} onPress={onDone}>
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    dropdownWrapper: {
        marginVertical: 12,
    },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
    },
    dropdownText: {
        fontSize: 16,
        flexWrap: 'wrap',
        color: '#333',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    modalBox: {
        marginHorizontal: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 8,
        marginBottom: 10,
        fontSize: 14,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    optionText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#272626FF'
    },
    doneButton: {
        backgroundColor: '#2196F3',
        paddingVertical: 10,
        borderRadius: 6,
        marginTop: 16,
    },
    doneText: {
        color: '#fff',
        textAlign: 'center',
        fontSize: 16,
    },
    selectAllButton: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        alignSelf: 'flex-end',
        marginBottom: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
    },
    selectAllText: {
        color: '#333',
        fontWeight: '500',
    },
    noResults: {
        textAlign: 'center',
        marginTop: 20,
        color: '#999',
        fontSize: 14,
    },
});

export default DropdownComponentNotificationPanel;
