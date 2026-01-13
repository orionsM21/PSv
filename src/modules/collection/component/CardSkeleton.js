import React from "react";
import { View, StyleSheet } from "react-native";

const CardSkeleton = () => {
    return (
        <View style={styles.card}>
            {/* Left circle (avatar / icon) */}
            <View style={styles.avatar} />

            {/* Right content */}
            <View style={styles.content}>
                <View style={styles.lineShort} />
                <View style={styles.lineMedium} />
                <View style={styles.lineSmall} />
            </View>
        </View>
    );
};

export default CardSkeleton;

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        padding: 14,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 14,
        backgroundColor: "#F3F4F6",
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#E5E7EB",
    },
    content: {
        flex: 1,
        marginLeft: 14,
    },
    lineShort: {
        height: 12,
        width: "40%",
        backgroundColor: "#E5E7EB",
        borderRadius: 6,
        marginBottom: 10,
    },
    lineMedium: {
        height: 12,
        width: "70%",
        backgroundColor: "#E5E7EB",
        borderRadius: 6,
        marginBottom: 10,
    },
    lineSmall: {
        height: 10,
        width: "30%",
        backgroundColor: "#E5E7EB",
        borderRadius: 6,
    },
});
