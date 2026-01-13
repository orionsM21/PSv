// src/components/modals/SortModal.js
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Modal from "react-native-modal";
import { RadioButton } from "react-native-paper";
import { modalStyles } from "./ModalStyles";
import ModalHeader from "./Modalheadr";

export default function SortModal({
  visible,
  onClose,
  sortType,
  setSortType,
  onApply,
  options,
}) {

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.4}
      animationIn="fadeInUp"
      animationOut="fadeOutDown"
    >
      <View style={modalStyles.wrapper}>

        <ModalHeader title="Sort" />

        <RadioButton.Group
          onValueChange={(v) => setSortType(String(v))}
          value={String(sortType)}
        >
          {options.map(({ label, value }) => (
            <TouchableOpacity
              key={value}
              style={modalStyles.radioRow}
              onPress={() => setSortType(String(value))}
            >
              <RadioButton value={String(value)} />
              <Text style={modalStyles.radioLabel}>{label}</Text>
            </TouchableOpacity>
          ))}
        </RadioButton.Group>

        <View style={modalStyles.buttonRow}>
          <TouchableOpacity
            style={modalStyles.buttonSecondary}
            onPress={onClose}
          >
            <Text style={modalStyles.buttonTextSecondary}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={modalStyles.buttonPrimary}
            onPress={onApply}
          >
            <Text style={modalStyles.buttonTextPrimary}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
