'use client'

import * as React from 'react'
import { ConditionCard } from '@/components/condition-card'
import { SearchInput } from '@/components/search-input'
import type { Condition } from '@/lib/types'

interface ConditionsFilterProps {
  conditions: Condition[]
}

export function ConditionsFilter({ conditions }: ConditionsFilterProps) {
  const [query, setQuery] = React.useState('')

  const filtered = query
    ? conditions.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.symptoms.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      )
    : conditions

  return (
    <div>
      <div className="max-w-md mb-8">
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Sök tillstånd, t.ex. depression, migrän..."
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Inga tillstånd hittades för &ldquo;{query}&rdquo;.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((condition) => (
            <ConditionCard key={condition.id} condition={condition} />
          ))}
        </div>
      )}
    </div>
  )
}
