

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useSelector } from "react-redux";

import ModuleSelector from "./ModuleSelector";
import GoldLogin from "../modules/goldLoan/screens/GoldLogin";
import VehicleLogin from "../modules/vehicleLoan/screen/VehicleLogin";
import LOSLogin from "../modules/los/screen/LOSLogin";
import CollectionLogin from "../modules/collection/screen/CollectionLogin";
import GoldLoanNavigator from "../Navigation/GoldLoanNavigator";
import VehicleLoanNavigator from "../Navigation/VehicleLoanNavigator";
import LOSNavigator from "../Navigation/LOSNavigator";
import CollectionNavigator from "../Navigation/CollectionNavigator";
import AuthBootstrap from "./AuthBootstrap";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { selectedModule, isLoggedIn, bootstrapped } = useSelector(state => state.module);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* {!selectedModule && (
        <Stack.Screen name="ModuleSelector" component={ModuleSelector} />
      )} */}
      {!bootstrapped && (
        <Stack.Screen name="AuthBootstrap" component={AuthBootstrap} />
      )}

      {bootstrapped && !selectedModule && (
        <Stack.Screen name="ModuleSelector" component={ModuleSelector} />
      )}

      {selectedModule === "gold" && (
        <Stack.Screen
          name="GoldFlow"
          component={isLoggedIn ? GoldLoanNavigator : GoldLogin}
        />
      )}

      {selectedModule === "vehicle" && (
        <Stack.Screen
          name="VehicleFlow"
          component={isLoggedIn ? VehicleLoanNavigator : VehicleLogin}
        />
      )}

      {selectedModule === "los" && (
        <Stack.Screen
          name="LOSFlow"
          component={isLoggedIn ? LOSNavigator : LOSLogin}
        />
      )}

      {selectedModule === "collection" && (
        <Stack.Screen
          name="CollectionFlow"
          component={isLoggedIn ? CollectionNavigator : CollectionLogin}
        />
      )}
    </Stack.Navigator>
  );
}



// ///AHFPlCollection
// import React from "react";
// import { createNativeStackNavigator } from "@react-navigation/native-stack";
// import CollectionNavigator from "../Navigation/CollectionNavigator";


// const Stack = createNativeStackNavigator();

// export default function AppNavigator() {
//   return (
//     <Stack.Navigator screenOptions={{ headerShown: false }}>
//       <Stack.Screen
//         name="CollectionRoot"
//         component={CollectionNavigator}
//       />
//     </Stack.Navigator>
//   );
// }
