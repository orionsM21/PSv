import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  PermissionsAndroid, SafeAreaView
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../redux/moduleSlice";
import { encrypt } from "../secuity/encryption";
import { decrypt } from "../secuity/decryption";
import { saveTokenAndID, saveRoleCode, saveUserProfile } from "../../../redux/actions";
import apiClient from "../../../common/hooks/apiClient";
import { BASE_URL } from "../service/api";
import { moderateScale, scale, verticalScale } from "react-native-size-matters";


const InputField = ({
  placeholder,
  value,
  onChangeText,
  secure = false,
  icon,
  toggleSecure,
}) => (
  <View style={styles.inputWrapper}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#999"
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure}
      autoCapitalize="none"
      autoCorrect={false}
    />

    {icon && (
      <TouchableOpacity
        onPress={toggleSecure}
        style={styles.eyeIconContainer}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Image source={icon} style={styles.eyeIcon} resizeMode="contain" />
      </TouchableOpacity>
    )}
  </View>
);

// ------------------- BUTTON -------------------
const Button = ({ title, onPress, loading }) => (
  <TouchableOpacity
    style={[styles.button, loading && styles.disabledButton]}
    onPress={onPress}
    disabled={loading}
  >
    {loading ? (
      <ActivityIndicator color="#fff" />
    ) : (
      <Text style={styles.buttonText}>{title}</Text>
    )}
  </TouchableOpacity>
);


