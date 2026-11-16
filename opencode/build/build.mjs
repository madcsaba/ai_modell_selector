// Builds opencode/data.json from a local models.dev checkout (data only: TOML files are parsed, no repo code runs).
// Usage: node build.mjs <models.dev dir> <opencode docs dir> <out.json>
import { parse } from "smol-toml";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const [, , MD, DOCS, OUT] = process.argv;
const IGNORED = new Set(["azure-cognitive-services", "google-vertex-anthropic"]);
const NON_CHAT = new Set(["embedding", "image", "speech", "transcription", "video", "audio", "realtime", "reranking", "decision", "extraction"]);
const MEDIA_APIS = new Set(["images", "embeddings", "speech", "transcriptions", "videos"]);

const readToml = (f) => { try { return parse(fs.readFileSync(f, "utf8")); } catch (e) { return null; } };
function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc); else if (e.name.endsWith(".toml")) acc.push(p);
  }
  return acc;
}
const isObj = (v) => v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date);
function merge(a, b) {
  if (!isObj(a)) return b; if (!isObj(b)) return b === undefined ? a : b;
  const o = { ...a };
  for (const k of Object.keys(b)) o[k] = isObj(a[k]) && isObj(b[k]) ? merge(a[k], b[k]) : b[k];
  return o;
}
const str = (d) => { if (d == null) return null; const v = d instanceof Date ? d.toISOString().slice(0, 10) : String(d).slice(0, 10); return v < "2015" ? null : v; };
const num = (v) => (typeof v === "number" && isFinite(v) ? v : null);

// Lab models and lab names
const labCache = new Map();
function labModel(ref) {
  if (!labCache.has(ref)) labCache.set(ref, readToml(path.join(MD, "models", ref + ".toml")));
  return labCache.get(ref);
}
const labNames = {};
for (const d of fs.readdirSync(path.join(MD, "labs"))) {
  const t = readToml(path.join(MD, "labs", d, "lab.toml")); if (t?.name) labNames[d] = t.name;
}

function flatten(providerId, id, m) {
  const ti = m.cost?.text?.input, to = m.cost?.text?.output;
  const inMods = (m.modalities?.input || []).map(String);
  const apis = Object.keys(m.api || {});
  return {
    id, p: providerId,
    n: m.name || id,
    lab: m._lab || null,
    fam: m.family || null,
    ow: m.open_weights === true ? 1 : m.open_weights === false ? 0 : null,
    rel: str(m.release_date), kn: str(m.knowledge),
    st: m.status || null,
    ctx: num(m.limit?.context), mo: num(m.limit?.output),
    img: inMods.some((x) => x.startsWith("image")) ? 1 : 0,
    pdf: inMods.some((x) => x.includes("pdf")) ? 1 : 0,
    tools: m.capabilities?.tools?.supported === true ? 1 : 0,
    reas: m.capabilities?.reasoning?.supported === true ? 1 : 0,
    in: num(ti?.price), out: num(to?.price), cr: num(ti?.cache?.read),
    long: Array.isArray(ti?.overrides) && ti.overrides.length ? 1 : 0,
    bench: (m.benchmarks || []).filter((b) => b && b.name && typeof b.score === "number").slice(0, 6).map((b) => [String(b.name), b.score, b.metric ? String(b.metric) : "", b.variant ? String(b.variant) : ""]),
    _chat: !NON_CHAT.has(m.type) && (m.modalities?.output ? m.modalities.output.map(String).includes("text") : true) && !(apis.length && apis.every((a) => MEDIA_APIS.has(a)))
  };
}

const providers = [], rows = [];
for (const pid of fs.readdirSync(path.join(MD, "providers")).sort()) {
  const ptoml = readToml(path.join(MD, "providers", pid, "provider.toml"));
  if (!ptoml || IGNORED.has(pid) || ptoml.v1_alias !== undefined) continue;
  const mdir = path.join(MD, "providers", pid, "models");
  let count = 0;
  for (const f of walk(mdir)) {
    const raw = readToml(f); if (!raw) continue;
    const id = path.relative(mdir, f).replace(/\.toml$/, "");
    let m = raw;
    if (raw.base_model) {
      const base = labModel(raw.base_model);
      m = merge(base || {}, raw);
      m._lab = String(raw.base_model).split("/")[0];
      m._key = String(raw.base_model);
    } else { m._key = pid + "/" + id; }
    const r = flatten(pid, id, m); r.key = m._key;
    if (!r._chat) continue;
    delete r._chat; rows.push(r); count++;
  }
  providers.push({ id: pid, n: ptoml.name || pid, doc: ptoml.doc || null, count });
}

