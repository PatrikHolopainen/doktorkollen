#!/usr/bin/env node
/**
 * 1177.se clinic scraper
 *
 * Scrapes all healthcare facilities from 1177.se in two phases:
 *
 *   Phase 1 — enumerate: pages through the search API to collect all
 *             17,000+ clinic entries (name, hsaId, 1177 URL, address,
 *             phone, lat/lng). Fast — only hits the JSON API.
 *
 *   Phase 2 — enrich: visits each clinic's kontaktkort page and
 *             extracts JSON-LD structured data (website URL, opening
 *             hours, booking URLs, full care-type list, etc.)
 *
 * Usage:
 *   node scripts/scrape-1177.js            # run both phases
 *   node scripts/scrape-1177.js phase1     # enumerate only
 *   node scripts/scrape-1177.js phase2     # enrich only (needs phase1 done)
 *
 * Output files (in data/):
 *   1177-listings.json      raw search-API results from Phase 1
 *   1177-clinics.json       enriched clinic records from Phase 2
 *   1177-progress.json      progress checkpoint (safe to delete to restart)
 *
 * Configuration (edit below or set env vars):
 *   DELAY_MS                milliseconds to wait between requests (default 3000)
 *   REQUEST_TIMEOUT_MS      HTTP timeout per request (default 30000)
 *   SAVE_EVERY              save progress every N clinics in Phase 2 (default 25)
 */

'use strict'

const fs   = require('fs')
const path = require('path')

// ─── Configuration ────────────────────────────────────────────────────────────

const BASE_URL          = 'https://www.1177.se'
const SEARCH_PATH       = '/api/hjv/search'
const DELAY_MS          = parseInt(process.env.DELAY_MS          ?? '3000',  10)
const REQUEST_TIMEOUT   = parseInt(process.env.REQUEST_TIMEOUT_MS ?? '30000', 10)
const SAVE_EVERY        = parseInt(process.env.SAVE_EVERY         ?? '25',    10)

const DATA_DIR       = path.join(__dirname, '..', 'data')
const LISTINGS_FILE  = path.join(DATA_DIR, '1177-listings.json')
const CLINICS_FILE   = path.join(DATA_DIR, '1177-clinics.json')
const PROGRESS_FILE  = path.join(DATA_DIR, '1177-progress.json')

// ─── Utilities ────────────────────────────────────────────────────────────────

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19)
  console.log(`[${ts}]  ${msg}`)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function readJson(filePath, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

/**
 * Fetch with timeout and basic retry on transient errors.
 * Waits DELAY_MS before every call so we never hammer 1177.
 */
async function fetchPolite(url, options = {}, retries = 3) {
  await sleep(DELAY_MS)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept':          'application/json, text/html',
          'Accept-Language': 'sv-SE,sv;q=0.9',
          'User-Agent':      'Mozilla/5.0 (compatible; doktorkollen-scraper/1.0; +https://doktorkollen.com)',
          ...options.headers,
        },
      })
      clearTimeout(timer)
      return res
    } catch (err) {
      if (attempt === retries) throw err
      const wait = attempt * 5000
      log(`  ⚠ Attempt ${attempt} failed (${err.message}) — retrying in ${wait / 1000}s`)
      await sleep(wait)
    }
  }
}

// ─── JSON-LD extraction ───────────────────────────────────────────────────────

/**
 * Finds the LocalBusiness entity from all JSON-LD blocks in raw HTML.
 * 1177 kontaktkort pages embed a WebPage schema whose mainEntity is a
 * LocalBusiness containing address, phone, hours, website URL, etc.
 */
function extractLocalBusiness(html) {
  const re = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi
  let match

  while ((match = re.exec(html)) !== null) {
    let data
    try { data = JSON.parse(match[1].trim()) } catch { continue }

    // Unwrap @graph if present
    const nodes = data['@graph'] ? data['@graph'] : [data]

    for (const node of nodes) {
      // Direct LocalBusiness
      if (node['@type'] === 'LocalBusiness') return node

      // WebPage → mainEntity
      if (node.mainEntity) {
        const entities = Array.isArray(node.mainEntity) ? node.mainEntity : [node.mainEntity]
        for (const e of entities) {
          if (e['@type'] === 'LocalBusiness') return e
        }
      }
    }
  }
  return null
}

