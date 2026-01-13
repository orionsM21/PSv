import React, { memo } from "react";
import { View, Text, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";

const OutlinedText = ({ children, color = "#333", strokeColor = "#fff", strokeWidth = 1, style }) => {
    return (
        <View style={{ position: "relative" }}>
            {/* Stroke Layer */}
            <Text
                style={[
                    style,
                    {
                        color: strokeColor,
                        position: "absolute",
                        left: strokeWidth,
                        top: strokeWidth,
                    },
                ]}
            >
                {children}
            </Text>

            {/* Main Text */}
            <Text style={[style, { color }]}>{children}</Text>
        </View>
    );
};


const ProductDetailsCard = memo(
    ({
        title = "Product Details",
        gradientColors = ["#508FF5FF", "#F1F1F1FF",],
        children,
    }) => {
        return (
            <View style={styles.wrapper}>
                {/* <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0.4, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                > */}
                <View style={styles.card}>
                    {/* Title */}
                    {/* <Text style={styles.title}>{title}</Text> */}
                    <OutlinedText
                        color="#000"
                        strokeColor="#929292FF"
                        strokeWidth={0.5}
                        style={styles.title}
                    >
                        {title}
                    </OutlinedText>

                    {/* Dynamic Content Section */}
                    <View >
                        {children}
                    </View>
                </View>
                {/* </LinearGradient> */}
            </View>
        );
    }
);

export default ProductDetailsCard;

const styles = StyleSheet.create({
    wrapper: {
        marginVertical: 10,
    },
    card: {
        padding: 16,
        borderRadius: 14,

    },
    title: {
        color: "#000",
        fontSize: 18,
        fontWeight: "800",
        marginBottom: 14,
    },
    content: {
        backgroundColor: "rgba(255,255,255,0.08)",
        padding: 12,
        borderRadius: 10,
    },
});
