const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.onNewMessage = functions.database
  .ref('/chats/{chatId}/messages/{msgId}')
  .onCreate(async (snapshot, context) => {
    const message = snapshot.val();
    const { chatId } = context.params;

    const senderUid = message.from;

    const chatMetaSnap = await admin
      .database()
      .ref(`chatsMeta/${chatId}/participants`)
      .once('value');

    const participants = chatMetaSnap.val();
    if (!participants) return null;

    // Find receiver UID
    const receiverUid = Object.keys(participants)
      .find(uid => uid !== senderUid);

    if (!receiverUid) return null;

    // Get receiver FCM token
    const tokenSnap = await admin
      .database()
      .ref(`users/${receiverUid}/fcmToken`)
      .once('value');

    const token = tokenSnap.val();
    if (!token) return null;

    // Send notification
    return admin.messaging().send({
      token,
      notification: {
        title: 'New Message',
        body: message.text,
      },
      data: {
        chatId,
        senderUid,
      },
    });
  });
