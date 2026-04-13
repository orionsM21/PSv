import axios from 'axios';

const FIREBASE_PROJECT_ID = 'loan-origination-system-437db';
const PAYMENT_GATEWAY_BASE_URL = `https://us-central1-${FIREBASE_PROJECT_ID}.cloudfunctions.net`;
const REQUEST_TIMEOUT_MS = 15000;

export const PAYMENT_PROVIDER_IDS = {
  RAZORPAY: 'razorpay',
  UPI_INTENT: 'upi_intent',
};

export const DEFAULT_PAYMENT_GATEWAY_CONFIG = {
  providers: [
    {
      id: PAYMENT_PROVIDER_IDS.RAZORPAY,
      name: 'Razorpay Checkout',
      type: 'merchant_checkout',
      enabled: false,
      methods: ['upi', 'card', 'netbanking', 'wallet'],
      description:
        'Configure Razorpay keys in Firebase Functions to enable merchant checkout.',
    },
    {
      id: PAYMENT_PROVIDER_IDS.UPI_INTENT,
      name: 'Installed UPI apps',
      type: 'app_switch',
      enabled: true,
      methods: ['upi'],
      description:
        'Fallback app-switch flow for installed UPI apps with manual confirmation.',
    },
  ],
  razorpay: {
    enabled: false,
    keyId: '',
    merchantName: 'PSV',
    merchantDescription: 'PSV merchant payment',
    supportContact: '',
    supportEmail: '',
  },
};

const paymentGatewayApi = axios.create({
  baseURL: PAYMENT_GATEWAY_BASE_URL,
  timeout: REQUEST_TIMEOUT_MS,
});

function getErrorMessage(error, fallbackMessage) {
  return (
    error?.response?.data?.error ||
    error?.message ||
    error?.description ||
    fallbackMessage
  );
}

export async function fetchPaymentGatewayConfig() {
  try {
    const response = await paymentGatewayApi.get('/paymentGatewayConfig');

    return {
      ...DEFAULT_PAYMENT_GATEWAY_CONFIG,
      ...response.data,
      razorpay: {
        ...DEFAULT_PAYMENT_GATEWAY_CONFIG.razorpay,
        ...(response.data?.razorpay || {}),
      },
      providers:
        response.data?.providers || DEFAULT_PAYMENT_GATEWAY_CONFIG.providers,
    };
  } catch {
    return DEFAULT_PAYMENT_GATEWAY_CONFIG;
  }
}

export async function createGatewayOrder(payload) {
  try {
    const response = await paymentGatewayApi.post(
      '/createGatewayOrder',
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, 'Unable to create payment gateway order.'),
    );
  }
}

export async function verifyGatewayPayment(payload) {
  try {
    const response = await paymentGatewayApi.post(
      '/verifyGatewayPayment',
      payload,
    );
    return response.data;
  } catch (error) {
    throw new Error(
      getErrorMessage(error, 'Unable to verify payment gateway response.'),
    );
  }
}

export function getPaymentProviderConfig(gatewayConfig, providerId) {
  return (
    gatewayConfig?.providers?.find(provider => provider.id === providerId) ||
    DEFAULT_PAYMENT_GATEWAY_CONFIG.providers.find(
      provider => provider.id === providerId,
    )
  );
}
