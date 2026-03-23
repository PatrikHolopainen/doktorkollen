import Fuse, { type IFuseOptions } from 'fuse.js'

export type SearchEntryType = 'doctor' | 'clinic' | 'condition'

export interface SearchEntry {
  type:     SearchEntryType
  id:       string
  name:     string
  subtitle: string
  url:      string
  tags:     string[]
  meta:     Record<string, unknown>
}

export interface SearchResult {
  item:  SearchEntry
  score: number
}

let fuseInstance: Fuse<SearchEntry> | null = null
let loadPromise: Promise<void> | null = null

const FUSE_OPTIONS: IFuseOptions<SearchEntry> = {
  keys: [
    { name: 'name',     weight: 0.5 },
    { name: 'tags',     weight: 0.35 },
    { name: 'subtitle', weight: 0.15 },
  ],
  threshold:        0.35,   // 0 = exact, 1 = match anything
  distance:         200,
  minMatchCharLength: 2,
  includeScore:     true,
  ignoreLocation:   true,
}

async function loadIndex(): Promise<void> {
  if (fuseInstance) return
  const res  = await fetch('/search-index.json')
  const data = (await res.json()) as SearchEntry[]
  fuseInstance = new Fuse(data, FUSE_OPTIONS)
}

export function ensureIndex(): Promise<void> {
  if (!loadPromise) loadPromise = loadIndex()
  return loadPromise
}

export async function search(query: string, limit = 12): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return []
  await ensureIndex()
  const raw = fuseInstance!.search(query.trim(), { limit })
  return raw.map(r => ({ item: r.item, score: r.score ?? 1 }))
}

export async function searchByType(
  query: string,
  type: SearchEntryType,
  limit = 8,
): Promise<SearchResult[]> {
  const all = await search(query, limit * 3)
  return all.filter(r => r.item.type === type).slice(0, limit)
}
