# AI Modellválasztó: értékelés és javaslatok

Ez a dokumentum az `eredeti.html` alkalmazást értékeli. A javított, továbbfejlesztett verzió az `index.html`.
Az adatok állapota: 2026. november 16.

## 1. Röviden

Az ötlet jó, mert a felhasználó a feladata alapján kap modellajánlást. A megvalósításnak viszont három nagy gondja van:

1. **Elavult a katalógus.** A 20 modellből (nem 22, ahogy a fejléc és a kódkomment írja) szinte mind 2024 végi és 2025 eleji kiadás. Ezek nagy része 2026 novemberére már megszűnt vagy kivezetés alatt áll. Áradat egyáltalán nincs benne, pedig modellválasztásnál ez az egyik legfontosabb szempont.
2. **Pontosnak látszik, de becslés.** A 0–100-as „erősség” értékek (pl. `coding: 96`) és az energiaállítások („85–90%-kal kevesebb energia”, „3–5x több energia”) forrás nélküliek. A „● Élő API Szinkronizálás” gomb villogó pontja olyan élő állapotot sugall, ami nincs mögötte.
3. **Több funkció nem, vagy hibásan működik:** a világos téma, a regex-alapú ajánló, a mentett katalógus frissítése és az importált modellek adatai.

## 2. Ténybeli hibák az eredeti katalógusban

### 2.1 A saját idejükben is hibás állítások

| Modell | Eredeti állítás | Helyesen |
|---|---|---|
| Gemini 2.5 Pro | „1M – 2M token” | 1M token; a 2M-es ablakot bejelentették, de nem jelent meg |
| Gemini 1.5 Pro | aktív, „2M” | 2025-ben kivezették |
| Codestral 25.01 | nyílt súlyú (`openWeight: true`) | csak API-n érhető el; az első Codestral 22B is csak nem-produktív licenccel volt nyílt |
| Mistral Large 2, Pixtral Large, Ministral 8B | nyílt súlyú | Mistral Research License alatt: kereskedelmi célra külön licenc kellett |
| „Ministral 8B / Mistral Small 3” | 128K kontextus | a Mistral Small 3 (24B) 32K kontextusú volt, ezért a két modell nem vonható össze |
| Claude 3.5 Haiku | „az Anthropic leggyorsabb és legolcsóbb modellje” | a Claude 3 Haiku olcsóbb volt |
| o3-mini / o1 | „megerősítéses tanulással (Chain-of-Thought) képzett” | a megerősítéses tanulás (RL) és a lánc-gondolkodás (CoT) két külön fogalom |
| GPT-4o mini | „nagyságrendekkel felülmúlja a GPT-3.5-öt” | túlzás: jobb nála, de nem nagyságrendekkel |
| DeepSeek-R1-Distill | érvelés 92, hatékonyság 95 | a desztillált változatok érezhetően gyengébbek az R1-nél |
| Offline lista | `openai/o3-high`, `gemini-2.5-pro-exp` 2000K | ilyen azonosító nincs, a kontextus 1M |
| Elírások | „Спеc.”, „Kód Спеcialista” (cirill betűk), „kóigeneráló” | „Spec.”, „Kódspecialista”, „kódgeneráló” |

### 2.2 Elavult, 2026 novemberére lecserélt modellek

| Eredeti | Mai helyzet | Az új verzióban |
|---|---|---|
| Claude 3 Opus, 3.5 Sonnet, 3.5 Haiku, 3.7 Sonnet | kivezetve | Claude Fable 5.2, Opus 5.5, Sonnet 5.5, Haiku 5.5 |
| GPT-4o, 4o mini, 4.5, o1, o3-mini | lecserélve (a GPT-4.5 az API-ból 2025-ben kikerült) | GPT-5.5, GPT-5.5 Pro, GPT-5.4 mini, GPT-5.4 nano, gpt-oss-120b/20b |
| Gemini 2.5 Pro / Flash / Flash-Lite, 1.5 Pro, Gemma 3 | a 3-as generáció váltotta | Gemini 3.1 Pro, 3 Flash, 3.1 Flash-Lite, Gemma 4 |
| Mistral Large 2, Codestral, Pixtral, Ministral 8B | Mistral 3 és 4 család | Large 4, Medium 3.5, Large 3, Small 4, Ministral 3, Devstral 2 |
| DeepSeek V3, R1, R1-Distill | a V4 váltotta; a `deepseek-chat` és `deepseek-reasoner` nevek 2026. július 24-től megszűntek | DeepSeek V4 Pro, V4 Flash |

