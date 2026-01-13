import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../modules/collection/screen/Dashboard';
import Allocation from '../modules/collection/screen/Allocation';

import Viaemail from '../modules/collection/screen/Viaemail';
import AuthLogin from '../modules/collection/screen/AuthLogin';
import Forgotpassword from '../modules/collection/screen/Forgotpassword';
import Deposition from '../modules/collection/screen/Deposition';
import Incentive from '../modules/collection/screen/Incentive';
import CaseDetails from '../modules/collection/screen/CaseDetails';
import PTP from '../modules/collection/screen/PTP';
import RepaymentInfo from '../modules/collection/screen/RepaymentInfo';
import EventHistory from '../modules/collection/screen/EventHistory';
import Dispute from '../modules/collection/screen/Dispute';
import RaiseException from '../modules/collection/screen/RaiseException';
import Requet from '../modules/collection/screen/Requet';
import ApplicationData from '../modules/collection/screen/ApplicationData';
import ContactCentreScreen from '../modules/collection/screen/ContactCenter';
import CallSummary from '../modules/collection/screen/CallSummary';
import CollateralDetails from '../modules/collection/screen/CollateralDetails';
import ViewPTP from '../modules/collection/screen/ViewPTP';
import ViewPaymentScreen from '../modules/collection/screen/ViewPayment/ViewPaymentScreen';
import ViewDispute from '../modules/collection/screen/ViewPayment/ViewDispute';
import ViewReuest from '../modules/collection/screen/ViewPayment/ViewReuest';
import ViewException from '../modules/collection/screen/ViewPayment/ViewException';
import AddDeposition from '../modules/collection/screen/AddDeposition';
import DepositionHistory from '../modules/collection/screen/DepositionHistory';
import FollowUpDueForToday from '../modules/collection/screen/FollowUpDueForToday';
import OnlineUserList from '../modules/collection/screen/LiveTracking/OnlineUserList';
import OfflineUserList from '../modules/collection/screen/LiveTracking/OfflineUserList';
import OfflineSelectedUserdetailsMap from '../modules/collection/screen/LiveTracking/OfflineSelectedUserdetailsMap';
import OnlineSelectedUserdetailsMap from '../modules/collection/screen/LiveTracking/OnlineSelectedUserdetailsMap';
import MyVisit from '../modules/collection/screen/MyVisit/MyVisit';
import ScheduleVisit from '../modules/collection/screen/ScheduleVisit/ScheduleVisit';
import Payment from '../modules/collection/screen/Payment/Payment';
import Livetracking from '../modules/collection/screen/LiveTracking/Livetracking';
import { useSelector } from 'react-redux';
import CollectionLogin from '../modules/collection/screen/CollectionLogin';



const Stack = createNativeStackNavigator();

