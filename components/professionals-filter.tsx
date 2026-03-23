'use client'

import * as React from 'react'
import { ProfessionalCard } from '@/components/professional-card'
import { MapView, type MapMarker } from '@/components/map-view'
import { SearchInput } from '@/components/search-input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import type { Professional, City } from '@/lib/types'
import { LayoutGrid, Map } from 'lucide-react'

interface ProfessionalsFilterProps {
  professionals: Professional[]
  cities: City[]
}

export function ProfessionalsFilter({ professionals, cities }: ProfessionalsFilterProps) {
  const [query, setQuery] = React.useState('')
  const [selectedCity, setSelectedCity] = React.useState('')

  const filtered = professionals.filter((p) => {
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.title.toLowerCase().includes(query.toLowerCase()) ||
      p.specialties.some((s) => s.toLowerCase().includes(query.toLowerCase()))
    const matchesCity = !selectedCity || p.citySlug === selectedCity
    return matchesQuery && matchesCity
  })

  const markers: MapMarker[] = filtered
    .filter((p) => p.lat !== 0 && p.lng !== 0)
    .map((p) => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      url: `/vardgivare/${p.slug}`,
      subtitle: p.title,
    }))

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Sök namn, titel eller specialitet..."
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
            {filtered.length} vårdgivare{filtered.length !== professionals.length ? ' (filtrerade)' : ''}
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
              <p className="text-muted-foreground">Inga vårdgivare hittades med dessa filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((pro) => (
                <ProfessionalCard key={pro.id} professional={pro} />
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
