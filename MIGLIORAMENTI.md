# Miglioramenti — UpNote Knowledge Explorer

Leggimi prima di ogni sessione per decidere cosa implementare.

---

## Grafica / UI

- [x] **Animazioni transizione** — fade-in/slide delle note nel grafo e nei risultati di ricerca (framer-motion)
- [x] **Grafo interattivo migliorato** — hover preview delle note (tooltip con abstract), raggruppamento visivo per categoria con cluster
- [ ] **Layout note nel grafo** — mini-preview del contenuto dentro i nodi invece del solo titolo
- [ ] **Tema animato** — particelle spaziali o stelle nel background (potenziare `space-background.tsx`)
- [ ] **Empty state** — schermata iniziale più accattivante quando non c'è ricerca attiva
- [ ] **Markdown rendering** — renderizzare markdown reale nel NoteSheet invece di testo piano

## Funzionalità

- [ ] **Filtro per categoria** — sidebar cliccabile per filtrare il grafo e i risultati
- [ ] **Breadcrumb di navigazione** — seguire i collegamenti tra note in modo visibile
- [ ] **Note correlate** — suggerimento automatico di note simili nel NoteSheet (basato su link condivisi o similarità testo)
- [ ] **Statistiche** — dashboard con conteggio note per categoria, note più collegate, timeline
- [ ] **Export nota singola** — pulsante per scaricare una nota come PDF o markdown
- [ ] **Full-text highlight** — evidenziare i termini cercati nel contenuto della nota aperta
- [ ] **Keyboard shortcuts** — `/` per focus sulla search, `Esc` per chiudere sheet, `↑↓` per navigare risultati
- [ ] **Cronologia ricerche** — salvare le ultime ricerche nel localStorage

## Generalizzazione

- [ ] **Supporto qualsiasi cartella markdown** — rendere configurabile il percorso sorgente e il pattern nomi cartella (rimuovere hardcoded `UpNote_*`), così l'app funziona con qualsiasi raccolta di note markdown + cartella `Files/`

## AI / RAG

- [ ] **Chat multi-turno** — mantenere il contesto della conversazione invece di una singola domanda
- [ ] **Sorgenti espandibili** — cliccando su una citazione si apre direttamente la nota nel grafo
- [ ] **Generazione riassunti** — bottone "Riassumi questa nota" nel NoteSheet
