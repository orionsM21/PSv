import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import { getDatabase, ref, onValue, push, set, update, query, limitToLast } from 'firebase/database';
import { getApp } from '@react-native-firebase/app';
import {
  getDatabase,
  ref,
  onValue,
  push,
  set,
  update,
  query,
  limitToLast, increment
} from '@react-native-firebase/database';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
const ChatScreen = ({ route, navigation }) => {
  const { contact, } = route.params;
  // const currentUserPhone = auth().currentUser.uid;
  const currentUser = auth().currentUser;
  const currentUserPhone = currentUser?.uid;

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typingStatus, setTypingStatus] = useState(false);
  const [onlineStatus, setOnlineStatus] = useState(null);
  const flatListRef = useRef(null);
  // const db = getDatabase();
  const app = getApp();           // gets DEFAULT native app
  const db = getDatabase(app);    // database instance

  const getChatId = (uid1, uid2) =>
  [uid1, uid2].sort().join('_');

const chatId = getChatId(currentUserPhone, contact.uid);

  useEffect(() => {
    const presenceRef = ref(db, `presence/${currentUserPhone}`);

    set(presenceRef, { online: true });

    return () => {
      set(presenceRef, {
        online: false,
        lastSeen: Date.now(),
      });
    };
  }, [currentUserPhone]);
  useEffect(() => {
    const contactPresenceRef = ref(
      db,
      `presence/${contact.uid}`
    );

    const unsub = onValue(contactPresenceRef, snap => {
      setOnlineStatus(snap.val());
    });

    return unsub;
  }, [contact.uid]);
  useEffect(() => {
    (async () => {
      const token = await messaging().getToken();
      if (!token) return;

      const tokenRef = ref(db, `users/${currentUserPhone}/fcmToken`);
      onValue(tokenRef, snap => {
        if (snap.val() !== token) {
          set(tokenRef, token);
        }
      }, { onlyOnce: true });
    })();
  }, [currentUserPhone]);






  // 🔹 Typing indicator
  useEffect(() => {
    const typingRef = ref(db, `chats/${chatId}/typing/${contact.uid}`);
    const unsubscribe = onValue(typingRef, snap =>
      setTypingStatus(snap.val() === true)
    );
    return unsubscribe;
  }, [chatId, contact.uid]);

  // 🔹 Auto scroll
  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleTyping = useCallback(
    text => {
      setInput(text);
      set(ref(db, `chats/${chatId}/typing/${currentUserPhone}`), !!text);
    },
    [chatId, currentUserPhone]
  );


  const sendMessage = useCallback(async () => {
    if (!input.trim() || !currentUserPhone) return;

    const timestamp = Date.now();

    try {
      const messagesRef = ref(db, `chats/${chatId}/messages`);
      const metaRef = ref(db, `chatsMeta/${chatId}`);

      await push(messagesRef, {
        text: input.trim(),
        from: currentUserPhone,
        timestamp,
        status: 'sent',
      });

      await update(metaRef, {
        lastMessage: input.trim(),
        lastTimestamp: timestamp,
        participants: {
          [currentUserPhone]: true,
          [contact.uid]: true,
        },
      });

      await update(ref(db, `chatsMeta/${chatId}/unread`), {
        [contact.uid]: increment(1),
      });

      setInput('');
      set(ref(db, `chats/${chatId}/typing/${currentUserPhone}`), false);

    } catch (err) {
      console.error('❌ sendMessage failed:', err);
    }
  }, [chatId, currentUserPhone, input, contact.uid]);



  useEffect(() => {
    const unreadRef = ref(db, `chatsMeta/${chatId}/unread`);

    // Reset unread count when chat opens
    update(unreadRef, {
      [currentUserPhone]: 0,
    });
  }, [chatId, currentUserPhone]);

  useEffect(() => {
    const messagesRef = query(
      ref(db, `chats/${chatId}/messages`),
      limitToLast(100)
    );

    const unsubscribe = onValue(messagesRef, snapshot => {
      const data = snapshot.val();
      if (!data) {
        setMessages([]);
        return;
      }

      const msgArray = Object.entries(data).map(([id, msg]) => ({
        id,
        ...msg,
        fromMe: msg.from === currentUserPhone,
      }));

      setMessages(msgArray);

      msgArray.forEach(msg => {
        if (msg.from !== currentUserPhone && msg.status !== 'read') {
          update(ref(db, `chats/${chatId}/messages/${msg.id}`), {
            status: 'read',
          });
        }
      });
    });

    return unsubscribe;
  }, [chatId, currentUserPhone]);



  const renderMessage = useCallback(({ item }) => {
    const time = new Date(item.timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View
        style={[
          styles.messageBubble,
          item.fromMe ? styles.messageRight : styles.messageLeft,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <View style={styles.messageMeta}>
          <Text style={styles.timestamp}>{time}</Text>
          {item.fromMe && (
            <MaterialIcons
              name={item.status === 'read' ? 'done-all' : 'done'}
              size={16}
              color={item.status === 'read' ? '#34B7F1' : '#999'}
            />
          )}
        </View>
      </View>
    );
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navigation.goBack}>
          <MaterialIcons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>

        {contact.hasThumbnail ? (
          <Image source={{ uri: contact.thumbnailPath }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {(contact.givenName?.[0] || '') + (contact.familyName?.[0] || '')}
            </Text>
          </View>
        )}

        <View>
          <Text style={styles.headerTitle}>{contact.displayName}</Text>
          {typingStatus ? (
            <Text style={styles.typingIndicator}>typing...</Text>
          ) : (
            <Text style={styles.typingIndicator}>
              {onlineStatus?.online ? 'online' : 'last seen'}
            </Text>
          )}

        </View>
      </View>

      {/* MESSAGES */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* INPUT */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message"
          value={input}
          onChangeText={handleTyping}
          multiline
        />
        <TouchableOpacity onPress={sendMessage}>
          <MaterialIcons name="send" size={26} color="#075E54" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

export default ChatScreen;


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ECE5DD' },
  header: { height: 60, backgroundColor: '#075E54', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, marginHorizontal: 8 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#25D366', justifyContent: 'center', alignItems: 'center', marginHorizontal: 8 },
  avatarText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  typingIndicator: { color: '#D0E8D0', fontSize: 12 },
  messagesList: { paddingHorizontal: 10, paddingVertical: 10, flexGrow: 1 },
  messageBubble: { maxWidth: '70%', padding: 10, borderRadius: 20, marginVertical: 4 },
  messageLeft: {
    backgroundColor: '#DCF8C6',  // green background for sent messages (from current user)
    alignSelf: 'flex-start',
    borderTopLeftRadius: 0,
  },

  messageRight: {
    backgroundColor: 'white',  // white background for received messages
    alignSelf: 'flex-end',
    borderTopRightRadius: 0,
  },
  messageText: { fontSize: 16, lineHeight: 22 },
  messageMeta: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 4 },
  timestamp: { fontSize: 10, color: '#555', marginRight: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 8, paddingVertical: 6, backgroundColor: 'white' },
  input: { flex: 1, maxHeight: 100, fontSize: 16, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#F0F0F0', borderRadius: 20, marginHorizontal: 8 },
  iconButton: { padding: 6 },
});

