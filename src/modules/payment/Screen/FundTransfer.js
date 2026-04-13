import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Alert,
  AppState,
  Dimensions,
  Linking,
  Modal,
  NativeModules,
  PermissionsAndroid,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Camera, IndianRupee} from 'lucide-react-native';
import DeviceInfo from 'react-native-device-info';
import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';
import QRCode from 'react-native-qrcode-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import RazorpayCheckout from 'react-native-razorpay';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import IntentLauncher from 'react-native-intent-launcher';
import {PAYMENT_THEME} from '../theme/paymentTheme';
import {
  createGatewayOrder,
  DEFAULT_PAYMENT_GATEWAY_CONFIG,
  fetchPaymentGatewayConfig,
  getPaymentProviderConfig,
  PAYMENT_PROVIDER_IDS,
  verifyGatewayPayment,
} from '../services/paymentGatewayClient';

const {QrGallery, QrAutoCrop, UpiQrScanner} = NativeModules;
const {width} = Dimensions.get('window');
const isSmallPhone = width < 360;
const isTablet = width >= 768;
const scale = size =>
  isTablet ? size * 1.18 : isSmallPhone ? size * 0.92 : size;

const TXN_KEY = 'TXN_HISTORY';
const BEN_KEY = 'BENEFICIARIES';
const PENDING_UPI_KEY = 'PENDING_UPI_PAYMENT';
const UPI_DEBUG_KEY = 'UPI_DEBUG_TRACE';
const UPI_DEBUG_CONTEXT_FIELDS = [
  'qrSource',
  'scannedQrPayload',
  'scannedUpiId',
  'scannedName',
  'scannedAmount',
  'scannedCurrency',
  'scannedNote',
  'launchUrl',
  'launchScheme',
  'launchAppName',
  'launchUpiId',
  'launchName',
  'launchAmount',
  'launchCurrency',
  'launchNote',
];
const AVAILABLE_BALANCE = 4550;
const AMOUNT_PRESETS = [500, 1000, 2000, 5000];
const DEFAULT_RECEIVER_UPI = 'kdmehta141103@oksbi';

const paymentTheme = {
  bg: PAYMENT_THEME.background[0],
  surface: PAYMENT_THEME.overlay,
  surfaceAlt: PAYMENT_THEME.panelStrong,
  border: PAYMENT_THEME.border,
  text: PAYMENT_THEME.textPrimary,
  subText: PAYMENT_THEME.textSecondary,
  muted: PAYMENT_THEME.textMuted,
  primary: PAYMENT_THEME.accent,
  primarySoft: PAYMENT_THEME.accentSoft,
  success: PAYMENT_THEME.success,
  danger: PAYMENT_THEME.danger,
  warning: PAYMENT_THEME.warning,
  chip: PAYMENT_THEME.accentSoft,
  inputBg: 'rgba(255,255,255,0.05)',
  overlay: 'rgba(5, 8, 15, 0.76)',
  gradient: PAYMENT_THEME.background,
};

const UPI_APPS = [
  {
    id: 'gpay',
    name: 'Google Pay',
    package: 'com.google.android.apps.nbu.paisa.user',
    scheme: 'tez://upi/pay',
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    package: 'com.phonepe.app',
    scheme: 'phonepe://pay',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    package: 'net.one97.paytm',
    scheme: 'paytmmp://pay',
  },
  {
    id: 'bhim',
    name: 'BHIM',
    package: 'in.org.npci.upiapp',
    scheme: 'upi://pay',
  },
];
const UPI_FALLBACK = {
  id: 'generic',
  name: 'Other UPI Apps',
  package: '',
  scheme: 'upi://pay',
};

const AmountPreset = React.memo(({value, onPress, theme}) => (
  <TouchableOpacity
    style={[
      styles.presetChip,
      {backgroundColor: theme.chip, borderColor: theme.border},
    ]}
    onPress={() => onPress(value)}
    activeOpacity={0.88}>
    <Text
      style={[styles.presetText, {color: theme.primary}]}>{`Rs ${value}`}</Text>
  </TouchableOpacity>
));

const SectionHeader = React.memo(({title, meta, theme}) => (
  <View style={styles.sectionHeader}>
    <Text style={[styles.sectionTitle, {color: theme.text}]}>{title}</Text>
    {meta ? (
      <Text style={[styles.sectionMeta, {color: theme.muted}]}>{meta}</Text>
    ) : null}
  </View>
));

const Banner = React.memo(({banner, theme}) => {
  if (!banner) {
    return null;
  }
  const backgroundColor =
    banner.type === 'success'
      ? theme.success
      : banner.type === 'failure'
      ? theme.danger
      : theme.warning;

  return (
    <View style={[styles.banner, {backgroundColor}]}>
      <Text style={styles.bannerText}>{banner.message}</Text>
    </View>
  );
});

const BeneficiaryCard = React.memo(({item, theme, onPress}) => (
  <TouchableOpacity
    style={[
      styles.beneficiaryCard,
      {backgroundColor: theme.surface, borderColor: theme.border},
    ]}
    onPress={() => onPress(item)}
    activeOpacity={0.9}>
    <View
      style={[styles.beneficiaryIcon, {backgroundColor: theme.primarySoft}]}>
      <Ionicons name="person-outline" size={18} color={theme.primary} />
    </View>
    <View style={styles.flexOne}>
      <Text
        style={[styles.beneficiaryName, {color: theme.text}]}
        numberOfLines={1}>
        {item.name}
      </Text>
      <Text
        style={[styles.beneficiaryUpi, {color: theme.subText}]}
        numberOfLines={1}>
        {item.upiId}
      </Text>
    </View>
  </TouchableOpacity>
));

const TransactionCard = React.memo(({item, theme}) => {
  const statusColor =
    item.status === 'SUCCESS'
      ? theme.success
      : item.status === 'FAILURE'
      ? theme.danger
      : theme.warning;

  return (
    <View
      style={[
        styles.transactionCard,
        {backgroundColor: theme.surface, borderColor: theme.border},
      ]}>
      <View style={styles.transactionRow}>
        <Text
          style={[styles.transactionUpi, {color: theme.text}]}
          numberOfLines={1}>
          {item.upiId}
        </Text>
        <Text
          style={[
            styles.transactionAmount,
            {color: theme.text},
          ]}>{`Rs ${item.amount}`}</Text>
      </View>
      <View style={styles.transactionRow}>
        <Text style={[styles.transactionMeta, {color: theme.subText}]}>
          {new Date(item.date).toLocaleString()}
        </Text>
        <Text style={[styles.transactionStatus, {color: statusColor}]}>
          {item.status}
        </Text>
      </View>
    </View>
  );
});

const UpiAppCard = React.memo(({app, theme, onPress}) => (
  <TouchableOpacity
    style={[
      styles.upiAppCard,
      {backgroundColor: theme.surfaceAlt, borderColor: theme.border},
    ]}
    onPress={() => onPress(app)}
    activeOpacity={0.9}>
    <Text style={[styles.upiAppName, {color: theme.text}]}>{app.name}</Text>
    <Ionicons name="arrow-forward" size={18} color={theme.muted} />
  </TouchableOpacity>
));

const ReceiveQrCard = React.memo(({qrValue, upiId, amount, theme}) => {
  if (!qrValue) {
    return null;
  }

  return (
    <View
      style={[
        styles.qrCard,
        {backgroundColor: theme.surface, borderColor: theme.border},
      ]}>
      <Text style={[styles.qrTitle, {color: theme.text}]}>Scan to pay</Text>
      <QRCode
        value={qrValue}
        size={220}
        backgroundColor="white"
        color="#111827"
        quietZone={16}
      />
      <Text style={[styles.qrUpi, {color: theme.subText}]}>{upiId}</Text>
      {amount ? (
        <Text
          style={[styles.qrAmount, {color: theme.text}]}>{`Rs ${amount}`}</Text>
      ) : (
        <Text style={[styles.qrHint, {color: theme.subText}]}>
          Open amount QR
        </Text>
      )}
    </View>
  );
});

const DebugRow = React.memo(({label, value, theme, mono = false}) => {
  if (!value) {
    return null;
  }

  return (
    <View style={styles.debugRow}>
      <Text style={[styles.debugLabel, {color: theme.subText}]}>{label}</Text>
      <Text
        style={[
          styles.debugValue,
          mono && styles.debugValueMono,
          {color: theme.text},
        ]}>
        {value}
      </Text>
    </View>
  );
});

