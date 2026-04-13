import React, { memo, useCallback, useRef } from 'react';
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import AppLayout from '../AppLayout';
import { APP_THEME } from '../appTheme';
import { MODULE_SELECTOR_CARD_HEIGHT } from '../business/moduleSelector.rules';
import { ROLE_OPTIONS } from '../moduleRegistry';

const AnimatedPressableCard = memo(function AnimatedPressableCard({
  item,
  onPress,
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const pressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.985,
      friction: 7,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const pressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  const handlePress = useCallback(() => {
    onPress(item.id);
  }, [item.id, onPress]);

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPressIn={pressIn}
        onPressOut={pressOut}
        onPress={handlePress}
        style={({ pressed }) => [
          styles.cardPressable,
          pressed ? styles.pressed : null,
        ]}>
        <LinearGradient
          colors={item.gradient}
          start={GRADIENT_START}
          end={GRADIENT_END}
          style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconBox}>
              <Ionicons name={item.icon} size={22} color={APP_THEME.white} />
            </View>

            <View style={styles.moduleBadge}>
              <Text style={styles.moduleBadgeText}>{item.shortLabel}</Text>
            </View>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>

            {/* {item.previewStats?.length ? (
              <View style={styles.metricRow}>
                {item.previewStats.map((metric, index) => (
                  <View
                    key={`${item.id}-${metric.label}`}
                    style={[
                      styles.metricChip,
                      index === item.previewStats.length - 1 &&
                      styles.metricChipLast,
                    ]}>
                    <Text style={styles.metricValue}>{metric.value}</Text>
                    <Text style={styles.metricLabel}>{metric.label}</Text>
                  </View>
                ))}
              </View>
            ) : null} */}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.cardCta}>Enter workspace</Text>
            <View style={styles.arrowWrap}>
              <Ionicons
                name="arrow-forward"
                size={17}
                color={APP_THEME.white}
              />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
});

const EmptyState = memo(function EmptyState({ role }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconWrap}>
        <Ionicons
          name={role ? 'lock-closed-outline' : 'business-outline'}
          size={22}
          color={APP_THEME.textMuted}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {role ? 'No modules available' : 'Select an organization'}
      </Text>
      <Text style={styles.emptyText}>
        {role
          ? 'This organization does not currently have an enabled module set.'
          : 'Your available workspaces will appear here once an organization is selected.'}
      </Text>
    </View>
  );
});

const GRADIENT_START = { x: 0, y: 0 };
const GRADIENT_END = { x: 1, y: 1 };

const getModuleLayout = (_, index) => ({
  length: MODULE_SELECTOR_CARD_HEIGHT,
  offset: MODULE_SELECTOR_CARD_HEIGHT * index,
  index,
});

function ModuleSelectorView({
  role,
  focus,
  allowedModules,
  totalModules,
  summary,
  onSelectModule,
  onRoleChange,
  onFocus,
  onBlur,
}) {
  const { width } = useWindowDimensions();
  const compactLayout = width < scale(390);
  const renderItem = useCallback(
    ({ item }) => <AnimatedPressableCard item={item} onPress={onSelectModule} />,
    [onSelectModule],
  );

  const renderDropdownIcon = useCallback(
    () => (
      <Ionicons
        name={focus ? 'chevron-up' : 'chevron-down'}
        size={18}
        color={APP_THEME.textSecondary}
      />
    ),
    [focus],
  );

  const renderEmptyState = useCallback(
    () => <EmptyState role={role} />,
    [role],
  );

  return (
    <AppLayout withSafeArea>
      <View style={styles.container}>
        <View
          style={[
            styles.topSection,
            compactLayout && styles.topSectionCompact,
          ]}>
          <View style={styles.platformRow}>
            <View style={styles.platformBadge}>
              <Ionicons name="grid-outline" size={14} color="#9FD3FF" />
              <Text style={styles.platformBadgeText}>OPERATIONS PLATFORM</Text>
            </View>
          </View>

          <Text style={styles.title}>Choose module</Text>
          {/* <Text style={styles.subtitle}>
            One workspace shell for lending, collections, payments, and customer
            communication.
          </Text> */}

          {/* <View
            style={[styles.statRow, compactLayout && styles.statRowCompact]}>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{totalModules}</Text>
              <Text style={styles.statLabel}>Modules</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{summary.availableValue}</Text>
              <Text style={styles.statLabel}>Available</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statChip}>
              <Text style={styles.statValue}>{summary.hiddenValue}</Text>
              <Text style={styles.statLabel}>Hidden</Text>
            </View>
          </View> */}
        </View>

        <View
          style={[
            styles.controlShell,
            compactLayout && styles.controlShellCompact,
          ]}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>Organization</Text>
            {summary.controlMeta ? (
              <Text style={styles.controlMeta}>{summary.controlMeta}</Text>
            ) : null}
          </View>

          <Dropdown
            style={[styles.dropdown, focus ? styles.dropdownFocused : null]}
            containerStyle={styles.dropdownMenu}
            itemContainerStyle={styles.dropdownItem}
            activeColor="rgba(159,211,255,0.12)"
            data={ROLE_OPTIONS}
            labelField="label"
            valueField="value"
            value={role}
            placeholder={!role ? 'Select organization' : undefined}
            selectedTextStyle={styles.dropdownSelectedText}
            placeholderStyle={styles.dropdownPlaceholder}
            itemTextStyle={styles.dropdownItemText}
            renderRightIcon={renderDropdownIcon}
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onRoleChange}
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available modules</Text>
          {summary.sectionMeta ? (
            <Text style={styles.sectionMeta}>{summary.sectionMeta}</Text>
          ) : null}
        </View>

        <FlatList
          data={allowedModules}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          getItemLayout={getModuleLayout}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
        />
      </View>
    </AppLayout>
  );
}

