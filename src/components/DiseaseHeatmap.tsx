'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { motion } from 'framer-motion';

// Fix leaflet default icon issue in Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const riskColors = {
  LOW: '#22c55e',       // Green
  MODERATE: '#eab308',  // Yellow
  ELEVATED: '#f97316',  // Orange
  HIGH: '#ef4444',      // Red
  SEVERE: '#991b1b',    // Dark Red
};

interface DiseaseHeatmapProps {
  centerLat: number;
  centerLng: number;
}

// Component to handle map centering when props change
function MapCenterUpdater({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

export default function DiseaseHeatmap({ centerLat, centerLng }: DiseaseHeatmapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  // Generate mock data points around the center
  const mockPoints = [
    { id: 1, lat: centerLat + 0.05, lng: centerLng + 0.02, radius: 12000, risk: 'ELEVATED', color: riskColors.ELEVATED, disease: 'Late Blight' },
    { id: 2, lat: centerLat - 0.1, lng: centerLng - 0.08, radius: 25000, risk: 'HIGH', color: riskColors.HIGH, disease: 'Rust' },
    { id: 3, lat: centerLat + 0.15, lng: centerLng - 0.1, radius: 15000, risk: 'MODERATE', color: riskColors.MODERATE, disease: 'Powdery Mildew' },
    { id: 4, lat: centerLat - 0.08, lng: centerLng + 0.15, radius: 10000, risk: 'LOW', color: riskColors.LOW, disease: 'None detected' },
    { id: 5, lat: centerLat + 0.2, lng: centerLng + 0.2, radius: 35000, risk: 'SEVERE', color: riskColors.SEVERE, disease: 'Downy Mildew Outbreak' },
    { id: 6, lat: centerLat - 0.2, lng: centerLng + 0.05, radius: 18000, risk: 'ELEVATED', color: riskColors.ELEVATED, disease: 'Leaf Spot' },
  ];

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[centerLat, centerLng]} 
        zoom={9} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapCenterUpdater lat={centerLat} lng={centerLng} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {/* User Location Marker */}
        <Marker position={[centerLat, centerLng]}>
          <Popup>
            <div className="text-gray-900 font-sans">
              <h3 className="font-bold text-sm">Your Farm Location</h3>
            </div>
          </Popup>
        </Marker>

        {/* Heatmap Mock Points */}
        {mockPoints.map((point) => (
          <div key={point.id}>
            <Circle
              center={[point.lat, point.lng]}
              pathOptions={{ fillColor: point.color, color: point.color, fillOpacity: 0.35, weight: 0 }}
              radius={point.radius}
            >
              <Popup>
                <div className="text-gray-900 font-sans p-1">
                  <p className="text-xs mb-1"><span className="font-medium text-gray-700">Risk Level:</span> <span className="font-bold" style={{ color: point.color }}>{point.risk}</span></p>
                  <p className="text-xs"><span className="font-medium text-gray-700">Reported:</span> {point.disease}</p>
                </div>
              </Popup>
            </Circle>
            {/* Inner hotter core for high/severe risks to simulate heatmap gradient */}
            {(point.risk === 'HIGH' || point.risk === 'SEVERE' || point.risk === 'ELEVATED') && (
              <Circle
                center={[point.lat, point.lng]}
                pathOptions={{ fillColor: point.color, color: point.color, fillOpacity: 0.6, weight: 0 }}
                radius={point.radius * 0.4}
              />
            )}
          </div>
        ))}
      </MapContainer>
      
      {/* Dark mode support for tiles */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background: transparent !important;
          z-index: 1 !important;
        }
        :is(.dark) .map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
      `}} />
    </div>
  );
}
