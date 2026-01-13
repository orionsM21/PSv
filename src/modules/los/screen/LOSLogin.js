import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator,
    Animated,
    Alert,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import LinearGradient from "react-native-linear-gradient";
import { saveToken, saveUserDetails, saveTokenAndID } from '../../../redux/actions';
import { useDispatch } from "react-redux";
import { loginSuccess, setUserHydrated } from "../../../redux/moduleSlice";
import axios from "axios";
import { BASE_URL } from "../api/Endpoints";
export default function LOSLogin({ onLogin }) {
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [isOnline, setIsOnline] = useState(true);
    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(false);
    const [focused, setFocused] = useState(null);
    useEffect(() => {
        const unsub = NetInfo.addEventListener(state =>
            setIsOnline(state.isConnected)
        );
        return () => unsub();
    }, []);
    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    useFocusEffect(
        useCallback(() => {
            setUserId("");
            setPassword("");
        }, [])
    );



    const handleLogin = async () => {
        if (!userId.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both username and password.');
            return;
        }

        setLoading(true);
        const payload = { userName: userId.trim(), password: password.trim() };

        try {
            const { data } = await axios.post(`${BASE_URL}login`, payload);
            console.log(data, data.data, 'Loginhhh')
            const token = data.data.token;
            const loggedInUserName = data.data.userName;
            dispatch(saveToken(token));

            await AsyncStorage.setItem('@token', token);
            await AsyncStorage.setItem('@userName', loggedInUserName);
            console.log('Clling Login API')
            const userDetailResponse = await axios.get(
                `${BASE_URL}getUserDetailByUserName/${loggedInUserName}`,
                { headers: { Authorization: 'Bearer ' + token } }
            );
            console.log(userDetailResponse, 'userDetailResponseuserDetailResponse')
            const userDetailData = userDetailResponse.data.data;
            dispatch(saveUserDetails(userDetailData));

            const UID = String(userDetailData.userId);
            const roleCode = userDetailData.role?.[0]?.roleCode || '';
            await AsyncStorage.setItem('@roleCode', roleCode);
            dispatch(
                saveTokenAndID({
                    token,
                    user: {
                        userId: UID,
                        name: loggedInUserName, // optional
                    },
                })
            );
            dispatch(setUserHydrated());

            // navigation.navigate('LOSFlow', {
            //     screen: roleCode === 'Sales' ? 'Sales' : 'PreUnderwriting',
            // });

            dispatch(loginSuccess(roleCode));
            await AsyncStorage.multiSet([
                ['@token', token],
                ['@selectedModule', 'los'],     // ✅ REQUIRED
                ['@isLoggedIn', 'true'],        // ✅ REQUIRED
                ['@userName', loggedInUserName],
                ['@roleCode', roleCode],
            ]);

        } catch (error) {
            console.log(error.response.data, 'errorerror')
            Alert.alert(
                'Login failed',
                error.response?.data
            );
        } finally {
            setLoading(false);
        }
    };
    const pressIn = () =>
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
        }).start();

    const pressOut = () =>
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            useNativeDriver: true,
        }).start();

    return (
        <LinearGradient colors={["#0F172A", "#1E293B"]} style={styles.container}>
            <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scroll}>
                    <Animated.View
                        style={[
                            styles.card,
                            {
                                opacity: fadeAnim,
                                transform: [{ translateY: slideAnim }],
                            },
                        ]}
                    >
                        <Image
                            source={require("../../../asset/icon/goFin.png")}
                            style={styles.logo}
                        />

                        <Text style={styles.title}>LOS Login</Text>
                        <Text style={styles.subtitle}>
                            Secure access to your dashboard
                        </Text>

                        {/* USER ID */}
                        <View
                            style={[
                                styles.inputBox,
                                focused === "user" && styles.focused,
                            ]}
                        >
                            <TextInput
                                placeholder="User ID"
                                placeholderTextColor="#9CA3AF"
                                value={userId}
                                onChangeText={setUserId}
                                onFocus={() => setFocused("user")}
                                onBlur={() => setFocused(null)}
                                style={styles.input}
                            />
                        </View>

                        {/* PASSWORD */}
                        <View
                            style={[
                                styles.inputBox,
                                focused === "pass" && styles.focused,
                            ]}
                        >
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#9CA3AF"
                                secureTextEntry={secure}
                                value={password}
                                onChangeText={setPassword}
                                onFocus={() => setFocused("pass")}
                                onBlur={() => setFocused(null)}
                                style={styles.input}
                            />
                            <TouchableOpacity onPress={() => setSecure(!secure)}>
                                <Text style={styles.eye}>{secure ? "👁️" : "🙈"}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* BUTTON */}
                        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                            <TouchableOpacity
                                activeOpacity={0.9}
                                onPressIn={pressIn}
                                onPressOut={pressOut}
                                onPress={handleLogin}
                                disabled={loading}
                                style={styles.loginBtn}
                            >
                                {loading ? (
                                    <ActivityIndicator color="#fff" />
                                ) : (
                                    <Text style={styles.loginText}>LOGIN</Text>
                                )}
                            </TouchableOpacity>
                        </Animated.View>

                        <View style={styles.links}>
                            <Text style={styles.link}>Login with OTP</Text>
                            <Text style={styles.link}>Forgot Password?</Text>
                        </View>
                    </Animated.View>

                    <Text style={styles.footer}>v1.0.0 • Secure Fintech</Text>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },

    scroll: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },

    card: {
        backgroundColor: "#0F172A",
        borderRadius: 22,
        padding: 26,
    },

    logo: {
        height: 60,
        alignSelf: "center",
        marginBottom: 18,
    },

    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#F8FAFC",
        textAlign: "center",
    },

    subtitle: {
        textAlign: "center",
        color: "#94A3B8",
        marginBottom: 24,
    },

    inputBox: {
        backgroundColor: "#020617",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 50,
        marginBottom: 14,
        flexDirection: "row",
        alignItems: "center",
    },

    focused: {
        borderWidth: 1,
        borderColor: "#3B82F6",
    },

    input: {
        flex: 1,
        color: "#F8FAFC",
        fontSize: 15,
    },

    eye: {
        fontSize: 18,
    },

    loginBtn: {
        height: 50,
        borderRadius: 12,
        backgroundColor: "#2563EB",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 12,
    },

    loginText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "600",
    },

    links: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 18,
    },

    link: {
        color: "#60A5FA",
        fontSize: 13,
    },

    footer: {
        textAlign: "center",
        marginTop: 26,
        color: "#64748B",
        fontSize: 12,
    },
});
