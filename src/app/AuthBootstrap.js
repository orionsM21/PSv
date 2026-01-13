import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import {
  setModule,
  loginSuccess,
  logout,
  finishBootstrap,
} from "../redux/moduleSlice";

export default function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const [
          token,
          module,
          roleCode,
        ] = await AsyncStorage.multiGet([
          "@token",
          "@selectedModule",
          "@roleCode",
        ]);

        if (token?.[1] && module?.[1]) {
          dispatch(setModule(module[1]));
          dispatch(loginSuccess(roleCode?.[1]));
        } else {
          dispatch(logout());
        }
      } catch (e) {
        dispatch(logout());
      } finally {
        dispatch(finishBootstrap());
      }
    };

    restoreSession();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
