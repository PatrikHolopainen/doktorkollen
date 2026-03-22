'use client'

import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import Link from 'next/link'
import type { MapMarker } from './map-view'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix default marker icons for Next.js
const defaultIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 32px;
    height: 32px;
    background: #1D6FA4;
    border: 3px solid white;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
})

interface MapViewInnerProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  className?: string
}

export default function MapViewInner({
  markers,
  center,
  zoom = 8,
  className,
}: MapViewInnerProps) {
  const mapCenter: [number, number] =
    center ??
    (markers.length > 0
      ? [
          markers.reduce((sum, m) => sum + m.lat, 0) / markers.length,
          markers.reduce((sum, m) => sum + m.lng, 0) / markers.length,
        ]
      : [59.3293, 18.0686])

  return (
    <div className={className ?? 'w-full h-80 rounded-lg overflow-hidden border border-border'}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((marker) => (
          <Marker key={marker.id} position={[marker.lat, marker.lng]} icon={defaultIcon}>
            <Popup>
              <div className="p-1">
                <p className="font-semibold text-sm">{marker.name}</p>
                {marker.subtitle && (
                  <p className="text-xs text-gray-500 mt-0.5">{marker.subtitle}</p>
                )}
                <Link
                  href={marker.url}
                  className="text-xs text-blue-600 hover:underline mt-1 block"
                >
                  Visa profil &rarr;
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
