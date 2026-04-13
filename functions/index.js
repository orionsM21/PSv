const admin = require('firebase-admin');
const functions = require('firebase-functions');
const paymentFunctions = require('./payments');

admin.initializeApp();

const projectId = process.env.GCLOUD_PROJECT || admin.app().options.projectId;
const functionServiceAccount = projectId
  ? `${projectId}@appspot.gserviceaccount.com`
  : undefined;

const INVALID_TOKEN_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
]);

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function dedupeTokens(tokens = []) {
  return [...new Set(tokens.filter(Boolean))];
}

function buildSenderLabel(senderProfile = {}) {
  return (
    asString(senderProfile?.name) ||
    asString(senderProfile?.phone) ||
    'New Message'
  );
}

function buildMulticastMessage({
  chatId,
  message,
  messageId,
  senderProfile,
  tokens,
}) {
  const senderLabel = buildSenderLabel(senderProfile);

  return {
    android: {
      priority: 'high',
      notification: {
        channelId: 'fcm-default',
        sound: 'default',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
        },
      },
    },
    data: {
      body: asString(message.text) || 'New message',
      chatId: String(chatId),
      clientMessageId: asString(message.clientMessageId) || String(messageId),
      messageId: String(messageId),
      messageType: asString(message.type) || 'text',
      senderLabel,
      senderName: asString(senderProfile?.name),
      senderPhone: asString(senderProfile?.phone),
      senderUid: String(message.from || ''),
      title: senderLabel,
    },
    notification: {
      body: asString(message.text) || 'New message',
      title: senderLabel,
    },
    tokens,
  };
}

async function resolveCanonicalUid(uid) {
  const normalizedUid = asString(uid);

  if (!normalizedUid) {
    return '';
  }

  const [privateUserSnapshot, publicUserSnapshot] = await Promise.all([
    admin.database().ref(`users/${normalizedUid}/mergedInto`).get(),
    admin.database().ref(`publicUsers/${normalizedUid}/mergedInto`).get(),
  ]);

  return (
    asString(privateUserSnapshot.val()) ||
    asString(publicUserSnapshot.val()) ||
    normalizedUid
  );
}

async function getSenderProfile(senderUid) {
  if (!senderUid) {
    return {
      name: '',
      phone: '',
    };
  }

  const canonicalSenderUid = await resolveCanonicalUid(senderUid);
  const [publicUserSnapshot, privateUserSnapshot] = await Promise.all([
    admin.database().ref(`publicUsers/${canonicalSenderUid}`).get(),
    admin.database().ref(`users/${canonicalSenderUid}`).get(),
  ]);

  const publicUser = publicUserSnapshot.val() || {};
  const privateUser = privateUserSnapshot.val() || {};

  return {
    name:
      asString(publicUser?.name) ||
      asString(privateUser?.displayName) ||
      asString(privateUser?.name),
    phone: asString(publicUser?.phone) || asString(privateUser?.phone),
  };
}

async function getRecipientInstallations(recipientUid) {
  const canonicalRecipientUid = await resolveCanonicalUid(recipientUid);
  const canonicalUserSnapshot = canonicalRecipientUid
    ? await admin.database().ref(`users/${canonicalRecipientUid}`).get()
    : null;
  const canonicalUser = canonicalUserSnapshot?.val() || {};
  const targetUids = dedupeTokens([
    recipientUid,
    canonicalRecipientUid,
    ...Object.keys(canonicalUser?.mergedAliases || {}),
  ]);
  const tokenSnapshots = await Promise.all(
    targetUids.map(async uid => {
      const [installationsSnapshot, legacyTokenSnapshot] = await Promise.all([
        admin.database().ref(`users/${uid}/fcmTokens`).get(),
        admin.database().ref(`users/${uid}/fcmToken`).get(),
      ]);

      return {
        installationEntries: Object.entries(installationsSnapshot.val() || {}),
        legacyToken: asString(legacyTokenSnapshot.val()),
        uid,
      };
    }),
  );

  const tokens = dedupeTokens(
    tokenSnapshots.flatMap(snapshot => [
      ...snapshot.installationEntries.map(([, installation]) =>
        asString(installation?.token),
      ),
      snapshot.legacyToken,
    ]),
  );

  return {
    canonicalUid: canonicalRecipientUid,
    tokens,
    uid: canonicalRecipientUid || recipientUid,
    targetUids,
  };
}

async function resolveRecipientTargets(chatId, senderUid) {
  const membersSnapshot = await admin
    .database()
    .ref(`chats/${chatId}/members`)
    .get();

  const members = membersSnapshot.val() || {};
  const recipientUids = Object.keys(members).filter(
    uid => members[uid] === true && uid !== senderUid,
  );

  const recipients = await Promise.all(
    recipientUids.map(async uid => ({
      uid,
      ...(await getRecipientInstallations(uid)),
    })),
  );

  return recipients
    .map(recipient => ({
      targetUids: recipient.targetUids,
      tokens: recipient.tokens,
      uid: recipient.uid,
    }))
    .filter(recipient => recipient.tokens.length > 0);
}

