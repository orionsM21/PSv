import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch } from "react-redux";
import {
  finishBootstrap,
  loginSuccess,
  logout,
  setModule,
} from "../redux/moduleSlice";
import AppLayout from "./AppLayout";
import { APP_THEME } from "./appTheme";
import { syncRemoteConfig } from "../modules/collection/service/syncRemoteConfig";

export default function AuthBootstrap() {
  const dispatch = useDispatch();

  useEffect(() => {
    let mounted = true;

    const applyPersistedSession = async () => {
      const [[, token], [, module], [, roleCode]] = await AsyncStorage.multiGet([
        "@token",
        "@selectedModule",
        "@roleCode",
      ]);

      if (!mounted) {
        return { token: null, module: null, roleCode: null };
      }

      if (module) {
        dispatch(setModule(module));
      }

      if (token && module) {
        dispatch(loginSuccess(roleCode || null));
      } else {
        dispatch(logout());
      }

      return { token, module, roleCode };
    };

    const restoreSession = async () => {
      try {
        await applyPersistedSession();

        if (mounted) {
          dispatch(finishBootstrap());
        }

        syncRemoteConfig()
          .then(async () => {
            if (!mounted) return;

            const [[, refreshedToken], [, refreshedModule], [, refreshedRoleCode]] = await AsyncStorage.multiGet([
              "@token",
              "@selectedModule",
              "@roleCode",
            ]);

            if (!mounted) return;

            if (refreshedModule) {
              dispatch(setModule(refreshedModule));
            }

            if (refreshedToken && refreshedModule) {
              dispatch(loginSuccess(refreshedRoleCode || null));
            } else {
              dispatch(logout());
            }
          })
          .catch(() => null);
      } catch (error) {
        if (mounted) {
          dispatch(logout());
          dispatch(finishBootstrap());
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  return (
    <AppLayout withSafeArea>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>PS</Text>
          </View>
          <Text style={styles.title}>Preparing your workspace</Text>
          <Text style={styles.subtitle}>
            Restoring session state, syncing environment config, and routing you to
            the right module.
          </Text>
          <ActivityIndicator
            size="small"
            color={APP_THEME.accent}
            style={styles.loader}
          />
        </View>
      </View>
    </AppLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: APP_THEME.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: APP_THEME.border,
    padding: 24,
    alignItems: "center",
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: "rgba(139,211,255,0.16)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  logoText: {
    color: APP_THEME.accent,
    fontSize: 24,
    fontWeight: "800",
  },
  title: {
    color: APP_THEME.textPrimary,
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: APP_THEME.textSecondary,
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    marginTop: 10,
  },
  loader: {
    marginTop: 20,
  },
});
