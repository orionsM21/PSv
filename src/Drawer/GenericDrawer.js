import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import { DrawerContext } from './DrawerContext';
import { logout, logoutOnly } from '../redux/moduleSlice';

const DEFAULT_ACCENT = '#F8D66D';
const DEFAULT_ACCENT_SOFT = 'rgba(248,214,109,0.16)';

function getDeepestRouteName(state) {
  if (!state?.routes?.length) {
    return null;
  }

  const route = state.routes[state.index ?? 0];
  const nestedRouteName = route?.state
    ? getDeepestRouteName(route.state)
    : null;

  return nestedRouteName || route?.params?.screen || route?.name || null;
}

function isItemActive(item, activeRoute) {
  const activeRoutes = item.activeRoutes || [item.activeRoute || item.route];
  return activeRoutes.includes(activeRoute);
}

function withAlpha(color, alpha = '22') {
  if (
    typeof color === 'string' &&
    color.startsWith('#') &&
    color.length === 7
  ) {
    return `${color}${alpha}`;
  }

  return 'rgba(255,255,255,0.08)';
}

const StatChip = React.memo(function StatChip({ item, accent, compactLayout }) {
  return (
    <View
      style={[
        styles.statChip,
        compactLayout && styles.statChipCompact,
        {
          backgroundColor: withAlpha(accent, '16'),
          borderColor: withAlpha(accent, '26'),
        },
      ]}>
      <Text style={[styles.statValue, { color: accent }]}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );
});

const MenuItem = React.memo(function MenuItem({
  item,
  active,
  onPress,
  accent,
  accentSoft,
}) {
  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        containerTone: {
          backgroundColor: active ? accentSoft : 'rgba(255,255,255,0.05)',
        },
        activeBorder: {
          borderColor: withAlpha(accent, '32'),
        },
        iconTone: {
          backgroundColor: active
            ? withAlpha(accent, '22')
            : 'rgba(255,255,255,0.08)',
        },
      }),
    [accent, accentSoft, active],
  );

  return (
    <Pressable
      onPress={onPress}
      disabled={item.disabled}
      style={({ pressed }) => [
        styles.menuItem,
        dynamicStyles.containerTone,
        active && [styles.menuItemActive, dynamicStyles.activeBorder],
        pressed && styles.pressed,
        item.disabled && styles.disabled,
      ]}>
      <View style={[styles.iconWrap, dynamicStyles.iconTone]}>
        <Ionicons
          name={item.icon}
          size={20}
          color={active ? accent : '#D8E2F0'}
        />
      </View>

      <View style={styles.menuCopy}>
        <Text style={[styles.menuText, active && styles.menuTextActive]}>
          {item.label}
        </Text>
        {item.description ? (
          <Text
            numberOfLines={1}
            style={[
              styles.menuDescription,
              active && styles.menuDescriptionActive,
            ]}>
            {item.description}
          </Text>
        ) : null}
      </View>

      {item.badge ? (
        <View style={[styles.badge, { backgroundColor: accent }]}>
          <Text style={styles.badgeText}>{item.badge}</Text>
        </View>
      ) : null}

      <Ionicons
        name="chevron-forward"
        size={18}
        color={active ? accent : '#7F90A8'}
      />
    </Pressable>
  );
});

const Section = React.memo(function Section({ title, children }) {
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  );
});