async function resolveLegacyRecipientTargets(chatId, senderUid, message) {
  const recipientUid = asString(message?.to);

  if (!recipientUid || recipientUid === senderUid) {
    return [];
  }

  const recipient = await getRecipientInstallations(recipientUid);

  if (!recipient.tokens.length) {
    functions.logger.info('Legacy fallback found no recipient tokens.', {
      chatId,
      recipientUid,
      senderUid,
    });
    return [];
  }

  return [
    {
      targetUids: recipient.targetUids,
      tokens: recipient.tokens,
      uid: recipient.uid,
    },
  ];
}

async function cleanupInvalidTokensForRecipient(recipientUids, invalidTokens) {
  if (!invalidTokens.length) {
    return;
  }

  const updates = {};
  const targetUids = dedupeTokens(
    Array.isArray(recipientUids) ? recipientUids : [recipientUids],
  );

  await Promise.all(
    targetUids.map(async recipientUid => {
      const [installationsSnapshot, legacyTokenSnapshot] = await Promise.all([
        admin.database().ref(`users/${recipientUid}/fcmTokens`).get(),
        admin.database().ref(`users/${recipientUid}/fcmToken`).get(),
      ]);

      const installations = installationsSnapshot.val() || {};
      const legacyToken = asString(legacyTokenSnapshot.val());

      Object.entries(installations).forEach(([installationId, installation]) => {
        const token = asString(installation?.token);

        if (invalidTokens.includes(token)) {
          updates[`users/${recipientUid}/fcmTokens/${installationId}`] = null;
        }
      });

      if (legacyToken && invalidTokens.includes(legacyToken)) {
        updates[`users/${recipientUid}/fcmToken`] = null;
      }
    }),
  );

  if (Object.keys(updates).length) {
    await admin.database().ref().update(updates);
  }
}

exports.onChatMessageCreated = functions
  .runWith(
    functionServiceAccount
      ? {serviceAccount: functionServiceAccount}
      : undefined,
  )
  .database
  .ref('/chats/{chatId}/messages/{messageId}')
  .onCreate(async (snapshot, context) => {
    const message = snapshot.val() || {};
    const chatId = context.params.chatId;
    const messageId = context.params.messageId;
    const senderUid = asString(message.from);

    if (!senderUid) {
      functions.logger.warn(
        'Skipping push send because sender UID is missing.',
        {
          chatId,
          messageId,
        },
      );
      return null;
    }

    const senderProfile = await getSenderProfile(senderUid);

    let recipients = await resolveRecipientTargets(chatId, senderUid);

    if (!recipients.length) {
      recipients = await resolveLegacyRecipientTargets(
        chatId,
        senderUid,
        message,
      );
    }

    if (!recipients.length) {
      functions.logger.info(
        'Skipping push send because no recipient tokens were found.',
        {
          chatId,
          messageId,
        },
      );
      return null;
    }

    await Promise.all(
      recipients.map(async recipient => {
        try {
          const response = await admin.messaging().sendEachForMulticast(
            buildMulticastMessage({
              chatId,
              message,
              messageId,
              senderProfile,
              tokens: recipient.tokens,
            }),
          );

          const invalidTokens = response.responses.reduce(
            (accumulator, sendResponse, index) => {
              const errorCode = sendResponse.error?.code;

              if (INVALID_TOKEN_CODES.has(errorCode)) {
                accumulator.push(recipient.tokens[index]);
              } else if (!sendResponse.success && errorCode) {
                functions.logger.error('Transient push delivery failure.', {
                  chatId,
                  errorCode,
                  messageId,
                  recipientUid: recipient.uid,
                  token: recipient.tokens[index],
                });
              }

              return accumulator;
            },
            [],
          );

          await cleanupInvalidTokensForRecipient(
            recipient.targetUids || recipient.uid,
            dedupeTokens(invalidTokens),
          );
        } catch (error) {
          functions.logger.error('Push send failed for recipient batch.', {
            chatId,
            messageId,
            recipientUid: recipient.uid,
            error: error?.message || error,
          });
        }
      }),
    );

    return null;
  });

exports.paymentGatewayConfig = paymentFunctions.paymentGatewayConfig;
exports.createGatewayOrder = paymentFunctions.createGatewayOrder;
exports.verifyGatewayPayment = paymentFunctions.verifyGatewayPayment;
exports.razorpayWebhook = paymentFunctions.razorpayWebhook;
