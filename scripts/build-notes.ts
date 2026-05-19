import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { Note, extractCategory, CATEGORY_COLORS } from "../lib/types";

const EXPORT_ROOT = path.resolve(__dirname, "../..");

function findLatestExportDir(): string {
  const entries = fs.readdirSync(EXPORT_ROOT, { withFileTypes: true });
  const exportDirs = entries
    .filter((e) => e.isDirectory() && e.name.startsWith("UpNote_"))
    .map((e) => ({
      name: e.name,
      path: path.join(EXPORT_ROOT, e.name),
    }))
    .sort((a, b) => b.name.localeCompare(a.name));

  if (exportDirs.length === 0) {
    console.error("Nessuna cartella UpNote_* trovata in", EXPORT_ROOT);
    process.exit(1);
  }

  const latest = exportDirs[0];
  if (exportDirs.length > 1) {
    console.log(`Trovate ${exportDirs.length} cartelle di export:`);
    exportDirs.forEach((d, i) => console.log(`  ${i === 0 ? "→" : " "} ${d.name}`));
    console.log(`Usando la più recente: ${latest.name}\n`);
  }

  return latest.path;
}

function cleanupOldExports(currentDir: string): void {
  const entries = fs.readdirSync(EXPORT_ROOT, { withFileTypes: true });
  const oldDirs = entries
    .filter((e) => e.isDirectory() && e.name.startsWith("UpNote_"))
    .map((e) => path.join(EXPORT_ROOT, e.name))
    .filter((p) => p !== currentDir);

  for (const dir of oldDirs) {
    console.log(`Rimozione vecchio export: ${path.basename(dir)}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }

  if (oldDirs.length > 0) {
    console.log(`Rimosse ${oldDirs.length} vecchia/e cartella/e.\n`);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&middot;/g, "·")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/==([^=]+)==/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractLinks(content: string): string[] {
  const linkPattern = /\[([^\]]+)\]\(%23([^)]+)\)/g;
  const links: string[] = [];
  let match;
  while ((match = linkPattern.exec(content)) !== null) {
    links.push(match[1].trim());
  }
  return [...new Set(links)];
}

function extractTitle(content: string, fileName: string): string {
  const titleMatch = content.match(/^##\s+\S+\s*\|\s*(.+)$/m);
  if (titleMatch) return titleMatch[1].trim();
  const h1Match = content.match(/^#\s+(.+)$/m);
  if (h1Match) {
    const parts = h1Match[1].split("|");
    return parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim();
  }
  return fileName.replace(/^#[^ ]+\s+/, "").replace(/\.md$/, "");
}

function processNotes(notesDir: string): Note[] {
  const files = fs.readdirSync(notesDir).filter((f) => f.endsWith(".md"));
  const notes: Note[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(notesDir, file), "utf-8");
    const { data: frontmatter, content } = matter(raw);
    const category = extractCategory(file);
    const title = extractTitle(content, file);
    const cleanContent = stripHtml(content);
    const links = extractLinks(content);

    notes.push({
      id: slugify(title),
      title,
      category,
      categoryColor: CATEGORY_COLORS[category] || "#95a5a6",
      content: cleanContent,
      filePath: file,
      links,
      date: frontmatter.date || "",
      created: frontmatter.created || "",
    });
  }

  return notes;
}

function main() {
  const cleanup = process.argv.includes("--cleanup");

  console.log("=== UpNote Knowledge Explorer - Build Notes ===\n");

  const notesDir = findLatestExportDir();
  console.log(`Cartella export: ${notesDir}\n`);

  const notes = processNotes(notesDir);

  const outPath = path.resolve(__dirname, "../data/notes.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(notes, null, 2), "utf-8");

  console.log(`✓ Processate ${notes.length} note → data/notes.json`);

  if (cleanup) {
    console.log("");
    cleanupOldExports(notesDir);
  }

  console.log("✓ Completato.\n");
}

main();
