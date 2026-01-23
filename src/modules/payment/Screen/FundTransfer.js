


import React, {
    useState,
    useEffect,
    useMemo,
    useCallback, useRef
} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Alert,
    Dimensions,
    Platform,
    PermissionsAndroid,
    Modal,
    useColorScheme, NativeModules, Linking
} from 'react-native';
import { Camera, IndianRupee } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import DocumentPicker from 'react-native-document-picker';
import QRLocalImage from 'react-native-qrcode-local-image';
import RNFS from 'react-native-fs';
import HapticFeedback from 'react-native-haptic-feedback';
import * as Animatable from 'react-native-animatable';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';

const { QrGallery, QrAutoCrop } = NativeModules;
/* ================== DEVICE ================== */
const { width } = Dimensions.get('window');
const isSmallPhone = width < 360;
const isTablet = width >= 768;

const scale = (size) =>
    isTablet ? size * 1.2 : isSmallPhone ? size * 0.9 : size;

/* ================== THEMES ================== */
const lightTheme = {
    bg: '#ffffff',
    card: '#f3f4f6',
    text: '#111827',
    subText: '#6b7280',
    primary: '#2563eb',
    chip: '#eef2ff',
};

const darkTheme = {
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    subText: '#94a3b8',
    primary: '#3b82f6',
    chip: '#1e293b',
};

/* ================== MEMO COMPONENTS ================== */
const AmountPreset = React.memo(({ value, onPress, theme }) => (
    <TouchableOpacity
        style={[styles.presetChip, { backgroundColor: theme.chip }]}
        onPress={() => onPress(value)}
    >
        <Text style={[styles.presetText, { color: theme.primary }]}>₹{value}</Text>
    </TouchableOpacity>
));

