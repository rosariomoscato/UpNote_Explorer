import notesData from "@/data/notes.json";
import { Note } from "./types";

let notesCache: Note[] | null = null;

export function loadNotes(): Note[] {
  if (!notesCache) {
    notesCache = notesData as Note[];
  }
  return notesCache;
}

export function getNoteById(id: string): Note | undefined {
  return loadNotes().find((n) => n.id === id);
}

export function getCategories(): { name: string; count: number; color: string }[] {
  const notes = loadNotes();
  const catMap = new Map<string, { count: number; color: string }>();
  for (const n of notes) {
    const existing = catMap.get(n.category);
    if (existing) {
      existing.count++;
    } else {
      catMap.set(n.category, { count: 1, color: n.categoryColor });
    }
  }
  return Array.from(catMap.entries()).map(([name, data]) => ({
    name,
    count: data.count,
    color: data.color,
  }));
}
