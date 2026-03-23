'use client'

import * as React from 'react'
import { ClinicCard } from '@/components/clinic-card'
import { MapView, type MapMarker } from '@/components/map-view'
import { SearchInput } from '@/components/search-input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Clinic, City } from '@/lib/types'
import { LayoutGrid, Map } from 'lucide-react'

interface ClinicsFilterProps {
  clinics: Clinic[]
  cities: City[]
}

export function ClinicsFilter({ clinics, cities }: ClinicsFilterProps) {
  const [query, setQuery] = React.useState('')
  const [selectedCity, setSelectedCity] = React.useState('')

  const filtered = clinics.filter((c) => {
    const matchesQuery =
      !query ||
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.address.toLowerCase().includes(query.toLowerCase()) ||
      c.services.some((s) => s.toLowerCase().includes(query.toLowerCase()))
    const matchesCity = !selectedCity || c.citySlug === selectedCity
    return matchesQuery && matchesCity
  })

  const markers: MapMarker[] = filtered
    .filter((c) => c.lat !== 0 && c.lng !== 0)
    .map((c) => ({
      id: c.id,
      name: c.name,
      lat: c.lat,
      lng: c.lng,
      url: `/klinik/${c.slug}`,
      subtitle: `${c.address}, ${c.city}`,
    }))

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Sök klinik, tjänst eller adress..."
          className="sm:max-w-sm"
        />
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-48"
        >
          <option value="">Alla städer</option>
          {cities.map((city) => (
            <option key={city.slug} value={city.slug}>
              {city.name}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="grid">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            {filtered.length} kliniker{filtered.length !== clinics.length ? ' (filtrerade)' : ''}
          </p>
          <TabsList>
            <TabsTrigger value="grid" className="flex items-center gap-1.5">
              <LayoutGrid className="h-4 w-4" />
              <span className="hidden sm:inline">Kort</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-1.5">
              <Map className="h-4 w-4" />
              <span className="hidden sm:inline">Karta</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid">
          {filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Inga kliniker hittades med dessa filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((clinic) => (
                <ClinicCard key={clinic.id} clinic={clinic} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="map">
          <MapView
            markers={markers}
            className="w-full h-[500px] rounded-lg overflow-hidden border border-border"
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