const UpiDebugCard = React.memo(({entry, theme, onClear}) => {
  if (!entry) {
    return null;
  }

  return (
    <View
      style={[
        styles.panel,
        styles.debugCard,
        {backgroundColor: theme.surface, borderColor: theme.border},
      ]}>
      <SectionHeader
        title="Last UPI app response"
        meta={
          entry.timestamp
            ? new Date(entry.timestamp).toLocaleString()
            : 'Awaiting response'
        }
        theme={theme}
      />

      <DebugRow label="Stage" value={entry.stage} theme={theme} />
      <DebugRow label="App" value={entry.appName} theme={theme} />
      <DebugRow label="Status" value={entry.status} theme={theme} />
      <DebugRow
        label="Response code"
        value={entry.responseCode}
        theme={theme}
      />
      <DebugRow label="Reason" value={entry.message} theme={theme} />
      <DebugRow label="Reference" value={entry.reference} theme={theme} />
      <DebugRow label="UPI ID" value={entry.receiverUpiId} theme={theme} />
      <DebugRow label="Amount" value={entry.amount} theme={theme} />
      <DebugRow label="Device" value={entry.device} theme={theme} />
      <DebugRow label="QR source" value={entry.qrSource} theme={theme} />
      <DebugRow
        label="Scanned payee"
        value={entry.scannedUpiId}
        theme={theme}
      />
      <DebugRow label="Scanned name" value={entry.scannedName} theme={theme} />
      <DebugRow
        label="Scanned amount"
        value={entry.scannedAmount}
        theme={theme}
      />
      <DebugRow
        label="Scanned currency"
        value={entry.scannedCurrency}
        theme={theme}
      />
      <DebugRow label="Scanned note" value={entry.scannedNote} theme={theme} />
      <DebugRow label="Launch app" value={entry.launchAppName} theme={theme} />
      <DebugRow
        label="Launch scheme"
        value={entry.launchScheme}
        theme={theme}
      />
      <DebugRow label="Launch payee" value={entry.launchUpiId} theme={theme} />
      <DebugRow label="Launch name" value={entry.launchName} theme={theme} />
      <DebugRow
        label="Launch amount"
        value={entry.launchAmount}
        theme={theme}
      />
      <DebugRow
        label="Launch currency"
        value={entry.launchCurrency}
        theme={theme}
      />
      <DebugRow label="Launch note" value={entry.launchNote} theme={theme} />

      <Text style={[styles.debugRawLabel, {color: theme.subText}]}>
        Scanned QR payload
      </Text>
      <Text style={[styles.debugRawValue, {color: theme.text}]}>
        {entry.scannedQrPayload || 'No scanned QR payload captured yet.'}
      </Text>

      <Text style={[styles.debugRawLabel, {color: theme.subText}]}>
        UPI launch URL
      </Text>
      <Text style={[styles.debugRawValue, {color: theme.text}]}>
        {entry.launchUrl || 'No UPI launch URL captured yet.'}
      </Text>

      <Text style={[styles.debugRawLabel, {color: theme.subText}]}>
        UPI app raw payload
      </Text>
      <Text style={[styles.debugRawValue, {color: theme.text}]}>
        {entry.rawText || 'No raw payload returned by the UPI app.'}
      </Text>

      <TouchableOpacity
        style={[
          styles.debugClearBtn,
          {backgroundColor: theme.primarySoft, borderColor: theme.border},
        ]}
        onPress={onClear}
        activeOpacity={0.9}>
        <Text style={[styles.debugClearText, {color: theme.primary}]}>
          Clear debug
        </Text>
      </TouchableOpacity>
    </View>
  );
});

function isValidUpiId(upi) {
  return /^[\w.-]{2,}@[a-zA-Z]{3,}$/.test(upi);
}

function encodeQueryValue(value) {
  return encodeURIComponent(String(value ?? '')).replace(/%20/g, '+');
}

function decodeQueryValue(value) {
  const normalizedValue = String(value || '').replace(/\+/g, '%20');

  try {
    return decodeURIComponent(normalizedValue);
  } catch {
    return normalizedValue.replace(/%20/g, ' ');
  }
}

function parseQueryParams(queryString) {
  return String(queryString || '')
    .split('&')
    .reduce((params, part) => {
      if (!part) {
        return params;
      }

      const [rawKey, ...rawValueParts] = part.split('=');
      const key = decodeQueryValue(rawKey);

      if (!key) {
        return params;
      }

      params[key] = decodeQueryValue(rawValueParts.join('='));
      return params;
    }, {});
}

