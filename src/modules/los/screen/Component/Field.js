import React from 'react';
import {View, Text, TextInput, StyleSheet, Dimensions} from 'react-native';

const FormField = ({label, value}) => (
  <View style={styles.formGroup}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} value={value || ''} editable={false} />
  </View>
);

const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: 'black',
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: 'black',
    width: width * 0.9,
    height: height * 0.05,
  },
});

export default FormField;
