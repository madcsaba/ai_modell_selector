# Az OpenCode-adatok frissítése

A `../data.js` fájlt a `build.mjs` állítja elő két nyilvános forrásból:

- [models.dev](https://github.com/sst/models.dev): a modellek és árak TOML-fájljai. Ebből építi az OpenCode is a `/models` listáját.
- az OpenCode dokumentációja ([sst/opencode](https://github.com/sst/opencode)): a Go-csomag keretei és kérésbecslései.

A szkript a TOML- és Markdown-fájlokat **csak adatként olvassa**, a letöltött repók kódját nem futtatja és nem telepíti.

## Lépések

A repó gyökeréből:

```bash
mkdir -p .cache
```

```bash
git clone --depth 1 https://github.com/sst/models.dev .cache/models.dev
```

```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/sst/opencode .cache/opencode
```

```bash
git -C .cache/opencode sparse-checkout set services/site/src/docs/content
```

```bash
cd opencode/build && npm install --ignore-scripts && npm run build
```

Ha a már letöltött repókat frissítenéd, a két `git clone` helyett futtasd ezt mindkét mappában:

```bash
git -C .cache/models.dev pull --depth 1
```

A `.cache/` mappa nem kerül a repóba (`.gitignore`).

## Mit állít elő?

`window.OC_DATA` egy objektum a következő mezőkkel:

| Mező | Tartalom |
|---|---|
| `totals` | szolgáltatók, bejegyzések, aktív, kivezetett és egyedi modellek száma |
| `zen`, `go` | az OpenCode Zen és Go modelljei, árral, kontextussal, képességekkel (a Go-nál havi kerettel és kérésbecsléssel) |
| `unique` | minden modell szolgáltatókon átívelően összevonva: hivatalos ár, legolcsóbb ajánlat, szolgáltatók száma |
| `providers` | a szolgáltatók listája modellszámmal |
| `labNames` | a laborok megjelenítendő neve |

A szöveget nem generáló modellek (kép, hang, beágyazás, rangsoroló stb.) kimaradnak.
