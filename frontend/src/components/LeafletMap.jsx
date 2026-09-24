import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Loaded lazily by LocationMap — this file (and so Leaflet's JS and CSS) is
// only fetched once the map is about to scroll into view.

// Inline SVG pin, colored from CSS (.locationmap-pin), instead of a 512px PNG
// hotlinked from a third-party icon CDN.
const pinIcon = L.divIcon({
  className: "locationmap-pin",
  html: `<svg viewBox="0 0 24 32" width="32" height="42" aria-hidden="true">
    <path d="M12 0C5.4 0 0 5.3 0 11.9 0 20.8 12 32 12 32s12-11.2 12-20.1C24 5.3 18.6 0 12 0Z" fill="currentColor"/>
    <circle cx="12" cy="12" r="4.5" fill="#fff"/>
  </svg>`,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -40],
});

export default function LeafletMap({ center }) {
  return (
    <MapContainer
      center={center}
      zoom={15}
      className="locationmap-map"
      scrollWheelZoom={false}
      // One-finger drags on touch screens should scroll the page, not trap
      // the visitor inside the map; pinch-zoom still works.
      dragging={!L.Browser.mobile}
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={center} icon={pinIcon}>
        <Popup>ინტერტექნიკსი / Intertechnics</Popup>
      </Marker>
    </MapContainer>
  );
}
