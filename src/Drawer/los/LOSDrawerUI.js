



import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated, Alert, ScrollView, LayoutAnimation, Platform, UIManager
} from "react-native";
import { useNavigation, useNavigationState } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import LinearGradient from "react-native-linear-gradient";
import { DrawerContext } from "../DrawerContext";
import { useDispatch, useSelector } from "react-redux";
import { logout, logoutOnly } from "../../redux/moduleSlice";


if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
const drawerConfig = {
  los: [
    {
      section: "Sales",
      items: [
        {
          label: "Home",
          route: "Home",
          icon: "home-outline",
          visibleTo: ["sales"],
        },
        {
          label: "Lead",
          route: "Lead",
          icon: "people-outline",
          visibleTo: ["sales"],
        },
        {
          label: "Application Status",
          route: "Application Status",
          icon: "document-text-outline",
          visibleTo: ["sales"],
        },
      ],
    },

    {
      section: "Pre-Underwriting",
      items: [
        {
          label: "Dashboard",
          route: "Dashboard",
          icon: "grid-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
        {
          label: "Credit Lead",
          route: "Credit Lead",
          icon: "card-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
        {
          label: "Worklist",
          route: "Worklist",
          icon: "list-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
        {
          label: "Deviation Worklist",
          route: "Credit WorkList",
          icon: "alert-circle-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
        {
          label: "Application History",
          route: "Applicationhistory",
          icon: "time-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },

      ],
    },

    {
      section: "Verification",
      collapsible: true,
      items: [
        {
          label: "Initiate Verification",
          route: "VerificationScreen",
          params: { configKey: "INITIATE_VERIFICATION" },
          icon: "checkmark-circle-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
        {
          label: "Residence Verification",
          route: "VerificationScreen",
          params: { configKey: "RESIDENCE_VERIFICATION" },
          icon: "home-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
        {
          label: "Office Verification",
          route: "VerificationScreen",
          params: { configKey: "OFFICE_VERIFICATION" },
          icon: "business-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
        {
          label: "Initiate RCU",
          route: "VerificationScreen",
          params: { configKey: "INITIATE_RCU" },
          icon: "play-circle-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
        {
          label: "Update RCU Details",
          route: "VerificationScreen",
          params: { configKey: "RCU" },
          icon: "create-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
        {
          label: "Personal Discussion",
          route: "VerificationScreen",
          params: { configKey: "PERSONAL_DISCUSSION" },
          icon: "chatbubble-ellipses-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
        {
          label: "Verification Waiver",
          route: "VerificationScreen",
          params: { configKey: "VERIFICATION_WAIVER" },
          icon: "ban-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
      ],
    },


    {
      section: "Underwriting",
      collapsible: true,
      items: [

        {
          label: "Decision",
          route: "VerificationScreen",
          params: { configKey: "DECISION" },
          icon: "checkmark-done-outline",
          visibleTo: ["Credit", "CEO", "ch", "op", "legal"],
        },
      ],
    },

  ],
};


export default function LOSDrawerUI() {
  const navigation = useNavigation();
  const { closeDrawer } = React.useContext(DrawerContext);
  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token);
  const userId = useSelector(state => state.auth.userId);
  const userName = useSelector(state => state.auth.userName);
  const roleCode = useSelector(state => state.auth.roleCode);

  const userProfile = useSelector(state => state.auth.losuserDetails);
  // const currentRole = userProfile?.role?.[0]?.roleCode?.toLowerCase();
  // 🔹 Example user (replace with Redux / API data)


  // const activeRoute = useNavigationState(state => {
  //   if (!state || !state.routes || state.index == null) {
  //     return null;
  //   }
  //   return state.routes[state.index]?.name;
  // });
  const activeRouteInfo = useNavigationState(state => {
    const route = state?.routes?.[state.index];
    return {
      name: route?.name,
      configKey: route?.params?.configKey,
    };
  });

  useEffect(() => {
    const isPreActive = verificationItems.some(
      s =>
        activeRouteInfo.name === s.route &&
        activeRouteInfo.configKey === s.params?.configKey
    );

    const isUnderActive = underwritingItems.some(
      s =>
        activeRouteInfo.name === s.route &&
        activeRouteInfo.configKey === s.params?.configKey
    );

    if (isPreActive) setExpandPre(true);
    if (isUnderActive) setExpandUnder(true);
  }, [activeRouteInfo]);

  const currentRole =
    userProfile?.role?.[0]?.roleCode?.trim().toLowerCase();



  const normalizedRole = currentRole; // already lowercased
  console.log(currentRole, normalizedRole, 'currentRolecurrentRole')
  const salesItems =
    drawerConfig.los.find(s => s.section === "Sales")?.items || [];

  const preUnderwritingTop =
    drawerConfig.los.find(s => s.section === "Pre-Underwriting")?.items || [];

  const verificationItems =
    drawerConfig.los.find(s => s.section === "Verification")?.items || [];

  const underwritingItems =
    drawerConfig.los.find(s => s.section === "Underwriting")?.items || [];

  // 🔹 filter by role
  const filterByRole = (items) =>
    items.filter(i =>
      i.visibleTo.map(r => r.toLowerCase()).includes(normalizedRole)
    );
  console.log(filterByRole, 'filterByRolefilterByRole')
  // 🔹 final lists
  const salesScreens = filterByRole(salesItems);
  const topScreens = filterByRole(
    preUnderwritingTop.filter(i => i.route !== "Applicationhistory")
  );
  const appHistory = filterByRole(
    preUnderwritingTop.filter(i => i.route === "Applicationhistory")
  )[0];

  const preUnderwritingScreens = filterByRole(verificationItems);
  const underwritingScreens = filterByRole(underwritingItems);
  console.log(topScreens, preUnderwritingScreens, underwritingScreens, 'underwritingScreensunderwritingScreens')
  /** Animation */
  const slideAnim = useRef(new Animated.Value(-40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [expandPre, setExpandPre] = React.useState(false);
  const [expandUnder, setExpandUnder] = React.useState(false);

  const toggleSection = (setter) => {
    LayoutAnimation.easeInEaseOut();
    setter(prev => !prev);
  };

  const SectionHeader = ({ title, expanded, onPress }) => (
    <TouchableOpacity onPress={onPress} style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Icon
        name={expanded ? "chevron-up" : "chevron-down"}
        size={18}
        color="#2563EB"
      />
    </TouchableOpacity>
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const go = (route, params) => {
    navigation.navigate(route, params || {});
    closeDrawer();
  };


  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Where do you want to go?",
      [
        {
          text: "Module Selector",
          onPress: async () => {
            closeDrawer();

            // wait for drawer animation to finish
            await new Promise(resolve => setTimeout(resolve, 250));

            dispatch(logout());
          },
        },
        {
          text: "Login Again",
          onPress: async () => {
            closeDrawer();

            await new Promise(resolve => setTimeout(resolve, 250));

            dispatch(logoutOnly());
          },
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true }
    );
  };


  return (
    <LinearGradient colors={["#020617", "#0F172A"]} style={styles.container}>
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateX: slideAnim }],
        }}
      >
        {/* ================= PROFILE HEADER ================= */}
        <View style={styles.profileBox}>
          <LinearGradient
            colors={["#2563EB", "#1E40AF"]}
            style={styles.avatar}
          >
            <Text style={styles.avatarText}>
              {userProfile?.firstName.charAt(0)}
            </Text>
          </LinearGradient>

          <View>
            <Text style={styles.userName}>{userProfile?.firstName}</Text>
            <Text style={styles.userRole}>{currentRole}</Text>
          </View>
        </View>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.menuScrollContent}
        >
          {/* ================= MENU ================= */}
          <View style={styles.menu}>
            {normalizedRole === "sales" ? (
              /* ================= SALES ================= */
              salesScreens.map(s => {
                const active =
                  activeRouteInfo.name === s.route &&
                  activeRouteInfo.configKey === s.params?.configKey;

                return (
                  <TouchableOpacity
                    key={`${s.route}_${s.params?.configKey}`}
                    style={[styles.menuItem, active && styles.menuItemActive]}
                    onPress={() => go(s.route, s.params)}
                  >
                    {/* <Icon
                      name="chevron-forward-outline"
                      size={20}
                      color={active ? "#fff" : "#94A3B8"}
                    /> */}
                    <Icon
                      name={s.icon}
                      size={20}
                      color={active ? "#fff" : "#94A3B8"}
                      style={{ marginRight: 12 }}
                    />

                    <Text style={[styles.menuText, active && styles.menuTextActive]}>
                      {s.label}
                    </Text>
                    {active && <View style={styles.activeDot} />}
                  </TouchableOpacity>
                );
              })
            ) : (
              <>
                {/* ================= TOP SCREENS ================= */}
                {topScreens.map(s => {
                  const active =
                    activeRouteInfo.name === s.route &&
                    activeRouteInfo.configKey === s.params?.configKey;

                  return (
                    <TouchableOpacity
                      key={`${s.route}_${s.params?.configKey}`}
                      style={[styles.menuItem, active && styles.menuItemActive]}
                      onPress={() => go(s.route, s.params)}
                    >
                      {/* <Icon
                        name="chevron-forward-outline"
                        size={20}
                        color={active ? "#fff" : "#94A3B8"}
                      /> */}
                      <Icon
                        name={s.icon}
                        size={20}
                        color={active ? "#fff" : "#94A3B8"}
                        style={{ marginRight: 12 }}
                      />

                      <Text style={[styles.menuText, active && styles.menuTextActive]}>
                        {s.label}
                      </Text>
                      {active && <View style={styles.activeDot} />}
                    </TouchableOpacity>
                  );
                })}

                {/* ================= PRE-UNDERWRITING ================= */}
                {/* ================= PRE-UNDERWRITING ================= */}
                {preUnderwritingScreens.length > 0 && (
                  <>
                    <SectionHeader
                      title="Pre-Underwriting"
                      expanded={expandPre}
                      onPress={() => toggleSection(setExpandPre)}
                    />

                    {expandPre &&
                      preUnderwritingScreens.map(s => {
                        const active =
                          activeRouteInfo.name === s.route &&
                          activeRouteInfo.configKey === s.params?.configKey;

                        return (
                          <TouchableOpacity
                            key={`${s.route}_${s.params?.configKey}`}
                            style={[styles.menuItem, active && styles.menuItemActive]}
                            onPress={() => go(s.route, s.params)}
                          >
                            <View style={styles.dot} />
                            <Text style={[styles.menuText, active && styles.menuTextActive]}>
                              {s.label}
                            </Text>
                            {active && <View style={styles.activeDot} />}
                          </TouchableOpacity>
                        );
                      })}
                  </>
                )}

                {/* ================= UNDERWRITING ================= */}
                {underwritingScreens.length > 0 && (
                  <>
                    <SectionHeader
                      title="Underwriting"
                      expanded={expandUnder}
                      onPress={() => toggleSection(setExpandUnder)}
                    />

                    {expandUnder &&
                      underwritingScreens.map(s => {
                        const active =
                          activeRouteInfo.name === s.route &&
                          activeRouteInfo.configKey === s.params?.configKey;

                        return (
                          <TouchableOpacity
                            key={`${s.route}_${s.params?.configKey}`}
                            style={[styles.menuItem, active && styles.menuItemActive]}
                            onPress={() => go(s.route, s.params)}
                          >
                            <View style={styles.dot} />
                            <Text style={[styles.menuText, active && styles.menuTextActive]}>
                              {s.label}
                            </Text>
                            {active && <View style={styles.activeDot} />}
                          </TouchableOpacity>
                        );
                      })}
                  </>
                )}


                {/* ================= APPLICATION HISTORY (BOTTOM) ================= */}
                {appHistory && (
                  <TouchableOpacity
                    style={[
                      styles.menuItem,
                      activeRouteInfo.name === appHistory.route && styles.menuItemActive,
                    ]}
                    onPress={() => go(appHistory.route)}
                  >
                    <Icon
                      name="time-outline"
                      size={20}
                      color={
                        activeRouteInfo.name === appHistory.route ? "#fff" : "#94A3B8"
                      }
                    />
                    <Text
                      style={[
                        styles.menuText,
                        activeRouteInfo.name === appHistory.route &&
                        styles.menuTextActive,
                      ]}
                    >
                      {appHistory.label}
                    </Text>
                    {activeRouteInfo.name === appHistory.route && (
                      <View style={styles.activeDot} />
                    )}
                  </TouchableOpacity>
                )}

              </>
            )}
          </View>
        </ScrollView>


        {/* ================= LOGOUT ================= */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
        >
          <Icon name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 22,
  },

  profileBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },

  avatar: {
    height: 56,
    width: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },

  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },

  userName: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "700",
  },

  userRole: {
    color: "#94A3B8",
    fontSize: 13,
  },

  menu: {
    marginTop: 12,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
  },

  menuItemActive: {
    backgroundColor: "#2563EB",
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },

  menuText: {
    marginLeft: 14,
    fontSize: 15,
    color: "#CBD5E1",
    fontWeight: "500",
  },

  menuTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  activeDot: {
    marginLeft: "auto",
    height: 8,
    width: 8,
    borderRadius: 4,
    backgroundColor: "#38BDF8",
  },

  logoutBtn: {
    marginTop: "auto",
    backgroundColor: "#DC2626",
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#E8EEFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 8,
  },

  sectionHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2563EB",
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#9CA3AF",
    marginRight: 10,
  },

});
