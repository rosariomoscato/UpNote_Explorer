# Stato del Progetto — UpNote Knowledge Explorer

Ultimo aggiornamento: 2026-05-22 (sessione 3)

## Cos'è

Web app Next.js che visualizza note markdown come grafo interattivo, con ricerca full-text e Q&A AI (RAG) con citazioni delle fonti. UI futuristica tema spazio. Configurabile per qualsiasi raccolta di note markdown.

## Stack

- Next.js 16, ShadCN UI, Tailwind CSS v4, vis-network, fuse.js, Vercel AI SDK
- framer-motion (animazioni), marked (markdown rendering)
- LLM: OpenRouter (`nvidia/nemotron-3-super-120b-a12b:free`) via `.env.local`
- GitHub: `https://github.com/rosariomoscato/UpNote_Explorer`
- Git author: `Rosario Moscato <ros.moscato@gmail.com>`

## Struttura chiave

```
upnote-explorer/
├── notes.config.json          ← configurazione build (source, pattern, filesDir, appName)
├── scripts/build-notes.ts     ← build pipeline (legge notes.config.json + CLI args)
├── lib/
│   ├── types.ts               ← Note, GraphNode/Edge, CATEGORY_COLORS
│   ├── notes-loader.ts        ← caricamento note + getRelatedNotes()
│   └── search-engine.ts       ← fuse.js doppio (text search + RAG, filtro categoria)
├── app/
│   ├── page.tsx               ← pagina principale con tutti gli stati UI
│   ├── layout.tsx             ← ThemeProvider + TooltipProvider + removeChild fix
│   ├── globals.css            ← tema futuro, glass-morphism, glow, markdown styles
│   └── api/
│       ├── ask/route.ts       ← RAG endpoint (filtro categoria)
│       ├── search/route.ts    ← fuse.js search (filtro categoria)
│       ├── summarize/route.ts ← riassunto nota singola via LLM
│       └── rebuild/route.ts   ← re-index + reload
├── components/
│   ├── note-graph.tsx         ← vis-network grafo con tooltip hover + mini-preview card
│   ├── note-sheet.tsx         ← Panel laterale custom (framer-motion) con markdown + allegati + link + breadcrumb + note correlate + export (MD/PDF) + highlight
│   ├── search-bar.tsx         ← barra ricerca + selettore modalità + keyboard shortcuts + cronologia ricerche
│   ├── search-results.tsx     ← lista risultati con fade-in animato + navigazione tastiera
│   ├── rag-answer.tsx         ← chat multi-turno AI (cronologia, follow-up, fonti per messaggio)
│   ├── sidebar-nav.tsx        ← sidebar categorie (filtro cliccabile)
│   ├── theme-toggle.tsx       ← dark/light toggle
│   ├── space-background.tsx   ← background spaziale animato (stelle, nebulose, stelle cadenti)
│   └── statistics.tsx         ← dashboard statistiche (categorie, note più collegate, timeline)
├── data/notes.json            ← generato dal build (gitignorato)
├── public/files/              ← allegati copiati dal build (gitignorato)
├── hooks/
│   ├── use-search-history.ts  ← hook cronologia ricerche (localStorage, max 20)
│   └── use-mobile.ts          ← hook responsive breakpoint
├── MIGLIORAMENTI.md           ← lista miglioramenti da implementare
└── .env.local                 ← NEXT_PUBLIC_APP_NAME, LLM_PROVIDER, OPENROUTER_API_KEY, OPENROUTER_MODEL
```

## Come avviare

```bash
cd ~/UpNote_Export/upnote-explorer
npm run dev
```

Il comando `npm run dev` esegue prima `build-notes.ts` poi `next dev`.

## Cosa fa il build (`build-notes.ts`)

