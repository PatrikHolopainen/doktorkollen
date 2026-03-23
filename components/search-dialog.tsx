'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X, User, Building2, Stethoscope, Loader2 } from 'lucide-react'
import { search, ensureIndex, type SearchResult, type SearchEntryType } from '@/lib/search'

const TYPE_LABEL: Record<SearchEntryType, string> = {
  doctor:    'Läkare',
  clinic:    'Klinik',
  condition: 'Tillstånd',
}

const TYPE_ICON: Record<SearchEntryType, React.ReactNode> = {
  doctor:    <User className="h-3.5 w-3.5" />,
  clinic:    <Building2 className="h-3.5 w-3.5" />,
  condition: <Stethoscope className="h-3.5 w-3.5" />,
}

const TYPE_COLOR: Record<SearchEntryType, string> = {
  doctor:    'bg-blue-50 text-blue-700',
  clinic:    'bg-emerald-50 text-emerald-700',
  condition: 'bg-amber-50 text-amber-700',
}

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

export function SearchDialog({ open, onClose }: SearchDialogProps) {
  const router   = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [ready,   setReady]   = useState(false)
  const [active,  setActive]  = useState(0)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-load index as soon as dialog opens
  useEffect(() => {
    if (!open) return
    ensureIndex().then(() => setReady(true))
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [open])

  // Debounced search
  const runSearch = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!q || q.length < 2) { setResults([]); setLoading(false); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const res = await search(q, 16)
      setResults(res)
      setActive(0)
      setLoading(false)
    }, 180)
  }, [])

  useEffect(() => { runSearch(query) }, [query, runSearch])

  // Keyboard navigation
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, results.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActive(a => Math.max(a - 1, 0)) }
      if (e.key === 'Enter' && results[active]) {
        router.push(results[active].item.url)
        onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, results, active, router, onClose])

  if (!open) return null

  // Group results by type
  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const t = r.item.type
    if (!acc[t]) acc[t] = []
    acc[t].push(r)
    return acc
  }, {})

  const order: SearchEntryType[] = ['condition', 'doctor', 'clinic']

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-[10vh] z-50 w-full max-w-2xl -translate-x-1/2 px-4">
        <div className="rounded-2xl bg-white shadow-2xl ring-1 ring-black/10 overflow-hidden">

          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            {loading
              ? <Loader2 className="h-5 w-5 text-muted-foreground animate-spin shrink-0" />
              : <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            }
            <input
              ref={inputRef}
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Sök symtom, läkare, klinik, tillstånd…"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
            <kbd className="hidden sm:flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-xs text-muted-foreground">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {!ready && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Laddar sökindex…
              </div>
            )}

            {ready && query.length >= 2 && results.length === 0 && !loading && (
              <div className="py-10 text-center text-sm text-muted-foreground">
                Inga resultat för &ldquo;{query}&rdquo;
              </div>
            )}

            {ready && results.length > 0 && (
              <div className="py-2">
                {order.map(type => {
                  const group = grouped[type]
                  if (!group?.length) return null
                  return (
                    <div key={type}>
                      <div className="flex items-center gap-2 px-4 py-1.5">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_COLOR[type]}`}>
                          {TYPE_ICON[type]}
                          {TYPE_LABEL[type]}
                        </span>
                      </div>
                      {group.map((r) => {
                        const idx = results.indexOf(r)
                        return (
                          <Link
                            key={r.item.id}
                            href={r.item.url}
                            onClick={onClose}
                            className={`flex items-start gap-3 px-4 py-2.5 hover:bg-brand-light/60 transition-colors ${idx === active ? 'bg-brand-light/60' : ''}`}
                          >
                            <div className={`mt-0.5 rounded-full p-1.5 ${TYPE_COLOR[type]}`}>
                              {TYPE_ICON[type]}
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium text-sm text-foreground truncate">
                                {r.item.name}
                              </div>
                              {r.item.subtitle && (
                                <div className="text-xs text-muted-foreground truncate mt-0.5">
                                  {r.item.subtitle}
                                </div>
                              )}
                              {/* Show matching symptom tags for conditions */}
                              {type === 'condition' && (r.item.meta.symptoms as string[])?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(r.item.meta.symptoms as string[]).slice(0, 4).map(s => (
                                    <span key={s} className="text-xs bg-muted rounded px-1.5 py-0.5 text-muted-foreground">
                                      {s}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )
                })}
              </div>
            )}

            {ready && !query && (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Börja skriva för att söka bland läkare, kliniker och tillstånd
              </div>
            )}
          </div>

          {/* Footer hint */}
          {results.length > 0 && (
            <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><kbd className="rounded border border-border px-1">↑↓</kbd> navigera</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-border px-1">↵</kbd> öppna</span>
              <span className="flex items-center gap-1"><kbd className="rounded border border-border px-1">ESC</kbd> stäng</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// Trigger button for navbar / hero
export function SearchTrigger({ className = '' }: { className?: string }) {
  const [open, setOpen] = useState(false)

  // cmd+K / ctrl+K shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm text-muted-foreground hover:border-brand hover:text-brand transition-colors ${className}`}
      >
        <Search className="h-4 w-4" />
        <span>Sök läkare, symtom…</span>
        <kbd className="hidden sm:flex items-center gap-0.5 rounded border border-border px-1.5 py-0.5 text-xs">
          <span>⌘</span>K
        </kbd>
      </button>
      <SearchDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