export default function CollectionNavigator() {
  const { isLoggedIn, userHydrated } = useSelector(state => state.module);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

      {/* 🔹 NOT LOGGED IN */}
      {/* {!isLoggedIn && (
        <>
          <Stack.Screen name="AuthLogin" component={AuthLogin} />
          <Stack.Screen name="CollectionLogin" component={CollectionLogin} />
        </>
      )} */}

      {/* 🔹 LOGGED IN BUT NOT HYDRATED */}
      {/* {isLoggedIn && !userHydrated && (
        <Stack.Screen name="AuthLogin" component={AuthLogin} />
      )} */}

      {/* 🔹 LOGGED IN + HYDRATED */}
      {/* {isLoggedIn && userHydrated && (
        <>
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Allocation" component={Allocation} />

        </>
      )} */}


      {/* {!isLoggedIn || !userHydrated ? (
        <>
          <Stack.Screen name="AuthLogin" component={AuthLogin} />
          <Stack.Screen name="CollectionLogin" component={CollectionLogin} />
        </>
      ) : ( */}

      {!isLoggedIn && (
        <>
          <Stack.Screen name="AuthLoginCollection" component={AuthLogin} />
          <Stack.Screen name="CollectionLogin" component={CollectionLogin} />
        </>
      )}


      {isLoggedIn && !userHydrated && (
        <>
          <Stack.Screen name="AuthLoginCollection" component={AuthLogin} />
          {/* other screens */}
        </>
      )}
      {isLoggedIn && (
        <>


          <Stack.Screen name="AuthLogin" component={AuthLogin} />
          <Stack.Screen name="CollectionLogin" component={CollectionLogin} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Allocation" component={Allocation} />
          <Stack.Screen name="Deposition" component={Deposition} />

          <Stack.Screen name="AuthLoading" component={AuthLogin} />

          <Stack.Screen name="Forgotpassword" component={Forgotpassword} />
          <Stack.Screen name="Viaemail" component={Viaemail} />

          {/* Dashboard + App Screens */}

          <Stack.Screen name="Livetracking" component={Livetracking} />

          {/* Support */}
          <Stack.Screen name="MyVisits" component={MyVisit} options={{ headerShown: true }} />
          <Stack.Screen name="Incentive" component={Incentive} />
          <Stack.Screen name="CaseDetails" component={CaseDetails} options={{ headerShown: true }} />
          <Stack.Screen name="ScheduleVisit" component={ScheduleVisit} options={{ headerShown: true }} />
          <Stack.Screen name="PTP" component={PTP} options={{ headerShown: true }} />
          <Stack.Screen name="Payment" component={Payment} options={{ headerShown: true }} />
          <Stack.Screen name="RepaymentInfo" component={RepaymentInfo} options={{ headerShown: true }} />
          <Stack.Screen name="EventHistory" component={EventHistory} options={{ headerShown: true }} />
          <Stack.Screen name="Dispute" component={Dispute} options={{ headerShown: true }} />
          <Stack.Screen name="RaiseException" component={RaiseException} options={{ headerShown: true }} />
          <Stack.Screen name="Requet" component={Requet} options={{ headerShown: true }} />
          <Stack.Screen
            name="ApplicationData"
            component={ApplicationData}
            options={({ route }) => ({
              headerShown: true,
              title:
                route?.params?.section === "application"
                  ? "Application Data"
                  : route?.params?.section === "loanhistory"
                    ? "Loan History"
                    : "Application Data",
            })}
          />
          <Stack.Screen name="ContactCenter" component={ContactCentreScreen} options={{ headerShown: true }} />
          <Stack.Screen name="CallSummary" component={CallSummary} options={{ headerShown: true }} />
          <Stack.Screen name="CollateralDetails" component={CollateralDetails} options={{ headerShown: true }} />
          <Stack.Screen name="ViewPTP" component={ViewPTP} options={{ headerShown: true }} />
          <Stack.Screen name="ViewPaymentScreen" component={ViewPaymentScreen} options={{ headerShown: true }} />
          <Stack.Screen name="ViewDispute" component={ViewDispute} options={{ headerShown: true }} />
          <Stack.Screen name="ViewRequest" component={ViewReuest} options={{ headerShown: true }} />
          <Stack.Screen name="ViewException" component={ViewException} options={{ headerShown: true }} />
          <Stack.Screen name="PaymentDeposition" component={AddDeposition} options={{ headerShown: true }} />
          <Stack.Screen name="DepositionHistory" component={DepositionHistory} options={{ headerShown: true }} />
          <Stack.Screen name="FollowUpDueForToday" component={FollowUpDueForToday} options={{ headerShown: true }} />


          <Stack.Screen name="OnlineUserList" component={OnlineUserList} options={{ headerShown: true }} />

          <Stack.Screen name="OfflineUserList" component={OfflineUserList} options={{ headerShown: true }} />
          <Stack.Screen name="OfflineSelectedUserdetailsMap" component={OfflineSelectedUserdetailsMap} options={{ headerShown: true }} />
          <Stack.Screen name="OnlineSelectedUserdetailsMap" component={OnlineSelectedUserdetailsMap} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}


// import React from 'react';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import { useSelector } from 'react-redux';

// import AuthLogin from '../modules/collection/screen/AuthLogin';
// import CollectionLogin from '../modules/collection/screen/CollectionLogin';

// import Dashboard from '../modules/collection/screen/Dashboard';
// import Allocation from '../modules/collection/screen/Allocation';
// import Deposition from '../modules/collection/screen/Deposition';
// // import rest...

// const Stack = createNativeStackNavigator();

// export default function CollectionNavigator() {
//   const { isLoggedIn, userHydrated } = useSelector(state => state.module);

//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>

//       {/* 🔐 AUTH FLOW */}
//       {!isLoggedIn || !userHydrated ? (
//         <>
//           <Stack.Screen name="AuthLogin" component={AuthLogin} />
//           <Stack.Screen name="CollectionLogin" component={CollectionLogin} />
//         </>
//       ) : (
//         <>
//           {/* 🏠 APP FLOW */}
//           <Stack.Screen name="Dashboard" component={Dashboard} />
//           <Stack.Screen name="Allocation" component={Allocation} />
//           <Stack.Screen name="Deposition" component={Deposition} />
//           {/* all other screens */}
//         </>
//       )}

//     </Stack.Navigator>
//   );
// }
