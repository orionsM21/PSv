export const getBusinessTimestamp = businessDate => {
  const raw = businessDate?.businnessDate;

  if (Array.isArray(raw) && raw.length >= 3) {
    return new Date(raw[0], raw[1] - 1, raw[2]).getTime();
  }

  return Date.now();
};

export const formatBusinessRelativeTime = (timestamp, businessDate) => {
  if (!timestamp) {
    return 'Just now';
  }

  const now = getBusinessTimestamp(businessDate);
  const activityTime =
    typeof timestamp === 'number' ? timestamp : new Date(timestamp).getTime();
  const diff = Math.max(now - activityTime, 0);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return 'Just now';
  }

  if (diff < hour) {
    return `${Math.floor(diff / minute)} min ago`;
  }

  if (diff < day) {
    return `${Math.floor(diff / hour)} hr ago`;
  }

  return `${Math.floor(diff / day)} days ago`;
};

export const filterUserActivity = (logs = [], userName, limit = 10) =>
  (logs || [])
    .filter(item => item.user === userName)
    .sort(
      (left, right) =>
        new Date(right.timestamp || right.createdTime) -
        new Date(left.timestamp || left.createdTime),
    )
    .slice(0, limit);

export const getRate = (numerator, denominator) => {
  if (!denominator) {
    return 0;
  }

  return Math.round((numerator / denominator) * 100);
};

export const sumTaskBuckets = taskBuckets =>
  Object.values(taskBuckets || {}).reduce(
    (sum, list) => sum + (Array.isArray(list) ? list.length : 0),
    0,
  );

export const groupStageItems = (items = [], leadLabel = 'Lead Intake') =>
  (items || []).reduce((accumulator, item) => {
    const stage = item?.appId === null ? leadLabel : item?.stage || 'Unknown';
    (accumulator[stage] ||= []).push(item);
    return accumulator;
  }, {});

export const sortGroupedStages = groupedStages =>
  Object.entries(groupedStages || {}).sort(
    (left, right) => right[1].length - left[1].length,
  );

export const getStagePresentation = stageValue => {
  const stage = (stageValue || '').toLowerCase();

  if (stage.includes('reject')) {
    return {
      color: '#F97316',
      badgeColor: 'rgba(249,115,22,0.12)',
      badgeTextColor: '#F97316',
    };
  }

  if (stage.includes('disburs')) {
    return {
      color: '#10B981',
      badgeColor: 'rgba(16,185,129,0.14)',
      badgeTextColor: '#10B981',
    };
  }

  return {
    color: '#2563EB',
    badgeColor: 'rgba(37,99,235,0.12)',
    badgeTextColor: '#2563EB',
  };
};
