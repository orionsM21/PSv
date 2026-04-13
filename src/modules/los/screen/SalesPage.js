

import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useDispatch } from 'react-redux';
import SalesDashboard from './Sales/SalesDashboard';
import { saveUserDetails } from '../../../redux/actions';
import { losThemes } from '../theme/losTheme.js';

const SalesPage = ({ route }) => {
  const dispatch = useDispatch();
  const userDetail = route?.params;

  useEffect(() => {
    if (userDetail?.userDetail) {
      dispatch(saveUserDetails(userDetail.userDetail));
    }
  }, [userDetail, dispatch]);

  return (
    <View style={{ flex: 1, backgroundColor: losThemes.salesCommand.pageBackground }}>
      <SalesDashboard />
    </View>
  );
};

export default SalesPage;
