import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

import { ENV_OPTIONS } from '../config/envConfig';
import { setBaseUrl, getBaseUrl } from '../config/baseUrlManager';

const AdminConfigScreen = () => {
  const [selectedEnv, setSelectedEnv] = useState('UAT');
  const [baseUrl, setBaseUrlInput] = useState('');

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    const url = await getBaseUrl();
    setBaseUrlInput(url);
  };

  const onEnvChange = (envValue) => {
    setSelectedEnv(envValue);

    const envConfig = ENV_OPTIONS.find(
      (env) => env.value === envValue
    );

    if (envConfig) {
      setBaseUrlInput(envConfig.baseUrl);
    }
  };

  const saveConfig = async () => {
    try {
      await setBaseUrl(baseUrl);

      Alert.alert(
        'Success',
        `Base URL updated for ${selectedEnv}`
      );
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Configuration</Text>

      <Text style={styles.label}>Environment</Text>
      <Picker
        selectedValue={selectedEnv}
        onValueChange={onEnvChange}
      >
        {ENV_OPTIONS.map((env) => (
          <Picker.Item
            key={env.value}
            label={env.label}
            value={env.value}
          />
        ))}
      </Picker>

      <Text style={styles.label}>Base URL</Text>
      <TextInput
        value={baseUrl}
        onChangeText={setBaseUrlInput}
        autoCapitalize="none"
        style={styles.input}
      />

      <Button title="Save Configuration" onPress={saveConfig} />
    </View>
  );
};

export default AdminConfigScreen;

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  label: { marginTop: 12, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 16,
  },
});
