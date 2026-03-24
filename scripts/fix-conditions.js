#!/usr/bin/env node
/**
 * Cleans up conditions.json:
 *  - Removes entries that are not medical conditions (Q&A pages, videos, treatment guides, etc.)
 *  - Fixes display titles that are too vague, awkward, or category-like
 */

const fs   = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'data', 'conditions.json')
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'))

// ── Remove entirely ──────────────────────────────────────────────────────────
// These are Q&A articles, video pages, treatment guides, or pages about
// relatives — not actual medical conditions.
const REMOVE = new Set([
  'ar-det-farligt-att-anvanda-lustgas-for-att-bli-berusad', // Q&A article
  'narstaende-vid-cancer',                                   // Support for relatives
  'film-vara-nara-nagon-som-ar-cancersjuk',                  // Video page
  'behandling-vid-diabetes-typ-1',                           // Treatment guide, not a condition
  'rostbehandling',                                          // Treatment therapy, not a condition
  'rensa-nasan-med-koksalt',                                 // Self-care guide
  'nerver',                                                  // Too vague — just "Nerves"
])

// ── Fix display titles ───────────────────────────────────────────────────────
const RENAME = {
  'adhd':                                              'ADHD',
  'als':                                               'ALS',
  'tbe---fastingburen-hjarninflammation':              'TBE (fästingburen hjärninflammation)',
  'neuropsykiatriska-funktionsnedsattningar':          'Neuropsykiatriska funktionsnedsättningar (NPF)',
  'hydrocefalus--att-ha-for-mycket-vatska-i-hjarnan':  'Hydrocefalus',
  'tumorer-och-andra-utvaxter':                        'Tumörer',
  'larande-forstaelse-och-minne':                      'Inlärningssvårigheter och minnesproblem',
  'langvarig-trotthet-och-narkolepsi':                 'Kronisk trötthet och narkolepsi',
  'stroke-och-blodkarl-i-hjarnan':                     'Stroke',
  'hjarnhinneinflammation-och-hjarninflammation':      'Hjärnhinneinflammation (meningit)',
  'skoldkorteln':                                      'Sköldkörtelsjukdom',
  'infektion-och-inflammation':                        'Infektionssjukdomar',
  'nar-barn-och-unga-far-diabetes-typ-1':              'Diabetes typ 1 hos barn och unga',
  'ketoacidos':                                        'Ketoacidos',
  'insulinkanning':                                    'Insulinkänning',
  'konssjukdomar':                                     'Könssjukdomar (STI)',
  'ont-i-slidoppningen':                               'Vulvodyni',
  'prostata':                                          'Prostatabesvär',
  'pung-och-testiklar':                                'Testikelproblem',
  'inflammation-och-infektion-ilungor-och-luftror':    'Lunginfektioner',
  'mun-lappar-och-tunga':                              'Munbesvär',
  'tander':                                            'Tandbesvär',
  'munsar--herpes-runt-munnen':                        'Munsår (herpes)',
  'muskler':                                           'Muskelbesvär',
  'rygg-och-nacke':                                    'Rygg- och nackbesvär',
  'nasa-och-luktsinne':                                'Näsbesvär',
  'benskorhet---osteoporos':                           'Benskörhet (osteoporos)',
  'frusen-skuldra---frusen-axel':                      'Frusen skuldra',
  'ledgangsreumatism---ra':                            'Ledgångsreumatism (RA)',
  'muskelkramp---sendrag':                             'Muskelkramp',
  'bakercysta--svullnad-i-knavecket':                  'Bakercysta',
  'svart-att-svalja--dysfagi':                         'Dysfagi (sväljsvårigheter)',
  'dysartri--svart-att-prata':                         'Dysartri (talsvårigheter)',
  'bakteriell-vaginos--illaluktande-flytning-fran-slidan': 'Bakteriell vaginos',
  'bartolinit--infektion-i-slidoppningen':             'Bartolinit',
  'infektioner-i-oron-nasa-och-hals':                  'Infektioner i öron, näsa och hals',
  'infektioner-i-skelett-leder-och-muskler':           'Infektioner i skelett och leder',
  'demens---alzheimers-sjukdom':                       'Alzheimers sjukdom',
}

const before = data.length
const cleaned = data
  .filter(c => !REMOVE.has(c.slug))
  .map(c => {
    if (RENAME[c.slug]) return { ...c, title: RENAME[c.slug] }
    return c
  })

fs.writeFileSync(filePath, JSON.stringify(cleaned, null, 2))
console.log(`Removed ${before - cleaned.length} entries, renamed ${Object.keys(RENAME).length}.`)
console.log(`Total conditions: ${cleaned.length}`)
cleaned.forEach((c, i) => console.log(`  ${i+1}. ${c.title}`))
