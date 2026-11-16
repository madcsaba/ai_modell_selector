# Mémsarok

A főoldal minden betöltéskor véletlenszerűen mutat egy képet, két forrásból fele-fele arányban:

1. **Saját mémek:** az ebben a mappában lévő képek.
2. **Fortepan-fotók:** a `fortepan.json`-ban beállított keresések és címkék találatai a [Fortepan](https://fortepan.hu) archívumából.

A „Másikat” gombbal lehet tovább lapozni.

## Fortepan-keresések beállítása

Szerkeszd a `fortepan.json` fájlt (GitHubon: a fájl megnyitása, majd a ceruza ikon, végül **Commit changes**):

```json
{
  "keresesek": [
    "modell",
    "címke:divatbemutató",
    "címke:makett",
    "számítógép"
  ],
  "max_kep_keresesenkent": 150
}
```

- **Sima szó** (pl. `"modell"`): szabad szavas keresés, mint a fortepan.hu keresőjében. Keres a leírásban, a címkékben, a helyszínekben, az adományozó és a szerző nevében. Ugyanaz, mint a `https://fortepan.hu/hu/photos/?q=modell` link.
- **`címke:` előtaggal** (pl. `"címke:makett"`): csak a pontosan ilyen címkéjű fotók. A címkéket egy fotó adatlapján látod a fortepan.hu-n.
- **`max_kep_keresesenkent`**: legfeljebb ennyi fotót tárol keresésenként (1–500).

Mentés után a GitHub Action kb. egy perc alatt lekéri a találatokat a `fortepan.js`-be. Ezen kívül hetente egyszer (hétfő hajnalban) magától is frissít.

Sorsoláskor az oldal előbb a forrást választja (saját mém vagy Fortepan), aztán egy véletlen keresést vagy címkét, végül abból egy véletlen fotót. Így egy kevés találatú címke is ugyanúgy sorra kerül, mint egy több száz találatos.

Ha egy keresés nem ad találatot, a GitHub Action naplójában figyelmeztetés jelenik meg (Actions fül → „Mémlista frissítése”). Ilyenkor ellenőrizd az írásmódot a fortepan.hu-n.

A Fortepan-fotók licence CC BY-SA 3.0. Az oldal minden fotó alatt feltünteti a forrást (`Fortepan / adományozó neve`), és a fotó Fortepan-adatlapjára linkel.

## Saját kép feltöltése

1. Nyisd meg a `memek/` mappát a GitHubon, és kattints az **Add file → Upload files** gombra.
2. Húzd be a képet (PNG, JPG, GIF, WebP, AVIF vagy SVG), majd **Commit changes**.
3. A GitHub Action kb. fél perc alatt frissíti a `memek.js` listát, és a kép bekerül a sorsolásba.

Felirat (opcionális): a `feliratok.json` fájlba írd be a fájlnevet és a szöveget:

```json
{
  "uj-kep.png": "Amikor a modell magabiztosan téved."
}
```

Felirat nélkül a kép felirat nélkül jelenik meg, a képernyőolvasók pedig általános szöveget olvasnak fel. Ezért érdemes feliratot adni.

**Kép törlése:** töröld a fájlt a mappából; a lista automatikusan frissül.

## Kézi frissítés (ha nem GitHubon dolgozol)

A repó gyökeréből:

```bash
node memek/generate.mjs
```

```bash
node memek/fortepan.mjs
```

A `memek.js`-t és a `fortepan.js`-t ne szerkeszd kézzel, mert minden frissítéskor felülíródnak. Tipp: 1200 × 675 px körüli, 500 KB alatti képek töltődnek be gyorsan.
