import type { Service, Condition, Professional, Clinic, City } from './types'

export const services: Service[] = [
  {
    id: 'svc-1',
    slug: 'psykologi',
    name: 'Psykologi',
    description: 'Psykologisk bedömning, samtalsterapi och psykoterapeutisk behandling.',
    longDescription:
      'Psykologer erbjuder professionell hjälp vid psykisk ohälsa, livskriser och personlig utveckling. Genom samtal och evidensbaserade metoder som KBT, ACT och psykodynamisk terapi arbetar vi med att förbättra ditt välmående och livskvalitet. Vi erbjuder bedömning, utredning och behandling av psykiska tillstånd.',
    icon: 'Brain',
    specialties: ['KBT', 'ACT', 'Psykodynamisk terapi', 'Traumabehandling', 'Utredning'],
  },
  {
    id: 'svc-2',
    slug: 'fysioterapi',
    name: 'Fysioterapi',
    description: 'Rehabilitering, smärtbehandling och rörelseträning för optimal funktion.',
    longDescription:
      'Fysioterapeuter hjälper dig att återfå rörlighet och funktion efter skada eller operation. Vi arbetar med manuell behandling, träningsprogram och smärthantering. Oavsett om du lider av ryggsmärta, idrottsskador eller kroniska besvär kan vi hjälpa dig tillbaka till ett aktivt liv.',
    icon: 'Activity',
    specialties: ['Manuell terapi', 'Idrottsskador', 'Ryggrehab', 'Postoperativ rehabilitering'],
  },
  {
    id: 'svc-3',
    slug: 'kardiologi',
    name: 'Kardiologi',
    description: 'Utredning och behandling av hjärt- och kärlsjukdomar.',
    longDescription:
      'Kardiologer är specialister på hjärt- och kärlsjukdomar. Vi erbjuder utredning med EKG, ekokardiografi och belastningstest samt behandling av tillstånd som förmaksflimmer, hjärtsvikt och kranskärlssjukdom. Tidig diagnos och rätt behandling kan rädda liv.',
    icon: 'Heart',
    specialties: ['EKG', 'Ekokardiografi', 'Förmaksflimmer', 'Hjärtsvikt', 'Preventiv kardiologi'],
  },
  {
    id: 'svc-4',
    slug: 'dermatologi',
    name: 'Dermatologi',
    description: 'Hudsjukdomar, hudcancerscreening och estetisk dermatologi.',
    longDescription:
      'Dermatologer diagnostiserar och behandlar hudsjukdomar av alla slag. Vi erbjuder undersökning av hudförändringar, behandling av eksem, psoriasis och akne, samt hudcancerscreening. Estetisk dermatologi inkluderar behandlingar för att förbättra hudens utseende och textur.',
    icon: 'Scan',
    specialties: ['Hudcancer', 'Eksem', 'Psoriasis', 'Akne', 'Estetisk behandling'],
  },
  {
    id: 'svc-5',
    slug: 'ortopedi',
    name: 'Ortopedi',
    description: 'Behandling av skelett-, led- och muskelskador samt ortopedisk kirurgi.',
    longDescription:
      'Ortopeder specialiserar sig på rörelseapparatens sjukdomar och skador. Vi behandlar frakturer, ledproblem, ryggradsbesvär och sportskorskador. Behandlingsalternativen inkluderar konservativ behandling, fysioterapi och kirurgiska ingrepp som höft- och knäproteser.',
    icon: 'Bone',
    specialties: ['Frakturer', 'Ledproteser', 'Ryggkirurgi', 'Idrottsskador', 'Artroskopi'],
  },
  {
    id: 'svc-6',
    slug: 'gynekologi',
    name: 'Gynekologi',
    description: 'Kvinnohälsa, reproduktiv medicin och gynekologiska undersökningar.',
    longDescription:
      'Gynekologer tar hand om kvinnors reproduktiva och sexuella hälsa. Vi erbjuder gynekologiska undersökningar, cellprovskontroller, preventivmedelsrådgivning och utredning av menstruationsproblem. Vi behandlar även tillstånd som endometrios, myom och klimakteriebesvär.',
    icon: 'Users',
    specialties: ['Preventivmedel', 'Endometrios', 'Klimakterium', 'Cellprovskontroll', 'Graviditet'],
  },
  {
    id: 'svc-7',
    slug: 'neurologi',
    name: 'Neurologi',
    description: 'Utredning och behandling av sjukdomar i nervsystemet.',
    longDescription:
      'Neurologer utreder och behandlar sjukdomar i hjärna, ryggmärg och nerver. Vanliga tillstånd vi hanterar inkluderar migrän, epilepsi, MS, Parkinsons sjukdom och stroke. Modern neurologi kombinerar avancerad diagnostik med effektiva behandlingsmetoder för att förbättra patienters livskvalitet.',
    icon: 'Zap',
    specialties: ['Migrän', 'Epilepsi', 'MS', 'Parkinsons', 'Strokerehab'],
  },
  {
    id: 'svc-8',
    slug: 'allmänmedicin',
    name: 'Allmänmedicin',
    description: 'Primärvård och förebyggande hälsovård för hela familjen.',
    longDescription:
      'Allmänläkare är din första kontakt med sjukvården och hanterar ett brett spektrum av hälsoproblem. Vi erbjuder hälsokontroller, vaccinationer, behandling av akuta sjukdomar och långsiktig uppföljning av kroniska tillstånd. Vi samordnar vården och remitterar vid behov till specialister.',
    icon: 'Stethoscope',
    specialties: ['Hälsokontroll', 'Vaccination', 'Kroniska sjukdomar', 'Preventiv hälsovård'],
  },
]

