import { createHttpAnalyticsTransport, type HttpAnalyticsTransportOptions } from "./httpAnalyticsTransport";
import { setErrorMonitoringTransport, type ErrorMonitoringTransport } from "./errorMonitoring";

export type HttpErrorMonitoringTransportOptions = HttpAnalyticsTransportOptions;

export const createHttpErrorMonitoringTransport = (
  options: HttpErrorMonitoringTransportOptions
): ErrorMonitoringTransport => createHttpAnalyticsTransport(options);

export const installHttpErrorMonitoringTransport = (endpoint?: string): boolean => {
  if (!endpoint) {
    return false;
  }

  setErrorMonitoringTransport(createHttpErrorMonitoringTransport({ endpoint }));
  return true;
};
