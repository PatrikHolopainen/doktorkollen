'use client'

import * as React from 'react'
import { ServiceCard } from '@/components/service-card'
import { SearchInput } from '@/components/search-input'
import type { Service } from '@/lib/types'

interface ServicesFilterProps {
  services: Service[]
}

export function ServicesFilter({ services }: ServicesFilterProps) {
  const [query, setQuery] = React.useState('')

  const filtered = query
    ? services.filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.description.toLowerCase().includes(query.toLowerCase()) ||
          s.specialties.some((sp) => sp.toLowerCase().includes(query.toLowerCase()))
      )
    : services

  return (
    <div>
      <div className="max-w-md mb-8">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Sök tjänster, t.ex. psykologi, kardiologi..."
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Inga tjänster hittades för &ldquo;{query}&rdquo;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      )}
    </div>
  )
}