export const conditions: Condition[] = [
  {
    id: 'cond-1',
    slug: 'depression',
    name: 'Depression',
    description: 'Depression är ett vanligt psykiskt tillstånd som påverkar humör, tankar och vardag.',
    symptoms: [
      'Nedstämdhet och tomhetskänsla',
      'Minskad lust och glädje för aktiviteter',
      'Sömnproblem (sömnlöshet eller för mycket sömn)',
      'Trötthet och energibrist',
      'Koncentrationssvårigheter',
      'Förändrad aptit och vikt',
      'Känsla av värdelöshet eller överdrivet skuldkänslor',
      'Tankar på döden eller självmord',
    ],
    treatments: [
      'Psykoterapi (KBT, psykodynamisk terapi)',
      'Antidepressiva läkemedel (SSRI, SNRI)',
      'Kombinationsbehandling med terapi och läkemedel',
      'Ljusterapi (särskilt vid årstidsbunden depression)',
      'Regelbunden fysisk aktivitet',
      'Sömnhygien och livsstilsförändringar',
      'ECT (elektrokonvulsiv terapi) vid svår depression',
    ],
    whenToVisit:
      'Sök vård om du känt dig nedstämd i mer än två veckor, har svårt att klara vardagen, eller om du har tankar på att skada dig själv. Ring 1177 för rådgivning eller 112 vid akut fara.',
    faq: [
      {
        question: 'Är depression en svaghet?',
        answer:
          'Nej, depression är en medicinsk sjukdom precis som diabetes eller hjärtsjukdom. Det handlar om obalanser i hjärnans kemi och är inte ett tecken på svaghet. Att söka hjälp är ett tecken på styrka.',
      },
      {
        question: 'Hur lång tid tar det att bli bättre?',
        answer:
          'Det varierar beroende på individ och behandlingsmetod. Läkemedel tar ofta 4–6 veckor innan full effekt märks. Psykoterapi visar ofta resultat efter 8–16 sessioner. Många mår bättre inom några månader.',
      },
      {
        question: 'Kan depression återkomma?',
        answer:
          'Ja, depression kan återkomma. Ungefär hälften av de som haft en depressionsperiod får en ny. Regelbunden uppföljning, hantering av stressfaktorer och ibland underhållsbehandling kan minska risken för återfall.',
      },
    ],
    relatedServices: ['svc-1', 'svc-8'],
  },
  {
    id: 'cond-2',
    slug: 'ryggsmärta',
    name: 'Ryggsmärta',
    description: 'Ryggsmärta är ett av de vanligaste hälsoproblemen och kan ha många olika orsaker.',
    symptoms: [
      'Smärta i nedre rygg, mittrygg eller nacke',
      'Stelhet och begränsad rörlighet',
      'Smärta som strålar ner i benet (ischias)',
      'Muskelspänningar och kramp',
      'Domningar eller stickningar',
      'Smärta som förvärras vid rörelse eller stillasittande',
    ],
    treatments: [
      'Fysioterapi och rörelseövningar',
      'Smärtstillande och antiinflammatoriska läkemedel',
      'Manuell terapi och massage',
      'Akupunktur',
      'Värmeterapi och kylbehandling',
      'Injektioner (kortison, nervblock)',
      'Kirurgi (i sällsynta fall vid diskbråck eller spinal stenos)',
    ],
    whenToVisit:
      'Sök vård omedelbart om du har blås- eller tarmstörningar, domningar i intimregionen, stark smärta efter fall eller olycka, eller feber i kombination med ryggsmärta. Sök vård inom några dagar om smärtan inte förbättras med egenvård.',
    faq: [
      {
        question: 'Behöver jag vila vid ryggsmärta?',
        answer:
          'Kortsiktig vila kan hjälpa vid akut smärta, men långvarig sängvila rekommenderas inte. Lätt rörelse och anpassad aktivitet är oftast bättre för läkning än total vila.',
      },
      {
        question: 'Vad är ischias?',
        answer:
          'Ischias innebär att ischiasnerven (den stora nerven i benet) är irriterad eller klämd, ofta av ett diskbråck. Det ger smärta, domningar eller stickningar längs nerven från ryggen ner i benet.',
      },
      {
        question: 'Hjälper naprapati och kiropraktik?',
        answer:
          'Många patienter upplever lindring med manuell behandling som naprapati eller kiropraktik. Vetenskapliga studier visar måttlig effekt för akut ryggsmärta. Det är viktigt att konsultera en läkare först för att utesluta allvarligare orsaker.',
      },
    ],
    relatedServices: ['svc-2', 'svc-5'],
  },
  {
    id: 'cond-3',
    slug: 'hypertoni',
    name: 'Högt blodtryck (Hypertoni)',
    description: 'Hypertoni är ett kroniskt tillstånd med förhöjt blodtryck som ökar risken för hjärt-kärlsjukdom.',
    symptoms: [
      'Ofta inga symptom (kallas "tyst sjukdom")',
      'Huvudvärk (särskilt vid mycket högt tryck)',
      'Yrsel',
      'Synstörningar',
      'Näsblod',
      'Andningssvårigheter',
    ],
    treatments: [
      'Livsstilsförändringar (kost, motion, viktnedgång)',
      'Minskat saltintag',
      'Alkoholreduktion och rökstopp',
      'Antihypertensiva läkemedel (ACE-hämmare, betablockerare, diuretika)',
      'Regelbunden blodtryckskontroll',
    ],
    whenToVisit:
      'Kontrollera ditt blodtryck regelbundet. Sök akut vård om blodtrycket är extremt högt (över 180/120), om du har bröstsmärta, andningssvårigheter eller neurologiska symptom.',
    faq: [
      {
        question: 'Vad är normalt blodtryck?',
        answer:
          'Normalt blodtryck ligger under 130/80 mmHg. Blodtryck mellan 130–139/80–89 räknas som förhöjt. Hypertoni grad 1 är 140–159/90–99 och grad 2 är 160/100 eller högre.',
      },
      {
        question: 'Måste jag ta medicin hela livet?',
        answer:
          'Det beror på din situation. Mild hypertoni kan ibland behandlas enbart med livsstilsförändringar. Men många behöver långsiktig medicinering. Sluta aldrig med medicinen utan att tala med din läkare.',
      },
    ],
    relatedServices: ['svc-3', 'svc-8'],
  },
  {
    id: 'cond-4',
    slug: 'eksem',
    name: 'Eksem',
    description: 'Eksem är en inflammatorisk hudsjukdom som orsakar klåda, rodnad och hudutslag.',
    symptoms: [
      'Intensiv klåda',
      'Röd, inflammerad hud',
      'Torra och spruckna hudpartier',
      'Vätskande sår och krustabildning',
      'Förtjockad och läderaktig hud vid kroniskt eksem',
      'Fjällning',
    ],
    treatments: [
      'Mjukgörande krämer och lotion',
      'Kortisonsalvor (mild till måttlig styrka)',
      'Starka kortisonpreparat för svåra fall',
      'Immunhämmande läkemedel (takrolimus, pimekrolimus)',
      'Biologiska läkemedel (dupilumab) vid svårt eksem',
      'Undvikande av utlösande faktorer',
      'Antihistaminer mot klåda',
    ],
    whenToVisit:
      'Sök vård om eksemet inte förbättras med receptfria medel, om du misstänker infektion (vätska, smärta, feber), eller om det påverkar din sömn och vardag allvarligt.',
    faq: [
      {
        question: 'Är eksem smittsamt?',
        answer:
          'Nej, eksem är inte smittsamt. Det är en inflammatorisk hudsjukdom som ofta har genetiska faktorer och kan förvärras av allergener och irritanter i miljön.',
      },
      {
        question: 'Försvinner eksem av sig självt?',
        answer:
          'Atopiskt eksem (barneksem) försvinner ofta i vuxen ålder, men många vuxna har kvar besvären. Kontakteksem kan läka om man undviker det ämne som orsakar reaktionen.',
      },
    ],
    relatedServices: ['svc-4', 'svc-8'],
  },
  {
    id: 'cond-5',
    slug: 'angest',
    name: 'Ångest',
    description: 'Ångest är en normal reaktion på stress men kan bli ett problem när den är konstant eller oproportionerlig.',
    symptoms: [
      'Konstant oro och rädsla',
      'Hjärtklappning och snabb puls',
      'Svettningar och darrningar',
      'Andningssvårigheter',
      'Illamående och magbesvär',
      'Sömnproblem',
      'Koncentrationssvårigheter',
      'Undvikandebeteende',
    ],
    treatments: [
      'Kognitiv beteendeterapi (KBT)',
      'Exponeringsbehandling',
      'SSRI och SNRI-läkemedel',
      'Mindfulness och avslappningstekniker',
      'Regelbunden motion',
      'Sömnhygien',
      'Stresshantering',
    ],
    whenToVisit:
      'Sök hjälp om ångesten hindrar dig från att leva ett normalt liv, om du undviker aktiviteter du annars tycker om, eller om du upplever panikattacker regelbundet.',
    faq: [
      {
        question: 'Vad är skillnaden mellan oro och ångest?',
        answer:
          'Oro är oftast kopplad till ett specifikt problem och kan vara hjälpsam. Ångest är mer diffus, ofta starkare och kan uppstå utan tydlig orsak. Ångestsyndrom innebär att ångesten är så stark att den stör dagliga aktiviteter.',
      },
      {
        question: 'Kan man ha ångest utan att veta det?',
        answer:
          'Ja, ångest kan yttra sig som fysiska symptom som hjärtklappning, magbesvär eller trötthet utan att man kopplar det till ångest. Många söker vård för fysiska symptom och upptäcker sedan att ångesten är den bakomliggande orsaken.',
      },
    ],
    relatedServices: ['svc-1', 'svc-8'],
  },
  {
    id: 'cond-6',
    slug: 'migrän',
    name: 'Migrän',
    description: 'Migrän är en neurologisk sjukdom med återkommande svåra huvudvärksattacker.',
    symptoms: [
      'Pulserande, ensidig huvudvärk',
      'Illamående och kräkningar',
      'Ljus- och ljudkänslighet',
      'Aura (synstörningar, stickningar) hos vissa',
      'Attacker som varar 4–72 timmar',
      'Trötthet efter attacken',
    ],
    treatments: [
      'Triptaner (sumatriptan, rizatriptan) mot akuta attacker',
      'NSAID och paracetamol',
      'Förebyggande behandling (betablockerare, amitriptylin, topiramat)',
      'CGRP-hämmare (nyare biologiska läkemedel)',
      'Livsförändringar och undvikande av triggers',
      'Biofeedback och stresshantering',
    ],
    whenToVisit:
      'Sök vård om du har migrän mer än 4 dagar per månad, om din vanliga behandling inte hjälper, eller om du upplever ny typ av huvudvärk eller neurologiska symptom.',
    faq: [
      {
        question: 'Vad utlöser migrän?',
        answer:
          'Vanliga triggers inkluderar stress, sömnbrist, hormonella förändringar, alkohol (särskilt rödvin), vissa livsmedel, starkt ljus och starka dofter. Triggers varierar mellan individer.',
      },
      {
        question: 'Är migrän ärftligt?',
        answer:
          'Ja, migrän har en stark genetisk komponent. Om en förälder har migrän är risken 50% att barnet också drabbas. Om båda föräldrarna har migrän stiger risken till 75%.',
      },
    ],
    relatedServices: ['svc-7', 'svc-8'],
  },
  {
    id: 'cond-7',
    slug: 'diabetes-typ-2',
    name: 'Diabetes typ 2',
    description: 'Diabetes typ 2 är en kronisk sjukdom där kroppen inte kan reglera blodsockret normalt.',
    symptoms: [
      'Ökad törst och urinering',
      'Trötthet och orkeslöshet',
      'Suddigt synfält',
      'Långsam sårläkning',
      'Återkommande infektioner',
      'Stickningar eller domningar i händer och fötter',
      'Ofta inga symptom i tidigt skede',
    ],
    treatments: [
      'Livsstilsförändringar (kost och motion)',
      'Metformin (förstahandsbehandling)',
      'GLP-1-agonister (semaglutid, liraglutid)',
      'SGLT2-hämmare',
      'Insulin vid behov',
      'Regelbunden monitorering av blodsocker och HbA1c',
      'Behandling av riskfaktorer (blodtryck, kolesterol)',
    ],
    whenToVisit:
      'Sök vård om du har symptom på högt blodsocker, riskfaktorer som övervikt och ärftlighet, eller om du är över 45 år och inte testat ditt blodsocker på länge.',
    faq: [
      {
        question: 'Kan man bli av med diabetes typ 2?',
        answer:
          'Ja, det är möjligt att uppnå remission med betydande viktnedgång och livsstilsförändringar. Tidig diagnos och aktivt arbete med vikt och kost kan i vissa fall normalisera blodsockret.',
      },
      {
        question: 'Vad är skillnaden mot typ 1?',
        answer:
          'Typ 1 är en autoimmun sjukdom där kroppen förstör de insulinproducerande cellerna och kräver livslång insulinbehandling. Typ 2 är ofta kopplad till livsstil och ålder, och kan ofta behandlas med kost och tabletter.',
      },
    ],
    relatedServices: ['svc-8', 'svc-3'],
  },
  {
    id: 'cond-8',
    slug: 'knäartros',
    name: 'Knäartros',
    description: 'Knäartros är en degenerativ ledsjukdom där brosket i knäleden bryts ned.',
    symptoms: [
      'Smärta i knäet, särskilt vid belastning',
      'Stelhet på morgonen eller efter vila',
      'Svullnad och ömhet',
      'Knastrande eller knakande ljud vid rörelse',
      'Begränsad rörelseförmåga',
      'Känsla av instabilitet i knäet',
    ],
    treatments: [
      'Smärtstillande läkemedel (paracetamol, NSAID)',
      'Fysioterapi och styrketräning',
      'Viktnedgång för att minska belastning',
      'Kortisoninjektioner',
      'Hyaluronsyrainjektioner',
      'Knäprotekirurgi vid svåra fall',
      'Ortoser och hjälpmedel',
    ],
    whenToVisit:
      'Sök vård om knäsmärtan påverkar din rörelseförmåga och livskvalitet, om smärtan uppkommer även i vila, eller om svullnad och värme i leden inte ger med sig.',
    faq: [
      {
        question: 'Kan träning skada knäet mer?',
        answer:
          'Rätt träning stärker faktiskt musklerna runt knäet och minskar belastningen. Lågbelastande träning som simning och cykling rekommenderas. Undvik hög stöt belastning om du har svår artros.',
      },
      {
        question: 'Hur länge håller en knäprotes?',
        answer:
          'Moderna knäproteser håller i genomsnitt 15–25 år. Yngre och mer aktiva patienter kan behöva revision efter kortare tid. De flesta patienter är mycket nöjda med resultatet.',
      },
    ],
    relatedServices: ['svc-5', 'svc-2'],
  },
]

