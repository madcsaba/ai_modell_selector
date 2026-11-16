// Lekéri a memek/fortepan.json-ban megadott Fortepan-keresések találatait, és memek/fortepan.js-be írja a metaadatokat.
// A képeket nem tölti le: az oldal a Fortepan saját képszerveréről jeleníti meg őket, forrásmegjelöléssel.
// Ugyanazt a nyilvános végpontot és lekérdezést használja, mint a fortepan.hu kereső
// (github.com/fortepan/fortepan.hu: src/api/search.js, functions/elastic-proxy).
//
// fortepan.json "keresesek" elemei:
//   "modell"          szabad szavas keresés (leírás, címke, helyszín, adományozó, szerző)
//   "címke:makett"    pontos Fortepan-címke
// Használat (repó gyökeréből): node memek/fortepan.mjs
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname);
const ENDPOINT = "https://fortepan.hu/api/elastic/prod/media/_search";
const cfg = JSON.parse(fs.readFileSync(path.join(dir, "fortepan.json"), "utf8"));
const terms = (cfg.keresesek || []).map(String).map((s) => s.trim()).filter(Boolean);
const MAX = Math.min(Math.max(Number(cfg.max_kep_keresesenkent) || 150, 1), 500);
if (!terms.length) { console.error("A fortepan.json nem tartalmaz keresést."); process.exit(1); }

// A fortepan.hu slugify-ja: kisbetű, ékezet nélkül (a *_search mezők így vannak indexelve).
const slug = (s) => s.toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
const TAG = /^(c[ií]mke|tag)\s*:\s*/i;

function queryFor(term) {
  if (TAG.test(term)) return { term: { cimke_search: slug(term.replace(TAG, "")) } };
  return {
    multi_match: {
      query: slug(term),
      fields: ["description_search", "cimke_search", "orszag_search", "varos_search", "helyszin_search", "adomanyozo_search", "szerzo_search"],
      type: "bool_prefix", lenient: true, operator: "and", tie_breaker: 0.8
    }
  };
}

const first = (v) => Array.isArray(v) ? v.filter(Boolean)[0] || "" : v || "";
const list = (v) => (Array.isArray(v) ? v : v ? [v] : []).filter(Boolean).map(String);

// Előző eredmények: ha egy keresés most hibára fut, a korábbi találatai megmaradnak.
let prev = {};
try {
  const old = fs.readFileSync(path.join(dir, "fortepan.js"), "utf8");
  const json = JSON.parse(old.slice(old.indexOf("{"), old.lastIndexOf("}") + 1));
  for (const k of json.keresesek || []) prev[k.nev] = k;
} catch (e) { /* első futás */ }

const keresesek = [];
for (const term of terms) {
  const isTag = TAG.test(term);
  const nev = isTag ? term.replace(TAG, "") : term;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "ai_modell_selector memek (github.com/madcsaba/ai_modell_selector)" },
      body: JSON.stringify({
        size: MAX,
        _source: ["mid", "year", "description", "adomanyozo_name", "szerzo_name", "cimke_name", "varos_name", "orszag_name"],
        query: { bool: { must: [queryFor(term)] } },
        sort: [{ mid: { order: "asc" } }]
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const hits = json?.hits?.hits || [];
    const total = typeof json?.hits?.total === "object" ? json.hits.total.value : json?.hits?.total;
    const kepek = hits.map((h) => h._source || {}).filter((s) => s.mid).map((s) => ({
      mid: Number(s.mid) || String(s.mid),
      ev: Number(s.year) > 0 ? Number(s.year) : null,
      leiras: String(first(s.description)).replace(/\s+/g, " ").trim().slice(0, 300),
      adomanyozo: String(first(s.adomanyozo_name)).trim(),
      szerzo: String(first(s.szerzo_name)).trim(),
      hely: [first(s.varos_name), first(s.orszag_name)].filter(Boolean).join(", "),
      cimkek: list(s.cimke_name).slice(0, 8)
    }));
    console.log(`${term}: ${kepek.length} kép (összes találat: ${total ?? "?"})`);
    if (kepek.length) keresesek.push({ nev, tipus: isTag ? "cimke" : "szo", osszes: total ?? kepek.length, kepek });
    else console.warn(`  Nincs találat erre: ${term}. Ellenőrizd az írásmódot a fortepan.hu-n.`);
  } catch (e) {
    console.error(`${term}: hiba (${e.message}); a korábbi találatok maradnak.`);
    if (prev[nev]) keresesek.push(prev[nev]);
  }
  await new Promise((r) => setTimeout(r, 1000)); // kíméljük a Fortepan szerverét
}

if (!keresesek.length) { console.error("Egyik keresés sem adott képet; a meglévő listát nem írom felül."); process.exit(1); }

const out = "// Automatikusan generálva (memek/fortepan.mjs a memek/fortepan.json alapján). Ne szerkeszd kézzel.\n" +
  "// Képek: Fortepan (fortepan.hu), CC BY-SA 3.0. Forrásmegjelölés: Fortepan / adományozó neve.\n" +
  "window.FORTEPAN = " + JSON.stringify({ lekerve: new Date().toISOString().slice(0, 10), keresesek }, null, 1) + ";\n";
fs.writeFileSync(path.join(dir, "fortepan.js"), out);
console.log(`Kész: ${keresesek.length} keresés, ${keresesek.reduce((a, k) => a + k.kepek.length, 0)} kép.`);
