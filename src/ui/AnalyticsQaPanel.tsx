import { useEffect, useState } from "react";
import {
  getTrackedEvents,
  subscribeToTrackedEvents,
  type AnalyticsEvent
} from "../platform/analytics";

const eventPropertySummary = (event: AnalyticsEvent) =>
  Object.entries(event.properties)
    .slice(0, 2)
    .map(([key, value]) => `${key}:${String(value)}`)
    .join(" ");

export const AnalyticsQaPanel = ({ enabled }: { enabled: boolean }) => {
  const [events, setEvents] = useState<AnalyticsEvent[]>(() => (enabled ? getTrackedEvents() : []));

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    return subscribeToTrackedEvents(setEvents);
  }, [enabled]);

  if (!enabled) {
    return null;
  }

  const recentEvents = events.slice(-8).reverse();

  return (
    <aside className="qa-analytics-panel" data-testid="qa-analytics-panel" aria-label="QA analytics events">
      <div className="qa-analytics-panel__header">
        <strong>QA Events</strong>
        <span data-testid="qa-event-count">{events.length}</span>
      </div>
      <ol data-testid="qa-event-list">
        {recentEvents.map((event, index) => (
          <li key={`${event.event_time}-${event.eventName}-${index}`}>
            <strong>{event.eventName}</strong>
            <span>{eventPropertySummary(event)}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
};