export const cities: City[] = [
  { slug: 'stockholm', name: 'Stockholm', lat: 59.3293, lng: 18.0686 },
  { slug: 'goteborg', name: 'Göteborg', lat: 57.7089, lng: 11.9746 },
  { slug: 'malmo', name: 'Malmö', lat: 55.6050, lng: 13.0038 },
  { slug: 'uppsala', name: 'Uppsala', lat: 59.8586, lng: 17.6389 },
  { slug: 'linkoping', name: 'Linköping', lat: 58.4108, lng: 15.6214 },
  { slug: 'vasteras', name: 'Västerås', lat: 59.6099, lng: 16.5448 },
]

export const professionals: Professional[] = [
  {
    id: 'pro-1',
    slug: 'anna-lindqvist',
    name: 'Anna Lindqvist',
    title: 'Leg. Psykolog',
    specialties: ['KBT', 'Ångest', 'Depression', 'Stresshantering'],
    clinicIds: ['clin-1'],
    citySlug: 'stockholm',
    city: 'Stockholm',
    introduction:
      'Jag är legitimerad psykolog med över 10 års erfarenhet av kognitiv beteendeterapi. Jag arbetar framför allt med ångest, depression och stressrelaterade problem. Mitt mål är att du ska få konkreta verktyg för att hantera dina besvär och förbättra din livskvalitet.',
    bookingUrl: 'https://doktorkollen.com/boka/anna-lindqvist',
    lat: 59.3350,
    lng: 18.0710,
    conditionIds: ['cond-1', 'cond-5'],
    serviceIds: ['svc-1'],
  },
  {
    id: 'pro-2',
    slug: 'erik-svensson',
    name: 'Erik Svensson',
    title: 'Leg. Fysioterapeut',
    specialties: ['Ryggrehab', 'Idrottsskador', 'Manuell terapi'],
    clinicIds: ['clin-1', 'clin-2'],
    citySlug: 'stockholm',
    city: 'Stockholm',
    introduction:
      'Legitimerad fysioterapeut med specialisering i rygg- och nackbesvär samt idrottsskador. Jag använder en kombination av manuell terapi och individanpassade träningsprogram för att hjälpa mina patienter tillbaka till ett aktivt liv.',
    bookingUrl: 'https://doktorkollen.com/boka/erik-svensson',
    lat: 59.3280,
    lng: 18.0590,
    conditionIds: ['cond-2', 'cond-8'],
    serviceIds: ['svc-2'],
  },
  {
    id: 'pro-3',
    slug: 'maria-berg',
    name: 'Maria Berg',
    title: 'Specialist i kardiologi',
    specialties: ['Förmaksflimmer', 'Hjärtsvikt', 'Preventiv kardiologi'],
    clinicIds: ['clin-2'],
    citySlug: 'goteborg',
    city: 'Göteborg',
    introduction:
      'Jag är hjärtläkare med 15 års erfarenhet och specialiserad kompetens inom förmaksflimmer och hjärtsvikt. Jag brinner för preventiv kardiologi och hjälper mina patienter att minska sin risk för hjärt-kärlsjukdom genom livsstilsförändringar och rätt medicinering.',
    bookingUrl: 'https://doktorkollen.com/boka/maria-berg',
    lat: 57.7150,
    lng: 11.9800,
    conditionIds: ['cond-3'],
    serviceIds: ['svc-3'],
  },
  {
    id: 'pro-4',
    slug: 'jonas-karlsson',
    name: 'Jonas Karlsson',
    title: 'Leg. Dermatolog',
    specialties: ['Eksem', 'Psoriasis', 'Hudcancer', 'Akne'],
    clinicIds: ['clin-3'],
    citySlug: 'malmo',
    city: 'Malmö',
    introduction:
      'Legitimerad läkare med specialistutbildning i dermatologi. Jag behandlar alla typer av hudsjukdomar och har särskild erfarenhet av atopiskt eksem och psoriasis. Jag erbjuder även hudcancerscreening och dermatoskopi.',
    bookingUrl: 'https://doktorkollen.com/boka/jonas-karlsson',
    lat: 55.6100,
    lng: 13.0100,
    conditionIds: ['cond-4'],
    serviceIds: ['svc-4'],
  },
  {
    id: 'pro-5',
    slug: 'sofia-nilsson',
    name: 'Sofia Nilsson',
    title: 'Specialist i ortopedi',
    specialties: ['Knäkirurgi', 'Höftproteser', 'Idrottsskador'],
    clinicIds: ['clin-3'],
    citySlug: 'malmo',
    city: 'Malmö',
    introduction:
      'Ortopedspecialist med fokus på knä- och höftkirurgi. Jag utför artroskopier, ledprotesoperationer och behandlar idrottsskador. Min filosofi är att alltid prova konservativ behandling först och operera endast när det är nödvändigt.',
    bookingUrl: 'https://doktorkollen.com/boka/sofia-nilsson',
    lat: 55.6000,
    lng: 12.9950,
    conditionIds: ['cond-8', 'cond-2'],
    serviceIds: ['svc-5'],
  },
  {
    id: 'pro-6',
    slug: 'lars-andersson',
    name: 'Lars Andersson',
    title: 'Specialist i neurologi',
    specialties: ['Migrän', 'Epilepsi', 'Parkinsons sjukdom'],
    clinicIds: ['clin-4'],
    citySlug: 'uppsala',
    city: 'Uppsala',
    introduction:
      'Neurologspecialist med bred erfarenhet av hjärn- och nervsystemets sjukdomar. Jag arbetar med utredning och behandling av migrän, epilepsi, Parkinsons och andra neurologiska tillstånd. Jag strävar efter att ge varje patient en individanpassad behandlingsplan.',
    bookingUrl: 'https://doktorkollen.com/boka/lars-andersson',
    lat: 59.8600,
    lng: 17.6400,
    conditionIds: ['cond-6'],
    serviceIds: ['svc-7'],
  },
  {
    id: 'pro-7',
    slug: 'karin-johansson',
    name: 'Karin Johansson',
    title: 'Leg. Allmänläkare',
    specialties: ['Preventiv hälsovård', 'Kroniska sjukdomar', 'Äldrevård'],
    clinicIds: ['clin-4'],
    citySlug: 'linkoping',
    city: 'Linköping',
    introduction:
      'Allmänläkare med 20 års erfarenhet och ett helhetsperspektiv på patientens hälsa. Jag arbetar med förebyggande hälsovård, uppföljning av kroniska sjukdomar och koordinering av specialistvård. Jag talar flytande svenska, engelska och tyska.',
    bookingUrl: 'https://doktorkollen.com/boka/karin-johansson',
    lat: 58.4150,
    lng: 15.6250,
    conditionIds: ['cond-3', 'cond-7', 'cond-1'],
    serviceIds: ['svc-8'],
  },
  {
    id: 'pro-8',
    slug: 'peter-magnusson',
    name: 'Peter Magnusson',
    title: 'Leg. Psykoterapeut',
    specialties: ['Psykodynamisk terapi', 'Trauma', 'Relationsproblem'],
    clinicIds: ['clin-1'],
    citySlug: 'stockholm',
    city: 'Stockholm',
    introduction:
      'Legitimerad psykoterapeut med fördjupning i psykodynamisk terapi och traumabehandling. Jag har erfarenhet av att arbeta med komplexa traumatillstånd, relationsproblem och personlighetsproblematik. Jag erbjuder djupgående långtidsterapi för bestående förändring.',
    bookingUrl: 'https://doktorkollen.com/boka/peter-magnusson',
    lat: 59.3400,
    lng: 18.0750,
    conditionIds: ['cond-1', 'cond-5'],
    serviceIds: ['svc-1'],
  },
  {
    id: 'pro-9',
    slug: 'helena-gustafsson',
    name: 'Helena Gustafsson',
    title: 'Specialist i gynekologi',
    specialties: ['Endometrios', 'Preventivmedel', 'Klimakterium'],
    clinicIds: ['clin-5'],
    citySlug: 'vasteras',
    city: 'Västerås',
    introduction:
      'Gynekolog med specialintresse för endometrios och klimakteriemedicin. Jag arbetar med ett patientcentrerat förhållningssätt och strävar efter att ge varje kvinna bästa möjliga vård. Jag är även certifierad i hysteroskopi och kolposkopi.',
    bookingUrl: 'https://doktorkollen.com/boka/helena-gustafsson',
    lat: 59.6150,
    lng: 16.5500,
    conditionIds: [],
    serviceIds: ['svc-6'],
  },
  {
    id: 'pro-10',
    slug: 'mikael-holm',
    name: 'Mikael Holm',
    title: 'Leg. Allmänläkare',
    specialties: ['Diabetes', 'Hypertoni', 'Metabolt syndrom'],
    clinicIds: ['clin-5'],
    citySlug: 'goteborg',
    city: 'Göteborg',
    introduction:
      'Allmänläkare med särskilt intresse för metabola sjukdomar som diabetes typ 2 och hypertoni. Jag arbetar med livsstilsmedicin och hjälper mina patienter att göra hållbara förändringar för bättre hälsa. Jag talar svenska, engelska och arabiska.',
    bookingUrl: 'https://doktorkollen.com/boka/mikael-holm',
    lat: 57.7050,
    lng: 11.9700,
    conditionIds: ['cond-3', 'cond-7'],
    serviceIds: ['svc-8', 'svc-3'],
  },
]

