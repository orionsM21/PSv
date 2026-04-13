import React, { memo } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const RenderInput = memo(
  ({ label, value, isValid, editable, multiline, isDynamicHeight, dynamicHeight }) => {
    const computedValue = value ?? '';

    return (
      <View style={styles.fieldContainer}>
        <View style={styles.labelWrapper}>
          <Text style={styles.labelText} numberOfLines={2} ellipsizeMode="tail">
            {label}
          </Text>
          {isValid && (
            <Image
              source={require('../../asset/greencheck.png')}
              style={styles.checkIcon}
              resizeMode="contain"
            />
          )}
        </View>

        <TextInput
          style={[
            styles.inputBox,
            multiline && styles.inputMultiline,
            isDynamicHeight && { height: dynamicHeight },
            !editable && styles.inputDisabled,
          ]}
          value={String(computedValue)}
          editable={editable}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          placeholderTextColor="#999"
        />
      </View>
    );
  }
);

const DetailsSection = ({ fields }) => {
  return (
    <FlatList
      data={fields}
      keyExtractor={(item, index) => `${item.label}-${index}`}
      renderItem={({ item }) => <RenderInput {...item} />}
      numColumns={2}
      contentContainerStyle={styles.container}
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={styles.rowWrap}
    />
  );
};

export default memo(DetailsSection);

const styles = StyleSheet.create({
  container: {
    // marginTop: 8,
    // alignItems: 'center',
    padding: 5,
    // backgroundColor:'red',

  },

  rowWrap: {
    justifyContent: 'space-between',
    width: '100%',
  },

  fieldContainer: {
    width: (width - 60) / 2, // ✅ 2 items per row (10+10 padding + spacing)
    // backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 5,
    // padding: ,
    // borderWidth: 1,
    // borderColor: '#E5E7EB',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.05,
    // shadowRadius: 2,
    // elevation: 1,
  },

  labelWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 4,
  },

  labelText: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    flexShrink: 1,
  },

  checkIcon: {
    width: 14,
    height: 14,
    marginLeft: 4,
    tintColor: '#22C55E',
  },

  inputBox: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#111827',
    backgroundColor: '#F9FAFB',
    minHeight: height * 0.045,
    flexWrap: 'wrap',
  },

  inputMultiline: {
    minHeight: height * 0.085,
     textAlignVertical: 'center',
  },

  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
});