export default memo(ModuleSelectorView);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: scale(22),
    paddingTop: verticalScale(8),
  },
  topSection: {
    paddingBottom: verticalScale(20),
  },
  topSectionCompact: {
    paddingBottom: verticalScale(16),
  },
  platformRow: {
    marginBottom: verticalScale(14),
  },
  platformBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(12),
    paddingVertical: verticalScale(8),
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  platformBadgeText: {
    color: '#9FD3FF',
    marginLeft: scale(8),
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: moderateScale(28),
    lineHeight: moderateScale(32),
    color: APP_THEME.textPrimary,
    fontWeight: '800',
    maxWidth: 260,
  },
  subtitle: {
    marginTop: verticalScale(8),
    color: APP_THEME.textSecondary,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(20),
    maxWidth: 330,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: verticalScale(18),
    paddingVertical: verticalScale(14),
    paddingHorizontal: scale(16),
    borderRadius: moderateScale(20),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
  },
  statRowCompact: {
    paddingHorizontal: scale(14),
  },
  statChip: {
    flex: 1,
  },
  statValue: {
    color: APP_THEME.textPrimary,
    fontSize: moderateScale(20),
    fontWeight: '800',
  },
  statLabel: {
    marginTop: verticalScale(3),
    color: APP_THEME.textMuted,
    fontSize: moderateScale(11),
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  statDivider: {
    width: 1,
    height: verticalScale(32),
    backgroundColor: 'rgba(148,163,184,0.16)',
    marginHorizontal: scale(10),
  },
  controlShell: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
    borderRadius: moderateScale(22),
    padding: moderateScale(14),
    marginBottom: verticalScale(18),
  },
  controlShellCompact: {
    padding: moderateScale(12),
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(10),
  },
  controlLabel: {
    color: APP_THEME.textPrimary,
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  controlMeta: {
    color: APP_THEME.textMuted,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  dropdown: {
    height: verticalScale(54),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: scale(14),
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.16)',
  },
  dropdownFocused: {
    borderColor: '#9FD3FF',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dropdownMenu: {
    borderRadius: moderateScale(18),
    backgroundColor: '#12213A',
    borderWidth: 1,
    borderColor: APP_THEME.border,
    overflow: 'hidden',
  },
  dropdownItem: {
    backgroundColor: '#12213A',
  },
  dropdownSelectedText: {
    color: APP_THEME.textPrimary,
  },
  dropdownPlaceholder: {
    color: APP_THEME.textMuted,
  },
  dropdownItemText: {
    color: APP_THEME.textPrimary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  sectionTitle: {
    color: APP_THEME.textPrimary,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  sectionMeta: {
    color: APP_THEME.textMuted,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: verticalScale(26),
  },
  cardWrap: {
    marginBottom: verticalScale(14),
  },
  cardPressable: {
    borderRadius: moderateScale(24),
  },
  card: {
    borderRadius: moderateScale(24),
    padding: moderateScale(18),
    minHeight: 178,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBox: {
    width: scale(46),
    height: scale(46),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moduleBadge: {
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(6),
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  moduleBadgeText: {
    color: APP_THEME.white,
    fontSize: moderateScale(10),
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  cardBody: {
    marginVertical: verticalScale(12),
  },
  cardTitle: {
    color: APP_THEME.white,
    fontSize: moderateScale(18),
    fontWeight: '800',
  },
  cardSubtitle: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: moderateScale(13),
    marginTop: verticalScale(6),
    lineHeight: moderateScale(18),
    maxWidth: '85%',
  },
  metricRow: {
    flexDirection: 'row',
    marginTop: verticalScale(14),
  },
  metricChip: {
    flex: 1,
    borderRadius: moderateScale(16),
    paddingVertical: verticalScale(10),
    paddingHorizontal: scale(12),
    marginRight: scale(10),
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  metricChipLast: {
    marginRight: 0,
  },
  metricValue: {
    color: APP_THEME.white,
    fontSize: moderateScale(15),
    fontWeight: '800',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: moderateScale(10),
    fontWeight: '700',
    marginTop: verticalScale(3),
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardCta: {
    color: APP_THEME.white,
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  arrowWrap: {
    width: scale(32),
    height: scale(32),
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    marginTop: verticalScale(36),
    borderRadius: moderateScale(24),
    paddingVertical: verticalScale(30),
    paddingHorizontal: scale(24),
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.14)',
    alignItems: 'center',
  },
  emptyIconWrap: {
    width: scale(48),
    height: scale(48),
    borderRadius: moderateScale(16),
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: verticalScale(12),
  },
  emptyTitle: {
    color: APP_THEME.textPrimary,
    fontSize: moderateScale(18),
    fontWeight: '700',
  },
  emptyText: {
    marginTop: verticalScale(8),
    color: APP_THEME.textSecondary,
    fontSize: moderateScale(13),
    textAlign: 'center',
    lineHeight: moderateScale(20),
    maxWidth: 270,
  },
  pressed: {
    opacity: 0.94,
  },
});
