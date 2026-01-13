// src/components/modals/ModalHeader.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { modalStyles } from "./ModalStyles";

export default function ModalHeader({ title, onClear }) {
  return (
    <View style={modalStyles.header}>
      <Text style={modalStyles.title}>{title}</Text>

      {onClear && (
        <TouchableOpacity onPress={onClear}>
          <View
            style={{
              backgroundColor: "#001D56",
              paddingVertical: 6,
              paddingHorizontal: 12,
              borderRadius: 6,
            }}>
            <Text
              style={{
                color: "#fff",
                fontWeight: "600",
                fontSize: 12,
              }}>
              Clear Filter
            </Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
}
