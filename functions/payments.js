const crypto = require('crypto');
const admin = require('firebase-admin');
const functions = require('firebase-functions');

const PAYMENT_AUDIT_ROOT = 'paymentGatewayEvents';

function setCorsHeaders(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
}

function handlePreflight(req, res) {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return true;
  }

  return false;
}

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function asInteger(value) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return 0;
  }

  return Math.round(parsedValue);
}

function getRazorpayConfig() {
  return {
    keyId: asString(process.env.RAZORPAY_KEY_ID),
    keySecret: asString(process.env.RAZORPAY_KEY_SECRET),
    webhookSecret: asString(process.env.RAZORPAY_WEBHOOK_SECRET),
    merchantName: asString(process.env.PAYMENT_MERCHANT_NAME) || 'PSV',
    merchantDescription:
      asString(process.env.PAYMENT_MERCHANT_DESCRIPTION) ||
      'PSV merchant payment',
    supportContact: asString(process.env.PAYMENT_SUPPORT_CONTACT),
    supportEmail: asString(process.env.PAYMENT_SUPPORT_EMAIL),
  };
}

function getPublicPaymentGatewayConfig() {
  const razorpayConfig = getRazorpayConfig();
  const razorpayEnabled = Boolean(
    razorpayConfig.keyId && razorpayConfig.keySecret,
  );

  return {
    providers: [
      {
        id: 'razorpay',
        name: 'Razorpay Checkout',
        type: 'merchant_checkout',
        enabled: razorpayEnabled,
        methods: ['upi', 'card', 'netbanking', 'wallet'],
        description: razorpayEnabled
          ? 'Merchant checkout with server-side order creation and verification.'
          : 'Configure Razorpay environment variables in the Functions runtime to enable merchant checkout.',
      },
      {
        id: 'upi_intent',
        name: 'Installed UPI apps',
        type: 'app_switch',
        enabled: true,
        methods: ['upi'],
        description:
          'Fallback app-switch flow for installed UPI apps with manual confirmation.',
      },
    ],
    razorpay: {
      enabled: razorpayEnabled,
      keyId: razorpayConfig.keyId,
      merchantName: razorpayConfig.merchantName,
      merchantDescription: razorpayConfig.merchantDescription,
      supportContact: razorpayConfig.supportContact,
      supportEmail: razorpayConfig.supportEmail,
    },
  };
}

async function persistPaymentAudit({
  provider,
  stage,
  transactionId,
  status,
  payload,
}) {
  const providerKey = asString(provider) || 'unknown';
  const auditId =
    asString(transactionId) ||
    `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  const auditEntry = {
    stage: asString(stage) || 'unknown',
    status: asString(status) || '',
    provider: providerKey,
    payload: payload || {},
    timestamp: new Date().toISOString(),
  };

  try {
    await admin
      .database()
      .ref(`${PAYMENT_AUDIT_ROOT}/${providerKey}/${auditId}`)
      .set(auditEntry);
  } catch (error) {
    functions.logger.warn('Unable to persist payment audit entry.', {
      error: error?.message || error,
      provider: providerKey,
      stage: auditEntry.stage,
      transactionId: auditId,
    });
  }
}

async function createRazorpayOrder({
  amountMinor,
  currency = 'INR',
  receipt,
  notes,
}) {
  const razorpayConfig = getRazorpayConfig();

  if (!razorpayConfig.keyId || !razorpayConfig.keySecret) {
    throw new Error('Razorpay is not configured on the server.');
  }

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${razorpayConfig.keyId}:${razorpayConfig.keySecret}`,
      ).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountMinor,
      currency,
      receipt,
      notes,
    }),
  });

  const responseBody = await response.json();

  if (!response.ok) {
    throw new Error(
      responseBody?.error?.description ||
        responseBody?.error?.reason ||
        'Razorpay order creation failed.',
    );
  }

  return {
    amount: responseBody.amount,
    createdAt: responseBody.created_at,
    currency: responseBody.currency,
    orderId: responseBody.id,
    receipt: responseBody.receipt,
    status: responseBody.status,
  };
}