/**
 * Normalise opening hours from JSON-LD openingHoursSpecification array
 * into a simple object keyed by day abbreviation.
 */
function parseOpeningHours(specs) {
  if (!specs) return null
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
  const result = {}
  for (const spec of specs) {
    const dayOfWeek = Array.isArray(spec.dayOfWeek) ? spec.dayOfWeek : [spec.dayOfWeek]
    for (const day of dayOfWeek) {
      if (!day) continue
      // day may be a full URI like "https://schema.org/Monday" or short "Mo"
      const short = day.split('/').pop().slice(0, 2)
      if (days.includes(short) || days.map(d => d[0] + d[1].toLowerCase()).includes(short)) {
        result[short] = spec.opens && spec.closes
          ? `${spec.opens}–${spec.closes}`
          : 'closed'
      }
    }
  }
  return Object.keys(result).length ? result : null
}

/**
 * Parse makesOffer into a simple string array of service names.
 */
function parseServices(offers) {
  if (!offers) return []
  return (Array.isArray(offers) ? offers : [offers])
    .map(o => (typeof o === 'string' ? o : o.name ?? o['@type'] ?? ''))
    .filter(Boolean)
}

/**
 * Build a clean clinic record from:
 *   - the search-API listing (fast, partial data)
 *   - the LocalBusiness JSON-LD (full data, from page fetch)
 */