/* ================== MAIN ================== */
const FundTransfer = () => {


    const TXN_KEY = 'TXN_HISTORY';
    const BEN_KEY = 'BENEFICIARIES';
    const qrRef = useRef();
    const [transactions, setTransactions] = useState([]);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [paymentBanner, setPaymentBanner] = useState(null);
    // { type: 'success' | 'failure' | 'pending', message }

    const navigation = useNavigation();
    const scheme = useColorScheme();
    const theme = scheme === 'dark' ? darkTheme : lightTheme;
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [scanning, setScanning] = useState(false);
    const [confirmVisible, setConfirmVisible] = useState(false);
    const AVAILABLE_BALANCE = 4550;
    const AMOUNT_PRESETS = [500, 1000, 2000, 5000];
    const [upiId, setUpiId] = useState('');
    const isValidUpiId = (upi) =>
        /^[\w.\-]{2,}@[a-zA-Z]{3,}$/.test(upi);
    const [qrAmount, setQrAmount] = useState('');
    const [generatedQr, setGeneratedQr] = useState(null);
    const MERCHANT_UPI_ID = 'kdmehta141103@oksbi';
    const [mode, setMode] = useState('SEND'); // SEND | RECEIVE
    const [paying, setPaying] = useState(false);
    const [qrBeneficiary, setQrBeneficiary] = useState(null);
    const numericAmount = useMemo(
        () => Number(amount.replace(/,/g, '')) || 0,
        [amount]
    );

    const isInsufficientBalance = numericAmount > AVAILABLE_BALANCE;

    const canSend =
        numericAmount > 0 &&
        !isInsufficientBalance &&
        (
            (!!upiId && isValidUpiId(upiId)) ||
            !!qrBeneficiary
        );


    const handleUpiResult = ({ url }) => {
        if (!url) return;

        const query = url.split('?')[1];
        if (!query) {
            Alert.alert(
                'Payment Initiated',
                'Check your UPI app for final status'
            );
            return;
        }

        const params = {};
        query.split('&').forEach(part => {
            const [key, value] = part.split('=');
            params[key.toLowerCase()] = decodeURIComponent(value || '');
        });

        const status = params.status?.toUpperCase();

        if (status === 'SUCCESS') {
            Alert.alert(
                'Payment Completed',
                `Txn Ref: ${params.txnref || 'N/A'}`
            );
            saveTransaction({ upiId, amount, status: 'SUCCESS' });
            saveBeneficiary({
                name: qrBeneficiary?.name || 'Saved Payee',
                upiId,
            });
            setPaymentBanner({ type: 'success', message: 'Payment Successful' });
        } else if (status === 'FAILURE') {
            Alert.alert('Payment Failed', 'Transaction was cancelled or failed');
            saveTransaction({ upiId, amount, status: 'FAILURE' });
            setPaymentBanner({ type: 'failure', message: 'Payment Failed' });
        } else {
            Alert.alert(
                'Payment Initiated',
                'Please verify status in your UPI app'
            );
            saveTransaction({ upiId, amount, status: 'INITIATED' });
            setPaymentBanner({ type: 'pending', message: 'Payment Initiated' });
        }
        setTimeout(() => setPaymentBanner(null), 4000);
    };
    useEffect(() => {
        const subscription = Linking.addEventListener('url', handleUpiResult);
        return () => subscription?.remove();
    }, []);
    useEffect(() => {
        (async () => {
            const raw = await AsyncStorage.getItem(TXN_KEY);
            if (raw) setTransactions(JSON.parse(raw));
        })();
    }, []);
    useEffect(() => {
        AsyncStorage.getItem(BEN_KEY).then(r => {
            if (r) setBeneficiaries(JSON.parse(r));
        });
    }, []);
    const saveBeneficiary = async ({ name, upiId }) => {
        const exists = beneficiaries.find(b => b.upiId === upiId);
        if (exists) return;

        const updated = [{ name, upiId }, ...beneficiaries].slice(0, 10);
        setBeneficiaries(updated);
        await AsyncStorage.setItem(BEN_KEY, JSON.stringify(updated));
    };

    const saveTransaction = async ({ upiId, amount, status }) => {
        const txn = {
            id: Date.now().toString(),
            upiId,
            amount,
            status, // SUCCESS | FAILURE | INITIATED
            date: new Date().toISOString(),
        };

        const updated = [txn, ...transactions].slice(0, 10);
        setTransactions(updated);
        await AsyncStorage.setItem(TXN_KEY, JSON.stringify(updated));
    };

    const onPresetPress = useCallback((value) => {
        setAmount(value.toString());
    }, []);

    /* ================== EFFECT ================== */
    useEffect(() => {
        if (Platform.OS === 'android') {
            PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
            );
        }
    }, []);


    const parseUpiQr = (data) => {
        try {
            if (!data || typeof data !== 'string') return null;

            // Strict UPI validation
            if (!data.startsWith('upi://pay')) return null;

            const queryString = data.split('?')[1];
            if (!queryString) return null;

            const params = {};
            queryString.split('&').forEach(part => {
                const [key, value] = part.split('=');
                params[key] = decodeURIComponent(value || '');
            });

            if (!params.pa) return null; // UPI ID is mandatory

            return {
                upiId: params.pa,
                name: params.pn || '',
                amount: params.am || '',
                currency: params.cu || 'INR',
            };
        } catch (e) {
            return null;
        }
    };

    const normalizeFileUri = (uri) => {
        if (Platform.OS === 'android' && !uri.startsWith('file://')) {
            return `file://${uri}`;
        }
        return uri;
    };
    const launchUpi = async () => {
        if (!canSend) return;

        const uri = buildUpiQrString({
            upiId,
            name: 'Demo Merchant',
            amount,
            note: 'UPI Payment',
        });

        const supported = await Linking.canOpenURL(uri);
        if (!supported) {
            Alert.alert('No UPI App Found');
            return;
        }

        HapticFeedback.trigger('impactMedium');
        Linking.openURL(uri);
    };
    // const pickAndCropQr = async () => {
    //     return ImagePicker.openPicker({
    //         compressImageMaxWidth: 1200,
    //         compressImageMaxHeight: 1200,
    //         compressImageQuality: 0.9,

    //         width: 800,
    //         height: 800,
    //         cropping: true,
    //         freeStyleCropEnabled: true,

    //         mediaType: 'photo',
    //         forceJpg: true,

    //         cropperToolbarTitle: 'Crop QR Code',
    //         cropperStatusBarColor: '#000000',
    //         cropperToolbarColor: '#000000',
    //         cropperToolbarWidgetColor: '#FFFFFF',
    //     });
    // };
    const pickAndCropQr = async () => {
        return ImagePicker.openPicker({
            mediaType: 'photo',

            // ❌ NO CROPPING UI
            cropping: false,

            // ✅ force high quality
            compressImageMaxWidth: 1600,
            compressImageMaxHeight: 1600,
            compressImageQuality: 1,

            // ✅ normalize format
            forceJpg: true,
        });
    };


    // const preprocessImage = async (path) => {
    //     const resized = await ImageResizer.createResizedImage(
    //         path,
    //         1000,
    //         1000,
    //         'JPEG',
    //         100
    //     );
    //     return normalizeFileUri(resized.uri);
    // };
    const preprocessImage = async (path) => {
        const resized = await ImageResizer.createResizedImage(
            path,
            1200,
            1200,
            'JPEG',
            100,
            0,
            undefined,
            false,
            { mode: 'contain' } // 🔥 keeps QR intact
        );

        return Platform.OS === 'android'
            ? `file://${resized.uri.replace('file://', '')}`
            : resized.uri;
    };
    const evaluateQrQuality = ({ confidence, isBlurry, boundingBox }) => {
        if (isBlurry) {
            return {
                allowed: false,
                reason: 'Image is blurry. Please choose a clearer photo.',
            };
        }

        if (confidence < 0.7) {
            return {
                allowed: false,
                reason: 'Low QR confidence. Please try another image.',
            };
        }

        // Optional: QR too small check
        if (boundingBox.width < 60 || boundingBox.height < 60) {
            return {
                allowed: false,
                reason: 'QR is too small. Please zoom or crop properly.',
            };
        }

        return { allowed: true };
    };


    const scanQrFromGallery = async () => {
        try {
            const image = await pickAndCropQr();
            const processedUri = await preprocessImage(image.path);

            // 🔥 STEP 1: Native ML Kit (value + bounding box)
            const result = await QrGallery.scanFromFile(processedUri);
            // const result = await QrGallery.scanFromFile(processedUri);

            const quality = evaluateQrQuality(result);

            if (!quality.allowed) {
                Alert.alert('QR Quality Issue', quality.reason);
                return;
            }
            if (!result?.value || !result?.boundingBox) {
                Alert.alert('No QR Found', 'Try a clearer image');
                return;
            }

            // 🔥 STEP 2: Native auto-crop
            const croppedPath = await QrAutoCrop.cropImage(
                processedUri,
                result.boundingBox
            );

            // 🔥 STEP 3: Decode cropped QR again (higher accuracy)
            const qrData = await QrGallery.scanFromFile(croppedPath);
            const parsed = parseUpiQr(qrData.value || qrData);
            console.log(croppedPath, qrData, parsed, 'croppedPathcroppedPath')
            if (!parsed) {
                Alert.alert('Invalid QR', 'Unsupported UPI QR');
                return;
            }

            // 🔥 Auto-fill
            if (parsed.amount) setAmount(parsed.amount.toString());

            setQrBeneficiary({
                name: parsed.name || parsed.upiId,
                upiId: parsed.upiId,
                isQr: true,
            });

            setUpiId(parsed.upiId);
            const confidenceLabel =
                result.confidence >= 0.85 ? 'High' :
                    result.confidence >= 0.7 ? 'Medium' : 'Low';

            Alert.alert(
                'QR Detected',
                `Paying ${parsed.name || parsed.upiId}\nConfidence: ${confidenceLabel}`,
                [{ text: 'OK', onPress: () => setScanning(false) }],
                { cancelable: false }
            );

        } catch (e) {
            if (e?.code === 'E_PICKER_CANCELLED') return;
            console.log('Gallery QR error:', e);
            Alert.alert('Error', 'Failed to scan QR');
        }
    };

    const launchUpiIntent = async ({ upiId, name, amount, note }) => {
        if (!upiId || !amount) {
            Alert.alert('Invalid Payment', 'UPI ID and amount are required');
            return;
        }

        if (!isValidUpiId(upiId)) {
            Alert.alert('Invalid UPI ID', 'Please enter a valid UPI ID');
            return;
        }

        if (paying) return;
        setPaying(true);

        const uri =
            `upi://pay` +
            `?pa=${encodeURIComponent(upiId)}` +
            `&pn=${encodeURIComponent(name || 'Merchant')}` +
            `&am=${encodeURIComponent(amount)}` +
            `&cu=INR` +
            (note ? `&tn=${encodeURIComponent(note)}` : '');

        const supported = await Linking.canOpenURL(uri);
        if (!supported) {
            setPaying(false);
            Alert.alert('No UPI App Found', 'Install Google Pay / PhonePe');
            return;
        }

        Linking.openURL(uri);
        setTimeout(() => setPaying(false), 3000);
    };
    const handleConfirmPay = () => {
        launchUpiIntent({
            upiId: qrBeneficiary?.upiId || upiId,
            name: qrBeneficiary?.name || 'Demo Merchant',
            amount: numericAmount.toString(),
            note: note || 'UPI Payment',
        });
    };
    const handleGenerateQr = () => {
        if (qrAmount && isNaN(qrAmount)) {
            Alert.alert('Invalid Amount', 'Please enter a valid number');
            return;
        }

        const qrString = buildUpiQrString({
            upiId: MERCHANT_UPI_ID,
            name: 'Demo Merchant',
            amount: qrAmount || undefined,
            note: 'Scan & Pay',
        });

        setGeneratedQr(qrString);
    };

    const buildUpiQrString = ({ upiId, name, amount, note }) => {
        let uri = `upi://pay?pa=${encodeURIComponent(upiId)}`;

        if (name) uri += `&pn=${encodeURIComponent(name)}`;
        if (amount) uri += `&am=${encodeURIComponent(amount)}`;
        uri += `&cu=INR`;
        if (note) uri += `&tn=${encodeURIComponent(note)}`;

        return uri;
    };
    const UpiQrCard = ({ qrValue }) => {
        if (!qrValue) return null;

        return (
            <View style={styles.qrCard}>
                <Text style={styles.qrTitle}>Scan to Pay</Text>

                <QRCode
                    value={qrValue}
                    size={220}
                    backgroundColor="white"
                />

                <Text style={styles.qrUpi}>{MERCHANT_UPI_ID}</Text>
                {qrAmount ? (
                    <Text style={styles.qrAmount}>₹{qrAmount}</Text>
                ) : (
                    <Text style={styles.qrHint}>Enter amount to lock payment</Text>
                )}
            </View>
        );
    };
    const shareQr = async () => {
        const uri = await qrRef.current.capture();
        await Share.open({ url: uri });
    };

    /* ================== UI ================== */
    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.bg }]}>
            {/* MODE TOGGLE */}
            <View style={styles.modeToggle}>
                {['SEND', 'RECEIVE'].map(m => (
                    <TouchableOpacity
                        key={m}
                        style={[
                            styles.modeBtn,
                            mode === m && styles.modeBtnActive,
                        ]}
                        onPress={() => setMode(m)}
                    >
                        <Text style={mode === m ? styles.modeTextActive : styles.modeText}>
                            {m === 'SEND' ? 'Send Money' : 'Receive Money'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {/* ===== Scanner Modal ===== */}
            <Modal visible={scanning} animationType="slide">
                <View style={styles.scannerContainer}>
                    <QRCodeScanner
                        onRead={(e) => {
                            setScanning(false);

                            const parsed = parseUpiQr(e.data);
                            console.log(parsed, e, 'parsedparsed')
                            if (!parsed) {
                                Alert.alert('Invalid QR', 'Unsupported QR format');
                                return;
                            }

                            // Auto switch to phone/UPI mode

                            setUpiId(parsed.upiId);          // 🔥 FIX
                            setQrBeneficiary({
                                name: parsed.name || parsed.upiId,
                                upiId: parsed.upiId,
                                isQr: true,
                            });
                            // Auto-fill amount if present
                            if (parsed.amount) {
                                setAmount(parsed.amount.toString());
                            }

                            // Optional: show who you are paying
                            Alert.alert(
                                'QR Detected',
                                `Paying ${parsed.name || parsed.upiId}`,
                                [
                                    {
                                        text: 'OK',
                                        onPress: () => setScanning(false),
                                    },
                                ],
                                { cancelable: false }
                            );

                        }}

                        flashMode={RNCamera.Constants.FlashMode.auto}
                        topContent={<Text style={styles.scanTitle}>Scan QR Code</Text>}
                    />

                    <View style={styles.scannerBottomBar}>
                        <TouchableOpacity
                            style={[styles.buttonBase, styles.buttonSecondary, styles.w75]}
                            onPress={scanQrFromGallery}
                        >
                            <Text style={styles.buttonTextSecondary}>Upload From Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.buttonBase, styles.buttonSecondary, styles.w75]}
                            onPress={() => setScanning(false)}
                        >
                            <Text style={styles.buttonTextSecondary}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>



            {/* ===== Confirm ===== */}
            <Modal visible={confirmVisible} transparent animationType="slide">

                <View style={styles.sheetOverlay}>
                    <View style={styles.sheetContainer}>
                        <Text style={styles.sheetTitle}>Confirm Payment</Text>

                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>To</Text>
                            <Text style={styles.sheetValue}>
                                {upiId}
                            </Text>
                        </View>

                        <View style={styles.sheetRow}>
                            <Text style={styles.sheetLabel}>Amount</Text>
                            <Text style={styles.sheetAmount}>₹{amount}</Text>
                        </View>

                        {note ? (
                            <View style={styles.sheetRow}>
                                <Text style={styles.sheetLabel}>Note</Text>
                                <Text style={styles.sheetValue}>{note}</Text>
                            </View>
                        ) : null}

                        <TouchableOpacity
                            style={styles.confirmBtn}
                            onPress={() => {
                                setConfirmVisible(false);
                                // handleSendMoney();
                                // sendUpiPaymentRequest();
                                handleConfirmPay();
                            }}
                        >
                            <Text style={styles.confirmText}>Confirm & Pay</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setConfirmVisible(false)}
                        >
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {/* ================= SEND ================= */}
            {mode === 'SEND' && (
                <>
                    {beneficiaries.length > 0 && (
                        <>
                            <Text style={styles.label}>Saved Beneficiaries</Text>
                            {beneficiaries.map(b => (
                                <TouchableOpacity
                                    key={b.upiId}
                                    style={styles.beneficiaryItem}
                                    onPress={() => setUpiId(b.upiId)}
                                >
                                    <Text>{b.name}</Text>
                                    <Text style={{ color: '#6b7280' }}>{b.upiId}</Text>
                                </TouchableOpacity>
                            ))}
                        </>
                    )}
                    {paymentBanner && (
                        <View
                            style={[
                                styles.banner,
                                paymentBanner.type === 'success' && { backgroundColor: '#16a34a' },
                                paymentBanner.type === 'failure' && { backgroundColor: '#dc2626' },
                                paymentBanner.type === 'pending' && { backgroundColor: '#f59e0b' },
                            ]}
                        >
                            <Text style={{ color: '#fff', fontWeight: '700' }}>
                                {paymentBanner.message}
                            </Text>
                        </View>
                    )}

                    <Text style={styles.label}>Receiver UPI ID</Text>
                    <TextInput
                        style={styles.upiInput}
                        placeholder="example@oksbi"
                        placeholderTextColor="#9ca3af"
                        autoCapitalize="none"
                        value={upiId}
                        onChangeText={setUpiId}
                    />

                    <Text style={[styles.label, { color: theme.subText }]}>Enter Amount</Text>

                    <View style={[styles.amountBox, { backgroundColor: theme.card }]}>
                        <IndianRupee size={18} color={theme.subText} />
                        <TextInput
                            style={[styles.amountInput, { color: theme.text }]}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor={theme.subText}
                            value={amount}
                            onChangeText={(t) => setAmount(t.replace(/,/g, ''))}
                        />
                    </View>
                    {isInsufficientBalance && (
                        <Text style={styles.errorText}>
                            Insufficient balance (₹{AVAILABLE_BALANCE})
                        </Text>
                    )}
                    <View style={styles.presetRow}>
                        {AMOUNT_PRESETS.map((v) => (
                            <AmountPreset
                                key={v}
                                value={v}
                                theme={theme}
                                onPress={onPresetPress}
                            />
                        ))}
                    </View>
                    <View style={styles.bottomBar}>
                        <TouchableOpacity
                            disabled={!canSend}
                            // onPress={launchUpi}
                            onPress={() => setConfirmVisible(true)}
                            style={[
                                styles.payBtn,
                                !canSend && { opacity: 0.5 },
                            ]}
                        >
                            <Text style={styles.payText}>Pay ₹{amount || '0'}</Text>
                        </TouchableOpacity>


                        {/* <TouchableOpacity
                            disabled={!canSend}
                            onPress={() => setConfirmVisible(true)}
                            style={[
                                styles.button,
                                { backgroundColor: canSend ? theme.primary : '#93c5fd' },
                            ]}
                        >
                            <Text style={styles.buttonText}>Send Money</Text>
                        </TouchableOpacity> */}

                        <TouchableOpacity
                            style={[styles.scanButton, { backgroundColor: theme.chip }]}
                            onPress={() => setScanning(true)}
                        >
                            <Camera size={20} color={theme.primary} />
                            <Text style={[styles.scanText, { color: theme.primary }]}>
                                Scan and Pay
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            {/* ================= RECEIVE ================= */}
            {mode === 'RECEIVE' && (
                <>
                    <Text style={styles.label}>Enter Amount (Optional)</Text>

                    <TextInput
                        style={styles.amountInputBox}
                        keyboardType="numeric"
                        placeholder="Leave empty for open amount"
                        value={qrAmount}
                        onChangeText={setQrAmount}
                    />

                    <TouchableOpacity
                        style={styles.generateBtn}
                        onPress={handleGenerateQr}
                    >
                        <Text style={styles.generateText}>Generate QR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.generateBtn} onPress={shareQr}>
                        <Text style={styles.generateText}>Share QR</Text>
                    </TouchableOpacity>

                    <ViewShot ref={qrRef} options={{ format: 'png', quality: 1 }}>
                        <UpiQrCard qrValue={generatedQr} />
                    </ViewShot>
                </>
            )}
        </ScrollView>
    );
};

