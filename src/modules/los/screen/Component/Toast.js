import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');


const CustomToast = ({ message, isVisible }) => {
    const [fadeAnim] = useState(new Animated.Value(0));  // Initial value for opacity
    const [show, setShow] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            // Fade in
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500, // fade-in duration
                useNativeDriver: true,
            }).start();

            // Fade out after 7 seconds
            setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 500, // fade-out duration
                    useNativeDriver: true,
                }).start();
                setTimeout(() => setShow(false), 500); // Hide toast after fade-out
            }, 7000); // Show toast for 7 seconds
        } else {
            setShow(false); // Immediately hide the toast if visibility is false
        }
    }, [isVisible, fadeAnim]);

    if (!show) return null;

    return (
        <Animated.View style={[styles.toastContainer, { opacity: fadeAnim }]}>
            <Text style={styles.toastText}>{message}</Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 2 },
        minWidth: 200,  // Minimum width
        maxWidth: '90%',  // Allow toast to expand up to 90% of screen width
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,  // Ensure it appears on top
        width: width * 0.75,  // Set width to 75% of screen width
    },
    toastText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        flexWrap: 'wrap',  // Allow text to wrap to the next line
    },
});

export default CustomToast;