### 2.3 Hiányzó szempontok

- **Ár:** egyáltalán nem szerepelt. Az új verzió dollár/millió token listaárat és havi költségbecslést mutat.
- **Licenc-árnyalatok:** a „nyílt súlyú” nem jelenti automatikusan, hogy kereskedelmi célra is szabadon használható (Apache 2.0, MIT, módosított MIT, kutatási licenc). Az új verzió kiírja a licencet.
- **Szolgáltató székhelye** (EU / USA / Kína): adatkezelési döntésnél számít.
- **„Teljes ökoszisztéma”:** a cím ezt ígérte, de kimaradt például a Meta Llama, a Qwen, a Grok és a Kimi. Az új verzió nem állít teljességet; a hiányzó modellek a „Saját modellek” menüben felvehetők.

### 2.4 Az adatok megbízhatósága

- Az Anthropic-adatok az Anthropic aktuális dokumentációjából származnak.
- Az OpenAI, Google, Mistral és DeepSeek adatai a hivatalos oldalakat idéző keresési találatokból származnak. A hivatalos oldalakat közvetlenül nem tudtam megnyitni.
- Ahol a források eltértek (DeepSeek V4 árai, Mistral Large 4 ára és licence, egyes kontextusméretek), ott az alkalmazás `≈` jellel figyelmeztet.
- Egyes forrásokban szereplő újabb neveket (GPT-5.6, Gemini 3.5/3.8 Flash) nem tudtam megerősíteni, ezért kimaradtak.

## 3. Programhibák

| # | Hiba | Hatás |
|---|---|---|
| 1 | **XSS:** a modellnév, a leírás és az OpenRouter-adatok szűrés nélkül kerülnek `innerHTML`-be | egy saját modell neve vagy egy API-válasz HTML-t és szkriptet juttathat az oldalba |
| 2 | **A világos téma nem működik:** minden szín fix sötét Tailwind-osztály, `dark:` változat nélkül | a gomb gyakorlatilag nem csinál semmit, és visszaváltani sem lehet rendesen |
| 3 | **A mentett katalógus felülírja a beépítettet** (`ai_selector_catalog_v2`) | aki egyszer hozzáadott egy modellt, soha nem kapja meg a frissített alapkatalógust; törölni sem lehet |
| 4 | A regex-ajánló **ékezetes mintát** keres normalizált szövegben (`költség`) | ez a minta sosem illeszkedik |
| 5 | Túl tág minták: `kep` → „képes”, `api` → „napi”, `git` → „digitális”, `kis` → „kiszolgál” | gyakori magyar szavak hamis igényt kapcsolnak be |
| 6 | Az „elemzés” szó automatikusan „hatalmas kontextus” igényt jelent | szinte minden leírásra 1M-es modellt ajánl |
| 7 | A 3. helyezett felirata fixen „Költség/Helyi opció” | akkor is ezt írja, ha a 3. modell drága és zárt |
| 8 | Ha nincs felismert igény, minden modell 50 pontot kap, és a szóegyezés dönt | véletlenszerű ajánlás |
| 9 | Az összehasonlítás 4. kijelölésnél **szó nélkül eldobja** az elsőt | meglepő, adatvesztésnek tűnik |
| 10 | Importáláskor minden Mistral- és DeepSeek-modell nyílt súlyú lesz, és kitalált 88-as pontokat kap | hamis adat kerül a katalógusba |
| 11 | A keresőmező kétféleképp viselkedik: két szóig szűr, utána nem | a felhasználó nem érti, miért tűnnek el vagy maradnak a kártyák |
| 12 | A modális ablakok nem zárhatók Esc-kel, nincs `role="dialog"`, nincs fókuszkezelés, a ✕ gombnak nincs címkéje | billentyűzettel és képernyőolvasóval nehezen használható |
| 13 | `localStorage` és `JSON.parse` `try/catch` nélkül | privát módban vagy sérült adatnál összeomlik |
| 14 | `py-0.2` érvénytelen Tailwind-osztály; a fejlécben fixen „22 modell” áll | apró, de hanyag |
| 15 | Tailwind Play CDN éles használatban | lassú betöltés, a konzol figyelmeztet; élesben nem ajánlott |

