import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import Geolocation from "@react-native-community/geolocation";
import axios from "axios";
import ForegroundService from "react-native-foreground-service";
import apiClient from "../../../common/hooks/apiClient";

const TRACKING_CONTEXT_KEY = "@collection_tracking_context";
const TRACKING_QUEUE_KEY = "@collection_tracking_queue";
const LAST_TRACK_AT_KEY = "@collection_last_track_at";
const FOREGROUND_NOTIFICATION_ID = 424242;
export const COLLECTION_TRACKING_TASK = "collectionTrackingTask";

const GOOGLE_MAPS_APIKEY = "AIzaSyBG9734uddJ097xreg01CHlifuhac8PvsE";

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (value === null || value === undefined || value === "") return [];
  return [value];
}

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function getIntervalMs(context) {
  return context?.trackerAdminConfig?.frequencyType === "realtime" ? 15000 : 3600000;
}

function buildFrequencyDate(hours, minutes, period) {
  const date = new Date();
  const normalizedHour = period === "PM" && hours !== 12 ? hours + 12 : period === "AM" && hours === 12 ? 0 : hours;
  date.setHours(normalizedHour, minutes, 0, 0);
  return date;
}

function parseTimeString(timeString) {
  if (!timeString) return null;
  const [timePart, period = "AM"] = timeString.split(" ");
  const [hour = 0, minute = 0] = timePart.split(":").map(Number);
  return buildFrequencyDate(hour, minute, period);
}

function isWithinTrackingWindow(config) {
  if (!config?.active || !config.frequencyStartTime || !config.frequencyEndTime || !config.frequencyType) {
    return false;
  }

  const currentDate = new Date();
  const start = config.startDate ? new Date(config.startDate) : null;
  const end = config.endDate ? new Date(config.endDate) : null;

  if (config.repeatEvery === "Monthly" && config.selectedMonths) {
    const currentMonth = currentDate.toLocaleString("en-US", { month: "short" });
    const selectedMonths = config.selectedMonths.split(", ").map(month => month.trim());
    if (!selectedMonths.includes(currentMonth)) return false;
  } else if (config.repeatEvery === "Yearly" && config.selectedYears) {
    const selectedYears = config.selectedYears.split(", ").map(year => year.trim());
    if (!selectedYears.includes(String(currentDate.getFullYear()))) return false;
  } else if (config.repeatEvery === "Days" && start && end) {
    if (currentDate < start || currentDate > end) return false;
  } else if (config.repeatEvery === "Weekly" && config.selectedWeeks) {
    const currentDay = currentDate.toLocaleString("en-US", { weekday: "short" });
    const selectedWeeks = config.selectedWeeks.split(", ").map(day => day.trim());
    if (!selectedWeeks.includes(currentDay)) return false;
  }

  const frequencyStart = parseTimeString(config.frequencyStartTime);
  const frequencyEnd = parseTimeString(config.frequencyEndTime);
  if (!frequencyStart || !frequencyEnd) return false;

  return currentDate >= frequencyStart && currentDate <= frequencyEnd;
}

function hasInternalAccess(context) {
  const roleCodes = toArray(context?.roleCode);
  const roles = Array.isArray(context?.roles) ? context.roles : [];

  return roles.some(role => roleCodes.includes(role?.roleName) || roleCodes.includes(role?.roleCode));
}

function hasAgencyAccess(context) {
  const excludedRoles = ["DRA", "ARM", "PRM", "CH", "RH", "ZRM"];
  const roleCodes = toArray(context?.roleCode);
  if (!roleCodes?.length || roleCodes.some(code => excludedRoles.includes(code))) {
    return false;
  }

  const agencyIds = toArray(context?.agencyIds);
  const configs = Array.isArray(context?.agencyTrackingConfigs) ? context.agencyTrackingConfigs : [];
  const matchingAgencyConfig = configs.find(config => agencyIds.includes(config?.agencyId));
  if (!matchingAgencyConfig?.agencyTrackingRoleStatus) return false;

  const parsedRoles = safeJsonParse(matchingAgencyConfig.agencyTrackingRoleStatus, []);
  return roleCodes.some(code => parsedRoles.some(role => role?.roleCode === code && role?.status === "Y"));
}

export function shouldRunCollectionTracking(context) {
  if (!context?.trackerAdminConfig) return false;
  if (!isWithinTrackingWindow(context.trackerAdminConfig)) return false;
  return hasInternalAccess(context) || hasAgencyAccess(context);
}

function buildTrackerPayload({ userId, coordinates, areaName = null, activity = null, timestamp }) {
  return {
    userId,
    activity,
    activityId: null,
    coordinates,
    areaName,
    lan: null,
    customerAddress: null,
    addressType: null,
    addressCoordinates: null,
    differenceInKm: null,
    exception: null,
    clientTimestamp: timestamp,
  };
}

function getCurrentPositionAsync() {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  });
}

async function reverseGeocodeCoordinates(coordinates) {
  try {
    const response = await axios.get(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates}&key=${GOOGLE_MAPS_APIKEY}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    if (response?.data?.status !== "OK") return null;
    return response?.data?.results?.[0]?.formatted_address || null;
  } catch {
    return null;
  }
}

async function getStoredQueue() {
  const raw = await AsyncStorage.getItem(TRACKING_QUEUE_KEY);
  return safeJsonParse(raw, []);
}

async function setStoredQueue(queue) {
  await AsyncStorage.setItem(TRACKING_QUEUE_KEY, JSON.stringify(queue));
}

