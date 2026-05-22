import { setAnalyticsTransport, type AnalyticsEvent, type AnalyticsTransport } from "./analytics";

type Fetcher = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
type SendBeacon = (url: string, data?: BodyInit | null) => boolean;

export type HttpAnalyticsTransportOptions = {
  endpoint: string;
  fetcher?: Fetcher;
  sendBeacon?: SendBeacon;
};

export const createHttpAnalyticsTransport = ({
  endpoint,
  fetcher = globalThis.fetch?.bind(globalThis),
  sendBeacon = globalThis.navigator?.sendBeacon?.bind(globalThis.navigator)
}: HttpAnalyticsTransportOptions): AnalyticsTransport => ({
  send(event: AnalyticsEvent) {
    const payload = JSON.stringify(event);
    const body = new Blob([payload], {
      type: "application/json"
    });

    if (sendBeacon?.(endpoint, body)) {
      return;
    }

    if (!fetcher) {
      return;
    }

    return fetcher(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: payload,
      keepalive: true
    }).then(() => undefined);
  }
});

export const installHttpAnalyticsTransport = (endpoint?: string): boolean => {
  if (!endpoint) {
    return false;
  }

  setAnalyticsTransport(createHttpAnalyticsTransport({ endpoint }));
  return true;
};
