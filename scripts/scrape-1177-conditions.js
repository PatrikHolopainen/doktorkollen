#!/usr/bin/env node
/**
 * 1177.se conditions scraper
 *
 * Phase 1 — enumerate: parses all child sitemaps from sitemap.xml index,
 *            filters URLs under /sjukdomar--besvar/ with 4+ path segments
 *            (actual condition articles, not category landing pages).
 *
 * Phase 2 — scrape: visits each condition article, extracts:
 *            - title, ingress (from meta description)
 *            - body sections (h2 headings + following paragraphs)
 *            - category / subcategory (from URL)
 *            - JSON-LD author/editor info
 *            - last modified date
 *
 * Output:   data/1177-conditions-raw.json
 * Progress: data/1177-conditions-progress.json
 *
 * Usage:
 *   node scripts/scrape-1177-conditions.js
 *   DELAY_MS=4000 node scripts/scrape-1177-conditions.js
 */

'use strict'

const fs   = require('fs')
const path = require('path')

const BASE_URL       = 'https://www.1177.se'
const DELAY_MS       = parseInt(process.env.DELAY_MS           ?? '6000', 10)
const TIMEOUT_MS     = parseInt(process.env.REQUEST_TIMEOUT_MS ?? '30000', 10)
const DATA_DIR       = path.join(__dirname, '..', 'data')
const RAW_FILE       = path.join(DATA_DIR, '1177-conditions-raw.json')
const URLS_FILE      = path.join(DATA_DIR, '1177-conditions-urls.json')
const PROGRESS_FILE  = path.join(DATA_DIR, '1177-conditions-progress.json')

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
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '').replace(/&[a-z]+;/g, '')
    .replace(/\s+/g, ' ').trim()
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
          'Accept':          'text/html,application/xhtml+xml,application/xml',
          'Accept-Language': 'sv-SE,sv;q=0.9',
          'User-Agent':      'Mozilla/5.0 (compatible; doktorkollen-scraper/1.0)',
        },
      })
      clearTimeout(timer)
      return res
    } catch (err) {
      clearTimeout(timer)
      if (attempt === retries) throw err
      log(`  ⚠ Attempt ${attempt} failed (${err.message}) — retry in ${attempt * 5}s`)
      await new Promise(r => setTimeout(r, attempt * 5000))
    }
  }
}

// ─── Phase 1: enumerate condition URLs by browsing the category hierarchy ────
//
// 1177.se organises conditions as:
//   /sjukdomar--besvar/                         — root (depth 1)
//   /sjukdomar--besvar/{category}/              — category (depth 2)
//   /sjukdomar--besvar/{cat}/{subcat}/          — subcategory (depth 3)
//   /sjukdomar--besvar/{cat}/{sub}/{cond}/      — condition article (depth 4)
//
// We crawl root → categories → subcategories → collect depth-4 condition URLs.

const CONDITIONS_ROOT = `${BASE_URL}/sjukdomar--besvar/`

function extractConditionLinks(html) {
  const urls = new Set()
  const re   = /href="(\/sjukdomar--besvar\/[^"#?]+)"/gi
  let m
  while ((m = re.exec(html)) !== null) {
    urls.add(BASE_URL + m[1])
  }
  return [...urls]
}

function segmentDepth(url) {
  return url.replace(BASE_URL, '').split('/').filter(Boolean).length
}

