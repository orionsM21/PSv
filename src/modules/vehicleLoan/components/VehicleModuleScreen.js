import React, {useContext} from 'react';
import {
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import {moderateScale, scale, verticalScale} from 'react-native-size-matters';

import {DrawerContext} from '../../../Drawer/DrawerContext';
import {VehicleMetricPill} from './VehicleUi';
import {withOpacity} from '../theme/uiTheme';

export default function VehicleModuleScreen({
  theme,
  title,
  subtitle,
  eyebrow = 'Vehicle Loan',
  heroStats = [],
  children,
  showBack = false,
  scrollable = true,
  contentContainerStyle,
  compactHero = false,
}) {
  const navigation = useNavigation();
  const drawer = useContext(DrawerContext);
  const {width} = useWindowDimensions();
  const compactLayout = width < scale(390);

  const onNavPress = () => {
    if (showBack) {
      navigation.goBack();
      return;
    }

    drawer?.openDrawer?.();
  };

  const ScreenBody = scrollable ? ScrollView : View;
  const screenBodyProps = scrollable
    ? {
        contentContainerStyle: [styles.contentContainer, contentContainerStyle],
        showsVerticalScrollIndicator: false,
      }
    : {style: [styles.contentContainer, contentContainerStyle]};

  return (
    <SafeAreaView style={[styles.safeArea, {backgroundColor: theme.pageBg}]}>
      <StatusBar
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={
          theme.pageGradient || [theme.pageBg, theme.pageAccent || theme.pageBg]
        }
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.container}>
        <LinearGradient
          colors={theme.headerGradient}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={[
            styles.hero,
            compactHero && styles.heroCompact,
            compactLayout && styles.heroResponsive,
          ]}>
          <View
            style={[
              styles.heroTopRow,
              compactHero && styles.heroTopRowCompact,
              compactLayout && styles.heroTopRowResponsive,
            ]}>
            <Pressable
              onPress={onNavPress}
              style={[
                styles.iconButton,
                compactHero && styles.iconButtonCompact,
                compactLayout && styles.iconButtonResponsive,
                {
                  backgroundColor: withOpacity(
                    '#FFFFFF',
                    theme.isDark ? 0.14 : 0.18,
                  ),
                  borderColor: withOpacity(
                    '#FFFFFF',
                    theme.isDark ? 0.12 : 0.2,
                  ),
                },
              ]}>
              <Ionicons
                name={showBack ? 'arrow-back-outline' : 'menu-outline'}
                size={20}
                color="#FFFFFF"
              />
            </Pressable>

            <View
              style={[
                styles.heroBadge,
                compactLayout && styles.heroBadgeResponsive,
                {
                  backgroundColor: withOpacity(
                    '#FFFFFF',
                    theme.isDark ? 0.14 : 0.18,
                  ),
                  borderColor: withOpacity('#FFFFFF', 0.16),
                },
              ]}>
              <Ionicons name="car-sport-outline" size={14} color="#FFFFFF" />
              <Text style={styles.heroBadgeText}>Retail Auto Finance</Text>
            </View>
          </View>

          <Text
            style={[
              styles.eyebrow,
              compactHero && styles.eyebrowCompact,
              compactLayout && styles.eyebrowResponsive,
            ]}>
            {eyebrow}
          </Text>
          <Text
            style={[
              styles.title,
              compactHero && styles.titleCompact,
              compactLayout && styles.titleResponsive,
            ]}>
            {title}
          </Text>
          <Text
            style={[
              styles.subtitle,
              compactHero && styles.subtitleCompact,
              compactLayout && styles.subtitleResponsive,
            ]}>
            {subtitle}
          </Text>

          {heroStats.length ? (
            <View
              style={[
                styles.heroStatsRow,
                compactHero && styles.heroStatsRowCompact,
                compactLayout && styles.heroStatsRowResponsive,
              ]}>
              {heroStats.map((item, index) => (
                <VehicleMetricPill
                  key={`${item.label}-${index}`}
                  label={item.label}
                  value={item.value}
                  theme={theme}
                />
              ))}
            </View>
          ) : null}
        </LinearGradient>

        <ScreenBody {...screenBodyProps}>{children}</ScreenBody>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  hero: {
    paddingHorizontal: scale(20),
    paddingTop: verticalScale(12),
    paddingBottom: verticalScale(28),
    borderBottomLeftRadius: moderateScale(28),
    borderBottomRightRadius: moderateScale(28),
  },
  heroCompact: {
    paddingBottom: verticalScale(18),
    borderBottomLeftRadius: moderateScale(24),
    borderBottomRightRadius: moderateScale(24),
  },
  heroResponsive: {
    paddingHorizontal: scale(16),
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: verticalScale(18),
  },
  heroTopRowCompact: {
    marginBottom: verticalScale(12),
  },
  heroTopRowResponsive: {
    alignItems: 'flex-start',
  },
  iconButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonCompact: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(14),
  },
  iconButtonResponsive: {
    width: scale(38),
    height: scale(38),
  },
  heroBadge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroBadgeResponsive: {
    maxWidth: '68%',
  },
  heroBadgeText: {
    color: '#FFFFFF',
    fontSize: moderateScale(11),
    fontWeight: '700',
    marginLeft: scale(6),
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: moderateScale(12),
    fontWeight: '700',
    marginBottom: verticalScale(8),
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  eyebrowCompact: {
    marginBottom: verticalScale(6),
    fontSize: moderateScale(11),
  },
  eyebrowResponsive: {
    letterSpacing: 0.6,
  },
  title: {
    color: '#FFFFFF',
    fontSize: moderateScale(28),
    fontWeight: '800',
    marginBottom: verticalScale(8),
  },
  titleCompact: {
    fontSize: moderateScale(24),
    marginBottom: verticalScale(6),
  },
  titleResponsive: {
    fontSize: moderateScale(24),
  },
  subtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: moderateScale(14),
    lineHeight: moderateScale(21),
  },
  subtitleCompact: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
  },
  subtitleResponsive: {
    maxWidth: '96%',
  },
  heroStatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: verticalScale(20),
  },
  heroStatsRowCompact: {
    marginTop: verticalScale(14),
  },
  heroStatsRowResponsive: {
    rowGap: verticalScale(10),
  },
  contentContainer: {
    paddingHorizontal: scale(16),
    paddingTop: verticalScale(18),
    paddingBottom: verticalScale(28),
  },
});
