// src/components/modals/controls/RangeInput.js
import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

export default function RangeInput({
  label,
  enabled,
  setEnabled,
  min,
  max,
  setMin,
  setMax,
}) {
  return (
    <View style={{ flexDirection: "row", marginVertical: 6 }}>
      <TouchableOpacity
        onPress={() => setEnabled(!enabled)}
        style={{
          width: 100,
          paddingVertical: 6,
          marginTop: 8,
          borderRadius: 8,
          backgroundColor: enabled ? "#001D56" : "#eee",
          margin: 10,
          alignItems: "center",
          justifyContent: "center",
        }}>
        <Text style={{ color: enabled ? "#fff" : "#000", fontWeight: "500" }}>
          {label}
        </Text>
      </TouchableOpacity>

      <View style={{ flex: 1, flexDirection: "row", marginHorizontal: 10 }}>
        <TextInput
          placeholder="Min"
          placeholderTextColor="#888"
          keyboardType="numeric"
          editable={enabled}
          value={min}
          onChangeText={setMin}
          style={{
            flex: 1,
            marginRight: 8,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: "#aaa",
            backgroundColor: enabled ? "#fff" : "#eee",
            paddingLeft: 12,
          }}
        />

        <TextInput
          placeholder="Max"
          placeholderTextColor="#888"
          keyboardType="numeric"
          editable={enabled}
          value={max}
          onChangeText={setMax}
          style={{
            flex: 1,
            marginLeft: 8,
            borderWidth: 1,
            borderRadius: 8,
            borderColor: "#aaa",
            backgroundColor: enabled ? "#fff" : "#eee",
            paddingLeft: 12,
          }}
        />
      </View>
    </View>
  );
}
