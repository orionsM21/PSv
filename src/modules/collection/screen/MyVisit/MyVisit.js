

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Dimensions,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSelector } from "react-redux";
import { Marker, Polyline } from "react-native-maps";
import ClusteredMapView from "react-native-map-clustering";
import Ionicons from "react-native-vector-icons/Ionicons";
import MarkerItem from "./markItme";
import RouteCalculator from "./RouteCalculator";
import UseVisitMap from "./UseVisitMap";
import UseLiveTracking from "./UseLiveTracking";
import UseTurnNavigation from "./UseTurnNavigation";
import useNavigationEngine from "./useNavigationEngine";
import TurnArrow from "../../component/controls/TurnArrow";
import haversine from "haversine-distance";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { height, width } = Dimensions.get("screen");
const GOOGLE_KEY = "AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE";
const FALLBACK_REGION = {
  latitude: 20.5937,
  longitude: 78.9629,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function formatStatusColor(status) {
  if (status === "Completed") return "#16A34A";
  if (status === "Pending") return "#F59E0B";
  return "#DC2626";
}

const MyVisit = ({ navigation, route }) => {
  const { curlat, curLong } = route.params || {};
  const reduxData = useSelector(state => state.auth);
  const mapRef = useRef(null);
  const smoothHeading = useRef(0);
  const insets = useSafeAreaInsets();
  const startLatitude = Number(curlat) || FALLBACK_REGION.latitude;
  const startLongitude = Number(curLong) || FALLBACK_REGION.longitude;
  const [sheetHeight, setSheetHeight] = useState(0);
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeKey, setRouteKey] = useState(0);
  const [routes, setRoutes] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  const {
    userLocation,
    autoFollow,
    trail,
    handleMapDrag,
    reCenter,
  } = UseLiveTracking(mapRef, startLatitude, startLongitude, isNavigating);

  const {
    dailyData,
    selectedMarker,
    modalVisible,
    setModalVisible,
    handleMarkerPress,
    showNearestRoute,
    toggleNearestRoute,
    directions,
    distanceInfo,
    bestVisit,
    nearbyCustomers,
    routeSteps,
    updateDistanceInfo,
  } = UseVisitMap({
    reduxData,
    curlat: startLatitude,
    curLong: startLongitude,
    userLocation,
  });
  console.log(showNearestRoute, toggleNearestRoute, 'showNearestRoute')

  const { currentInstruction } = useNavigationEngine(routeSteps, userLocation);
  const { instruction, distanceLeft } = UseTurnNavigation({
    origin: userLocation,
    destination: selectedMarker,
    apiKey: GOOGLE_KEY,
  });

  const initialRegion = useMemo(
    () => ({
      latitude: startLatitude,
      longitude: startLongitude,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    }),
    [startLatitude, startLongitude]
  );

  // const visibleMarkers = useMemo(() => dailyData.slice(0, 30), [dailyData]);
  const visibleMarkers = useMemo(() => dailyData, [dailyData]);
  const routeOrigin = userLocation
    ? {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    }
    : null;

  const activeRoute = routes[activeRouteIndex] || null;
  const canStartNavigation = Boolean(selectedMarker && routeOrigin);
  const selectedStatus = selectedMarker?.raw?.status || "Pending";
  const selectedStatusColor = formatStatusColor(selectedStatus);

  const summaryCards = useMemo(
    () => [
      {
        label: "Visits",
        value: dailyData.length,
        hint: `${nearbyCustomers.length} nearby`,
      },
      {
        label: "Route",
        value: directions.length || "-",
        hint: showNearestRoute ? "nearest mode" : "full route",
      },
      {
        label: "ETA",
        value: distanceInfo.totalDuration || "-",
        hint: "minutes",
      },
    ],
    [dailyData.length, directions.length, distanceInfo.totalDuration, nearbyCustomers.length, showNearestRoute]
  );

  const normalizeAngle = angle => (angle + 360) % 360;

  useEffect(() => {
    if (userLocation?.heading == null) return;

    const prev = normalizeAngle(smoothHeading.current);
    const next = normalizeAngle(userLocation.heading);

    let diff = next - prev;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    smoothHeading.current = normalizeAngle(prev + diff * 0.2);
  }, [userLocation?.heading]);

  const getZoomBySpeed = useCallback((speed = 0) => {
    if (speed < 5) return 19;
    if (speed < 20) return 18.5;
    if (speed < 40) return 17.8;
    return 17;
  }, []);

  const animateToNavigationView = useCallback(() => {
    if (!mapRef.current || !userLocation) return;

    mapRef.current.animateCamera(
      {
        center: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
        },
        zoom: getZoomBySpeed(userLocation.speed),
        pitch: 65,
        heading: userLocation.heading || smoothHeading.current || 0,
      },
      { duration: 900 }
    );
  }, [getZoomBySpeed, userLocation]);

  const handleRouteReady = useCallback(result => {
    try {
      const allRoutes = result?.routes || [];
      if (!allRoutes.length || !mapRef.current) return;

      setRoutes(allRoutes);
      setActiveRouteIndex(0);

      mapRef.current.fitToCoordinates(allRoutes[0].coordinates, {
        edgePadding: { top: 100, right: 40, bottom: 220, left: 40 },
        animated: true,
      });
    } catch (error) {
      console.warn("fitToCoordinates failed", error);
    }
  }, []);

  const refetchRoute = useCallback(() => {
    setRouteKey(current => current + 1);
  }, []);

  const isOffRoute = useCallback((currentLocation, routePoints, threshold = 40) => {
    if (!currentLocation || !routePoints?.length) return false;

    return !routePoints.some(point => {
      return (
        haversine(
          { latitude: point.latitude, longitude: point.longitude },
          { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
        ) < threshold
      );
    });
  }, []);

  const offRouteTimeout = useRef(null);

  useEffect(() => {
    if (!isNavigating || !userLocation || !directions?.length) return;

    if (isOffRoute(userLocation, directions)) {
      if (offRouteTimeout.current) return;

      offRouteTimeout.current = setTimeout(() => {
        refetchRoute();
        offRouteTimeout.current = null;
      }, 1500); // debounce
    }
  }, [directions, isNavigating, isOffRoute, refetchRoute, userLocation]);

  useEffect(() => {
    if (!userLocation || !directions.length) return;
    setRouteKey(current => current + 1);
  }, [directions.length, userLocation?.latitude, userLocation?.longitude]);

  const handleNavigationToggle = useCallback(() => {
    if (!canStartNavigation && !isNavigating) {
      Alert.alert("Select a visit", "Choose a visit marker before starting navigation.");
      return;
    }

    setIsNavigating(previous => {
      const next = !previous;

      if (next) {
        setTimeout(() => {
          animateToNavigationView();
        }, 50);
      }

      return next;
    });
  }, [animateToNavigationView, canStartNavigation, isNavigating]);

  const openExternalNavigation = useCallback(() => {
    if (!selectedMarker) return;

    const destination = selectedMarker.raw?.address
      ? encodeURIComponent(selectedMarker.raw.address)
      : `${selectedMarker.latitude},${selectedMarker.longitude}`;

    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${destination}`);
  }, [selectedMarker]);
  const routePolylines = useMemo(() => {
    return routes.map((routeOption, index) => (
      <Polyline
        key={index}
        coordinates={routeOption.coordinates}
        strokeWidth={index === activeRouteIndex ? 6 : 4}
        strokeColor={index === activeRouteIndex ? "#2563EB" : "#94A3B8"}
        zIndex={index === activeRouteIndex ? 2 : 1}
      />
    ));
  }, [routes, activeRouteIndex]);
  const renderedMarkers = useMemo(() => {
    return visibleMarkers.map((point, index) => (
      <MarkerItem
        key={point.raw?.visitId ?? index}
        item={{ ...point.raw, latitude: point.latitude, longitude: point.longitude }}
        onPress={() => handleMarkerPress(point)}
      />
    ));
  }, [visibleMarkers, handleMarkerPress]);
  return (
    <SafeAreaView style={styles.root}>
      {/* <View style={styles.mapContainer}> */}

      <View style={{ flex: 1 }}>
        <ClusteredMapView
          ref={mapRef}
          style={{ flex: 1 }}
          provider="google"
          initialRegion={initialRegion}
          showsBuildings
          showsCompass={false}
          rotateEnabled
          pitchEnabled
          zoomEnabled
          scrollEnabled
          onPanDrag={handleMapDrag}
          onRegionChangeComplete={handleMapDrag}
          radius={!isNavigating ? 50 : 0}
          maxZoom={19}
          clusterColor="#2563EB"
          clusterTextColor="#FFFFFF"
          clusterBorderColor="#FFFFFF"
          clusterBorderWidth={2}
          contentInset={{
            top: 180,
            bottom: sheetHeight + 100,
            left: 0,
            right: 0,
          }}
        >
          {userLocation ? (
            <>
              {!isNavigating ? (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  anchor={{ x: 0.5, y: 0.5 }}
                  pinColor="blue"
                />
              ) : (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  anchor={{ x: 0.5, y: 0.8 }}
                  flat
                  rotation={smoothHeading.current || 0}
                >
                  <TurnArrow />
                </Marker>
              )}
            </>
          ) : null}

          {trail.length > 1 ? (
            <Polyline coordinates={trail} strokeWidth={4} strokeColor="#3B82F6" />
          ) : null}

          {renderedMarkers}

          <RouteCalculator
            key={`${routeKey}-${showNearestRoute}`}
            origin={routeOrigin}
            directions={directions.map(item => ({
              latitude: item.latitude,
              longitude: item.longitude,
            }))}
            showNearest={showNearestRoute}
            apiKey={GOOGLE_KEY}
            userLocation={userLocation}
            onReady={handleRouteReady}
            onDistanceUpdate={updateDistanceInfo}
          />

          {/* {routes.map((routeOption, index) => (
              <Polyline
                key={index}
                coordinates={routeOption.coordinates}
                strokeWidth={index === activeRouteIndex ? 6 : 4}
                strokeColor={index === activeRouteIndex ? "#2563EB" : "#94A3B8"}
                zIndex={index === activeRouteIndex ? 2 : 1}
              />
            ))} */}
          {routePolylines}
        </ClusteredMapView>
      </View>

      <View
        style={[
          styles.heroOverlay,
          { top: insets.top + 12 }
        ]}
      >
        <View style={styles.heroCard}>
          <View style={styles.heroHeaderRow}>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>Field Visit Navigator</Text>
              <Text style={styles.heroTitle}>My Visits</Text>
              <Text style={styles.heroSubtitle}>
                Track your daily route, pick the right customer, and move with clearer guidance.
              </Text>
            </View>
            <View style={[styles.followBadge, autoFollow && styles.followBadgeActive]}>
              <Ionicons
                name={autoFollow ? "locate" : "map-outline"}
                size={14}
                color={autoFollow ? "#DBEAFE" : "#D1D5DB"}
              />
              <Text style={styles.followBadgeText}>
                {autoFollow ? "Auto-follow" : "Manual map"}
              </Text>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            {summaryCards.map(card => (
              <View key={card.label} style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{card.label}</Text>
                <Text style={styles.summaryValue}>{card.value}</Text>
                <Text style={styles.summaryHint}>{card.hint}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {currentInstruction ? (
        <View style={styles.turnOverlay}>
          <View style={styles.turnCardNew}>
            <View style={styles.turnIconWrap}>
              <Ionicons name="navigate" size={18} color="#2563EB" />
            </View>
            <View style={styles.flexOne}>
              <Text style={styles.turnMainText} numberOfLines={2}>
                {currentInstruction.text}
              </Text>
              <Text style={styles.turnDistanceText}>{currentInstruction.distance}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {routes.length > 1 ? (
        <View style={styles.routeChooser}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {routes.map((routeOption, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.routeCard, index === activeRouteIndex && styles.routeCardActive]}
                onPress={() => {
                  setActiveRouteIndex(index);
                  mapRef.current?.fitToCoordinates(routeOption.coordinates, {
                    edgePadding: { top: 100, right: 40, bottom: 220, left: 40 },
                    animated: true,
                  });
                }}
              >
                <Text style={styles.routeTime}>
                  {Math.round(routeOption.legs[0].duration.value / 60)} min
                </Text>
                <Text style={styles.routeDistance}>
                  {(routeOption.legs[0].distance.value / 1000).toFixed(1)} km
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View
        style={[
          styles.fabContainer,

          { bottom: insets.bottom + sheetHeight + 16 }
        ]}
      >
        <TouchableOpacity style={styles.fab} onPress={reCenter}>
          <Ionicons name="locate" size={22} color="#475569" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.fabNav,
            !canStartNavigation && !isNavigating && styles.fabDisabled,
            isNavigating ? styles.fabStop : styles.fabStart,
          ]}
          onPress={handleNavigationToggle}
        >
          <Ionicons
            name={isNavigating ? "square" : "play"}
            size={16}
            color="#FFFFFF"
            style={styles.fabIcon}
          />
          <Text style={styles.fabLabel}>{isNavigating ? "Stop nav" : "Start nav"}</Text>
        </TouchableOpacity>
      </View>

      {(instruction || distanceLeft) && !currentInstruction ? (
        <View style={styles.turnCard}>
          {instruction ? <Text style={styles.turnText}>{instruction.replace(/<[^>]+>/g, "")}</Text> : null}
          {distanceLeft ? <Text style={styles.turnSub}>{distanceLeft} m</Text> : null}
        </View>
      ) : null}


      {selectedMarker ? (
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalWrap}>
            <TouchableOpacity style={styles.modalBackdrop} onPress={() => setModalVisible(false)} />
            <View style={styles.modalCard}>
              <View style={styles.modalGrabber} />

              <View style={styles.modalTitleRow}>
                <View style={styles.flexOne}>
                  <Text style={styles.modalTitle}>{selectedMarker.raw?.name || "Selected visit"}</Text>
                  <Text style={styles.modalAddr}>{selectedMarker.raw?.address || "Address unavailable"}</Text>
                </View>
                <View style={[styles.statusPill, { backgroundColor: `${selectedStatusColor}18` }]}>
                  <Text style={[styles.statusPillText, { color: selectedStatusColor }]}>{selectedStatus}</Text>
                </View>
              </View>

              <View style={styles.modalInfoRow}>
                <View style={styles.modalInfoCard}>
                  <Text style={styles.modalInfoLabel}>Overdue</Text>
                  <Text style={styles.modalInfoValue}>
                    Rs {selectedMarker.raw?.totalOverdueAmount ?? selectedMarker.overdueAmount ?? 0}
                  </Text>
                </View>
                <View style={styles.modalInfoCard}>
                  <Text style={styles.modalInfoLabel}>DPD</Text>
                  <Text style={styles.modalInfoValue}>
                    {selectedMarker.raw?.dpd ?? selectedMarker.overdueDays ?? 0} days
                  </Text>
                </View>
              </View>

              <View style={styles.modalBtnRow}>
                <TouchableOpacity
                  style={styles.btnMuted}
                  onPress={() =>
                    navigation.navigate("CaseDetails", {
                      data: selectedMarker.raw?.bulkUploadSuccess || selectedMarker.raw,
                    })
                  }
                >
                  <Text style={styles.btnMutedText}>Case details</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btn} onPress={openExternalNavigation}>
                  <Text style={styles.btnText}>Open navigation</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      ) : null}

      <View style={styles.bottomSheet}
        onLayout={(e) => setSheetHeight(e.nativeEvent.layout.height)}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {bestVisit ? (
            <TouchableOpacity style={styles.bestVisit} onPress={() => handleMarkerPress(bestVisit)}>
              <Text style={styles.bestTitle}>Next Best Visit</Text>
              <Text style={styles.bestSub}>
                {bestVisit.raw?.name} - Rs {bestVisit.overdueAmount}
              </Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.switchRow}>
            <View style={styles.flexOne}>
              <Text style={styles.sectionLabel}>Nearest-first routing</Text>
              <Text style={styles.sectionHint}>
                {showNearestRoute ? "Only the best next stop is prioritized." : "The full visit order is shown."}
              </Text>
            </View>
            <Switch value={showNearestRoute} onValueChange={toggleNearestRoute} />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Duration</Text>
              <Text style={styles.metricValue}>{distanceInfo.totalDuration || "-"}</Text>
              <Text style={styles.metricHint}>minutes</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Distance</Text>
              <Text style={styles.metricValue}>{distanceInfo.totalDistance || "-"}</Text>
              <Text style={styles.metricHint}>km</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Route option</Text>
              <Text style={styles.metricValue}>{activeRoute ? activeRouteIndex + 1 : "-"}</Text>
              <Text style={styles.metricHint}>{routes.length || 0} choices</Text>
            </View>
          </View>

          {!dailyData.length ? (
            <View style={styles.emptyState}>
              <Ionicons name="location-outline" size={24} color="#64748B" />
              <Text style={styles.emptyTitle}>No visits loaded</Text>
              <Text style={styles.emptyText}>
                Visit data has not been loaded yet. Open this screen from the dashboard visit flow after visits are synced.
              </Text>
            </View>
          ) : null}
        </ScrollView>
      </View>

      {/* </View > */}
    </SafeAreaView >
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  flexOne: {
    flex: 1,
  },
  mapContainer: {
    // height: height * 0.68,
    flex: 1,
    backgroundColor: "#E5E7EB",
  },
  heroOverlay: {
    position: "absolute",
    left: 12,
    right: 12,
    pointerEvents: "box-none",
  },
  heroCard: {
    backgroundColor: "rgba(7, 19, 33, 0.84)",
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.22)",
  },
  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  heroCopy: {
    flex: 1,
  },
  heroEyebrow: {
    color: "#8BD3FF",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    color: "#F8FAFC",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 6,
  },
  heroSubtitle: {
    color: "#B9C8D9",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
    maxWidth: "92%",
  },
  followBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  followBadgeActive: {
    backgroundColor: "rgba(37,99,235,0.35)",
  },
  followBadgeText: {
    color: "#F8FAFC",
    fontSize: 12,
    fontWeight: "700",
  },
  summaryGrid: {
    flexDirection: "row",
    marginTop: 16,
    gap: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 18,
    padding: 12,
  },
  summaryLabel: {
    color: "#9FB2C8",
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  summaryValue: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 6,
  },
  summaryHint: {
    color: "#B9C8D9",
    fontSize: 11,
    marginTop: 4,
  },
  turnOverlay: {
    position: "absolute",
    top: 120,
    left: 12,
    right: 12,
    alignItems: "center",
    zIndex: 20,
    pointerEvents: "box-none", // ✅ IMPORTANT
  },
  turnCardNew: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: "92%",
    elevation: 8,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  turnIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  turnMainText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  turnDistanceText: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "#2563EB",
  },
  routeChooser: {
    position: "absolute",
    bottom: 150,
    left: 0,
    right: 0,
    paddingVertical: 8,
    pointerEvents: "box-none",
  },
  routeCard: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    marginHorizontal: 8,
    minWidth: 120,
    elevation: 4,
  },
  routeCardActive: {
    borderWidth: 2,
    borderColor: "#2563EB",
  },
  routeTime: {
    fontWeight: "700",
    fontSize: 14,
    color: "#111827",
  },
  routeDistance: {
    fontSize: 12,
    color: "#475569",
    marginTop: 4,
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    // bottom: 120, // 👈 above bottom sheet
    alignItems: "center",
    zIndex: 1000,
    elevation: 20,
  },

  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    marginBottom: 12,
  },

  fabNav: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 30,
    elevation: 10,
  },
  fabStart: {
    backgroundColor: "#2563EB",
  },
  fabStop: {
    backgroundColor: "#EF4444",
  },
  fabDisabled: {
    opacity: 0.6,
  },
  fabIcon: {
    marginRight: 6,
  },
  fabLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  turnCard: {
    position: "absolute",
    top: 170,
    left: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 14,
    elevation: 8,
  },
  turnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  turnSub: {
    fontSize: 13,
    color: "#2563EB",
    marginTop: 4,
  },
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    flex: 1,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalGrabber: {
    width: 40,
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  modalAddr: {
    fontSize: 14,
    color: "#6B7280",
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
  },
  modalInfoRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalInfoCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
  },
  modalInfoLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  modalInfoValue: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 6,
  },
  modalBtnRow: {
    flexDirection: "row",
    marginTop: 16,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  btnMuted: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 6,
  },
  btnText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  btnMutedText: {
    color: "#2563EB",
    fontWeight: "700",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginHorizontal: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 160,
    maxHeight: height * 0.4,
  },
  bestVisit: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 16,
  },
  bestTitle: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  bestSub: {
    color: "#E0E7FF",
    marginTop: 4,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    gap: 12,
  },
  sectionLabel: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
  sectionHint: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 4,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
  },
  metricLabel: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
  },
  metricValue: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 6,
  },
  metricHint: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    marginTop: 16,
  },
  emptyTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 8,
  },
  emptyText: {
    color: "#64748B",
    fontSize: 12,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },
});

export default MyVisit