export type AnalyticsPrimitive = string | number | boolean | null;

export type AnalyticsProperties = Record<string, AnalyticsPrimitive>;

export type AnalyticsPlatform = "ios" | "android" | "web" | "unknown";

export type UserKeyStatus = "ready" | "mock" | "unavailable" | "error";

export type AnalyticsContext = {
  appVersion: string;
  platform: AnalyticsPlatform;
  entrySource: string;
  sessionId: string;
  userKeyStatus: UserKeyStatus;
};

export type AnalyticsEvent = {
  eventName: string;
  event_name: string;
  event_time: string;
  app_version: string;
  platform: AnalyticsPlatform;
  entry_source: string;
  session_id: string;
  user_key_status: UserKeyStatus;
  properties: AnalyticsProperties;
};

const events: AnalyticsEvent[] = [];
const listeners = new Set<(events: AnalyticsEvent[]) => void>();

const detectPlatform = (): AnalyticsPlatform => {
  const userAgent = globalThis.navigator?.userAgent.toLowerCase() ?? "";

  if (userAgent.includes("android")) {
    return "android";
  }

  if (userAgent.includes("iphone") || userAgent.includes("ipad")) {
    return "ios";
  }

  return userAgent ? "web" : "unknown";
};

const detectEntrySource = (): string => {
  const search = globalThis.location?.search;

  if (!search) {
    return "direct";
  }

  const params = new URLSearchParams(search);
  return params.get("entry_source") ?? params.get("source") ?? "direct";
};

const createSessionId = (): string => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

let analyticsContext: AnalyticsContext = {
  appVersion: "0.1.0",
  platform: detectPlatform(),
  entrySource: detectEntrySource(),
  sessionId: createSessionId(),
  userKeyStatus: "mock"
};

export const configureAnalyticsContext = (patch: Partial<AnalyticsContext>): AnalyticsContext => {
  analyticsContext = {
    ...analyticsContext,
    ...patch
  };

  return { ...analyticsContext };
};

export const getAnalyticsContext = (): AnalyticsContext => ({ ...analyticsContext });

export const trackEvent = (eventName: string, properties: AnalyticsProperties = {}): AnalyticsEvent => {
  const event: AnalyticsEvent = {
    eventName,
    event_name: eventName,
    event_time: new Date().toISOString(),
    app_version: analyticsContext.appVersion,
    platform: analyticsContext.platform,
    entry_source: analyticsContext.entrySource,
    session_id: analyticsContext.sessionId,
    user_key_status: analyticsContext.userKeyStatus,
    properties
  };

  events.push(event);
  emitAnalyticsSnapshot();
  return event;
};

export const getTrackedEvents = (): AnalyticsEvent[] => [...events];

export const clearTrackedEvents = (): void => {
  events.length = 0;
  emitAnalyticsSnapshot();
};

export const subscribeToTrackedEvents = (listener: (events: AnalyticsEvent[]) => void): (() => void) => {
  listeners.add(listener);
  listener(getTrackedEvents());

  return () => {
    listeners.delete(listener);
  };
};

const emitAnalyticsSnapshot = () => {
  const snapshot = getTrackedEvents();

  for (const listener of listeners) {
    listener(snapshot);
  }
};
