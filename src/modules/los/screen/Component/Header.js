import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { scale, verticalScale, moderateScale } from 'react-native-size-matters';

const Header = ({ title, onMenuPress }) => {
  console.log(onMenuPress, 'onMenuPressonMenuPress')
  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar
        translucent
        backgroundColor="#2196F3"
        barStyle="light-content"
      />
      <View style={styles.header}>
        <TouchableOpacity onPress={onMenuPress} style={styles.iconWrapper}>
          <Image
            source={require('../../asset/menus.png')}
            style={styles.drawerIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  /* 🟦 Safe Container ensures header never overlaps status bar or notch */
  safeContainer: {
    backgroundColor: '#2196F3',
  },

  /* 🧩 Header main layout */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(10),

    // ✅ Add top padding only for Android
    paddingTop:
      Platform.OS === 'android' ? StatusBar.currentHeight || verticalScale(10) : 0,

    // ✅ Elevation and shadow for clean look
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  iconWrapper: {
    padding: scale(5),
  },

  drawerIcon: {
    width: scale(24),
    height: scale(24),
    resizeMode: 'contain',
    tintColor: '#fff',
  },

  headerTitle: {
    color: '#fff',
    fontSize: moderateScale(18),
    fontWeight: '700',
    marginLeft: scale(10),
    flexShrink: 1,
  },
});

export default Header;
