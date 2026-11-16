// Generates memek/memek.js from the images in this folder.
// Captions come from feliratok.json ({"fajlnev.png": "Felirat"}); images without one get no caption.
// Usage (repo root): node memek/generate.mjs
import fs from "node:fs";
import path from "node:path";

const dir = path.dirname(new URL(import.meta.url).pathname);
const IMG = /\.(png|jpe?g|gif|webp|avif|svg)$/i;
let captions = {};
try { captions = JSON.parse(fs.readFileSync(path.join(dir, "feliratok.json"), "utf8")); } catch (e) { /* optional */ }

const kepek = fs.readdirSync(dir)
  .filter((f) => IMG.test(f))
  .sort((a, b) => a.localeCompare(b, "hu"))
  .map((fajl) => ({ fajl, felirat: typeof captions[fajl] === "string" ? captions[fajl] : "" }));

const out = "// Automatikusan generálva (memek/generate.mjs). Ne szerkeszd kézzel.\nwindow.MEMEK = " + JSON.stringify({ kepek }, null, 2) + ";\n";
fs.writeFileSync(path.join(dir, "memek.js"), out);
console.log(`${kepek.length} kép a listában`);