function parseUpiPaymentData(data) {
  try {
    if (!data || typeof data !== 'string') {
      return null;
    }

    const normalizedData = data.trim().replace(/^["']|["']$/g, '');
    const queryString = normalizedData.includes('?')
      ? normalizedData.split('?').slice(1).join('?')
      : normalizedData;

    if (!queryString) {
      return null;
    }

    const params = {};
    Object.entries(parseQueryParams(queryString)).forEach(([key, value]) => {
      params[String(key).toLowerCase()] = value;
    });

    if (!params.pa) {
      return null;
    }
    return {
      upiId: params.pa,
      name: params.pn || '',
      amount: params.am || '',
      currency: params.cu || 'INR',
      note: params.tn || '',
    };
  } catch {
    return null;
  }
}

function parseUpiQr(data) {
  return parseUpiPaymentData(data);
}

function formatUpiAmount(amount) {
  const parsedAmount = Number(
    String(amount || '')
      .replace(/,/g, '')
      .trim(),
  );

  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return '';
  }

  return parsedAmount.toFixed(2).replace(/\.00$/, '');
}

function buildUpiDebugFields(prefix, data) {
  const parsed = parseUpiPaymentData(data);

  if (!parsed) {
    return {};
  }

  return {
    [`${prefix}UpiId`]: parsed.upiId,
    [`${prefix}Name`]: parsed.name,
    [`${prefix}Amount`]: parsed.amount ? formatUpiAmount(parsed.amount) : '',
    [`${prefix}Currency`]: parsed.currency,
    [`${prefix}Note`]: parsed.note,
  };
}

function pickUpiDebugContext(entry) {
  if (!entry || typeof entry !== 'object') {
    return {};
  }

  return UPI_DEBUG_CONTEXT_FIELDS.reduce((context, field) => {
    const value = entry[field];

    if (value == null || value === '') {
      return context;
    }

    context[field] =
      typeof value === 'string' ? value.slice(0, 1600) : String(value);
    return context;
  }, {});
}

function buildUpiQueryString({upiId, name, amount, note}) {
  const sanitizedUpiId = String(upiId || '').trim();
  const sanitizedName = String(name || sanitizedUpiId).trim();
  const sanitizedAmount = formatUpiAmount(amount);
  const sanitizedNote = String(note || '').trim();
  const params = [`pa=${encodeQueryValue(sanitizedUpiId)}`];

  if (sanitizedName) {
    params.push(`pn=${encodeQueryValue(sanitizedName)}`);
  }
  if (sanitizedAmount) {
    params.push(`am=${encodeQueryValue(sanitizedAmount)}`);
  }
  params.push(`cu=${encodeQueryValue('INR')}`);
  if (sanitizedNote) {
    params.push(`tn=${encodeQueryValue(sanitizedNote)}`);
  }

  return params.join('&');
}

function buildUpiPaymentRequest({upiId, name, amount, note}) {
  return {
    txnId: `TXN_${Date.now()}`,
    amount: formatUpiAmount(amount),
    url: `upi://pay?${buildUpiQueryString({upiId, name, amount, note})}`,
  };
}

function buildAppSpecificUpiUrl(appScheme, queryString) {
  if (!appScheme || appScheme === 'upi://pay') {
    return `upi://pay?${queryString}`;
  }

  return `${appScheme}?${queryString}`;
}

function buildUpiQrString({upiId, name, amount, note}) {
  return `upi://pay?${buildUpiQueryString({upiId, name, amount, note})}`;
}

function parseUpiResultPayload(payload) {
  if (!payload) {
    return null;
  }

  try {
    if (typeof payload === 'object') {
      const directStatus =
        payload.status || payload.Status || payload.STATUS || '';
      const directReference =
        payload.txnRef ||
        payload.txnref ||
        payload.ApprovalRefNo ||
        payload.approvalrefno ||
        payload.txnId ||
        payload.txnid ||
        '';
      const directResponseCode =
        payload.responseCode ||
        payload.responsecode ||
        payload.ResponseCode ||
        '';
      const directMessage =
        payload.message ||
        payload.Message ||
        payload.statusMessage ||
        payload.StatusMessage ||
        payload.txnStatusDesc ||
        payload.TxnStatusDesc ||
        payload.StatusDesc ||
        payload.responseMessage ||
        payload.ResponseMessage ||
        '';

      if (
        directStatus ||
        directReference ||
        directResponseCode ||
        directMessage
      ) {
        return {
          status: directStatus ? String(directStatus).toUpperCase() : '',
          reference: directReference ? String(directReference) : '',
          responseCode: directResponseCode ? String(directResponseCode) : '',
          message: directMessage ? String(directMessage) : '',
        };
      }

      const nestedPayload =
        payload.data ||
        payload.response ||
        payload.extra?.response ||
        payload.extra?.Status ||
        payload.extra?.status ||
        payload.extra ||
        null;

      if (nestedPayload) {
        return parseUpiResultPayload(nestedPayload);
      }
    }

    const stringPayload = String(payload).trim();
    const queryString = stringPayload.includes('?')
      ? stringPayload.split('?')[1]
      : stringPayload;
    const params = parseQueryParams(queryString);
    const status = params.status || params.Status || params.STATUS || '';

    return {
      status: status ? status.toUpperCase() : '',
      reference:
        params.txnRef ||
        params.txnref ||
        params.ApprovalRefNo ||
        params.approvalrefno ||
        params.txnId ||
        params.txnid ||
        '',
      responseCode:
        params.responseCode ||
        params.responsecode ||
        params.ResponseCode ||
        params.resCode ||
        params.rescode ||
        params.resultCode ||
        params.ResultCode ||
        '',
      message:
        params.message ||
        params.Message ||
        params.statusMessage ||
        params.StatusMessage ||
        params.txnStatusDesc ||
        params.TxnStatusDesc ||
        params.StatusDesc ||
        params.responseMessage ||
        params.ResponseMessage ||
        '',
    };
  } catch {
    return null;
  }
}

function stringifyDebugPayload(payload) {
  if (payload == null) {
    return '';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

async function clearPendingUpiPayment() {
  try {
    await AsyncStorage.removeItem(PENDING_UPI_KEY);
  } catch {
    // ignore storage cleanup issues
  }
}

async function pickAndCropQr() {
  return ImagePicker.openPicker({
    mediaType: 'photo',
    cropping: false,
    compressImageMaxWidth: 1600,
    compressImageMaxHeight: 1600,
    compressImageQuality: 1,
    forceJpg: true,
  });
}

async function preprocessImage(path) {
  const resized = await ImageResizer.createResizedImage(
    path,
    1200,
    1200,
    'JPEG',
    100,
    0,
    undefined,
    false,
    {
      mode: 'contain',
    },
  );
  return Platform.OS === 'android'
    ? `file://${resized.uri.replace('file://', '')}`
    : resized.uri;
}

function evaluateQrQuality({confidence, isBlurry, boundingBox}) {
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
  if (boundingBox.width < 60 || boundingBox.height < 60) {
    return {
      allowed: false,
      reason: 'QR is too small. Please zoom or crop properly.',
    };
  }
  return {allowed: true};
}

const FundTransfer = () => {
  const qrRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);
  const currentPaymentRef = useRef(null);
  const scanLockRef = useRef(false);
  const awaitingAndroidUpiResultRef = useRef(false);
  const upiDebugContextRef = useRef({});

  const theme = paymentTheme;

  const [transactions, setTransactions] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [paymentBanner, setPaymentBanner] = useState(null);
  const [lastUpiDebug, setLastUpiDebug] = useState(null);
  const [upiApps, setUpiApps] = useState([]);
  const [gatewayConfig, setGatewayConfig] = useState(
    DEFAULT_PAYMENT_GATEWAY_CONFIG,
  );

  const [mode, setMode] = useState('SEND');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [upiId, setUpiId] = useState('');
  const [qrBeneficiary, setQrBeneficiary] = useState(null);

  const [userUpiId, setUserUpiId] = useState('');
  const [qrAmount, setQrAmount] = useState('');
  const [generatedQr, setGeneratedQr] = useState(null);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [paymentMethodModal, setPaymentMethodModal] = useState(false);
  const [showUpiAppSelector, setShowUpiAppSelector] = useState(false);
  const [paying, setPaying] = useState(false);

  const numericAmount = useMemo(
    () => Number((amount || '').replace(/,/g, '')) || 0,
    [amount],
  );
  const canSend =
    numericAmount > 0 &&
    (((upiId || '').trim() && isValidUpiId(upiId.trim())) || !!qrBeneficiary);

  const activeReceiver = qrBeneficiary?.upiId || upiId.trim();

  const saveBeneficiary = useCallback(
    async ({name, upiId: beneficiaryUpiId}) => {
      setBeneficiaries(current => {
        if (current.some(item => item.upiId === beneficiaryUpiId)) {
          return current;
        }
        const updated = [{name, upiId: beneficiaryUpiId}, ...current].slice(
          0,
          10,
        );
        AsyncStorage.setItem(BEN_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const saveTransaction = useCallback(
    async ({
      id,
      upiId: txnUpiId,
      amount: txnAmount,
      status,
      date,
      reference,
    }) => {
      const txn = {
        id: id || Date.now().toString(),
        upiId: txnUpiId,
        amount: txnAmount,
        status,
        date: date || new Date().toISOString(),
        reference: reference || '',
      };
      setTransactions(current => {
        const filtered = current.filter(item => item.id !== txn.id);
        const updated = [txn, ...filtered].slice(0, 10);
        AsyncStorage.setItem(TXN_KEY, JSON.stringify(updated));
        return updated;
      });
    },
    [],
  );

  const updateTransactionStatus = useCallback(
    async ({id, upiId: txnUpiId, amount: txnAmount, status, reference}) => {
      if (!id) {
        saveTransaction({
          upiId: txnUpiId,
          amount: txnAmount,
          status,
          reference,
        });
        return;
      }

      setTransactions(current => {
        let found = false;
        const updatedTransactions = current.map(item => {
          if (item.id !== id) {
            return item;
          }
          found = true;
          return {
            ...item,
            upiId: txnUpiId || item.upiId,
            amount: txnAmount || item.amount,
            status,
            reference: reference || item.reference || '',
          };
        });

        const finalTransactions = found
          ? updatedTransactions
          : [
              {
                id,
                upiId: txnUpiId,
                amount: txnAmount,
                status,
                reference: reference || '',
                date: new Date().toISOString(),
              },
              ...updatedTransactions,
            ].slice(0, 10);

        AsyncStorage.setItem(TXN_KEY, JSON.stringify(finalTransactions));
        return finalTransactions;
      });
    },
    [saveTransaction],
  );

  const setBanner = useCallback(message => {
    setPaymentBanner(message);
    setTimeout(() => setPaymentBanner(null), 3500);
  }, []);

  const updateUpiDebugContext = useCallback(patch => {
    upiDebugContextRef.current = {
      ...upiDebugContextRef.current,
      ...pickUpiDebugContext(patch),
    };

    return upiDebugContextRef.current;
  }, []);

  const recordUpiDebug = useCallback(async entry => {
    const debugEntry = {
      timestamp: new Date().toISOString(),
      device: `${DeviceInfo.getBrand()} ${DeviceInfo.getModel()}`.trim(),
      ...upiDebugContextRef.current,
      ...entry,
    };

    if (debugEntry.rawText) {
      debugEntry.rawText = String(debugEntry.rawText).slice(0, 1600);
    }

    upiDebugContextRef.current = pickUpiDebugContext(debugEntry);
    setLastUpiDebug(debugEntry);

    try {
      await AsyncStorage.setItem(UPI_DEBUG_KEY, JSON.stringify(debugEntry));
    } catch {
      // ignore debug persistence errors
    }
  }, []);

  const clearUpiDebug = useCallback(async () => {
    setLastUpiDebug(null);
    upiDebugContextRef.current = {};

    try {
      await AsyncStorage.removeItem(UPI_DEBUG_KEY);
    } catch {
      // ignore debug cleanup errors
    }
  }, []);

  const handlePaymentStatus = useCallback(
    async ({
      status,
      reference,
      responseCode,
      detailMessage,
      receiverUpiId,
      pendingPayment,
    }) => {
      const resolvedReceiver =
        receiverUpiId || pendingPayment?.receiverUpiId || activeReceiver;
      const resolvedAmount =
        pendingPayment?.amount || amount || numericAmount.toString();
      const pendingTxnId = pendingPayment?.txnId;
      if (!resolvedReceiver) {
        return;
      }

      if (status === 'SUCCESS') {
        if (pendingTxnId) {
          updateTransactionStatus({
            id: pendingTxnId,
            upiId: resolvedReceiver,
            amount: resolvedAmount,
            status: 'SUCCESS',
            reference,
          });
        } else {
          saveTransaction({
            upiId: resolvedReceiver,
            amount: resolvedAmount,
            status: 'SUCCESS',
            reference,
          });
        }
        saveBeneficiary({
          name: qrBeneficiary?.name || 'Saved Payee',
          upiId: resolvedReceiver,
        });
        setBanner({
          type: 'success',
          message: reference
            ? `Payment successful (${reference})`
            : 'Payment successful',
        });
      } else if (status === 'FAILURE') {
        if (pendingTxnId) {
          updateTransactionStatus({
            id: pendingTxnId,
            upiId: resolvedReceiver,
            amount: resolvedAmount,
            status: 'FAILURE',
            reference,
          });
        } else {
          saveTransaction({
            upiId: resolvedReceiver,
            amount: resolvedAmount,
            status: 'FAILURE',
            reference,
          });
        }
        setBanner({
          type: 'failure',
          message: detailMessage
            ? `Payment failed: ${detailMessage}`
            : 'Payment failed or cancelled',
        });
      } else {
        if (pendingTxnId) {
          updateTransactionStatus({
            id: pendingTxnId,
            upiId: resolvedReceiver,
            amount: resolvedAmount,
            status: 'INITIATED',
            reference,
          });
        } else {
          saveTransaction({
            upiId: resolvedReceiver,
            amount: resolvedAmount,
            status: 'INITIATED',
            reference,
          });
        }
        setBanner({
          type: 'pending',
          message: 'Payment initiated. Verify final status in your UPI app.',
        });
      }

      if (pendingTxnId) {
        currentPaymentRef.current = null;
        await clearPendingUpiPayment();
      }

      await recordUpiDebug({
        stage: 'final_status',
        appName: pendingPayment?.selectedApp || 'Unknown',
        status,
        reference,
        responseCode,
        message: detailMessage,
        receiverUpiId: resolvedReceiver,
        amount: resolvedAmount,
        rawText: detailMessage,
      });

      setPaying(false);
    },
    [
      activeReceiver,
      amount,
      numericAmount,
      qrBeneficiary,
      recordUpiDebug,
      saveBeneficiary,
      saveTransaction,
      setBanner,
      updateTransactionStatus,
    ],
  );

  const showPaymentConfirmationPrompt = useCallback(
    pendingPayment => {
      if (!pendingPayment) {
        setPaying(false);
        return;
      }

      recordUpiDebug({
        stage: 'manual_confirmation_required',
        appName: pendingPayment.selectedApp || 'Generic UPI',
        status: 'UNKNOWN',
        message: 'No structured response returned by the UPI app.',
        receiverUpiId: pendingPayment.receiverUpiId,
        amount: pendingPayment.amount,
        rawText:
          'No structured response was returned by the UPI app. User confirmation required.',
      });

      Alert.alert('Confirm Payment', 'Did you complete the payment?', [
        {
          text: 'Yes',
          onPress: () =>
            handlePaymentStatus({
              status: 'SUCCESS',
              receiverUpiId: pendingPayment.receiverUpiId,
              pendingPayment,
            }),
        },
        {
          text: 'No',
          onPress: () =>
            handlePaymentStatus({
              status: 'FAILURE',
              receiverUpiId: pendingPayment.receiverUpiId,
              pendingPayment,
            }),
        },
        {
          text: 'Pending',
          onPress: () =>
            handlePaymentStatus({
              status: 'INITIATED',
              receiverUpiId: pendingPayment.receiverUpiId,
              pendingPayment,
            }),
        },
      ]);
    },
    [handlePaymentStatus, recordUpiDebug],
  );

  const handleUpiResult = useCallback(
    ({url}) => {
      if (!url || !currentPaymentRef.current) {
        return;
      }
      const pendingPayment = currentPaymentRef.current;
      currentPaymentRef.current = null;
      const parsedResult = parseUpiResultPayload(url);

      recordUpiDebug({
        stage: 'deep_link_result',
        appName: pendingPayment.selectedApp || 'Generic UPI',
        status: parsedResult?.status || 'UNKNOWN',
        reference: parsedResult?.reference,
        responseCode: parsedResult?.responseCode,
        message: parsedResult?.message,
        receiverUpiId: pendingPayment.receiverUpiId,
        amount: pendingPayment.amount,
        rawText: url,
      });

      if (!parsedResult) {
        handlePaymentStatus({
          status: 'INITIATED',
          receiverUpiId: pendingPayment.receiverUpiId,
          pendingPayment,
        });
        return;
      }

      handlePaymentStatus({
        status: parsedResult.status || 'INITIATED',
        reference: parsedResult.reference,
        responseCode: parsedResult.responseCode,
        detailMessage: parsedResult.message,
        receiverUpiId: pendingPayment.receiverUpiId,
        pendingPayment,
      });
    },
    [handlePaymentStatus, recordUpiDebug],
  );

  useEffect(() => {
    const loadData = async () => {
      const [txns, ben, savedDebug] = await Promise.all([
        AsyncStorage.getItem(TXN_KEY),
        AsyncStorage.getItem(BEN_KEY),
        AsyncStorage.getItem(UPI_DEBUG_KEY),
      ]);
      if (txns) {
        setTransactions(JSON.parse(txns));
      }
      if (ben) {
        setBeneficiaries(JSON.parse(ben));
      }
      if (savedDebug) {
        const parsedDebug = JSON.parse(savedDebug);
        upiDebugContextRef.current = pickUpiDebugContext(parsedDebug);
        setLastUpiDebug(parsedDebug);
      }
    };
    loadData();
  }, []);

  const requestGalleryPermission = useCallback(async () => {
    if (Platform.OS !== 'android') {
      return true;
    }

    const permission =
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

    try {
      const alreadyGranted = await PermissionsAndroid.check(permission);

      if (alreadyGranted) {
        return true;
      }

      const granted = await PermissionsAndroid.request(permission);

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        Alert.alert(
          'Permission required',
          'Allow gallery access to import QR images.',
        );
        return false;
      }

      return true;
    } catch {
      Alert.alert('Permission error', 'Unable to request gallery access.');
      return false;
    }
  }, []);

  useEffect(() => {
    const detectUpiApps = async () => {
      const available = [];
      for (const app of UPI_APPS) {
        try {
          const installed = await DeviceInfo.isAppInstalled(app.package);
          if (installed) {
            available.push(app);
          }
        } catch {
          // ignore
        }
      }
      available.push(UPI_FALLBACK);
      setUpiApps(available);
    };
    detectUpiApps();
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadPaymentGatewayConfig = async () => {
      const nextConfig = await fetchPaymentGatewayConfig();

      if (mounted) {
        setGatewayConfig(nextConfig);
      }
    };

    loadPaymentGatewayConfig();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const restorePendingPayment = async () => {
      try {
        const savedPendingPayment = await AsyncStorage.getItem(PENDING_UPI_KEY);
        if (!savedPendingPayment) {
          return;
        }
        currentPaymentRef.current = JSON.parse(savedPendingPayment);
      } catch {
        currentPaymentRef.current = null;
      }
    };

    restorePendingPayment();
  }, []);

  // useEffect(() => {
  //     const linkSub = Linking.addEventListener("url", handleUpiResult);
  //     const appSub = AppState.addEventListener("change", nextState => {
  //         if (
  //             appStateRef.current.match(/inactive|background/) &&
  //             nextState === "active" &&
  //             currentPaymentRef.current &&
  //             !paying
  //         ) {
  //             handlePaymentStatus({
  //                 status: "INITIATED",
  //                 receiverUpiId: currentPaymentRef.current.receiverUpiId,
  //             });
  //             currentPaymentRef.current = null;
  //         }
  //         appStateRef.current = nextState;
  //     });
  //     return () => {
  //         linkSub?.remove();
  //         appSub.remove();
  //     };
  // }, [handlePaymentStatus, handleUpiResult, paying]);
  useEffect(() => {
    const linkSubscription = Linking.addEventListener('url', handleUpiResult);
    const sub = AppState.addEventListener('change', state => {
      if (awaitingAndroidUpiResultRef.current) {
        appStateRef.current = state;
        return;
      }

      if (
        appStateRef.current.match(/inactive|background/) &&
        state === 'active' &&
        currentPaymentRef.current
      ) {
        const pendingPayment = currentPaymentRef.current;
        currentPaymentRef.current = null;
        setPaying(false);
        showPaymentConfirmationPrompt(pendingPayment);
      }

      appStateRef.current = state;
    });

    return () => {
      linkSubscription?.remove?.();
      sub.remove();
    };
  }, [handleUpiResult, showPaymentConfirmationPrompt]);

  const onPresetPress = useCallback(value => setAmount(value.toString()), []);

  const handleBeneficiarySelect = useCallback(item => {
    setUpiId(item.upiId);
    setQrBeneficiary({name: item.name, upiId: item.upiId, isQr: false});
  }, []);

  const handleQrDetected = useCallback(
    (rawData, source = 'camera') => {
      if (scanLockRef.current) {
        return;
      }

      scanLockRef.current = true;

      const qrPayload = String(rawData || '').trim();
      const parsed = parseUpiQr(qrPayload);
      if (!parsed) {
        setTimeout(() => {
          Alert.alert('Invalid QR', 'Unsupported QR format.');
          scanLockRef.current = false;
        }, 150);
        return;
      }

      updateUpiDebugContext({
        qrSource: source === 'gallery' ? 'Gallery image' : 'Camera scan',
        scannedQrPayload: qrPayload,
        ...buildUpiDebugFields('scanned', qrPayload),
      });

      recordUpiDebug({
        stage: 'qr_detected',
        appName:
          source === 'gallery' ? 'Gallery QR import' : 'Android QR scanner',
        status: 'DETECTED',
        message: 'QR parsed successfully.',
        receiverUpiId: parsed.upiId,
        amount: parsed.amount ? formatUpiAmount(parsed.amount) : '',
        rawText: qrPayload,
      }).catch(() => null);

      setUpiId(parsed.upiId);
      setQrBeneficiary({
        name: parsed.name || parsed.upiId,
        upiId: parsed.upiId,
        isQr: true,
      });
      if (parsed.amount) {
        setAmount(formatUpiAmount(parsed.amount));
      }
      setTimeout(() => {
        Alert.alert('QR detected', `Paying ${parsed.name || parsed.upiId}`);
        scanLockRef.current = false;
      }, 150);
    },
    [recordUpiDebug, updateUpiDebugContext],
  );

  const scanQrFromGallery = useCallback(async () => {
    try {
      const hasGalleryPermission = await requestGalleryPermission();
      if (!hasGalleryPermission) {
        return;
      }

      scanLockRef.current = false;
      const image = await pickAndCropQr();
      const processedUri = await preprocessImage(image.path);
      const result = await QrGallery.scanFromFile(processedUri);
      const quality = evaluateQrQuality(result);
      if (!quality.allowed) {
        Alert.alert('QR quality issue', quality.reason);
        return;
      }
      if (!result?.value || !result?.boundingBox) {
        Alert.alert('No QR found', 'Try a clearer image.');
        return;
      }
      const croppedPath = await QrAutoCrop.cropImage(
        processedUri,
        result.boundingBox,
      );
      const qrData = await QrGallery.scanFromFile(croppedPath);
      handleQrDetected(qrData.value || qrData, 'gallery');
    } catch (error) {
      if (error?.code === 'E_PICKER_CANCELLED') {
        return;
      }
      Alert.alert('Error', 'Failed to scan QR from gallery.');
    }
  }, [handleQrDetected, requestGalleryPermission]);

  const launchNativeAndroidQrScanner = useCallback(async () => {
    if (
      Platform.OS !== 'android' ||
      typeof UpiQrScanner?.scanQr !== 'function'
    ) {
      return false;
    }

    try {
      scanLockRef.current = false;
      const result = await UpiQrScanner.scanQr();
      const rawValue = result?.value || result?.displayValue || '';

      if (!rawValue) {
        Alert.alert(
          'No QR detected',
          'Try scanning again or upload a saved QR image.',
        );
        return true;
      }

      handleQrDetected(rawValue, 'camera');
      return true;
    } catch (error) {
      const errorCode = String(error?.code || '').toUpperCase();

      if (errorCode === 'SCAN_CANCELLED') {
        return true;
      }

      Alert.alert(
        'Scanner unavailable',
        'Camera scan could not start on this device. Try again or use Upload from gallery.',
      );
      return false;
    }
  }, [handleQrDetected]);

  const openScanner = useCallback(async () => {
    if (
      Platform.OS === 'android' &&
      typeof UpiQrScanner?.scanQr === 'function'
    ) {
      Alert.alert('Scan QR', 'Choose how you want to scan the UPI QR.', [
        {
          text: 'Scan with camera',
          onPress: () => {
            launchNativeAndroidQrScanner().catch(() => null);
          },
        },
        {
          text: 'Upload from gallery',
          onPress: () => {
            scanQrFromGallery().catch(() => null);
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]);
      return;
    }

    scanQrFromGallery().catch(() => null);
  }, [launchNativeAndroidQrScanner, scanQrFromGallery]);

  const launchAndroidUpiIntent = useCallback(async url => {
    return IntentLauncher.startActivity({
      action: 'android.intent.action.VIEW',
      data: url,
    });
  }, []);

  const launchUpiPayment = useCallback(
    async ({receiverUpiId, receiverName, txnAmount, txnNote}) => {
      try {
        if (paying) {
          return;
        }
        if (!receiverUpiId || !isValidUpiId(receiverUpiId)) {
          Alert.alert('Invalid UPI ID');
          return;
        }

        if (!txnAmount || txnAmount <= 0) {
          Alert.alert('Invalid amount');
          return;
        }

        const {
          txnId,
          amount: formattedAmount,
          url,
        } = buildUpiPaymentRequest({
          upiId: receiverUpiId,
          name: receiverName || receiverUpiId,
          amount: txnAmount,
          note: txnNote,
        });

        const supported = await Linking.canOpenURL('upi://pay');

        if (!supported) {
          Alert.alert(
            'No UPI app found',
            'Please install a UPI app like GPay, PhonePe, or Paytm.',
          );
          return;
        }

        const pendingPayment = {
          txnId,
          receiverUpiId,
          amount: formattedAmount,
          selectedApp: 'Generic UPI',
          createdAt: new Date().toISOString(),
        };
        currentPaymentRef.current = pendingPayment;

        await saveTransaction({
          id: txnId,
          upiId: receiverUpiId,
          amount: formattedAmount,
          status: 'INITIATED',
        });
        await AsyncStorage.setItem(
          PENDING_UPI_KEY,
          JSON.stringify(pendingPayment),
        );
        updateUpiDebugContext({
          launchUrl: url,
          launchScheme: String(url).split('?')[0],
          launchAppName: pendingPayment.selectedApp,
          ...buildUpiDebugFields('launch', url),
        });
        await recordUpiDebug({
          stage: 'launch_request',
          appName: pendingPayment.selectedApp,
          status: 'INITIATED',
          receiverUpiId,
          amount: formattedAmount,
          rawText: url,
        });

        setPaying(true);
        if (Platform.OS === 'android') {
          awaitingAndroidUpiResultRef.current = true;
          const result = await launchAndroidUpiIntent(url);
          awaitingAndroidUpiResultRef.current = false;

          const parsedResult =
            parseUpiResultPayload(result) ||
            parseUpiResultPayload(result?.data) ||
            parseUpiResultPayload(result?.extra?.response) ||
            parseUpiResultPayload(result?.extra?.Status) ||
            parseUpiResultPayload(result?.extra?.status);

          await recordUpiDebug({
            stage: 'android_result',
            appName: pendingPayment.selectedApp,
            status: parsedResult?.status || 'UNKNOWN',
            reference: parsedResult?.reference,
            responseCode: parsedResult?.responseCode,
            message: parsedResult?.message,
            receiverUpiId,
            amount: formattedAmount,
            rawText: stringifyDebugPayload(result),
          });

          if (parsedResult?.status) {
            await handlePaymentStatus({
              status: parsedResult.status,
              reference: parsedResult.reference,
              responseCode: parsedResult.responseCode,
              detailMessage: parsedResult.message,
              receiverUpiId,
              pendingPayment,
            });
            return;
          }

          if (currentPaymentRef.current?.txnId !== pendingPayment.txnId) {
            return;
          }
          showPaymentConfirmationPrompt(pendingPayment);
          return;
        }

        await Linking.openURL(url);
      } catch (error) {
        awaitingAndroidUpiResultRef.current = false;
        currentPaymentRef.current = null;
        await clearPendingUpiPayment();
        setPaying(false);
        await recordUpiDebug({
          stage: 'launch_error',
          appName: 'Generic UPI',
          status: 'FAILURE',
          message: 'Unable to open UPI app.',
          receiverUpiId,
          amount: formatUpiAmount(txnAmount),
          rawText:
            error?.message ||
            error?.description ||
            stringifyDebugPayload(error) ||
            'Unable to open UPI app.',
        });
        Alert.alert('Payment failed', 'Unable to open UPI app.');
      }
    },
    [
      handlePaymentStatus,
      launchAndroidUpiIntent,
      paying,
      recordUpiDebug,
      saveTransaction,
      showPaymentConfirmationPrompt,
      updateUpiDebugContext,
    ],
  );

  // const launchUpiApp = useCallback(
  //     async app => {
  //         if (!activeReceiver || !numericAmount) {
  //             Alert.alert("Invalid payment", "Enter a valid receiver and amount.");
  //             return;
  //         }
  //         if (!isValidUpiId(activeReceiver)) {
  //             Alert.alert("Invalid UPI ID", "Please enter a valid receiver UPI ID.");
  //             return;
  //         }
  //         if (paying) return;

  //         const { txnId, params } = buildUpiParams({
  //             upiId: activeReceiver,
  //             name: qrBeneficiary?.name || "Demo Merchant",
  //             amount: numericAmount.toString(),
  //             note,
  //         });
  //         const url = `${app.scheme}?${params}`;

  //         try {
  //             const supported = await Linking.canOpenURL(url);
  //             if (!supported) {
  //                 Alert.alert(`${app.name} not available`, "Install the selected UPI app and try again.");
  //                 return;
  //             }
  //             currentPaymentRef.current = { txnId, receiverUpiId: activeReceiver };
  //             setPaying(true);
  //             setShowUpiAppSelector(false);
  //             await Linking.openURL(url);
  //         } catch {
  //             currentPaymentRef.current = null;
  //             setPaying(false);
  //             Alert.alert("Unable to launch UPI app", "Please try again.");
  //         }
  //     },
  //     [activeReceiver, note, numericAmount, paying, qrBeneficiary]
  // );
  const launchSelectedUpiApp = useCallback(
    async app => {
      if (!activeReceiver || !numericAmount) {
        Alert.alert('Invalid payment', 'Enter a valid receiver and amount.');
        return;
      }

      if (!isValidUpiId(activeReceiver)) {
        Alert.alert('Invalid UPI ID', 'Please enter a valid receiver UPI ID.');
        return;
      }

      if (paying) {
        return;
      }

      const queryString = buildUpiQueryString({
        upiId: activeReceiver,
        name: qrBeneficiary?.name || activeReceiver,
        amount: numericAmount,
        note,
      });
      const formattedAmount = formatUpiAmount(numericAmount);
      const txnId = `TXN_${Date.now()}`;

      let selectedUrl = buildAppSpecificUpiUrl(app.scheme, queryString);

      try {
        let supported = await Linking.canOpenURL(selectedUrl);

        if (!supported) {
          selectedUrl = `upi://pay?${queryString}`;
          supported = await Linking.canOpenURL(selectedUrl);
        }

        if (!supported) {
          Alert.alert(
            'No UPI app found',
            'Install Google Pay, PhonePe, Paytm, BHIM, or another UPI app.',
          );
          return;
        }

        const pendingPayment = {
          txnId,
          receiverUpiId: activeReceiver,
          amount: formattedAmount,
          selectedApp: app.name,
          createdAt: new Date().toISOString(),
        };

        currentPaymentRef.current = pendingPayment;
        await saveTransaction({
          id: txnId,
          upiId: activeReceiver,
          amount: formattedAmount,
          status: 'INITIATED',
        });
        await AsyncStorage.setItem(
          PENDING_UPI_KEY,
          JSON.stringify(pendingPayment),
        );
        updateUpiDebugContext({
          launchUrl: selectedUrl,
          launchScheme: String(selectedUrl).split('?')[0],
          launchAppName: app.name,
          ...buildUpiDebugFields('launch', selectedUrl),
        });
        await recordUpiDebug({
          stage: 'launch_request',
          appName: app.name,
          status: 'INITIATED',
          receiverUpiId: activeReceiver,
          amount: formattedAmount,
          rawText: selectedUrl,
        });

        setPaying(true);
        setShowUpiAppSelector(false);

        if (Platform.OS === 'android') {
          awaitingAndroidUpiResultRef.current = true;
          const result = await launchAndroidUpiIntent(selectedUrl);
          awaitingAndroidUpiResultRef.current = false;

          const parsedResult =
            parseUpiResultPayload(result) ||
            parseUpiResultPayload(result?.data) ||
            parseUpiResultPayload(result?.extra?.response) ||
            parseUpiResultPayload(result?.extra?.Status) ||
            parseUpiResultPayload(result?.extra?.status);

          await recordUpiDebug({
            stage: 'android_result',
            appName: app.name,
            status: parsedResult?.status || 'UNKNOWN',
            reference: parsedResult?.reference,
            responseCode: parsedResult?.responseCode,
            message: parsedResult?.message,
            receiverUpiId: activeReceiver,
            amount: formattedAmount,
            rawText: stringifyDebugPayload(result),
          });

          if (parsedResult?.status) {
            await handlePaymentStatus({
              status: parsedResult.status,
              reference: parsedResult.reference,
              responseCode: parsedResult.responseCode,
              detailMessage: parsedResult.message,
              receiverUpiId: activeReceiver,
              pendingPayment,
            });
            return;
          }

          if (currentPaymentRef.current?.txnId !== pendingPayment.txnId) {
            return;
          }
          showPaymentConfirmationPrompt(pendingPayment);
          return;
        }

        await Linking.openURL(selectedUrl);
      } catch (error) {
        awaitingAndroidUpiResultRef.current = false;
        currentPaymentRef.current = null;
        await clearPendingUpiPayment();
        setPaying(false);
        await recordUpiDebug({
          stage: 'launch_error',
          appName: app.name,
          status: 'FAILURE',
          message: 'Unable to launch selected UPI app.',
          receiverUpiId: activeReceiver,
          amount: formattedAmount,
          rawText:
            error?.message ||
            error?.description ||
            stringifyDebugPayload(error) ||
            'Unable to launch selected UPI app.',
        });
        Alert.alert('Unable to launch UPI app', 'Please try again.');
      }
    },
    [
      activeReceiver,
      handlePaymentStatus,
      launchAndroidUpiIntent,
      note,
      numericAmount,
      paying,
      qrBeneficiary,
      recordUpiDebug,
      saveTransaction,
      showPaymentConfirmationPrompt,
      updateUpiDebugContext,
    ],
  );

  const handlePay = useCallback(() => {
    setPaymentMethodModal(false);

    if (upiApps.length > 1) {
      setShowUpiAppSelector(true);
      return;
    }

    launchUpiPayment({
      receiverUpiId: activeReceiver,
      receiverName: qrBeneficiary?.name,
      txnAmount: numericAmount,
      txnNote: note,
    });
  }, [
    activeReceiver,
    launchUpiPayment,
    note,
    numericAmount,
    qrBeneficiary,
    upiApps.length,
  ]);

  const startRazorpayPayment = useCallback(async () => {
    if (!numericAmount || numericAmount <= 0) {
      Alert.alert('Invalid amount', 'Enter a valid amount.');
      return;
    }

    if (!activeReceiver || !isValidUpiId(activeReceiver)) {
      Alert.alert(
        'Invalid receiver',
        'Enter a valid receiver UPI ID before starting checkout.',
      );
      return;
    }

    const razorpayProvider = getPaymentProviderConfig(
      gatewayConfig,
      PAYMENT_PROVIDER_IDS.RAZORPAY,
    );
    let nextGatewayConfig = gatewayConfig;

    if (!razorpayProvider?.enabled || !gatewayConfig?.razorpay?.keyId) {
      nextGatewayConfig = await fetchPaymentGatewayConfig();
      setGatewayConfig(nextGatewayConfig);
    }

    if (
      !nextGatewayConfig?.razorpay?.enabled ||
      !nextGatewayConfig?.razorpay?.keyId
    ) {
      Alert.alert(
        'Razorpay not configured',
        'Deploy the Firebase payment functions with Razorpay keys to enable merchant checkout. You can still use the UPI app-switch fallback.',
      );
      return;
    }

    const txnId = `TXN_${Date.now()}`;
    const formattedAmount = formatUpiAmount(numericAmount);
    const pendingPayment = {
      txnId,
      amount: formattedAmount,
      receiverUpiId: activeReceiver,
      selectedApp: 'Razorpay Checkout',
      provider: PAYMENT_PROVIDER_IDS.RAZORPAY,
      createdAt: new Date().toISOString(),
    };

    const prefill = {
      name: qrBeneficiary?.name || activeReceiver,
    };

    try {
      currentPaymentRef.current = pendingPayment;
      await saveTransaction({
        id: txnId,
        upiId: activeReceiver,
        amount: formattedAmount,
        status: 'INITIATED',
      });
      await AsyncStorage.setItem(
        PENDING_UPI_KEY,
        JSON.stringify(pendingPayment),
      );
      await recordUpiDebug({
        stage: 'gateway_order_request',
        appName: pendingPayment.selectedApp,
        status: 'INITIATED',
        receiverUpiId: activeReceiver,
        amount: formattedAmount,
        rawText: JSON.stringify({
          note,
          provider: PAYMENT_PROVIDER_IDS.RAZORPAY,
          receiverName: qrBeneficiary?.name || activeReceiver,
          transactionId: txnId,
        }),
      });

      setPaying(true);
      setPaymentMethodModal(false);

      const order = await createGatewayOrder({
        provider: PAYMENT_PROVIDER_IDS.RAZORPAY,
        amountMinor: Math.round(numericAmount * 100),
        currency: 'INR',
        note,
        receipt: txnId,
        receiverName: qrBeneficiary?.name || activeReceiver,
        receiverUpiId: activeReceiver,
        transactionId: txnId,
      });

      const pendingGatewayPayment = {
        ...pendingPayment,
        gatewayOrderId: order.orderId,
      };
      currentPaymentRef.current = pendingGatewayPayment;
      await AsyncStorage.setItem(
        PENDING_UPI_KEY,
        JSON.stringify(pendingGatewayPayment),
      );

      await recordUpiDebug({
        stage: 'gateway_order_created',
        appName: pendingPayment.selectedApp,
        status: 'INITIATED',
        receiverUpiId: activeReceiver,
        amount: formattedAmount,
        rawText: JSON.stringify(order),
      });

      const checkoutResponse = await RazorpayCheckout.open({
        amount: order.amount,
        currency: order.currency,
        description:
          nextGatewayConfig.razorpay.merchantDescription ||
          'PSV merchant payment',
        key: order.keyId,
        name: order.merchantName || 'PSV',
        order_id: order.orderId,
        notes: {
          note: note || '',
          receiverName: qrBeneficiary?.name || activeReceiver,
          receiverUpiId: activeReceiver,
          transactionId: txnId,
        },
        prefill,
        theme: {color: PAYMENT_THEME.accent},
      });

      await recordUpiDebug({
        stage: 'gateway_checkout_success',
        appName: pendingPayment.selectedApp,
        status: 'SUCCESS',
        receiverUpiId: activeReceiver,
        amount: formattedAmount,
        rawText: stringifyDebugPayload(checkoutResponse),
      });

      const verification = await verifyGatewayPayment({
        provider: PAYMENT_PROVIDER_IDS.RAZORPAY,
        amount: formattedAmount,
        orderId: checkoutResponse.razorpay_order_id || order.orderId,
        paymentId: checkoutResponse.razorpay_payment_id,
        receiverUpiId: activeReceiver,
        signature: checkoutResponse.razorpay_signature,
        transactionId: txnId,
      });

      await handlePaymentStatus({
        status: verification?.status || 'SUCCESS',
        reference:
          verification?.reference || checkoutResponse.razorpay_payment_id,
        detailMessage:
          verification?.message || 'Payment verified successfully.',
        receiverUpiId: activeReceiver,
        pendingPayment: pendingGatewayPayment,
      });
    } catch (error) {
      const paymentMessage =
        error?.description ||
        error?.error?.description ||
        error?.message ||
        'Payment cancelled or failed.';

      await recordUpiDebug({
        stage: 'gateway_error',
        appName: pendingPayment.selectedApp,
        status: 'FAILURE',
        message: paymentMessage,
        receiverUpiId: activeReceiver,
        amount: formattedAmount,
        rawText: stringifyDebugPayload(error),
      });

      await handlePaymentStatus({
        status: 'FAILURE',
        detailMessage: paymentMessage,
        receiverUpiId: activeReceiver,
        pendingPayment,
      });

      Alert.alert(
        paymentMessage.toLowerCase().includes('cancel')
          ? 'Payment cancelled'
          : 'Payment failed',
        paymentMessage,
      );
    }
  }, [
    activeReceiver,
    gatewayConfig,
    handlePaymentStatus,
    note,
    numericAmount,
    qrBeneficiary,
    recordUpiDebug,
    saveTransaction,
  ]);

  const handleGenerateQr = useCallback(() => {
    const upi = userUpiId.trim();
    const amountStr = qrAmount.trim();
    if (!upi || !isValidUpiId(upi)) {
      Alert.alert('Invalid UPI ID', 'Enter a valid UPI ID.');
      return;
    }
    const amountNum = Number(amountStr);
    if (amountStr && (Number.isNaN(amountNum) || amountNum <= 0)) {
      Alert.alert('Invalid amount', 'Enter a valid amount.');
      return;
    }
    setUserUpiId(upi);
    setGeneratedQr(
      buildUpiQrString({
        upiId: upi,
        name: upi,
        amount: amountStr || undefined,
        note: 'UPI Payment',
      }),
    );
  }, [qrAmount, userUpiId]);

  const shareQr = useCallback(async () => {
    if (!generatedQr || !qrRef.current) {
      Alert.alert('Generate QR first', 'Create a QR before sharing.');
      return;
    }
    const uri = await qrRef.current.capture();
    await Share.open({url: uri});
  }, [generatedQr]);

  return (
    <LinearGradient colors={theme.gradient} style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <View
          style={[
            styles.heroCard,
            {backgroundColor: theme.surface, borderColor: theme.border},
          ]}>
          <View style={styles.heroRow}>
            <View style={styles.flexOne}>
              <Text style={[styles.heroEyebrow, {color: theme.primary}]}>
                Payments Workspace
              </Text>
              <Text style={[styles.heroTitle, {color: theme.text}]}>
                Fund Transfer
              </Text>
              <Text style={[styles.heroSubtitle, {color: theme.subText}]}>
                Send money, scan QR codes, generate receive QR, and manage
                beneficiaries from one place.
              </Text>
            </View>
            <View
              style={[
                styles.balanceCard,
                {backgroundColor: theme.primarySoft},
              ]}>
              <Text style={[styles.balanceLabel, {color: theme.muted}]}>
                Balance
              </Text>
              <Text
                style={[
                  styles.balanceValue,
                  {color: theme.text},
                ]}>{`Rs ${AVAILABLE_BALANCE.toLocaleString('en-IN')}`}</Text>
            </View>
          </View>

          <View
            style={[
              styles.modeToggle,
              {backgroundColor: theme.surfaceAlt, borderColor: theme.border},
            ]}>
            {['SEND', 'RECEIVE'].map(currentMode => {
              const active = mode === currentMode;
              return (
                <TouchableOpacity
                  key={currentMode}
                  style={[
                    styles.modeBtn,
                    active && {backgroundColor: theme.primary},
                  ]}
                  onPress={() => setMode(currentMode)}
                  activeOpacity={0.9}>
                  <Text
                    style={[
                      styles.modeText,
                      active ? styles.modeTextActive : styles.modeTextInactive,
                    ]}>
                    {currentMode === 'SEND' ? 'Send Money' : 'Receive Money'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Banner banner={paymentBanner} theme={theme} />
        <UpiDebugCard
          entry={lastUpiDebug}
          theme={theme}
          onClear={clearUpiDebug}
        />

        {mode === 'SEND' ? (
          <>
            <View
              style={[
                styles.panel,
                {backgroundColor: theme.surface, borderColor: theme.border},
              ]}>
              <SectionHeader
                title="Payment details"
                meta={`Available balance Rs ${AVAILABLE_BALANCE}`}
                theme={theme}
              />

              <Text style={[styles.inputLabel, {color: theme.subText}]}>
                Receiver UPI ID
              </Text>
              <View
                style={[
                  styles.inputShell,
                  {backgroundColor: theme.inputBg, borderColor: theme.border},
                ]}>
                <Ionicons
                  name="at-outline"
                  size={18}
                  color={theme.muted}
                  style={styles.leadingIcon}
                />
                <TextInput
                  style={[styles.textInput, {color: theme.text}]}
                  placeholder="example@oksbi"
                  placeholderTextColor={theme.muted}
                  autoCapitalize="none"
                  value={upiId}
                  onChangeText={text => {
                    setUpiId(text);
                    if (qrBeneficiary && text !== qrBeneficiary.upiId) {
                      setQrBeneficiary(null);
                    }
                  }}
                />
              </View>

              <Text style={[styles.inputLabel, {color: theme.subText}]}>
                Amount
              </Text>
              <View
                style={[
                  styles.inputShell,
                  {backgroundColor: theme.inputBg, borderColor: theme.border},
                ]}>
                <IndianRupee
                  size={18}
                  color={theme.muted}
                  style={styles.leadingIcon}
                />
                <TextInput
                  style={[
                    styles.textInput,
                    styles.amountInput,
                    {color: theme.text},
                  ]}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={theme.muted}
                  value={amount}
                  onChangeText={text => setAmount(text.replace(/,/g, ''))}
                />
              </View>

              <Text style={[styles.inlineError, {color: theme.subText}]}>
                Your selected UPI app will verify actual bank balance and limit.
              </Text>

              <View style={styles.presetRow}>
                {AMOUNT_PRESETS.map(value => (
                  <AmountPreset
                    key={value}
                    value={value}
                    onPress={onPresetPress}
                    theme={theme}
                  />
                ))}
              </View>

              <Text style={[styles.inputLabel, {color: theme.subText}]}>
                Note
              </Text>
              <View
                style={[
                  styles.inputShell,
                  styles.noteShell,
                  {backgroundColor: theme.inputBg, borderColor: theme.border},
                ]}>
                <TextInput
                  style={[
                    styles.textInput,
                    styles.noteInput,
                    {color: theme.text},
                  ]}
                  placeholder="Add a payment note"
                  placeholderTextColor={theme.muted}
                  value={note}
                  onChangeText={setNote}
                  multiline
                />
              </View>

              {qrBeneficiary ? (
                <View
                  style={[
                    styles.qrSelectionCard,
                    {backgroundColor: theme.primarySoft},
                  ]}>
                  <Text
                    style={[styles.qrSelectionLabel, {color: theme.subText}]}>
                    Selected from QR
                  </Text>
                  <Text style={[styles.qrSelectionName, {color: theme.text}]}>
                    {qrBeneficiary.name}
                  </Text>
                  <Text style={[styles.qrSelectionUpi, {color: theme.subText}]}>
                    {qrBeneficiary.upiId}
                  </Text>
                </View>
              ) : null}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[
                    styles.primaryAction,
                    {backgroundColor: theme.primary},
                    !canSend && styles.disabledAction,
                  ]}
                  disabled={!canSend}
                  onPress={() => setConfirmVisible(true)}
                  activeOpacity={0.9}>
                  <Text style={styles.primaryActionText}>{`Pay Rs ${
                    amount || '0'
                  }`}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.secondaryAction,
                    {
                      backgroundColor: theme.primarySoft,
                      borderColor: theme.border,
                    },
                  ]}
                  onPress={openScanner}
                  activeOpacity={0.9}>
                  <Camera size={18} color={theme.primary} />
                  <Text
                    style={[
                      styles.secondaryActionText,
                      {color: theme.primary},
                    ]}>
                    Scan QR
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {beneficiaries.length > 0 ? (
              <View style={styles.moduleSection}>
                <SectionHeader
                  title="Saved beneficiaries"
                  meta={`${beneficiaries.length} recent`}
                  theme={theme}
                />
                {beneficiaries.map(item => (
                  <BeneficiaryCard
                    key={item.upiId}
                    item={item}
                    theme={theme}
                    onPress={handleBeneficiarySelect}
                  />
                ))}
              </View>
            ) : null}

            {transactions.length > 0 ? (
              <View style={styles.moduleSection}>
                <SectionHeader
                  title="Recent transactions"
                  meta={`${transactions.length} saved`}
                  theme={theme}
                />
                {transactions.map(item => (
                  <TransactionCard key={item.id} item={item} theme={theme} />
                ))}
              </View>
            ) : null}
          </>
        ) : (
          <View
            style={[
              styles.panel,
              {backgroundColor: theme.surface, borderColor: theme.border},
            ]}>
            <SectionHeader
              title="Receive payments"
              meta="Generate and share your UPI QR"
              theme={theme}
            />

            <Text style={[styles.inputLabel, {color: theme.subText}]}>
              Your UPI ID
            </Text>
            <View
              style={[
                styles.inputShell,
                {backgroundColor: theme.inputBg, borderColor: theme.border},
              ]}>
              <Ionicons
                name="qr-code-outline"
                size={18}
                color={theme.muted}
                style={styles.leadingIcon}
              />
              <TextInput
                style={[styles.textInput, {color: theme.text}]}
                placeholder={DEFAULT_RECEIVER_UPI}
                placeholderTextColor={theme.muted}
                value={userUpiId}
                onChangeText={setUserUpiId}
                autoCapitalize="none"
              />
            </View>

            <Text style={[styles.inputLabel, {color: theme.subText}]}>
              Amount (optional)
            </Text>
            <View
              style={[
                styles.inputShell,
                {backgroundColor: theme.inputBg, borderColor: theme.border},
              ]}>
              <IndianRupee
                size={18}
                color={theme.muted}
                style={styles.leadingIcon}
              />
              <TextInput
                style={[styles.textInput, {color: theme.text}]}
                keyboardType="numeric"
                placeholder="Leave blank for open amount"
                placeholderTextColor={theme.muted}
                value={qrAmount}
                onChangeText={setQrAmount}
              />
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.primaryAction, {backgroundColor: theme.primary}]}
                onPress={handleGenerateQr}
                activeOpacity={0.9}>
                <Text style={styles.primaryActionText}>Generate QR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.secondaryAction,
                  {
                    backgroundColor: theme.primarySoft,
                    borderColor: theme.border,
                  },
                ]}
                onPress={shareQr}
                activeOpacity={0.9}>
                <Ionicons
                  name="share-social-outline"
                  size={18}
                  color={theme.primary}
                />
                <Text
                  style={[styles.secondaryActionText, {color: theme.primary}]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>

            <ViewShot ref={qrRef} options={{format: 'png', quality: 1}}>
              <ReceiveQrCard
                qrValue={generatedQr}
                upiId={userUpiId}
                amount={qrAmount}
                theme={theme}
              />
            </ViewShot>
          </View>
        )}
      </ScrollView>

      <Modal visible={confirmVisible} transparent animationType="slide">
        <View style={[styles.sheetOverlay, {backgroundColor: theme.overlay}]}>
          <View
            style={[styles.sheetContainer, {backgroundColor: theme.surface}]}>
            <Text style={[styles.sheetTitle, {color: theme.text}]}>
              Confirm payment
            </Text>

            <View style={styles.sheetRow}>
              <Text style={[styles.sheetLabel, {color: theme.subText}]}>
                Pay to
              </Text>
              <Text
                style={[styles.sheetValue, {color: theme.text}]}
                numberOfLines={1}>
                {activeReceiver || 'Not selected'}
              </Text>
            </View>

            <View style={styles.sheetRow}>
              <Text style={[styles.sheetLabel, {color: theme.subText}]}>
                Amount
              </Text>
              <Text style={[styles.sheetAmount, {color: theme.text}]}>{`Rs ${
                amount || '0'
              }`}</Text>
            </View>

            {note ? (
              <View style={styles.sheetRow}>
                <Text style={[styles.sheetLabel, {color: theme.subText}]}>
                  Note
                </Text>
                <Text
                  style={[styles.sheetValue, {color: theme.text}]}
                  numberOfLines={2}>
                  {note}
                </Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.sheetPrimaryBtn, {backgroundColor: theme.primary}]}
              onPress={() => {
                setConfirmVisible(false);
                setPaymentMethodModal(true);
              }}
              activeOpacity={0.9}>
              <Text style={styles.sheetPrimaryText}>Continue to payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetGhostBtn, {borderColor: theme.border}]}
              onPress={() => setConfirmVisible(false)}
              activeOpacity={0.9}>
              <Text style={[styles.sheetGhostText, {color: theme.subText}]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={paymentMethodModal} transparent animationType="slide">
        <View style={[styles.sheetOverlay, {backgroundColor: theme.overlay}]}>
          <View
            style={[styles.sheetContainer, {backgroundColor: theme.surface}]}>
            <Text style={[styles.sheetTitle, {color: theme.text}]}>
              Choose payment method
            </Text>

            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                {backgroundColor: theme.primarySoft, borderColor: theme.border},
              ]}
              onPress={startRazorpayPayment}
              activeOpacity={0.92}>
              <View style={styles.paymentMethodCopy}>
                <Text style={[styles.paymentMethodTitle, {color: theme.text}]}>
                  Razorpay Checkout
                </Text>
                <Text
                  style={[styles.paymentMethodMeta, {color: theme.subText}]}>
                  Verified merchant checkout with UPI, cards, netbanking, and
                  wallet support.
                </Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={theme.primary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethodCard,
                {backgroundColor: theme.surfaceAlt, borderColor: theme.border},
              ]}
              onPress={() => {
                handlePay(); // ✅ directly launch UPI
              }}
              activeOpacity={0.92}>
              <View style={styles.paymentMethodCopy}>
                <Text style={[styles.paymentMethodTitle, {color: theme.text}]}>
                  Installed UPI apps
                </Text>
                <Text
                  style={[styles.paymentMethodMeta, {color: theme.subText}]}>
                  Fallback app-switch flow for Google Pay, PhonePe, Paytm, BHIM,
                  or another installed UPI app.
                </Text>
              </View>
              <Ionicons
                name="phone-portrait-outline"
                size={18}
                color={theme.primary}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetGhostBtn, {borderColor: theme.border}]}
              onPress={() => setPaymentMethodModal(false)}
              activeOpacity={0.9}>
              <Text style={[styles.sheetGhostText, {color: theme.subText}]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showUpiAppSelector} transparent animationType="slide">
        <View style={[styles.sheetOverlay, {backgroundColor: theme.overlay}]}>
          <View
            style={[styles.sheetContainer, {backgroundColor: theme.surface}]}>
            <Text style={[styles.sheetTitle, {color: theme.text}]}>
              Select UPI app
            </Text>
            {upiApps.map(app => (
              <UpiAppCard
                key={app.id}
                app={app}
                theme={theme}
                onPress={launchSelectedUpiApp}
              />
            ))}
            <TouchableOpacity
              style={[styles.sheetGhostBtn, {borderColor: theme.border}]}
              onPress={() => setShowUpiAppSelector(false)}
              activeOpacity={0.9}>
              <Text style={[styles.sheetGhostText, {color: theme.subText}]}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* <Modal visible={showUpiAppSelector} transparent animationType="slide">
                <View style={[styles.sheetOverlay, { backgroundColor: theme.overlay }]}>
                    <View style={[styles.sheetContainer, { backgroundColor: theme.surface }]}>
                        <Text style={[styles.sheetTitle, { color: theme.text }]}>Select UPI app</Text>
                        {upiApps.map(app => (
                            <UpiAppCard key={app.id} app={app} theme={theme} onPress={handlePay} />
                        ))}
                        <TouchableOpacity
                            style={[styles.sheetGhostBtn, { borderColor: theme.border }]}
                            onPress={() => setShowUpiAppSelector(false)}
                            activeOpacity={0.9}
                        >
                            <Text style={[styles.sheetGhostText, { color: theme.subText }]}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal> */}
    </LinearGradient>
  );
};