export default function GenericDrawer({ config }) {
  console.log(config, 'configconfig')
  const navigation = useNavigation();
  const { closeDrawer } = React.useContext(DrawerContext);
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const compactLayout = width < scale(390);

  const activeRoute = useNavigationState(state => getDeepestRouteName(state));

  const theme = useMemo(
    () => ({
      accent: config?.accent || DEFAULT_ACCENT,
      accentSoft: config?.accentSoft || DEFAULT_ACCENT_SOFT,
    }),
    [config],
  );

  const sections = useMemo(() => {
    if (!config) {
      return [];
    }

    if (config.sections) {
      return config.sections;
    }

    return [{ items: config.menus || [] }];
  }, [config]);

  const go = useCallback(
    (route, params) => {
      closeDrawer();
      InteractionManager.runAfterInteractions(() => {
        navigation.navigate(route, params);
      });
    },
    [closeDrawer, navigation],
  );

  const handleLogout = useCallback(() => {
    Alert.alert('Logout', 'Where do you want to go?', [
      {
        text: 'Module Selector',
        onPress: () => {
          closeDrawer();
          InteractionManager.runAfterInteractions(() => dispatch(logout()));
        },
      },
      {
        text: 'Login Again',
        onPress: () => {
          closeDrawer();
          InteractionManager.runAfterInteractions(() => dispatch(logoutOnly()));
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }, [closeDrawer, dispatch]);

  if (!config) {
    return null;
  }

  return (
    <LinearGradient
      colors={config.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          compactLayout && styles.scrollContentCompact,
        ]}>
        <View
          style={[
            styles.headerCard,
            compactLayout && styles.headerCardCompact,
          ]}>
          <View
            style={[
              styles.headerTop,
              compactLayout && styles.headerTopCompact,
            ]}>
            <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
              <Text style={styles.avatarText}>{config.avatar}</Text>
            </View>

            <View
              style={[
                styles.headerChip,
                { borderColor: withAlpha(theme.accent, '2A') },
              ]}>
              <Ionicons
                name="sparkles-outline"
                size={13}
                color={theme.accent}
                style={styles.headerChipIcon}
              />
              <Text style={[styles.headerChipText, { color: theme.accent }]}>
                {config.eyebrow || 'Business Module'}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.subTitle}>
            {config.subtitle || 'Operational workspace'}
          </Text>

          {config.stats?.length ? (
            <View
              style={[
                styles.statsWrap,
                compactLayout && styles.statsWrapCompact,
              ]}>
              {config.stats.map(item => (
                <StatChip
                  key={`${item.label}-${item.value}`}
                  item={item}
                  accent={theme.accent}
                  compactLayout={compactLayout}
                />
              ))}
            </View>
          ) : null}
        </View>

        <View
          style={[styles.menuPanel, compactLayout && styles.menuPanelCompact]}>
          {sections.map((section, index) => (
            <Section
              key={`${section.section || 'section'}-${index}`}
              title={section.section}>
              {section.items.map(item => (
                <MenuItem
                  key={item.key || `${item.label}-${item.route}`}
                  item={item}
                  active={isItemActive(item, activeRoute)}
                  accent={theme.accent}
                  accentSoft={theme.accentSoft}
                  onPress={() => go(item.route, item.params)}
                />
              ))}
            </Section>
          ))}
        </View>

        {config.footerTitle || config.footerText ? (
          <View style={styles.footerNote}>
            <Text style={styles.footerTitle}>
              {config.footerTitle || 'Operational workspace'}
            </Text>
            <Text style={styles.footerText}>
              {config.footerText ||
                'Designed to keep navigation clear and fast.'}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
        onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#FFF7F7" />
        <Text style={styles.logoutText}>Logout</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(18),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(16),
  },
  scrollContent: {
    paddingBottom: verticalScale(22),
  },
  scrollContentCompact: {
    paddingBottom: verticalScale(16),
  },
  headerCard: {
    backgroundColor: 'rgba(10,14,22,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: moderateScale(24),
    padding: moderateScale(16),
    marginBottom: verticalScale(16),
  },
  headerCardCompact: {
    padding: moderateScale(14),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(12),
  },
  headerTopCompact: {
    alignItems: 'flex-start',
  },
  avatar: {
    width: scale(58),
    height: scale(58),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: moderateScale(24),
    fontWeight: '800',
    color: '#08111F',
  },
  headerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(7),
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerChipIcon: {
    marginRight: scale(6),
  },
  headerChipText: {
    fontSize: moderateScale(10),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  title: {
    fontSize: moderateScale(22),
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: verticalScale(4),
  },
  subTitle: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(18),
    color: '#D1DBE6',
  },
  statsWrap: {
    flexDirection: 'row',
    // flexWrap: 'wrap',
    marginTop: verticalScale(14),
  },
  statsWrapCompact: {
    marginTop: verticalScale(12),
  },
  statChip: {
    minWidth: '31%',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(14),
    borderWidth: 1,
    marginRight: scale(8),
    marginBottom: verticalScale(8),
  },
  statChipCompact: {
    minWidth: '47%',
  },
  statValue: {
    fontSize: moderateScale(13),
    fontWeight: '800',
    marginBottom: verticalScale(2),
  },
  statLabel: {
    color: '#CFD8E3',
    fontSize: moderateScale(10),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  menuPanel: {
    backgroundColor: 'rgba(10,14,22,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: moderateScale(24),
    padding: moderateScale(14),
  },
  menuPanelCompact: {
    padding: moderateScale(12),
  },
  section: {
    marginBottom: verticalScale(10),
  },
  sectionTitle: {
    color: '#9FB0C5',
    fontSize: moderateScale(12),
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: verticalScale(10),
    marginLeft: scale(4),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: moderateScale(18),
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(13),
    marginBottom: verticalScale(10),
  },
  menuItemActive: {
    shadowColor: '#000',
    shadowOpacity: 0.14,
    shadowRadius: moderateScale(12),
    shadowOffset: { width: 0, height: verticalScale(8) },
    elevation: 4,
  },
  iconWrap: {
    width: scale(38),
    height: scale(38),
    borderRadius: moderateScale(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuCopy: {
    flex: 1,
    marginLeft: scale(12),
    marginRight: scale(8),
  },
  menuText: {
    fontSize: moderateScale(15),
    color: '#F8FAFC',
    fontWeight: '700',
  },
  menuTextActive: {
    color: '#FFFFFF',
  },
  menuDescription: {
    marginTop: verticalScale(3),
    color: '#9FB0C5',
    fontSize: moderateScale(12),
  },
  menuDescriptionActive: {
    color: 'rgba(255,255,255,0.78)',
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: scale(8),
    paddingVertical: verticalScale(4),
    marginRight: scale(8),
  },
  badgeText: {
    color: '#08111F',
    fontSize: moderateScale(10),
    fontWeight: '800',
  },
  footerNote: {
    marginTop: verticalScale(14),
    paddingHorizontal: scale(4),
  },
  footerTitle: {
    color: '#F8FAFC',
    fontSize: moderateScale(13),
    fontWeight: '700',
    marginBottom: verticalScale(4),
  },
  footerText: {
    color: '#B6C4D6',
    fontSize: moderateScale(12),
    lineHeight: moderateScale(18),
  },
  logoutBtn: {
    marginTop: 'auto',
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
  },
  disabled: {
    opacity: 0.45,
  },
});
