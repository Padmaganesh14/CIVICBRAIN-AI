import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, CheckCircle2 } from 'lucide-react';

// Custom Marker Icon for Leaflet
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function LocationMarker({ position, setPosition, onSelectLocation }) {
  useMapEvents({
    click(e) {
      const newPos = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      if (onSelectLocation) {
        onSelectLocation(newPos);
      }
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon}>
      <Popup>
        <div class="text-xs text-slate-900 font-bold p-1">
          📍 Selected Complaint Location<br />
          <span class="text-[10px] text-slate-600">Lat: {position[0].toFixed(4)}, Lng: {position[1].toFixed(4)}</span>
        </div>
      </Popup>
    </Marker>
  );
}

export default function MapPicker({ defaultPos = [10.7905, 78.7047], onSelectLocation }) {
  const [position, setPosition] = useState(defaultPos);

  return (
    <div class="space-y-2">
      <div class="flex items-center justify-between text-xs font-bold text-slate-300">
        <span class="flex items-center gap-1.5">
          <MapPin class="w-3.5 h-3.5 text-red-400" /> Click Map to Select Exact Incident Spot
        </span>
        {position && (
          <span class="text-emerald-400 font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60 flex items-center gap-1">
            <CheckCircle2 class="w-3 h-3" /> {position[0].toFixed(4)}, {position[1].toFixed(4)}
          </span>
        )}
      </div>

      <div class="w-full h-64 rounded-xl overflow-hidden border border-slate-800 shadow-xl z-0">
        <MapContainer 
          center={position} 
          zoom={13} 
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker 
            position={position} 
            setPosition={setPosition} 
            onSelectLocation={onSelectLocation}
          />
        </MapContainer>
      </div>
    </div>
  );
}
