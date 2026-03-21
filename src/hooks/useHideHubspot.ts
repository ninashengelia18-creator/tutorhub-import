import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const TUTOR_PORTAL_PREFIXES = [
  "/tutor-dashboard",
  "/tutor-messages",
  "/tutor-schedule",
  "/tutor-settings",
  "/tutor-profile-edit",
];

export function useHideHubspot() {
  const { pathname } = useLocation();

  useEffect(() => {
    const isTutorPortal = TUTOR_PORTAL_PREFIXES.some((prefix) =>
      pathname.startsWith(prefix)
    );

    const widget = document.getElementById("hubspot-messages-iframe-container");
    if (widget) {
      widget.style.display = isTutorPortal ? "none" : "";
    }

    // HubSpot may load after this effect runs, so observe for it
    if (isTutorPortal) {
      const observer = new MutationObserver(() => {
        const el = document.getElementById("hubspot-messages-iframe-container");
        if (el) {
          el.style.display = "none";
          observer.disconnect();
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, [pathname]);
}