function buildClinicRecord(listing, business) {
  const addr = business?.address ?? {}

  return {
    // Identifiers
    hsaId:     listing.HsaId ?? null,
    slug:      listing.Url?.replace(/^\/hitta-vard\/kontaktkort\//, '').replace(/\/$/, '') ?? null,
    url1177:   listing.Url ? `${BASE_URL}${listing.Url}` : null,

    // Names
    name:      business?.name ?? listing.Heading ?? null,

    // Contact — phone may be direct or under contactPoint[]
    phone:     extractPhone(business) ?? listing.PhoneNumber ?? null,
    website:   business?.url ?? null,

    // Address
    street:    addr.streetAddress ?? listing.Address ?? null,
    city:      addr.addressLocality ?? null,
    region:    addr.addressRegion ?? null,
    postcode:  addr.postalCode ?? null,

    // Geo
    lat:       business?.geo?.latitude  ?? listing.Latitude  ?? null,
    lng:       business?.geo?.longitude ?? listing.Longitude ?? null,

    // Enriched fields (Phase 2 only)
    openingHours: parseOpeningHours(business?.openingHoursSpecification),
    services:     parseServices(business?.makesOffer),
    bookingUrls:  extractBookingUrls(business?.makesOffer),
    description:  business?.description ?? null,

    // Flags from search API
    hasOnlineBooking: listing.HasMvkServices ?? false,
    hasVideoOrChat:   listing.VideoOrChat    ?? false,

    // Meta
    scrapedAt: new Date().toISOString(),
  }
}

/**
 * Extract the primary phone number from a LocalBusiness entity.
 * 1177 puts it under contactPoint[].telephone, not directly on the entity.
 */
function extractPhone(business) {
  if (!business) return null
  if (business.telephone) return business.telephone

  const points = business.contactPoint
  if (!points) return null
  const arr = Array.isArray(points) ? points : [points]
  // Prefer "Telefonnummer" over "Växeltelefon"
  const main = arr.find(p => /telefonnummer/i.test(p.name ?? '')) ?? arr[0]
  return main?.telephone ?? null
}

/**
 * Extract booking-related URLs from makesOffer offers.
 */
function extractBookingUrls(offers) {
  if (!offers) return []
  const urls = []
  for (const o of Array.isArray(offers) ? offers : [offers]) {
    if (typeof o !== 'object') continue
    if (o.url && /tidbok|boka|book/i.test(o.url + (o.name ?? ''))) {
      urls.push(o.url)
    }
  }
  return [...new Set(urls)]
}

// ─── Phase 1: Search terms ────────────────────────────────────────────────────
//
// The 1177 search API ignores the `page` parameter and always returns the
// first batch. The only way to enumerate the full catalogue is to issue many
// targeted queries (care types, city/municipality names, chain names) with
// batchSize=100, then deduplicate by URL.
//
// Sweden has ~17,677 indexed units.  Running all ~430 terms below with 100
// results each gives ~43,000 raw hits; after deduplication we expect 12,000–
// 16,000 unique clinic URLs — the remainder are phone services, hospital
// departments, etc. that appear in no search term.

const SEARCH_TERMS = [
  // ── Care types & specialties ────────────────────────────────────────────────
  'vårdcentral','husläkarmottagning','hälsocentral','familjeläkarmottagning',
  'barnmorska','barnmorskemottagning','mödravård','mödravårdscentral',
  'barnavårdscentral','bvc','barnläkare','barnmedicin','pediatrik',
  'tandläkare','tandvård','folktandvård','specialisttandvård',
  'psykiatri','psykiatrisk','vuxenpsykiatri','barnpsykiatri','bup',
  'psykolog','psykoterapi','kbt','kognitiv','mindfulness',
  'ortopedi','ortopedisk','reumatologi','ryggkirurgi',
  'kardiologi','hjärtmottagning','hjärtsjukdom',
  'neurologi','minnesmottagning','parkinson','epilepsi',
  'dermatologi','hudläkare','hudklinik',
  'gynekologi','gynekologisk','fertilitetsklinik',
  'urologi','njurmedicin',
  'onkologi','cancervård',
  'ögonklinik','ögonmottagning','optiker','laserbehandling',
  'öron','hals','önh','audiologi','hörsel',
  'lungmedicin','astma','kol','spirometri',
  'endokrinologi','diabetes','metabol',
  'gastroenterologi','mag','tarm','lever',
  'kirurgi','kirurgisk','plastikkirurgi','estetisk',
  'röntgen','radiologi','ultraljud','magnetröntgen','mammografi',
  'laboratorium','provtagning','blodprov','werlabs',
  'rehabilitering','sjukgymnast','fysioterapi','arbetsterapi','logoped',
  'smärtmottagning','smärtklinik',
  'allergimottagning','allergi',
  'fotvård','fotterapeut','medicinsk fotvård',
  'akupunktur','naprapati','kiropraktik','osteopati',
  'geriatrik','äldrevård','minnesvård',
  'infektionsmottagning','infektionsklinik',
  'vaccination','vaccinationsmottagning','resemedicin','resvaccination',
  'företagshälsovård','företagsvård','arbetslivsinriktad','previa','falck','feelgood',
  'kriminalvård','primärvård',
  'dialys','transplantation',
  'barnhabilitering','habilitering','neuropsykiatri','adhd','autism',
  'dietist','nutritionist','obesitas',
  'sexualmedicinsk','sti','venereologi',

  // ── Major chains & brands ───────────────────────────────────────────────────
  'capio','aleris','praktikertjänst','sophiahemmet','artro clinic',
  'unilabs','medicheck','doktor','min doktor','kry','doktor24',
  'pihlajalinna','terveystalo','mehiläinen',
  'nordic clinic','euromedic','lundby','carlanderska',
  'achima care','prima','svedea','ica hälsovård',
  'citykliniken','citymedicin','cityakuten',
  'olympia','samariten','sabbatsberg',

  // ── Swedish municipalities (all 290) ────────────────────────────────────────
  'stockholm','göteborg','malmö','uppsala','linköping','västerås','örebro',
  'norrköping','helsingborg','jönköping','umeå','lund','borås','eskilstuna',
  'södertälje','gävle','sundsvall','karlstad','östersund','växjö','halmstad',
  'kalmar','kristianstad','trollhättan','falun','skellefteå','luleå',
  'borlänge','hudiksvall','örnsköldsvik','visby','nyköping','motala',
  'lidköping','varberg','enköping','lidingö','nacka','haninge','huddinge',
  'täby','sollentuna','järfälla','upplands väsby','upplands-bro','sigtuna',
  'vallentuna','norrtälje','danderyd','solna','sundbyberg','ekerö',
  'värmdö','tyresö','botkyrka','salem','nynäshamn','södertälje',
  'strängnäs','eskilstuna','köping','hallstahammar','västerås','sala',
  'fagersta','norberg','skinnskatteberg','surahammar','arboga',
  'kungsbacka','mölndal','partille','öckerö','stenungsund','tjörn',
  'orust','sotenäs','munkedal','tanum','dals-ed','bengtsfors','mellerud',
  'lysekil','uddevalla','strömstad','väst-götaland','lidköping','götene',
  'skara','vara','herrljunga','vårgårda','borås','ulricehamn','tranemo',
  'svenljunga','marks','bollebygd','lerum','alingsås','nödinge',
  'härryda','mölnlycke','landvetter','lindome','kinna','sjöbo','skurup',
  'vellinge','trelleborg','staffanstorp','burlöv','lomma','kävlinge',
  'eslöv','hörby','höör','svalöv','landskrona','helsingborg','bjuv',
  'åstorp','ängelholm','höganäs','båstad','laholm','hylte','falkenberg',
  'varberg','kungsbacka','mölndal','härryda','partille','lerum','alingsås',
  'trollhättan','vänersborg','ale','kungälv','göteborg',
  'nässjö','vetlanda','eksjö','sävsjö','värnamo','gislaved','gnosjö',
  'vaggeryd','mullsjö','habo','jönköping','aneby','tranås','ydre',
  'kinda','linköping','mjölby','boxholm','ödeshög','vadstena','motala',
  'östergötland','norrköping','söderköping','valdemarsvik','finspång',
  'åtvidaberg','kinda','linköping','katrineholms','vingåker','gnesta',
  'trosa','oxelösund','nyköping','flens','katrineholm','strängnäs',
  'eskilstuna','kungsör','hallstahammar','västerås','enköping','heby',
  'tierp','östhammar','knivsta','håbo','sigtuna','norrtälje',
  'stockholm','huddinge','botkyrka','södertälje','haninge','tyresö',
  'nacka','värmdö','lidingö','danderyd','täby','vallentuna',
  'österåker','vaxholm','ekerö','sollentuna','järfälla','sundbyberg',
  'solna','upplands väsby','upplands-bro','köpings','arboga',
  'örebro','karlskoga','degerfors','hallsberg','askersund','lekeberg',
  'laxå','kumla','nora','lindesberg','ljusnarsberg',
  'karlstad','kristinehamn','filipstad','hagfors','arvika','säffle',
  'eda','torsby','storfors','hammarö','munkfors','forshaga','grums',
  'norrköping','nyköping','oxelösund','trosa','gnesta',
  'falun','borlänge','ludvika','avesta','hedemora','smedjebacken',
  'säter','gagnef','rättvik','leksand','mora','orsa','älvdalen',
  'malung-sälen','vansbro','torsby',
  'gävle','sandviken','hofors','ovanåker','nordanstig','ljusdal','bollnäs',
  'söderhamn','hudiksvall','sundsvall','timrå','härnösand',
  'kramfors','sollefteå','örnsköldsvik','åre','krokom','östersund',
  'ragunda','bräcke','berg','härjedalen','strömsund','åre',
  'skellefteå','lycksele','storuman','vilhelmina','dorotea',
  'umeå','vännäs','vindeln','robertsfors','nordmaling','bjurholm',
  'örnsköldsvik','sollefteå','kramfors','timrå','sundsvall',
  'härnösand','höga kusten','ånge',
  'luleå','piteå','älvsbyn','boden','gällivare','kiruna','jokkmokk',
  'arjeplog','arvidsjaur','malå','norsjö','skellefteå',
  'haparanda','kalix','överkalix','övertorneå','pajala',
  'östersund','krokom','åre','strömsund','bräcke',
]

// ─── Phase 1: Enumerate ───────────────────────────────────────────────────────

async function phase1(progress) {
  log('═══ Phase 1: Enumerate all clinics via targeted search queries ═══')
  log(`Note: 1177 API pagination is broken — using ${SEARCH_TERMS.length} search terms with batchSize=100`)

  if (progress.phase1Done) {
    const listings = readJson(LISTINGS_FILE, [])
    log(`Phase 1 already complete — ${listings.length} unique listings loaded.`)
    return listings
  }

  const doneTerms  = new Set(progress.phase1DoneTerms ?? [])
  const seenUrls   = new Set(progress.phase1SeenUrls  ?? [])
  const allHits    = []

  // Reload already-collected hits if resuming
  if (doneTerms.size > 0) {
    const saved = readJson(LISTINGS_FILE, [])
    allHits.push(...saved)
    saved.forEach(h => seenUrls.add(h.Url))
    log(`Resuming — ${doneTerms.size}/${SEARCH_TERMS.length} terms done, ${allHits.length} hits so far`)
  }

  // Also fetch the 1177 healthunitsitemap.xml as a seed
  if (!doneTerms.has('__sitemap__')) {
    log('Fetching healthunitsitemap.xml seed…')
    try {
      const res  = await fetchPolite(`${BASE_URL}/healthunitsitemap.xml`, { headers: { Accept: 'text/xml' } })
      const xml  = await res.text()
      const re   = /<loc>(https:\/\/www\.1177\.se\/hitta-vard\/kontaktkort\/[^<]+)<\/loc>/g
      let m, added = 0
      while ((m = re.exec(xml)) !== null) {
        const url = m[1].replace('https://www.1177.se', '')
        if (!seenUrls.has(url)) {
          seenUrls.add(url)
          allHits.push({ Url: url, Heading: url.split('/').filter(Boolean).pop().replace(/-/g,' '), HsaId: null, Address: null, PhoneNumber: null, Latitude: null, Longitude: null, HasMvkServices: false, VideoOrChat: false })
          added++
        }
      }
      log(`  Sitemap: added ${added} new URLs (${seenUrls.size} total)`)
    } catch (err) {
      log(`  ⚠ Sitemap fetch failed: ${err.message}`)
    }
    doneTerms.add('__sitemap__')
    // Checkpoint immediately after sitemap so progress isn't lost if killed
    writeJson(LISTINGS_FILE, allHits)
    progress.phase1DoneTerms = [...doneTerms]
    progress.phase1SeenUrls  = [...seenUrls]
    writeJson(PROGRESS_FILE, progress)
    log(`  → Sitemap checkpoint saved (${allHits.length} entries)`)
  }

  const terms = SEARCH_TERMS.filter(t => !doneTerms.has(t))
  log(`${terms.length} search terms remaining…`)

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i]
    const pct  = (((doneTerms.size + i + 1) / (SEARCH_TERMS.length + 1)) * 100).toFixed(1)

    try {
      const url = `${BASE_URL}${SEARCH_PATH}?` + new URLSearchParams({ q: term, batchSize: 100 })
      const res  = await fetchPolite(url)
      const data = await res.json()
      const hits = data.SearchHits ?? []

      let added = 0
      for (const hit of hits) {
        if (hit.Url && !seenUrls.has(hit.Url)) {
          seenUrls.add(hit.Url)
          allHits.push(hit)
          added++
        }
      }

      log(`[${pct}%] "${term}" → ${hits.length} hits, ${added} new (total: ${allHits.length})`)

      doneTerms.add(term)

      // Checkpoint every 20 terms
      if ((doneTerms.size % 20) === 0) {
        writeJson(LISTINGS_FILE, allHits)
        progress.phase1DoneTerms = [...doneTerms]
        progress.phase1SeenUrls  = [...seenUrls]
        writeJson(PROGRESS_FILE, progress)
        log(`  → Checkpoint: ${allHits.length} unique entries`)
      }
    } catch (err) {
      log(`  ✗ Error for "${term}": ${err.message}`)
      doneTerms.add(term)
    }
  }

  progress.phase1Done      = true
  progress.phase1DoneTerms = [...doneTerms]
  progress.phase1SeenUrls  = [...seenUrls]
  writeJson(LISTINGS_FILE, allHits)
  writeJson(PROGRESS_FILE, progress)

  log(`Phase 1 complete — ${allHits.length} unique listings saved to ${LISTINGS_FILE}`)
  return allHits
}

