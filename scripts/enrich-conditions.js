#!/usr/bin/env node
/**
 * Condition enricher
 *
 * Reads data/1177-conditions-raw.json and for each condition:
 *  1. Generates a clean Swedish description (paraphrased from 1177 content)
 *  2. Extracts a structured symptom list
 *  3. Maps the condition to relevant medical specialties
 *  4. Produces a "when to seek care" sentence
 *
 * Uses the Anthropic Claude API (claude-haiku-4-5 for cost efficiency).
 *
 * Output:   data/conditions.json
 * Progress: data/conditions-enrich-progress.json
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node scripts/enrich-conditions.js
 *   DELAY_MS=1000 node scripts/enrich-conditions.js
 */

'use strict'

const fs   = require('fs')
const path = require('path')

const OpenAI = require('openai')
const dotenv = require('dotenv')

dotenv.config({ path: path.join(__dirname, '.env') })

const DELAY_MS       = parseInt(process.env.DELAY_MS ?? '500', 10)
const DATA_DIR       = path.join(__dirname, '..', 'data')
const RAW_FILE       = path.join(DATA_DIR, '1177-conditions-raw.json')
const OUT_FILE       = path.join(DATA_DIR, 'conditions.json')
const PROGRESS_FILE  = path.join(DATA_DIR, 'conditions-enrich-progress.json')

// ─── Specialty mapping by URL category ───────────────────────────────────────
// Provides a reliable base mapping; Claude refines per-condition.
const CATEGORY_SPECIALTIES = {
  'lungor-och-luftvagar':           ['Lungmedicin', 'Allmänmedicin'],
  'hjarta-och-blodkarl':            ['Kardiologi', 'Internmedicin'],
  'ben-och-leder':                  ['Ortopedi', 'Reumatologi', 'Fysioterapi'],
  'ogon':                           ['Oftalmologi'],
  'oron-nasa-och-hals':             ['ÖNH-specialist', 'Audiologi'],
  'mag-och-tarmkanalen':            ['Gastroenterologi', 'Kirurgi', 'Internmedicin'],
  'hud-har-och-naglar':             ['Dermatologi'],
  'psykisk-halsa':                  ['Psykiatri', 'Psykologi', 'Allmänmedicin'],
  'hormon-och-matabolism':          ['Endokrinologi', 'Internmedicin'],
  'infektioner':                    ['Infektionsmedicin', 'Allmänmedicin'],
  'cancer':                         ['Onkologi', 'Kirurgi'],
  'njurar-och-urinvagar':           ['Urologi', 'Nefrologi', 'Internmedicin'],
  'nervsystemet':                   ['Neurologi'],
  'mun-och-tander':                 ['Tandläkare'],
  'graviditet-och-forlossning':     ['Gynekologi', 'Obstetrik', 'Barnmorska'],
  'forlossningsskador-och-gynekologiska-besvar': ['Gynekologi'],
  'barn':                           ['Barnläkare', 'Pediatrik', 'Allmänmedicin'],
  'blodet-och-immunsystemet':       ['Hematologi', 'Immunologi', 'Internmedicin'],
  'rodelse-och-amning':             ['Barnmorska', 'Neonatologi'],
  'skelett-leder-och-muskler':      ['Ortopedi', 'Reumatologi', 'Fysioterapi'],
  'rorelseorganen':                 ['Ortopedi', 'Reumatologi', 'Fysioterapi'],
  'vard-och-behandling':            ['Allmänmedicin'],
  'hjarna-och-nerver':              ['Neurologi', 'Neurokirurgi'],
  'diabetes':                       ['Endokrinologi', 'Allmänmedicin', 'Diabetesmottagning'],
  'allergier':                      ['Allergi', 'Immunologi', 'Allmänmedicin'],
}

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

function buildSourceText(condition) {
  const parts = []
  if (condition.ingress) parts.push(condition.ingress)
  for (const s of (condition.sections ?? []).slice(0, 5)) {
    parts.push(`## ${s.heading}\n${s.text}`)
  }
  return parts.join('\n\n').slice(0, 3000)
}

function categorySpecialties(category) {
  if (!category) return ['Allmänmedicin']
  for (const [key, specs] of Object.entries(CATEGORY_SPECIALTIES)) {
    if (category.includes(key) || key.includes(category)) return specs
  }
  return ['Allmänmedicin']
}

