import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {modalStyles} from './ModalStyles';

export default function ModalHeader({title, subtitle, onClear}) {
  return (
    <View style={modalStyles.header}>
      <View style={modalStyles.titleWrap}>
        <Text style={modalStyles.title}>{title}</Text>
        {subtitle ? <Text style={modalStyles.subtitle}>{subtitle}</Text> : null}
      </View>

      {onClear ? (
        <TouchableOpacity onPress={onClear} style={modalStyles.clearButton}>
          <Text style={modalStyles.clearButtonText}>Clear all</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
