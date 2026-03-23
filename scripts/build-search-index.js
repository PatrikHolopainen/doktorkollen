#!/usr/bin/env node
/**
 * Build unified search index
 *
 * Reads all scraped data files and produces data/search-index.json —
 * a flat array of search entries covering doctors, clinics and conditions.
 *
 * Each entry has:
 *   type        "doctor" | "clinic" | "condition"
 *   id          unique stable key
 *   name        primary display label
 *   subtitle    secondary line (specialty, city, credential…)
 *   url         internal app URL
 *   tags        array of searchable terms (symptoms, specialties, city, services…)
 *   meta        small display object (photo, lat/lng, phone, source…)
 *
 * Usage:
 *   node scripts/build-search-index.js
 */

'use strict'

const fs   = require('fs')
const path = require('path')

const DATA_DIR = path.join(__dirname, '..', 'data')
const OUT_FILE = path.join(DATA_DIR, 'search-index.json')

function log(msg) { console.log(msg) }

function readJson(p, fallback = []) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return fallback }
}

function slugify(str = '') {
  return str.toLowerCase()
    .replace(/å/g, 'a').replace(/ä/g, 'a').replace(/ö/g, 'o')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function dedup(arr) {
  return [...new Set(arr.filter(Boolean))]
}

// ─── Doctors ─────────────────────────────────────────────────────────────────

function buildDoctorEntry(doc, source) {
  const id       = `doctor-${source}-${slugify(doc.name)}`
  const name     = doc.name ?? ''
  const specialty = doc.specialty ?? doc.careArea ?? null
  const credential = doc.credential ?? doc.title ?? null
  const city     = doc.city ?? doc.location ?? null
  const clinic   = doc.clinicName ?? doc.careTaker ?? null

  const tags = dedup([
    name,
    credential,
    specialty,
    clinic,
    city,
    // expand credential e.g. "Leg. läkare" → ["läkare", "legitimerad"]
    ...(credential ?? '').toLowerCase().split(/[\s.,]+/),
    // expand specialty slug if present
    ...(doc.careArea ?? '').replace(/-/g, ' ').split(' '),
  ].map(t => (t ?? '').trim()).filter(t => t.length > 1))

  return {
    type:     'doctor',
    id,
    name,
    subtitle: [credential, specialty, clinic, city].filter(Boolean).join(' · '),
    url:      `/vardgivare/${slugify(name)}`,
    tags,
    meta: {
      source,
      specialty,
      credential,
      clinic,
      city,
      photoUrl:  doc.photoUrl ?? null,
      clinicUrl: doc.clinicUrl ?? null,
    },
  }
}

// ─── Clinics ─────────────────────────────────────────────────────────────────

function buildClinicEntry(clinic) {
  const id    = `clinic-1177-${clinic.slug ?? slugify(clinic.name)}`
  const name  = clinic.name ?? ''
  const city  = clinic.city ?? ''
  // Only top-level service names as tags (no word-splitting to keep index small)
  const services = (clinic.services ?? []).slice(0, 6)

  const tags = dedup([
    name,
    city,
    clinic.region,
    ...services,
  ].map(t => (t ?? '').trim()).filter(t => t.length > 1))

  return {
    type:     'clinic',
    id,
    name,
    subtitle: [city, clinic.region].filter(Boolean).join(', '),
    url:      `/klinik/${clinic.slug ?? slugify(name)}`,
    tags,
    meta: {
      city,
      phone:    clinic.phone ?? null,
      lat:      clinic.lat ?? null,
      lng:      clinic.lng ?? null,
      sourceUrl: clinic.url1177 ?? null,
    },
  }
}

// ─── Conditions ──────────────────────────────────────────────────────────────

function buildConditionEntry(cond) {
  const id   = `condition-${cond.slug}`
  const name = cond.title ?? cond.name ?? ''

  const tags = dedup([
    name,
    cond.category?.replace(/-/g, ' '),
    cond.subcategory?.replace(/-/g, ' '),
    ...(cond.symptoms ?? []),
    ...(cond.treatments ?? []),
    ...(cond.specialties ?? []),
    // Split symptom phrases into individual words for wider matching
    ...(cond.symptoms ?? []).flatMap(s => s.toLowerCase().split(/[\s,]+/)),
    ...(cond.specialties ?? []).flatMap(s => s.toLowerCase().split(/[\s-]+/)),
  ].map(t => (t ?? '').trim()).filter(t => t.length > 1))

  return {
    type:     'condition',
    id,
    name,
    subtitle: (cond.specialties ?? []).slice(0, 3).join(' · '),
    url:      `/tillstand/${cond.slug}`,
    tags,
    meta: {
      description:   cond.description ?? null,
      symptoms:      cond.symptoms ?? [],
      treatments:    cond.treatments ?? [],
      specialties:   cond.specialties ?? [],
      whenToSeekCare: cond.whenToSeekCare ?? null,
      source:        '1177.se',
      sourceUrl:     cond.sourceUrl ?? cond.url,
      lastModified:  cond.lastModified ?? null,
    },
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  log('═══ Building search index ═══')
  const entries = []
  const seen    = new Set()

  function add(entry) {
    if (seen.has(entry.id)) return
    seen.add(entry.id)
    entries.push(entry)
  }

  // Doctors — Sophiahemmet (highest quality: specialty + photo + credential)
  const sophiaDoctors = readJson(path.join(DATA_DIR, 'sophiahemmet-doctors.json'))
  sophiaDoctors.forEach(d => add(buildDoctorEntry(d, 'sophiahemmet')))
  log(`Sophiahemmet doctors: ${sophiaDoctors.length}`)

  // Doctors — Aleris
  const alerisDoctors = readJson(path.join(DATA_DIR, 'aleris-doctors.json'))
  alerisDoctors.forEach(d => add(buildDoctorEntry(d, 'aleris')))
  log(`Aleris doctors: ${alerisDoctors.length}`)

  // Clinics — 1177 (quality filter: name + city + phone + services + coordinates)
  const clinics = readJson(path.join(DATA_DIR, '1177-clinics.json'))
  const validClinics = clinics.filter(c =>
    c.name && c.city && c.phone && c.lat && c.services?.length > 0
  )
  validClinics.forEach(c => add(buildClinicEntry(c)))
  log(`1177 clinics: ${validClinics.length}`)

  // Conditions
  const conditions = readJson(path.join(DATA_DIR, 'conditions.json'))
  conditions.forEach(c => add(buildConditionEntry(c)))
  log(`Conditions: ${conditions.length}`)

  log(`Total entries: ${entries.length}`)

  // Write index
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(OUT_FILE, JSON.stringify(entries), 'utf8')

  const kb = Math.round(fs.statSync(OUT_FILE).size / 1024)
  log(`Saved to ${OUT_FILE} (${kb} KB)`)

  // Stats
  const byType = {}
  entries.forEach(e => { byType[e.type] = (byType[e.type] ?? 0) + 1 })
  Object.entries(byType).forEach(([t, n]) => log(`  ${t}: ${n}`))

  const avgTags = (entries.reduce((s, e) => s + e.tags.length, 0) / entries.length).toFixed(1)
  log(`Avg tags per entry: ${avgTags}`)
}

main()
