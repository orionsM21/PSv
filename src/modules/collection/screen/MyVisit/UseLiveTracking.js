// // /screens/MyVisit/useLiveTracking.js
// import { useEffect, useState, useRef } from "react";
// import Geolocation from "@react-native-community/geolocation";
// import haversine from "haversine-distance";

// export default function UseLiveTracking(mapRef, initialLat, initialLng) {
//   const [userLocation, setUserLocation] = useState(
//     initialLat && initialLng
//       ? { latitude: initialLat, longitude: initialLng }
//       : null
//   );
//   const [autoFollow, setAutoFollow] = useState(true);
//   const [trail, setTrail] = useState([]);

//   const watchId = useRef(null);

//   useEffect(() => {
//     if (!initialLat || !initialLng) return;

//     watchId.current = Geolocation.watchPosition(
//       pos => {
//         const nextLoc = {
//           latitude: pos.coords.latitude,
//           longitude: pos.coords.longitude,
//         };

//         setUserLocation(nextLoc);

//         // Breadcrumb trail (only if moved > 20m)
//         setTrail(prev => {
//           if (!prev.length) return [nextLoc];
//           const last = prev[prev.length - 1];
//           const dist = haversine(last, nextLoc);
//           return dist > 20 ? [...prev, nextLoc] : prev;
//         });

//         if (autoFollow && mapRef.current) {
//           mapRef.current.animateToRegion(
//             {
//               ...nextLoc,
//               latitudeDelta: 0.01,
//               longitudeDelta: 0.01,
//             },
//             400
//           );
//         }
//       },
//       err => console.warn("GPS Error:", err),
//       {
//         enableHighAccuracy: true,
//         distanceFilter: 5,
//         interval: 2000,
//         fastestInterval: 1000,
//       }
//     );

//     return () => {
//       if (watchId.current != null) {
//         Geolocation.clearWatch(watchId.current);
//       }
//     };
//   }, [initialLat, initialLng, autoFollow, mapRef]);

//   const handleMapDrag = () => setAutoFollow(false);

//   const reCenter = () => {
//     setAutoFollow(true);
//     if (mapRef.current && userLocation) {
//       mapRef.current.animateToRegion(
//         {
//           ...userLocation,
//           latitudeDelta: 0.01,
//           longitudeDelta: 0.01,
//         },
//         400
//       );
//     }
//   };

//   return {
//     userLocation,
//     autoFollow,
//     trail,
//     handleMapDrag,
//     reCenter,
//   };
// }


// /screens/MyVisit/useLiveTracking.js
import { useEffect, useState, useRef } from "react";
import Geolocation from "@react-native-community/geolocation";
import haversine from "haversine-distance";

export default function UseLiveTracking(
  mapRef,
  initialLat,
  initialLng,
  isNavigating = false // 🔥 NEW
) {
  const [userLocation, setUserLocation] = useState(
    initialLat && initialLng
      ? { latitude: initialLat, longitude: initialLng }
      : null
  );

  const [autoFollow, setAutoFollow] = useState(true);
  const [trail, setTrail] = useState([]);

  const watchId = useRef(null);
  const lastLocationRef = useRef(null);

  /* ---------------- GPS CONFIG (BATTERY OPTIMIZED) ---------------- */
  const gpsOptions = isNavigating
    ? {
      enableHighAccuracy: true,
      distanceFilter: 5,
      interval: 1000,
      fastestInterval: 800,
    }
    : {
      enableHighAccuracy: false,
      distanceFilter: 25,
      interval: 5000,
      fastestInterval: 3000,
    };

  /* ---------------- START TRACKING ---------------- */
  useEffect(() => {
    if (!initialLat || !initialLng) return;

    watchId.current = Geolocation.watchPosition(
      pos => {
        const {
          latitude,
          longitude,
          speed = 0,
          heading = 0,
        } = pos.coords;

        const nextLoc = {
          latitude,
          longitude,
          speed,
          heading,
        };

        setUserLocation(nextLoc);

        /* -------- Breadcrumb Trail (distance based) -------- */
        setTrail(prev => {
          if (!prev.length) {
            lastLocationRef.current = nextLoc;
            return [nextLoc];
          }

          const last = lastLocationRef.current;
          const dist = haversine(
            { latitude: last.latitude, longitude: last.longitude },
            { latitude, longitude }
          );

          if (dist > 20) {
            lastLocationRef.current = nextLoc;
            return [...prev, nextLoc];
          }

          return prev;
        });

        /* -------- Auto-follow ONLY when not navigating -------- */
        if (autoFollow && mapRef.current && !isNavigating) {
          mapRef.current.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            },
            400
          );
        }
      },
      err => {
        console.warn("GPS Error:", err);
      },
      gpsOptions
    );

    return () => {
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
      }
    };
  }, [initialLat, initialLng, autoFollow, isNavigating]);

  /* ---------------- MAP INTERACTION ---------------- */
  const handleMapDrag = () => {
    setAutoFollow(false);
  };

  const reCenter = () => {
    setAutoFollow(true);
    if (mapRef.current && userLocation) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        400
      );
    }
  };

  return {
    userLocation, // now includes speed + heading
    autoFollow,
    trail,
    handleMapDrag,
    reCenter,
  };
}
