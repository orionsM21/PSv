import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';

const UserScreen = () => {
  const navigation = useNavigation();

  const user = {
    name: 'Shivam Mishra',
    email: 'shivam@example.com',
    phone: '+91 ••••• 43210',
    joined: '15 Jan 2024',
    avatar: 'https://i.pravatar.cc/150?img=3',
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            // navigation.replace('PaymentLogin');
          },
        },
      ]
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      {/* ===== HEADER ===== */}
      {/* <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View> */}

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== PROFILE CARD ===== */}
        <View style={styles.profileCard}>
          <Image source={{ uri: user.avatar }} style={styles.avatar} />

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.phone}>{user.phone}</Text>
        </View>

        {/* ===== ACCOUNT INFO ===== */}
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoRow}>
          <Entypo name="calendar" size={18} color="#475569" />
          <Text style={styles.infoText}>Member since {user.joined}</Text>
        </View>

        {/* ===== SECURITY ACTIONS ===== */}
        <Text style={styles.sectionTitle}>Security</Text>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="lock-closed-outline" size={20} color="#2563EB" />
          <Text style={styles.actionText}>Change Password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <Ionicons name="finger-print-outline" size={20} color="#2563EB" />
          <Text style={styles.actionText}>Enable Biometric Login</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionCard}>
          <MaterialIcons name="security" size={20} color="#2563EB" />
          <Text style={styles.actionText}>Manage Login Devices</Text>
        </TouchableOpacity>

        {/* ===== LOGOUT ===== */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="exit-outline" size={20} color="#DC2626" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* ===== RBI DISCLAIMER ===== */}
        <Text style={styles.disclaimer}>
          Your personal data is encrypted and secured as per RBI guidelines.
        </Text>
      </ScrollView>
    </>
  );
};

export default UserScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
  },

  /* ===== HEADER ===== */
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },

  /* ===== PROFILE ===== */
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  email: {
    fontSize: 14,
    color: '#475569',
    marginTop: 2,
  },
  phone: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },

  /* ===== SECTIONS ===== */
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 12,
  },

  /* ===== INFO ===== */
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#0F172A',
  },

  /* ===== ACTIONS ===== */
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
    elevation: 2,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* ===== LOGOUT ===== */
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginTop: 12,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },

  /* ===== DISCLAIMER ===== */
  disclaimer: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 28,
  },
});