async function enumConditionUrls() {
  log(`Browsing condition category hierarchy: ${CONDITIONS_ROOT}`)

  const rootRes = await fetchPolite(CONDITIONS_ROOT)
  if (!rootRes.ok) { log(`✗ HTTP ${rootRes.status}`); process.exit(1) }
  const rootHtml = await rootRes.text()

  const categoryUrls = extractConditionLinks(rootHtml).filter(u => segmentDepth(u) === 2)
  log(`Found ${categoryUrls.length} top-level categories`)

  const conditionUrls = new Set()

  for (let ci = 0; ci < categoryUrls.length; ci++) {
    const catUrl = categoryUrls[ci]
    log(`  [${ci+1}/${categoryUrls.length}] ${catUrl.replace(BASE_URL,'')}`)
    try {
      const catRes = await fetchPolite(catUrl)
      if (!catRes.ok) {
        log(`    HTTP ${catRes.status}${catRes.status === 429 ? ' — waiting 30s' : ''}`)
        if (catRes.status === 429) await new Promise(r => setTimeout(r, 30000))
        continue
      }
      const catHtml = await catRes.text()
      const catLinks = extractConditionLinks(catHtml)

      // Depth-3 links may be subcategories OR direct condition articles — collect both
      const depth3 = catLinks.filter(u => segmentDepth(u) === 3 && u.startsWith(catUrl))
      const depth4 = catLinks.filter(u => segmentDepth(u) === 4 && u.startsWith(catUrl))

      // Add depth-3 and depth-4 as candidate condition pages
      depth3.forEach(u => conditionUrls.add(u))
      depth4.forEach(u => conditionUrls.add(u))

      // Also visit each depth-3 page as a potential subcategory listing
      for (const subUrl of depth3) {
        try {
          const subRes = await fetchPolite(subUrl)
          if (!subRes.ok) {
            if (subRes.status === 429) await new Promise(r => setTimeout(r, 20000))
            continue
          }
          const subHtml  = await subRes.text()
          const subLinks = extractConditionLinks(subHtml)
          const conds    = subLinks.filter(u => segmentDepth(u) === 4 && u.startsWith(subUrl))
          conds.forEach(u => conditionUrls.add(u))
          if (conds.length) log(`    ${subUrl.replace(catUrl,'')} → ${conds.length} depth-4`)
        } catch (err) {
          log(`    ✗ subcat: ${err.message}`)
        }
      }
      log(`    running total: ${conditionUrls.size}`)
    } catch (err) {
      log(`  ✗ cat: ${err.message}`)
    }
  }

  return [...conditionUrls]
}

// ─── Phase 2: scrape each condition page ─────────────────────────────────────

function extractJsonLd(html) {
  const results = []
  const re = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]+?)<\/script>/gi
  let m
  while ((m = re.exec(html)) !== null) {
    try { results.push(JSON.parse(m[1])) } catch {}
  }
  return results
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]*)"`, 'i')
  const m = re.exec(html)
  return m ? m[1] : null
}

/**
 * Extract article sections: array of { heading, text }
 * We grab each <h2> and collect all <p> text until the next <h2>.
 */
function extractSections(html) {
  const sections = []

  // Find the main article content area
  const articleMatch = /<article[^>]*>([\s\S]+?)<\/article>/i.exec(html)
    ?? /<main[^>]*>([\s\S]+?)<\/main>/i.exec(html)
  const scope = articleMatch ? articleMatch[1] : html

  // Split by h2 headings
  const parts = scope.split(/<h2[^>]*>/i)
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i]
    const headingEnd = part.indexOf('</h2>')
    if (headingEnd === -1) continue
    const heading = stripTags(part.slice(0, headingEnd))
    const after   = part.slice(headingEnd + 5)

    // Collect paragraphs
    const pRe = /<p[^>]*>([\s\S]+?)<\/p>/gi
    let pMatch
    const paragraphs = []
    while ((pMatch = pRe.exec(after)) !== null) {
      const t = stripTags(pMatch[1])
      if (t.length > 20) paragraphs.push(t)
    }

    if (heading && paragraphs.length > 0) {
      sections.push({ heading, text: paragraphs.join(' ') })
    }
  }

  return sections
}

