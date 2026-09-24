/**
 * SEO edge function (Netlify Edge, Deno runtime).
 *
 * The storefront is a client-rendered React SPA: without this, every URL
 * returns the same index.html shell, so crawlers and link-preview bots that
 * don't run JavaScript (Facebook, Viber, Telegram, Bing, ...) see the
 * homepage title/image for every page and no content at all.
 *
 * For each page this function:
 *   - writes the page's real <title>, description, canonical, hreflang
 *     alternates, robots, Open Graph / Twitter tags and JSON-LD into <head>;
 *   - prerenders the page's main content (heading, text, machine links /
 *     details) inside <div id="root">, which React replaces when it mounts;
 *   - returns a real HTTP 404 for unknown routes and machines;
 *   - serves /sitemap.xml generated live from the API (every machine, both
 *     languages, with hreflang alternates).
 *
 * If the API is unreachable it falls back to the generic page (HTTP 200),
 * never a 404, so an API outage can't get pages dropped from the index.
 *
 * Text below mirrors src/locales/*.json — keep them in sync.
 */

const SITE_URL = "https://www.intertechnics.ge";
const DEFAULT_IMAGE = `${SITE_URL}/images/hero-image.jpg`;
const BRAND = "Intertechnics LTD";

const STRINGS = {
  ka: {
    heroHeading: "საქართველოს სამშენებლო ტექნიკის პარტნიორი 2005 წლიდან",
    heroSub:
      "Bobcat-ის, Kubota-ს, AMMANN-ის, Putzmeister-ის, Kaeser-ის და სხვა წამყვანი ბრენდების ოფიციალური დილერი, სათადარიგო ნაწილებისა და პროფესიონალური სერვისის სრული მხარდაჭერით.",
    partnersTitle: "პარტნიორი კომპანიები",
    partnersDesc:
      "ქვემოთ ჩამოთვლილი მწარმოებლების ოფიციალური დილერი და სერვის-პარტნიორი ვართ — სათადარიგო ნაწილებითა და საგარანტიო მომსახურებით საქართველოში.",
    contactTitle: "კონტაქტი",
    contactDesc:
      "დაგვიკავშირდით — Intertechnics LTD: ტექნიკის გაყიდვა, სათადარიგო ნაწილები და სერვისი თბილისში. გამოგვიგზავნეთ მოთხოვნა და ჩვენი გუნდი დაგიკავშირდებათ.",
    aboutTitle: "ჩვენ შესახებ",
    aboutText: [
      "Intertechnics LTD-ის მთავარი მიზანია საბაზრო წილისა და კომპეტენტუნარიანობის შენარჩუნება ცვალებად ქართულ ბაზარზე.",
      "კომპანია პარტნიორობს მოწინავე საგზაო-სამშენებლო ტექნიკის მწარმოებელ ბრენდებთან 2005 წლიდან. ეს ურთიერთობები უზრუნველყოფს ინოვაციებისა და უმაღლესი ხარისხის ტექნიკის შემოდინებას ქართულ სამშენებლო სივრცეში.",
      "პარტნიორობის პირველ ეტაპს არსებულ და პოტენციურ კლიენტებთან წარმოადგენს ინფორმაციის წვდომადობა და სანდოობა მოთხოვნად პროდუქციაზე.",
      "ჩვენი ჯგუფი დაკომპლექტებულია პროფესიონალებით, რომლებიც ყოველწლიურად გადიან გადამზადებას და იღრმავებენ გამოცდილებას, უშუალოდ პარტნიორი ფირმების ეგიდით გამართულ ტრენინგებზე.",
    ],
    machinesTitle: "ტექნიკა",
    machinesDesc:
      "Intertechnics-ის ტექნიკის კატალოგი: ახალი და მეორადი სამშენებლო და საგზაო ტექნიკა — Bobcat, Kubota, AMMANN, Putzmeister და სხვა. ფასები, მახასიათებლები და ფოტოები.",
    negotiable: "ფასი შეთანხმებადია",
    onRequest: "ფასი მოთხოვნისას",
    back: "ტექნიკის სიაში დაბრუნება",
    home: "მთავარი",
    notFoundTitle: "გვერდი ვერ მოიძებნა",
    notFoundBody: "თქვენ მიერ მოძებნილი გვერდი არ არსებობს ან გადატანილია.",
    conditionNew: "ახალი",
    conditionUsed: "მეორადი",
    fields: {
      engine: "ძრავი",
      power_hp: "სიმძლავრე",
      operating_weight_kg: "წონა",
      load_capacity_kg: "ტვირთამწეობა",
      lift_height_m: "აწევის სიმაღლე",
      fuel_type: "საწვავის ტიპი",
      cabin: "კაბინა",
      warranty: "გარანტია",
      working_hours: "ნამუშევარი საათები",
      year: "წელი",
      model: "მოდელი",
    },
  },
  en: {
    heroHeading: "Georgia's construction equipment partner since 2005",
    heroSub:
      "Official dealer for Bobcat, Kubota, AMMANN, Putzmeister, Kaeser and more, backed by spare parts and service.",
    partnersTitle: "Partner Companies",
    partnersDesc:
      "Official dealer and service partner for the manufacturers below, with spare parts and warranty support in Georgia.",
    contactTitle: "Contact Us",
    contactDesc:
      "Contact Intertechnics LTD: machine sales, spare parts and service in Tbilisi, Georgia. Send a request and our team will call you back.",
    aboutTitle: "About Us",
    aboutText: [
      "The main goal of Intertechnics LTD is to maintain market share and competence in the changing Georgian market.",
      "Since 2005, the company has been partnering with leading manufacturers of road construction machinery. These relationships ensure the introduction of innovations and high quality machinery into the Georgian construction market.",
      "The first stage of the partnership involves the availability and reliability of information about the demanded products for existing and potential clients.",
      "Our team consists of professionals who undergo annual training and deepen their experience through training organized under the guidance of partner companies.",
    ],
    machinesTitle: "Machines",
    machinesDesc:
      "Intertechnics machine catalog: new and used construction and road-building equipment — Bobcat, Kubota, AMMANN, Putzmeister and more. Prices, specs and photos.",
    negotiable: "Price negotiable",
    onRequest: "Price on request",
    back: "Back to machines",
    home: "Home",
    notFoundTitle: "Page not found",
    notFoundBody: "The page you're looking for doesn't exist or has moved.",
    conditionNew: "New",
    conditionUsed: "Used",
    fields: {
      engine: "Engine",
      power_hp: "Power",
      operating_weight_kg: "Weight",
      load_capacity_kg: "Load capacity",
      lift_height_m: "Lift height",
      fuel_type: "Fuel type",
      cabin: "Cabin",
      warranty: "Warranty",
      working_hours: "Working hours",
      year: "Year",
      model: "Model",
    },
  },
};

