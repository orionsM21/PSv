import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import moment from "moment";
import { theme } from "../../../utility/Theme";

const DateTimeInput = ({ label, value, onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState("date");
  const [tempDate, setTempDate] = useState(null);

  // Step 1 → user taps field
  const openDatePicker = () => {
    setPickerMode("date");
    setShowPicker(true);
  };

  // Step 2 → user picks date → automatically open time picker
  const handleConfirm = (picked) => {
    if (pickerMode === "date") {
      setTempDate(picked);
      setPickerMode("time");
      setTimeout(() => setShowPicker(true), 350);
    } else {
      const final = new Date(tempDate);
      final.setHours(picked.getHours());
      final.setMinutes(picked.getMinutes());
      setShowPicker(false);
      onChange(final);
    }
  };

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={styles.label}>
        {label} <Text style={{ color: "red" }}>*</Text>
      </Text>

      <TouchableOpacity onPress={openDatePicker} activeOpacity={0.8}>
        <View style={styles.inputWrap}>
          <TextInput
            editable={false}
            placeholder="Select date & time"
            placeholderTextColor={theme.light.commentPlaceholder}
            style={styles.input}
            value={value ? moment(value).format("DD MMM YYYY, hh:mm A") : ""}
          />
          <Text style={styles.icon}>📅</Text>
        </View>
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={showPicker}
        mode={pickerMode}
        date={value || new Date()}
        minimumDate={new Date()}
        onConfirm={handleConfirm}
        onCancel={() => setShowPicker(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.light.black,
    marginBottom: 5,
  },
  inputWrap: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: theme.light.vanishModeText,
    borderRadius: 8,
    backgroundColor: "#fff",
    alignItems: "center",
    height: 50,
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: theme.light.black,
  },
  icon: {
    fontSize: 22,
    color: "#777",
    paddingHorizontal: 4,
  },
});

export default DateTimeInput;
