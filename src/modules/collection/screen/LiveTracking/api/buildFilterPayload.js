// src/utils/buildFilterPayload.js

export default function buildFilterPayload(filters) {
  if (!filters) return null;

  let requestBody = {
    cityIds: filters.city ? [filters.city] : [],
    portfolioIds: filters.portfolio ? [filters.portfolio] : [],
    stateIds: filters.state ? [filters.state] : [],
    userType: filters.userType ? [filters.userType] : [],
    activity: filters.activity ? [filters.activity] : [],
    productIds: [],
    regionIds: [],
    zoneIds: [],
    agencyIds: [],
    userIds: []
  };

  // Check if ANY of these arrays contain values
  const hasData = Object.values(requestBody).some(
    v => Array.isArray(v) && v.length > 0
  );

  // If no filter -> backend requires NULL
  if (!hasData) return null;

  return requestBody;
}
