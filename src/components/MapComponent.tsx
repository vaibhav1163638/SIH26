'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { RegionalReportData } from '@/lib/api';

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

interface MapComponentProps {
  reports: RegionalReportData[];
}

export default function MapComponent({ reports }: MapComponentProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-black/40 border border-white/10 rounded-2xl">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Default center if no reports (Center of Haryana as fallback)
  const center: [number, number] = reports.length > 0
    ? [reports[0].coordinates.lat, reports[0].coordinates.lng]
    : [29.0588, 76.0856];

  return (
    <div className="w-full h-full min-h-[400px] border border-white/10 rounded-2xl overflow-hidden shadow-lg relative z-0">
      <MapContainer 
        center={center} 
        zoom={6} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        
        {reports.map((report) => {
          const isHighSeverity = report.severity === 'HIGH' || report.severity === 'CRITICAL';
          const color = isHighSeverity ? '#ef4444' : '#f59e0b';
          
          return (
            <div key={report._id}>
              <Circle
                center={[report.coordinates.lat, report.coordinates.lng]}
                pathOptions={{ fillColor: color, color: color, fillOpacity: 0.4 }}
                radius={isHighSeverity ? 25000 : 15000} // Radius in meters
              />
              <Marker position={[report.coordinates.lat, report.coordinates.lng]}>
                <Popup>
                  <div className="text-gray-900 font-sans">
                    <h3 className="font-bold text-sm mb-1">{report.region}</h3>
                    <p className="text-xs mb-1"><span className="font-medium text-gray-700">Disease:</span> {report.disease}</p>
                    <p className="text-xs mb-1"><span className="font-medium text-gray-700">Severity:</span> <span className={isHighSeverity ? 'text-red-600 font-bold' : 'text-amber-600 font-bold'}>{report.severity}</span></p>
                    <p className="text-xs"><span className="font-medium text-gray-700">Reports:</span> {report.reportCount} in last 7 days</p>
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
      
      {/* Add custom CSS to invert tile colors for dark mode */}
      <style dangerouslySetInnerHTML={{__html: `
        .leaflet-container {
          background: #0a1612 !important;
          z-index: 1 !important;
        }
        .map-tiles {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
      `}} />
    </div>
  );
}