1. Legge configurazione da `notes.config.json` (override CLI: `--source`, `--pattern`, `--files-dir`)
2. Trova tutte le cartelle nel percorso `source` che corrispondono al `pattern` (es. `UpNote_*`, `*` per tutte)
3. Merge file allegati dalla sottocartella `filesDir` (da più vecchio a più recente = più recente vince)
4. Se nomi duplicati → rinomina con suffisso e aggiorna riferimenti nelle note
5. Merge note per slug (stessa logica: più recente vince)
6. Estrae link interni `[testo](%23...)` e allegati `![...](Files/...)` e `[...](Files/...)`
7. Salva `data/notes.json` e copia file in `public/files/`
8. Flag `--cleanup` per eliminare export vecchi

### Configurazione (`notes.config.json`)

```json
{
  "source": "..",
  "pattern": "UpNote_*",
  "filesDir": "Files",
  "appName": "UpNote Knowledge Explorer",
  "appDescription": "Esplora e cerca nelle tue note UpNote con AI"
}
```

- `source`: percorso relativo alla root del progetto (o assoluto)
- `pattern`: pattern nomi cartella (`UpNote_*` = prefisso, `*` = tutte le cartelle, `nome_esatto` = match esatto)
- `filesDir`: nome della sottocartella con gli allegati (default `Files`)
- `appName`/`appDescription`: usati nei messaggi console del build
- Il nome dell'app nell'UI è configurato via `NEXT_PUBLIC_APP_NAME` in `.env.local`

### AI / RAG

- **Chat multi-turno** — la conversazione AI mantiene il contesto tra domande successive. Lo storico messaggi viene passato all'API che lo inoltra al LLM come `messages`. UI con chat thread (domande utente + risposte AI con fonti), input per follow-up in basso, pulsante "Nuova chat" per resettare. Il prompt di sistema include il contesto note aggiornato per ogni domanda
- **Sorgenti espandibili** — le fonti citate nella risposta AI sono espandibili con click: mostrano preview inline con categoria (badge colorato), snippet contenuto (300 char), e due pulsanti azione: "Leggi tutto" (apre NoteSheet) e "Apri nel grafo" (switch tab Grafo + zoom + selezione nodo). `NoteGraph` espone `focusNode()` via `useImperativeHandle`/`forwardRef`
- **Generazione riassunti** — bottone "Riassumi" nell'header del NoteSheet. Chiama `/api/summarize` che invia titolo + contenuto + categoria al LLM. Risposta in streaming mostrata in card dedicata (border cyan, icona Sparkles). Card dismissable con X. Si resetta automaticamente al cambio nota

- **Supporto qualsiasi cartella markdown** — percorso sorgente e pattern cartella configurabili via `notes.config.json` (rimosso hardcoded `UpNote_*`). Override CLI: `--source`, `--pattern`, `--files-dir`. Nome app nell'UI configurabile via `NEXT_PUBLIC_APP_NAME` in `.env.local`

### Grafica / UI

- **Animazioni transizione** — fade-in/slide con framer-motion su risultati ricerca, grafo e note sheet
- **Grafo interattivo migliorato** — tooltip React custom on hover con preview nota (titolo, abstract, categoria, link). Font color adattivo al tema (dark/light)
- **Layout note nel grafo** — nodi nota come mini-card box arrotondate con titolo + preview contenuto (80 char), bordo colorato per categoria
- **Tema animato** — background spaziale con stelle a 3 strati (parallax), nebulose animate, particelle fluttuanti, stelle cadenti. Colori adattivi dark/light
- **Empty state** — schermata iniziale con icona Brain animata, stat card (note/categorie/collegamenti), keyboard shortcuts hint
- **Markdown rendering** — note renderizzate con markdown reale (headers, liste, link, code, blockquote, tabelle) via `marked`. Link blu, apribili in nuova scheda. Fix escape underscore nei URL
- **NoteSheet tema adattivo** — background usa `bg-background/95` invece di colore hardcoded, si adatta a tema chiaro/scuro

### Funzionalità

