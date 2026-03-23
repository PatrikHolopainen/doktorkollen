#!/usr/bin/env node
/**
 * Sophiahemmet specialist directory scraper
 *
 * Scrapes sjukhus.sophiahemmet.se/specialister/
 * All 313 entries are server-rendered on one page.
 * Data lives in data-* attributes on div[data-js="specialist-filter-card"].
 *
 * Output: data/sophiahemmet-doctors.json
 *
 * Usage:
 *   node scripts/scrape-sophiahemmet.js
 */

'use strict'

const fs   = require('fs')
const path = require('path')

const BASE_URL     = 'https://sjukhus.sophiahemmet.se'
const LISTING_URL  = `${BASE_URL}/specialister/`
const DELAY_MS     = parseInt(process.env.DELAY_MS           ?? '3000', 10)
const TIMEOUT_MS   = parseInt(process.env.REQUEST_TIMEOUT_MS ?? '30000', 10)
const DATA_DIR     = path.join(__dirname, '..', 'data')
const OUT_FILE     = path.join(DATA_DIR, 'sophiahemmet-doctors.json')

function log(msg) {
  const ts = new Date().toISOString().replace('T',' ').slice(0,19)
  console.log(`[${ts}]  ${msg}`)
}

function writeJson(p, data) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8')
}

function stripTags(html = '') {
  return html.replace(/<[^>]+>/g, '').replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#\d+;/g,'').trim()
}

/**
 * Parse all specialist entries from the directory HTML.
 *
 * Each card looks like:
 *   <div data-js="specialist-filter-card"
 *        data-firstname="Adam" data-lastname="Lindfors"
 *        data-care-area="ortopedi"
 *        data-care-taker="ryggkirurgiskt-centrum"
 *        data-house="lill-janshuset-...">
 *     <h2>Adam Lindfors</h2>
 *     <span>Leg. läkare</span>
 *     <ul>
 *       <li><a href="?s=Ortopedi">Ortopedi</a></li>
 *       <li><a href="http://www.rkc.se">Clinic name</a></li>
 *       <li><a href="/kontakt/hitta-hit?hus=...">Location</a></li>
 *     </ul>
 *     <a href="http://www.rkc.se">Kontakta vårdgivare</a>
 *     <picture><img data-src="https://images.ohmyhosting.se/..."></picture>
 *   </div>
 */
function parseSpecialists(html) {
  const doctors = []

  // Match each specialist-filter-card div (non-greedy up to the next such div or end)
  const cardRe = /<div[^>]+data-js="specialist-filter-card"([\s\S]+?)(?=<div[^>]+data-js="specialist-filter-card"|<\/main|$)/gi
  let m

  while ((m = cardRe.exec(html)) !== null) {
    const block = m[1]

    // Extract data-* attributes from the opening div tag
    const openingTag = m[0].slice(0, m[0].indexOf('>') + 1)

    function attr(name) {
      const re = new RegExp(`data-${name}="([^"]*)"`, 'i')
      const hit = re.exec(openingTag)
      return hit ? hit[1].trim() : null
    }

    const firstName  = attr('firstname')
    const lastName   = attr('lastname')
    const careArea   = attr('care-area')
    const careTaker  = attr('care-taker')
    const house      = attr('house')

    if (!firstName && !lastName) continue

    const name = [firstName, lastName].filter(Boolean).join(' ')

    // Extract credential from first <span>
    const spanMatch = /<span[^>]*>([\s\S]+?)<\/span>/i.exec(block)
    const credential = spanMatch ? stripTags(spanMatch[1]) : null

    // Extract specialty, clinic name/url, location from <li> links
    let specialty  = null
    let clinicName = null
    let clinicUrl  = null
    let location   = null

    const liRe = /<li[^>]*>([\s\S]+?)<\/li>/gi
    let liMatch
    while ((liMatch = liRe.exec(block)) !== null) {
      const liContent = liMatch[1]
      const aMatch = /<a[^>]+href="([^"]*)"[^>]*>([\s\S]+?)<\/a>/i.exec(liContent)
      if (!aMatch) continue
      const href = aMatch[1]
      const text = stripTags(aMatch[2])

      if (href.includes('?s=') || href.includes('filter_specialty')) {
        specialty = specialty ?? text
      } else if (href.startsWith('http') && !href.includes('sophiahemmet')) {
        clinicName = clinicName ?? text
        clinicUrl  = clinicUrl  ?? href
      } else if (href.includes('hitta-hit') || href.includes('?hus=') || href.includes('filter_hus')) {
        location = location ?? text
      } else if (href.startsWith('http')) {
        clinicName = clinicName ?? text
        clinicUrl  = clinicUrl  ?? href
      }
    }

    // Fall back to contact link
    const kontaktMatch = /<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>\s*Kontakta/i.exec(block)
    if (!clinicUrl && kontaktMatch) {
      clinicUrl = kontaktMatch[1]
    }

    // Extract photo URL from data-src
    const imgMatch = /data-src="(https?:\/\/[^"]+)"/i.exec(block)
    const photoUrl = imgMatch ? imgMatch[1] : null

    doctors.push({
      source:     'sophiahemmet',
      name,
      firstName,
      lastName,
      credential,
      specialty:  specialty ?? (careArea ? careArea.replace(/-/g,' ') : null),
      careArea,
      careTaker,
      house,
      clinicName,
      clinicUrl,
      location:   location ?? 'Sophiahemmet',
      photoUrl,
      scrapedAt:  new Date().toISOString(),
    })
  }

  return doctors
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  log('═══ Sophiahemmet specialist scraper ═══')
  log(`Target: ${LISTING_URL}`)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  log('Fetching directory page…')
  await new Promise(r => setTimeout(r, DELAY_MS))

  let html
  try {
    const res = await fetch(LISTING_URL, {
      signal: controller.signal,
      headers: {
        'Accept':          'text/html',
        'User-Agent':      'Mozilla/5.0 (compatible; doktorkollen-scraper/1.0)',
        'Accept-Language': 'sv-SE,sv;q=0.9',
      },
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (err) {
    log(`✗ Failed to fetch: ${err.message}`)
    process.exit(1)
  }

  log(`Fetched ${Math.round(html.length / 1024)} KB — parsing specialists…`)

  const doctors = parseSpecialists(html)

  if (doctors.length === 0) {
    const snippet = html.slice(0, 3000)
    log('⚠ No entries parsed. HTML snippet:')
    console.log(snippet)
    process.exit(1)
  }

  writeJson(OUT_FILE, doctors)

  log(`══════════════════════════════════════`)
  log(`Total specialists: ${doctors.length}`)
  log(`With specialty:    ${doctors.filter(d=>d.specialty).length}`)
  log(`With clinic URL:   ${doctors.filter(d=>d.clinicUrl).length}`)
  log(`With photo:        ${doctors.filter(d=>d.photoUrl).length}`)
  log(`Saved to: ${OUT_FILE}`)

  // Print credential breakdown
  const creds = {}
  doctors.forEach(d => { creds[d.credential ?? '(none)'] = (creds[d.credential ?? '(none)']??0)+1 })
  log('Top credentials:')
  Object.entries(creds).sort((a,b)=>b[1]-a[1]).slice(0,8)
    .forEach(([c,n]) => log(`  ${String(c).padEnd(35)} ${n}`))

  log('Sample entries:')
  doctors.slice(0, 5).forEach(d =>
    log(`  ${d.name} | ${d.credential ?? '—'} | ${d.specialty ?? '—'} | ${d.clinicName ?? '—'}`)
  )
}

main().catch(err => { console.error(err); process.exit(1) })
