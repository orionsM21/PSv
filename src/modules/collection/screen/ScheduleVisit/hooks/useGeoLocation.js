// /hooks/useGeoLocation.js
import { useEffect, useRef, useState, useCallback } from "react";
import Geolocation from "@react-native-community/geolocation";
import axios from "axios";

const GOOGLE_MAPS_API_KEY = "AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE";

export default function useGeoLocation() {
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [address, setAddress] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const retryCount = useRef(0);
    const MAX_RETRIES = 5;

    const toRadians = (deg) => (deg * Math.PI) / 180;

    const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
        if (!lat1 || !lng1 || !lat2 || !lng2) return 0;

        const R = 6371;
        const dLat = toRadians(lat2 - lat1);
        const dLng = toRadians(lng2 - lng1);

        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLng / 2) ** 2;

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Number((R * c).toFixed(2));
    }, []);

    const reverseGeocode = useCallback(async (lat, lng) => {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`;
            const res = await axios.get(url);

            const result = res.data?.results?.[0]?.formatted_address;
            if (result) {
                setAddress(result);
                return result;
            }
        } catch (err) {
            console.log("Reverse geocode error:", err);
        }
        return null;
    }, []);

    const fetchLocation = useCallback(() => {
        setIsLoading(true);

        // Geolocation.getCurrentPosition(
        //     async (pos) => {
        //         const { latitude, longitude } = pos.coords;
        //         setCoords({ lat: latitude, lng: longitude });
        //         retryCount.current = 0;
        //         setIsLoading(false);

        //         await reverseGeocode(latitude, longitude);
        //     },
        //     (error) => {
        //         console.log("Geo error:", error);

        //         if (retryCount.current < MAX_RETRIES) {
        //             retryCount.current += 1;
        //             setTimeout(fetchLocation, 1000);
        //         } else {
        //             setIsLoading(false);
        //         }
        //     },
        //     {
        //         enableHighAccuracy: true,
        //         timeout: 15000,
        //         maximumAge: 30000,
        //     }
        // );
        Geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                // 
                setCoords({ lat: latitude, lng: longitude });
                setIsLoading(false);
                await reverseGeocode(latitude, longitude);

            },
            (error) => {
                console.error('Error getting locationDashboard.js:', error.message);
                // Retry fetching location after a delay
                setTimeout(fetchLocation, 1000); // Retry after 1 second (adjust as needed)
                setIsLoading(false);
            },
        );
    }, [reverseGeocode]);

    useEffect(() => {
        fetchLocation();
    }, [fetchLocation]);

    const getLatLngFromAddress = useCallback(async (fullAddress) => {
        try {
            const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
                fullAddress
            )}&key=${GOOGLE_MAPS_API_KEY}`;

            const res = await axios.get(url);

            const loc = res.data?.results?.[0]?.geometry?.location;
            if (loc) return { lat: loc.lat, lng: loc.lng };
        } catch (e) {
            console.log("Address → LatLng error:", e);
        }
        return null;
    }, []);

    return {
        isLoading,
        coords,
        address,
        refresh: fetchLocation,
        getLatLngFromAddress,
        calculateDistance,
    };
}
