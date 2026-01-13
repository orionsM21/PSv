// src/components/modals/controls/SectionTitle.js
import React from "react";
import { Text } from "react-native";

export default function SectionTitle({ title }) {
  return (
    <Text
      style={{
        marginTop: 14,
        fontSize: 16,
        fontWeight: "600",
        color: "#444",
        marginHorizontal: 10,
      }}>
      {title}
    </Text>
  );
}