export const clinics: Clinic[] = [
  {
    id: 'clin-1',
    slug: 'stockholms-psykologcenter',
    name: 'Stockholms Psykologcenter',
    address: 'Kungsgatan 42',
    city: 'Stockholm',
    citySlug: 'stockholm',
    phone: '08-123 456 78',
    email: 'info@sthlmpsykologcenter.se',
    website: 'https://sthlmpsykologcenter.se',
    bookingUrl: 'https://sthlmpsykologcenter.se/boka',
    lat: 59.3360,
    lng: 18.0640,
    professionalIds: ['pro-1', 'pro-2', 'pro-8'],
    services: ['Psykologi', 'Psykoterapi', 'Bedömning och utredning'],
    description:
      'Stockholms Psykologcenter är en privat psykologmottagning i centrala Stockholm. Vi erbjuder KBT, psykodynamisk terapi och psykologisk utredning. Vårt team består av legitimerade psykologer och psykoterapeuter med lång erfarenhet.',
  },
  {
    id: 'clin-2',
    slug: 'goteborg-hjartmottagning',
    name: 'Göteborgs Hjärtmottagning',
    address: 'Avenyn 15',
    city: 'Göteborg',
    citySlug: 'goteborg',
    phone: '031-789 012 34',
    email: 'info@gbghjartat.se',
    website: 'https://gbghjartat.se',
    bookingUrl: 'https://gbghjartat.se/boka',
    lat: 57.7100,
    lng: 11.9760,
    professionalIds: ['pro-2', 'pro-3'],
    services: ['Kardiologi', 'EKG', 'Ekokardiografi', 'Hjärtrehab'],
    description:
      'Göteborgs Hjärtmottagning är ett specialistcentrum för hjärt-kärlsjukdomar. Vi erbjuder avancerad diagnostik och behandling, med fokus på förmaksflimmer, hjärtsvikt och preventiv kardiologi. Vår erfarna kardiologer arbetar tätt ihop för optimal patientvård.',
  },
  {
    id: 'clin-3',
    slug: 'malmo-hudklinik',
    name: 'Malmö Hudklinik',
    address: 'Stortorget 8',
    city: 'Malmö',
    citySlug: 'malmo',
    phone: '040-345 678 90',
    email: 'info@malmohud.se',
    website: 'https://malmohud.se',
    bookingUrl: 'https://malmohud.se/boka',
    lat: 55.6050,
    lng: 13.0000,
    professionalIds: ['pro-4', 'pro-5'],
    services: ['Dermatologi', 'Hudcancerscreening', 'Eksembehandling', 'Ortopedi'],
    description:
      'Malmö Hudklinik erbjuder specialistvård inom dermatologi och ortopedi i centrala Malmö. Vi har modern utrustning för dermatoskopi och hudcancerdiagnostik. Våra dermatologer behandlar hela spektrumet av hudsjukdomar.',
  },
  {
    id: 'clin-4',
    slug: 'akademiska-specialistvard',
    name: 'Akademiska Specialistvård',
    address: 'Dag Hammarskjölds väg 17',
    city: 'Uppsala',
    citySlug: 'uppsala',
    phone: '018-456 789 01',
    email: 'kontakt@akademiskaspecialist.se',
    website: 'https://akademiskaspecialist.se',
    bookingUrl: 'https://akademiskaspecialist.se/boka',
    lat: 59.8560,
    lng: 17.6380,
    professionalIds: ['pro-6', 'pro-7'],
    services: ['Neurologi', 'Allmänmedicin', 'Migränklinik', 'Epilepsivård'],
    description:
      'Akademiska Specialistvård är beläget nära Uppsala universitetssjukhus och erbjuder specialistvård inom neurologi och allmänmedicin. Vi kombinerar akademisk kompetens med patientnära vård och håller oss ständigt uppdaterade med den senaste forskningen.',
  },
  {
    id: 'clin-5',
    slug: 'vasteras-vardcentrum',
    name: 'Västerås Vårdcentrum',
    address: 'Kopparbergsvägen 22',
    city: 'Västerås',
    citySlug: 'vasteras',
    phone: '021-567 890 12',
    email: 'info@vasteras-vard.se',
    website: 'https://vasteras-vard.se',
    bookingUrl: 'https://vasteras-vard.se/boka',
    lat: 59.6080,
    lng: 16.5400,
    professionalIds: ['pro-9', 'pro-10'],
    services: ['Gynekologi', 'Allmänmedicin', 'Preventivmedelsmottagning', 'Diabetesvård'],
    description:
      'Västerås Vårdcentrum är ett modernt vårdcenter som erbjuder ett brett utbud av specialistvård. Vi har gynekologi och allmänmedicin under samma tak och strävar efter att göra det enkelt för patienter att få rätt vård på rätt plats.',
  },
]
