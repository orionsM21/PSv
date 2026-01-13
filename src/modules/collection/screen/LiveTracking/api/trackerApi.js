import apiClient from "../../../../../common/hooks/apiClient";
import { BASE_URL } from "../../../service/api";



export const trackerApi = {
getTrackingConfig: (token) =>
apiClient.get(`${BASE_URL}getTrackingConfig`, { headers: { Authorization: `Bearer ${token}` } }),


getLiveTrackerDashboard: (userId, payload = null, token) =>
apiClient.post(`${BASE_URL}getLiveTrackerDashboard/${userId}`, payload, { headers: { Authorization: `Bearer ${token}` } }),


mapDataByUserId: (payload, token) =>
apiClient.post(`${BASE_URL}mapDataByUserId`, payload, { headers: { Authorization: `Bearer ${token}` } }),


getAgencyByUserId: (userId, token) =>
apiClient.get(`${BASE_URL}getAgencyByUserId/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),


getAllAgency: (token) =>
apiClient.get(`${BASE_URL}getAllAgency`, { headers: { Authorization: `Bearer ${token}` } }),


liveLocationPost: (TRACKER_ID, ids, token) =>
apiClient.post(`${BASE_URL}liveLocation?TRACKER_ID=${TRACKER_ID}`, ids, { headers: { Authorization: `Bearer ${token}` } }),
};