// ─── Phase 2: Enrich ─────────────────────────────────────────────────────────

async function phase2(listings, progress) {
  log('═══ Phase 2: Enrich clinics with kontaktkort page data ═══')

  // Use URL slug as the stable unique key (HsaId is null for sitemap-sourced entries)
  const slugOf = listing => listing.Url?.replace(/^\/hitta-vard\/kontaktkort\//, '').replace(/\/$/, '') ?? ''

  const processed = new Set(progress.phase2Processed ?? [])
  let   clinics   = readJson(CLINICS_FILE, [])

  // Index existing records by slug
  const existing = new Map(clinics.map(c => [c.slug, c]))

  // Filter to only unprocessed listings that have a URL
  const todo = listings.filter(l => l.Url && !processed.has(slugOf(l)))

  log(`Total listings: ${listings.length}  |  Already done: ${processed.size}  |  Remaining: ${todo.length}`)

  let savedSince = 0

  for (let i = 0; i < todo.length; i++) {
    const listing = todo[i]
    const slug    = slugOf(listing)
    const pct     = (((processed.size + i + 1) / listings.length) * 100).toFixed(1)

    const pageUrl = `${BASE_URL}${listing.Url}`

    try {
      const res  = await fetchPolite(pageUrl, { headers: { 'Accept': 'text/html' } })

      if (!res.ok) {
        log(`[${pct}%] HTTP ${res.status} — ${listing.Heading ?? slug}`)
        const record = buildClinicRecord(listing, null)
        existing.set(record.slug, record)
      } else {
        const html     = await res.text()
        const business = extractLocalBusiness(html)
        const record   = buildClinicRecord(listing, business)
        existing.set(record.slug, record)

        const hasWebsite = record.website ? '🌐' : '  '
        const hasHours   = record.openingHours ? '🕐' : '  '
        log(`[${pct}%] ${hasWebsite}${hasHours} ${record.name ?? listing.Heading ?? slug}`)
      }
    } catch (err) {
      log(`[${pct}%] ✗ Error — ${listing.Heading ?? slug}: ${err.message}`)
      const record = buildClinicRecord(listing, null)
      existing.set(record.slug, record)
    }

    processed.add(slug)
    savedSince++

    // Save progress every SAVE_EVERY clinics
    if (savedSince >= SAVE_EVERY) {
      clinics = [...existing.values()]
      writeJson(CLINICS_FILE, clinics)
      progress.phase2Processed = [...processed]
      writeJson(PROGRESS_FILE, progress)
      log(`  → Checkpoint saved (${clinics.length} total)`)
      savedSince = 0
    }
  }

  // Final save
  clinics = [...existing.values()]
  writeJson(CLINICS_FILE, clinics)
  progress.phase2Done      = true
  progress.phase2Processed = [...processed]
  writeJson(PROGRESS_FILE, progress)

  log(`Phase 2 complete — ${clinics.length} clinics saved to ${CLINICS_FILE}`)
  return clinics
}

// ─── Summary ─────────────────────────────────────────────────────────────────

function printSummary(clinics) {
  const withWebsite   = clinics.filter(c => c.website).length
  const withCoords    = clinics.filter(c => c.lat && c.lng).length
  const withHours     = clinics.filter(c => c.openingHours).length
  const withBooking   = clinics.filter(c => c.bookingUrls?.length).length

  const byRegion = {}
  for (const c of clinics) {
    const r = c.region ?? 'Unknown'
    byRegion[r] = (byRegion[r] ?? 0) + 1
  }

  log('═══ Summary ════════════════════════════════════════════')
  log(`Total clinics:        ${clinics.length}`)
  log(`With website URL:     ${withWebsite} (${((withWebsite/clinics.length)*100).toFixed(1)}%)`)
  log(`With coordinates:     ${withCoords}`)
  log(`With opening hours:   ${withHours}`)
  log(`With booking URLs:    ${withBooking}`)
  log('Top regions:')
  Object.entries(byRegion)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([r, n]) => log(`  ${r.padEnd(35)} ${n}`))
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const arg = process.argv[2] ?? 'both'

  if (!['phase1', 'phase2', 'both'].includes(arg)) {
    console.error('Usage: node scripts/scrape-1177.js [phase1|phase2|both]')
    process.exit(1)
  }

  fs.mkdirSync(DATA_DIR, { recursive: true })

  const progress = readJson(PROGRESS_FILE, {
    phase1Done:      false,
    phase1LastPage:  0,
    phase2Done:      false,
    phase2Processed: [],
  })

  log(`Delay between requests: ${DELAY_MS}ms`)
  log(`Request timeout:        ${REQUEST_TIMEOUT}ms`)
  log(`Checkpoint every:       ${SAVE_EVERY} clinics`)
  log(`Data directory:         ${DATA_DIR}`)

  let listings = []

  if (arg === 'phase1' || arg === 'both') {
    listings = await phase1(progress)
  }

  if (arg === 'phase2' || arg === 'both') {
    if (!listings.length) {
      listings = readJson(LISTINGS_FILE, [])
      if (!listings.length) {
        log('No listings found — run phase1 first.')
        process.exit(1)
      }
      log(`Loaded ${listings.length} listings from ${LISTINGS_FILE}`)
    }
    const clinics = await phase2(listings, progress)
    printSummary(clinics)
  }
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
