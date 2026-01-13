import React from 'react';
import { View, Text } from 'react-native';

const ROWCAm = ({ data }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        paddingBottom: 5,
      }}>
      {/* Reference ID Column */}
      <View style={{ width: 150, alignItems: 'center' }}>
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.referenceId}
        </Text>
      </View>

      {/* Name Column */}
      <View
        style={{
          width: 150,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.name}
        </Text>
      </View>

      {/* Relationship Column */}
      <View
        style={{
          width: 150,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.relationship}
        </Text>
      </View>

      {/* Knowing Since Column */}
      <View
        style={{
          width: 150,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.knowingSince}
        </Text>
      </View>

      {/* Mobile Number Column */}
      <View
        style={{
          width: 150,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.mobileNumber}
        </Text>
      </View>

      {/* Landline Number Column */}
      <View
        style={{
          width: 150,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.landLineNumber}
        </Text>
      </View>

      {/* Reference Check Column */}
      <View
        style={{
          width: 150,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.referenceCheck}
        </Text>
      </View>
    </View>
  );
};

export default ROWCAm;
