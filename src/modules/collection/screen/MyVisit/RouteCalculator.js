// /screens/MyVisit/RouteCalculator.js
import React, { useMemo, useState, useCallback } from "react";
import MapViewDirections from "react-native-maps-directions";

export default function RouteCalculator({
  origin,
  directions = [],
  showNearest = false,
  apiKey,
  onReady,
  onDistanceUpdate
}) {
  const [retry, setRetry] = useState(0);

  const { start, end, waypoints, cacheKey } = useMemo(() => {
    if (!origin || !origin.latitude || !origin.longitude || !directions.length) {
      return {};
    }

    // Nearest only
    if (showNearest && directions.length === 1) {
      return {
        start: origin,
        end: directions[0],
        waypoints: [],
        cacheKey: `nearest-${directions[0].latitude}-${directions[0].longitude}`,
      };
    }

    // Full ordered route
    if (!showNearest && directions.length > 0) {
      return {
        start: origin,
        end: directions[directions.length - 1], // last visit
        waypoints: directions.slice(0, -1).slice(0, 10),
        cacheKey: `full-${directions.length}`,
      };
    }

    return {};
  }, [origin, directions, showNearest]);

  const handleError = useCallback(
    err => {
      console.warn("Directions error:", err?.message);
      if (retry < 2 && err?.message !== "ZERO_RESULTS") {
        setTimeout(() => setRetry(r => r + 1), 800);
      }

    },
    [retry]
  );

  if (!start || !end || !apiKey) return null;
  if (!start.latitude || !end.latitude) return null;
  return (

    <MapViewDirections
      key={`${cacheKey}-${retry}`}
      origin={start}
      destination={end}
      waypoints={waypoints}
      apikey={apiKey}
      mode="DRIVING"
      optimizeWaypoints={!showNearest}
      strokeWidth={5}
      strokeColor="#2563EB"
      alternatives={false}
      /* 🔥 TRAFFIC ENABLED */
      departureTime={showNearest ? undefined : "now"}
      trafficModel={showNearest ? undefined : "best_guess"}

      // onReady={onReady}
      onReady={result => {
    onReady?.(result);

    onDistanceUpdate?.({
      totalDistance: result.distance.toFixed(2),
      totalDuration: Math.round(result.duration),
    });
  }}
      onError={handleError}
    />

  );
}
