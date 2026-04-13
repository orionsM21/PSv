import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { SafeAreaView } from 'react-native-safe-area-context';

import chatTheme from '../theme';

function StatCard({ item, isLast }) {
  return (
    <View style={[styles.statCard, isLast && styles.statCardLast]}>
      <Text style={styles.statValue}>{item.value}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );
}

function HighlightPill({ item }) {
  const label = typeof item === 'string' ? item : item.label;
  const icon = typeof item === 'string' ? 'sparkles-outline' : item.icon;

  return (
    <View style={styles.highlightPill}>
      <Ionicons
        name={icon}
        size={13}
        color="#D7F9E4"
        style={styles.highlightIcon}
      />
      <Text style={styles.highlightText}>{label}</Text>
    </View>
  );
}

export default function ChatModuleShell({
  title,
  subtitle,
  eyebrow = 'Customer Connect',
  iconName = 'chatbubbles-outline',
  action,
  children,
  scroll = true,
  stats = [],
  highlights = [],
  contentContainerStyle,
}) {
  const Container = scroll ? ScrollView : View;
  const containerProps = scroll
    ? {
      showsVerticalScrollIndicator: false,
      contentContainerStyle: [styles.content, contentContainerStyle],
    }
    : {
      style: [styles.content, contentContainerStyle],
    };

  return (
    <LinearGradient colors={chatTheme.moduleGradient} style={styles.screen}>
      {/* <View style={styles.orbOne} />
      <View style={styles.orbTwo} />
      <View style={styles.gridTint} /> */}

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <Container {...containerProps}>
          {/* <View style={styles.heroCard}> */}
          {/* <View style={styles.heroHeader}>
              <View style={styles.heroIdentity}>
                <View style={styles.heroIconWrap}>
                  <Ionicons name={iconName} size={24} color="#D7F9E4" />
                </View>

                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>{eyebrow}</Text>
                  <Text style={styles.heroTitle}>{title}</Text>
                  {subtitle ? (
                    <Text style={styles.heroSubtitle}>{subtitle}</Text>
                  ) : null}
                </View>
              </View>

              {action ? <View style={styles.heroAction}>{action}</View> : null}
            </View> */}

          {/* {stats.length ? (
              <View style={styles.statRow}>
                {stats.map((item, index) => (
                  <StatCard
                    key={`${item.label}-${item.value}`}
                    item={item}
                    isLast={index === stats.length - 1}
                  />
                ))}
              </View>
            ) : null}

            {highlights.length ? (
              <View style={styles.highlightRow}>
                {highlights.map((item, index) => (
                  <HighlightPill
                    key={`${
                      typeof item === 'string' ? item : item.label
                    }-${index}`}
                    item={item}
                  />
                ))}
              </View>
            ) : null} */}
          {/* </View> */}

          {children}
        </Container>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    padding: chatTheme.spacing[4],
    paddingBottom: chatTheme.spacing[6],
  },
  orbOne: {
    position: 'absolute',
    top: -verticalScale(30),
    right: -scale(24),
    width: scale(220),
    height: scale(220),
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orbTwo: {
    position: 'absolute',
    bottom: -verticalScale(60),
    left: -scale(20),
    width: scale(250),
    height: scale(250),
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  gridTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  heroCard: {
    borderRadius: chatTheme.radii.xl,
    padding: chatTheme.spacing[5],
    marginBottom: chatTheme.spacing[4],
    backgroundColor: 'rgba(7, 23, 29, 0.24)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroIdentity: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  heroAction: {
    marginLeft: chatTheme.spacing[3],
  },
  heroIconWrap: {
    width: scale(52),
    height: scale(52),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: chatTheme.spacing[3],
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  heroCopy: {
    flex: 1,
  },
  heroEyebrow: {
    ...chatTheme.typography.label,
    color: '#D7F9E4',
    letterSpacing: 0.8,
  },
  heroTitle: {
    marginTop: chatTheme.spacing[2],
    fontSize: moderateScale(28),
    lineHeight: moderateScale(34),
    fontWeight: '800',
    color: chatTheme.colors.white,
  },
  heroSubtitle: {
    ...chatTheme.typography.body,
    marginTop: chatTheme.spacing[2],
    color: 'rgba(255,255,255,0.78)',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: chatTheme.spacing[4],
  },
  statCard: {
    width: '31%',
    marginRight: chatTheme.spacing[3],
    padding: chatTheme.spacing[3],
    borderRadius: chatTheme.radii.lg,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  statCardLast: {
    marginRight: 0,
  },
  statValue: {
    fontSize: moderateScale(16),
    fontWeight: '800',
    color: '#FFFFFF',
  },
  statLabel: {
    ...chatTheme.typography.caption,
    marginTop: chatTheme.spacing[1],
    color: 'rgba(255,255,255,0.72)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  highlightRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: chatTheme.spacing[4],
  },
  highlightPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: chatTheme.spacing[3],
    paddingVertical: chatTheme.spacing[2],
    marginRight: chatTheme.spacing[2],
    marginBottom: chatTheme.spacing[2],
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  highlightIcon: {
    marginRight: 6,
  },
  highlightText: {
    ...chatTheme.typography.caption,
    color: '#E8FFF0',
    fontWeight: '700',
  },
});