async function appendQueueItem(item) {
  const queue = await getStoredQueue();
  queue.push(item);
  await setStoredQueue(queue);
}

async function markTrackedNow() {
  await AsyncStorage.setItem(LAST_TRACK_AT_KEY, String(Date.now()));
}

async function shouldRespectTrackGap(context) {
  const lastTrackedAt = Number(await AsyncStorage.getItem(LAST_TRACK_AT_KEY));
  if (!lastTrackedAt) return false;

  const gap = Date.now() - lastTrackedAt;
  const intervalMs = getIntervalMs(context);
  const allowedGap = intervalMs === 15000 ? 12000 : Math.max(intervalMs - 60000, 300000);
  return gap < allowedGap;
}

async function postTrackerPayload(payload, token) {
  return apiClient.post("addUserTracker", payload, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function trackCollectionCoordinates({
  context,
  coordinates,
  activity = null,
  timestamp = new Date().toISOString(),
}) {
  const activeContext = context || (await loadCollectionTrackingContext());
  const latestToken = (await AsyncStorage.getItem("@token")) || activeContext?.token;
  if (!activeContext?.userId || !latestToken || !coordinates) return false;
  if (!shouldRunCollectionTracking(activeContext)) return false;

  if (await shouldRespectTrackGap(activeContext)) {
    return false;
  }

  const netState = await NetInfo.fetch();
  if (!netState.isConnected) {
    await queueCollectionTrackerPayload(
      buildTrackerPayload({
        userId: activeContext.userId,
        coordinates,
        activity,
        timestamp,
      })
    );
    return true;
  }

  const areaName = await reverseGeocodeCoordinates(coordinates);
  const payload = buildTrackerPayload({
    userId: activeContext.userId,
    coordinates,
    areaName,
    activity,
    timestamp,
  });

  await postTrackerPayload(payload, latestToken);
  await markTrackedNow();
  await flushPendingCollectionTrackers();
  return true;
}

export async function saveCollectionTrackingContext(context) {
  await AsyncStorage.setItem(TRACKING_CONTEXT_KEY, JSON.stringify(context));
}

export async function loadCollectionTrackingContext() {
  const raw = await AsyncStorage.getItem(TRACKING_CONTEXT_KEY);
  return safeJsonParse(raw, null);
}

export async function queueCollectionTrackerPayload(payload) {
  await appendQueueItem({
    payload,
    queuedAt: new Date().toISOString(),
  });
  await markTrackedNow();
}

export async function flushPendingCollectionTrackers() {
  const netState = await NetInfo.fetch();
  if (!netState.isConnected) return false;

  const context = await loadCollectionTrackingContext();
  const token = context?.token || (await AsyncStorage.getItem("@token"));
  if (!token) return false;

  const queue = await getStoredQueue();
  if (!queue?.length) return true;

  const remaining = [];

  for (const item of queue) {
    try {
      const payload = { ...(item?.payload || {}) };
      if (!payload.areaName && payload.coordinates) {
        payload.areaName = await reverseGeocodeCoordinates(payload.coordinates);
      }
      await postTrackerPayload(payload, token);
      await new Promise(resolve => setTimeout(resolve, 250));
    } catch (error) {
      remaining.push(item);
      if (error?.type === "NETWORK_ERROR" || error?.message?.includes("Network")) {
        break;
      }
    }
  }

  await setStoredQueue(remaining);
  return remaining?.length === 0;
}

export async function captureAndTrackCollectionLocation(options = {}) {
  const context = options.context || (await loadCollectionTrackingContext());
  if (!context?.userId || !context?.token) return false;
  if (!shouldRunCollectionTracking(context)) return false;

  try {
    const position = await getCurrentPositionAsync();
    const coordinates = `${position.coords.latitude},${position.coords.longitude}`;
    return await trackCollectionCoordinates({
      context,
      coordinates,
      activity: options.activity ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return false;
  }
}

export async function startCollectionTrackingService(context) {
  if (Platform.OS !== "android") return false;
  await saveCollectionTrackingContext(context);

  try {
    const isRunning = await ForegroundService.isRunning();
    if (!isRunning) {
      await ForegroundService.startService({
        id: FOREGROUND_NOTIFICATION_ID,
        title: "Collection tracking active",
        message: "Live location tracking is running for visit monitoring.",
        icon: "ic_launcher",
        visibility: "public",
        importance: "high",
        number: "1",
        button: false,
      });
    } else {
      await ForegroundService.updateNotification({
        id: FOREGROUND_NOTIFICATION_ID,
        title: "Collection tracking active",
        message: "Live location tracking is running for visit monitoring.",
        icon: "ic_launcher",
        visibility: "public",
        importance: "high",
        number: "1",
      });
    }

    await ForegroundService.runTask({
      taskName: COLLECTION_TRACKING_TASK,
      delay: 0,
      onLoop: true,
      loopDelay: getIntervalMs(context),
    });

    return true;
  } catch {
    return false;
  }
}

export async function stopCollectionTrackingService() {
  if (Platform.OS !== "android") return false;
  try {
    await ForegroundService.stopServiceAll();
    return true;
  } catch {
    return false;
  }
}

export async function syncCollectionTrackingService(context) {
  await saveCollectionTrackingContext(context);
  if (shouldRunCollectionTracking(context)) {
    await startCollectionTrackingService(context);
    return true;
  }

  await stopCollectionTrackingService();
  return false;
}

export async function collectionTrackingForegroundTask() {
  await captureAndTrackCollectionLocation();
}
