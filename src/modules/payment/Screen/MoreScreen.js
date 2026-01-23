import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

const MoreScreen = () => {
  const navigation = useNavigation();

  const confirmLogout = () => {
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
      ],
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* ===== SECURITY ===== */}
      <Text style={styles.sectionTitle}>Security</Text>

      <Option
        icon="lock-reset"
        label="Change Password"
        onPress={() => {}}
      />
      <Option
        icon="fingerprint"
        label="Biometric Login"
        onPress={() => {}}
      />
      <Option
        icon="shield-account"
        label="Manage Devices"
        onPress={() => {}}
      />

      {/* ===== PREFERENCES ===== */}
      <Text style={styles.sectionTitle}>Preferences</Text>

      <Option
        icon="theme-light-dark"
        label="Dark Mode"
        onPress={() => {}}
      />
      <Option
        icon="translate"
        label="Language"
        onPress={() => {}}
      />

      {/* ===== SUPPORT ===== */}
      <Text style={styles.sectionTitle}>Support</Text>

      <Option
        icon="headset"
        label="Contact Support"
        onPress={() => {}}
      />
      <Option
        icon="information-outline"
        label="About App"
        onPress={() => {}}
      />

      {/* ===== LEGAL ===== */}
      <Text style={styles.sectionTitle}>Legal</Text>

      <Option
        icon="file-document-outline"
        label="Privacy Policy"
        onPress={() => {}}
      />
      <Option
        icon="file-certificate-outline"
        label="Terms & Conditions"
        onPress={() => {}}
      />

      {/* ===== LOGOUT ===== */}
      <TouchableOpacity
        style={styles.logoutCard}
        onPress={confirmLogout}
      >
        <Icon name="logout" size={22} color="#DC2626" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* ===== RBI DISCLAIMER ===== */}
      <Text style={styles.disclaimer}>
        This application follows RBI-mandated security and privacy standards.
      </Text>
    </ScrollView>
  );
};

export default MoreScreen;

/* ================== OPTION ITEM ================== */

const Option = ({ icon, label, onPress }) => (
  <TouchableOpacity
    style={styles.optionCard}
    activeOpacity={0.8}
    onPress={onPress}
  >
    <Icon name={icon} size={22} color="#2563EB" />
    <Text style={styles.label}>{label}</Text>
    <Icon
      name="chevron-right"
      size={22}
      color="#94A3B8"
      style={{ marginLeft: 'auto' }}
    />
  </TouchableOpacity>
);

/* ================== STYLES ================== */

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F8FAFC',
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 24,
    marginBottom: 10,
  },

  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#0F172A',
  },

  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginTop: 24,
  },

  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },

  disclaimer: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 28,
    marginBottom: 12,
  },
});
