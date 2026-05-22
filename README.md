# Knowledge Explorer

![Knowledge Graph](public/graph-cover.svg)

Un'applicazione web per esplorare, cercare e interrogare le proprie note markdown con l'aiuto dell'intelligenza artificiale. Funziona con qualsiasi raccolta di note markdown — non è vincolato a un'app specifica.

## Funzionalità

| Feature | Descrizione |
|---------|-------------|
| **Grafo interattivo** | Visualizza le note come nodi colorati per categoria, con collegamenti cross-topic evidenziati. Clicca un nodo per vedere l'anteprima. |
| **Ricerca full-text** | Motore di ricerca fuzzy (fuse.js) su titolo, contenuto e collegamenti delle note. |
| **RAG con AI** | Fai domande in linguaggio naturale e ottieni risposte generate da un LLM, con le fonti citate e cliccabili. |
| **Temi** | Dark mode futuristico con effetti spaziali (default) e light mode. |
| **Sidebar categorie** | Filtra il grafo per categoria (AI Ethics, Claude Code, Estratti, ecc.). |
| **Esportazione** | Scarica le note come Markdown o PDF. |
| **Configurabile** | Funziona con qualsiasi cartella di note markdown. Configura sorgente, pattern e nome app. |

## Stack

- **Next.js 16** (App Router, React 19)
- **ShadCN UI** + **Tailwind CSS v4**
- **vis-network** — grafo interattivo
- **fuse.js** — ricerca fuzzy
- **Vercel AI SDK** — integrazione LLM con streaming
- **OpenRouter** / **Ollama** / **OpenAI** — provider LLM

## Installazione

```bash
# Clona il repo
git clone https://github.com/tuo-username/upnote-explorer.git
cd upnote-explorer

# Installa dipendenze
npm install

# Pre-processa le note (genera data/notes.json)
npx tsx scripts/build-notes.ts

# Avvia il dev server
npm run dev
```

Apri [http://localhost:3000](http://localhost:3000).

## Configurazione

### Note sorgente (`notes.config.json`)

Il file `notes.config.json` nella root del progetto definisce dove trovare le note:

```json
{
  "source": "..",
  "pattern": "UpNote_*",
  "filesDir": "Files",
  "appName": "UpNote Knowledge Explorer",
  "appDescription": "Esplora e cerca nelle tue note UpNote con AI"
}
```

| Campo | Descrizione | Default |
|-------|-------------|---------|
| `source` | Percorso (relativo alla root del progetto o assoluto) della cartella contenente le sottocartelle con le note | `..` |
| `pattern` | Pattern per selezionare le sottocartelle: `Prefisso_*` (prefisso), `*` (tutte), o nome esatto | `UpNote_*` |
| `filesDir` | Nome della sottocartella dentro ogni cartella note che contiene gli allegati | `Files` |
| `appName` | Nome mostrato nei messaggi console del build | `UpNote Knowledge Explorer` |
| `appDescription` | Descrizione per i messaggi console | — |

Puoi anche usare flag CLI come override: `--source`, `--pattern`, `--files-dir`.

Il nome dell'app nell'interfaccia UI è configurabile separatamente tramite la variabile d'ambiente `NEXT_PUBLIC_APP_NAME` in `.env.local`.

### LLM (`.env.local`)

### OpenRouter (consigliato, modelli gratuiti)

```env
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free
```

### Ollama (locale)

```env
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### OpenAI

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

## Come aggiungere le tue note

1. Posiziona le tue cartelle con note markdown in una directory
2. Modifica `notes.config.json` impostando `source` al percorso della directory e `pattern` al pattern desiderato (es. `*` per tutte le sottocartelle)
3. Ogni cartella deve contenere file `.md` e opzionalmente una sottocartella `Files/` con gli allegati
4. Esegui `npx tsx scripts/build-notes.ts` (o `npm run dev` che lo esegue automaticamente)
5. Le note vengono indicizzate in `data/notes.json`

### Esempi di configurazione

**Note UpNote (default):**
```json
{ "source": "..", "pattern": "UpNote_*" }
```

**Qualsiasi cartella markdown:**
```json
{ "source": "/home/user/mie-note", "pattern": "*" }
```

**Singola cartella specifica:**
```json
{ "source": "/home/user/docs", "pattern": "appunti" }
```

**Override da riga di comando:**
```bash
npx tsx scripts/build-notes.ts --source /percorso/note --pattern "*"
```

## Struttura

```
upnote-explorer/
├── notes.config.json          # Configurazione build (sorgente, pattern)
├── app/
│   ├── layout.tsx             # Root layout + theming
│   ├── page.tsx               # Pagina principale
│   └── api/
│       ├── search/route.ts    # Ricerca fuse.js
│       ├── ask/route.ts       # RAG con LLM
│       └── rebuild/route.ts   # Re-index + reload
├── components/
│   ├── note-graph.tsx         # Grafo vis.js
│   ├── search-bar.tsx         # Barra di ricerca
│   ├── search-results.tsx     # Risultati testuali
│   ├── rag-answer.tsx         # Risposta AI + fonti
│   ├── sidebar-nav.tsx        # Sidebar categorie
│   ├── note-sheet.tsx         # Anteprima nota
│   ├── space-background.tsx   # Sfondo animato
│   ├── statistics.tsx         # Dashboard statistiche
│   └── theme-toggle.tsx       # Toggle dark/light
├── lib/
│   ├── types.ts               # Tipi TypeScript
│   ├── notes-loader.ts        # Caricamento note
│   └── search-engine.ts       # Fuse.js config
├── scripts/
│   └── build-notes.ts         # Pre-processing .md → JSON
└── data/
    └── notes.json             # Note indicizzate (generato)
```

## Test

Comandi per verificare che la configurazione e il build funzionino correttamente:

**Test 1 — Pattern `*` (tutte le cartelle)**
```bash
npx tsx scripts/build-notes.ts --source .. --pattern "*"
```
Dovrebbe trovare tutte le sottocartelle con `.md` nella directory `source`.

**Test 2 — Cartella di prova temporanea**
```bash
mkdir -p /tmp/test-notes/mie-note
echo "# Test | Nota di prova" > /tmp/test-notes/mie-note/test.md
echo "# Cat | Seconda nota" > /tmp/test-notes/mie-note/altra.md
npx tsx scripts/build-notes.ts --source /tmp/test-notes --pattern "*"
```
Crea note finte e verifica che il build le processi correttamente.

**Test 3 — Override CLI (equivale alla config di default)**
```bash
npx tsx scripts/build-notes.ts --source .. --pattern "UpNote_*"
```
Verifica che i flag CLI funzionino come override di `notes.config.json`.

**Test 4 — App UI completa**
```bash
npm run dev
```
Avvia il dev server. Verifica che il titolo nell'header, sidebar e metadata HTML usino `NEXT_PUBLIC_APP_NAME` da `.env.local`.

## Licenza

MIT