async function enrichCondition(client, condition) {
  const sourceText = buildSourceText(condition)
  if (!sourceText || sourceText.length < 50) return null

  const baseSpecialties = categorySpecialties(condition.category)

  const prompt = `Du är en medicinsk redaktör för en svensk vårdguide. Nedan finns information om en medicinsk åkomma från 1177.se.

Din uppgift är att returnera ett JSON-objekt med följande fält:
- "description": En lättläst beskrivning på svenska (2-4 meningar). Omformulera texten med egna ord men bevara fakta. Citera ALDRIG texten ordagrant.
- "symptoms": En array med 3-6 vanliga symtom (korta fraser på svenska, t.ex. "huvudvärk", "trötthet")
- "treatments": En array med 2-5 behandlingsalternativ (korta fraser på svenska, t.ex. "Läkemedelsbehandling", "Fysioterapi")
- "whenToSeekCare": En kort mening om när man bör söka vård (på svenska)
- "specialties": En array med 1-4 relevanta medicinska specialiteter på svenska (välj de mest relevanta från listan nedan och lägg till andra om lämpligt)

Tillgängliga specialiteter att prioritera: ${baseSpecialties.join(', ')}
Andra vanliga: Allmänmedicin, Kirurgi, Internmedicin, Neurologi, Psykiatri, Kardiologi, Ortopedi, Gynekologi, Pediatrik, Onkologi, Dermatologi, Urologi, Gastroenterologi, Reumatologi, Fysioterapi, Psykologi

Åkomma: ${condition.title}
Kategori: ${condition.category ?? 'okänd'}

Källtext från 1177.se:
${sourceText}

Returnera ENBART ett giltigt JSON-objekt, inget annat.`

  const response = await client.chat.completions.create({
    model:    'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 600,
  })

  const text = response.choices[0]?.message?.content ?? ''
  const jsonMatch = /\{[\s\S]+\}/.exec(text)
  if (!jsonMatch) throw new Error(`No JSON in response: ${text.slice(0, 200)}`)

  const enriched = JSON.parse(jsonMatch[0])
  return enriched
}

async function main() {
  const apiKey = process.env.OPENAI_KEY
  if (!apiKey) {
    log('✗ OPENAI_KEY not set (check scripts/.env)')
    process.exit(1)
  }

  const client = new OpenAI({ apiKey })

  const raw = readJson(RAW_FILE, null)
  if (!raw || raw.length === 0) {
    log(`✗ No raw conditions found at ${RAW_FILE}`)
    log('  Run scrape-1177-conditions.js first')
    process.exit(1)
  }

  log('═══ Condition enricher ═══')
  log(`Loaded ${raw.length} raw conditions`)

  const progress  = readJson(PROGRESS_FILE, { done: [], conditions: [] })
  const processed = new Set(progress.done ?? [])
  let conditions  = progress.conditions ?? []

  const todo = raw.filter(c => c.slug && !processed.has(c.slug))
  log(`Already enriched: ${processed.size}  |  Remaining: ${todo.length}`)

  for (let i = 0; i < todo.length; i++) {
    const raw_c = todo[i]
    const pct   = (((processed.size + i + 1) / raw.length) * 100).toFixed(1)

    await new Promise(r => setTimeout(r, DELAY_MS))

    try {
      const enriched = await enrichCondition(client, raw_c)

      if (!enriched) {
        log(`[${pct}%]  —  ${raw_c.title} (no content)`)
        processed.add(raw_c.slug)
        continue
      }

      conditions.push({
        slug:          raw_c.slug,
        url:           raw_c.url,
        title:         raw_c.title,
        category:      raw_c.category,
        subcategory:   raw_c.subcategory,
        description:   enriched.description ?? null,
        symptoms:      enriched.symptoms ?? [],
        treatments:    enriched.treatments ?? [],
        whenToSeekCare: enriched.whenToSeekCare ?? null,
        specialties:   enriched.specialties ?? categorySpecialties(raw_c.category),
        // Original sections kept for reference
        ingress:       raw_c.ingress,
        source:        '1177.se',
        sourceUrl:     raw_c.url,
        authors:       raw_c.authors,
        lastModified:  raw_c.lastModified,
        enrichedAt:    new Date().toISOString(),
      })
      processed.add(raw_c.slug)

      const specs = (enriched.specialties ?? []).slice(0,2).join(', ')
      log(`[${pct}%] ${raw_c.title} → ${specs}`)
    } catch (err) {
      log(`[${pct}%] ✗ ${err.message} — ${raw_c.title}`)
      processed.add(raw_c.slug)
    }

    // Checkpoint every 50
    if ((processed.size % 50) === 0) {
      writeJson(OUT_FILE, conditions)
      writeJson(PROGRESS_FILE, { done: [...processed], conditions })
      log(`  → Checkpoint: ${conditions.length} conditions`)
    }
  }

  writeJson(OUT_FILE, conditions)
  writeJson(PROGRESS_FILE, { done: [...processed], conditions })

  log('══════════════════════════════════════')
  log(`Total enriched: ${conditions.length}`)
  log(`With symptoms:  ${conditions.filter(c=>c.symptoms?.length>0).length}`)
  log(`Specialties coverage:`)
  const specCount = {}
  conditions.forEach(c => (c.specialties??[]).forEach(s => { specCount[s] = (specCount[s]??0)+1 }))
  Object.entries(specCount).sort((a,b)=>b[1]-a[1]).slice(0,10)
    .forEach(([s,n]) => log(`  ${s.padEnd(30)} ${n}`))
  log(`Saved to: ${OUT_FILE}`)
}

main().catch(err => { console.error(err); process.exit(1) })
