'use client'

import * as React from 'react'
import { ConditionCard } from '@/components/condition-card'
import { SearchInput } from '@/components/search-input'
import type { Condition } from '@/lib/types'

interface ConditionsFilterProps {
  conditions: Condition[]
}

const PAGE_SIZE = 50

export function ConditionsFilter({ conditions }: ConditionsFilterProps) {
  const [query, setQuery] = React.useState('')
  const [visibleCount, setVisibleCount] = React.useState(PAGE_SIZE)

  const filtered = query
    ? conditions.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.symptoms.some((s) => s.toLowerCase().includes(query.toLowerCase()))
      )
    : conditions

  React.useEffect(() => { setVisibleCount(PAGE_SIZE) }, [query])

  const visible = filtered.slice(0, visibleCount)

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
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {visible.map((condition) => (
              <ConditionCard key={condition.id} condition={condition} />
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="mt-10 text-center">
              <button
                onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
                className="px-6 py-2.5 rounded-md border border-brand text-brand text-sm font-medium hover:bg-brand-light transition-colors"
              >
                Visa fler ({filtered.length - visibleCount} kvar)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
