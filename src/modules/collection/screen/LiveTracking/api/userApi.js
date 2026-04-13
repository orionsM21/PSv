import apiClient from "../../../../../common/hooks/apiClient";
import { BASE_URL } from "../../../service/api";



export const userApi = {
    getAllStates: (token) => apiClient.get(`getAllStates`, { headers: { Authorization: `Bearer ${token}` } }),
    getCityByState: (stateId, token) => apiClient.get(`getCityByState/${stateId}/0/0`, { headers: { Authorization: `Bearer ${token}` } }),
    getAllPortfolio: (token) => apiClient.get(`getAllPortfolio`, { headers: { Authorization: `Bearer ${token}` } }),
    getAllocatedLowerHierarchyByUserId: (userId, token) => apiClient.get(`getAllocatedLowerHierarchyByUserId/${userId}`, { headers: { Authorization: `Bearer ${token}` } }),
    getAllUserType: (token) => apiClient.get(`getAllUserType`, { headers: { Authorization: `Bearer ${token}` } }),
    getUserByAgency: (agencyId, token) => apiClient.get(`getUserByAgency/${agencyId}`, { headers: { Authorization: `Bearer ${token}` } }),
    getAllUserByAgencyId: (agencyIdsString, token) => apiClient.get(`getAllUserByAgencyId/${agencyIdsString}`, { headers: { Authorization: `Bearer ${token}` } }),
    getUserByFilter: (userId, payload, token) =>
        apiClient({
            url: `getUserByFilter/${userId}`,
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