import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';
import {RadioButton} from 'react-native-paper';
import {modalStyles} from './ModalStyles';
import ModalHeader from './Modalheadr';

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
      backdropOpacity={0.35}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      style={modalStyles.sheet}>
      <View style={modalStyles.wrapper}>
        <View style={modalStyles.handle} />
        <ModalHeader
          title="Sort cases"
          subtitle="Choose how the visible allocation list should be ordered."
        />

        <RadioButton.Group
          onValueChange={value => setSortType(String(value))}
          value={String(sortType)}>
          {options.map(({label, value}) => {
            const selected = String(sortType) === String(value);

            return (
              <TouchableOpacity
                key={value}
                style={[
                  modalStyles.radioRow,
                  selected && modalStyles.radioRowActive,
                ]}
                onPress={() => setSortType(String(value))}>
                <RadioButton
                  value={String(value)}
                  color="#0B2D6C"
                  uncheckedColor="#8CA4C8"
                />
                <Text style={modalStyles.radioLabel}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </RadioButton.Group>

        <View style={modalStyles.buttonRow}>
          <TouchableOpacity
            style={modalStyles.buttonSecondary}
            onPress={onClose}>
            <Text style={modalStyles.buttonTextSecondary}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.buttonPrimary} onPress={onApply}>
            <Text style={modalStyles.buttonTextPrimary}>Apply</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
