import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
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
      return latLng ? { ...item, latLng } : null;
    })
    .filter(Boolean);
}

function formatDateTime(value) {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

const InfoCard = React.memo(({ label, value }) => (
  <View style={styles.infoCard}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value || 'N/A'}</Text>
  </View>
));

export default function OfflineSelectedUserdetailsMap({ route }) {
  const { user } = route.params;
  const navigation = useNavigation();
  const token = useSelector(state => state.auth.token);
  const mapRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trackerData, setTrackerData] = useState([]);

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

  const fetchTrackerHistory = useCallback(async () => {
    setLoading(true);
    try {
      const payload = {
        userIds: [user.userId],
        date: new Date().toISOString().slice(0, 10),
        fromTime: '00-00',
        toTime: '24-00',
      };

      const response = await apiClient.post('mapDataByUserId', payload, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const tracker = response?.data?.data?.tracker || [];
      setTrackerData(normalizeTrackerData(tracker));
    } catch (error) {
      console.error('offline mapDataByUserId Error:', error);
      setTrackerData([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, user.userId]);

  useEffect(() => {
    fetchTrackerHistory();
  }, [fetchTrackerHistory]);

  const trackerCoordinates = useMemo(
    () => trackerData.map(item => item.latLng).filter(Boolean),
    [trackerData]
  );

  const lastTrackerPoint = trackerData[trackerData.length - 1] || null;
  const firstTrackerPoint = trackerData[0] || null;

  useEffect(() => {
    if (!trackerCoordinates.length || !mapRef.current) return;
    mapRef.current.fitToCoordinates(trackerCoordinates, {
      edgePadding: { top: 80, right: 60, bottom: 100, left: 60 },
      animated: true,
    });
  }, [trackerCoordinates]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconButton}>
          <Image style={styles.icon} source={require('../../../../asset/icon/left.png')} />
        </TouchableOpacity>

        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>Hierarchy Tracking</Text>
          <Text style={styles.headerTitle}>Offline User Route</Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            setRefreshing(true);
            fetchTrackerHistory();
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchTrackerHistory} />}
      >
        <View style={styles.profileCard}>
          <View style={styles.profileTopRow}>
            <View style={styles.profileMain}>
              <Text style={styles.userName}>{user.fullName || user.userName}</Text>
              <Text style={styles.userMeta}>{user.role || 'Role unavailable'}</Text>
            </View>
            <View style={styles.offlinePill}>
              <Text style={styles.offlinePillText}>{user.status || 'Offline'}</Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <InfoCard label="Username" value={user.userName} />
            <InfoCard
              label="Reporting To"
              value={user.reportingAuthority === '0' ? 'Self' : user.reportingAuthority}
            />
            <InfoCard label="Last Logout" value={user.logoutTime || 'N/A'} />
            <InfoCard label="Tracker Points" value={String(trackerData.length)} />
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryAccent} />
          <Text style={styles.summaryTitle}>Last Known Tracking</Text>
          <Text style={styles.summaryText}>
            {lastTrackerPoint?.areaName || 'No tracker location available for the selected user.'}
          </Text>
          <Text style={styles.summaryMeta}>
            {lastTrackerPoint ? formatDateTime(lastTrackerPoint.createdTime) : 'No timestamp available'}
          </Text>
        </View>

        <View style={styles.mapCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Movement Map</Text>
            <Text style={styles.sectionHint}>Shows available tracker history for the currently offline user.</Text>
          </View>

          <View style={styles.mapContainer}>
            {loading ? (
              <View style={styles.loaderWrap}>
                <ActivityIndicator size="large" color="#001D56" />
                <Text style={styles.loaderText}>Loading tracker history...</Text>
              </View>
            ) : trackerCoordinates.length ? (
              <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={
                  trackerCoordinates[0]
                    ? { ...trackerCoordinates[0], latitudeDelta: 0.05, longitudeDelta: 0.05 }
                    : FALLBACK_REGION
                }
                zoomEnabled
                scrollEnabled
                rotateEnabled
              >
                {trackerCoordinates.length > 1 ? (
                  <Polyline coordinates={trackerCoordinates} strokeWidth={4} strokeColor="#DC2626" />
                ) : null}

                {firstTrackerPoint ? (
                  <Marker coordinate={firstTrackerPoint.latLng} pinColor="#2563EB">
                    <Callout>
                      <View style={styles.callout}>
                        <Text style={styles.calloutTitle}>First captured point</Text>
                        <Text style={styles.calloutText}>{firstTrackerPoint.areaName || 'Location unavailable'}</Text>
                        <Text style={styles.calloutText}>{formatDateTime(firstTrackerPoint.createdTime)}</Text>
                      </View>
                    </Callout>
                  </Marker>
                ) : null}

                {lastTrackerPoint ? (
                  <Marker coordinate={lastTrackerPoint.latLng} pinColor="#DC2626">
                    <Callout>
                      <View style={styles.callout}>
                        <Text style={styles.calloutTitle}>Last known point</Text>
                        <Text style={styles.calloutText}>{lastTrackerPoint.areaName || 'Location unavailable'}</Text>
                        <Text style={styles.calloutText}>{formatDateTime(lastTrackerPoint.createdTime)}</Text>
                      </View>
                    </Callout>
                  </Marker>
                ) : null}
              </MapView>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="navigate-outline" size={26} color="#64748B" />
                <Text style={styles.emptyTitle}>No map route available</Text>
                <Text style={styles.emptyText}>
                  Tracker history was not found for this user today, so only the profile summary is shown.
                </Text>
              </View>
            )}
          </View>
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
  profileTopRow: {
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
  offlinePill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
  },
  offlinePillText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '700',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  infoCard: {
    width: (width - 56) / 2,
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
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DCE5F0',
  },
  summaryAccent: {
    width: 32,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#DC2626',
    marginBottom: 10,
  },
  summaryTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },
  summaryText: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  summaryMeta: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '600',
  },
  mapCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
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
});
