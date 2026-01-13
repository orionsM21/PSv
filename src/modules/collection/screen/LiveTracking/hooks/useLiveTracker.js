// src/hooks/useLiveTracker.js
import { useEffect, useRef, useState, useCallback } from "react";
import { trackerApi } from "../api/trackerApi";

export default function useLiveTracker(token) {
    const evtRef = useRef(null);
    const [liveLocation, setLiveLocation] = useState([]); // array of {userId,userName,latitude,longitude,status,time}
    const [isConnected, setIsConnected] = useState(false);
    const [apiError, setApiError] = useState(false);

    const stop = useCallback(() => {
        try {
            evtRef.current?.close();
        } catch (e) { /* ignore */ }
        evtRef.current = null;
        setIsConnected(false);
    }, []);

    const start = useCallback(async (ids) => {
        stop();
        if (!ids || ids.length === 0) return;

        // Open EventSource to server - include token in query param (server must support it)
        // (EventSource cannot add headers in browsers; query param is common approach)
        const url = token ? `tracker?token=${encodeURIComponent(token)}` : "tracker";
        const es = new EventSource(url);
        evtRef.current = es;

        es.onopen = () => { setIsConnected(true); setApiError(false); };
        es.onerror = (e) => {
            setApiError(true);
            if (es.readyState === EventSource.CLOSED) stop();
        };

        // Server will send a TRACKER_ID event first — we then POST the ids to liveLocation endpoint
        es.addEventListener("TRACKER_ID", async (ev) => {
            try {
                const guid = JSON.parse(ev.data);
                // listen for server messages (actual location messages)
                es.addEventListener("message", (messageEvent) => {
                    try {
                        const result = JSON.parse(messageEvent.data);
                        // normalize
                        const cleaned = result.map(item => {
                            const [lat, lng] = (item.coordinates || "").split(",").map(Number);
                            return {
                                userId: item.userId,
                                userName: item.userName,
                                latitude: Number.isFinite(lat) ? lat : null,
                                longitude: Number.isFinite(lng) ? lng : null,
                                status: item.status,
                                time: item.createdTime || new Date().toISOString(),
                            };
                        }).filter(it => it.latitude !== null && it.longitude !== null);

                        setLiveLocation(cleaned);
                        // server may send special code to end stream
                        if (Array.isArray(result) && parseInt(result[0]) === 100) {
                            stop();
                        }
                    } catch (err) {
                        console.warn("liveTracker message parse", err);
                    }
                });

                // Post ids to server to register this TRACKER_ID
                await trackerApi.liveLocationPost(guid, ids, token);
            } catch (err) {
                console.warn("TRACKER_ID handler", err);
                setApiError(true);
                stop();
            }
        });

        // fallback timeout: if not open in 5s mark error
        const timeoutId = setTimeout(() => { if (es.readyState !== EventSource.OPEN) setApiError(true); }, 5000);

        // return cleanup for this start call
        return () => {
            clearTimeout(timeoutId);
            try { if (es.readyState === EventSource.OPEN) es.close(); } catch (e) { }
            evtRef.current = null;
            setIsConnected(false);
        };
    }, [stop, token]);

    //   useEffect(() => () => stop(), [stop]);

    // derived arrays
    const loginCoordinates = liveLocation.filter(x => x.status === "Login").map(x => ({
        userId: x.userId, latitude: x.latitude, longitude: x.longitude, time: x.time
    }));
    const logoutCoordinates = liveLocation.filter(x => x.status === "Logout").map(x => ({
        userId: x.userId, latitude: x.latitude, longitude: x.longitude, time: x.time
    }));

    const onlineUserMap = new Map(liveLocation.map(u => [u.userId, u.userName]));

    return {
        liveLocation,
        loginCoordinates,
        logoutCoordinates,
        onlineUserMap,
        isConnected,
        apiError,
        // start,
        // stop,
    };
}
