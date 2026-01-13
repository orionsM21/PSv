import React, { useContext, memo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  StatusBar,
  Text,
  View, FlatList, Dimensions
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector } from 'react-redux';
import VehicleTaskList from '../component/VehicleTaskList';
import { DrawerContext } from '../../../../Drawer/DrawerContext';
import UIThemeSelector from './UIThemeSelector';
import { VehicleTheme } from './theme.config';

const TASKS = [
  {
    id: 'VL-10234',
    name: 'Rohit Sharma',
    task: 'Document Verification',
    priority: 'High',
    status: 'Pending',
  },
  {
    id: 'VL-10241',
    name: 'Anita Verma',
    task: 'Approval Review',
    priority: 'Medium',
    status: 'In Progress',
  },
  {
    id: 'VL-10252',
    name: 'Kunal Mehta',
    task: 'Disbursement',
    priority: 'Low',
    status: 'Completed',
  },
];
const KPI_DATA = [
  {
    id: 'kpi_1',
    title: 'New Applications',
    value: '12',
    subtitle: 'Today',
    icon: 'document-text-outline',
    trend: 'up',
    delta: '+3',
    statusColor: '#16A34A', // green
  },
  {
    id: 'kpi_2',
    title: 'Pending Approval',
    value: '5',
    subtitle: 'Awaiting review',
    icon: 'time-outline',
    trend: 'down',
    delta: '-2',
    statusColor: '#F59E0B', // amber
  },
  {
    id: 'kpi_3',
    title: 'Disbursed Today',
    value: '₹18L',
    subtitle: 'Total amount',
    icon: 'cash-outline',
    trend: 'up',
    delta: '+₹4L',
    statusColor: '#2563EB', // blue
  },
];


const { width, height } = Dimensions.get('window')

const Dashboard = () => {
  const { openDrawer } = useContext(DrawerContext);

  const uiTheme = useSelector(state => state.module.uiTheme);
  const theme = VehicleTheme[uiTheme] || VehicleTheme.current;
  console.log(theme, 'themetheme')
  const KpiCarousel = memo(({ theme }) => {
    const [index, setIndex] = React.useState(0);
    const CARD_WIDTH = width - 32;
    const CARD_HEIGHT = 140; // 🔥 IMPORTANT

    const onScrollEnd = (e) => {
      const page = Math.round(
        e.nativeEvent.contentOffset.x / CARD_WIDTH
      );
      setIndex(page);
    };

    return (
      <>
        <FlatList
          data={KPI_DATA}
          horizontal
          pagingEnabled
          snapToInterval={CARD_WIDTH}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onMomentumScrollEnd={onScrollEnd}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          style={{ height: CARD_HEIGHT }}   // ✅ FIX #1
          renderItem={({ item }) => (
            <View style={{ width: CARD_WIDTH }}>
              <KpiCard theme={theme} {...item} />
            </View>
          )}
        />

        {/* DOTS */}
        <View style={styles.dotsRow}>
          {KPI_DATA.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === index && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </>
    );
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.pageBg }}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* 🔷 HEADER */}
      <View style={[styles.headerWrapper, { backgroundColor: theme.headerBg }]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.headerLeft} onPress={openDrawer}>
            <Image
              source={require('../../../../asset/icon/menus.png')}
              style={styles.drawerIcon}
            />
            <View>
              <Text style={[styles.headerSubTitle, { color: theme.textMuted }]}>
                Welcome back
              </Text>
              <Text style={styles.headerTitle}>Vehicle Loan Officer</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.avatarWrapper}>
            <Text style={styles.avatarText}>VL</Text>
          </View>
        </View>
      </View>

      {/* 🎨 THEME SELECTOR (inside card) */}
      <View
        style={[
          styles.themeCard,
          {
            backgroundColor: theme.cardBg,
            borderColor: theme.borderColor,
          },
          theme.neo && theme.shadow,
        ]}
      >
        <UIThemeSelector />
      </View>



      <View style={styles.mainContainer}>
        <KpiCarousel theme={theme} />
      </View>

      {/* 🔷 TASKS */}
      <VehicleTaskList tasks={TASKS} theme={theme} />
    </SafeAreaView>
  );
};


/* KPI CARD */
const KpiCard = memo(({
  title,
  value,
  subtitle,
  icon,
  trend,
  delta,
  statusColor,
  theme,
}) => {
  const isUp = trend === 'up';

  return (
    <View
      style={[
        styles.kpiCard,
        {
          backgroundColor: theme.cardBg,
          borderColor: theme.borderColor,
        },
        theme.neo && theme.shadow,
      ]}
    >
      {/* TOP ROW */}
      <View style={styles.kpiTopRow}>
        <Ionicons name={icon} size={24} color={statusColor} />
        <View style={[styles.trendChip, { backgroundColor: statusColor + '20' }]}>
          <Ionicons
            name={isUp ? 'arrow-up' : 'arrow-down'}
            size={12}
            color={statusColor}
          />
          <Text style={[styles.trendText, { color: statusColor }]}>
            {delta}
          </Text>
        </View>
      </View>

      {/* VALUE */}
      <Text style={[styles.kpiValue, { color: theme.textPrimary }]}>
        {value}
      </Text>

      {/* TITLE */}
      <Text style={[styles.kpiTitle, { color: theme.textMuted }]}>
        {title}
      </Text>

      {/* SUBTITLE */}
      <Text style={[styles.kpiSubtitle, { color: theme.textMuted }]}>
        {subtitle}
      </Text>
    </View>
  );
});



export default Dashboard;


const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  headerWrapper: {
    paddingTop: 50,
    paddingBottom: 28,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    backgroundColor: '#1E3A8A', // steel blue
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  drawerIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
    tintColor: '#fff',
  },

  headerSubTitle: {
    color: '#C7D2FE',
    fontSize: 13,
  },

  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },

  avatarWrapper: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 16,
  },

  headerSummaryRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  summaryLabel: {
    color: '#E0E7FF',
    fontSize: 13,
  },

  summaryValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
  },

  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  chipText: {
    fontWeight: '700',
    color: '#1E3A8A',
    fontSize: 13,
  },

  mainContainer: {
    // marginTop: -18,
    marginVertical: 10,
    paddingHorizontal: 16,
  },

  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  kpiCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 6,
    alignItems: 'center',
    elevation: 2,
  },

  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 8,
  },

  kpiTitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },

  themeCard: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },

  kpiCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 4,
  },

  activeDot: {
    width: 18,
    backgroundColor: '#1E3A8A',
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },

  trendChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },

  trendText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },

  kpiSubtitle: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.8,
  },

});
