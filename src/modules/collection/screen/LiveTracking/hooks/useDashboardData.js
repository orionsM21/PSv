// src/hooks/useDashboardData.js
import { useCallback } from "react";
// import { trackerApi } from "../api/trackerApi";
// import { userApi } from "../api/userApi";
import { useSelector } from "react-redux";
import { trackerApi } from "../api/trackerApi";
import { userApi } from "../api/userApi";

export default function useDashboardData() {
    const token = useSelector(s => s.auth.token);
    const userId = useSelector(s => s.auth.userId);

    const getDashBoardData = useCallback(
        async (payload = null) => {
            try {
                const res = await trackerApi.getLiveTrackerDashboard(userId, payload, token);
                return res?.data?.data ?? null;
            } catch (e) {
                console.warn("getDashBoardData", e);
                return null;
            }
        },
        [token, userId]
    );

    const fetchUserByFilter = useCallback(
        async (payload = null) => {
            try {
                const res = await userApi.getUserByFilter(userId, payload ?? null, token);
                return res?.data?.data ?? [];
            } catch (e) {
                console.warn("fetchUserByFilter", e);
                return [];
            }
        },
        [token, userId]
    );

    const mapDataByUserId = useCallback(
        async (ids = []) => {
            if (!ids.length) return { login: [], logout: [], latestActivities: [] };

            try {
                const payload = {
                    userIds: ids,
                    date: new Date().toISOString().slice(0, 10),
                    fromTime: "00-00",
                    toTime: "24-00"
                };

                const res = await trackerApi.mapDataByUserId(payload, token);
                const trackerData = res?.data?.data?.tracker ?? [];

                const latestActivityMap = {};
                trackerData.forEach(act => {
                    const { userId, activity, createdTime } = act;
                    if (activity !== "Login" && activity !== "Logout") return;

                    if (
                        !latestActivityMap[userId] ||
                        new Date(createdTime) > new Date(latestActivityMap[userId].createdTime)
                    )
                        latestActivityMap[userId] = act;
                });

                const latest = Object.values(latestActivityMap);

                const login = [];
                const logout = [];

                latest.forEach(act => {
                    const [lat, lng] = act.coordinates.split(",").map(Number);
                    const obj = {
                        userId: act.userId,
                        latitude: lat,
                        longitude: lng,
                        time: act.createdTime
                    };
                    if (act.activity === "Login") login.push(obj);
                    else logout.push(obj);
                });

                return { login, logout, latestActivities: latest };
            } catch (e) {
                console.warn("mapDataByUserId", e);
                return { login: [], logout: [], latestActivities: [] };
            }
        },
        [token]
    );

    return {
        getDashBoardData,
        fetchUserByFilter,
        mapDataByUserId
    };
}