- **Filtro per categoria** — sidebar cliccabile per filtrare grafo, risultati ricerca e RAG. Indicatore filtro con chip colorata e pulsante X
- **Breadcrumb di navigazione** — trail visibile nel NoteSheet quando si naviga tra note collegate. Link nel contenuto markdown e sezione "Collegamenti" sono cliccabili
- **Note correlate** — sezione nel NoteSheet con suggerimento automatico di note simili basato su backlink (+3), forward link (+3), link condivisi (+2), stessa categoria (+1)
- **Statistiche** — dashboard con: stat card (note, categorie, collegamenti, allegati), bar chart note per categoria, top 8 note più collegate (cliccabili), timeline creazione note, info contenuto medio
- **Keyboard shortcuts completi** — `/` focus ricerca, `Tab` cambia modalità, `Esc` chiude sheet, `↑↓` naviga risultati (con scroll automatico), `Enter` apre nota selezionata
- **Export nota singola** — dropdown con icona Download nell'header NoteSheet: esporta come Markdown (.md, blob download diretto) o PDF (finestra stampabile con HTML stilizzato). Zero dipendenze extra
- **Full-text highlight** — termini cercati evidenziati con `<mark class="search-highlight">` nel contenuto della nota aperta nel NoteSheet. Highlight applicato solo al testo visibile (non dentro tag HTML), case-insensitive. Stile adattivo dark/light con sfondo indigo
- **Cronologia ricerche** — ultime 20 ricerche salvate in localStorage (`upnote-search-history`). Dropdown "Ricerche recenti" al focus sulla search bar: mostra max 10 voci filtrate while-you-type, click per rilanciare, X per rimuovere singola voce, "Cancella tutto" per svuotare. Hook `useSearchHistory` con lazy init (no effect)

## Decisioni prese

- RAG multi-turno: storico messaggi passato come `messages` al LLM, contesto note aggiornato per ogni domanda
- `@ai-sdk/openai` `.chat()` (non default) per Chat Completions API — la Responses API default non supporta multi-turno su OpenRouter
- `@ai-sdk/openai` con `createOpenAI({ baseURL })` per tutti i provider
- Build leggendo `notes.config.json` per configurabilità (non hardcoded)
- Lingua italiana per UI e risposte AI
- NoteSheet custom con framer-motion invece del componente Sheet base-ui (bug removeChild)
- `marked` per markdown rendering (non react-markdown — conflitto DOM con base-ui)
- Patch `Node.prototype.removeChild` in `layout.tsx` per suppressione errore DOM noto di React 19 + base-ui
- Link UpNote hanno formato `"#Categoria | Titolo"` — risoluzione normalizza underscore e spazi
- Search state gestito in `page.tsx` (non in `SearchBar`) per permettere reset da "Cancella risultati"
- Export PDF via `window.open` + `window.print()` con HTML stilizzato (no lib PDF)
- Export MD via Blob API + URL.createObjectURL (no dipendenze)
- Highlight: `highlightHtml()` split HTML per tag e applica `<mark>` solo su text nodes
- Cronologia: `useState(loadHistory)` con lazy initializer per evitare effect SSR warning

## Avvertenze tecniche

- ShadCN usa `@base-ui/react` (non Radix) — niente `asChild` su TooltipTrigger
- vis-network `smooth` richiede `{ enabled: true, type: "continuous", roundness: 0.5 }`
- Bug noto: `removeChild` DOM error alla chiusura di componenti base-ui — gestito con patch in `layout.tsx`
- Per push su GitHub usare SSH con deploy key:
  ```bash
  GIT_SSH_COMMAND="ssh -i /home/rosario/Documenti/Chiavi/deploy_key_github -o IdentitiesOnly=yes -o StrictHostKeyChecking=no" git push origin main
  ```

## Prossimi passi

Aprire `MIGLIORAMENTI.md` e scegliere cosa implementare. Tutti i miglioramenti pianificati sono completati.
