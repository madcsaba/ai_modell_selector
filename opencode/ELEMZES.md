# OpenCode-ban választható modellek: elemzés

Az adatok a [models.dev](https://github.com/sst/models.dev) nyílt adatbázis 2026. november 16-i állapotából (`511bd7f`) és az OpenCode dokumentációjából származnak.
Az interaktív változat az `index.html` ebben a mappában.

## 1. Honnan jönnek a modellek?

Az OpenCode `/models` választója a **models.dev** katalógusából épül. Ezt az adatbázist az OpenCode csapata tartja karban, közösségi hozzájárulásokkal. Ebből következik:

- Elvileg **bármelyik models.dev-szolgáltató** bármelyik modellje választható. A választóban viszont csak azok látszanak, amelyek szolgáltatóját a projektben összekötötted (`/connect`), és amelyek nincsenek kivezetve.
- Két szolgáltatás az OpenCode sajátja:
  - **Zen** (`opencode/…`): használat szerinti fizetés, a legtöbb modell a labor listaárán, plusz időszakosan ingyenes modellek.
  - **Go** (`opencode-go/…`): havidíjas csomag, főleg nyílt kódolómodellekre. Go $10, Go Plus $40, Go Teams $20/fő havonta.

## 2. A katalógus számokban

| | Érték |
|---|---|
| Szolgáltató | **329** (ebből 323-nak van szöveges modellje) |
| Szöveges modell-bejegyzés (szolgáltató × modell) | **9 384**, ebből 836 kivezetett, **8 548 aktív** |
| Egyedi modell | **1 422**, ebből **511 laborhoz kötött**; 911 szolgáltató-specifikus címke, sokszor ugyanannak a modellnek más neve |
| Laborhoz kötött modellek közül nyílt súlyú | **53%** |
| … eszközhívást tud (ágenshez szükséges) | 88% |
| … gondolkodó (reasoning) mód | 65% |
| … képet fogad | 59% |
| … legalább 1M token kontextus | 32% |
| … 2026-os kiadás | 50%, ebből a fele 2026 második félévi |
| Legtöbb modell laboronként | OpenAI 60, Alibaba 59, Mistral 45, Google 37, Anthropic 27, DeepSeek 21, Meta 21, Zhipu 18 |
| Legszélesebben elérhető | GLM-5.3 (133 szolgáltatónál), GLM-5.3-Flash (129), Kimi K3 (100), DeepSeek V4.1 Flash (89), GPT OSS 120B (77) |

**OpenCode Zen:** 89 aktív modell, ebből 13 ingyenes és 23 nyílt súlyú. A fájlokban 51 kivezetett bejegyzés is szerepel, ezek a választóban nem jelennek meg.
Laboronként: OpenAI 24, Anthropic 15, Google 10, Zhipu 6, valamint további 15 labor 1–4 modellel.

**OpenCode Go:** 34 aktív modell, közös havi kerettel.

## 3. Fő megállapítások

### 3.1 A választék túl nagy ahhoz, hogy listából lehessen dönteni
A 9 384 bejegyzésből 8 548 aktív, és a nevek nem egységesek. Ugyanaz a modell különböző szolgáltatóknál más címkével szerepel („Kimi K2.7 Code”, „Kimi K2.7 Code HighSpeed”, „moonshotai/kimi-k2.7-code”…). Ezért az oldal **labormodellekre vonja össze** a bejegyzéseket, és alapból csak az 511 laborhoz kötött modellt mutatja.

### 3.2 Harmadik feles árak: óvatosan
A hivatalos árral is rendelkező 127 modellből **45-nél van olyan ajánlat, amely 40%-nál többel olcsóbb a labor saját áránál**. A Claude Opus 5.5 például $0,90 / $4,50-ért is szerepel a hivatalos $4 / $20 helyett.
Ez lehet promóció vagy tömeges kedvezmény, de gyakran ellenőrizetlen viszonteladó áll mögötte. Ügyfélkódot vagy érzékeny adatot ilyen szolgáltatón keresztül ne küldj. Az oldal ezeket „gyanús” címkével jelöli.

### 3.3 A Zen többnyire listaáron ad, de nem mindig
- Az Anthropic-, OpenAI- és Google-modellek a Zenben a labor listaárán futnak.
- A **GLM-modellek** a Zenben 10–38%-kal drágábbak, mint a Z.ai saját API-ján.
- A **DeepSeek V4 Pro** a Zenben még az induló $1,74 / $3,48 áron fut. A DeepSeek saját API-ján és az OpenCode Go-ban $0,66 / $1,98.
- Fordított eset is van: a GPT-5 a Zenben 15%-kal olcsóbb.

### 3.4 Ingyenes modellek: az adatkezelés a döntő
A 13 ingyenes Zen-modell nagyon eltérő feltételekkel fut:

| Feltétel | Modellek | Ügyfélkódhoz? |
|---|---|---|
| Nem tárol, nem tanít (zero-retention) | GLM-5.3-Flash Free, DeepSeek V4.1 Flash Free, MiniMax M3.1 Flash Free, Hy4 flash Free, LongCat 2.5 Free (napi 100 kérés, Kínában fut) | igen, a szolgáltató vállalása szerint |
| 30 napig tárol, nem tanít | Beam Free | megfontolandó |
| Visszajelzés-gyűjtés a modell fejlesztésére | Big Pickle, Iceman Free, Flint 40B Free, MiMo-V2.6-Flash Free, Nemotron 3.5 Lightning/Super VL Free | nem ajánlott |
| Tárol és tanít, **az EU-ban nem elérhető** | Inkling 2 Small Free | nem (Magyarországról nem is használható) |

Az ingyenes modellek a `OPENCODE_DISABLE_FREE_MODELS=1` környezeti változóval elrejthetők. Céges használatnál érdemes bekapcsolni.

### 3.5 Az OpenCode Go mennyit ér?
A Go egy közös havi keretet ad. A dokumentáció modellenként megadja, hány tipikus kódolási kérés fér bele egy hónapba ($10-es Go csomag):

| Modell | Kérés / hó | Megjegyzés |
|---|---|---|
| DeepSeek V4.1 Flash | ≈ 216 670 | a legtöbb |
| MiMo-V2.6-Flash, MiMo-V2.5 | ≈ 150 400 | |
| LongCat-2.0 | ≈ 57 200 | |
| GLM-5.3-Flash | ≈ 31 580 | jó egyensúly |
| GPT-6 Luna | ≈ 21 130 | |
| Claude Haiku 5.5 | ≈ 19 230 | |
| GLM-5.3 | ≈ 1 080 | erős, de drága |
| Grok 4.7 | ≈ 845 | |
| Kimi K3 | ≈ 490 | a legkevesebb |

Ötórás ablakban a havi keret 20%-a, hetente 50%-a használható el. Kis és közepes modellekkel a $10 nagyon sok munkára elég; a nagy modellekkel (Kimi K3, Grok 4.7, GLM-5.3) gyorsan elfogy.

### 3.6 Benchmarkok: csak óvatosan
A models.dev a laborok által közölt eredményeket tárolja (SWE-Bench Pro, Terminal-Bench, DeepSWE…). Ezek **nem hasonlíthatók össze közvetlenül**: eltér a benchmark verziója, az effort-szint, az időkorlát és a futtatási környezet. Ugyanazon a „Terminal-Bench” néven egyszer 19, máskor 89 szerepel. Az oldal ezért csak az adatlapon mutatja őket, a beállításokkal együtt, és nem rangsorol velük.

## 4. Ajánlás OpenCode-hoz (2026. november)

| Cél | Modell (OpenCode-azonosító) | Ár be / ki $/1M |
|---|---|---|
| Legnehezebb feladatok | `opencode/claude-opus-5-5`, `opencode/gpt-6.1-sol`, `opencode/gemini-4-carbon` | 4/20 · 2/10 · 2/10 |
| Ha minden más elakad | `opencode/claude-fable-5-2` | 8/40 |
| Napi fejlesztés | `opencode/claude-sonnet-5-5`, `opencode/gemini-3.8-flash`, `opencode/gemini-4-hydrogen` | 2/10 · 0,75/3,75 · 1,5/7,5 |
| Olcsó al-ágens, kódkeresés | `opencode/gpt-6-luna`, `opencode/claude-haiku-5-5`, `opencode/glm-5.3-flash` | 0,10/0,50 · 0,10/0,50 · 0,15/0,50 |
| Nyílt súlyú (önálló hosztolás is) | `opencode/glm-5.3`, `opencode-go/kimi-k3`, `opencode-go/deepseek-v4-pro` | 1,4/4,4 · 3/15 · 0,66/1,98 |
| Ingyen, ügyfélkódhoz is | `opencode/glm-5.3-flash-free`, `opencode/deepseek-v4.1-flash-free` | 0 |
| Fix havidíjjal | Go ($10): DeepSeek V4.1 Flash, GLM-5.3-Flash, MiMo-V2.6-Flash | keretből |

Bevált felállás: egy erős fő modell (pl. Claude Sonnet 5.5 vagy GPT-6.1 Sol) és egy olcsó modell a kódot olvasó-kereső `explore` al-ágensnek (pl. GPT-6 Luna vagy Claude Haiku 5.5). Az OpenCode-ban ez ügynökönként beállítható (`opencode.jsonc`):

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "model": "opencode/claude-sonnet-5-5",
  "agents": {
    "explore": {
      "model": { "providerID": "opencode", "model": "gpt-6-luna" }
    }
  }
}
```

## 5. Hatás a fő Modellválasztóra

Az elemzés során kiderült, hogy a fő katalógus első verziója a keresési találatokra támaszkodott, ezért több ponton elavult volt. Ezeket javítottam:

- **OpenAI:** a csúcs már a GPT-6 család. GPT-6 Astra ($10/$50), GPT-6.1 Sol ($2/$10), GPT-6.1 Terra ($1/$5), GPT-6 Luna ($0,10/$0,50). A GPT-5.5 már nem a zászlóshajó.
- **Google:** Gemini 4 Carbon és Argon ($2/$10), Gemini 4 Hydrogen ($1,5/$7,5), Gemini 3.8 Flash ($0,75/$3,75), Gemini 3.5 Flash-Lite. A Gemini 3.1 Pro előzetes verziója elavult.
- **Mistral:** a Large 4 kontextusa 1M, a súlyai **nem nyíltak**, az ára $0,70/$2,10, állapota béta. A Small 4 kontextusa 256K. A Devstral 2 kivezetés alatt áll.
- **DeepSeek:** a V4 Pro hivatalos ára $0,66/$1,98. A V4 Flash utódja a V4.1 Flash ($0,15/$0,60, képbemenettel).

## 6. Frissítés

Az adatok a `build/` mappában lévő szkripttel frissíthetők (lásd `build/README.md`). A szkript csak adatként olvassa a models.dev TOML-fájljait, a repó saját kódját nem futtatja.
