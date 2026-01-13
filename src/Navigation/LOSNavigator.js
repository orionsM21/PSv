import React, { useContext } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import CreditWorkList from '../modules/los/screen/PreUnderWritingpages/CreditWorklist.js';
import InitiateverficationProcess from '../modules/los/screen/PreUnderWritingpages/initiateverficationProcess.js';

import InitaiateRCUProcess from '../modules/los/screen/PreUnderWritingpages/InitiateRCUProcess.js';
import RCUProcess from '../modules/los/screen/PreUnderWritingpages/RCUProcess.js';
import PersonalVerificationProcess from '../modules/los/screen/PreUnderWritingpages/PersonalVerificationProcess.js';
import OfficeVerifcationProcess from '../modules/los/screen/PreUnderWritingpages/OfficeVerifcationProcess.js';
import ResidenceVerificationProcess from '../modules/los/screen/PreUnderWritingpages/ResidenceVerificationProcess.js';
import ReviewDecision from '../modules/los/screen/Component/ReviewDecision.js';
import Credithistory from '../modules/los/screen/Component/Credithistory.js';
import TabDetailsCredit from '../modules/los/screen/Component/TabDetailCredit.js';
import TabDetails from '../modules/los/screen/Component/TabDetails.js';
import Viaemail from '../modules/collection/screen/Viaemail';
import Forgotpassword from '../modules/collection/screen/Forgotpassword';
import FirstRoute from '../modules/los/screen/Home.js';
import SuccessPage from '../modules/los/screen/Component/SuccessPage.js';
import PreHistory from '../modules/los/screen/PreUnderWritingpages/PreHistory.js';
import Lead from '../modules/los/screen/PreUnderWritingpages/Lead.js';
import AIassistant from '../modules/los/screen/PreUnderWritingpages/AIassistant.js';
// import WorkList from '../modules/los/screen/Sales/WorkList.js';
import History from '../modules/los/screen/Sales/History.js';
import QDE from '../modules/los/screen/Sales/QDE.js';
import SalesPage from '../modules/los/screen/SalesPage.js';
// import AuthLoadingScreen from '../modules/los/screen/AuthLogin.js';
import PreUnderwritingPage from '../modules/los/screen/PreUnderwritingPage.js';
import SalesDashboard from '../modules/los/screen/Sales/SalesDashboard.js';
import PreUnderWriterDashboard from '../modules/los/screen/PreUnderWritingpages/preunderWriterDashboard.js';
import WorkList from '../modules/los/screen/Sales/WorkList.js';
import LOSLogin from '../modules/los/screen/LOSLogin.js';
// import AuthLoadingScreen from '../modules/los/screen/AuthLogin.js';
import { useSelector } from 'react-redux';
import ModuleSelector from '../app/ModuleSelector.js';
import VerificationWaiverProcess from '../modules/los/screen/PreUnderWritingpages/VerificationWaiverProcess.js';
import DecisionProcess from '../modules/los/screen/Underwriting/DecisonProcess.js';
import VerificationScreen from '../modules/los/screen/Verification/VerificationScreen.js';
import AuthLogin from '../modules/los/screen/AuthLogin.js';
const Stack = createNativeStackNavigator();

const LOSNavigator = () => {
    const { selectedModule, isLoggedIn, roleCode, userHydrated } = useSelector(
        state => state.module
    );

    console.log(isLoggedIn, userHydrated, 'userHydrateduserHydrated')
    // ⛔ HARD BLOCK — wait for user data



    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>

            {/* 🔹 NOT LOGGED IN */}
            {!isLoggedIn && (
                <>
                    <Stack.Screen name="AuthLogin" component={AuthLogin} />
                    <Stack.Screen name="LOSLogin" component={LOSLogin} />
                </>
            )}
            {isLoggedIn && userHydrated && (
                <>
                    {roleCode === 'Sales' ? (
                        <Stack.Screen name="Sales" component={SalesPage} />
                    ) : (
                        <Stack.Screen name="PreUnderwriting" component={PreUnderwritingPage} />
                    )}
                    {/* other screens */}
                </>
            )}

            {isLoggedIn && !userHydrated && (
                <>
                    <Stack.Screen name="AuthLogin" component={AuthLogin} />
                    {/* other screens */}
                </>
            )}
            {isLoggedIn && (
                <>
                    <Stack.Screen name="VerificationScreen" component={VerificationScreen} options={{ headerShown: false }} />
                    {/* 🔹 Dashboards */}
                    <Stack.Screen name="Home" component={SalesDashboard} options={{ headerShown: false }} />
                    <Stack.Screen name="Dashboard" component={PreUnderWriterDashboard} options={{ headerShown: false }} />

                    {/* 🔹 Sales Screens */}
                    <Stack.Screen name="Lead" component={QDE} options={{ headerShown: false }} />
                    <Stack.Screen name="Application Status" component={History} options={{ headerShown: false }} />
                    <Stack.Screen name="Worklist" component={WorkList} options={{ headerShown: false }} />

                    {/* 🔹 PreUnderwriting Screens */}
                    <Stack.Screen name="AIassistant" component={AIassistant} options={{ headerShown: true }} />
                    <Stack.Screen name="Credit Lead" component={Lead} options={{ headerShown: false }} />
                    <Stack.Screen name="Credit WorkList" component={CreditWorkList} options={{ headerShown: false }} />
                    <Stack.Screen name="Applicationhistory" component={PreHistory} options={{ headerShown: false }} />

                    {/* 🔹 Misc */}
                    <Stack.Screen name="Success" component={SuccessPage} />
                    <Stack.Screen name="MKC" component={FirstRoute} />
                    <Stack.Screen name="ForgotpasswordPage" component={Forgotpassword} options={{ headerShown: false }} />
                    <Stack.Screen name="Viaemail" component={Viaemail} options={{ headerShown: false }} />
                    <Stack.Screen name="Tab Details" component={TabDetails} options={{ headerShown: true }} />
                    <Stack.Screen name="Tab Details Credit" component={TabDetailsCredit} options={{ headerShown: true }} />
                    <Stack.Screen name="Credit History" component={Credithistory} options={{ headerShown: true }} />
                    <Stack.Screen name="Document Store" component={ReviewDecision} options={{ headerShown: true }} />
                    {/* 🔹 Processes */}

                    <Stack.Screen name="Residence Verification" component={ResidenceVerificationProcess} options={{ headerShown: true }} />
                    <Stack.Screen name="Office Verifcation" component={OfficeVerifcationProcess} options={{ headerShown: true }} />
                    <Stack.Screen name="Personal Discussion" component={PersonalVerificationProcess} options={{ headerShown: true }} />
                    <Stack.Screen name="Verification Waiver" component={VerificationWaiverProcess} options={{ headerShown: true }} />
                    <Stack.Screen name="Update RCU" component={RCUProcess} options={{ headerShown: true }} />
                    <Stack.Screen name="Initiate RCU" component={InitaiateRCUProcess} options={{ headerShown: true }} />

                    <Stack.Screen name="Initiate Verification" component={InitiateverficationProcess} options={{ headerShown: true }} />
                    <Stack.Screen name="CreditWorklist Process" component={CreditWorkList} options={{ headerShown: true }} />
                    <Stack.Screen name="Decision " component={DecisionProcess} options={{ headerShown: true }} />
                </>
            )}
        </Stack.Navigator>
    );
};

export default LOSNavigator;

