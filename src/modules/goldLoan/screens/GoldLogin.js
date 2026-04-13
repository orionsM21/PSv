import React, {useCallback} from 'react';
import {useDispatch} from 'react-redux';
import {loginSuccess, logout} from '../../../redux/moduleSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useLoginHandler} from '../../../Login/userLoginHandler';
import {LOGIN_CONFIGS} from '../../../Login/loginConfigs';
import GenericLogin from '../../../Login/GenericLogin';

export default function GoldLogin() {
  const dispatch = useDispatch();

  const loginFn = useCallback(
    async ({userId}) => {
      await new Promise(res => setTimeout(res, 1000));

      await AsyncStorage.setItem('@lastLoginUser', userId);

      dispatch(loginSuccess());
    },
    [dispatch],
  );

  const {handleLogin, loading} = useLoginHandler(loginFn);

  const handleBack = useCallback(() => {
    dispatch(logout());
    return true;
  }, [dispatch]);

  return (
    <GenericLogin
      {...LOGIN_CONFIGS.gold}
      onLogin={handleLogin}
      loading={loading}
      logo={require('../../../asset/icon/goFin.png')}
      footerLogo={require('../../../asset/icon/goFin.png')}
      onBackPress={handleBack}
    />
  );
}

// import React, { useState, useCallback, useEffect } from "react";
// import {
//     View,
//     Text,
//     TextInput,
//     TouchableOpacity,
//     StyleSheet,
//     Image,
//     Dimensions,
//     KeyboardAvoidingView,
//     Platform,
//     ScrollView,
//     ActivityIndicator,
//     Alert,
// } from "react-native";
// import { useNavigation, useFocusEffect } from "@react-navigation/native";
// import NetInfo from "@react-native-community/netinfo";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import LinearGradient from "react-native-linear-gradient";
// import { useDispatch } from "react-redux";
// // import { loginSuccess, setModule } from "../redux/moduleSlice";
// import { loginSuccess, logout } from "../../../redux/moduleSlice";
// import axios from "axios";
// import { BASE_URL } from "../api/Endpoint";
// import { saveToken, saveTokenAndID, saveUserDetails } from "../../../redux/actions";
// // import { saveToken, saveTokenAndID, saveUserDetails } from "../redux/actions";
// const { width, height } = Dimensions.get("window");

// export default function GoldLogin({ onLogin }) {
//     const navigation = useNavigation();
//     const dispatch = useDispatch();
//     const [userId, setUserId] = useState("");
//     const [password, setPassword] = useState("");
//     const [secure, setSecure] = useState(true);
//     const [loading, setLoading] = useState(false);
//     const [isOnline, setIsOnline] = useState(true);

//     useEffect(() => {
//         const unsub = NetInfo.addEventListener(state =>
//             setIsOnline(state.isConnected)
//         );
//         return () => unsub();
//     }, []);

//     useFocusEffect(
//         useCallback(() => {
//             setUserId("");
//             setPassword("");
//         }, [])
//     );

//     const handleLogin = async () => {
//         if (!userId.trim() || !password.trim()) {
//             Alert.alert('Error', 'Please enter both username and password.');
//             return;
//         }

//         setLoading(true);
//         const payload = { userName: userId.trim(), password: password.trim() };

//         try {
//             const { data } = await axios.post(`${BASE_URL}login`, payload);
//             console.log(data.data, 'Loginhhh')
//             const token = data.data.token;
//             const loggedInUserName = data.data.userName;
//             dispatch(saveToken(token));

//             await AsyncStorage.setItem('@token', token);
//             await AsyncStorage.setItem('@userName', loggedInUserName);

//             const userDetailResponse = await axios.get(
//                 `${BASE_URL}getUserDetailByUserName/${loggedInUserName}`,
//                 { headers: { Authorization: 'Bearer ' + token } }
//             );

//             const userDetailData = userDetailResponse.data.data;
//             dispatch(saveUserDetails(userDetailData));

//             const UID = String(userDetailData.userId);
//             const roleCode = userDetailData.role?.[0]?.roleCode || '';
//             await AsyncStorage.setItem('@roleCode', roleCode);
//             dispatch(
//                 saveTokenAndID({
//                     token,
//                     userId: UID,
//                     userName: loggedInUserName,
//                 })
//             );

//             await AsyncStorage.setItem("lastLogin", userId);
//             const isAdmin = ['Admin'].includes(roleCode);
//             await AsyncStorage.multiSet([
//                 ['@userId', UID],
//                 ['@roleCode', roleCode],
//                 ['@isAdmin', JSON.stringify(isAdmin)],
//             ]);

//             dispatch(setModule('gold'));
//             dispatch(loginSuccess());
//             dispatch(
//                 loginSuccess({
//                     uid: UID,
//                     roleCode,
//                     isAdmin,
//                 })
//             );
//             navigation.navigate('Dashboard')

