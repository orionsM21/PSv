import React, { useState } from 'react';
import { View, TextInput, Button, ToastAndroid, StyleSheet, Alert, Platform, PermissionsAndroid, Linking } from 'react-native';
import Contacts from 'react-native-contacts';
import { useNavigation } from '@react-navigation/native';

const AddContactScreen = ({ route }) => {
    const navigation = useNavigation();
    const { onGoBack } = route.params || {};
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');


    const requestContactsPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                    PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS,
                ]);

                const readGranted = granted[PermissionsAndroid.PERMISSIONS.READ_CONTACTS] === PermissionsAndroid.RESULTS.GRANTED;
                const writeGranted = granted[PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS] === PermissionsAndroid.RESULTS.GRANTED;

                if (readGranted && writeGranted) return true;

                if (
                    granted[PermissionsAndroid.PERMISSIONS.READ_CONTACTS] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ||
                    granted[PermissionsAndroid.PERMISSIONS.WRITE_CONTACTS] === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
                ) {
                    Alert.alert(
                        'Permission Required',
                        'Please enable contacts permissions from settings.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ]
                    );
                } else {
                    Alert.alert(
                        'Permission Denied',
                        'Contacts access is required. Please try again.',
                        [
                            {
                                text: 'Retry',
                                onPress: () => requestContactsPermission(),
                            },
                            { text: 'Cancel', style: 'cancel' },
                        ]
                    );
                }
                return false;
            } catch (error) {
                console.warn('Permission error:', error);
                return false;
            }
        }
        return true; // iOS permissions handled separately
    };

    const handleAdd = async () => {
        if (!name.trim()) {
            Alert.alert('Validation', 'Please enter a contact name.');
            return;
        }
        if (phone.trim() && !/^\+?\d{6,15}$/.test(phone.trim())) {
            Alert.alert('Validation', 'Please enter a valid phone number.');
            return;
        }

        const hasPermission = await requestContactsPermission();
        if (!hasPermission) return;

        const newContact = {
            familyName: '',
            givenName: name.trim(),
            phoneNumbers: phone.trim() ? [{ label: 'mobile', number: phone.trim() }] : [],
        };

        Contacts.addContact(newContact, (err) => {
            if (err) {
                Alert.alert('Error', 'Failed to add contact. Please try again.');
                console.error(err);
            } else {
                if (Platform.OS === 'android') {
                    ToastAndroid.show(`Contact of ${name.trim()} Added Successfully!`, ToastAndroid.LONG);
                }

                if (onGoBack) {
                    onGoBack();
                }

                // ✅ Go back to previous screen
                navigation.goBack();
            }
        });
        navigation.goBack();

    };

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.input}
                placeholder="Enter contact name"
                value={name}
                onChangeText={setName}
            />
            <TextInput
                style={styles.input}
                placeholder="Enter mobile number (optional)"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
            />
            <Button title="Add Contact" onPress={handleAdd} />
        </View>
    );
}

export default AddContactScreen;

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'center' },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
});
