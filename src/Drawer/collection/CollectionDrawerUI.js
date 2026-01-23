import React, { useRef, useEffect, memo, useMemo } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Alert,
} from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { DrawerContext } from "../DrawerContext";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutOnly } from "../../redux/moduleSlice";
import { scale } from "react-native-size-matters";
/* ================= MENU CONFIG ================= */
import { theme } from "../../modules/collection/utility/Theme";
const drawerConfig = [
    { label: "Dashboard", route: "Dashboard", icon: "grid-outline", visibleTo: ["all"] },
    { label: "Allocation", route: "Allocation", icon: "layers-outline", visibleTo: ["all"] },
    { label: "Deposition", route: "Deposition", icon: "wallet-outline", visibleTo: ["all"] },
    {
        label: "Livetracking",
        route: "Livetracking",
        icon: "navigate-outline",
        visibleTo: [
            "cca", "op", "sh", "fa", "atl", "aa", "rh",
            "ch", "nrm", "mis", "zrm", "rrm", "prm", "arm", "r1",
        ],
    },
];
const DrawerItem = memo(({ label, active, onPress }) => (
    <TouchableOpacity onPress={onPress} style={[styles.drawerRow, active && styles.drawerRowActive]}>
        <Text style={[styles.drawerItem, active && styles.drawerItemActive]}>{label}</Text>
    </TouchableOpacity>
));

