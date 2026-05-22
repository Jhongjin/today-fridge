import { trackEvent, type AnalyticsProperties } from "./analytics";

type ErrorEventName = "client_error" | "unhandled_rejection" | "asset_load_error";

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
};
