// /hooks/useVisitApi.js
import { useCallback, useState } from "react";
// import apiClient from '../../../../common/hooks/apiClient';
import { useSelector } from "react-redux";
import { BASE_URL } from "../../../service/api";
import apiClient from "../../../../../common/hooks/apiClient";
// import { BASE_URL } from "../../../api/Endpoint";

export default function useVisitApi(reduxData, loanAccountNumber) {
    const token = useSelector((s) => s.auth.token);
    // const userId = useSelector((s) => s.auth.userProfile?.id);


    const userProfile = useSelector((s) => s.auth.userProfile);
    // const token = useSelector((s) => s.auth.token);

    const [daily, setDaily] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const [yearly, setYearly] = useState([]);


    console.log(daily, 'dailydailydaily')
    const [nameList, setNameList] = useState([]);
    const [addressTypeList, setAddressTypeList] = useState([]);
    const [addressList, setAddressList] = useState([]);
    const [outcomeTypes, setOutcomeTypes] = useState([]);
    console.log(outcomeTypes, 'outcomeTypesoutcomeTypes')
    const authHeader = {
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
        },
    };

    // -------------------------------
    // 1️⃣ Fetch Names
    // -------------------------------
    const fetchNames = useCallback(async () => {
        try {
            const res = await apiClient.get(
                `getNameForVisit/${loanAccountNumber}`,
                authHeader
            );

            const list = res?.data?.data || [];
            setNameList(list);
            return list;
        } catch (err) {
            console.log("fetchNames error:", err);
            return [];
        }
    }, [loanAccountNumber]);

    // -------------------------------
    // 2️⃣ Fetch Address Types
    // -------------------------------
    const fetchAddressTypes = useCallback(async (applicantType) => {
        try {
            const res = await apiClient.get(
                `addressTypes/${applicantType}`,
                authHeader
            );

            const list = (res?.data?.data || []).map((t, i) => ({
                id: i + 1,
                addressType: t,
            }));

            setAddressTypeList(list);
            return list;
        } catch (err) {
            console.log("fetchAddressTypes error:", err);
            return [];
        }
    }, []);

    // -------------------------------
    // 3️⃣ Fetch Address List
    // -------------------------------
    const fetchAddresses = useCallback(
        async (addressType, applicantType) => {
            try {
                const res = await apiClient.get(
                    `visitAddresses/${addressType}/${applicantType}/${loanAccountNumber}`,
                    authHeader
                );

                const list = res?.data?.data || [];
                setAddressList(list);
                return list;
            } catch (err) {
                console.log("fetchAddresses error:", err);
                return [];
            }
        },
        [loanAccountNumber]
    );

    // -------------------------------
    // 4️⃣ Outcome Types
    // -------------------------------
    const fetchOutcomeTypes = useCallback(async () => {
        try {
            const res = await apiClient.get(`getAllActiveOutcomeType`, authHeader);
            const list = res?.data?.data || [];
            setOutcomeTypes(list);
            return list;
        } catch (err) {
            console.log("fetchOutcomeTypes error:", err);
            return [];
        }
    }, []);

    // -------------------------------
    // 5️⃣ Visit History
    // -------------------------------
    const fetchVisitHistory = useCallback(async () => {
        try {
            const dailyRes = await apiClient.get(
                `getVisitsByType/0/${userProfile?.userId}/${loanAccountNumber}?reportType=daily`,
                authHeader
            );
            setDaily(dailyRes?.data?.data || []);

            const monthlyRes = await apiClient.get(
                `getVisitsByType/0/${userProfile?.userId}/${loanAccountNumber}?reportType=monthly`,
                authHeader
            );
            setMonthly(monthlyRes?.data?.data || []);

            const yearlyRes = await apiClient.get(
                `getVisitsByType/0/${userProfile?.userId}/${loanAccountNumber}?reportType=yearly`,
                authHeader
            );
            setYearly(yearlyRes?.data?.data || []);
        } catch (err) {
            console.log("fetchVisitHistory error:", err);
        }
    }, [loanAccountNumber, userProfile]);

    // -------------------------------
    // 6️⃣ Add Visit
    // -------------------------------
    const addVisit = useCallback(
        async (payload) => {
            try {
                const res = await apiClient.post(`addVisit`, payload, authHeader);
                return res?.data?.data;
            } catch (err) {
                console.log("Add Visit Error:", err);
                throw err;
            }
        },
        []
    );

    // -------------------------------
    // 7️⃣ Update Visit
    // -------------------------------
    const updateVisit = useCallback(
        async (visitId, payload) => {
            try {
                const res = await apiClient.put(
                    `updateVisit/${visitId}`,
                    payload,
                    authHeader
                );
                return res?.data;
            } catch (err) {
                console.log("Update Visit Error:", err);
                throw err;
            }
        },
        []
    );

    // -------------------------------
    // 8️⃣ Add User Tracker
    // -------------------------------
    const addUserTracker = useCallback(
        async (trackerPayload) => {
            try {
                const res = await apiClient.post(
                    `addUserTracker`,
                    trackerPayload,
                    authHeader
                );
                return res?.data;
            } catch (err) {
                console.log("User Tracker Error:", err);
            }
        },
        []
    );

    return {
        nameList,
        addressTypeList,
        addressList,
        outcomeTypes,
        todayVisits: daily,
        monthlyVisits: monthly,
        yearlyVisits: yearly,

        fetchNames,
        fetchAddressTypes,
        fetchAddresses,
        fetchOutcomeTypes,
        fetchVisitHistory,

        addVisit,
        updateVisit,
        addUserTracker,
    };
}
