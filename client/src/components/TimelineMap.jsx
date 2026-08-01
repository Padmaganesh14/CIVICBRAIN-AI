import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Play, Pause, MapPin, Layers, ShieldAlert, CheckCircle2 } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Today'];

// Custom colored div icons for Leaflet severity markers
const createCustomMarkerIcon = (colorHex) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="background-color: ${colorHex}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px ${colorHex};"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

const redIcon = createCustomMarkerIcon('#EF4444');
const orangeIcon = createCustomMarkerIcon('#F59E0B');
const greenIcon = createCustomMarkerIcon('#10B981');

const wardHotspots = {
  Monday: [
    { ward: 'Ward 18 (Anna Salai)', count: 42, status: 'Low', icon: greenIcon, colorHex: '#10B981', lat: 10.7905, lng: 78.7047, budget: '₹15 Lakhs' },
    { ward: 'Ward 7 (Hospital Zone)', count: 35, status: 'Low', icon: greenIcon, colorHex: '#10B981', lat: 10.7985, lng: 78.7127, budget: '₹12 Lakhs' },
    { ward: 'Ward 12 (Market Zone)', count: 28, status: 'Low', icon: greenIcon, colorHex: '#10B981', lat: 10.7825, lng: 78.6947, budget: '₹10 Lakhs' }
  ],
  Tuesday: [
    { ward: 'Ward 18 (Anna Salai)', count: 110, status: 'Medium', icon: orangeIcon, colorHex: '#F59E0B', lat: 10.7905, lng: 78.7047, budget: '₹35 Lakhs' },
    { ward: 'Ward 7 (Hospital Zone)', count: 95, status: 'Medium', icon: orangeIcon, colorHex: '#F59E0B', lat: 10.7985, lng: 78.7127, budget: '₹28 Lakhs' },
    { ward: 'Ward 12 (Market Zone)', count: 70, status: 'Low', icon: greenIcon, colorHex: '#10B981', lat: 10.7825, lng: 78.6947, budget: '₹18 Lakhs' }
  ],
  Wednesday: [
    { ward: 'Ward 18 (Anna Salai)', count: 180, status: 'High', icon: orangeIcon, colorHex: '#F59E0B', lat: 10.7905, lng: 78.7047, budget: '₹55 Lakhs' },
    { ward: 'Ward 7 (Hospital Zone)', count: 155, status: 'High', icon: orangeIcon, colorHex: '#F59E0B', lat: 10.7985, lng: 78.7127, budget: '₹42 Lakhs' },
    { ward: 'Ward 12 (Market Zone)', count: 120, status: 'Medium', icon: orangeIcon, colorHex: '#F59E0B', lat: 10.7825, lng: 78.6947, budget: '₹28 Lakhs' }
  ],
  Today: [
    { ward: 'Ward 18 (Anna Salai)', count: 232, status: 'Critical', icon: redIcon, colorHex: '#EF4444', lat: 10.7905, lng: 78.7047, budget: '₹75 Lakhs' },
    { ward: 'Ward 7 (Hospital Zone)', count: 198, status: 'Critical', icon: redIcon, colorHex: '#EF4444', lat: 10.7985, lng: 78.7127, budget: '₹42 Lakhs' },
    { ward: 'Ward 12 (Market Zone)', count: 165, status: 'High', icon: orangeIcon, colorHex: '#F59E0B', lat: 10.7825, lng: 78.6947, budget: '₹28 Lakhs' }
  ]
};

export default function TimelineMap() {
  const [selectedDayIdx, setSelectedDayIdx] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);

  const activeDay = days[selectedDayIdx];
  const activeSpots = wardHotspots[activeDay];

  const handlePlayToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      let step = 0;
      const interval = setInterval(() => {
        step++;
        if (step < days.length) {
          setSelectedDayIdx(step);
        } else {
          clearInterval(interval);
          setIsPlaying(false);
        }
      }, 1200);
    }
  };

  return (
    <div class="gov-card p-5 space-y-4">
      
      {/* Header & Controls */}
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h4 class="font-bold text-sm text-white flex items-center gap-2">
            <Layers class="w-4 h-4 text-blue-400" /> React Leaflet OpenStreetMap Timeline & Hotspot Map
          </h4>
          <p class="text-xs text-slate-400">Completely free OpenStreetMap tiles with interactive severity markers and ward circles</p>
        </div>

        {/* Timeline Day Controls */}
        <div class="flex items-center gap-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <button 
            onClick={handlePlayToggle}
            class="p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md flex items-center gap-1 text-xs font-bold"
          >
            {isPlaying ? <Pause class="w-3.5 h-3.5" /> : <Play class="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play Timeline'}</span>
          </button>
          <div class="flex items-center gap-1">
            {days.map((d, idx) => (
              <button 
                key={d}
                onClick={() => setSelectedDayIdx(idx)}
                class={`px-2.5 py-1 text-xs font-bold rounded-md transition ${selectedDayIdx === idx ? 'bg-blue-600/30 text-blue-400 border border-blue-500/40' : 'text-slate-400 hover:text-white'}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* React Leaflet Map Canvas */}
      <div class="relative w-full h-[380px] rounded-xl overflow-hidden border border-slate-800 shadow-2xl z-0">
        <MapContainer 
          center={[10.7905, 78.7047]} 
          zoom={13} 
          scrollWheelZoom={false}
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Render Hotspot Circles and Interactive Markers */}
          {activeSpots.map((spot, idx) => (
            <React.Fragment key={idx}>
              <Circle
                center={[spot.lat, spot.lng]}
                radius={spot.count * 8}
                pathOptions={{
                  color: spot.colorHex,
                  fillColor: spot.colorHex,
                  fillOpacity: 0.35,
                  weight: 2
                }}
              />
              <Marker position={[spot.lat, spot.lng]} icon={spot.icon}>
                <Popup>
                  <div class="text-xs p-1 text-slate-900 font-sans space-y-1">
                    <strong class="font-extrabold text-sm block">{spot.ward}</strong>
                    <div class="text-[11px] text-slate-700">
                      • Status: <span class="font-bold text-red-600">{spot.status} Severity</span><br />
                      • Grievances: <strong>{spot.count} Active</strong><br />
                      • AI Suggested Budget: <strong class="text-emerald-700">{spot.budget}</strong>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* Legend Bar */}
      <div class="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span> 🔴 Critical Risk</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> 🟠 Medium Risk</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> 🟢 Low Risk</span>
        </div>
        <span class="text-[11px] text-blue-400 font-semibold">Powered by OpenStreetMap & React Leaflet</span>
      </div>

    </div>
  );
}