export default function CollectionLogin({ onLogin }) {
  const navigation = useNavigation();

  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [apkPath, setApkPath] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({});

  const dispatch = useDispatch();
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state =>
      setIsOnline(state.isConnected)
    );
    return () => unsub();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setUserId("");
      setPassword("");
    }, [])
  );

  const handleLogin = async () => {
    if (!userId || !password) {
      Alert.alert("Missing Info", "Please enter credentials");
      return;
    }

    if (!isOnline) {
      Alert.alert("No Internet", "Check your internet connection");
      return;
    }

    setLoading(true);

    try {
      // Encrypt credentials
      // const encryptedPrincipal = encrypt(userId);
      // const encryptedCredentials = encrypt(password);

      const tokenResponse = await apiClient.post(
        `${BASE_URL}mobile/token?type=uid`,
        {
          // principal: encryptedPrincipal,
          // credentials: encryptedCredentials,
          principal: userId,
          credentials: password,
        },

      );
      console.log("EnteredinloginProcess")
      const { response, token, user: userInfo } = tokenResponse?.data || {};

      // Backend error messages
      if (
        [
          'Access denied',
          'Bad credentials',
          'Password is inactive...',
          'Invalid user ID',
        ].includes(response)
      ) {
        Alert.alert(response);
        return;
      }

      // Missing user from backend
      if (!userInfo?.name || !userInfo?.userId) {
        Alert.alert('Login Failed', 'User information is missing from server.');
        return;
      }

      // Decrypt backend-encrypted user fields
      // const decryptedName = decrypt(userInfo.name);
      // const decryptedUserId = decrypt(userInfo.userId);
      const decryptedName = userInfo.name;
      const decryptedUserId = userInfo.userId;
      const userNameString = `${decryptedName}`;
      const userIdString = `${decryptedUserId}`;

      // Fetch full profile
      const userResponse = await apiClient.get(
        `${BASE_URL}getUserByUserNameForDashboard/${encodeURIComponent(userNameString)}`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            // 'X-From-Mobile': 'true',
          },
        }
      );

      const userData = userResponse?.data?.data;
      const roleCode = userData?.role?.[0]?.roleCode || '';
      console.log(roleCode, 'roleCodeFrom loginPage')
      // Persist session
      await AsyncStorage.multiSet([
        ['@token', token],
        ['@selectedModule', 'collection'], // ✅ IMPORTANT
        ['@isLoggedIn', 'true'],            // ✅ IMPORTANT
        ['@userId', userIdString],
        ['@userName', userNameString],
        ['@roleCode', roleCode],
        ['@userProfile', JSON.stringify(userData)],
      ]);


      // Redux updates
      dispatch(
        saveTokenAndID({
          messageKey: true,
          token,
          user: { name: userNameString, userId: userIdString },
        })
      );

      dispatch(saveUserProfile(userData));
      dispatch(saveRoleCode(roleCode));

      // Navigate on success
      if (userResponse?.data?.msgKey === 'Success') {
        dispatch(loginSuccess());
        // navigation.navigate('Dashboard')
      }
    } catch (e) {
      Alert.alert(
        "Login Failed",
        e?.message || JSON.stringify(e)
      );
    }
    finally {
      setLoading(false);
    }
  };

  // -------------------------------------------
  // NOTIFICATION PERMISSIONS (Android 13+)
  // -------------------------------------------
  const requestNotificationPermission = async () => {
    if (Platform.OS === "android" && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn("[PERM] Notifications not granted");
        }
      } catch (e) {
        console.warn("[PERM] Notification error", e);
      }
      return;
    }
  };

  // -------------------------------------------
  // LOCATION PERMISSIONS
  // -------------------------------------------
  const requestLocationPermissions = async () => {
    if (Platform.OS !== "android") return true;

    try {
      const perms = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ]);

      const fineOK =
        perms[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;
      const coarseOK =
        perms[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
        PermissionsAndroid.RESULTS.GRANTED;

      if (!fineOK || !coarseOK) return false;

      // Android 10+ separate background location
      if (Platform.Version >= 29) {
        const bg = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION
        );
        return bg === PermissionsAndroid.RESULTS.GRANTED;
      }

      return true;
    } catch (e) {
      console.warn("[PERM] Location permission error:", e);
      return false;
    }
  };
  const togglePassword = () => setSecure(!secure);
  useEffect(() => {
    requestLocationPermissions();
    requestNotificationPermission();
  }, [])
  return (
    // <LinearGradient
    //   colors={["#0F172A", "#1E293B"]}
    //   style={styles.container}
    // >
    //   <KeyboardAvoidingView
    //     behavior={Platform.OS === "ios" ? "padding" : undefined}
    //     style={{ flex: 1 }}
    //   >
    //     <ScrollView
    //       contentContainerStyle={styles.scroll}
    //       keyboardShouldPersistTaps="handled"
    //     >
    //       <View style={styles.card}>
    //         {/* LOGO */}
    //         <Image
    //           source={require("../../../asset/icon/goFin.png")}
    //           style={styles.logo}
    //           resizeMode="contain"
    //         />

    //         {/* TITLE */}
    //         <Text style={styles.title}>Collection  Login</Text>
    //         <Text style={styles.subtitle}>
    //           Secure access to your dashboard
    //         </Text>

    //         {/* USER ID */}
    //         <View style={styles.inputBox}>
    //           <TextInput
    //             placeholder="User ID"
    //             placeholderTextColor="#9CA3AF"
    //             value={userId}
    //             onChangeText={setUserId}
    //             style={styles.input}
    //           />
    //         </View>

    //         {/* PASSWORD */}
    //         <View style={styles.inputBox}>
    //           <TextInput
    //             placeholder="Password"
    //             placeholderTextColor="#9CA3AF"
    //             secureTextEntry={secure}
    //             value={password}
    //             onChangeText={setPassword}
    //             style={styles.input}
    //           />
    //           <TouchableOpacity onPress={() => setSecure(!secure)}>
    //             <Text style={styles.eye}>
    //               {secure ? "👁️" : "🙈"}
    //             </Text>
    //           </TouchableOpacity>
    //         </View>

    //         {/* LOGIN BUTTON */}
    //         <TouchableOpacity
    //           onPress={handleLogin}
    //           style={[styles.loginBtn, loading && { opacity: 0.7 }]}
    //           disabled={loading}
    //         >
    //           {loading ? (
    //             <ActivityIndicator color="#fff" />
    //           ) : (
    //             <Text style={styles.loginText}>LOGIN</Text>
    //           )}
    //         </TouchableOpacity>

    //         {/* LINKS */}
    //         <View style={styles.links}>
    //           <TouchableOpacity>
    //             <Text style={styles.link}>Login with OTP</Text>
    //           </TouchableOpacity>
    //           <TouchableOpacity>
    //             <Text style={styles.link}>Forgot Password?</Text>
    //           </TouchableOpacity>
    //         </View>
    //       </View>

    //       {/* FOOTER */}
    //       <View style={styles.footer}>
    //         <Text style={styles.footerText}>Powered by</Text>
    //         <Image
    //           source={require("../../../asset/icon/goFin.png")}
    //           style={styles.footerLogo}
    //         />
    //         <Text style={styles.version}>UAT 1.0.0</Text>
    //       </View>

    //       {/* <UpdateModal
    //         visible={showUpdateModal}
    //         progress={progress}
    //         downloading={downloading}
    //         updateInfo={updateInfo}
    //         onDownloadPress={() => startDownload(updateInfo.apkUrl)}
    //         onCancelPress={() => setDownloading(false)}
    //         onClosePress={() => setShowUpdateModal(false)}
    //       /> */}
    //     </ScrollView>
    //   </KeyboardAvoidingView>
    // </LinearGradient>

    <SafeAreaView style={styles.container}>

      {/* Logo */}
      <View style={styles.topLogo}>
        <Image
          source={require('../../../asset/images/goFin.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Tree Icon */}
      <View style={styles.treeIcon}>
        <Image
          source={require('../../../asset/TrueBoardIcon/logintree.png')}
          style={styles.treeImg}
          resizeMode="contain"
        />
      </View>

      <Text style={styles.signInText}>Please Sign-In</Text>

      {/* FORM */}
      <View style={styles.formContainer}>
        <InputField
          placeholder="Username"
          value={userId}
          onChangeText={setUserId}
        />

        <InputField
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secure={secure}
          icon={
            secure
              ? require('.../../../asset/icon/openEye.png')
              : require('.../../../asset/icon/closeEye.png')
          }
          toggleSecure={togglePassword}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate('Forgotpassword')}
          style={styles.forgotWrapper}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <Button title="Login" onPress={handleLogin} loading={loading} />
      </View>

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered</Text>

        <Image
          source={require('../../../asset/images/goFin.png')}
          style={styles.footerLogo}
          resizeMode="contain"
        />

        <Text style={styles.versionText}>UAT Version 1.0.16</Text>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 24,
    elevation: 6,
  },

  logo: {
    height: 60,
    alignSelf: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    marginBottom: 24,
  },

  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    height: 48,
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },

  eye: {
    fontSize: 18,
  },

  loginBtn: {
    height: 48,
    backgroundColor: "#2563EB",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  loginText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },

  links: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },

  link: {
    color: "#2563EB",
    fontSize: 13,
  },

  footer: {
    marginTop: 30,
    alignItems: "center",
  },

  footerText: {
    fontSize: 12,
    color: "#CBD5E1",
  },

  footerLogo: {
    height: 28,
    width: 90,
    marginVertical: 8,
  },

  version: {
    fontSize: 12,
    color: "#CBD5E1",
  },






  ///AHFPLCollectionLOGINStyle/////

  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    paddingHorizontal: scale(20),
  },

  topLogo: {
    alignItems: 'center',
    marginTop: verticalScale(20),
  },

  logo: {
    width: scale(200),
    height: verticalScale(55),
  },

  treeIcon: {
    alignItems: 'center',
    marginTop: verticalScale(10),
  },

  treeImg: {
    width: scale(120),
    height: scale(120),
  },

  signInText: {
    fontSize: moderateScale(18),
    fontWeight: '500',
    color: 'black',
    marginTop: verticalScale(10),
    marginLeft: scale(5),
  },

  formContainer: {
    marginTop: verticalScale(10),
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: moderateScale(10),
    marginVertical: verticalScale(8),
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: scale(12),
    height: verticalScale(48),
  },

  input: {
    flex: 1,
    fontSize: moderateScale(14),
    color: '#333',
  },

  eyeIconContainer: {
    padding: scale(5),
  },

  eyeIcon: {
    width: scale(22),
    height: scale(22),
    tintColor: '#666',
  },

  button: {
    backgroundColor: '#193C95',
    paddingVertical: verticalScale(12),
    borderRadius: moderateScale(10),
    alignItems: 'center',
    marginTop: verticalScale(20),
  },

  disabledButton: {
    backgroundColor: '#999',
  },

  buttonText: {
    color: '#fff',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },

  forgotWrapper: {
    alignItems: 'flex-end',
    marginTop: verticalScale(6),
  },

  forgotText: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: '#193C95',
  },

  footer: {
    alignItems: 'center',
    marginTop: verticalScale(40),
  },

  footerText: {
    fontSize: moderateScale(12),
    color: '#333',
  },

  footerLogo: {
    width: scale(100),
    height: verticalScale(40),
    marginVertical: verticalScale(5),
  },

  versionText: {
    fontSize: moderateScale(12),
    color: '#333',
  },
});


























