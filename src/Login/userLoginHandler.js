// auth/useLoginHandler.js

import { useState, useEffect, useCallback } from "react";
import NetInfo from "@react-native-community/netinfo";
import { Alert } from "react-native";

export const useLoginHandler = (loginFn) => {
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsub = NetInfo.addEventListener(state =>
      setIsOnline(!!state.isConnected)
    );
    return () => unsub();
  }, []);

  const handleLogin = useCallback(async (payload) => {
    if (!payload.userId) {
      Alert.alert("Missing Info", "Enter credentials");
      return;
    }

    if (!isOnline) {
      Alert.alert("No Internet");
      return;
    }

    try {
      setLoading(true);
      await loginFn(payload);
    } catch (e) {
      Alert.alert("Login Failed", e?.message || "Try again");
    } finally {
      setLoading(false);
    }
  }, [loginFn, isOnline]);

  return { handleLogin, loading };
};