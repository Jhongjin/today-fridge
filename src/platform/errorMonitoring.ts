import { trackEvent, type AnalyticsEvent, type AnalyticsProperties } from "./analytics";

type ErrorEventName = "client_error" | "unhandled_rejection" | "asset_load_error";
export type ErrorMonitoringTransport = {
  send: (event: AnalyticsEvent) => void | Promise<void>;
};

let uninstallHandlers: (() => void) | undefined;
let errorMonitoringTransport: ErrorMonitoringTransport | undefined;

const reasonToMessage = (reason: unknown): string => {
  if (reason instanceof Error) {
    return reason.message;
  }

  if (typeof reason === "string") {
    return reason;
  }

  return "Unknown client error";
};

const getAssetUrl = (target: EventTarget | null): string | null => {
  if (target instanceof HTMLImageElement) {
    return target.currentSrc || target.src || null;
  }

  if (target instanceof HTMLScriptElement) {
    return target.src || null;
  }

  if (target instanceof HTMLLinkElement) {
    return target.href || null;
  }

  if (target instanceof HTMLAudioElement || target instanceof HTMLVideoElement) {
    return target.currentSrc || target.src || null;
  }

  return null;
};

export const setErrorMonitoringTransport = (transport?: ErrorMonitoringTransport): void => {
  errorMonitoringTransport = transport;
};

const sendToErrorMonitoringTransport = (event: AnalyticsEvent) => {
  if (!errorMonitoringTransport) {
    return;
  }

  try {
    const result = errorMonitoringTransport.send(event);

    if (result && typeof result.catch === "function") {
      void result.catch(() => undefined);
    }
  } catch {
    // Error monitoring outages must never block play or analytics capture.
  }
};

export const reportClientError = (eventName: ErrorEventName, properties: AnalyticsProperties): AnalyticsEvent => {
  const event = trackEvent(eventName, {
    source: "client",
    ...properties
  });

  sendToErrorMonitoringTransport(event);
  return event;
};

export const installClientErrorTracking = (): (() => void) => {
  if (uninstallHandlers) {
    return uninstallHandlers;
  }

  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onError = (event: ErrorEvent) => {
    if (!(event instanceof ErrorEvent)) {
      return;
    }

    reportClientError("client_error", {
      message: event.message || reasonToMessage(event.error),
      filename: event.filename || null,
      line_no: event.lineno || null,
      column_no: event.colno || null
    });
  };

  const onAssetError = (event: Event) => {
    if (event instanceof ErrorEvent) {
      return;
    }

    const target = event.target as Element | null;

    reportClientError("asset_load_error", {
      tag_name: target?.tagName?.toLowerCase() ?? "unknown",
      url: getAssetUrl(event.target)
    });
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    reportClientError("unhandled_rejection", {
      message: reasonToMessage(event.reason)
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("error", onAssetError, true);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  uninstallHandlers = () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("error", onAssetError, true);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
    uninstallHandlers = undefined;
  };

  return uninstallHandlers;
};

export const resetClientErrorTrackingForTest = (): void => {
  uninstallHandlers?.();
  uninstallHandlers = undefined;
  errorMonitoringTransport = undefined;
};
