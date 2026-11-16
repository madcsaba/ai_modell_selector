# AI Modellválasztó

Független, magyar nyelvű segédoldal nagy nyelvi modellek kiválasztásához. Állapot: 2026. november 16.

| Oldal | Mire jó |
|---|---|
| [`index.html`](index.html) | A feladat leírásából modellt ajánl. Havi költséget becsül, és 23 aktuális modellt hasonlít össze (Anthropic, OpenAI, Google, Mistral, DeepSeek). |
| [`memek/`](memek/) | A főoldal mémsarka: Fortepan-fotók a beállított keresések és címkék alapján (lásd [`memek/README.md`](memek/README.md)). |
| [`opencode/`](opencode/) | Az [OpenCode](https://opencode.ai) kódoló ágensben választható modellek: Zen, Go és a teljes models.dev-katalógus, több mint 1 400 modell. |

## Dokumentumok

- [`ERTEKELES.md`](ERTEKELES.md): az eredeti alkalmazás (`eredeti.html`) értékelése. Ténybeli hibák, programhibák, UI/UX javaslatok.
- [`opencode/ELEMZES.md`](opencode/ELEMZES.md): az OpenCode-modellek elemzése és ajánlások.
- [`opencode/build/README.md`](opencode/build/README.md): az OpenCode-adatok frissítése.

## Futtatás

Nincs build-lépés: az `index.html` böngészőben közvetlenül megnyitható, és GitHub Pages-en is működik (Settings → Pages → `main` ág, gyökérmappa).

## Adatforrások

[models.dev](https://github.com/sst/models.dev), az OpenCode dokumentációja és a szolgáltatók hivatalos árlistái. Az értékelések (1–5) szerkesztői becslések, nem mérések. Az árak listaárak, kedvezmények nélkül.
