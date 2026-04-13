import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

export default function GlassKpiCardV2({ icon, count, label, onPress, delay }) {
    return (
        <Animatable.View
            animation="fadeInUp"
            delay={delay}
            duration={600}
            useNativeDriver
        >
            <Animatable.View
                animation="pulse"
                duration={800}
                easing="ease-out"
                iterationCount={1}
                useNativeDriver
            >
                <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>

                    {/* ⭐ Top Glare Beam */}
                    <LinearGradient
                        colors={["rgba(255,255,255,0.35)", "rgba(255,255,255,0.05)"]}
                        style={styles.topBeam}
                    />

                    {/* ⭐ Inner Bottom Blur Curve */}
                    <View style={styles.bottomBlur} />

                    {/* ⭐ Frosted Glass Skin */}
                    <LinearGradient
                        colors={[
                            "rgba(255,255,255,0.25)",
                            "rgba(255,255,255,0.12)",
                            "rgba(255,255,255,0.05)",
                        ]}
                        style={styles.frostOverlay}
                    />

                    {/* ⭐ Neon Edge Rim (subtle) */}
                    {/* <LinearGradient
                        colors={[
                            "rgba(0,122,255,0.45)",
                            "rgba(255,255,255,0.15)",
                            "rgba(0,122,255,0.45)",
                        ]}
                        style={styles.rimLight}
                    /> */}

                    {/* ⭐ Main Content */}
                    <View style={styles.centerContent}>
                        <Image source={icon} style={styles.icon} />
                        <Text style={styles.count}>{count ?? 0}</Text>
                        <Text style={styles.label}>{label}</Text>
                    </View>
                </TouchableOpacity>
            </Animatable.View>
        </Animatable.View>
    );
}

const styles = StyleSheet.create({
    card: {
        width: width * 0.44,
        height: height * 0.15,
        borderRadius: 22,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center",

        // ⭐ Main frosted glass bg
        backgroundColor: "rgba(255,255,255,0.08)",

        // ⭐ Outer shadow
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 8 },
        elevation: 6,
    },

    /* Top light reflection */
    topBeam: {
        position: "absolute",
        top: 0,
        height: 50,
        width: "100%",
        opacity: 0.6,
    },

    /* Bottom curved internal blur */
    bottomBlur: {
        position: "absolute",
        bottom: -25,
        width: "85%",
        height: 75,
        borderRadius: 40,
        backgroundColor: "rgba(255,255,255,0.22)",
        opacity: 0.28,
    },

    /* Frosted film overlay */
    frostOverlay: {
        ...StyleSheet.absoluteFillObject,
    },

    /* Rim highlight */
    rimLight: {
        position: "absolute",
        borderRadius: 22,
        width: "100%",
        height: "100%",
        opacity: 0.18,
    },

    /* Content */
    centerContent: {
        alignItems: "center",
        justifyContent: "center",
    },

    icon: {
        width: 40,
        height: 40,
        marginBottom: 6,
        resizeMode: "contain",
        opacity: 0.95,
    },

    count: {
        fontSize: 24,
        fontWeight: "800",
        color: "#005BEA",
        textShadowColor: "rgba(0,0,0,0.35)",
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },

    label: {
        fontSize: 13,
        color: "#EDEDED",
        marginTop: 2,
        opacity: 0.85,
        textAlign: "center",
    },
});
