export type AnalyticsEvent = {
  eventName: string;
  properties?: Record<string, string | number | boolean | null>;
};

const events: AnalyticsEvent[] = [];

export const trackEvent = (eventName: string, properties?: AnalyticsEvent["properties"]): void => {
  events.push({ eventName, properties });
};

export const getTrackedEvents = (): AnalyticsEvent[] => [...events];

export const clearTrackedEvents = (): void => {
  events.length = 0;
};

