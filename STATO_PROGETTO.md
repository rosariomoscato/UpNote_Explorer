# Stato del Progetto — UpNote Knowledge Explorer

Ultimo aggiornamento: 2026-05-19

## Cos'è

Web app Next.js che visualizza note UpNote come grafo interattivo, con ricerca full-text e Q&A AI (RAG) con citazioni delle fonti. UI futuristica tema spazio.

## Stack

- Next.js 16, ShadCN UI, Tailwind CSS v4, vis-network, fuse.js, Vercel AI SDK
- LLM: OpenRouter (`nvidia/nemotron-3-super-120b-a12b:free`) via `.env.local`
- GitHub: `https://github.com/rosariomoscato/UpNote_Explorer`
- Git author: `Rosario Moscato <ros.moscato@gmail.com>`

## Struttura chiave

```
upnote-explorer/
├── scripts/build-notes.ts    ← build pipeline (note + file allegati)
├── lib/
│   ├── types.ts              ← Note, GraphNode/Edge, CATEGORY_COLORS
│   ├── notes-loader.ts       ← caricamento note (client/server safe)
│   └── search-engine.ts      ← fuse.js doppio (text search + RAG)
├── app/
│   ├── page.tsx              ← pagina principale con tutti gli stati UI
│   ├── layout.tsx            ← ThemeProvider + TooltipProvider
│   ├── globals.css           ← tema futuro, glass-morphism, glow
│   └── api/
│       ├── ask/route.ts      ← RAG endpoint (openrouter/ollama/openai)
│       ├── search/route.ts   ← fuse.js search
│       └── rebuild/route.ts  ← re-index + reload
├── components/
│   ├── note-graph.tsx        ← vis-network grafo
│   ├── note-sheet.tsx        ← Sheet laterale con contenuto + allegati + link
│   ├── search-bar.tsx        ← barra ricerca + selettore modalità
│   ├── search-results.tsx    ← lista risultati
│   ├── rag-answer.tsx        ← risposta AI con citazioni
│   ├── sidebar-nav.tsx       ← sidebar categorie
│   ├── theme-toggle.tsx      ← dark/light toggle
│   └── space-background.tsx  ← background spaziale
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

## Decisioni prese

- `generateText` (non `streamText`) per RAG — streaming vuoto con OpenRouter
- `@ai-sdk/openai` con `createOpenAI({ baseURL })` per tutti i provider
- Merge da TUTTE le cartelle export (non solo l'ultima) per non perdere note
- Note caricate via JSON import statico (non `fs`) — funziona client e server
- Lingua italiana per UI e risposte AI

## Avvertenze tecniche

- ShadCN usa `@base-ui/react` (non Radix) — niente `asChild` su TooltipTrigger
- vis-network `smooth` richiede `{ enabled: true, type: "continuous", roundness: 0.5 }`
- Per push su GitHub serve impostare remote con PAT, poi ripulire:
  ```bash
  git remote set-url origin https://rosariomoscato:<PAT>@github.com/rosariomoscato/UpNote_Explorer.git
  git push origin main
  git remote set-url origin https://github.com/rosariomoscato/UpNote_Explorer.git
  ```

## Prossimi passi

Aprire `MIGLIORAMENTI.md` e scegliere cosa implementare.
