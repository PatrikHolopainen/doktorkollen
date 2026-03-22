'use client'

import dynamic from 'next/dynamic'
import React from 'react'

export interface MapMarker {
  id: string
  name: string
  lat: number
  lng: number
  url: string
  subtitle?: string
}

interface MapViewProps {
  markers: MapMarker[]
  center?: [number, number]
  zoom?: number
  className?: string
}

// Dynamically import the actual map to disable SSR
const MapViewInner = dynamic(() => import('./map-view-inner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-brand-light rounded-lg">
      <div className="text-center">
        <div className="h-8 w-8 border-2 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Laddar karta...</p>
      </div>
    </div>
  ),
})

export function MapView({ markers, center, zoom, className }: MapViewProps) {
  return <MapViewInner markers={markers} center={center} zoom={zoom} className={className} />
}
