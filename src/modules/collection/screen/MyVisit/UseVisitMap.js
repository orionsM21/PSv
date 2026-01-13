import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import haversine from "haversine-distance";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import apiClient from "../../../../common/hooks/apiClient";
import { BASE_URL } from "../../service/api";

const VISIT_CACHE_KEY = "VISIT_DATA";
const ARRIVAL_RADIUS = 80;
const MAX_VISITS = 10;          // Google-safe
const MATRIX_LIMIT = 5;         // summary only
const GOOGLE_MAPS_KEY = "AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE";
export default function useVisitMap({
  reduxData,
  curlat,
  curLong,
  userLocation,
}) {
  const token = reduxData?.token;
  const userId = reduxData?.userProfile?.userId;

  /* ================= STATE ================= */
  const [dailyData, setDailyData] = useState([]);
  const [directions, setDirections] = useState([]);
  const [distanceInfo, setDistanceInfo] = useState({});
  console.log(distanceInfo, 'distanceInfodistanceInfo')
  const [showNearestRoute, setShowNearestRoute] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [bestVisit, setBestVisit] = useState(null);
  const [nearbyCustomers, setNearbyCustomers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [routeSteps, setRouteSteps] = useState([]);

  /* ================= REFS ================= */
  const loadedRef = useRef(false);
  const computingRef = useRef(false);
  const arrivalShownRef = useRef(false);

  /* ================= ORIGIN ================= */
  const origin = useMemo(() => {
    if (!curlat || !curLong) return null;
    return { latitude: curlat, longitude: curLong };
  }, [curlat, curLong]);

  /* ================= LOCAL ORDERING (FAST) ================= */
  const orderByDistance = useCallback((points, from) => {
    return [...points]
      .map(p => ({
        ...p,
        __dist: haversine(from, p),
      }))
      .sort((a, b) => a.__dist - b.__dist)
      .map(({ __dist, ...rest }) => rest);
  }, []);

  /* ================= ROUTE COMPUTATION ================= */
  const computeRoutes = useCallback(
    (points, nearestOnly) => {
      if (!origin || !points.length || computingRef.current) return;
      computingRef.current = true;

      try {
        const ordered = orderByDistance(points, origin).slice(0, MAX_VISITS);
        const selected = nearestOnly ? [ordered[0]] : ordered;
        setDirections(selected);
      } finally {
        computingRef.current = false;
      }
    },
    [origin, orderByDistance]
  );

  /* ================= SUMMARY DISTANCE (LIGHT API) ================= */
  const fetchDistanceSummary = useCallback(async () => {
    if (!origin || !directions.length) return;

    try {
      const url =
        `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric` +
        `&origins=${origin.latitude},${origin.longitude}` +
        `&destinations=${directions
          .slice(0, MATRIX_LIMIT)
          .map(p => `${p.latitude},${p.longitude}`)
          .join("|")}` +
        `&key=${GOOGLE_MAPS_KEY}`;

      const res = await fetch(url);
      const json = await res.json();
      console.log(json, 'distance nand time')
      const rows = json?.rows?.[0]?.elements ?? [];
      const totalDistance = rows.reduce(
        (s, r) => s + (r?.distance?.value ?? 0),
        0
      );
      const totalDuration = rows.reduce(
        (s, r) => s + (r?.duration?.value ?? 0),
        0
      );

      setDistanceInfo({
        totalDistance: (totalDistance / 1000).toFixed(2),
        totalDuration: Math.round(totalDuration / 60),
      });
    } catch {
      /* silent fail */
    }
  }, [origin, directions]);

  /* ================= ROUTE STEPS ================= */
  useEffect(() => {
    if (!origin || !directions.length) return;

    const fetchSteps = async () => {
      const dest = directions[directions.length - 1];
      const url =
        `https://maps.googleapis.com/maps/api/directions/json` +
        `?origin=${origin.latitude},${origin.longitude}` +
        `&destination=${dest.latitude},${dest.longitude}` +
        `&mode=driving&key=${process.env.GOOGLE_MAPS_KEY}`;

      const res = await fetch(url);
      const json = await res.json();
      setRouteSteps(json?.routes?.[0]?.legs?.[0]?.steps || []);
    };

    fetchSteps();
  }, [origin, directions]);

  /* ================= NEARBY CUSTOMERS ================= */
  useEffect(() => {
    if (!userLocation || !dailyData.length) return;

    setNearbyCustomers(
      dailyData.filter(p => haversine(userLocation, p) <= 500)
    );
  }, [userLocation, dailyData]);

  /* ================= DATA FETCH ================= */
  const getVisitHistory = useCallback(async () => {
    try {
      const res = await apiClient.get(
        `${BASE_URL}getVisitsByType/0/${userId}?reportType=daily`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const points =
        res?.data?.data
          ?.map(p => {
            const [lat, lng] = p.geoCordinates?.split(",")?.map(Number) || [];
            if (!lat || !lng) return null;
            return {
              latitude: lat,
              longitude: lng,
              overdueAmount: p.totalOverdueAmount ?? 0,
              overdueDays: p.dpd ?? 0,
              priority: p.priority ?? "LOW",
              raw: p,
            };
          })
          .filter(Boolean) || [];

      setDailyData(points);
      AsyncStorage.setItem(VISIT_CACHE_KEY, JSON.stringify(points));
      computeRoutes(points, showNearestRoute);
      computeBestVisit(points);
    } catch {
      const cached = await AsyncStorage.getItem(VISIT_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        setDailyData(parsed);
        computeRoutes(parsed, showNearestRoute);
        computeBestVisit(parsed);
      }
    }
  }, [token, userId, computeRoutes, showNearestRoute]);
  const updateDistanceInfo = useCallback(info => {
    setDistanceInfo(info);
  }, []);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    getVisitHistory();
  }, [getVisitHistory]);

  /* ================= BEST VISIT ================= */
  const computeBestVisit = useCallback(
    points => {
      if (!userLocation || !points.length) return;

      const ranked = points
        .map(p => {
          const d = haversine(userLocation, p);
          return {
            ...p,
            score:
              Math.max(0, 1 - d / 3000) * 0.4 +
              Math.min(p.overdueAmount / 30000, 1) * 0.4 +
              (p.priority === "HIGH" ? 0.2 : 0.1),
          };
        })
        .sort((a, b) => b.score - a.score);

      setBestVisit(ranked[0]);
    },
    [userLocation]
  );

  /* ================= ARRIVAL DETECTION ================= */
  useEffect(() => {
    if (!selectedMarker || !userLocation) return;

    const dist = haversine(userLocation, selectedMarker);
    if (dist <= ARRIVAL_RADIUS && !arrivalShownRef.current) {
      arrivalShownRef.current = true;
      Alert.alert("Arrival Detected", "You reached the destination");
    }
    if (dist > ARRIVAL_RADIUS) {
      arrivalShownRef.current = false;
    }
  }, [userLocation, selectedMarker]);

  /* ================= MARKER CLICK ================= */
  const handleMarkerPress = useCallback(marker => {
    setSelectedMarker({
      latitude: marker.latitude,
      longitude: marker.longitude,
      raw: marker.raw || marker,
    });
    setModalVisible(true);
  }, []);

  /* ================= SIDE EFFECT ================= */
  useEffect(() => {
    fetchDistanceSummary();
  }, [fetchDistanceSummary]);
  const toggleNearestRoute = useCallback(() => {
    setShowNearestRoute(v => !v);
  }, []);

  useEffect(() => {
    if (!dailyData.length || !userLocation) return;
    computeRoutes(dailyData, showNearestRoute);
  }, [dailyData, userLocation, showNearestRoute]);


  /* ================= API ================= */
  return {
    dailyData,
    directions,
    distanceInfo,
    selectedMarker,
    modalVisible,
    setModalVisible,
    handleMarkerPress,
    showNearestRoute,
    toggleNearestRoute: () =>
      setShowNearestRoute(v => {
        computeRoutes(dailyData, !v);
        return !v;
      }),
    bestVisit,
    nearbyCustomers,
    routeSteps,
    updateDistanceInfo
  };
}
