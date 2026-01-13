// screens/SettingsScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import DeviceInfo from 'react-native-device-info';

const UPDATE_URL = 'http://110.227.248.230:5567/updates/updates.json';

const SettingsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const checkForUpdates = async () => {
    setLoading(true);
    try {
      const res = await fetch(UPDATE_URL);
      const meta = await res.json();
      const current = parseInt(DeviceInfo.getBuildNumber());
      const latest = parseInt(meta.latestVersionCode);
      if (latest > current) {
        setResult('✅ Update available: ' + meta.latestVersionName);
      } else {
        setResult('🟢 You are using the latest version.');
      }
    } catch (e) {
      setResult('❌ Update check failed: ' + e.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>App Settings</Text>
      <Text style={styles.version}>Version: {DeviceInfo.getVersion()}</Text>

      <TouchableOpacity style={styles.button} onPress={checkForUpdates}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Check for Updates</Text>}
      </TouchableOpacity>

      {result && <Text style={styles.result}>{result}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  version: { fontSize: 16, marginBottom: 20 },
  button: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  result: { marginTop: 15, fontSize: 15, color: '#333', textAlign: 'center' },
});

export default SettingsScreen;