// import 'react-native-get-random-values';
// import React, { useState, useEffect } from 'react';
// import {
//   Alert,
//   View,
//   Platform,
//   PermissionsAndroid,
//   Linking,
//   BackHandler,
// } from 'react-native';
// import { Provider, } from 'react-redux';
// // import { NativeBaseProvider } from 'native-base';
// import { NavigationContainer } from '@react-navigation/native';

// import store from './src/redux/store';
// import MainApp from './MainApp';
// import { navigationRef } from './src/navigation/NavigationService';
// import DeviceInfo from 'react-native-device-info';
// import RNFS from 'react-native-fs';
// import FileViewer from 'react-native-file-viewer';
// import UpdateModal from './src/components/UpdateModal';
// import { checkForJsUpdate } from './src/components/UpdateManager';
// import Analytics from 'appcenter-analytics';
// import PushNotification from 'react-native-push-notification';
// import apiClient from './src/api/apiClient';
// const UPDATE_URL = 'http://trucollectuat.truboardpartners.com/updates/updates.json';
// // ✅ Clean & stable root component
// const App = () => {

//   const [progress, setProgress] = useState(0);
//   const [downloading, setDownloading] = useState(false);
//   const [apkPath, setApkPath] = useState(null);
//   const [showUpdateModal, setShowUpdateModal] = useState(false);
//   const [updateInfo, setUpdateInfo] = useState({});

