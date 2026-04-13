import React from 'react';
import { View, Text } from 'react-native';

const TableRowAmort = ({ data }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'flex-start',
        // marginBottom: 10,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        paddingBottom: 5,
      }}
    >
      {/* Due Date Column */}
      <View style={{ width: 160, alignItems: 'center' }}>
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.description}
        </Text>
      </View>

      {/* EMI Column */}
      <View
        style={{
          width: 160,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.stage}
        </Text>
      </View>

      {/* Interest Column */}
      <View
        style={{
          width: 160,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.type}
        </Text>
      </View>

      {/* Principal Column */}
      <View
        style={{
          width: 160,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.status}
        </Text>
      </View>

      {/* Opening Balance Column */}
      <View
        style={{
          width: 160,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.user}
        </Text>
      </View>

      {/* Closing Balance Column */}
      <View
        style={{
          width: 160,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.closingBalance}
        </Text>
      </View>

      {/* Disbursement Amount Column */}
      <View
        style={{
          width: 160,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.disbursementAmount}
        </Text>
      </View>

      {/* Specifier Column */}
      <View
        style={{
          width: 160,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.specifier}
        </Text>
      </View>

      {/* Tenor Column */}
      <View
        style={{
          width: 160,
          alignItems: 'center',
          borderLeftWidth: 1,
          borderLeftColor: '#ddd',
          paddingLeft: 10,
        }}
      >
        <Text style={{ fontWeight: 'normal', color: 'black', fontSize: 12 }}>
          {data.tenor}
        </Text>
      </View>
    </View>
  );
};

export default TableRowAmort;
