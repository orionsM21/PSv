// ViewDispute.js (Optimized - Deep refactor, UI unchanged)
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    SafeAreaView,
    View,
    ScrollView,
    Text,
    TouchableOpacity,
    Image,
    Modal,
    TouchableWithoutFeedback,
    Alert,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import moment from 'moment';
// import ToastNotification from '../../Component/ToastAlert';
// import apiClient from '../../api/apiClient';
// import { showLoader } from '../redux/action';
// import {  theme, white } from '../../utility/Theme';
import ToastNotification from '../../component/ToastAlert';
import apiClient from '../../../../common/hooks/apiClient';
import { theme,white } from '../../utility/Theme';
import { BASE_URL } from '../../service/api';

const { height, width } = Dimensions.get('window');

/**
 * Safe API wrapper
 */
const safeGet = async (url, headers = {}) => {
    try {
        const res = await apiClient.get(`${BASE_URL}${url}`, { headers });
        return res?.data ?? null;
    } catch (e) {
        console.error(`safeGet ${url} error:`, e?.response ?? e);
        throw e;
    }
};

/**
 * Small presentational InfoRow (extracted to remove duplication)
 * UI unchanged
 */
const InfoRow = ({ label, children, leftStyle = {}, rightStyle = {} }) => (
    <View
        style={{
            flexDirection: 'row',
            padding: 10,
            alignItems: 'center',
            backgroundColor: theme.light.searchContainerColor,
        }}
    >
        <Text
            style={{
                width: '50%',
                fontSize: 14,
                fontWeight: '400',
                color: theme.light.searchPlacehoder,
                fontFamily: 'Calibri',
            }}
        >
            {label}
        </Text>

        <View style={{ width: '50%', ...rightStyle }}>{children}</View>
    </View>
);

/**
 * Main component (single page, no style changes)
 */