//   const getFileNameFromUrl = (url) => {
//     try {
//       const parts = url.split('/');
//       const last = parts.pop() || `update_${Date.now()}.apk`;
//       return last.endsWith('.apk') ? last : `${last}.apk`;
//     } catch {
//       return `update_${Date.now()}.apk`;
//     }
//   };

//   const compareVersions = (v1, v2) => {
//     const a = v1.split('.').map(Number);
//     const b = v2.split('.').map(Number);
//     for (let i = 0; i < Math.max(a.length, b.length); i++) {
//       if ((a[i] || 0) > (b[i] || 0)) return 1;
//       if ((a[i] || 0) < (b[i] || 0)) return -1;
//     }
//     return 0;
//   };

//   const ensureDownloadPermission = async () => {
//     if (Platform.OS !== 'android') return true;
//     const api = Platform.Version;
//     try {
//       if (api >= 33) return true; // scoped storage ok
//       if (api >= 30) return true; // internal download works fine
//       const res = await PermissionsAndroid.requestMultiple([
//         PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
//         PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
//       ]);
//       return Object.values(res).every(
//         (v) => v === PermissionsAndroid.RESULTS.GRANTED
//       );
//     } catch {
//       return true;
//     }
//   };

//   const checkForUpdate = async () => {
//     try {
//       // ✅ Call your backend using apiClient (axios)
//       const res = await apiClient.get(UPDATE_URL, {
//         headers: {
//           "Cache-Control": "no-cache",
//           "Pragma": "no-cache",
//           "Expires": "0",
//         }
//       });

//       const meta = res?.data;

//       if (!meta) {
//         console.log("⚠️ No meta received");
//         return checkForJsUpdate({ autoRestart: false });
//       }

//       const localCode = Number(DeviceInfo.getBuildNumber());
//       const localName = DeviceInfo.getVersion();
//       const remoteCode = Number(meta.latestVersionCode);
//       const remoteName = meta.latestVersionName;

