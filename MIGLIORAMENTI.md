# Miglioramenti — UpNote Knowledge Explorer

Leggimi prima di ogni sessione per decidere cosa implementare.

---

## Grafica / UI

- [x] **Animazioni transizione** — fade-in/slide delle note nel grafo e nei risultati di ricerca (framer-motion)
- [x] **Grafo interattivo migliorato** — hover preview delle note (tooltip con abstract), raggruppamento visivo per categoria con cluster
- [x] **Layout note nel grafo** — mini-preview del contenuto dentro i nodi invece del solo titolo
- [x] **Tema animato** — particelle spaziali o stelle nel background (potenziare `space-background.tsx`)
- [x] **Empty state** — schermata iniziale più accattivante quando non c'è ricerca attiva
- [x] **Markdown rendering** — renderizzare markdown reale nel NoteSheet invece di testo piano

## Funzionalità

- [x] **Filtro per categoria** — sidebar cliccabile per filtrare il grafo e i risultati
- [x] **Breadcrumb di navigazione** — seguire i collegamenti tra note in modo visibile
- [x] **Note correlate** — suggerimento automatico di note simili nel NoteSheet (basato su link condivisi o similarità testo)
- [x] **Statistiche** — dashboard con conteggio note per categoria, note più collegate, timeline
- [x] **Export nota singola** — pulsante per scaricare una nota come PDF o markdown
- [x] **Full-text highlight** — evidenziare i termini cercati nel contenuto della nota aperta
- [x] **Keyboard shortcuts** — `/` per focus sulla search, `Esc` per chiudere sheet, `↑↓` per navigare risultati
- [x] **Cronologia ricerche** — salvare le ultime ricerche nel localStorage

## Generalizzazione

- [x] **Supporto qualsiasi cartella markdown** — percorso sorgente e pattern cartella configurabili via `notes.config.json` (rimosso hardcoded `UpNote_*`). Nome app configurabile via `NEXT_PUBLIC_APP_NAME` in `.env.local`. Override CLI: `--source`, `--pattern`, `--files-dir`

## AI / RAG

- [x] **Chat multi-turno** — mantenere il contesto della conversazione invece di una singola domanda
- [x] **Sorgenti espandibili** — cliccando su una fonte si espande una preview inline con categoria, snippet e pulsanti "Leggi tutto" / "Apri nel grafo" (focus + zoom sul nodo)
- [ ] **Generazione riassunti** — bottone "Riassumi questa nota" nel NoteSheet
