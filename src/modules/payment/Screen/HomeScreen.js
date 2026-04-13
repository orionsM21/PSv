import React, { useCallback, useContext, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';

import { DrawerContext } from '../../../Drawer/DrawerContext';
import FlipCard from '../components/FlipCard';
import { PAYMENT_THEME } from '../theme/paymentTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

const QUICK_ACTIONS = [
  {
    id: 'send',
    title: 'Send Money',
    icon: 'arrow-up-outline',
    accent: '#8BD3FF',
    route: 'FundTransfer',
  },
  {
    id: 'add',
    title: 'Add Money',
    icon: 'add-circle-outline',
    accent: '#7DD3FC',
  },
  { id: 'bills', title: 'Pay Bills', icon: 'receipt-outline', accent: '#A7F3D0' },
];

const RECENT_TRANSACTIONS = [
  {
    id: 'txn-1',
    title: 'Payment to Amazon',
    time: 'Today, 12:40 PM',
    amount: '-$250.00',
    tone: 'debit',
  },
  {
    id: 'txn-2',
    title: 'Deposit from Employer',
    time: 'Today, 09:10 AM',
    amount: '+$2,000.00',
    tone: 'credit',
  },
];

const UPCOMING_BILLS = [
  {
    id: 'bill-1',
    title: 'Electricity Bill',
    due: 'Due in 2 days',
    amount: '$120.00',
  },
  {
    id: 'bill-2',
    title: 'Netflix Subscription',
    due: 'Due in 5 days',
    amount: '$15.00',
  },
];

const INSIGHT_ITEMS = [
  {
    id: 'insight-1',
    label: 'Monthly spend',
    value: '$1,250',
    tone: '#F59E0B',
  },
  {
    id: 'insight-2',
    label: 'Savings this month',
    value: '$820',
    tone: '#22C55E',
  },
];

const QuickActionCard = React.memo(({ item, onPress, compactLayout }) => (
  <Pressable
    style={[
      styles.quickActionCard,
      compactLayout && styles.quickActionCardCompact,
    ]}
    onPress={() => onPress(item)}
    android_ripple={{ color: 'rgba(255,255,255,0.06)' }}>
    <View
      style={[
        styles.quickActionIconWrap,
        compactLayout && styles.quickActionIconWrapCompact,
        { backgroundColor: `${item.accent}22` },
      ]}>
      <Ionicons name={item.icon} size={20} color={item.accent} />
    </View>
    <Text style={styles.quickActionTitle}>{item.title}</Text>
    <Ionicons name="arrow-forward" size={16} color="#7C93B5" />
  </Pressable>
));

const RowCard = React.memo(({ title, meta, amount, amountTone = '#E2E8F0' }) => (
  <View style={styles.rowCard}>
    <View style={styles.flexOne}>
      <Text style={styles.rowTitle}>{title}</Text>
      <Text style={styles.rowMeta}>{meta}</Text>
    </View>
    <Text style={[styles.rowAmount, { color: amountTone }]}>{amount}</Text>
  </View>
));

const InsightCard = React.memo(({ item, compactLayout }) => (
  <View
    style={[styles.insightCard, compactLayout && styles.insightCardCompact]}>
    <View style={[styles.insightDot, { backgroundColor: item.tone }]} />
    <Text style={styles.insightLabel}>{item.label}</Text>
    <Text style={styles.insightValue}>{item.value}</Text>
  </View>
));

const SectionHeader = React.memo(({ title, actionText, onPress }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {actionText ? (
      <Pressable onPress={onPress}>
        <Text style={styles.sectionAction}>{actionText}</Text>
      </Pressable>
    ) : null}
  </View>
));

const HomeScreen = () => {
  const navigation = useNavigation();
  const { openDrawer } = useContext(DrawerContext);
  const { width, height } = useWindowDimensions();
  const compactLayout = width < scale(390);
  const shortScreen = height < verticalScale(760);

  const [modalVisible, setModalVisible] = useState(false);
  const [cardKey, setCardKey] = useState(0);

  const summaryCards = useMemo(
    () => [
      {
        id: 'balance',
        label: 'Available Balance',
        value: '$4,550.00',
        accent: '#A7F3D0',
      },
      {
        id: 'spend',
        label: 'Spent This Week',
        value: '$845.00',
        accent: '#FDE68A',
      },
    ],
    [],
  );

  const onMenuPress = useCallback(() => {
    openDrawer();
  }, [openDrawer]);

  const openVirtualCard = useCallback(() => {
    setModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setCardKey(prev => prev + 1);
  }, []);

  const openRecentTransactions = useCallback(() => {
    navigation.navigate('RecentTransaction');
  }, [navigation]);

  const onQuickActionPress = useCallback(
    item => {
      if (item.route) {
        navigation.navigate(item.route);
        return;
      }
    },
    [navigation],
  );

  return (
    <>
      <LinearGradient colors={PAYMENT_THEME.background} style={styles.screen}>
        <SafeAreaView>
          <Animatable.View
            animation="fadeInDown"
            duration={550}
            style={[styles.heroShell, compactLayout && styles.heroShellCompact]}>

            <LinearGradient
              colors={['rgba(11, 146, 230, 0.14)', 'rgba(255,255,255,0.04)']}
              style={[styles.heroCard, compactLayout && styles.heroCardCompact]}>
              <View style={styles.heroTopRow}>
                <Pressable
                  onPress={onMenuPress}
                  hitSlop={12}
                  style={styles.menuButton}>
                  <MaterialIcons name="menu" size={24} color="#F8FAFC" />
                </Pressable>

                <View style={styles.heroRightActions}>
                  <View style={styles.statusPill}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Secure</Text>
                  </View>
                  <Pressable style={styles.iconButton}>
                    <Ionicons
                      name="notifications-outline"
                      size={20}
                      color="#F8FAFC"
                    />
                  </Pressable>
                </View>
              </View>

              <View style={styles.heroCopy}>
                <Text style={styles.heroEyebrow}>Digital Payments</Text>
                <Text
                  style={[
                    styles.heroTitle,
                    compactLayout && styles.heroTitleCompact,
                  ]}>
                  Payments Control Center
                </Text>
                <Text
                  style={[
                    styles.heroSubtitle,
                    compactLayout && styles.heroSubtitleCompact,
                  ]}>
                  Manage transfers, spending, and card activity from one premium
                  workspace.
                </Text>
              </View>

              <View
                style={[
                  styles.summaryGrid,
                  // compactLayout && styles.summaryGridCompact,
                ]}>
                {summaryCards.map(item => (
                  <View
                    key={item.id}
                    style={[
                      styles.summaryCard,
                      compactLayout && styles.summaryCardCompact,
                    ]}>
                    <Text style={styles.summaryLabel}>{item.label}</Text>
                    <Text style={styles.summaryValue}>{item.value}</Text>
                    <View
                      style={[
                        styles.summaryAccent,
                        { backgroundColor: item.accent },
                      ]}
                    />
                  </View>
                ))}
              </View>
            </LinearGradient>

          </Animatable.View>
        </SafeAreaView>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.content,
            compactLayout && styles.contentCompact,
            shortScreen && styles.contentShort,
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          <Animatable.View
            animation="fadeInUp"
            delay={120}
            duration={550}
            style={styles.sectionBlock}>
            <SectionHeader title="Quick Actions" />
            <View style={styles.quickActionGrid}>
              {QUICK_ACTIONS.map(item => (
                <QuickActionCard
                  key={item.id}
                  item={item}
                  onPress={onQuickActionPress}
                  compactLayout={compactLayout}
                />
              ))}
            </View>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            delay={180}
            duration={550}
            style={styles.sectionBlock}>
            <SectionHeader
              title="Recent Transactions"
              actionText="View all"
              onPress={openRecentTransactions}
            />
            <Pressable
              style={styles.panelCard}
              onPress={openRecentTransactions}>
              {RECENT_TRANSACTIONS.map(item => (
                <RowCard
                  key={item.id}
                  title={item.title}
                  meta={item.time}
                  amount={item.amount}
                  amountTone={item.tone === 'credit' ? '#34D399' : '#FCA5A5'}
                />
              ))}
            </Pressable>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            delay={240}
            duration={550}
            style={styles.sectionBlock}>
            <SectionHeader title="Virtual Card" />
            <View
              style={[
                styles.virtualCardPanel,
                compactLayout && styles.virtualCardPanelCompact,
              ]}>
              <LinearGradient
                colors={['#10233E', '#1B4C7A']}
                style={[
                  styles.virtualCardPreview,
                  compactLayout && styles.virtualCardPreviewCompact,
                ]}>
                <View style={styles.virtualCardTop}>
                  <Text style={styles.virtualCardLabel}>Premium Debit</Text>
                  <Ionicons name="card-outline" size={22} color="#F8FAFC" />
                </View>
                <Text
                  style={[
                    styles.virtualCardNumber,
                    compactLayout && styles.virtualCardNumberCompact,
                  ]}>
                  **** **** **** 1234
                </Text>
                <View style={styles.virtualCardFooter}>
                  <View>
                    <Text style={styles.virtualCardMetaLabel}>Card Holder</Text>
                    <Text style={styles.virtualCardMetaValue}>John Doe</Text>
                  </View>
                  <View>
                    <Text style={styles.virtualCardMetaLabel}>Expires</Text>
                    <Text style={styles.virtualCardMetaValue}>12/25</Text>
                  </View>
                </View>
              </LinearGradient>

              <Pressable
                style={styles.viewCardButton}
                onPress={openVirtualCard}>
                <Text style={styles.viewCardButtonText}>
                  View interactive card
                </Text>
                <Ionicons name="arrow-forward" size={16} color="#071321" />
              </Pressable>
            </View>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            delay={300}
            duration={550}
            style={styles.sectionBlock}>
            <SectionHeader title="Upcoming Bills" />
            <View style={styles.panelCard}>
              {UPCOMING_BILLS.map(item => (
                <RowCard
                  key={item.id}
                  title={item.title}
                  meta={item.due}
                  amount={item.amount}
                  amountTone="#FDE68A"
                />
              ))}
            </View>
          </Animatable.View>

          <Animatable.View
            animation="fadeInUp"
            delay={360}
            duration={550}
            style={styles.sectionBlock}>
            <SectionHeader title="Spending Insights" />
            <View
              style={[
                styles.insightRow,
                compactLayout && styles.insightRowCompact,
              ]}>
              {INSIGHT_ITEMS.map(item => (
                <InsightCard
                  key={item.id}
                  item={item}
                  compactLayout={compactLayout}
                />
              ))}
            </View>
          </Animatable.View>

        </ScrollView>


      </LinearGradient>

      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={closeModal}>
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <Pressable onPress={() => null}>
            <Animatable.View animation="zoomIn" duration={350}>
              <FlipCard key={cardKey} />
            </Animatable.View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: scale(16),
    paddingBottom: verticalScale(32),
  },
  contentCompact: {
    paddingHorizontal: scale(14),
  },
  contentShort: {
    paddingBottom: verticalScale(24),
  },
  flexOne: {
    flex: 1,
  },
  heroShell: {
    marginBottom: verticalScale(18),
  },
  heroShellCompact: {
    marginBottom: verticalScale(14),
  },
  heroCard: {
    borderRadius: moderateScale(28),
    padding: moderateScale(20),
    borderWidth: 1,
    borderColor: PAYMENT_THEME.border,
    backgroundColor: PAYMENT_THEME.overlay,
  },
  heroCardCompact: {
    borderRadius: moderateScale(24),
    padding: moderateScale(16),
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuButton: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PAYMENT_THEME.panelStrong,
  },
  iconButton: {
    width: scale(42),
    height: scale(42),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PAYMENT_THEME.panel,
    marginLeft: scale(10),
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(8),
    borderRadius: 999,
    backgroundColor: PAYMENT_THEME.panelStrong,
  },
  statusDot: {
    width: scale(8),
    height: scale(8),
    borderRadius: 4,
    backgroundColor: PAYMENT_THEME.success,
    marginRight: scale(6),
  },
  statusText: {
    color: PAYMENT_THEME.textPrimary,
    fontSize: moderateScale(12),
    fontWeight: '700',
  },
  heroCopy: {
    marginTop: verticalScale(20),
  },
  heroEyebrow: {
    color: PAYMENT_THEME.accent,
    fontSize: moderateScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: verticalScale(8),
  },
  heroTitle: {
    color: PAYMENT_THEME.textPrimary,
    fontSize: moderateScale(30),
    lineHeight: moderateScale(36),
    fontWeight: '800',
  },
  heroTitleCompact: {
    fontSize: moderateScale(25),
    lineHeight: moderateScale(30),
  },
  heroSubtitle: {
    marginTop: verticalScale(10),
    color: PAYMENT_THEME.textSecondary,
    fontSize: moderateScale(14),
    lineHeight: moderateScale(21),
  },
  heroSubtitleCompact: {
    fontSize: moderateScale(13),
    lineHeight: moderateScale(19),
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(22),
  },
  summaryGridCompact: {
    flexWrap: 'wrap',
  },
  summaryCard: {
    padding: moderateScale(16),
    borderRadius: moderateScale(22),
    backgroundColor: PAYMENT_THEME.panelStrong,
    overflow: 'hidden',
  },
  summaryCardCompact: {
    flexGrow: 0,
    width: '48.5%',
    marginBottom: verticalScale(10),
  },
  summaryLabel: {
    color: PAYMENT_THEME.textSecondary,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  summaryValue: {
    marginTop: verticalScale(10),
    color: PAYMENT_THEME.textPrimary,
    fontSize: moderateScale(23),
    fontWeight: '800',
  },
  summaryAccent: {
    marginTop: verticalScale(14),
    width: scale(36),
    height: verticalScale(4),
    borderRadius: 999,
  },
  sectionBlock: {
    marginBottom: verticalScale(18),
  },
  sectionHeader: {
    marginBottom: verticalScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: PAYMENT_THEME.textPrimary,
    fontSize: moderateScale(19),
    fontWeight: '800',
  },
  sectionAction: {
    color: PAYMENT_THEME.accent,
    fontSize: moderateScale(13),
    fontWeight: '700',
  },
  quickActionGrid: {
    rowGap: verticalScale(12),
  },
  quickActionCard: {
    borderRadius: moderateScale(22),
    padding: moderateScale(16),
    backgroundColor: PAYMENT_THEME.panel,
    borderWidth: 1,
    borderColor: PAYMENT_THEME.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionCardCompact: {
    padding: moderateScale(14),
  },
  quickActionIconWrap: {
    width: scale(44),
    height: scale(44),
    borderRadius: moderateScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(14),
  },
  quickActionIconWrapCompact: {
    width: scale(40),
    height: scale(40),
    borderRadius: moderateScale(14),
  },
  quickActionTitle: {
    flex: 1,
    color: PAYMENT_THEME.textPrimary,
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  panelCard: {
    backgroundColor: PAYMENT_THEME.panel,
    borderWidth: 1,
    borderColor: PAYMENT_THEME.border,
    borderRadius: moderateScale(24),
    padding: moderateScale(16),
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: verticalScale(12),
  },
  rowTitle: {
    color: PAYMENT_THEME.textPrimary,
    fontSize: moderateScale(15),
    fontWeight: '700',
  },
  rowMeta: {
    marginTop: verticalScale(4),
    color: PAYMENT_THEME.textMuted,
    fontSize: moderateScale(12),
  },
  rowAmount: {
    fontSize: moderateScale(15),
    fontWeight: '800',
    marginLeft: scale(12),
  },
  virtualCardPanel: {
    backgroundColor: PAYMENT_THEME.panel,
    borderWidth: 1,
    borderColor: PAYMENT_THEME.border,
    borderRadius: moderateScale(24),
    padding: moderateScale(16),
  },
  virtualCardPanelCompact: {
    padding: moderateScale(14),
  },
  virtualCardPreview: {
    borderRadius: moderateScale(24),
    padding: moderateScale(18),
    minHeight: verticalScale(188),
    justifyContent: 'space-between',
  },
  virtualCardPreviewCompact: {
    minHeight: verticalScale(170),
    padding: moderateScale(16),
  },
  virtualCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  virtualCardLabel: {
    color: PAYMENT_THEME.textSecondary,
    fontSize: moderateScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  virtualCardNumber: {
    color: PAYMENT_THEME.textPrimary,
    fontSize: moderateScale(24),
    letterSpacing: 2,
    fontWeight: '800',
    marginTop: verticalScale(24),
  },
  virtualCardNumberCompact: {
    fontSize: moderateScale(20),
    marginTop: verticalScale(20),
  },
  virtualCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: verticalScale(18),
  },
  virtualCardMetaLabel: {
    color: PAYMENT_THEME.textSecondary,
    fontSize: moderateScale(11),
    fontWeight: '600',
  },
  virtualCardMetaValue: {
    marginTop: verticalScale(5),
    color: PAYMENT_THEME.textPrimary,
    fontSize: moderateScale(14),
    fontWeight: '700',
  },
  viewCardButton: {
    marginTop: verticalScale(14),
    minHeight: verticalScale(52),
    borderRadius: moderateScale(18),
    backgroundColor: PAYMENT_THEME.accentMint,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  viewCardButtonText: {
    color: '#071321',
    fontSize: moderateScale(15),
    fontWeight: '800',
    marginRight: scale(8),
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  insightRowCompact: {
    flexWrap: 'wrap',
  },
  insightCard: {
    // flex: 1,
    backgroundColor: PAYMENT_THEME.panel,
    borderWidth: 1,
    borderColor: PAYMENT_THEME.border,
    borderRadius: moderateScale(22),
    padding: moderateScale(16),
  },
  insightCardCompact: {
    flexGrow: 0,
    width: '48.5%',
    marginBottom: verticalScale(10),
  },
  insightDot: {
    width: scale(10),
    height: scale(10),
    borderRadius: 5,
    marginBottom: verticalScale(14),
  },
  insightLabel: {
    color: PAYMENT_THEME.textSecondary,
    fontSize: moderateScale(12),
    fontWeight: '600',
  },
  insightValue: {
    marginTop: verticalScale(8),
    color: PAYMENT_THEME.textPrimary,
    fontSize: moderateScale(24),
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(2,6,23,0.72)',
    paddingHorizontal: scale(14),
  },
});

export default HomeScreen;