export default FundTransfer;

/* ================== STYLES ================== */
const styles = StyleSheet.create({
    container: { flex: 1, padding: 16 },
    modeToggle: {
        flexDirection: 'row',
        backgroundColor: '#e5e7eb',
        borderRadius: 12,
        marginBottom: 20,
    },
    modeBtn: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    modeBtnActive: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
    },
    modeText: { color: '#374151', fontWeight: '600' },
    modeTextActive: { color: '#fff', fontWeight: '700' },
    scanButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 14,
        marginBottom: 24,
    },
    scanText: { marginLeft: 8, fontWeight: '600' },

    errorText: {
        color: '#dc2626',
        fontSize: 13,
        marginBottom: 12,
    },
    presetRow: {
        flexDirection: 'row',
        justifyContent: isTablet ? 'flex-start' : 'space-between',
        gap: isTablet ? 16 : 0,
        marginVertical: 20,
    },
    presetChip: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
    },
    presetText: { fontWeight: '600' },
    upiInput: {
        backgroundColor: '#f3f4f6',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#111827',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 16,
    },
    amountLockCard: {
        backgroundColor: '#ecfeff',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#67e8f9',
        marginBottom: 20,
    },
    amountLockLabel: {
        fontSize: 13,
        color: '#0f766e',
        marginBottom: 6,
    },
    amountLockValue: {
        fontSize: 22,
        fontWeight: '700',
        color: '#064e3b',
    },

    button: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: scale(16),
    },

    scannerContainer: { flex: 1, backgroundColor: '#000' },
    scanTitle: { color: '#fff', marginVertical: 16 },

    scannerBottomBar: {
        position: 'absolute',
        bottom: 30,
        width: '100%',
        alignItems: 'center',
    },
    buttonBase: {
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    buttonPrimary: {
        backgroundColor: '#2563eb',
    },
    buttonSecondary: {
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    buttonDisabled: {
        backgroundColor: '#93c5fd',
    },
    buttonTextPrimary: {
        color: '#ffffff',
        fontWeight: '700',
        fontSize: 16,
    },
    buttonTextSecondary: {
        color: '#1e3a8a',
        fontWeight: '600',
        fontSize: 15,
    },
    w75: {
        width: '75%',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        width: '75%',
        padding: 12,
        borderRadius: 14,
        marginBottom: 12,
        alignItems: 'center',
    },
    secondaryText: {
        color: '#1e3a8a',
        fontWeight: '600',
        fontSize: 15,
    },

    successOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    successCard: {
        backgroundColor: '#fff',
        padding: 28,
        borderRadius: 20,
        alignItems: 'center',
    },

    successIcon: {
        fontSize: 42,
        marginBottom: 12,
    },
    successTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#16a34a',
    },
    successAmount: {
        marginTop: 6,
        fontSize: 20,
        fontWeight: '700',
        color: '#16a34a',
    },
    sheetOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    sheetContainer: {
        backgroundColor: '#fff',
        padding: 20,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    sheetTitle: {
        fontSize: 18,

        marginBottom: 16,
        color: '#111827', fontWeight: '700'
    },
    sheetRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },

    sheetLabel: {
        color: '#6b7280',
    },

    sheetValue: {
        color: '#111827',
        fontWeight: '500',
    },

    sheetAmount: {
        fontSize: 20,
        fontWeight: '700',
        color: '#16a34a',
    },
    confirmBtn: {
        backgroundColor: '#2563eb',
        padding: 16,
        borderRadius: 14,
        marginTop: 16,
        alignItems: 'center',
    },
    confirmText: { color: '#fff', fontWeight: '700' },

    cancelBtn: {
        marginTop: 12,
        padding: 14,
        borderRadius: 14,
        backgroundColor: '#ef4444',
        alignItems: 'center',
    },
    cancelText: { color: '#fff', fontWeight: '700' },
    phoneInput: {
        padding: 16,
        borderRadius: 16,
        fontSize: scale(16),
        marginBottom: 20,
    },

    beneficiaryItem: {
        padding: 16,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
    },
    qrCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        marginBottom: 24,
    },
    qrTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
    },
    qrUpi: {
        fontSize: 13,
        color: '#6b7280',
        marginTop: 10,
    },
    qrAmount: {
        fontSize: 18,
        fontWeight: '700',
        marginTop: 4,
    },
    amountInputBox: {
        backgroundColor: '#f3f4f6',
        borderRadius: 14,
        padding: 14,
        fontSize: 16,
        marginBottom: 12,
        color: '#000',
    },



    label: { marginBottom: 6, color: '#6b7280' },

    input: {
        backgroundColor: '#f3f4f6',
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        color: '#000'
    },

    amountBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        padding: 14,
        borderRadius: 12,
    },
    amountInput: { marginLeft: 10, fontSize: 18, flex: 1, color: '#000' },
    bottomBar: {
        flexDirection: 'column', justifyContent: 'space-between', gap: 10
    },
    payBtn: {
        backgroundColor: '#266B15F6',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
    },
    payText: { color: '#fff', fontSize: 18, fontWeight: '700' },
    generateBtn: {
        backgroundColor: '#16a34a',
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: 'center',
        marginBottom: 20,
    },
    generateText: { color: '#fff', fontWeight: '700', fontSize: 16 },
    qrCard: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
    },
    qrTitle: { fontWeight: '700', marginBottom: 12, color: '#000' },
    qrUpi: { marginTop: 10, fontSize: 12, color: '#6b7280' },
    qrAmount: { fontSize: 18, fontWeight: '700', marginTop: 4, color: '#6b7280', },
    qrHint: { fontSize: 12, color: '#6b7280', marginTop: 4 },
    banner: {
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
    },

});

