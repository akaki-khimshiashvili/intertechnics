import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Reveal from "./Reveal";

// The Intertechnics head office — Petre Iberis St. 6, Tbilisi. Fixed, real
// coordinates; this used to be geolocated from the visitor's IP, which
// pinned the marker on whoever was viewing the page instead of the office.
const OFFICE = { lat: 41.79032119682147, lon: 44.75483674330656 };

const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

export default function LocationMap() {
  return (
    <Reveal as="div" className="locationmap-div">
      <MapContainer
        center={[OFFICE.lat, OFFICE.lon]}
        zoom={15}
        className="locationmap-map"
        scrollWheelZoom={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[OFFICE.lat, OFFICE.lon]} icon={customIcon}>
          <Popup>ინტერტექნიკსი / Intertechnics</Popup>
        </Marker>
      </MapContainer>
    </Reveal>
  );
}
