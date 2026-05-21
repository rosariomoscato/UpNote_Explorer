# Stato del Progetto — UpNote Knowledge Explorer

Ultimo aggiornamento: 2026-05-21

## Cos'è

Web app Next.js che visualizza note UpNote come grafo interattivo, con ricerca full-text e Q&A AI (RAG) con citazioni delle fonti. UI futuristica tema spazio.

## Stack

- Next.js 16, ShadCN UI, Tailwind CSS v4, vis-network, fuse.js, Vercel AI SDK
- framer-motion (animazioni), marked (markdown rendering)
- LLM: OpenRouter (`nvidia/nemotron-3-super-120b-a12b:free`) via `.env.local`
- GitHub: `https://github.com/rosariomoscato/UpNote_Explorer`
- Git author: `Rosario Moscato <ros.moscato@gmail.com>`

## Struttura chiave

```
upnote-explorer/
├── scripts/build-notes.ts    ← build pipeline (note + file allegati)
├── lib/
│   ├── types.ts              ← Note, GraphNode/Edge, CATEGORY_COLORS
│   ├── notes-loader.ts       ← caricamento note + getRelatedNotes()
│   └── search-engine.ts      ← fuse.js doppio (text search + RAG, filtro categoria)
├── app/
│   ├── page.tsx              ← pagina principale con tutti gli stati UI
│   ├── layout.tsx            ← ThemeProvider + TooltipProvider + removeChild fix
│   ├── globals.css           ← tema futuro, glass-morphism, glow, markdown styles
│   └── api/
│       ├── ask/route.ts      ← RAG endpoint (filtro categoria)
│       ├── search/route.ts   ← fuse.js search (filtro categoria)
│       └── rebuild/route.ts  ← re-index + reload
├── components/
│   ├── note-graph.tsx        ← vis-network grafo con tooltip hover + mini-preview card
│   ├── note-sheet.tsx        ← Panel laterale custom (framer-motion) con markdown + allegati + link + breadcrumb + note correlate
│   ├── search-bar.tsx        ← barra ricerca + selettore modalità + keyboard shortcuts
│   ├── search-results.tsx    ← lista risultati con fade-in animato + navigazione tastiera
│   ├── rag-answer.tsx        ← risposta AI con citazioni
│   ├── sidebar-nav.tsx       ← sidebar categorie (filtro cliccabile)
│   ├── theme-toggle.tsx      ← dark/light toggle
│   ├── space-background.tsx  ← background spaziale animato (stelle, nebulose, stelle cadenti)
│   └── statistics.tsx        ← dashboard statistiche (categorie, note più collegate, timeline)
├── data/notes.json           ← generato dal build (gitignorato)
├── public/files/             ← allegati copiati dal build (gitignorato)
├── MIGLIORAMENTI.md          ← lista miglioramenti da implementare
└── .env.local                ← LLM_PROVIDER, OPENROUTER_API_KEY, OPENROUTER_MODEL
```

## Come avviare

```bash
cd ~/UpNote_Export/upnote-explorer
npm run dev
```

Il comando `npm run dev` esegue prima `build-notes.ts` poi `next dev`.

## Cosa fa il build (`build-notes.ts`)

1. Trova tutte le cartelle `UpNote_*` in `/home/rosario/UpNote_Export/`
2. Merge file allegati (da più vecchio a più recente = più recente vince)
3. Se nomi duplicati → rinomina con suffisso e aggiorna riferimenti nelle note
4. Merge note per slug (stessa logica: più recente vince)
5. Estrae link interni `[testo](%23...)` e allegati `![...](Files/...)` e `[...](Files/...)`
6. Salva `data/notes.json` e copia file in `public/files/`
7. Flag `--cleanup` per eliminare export vecchi

## Miglioramenti implementati

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

## Decisioni prese

- `generateText` (non `streamText`) per RAG — streaming vuoto con OpenRouter
- `@ai-sdk/openai` con `createOpenAI({ baseURL })` per tutti i provider
- Merge da TUTTE le cartelle export (non solo l'ultima) per non perdere note
- Note caricate via JSON import statico (non `fs`) — funziona client e server
- Lingua italiana per UI e risposte AI
- NoteSheet custom con framer-motion invece del componente Sheet base-ui (bug removeChild)
- `marked` per markdown rendering (non react-markdown — conflitto DOM con base-ui)
- Patch `Node.prototype.removeChild` in `layout.tsx` per suppressione errore DOM noto di React 19 + base-ui
- Link UpNote hanno formato `"#Categoria | Titolo"` — risoluzione normalizza underscore e spazi
- Search state gestito in `page.tsx` (non in `SearchBar`) per permettere reset da "Cancella risultati"

## Avvertenze tecniche

- ShadCN usa `@base-ui/react` (non Radix) — niente `asChild` su TooltipTrigger
- vis-network `smooth` richiede `{ enabled: true, type: "continuous", roundness: 0.5 }`
- Bug noto: `removeChild` DOM error alla chiusura di componenti base-ui — gestito con patch in `layout.tsx`
- Per push su GitHub serve impostare remote con PAT, poi ripulire:
  ```bash
  git remote set-url origin https://rosariomoscato:<PAT>@github.com/rosariomoscato/UpNote_Explorer.git
  git push origin main
  git remote set-url origin https://github.com/rosariomoscato/UpNote_Explorer.git
  ```

## Prossimi passi

Aprire `MIGLIORAMENTI.md` e scegliere cosa implementare. Rimanenti nella sezione Funzionalità: export nota singola, full-text highlight, cronologia ricerche. Generalizzazione: supporto qualsiasi cartella markdown. AI/RAG: chat multi-turno, sorgenti espandibili, generazione riassunti.
