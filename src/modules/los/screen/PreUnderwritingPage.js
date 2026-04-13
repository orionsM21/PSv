import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import PreUnderWriterDashboard from './PreUnderWritingpages/preunderWriterDashboard.js';

import { useDispatch } from 'react-redux';


import { saveUserDetails } from '../../../redux/actions.js';
import LosSupportCustomDrawer from '../losSupportCustomDrawer.cjs';
import { losThemes } from '../theme/losTheme.js';


const PreUnderwritingPage = ({ route }) => {
  const dispatch = useDispatch();
  const userDetail = route?.params;

  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    if (userDetail?.userDetail) {
      dispatch(saveUserDetails(userDetail.userDetail));
    }
  }, [userDetail, dispatch]);

  const toggleDrawer = () => setDrawerVisible(prev => !prev);

  return (
    <View style={{ flex: 1, backgroundColor: losThemes.creditCommand.pageBackground }}>
      {/* Main Content */}
      <View style={{ flex: 1 }}>
        <PreUnderWriterDashboard userDetail={userDetail} openDrawer={toggleDrawer} />
      </View>

      {/* Drawer */}
      {drawerVisible && (
        <View style={styles.drawerWrapper}>
          <LosSupportCustomDrawer closeDrawer={toggleDrawer} isDrawerVisible={drawerVisible} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  drawerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Dimmed background
    zIndex: 1000,
  },
});

export default PreUnderwritingPage;
