// src/hooks/useTrackerConfig.js
import { useEffect, useState, useCallback } from 'react';
import { trackerApi } from '../api/trackerApi';



export function useTrackerConfig(token, navigation) {
    const [config, setConfig] = useState(null);
    const [roles, setRoles] = useState([]);
    const [agencyTrackingConfigs, setAgencyTrackingConfigs] = useState([]);
    const [showTrackingAccess, setShowTrackingAccess] = useState(true);


    const processRoles = useCallback((configs) => {
        const filtered = [];
        configs.forEach((c) => {
            try {
                const arr = JSON.parse(c.agencyTrackingRoleStatus || '[]');
                arr.forEach(role => { if (role.status === 'Y') filtered.push({ roleCode: role.roleCode, agencyName: c.agencyName }); });
            } catch (e) { /* ignore malformed */ }
        });
        return filtered;
    }, []);


    const load = useCallback(async () => {
        try {
            const res = await trackerApi.getTrackingConfig(token);
            const responseData = res?.data?.response;
            if (Array.isArray(responseData) && responseData.length > 0) {
                const first = responseData[0];
                setConfig(first);
                setRoles(first.roles || []);
                setAgencyTrackingConfigs(first.agencyTrackingConfigs || []);
                const processed = processRoles(first.agencyTrackingConfigs || []);
                if (first.active === false) {
                    setShowTrackingAccess(false);
                    navigation?.navigate('Dashboard');
                }
            }
        } catch (err) {
            console.warn('useTrackerConfig.load', err);
        }
    }, [token, processRoles, navigation]);


    useEffect(() => { load(); const id = setInterval(load, 70000); return () => clearInterval(id); }, [load]);


    return { config, roles, agencyTrackingConfigs, showTrackingAccess, processRoles };
}