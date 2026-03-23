#!/usr/bin/env node
/**
 * Adds lat/lng to sophiahemmet-doctors.json and aleris-doctors.json
 * Strategy:
 *  1. Sophiahemmet doctors → use Sophiahemmet campus coordinates (all on-site)
 *  2. Aleris doctors       → match clinicName against 1177 clinics that include
 *                            "aleris" in their name, filtered by city. Falls back
 *                            to city-centre coordinates.
 */

const fs   = require('fs')
const path = require('path')

const dataDir = path.join(__dirname, '..', 'data')

// ── Load 1177 clinics ────────────────────────────────────────────────────────
const clinics1177 = JSON.parse(fs.readFileSync(path.join(dataDir, '1177-clinics.json'), 'utf8'))
  .filter(c => c.lat && c.lat !== 0 && c.lng && c.lng !== 0)

// ── City-centre fallbacks (slugified city → [lat, lng]) ─────────────────────
const CITY_COORDS = {
  stockholm:   [59.3293, 18.0686],
  goteborg:    [57.7089, 11.9746],
  malmo:       [55.6050, 13.0038],
  uppsala:     [59.8588, 17.6389],
  linkoping:   [58.4108, 15.6214],
  vasteras:    [59.6099, 16.5448],
  orebro:      [59.2741, 15.2066],
  helsingborg: [56.0467, 12.6945],
  norrkoping:  [58.5877, 16.1924],
  jonkoping:   [57.7826, 14.1618],
  umea:        [63.8258, 20.2630],
  lund:        [55.7047, 13.1910],
  boras:       [57.7210, 12.9401],
  sundsvall:   [62.3908, 17.3069],
  gavle:       [60.6749, 17.1413],
  eskilstuna:  [59.3666, 16.5077],
  karlstad:    [59.4022, 13.5115],
  vaxjo:       [56.8777, 14.8091],
  lulea:       [65.5848, 22.1547],
  borlange:    [60.4858, 15.4367],
  halmstad:    [56.6745, 12.8578],
  kristianstad:[56.0294, 14.1567],
  angelholm:   [56.2436, 12.8619],
  sverige:     [59.3293, 18.0686], // generic fallback → Stockholm
}

function slugify(str = '') {
  return str.toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function cityCoords(cityStr) {
  const slug = slugify(cityStr)
  return CITY_COORDS[slug] ?? CITY_COORDS['stockholm']
}

// ── Sophiahemmet ─────────────────────────────────────────────────────────────
// All doctors are on the Sophiahemmet campus, Valhallavägen 91, Stockholm
const SOPHIA_LAT = 59.34580
const SOPHIA_LNG = 18.07560

const sophiaDoctors = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'sophiahemmet-doctors.json'), 'utf8')
)

let sophiaUpdated = 0
const sophiaOut = sophiaDoctors.map(d => {
  if (d.lat && d.lat !== 0) return d   // already has coords
  sophiaUpdated++
  return { ...d, lat: SOPHIA_LAT, lng: SOPHIA_LNG }
})

fs.writeFileSync(
  path.join(dataDir, 'sophiahemmet-doctors.json'),
  JSON.stringify(sophiaOut, null, 2)
)
console.log(`Sophiahemmet: updated ${sophiaUpdated} / ${sophiaDoctors.length} doctors`)

// ── Aleris ───────────────────────────────────────────────────────────────────
// Build a lookup: "aleris" clinics from 1177, keyed by slugified name and city
const alerisClinics = clinics1177.filter(c => c.name.toLowerCase().includes('aleris'))
// Build map: citySlug → list of {name, lat, lng}
const alerisByCity = {}
for (const c of alerisClinics) {
  const cs = slugify(c.city ?? '')
  if (!alerisByCity[cs]) alerisByCity[cs] = []
  alerisByCity[cs].push({ name: c.name.toLowerCase(), lat: c.lat, lng: c.lng })
}

function findAlerisClinic(clinicName, city) {
  const cs   = slugify(city)
  const pool = alerisByCity[cs] ?? []
  if (!clinicName || pool.length === 0) return null
  const needle = clinicName.toLowerCase()
  // Try substring match on the last meaningful word of the clinic name
  const words = needle.replace(/aleris\s*/i, '').trim().split(/\s+/).filter(w => w.length > 3)
  for (const entry of pool) {
    if (words.some(w => entry.name.includes(w))) return entry
  }
  // Fallback: any Aleris clinic in that city
  return pool[0] ?? null
}

const alerisDoctors = JSON.parse(
  fs.readFileSync(path.join(dataDir, 'aleris-doctors.json'), 'utf8')
)

let alerisMatched = 0
let alerisFallback = 0

const alerisOut = alerisDoctors.map(d => {
  if (d.lat && d.lat !== 0) return d

  const match = findAlerisClinic(d.clinicName, d.city)
  if (match) {
    alerisMatched++
    return { ...d, lat: match.lat, lng: match.lng }
  }

  // City-centre fallback
  alerisFallback++
  const [lat, lng] = cityCoords(d.city)
  return { ...d, lat, lng }
})

fs.writeFileSync(
  path.join(dataDir, 'aleris-doctors.json'),
  JSON.stringify(alerisOut, null, 2)
)
console.log(`Aleris: matched ${alerisMatched} to specific clinics, ${alerisFallback} used city-centre fallback`)
console.log('Done.')
