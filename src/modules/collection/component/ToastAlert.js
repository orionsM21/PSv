import React, { useState } from 'react';
import { View, Text, Button, Image, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { dpforWidth } from '../utility/Responsive';
// import { dpforWidth } from '../utility/Responsive';


const ToastNotification = ({ isModalVisible, type, header, body }) => {
  // const [isModalVisible, setIsModalVisible] = useState(false);
  return (
    <Modal
      isVisible={isModalVisible}
      animationIn="slideInRight"
      animationOut="slideOutLeft"
      backdropOpacity={0}
    >
      <View
        style={
          type === 'SUCCESS'
            ? {
              borderRadius: 10,
              flexDirection: 'row',
              height: '10%',
              width: dpforWidth(90),
              marginTop: 'auto',
              alignItems: 'center',
              backgroundColor: "#A3F7BF",
            }
            : {
              borderRadius: 10,
              flexDirection: 'row',
              height: '10%',
              width: dpforWidth(90),
              marginTop: 'auto',
              alignItems: 'center',
              backgroundColor: '#FDA3AB',
            }
        }>
        <View
          style={{
            width: 20,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        />
        <Image
          source={
            type === 'SUCCESS'
              ? require('../../../asset/icon/success.png')
              : require('../../../asset/icon/error.png')
          }
          style={[styles.image]}
        />
        <View style={styles.wrapper}>
          <Text style={styles.header}>{header}</Text>
          <Text style={styles.body} numberOfLines={2}>{body}</Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  image: {
    height: 50,
    width: 50,
  },
  wrapper: {
    flex: 1,
    marginLeft: 10,
  },
  header: {
    // flex: 1,
    color: '#001D56',
    fontSize: 18,
    fontWeight: '700',
  },
  body: {
    color: '#001D56',
    // flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ToastNotification;