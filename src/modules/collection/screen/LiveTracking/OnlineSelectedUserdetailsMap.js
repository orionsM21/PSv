import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import MapView, { Callout, Marker, Polyline } from 'react-native-maps';
import Ionicons from 'react-native-vector-icons/Ionicons';
import apiClient from '../../../../common/hooks/apiClient';

const { width, height } = Dimensions.get('window');
const FALLBACK_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 5,
  longitudeDelta: 5,
};

const TRACKER_COLORS = {
  Login: '#16A34A',
  Logout: '#DC2626',
  PTP: '#F59E0B',
  Payment: '#C2185B',
  'Raise Exception': '#10B981',
  Request: '#7C3AED',
  ScheduleVisit: '#2563EB',
  'Dispute/RTP': '#EAB308',
  default: '#475569',
};

function parseLatLng(value) {
  if (!value || typeof value !== 'string') return null;
  const [latitude, longitude] = value.split(',').map(Number);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  return { latitude, longitude };
}

function normalizeTrackerData(data = []) {
  return data
    .map(item => {
      const latLng = parseLatLng(item.coordinates);
      if (!latLng) return null;

      const createdTimestamp = new Date(item.createdTime).getTime();

      return {
        ...item,
        latLng,
        createdTimestamp: Number.isFinite(createdTimestamp) ? createdTimestamp : 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}

function normalizeScheduleVisits(visits = []) {
  return visits
    .map(item => {
      const latLng = parseLatLng(item.geoCordinates);
      if (!latLng) return null;

      const rawTime = `${item.date || ''} ${item.time || ''}`.trim();
      const scheduledTimestamp = new Date(rawTime).getTime();

      return {
        ...item,
        latLng,
        scheduledTimestamp: Number.isFinite(scheduledTimestamp) ? scheduledTimestamp : 0,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.scheduledTimestamp - b.scheduledTimestamp);
}

function getTrackerColor(activity) {
  return TRACKER_COLORS[activity] || TRACKER_COLORS.default;
}

function dedupeCoordinates(points = []) {
  return points.filter((point, index, array) => {
    if (index === 0) return true;
    const previous = array[index - 1];

    return (
      point.latitude !== previous.latitude ||
      point.longitude !== previous.longitude
    );
  });
}

function formatTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function formatDate(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const SummaryCard = React.memo(({ label, value, hint, accent }) => (
  <View style={styles.summaryCard}>
    <View style={[styles.summaryAccent, { backgroundColor: accent }]} />
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryHint}>{hint}</Text>
  </View>
));

const TimelineRow = React.memo(({ item, isLast, onPress }) => (
  <TouchableOpacity style={styles.timelineRow} activeOpacity={0.86} onPress={onPress}>
    <View style={styles.timelineRail}>
      <View style={[styles.timelineLine, styles.timelineLineTop, isLast && styles.timelineLineHidden]} />
      <View
        style={[
          styles.timelineDot,
          { backgroundColor: item.type === 'VISIT' ? '#2563EB' : getTrackerColor(item.activity) },
        ]}
      />
      <View style={[styles.timelineLine, isLast && styles.timelineLineHidden]} />
    </View>

    <View style={styles.timelineContent}>
      <View style={styles.timelineHeaderRow}>
        <Text style={styles.timelineTitle}>
          {item.type === 'VISIT' ? 'Scheduled Visit' : item.activity || 'Tracking'}
        </Text>
        <Text style={styles.timelineTime}>{formatTime(item.rawTime)}</Text>
      </View>
      <Text style={styles.timelineAddress}>{item.areaName || 'Location unavailable'}</Text>
      <View style={styles.timelineMetaRow}>
        <Text style={styles.timelineMeta}>{item.lan ? `LAN ${item.lan}` : 'General tracking'}</Text>
        <Text style={styles.timelineMeta}>{item.status || (item.type === 'VISIT' ? 'Planned' : 'Captured')}</Text>
      </View>
    </View>
  </TouchableOpacity>
));

export default function OnlineSelectedUserdetailsMap({ route }) {
  const {
    user,
    selectedActivity = '',
    date,
    startTimeM21,
    endTimeM22,
  } = route.params;

  const navigation = useNavigation();
  const token = useSelector(state => state.auth.token);
  const mapRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackerData, setTrackerData] = useState([]);
  const [scheduleVisits, setScheduleVisits] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    const onBack = () => {
      navigation.goBack();
      return true;
    };

    BackHandler.addEventListener('hardwareBackPress', onBack);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onBack);
    };
  }, [navigation]);

  const fetchMapData = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        userIds: [user.userId],
        date: date || new Date().toISOString().slice(0, 10),
        fromTime: startTimeM21 || '00-00',
        toTime: endTimeM22 || '24-00',
      };

      const response = await apiClient.post('mapDataByUserId', payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const tracker = response?.data?.data?.tracker || [];
      const visits = response?.data?.data?.shceduleVisits || [];

      setTrackerData(normalizeTrackerData(tracker));
      setScheduleVisits(normalizeScheduleVisits(visits));
    } catch (error) {
      console.error('mapDataByUserId Error:', error);
      setTrackerData([]);
      setScheduleVisits([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [date, endTimeM22, startTimeM21, token, user.userId]);

  useEffect(() => {
    fetchMapData();
  }, [fetchMapData]);

  const filteredTrackerData = useMemo(() => {
    const safeTrackerData = Array.isArray(trackerData) ? trackerData : [];
    return safeTrackerData.filter(item => {
      if (!selectedActivity?.trim()) return true;
      if (item.activity === 'Login' || item.activity === 'Logout' || !item.activity) return true;
      return item.activity === selectedActivity;
    });
  }, [selectedActivity, trackerData]);

  const trackerCoordinates = useMemo(
    () => dedupeCoordinates(filteredTrackerData.map(item => item.latLng).filter(Boolean)),
    [filteredTrackerData]
  );

  const visitCoordinates = useMemo(
    () => (!selectedActivity ? scheduleVisits.map(item => item.latLng).filter(Boolean) : []),
    [scheduleVisits, selectedActivity]
  );

  const allCoordinates = useMemo(
    () => [...trackerCoordinates, ...visitCoordinates],
    [trackerCoordinates, visitCoordinates]
  );

  useEffect(() => {
    if (!allCoordinates.length || !mapRef.current) return;
    mapRef.current.fitToCoordinates(allCoordinates, {
      edgePadding: { top: 80, right: 60, bottom: 120, left: 60 },
      animated: true,
    });
  }, [allCoordinates]);

  const startLocationAddress = filteredTrackerData[0]?.areaName || trackerData[0]?.areaName || 'No data available';
  const currentLocationAddress =
    filteredTrackerData[filteredTrackerData.length - 1]?.areaName ||
    trackerData[trackerData.length - 1]?.areaName ||
    'No data available';

  const combinedTimelineData = useMemo(() => {
    const trackerItems = filteredTrackerData.map(item => ({
      id: `tracker_${item.trackerId ?? item.createdTime ?? Math.random()}`,
      type: 'TRACKER',
      activity: item.activity,
      areaName: item.areaName,
      lan: item.lan,
      status: item.status,
      timestamp: new Date(item.createdTime).getTime(),
      rawTime: item.createdTime,
      latLng: item.latLng,
    }));

    const visitItems = !selectedActivity
      ? scheduleVisits.map((visit, index) => {
          const rawTime = `${visit.date || ''} ${visit.time || ''}`.trim();
          return {
            id: `visit_${index}`,
            type: 'VISIT',
            activity: 'Schedule Visit',
            areaName: visit.address,
            lan: visit.lan,
            status: visit.status,
            timestamp: new Date(rawTime).getTime(),
            rawTime,
            latLng: visit.latLng,
          };
        })
      : [];

    return [...trackerItems, ...visitItems]
      .filter(item => Number.isFinite(item.timestamp))
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [filteredTrackerData, scheduleVisits, selectedActivity]);

  const sectionedTimelineData = useMemo(() => {
    const sections = {};

    combinedTimelineData.forEach(item => {
      const sectionTitle = formatTime(item.rawTime);
      if (!sections[sectionTitle]) {
        sections[sectionTitle] = [];
      }
      sections[sectionTitle].push(item);
    });

    return Object.keys(sections).map(title => ({
      title,
      data: sections[title],
    }));
  }, [combinedTimelineData]);

  const focusOnMap = useCallback(latLng => {
    if (!latLng || !mapRef.current) return;
    mapRef.current.animateToRegion(
      {
        ...latLng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      500
    );
  }, []);

  const summaryCards = [
    {
      label: 'Tracker Points',
      value: filteredTrackerData.length,
      hint: selectedActivity?.trim() ? selectedActivity : 'all activities',
      accent: '#2563EB',
    },
    {
      label: 'Visit Stops',
      value: scheduleVisits.length,
      hint: selectedActivity?.trim() ? 'activity filtered' : 'scheduled route',
      accent: '#16A34A',
    },
    {
      label: 'Timeline',
      value: combinedTimelineData.length,
      hint: 'merged events',
      accent: '#F59E0B',
    },
  ];

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconButton}>
          <Image style={styles.icon} source={require('../../../../asset/icon/left.png')} />
        </TouchableOpacity>

        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>Hierarchy Tracking</Text>
          <Text style={styles.headerTitle}>Online User Route</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setRefreshing(true);
            fetchMapData();
          }}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={16} color="#FFFFFF" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMapData} />}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.profileMain}>
              <Text style={styles.userName}>{user.fullName || user.userName}</Text>
              <Text style={styles.userMeta}>{user.role || 'Role unavailable'}</Text>
            </View>
            <View style={styles.statusPill}>
              <Text style={styles.statusPillText}>{user.status || 'Online'}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{user.userName || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Reporting To</Text>
              <Text style={styles.infoValue}>{user.reportingAuthority || 'N/A'}</Text>
            </View>
            <View style={styles.infoItemWide}>
              <Text style={styles.infoLabel}>Start Location</Text>
              <Text style={styles.infoValue}>{startLocationAddress}</Text>
            </View>
            <View style={styles.infoItemWide}>
              <Text style={styles.infoLabel}>Current Location</Text>
              <Text style={styles.infoValue}>{currentLocationAddress}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Login</Text>
              <Text style={styles.infoValue}>{user.loginTime || 'N/A'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(date || new Date())}</Text>
            </View>
          </View>
        </View>

        <View style={styles.summaryRow}>
          {summaryCards.map(card => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </View>

        <View style={styles.mapCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Route Map</Text>
            <Text style={styles.sectionHint}>
              {selectedActivity?.trim() ? `Visited path filtered by ${selectedActivity}` : 'Actual visited path from tracker points'}
            </Text>
          </View>

          <View style={styles.mapContainer}>
            {loading ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#001D56" />
                <Text style={styles.loaderText}>Loading route data...</Text>
              </View>
            ) : (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={allCoordinates[0] ? { ...allCoordinates[0], latitudeDelta: 0.05, longitudeDelta: 0.05 } : FALLBACK_REGION}
                showsUserLocation={false}
                zoomEnabled
                scrollEnabled
                rotateEnabled
              >
                {trackerCoordinates.length > 1 ? (
                  <Polyline coordinates={trackerCoordinates} strokeWidth={4} strokeColor="#C2185B" />
                ) : null}

                {filteredTrackerData.map((item, index) => (
                  <Marker
                    key={`tracker_${item.trackerId ?? index}`}
                    coordinate={item.latLng}
                    pinColor={selectedId === `tracker_${item.trackerId ?? index}` ? '#111827' : getTrackerColor(item.activity)}
                    onPress={() => setSelectedId(`tracker_${item.trackerId ?? index}`)}
                  >
                    <Callout>
                      <View style={styles.callout}>
                        <Text style={styles.calloutTitle}>{item.activity || 'Tracking'}</Text>
                        <Text style={styles.calloutText}>{item.areaName || 'Location unavailable'}</Text>
                        <Text style={styles.calloutText}>Time: {formatTime(item.createdTime)}</Text>
                        {item.lan ? <Text style={styles.calloutText}>LAN: {item.lan}</Text> : null}
                        {item.status ? <Text style={styles.calloutText}>Status: {item.status}</Text> : null}
                      </View>
                    </Callout>
                  </Marker>
                ))}

                {!selectedActivity &&
                  scheduleVisits.map((visit, index) => (
                    <Marker
                      key={`visit_${index}`}
                      coordinate={visit.latLng}
                      pinColor={
                        visit.status === 'Completed'
                          ? '#16A34A'
                          : visit.status === 'Pending'
                            ? '#F59E0B'
                            : '#DC2626'
                      }
                      onPress={() => setSelectedId(`visit_${index}`)}
                    >
                      <Callout>
                        <View style={styles.callout}>
                          <Text style={styles.calloutTitle}>{visit.name || 'Scheduled Visit'}</Text>
                          <Text style={styles.calloutText}>{visit.address || 'Address unavailable'}</Text>
                          <Text style={styles.calloutText}>Time: {visit.time || 'N/A'}</Text>
                          <Text style={styles.calloutText}>Status: {visit.status || 'N/A'}</Text>
                          {visit.lan ? <Text style={styles.calloutText}>LAN: {visit.lan}</Text> : null}
                        </View>
                      </Callout>
                    </Marker>
                  ))}
              </MapView>
            )}
          </View>
        </View>

        <View style={styles.timelineCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity Timeline</Text>
            <Text style={styles.sectionHint}>Tap an event to focus it on the map</Text>
          </View>

          {sectionedTimelineData.length ? (
            <SectionList
              sections={sectionedTimelineData}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              stickySectionHeadersEnabled={false}
              renderSectionHeader={({ section: { title } }) => (
                <View style={styles.timelineSectionHeader}>
                  <Text style={styles.timelineSectionTitle}>{title}</Text>
                </View>
              )}
              renderItem={({ item, index, section }) => (
                <TimelineRow
                  item={item}
                  isLast={index === section.data.length - 1}
                  onPress={() => {
                    setSelectedId(item.id);
                    focusOnMap(item.latLng);
                  }}
                />
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="map-outline" size={24} color="#64748B" />
              <Text style={styles.emptyTitle}>No route data available</Text>
              <Text style={styles.emptyText}>
                Tracker points or schedule visits were not found for this user in the selected time range.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#001D56',
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  headerCopy: {
    flex: 1,
    marginLeft: 12,
  },
  headerEyebrow: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0B4D96',
  },
  refreshText: {
    color: '#FFFFFF',
    marginLeft: 6,
    fontWeight: '700',
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: '#FFFFFF',
  },
  profileCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE5F0',
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  profileMain: {
    flex: 1,
  },
  userName: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '800',
  },
  userMeta: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  statusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  statusPillText: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  infoItem: {
    width: (width - 56) / 2,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
  },
  infoItemWide: {
    width: width - 56,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  infoValue: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#DCE5F0',
  },
  summaryAccent: {
    width: 28,
    height: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  summaryLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryValue: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  summaryHint: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 4,
  },
  mapCard: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE5F0',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  sectionHint: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 4,
  },
  mapContainer: {
    height: height * 0.42,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#E2E8F0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    color: '#475569',
    marginTop: 10,
    fontWeight: '600',
  },
  callout: {
    width: 220,
    padding: 8,
  },
  calloutTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  calloutText: {
    color: '#334155',
    fontSize: 12,
    marginTop: 2,
  },
  timelineCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE5F0',
  },
  timelineSectionHeader: {
    paddingVertical: 8,
  },
  timelineSectionTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  timelineRail: {
    alignItems: 'center',
    width: 18,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#CBD5E1',
  },
  timelineLineTop: {
    minHeight: 10,
  },
  timelineLineHidden: {
    opacity: 0,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginVertical: 4,
  },
  timelineContent: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  timelineTitle: {
    flex: 1,
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  timelineTime: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  timelineAddress: {
    color: '#334155',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  timelineMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  timelineMeta: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