// 🔹 User Info Header
const DrawerUserInfo = memo(({ user }) => {
    const role = user?.role?.[0];
    return (
        <View style={styles.userInfoContainer}>
            {/* <View style={styles.userIcon}>
                <Image source={require('./asset/icons/user.png')} style={styles.userImage} />
            </View> */}
            <View>
                <Text style={styles.userName}>{`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}</Text>
                <Text style={styles.userRole}>{role?.roleCode || 'Role Missing'}</Text>
            </View>
        </View>
    );
});
/* ================= COMPONENT ================= */

export default function CollectionDrawerUI() {
    const navigation = useNavigation();
    const { closeDrawer } = React.useContext(DrawerContext);
    const dispatch = useDispatch();

    const userProfile = useSelector(s => s.auth.userProfile);
    const currentRole = userProfile?.role?.[0]?.roleCode?.toLowerCase();

    /* ---------- ACTIVE ROUTE ---------- */
    const activeRoute = useNavigationState(state =>
        state?.routes?.[state.index]?.name
    );

    /* ---------- FILTER MENU ---------- */
    const menuItems = useMemo(() => {
        return drawerConfig.filter(item =>
            item.visibleTo.includes("all") || item.visibleTo.includes(currentRole)
        );
    }, [currentRole]);

    /* ---------- ENTRY ANIMATION ---------- */
    const slideAnim = useRef(new Animated.Value(-40)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 420,
                useNativeDriver: true,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 420,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    /* ---------- NAVIGATION ---------- */
    const navigateTo = screen => {
        navigation.navigate(screen);
        closeDrawer();
    };

    /* ---------- LOGOUT ---------- */
    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Choose an option",
            [
                {
                    text: "Module Selector",
                    onPress: async () => {
                        closeDrawer();
                        await new Promise(r => setTimeout(r, 250));
                        dispatch(logout());
                    },
                },
                {
                    text: "Login Again",
                    onPress: async () => {
                        closeDrawer();
                        await new Promise(r => setTimeout(r, 250));
                        dispatch(logoutOnly());
                    },
                },
                { text: "Cancel", style: "cancel" },
            ],
            { cancelable: true }
        );
    };


    return (
        <LinearGradient colors={["#020617", "#020617", "#0F172A"]} style={styles.container}>
            <Animated.View
                style={{
                    flex: 1,
                    opacity: fadeAnim,
                    transform: [{ translateX: slideAnim }],
                }}
            >

                {/* ================= PROFILE ================= */}
                <View style={styles.profileCard}>
                    <LinearGradient
                        colors={["#2563EB", "#1E40AF"]}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>
                            {userProfile?.firstName?.charAt(0) || "U"}
                        </Text>
                    </LinearGradient>

                    <View>
                        <Text style={styles.userName}>{userProfile?.firstName}</Text>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{currentRole?.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {/* ================= MENU ================= */}
                <View style={styles.menu}>
                    {menuItems.map(item => {
                        const active = activeRoute === item.route;

                        return (
                            <MenuItem
                                key={item.route}
                                item={item}
                                active={active}
                                onPress={() => navigateTo(item.route)}
                            />
                        );
                    })}
                </View>

                {/* ================= LOGOUT ================= */}
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Icon name="log-out-outline" size={20} color="#FCA5A5" />
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>

            </Animated.View>
        </LinearGradient>
    );
}

const MenuItem = React.memo(({ item, active, onPress }) => {
    const scale = useRef(new Animated.Value(1)).current;

    const pressIn = () =>
        Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();

    const pressOut = () =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
        <Animated.View style={{ transform: [{ scale }] }}>
            <TouchableOpacity
                activeOpacity={0.85}
                onPressIn={pressIn}
                onPressOut={pressOut}
                onPress={onPress}
                style={[styles.menuItem, active && styles.menuItemActive]}
            >
                {active && <View style={styles.activeRail} />}

                <Icon
                    name={item.icon}
                    size={22}
                    color={active ? "#FFFFFF" : "#94A3B8"}
                />

                <Text style={[styles.menuText, active && styles.menuTextActive]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 22,
    },

    /* PROFILE */
    profileCard: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderRadius: 20,
        backgroundColor: "rgba(243, 238, 238, 0.06)",
        marginBottom: 26,
        // shadowColor: "#A3A3A3",
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        height: 100,
    },
    avatar: {
        height: 40,
        width: 40,
        borderRadius: 29,
        // backgroundColor: '#red',
        borderColor: '#000000',
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 14,
    },
    avatarText: {
        color: "#ffff",
        fontSize: 22,
        fontWeight: "800",
    },
    userName: {
        color: "#F8FAFC",
        fontSize: 18,
        fontWeight: "700",
    },
    roleBadge: {
        marginTop: 4,
        backgroundColor: "rgba(59,130,246,0.25)",
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: 12,
        alignSelf: "flex-start",
    },
    roleText: {
        color: "#DDDDDD",
        fontSize: 11,
        fontWeight: "700",
    },

    /* MENU */
    menu: {
        marginTop: 10,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 16,
        marginBottom: 10,
        backgroundColor: "rgba(255,255,255,0.04)",
    },
    menuItemActive: {
        backgroundColor: "rgba(59,130,246,0.18)",
        shadowColor: "#2563EB",
        shadowOpacity: 0.35,
        shadowRadius: 14,
        elevation: 8,
    },
    activeRail: {
        position: "absolute",
        left: 0,
        top: 10,
        bottom: 10,
        width: 4,
        borderRadius: 4,
        backgroundColor: "#3B82F6",
    },
    menuText: {
        marginLeft: 14,
        fontSize: 15,
        color: "#CBD5E1",
        fontWeight: "500",
    },
    menuTextActive: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    /* LOGOUT */
    logoutBtn: {
        marginTop: "auto",
        paddingVertical: 14,
        borderRadius: 18,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(211, 22, 22, 0.92)",
        borderWidth: 1,
        borderColor: "rgba(218, 20, 20, 0.89)",
    },
    logoutText: {
        color: "#FCA5A5",
        marginLeft: 10,
        fontSize: 15,
        fontWeight: "700",
    },
    modalSafeWrapper: {
        overflow: 'hidden',
        borderTopRightRadius: scale(35),
        borderBottomRightRadius: scale(35),
        backgroundColor: '#ffffff',
        // backgroundColor: 'red',
        height: '100%', // full height, fixed width
    },
    modalContent: {
        flex: 1,
        // borderTopRightRadius: scale(35),
        // borderBottomRightRadius: scale(35),
        paddingVertical: scale(25),
        paddingHorizontal: scale(20),
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 5 },
        shadowRadius: 10,
        elevation: 8,
    },
    userInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(20),
        marginLeft: scale(10),
    },
    userIcon: {
        width: scale(55),
        height: scale(55),
        borderRadius: scale(50),
        borderWidth: 2,
        borderColor: '#001D56',
        marginRight: scale(15),
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },
    userImage: { width: '100%', height: '100%', borderRadius: 50 },
    // userName: { fontSize: scale(16), fontWeight: '600', color: '#001D56' },
    userRole: { fontSize: scale(13), color: theme.light.darkBlue, fontWeight: '500', marginTop: scale(2) },
    drawerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: scale(10),
        paddingHorizontal: scale(15),
        marginVertical: scale(5),
        borderRadius: scale(14),
        backgroundColor: '#f2f2f2',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 3,
        elevation: 2,
    },
    drawerRowActive: {
        backgroundColor: theme.light.darkBlue,
        shadowOpacity: 0.2,
        elevation: 5,
    },
    drawerItem: { fontSize: scale(15), color: '#001D56', fontWeight: '500', flexShrink: 1 },
    drawerItemActive: { color: '#fff', fontWeight: '600' },

    logoutButton: {
        backgroundColor: '#FF4D4F',
        paddingVertical: scale(12),
        borderRadius: scale(15),
        alignSelf: 'center',
        marginTop: scale(20),
        width: '60%',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        elevation: 6,
    },
    logoutText: { color: '#fff', fontSize: scale(14.5), fontWeight: '700' },
});


// //AHFPL-CollectionDawer
// import React, { useRef, useEffect, memo, useMemo } from "react";
// import {
//     View,
//     Text,
//     TouchableOpacity,
//     StyleSheet,
//     Animated,
//     Alert, SafeAreaView, Image, Dimensions
// } from "react-native";
// import { useNavigation, useNavigationState } from "@react-navigation/native";
// import Icon from "react-native-vector-icons/Ionicons";
// import LinearGradient from "react-native-linear-gradient";
// import { DrawerContext } from "../DrawerContext";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../../redux/moduleSlice";
// import { scale } from "react-native-size-matters";
// import { theme } from "../../modules/collection/utility/Theme";
// import DrawerItem from "./DrawerItem";
// const { width, height } = Dimensions.get('window')
// /* ================= MENU CONFIG ================= */

// const drawerConfig = [
//     {
//         label: "Dashboard",
//         route: "Dashboard",
//         icon: "dashboard",        // ✅ MaterialIcons
//         visibleTo: ["all"],
//     },
//     {
//         label: "Allocation",
//         route: "Allocation",
//         icon: "assignment",       // ✅ MaterialIcons
//         visibleTo: ["all"],
//     },
//     {
//         label: "Deposition",
//         route: "Deposition",
//         icon: "account-balance",  // ✅ MaterialIcons
//         visibleTo: ["all"],
//     },
//     {
//         label: "Live Tracking",
//         route: "Livetracking",
//         icon: "location-on",      // ✅ MaterialIcons
//         visibleTo: [
//             "cca", "op", "sh", "fa", "atl", "aa", "rh",
//             "ch", "nrm", "mis", "zrm", "rrm", "prm", "arm", "r1",
//         ],
//     },
// ];


// /* ================= DRAWER ITEM ================= */



// const menuItems = [
//     {
//         label: 'Home',
//         route: 'Dashboard',
//         icon: 'home',
//         screenKey: 'Home',
//     },
//     {
//         label: 'Case Listing',
//         route: 'Allocation',
//         icon: 'assignment',
//         screenKey: 'Allocation',
//     },
//     {
//         label: 'Deposition',
//         route: 'Deposition',
//         icon: 'account-balance',
//         screenKey: 'Deposition',
//     },
//     {
//         label: 'User Tracking',
//         route: 'LiveTracking',
//         icon: 'location-on',
//         screenKey: 'LiveTracking',
//     },
// ];


// /* ================= COMPONENT ================= */

// export default function CollectionDrawerUI() {
//     const navigation = useNavigation();
//     const { closeDrawer } = React.useContext(DrawerContext);
//     const dispatch = useDispatch();

//     const userProfile = useSelector(s => s.auth.userProfile);
//     const currentRole = userProfile?.role?.[0]?.roleCode?.toLowerCase();
//     // const currentScreenValue = useSelector(
//     //     state => state.common.currentScreen
//     // );
//     /* ---------- ACTIVE ROUTE ---------- */
//     const activeRoute = useNavigationState(
//         state => state.routes[state.index]?.name
//     );

//     /* ---------- FILTER MENU ---------- */
//     const menuItems = useMemo(() => {
//         return drawerConfig.filter(item =>
//             item.visibleTo.includes("all") || item.visibleTo.includes(currentRole)
//         );
//     }, [currentRole]);

//     /* ---------- ENTRY ANIMATION ---------- */
//     const slideAnim = useRef(new Animated.Value(-40)).current;
//     const fadeAnim = useRef(new Animated.Value(0)).current;

//     useEffect(() => {
//         Animated.parallel([
//             Animated.timing(slideAnim, {
//                 toValue: 0,
//                 duration: 420,
//                 useNativeDriver: true,
//             }),
//             Animated.timing(fadeAnim, {
//                 toValue: 1,
//                 duration: 420,
//                 useNativeDriver: true,
//             }),
//         ]).start();
//     }, []);

//     /* ---------- NAVIGATION ---------- */
//     const navigateTo = screen => {
//         navigation.navigate(screen);
//         closeDrawer();
//     };

//     /* ---------- LOGOUT (CORRECT WAY) ---------- */
//     const handleLogout = () => {
//         Alert.alert(
//             "Logout",
//             "Are you sure you want to logout?",
//             [
//                 {
//                     text: "Logout",
//                     style: "destructive",
//                     onPress: () => {
//                         closeDrawer();
//                         // dispatch(logout()); // ✅ Redux controls navigation
//                         navigation.navigate('CollectionLogin')
//                     },
//                 },
//                 { text: "Cancel", style: "cancel" },
//             ]
//         );
//     };

//     return (
//         <SafeAreaView style={{ flex: 1 }}>
//             <View style={styles.backdrop}>
//                 <LinearGradient
//                     colors={["#ffffff", "#F5F5F5", "#FFFFFF"]}
//                     style={styles.modalSafeWrapper}
//                 >
//                     <Animated.View
//                         style={[
//                             styles.modalContent,
//                             {
//                                 opacity: fadeAnim,
//                                 transform: [{ translateX: slideAnim }],
//                             },
//                         ]}
//                     >
//                         {/* LOGO */}
//                         <View style={styles.logoWrapper}>
//                             <Image
//                                 source={require('../../asset/images/goFin.png')}
//                                 resizeMode="contain"
//                                 style={styles.logo}
//                             />
//                         </View>

//                         {/* PROFILE */}
//                         <View style={styles.userInfoContainer}>
//                             <View style={styles.userIcon}>
//                                 <Image
//                                     source={require('../../asset/TrueBoardIcon/Vector.png')}
//                                     style={styles.userImage}
//                                 />
//                             </View>

//                             <View>
//                                 <Text style={styles.userName}>
//                                     {userProfile?.firstName} {userProfile?.lastName}
//                                 </Text>
//                                 <Text style={styles.userRole}>
//                                     {currentRole?.toUpperCase()}
//                                 </Text>
//                             </View>
//                         </View>

//                         <View style={styles.divider} />

//                         {/* MENU */}
//                         <View style={styles.menuWrapper}>
//                             {menuItems.map(item => (
//                                 <DrawerItem
//                                     key={item.route}
//                                     item={item}
//                                     theme={theme}
//                                     active={activeRoute === item.route}
//                                     onPress={() => {
//                                         navigation.navigate(item.route);
//                                         closeDrawer();
//                                     }}
//                                 />
//                             ))}
//                         </View>

//                         {/* LOGOUT */}
//                         <TouchableOpacity
//                             style={styles.logoutButton}
//                             onPress={handleLogout}
//                             activeOpacity={0.85}
//                         >
//                             <Text style={styles.logoutText}>Sign Out</Text>
//                         </TouchableOpacity>
//                     </Animated.View>
//                 </LinearGradient>
//             </View>
//         </SafeAreaView>
//     );


// }


// // /* ================= STYLES ================= */


// export const styles = StyleSheet.create({
//     /* ================= DRAWER CONTAINER ================= */
//     modalSafeWrapper: {
//         flex: 1,
//         width: "80%",
//         backgroundColor: "#FFFFFF",
//         borderTopRightRadius: scale(32),
//         borderBottomRightRadius: scale(32),
//         overflow: "hidden",

//         // Shadow (iOS)
//         shadowColor: "#000",
//         shadowOpacity: 0.15,
//         shadowRadius: 12,
//         shadowOffset: { width: 3, height: 0 },

//         // Elevation (Android)
//         elevation: 12,
//     },

//     modalContent: {
//         flex: 1,
//         paddingVertical: scale(22),
//         paddingHorizontal: scale(18),
//     },

//     /* ================= LOGO ================= */
//     logoWrapper: {
//         alignItems: "center",
//         // marginBottom: scale(20),
//     },

//     logo: {
//         height: scale(55),
//         width: scale(170),
//     },

//     /* ================= PROFILE ================= */
//     userInfoContainer: {
//         flexDirection: "row",
//         alignItems: "center",
//         // marginBottom: scale(10),
//         marginLeft: scale(6),
//     },

//     userIcon: {
//         width: scale(54),
//         height: scale(54),
//         borderRadius: scale(50),
//         borderWidth: 2,
//         borderColor: "#001D56",
//         marginRight: scale(14),
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#F1F1F1",
//         overflow: "hidden",
//     },

//     userImage: {
//         width: "100%",
//         height: "100%",
//         borderRadius: scale(50),
//     },

//     userName: {
//         fontSize: scale(16),
//         fontWeight: "700",
//         color: "#001D56",
//     },

//     userRole: {
//         fontSize: scale(12),
//         fontWeight: "500",
//         marginTop: scale(2),
//         color: theme.light.darkBlue,
//         opacity: 0.75,
//     },

//     divider: {
//         height: 1,
//         backgroundColor: "#E6E6E6",
//         marginVertical: scale(10),
//     },

//     /* ================= MENU ================= */
//     menuWrapper: {
//         marginTop: scale(2),
//     },

//     /* ================= LOGOUT ================= */
//     logoutButton: {
//         marginTop: "auto",
//         backgroundColor: "#F43F5E",
//         paddingVertical: scale(12),
//         borderRadius: scale(18),
//         alignSelf: "center",
//         width: "72%",
//         alignItems: "center",

//         shadowColor: "#000",
//         shadowOpacity: 0.25,
//         shadowRadius: 6,
//         shadowOffset: { width: 0, height: 3 },
//         elevation: 6,
//     },

//     logoutText: {
//         color: "#FFFFFF",
//         fontSize: scale(14),
//         fontWeight: "700",
//         letterSpacing: 0.4,
//     },
//     backdrop: {
//         flex: 1,
//         flexDirection: "row",
//         backgroundColor: "rgba(0,0,0,0.4)", // 👈 controls black area
//     },

// });
