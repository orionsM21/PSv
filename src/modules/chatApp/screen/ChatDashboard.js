import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  PermissionsAndroid,
  Platform,
} from "react-native";
import Contacts from "react-native-contacts";
import auth from "@react-native-firebase/auth";
import { getDatabase, ref, onValue } from "@react-native-firebase/database";
import { getApp } from "@react-native-firebase/app";
import { useNavigation } from "@react-navigation/native";

/* 🔹 STRONG PHONE NORMALIZER */
const normalizePhone = (phone = "") => {
  let p = phone.replace(/\D/g, ""); // remove spaces, symbols

  // remove leading 0 (09123456789 → 9123456789)
  if (p.length === 11 && p.startsWith("0")) {
    p = p.slice(1);
  }

  // remove +91 only if length > 10
  if (p.length > 10 && p.startsWith("91")) {
    p = p.slice(-10);
  }

  return p;
};


const ChatDashboard = () => {
  const navigation = useNavigation();
  const currentUid = auth().currentUser?.uid;

  const [firebaseUsers, setFirebaseUsers] = useState({});
  console.log(firebaseUsers, 'firebaseUsersfirebaseUsers')
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");

  /* 🔹 REQUEST CONTACT PERMISSION */
  const requestPermission = async () => {
    if (Platform.OS !== "android") return true;

    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  };

  /* 🔹 LOAD FIREBASE USERS */
  /* 🔹 LOAD FIREBASE USERS (PUBLIC DIRECTORY) */
  useEffect(() => {
    const db = getDatabase(getApp());

    return onValue(ref(db, "publicUsers"), snap => {
      const data = snap.val() || {};
      console.log("🔥 publicUsers:", data);
      setFirebaseUsers(data);
    });
  }, []);

  /* 🔹 LOAD CONTACTS */
  useEffect(() => {
    (async () => {
      const ok = await requestPermission();
      if (!ok) return;

      const list = await Contacts.getAll();
      console.log("📱 Contacts:", list);
      setContacts(list);
    })();
  }, []);

  /* 🔹 MATCH CONTACTS WITH FIREBASE USERS */
  const matchedUsers = useMemo(() => {
    const phoneToUid = {};

    Object.entries(firebaseUsers).forEach(([uid, u]) => {
      if (u.phone) {
        phoneToUid[normalizePhone(u.phone)] = uid;
      }
    });

    console.log("📘 phoneToUid map:", firebaseUsers, phoneToUid);

    return contacts
      .map(contact => {
        const phones = contact.phoneNumbers || [];

        for (let p of phones) {
          const normalized = normalizePhone(p.number);
          const uid = phoneToUid[normalized];

          console.log(
            "🔍 Checking:",
            contact.displayName,
            normalized,
            uid
          );

          if (uid && uid !== currentUid) {
            return {
              uid,
              name: contact.displayName || "Unknown",
              avatar: contact.thumbnailPath,
            };
          }
        }
        return null;
      })
      .filter(Boolean)
      .filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase())
      );
  }, [contacts, firebaseUsers, currentUid, search]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />

      <FlatList
        data={matchedUsers}
        keyExtractor={item => item.uid}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate("chat", {
                contact: {
                  uid: item.uid,
                  displayName: item.name,
                },
              })
            }
          >
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>
                  {item.name[0]}
                </Text>
              </View>
            )}
            <Text style={styles.name}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No users found</Text>
        }
      />
    </View>
  );
};

export default ChatDashboard;

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  search: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarFallback: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4CAF50",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "bold" },
  name: { fontSize: 16, fontWeight: "500" },
  empty: {
    textAlign: "center",
    marginTop: 40,
    color: "#999",
  },
});
