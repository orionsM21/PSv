



// /screens/MyVisit/MyVisit.js
import React, { useRef, useEffect, useCallback, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Switch,
  Modal,
  ScrollView,
  Linking,
  StyleSheet, Animated
} from "react-native";
import { useSelector } from "react-redux";
import MapView, { Marker, Polyline, } from "react-native-maps";
import ClusteredMapView from "react-native-map-clustering";
import MarkerItem from "./markItme";
import RouteCalculator from "./RouteCalculator";
import UseVisitMap from "./UseVisitMap";
import UseLiveTracking from "./UseLiveTracking";
import UseTurnNavigation from "./UseTurnNavigation";

import TurnArrow from "../../component/controls/TurnArrow";
import haversine from "haversine-distance";
import useNavigationEngine from "./useNavigationEngine";
const { height, width } = Dimensions.get("screen");
const GOOGLE_KEY = "AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE";

export default function MyVisit({ navigation, route }) {
  const { curlat, curLong } = route.params || {};
  const reduxData = useSelector(s => s.auth);
  const mapRef = useRef(null);
  const [turnInstruction, setTurnInstruction] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [routeKey, setRouteKey] = useState(0);
  /* ---------------- LIVE TRACKING ---------------- */
  const VISIT_CACHE_KEY = "VISIT_DATA";
  const ARRIVAL_RADIUS = 80;
  const MAX_VISITS = 10;          // Google-safe
  const MATRIX_LIMIT = 5;
  /* ---------------- VISIT DATA ---------------- */
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
    etaInfo,
    routeSteps,
    updateDistanceInfo
  } = UseVisitMap({
    reduxData,
    curlat,
    curLong,
    userLocation,

  });

  const {
    userLocation,
    autoFollow,
    trail,
    handleMapDrag,
    reCenter,
  } = UseLiveTracking(mapRef, curlat, curLong, isNavigating);
  const { currentInstruction } = useNavigationEngine(routeSteps, userLocation);
  /* ---------------- TURN NAVIGATION ---------------- */
  const { instruction, distanceLeft } = UseTurnNavigation({
    origin: userLocation,
    destination: selectedMarker,
    apiKey: GOOGLE_KEY,
  });


  const [snappedTrail, setSnappedTrail] = useState([]);

  const lastSnap = useRef(0);





  const [routes, setRoutes] = useState([]);
  const [activeRouteIndex, setActiveRouteIndex] = useState(0);

  console.log(routes,)
  const handleRouteReady = useCallback(result => {
    try {
      const allRoutes = result?.routes;
      if (!allRoutes?.length || !mapRef.current) return;

      setRoutes(allRoutes);
      setActiveRouteIndex(0);

      // Fit to PRIMARY route
      mapRef.current.fitToCoordinates(allRoutes[0].coordinates, {
        edgePadding: { top: 80, right: 40, bottom: 220, left: 40 },
        animated: true,
      });
    } catch (e) {
      console.warn("fitToCoordinates failed", e);
    }
  }, []);



  // const handleRouteReady = useCallback(result => {
  //   setRoutes(result.routes);

  //   setDistanceInfo({
  //     totalDistance: (result.distance).toFixed(2),
  //     totalDuration: Math.round(result.duration),
  //   });

  //   mapRef.current?.fitToCoordinates(result.coordinates, {
  //     edgePadding: { top: 80, right: 40, bottom: 220, left: 40 },
  //     animated: true,
  //   });
  // }, []);


  const initialRegion = useMemo(() => ({
    latitude: curlat,
    longitude: curLong,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }), [curlat, curLong]);

  const smoothHeading = useRef(0);

  useEffect(() => {
    if (!userLocation?.heading) return;

    smoothHeading.current =
      smoothHeading.current * 0.8 + userLocation.heading * 0.2;
  }, [userLocation.heading]);

  const getZoomBySpeed = (speed = 0) => {
    if (speed < 5) return 19;
    if (speed < 20) return 18.5;
    if (speed < 40) return 17.8;
    return 17;
  };



  const snapToRoads = async (coords) => {
    if (!coords.length) return [];

    if (Date.now() - lastSnap.current < 20000) return []; // ⛔ throttle
    lastSnap.current = Date.now();

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000); // ⏱ timeout

    const path = coords
      .slice(-50)
      .map(c => `${c.latitude},${c.longitude}`)
      .join("|");

    const url =
      `https://roads.googleapis.com/v1/snapToRoads?path=${path}&interpolate=true&key=${GOOGLE_KEY}`;

    try {
      const res = await fetch(url, { signal: controller.signal });
      const json = await res.json();

      return (json.snappedPoints || []).map(p => ({
        latitude: p.location.latitude,
        longitude: p.location.longitude,
      }));
    } catch {
      console.warn("⚠️ Roads API timeout — skipping snap");
      return [];
    }
  };



  const isOffRoute = (userLoc, routePoints, threshold = 40) => {
    if (!routePoints?.length || !userLoc) return false;

    return !routePoints.some(p =>
      haversine(
        { latitude: p.latitude, longitude: p.longitude },
        { latitude: userLoc.latitude, longitude: userLoc.longitude }
      ) < threshold
    );
  };

  const refetchRoute = useCallback(() => {
    setRouteKey(k => k + 1);
  }, []);

  useEffect(() => {
    if (!isNavigating || !userLocation || !directions?.length) return;

    if (isOffRoute(userLocation, directions)) {
      console.log("🛑 Off route → Rerouting...");
      refetchRoute();
    }
  }, [userLocation, isNavigating]);

  const smoothArrowHeading = useRef(0);
  useEffect(() => {
    if (!userLocation?.heading) return;

    smoothArrowHeading.current =
      smoothArrowHeading.current * 0.8 +
      userLocation.heading * 0.2;
  }, [userLocation?.heading]);

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
  }, [userLocation]);

  const visibleMarkers = useMemo(
    () => dailyData.slice(0, 30),
    [dailyData]
  );
  useEffect(() => {
    if (!userLocation || !directions.length) return;
    setRouteKey(k => k + 1);
  }, [userLocation?.latitude, userLocation?.longitude]);

  const routeOrigin = userLocation
    ? {
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    }
    : null;
  return (
    <SafeAreaView style={styles.root}>

      {/* MAP CONTAINER */}
      <View style={styles.mapContainer}>
        <ClusteredMapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          // onMapReady={() => setMapReady(true)}
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

          /* Clustering disabled in navigation */
          // radius={isNavigating ? 0 : 50}
          radius={!isNavigating ? 50 : 0}
          maxZoom={19}

          clusterColor="#2563EB"
          clusterTextColor="#fff"
          clusterBorderColor="#fff"
          clusterBorderWidth={2}
        >
          {userLocation && (
            <>
              {/* 🔵 Blue dot when NOT navigating */}
              {!isNavigating && (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  anchor={{ x: 0.5, y: 0.5 }}
                  pinColor="blue"
                />
              )}

              {/* 🧭 TURN ARROW (Google Maps style) */}
              {isNavigating && (
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  anchor={{ x: 0.5, y: 0.8 }}
                  flat
                  rotation={smoothArrowHeading.current || 0}
                >
                  <TurnArrow />
                </Marker>
              )}
            </>
          )}


          {trail.length > 1 && (
            <Polyline coordinates={trail} strokeWidth={4} strokeColor="#3B82F6" />




          )}

          {/* {dailyData.map((p, index) => ( */}
          {visibleMarkers.map((p, index) => (
            <MarkerItem
              key={p.raw?.visitId ?? index}
              item={{ ...p.raw, latitude: p.latitude, longitude: p.longitude }}
              onPress={() => handleMarkerPress(p)}
            />
          ))}

          <RouteCalculator
            key={`${routeKey}-${showNearestRoute}`}
            origin={routeOrigin}
            // origin={{ latitude: curlat, longitude: curLong }}
            directions={directions.map(d => ({
              latitude: d.latitude,
              longitude: d.longitude,
            }))}
            showNearest={showNearestRoute}
            apiKey={GOOGLE_KEY}
            userLocation={userLocation}
            onReady={handleRouteReady}
            onDistanceUpdate={updateDistanceInfo}
            onStepChange={(step) => setTurnInstruction(step.html_instructions)}
          />
          {routes.map((r, index) => (
            <Polyline
              key={index}
              coordinates={r.coordinates}
              strokeWidth={index === activeRouteIndex ? 6 : 4}
              strokeColor={index === activeRouteIndex ? "#2563EB" : "#94A3B8"}
              zIndex={index === activeRouteIndex ? 2 : 1}
            />
          ))}

        </ClusteredMapView>

        {routes.length > 1 && (
          <View style={styles.routeChooser}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {routes.map((r, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.routeCard,
                    index === activeRouteIndex && styles.routeCardActive,
                  ]}
                  onPress={() => {
                    setActiveRouteIndex(index);
                    mapRef.current?.fitToCoordinates(r.coordinates, {
                      edgePadding: { top: 80, right: 40, bottom: 220, left: 40 },
                      animated: true,
                    });
                  }}
                >
                  <Text style={styles.routeTime}>
                    ⏱ {Math.round(r.legs[0].duration.value / 60)} min
                  </Text>
                  <Text style={styles.routeDistance}>
                    📏 {(r.legs[0].distance.value / 1000).toFixed(1)} km
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}


        {/* CLUSTERED MARKERS – ONLY WHEN NOT NAVIGATING */}
        {currentInstruction && (
          <View style={styles.turnOverlay}>
            <View style={styles.turnCardNew}>
              <Text style={styles.turnIcon}>🧭</Text>

              <View style={{ flex: 1 }}>
                <Text style={styles.turnMainText} numberOfLines={2}>
                  {currentInstruction.text}
                </Text>
                <Text style={styles.turnDistanceText}>
                  {currentInstruction.distance}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Floating Recenter */}
        <View style={styles.fabContainer}>
          {/* Recenter Button */}
          <TouchableOpacity style={styles.fab} onPress={reCenter}>
            <Text style={styles.fabText}>⌖</Text>
          </TouchableOpacity>

          {/* Navigation Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.fabNav,
              isNavigating ? styles.fabStop : styles.fabStart,
            ]}
            // onPress={() => setIsNavigating(prev => !prev)}
            onPress={() => {
              setIsNavigating(prev => {
                const next = !prev;

                if (next) {
                  // 🔥 Immediately enter navigation mode
                  setTimeout(() => {
                    animateToNavigationView();
                  }, 50);
                }

                return next;
              });
            }}

          >
            <Text style={styles.fabIcon}>
              {isNavigating ? "⏹" : "▶"}
            </Text>
            <Text style={styles.fabLabel}>
              {isNavigating ? "Stop" : "Start"}
            </Text>
          </TouchableOpacity>




        </View>



        {/* Turn Instruction */}
        {instruction && (
          <View style={styles.turnCard}>
            <Text style={styles.turnText}>
              🧭 {instruction.replace(/<[^>]+>/g, "")}
            </Text>
            {distanceLeft && (
              <Text style={styles.turnSub}>{distanceLeft} m</Text>
            )}
          </View>
        )}

        {turnInstruction && (
          <View style={styles.turnBox}>
            <View style={styles.turnBadge}>
              <Text style={styles.turnBadgeText}>TURN</Text>
            </View>

            <Text style={styles.turnText}>
              {turnInstruction.replace(/<[^>]+>/g, "")}
            </Text>

            {distanceLeft && (
              <Text style={styles.turnDistance}>
                {distanceLeft} m
              </Text>
            )}
          </View>
        )}
      </View>

      {
        selectedMarker && (
          <Modal visible={modalVisible} transparent animationType="slide">
            <View style={styles.modalWrap}>
              <TouchableOpacity style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
              <View style={styles.modalCard}>
                <View style={styles.modalGrabber} />

                <Text style={styles.modalTitle}>{selectedMarker.raw?.name}</Text>
                <Text style={styles.modalAddr}>{selectedMarker.raw?.address}</Text>


                {etaInfo && (
                  <Text style={{ paddingHorizontal: 16 }}>
                    ⏱ ETA: {etaInfo.durationText} ({etaInfo?.distanceText})
                  </Text>
                )}

                <Text
                  style={[
                    styles.modalStatus,
                    {
                      color:
                        selectedMarker.raw?.status === "Completed"
                          ? "green"
                          : selectedMarker.raw?.status === "Pending"
                            ? "orange"
                            : "red",
                    },
                  ]}
                >
                  {selectedMarker.raw?.status}
                </Text>

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() =>
                      navigation.navigate("CaseDetails", {
                        data: selectedMarker.bulkUploadSuccess,
                      })
                    }
                  >
                    <Text style={styles.btnText}>Case Details</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.btn}
                    onPress={() =>
                      Linking.openURL(
                        `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                          selectedMarker.raw.address
                        )}`
                      )
                    }
                  >
                    <Text style={styles.btnText}>Navigate</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        )
      }

      {/* BOTTOM CONTENT */}
      <View style={styles.bottomSheet}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {bestVisit && (
            <TouchableOpacity
              style={styles.bestVisit}
              onPress={() => handleMarkerPress(bestVisit)}
            >
              <Text style={styles.bestTitle}>⭐ Next Best Visit</Text>
              <Text style={styles.bestSub}>
                {bestVisit.raw?.name} — ₹{bestVisit.overdueAmount}
              </Text>
            </TouchableOpacity>
          )}

          <View style={styles.switchRow}>
            <Text style={{ fontWeight: "600" }}>Nearest Visits Route</Text>
            <Switch value={showNearestRoute} onValueChange={toggleNearestRoute} />
          </View>

          <Text style={{ color: '#000', fontSize: 13, fontWeight: '500', marginTop: 8 }}>
            Duration : {distanceInfo.totalDuration || "-"} Minutes
          </Text>
          <Text style={{ color: '#000', fontSize: 13, fontWeight: '500', marginTop: 8 }}>
            Distance : {distanceInfo.totalDistance || "-"} km</Text>
        </ScrollView>
      </View>

    </SafeAreaView >

  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  bestVisit: {
    backgroundColor: "#2563EB",
    // padding: 14,
    padding: 6,
    borderRadius: 14,
    // marginTop: 12,
  },
  bestTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  bestSub: { color: "#E0E7FF", marginTop: 4 },
  modalGrabber: {
    width: 40,
    height: 5,
    backgroundColor: "#D1D5DB",
    borderRadius: 10,
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  modalAddr: {
    fontSize: 14,
    color: "#6B7280",
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  modalStatus: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    paddingHorizontal: 16,
  },
  root: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  mapContainer: {
    height: height * 0.7,
    backgroundColor: "#E5E7EB",
  },
  turnCard: {
    position: "absolute",
    top: 18,
    left: 16,
    right: 16,
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 14,
    elevation: 8,
  },
  turnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  turnSub: {
    fontSize: 13,
    color: "#2563EB",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    marginHorizontal: 8
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalWrap: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
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
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 90,
    alignItems: "center",
    gap: 12, // spacing between buttons
  },
  fab: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  fabText: {
    fontSize: 22,
    fontWeight: "700",
    color: "#555",
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
  fabIcon: {
    fontSize: 18,
    marginRight: 6,
    color: "#fff",
  },
  fabLabel: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  turnOverlay: {
    position: "absolute",
    top: 14,
    left: 12,
    right: 12,
    alignItems: "center",
    zIndex: 20,
  },

  turnCardNew: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minWidth: "92%",

    // Elevation / Shadow
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },

  turnIcon: {
    fontSize: 22,
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
  },

});
