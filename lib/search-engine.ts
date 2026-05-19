import Fuse from "fuse.js";
import { Note, SearchResult } from "./types";
import { loadNotes } from "./notes-loader";

let fuseInstance: Fuse<Note> | null = null;
let fuseRagInstance: Fuse<Note> | null = null;

function getFuse(): Fuse<Note> {
  if (!fuseInstance) {
    fuseInstance = new Fuse(loadNotes(), {
      keys: [
        { name: "title", weight: 2 },
        { name: "category", weight: 1 },
        { name: "content", weight: 1 },
        { name: "links", weight: 1.5 },
      ],
      threshold: 0.35,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  }
  return fuseInstance;
}

function getFuseRag(): Fuse<Note> {
  if (!fuseRagInstance) {
    fuseRagInstance = new Fuse(loadNotes(), {
      keys: [
        { name: "title", weight: 2 },
        { name: "category", weight: 1 },
        { name: "content", weight: 1 },
        { name: "links", weight: 1.5 },
      ],
      threshold: 1.0,
      includeScore: true,
      minMatchCharLength: 2,
      ignoreLocation: true,
    });
  }
  return fuseRagInstance;
}

export function searchNotes(query: string, limit = 10): SearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const fuse = getFuse();
  const results = fuse.search(query, { limit });

  return results.map((r) => {
    const content = r.item.content;
    const queryLower = query.toLowerCase();
    const idx = content.toLowerCase().indexOf(queryLower);
    const start = Math.max(0, idx - 100);
    const end = Math.min(content.length, idx + query.length + 200);
    const snippet =
      (start > 0 ? "..." : "") +
      content.slice(start, end) +
      (end < content.length ? "..." : "");

    return {
      item: r.item,
      score: r.score ?? 1,
      snippet,
    };
  });
}

export function getRelevantNotes(query: string, limit = 8): Note[] {
  if (!query || query.trim().length < 2) return [];
  const fuse = getFuseRag();
  const results = fuse.search(query, { limit });
  return results.map((r) => r.item);
}
