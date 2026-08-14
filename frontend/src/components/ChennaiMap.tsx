import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons in Vite / Webpack bundlers
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

// Chennai default coordinates
const CHENNAI_CENTER: [number, number] = [13.0827, 80.2707];

interface LocationPickerProps {
  position: [number, number];
  setPosition: (position: [number, number]) => void;
}

function LocationPicker({
  position,
  setPosition,
}: LocationPickerProps) {
  useMapEvents({
    click(event) {
      setPosition([event.latlng.lat, event.latlng.lng]);
    },
  });

  return (
    <Marker position={position}>
      <Popup>
        <strong>Complaint Location</strong>
        <br />
        Chennai
        <br />
        {position[0].toFixed(6)}, {position[1].toFixed(6)}
      </Popup>
    </Marker>
  );
}

interface ChennaiMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
}

export default function ChennaiMap({ onLocationSelect }: ChennaiMapProps) {
  const [position, setPosition] = useState<[number, number]>(CHENNAI_CENTER);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePositionChange = (newPos: [number, number]) => {
    setPosition(newPos);
    if (onLocationSelect) {
      onLocationSelect(newPos[0], newPos[1]);
    }
  };

  if (!mounted) {
    return (
      <div className="h-[370px] w-full rounded-3xl bg-secondary/15 flex items-center justify-center text-xs font-medium text-muted-foreground">
        Loading Chennai Map…
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <MapContainer
        center={CHENNAI_CENTER}
        zoom={11}
        scrollWheelZoom={true}
        className="h-[370px] w-full rounded-3xl overflow-hidden z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LocationPicker
          position={position}
          setPosition={handlePositionChange}
        />
      </MapContainer>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-background/60 p-4 text-sm">
        <div>
          <p className="font-medium text-foreground text-xs uppercase tracking-wide">
            Selected location
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-0.5">
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => handlePositionChange(CHENNAI_CENTER)}
          className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Reset to Chennai
        </button>
      </div>
    </div>
  );
}
