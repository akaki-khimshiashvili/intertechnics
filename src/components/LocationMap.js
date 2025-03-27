import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Custom icon
const customIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [40, 40], // size of the icon
  iconAnchor: [20, 40], // point of the icon which will correspond to marker's location
  popupAnchor: [0, -40],
});

export default function LocationMap() {
  const [location, setLocation] = useState({
    lat: 41.79032119682147,
    lon: 44.75483674330656,
  });

  useEffect(() => {
    fetch("http://ip-api.com/json/")
      .then((res) => res.json())
      .then((data) => {
        setLocation({ lat: data.lat, lon: data.lon });
      })
      .catch((err) => console.error("Error fetching location", err));
  }, [location]);

  return (
    <div className="locationmap-div">
      <MapContainer
        center={[location.lat, location.lon]}
        zoom={15}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Marker position={[location.lat, location.lon]} icon={customIcon}>
          <Popup>ინტერტექნიკსი / Intertechnics</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
