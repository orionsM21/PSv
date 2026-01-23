import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Dimensions,
    Alert,
    TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { InputField, Button } from './ReuableComponent/Component';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../redux/moduleSlice';

const { width, height } = Dimensions.get('window');

// Define sets of gradient color pairs
const gradientColors = [
    ['#FFD700', '#FFA500'],
    ['#4FACFE', '#00F2FE'],
    ['#A18CD1', '#FBC2EB'],
    ['#F9D423', '#FF4E50'],
    ['#FF6B6B', '#FFD3A5'],
];

const PaymentLogin = () => {
    const navigation = useNavigation()
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(100)).current;
    const [gradientIndex, setGradientIndex] = useState(0);
    const [titleColor, setTitleColor] = useState(gradientColors[0][0]);
    const dispatch = useDispatch();
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();

        Animated.timing(slideAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setGradientIndex((prev) => {
                const nextIndex = (prev + 1) % gradientColors.length;
                setTitleColor(gradientColors[nextIndex][0]);
                return nextIndex;
            });
        }, 8000); // 8 seconds

        return () => clearInterval(interval);
    }, []);

    const [loading, setLoading] = useState(false);

    const handleLogin = useCallback(async () => {
        if (loading) return;

        setLoading(true);
        try {
            // API CALL
            dispatch(loginSuccess());
        } catch (e) {
            Alert.alert("Login failed");
        } finally {
            setLoading(false);
        }
    }, [loading, dispatch]);


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            {/* Animated Gradient Background */}
            <LinearGradient
                colors={gradientColors[gradientIndex]}
                style={styles.gradientBackground}
            />

            {/* Overlay for visibility */}
            <View style={styles.overlay} />

            {/* Animated Content */}
            <Animated.View
                style={[
                    styles.card,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
                ]}
            >
                <Text style={[styles.title, { color: titleColor }]}>Welcome Back</Text>
                <Text style={styles.subtitle}>Please log in to your account</Text>

                <InputField placeholder="Email" keyboardType="email-address" />
                <InputField placeholder="Password" secureTextEntry />

                {/* <Button title="PaymentLogin" onPress={() => navigation.navigate('MainTabs')} /> */}

                {/* <Button
                    title="PaymentLogin"
                    // onPress={() => navigation.navigate('MainTabs')}
                    onPress={handleLogin}
                    backgroundColor={gradientColors[gradientIndex][0]}
                    textColor="#fff"
                /> */}

                <TouchableOpacity
                    onPress={handleLogin}
                    style={[
                        styles.loginBtn,
                        { backgroundColor: gradientColors[gradientIndex][0] },
                    ]}

                    activeOpacity={0.85}
                >
                    <Text style={styles.loginText}>
                        Login
                    </Text>
                </TouchableOpacity>


            </Animated.View>
        </KeyboardAvoidingView>
    );
};

export default PaymentLogin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    gradientBackground: {
        position: 'absolute',
        width,
        height,
        top: 0,
        left: 0,
        zIndex: -2,
    },
    overlay: {
        position: 'absolute',
        width,
        height,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: -1,
    },
    card: {
        width: '90%',
        padding: 25,
        borderRadius: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        textAlign: 'center',
        marginBottom: 30,
    },
    loginBtn: {
        height: 52,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
        elevation: 4,          // Android shadow
    },
    loginText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
});