// Unique models across providers (active only)
const active = rows.filter((r) => r.st !== "deprecated");
const byKey = new Map();
for (const r of active) {
  if (!byKey.has(r.key)) byKey.set(r.key, []);
  byKey.get(r.key).push(r);
}
const unique = [];
for (const [key, list] of byKey) {
  const priced = list.filter((r) => r.in != null && r.out != null);
  const paid = priced.filter((r) => r.in > 0 || r.out > 0);
  const cheapest = paid.sort((a, b) => (a.in * 3 + a.out) - (b.in * 3 + b.out))[0] || null;
  const official = list.find((r) => r.p === r.lab && r.in != null);
  const first = official || list.find((r) => r.p === r.lab) || list[0];
  unique.push({
    key, n: first.n, lab: first.lab, fam: first.fam, ow: first.ow, rel: first.rel, kn: first.kn,
    ctx: Math.max(...list.map((r) => r.ctx || 0)) || null,
    img: list.some((r) => r.img) ? 1 : 0, tools: list.some((r) => r.tools) ? 1 : 0, reas: list.some((r) => r.reas) ? 1 : 0,
    np: new Set(list.map((r) => r.p)).size,
    free: priced.some((r) => (r.p === "opencode" || r.p === "opencode-go") && r.in === 0 && r.out === 0) ? 1 : 0,
    in: cheapest ? cheapest.in : null, out: cheapest ? cheapest.out : null, cp: cheapest ? cheapest.p : null,
    oin: official ? official.in : null, oout: official ? official.out : null,
    zen: list.some((r) => r.p === "opencode") ? 1 : 0, go: list.some((r) => r.p === "opencode-go") ? 1 : 0,
    zid: (list.find((r) => r.p === "opencode" && r.in > 0) || list.find((r) => r.p === "opencode") || {}).id || null,
    gid: (list.find((r) => r.p === "opencode-go" && r.in > 0) || list.find((r) => r.p === "opencode-go") || {}).id || null,
    oid: official ? official.id : null,
    bench: (list.find((r) => r.bench.length) || first).bench
  });
}

// OpenCode Go monthly limits from the docs table (Go plan tab is the first table)
// OpenCode Go: monthly dollar limits (Go and Go Plus tabs) and estimated requests per month (Go tab), from the docs.
const nk = (s) => String(s).replace(/\(.*?\)/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
function slotTable(src, tabsId, slot) {
  const t = src.indexOf(`<PlanTabs id="${tabsId}"`); if (t < 0) return [];
  const s = src.indexOf(`slot="${slot}"`, t); if (s < 0) return [];
  const e = src.indexOf("</div>", s);
  return src.slice(s, e).split("\n").map((l) => l.split("|").map((x) => x.trim())).filter((c) => c.length > 4 && c[1] && !c[1].startsWith("-") && c[1] !== "Model");
}
const goDoc = {};
const cleanCell = (v) => (v || "").replace(/<[^>]+>/g, " ").replace(/\*|~~[^~]*~~/g, "").replace(/\s+/g, " ").trim();
try {
  const src = fs.readFileSync(path.join(DOCS, "console", "go.mdx"), "utf8");
  for (const [slot, field] of [["go", "lim"], ["go-plus", "limPlus"]])
    for (const c of slotTable(src, "go-pricing", slot)) { const k = nk(c[1]); goDoc[k] = goDoc[k] || {}; if (!goDoc[k][field]) goDoc[k][field] = cleanCell(c[6]); }
  for (const c of slotTable(src, "go-requests", "go")) { const k = nk(c[1]); goDoc[k] = goDoc[k] || {}; goDoc[k].req = cleanCell(c[4]); }
} catch (e) { /* docs optional */ }
function goInfo(name) {
  const k = nk(name);
  if (goDoc[k]) return goDoc[k];
  const pref = Object.keys(goDoc).filter((d) => k.startsWith(d)).sort((a, b) => b.length - a.length)[0];
  return pref ? goDoc[pref] : {};
}

// Labs without a display name in labs/: fall back to the same-id provider name, else a title-cased id.
for (const u of unique) if (u.lab && !labNames[u.lab]) {
  const pv = providers.find((p) => p.id === u.lab);
  labNames[u.lab] = pv ? pv.n : u.lab.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const strip = (r) => { const { key, ...o } = r; return o; };
const zen = rows.filter((r) => r.p === "opencode").map(strip);
const go = rows.filter((r) => r.p === "opencode-go").map((r) => { const g = goInfo(r.n); return { ...strip(r), lim: g.lim || null, limPlus: g.limPlus || null, req: g.req || null }; });
const goLimits = goDoc;

let commit = null, commitDate = null;
try { commit = execSync("git -C " + JSON.stringify(MD) + " log -1 --format=%h").toString().trim(); commitDate = execSync("git -C " + JSON.stringify(MD) + " log -1 --format=%cs").toString().trim(); } catch (e) {}

const out = {
  generated: new Date().toISOString().slice(0, 10), source: "https://github.com/sst/models.dev", commit, commitDate,
  labNames,
  totals: {
    providers: providers.length, providerModels: rows.length, active: active.length,
    deprecated: rows.length - active.length, unique: unique.length
  },
  providers: providers.filter((p) => p.count > 0).sort((a, b) => b.count - a.count),
  zen, go, unique
};
fs.writeFileSync(OUT, OUT.endsWith(".js") ? "window.OC_DATA = " + JSON.stringify(out) + ";\n" : JSON.stringify(out));
console.log(JSON.stringify(out.totals), "zen", zen.length, "go", go.length, "goLimits", Object.keys(goLimits).length, "bytes", fs.statSync(OUT).size);
