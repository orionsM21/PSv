import React, {memo, useEffect, useMemo, useRef} from 'react';
import {
  Alert,
  Animated,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {useNavigation, useNavigationState} from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import {useDispatch, useSelector} from 'react-redux';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

import {DrawerContext} from '../DrawerContext';
import {logout, logoutOnly} from '../../redux/moduleSlice';

const drawerConfig = [
  {
    label: 'Dashboard',
    route: 'Dashboard',
    icon: 'grid-outline',
    visibleTo: ['all'],
  },
  {
    label: 'Allocation',
    route: 'Allocation',
    icon: 'layers-outline',
    visibleTo: ['all'],
  },
  {
    label: 'Deposition',
    route: 'Deposition',
    icon: 'wallet-outline',
    visibleTo: ['all'],
  },
  {
    label: 'Livetracking',
    route: 'Livetracking',
    icon: 'navigate-outline',
    visibleTo: [
      'cca',
      'op',
      'sh',
      'fa',
      'atl',
      'aa',
      'rh',
      'ch',
      'nrm',
      'mis',
      'zrm',
      'rrm',
      'prm',
      'arm',
      'r1',
    ],
  },
];

const MenuItem = memo(function MenuItem({
  item,
  active,
  onPress,
  compactLayout,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.menuItem,
        compactLayout && styles.menuItemCompact,
        active && styles.menuItemActive,
        pressed && styles.pressed,
      ]}>
      <View
        style={[
          styles.iconWrap,
          compactLayout && styles.iconWrapCompact,
          active && styles.iconWrapActive,
        ]}>
        <Icon
          name={item.icon}
          size={compactLayout ? scale(18) : scale(20)}
          color={active ? '#08111F' : '#CBD5E1'}
        />
      </View>
      <Text
        numberOfLines={1}
        style={[styles.menuText, active && styles.menuTextActive]}>
        {item.label}
      </Text>
      {active ? <View style={styles.activeRail} /> : null}
    </Pressable>
  );
});

function getInitial(name) {
  return (name || 'U').trim().charAt(0).toUpperCase();
}

export default function CollectionDrawerUI() {
  const navigation = useNavigation();
  const {closeDrawer} = React.useContext(DrawerContext);
  const dispatch = useDispatch();
  const {width, height} = useWindowDimensions();
  const compactLayout = width < scale(390);
  const shortScreen = height < verticalScale(760);

  const userProfile = useSelector(state => state.auth.userProfile);
  const currentRole = userProfile?.role?.[0]?.roleCode?.toLowerCase();
  const activeRoute = useNavigationState(
    state => state?.routes?.[state.index]?.name,
  );

  const menuItems = useMemo(
    () =>
      drawerConfig.filter(
        item =>
          item.visibleTo.includes('all') ||
          item.visibleTo.includes(currentRole),
      ),
    [currentRole],
  );

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
  }, [fadeAnim, slideAnim]);

  const navigateTo = screen => {
    navigation.navigate(screen);
    closeDrawer();
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Choose an option', [
      {
        text: 'Module Selector',
        onPress: () => {
          closeDrawer();
          InteractionManager.runAfterInteractions(() => {
            dispatch(logout());
          });
        },
      },
      {
        text: 'Login Again',
        onPress: () => {
          closeDrawer();
          InteractionManager.runAfterInteractions(() => {
            dispatch(logoutOnly());
          });
        },
      },
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  return (
    <LinearGradient
      colors={['#020617', '#071321', '#0F172A']}
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
              {`${userProfile?.firstName || ''} ${
                userProfile?.lastName || ''
              }`.trim() || 'Collection User'}
            </Text>
            <Text
              numberOfLines={1}
              style={[
                styles.userRole,
                compactLayout && styles.userRoleCompact,
              ]}>
              {(currentRole || 'Role').toUpperCase()}
            </Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Collections Desk</Text>
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
            {menuItems.map(item => (
              <MenuItem
                key={item.route}
                item={item}
                active={activeRoute === item.route}
                onPress={() => navigateTo(item.route)}
                compactLayout={compactLayout}
              />
            ))}
          </View>

          <View style={styles.footerCard}>
            <View style={styles.footerIconWrap}>
              <Icon name="shield-checkmark-outline" size={18} color="#93C5FD" />
            </View>
            <View style={styles.footerCopy}>
              <Text style={styles.footerTitle}>Field-ready workspace</Text>
              <Text style={styles.footerText}>
                The drawer now scales better across compact devices while
                keeping quick access to collection actions.
              </Text>
            </View>
          </View>
        </ScrollView>

        <Pressable
          style={({pressed}) => [styles.logoutBtn, pressed && styles.pressed]}
          onPress={handleLogout}>
          <Icon name="log-out-outline" size={scale(20)} color="#FCA5A5" />
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
    borderColor: 'rgba(148,163,184,0.14)',
    marginBottom: verticalScale(18),
  },
  profileCardCompact: {
    padding: moderateScale(14),
  },
  avatar: {
    width: scale(52),
    height: scale(52),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  avatarCompact: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(16),
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: moderateScale(21),
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
    marginTop: verticalScale(3),
    fontWeight: '600',
  },
  userRoleCompact: {
    fontSize: moderateScale(11),
  },
  roleBadge: {
    alignSelf: 'flex-start',
    marginTop: verticalScale(8),
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(4),
    borderRadius: 999,
    backgroundColor: 'rgba(59,130,246,0.18)',
  },
  roleText: {
    color: '#DBEAFE',
    fontSize: moderateScale(10),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
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
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(13),
    paddingHorizontal: scale(12),
    borderRadius: moderateScale(18),
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: verticalScale(10),
  },
  menuItemCompact: {
    paddingVertical: verticalScale(11),
  },
  menuItemActive: {
    backgroundColor: 'rgba(147,197,253,0.9)',
  },
  iconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(14),
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapCompact: {
    width: scale(34),
    height: scale(34),
  },
  iconWrapActive: {
    backgroundColor: 'rgba(8,17,31,0.12)',
  },
  menuText: {
    flex: 1,
    marginLeft: scale(12),
    color: '#E2E8F0',
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  menuTextActive: {
    color: '#08111F',
  },
  activeRail: {
    width: scale(8),
    height: scale(8),
    borderRadius: 999,
    backgroundColor: '#08111F',
  },
  footerCard: {
    marginTop: verticalScale(14),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.12)',
    borderRadius: moderateScale(20),
    padding: moderateScale(14),
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  footerIconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(14),
    backgroundColor: 'rgba(96,165,250,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scale(12),
  },
  footerCopy: {
    flex: 1,
  },
  footerTitle: {
    color: '#F8FAFC',
    fontSize: moderateScale(14),
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  footerText: {
    color: '#AAB8C8',
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
  },
  logoutBtn: {
    marginTop: verticalScale(12),
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(18),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(185,28,28,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(248,113,113,0.22)',
  },
  logoutText: {
    color: '#FCA5A5',
    marginLeft: scale(10),
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.92,
    transform: [{scale: 0.995}],
  },
});
