import React, {useEffect, useMemo, useRef} from 'react';
import {
  Alert,
  Animated,
  InteractionManager,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  UIManager,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  CommonActions,
  useNavigation,
  useNavigationState,
} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

import {DrawerContext} from '../DrawerContext';
import {logout, logoutOnly} from '../../redux/moduleSlice';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const drawerConfig = {
  los: [
    {
      section: 'Sales',
      items: [
        {
          label: 'Home',
          route: 'Home',
          icon: 'home-outline',
          visibleTo: ['sales'],
        },
        {
          label: 'Lead',
          route: 'Lead',
          icon: 'people-outline',
          visibleTo: ['sales'],
        },
        {
          label: 'Application Status',
          route: 'Application Status',
          icon: 'document-text-outline',
          visibleTo: ['sales'],
        },
      ],
    },
    {
      section: 'Pre-Underwriting',
      items: [
        {
          label: 'Dashboard',
          route: 'Dashboard',
          icon: 'grid-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
        {
          label: 'Credit Lead',
          route: 'Credit Lead',
          icon: 'card-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
        {
          label: 'Worklist',
          route: 'Worklist',
          icon: 'list-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
        {
          label: 'Deviation Worklist',
          route: 'Credit WorkList',
          icon: 'alert-circle-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
        {
          label: 'Application History',
          route: 'Applicationhistory',
          icon: 'time-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
      ],
    },
    {
      section: 'Verification',
      collapsible: true,
      items: [
        {
          label: 'Initiate Verification',
          route: 'VerificationScreen',
          params: {configKey: 'INITIATE_VERIFICATION'},
          icon: 'checkmark-circle-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
        {
          label: 'Residence Verification',
          route: 'VerificationScreen',
          params: {configKey: 'RESIDENCE_VERIFICATION'},
          icon: 'home-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
        {
          label: 'Office Verification',
          route: 'VerificationScreen',
          params: {configKey: 'OFFICE_VERIFICATION'},
          icon: 'business-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
        {
          label: 'Initiate RCU',
          route: 'VerificationScreen',
          params: {configKey: 'INITIATE_RCU'},
          icon: 'play-circle-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
        {
          label: 'Update RCU Details',
          route: 'VerificationScreen',
          params: {configKey: 'RCU'},
          icon: 'create-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
        {
          label: 'Personal Discussion',
          route: 'VerificationScreen',
          params: {configKey: 'PERSONAL_DISCUSSION'},
          icon: 'chatbubble-ellipses-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
        {
          label: 'Verification Waiver',
          route: 'VerificationScreen',
          params: {configKey: 'VERIFICATION_WAIVER'},
          icon: 'ban-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
      ],
    },
    {
      section: 'Underwriting',
      collapsible: true,
      items: [
        {
          label: 'Decision',
          route: 'VerificationScreen',
          params: {configKey: 'DECISION'},
          icon: 'checkmark-done-outline',
          visibleTo: ['Credit', 'CEO', 'ch', 'op', 'legal'],
        },
      ],
    },
  ],
};

function getInitial(name) {
  return (name || 'U').trim().charAt(0).toUpperCase();
}

function MenuItem({item, active, onPress, compactLayout, nested = false}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.menuItem,
        compactLayout && styles.menuItemCompact,
        nested && styles.menuItemNested,
        active && styles.menuItemActive,
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.menuIconWrap,
          compactLayout && styles.menuIconWrapCompact,
          active && styles.menuIconWrapActive,
        ]}>
        {nested ? (
          <View style={[styles.nestedDot, active && styles.nestedDotActive]} />
        ) : (
          <Icon
            name={item.icon}
            size={compactLayout ? scale(18) : scale(20)}
            color={active ? '#08111F' : '#9DB1C9'}
          />
        )}
      </View>

      <View style={styles.menuCopy}>
        <Text
          numberOfLines={1}
          style={[styles.menuText, active && styles.menuTextActive]}>
          {item.label}
        </Text>
        {item.params?.configKey ? (
          <Text
            numberOfLines={1}
            style={[
              styles.menuHint,
              active && styles.menuHintActive,
              compactLayout && styles.menuHintCompact,
            ]}>
            {item.params.configKey.replace(/_/g, ' ')}
          </Text>
        ) : null}
      </View>

      {active ? <View style={styles.activeDot} /> : null}
    </Pressable>
  );
}

function SectionHeader({title, expanded, onPress, compactLayout}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.sectionHeader,
        compactLayout && styles.sectionHeaderCompact,
        pressed && styles.pressed,
      ]}>
      <Text
        style={[
          styles.sectionHeaderText,
          compactLayout && styles.sectionHeaderTextCompact,
        ]}>
        {title}
      </Text>
      <Icon
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={compactLayout ? scale(18) : scale(20)}
        color="#60A5FA"
      />
    </Pressable>
  );
}

export default function LOSDrawerUI() {
  const navigation = useNavigation();
  const {closeDrawer} = React.useContext(DrawerContext);
  const dispatch = useDispatch();
  const {width, height} = useWindowDimensions();
  const compactLayout = width < scale(390);
  const shortScreen = height < verticalScale(760);

  const userProfile = useSelector(state => state.auth.losuserDetails);
  const currentRole = userProfile?.role?.[0]?.roleCode?.trim().toLowerCase();

  const activeRouteInfo = useNavigationState(state => {
    const route = state?.routes?.[state.index];
    return {
      name: route?.name,
      configKey: route?.params?.configKey,
    };
  });

  const slideAnim = useRef(new Animated.Value(-40)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [expandPre, setExpandPre] = React.useState(false);
  const [expandUnder, setExpandUnder] = React.useState(false);

  const salesItems = useMemo(
    () =>
      drawerConfig.los.find(section => section.section === 'Sales')?.items ||
      [],
    [],
  );
  const preUnderwritingTop = useMemo(
    () =>
      drawerConfig.los.find(section => section.section === 'Pre-Underwriting')
        ?.items || [],
    [],
  );
  const verificationItems = useMemo(
    () =>
      drawerConfig.los.find(section => section.section === 'Verification')
        ?.items || [],
    [],
  );
  const underwritingItems = useMemo(
    () =>
      drawerConfig.los.find(section => section.section === 'Underwriting')
        ?.items || [],
    [],
  );

  const filterByRole = useMemo(
    () => items =>
      items.filter(item =>
        item.visibleTo
          .map(role => role.toLowerCase())
          .includes(currentRole || ''),
      ),
    [currentRole],
  );

  const salesScreens = filterByRole(salesItems);
  const topScreens = filterByRole(
    preUnderwritingTop.filter(item => item.route !== 'Applicationhistory'),
  );
  const appHistory = filterByRole(
    preUnderwritingTop.filter(item => item.route === 'Applicationhistory'),
  )[0];
  const preUnderwritingScreens = filterByRole(verificationItems);
  const underwritingScreens = filterByRole(underwritingItems);

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
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    const isPreActive = verificationItems.some(
      item =>
        activeRouteInfo.name === item.route &&
        activeRouteInfo.configKey === item.params?.configKey,
    );

    const isUnderActive = underwritingItems.some(
      item =>
        activeRouteInfo.name === item.route &&
        activeRouteInfo.configKey === item.params?.configKey,
    );

    if (isPreActive) {
      setExpandPre(true);
    }

    if (isUnderActive) {
      setExpandUnder(true);
    }
  }, [activeRouteInfo, underwritingItems, verificationItems]);

  const toggleSection = setter => {
    LayoutAnimation.easeInEaseOut();
    setter(previous => !previous);
  };

  const go = (route, params) => {
    navigation.navigate(route, params || {});
    closeDrawer();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Where do you want to go?', [
      {
        text: 'Module Selector',
        onPress: () => {
          closeDrawer();
          InteractionManager.runAfterInteractions(() => {
            dispatch(logout());
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'ModuleSelector'}],
              }),
            );
          });
        },
      },
      {
        text: 'Login Again',
        onPress: () => {
          closeDrawer();
          InteractionManager.runAfterInteractions(() => {
            dispatch(logoutOnly());
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{name: 'ModuleFlow'}],
              }),
            );
          });
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const renderItem = (item, nested = false) => {
    const active =
      activeRouteInfo.name === item.route &&
      activeRouteInfo.configKey === item.params?.configKey;

    return (
      <MenuItem
        key={`${item.route}_${item.params?.configKey || item.label}`}
        item={item}
        active={active}
        onPress={() => go(item.route, item.params)}
        compactLayout={compactLayout}
        nested={nested}
      />
    );
  };

  return (
    <LinearGradient
      colors={['#020617', '#081223', '#0F172A']}
      style={styles.container}>
      <Animated.View
        style={[
          styles.animatedShell,
          {
            opacity: fadeAnim,
            transform: [{translateX: slideAnim}],
          },
        ]}>
        <View
          style={[
            styles.profileCard,
            compactLayout && styles.profileCardCompact,
          ]}>
          <LinearGradient
            colors={['#2563EB', '#1D4ED8']}
            style={[styles.avatar, compactLayout && styles.avatarCompact]}>
            <Text
              style={[
                styles.avatarText,
                compactLayout && styles.avatarTextCompact,
              ]}>
              {getInitial(userProfile?.firstName)}
            </Text>
          </LinearGradient>

          <View style={styles.profileCopy}>
            <Text
              numberOfLines={1}
              style={[
                styles.userName,
                compactLayout && styles.userNameCompact,
              ]}>
              {userProfile?.firstName || 'LOS User'}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.userRole,
                compactLayout && styles.userRoleCompact,
              ]}>
              {(currentRole || 'Role').toUpperCase()}
            </Text>
            <View style={styles.rolePill}>
              <Text style={styles.rolePillText}>LOS Workspace</Text>
            </View>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            shortScreen && styles.scrollContentShort,
          ]}>
          <View style={styles.menuShell}>
            {currentRole === 'sales' ? (
              salesScreens.map(item => renderItem(item))
            ) : (
              <>
                {topScreens.map(item => renderItem(item))}

                {preUnderwritingScreens.length ? (
                  <>
                    <SectionHeader
                      title="Pre-Underwriting"
                      expanded={expandPre}
                      onPress={() => toggleSection(setExpandPre)}
                      compactLayout={compactLayout}
                    />
                    {expandPre
                      ? preUnderwritingScreens.map(item =>
                          renderItem(item, true),
                        )
                      : null}
                  </>
                ) : null}

                {underwritingScreens.length ? (
                  <>
                    <SectionHeader
                      title="Underwriting"
                      expanded={expandUnder}
                      onPress={() => toggleSection(setExpandUnder)}
                      compactLayout={compactLayout}
                    />
                    {expandUnder
                      ? underwritingScreens.map(item => renderItem(item, true))
                      : null}
                  </>
                ) : null}

                {appHistory ? renderItem(appHistory) : null}
              </>
            )}
          </View>
        </ScrollView>

        <Pressable
          onPress={handleLogout}
          style={({pressed}) => [styles.logoutBtn, pressed && styles.pressed]}>
          <Icon name="log-out-outline" size={scale(20)} color="#FFF7F7" />
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(14),
  },
  animatedShell: {
    flex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderRadius: moderateScale(24),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.12)',
    marginBottom: verticalScale(18),
  },
  profileCardCompact: {
    padding: moderateScale(14),
    borderRadius: moderateScale(22),
  },
  avatar: {
    width: scale(56),
    height: scale(56),
    borderRadius: moderateScale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(12),
  },
  avatarCompact: {
    width: scale(50),
    height: scale(50),
    borderRadius: moderateScale(18),
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: moderateScale(22),
    fontWeight: '800',
  },
  avatarTextCompact: {
    fontSize: moderateScale(18),
  },
  profileCopy: {
    flex: 1,
  },
  userName: {
    color: '#F8FAFC',
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  userNameCompact: {
    fontSize: moderateScale(16),
  },
  userRole: {
    color: '#94A3B8',
    fontSize: moderateScale(12),
    fontWeight: '600',
    marginTop: verticalScale(3),
  },
  userRoleCompact: {
    fontSize: moderateScale(11),
  },
  rolePill: {
    alignSelf: 'flex-start',
    marginTop: verticalScale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 999,
    backgroundColor: 'rgba(96,165,250,0.16)',
  },
  rolePillText: {
    color: '#93C5FD',
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  scrollContent: {
    paddingBottom: verticalScale(18),
  },
  scrollContentShort: {
    paddingBottom: verticalScale(12),
  },
  menuShell: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: moderateScale(22),
    padding: moderateScale(12),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: moderateScale(18),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(12),
    marginBottom: verticalScale(10),
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  menuItemCompact: {
    paddingVertical: verticalScale(11),
  },
  menuItemNested: {
    backgroundColor: 'rgba(15,23,42,0.76)',
  },
  menuItemActive: {
    backgroundColor: '#60A5FA',
    borderColor: 'rgba(191,219,254,0.75)',
  },
  menuIconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(14),
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconWrapCompact: {
    width: scale(34),
    height: scale(34),
  },
  menuIconWrapActive: {
    backgroundColor: 'rgba(8,17,31,0.16)',
  },
  menuCopy: {
    flex: 1,
    marginLeft: scale(12),
    marginRight: scale(10),
  },
  menuText: {
    color: '#E2E8F0',
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  menuTextActive: {
    color: '#08111F',
  },
  menuHint: {
    color: '#7F90A8',
    fontSize: moderateScale(10),
    fontWeight: '700',
    marginTop: verticalScale(3),
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  menuHintCompact: {
    fontSize: moderateScale(9.5),
  },
  menuHintActive: {
    color: 'rgba(8,17,31,0.7)',
  },
  nestedDot: {
    width: scale(7),
    height: scale(7),
    borderRadius: 999,
    backgroundColor: '#7F90A8',
  },
  nestedDotActive: {
    backgroundColor: '#08111F',
  },
  activeDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: 999,
    backgroundColor: '#08111F',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(37,99,235,0.12)',
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(12),
    paddingHorizontal: scale(14),
    marginBottom: verticalScale(10),
    marginTop: verticalScale(2),
  },
  sectionHeaderCompact: {
    paddingVertical: verticalScale(10),
  },
  sectionHeaderText: {
    color: '#60A5FA',
    fontSize: moderateScale(14),
    fontWeight: '800',
  },
  sectionHeaderTextCompact: {
    fontSize: moderateScale(13),
  },
  logoutBtn: {
    marginTop: verticalScale(12),
    backgroundColor: '#C9353F',
    borderRadius: moderateScale(18),
    paddingVertical: verticalScale(14),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF7F7',
    marginLeft: scale(8),
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.9,
    transform: [{scale: 0.995}],
  },
});
