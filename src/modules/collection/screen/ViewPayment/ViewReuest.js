import React, { useState, useEffect, memo } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert,
    Modal,
    Image,
    TouchableWithoutFeedback,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';
// import { showLoader } from '../redux/action';
// import apiClient from '../../api/apiClient';
// import ToastNotification from '../../Component/ToastAlert';
import { theme, white } from '../../utility/Theme';
// import { BASE_URL } from '../../api/Endpoint';
import apiClient from '../../../../common/hooks/apiClient';
import { BASE_URL } from '../../service/api';
import ToastNotification from '../../component/ToastAlert';

const { width, height } = Dimensions.get('screen');

const ViewDispute = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const { data, name } = useRoute().params;

    const reduxData = useSelector((s) => s.auth || {});
    const token = reduxData.token;
    const userProfile = reduxData.userProfile || {};


    const [evidenceData, setEvidenceData] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        type: '',
        header: '',
        body: '',
    });

    const showEvidence = () => {
        if (!evidenceData) {
            Alert.alert('Document not found');
            return;
        }
        setModalVisible(true);
    };

    useEffect(() => {
        fetchEvidence();
    }, [data]);

    const fetchEvidence = async () => {
        try {
            // dispatch(showLoader(true));
            if (data?.requestId) {
                const response = await apiClient.get(
                    `documentRequestByRequestId/${data?.requestId}`,
                    {
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`,
                        },
                    },
                );

                setEvidenceData(response?.data?.rfile || '');
            }
        } catch (err) {
            console.log('fetchEvidence error:', err);
        } finally {
            // dispatch(showLoader(false));
        }
    };

    return (
        <>
            {/* HEADER */}


            {/* BODY */}
            <ScrollView contentContainerStyle={styles.body}>
                <View style={styles.card}>
                    {/* TITLE */}
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardHeaderText}>Details</Text>
                    </View>

                    {/* ROW: Exception */}
                    <Row label="Exception Request" value={name} />

                    {/* Conditional Old/New Value */}
                    {!['Legal', 'Unallocate', 'Repossession'].includes(name) && (
                        <>
                            <Row bg label="Old Value" value={data.oldValue} />
                            <Row label="New Value" value={data.newValue} />
                        </>
                    )}

                    {/* Remarks */}
                    <Row bg label="Remarks" value={data.remark} />
                </View>

                {/* SHOW DOCUMENT BUTTON */}
                <TouchableOpacity onPress={showEvidence} style={styles.docBtn}>
                    <Text style={styles.docBtnText}>View Document</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* IMAGE MODAL */}
            <Modal
                transparent
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Evidence</Text>
                        </View>

                        <View style={styles.modalContent}>
                            <Image
                                source={{ uri: `data:image/png;base64,${evidenceData}` }}
                                style={styles.evidenceImage}
                                resizeMode="contain"
                            />
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>

            {/* Toast */}
            {toast.show && (
                <ToastNotification
                    isModalVisible
                    type={toast.type}
                    header={toast.header}
                    body={toast.body}
                />
            )}
        </>
    );
};

/* Reusable row component */
const Row = memo(({ label, value, bg }) => (
    <View style={[styles.row, bg && styles.rowBg]}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
    </View>
));

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        height: 60,
        alignItems: 'center',
        backgroundColor: theme.light.white,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.light.black,
    },
    backBtn: { width: 50, marginLeft: 20 },
    headerText: {
        fontSize: 24,
        fontWeight: '600',
        color: theme.light.black,
    },

    body: { marginHorizontal: 10 },

    card: {
        margin: 10,
        marginTop: 20,
        borderWidth: 1,
        borderColor: theme.light.activeChatText,
        borderRadius: 8,
        backgroundColor: white,
    },
    cardHeader: {
        padding: 12,
        backgroundColor: theme.light.darkBlue,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    cardHeaderText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.light.white,
    },

    row: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
    },
    rowBg: { backgroundColor: theme.light.searchContainerColor },
    rowLabel: {
        width: '50%',
        fontSize: 14,
        color: theme.light.searchPlacehoder,
    },
    rowValue: {
        width: '50%',
        fontSize: 16,
        fontWeight: '600',
        color: theme.dark.searchContainerColor,
    },

    docBtn: {
        width: width * 0.5,
        height: height * 0.045,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.light.darkBlue,
        alignSelf: 'center',
        borderRadius: 8,
        marginVertical: 15,
    },
    docBtnText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#ffffff',
    },

    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalHeader: {
        backgroundColor: theme.light.darkBlue,
        padding: 12,
        width: width * 0.9,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
    },
    modalTitle: {
        textAlign: 'center',
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    modalContent: {
        backgroundColor: 'white',
        width: width * 0.9,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
        paddingVertical: 20,
        alignItems: 'center',
    },
    evidenceImage: {
        width: width * 0.75,
        height: width * 0.75,
    },
});

export default memo(ViewDispute);
