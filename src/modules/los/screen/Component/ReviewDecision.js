import React, { useEffect, useState, useCallback } from 'react'
import { StyleSheet, Text, View, FlatList, Image, SafeAreaView, NativeModules, DeviceEventEmitter, Share, TouchableOpacity, ScrollView, Dimensions, PermissionsAndroid, Alert, Platform, ToastAndroid, Linking, ActivityIndicator } from 'react-native'
import axios from 'axios'

import { useSelector } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import RNFetchBlob from 'rn-fetch-blob'
import RNFS from 'react-native-fs';

import IntentLauncher from 'react-native-intent-launcher';
import { lookup } from 'react-native-mime-types';
import PushNotification from "react-native-push-notification";
import { BASE_URL } from '../../api/Endpoints'
const { height, width } = Dimensions.get('window')
const ReviewDecision = ({ route }) => {
    const { applicationNo } = route.params;
    const navigation = useNavigation();
    const [drawerVisible, setDrawerVisible] = useState(false);
    const token = useSelector((state) => state.auth.token);
    const [formattedDocs, setFormattedDocs] = useState([]);
    console.log(formattedDocs, 'BNNBNBNBNBNBNB')
    const [loading, setLoading] = useState(true);

    const toggleDrawer = useCallback(() => setDrawerVisible(prev => !prev), []);
    useEffect(() => {
        const unsubscribe = navigation.addListener('blur', () =>
            setDrawerVisible(false),
        );
        return unsubscribe;
    }, [navigation]);

    const requestAndroidPermissions = async () => {
        if (Platform.OS !== 'android') return true; // iOS doesn't need permissions

        try {
            if (Platform.Version >= 30) {
                // Check if "All Files Access" is already granted
                const hasManageFilesAccess = await RNFetchBlob.fs.exists(RNFetchBlob.fs.dirs.DownloadDir);

                if (!hasManageFilesAccess) {
                    Alert.alert(
                        "Permission Required",
                        "To open files, please grant 'All Files Access' in Settings.",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Open Settings", onPress: openAllFilesAccessSettings }
                        ]
                    );
                    return false;
                }
                return true;
            } else {
                // For Android 10 & below, request normal storage permissions
                const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                ]);
                return (
                    granted["android.permission.WRITE_EXTERNAL_STORAGE"] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted["android.permission.READ_EXTERNAL_STORAGE"] === PermissionsAndroid.RESULTS.GRANTED
                );
            }
        } catch (err) {
            console.warn("Permission error:", err);
            return false;
        }
    };

    // Function to open "All Files Access" settings directly
    const openAllFilesAccessSettings = () => {
        if (Platform.OS === 'android' && Platform.Version >= 30) {
            IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.MANAGE_ALL_FILES_ACCESS_PERMISSION);
        }
    };

    const openFile = async (binaryData, fileName) => {
        if (!binaryData || !fileName) {
            Alert.alert("No file available to preview");
            return;
        }

        try {
            const hasPermission = await requestAndroidPermissions();
            if (!hasPermission) {
                return;
            }

            // Define file path
            const path = Platform.OS === 'android' ?
                RNFetchBlob.fs.dirs.DownloadDir : RNFetchBlob.fs.dirs.DocumentDir;



            const safeFileName = fileName.replace(/[^a-zA-Z0-9]/g, '_') + '.pdf';
            const filePath = `${path}/${safeFileName}`;

            // Delete if file exists
            if (await RNFetchBlob.fs.exists(filePath)) {
                await RNFetchBlob.fs.unlink(filePath);
            }

            // Write file
            await RNFetchBlob.fs.writeFile(filePath, binaryData, 'base64');

            // Open file
            const mimeType = lookup(fileName) || 'application/octet-stream';
            await RNFetchBlob.android.actionViewIntent(filePath, mimeType);

        } catch (error) {
            console.error("Error opening file:", error);
            Alert.alert("Failed to open file", "Something went wrong.");
        }
    };

    const requestStoragePermission = async () => {
        if (Platform.OS === 'android' && Platform.Version < 30) {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                    {
                        title: 'Storage Permission Required',
                        message: 'This app needs access to your storage to download files.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    }
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }
        return true;
    };

    const getMimeType = (fileName) => {
        const extension = fileName.split('.').pop().toLowerCase();
        const mimeTypes = {
            pdf: 'application/pdf',
            jpg: 'image/jpeg',
            png: 'image/png',
            txt: 'text/plain',
            doc: 'application/msword',
            docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            xls: 'application/vnd.ms-excel',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            zip: 'application/zip',
            mp4: 'video/mp4',
            mp3: 'audio/mpeg',
        };
        return mimeTypes[extension] || 'application/octet-stream';
    };

    const sanitizeFileName = (fileName) => {
        return fileName.replace(/[^a-zA-Z0-9.\-_]/g, '_'); // Replace invalid characters with '_'
    };


    const handleDownloadCibilFile = async (fileDataArray, fileNamesArray) => {
        if (!fileDataArray) {
            Alert.alert('Error', 'No files available for download.');
            return;
        }

        const files = Array.isArray(fileDataArray) ? fileDataArray : [fileDataArray];
        const fileNames = Array.isArray(fileNamesArray) ? fileNamesArray : [fileNamesArray];

        try {
            const hasPermission = await requestStoragePermission();
            if (!hasPermission) {
                Alert.alert('Permission Denied', 'Storage permission is required to download files.');
                return;
            }

            const dirs = RNFetchBlob.fs.dirs;

            for (let i = 0; i < files.length; i++) {
                try {
                    const fileData = files[i];
                    const fileName = fileNames[i] || `file_${i}.pdf`;
                    const sanitizedFileName = sanitizeFileName(fileName);
                    const filePath = `${dirs.DownloadDir}/${sanitizedFileName}`;
                    const mimeType = getMimeType(fileName);

                    if (fileData.startsWith('http')) {
                        await RNFetchBlob.config({
                            addAndroidDownloads: {
                                useDownloadManager: true,
                                notification: true,
                                title: fileName,
                                description: 'Downloading file...',
                                path: filePath,
                                mime: mimeType,
                                mediaScannable: true,
                            },
                        }).fetch('GET', fileData);
                    } else {
                        await RNFetchBlob.fs.writeFile(filePath, fileData, 'base64');
                    }

                    ToastAndroid.show(`Downloaded: ${fileName}`, ToastAndroid.SHORT);
                    showFileNotification(filePath, fileName, mimeType);

                } catch (fileError) {
                    console.warn(`Failed to download ${fileNames[i]}:`, fileError);
                }
            }

            Alert.alert('Success', files.length === 1 ? 'File downloaded successfully!' : 'All files downloaded successfully!');
        } catch (error) {
            Alert.alert('Error', 'Something went wrong: ' + error.message);
        }
    };

    // Notification stores file path instead of Base64
    const showFileNotification = (filePath, fileName) => {
        PushNotification.localNotification({
            channelId: "download-channel",
            largeIcon: "go_fin",
            title: "Download Complete",
            message: `${fileName} downloaded successfully.`,
            playSound: true,
            smallIcon: "go_fin",
            userInfo: { filePath, fileName }, // store file path
        });
    };


    // Configure notification click
    PushNotification.configure({
        onNotification: function (notification) {
            const { filePath, fileName } = notification.userInfo || {};

            if (filePath && fileName) {
                RNFetchBlob.fs
                    .readFile(filePath, 'base64')
                    .then((base64Data) => openFile(base64Data, fileName))
                    .catch((err) => {
                        console.error("Error reading file:", err);
                    });
            }
        },
        requestPermissions: Platform.OS === "ios",
    });



    useEffect(() => {
        if (applicationNo) {
            getLogsDetailsByApplicationNumber(applicationNo);
        }
    }, [applicationNo,]);

    const getLogsDetailsByApplicationNumber = useCallback(async (applicationNo) => {
        try {
            const response = await axios.get(
                `${BASE_URL}getAllUploadDocumentsByApplicationNumber/${applicationNo}`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    }
                }
            );

            const data = response.data?.data || {};

            const transformedData = Object.entries(data).map(([key, value]) => ({
                category: key,
                descriptions: Array.isArray(value)
                    ? value
                        .filter(item => item.file) // keep only items with file
                        .map(item => ({
                            description: item.description || 'No description',
                            file: item.file,
                        }))
                    : [],
            }))
                // Remove categories that have no descriptions with file
                .filter(category => category.descriptions.length > 0);

            setFormattedDocs(transformedData);
            setLoading(false);

        } catch (error) {
            console.error('Error fetching logs details:', error);
        }
    }, [token]);







    const [expandedCategories, setExpandedCategories] = useState({});

    // Toggle the expanded state for a category
    const toggleExpand = (category) => {
        setExpandedCategories(prevState => ({
            ...prevState,
            [category]: !prevState[category],
        }));
    };
    const formatCategoryName = (name) => {
        if (!name) return '';
        // Remove trailing 'Dto' if present
        let formatted = name.replace(/Dto$/, '');
        // Add space before uppercase letters
        formatted = formatted.replace(/([A-Z])/g, ' $1');
        // Capitalize first letter of each word
        formatted = formatted.split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
        return formatted.trim();
    };

    const renderCategory = ({ item }) => {
        const isExpanded = expandedCategories[item.category];

        return (
            <View style={{
                marginBottom: 10,
                padding: 10,
                backgroundColor: '#f9f9f9',
                borderRadius: 5,
                borderWidth: 1,
                borderColor: '#ccc'
            }}>
                <TouchableOpacity
                    onPress={() => toggleExpand(item.category)}
                    style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
                >
                    <Text style={{ fontWeight: 'bold', color: 'black', fontSize: 16 }}>
                        {formatCategoryName(item.category)}
                    </Text>
                    <Text style={{ fontSize: 18, color: 'black' }}>{isExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {isExpanded && (
                    <FlatList
                        data={item.descriptions}
                        keyExtractor={(desc) => desc.id?.toString() || Math.random().toString()} // safer key
                        renderItem={({ item }) => (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginLeft: 10,
                                marginTop: 5,
                                justifyContent: 'space-between'
                            }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                    <Text style={{ fontSize: 16, color: 'black' }}>•</Text>
                                    <Text style={{ marginLeft: 5, fontSize: 14, color: 'black', flexShrink: 1, flexWrap: 'wrap' }}>
                                        {item.description}
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.downloadbutton}
                                    onPress={() => openFile(item.file, item.description)}
                                >
                                    <Image source={require('../../asset/eye.png')} style={{ width: 15, height: 15 }} />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.downloadbutton, { marginLeft: 5 }]}
                                    onPress={() => handleDownloadCibilFile(item.file, item.description)}
                                >
                                    <Image source={require('../../asset/download.png')} style={{ width: 15, height: 15, tintColor: '#FFFFFF' }} />
                                </TouchableOpacity>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={{ marginLeft: 10, color: 'gray' }}>No descriptions available</Text>}
                    />
                )}
            </View>
        );
    };





    return (
        <SafeAreaView style={{ flex: 1 }}>
            {/* Header with Drawer */}
            {/* <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Document Report</Text>
            </View> */}

            {/* FlatList for Documents */}
            {loading ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#007bff" />
                    <Text style={styles.loaderText}>Loading documents…</Text>
                </View>
            ) : (
                <FlatList
                    data={formattedDocs}
                    keyExtractor={(item) => item.category}
                    renderItem={renderCategory}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

        </SafeAreaView>
    )
}

export default ReviewDecision

const styles = StyleSheet.create({
    header: {
        height: 60,
        backgroundColor: '#007bff',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        marginVertical: 0,
    },
    backArrow: {
        fontSize: 24,
        color: 'white',
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    drawerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backdropColor: "rgba(0,0,0,0.5)",
        zIndex: 999
    },
    categoryContainer: {
        marginBottom: 15,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        marginHorizontal: 10,
    },
    categoryTitle: {
        fontWeight: 'bold',
        fontSize: 16,
        color: 'black',
        marginBottom: 5
    },
    itemsContainer: {
        maxHeight: 150, // ✅ Prevents FlatList inside FlatList issue
    },
    docItem: {
        paddingVertical: 5,
    },
    docText: {
        fontSize: 14,
        color: 'black'
    },
    downloadbutton: {
        backgroundColor: '#007bff', // Button background color
        paddingVertical: 5,
        paddingHorizontal: 6,
        borderRadius: 6,
        marginTop: 10,
        // marginLeft: 10,
        height: height * 0.03,// Adds space between buttons
        marginHorizontal: 10,
        color: 'black'
    },
    loaderContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    loaderText: {
        marginTop: 10,
        fontSize: 16,
        color: "#555",
        fontWeight: "500",
    },
});