function parseConditionPage(html, url) {
  const urlParts  = url.replace(BASE_URL + '/sjukdomar--besvar/', '').split('/').filter(Boolean)
  const category  = urlParts[0] ?? null
  const subcat    = urlParts[1] ?? null
  const slug      = urlParts[urlParts.length - 1] ?? null

  // Title
  const h1Match = /<h1[^>]*>([\s\S]+?)<\/h1>/i.exec(html)
  const title   = h1Match ? stripTags(h1Match[1]) : (extractMeta(html, 'og:title') ?? slug)

  // Ingress / lead paragraph
  const ingress = extractMeta(html, 'description') ?? extractMeta(html, 'og:description') ?? null

  // Sections
  const sections = extractSections(html)

  // JSON-LD for metadata
  const jsonLds   = extractJsonLd(html)
  const article   = jsonLds.find(j => j['@type'] === 'Article' || j['@type'] === 'MedicalWebPage')
  const modified  = article?.dateModified ?? extractMeta(html, 'article:modified_time') ?? null
  const authors   = article?.author ? [article.author].flat().map(a => a.name ?? a).filter(Boolean) : []

  return {
    slug,
    url,
    title:    title?.trim() ?? null,
    ingress:  ingress?.trim() ?? null,
    category,
    subcategory: subcat,
    sections,
    authors,
    lastModified: modified,
    source: '1177.se',
    sourceUrl: url,
    scrapedAt: new Date().toISOString(),
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  log('═══ 1177.se conditions scraper ═══')

  // ── Phase 1 ──────────────────────────────────────────────────────────────
  let conditionUrls = readJson(URLS_FILE, null)

  if (!conditionUrls) {
    log('Phase 1: enumerating condition URLs from sitemaps…')
    conditionUrls = await enumConditionUrls()
    writeJson(URLS_FILE, conditionUrls)
    log(`Found ${conditionUrls.length} condition article URLs → saved`)
  } else {
    log(`Phase 1: loaded ${conditionUrls.length} URLs from cache`)
  }

  // ── Phase 2 ──────────────────────────────────────────────────────────────
  const progress   = readJson(PROGRESS_FILE, { done: [], conditions: [] })
  const processed  = new Set(progress.done ?? [])
  let conditions   = progress.conditions ?? []

  const todo = conditionUrls.filter(u => !processed.has(u))
  log(`Phase 2: Already scraped: ${processed.size}  |  Remaining: ${todo.length}`)

  for (let i = 0; i < todo.length; i++) {
    const url = todo[i]
    const pct = (((processed.size + i + 1) / conditionUrls.length) * 100).toFixed(1)

    try {
      const res = await fetchPolite(url)
      if (!res.ok) {
        log(`[${pct}%] HTTP ${res.status} — ${url}`)
        processed.add(url)
        continue
      }
      const html      = await res.text()
      const condition = parseConditionPage(html, url)

      conditions.push(condition)
      processed.add(url)

      const sectCount = condition.sections.length
      log(`[${pct}%] ${condition.title ?? '?'} (${sectCount} sections) — ${condition.category}`)
    } catch (err) {
      log(`[${pct}%] ✗ ${err.message} — ${url}`)
      processed.add(url)
    }

    // Checkpoint every 25
    if ((processed.size % 25) === 0) {
      writeJson(RAW_FILE, conditions)
      writeJson(PROGRESS_FILE, { done: [...processed], conditions })
      log(`  → Checkpoint: ${conditions.length} conditions`)
    }
  }

  // Final save
  writeJson(RAW_FILE, conditions)
  writeJson(PROGRESS_FILE, { done: [...processed], conditions })

  log('══════════════════════════════════════')
  log(`Total conditions: ${conditions.length}`)
  log(`With ingress:     ${conditions.filter(c=>c.ingress).length}`)
  log(`With sections:    ${conditions.filter(c=>c.sections.length>0).length}`)
  log(`Categories:       ${new Set(conditions.map(c=>c.category)).size}`)
  log(`Saved to: ${RAW_FILE}`)

  if (conditions.length > 0) {
    log('Sample:')
    conditions.slice(0, 3).forEach(c =>
      log(`  "${c.title}" | ${c.category} | ${c.sections.length} sections`)
    )
  }
}

main().catch(err => { console.error(err); process.exit(1) })