const FIELD_ORDER = [
  "model",
  "year",
  "engine",
  "power_hp",
  "operating_weight_kg",
  "load_capacity_kg",
  "lift_height_m",
  "fuel_type",
  "cabin",
  "warranty",
  "working_hours",
];
const FIELD_UNITS = { power_hp: "hp", operating_weight_kg: "kg", load_capacity_kg: "kg", lift_height_m: "m", working_hours: "h" };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function apiBase() {
  try {
    return (globalThis.Netlify?.env.get("API_URL") || "https://api.intertechnics.ge").replace(/\/+$/, "");
  } catch {
    return "https://api.intertechnics.ge";
  }
}

function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** JSON for inside <script type="application/ld+json"> — can't close the tag. */
function jsonLd(data) {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function truncate(text, max = 160) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}

function langFromPath(pathname) {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ka";
}

function stripLang(pathname) {
  if (pathname === "/en") return "/";
  return pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
}

function pathFor(path, lang) {
  if (lang !== "en") return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** Only /uploads/... and /images/... paths (or absolute http(s) URLs) are used as images. */
function assetUrl(path) {
  if (typeof path !== "string" || !path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (!/^\/(uploads|images)\/[^\s"'()\\]+$/.test(path)) return null;
  return `${apiBase()}${path}`;
}

function machineName(m, lang) {
  return (lang === "en" && m.name_en) || m.name;
}

function machineDescription(m, lang) {
  return ((lang === "en" && m.description_en) || m.description || "").trim();
}

function formatPrice(m, s) {
  if (m.price === null || m.price === undefined) return m.price_negotiable ? s.negotiable : s.onRequest;
  const formatted = `${Number(m.price).toLocaleString("en-US")} ${m.currency}`;
  return m.price_negotiable ? `${formatted} · ${s.negotiable}` : formatted;
}

async function fetchJson(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(3000), headers: { Accept: "application/json" } });
  return { status: res.status, data: res.ok ? await res.json() : null };
}

async function listAllMachines() {
  const all = [];
  for (let offset = 0; offset < 2000; offset += 100) {
    const { data } = await fetchJson(`${apiBase()}/machines?limit=100&offset=${offset}`);
    if (!data?.data) break;
    all.push(...data.data);
    if (all.length >= (data.total ?? 0) || data.data.length < 100) break;
  }
  return all;
}

// ---------------------------------------------------------------------------
// Page models
// ---------------------------------------------------------------------------

async function homePage(lang, s) {
  let featured = [];
  try {
    const { data } = await fetchJson(`${apiBase()}/machines?featured=1&limit=12`);
    featured = data?.data ?? [];
  } catch {}

  return {
    title: `${BRAND} — ${s.heroHeading}`,
    description: truncate(s.heroSub),
    body: `
      <h1>${esc(s.heroHeading)}</h1>
      <p>${esc(s.heroSub)}</p>
      <p><a href="${pathFor("/machines", lang)}">${esc(s.machinesTitle)}</a></p>
      ${machineLinks(featured, lang, s)}`,
  };
}

const PARTNERS = [
  { name: "Bobcat", url: "https://www.bobcat.com/" },
  { name: "Kubota", url: "https://www.kubota.com/" },
  { name: "AMMANN", url: "https://www.ammann.com/en/plants/asphalt-plants" },
  { name: "Hbm-Nobas", url: "http://www.gp.ag/hbm-nobas/Start/" },
  { name: "Putzmeister", url: "https://www.putzmeister.com" },
  { name: "Kaeser Gmbh", url: "https://www.kaeser.com/int-en/" },
  { name: "Ins-Makina", url: "https://www.insmakina.com/ru/" },
  { name: "Kmayco", url: "https://www.kmayco.de/en" },
];

function partnersPage(lang, s) {
  const items = PARTNERS.map((p) => `<li><a href="${esc(p.url)}">${esc(p.name)}</a></li>`).join("");
  return {
    title: `${s.partnersTitle} — ${BRAND}`,
    description: truncate(s.partnersDesc),
    body: `
      <h1>${esc(s.partnersTitle)}</h1>
      <p>${esc(s.partnersDesc)}</p>
      <ul>${items}</ul>`,
  };
}

function aboutPage(lang, s) {
  return {
    title: `${s.aboutTitle} — ${BRAND}`,
    description: truncate(s.aboutText[0]),
    body: `
      <h1>${esc(s.aboutTitle)}</h1>
      ${s.aboutText.map((p) => `<p>${esc(p)}</p>`).join("")}`,
  };
}

function contactPage(lang, s) {
  return {
    title: `${s.contactTitle} — ${BRAND}`,
    description: truncate(s.contactDesc),
    body: `
      <h1>${esc(s.contactTitle)}</h1>
      <p>${esc(s.contactDesc)}</p>
      <p><a href="mailto:intertechnicsltd@gmail.com">intertechnicsltd@gmail.com</a> · <a href="tel:+995599502517">599 50 25 17</a></p>`,
  };
}

async function listingPage(lang, s) {
  let machines = [];
  try {
    machines = await listAllMachines();
  } catch {}

  return {
    title: `${s.machinesTitle} — ${BRAND}`,
    description: truncate(s.machinesDesc),
    jsonLd: machines.length
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: s.machinesTitle,
          itemListElement: machines.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}${pathFor(`/machines/${m.slug}`, lang)}`,
            name: machineName(m, lang),
          })),
        }
      : null,
    body: `
      <h1>${esc(s.machinesTitle)}</h1>
      <p>${esc(s.machinesDesc)}</p>
      ${machineLinks(machines, lang, s)}`,
  };
}

function machineLinks(machines, lang, s) {
  if (!machines.length) return "";
  const items = machines
    .map(
      (m) =>
        `<li><a href="${pathFor(`/machines/${encodeURIComponent(m.slug)}`, lang)}">${esc(machineName(m, lang))}</a> — ${esc(
          [m.brand, m.category].filter(Boolean).join(" · ")
        )} — ${esc(formatPrice(m, s))}</li>`
    )
    .join("");
  return `<ul>${items}</ul>`;
}

async function detailPage(lang, s, slug) {
  let result;
  try {
    result = await fetchJson(`${apiBase()}/machines/${encodeURIComponent(slug)}`);
  } catch {
    return null; // API unreachable: serve the generic shell, never a 404.
  }
  if (result.status === 404) return { notFound: true };
  const m = result.data;
  if (!m) return null;

  const name = machineName(m, lang);
  const description = machineDescription(m, lang);
  const url = `${SITE_URL}${pathFor(`/machines/${m.slug}`, lang)}`;
  const images = [m.main_image, ...(m.images || [])].map(assetUrl).filter(Boolean);
  const price = formatPrice(m, s);
  const brandCategory = [m.brand, m.category].filter(Boolean).join(" · ");
  const condition = m.condition_status === "new" ? s.conditionNew : m.condition_status === "used" ? s.conditionUsed : "";

  const specs = FIELD_ORDER.filter((f) => m[f] !== null && m[f] !== undefined && m[f] !== "")
    .map((f) => [s.fields[f] || f, `${m[f]}${FIELD_UNITS[f] ? ` ${FIELD_UNITS[f]}` : ""}`])
    .concat((m.specs || []).map((spec) => [spec.label, spec.value]));

  const metaDescription = truncate(
    (lang === "ka" && m.meta_description) ||
      description ||
      [name, brandCategory, condition, price].filter(Boolean).join(" — ")
  );

  const product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url,
    description: description || undefined,
    image: images.length ? images : undefined,
    brand: m.brand ? { "@type": "Brand", name: m.brand } : undefined,
    model: m.model || undefined,
    category: m.category || undefined,
    itemCondition:
      m.condition_status === "new"
        ? "https://schema.org/NewCondition"
        : m.condition_status === "used"
          ? "https://schema.org/UsedCondition"
          : undefined,
    offers:
      m.price !== null && m.price !== undefined
        ? {
            "@type": "Offer",
            url,
            priceCurrency: m.currency,
            price: m.price,
            availability: m.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
            seller: { "@type": "Organization", name: BRAND },
          }
        : undefined,
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: s.home, item: `${SITE_URL}${pathFor("/", lang)}` },
      { "@type": "ListItem", position: 2, name: s.machinesTitle, item: `${SITE_URL}${pathFor("/machines", lang)}` },
      { "@type": "ListItem", position: 3, name, item: url },
    ],
  };

  return {
    title: `${(lang === "ka" && m.meta_title) || name} — ${BRAND}`,
    description: metaDescription,
    image: images[0] || DEFAULT_IMAGE,
    ogType: "product",
    jsonLd: [product, breadcrumbs],
    body: `
      <p><a href="${pathFor("/machines", lang)}">← ${esc(s.back)}</a></p>
      ${brandCategory ? `<p>${esc(brandCategory)}</p>` : ""}
      <h1>${esc(name)}</h1>
      <p><strong>${esc(price)}</strong>${condition ? ` · ${esc(condition)}` : ""}</p>
      ${images[0] ? `<img src="${esc(images[0])}" alt="${esc(name)}" width="640" height="427">` : ""}
      ${description ? `<p>${esc(description)}</p>` : ""}
      ${specs.length ? `<ul>${specs.map(([k, v]) => `<li>${esc(k)}: ${esc(v)}</li>`).join("")}</ul>` : ""}`,
  };
}

function notFoundPage(s) {
  return {
    title: `${s.notFoundTitle} — ${BRAND}`,
    description: s.notFoundBody,
    noindex: true,
    status: 404,
    body: `<h1>${esc(s.notFoundTitle)}</h1><p>${esc(s.notFoundBody)}</p>`,
  };
}

// ---------------------------------------------------------------------------
// HTML rewriting
// ---------------------------------------------------------------------------

function renderHead(page, lang, basePath) {
  const canonical = `${SITE_URL}${pathFor(basePath, lang)}`;
  const image = page.image || DEFAULT_IMAGE;
  const tags = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.description)}"/>`,
    `<meta name="robots" content="${page.noindex ? "noindex, follow" : "index, follow"}"/>`,
    `<meta property="og:title" content="${esc(page.title)}"/>`,
    `<meta property="og:description" content="${esc(page.description)}"/>`,
    `<meta property="og:type" content="${page.ogType || "website"}"/>`,
    `<meta property="og:image" content="${esc(image)}"/>`,
    `<meta property="og:locale" content="${lang === "en" ? "en_US" : "ka_GE"}"/>`,
    `<meta property="og:locale:alternate" content="${lang === "en" ? "ka_GE" : "en_US"}"/>`,
    `<meta name="twitter:card" content="summary_large_image"/>`,
    `<meta name="twitter:title" content="${esc(page.title)}"/>`,
    `<meta name="twitter:description" content="${esc(page.description)}"/>`,
    `<meta name="twitter:image" content="${esc(image)}"/>`,
  ];
  if (!page.noindex) {
    tags.push(
      `<link rel="canonical" href="${canonical}"/>`,
      `<meta property="og:url" content="${canonical}"/>`,
      `<link rel="alternate" hreflang="ka" href="${SITE_URL}${pathFor(basePath, "ka")}"/>`,
      `<link rel="alternate" hreflang="en" href="${SITE_URL}${pathFor(basePath, "en")}"/>`,
      `<link rel="alternate" hreflang="x-default" href="${SITE_URL}${pathFor(basePath, "ka")}"/>`
    );
  }
  for (const data of [].concat(page.jsonLd || [])) {
    tags.push(`<script type="application/ld+json">${jsonLd(data)}</script>`);
  }
  return tags.join("");
}

function rewriteHtml(html, page, lang, basePath) {
  let out = html
    .replace(/<html lang="[^"]*"/, `<html lang="${lang}"`)
    .replace(/<title>[\s\S]*?<\/title>/, "")
    .replace(/<meta\s+(?:name|property)="(?:description|robots|og:(?!site_name)[^"]*|twitter:[^"]*)"[^>]*>/g, "")
    .replace(/<link\s+rel="(?:canonical|alternate)"[^>]*>/g, "")
    .replace("</head>", `${renderHead(page, lang, basePath)}</head>`);

  if (page.body) {
    out = out.replace(
      '<div id="root"></div>',
      `<div id="root"><main class="prerender" lang="${lang}">${page.body}</main></div>`
    );
  }
  return out;
}

// ---------------------------------------------------------------------------
// Sitemap
// ---------------------------------------------------------------------------

async function sitemap() {
  let machines = [];
  try {
    machines = await listAllMachines();
  } catch {}

  const entries = [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    { path: "/machines", priority: "0.9", changefreq: "daily" },
    { path: "/partners", priority: "0.7", changefreq: "monthly" },
    { path: "/about", priority: "0.6", changefreq: "monthly" },
    { path: "/contact", priority: "0.6", changefreq: "monthly" },
    ...machines.map((m) => ({
      path: `/machines/${encodeURIComponent(m.slug)}`,
      priority: "0.8",
      changefreq: "weekly",
      lastmod: m.updated_at ? String(m.updated_at).slice(0, 10) : null,
    })),
  ];

  const urls = entries
    .flatMap((e) =>
      ["ka", "en"].map((lang) => {
        const alternates = ["ka", "en"]
          .map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${SITE_URL}${pathFor(e.path, l)}"/>`)
          .concat(`<xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${pathFor(e.path, "ka")}"/>`)
          .join("");
        return `<url><loc>${SITE_URL}${pathFor(e.path, lang)}</loc>${alternates}${
          e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ""
        }<changefreq>${e.changefreq}</changefreq><priority>${e.priority}</priority></url>`;
      })
    )
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls}\n</urlset>\n`,
    {
      headers: {
        "content-type": "application/xml; charset=utf-8",
        "cache-control": "public, max-age=3600",
      },
    }
  );
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

export default async (request, context) => {
  const url = new URL(request.url);
  if (url.pathname === "/sitemap.xml") return sitemap();

  const response = await context.next();
  if (!(response.headers.get("content-type") || "").includes("text/html")) return response;

  const pathname = url.pathname.length > 1 ? url.pathname.replace(/\/+$/, "") : url.pathname;
  const lang = langFromPath(pathname);
  const basePath = stripLang(pathname);
  const s = STRINGS[lang];

  let page = null;
  try {
    if (basePath === "/") page = await homePage(lang, s);
    else if (basePath === "/machines") page = await listingPage(lang, s);
    else if (basePath === "/partners") page = partnersPage(lang, s);
    else if (basePath === "/about") page = aboutPage(lang, s);
    else if (basePath === "/contact") page = contactPage(lang, s);
    else {
      const match = basePath.match(/^\/machines\/([a-z0-9-]+)$/);
      if (match) {
        page = await detailPage(lang, s, match[1]);
        if (page?.notFound) page = notFoundPage(s);
      } else {
        page = notFoundPage(s);
      }
    }
  } catch (err) {
    console.error("seo edge function:", err);
    page = null;
  }

  if (!page) return response; // Unknown state: leave the SPA shell untouched.

  const html = rewriteHtml(await response.text(), page, lang, basePath);
  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("content-type", "text/html; charset=utf-8");
  return new Response(html, { status: page.status || response.status, headers });
};

export const config = {
  path: "/*",
  excludedPath: [
    "/static/*",
    "/images/*",
    "/*.js",
    "/*.css",
    "/*.png",
    "/*.jpg",
    "/*.jpeg",
    "/*.webp",
    "/*.svg",
    "/*.ico",
    "/*.json",
    "/*.txt",
    "/*.map",
  ],
};