## 4. UI/UX javaslatok (az új verzióban megvalósítva)

**Szerkezet és hierarchia**
- **Egy fő feladat, egy képernyő:** a felül lévő feladatpanelből ajánlás lesz, alatta a teljes katalógus. A hős-szekció, a gradiensek, a 20+ emoji és a villogó „élő” jelzés kikerült, mert zajt adtak, információt nem.
- **Táblázat a kártyarács helyett:** 20+ modellt egy rendezhető táblázat (ár, kontextus, havi költség, illeszkedés) sokkal gyorsabban áttekinthetővé tesz, mint 20 hosszú leírású kártya. A részletek kattintásra, egy adatlapon nyílnak.
- **Leírás csak az adatlapon:** a háromsoros leírás minden kártyán túl sok szöveg egyszerre.

**Átlátható ajánló**
- **Felismert igények mint kapcsolható címkék:** a szövegből felismert igények „felismerve” jelöléssel megjelennek, és egy kattintással ki-be kapcsolhatók. Az eredeti rejtett regexei helyett a felhasználó látja és javíthatja, mit értett meg a rendszer.
- **Kemény feltételek külön:** nyílt súly, EU-s szolgáltató, stabil verzió, minimális kontextus, képbemenet. Ha emiatt egy modell sem marad, az oldal megmondja, mi szűkít túl, és egy gombbal feloldható.
- **Minőség és ár csúszkán:** a súlyozás a felhasználó döntése, nem rejtett konstans.
- **Havi költségbecslés:** a forgalom (millió token) megadásával minden modell mellett ott a várható havi díj.
- **Indoklás és figyelmeztetés:** minden ajánlásnál 2–3 konkrét indok és a fontos kockázatok szerepelnek (előzetes verzió, bizonytalan ár, kínai szolgáltató, mindig gondolkodó modell).

**Őszinte adatok**
- 1–5-ös skála a hamis pontosságú 0–100 helyett, „szerkesztői becslés” felirattal.
- Az energiaállítások kikerültek, és a módszertan elmondja, miért.
- Adatdátum a fejlécben, `≈` jel a bizonytalan értékeknél, hivatalos árlista-link minden adatlapon.

**Használhatóság**
- Az összehasonlítás legfeljebb 4 modellig tart. Az 5. jelölőnégyzet le van tiltva, és megjelenik a magyarázat; a sor legjobb értéke zöld.
- A saját modellek külön tárolódnak: törölhetők, JSON-ként kimásolhatók és visszatölthetők, a beépített katalógus pedig ettől függetlenül frissül.
- Natív `<dialog>`: Esc, kattintás a háttérre, fókuszkezelés. A `/` billentyű a keresőbe ugrik, a táblázat sorai Enterrel is megnyithatók.
- A világos és sötét téma a rendszerbeállítást követi, kézzel is váltható.
- Telefonon egyoszlopos elrendezés, és vízszintesen csak a táblázat görgethető.
- Minden adat escape-elve kerül a HTML-be.

## 5. További javaslatok (még nincs megvalósítva)

1. **Az adatok frissítése szerveroldalon.** Egy ütemezett szkript (pl. GitHub Actions) naponta lekérné a szolgáltatói árlistákat vagy az OpenRouter `/models` végpontját, és egy `models.json`-t generálna. A böngészőből indított lekérés helyett ez megbízható, és dátumozható.
2. **Független benchmarkok bevonása** (pl. LMArena, Artificial Analysis) a szerkesztői becslések mellé vagy helyett, forráshivatkozással.
3. **Magyar nyelvű saját mérés:** 20–30 tipikus magyar feladat (ügyfélszolgálat, hivatalos levél, összefoglaló) lefuttatva minden modellen. Ez lenne az oldal valódi hozzáadott értéke.
4. **Megosztható állapot:** a beállítások URL-be írása, hogy egy ajánlás linkként továbbküldhető legyen.
5. **Kedvezmények a költségbecslésben:** prompt cache és batch (jellemzően −50%) kapcsolóként.
6. **További szolgáltatók:** Meta Llama, Qwen, xAI, Moonshot. Ehhez a szűrők már készen vannak.
7. **Felhasználói teszt:** 5 felhasználó, 3 feladat („válassz modellt egy chatbothoz 50 000 Ft/hó keretből”). Mérd, mennyi idő alatt és mennyire magabiztosan döntenek.
