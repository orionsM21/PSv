import React from 'react';
import {
  ActivityIndicator,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { losThemes } from '../../theme/losTheme.js';

const DEFAULT_THEME = losThemes.dashboard;

const mergeTheme = theme => ({ ...DEFAULT_THEME, ...(theme || {}) });

const DashboardCommandCenter = ({
  theme,
  greeting,
  title,
  heroValue,
  heroLabel,
  heroMeta,
  microStats = [],
  statusLabel = 'Live',
  statusTone,
  userInitials = 'U',
  tabs = [],
  selectedTab,
  onSelectTab,
  onMenuPress,
  topRightContent = null,
  spotlight = null,
  summaryTitle = 'Performance Deck',
  summaryCards = [],
  summaryFooter = null,
  children = null,
  quickActionsTitle = 'Quick Actions',
  quickActions = [],
  activityTitle = 'Recent Activity',
  activityItems = [],
  activityAction = null,
  refreshing = false,
  onRefresh,
  loading = false,
  contentBottomSpacing = 110,
}) => {
  const palette = mergeTheme(theme);
  const distribution = spotlight?.distribution || [];
  const peakValue = distribution.reduce(
    (maxValue, item) => Math.max(maxValue, Number(item?.value) || 0),
    0,
  );
  const refreshControl = onRefresh ? (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={palette.accent}
      colors={[palette.accent]}
    />
  ) : null;

  return (
    <View style={[styles.screen, { backgroundColor: palette.pageBackground }]}>
      <LinearGradient colors={palette.headerGradient} style={styles.heroGradient}>
        <View
          style={[
            styles.heroGlowLarge,
            { backgroundColor: palette.accentGlow },
          ]}
        />
        <View
          style={[
            styles.heroGlowSmall,
            { backgroundColor: `${palette.accent}40` },
          ]}
        />

        <View style={styles.heroTopRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onMenuPress}
            style={styles.heroLeftGroup}
          >
            <View style={styles.menuButton}>
              <Image
                source={require('../../asset/menus.png')}
                style={styles.menuIcon}
              />
            </View>

            <View style={styles.heroTitleBlock}>
              <Text style={styles.heroEyebrow}>{greeting}</Text>
              <Text style={styles.heroTitle}>{title}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.heroRightGroup}>
            {topRightContent ? (
              <View style={styles.topRightSlot}>{topRightContent}</View>
            ) : null}

            <View style={styles.avatarShell}>
              <View style={styles.avatarCore}>
                <Text style={styles.avatarText}>{userInitials}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.heroPanel}>
          <View style={styles.heroCopyBlock}>
            <Text style={styles.heroMetricValue}>{heroValue}</Text>
            <Text style={styles.heroMetricLabel}>{heroLabel}</Text>
            {!!heroMeta && <Text style={styles.heroMetricMeta}>{heroMeta}</Text>}
          </View>

          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusTone || 'rgba(255,255,255,0.16)' },
            ]}
          >
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        {!!microStats.length && (
          <View style={styles.microGrid}>
            {microStats.slice(0, 3).map((item, index) => (
              <View
                key={`${item.label}-${index}`}
                style={[
                  styles.microCard,
                  index < microStats.slice(0, 3).length - 1 && styles.microGap,
                ]}
              >
                <Text style={styles.microValue}>{item.value}</Text>
                <Text style={styles.microLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        )}

        {!!tabs.length && onSelectTab ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroller}
          >
            {tabs.map(tab => {
              const isActive = selectedTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  activeOpacity={0.85}
                  onPress={() => onSelectTab(tab)}
                  style={[styles.tabPill, isActive && styles.tabPillActive]}
                >
                  <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : null}
      </LinearGradient>

      <ScrollView
        refreshControl={refreshControl}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: contentBottomSpacing },
        ]}
      >
        {loading ? (
          <View style={styles.loadingState}>
            <View style={styles.loadingCard}>
              <ActivityIndicator size="large" color={palette.accent} />
              <Text style={[styles.loadingText, { color: palette.textSecondary }]}>
                Syncing your dashboard experience...
              </Text>
            </View>

            <View style={styles.placeholderGrid}>
              {[0, 1, 2, 3].map(index => (
                <View key={index} style={styles.placeholderCard} />
              ))}
            </View>
          </View>
        ) : (
          <>
            {spotlight ? (
              <Animatable.View
                animation="fadeInUp"
                duration={500}
                style={[
                  styles.spotlightCard,
                  {
                    backgroundColor: palette.cardBackground,
                    borderColor: palette.border,
                  },
                ]}
              >
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionHeaderCopy}>
                    {!!spotlight.eyebrow && (
                      <Text
                        style={[
                          styles.sectionEyebrow,
                          { color: palette.accent },
                        ]}
                      >
                        {spotlight.eyebrow}
                      </Text>
                    )}
                    <Text
                      style={[
                        styles.sectionHeadline,
                        { color: palette.textPrimary },
                      ]}
                    >
                      {spotlight.title}
                    </Text>
                  </View>

                  {!!spotlight.value && (
                    <View
                      style={[
                        styles.spotlightValueBubble,
                        { backgroundColor: palette.accentSoft },
                      ]}
                    >
                      <Text
                        style={[
                          styles.spotlightValueText,
                          { color: palette.accent },
                        ]}
                      >
                        {spotlight.value}
                      </Text>
                    </View>
                  )}
                </View>

                {!!spotlight.description && (
                  <Text
                    style={[
                      styles.spotlightDescription,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {spotlight.description}
                  </Text>
                )}

                {!!distribution.length && (
                  <View style={styles.distributionStack}>
                    {distribution.map((item, index) => {
                      const ratio =
                        peakValue > 0
                          ? (Number(item?.value) || 0) / peakValue
                          : 0;

                      return (
                        <View
                          key={`${item.label}-${index}`}
                          style={styles.distributionRow}
                        >
                          <View style={styles.distributionMeta}>
                            <Text
                              style={[
                                styles.distributionLabel,
                                { color: palette.textPrimary },
                              ]}
                            >
                              {item.label}
                            </Text>
                            <Text
                              style={[
                                styles.distributionValue,
                                { color: palette.textSecondary },
                              ]}
                            >
                              {item.displayValue ?? item.value}
                            </Text>
                          </View>

                          <View
                            style={[
                              styles.distributionTrack,
                              { backgroundColor: palette.accentSoft },
                            ]}
                          >
                            <View
                              style={[
                                styles.distributionFill,
                                {
                                  width: `${Math.max(ratio * 100, ratio > 0 ? 12 : 0)}%`,
                                  backgroundColor: item.color || palette.accent,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {!!spotlight.metaLine && (
                  <Text
                    style={[
                      styles.spotlightMetaLine,
                      { color: palette.textSecondary },
                    ]}
                  >
                    {spotlight.metaLine}
                  </Text>
                )}
              </Animatable.View>
            ) : null}

            {!!summaryCards.length && (
              <View style={styles.summarySection}>
                <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                  {summaryTitle}
                </Text>

                <View style={styles.metricGrid}>
                  {summaryCards.map((item, index) => (
                    <Animatable.View
                      key={item.key || item.label || index}
                      animation="fadeInUp"
                      delay={index * 80}
                      duration={450}
                      style={styles.metricGridItem}
                    >
                      <TouchableOpacity
                        activeOpacity={0.88}
                        onPress={item.onPress}
                        style={[
                          styles.metricCard,
                          {
                            backgroundColor:
                              item.backgroundColor || palette.cardBackground,
                            borderColor: item.borderColor || palette.border,
                          },
                        ]}
                      >
                        <View style={styles.metricCardTop}>
                          <View
                            style={[
                              styles.metricIconShell,
                              {
                                backgroundColor:
                                  item.iconBackground || palette.accentSoft,
                              },
                            ]}
                          >
                            {item.iconSource ? (
                              <Image
                                source={item.iconSource}
                                style={styles.metricIcon}
                              />
                            ) : (
                              <View
                                style={[
                                  styles.metricIconDot,
                                  { backgroundColor: item.accent || palette.accent },
                                ]}
                              />
                            )}
                          </View>

                          <View
                            style={[
                              styles.metricAccentPill,
                              {
                                backgroundColor:
                                  item.accentSoft || palette.accentSoft,
                              },
                            ]}
                          >
                            <View
                              style={[
                                styles.metricAccentDot,
                                { backgroundColor: item.accent || palette.accent },
                              ]}
                            />
                          </View>
                        </View>

                        <Text
                          style={[
                            styles.metricCount,
                            { color: item.accent || palette.textPrimary },
                          ]}
                        >
                          {item.count ?? 0}
                        </Text>
                        <Text
                          style={[
                            styles.metricLabel,
                            { color: palette.textPrimary },
                          ]}
                        >
                          {item.label}
                        </Text>
                        {!!item.caption && (
                          <Text
                            style={[
                              styles.metricCaption,
                              { color: palette.textSecondary },
                            ]}
                          >
                            {item.caption}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </Animatable.View>
                  ))}
                </View>

                {summaryFooter}
              </View>
            )}

            {children}

            {!!quickActions.length && (
              <View style={styles.quickSection}>
                <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                  {quickActionsTitle}
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.quickScroller}
                >
                  {quickActions.map((action, index) => (
                    <Animatable.View
                      key={action.key || action.title || index}
                      animation="fadeInUp"
                      delay={index * 90}
                      duration={420}
                      style={styles.quickCardWrapper}
                    >
                      <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={action.onPress}
                        style={styles.quickTouch}
                      >
                        <LinearGradient
                          colors={
                            action.gradient || [palette.accent, palette.success]
                          }
                          style={styles.quickCard}
                        >
                          {!!action.eyebrow && (
                            <Text style={styles.quickEyebrow}>{action.eyebrow}</Text>
                          )}
                          <Text style={styles.quickTitle}>{action.title}</Text>
                          <Text style={styles.quickSubtitle}>
                            {action.subtitle}
                          </Text>

                          <View style={styles.quickArrowRow}>
                            <View style={styles.quickArrowPill}>
                              <Text style={styles.quickArrowText}>{'>'}</Text>
                            </View>
                          </View>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animatable.View>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.activitySection}>
              <View style={styles.activityHeader}>
                <Text style={[styles.sectionTitle, { color: palette.textPrimary }]}>
                  {activityTitle}
                </Text>

                {activityAction ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={activityAction.onPress}
                  >
                    <Text
                      style={[
                        styles.activityActionText,
                        { color: palette.accent },
                      ]}
                    >
                      {activityAction.label}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {activityItems.length ? (
                activityItems.map((item, index) => (
                  <Animatable.View
                    key={item.id || `${item.title}-${index}`}
                    animation="fadeInUp"
                    delay={index * 70}
                    duration={360}
                  >
                    <TouchableOpacity
                      activeOpacity={item.onPress ? 0.88 : 1}
                      disabled={!item.onPress}
                      onPress={item.onPress}
                      style={[
                        styles.activityCard,
                        {
                          backgroundColor: palette.cardBackground,
                          borderColor: palette.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.activityRail,
                          { backgroundColor: item.color || palette.accent },
                        ]}
                      />

                      <View style={styles.activityBody}>
                        <View style={styles.activityBodyTop}>
                          <Text
                            style={[
                              styles.activityTitle,
                              { color: palette.textPrimary },
                            ]}
                          >
                            {item.title}
                          </Text>

                          {!!item.badge && (
                            <View
                              style={[
                                styles.activityBadge,
                                {
                                  backgroundColor:
                                    item.badgeColor || palette.accentSoft,
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.activityBadgeText,
                                  {
                                    color:
                                      item.badgeTextColor || palette.accent,
                                  },
                                ]}
                              >
                                {item.badge}
                              </Text>
                            </View>
                          )}
                        </View>

                        {!!item.subtitle && (
                          <Text
                            style={[
                              styles.activitySubtitle,
                              { color: palette.textSecondary },
                            ]}
                          >
                            {item.subtitle}
                          </Text>
                        )}

                        {!!item.reference && (
                          <Text
                            style={[
                              styles.activityReference,
                              { color: palette.accent },
                            ]}
                          >
                            {item.reference}
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  </Animatable.View>
                ))
              ) : (
                <View
                  style={[
                    styles.emptyActivityCard,
                    {
                      backgroundColor: palette.cardBackground,
                      borderColor: palette.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.emptyActivityText,
                      { color: palette.textSecondary },
                    ]}
                  >
                    No recent activity to display right now.
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default DashboardCommandCenter;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  heroGradient: {
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 24,
    overflow: 'hidden',
  },
  heroGlowLarge: {
    position: 'absolute',
    top: -70,
    right: -40,
    width: 210,
    height: 210,
    borderRadius: 105,
  },
  heroGlowSmall: {
    position: 'absolute',
    bottom: 28,
    left: -24,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLeftGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  menuIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  heroTitleBlock: {
    marginLeft: 12,
    flexShrink: 1,
  },
  heroEyebrow: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    marginTop: 4,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
  },
  heroRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  topRightSlot: {
    marginRight: 10,
  },
  avatarShell: {
    width: 50,
    height: 50,
    borderRadius: 25,
    padding: 2,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  avatarCore: {
    flex: 1,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(7, 30, 61, 0.28)',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  heroPanel: {
    marginTop: 22,
    padding: 18,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroCopyBlock: {
    paddingRight: 80,
  },
  heroMetricValue: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '900',
  },
  heroMetricLabel: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  heroMetricMeta: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.82)',
    fontSize: 13,
    lineHeight: 19,
  },
  statusBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  microGrid: {
    flexDirection: 'row',
    marginTop: 14,
  },
  microCard: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  microGap: {
    marginRight: 10,
  },
  microValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  microLabel: {
    marginTop: 5,
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    lineHeight: 16,
  },
  tabScroller: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  tabPillActive: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#0E2239',
  },
  scrollContent: {
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  loadingState: {
    paddingTop: 6,
  },
  loadingCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingVertical: 28,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  placeholderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  placeholderCard: {
    width: '48%',
    height: 150,
    borderRadius: 22,
    marginBottom: 14,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  spotlightCard: {
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    marginBottom: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderCopy: {
    flex: 1,
    paddingRight: 14,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  sectionHeadline: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '800',
  },
  spotlightValueBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
  },
  spotlightValueText: {
    fontSize: 14,
    fontWeight: '800',
  },
  spotlightDescription: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  distributionStack: {
    marginTop: 16,
  },
  distributionRow: {
    marginBottom: 14,
  },
  distributionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  distributionLabel: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    paddingRight: 10,
  },
  distributionValue: {
    fontSize: 12,
    fontWeight: '700',
  },
  distributionTrack: {
    width: '100%',
    height: 10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 999,
  },
  spotlightMetaLine: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  summarySection: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 12,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricGridItem: {
    width: '48%',
    marginBottom: 14,
  },
  metricCard: {
    minHeight: 154,
    borderRadius: 22,
    paddingHorizontal: 15,
    paddingVertical: 16,
    borderWidth: 1,
  },
  metricCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricIconShell: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricIcon: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
  metricIconDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  metricAccentPill: {
    width: 42,
    height: 22,
    borderRadius: 999,
    justifyContent: 'center',
    paddingHorizontal: 8,
    alignItems: 'flex-end',
  },
  metricAccentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  metricCount: {
    marginTop: 22,
    fontSize: 28,
    fontWeight: '900',
  },
  metricLabel: {
    marginTop: 7,
    fontSize: 15,
    fontWeight: '800',
  },
  metricCaption: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 17,
  },
  quickSection: {
    marginBottom: 18,
  },
  quickScroller: {
    paddingRight: 8,
  },
  quickCardWrapper: {
    width: 218,
    marginRight: 12,
  },
  quickTouch: {
    borderRadius: 24,
  },
  quickCard: {
    minHeight: 150,
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    justifyContent: 'space-between',
  },
  quickEyebrow: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  quickTitle: {
    marginTop: 20,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  quickSubtitle: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.86)',
    fontSize: 13,
    lineHeight: 18,
  },
  quickArrowRow: {
    marginTop: 18,
    alignItems: 'flex-end',
  },
  quickArrowPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  quickArrowText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  activitySection: {
    marginBottom: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activityActionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  activityCard: {
    marginBottom: 12,
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
  },
  activityRail: {
    width: 6,
    borderRadius: 999,
    marginRight: 12,
  },
  activityBody: {
    flex: 1,
  },
  activityBodyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  activityTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    paddingRight: 8,
  },
  activityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  activityBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  activitySubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
  },
  activityReference: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyActivityCard: {
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
