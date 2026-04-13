import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Animated,
    Image,
    AppState,
    Pressable,
    PanResponder,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const FlipCard = () => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [isFlipped, setIsFlipped] = useState(false);
    const [showCVV, setShowCVV] = useState(false);
    const cvvTimer = useRef(null);
    const frontRotate = animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['0deg', '180deg'],
    });

    const backRotate = animatedValue.interpolate({
        inputRange: [0, 180],
        outputRange: ['180deg', '360deg'],
    });

    // const flip = () => {
    //     Animated.spring(animatedValue, {
    //         toValue: isFlipped ? 0 : 180,
    //         friction: 8,
    //         tension: 10,
    //         useNativeDriver: true,
    //     }).start();

    //     setIsFlipped(prev => !prev);
    // };

    const flip = (toBack = !isFlipped) => {
        Animated.spring(animatedValue, {
            toValue: toBack ? 180 : 0,
            friction: 8,
            tension: 10,
            useNativeDriver: true,
        }).start();

        setIsFlipped(toBack);
    };

    /* ---------------- SWIPE FLIP ---------------- */
    const panResponder = useRef(
        PanResponder.create({
            onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 25,
            onPanResponderRelease: (_, g) => {
                if (g.dx < -50) flip(true);   // swipe left → back
                if (g.dx > 50) flip(false);  // swipe right → front
            },
        })
    ).current;

    const isCVVPressed = useRef(false);


    /* ---------------- CVV LONG PRESS ---------------- */
    const onCVVPressIn = () => {
        isCVVPressed.current = true;
        setShowCVV(true);

        cvvTimer.current = setTimeout(() => {
            setShowCVV(false);
            isCVVPressed.current = false;
        }, 3000);
    };

    const onCVVPressOut = () => {
        clearTimeout(cvvTimer.current);
        setShowCVV(false);
        isCVVPressed.current = false;
    };


    /* ---------------- APP BACKGROUND SECURITY ---------------- */
    useEffect(() => {
        const sub = AppState.addEventListener('change', state => {
            if (state !== 'active') {
                setShowCVV(false);
                flip(false);
            }
        });
        return () => sub.remove();
    }, []);
    return (
        <View
            {...panResponder.panHandlers}
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => {
                if (isCVVPressed.current) return;
                flip(!isFlipped);
            }}

        >

            {/* FRONT */}
            <Animated.View
                style={[
                    styles.card,
                    {
                        transform: [{ rotateY: frontRotate }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['#1E3C72', '#2A5298']}
                    style={styles.cardGradient}
                >
                    <Text style={styles.bankName}>NeoBank</Text>
                    <Image source={require('../asset/go_fin.png')} style={styles.chip} />

                    <Text style={styles.cardNumber}>**** **** **** 1234</Text>

                    <View style={styles.cardDetailsRow}>
                        <View>
                            <Text style={styles.label}>Card Holder</Text>
                            <Text style={styles.cardHolder}>John Doe</Text>
                        </View>
                        <View>
                            <Text style={styles.label}>Expires</Text>
                            <Text style={styles.cardExpiry}>12/25</Text>
                        </View>
                    </View>

                    <Text style={styles.cardIssuer}>VISA</Text>
                </LinearGradient>
            </Animated.View>

            {/* BACK */}
            <Animated.View
                style={[
                    styles.card,
                    styles.cardBack,
                    { transform: [{ rotateY: backRotate }] },
                ]}
            >
                <LinearGradient colors={['#000', '#333']} style={styles.cardGradient}>
                    <Text style={styles.cvvLabel}>CVV</Text>

                    <Pressable
                        onPressIn={onCVVPressIn}
                        onPressOut={onCVVPressOut}
                        onStartShouldSetResponder={() => true}
                        onResponderTerminationRequest={() => false}
                        style={styles.cvvBox}
                    >
                        <Text style={styles.cvvText}>
                            {showCVV ? '428' : '***'}
                        </Text>
                    </Pressable>

                    <Text style={styles.info}>Customer Care: 1800-123-456</Text>
                    <Text style={styles.info}>Issued by NeoBank</Text>
                </LinearGradient>
            </Animated.View>

        </View>

    );
};

export default React.memo(FlipCard);

const styles = StyleSheet.create({
    card: {
        width: 320,
        height: 200,
        borderRadius: 24,
        backfaceVisibility: 'hidden',
    },
    cardBack: {
        position: 'absolute',
        top: 0,
    },
    cardGradient: {
        flex: 1,
        borderRadius: 24,
        padding: 22,
        justifyContent: 'space-between',
    },
    bankName: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'right',
    },
    chip: {
        width: 50,
        height: 35,
    },
    cardNumber: {
        color: '#fff',
        fontSize: 22,
        letterSpacing: 2,
        fontWeight: '600',
    },
    cardDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    label: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
    },
    cardHolder: {
        fontSize: 16,
        color: '#fff',
    },
    cardExpiry: {
        fontSize: 16,
        color: '#fff',
    },
    cardIssuer: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        textAlign: 'right',
    },
    cvvLabel: {
        color: '#ccc',
    },
    cvvBox: {
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 6,
        alignItems: 'center',
    },
    cvvText: {
        letterSpacing: 4,
        fontWeight: '700',
        color:'red'
    },
    info: {
        color: '#aaa',
        fontSize: 12,
    },
});

