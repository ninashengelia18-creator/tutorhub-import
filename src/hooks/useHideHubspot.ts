import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TUTOR_PORTAL_PREFIXES = [
  "/tutor-dashboard",
  "/tutor-messages",
  "/tutor-schedule",
  "/tutor-settings",
  "/tutor-profile-edit",
];

function hideHubspotWidget() {
  // Hide all known HubSpot containers
  const selectors = [
    "#hubspot-messages-iframe-container",
    "#hs-chat-open",
    "#hubspot-conversations-inline-parent",
  ];
  for (const sel of selectors) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) el.style.setProperty("display", "none", "important");
  }
}

function showHubspotWidget() {
  const selectors = [
    "#hubspot-messages-iframe-container",
    "#hs-chat-open",
    "#hubspot-conversations-inline-parent",
  ];
  for (const sel of selectors) {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) el.style.removeProperty("display");
  }
}

export function useHideHubspot() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isTutorPortal = TUTOR_PORTAL_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    if (isTutorPortal) {
      hideHubspotWidget();

      // Keep observing — HubSpot can re-inject or toggle visibility at any time
      const observer = new MutationObserver(() => hideHubspotWidget());
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["style", "class"] });

      // Also use an interval as a fallback since HubSpot is aggressive
      const interval = setInterval(hideHubspotWidget, 1000);

      return () => {
        observer.disconnect();
        clearInterval(interval);
        showHubspotWidget();
      };
    } else {
      showHubspotWidget();
    }
  }, [pathname]);
}