export default FundTransfer;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  flexOne: {
    flex: 1,
  },
  heroCard: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: scale(28),
    lineHeight: scale(34),
    fontWeight: '800',
  },
  heroSubtitle: {
    marginTop: 8,
    fontSize: scale(14),
    lineHeight: scale(21),
    maxWidth: '92%',
  },
  balanceCard: {
    minWidth: 124,
    borderRadius: 22,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  balanceLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '700',
  },
  balanceValue: {
    marginTop: 8,
    fontSize: scale(20),
    fontWeight: '800',
  },
  modeToggle: {
    marginTop: 18,
    borderRadius: 18,
    borderWidth: 1,
    padding: 4,
    flexDirection: 'row',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  modeTextActive: {
    color: '#08111F',
  },
  modeTextInactive: {
    color: PAYMENT_THEME.textSecondary,
  },
  banner: {
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 14,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  debugCard: {
    marginBottom: 16,
  },
  debugRow: {
    marginBottom: 10,
  },
  debugLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  debugValue: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  debugValueMono: {
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  debugRawLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginTop: 4,
    marginBottom: 6,
  },
  debugRawValue: {
    fontSize: 12,
    lineHeight: 18,
    fontFamily: Platform.select({
      ios: 'Menlo',
      android: 'monospace',
      default: 'monospace',
    }),
  },
  debugClearBtn: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  debugClearText: {
    fontSize: 13,
    fontWeight: '800',
  },
  panel: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    marginBottom: 16,
  },
  moduleSection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputShell: {
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  noteShell: {
    minHeight: 100,
    alignItems: 'flex-start',
    paddingTop: 14,
  },
  leadingIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
  amountInput: {
    fontSize: 22,
    fontWeight: '700',
  },
  noteInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  inlineError: {
    marginTop: 0,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '600',
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  presetChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: '700',
  },
  qrSelectionCard: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
  },
  qrSelectionLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '700',
  },
  qrSelectionName: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '800',
  },
  qrSelectionUpi: {
    marginTop: 4,
    fontSize: 13,
  },
  actionRow: {
    flexDirection: isTablet ? 'row' : 'column',
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  primaryActionText: {
    color: '#08111F',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryAction: {
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    flexDirection: 'row',
  },
  secondaryActionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
  },
  disabledAction: {
    opacity: 0.45,
  },
  beneficiaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  beneficiaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  beneficiaryName: {
    fontSize: 15,
    fontWeight: '700',
  },
  beneficiaryUpi: {
    fontSize: 13,
    marginTop: 4,
  },
  transactionCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  transactionUpi: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '800',
  },
  transactionMeta: {
    flex: 1,
    marginTop: 8,
    fontSize: 12,
  },
  transactionStatus: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
  },
  qrCard: {
    marginTop: 18,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 16,
  },
  qrUpi: {
    marginTop: 16,
    fontSize: 13,
  },
  qrAmount: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '800',
  },
  qrHint: {
    marginTop: 6,
    fontSize: 13,
  },
  sheetOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 26,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  sheetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  sheetLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetAmount: {
    fontSize: 22,
    fontWeight: '800',
  },
  sheetPrimaryBtn: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  sheetPrimaryText: {
    color: '#08111F',
    fontSize: 15,
    fontWeight: '800',
  },
  sheetSecondaryBtn: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
  },
  sheetSecondaryText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  sheetGhostBtn: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  sheetGhostText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  paymentMethodCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  paymentMethodCopy: {
    flex: 1,
  },
  paymentMethodTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  paymentMethodMeta: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
  },
  upiAppCard: {
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  upiAppName: {
    fontSize: 15,
    fontWeight: '700',
  },
});
