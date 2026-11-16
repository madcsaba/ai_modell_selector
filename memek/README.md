# Mémsarok

A főoldal minden betöltéskor egy véletlen fotót mutat a [Fortepan](https://fortepan.hu) archívumából, a `fortepan.json`-ban beállított keresések és címkék alapján. A „Másikat” gombbal lehet tovább lapozni.

## Keresések és címkék beállítása

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

Sorsoláskor az oldal előbb egy véletlen keresést vagy címkét választ, aztán abból egy véletlen fotót. Így egy kevés találatú címke is ugyanúgy sorra kerül, mint egy több száz találatos.

Ha egy keresés nem ad találatot, a GitHub Action naplójában figyelmeztetés jelenik meg (Actions fül → „Mémsarok frissítése”). Ilyenkor ellenőrizd az írásmódot a fortepan.hu-n. Ha a Fortepan épp nem érhető el, a korábbi lista megmarad.

## Licenc

A Fortepan-fotók licence CC BY-SA 3.0. Az oldal minden fotó alatt feltünteti a forrást (`Fortepan / adományozó neve`), és a fotó Fortepan-adatlapjára linkel. A fotókat a Fortepan saját képszerveréről tölti be; a repóba csak a metaadatok kerülnek.

## Kézi frissítés

A repó gyökeréből:

```bash
node memek/fortepan.mjs
```

A `fortepan.js`-t ne szerkeszd kézzel, mert minden frissítéskor felülíródik.
