#!/usr/bin/env node
/**
 * Mobila Doktorn doctor scraper
 *
 * Scrapes mobiladoktorn.se/en/about-us/meet-our-doctors/
 * WordPress site with SSR — all doctor cards in initial HTML.
 *
 * Card structure:
 *   <div class="col-lg-4 px-4 text-center col-md-6 ...">
 *     <img src="photo-url" alt="Name läkare på Mobila Doktorn">
 *     <div>
 *       <h3>Name</h3>
 *       <div>Bio text</div>
 *     </div>
 *   </div>
 *
 * Output: data/mobiladoktorn-doctors.json
 *
 * Usage:
 *   node scripts/scrape-mobiladoktorn.js
 */

'use strict'

const fs   = require('fs')
const path = require('path')

const URL       = 'https://mobiladoktorn.se/en/about-us/meet-our-doctors/'
const DELAY_MS  = parseInt(process.env.DELAY_MS           ?? '3000', 10)
const TIMEOUT_MS = parseInt(process.env.REQUEST_TIMEOUT_MS ?? '30000', 10)
const DATA_DIR  = path.join(__dirname, '..', 'data')
const OUT_FILE  = path.join(DATA_DIR, 'mobiladoktorn-doctors.json')

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
 * Extract doctor cards from the page.
 * Cards sit inside .personal-container > .row > div.col-lg-4
 */
function parseDoctors(html) {
  const doctors = []

  // Find the personal-container section to scope our search
  const containerMatch = /<div[^>]+class="[^"]*personal-container[^"]*"[^>]*>([\s\S]+?)<\/div>\s*<\/div>\s*<\/section/i.exec(html)
  const scope = containerMatch ? containerMatch[1] : html

  // Match each col-lg-4 card block
  const cardRe = /<div[^>]+class="[^"]*col-lg-4[^"]*col-md-6[^"]*"[^>]*>([\s\S]+?)(?=<div[^>]+class="[^"]*col-lg-4[^"]*col-md-6|$)/gi
  let m

  while ((m = cardRe.exec(scope)) !== null) {
    const block = m[1]

    // Extract name from <h3>
    const nameMatch = /<h3[^>]*>([\s\S]+?)<\/h3>/i.exec(block)
    if (!nameMatch) continue
    const name = stripTags(nameMatch[1]).trim()
    if (!name || name.length < 3) continue

    // Extract bio — first <div> after the <h3>
    const afterH3 = block.slice(nameMatch.index + nameMatch[0].length)
    const bioMatch = /<div[^>]*>([\s\S]+?)<\/div>/i.exec(afterH3)
    const bio = bioMatch ? stripTags(bioMatch[1]).trim() : null

    // Extract photo URL from <img src>
    const imgMatch = /<img[^>]+src="([^"]+)"[^>]*>/i.exec(block)
    const photoUrl = imgMatch ? imgMatch[1] : null

    // Try to extract specialty hint from bio (Swedish credential patterns)
    const specialtyMatch = bio?.match(/specialist(?:läkare)?\s+i\s+([\w\s]+?)(?:\s+och|\.|,|$)/i)
      ?? bio?.match(/(?:allmän|intern|barn|psykiatri|kirurgi|onkologi|ortopedi|gynekologi|anestesi|neurologi|dermatologi|urologi|kardiologi)\w*/i)
    const specialty = specialtyMatch ? specialtyMatch[0].trim() : null

    doctors.push({
      source:    'mobiladoktorn',
      name,
      title:     'Läkare',
      specialty,
      bio,
      photoUrl,
      clinicName: 'Mobila Doktorn',
      clinicUrl:  'https://mobiladoktorn.se',
      scrapedAt: new Date().toISOString(),
    })
  }

  return doctors
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  log('═══ Mobila Doktorn scraper ═══')
  log(`Target: ${URL}`)

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  log('Fetching page…')
  await new Promise(r => setTimeout(r, DELAY_MS))

  let html
  try {
    const res = await fetch(URL, {
      signal: controller.signal,
      headers: {
        'Accept':          'text/html',
        'User-Agent':      'Mozilla/5.0 (compatible; doktorkollen-scraper/1.0)',
        'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
      },
    })
    clearTimeout(timer)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    html = await res.text()
  } catch (err) {
    log(`✗ Failed to fetch: ${err.message}`)
    process.exit(1)
  }

  log(`Fetched ${Math.round(html.length / 1024)} KB — parsing doctors…`)

  // Count h3 tags as a sanity check
  const h3Count = (html.match(/<h3/gi) ?? []).length
  log(`h3 tags found in page: ${h3Count}`)

  const doctors = parseDoctors(html)

  if (doctors.length === 0) {
    log('⚠ No entries parsed. Dumping first 3000 chars of body:')
    const bodyMatch = /<body[^>]*>([\s\S]{0,3000})/.exec(html)
    console.log(bodyMatch ? bodyMatch[1] : html.slice(0, 3000))
    process.exit(1)
  }

  writeJson(OUT_FILE, doctors)

  log(`══════════════════════════════════════`)
  log(`Total doctors: ${doctors.length}`)
  log(`With photo:    ${doctors.filter(d=>d.photoUrl).length}`)
  log(`With bio:      ${doctors.filter(d=>d.bio).length}`)
  log(`Saved to: ${OUT_FILE}`)
  log('Sample entries:')
  doctors.slice(0, 5).forEach(d =>
    log(`  ${d.name} | ${d.specialty ?? '—'} | ${d.bio?.slice(0,60) ?? '—'}…`)
  )
}

main().catch(err => { console.error(err); process.exit(1) })