const ViewDispute = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const route = useRoute();
    const reduxData = useSelector((state) => state.auth);

    // route params
    const { data = {}, name = '' } = route.params ?? {};

    // local state
    const [toastVisible, setToastVisible] = useState(false);
    const [toastPayload, setToastPayload] = useState(null);
    const [evidenceBase64, setEvidenceBase64] = useState(null);
    const [evidenceModalVisible, setEvidenceModalVisible] = useState(false);
    const [loadingEvidence, setLoadingEvidence] = useState(false);

    // derived values
    const amountFormatted = useMemo(() => {
        const amt = Number(data?.amount ?? 0);
        // keep the same display logic you used earlier
        return amt
            .toFixed(2)
            .replace(/\d(?=(\d{3})+\.)/g, '$&,');
    }, [data?.amount]);

    // show toast helper (keeps your previous ToastNotification usage)
    const showToast = useCallback((type, header, body) => {
        setToastPayload({ type, header, body });
        setToastVisible(true);
        setTimeout(() => setToastVisible(false), 3000);
    }, []);

    // send payment link (keeps same payload & behavior)
    const sendPaymentLink = useCallback(async () => {
        try {
            //   dispatch(showLoader(true));
            const payload = {
                bankAccountNumber: data.bankAccountNumber,
                bankIfsc: data.bankIfsc,
                bankUpiAddress: data.bankUpiAddress,
                lenderId: data.lenderId,
                lenderName: data.lenderName,
                loanAccountNumber: data.loanAccountNumber,
                smsFlag: true,
                user: { userId: reduxData.id },
            };

            const res = await apiClient.post(`${BASE_URL}addPaymentInfo`, payload, {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + reduxData.token,
                },
            });

            //   dispatch(showLoader(false));

            if (res?.status === 200) {
                showToast('success', 'SUCCESS', 'Repayment details sent successfully');
            } else {
                showToast('error', 'ERROR', res?.data?.message || 'Failed to send');
            }
        } catch (err) {
            //   dispatch(showLoader(false));
            console.error('addPaymentInfo', err?.response ?? err);
            showToast('error', 'ERROR', 'Something went wrong while sending payment link');
        }
    }, [data, reduxData, dispatch, showToast]);

    // fetch evidence (base64) by dispute id
    const fetchEvidence = useCallback(async () => {
        const id = data?.disputeOrRtpId;
        if (!id) {
            Alert.alert("Document not found");
            return;
        }

        try {
            setLoadingEvidence(true);

            const headers = {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: "Bearer " + reduxData.token,
            };

            const res = await safeGet(
                `getdocumentDisputeByDisputeOrRtpId/${id}`,
                headers
            );

            const base64 = res?.disputefile || null;

            if (!base64) {
                Alert.alert("Document not found");
                return;
            }

            setEvidenceBase64(base64);
            setEvidenceModalVisible(true); // open modal only after successful fetch
        } catch (err) {
            console.error("fetchEvidence error:", err?.response ?? err);
            Alert.alert("Error", "Failed to load document");
        } finally {
            setLoadingEvidence(false);
        }
    }, [data?.disputeOrRtpId, reduxData?.token]);


    const showEvidence = useCallback(() => {
        if (!evidenceBase64) {
            // if not loaded yet, attempt to load
            fetchEvidence();
        } else {
            setEvidenceModalVisible(true);
        }
    }, [evidenceBase64, fetchEvidence]);

    // initial fetch of evidence only if route param tells us to
    useEffect(() => {
        // lazy: do not fetch automatically unless needed — original behaviour fetched on mount.
        // match original by fetching once on mount to keep behavior identical:
        if (data?.disputeOrRtpId) {
            fetchEvidence().catch(() => { });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // render
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: theme.light.white }}>

            <ScrollView contentContainerStyle={{ marginHorizontal: 10 }}>
                <View
                    style={{
                        marginHorizontal: 10,
                        marginTop: 20,
                        borderWidth: 1,
                        borderColor: theme.light.activeChatText,
                        borderRadius: 8,
                        backgroundColor: white,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                            padding: 12,
                            alignItems: 'center',
                            backgroundColor: theme.light.darkBlue,
                        }}
                    >
                        <Text
                            style={{
                                width: '50%',
                                fontSize: 18,
                                fontWeight: '600',
                                color: theme.light.white,
                                fontFamily: 'Calibri',
                            }}
                        >
                            Details
                        </Text>
                    </View>

                    {/* Amount Row */}
                    <InfoRow label="Amount">
                        <Text
                            style={{
                                width: '100%',
                                fontSize: 16,
                                fontWeight: '600',
                                color: theme.dark.searchContainerColor,
                                fontFamily: 'Calibri',
                            }}
                        >
                            <View
                                style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 100,
                                    borderWidth: 1,
                                    borderColor: 'black',
                                    backgroundColor: '#001D56',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <Image
                                    style={{ width: 14, height: 14 }}
                                    source={require('../../../../asset/icon/rupee.png')}
                                />
                            </View>{' '}
                            {amountFormatted}
                        </Text>
                    </InfoRow>

                    {/* Dispute Type */}
                    <InfoRow label="Dispute Type">
                        <Text
                            style={{
                                width: '100%',
                                fontSize: 16,
                                fontWeight: '600',
                                color: theme.dark.searchContainerColor,
                                fontFamily: 'Calibri',
                            }}
                        >
                            {data.disputeType}
                        </Text>
                    </InfoRow>

                    {/* Dispute Reason */}
                    <InfoRow label="Dispute Reason">
                        <Text
                            style={{
                                width: '100%',
                                fontSize: 16,
                                fontWeight: '600',
                                color: theme.dark.searchContainerColor,
                                fontFamily: 'Calibri',
                            }}
                        >
                            {name}
                        </Text>
                    </InfoRow>

                    {/* Remarks */}
                    <InfoRow label="Remarks">
                        <Text
                            style={{
                                width: '100%',
                                fontSize: 16,
                                fontWeight: '600',
                                color: theme.dark.searchContainerColor,
                                fontFamily: 'Calibri',
                            }}
                        >
                            {data.remark}
                        </Text>
                    </InfoRow>
                </View>

                {(data?.isDocument === 'yes' || evidenceBase64) && (
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'center',
                            width: '100%',
                            alignItems: 'center',
                        }}
                    >
                        <TouchableOpacity onPress={showEvidence}>
                            <View
                                style={{
                                    width: width * 0.5,
                                    height: height * 0.04,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 8,
                                    backgroundColor: theme.light.darkBlue,
                                    marginVertical: height * 0.01,
                                    alignSelf: 'center',
                                    borderColor: 'black',
                                    padding: 5,
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: 'bold',
                                        color: '#ffffff',
                                        fontFamily: 'Calibri',
                                    }}
                                >
                                    View Document
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Evidence Modal */}
            <Modal
                transparent={true}
                animationType="slide"
                visible={evidenceModalVisible}
                onRequestClose={() => setEvidenceModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setEvidenceModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <View
                            style={{
                                backgroundColor: theme.light.darkBlue,
                                justifyContent: 'center',
                                padding: 10,
                                borderTopLeftRadius: 10,
                                borderTopRightRadius: 10,
                                width: width * 0.9,
                            }}
                        >
                            <Text
                                style={{
                                    color: '#ffffff',
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                    fontSize: 20,
                                }}
                            >
                                Evidence
                            </Text>
                        </View>

                        <View style={styles.modalContent}>
                            {/* If evidenceBase64 exists, render as image; otherwise show fallback */}
                            {evidenceBase64 ? (
                                <Image
                                    source={{ uri: `data:image/png;base64,${evidenceBase64}` }}
                                    style={{ width: 300, height: 300 }}
                                    resizeMode="stretch"
                                />
                            ) : (
                                <Text style={{ padding: 20 }}>No document available</Text>
                            )}
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Toast notification */}
            {toastVisible && toastPayload ? (
                <ToastNotification
                    isModalVisible={true}
                    type={toastPayload.type}
                    header={toastPayload.header}
                    body={toastPayload.body}
                />
            ) : null}
        </SafeAreaView>
    );
};

export default React.memo(ViewDispute);

/* styles preserved exactly as requested (no visual change) */
const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        padding: 16,
    },
    dropdown: {
        flex: 1,
        height: 50,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        borderColor: theme.light.vanishModeText,
        backgroundColor: theme.light.RightMessageText,
        fontSize: 16,
    },
    icon: {
        marginRight: 5,
    },
    label: {
        position: 'absolute',
        backgroundColor: 'white',
        left: 22,
        top: 8,
        zIndex: 999,
        paddingHorizontal: 8,
        fontSize: 14,
        color: theme.light.TextColor,
    },
    placeholderStyle: {
        fontSize: 16,
        color: theme.light.TextColor,
    },
    selectedTextStyle: {
        fontSize: 18,
        fontWeight: '800',
        color: theme.light.inActiveMode,
        marginLeft: 10,
    },
    iconStyle: {
        width: 20,
        height: 20,
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
    modalContainer: {
        flex: 1,
        width: width,
        height: height,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignSelf: 'center',
    },
    modalContent: {
        backgroundColor: 'white',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        width: width * 0.9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeModalText: {
        fontSize: 18,
        color: 'red',
        marginTop: 10,
    },
    openModalText: {
        fontSize: 20,
        color: 'blue',
    },
});