//         } catch (error) {
//             console.log(error, 'errorerror')
//             Alert.alert(
//                 'Login failed',
//                 error.response?.data
//             );
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <LinearGradient
//             colors={["#0F172A", "#1E293B"]}
//             style={styles.container}
//         >
//             <KeyboardAvoidingView
//                 behavior={Platform.OS === "ios" ? "padding" : undefined}
//                 style={{ flex: 1 }}
//             >
//                 <ScrollView
//                     contentContainerStyle={styles.scroll}
//                     keyboardShouldPersistTaps="handled"
//                 >
//                     <View style={styles.card}>
//                         {/* LOGO */}
//                         <Image
//                             source={require("../../../asset/icon/goFin.png")}
//                             style={styles.logo}
//                             resizeMode="contain"
//                         />

//                         {/* TITLE */}
//                         <Text style={styles.title}>Gold Loan Login</Text>
//                         <Text style={styles.subtitle}>
//                             Secure access to your dashboard
//                         </Text>

//                         {/* USER ID */}
//                         <View style={styles.inputBox}>
//                             <TextInput
//                                 placeholder="User ID"
//                                 placeholderTextColor="#9CA3AF"
//                                 value={userId}
//                                 onChangeText={setUserId}
//                                 style={styles.input}
//                             />
//                         </View>

//                         {/* PASSWORD */}
//                         <View style={styles.inputBox}>
//                             <TextInput
//                                 placeholder="Password"
//                                 placeholderTextColor="#9CA3AF"
//                                 secureTextEntry={secure}
//                                 value={password}
//                                 onChangeText={setPassword}
//                                 style={styles.input}
//                             />
//                             <TouchableOpacity onPress={() => setSecure(!secure)}>
//                                 <Text style={styles.eye}>
//                                     {secure ? "👁️" : "🙈"}
//                                 </Text>
//                             </TouchableOpacity>
//                         </View>

//                         {/* LOGIN BUTTON */}
//                         <TouchableOpacity
//                             onPress={handleLogin}
//                             style={[styles.loginBtn, loading && { opacity: 0.7 }]}
//                             disabled={loading}
//                         >
//                             {loading ? (
//                                 <ActivityIndicator color="#fff" />
//                             ) : (
//                                 <Text style={styles.loginText}>LOGIN</Text>
//                             )}
//                         </TouchableOpacity>

//                         {/* LINKS */}
//                         <View style={styles.links}>
//                             <TouchableOpacity>
//                                 <Text style={styles.link}>Login with OTP</Text>
//                             </TouchableOpacity>
//                             <TouchableOpacity>
//                                 <Text style={styles.link}>Forgot Password?</Text>
//                             </TouchableOpacity>
//                         </View>
//                     </View>

//                     {/* FOOTER */}
//                     <View style={styles.footer}>
//                         <Text style={styles.footerText}>Powered by</Text>
//                         <Image
//                             source={require(".../../../asset/icon/goFin.png")}
//                             style={styles.footerLogo}
//                         />
//                         <Text style={styles.version}>v1.0.0</Text>
//                     </View>
//                 </ScrollView>
//             </KeyboardAvoidingView>
//         </LinearGradient>
//     );
// }

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//     },

//     scroll: {
//         flexGrow: 1,
//         justifyContent: "center",
//         padding: 24,
//     },

//     card: {
//         backgroundColor: "#ffffff",
//         borderRadius: 18,
//         padding: 24,
//         elevation: 6,
//     },

//     logo: {
//         height: 60,
//         alignSelf: "center",
//         marginBottom: 20,
//     },

//     title: {
//         fontSize: 22,
//         fontWeight: "700",
//         color: "#111827",
//         textAlign: "center",
//     },

//     subtitle: {
//         textAlign: "center",
//         color: "#6B7280",
//         marginBottom: 24,
//     },

//     inputBox: {
//         flexDirection: "row",
//         alignItems: "center",
//         borderWidth: 1,
//         borderColor: "#E5E7EB",
//         borderRadius: 10,
//         paddingHorizontal: 12,
//         marginBottom: 14,
//         height: 48,
//     },

//     input: {
//         flex: 1,
//         fontSize: 15,
//         color: "#111827",
//     },

//     eye: {
//         fontSize: 18,
//     },

//     loginBtn: {
//         height: 48,
//         backgroundColor: "#2563EB",
//         borderRadius: 10,
//         justifyContent: "center",
//         alignItems: "center",
//         marginTop: 10,
//     },

//     loginText: {
//         color: "#fff",
//         fontSize: 15,
//         fontWeight: "600",
//     },

//     links: {
//         flexDirection: "row",
//         justifyContent: "space-between",
//         marginTop: 16,
//     },

//     link: {
//         color: "#2563EB",
//         fontSize: 13,
//     },

//     footer: {
//         marginTop: 30,
//         alignItems: "center",
//     },

//     footerText: {
//         fontSize: 12,
//         color: "#CBD5E1",
//     },

//     footerLogo: {
//         height: 28,
//         width: 90,
//         marginVertical: 8,
//     },

//     version: {
//         fontSize: 12,
//         color: "#CBD5E1",
//     },
// });
