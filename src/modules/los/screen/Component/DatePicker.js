import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';

const DatePickerField = ({label, value, onPress, editable = false}) => {
  return (
    <View style={styles.datePickerRow}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.touchableOpacity} onPress={onPress}>
        <TextInput
          style={styles.inputRow}
          value={value}
          editable={editable} // Default is false
        />
        <Image
          source={require('../../asset/calendar.png')}
          style={styles.calendarIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  datePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    // marginVertical: 8,
  },
  label: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  touchableOpacity: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    // padding: 10,
  },
  inputRow: {
    flex: 1,
    color: 'black',
  },
  calendarIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
});

export default DatePickerField;
