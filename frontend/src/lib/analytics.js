import { API_URL } from "./api";

/**
 * Fire-and-forget anonymous event for the admin dashboard. Sent as a
 * text/plain beacon so it needs no CORS preflight, survives the page being
 * navigated away from, and never blocks or breaks the UI if it fails.
 * No cookies or identifiers are set by the client; see AnalyticsController.
 *
 * type: "page_view" | "contact_click" | "phone_click"
 */
export function track(type, data = {}) {
  try {
    const url = `${API_URL}/analytics/events`;
    const body = JSON.stringify({ type, ...data });
    if (navigator.sendBeacon?.(url, new Blob([body], { type: "text/plain" }))) return;
    fetch(url, { method: "POST", body, keepalive: true, mode: "no-cors", headers: { "Content-Type": "text/plain" } }).catch(
      () => {}
    );
  } catch {
    // Analytics must never affect the site.
  }
}
