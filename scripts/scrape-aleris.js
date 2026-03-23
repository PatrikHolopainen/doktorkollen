#!/usr/bin/env node
/**
 * Aleris specialist scraper
 *
 * Phase 1 — enumerate: fetches aleris.se/mottagningar/ to collect all
 *            clinic page URLs (~70 clinics).
 *
 * Phase 2 — enrich: visits each clinic page and extracts the doctor cards
 *            from the "Möt några av våra specialister" section.
 *            Aleris uses Next.js App Router with SSR, so doctor cards ARE
 *            present in the initial HTML (confirmed by inspection).
 *
 * Output:  data/aleris-doctors.json
 * Progress: data/aleris-progress.json
 *
 * Usage:
 *   node scripts/scrape-aleris.js
 *   DELAY_MS=2000 node scripts/scrape-aleris.js
 */

'use strict'

const fs   = require('fs')
const path = require('path')

const BASE_URL      = 'https://www.aleris.se'
const CLINICS_URL   = `${BASE_URL}/mottagningar/`
const DELAY_MS      = parseInt(process.env.DELAY_MS           ?? '3000', 10)
const TIMEOUT_MS    = parseInt(process.env.REQUEST_TIMEOUT_MS ?? '30000', 10)
const DATA_DIR      = path.join(__dirname, '..', 'data')
const OUT_FILE      = path.join(DATA_DIR, 'aleris-doctors.json')
const CLINICS_FILE  = path.join(DATA_DIR, 'aleris-clinics.json')
const PROGRESS_FILE = path.join(DATA_DIR, 'aleris-progress.json')

function log(msg) {
  const ts = new Date().toISOString().replace('T',' ').slice(0,19)
  console.log(`[${ts}]  ${msg}`)
}

function readJson(p, fallback = null) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return fallback }
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8')
}

function stripTags(html = '') {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim()
}

async function fetchPolite(url, retries = 3) {
  await new Promise(r => setTimeout(r, DELAY_MS))
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)
    try {
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept':          'text/html,application/xhtml+xml',
          'Accept-Language': 'sv-SE,sv;q=0.9',
          'User-Agent':      'Mozilla/5.0 (compatible; doktorkollen-scraper/1.0)',
        },
      })
      clearTimeout(timer)
      return res
    } catch (err) {
      clearTimeout(timer)
      if (attempt === retries) throw err
      log(`  ⚠ Attempt ${attempt} failed (${err.message}) — retry in ${attempt * 4}s`)
      await new Promise(r => setTimeout(r, attempt * 4000))
    }
  }
}

// ─── Clinic URL extraction ────────────────────────────────────────────────────

/**
 * Parse all /mottagningar/city/clinic-name/ links from the clinics listing page.
 * Aleris uses Next.js; the clinic links are present in SSR'd <a> tags.
 */
function parseClinicUrls(html) {
  const urls = new Set()

  // Match absolute hrefs like https://www.aleris.se/mottagningar/{city}/{clinic}/
  // Exactly 4 path segments (mottagningar + city + clinic + trailing slash)
  const re = /href="(https:\/\/www\.aleris\.se\/mottagningar\/[a-z0-9-]+\/[a-z0-9-]+\/)"/gi
  let m
  while ((m = re.exec(html)) !== null) {
    urls.add(m[1])
  }

  return [...urls]
}

// ─── Doctor card extraction ───────────────────────────────────────────────────

/**
 * Extract doctor cards from a clinic page.
 *
 * Aleris SSR HTML includes cards like:
 *   <h3 data-epi-edit="Heading">Johan Hansson</h3>
 *   ... <p ...>Specialistläkare allmän onkologi</p> ...
 *
 * We look for any h3 with data-epi-edit="Heading" that appears inside
 * a section that also contains "specialister" or "läkare" nearby.
 * We then grab the next <p> sibling as the title.
 *
 * Fallback: match all h3 tags that look like person names (two+ capitalised
 * words) within 200 chars of a title-like string.
 */