//       const needsApk =
//         (remoteCode && remoteCode > localCode) ||
//         compareVersions(remoteName, localName) > 0;

//       if (needsApk) {
//         setUpdateInfo({ ...meta, currentVersion: localName });
//         setShowUpdateModal(true);
//         return;
//       }

//       // 🔹 No APK update → check OTA
//       checkForJsUpdate({ autoRestart: false });
//     } catch (err) {
//       console.log("⚠️ Update check failed:", err?.message || err);

//       // 🔥 Still allow OTA fallback
//       checkForJsUpdate({ autoRestart: false });
//     }
//   };


//   const startDownload = async (apkUrl) => {
//     if (Platform.OS !== 'android') {
//       Alert.alert('Unsupported', 'App update works only on Android.');
//       return;
//     }
//     if (!(await ensureDownloadPermission())) {
//       Alert.alert('Permission', 'Storage permission denied.');
//       return;
//     }

//     try {
//       const fileName = getFileNameFromUrl(apkUrl);
//       const dest = `${RNFS.DownloadDirectoryPath}/${fileName}`;
//       setApkPath(dest);

//       if (await RNFS.exists(dest)) {
//         setShowUpdateModal(false);
//         return openApk(dest);
//       }

//       setDownloading(true);
//       setProgress(0);

//       const dl = RNFS.downloadFile({
//         fromUrl: apkUrl,
//         toFile: dest,
//         progressDivider: 1,
//         progress: (data) =>
//           setProgress(
//             data.contentLength ? data.bytesWritten / data.contentLength : 0
//           ),
//       });

//       const result = await dl.promise;
//       setDownloading(false);

//       if (result.statusCode === 200) {
//         setShowUpdateModal(false);
//         Analytics.trackEvent('APK_Downloaded', {
//           version: updateInfo?.latestVersionName,
//         });
//         await openApk(dest);
//       } else {
//         Alert.alert('Download failed', `Status ${result.statusCode}`);
//       }
//     } catch (e) {
//       setDownloading(false);
//       Alert.alert('Update failed', e.message);
//     }
//   };

//   const openApk = async (path) => {
//     try {
//       await FileViewer.open(path, { showOpenWithDialog: true });
//     } catch (e) {
//       console.warn('⚠️ FileViewer failed:', e);
//       try {
//         await Linking.openURL(`file://${path}`);
//       } catch {
//         Alert.alert('Manual Install', 'Please install the APK manually.');
//       }
//     }
//   };


//   useEffect(() => {
//     const backAction = () => {
//       if (downloading) {
//         Alert.alert('Please Wait', 'Update is downloading. Do not exit.');
//         return true;
//       }

//       if (showUpdateModal) {
//         setShowUpdateModal(false);
//         return true;
//       }

//       Alert.alert('Exit App', 'Are you sure you want to exit?', [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Exit', onPress: () => BackHandler.exitApp() },
//       ]);
//       return true;
//     };

//     const backHandler = BackHandler.addEventListener(
//       'hardwareBackPress',
//       backAction
//     );

//     return () => backHandler.remove();
//   }, [downloading, showUpdateModal]);

//   useEffect(() => {
//     PushNotification.createChannel(
//       { channelId: 'update-channel', channelName: 'App Update' },
//       () => { }
//     );
//     checkForUpdate();
//   }, []);
//   return (
//     // <NativeBaseProvider>
//       <Provider store={store}>
//         <NavigationContainer ref={navigationRef}>
//           {/* <View style={{ flex: 1 }}> */}
//           <MainApp />
//           <UpdateModal
//             visible={showUpdateModal}
//             progress={progress}
//             downloading={downloading}
//             updateInfo={updateInfo}
//             onDownloadPress={() => startDownload(updateInfo.apkUrl)}
//             onCancelPress={() => setDownloading(false)}
//             onClosePress={() => setShowUpdateModal(false)}
//           />
//           {/* </View> */}
//         </NavigationContainer>
//       </Provider>
//     // </NativeBaseProvider>
//   );
// };

// export default App;
