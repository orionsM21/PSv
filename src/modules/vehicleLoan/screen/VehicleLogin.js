import React, { useState, useCallback, useEffect, memo } from "react";
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
    Alert,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import LinearGradient from "react-native-linear-gradient";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../../redux/moduleSlice";

const VehicleLogin = () => {
    const dispatch = useDispatch();

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [secure, setSecure] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(true);

    /* ------------------ NETWORK ------------------ */
    useEffect(() => {
        const unsub = NetInfo.addEventListener(state =>
            setIsOnline(!!state.isConnected)
        );
        return () => unsub();
    }, []);

    /* ------------------ LOGIN ------------------ */
    const handleLogin = useCallback(async () => {
        if (!userId.trim() || !password.trim()) {
            Alert.alert("Missing Info", "Please enter credentials");
            return;
        }

        if (!isOnline) {
            Alert.alert("No Internet", "Check your internet connection");
            return;
        }

        try {
            setLoading(true);

            // 🔧 simulate API (replace with real vehicle loan API)
            await new Promise(res => setTimeout(res, 1000));

            // 🔑 Redux-driven login
            dispatch(loginSuccess());
        } catch (e) {
            Alert.alert("Login failed", "Please try again");
        } finally {
            setLoading(false);
        }
    }, [userId, password, isOnline, dispatch]);

    /* ------------------ UI ------------------ */
    return (
        <LinearGradient
            colors={["#0B1220", "#102A43", "#1E3A8A"]}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={{ flex: 1 }}
            >
                <ScrollView
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.card}>
                        {/* LOGO */}
                        <Image
                            source={require("../../../asset/icon/goFin.png")}
                            style={styles.logo}
                            resizeMode="contain"
                        />

                        {/* TITLE */}
                        <Text style={styles.title}>Vehicle Loan Login</Text>
                        <Text style={styles.subtitle}>
                            Access your auto-finance dashboard
                        </Text>

                        {/* USER ID */}
                        <View style={styles.inputBox}>
                            <TextInput
                                placeholder="User ID"
                                placeholderTextColor="#94A3B8"
                                value={userId}
                                onChangeText={setUserId}
                                style={styles.input}
                                autoCapitalize="none"
                            />
                        </View>

                        {/* PASSWORD */}
                        <View style={styles.inputBox}>
                            <TextInput
                                placeholder="Password"
                                placeholderTextColor="#94A3B8"
                                secureTextEntry={secure}
                                value={password}
                                onChangeText={setPassword}
                                style={styles.input}
                            />
                            <TouchableOpacity
                                onPress={() => setSecure(s => !s)}
                                hitSlop={10}
                            >
                                <Text style={styles.eye}>{secure ? "👁️" : "🙈"}</Text>
                            </TouchableOpacity>
                        </View>

                        {/* LOGIN BUTTON */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
                            disabled={loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.loginText}>LOGIN</Text>
                            )}
                        </TouchableOpacity>

                        {/* LINKS */}
                        <View style={styles.links}>
                            <Text style={styles.link}>Login with OTP</Text>
                            <Text style={styles.link}>Forgot Password?</Text>
                        </View>
                    </View>

                    {/* FOOTER */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Powered by</Text>
                        <Image
                            source={require("../../../asset/icon/goFin.png")}
                            style={styles.footerLogo}
                        />
                        <Text style={styles.version}>v1.0.0</Text>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

export default memo(VehicleLogin);

const styles = StyleSheet.create({
    container: { flex: 1 },

    scroll: {
        flexGrow: 1,
        justifyContent: "center",
        padding: 24,
    },

    card: {
        backgroundColor: "#F8FAFC",
        borderRadius: 20,
        padding: 26,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 6,
    },

    logo: {
        height: 58,
        alignSelf: "center",
        marginBottom: 18,
    },

    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0F172A",
        textAlign: "center",
    },

    subtitle: {
        textAlign: "center",
        color: "#475569",
        marginBottom: 26,
    },

    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#CBD5E1",
        borderRadius: 12,
        paddingHorizontal: 14,
        marginBottom: 16,
        height: 50,
        backgroundColor: "#FFFFFF",
    },

    input: {
        flex: 1,
        fontSize: 15,
        color: "#0F172A",
    },

    eye: {
        fontSize: 18,
    },

    loginBtn: {
        height: 50,
        backgroundColor: "#1E40AF", // 🚗 vehicle blue
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
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
        color: "#1D4ED8",
        fontSize: 13,
        fontWeight: "500",
    },

    footer: {
        marginTop: 34,
        alignItems: "center",
    },

    footerText: {
        fontSize: 12,
        color: "#CBD5E1",
    },

    footerLogo: {
        height: 26,
        width: 88,
        marginVertical: 6,
    },

    version: {
        fontSize: 12,
        color: "#CBD5E1",
    },
});
