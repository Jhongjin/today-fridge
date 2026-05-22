import { trackEvent, type AnalyticsProperties } from "./analytics";

type ErrorEventName = "client_error" | "unhandled_rejection";

let uninstallHandlers: (() => void) | undefined;

const reasonToMessage = (reason: unknown): string => {
  if (reason instanceof Error) {
    return reason.message;
  }

  if (typeof reason === "string") {
    return reason;
  }

  return "Unknown client error";
};

export const reportClientError = (eventName: ErrorEventName, properties: AnalyticsProperties) => {
  trackEvent(eventName, {
    source: "client",
    ...properties
  });
};

export const installClientErrorTracking = (): (() => void) => {
  if (uninstallHandlers) {
    return uninstallHandlers;
  }

  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onError = (event: ErrorEvent) => {
    reportClientError("client_error", {
      message: event.message || reasonToMessage(event.error),
      filename: event.filename || null,
      line_no: event.lineno || null,
      column_no: event.colno || null
    });
  };

  const onUnhandledRejection = (event: PromiseRejectionEvent) => {
    reportClientError("unhandled_rejection", {
      message: reasonToMessage(event.reason)
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onUnhandledRejection);

  uninstallHandlers = () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onUnhandledRejection);
    uninstallHandlers = undefined;
  };

  return uninstallHandlers;
};

export const resetClientErrorTrackingForTest = (): void => {
  uninstallHandlers?.();
  uninstallHandlers = undefined;
};
