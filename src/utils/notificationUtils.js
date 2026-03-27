import { INVITATION_ROUTES, VISITOR_ROUTES } from '../constants/routeConstants';

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const buildLookup = (source) => {
  if (!isObject(source)) {
    return {};
  }

  return Object.entries(source).reduce((lookup, [key, value]) => {
    lookup[key.toLowerCase()] = value;
    return lookup;
  }, {});
};

const getValue = (source, ...keys) => {
  const lookup = buildLookup(source);

  for (const key of keys) {
    const value = lookup[key.toLowerCase()];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
};

const toNumber = (value) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

export const parseNotificationPayload = (payloadData) => {
  if (isObject(payloadData)) {
    return payloadData;
  }

  if (typeof payloadData !== 'string' || payloadData.trim() === '') {
    return null;
  }

  try {
    return JSON.parse(payloadData);
  } catch {
    return null;
  }
};

export const extractNotificationData = (notification) => {
  const data = isObject(notification?.data) ? notification.data : null;
  const additionalData = isObject(getValue(data, 'additionalData')) ? getValue(data, 'additionalData') : null;
  const payloadData = parseNotificationPayload(notification?.payloadData ?? getValue(data, 'payloadData'));

  const mergedData = {
    ...(payloadData || {}),
    ...(additionalData || {}),
    ...(data || {})
  };

  return Object.keys(mergedData).length > 0 ? mergedData : null;
};

const normalizeEntityType = (entityType, data) => {
  if (typeof entityType === 'string' && entityType.trim() !== '') {
    const normalized = entityType.trim().toLowerCase();

    if (normalized.includes('invitation') || normalized.includes('approval') || normalized.includes('walk')) {
      return 'invitation';
    }

    if (normalized.includes('visitor')) {
      return 'visitor';
    }
  }

  if (toNumber(getValue(data, 'invitationId')) !== null) {
    return 'invitation';
  }

  if (toNumber(getValue(data, 'visitorId')) !== null) {
    return 'visitor';
  }

  return null;
};

export const getNotificationEntity = (notification) => {
  const data = extractNotificationData(notification);
  const relatedEntityType = getValue(notification, 'relatedEntityType');
  const entityType = normalizeEntityType(relatedEntityType, data);

  if (!entityType) {
    return { entityType: null, entityId: null };
  }

  const entityId = entityType === 'invitation'
    ? toNumber(
        getValue(notification, 'relatedEntityId') ??
        getValue(data, 'invitationId', 'relatedEntityId', 'walkInId')
      )
    : toNumber(
        getValue(notification, 'relatedEntityId') ??
        getValue(data, 'visitorId', 'relatedEntityId')
      );

  return { entityType, entityId };
};

export const getNotificationNavigationPath = (notification) => {
  const { entityType, entityId } = getNotificationEntity(notification);

  if (!entityType || entityId === null) {
    return null;
  }

  if (entityType === 'invitation') {
    return INVITATION_ROUTES.getDetailRoute(entityId);
  }

  if (entityType === 'visitor') {
    return VISITOR_ROUTES.getDetailRoute(entityId);
  }

  return null;
};

export const normalizeNotification = (notification) => {
  const data = extractNotificationData(notification);
  const navigationPath = getNotificationNavigationPath({ ...notification, data });

  return {
    ...notification,
    data,
    navigationPath,
    read: Boolean(notification.isAcknowledged || notification.acknowledged || notification.read),
    acknowledged: Boolean(notification.isAcknowledged || notification.acknowledged),
    timestamp: notification.createdOn || notification.timestamp || new Date().toISOString(),
    type: notification.type || 'info',
    priority: notification.priority || 'medium'
  };
};