function verifyRazorpaySignature({orderId, paymentId, signature}) {
  const razorpayConfig = getRazorpayConfig();

  if (!razorpayConfig.keySecret) {
    throw new Error('Razorpay is not configured on the server.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', razorpayConfig.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return expectedSignature === signature;
}

function verifyRazorpayWebhookSignature(signature, rawBody) {
  const razorpayConfig = getRazorpayConfig();

  if (!razorpayConfig.webhookSecret) {
    throw new Error('Razorpay webhook secret is not configured.');
  }

  const expectedSignature = crypto
    .createHmac('sha256', razorpayConfig.webhookSecret)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
}

const paymentGatewayConfig = functions.https.onRequest((req, res) => {
  if (handlePreflight(req, res)) {
    return;
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({error: 'Method not allowed'});
    return;
  }

  setCorsHeaders(res);
  res.status(200).json(getPublicPaymentGatewayConfig());
});

const createGatewayOrder = functions.https.onRequest(async (req, res) => {
  if (handlePreflight(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    setCorsHeaders(res);
    res.status(405).json({error: 'Method not allowed'});
    return;
  }

  const body = req.body || {};
  const provider = asString(body.provider) || 'razorpay';

  if (provider !== 'razorpay') {
    setCorsHeaders(res);
    res.status(501).json({
      error: `Provider "${provider}" is not supported in this build.`,
    });
    return;
  }

  const amountMinor = asInteger(body.amountMinor);
  const currency = asString(body.currency) || 'INR';
  const receipt =
    asString(body.receipt) || `rcpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const transactionId = asString(body.transactionId) || receipt;

  if (amountMinor <= 0) {
    setCorsHeaders(res);
    res.status(400).json({error: 'Amount must be greater than 0.'});
    return;
  }

  const notes = {
    note: asString(body.note),
    receiverName: asString(body.receiverName),
    receiverUpiId: asString(body.receiverUpiId),
    transactionId,
  };

  try {
    const order = await createRazorpayOrder({
      amountMinor,
      currency,
      receipt,
      notes,
    });
    const razorpayConfig = getPublicPaymentGatewayConfig().razorpay;

    await persistPaymentAudit({
      provider,
      stage: 'order_created',
      status: order.status || 'created',
      transactionId,
      payload: {
        amountMinor,
        currency,
        note: notes.note,
        orderId: order.orderId,
        receipt: order.receipt,
        receiverName: notes.receiverName,
        receiverUpiId: notes.receiverUpiId,
      },
    });

    setCorsHeaders(res);
    res.status(200).json({
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayConfig.keyId,
      merchantDescription: razorpayConfig.merchantDescription,
      merchantName: razorpayConfig.merchantName,
      orderId: order.orderId,
      provider,
      receipt: order.receipt,
      supportContact: razorpayConfig.supportContact,
      supportEmail: razorpayConfig.supportEmail,
    });
  } catch (error) {
    functions.logger.error('Unable to create payment gateway order.', {
      error: error?.message || error,
      provider,
      transactionId,
    });

    await persistPaymentAudit({
      provider,
      stage: 'order_create_failed',
      status: 'failure',
      transactionId,
      payload: {
        error: error?.message || error,
      },
    });

    setCorsHeaders(res);
    res.status(500).json({
      error: error?.message || 'Unable to create payment gateway order.',
    });
  }
});

const verifyGatewayPayment = functions.https.onRequest(async (req, res) => {
  if (handlePreflight(req, res)) {
    return;
  }

  if (req.method !== 'POST') {
    setCorsHeaders(res);
    res.status(405).json({error: 'Method not allowed'});
    return;
  }

  const body = req.body || {};
  const provider = asString(body.provider) || 'razorpay';

  if (provider !== 'razorpay') {
    setCorsHeaders(res);
    res.status(501).json({
      error: `Provider "${provider}" is not supported in this build.`,
    });
    return;
  }

  const orderId = asString(body.orderId);
  const paymentId = asString(body.paymentId);
  const signature = asString(body.signature);
  const transactionId = asString(body.transactionId) || orderId || paymentId;

  if (!orderId || !paymentId || !signature) {
    setCorsHeaders(res);
    res.status(400).json({
      error: 'orderId, paymentId, and signature are required.',
    });
    return;
  }

  try {
    const verified = verifyRazorpaySignature({
      orderId,
      paymentId,
      signature,
    });

    if (!verified) {
      await persistPaymentAudit({
        provider,
        stage: 'signature_mismatch',
        status: 'failure',
        transactionId,
        payload: {
          orderId,
          paymentId,
        },
      });

      setCorsHeaders(res);
      res.status(400).json({error: 'Payment signature verification failed.'});
      return;
    }

    await persistPaymentAudit({
      provider,
      stage: 'payment_verified',
      status: 'success',
      transactionId,
      payload: {
        amount: asString(body.amount),
        orderId,
        paymentId,
        receiverUpiId: asString(body.receiverUpiId),
      },
    });

    setCorsHeaders(res);
    res.status(200).json({
      message: 'Payment signature verified successfully.',
      orderId,
      provider,
      reference: paymentId,
      status: 'SUCCESS',
    });
  } catch (error) {
    functions.logger.error('Unable to verify payment gateway response.', {
      error: error?.message || error,
      provider,
      transactionId,
    });

    setCorsHeaders(res);
    res.status(500).json({
      error: error?.message || 'Unable to verify payment gateway response.',
    });
  }
});

const razorpayWebhook = functions.https.onRequest(async (req, res) => {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(res);
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    setCorsHeaders(res);
    res.status(405).json({error: 'Method not allowed'});
    return;
  }

  const signature = asString(req.get('x-razorpay-signature'));
  const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));

  try {
    const verified = verifyRazorpayWebhookSignature(signature, rawBody);

    if (!verified) {
      setCorsHeaders(res);
      res.status(401).json({error: 'Invalid webhook signature.'});
      return;
    }

    const eventName = asString(req.body?.event) || 'unknown';
    const paymentEntity = req.body?.payload?.payment?.entity || {};
    const orderEntity = req.body?.payload?.order?.entity || {};
    const transactionId =
      asString(paymentEntity?.notes?.transactionId) ||
      asString(orderEntity?.notes?.transactionId) ||
      asString(paymentEntity?.id) ||
      asString(orderEntity?.id);

    await persistPaymentAudit({
      provider: 'razorpay',
      stage: 'webhook',
      status: eventName,
      transactionId,
      payload: req.body,
    });

    setCorsHeaders(res);
    res.status(200).json({received: true});
  } catch (error) {
    functions.logger.error('Unable to process Razorpay webhook.', {
      error: error?.message || error,
    });

    setCorsHeaders(res);
    res.status(500).json({
      error: error?.message || 'Unable to process Razorpay webhook.',
    });
  }
});

module.exports = {
  createGatewayOrder,
  paymentGatewayConfig,
  razorpayWebhook,
  verifyGatewayPayment,
};
