#!/usr/bin/env node

/**
 * generate-sardegna-pages-v2.js
 *
 * Generatore definitivo per LavaggioMaterassi su Sardegna.
 * Usa index.html come matrice approvata e data/geo.sardegna.json come mappa geografica.
 * Non riscrive creativamente il copy: applica solo adattamenti controllati.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const MASTER_INDEX = path.join(ROOT, 'index.html');
const GEO_PATHS = [
  path.join(ROOT, 'data', 'geo.sardegna.json'),
  path.join(ROOT, 'data', 'geo.sardegna.json.txt')
];

const SERVICE = {
  brand: 'LavaggioMaterassi',
  domain: 'lavaggiomaterassi.com',
  baseUrl: 'https://www.lavaggiomaterassi.com',
  serviceSlug: 'lavaggio-materassi',
  pageServiceName: 'Lavaggio Materassi',
  visibleServiceName: 'Lavaggio materassi',
  fullServiceListLower: 'lavaggio materassi, divani, tappeti e moquette'
};

const HUB_SETTINGS = {
  'hub-cagliari': {
    outputSlug: 'cagliari',
    label: 'Cagliari e dintorni',
    metaPlace: 'Cagliari',
    titlePlace: 'Cagliari',
    locative: 'a Cagliari e dintorni',
    zoneText: 'Operiamo a domicilio a Cagliari e nei comuni vicini. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.'
  },
  'hub-costa-smeralda': {
    outputSlug: 'costa-smeralda',
    label: 'Costa Smeralda',
    metaPlace: 'Costa Smeralda',
    titlePlace: 'Costa Smeralda',
    locative: 'in Costa Smeralda',
    zoneText: 'Operiamo a domicilio in Costa Smeralda e nelle principali località turistiche della zona. Se la tua località non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.'
  },
  'hub-sassari': {
    outputSlug: 'sassari',
    label: 'Sassari e provincia',
    metaPlace: 'Sassari',
    titlePlace: 'Sassari',
    locative: 'a Sassari e provincia',
    zoneText: 'Operiamo a domicilio a Sassari e nelle principali località della provincia. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.'
  },
  'hub-olbia-gallura': {
    outputSlug: 'olbia',
    label: 'Olbia e Gallura',
    metaPlace: 'Olbia',
    titlePlace: 'Olbia',
    locative: 'a Olbia e in Gallura',
    zoneText: 'Operiamo a domicilio a Olbia e nelle principali località della Gallura. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.'
  },
  'hub-oristano': {
    outputSlug: 'oristano',
    label: 'Oristano e provincia',
    metaPlace: 'Oristano',
    titlePlace: 'Oristano',
    locative: 'a Oristano e provincia',
    zoneText: 'Operiamo a domicilio a Oristano e nelle principali località della provincia. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.'
  },
  'hub-nuoro': {
    outputSlug: 'nuoro',
    label: 'Nuoro e provincia',
    metaPlace: 'Nuoro',
    titlePlace: 'Nuoro',
    locative: 'a Nuoro e provincia',
    zoneText: 'Operiamo a domicilio a Nuoro e nelle principali località della provincia. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.'
  },
  'hub-ogliastra': {
    outputSlug: 'ogliastra',
    label: 'Ogliastra',
    metaPlace: 'Ogliastra',
    titlePlace: 'Ogliastra',
    locative: 'in Ogliastra',
    zoneText: 'Operiamo a domicilio in Ogliastra e nelle località vicine. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.'
  },
  'hub-sulcis-iglesiente': {
    outputSlug: 'sulcis-iglesiente',
    label: 'Sulcis Iglesiente',
    metaPlace: 'Sulcis Iglesiente',
    titlePlace: 'Sulcis Iglesiente',
    locative: 'nel Sulcis Iglesiente',
    zoneText: 'Operiamo a domicilio nel Sulcis Iglesiente e nelle località vicine. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.'
  },
  'hub-medio-campidano': {
    outputSlug: 'medio-campidano',
    label: 'Medio Campidano',
    metaPlace: 'Medio Campidano',
    titlePlace: 'Medio Campidano',
    locative: 'nel Medio Campidano',
    zoneText: 'Operiamo a domicilio nel Medio Campidano e nelle località vicine. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.'
  },
  'hub-sud-sardegna-commerciale': {
    outputSlug: 'sud-sardegna',
    label: 'Sud Sardegna',
    metaPlace: 'Sud Sardegna',
    titlePlace: 'Sud Sardegna',
    locative: 'nel Sud Sardegna',
    zoneText: 'Operiamo a domicilio nel Sud Sardegna e nelle principali località collegate. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.',
    aggregatePrimaryHubIds: ['hub-cagliari', 'hub-sulcis-iglesiente', 'hub-medio-campidano']
  }
};

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function loadGeo() {
  const geoPath = GEO_PATHS.find(filePath => fs.existsSync(filePath));
  if (!geoPath) {
    throw new Error('Mappa geografica non trovata. Copia geo.sardegna.json in data/geo.sardegna.json.');
  }
  return JSON.parse(readFile(geoPath));
}

function replaceAll(input, from, to) {
  return input.split(from).join(to);
}

function replaceFirst(input, from, to) {
  return input.replace(from, to);
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function hubSegment(hub) {
  const settings = HUB_SETTINGS[hub.id] || {};
  const slug = settings.outputSlug || hub.slug;
  return `${SERVICE.serviceSlug}-${slug}`;
}

function localitySegment(locality) {
  return `${SERVICE.serviceSlug}-a-domicilio-${locality.slug}`;
}

function hubUrl(hub) {
  return `/${hubSegment(hub)}/`;
}

function localityUrl(locality) {
  return `/${localitySegment(locality)}/`;
}

function canonicalFromSegment(segment) {
  return `${SERVICE.baseUrl}/${segment}/`;
}

function municipalityLocative(name) {
  const clean = String(name).trim();
  const first = clean.charAt(0).toLowerCase();
  if (['a', 'e', 'o'].includes(first)) return `ad ${clean}`;
  return `a ${clean}`;
}

function absolutizePaths(html) {
  const pairs = [
    ['href="assets/css/cleaning-landing.css"', 'href="/assets/css/cleaning-landing.css"'],
    ['href="assets/img/', 'href="/assets/img/'],
    ['srcset="assets/img/', 'srcset="/assets/img/'],
    ['src="assets/img/', 'src="/assets/img/'],
    ['href="pages/legal/', 'href="/pages/legal/'],
    ['src="assets/js/', 'src="/assets/js/']
  ];

  for (const [from, to] of pairs) html = replaceAll(html, from, to);
  return html;
}

function cleanPublicTerms(html) {
  html = replaceAll(html, 'Immagine SEO per servizio', 'Immagine del servizio');
  html = replaceAll(html, 'Hero image per servizio', 'Immagine principale del servizio');
  return html;
}

function commonPageTransforms(html, options) {
  const { titleLocative, h1Locative, metaLocative, metaPlace, titlePlace, canonical } = options;
  const cleanTitlePlace = titlePlace || metaPlace;

  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>Lavaggio materassi a domicilio ${titleLocative}</title>`
  );

  html = replaceFirst(
    html,
    'content="Lavaggio e igienizzazione materassi a domicilio in Sardegna. Trattamento anti-acaro, smacchiante e igienizzante per materassi, divani, tappeti e moquette. Preventivo rapido anche via WhatsApp."',
    `content="Lavaggio e igienizzazione materassi a domicilio ${metaLocative}. Trattamento anti-acaro, smacchiante e igienizzante per materassi, divani, tappeti e moquette. Preventivo rapido anche via WhatsApp."`
  );

  html = replaceFirst(html, '<meta name="geo.placename" content="Sardegna">', `<meta name="geo.placename" content="${metaPlace}">`);
  html = replaceFirst(html, '<link rel="canonical" href="https://www.lavaggiomaterassi.com/">', `<link rel="canonical" href="${canonical}">`);

  html = replaceAll(html, 'content="Lavaggio materassi a domicilio in Sardegna"', `content="Lavaggio materassi a domicilio ${metaLocative}"`);
  html = replaceAll(html, 'content="Lavaggio e igienizzazione materassi a domicilio in Sardegna. Chiama o scrivi su WhatsApp, invia le foto e ricevi un preventivo con Piergiorgio."', `content="Lavaggio e igienizzazione materassi a domicilio ${metaLocative}. Chiama o scrivi su WhatsApp, invia le foto e ricevi un preventivo con Piergiorgio."`);
  html = replaceAll(html, 'content="Igienizzazione materassi a domicilio in Sardegna. Preventivo rapido con Piergiorgio anche via WhatsApp."', `content="Igienizzazione materassi a domicilio ${metaLocative}. Preventivo rapido con Piergiorgio anche via WhatsApp."`);
  html = replaceAll(html, 'content="https://www.lavaggiomaterassi.com/">', `content="${canonical}">`);

  html = replaceFirst(html, '"url": "https://www.lavaggiomaterassi.com/",', `"url": "${canonical}",`);
  html = replaceFirst(html, '"url": "https://www.lavaggiomaterassi.com/",', `"url": "${canonical}",`);
  html = replaceAll(html, '"name": "Lavaggio Materassi a Domicilio in Sardegna"', `"name": "Lavaggio Materassi a Domicilio ${titleLocative}"`);
  html = replaceAll(html, '"description": "Lavaggio e igienizzazione materassi a domicilio in Sardegna. Chiama o scrivi su WhatsApp, invia le foto e ricevi un preventivo con Piergiorgio.",', `"description": "Lavaggio e igienizzazione materassi a domicilio ${metaLocative}. Chiama o scrivi su WhatsApp, invia le foto e ricevi un preventivo con Piergiorgio.",`);

  html = replaceAll(html, 'Preventivo rapido anche via WhatsApp · Sardegna', `Preventivo rapido anche via WhatsApp · ${metaPlace}`);
  html = replaceAll(html, '<h1>Lavaggio materassi a domicilio in Sardegna</h1>', `<h1>Lavaggio materassi a domicilio ${h1Locative}</h1>`);
  html = replaceAll(html, 'preventivo personalizzato per il lavaggio materassi a domicilio in Sardegna. Il trattamento', `preventivo personalizzato per il lavaggio materassi a domicilio ${metaLocative}. Il trattamento`);
  html = replaceAll(html, '<div><strong>Zona</strong><span>Sardegna</span></div>', `<div><strong>Zona</strong><span>${metaPlace}</span></div>`);

  html = replaceAll(html, ' in Sardegna', ` ${metaLocative}`);
  html = replaceAll(html, 'Lavaggio materassi Sardegna', `Lavaggio materassi ${metaPlace}`);
  html = replaceAll(html, 'Cliente privato · Sardegna', `Cliente privato · ${metaPlace}`);
  html = replaceAll(html, 'Gestore B&amp;B · Sardegna', `Gestore B&amp;B · ${metaPlace}`);

  return html;
}

function originalZoneList() {
  return `          <ul class="zone-list">
            <li><a href="/lavaggio-materassi-cagliari/" style="display:block;color:inherit;text-decoration:none;">Lavaggio materassi Cagliari</a></li>
            <li><a href="/lavaggio-materassi-oristano/" style="display:block;color:inherit;text-decoration:none;">Lavaggio materassi Oristano</a></li>
            <li><a href="/lavaggio-materassi-nuoro/" style="display:block;color:inherit;text-decoration:none;">Lavaggio materassi Nuoro</a></li>
            <li><a href="/lavaggio-materassi-sassari/" style="display:block;color:inherit;text-decoration:none;">Lavaggio materassi Sassari</a></li>
            <li><a href="/lavaggio-materassi-olbia/" style="display:block;color:inherit;text-decoration:none;">Lavaggio materassi Olbia</a></li>
            <li><a href="/lavaggio-materassi-sud-sardegna/" style="display:block;color:inherit;text-decoration:none;">Lavaggio materassi Sud Sardegna</a></li>
          </ul>`;
}

function replaceZoneSection(html, title, text, listHtml) {
  html = html.replace(/(<section id="zone"[\s\S]*?<h2>)([\s\S]*?)(<\/h2>)/, `$1${title}$3`);
  html = replaceAll(
    html,
    'Scegli la tua area e verifica il servizio più vicino a te. LavaggioMaterassi organizza interventi a domicilio nelle principali zone della Sardegna, con pagine dedicate alle province e alle località servite.',
    text
  );

  let replacedList = false;
  html = html.replace(
    /(<section id="zone"[\s\S]*?<div class="zone-box">\s*)<ul class="zone-list">[\s\S]*?<\/ul>/,
    (match, prefix) => {
      replacedList = true;
      return `${prefix}${listHtml.trimStart()}`;
    }
  );

  if (!replacedList) {
    throw new Error('Blocco zone-list non trovato dentro la sezione zone. Verificare index.html.');
  }

  return html;
}

function buildListLinks(items) {
  return `          <ul class="zone-list">
${items.map(item => `            <li><a href="${item.href}" style="display:block;color:inherit;text-decoration:none;">${item.label}</a></li>`).join('\n')}
          </ul>`;
}

function getHubMunicipalities(hub, municipalities) {
  const settings = HUB_SETTINGS[hub.id] || {};
  let result;

  if (settings.aggregatePrimaryHubIds) {
    result = municipalities.filter(item => settings.aggregatePrimaryHubIds.includes(item.primaryHubId));
  } else {
    result = municipalities.filter(item => item.primaryHubId === hub.id);
  }

  return result.sort((a, b) => (b.priority || 0) - (a.priority || 0));
}

function buildHubLinks(hub, municipalities) {
  const hubMunicipalities = getHubMunicipalities(hub, municipalities);
  return buildListLinks(hubMunicipalities.map(item => ({
    href: localityUrl(item),
    label: `Lavaggio materassi ${item.name}`
  })));
}

function getPrimaryHub(locality, hubs) {
  return hubs.find(hub => hub.id === locality.primaryHubId) || hubs[0];
}

function buildLocalityLinks(locality, hubs, municipalities) {
  const primaryHub = getPrimaryHub(locality, hubs);
  const sameHub = municipalities
    .filter(item => item.primaryHubId === locality.primaryHubId && item.slug !== locality.slug)
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, 7);

  const links = [{
    href: hubUrl(primaryHub),
    label: `Lavaggio materassi ${HUB_SETTINGS[primaryHub.id]?.label || primaryHub.name}`
  }];

  for (const item of sameHub) {
    links.push({ href: localityUrl(item), label: `Lavaggio materassi ${item.name}` });
  }

  return buildListLinks(links);
}

function replaceFaqArea(html, locative, placeLabel) {
  html = replaceAll(html, 'Quanto costa il lavaggio di un materasso a domicilio in Sardegna?', `Quanto costa il lavaggio di un materasso a domicilio ${locative}?`);
  html = replaceAll(html, 'Il servizio è disponibile in Sardegna?', `Il servizio è disponibile ${locative}?`);
  html = replaceAll(
    html,
    'Sì. LavaggioMaterassi è organizzato per coprire diverse aree della Sardegna tramite pagine dedicate alle principali province, città e località servite.',
    `Sì. LavaggioMaterassi è organizzato per servire ${placeLabel} e le zone collegate. Per verificare disponibilità e tempi, la cosa migliore è chiamare o scrivere su WhatsApp.`
  );
  html = replaceAll(
    html,
    'LavaggioMaterassi opera in tutta la Sardegna, attraverso pagine dedicate alle principali aree provinciali, città e località servite potete vedere se la vostra zona è coperta, ma scriverci o chiamarci è la cosa migliore da fare.',
    `LavaggioMaterassi opera ${locative} e nelle zone collegate. Se vuoi sapere subito se possiamo intervenire nella tua zona, la cosa migliore è chiamarci o scriverci su WhatsApp.`
  );
  return html;
}

function prepareFromMaster(master) {
  let html = master;
  html = absolutizePaths(html);
  html = cleanPublicTerms(html);
  return html;
}

function generateHub(master, hub, municipalities) {
  const settings = HUB_SETTINGS[hub.id] || {
    outputSlug: hub.slug,
    label: hub.name,
    metaPlace: hub.name,
    titlePlace: hub.name,
    locative: `a ${hub.name}`,
    zoneText: `Operiamo a domicilio a ${hub.name} e nelle località vicine. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.`
  };

  const segment = hubSegment(hub);
  const canonical = canonicalFromSegment(segment);
  let html = prepareFromMaster(master);

  html = commonPageTransforms(html, {
    titleLocative: settings.locative,
    h1Locative: settings.locative,
    metaLocative: settings.locative,
    metaPlace: settings.metaPlace,
    titlePlace: settings.titlePlace || settings.metaPlace,
    canonical
  });

  html = replaceZoneSection(
    html,
    `Lavaggio a domicilio ${settings.locative}`,
    settings.zoneText,
    buildHubLinks(hub, municipalities)
  );

  html = replaceFaqArea(html, settings.locative, settings.label);

  return { segment, html };
}

function generateLocality(master, locality, hubs, municipalities) {
  const locative = municipalityLocative(locality.name);
  const segment = localitySegment(locality);
  const canonical = canonicalFromSegment(segment);
  let html = prepareFromMaster(master);

  html = commonPageTransforms(html, {
    titleLocative: locative,
    h1Locative: locative,
    metaLocative: locative,
    metaPlace: locality.name,
    titlePlace: locality.name,
    canonical
  });

  html = replaceZoneSection(
    html,
    `Lavaggio a domicilio ${locative} e nei comuni vicini`,
    `Operiamo a domicilio ${locative} e nei comuni vicini. Se la tua zona non è nell’elenco, chiamaci o scrivici su WhatsApp: ti diremo subito se possiamo organizzare l’intervento.`,
    buildLocalityLinks(locality, hubs, municipalities)
  );

  html = replaceFaqArea(html, locative, locality.name);

  return { segment, html };
}

function validateMaster(master) {
  const required = [
    'conveniente',
    'btn-whatsapp',
    'assets/img/lavaggio-materassi-a-domicilio-hero.webp',
    'assets/js/cookie-consent.js'
  ];
  const missing = required.filter(token => !master.includes(token));
  if (missing.length) {
    throw new Error(`index.html non sembra la matrice definitiva. Mancano: ${missing.join(', ')}`);
  }
}

function validateGenerated(segment, html) {
  const failures = [];
  if (!html.includes('conveniente')) failures.push('testo utente mancante');
  if (!html.includes('btn-whatsapp')) failures.push('classe WhatsApp mancante');
  if (!html.includes('href="/assets/css/cleaning-landing.css"')) failures.push('CSS non assoluto');
  if (!html.includes('/assets/img/lavaggio-materassi-a-domicilio-hero.webp')) failures.push('immagine hero neutra non trovata');
  if (html.toLowerCase().includes('autorevolezza')) failures.push('termine interno autorevolezza presente');
  if (html.toLowerCase().includes(' seo ')) failures.push('termine interno SEO presente');
  if (html.toLowerCase().includes('hub')) failures.push('termine interno hub presente');
  if (!html.includes(`<link rel="canonical" href="${canonicalFromSegment(segment)}">`)) failures.push('canonical non coerente');
  if (failures.length) throw new Error(`${segment}: ${failures.join(', ')}`);
}

function buildRobots() {
  return `User-agent: *
Allow: /

Sitemap: ${SERVICE.baseUrl}/sitemap.xml
`;
}

function buildSitemap(hubs, municipalities) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    { loc: `${SERVICE.baseUrl}/`, priority: '1.0' },
    ...hubs.map(hub => ({ loc: `${SERVICE.baseUrl}/${hubSegment(hub)}/`, priority: '0.9' })),
    ...municipalities.map(locality => ({ loc: `${SERVICE.baseUrl}/${localitySegment(locality)}/`, priority: '0.8' })),
    { loc: `${SERVICE.baseUrl}/pages/legal/contatti.html`, priority: '0.4' },
    { loc: `${SERVICE.baseUrl}/pages/legal/privacy-policy.html`, priority: '0.3' },
    { loc: `${SERVICE.baseUrl}/pages/legal/cookie-policy.html`, priority: '0.3' },
    { loc: `${SERVICE.baseUrl}/pages/legal/termini-condizioni.html`, priority: '0.3' }
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(item => `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
}

function main() {
  const master = readFile(MASTER_INDEX);
  validateMaster(master);

  const geo = loadGeo();
  const hubs = geo.commercialSeoHubs
    .slice()
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const municipalities = geo.priorityMunicipalities
    .slice()
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const generated = [];

  for (const hub of hubs) {
    const page = generateHub(master, hub, municipalities);
    validateGenerated(page.segment, page.html);
    writeFile(path.join(ROOT, page.segment, 'index.html'), page.html);
    generated.push(`/${page.segment}/`);
  }

  for (const locality of municipalities) {
    const page = generateLocality(master, locality, hubs, municipalities);
    validateGenerated(page.segment, page.html);
    writeFile(path.join(ROOT, page.segment, 'index.html'), page.html);
    generated.push(`/${page.segment}/`);
  }

  writeFile(path.join(ROOT, 'sitemap.xml'), buildSitemap(hubs, municipalities));
  writeFile(path.join(ROOT, 'robots.txt'), buildRobots());

  console.log('Generazione completata.');
  console.log(`Pagine generate: ${generated.length}`);
  for (const item of generated) console.log(`- ${item}`);
  console.log('- /sitemap.xml');
  console.log('- /robots.txt');
}

main();