function parseDoctors(html, clinicUrl) {
  const doctors = []
  const seen    = new Set()

  // Derive city and clinic name from URL
  // e.g. /mottagningar/stockholm/christinakliniken/
  const urlParts  = clinicUrl.replace(BASE_URL,'').split('/').filter(Boolean)
  const city      = urlParts[1] ?? null
  const clinicSlug = urlParts[2] ?? null

  // ── Strategy 1: data-epi-edit="Heading" pattern (Optimizely CMS marker) ──
  const epiRe = /<h3[^>]+data-epi-edit="Heading"[^>]*>([\s\S]+?)<\/h3>([\s\S]{0,500}?)<\/div>/gi
  let m
  while ((m = epiRe.exec(html)) !== null) {
    const name  = stripTags(m[1])
    const after = m[2]

    if (!looksLikeName(name)) continue

    // Find first <p> or <span> in the following content for title
    const titleMatch = /<(?:p|span)[^>]*>([\s\S]+?)<\/(?:p|span)>/i.exec(after)
    const title = titleMatch ? stripTags(titleMatch[1]) : null

    const key = `${name}|${clinicUrl}`
    if (seen.has(key)) continue
    seen.add(key)

    doctors.push(makeRecord(name, title, clinicUrl, city, clinicSlug))
  }

  // ── Strategy 2: CSS-module card pattern (hashed class names change, but
  //    the structural nesting is stable: a <div> containing h3 + specialty p)
  //    Look for h3 preceded/followed by a "Specialistläkare" title within
  //    a 600-char window. ──
  if (doctors.length === 0) {
    const cardRe = /<h3[^>]*>([\s\S]+?)<\/h3>([\s\S]{0,400}?)(?=<h3|$)/gi
    while ((m = cardRe.exec(html)) !== null) {
      const name  = stripTags(m[1])
      const after = m[2]

      if (!looksLikeName(name)) continue
      if (!after.match(/specialistläkare|leg\.\s*läkare|psykolog|sjuksköterska|barnmorska|terapeut/i)) continue

      const titleMatch = /<(?:p|span)[^>]*>([\s\S]+?)<\/(?:p|span)>/i.exec(after)
      const title = titleMatch ? stripTags(titleMatch[1]) : null

      const key = `${name}|${clinicUrl}`
      if (seen.has(key)) continue
      seen.add(key)

      doctors.push(makeRecord(name, title, clinicUrl, city, clinicSlug))
    }
  }

  return doctors
}

function looksLikeName(str) {
  if (!str || str.length > 50 || str.length < 4) return false
  if (/[<{(?!]/.test(str)) return false
  const words = str.trim().split(/\s+/)
  // Names are 2–4 words; all words must start uppercase (filters content headings)
  if (words.length < 2 || words.length > 4) return false
  return words.every(w => /^[A-ZÅÄÖ]/.test(w))
}

function makeRecord(name, title, clinicUrl, city, clinicSlug) {
  return {
    source:     'aleris',
    name:       name.trim(),
    title:      title ?? null,
    clinicName: clinicSlug ? clinicSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : null,
    clinicUrl,
    city:       city ? city.replace(/\b\w/g, c => c.toUpperCase()) : null,
    scrapedAt:  new Date().toISOString(),
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  log('═══ Aleris specialist scraper ═══')

  const progress = readJson(PROGRESS_FILE, { done: [], allDoctors: [] })
  const processed = new Set(progress.done ?? [])
  let allDoctors  = progress.allDoctors ?? []

  // ── Phase 1: get clinic URLs ──────────────────────────────────────────────
  let clinicUrls = readJson(CLINICS_FILE, null)

  if (!clinicUrls) {
    log(`Fetching clinic list: ${CLINICS_URL}`)
    const res  = await fetchPolite(CLINICS_URL)
    if (!res.ok) { log(`✗ HTTP ${res.status}`); process.exit(1) }
    const html = await res.text()
    clinicUrls = parseClinicUrls(html)
    writeJson(CLINICS_FILE, clinicUrls)
    log(`Found ${clinicUrls.length} clinic URLs → saved to ${CLINICS_FILE}`)
  } else {
    log(`Loaded ${clinicUrls.length} clinic URLs from cache`)
  }

  // ── Phase 2: scrape each clinic page ─────────────────────────────────────
  const todo = clinicUrls.filter(u => !processed.has(u))
  log(`Already scraped: ${processed.size}  |  Remaining: ${todo.length}`)

  for (let i = 0; i < todo.length; i++) {
    const url = todo[i]
    const pct = (((processed.size + i + 1) / clinicUrls.length) * 100).toFixed(1)

    try {
      const res  = await fetchPolite(url)
      if (!res.ok) {
        log(`[${pct}%] HTTP ${res.status} — ${url}`)
        processed.add(url)
        continue
      }
      const html    = await res.text()
      const doctors = parseDoctors(html, url)

      allDoctors.push(...doctors)
      processed.add(url)

      const icon = doctors.length > 0 ? `👤×${doctors.length}` : '  —  '
      log(`[${pct}%] ${icon}  ${url.replace(BASE_URL,'')}`)
    } catch (err) {
      log(`[${pct}%] ✗ ${err.message} — ${url}`)
      processed.add(url)
    }

    // Checkpoint every 10 clinics
    if ((processed.size % 10) === 0) {
      writeJson(OUT_FILE, allDoctors)
      writeJson(PROGRESS_FILE, { done: [...processed], allDoctors })
      log(`  → Checkpoint: ${allDoctors.length} doctors`)
    }
  }

  // Final save
  writeJson(OUT_FILE, allDoctors)
  writeJson(PROGRESS_FILE, { done: [...processed], allDoctors })

  log('══════════════════════════════════════')
  log(`Clinics scraped:  ${clinicUrls.length}`)
  log(`Doctors found:    ${allDoctors.length}`)
  log(`With title:       ${allDoctors.filter(d=>d.title).length}`)
  log(`Cities covered:   ${new Set(allDoctors.map(d=>d.city)).size}`)
  log(`Saved to: ${OUT_FILE}`)

  if (allDoctors.length > 0) {
    log('Sample entries:')
    allDoctors.slice(0, 5).forEach(d =>
      log(`  ${d.name} | ${d.title ?? '—'} | ${d.clinicName}, ${d.city}`)
    )
  }
}

main().catch(err => { console.error(err); process.exit(1) })
