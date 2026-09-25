import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import Reveal from "./Reveal";

const LeafletMap = lazy(() => import("./LeafletMap"));

// The Intertechnics head office — Petre Iberis St. 6, Tbilisi. Fixed, real
// coordinates; this used to be geolocated from the visitor's IP, which
// pinned the marker on whoever was viewing the page instead of the office.
const OFFICE = [41.79032119682147, 44.75483674330656];

export default function LocationMap() {
  const slotRef = useRef(null);
  const [near, setNear] = useState(false);

  // Leaflet is heavy and the map sits far down the page — only fetch it
  // (and start pulling tiles) once the visitor is about to scroll to it.
  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(slot);
    return () => observer.disconnect();
  }, []);

  return (
    <Reveal as="div" className="locationmap-div">
      {/* Fixed-size slot (the container's min-height) so nothing shifts
          when the map mounts into it. */}
      <div ref={slotRef} className="locationmap-map">
        {near && (
          <Suspense fallback={null}>
            <LeafletMap center={OFFICE} />
          </Suspense>
        )}
      </div>
    </Reveal>
  );
}
