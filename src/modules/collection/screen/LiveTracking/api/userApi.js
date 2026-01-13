import apiClient from "../../../../../common/hooks/apiClient";
import { BASE_URL } from "../../../service/api";



export const userApi = {
    getAllStates: (token) => apiClient.get(`${BASE_URL}getAllStates`, { headers: { Authorization: `Bearer ${token}` } }),
    getCityByState: (stateId, token) => apiClient.get(`${BASE_URL}getCityByState/${stateId}/0/0`, { headers: { Authorization: `Bearer ${token}` } }),
    getAllPortfolio: (token) => apiClient.get(`${BASE_URL}getAllPortfolio`, { headers: { Authorization: `Bearer ${token}` } }),
    getAllocatedLowerHierarchyByUserId: (userId, token) => apiClient.get(`${BASE_URL}getAllocatedLowerHierarchyByUserId/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
    getAllUserType: (token) => apiClient.get(`${BASE_URL}getAllUserType`, { headers: { Authorization: `Bearer ${token}` } }),
    getUserByAgency: (agencyId, token) => apiClient.get(`${BASE_URL}getUserByAgency/${agencyId}`, { headers: { Authorization: `Bearer ${token}` } }),
    getAllUserByAgencyId: (agencyIdsString, token) => apiClient.get(`${BASE_URL}getAllUserByAgencyId/${agencyIdsString}`, { headers: { Authorization: `Bearer ${token}` } }),
    getUserByFilter: (userId, payload, token) =>
        apiClient({
            url: `${BASE_URL}getUserByFilter/${userId}`,
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            data: payload === null ? null : payload,
            transformRequest: [
                function (data) {
                    if (data === null) return "null";   // EXACT REQUEST BODY THE BACKEND EXPECTS
                    return JSON.stringify(data);
                }
            ]
        }),

};