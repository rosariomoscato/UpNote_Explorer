import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { Note, extractCategory, CATEGORY_COLORS } from "../lib/types";

const EXPORT_ROOT = path.resolve(__dirname, "../..");

function findExportDirs(): string[] {
  const entries = fs.readdirSync(EXPORT_ROOT, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && e.name.startsWith("UpNote_"))
    .map((e) => ({
      name: e.name,
      path: path.join(EXPORT_ROOT, e.name),
    }))
    .sort((a, b) => b.name.localeCompare(a.name))
    .map((d) => d.path);
}

function cleanupOldExports(currentDirs: string[]): void {
  const entries = fs.readdirSync(EXPORT_ROOT, { withFileTypes: true });
  const knownPaths = new Set(currentDirs);
  const oldDirs = entries
    .filter((e) => e.isDirectory() && e.name.startsWith("UpNote_"))
    .map((e) => path.join(EXPORT_ROOT, e.name))
    .filter((p) => !knownPaths.has(p));

  for (const dir of oldDirs) {
    console.log(`  Rimozione: ${path.basename(dir)}`);
    fs.rmSync(dir, { recursive: true, force: true });
  }

  if (oldDirs.length > 0) {
    console.log(`  Rimosse ${oldDirs.length} vecchia/e cartella/e.\n`);
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

function extractAttachments(content: string): string[] {
  const attachments: string[] = [];

  const imgPattern = /!\[[^\]]*\]\(Files\/([^)]+)\)/g;
  let match;
  while ((match = imgPattern.exec(content)) !== null) {
    attachments.push(decodeURIComponent(match[1].trim()));
  }

  const linkPattern = /\[[^\]]+\]\(Files\/([^)]+)\)/g;
  while ((match = linkPattern.exec(content)) !== null) {
    const f = decodeURIComponent(match[1].trim());
    if (!attachments.includes(f)) {
      attachments.push(f);
    }
  }

  return [...new Set(attachments)];
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

function processNotesFromDir(notesDir: string): Note[] {
  const files = fs.readdirSync(notesDir).filter((f) => f.endsWith(".md"));
  const notes: Note[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(notesDir, file), "utf-8");
    const { data: frontmatter, content } = matter(raw);
    const category = extractCategory(file);
    const title = extractTitle(content, file);
    const cleanContent = stripHtml(content);
    const links = extractLinks(content);
    const attachments = extractAttachments(content);

    notes.push({
      id: slugify(title),
      title,
      category,
      categoryColor: CATEGORY_COLORS[category] || "#95a5a6",
      content: cleanContent,
      filePath: file,
      links,
      attachments,
      date: frontmatter.date || "",
      created: frontmatter.created || "",
    });
  }

  return notes;
}

function mergeNotes(allDirs: string[]): Note[] {
  const noteMap = new Map<string, Note>();

  for (const dir of allDirs) {
    const notes = processNotesFromDir(dir);
    for (const note of notes) {
      noteMap.set(note.id, note);
    }
  }

  return Array.from(noteMap.values());
}

function mergeFiles(allDirs: string[]): number {
  const publicFilesDir = path.resolve(__dirname, "../public/files");

  if (fs.existsSync(publicFilesDir)) {
    fs.rmSync(publicFilesDir, { recursive: true, force: true });
  }
  fs.mkdirSync(publicFilesDir, { recursive: true });

  let totalFiles = 0;
  const seenNames = new Map<string, string>();

  for (const dir of [...allDirs].reverse()) {
    const filesDir = path.join(dir, "Files");
    if (!fs.existsSync(filesDir)) continue;

    const entries = fs.readdirSync(filesDir);
    for (const entry of entries) {
      const srcPath = path.join(filesDir, entry);
      if (!fs.statSync(srcPath).isFile()) continue;

      let destName = entry;
      if (seenNames.has(entry.toLowerCase())) {
        const ext = path.extname(entry);
        const base = path.basename(entry, ext);
        destName = `${base}_${seenNames.size}${ext}`;
      }
      seenNames.set(entry.toLowerCase(), destName);

      const destPath = path.join(publicFilesDir, destName);
      fs.copyFileSync(srcPath, destPath);
      totalFiles++;
    }
  }

  return totalFiles;
}

function main() {
  const cleanup = process.argv.includes("--cleanup");

  console.log("=== UpNote Knowledge Explorer - Build Notes ===\n");

  const allDirs = findExportDirs();

  if (allDirs.length === 0) {
    console.error("Nessuna cartella UpNote_* trovata in", EXPORT_ROOT);
    process.exit(1);
  }

  console.log(`Trovate ${allDirs.length} cartella/e di export:`);
  for (const dir of allDirs) {
    const mdCount = fs.readdirSync(dir).filter((f) => f.endsWith(".md")).length;
    console.log(`  - ${path.basename(dir)} (${mdCount} .md)`);
  }
  console.log("");

  const mergedNotes = mergeNotes(allDirs);

  const outPath = path.resolve(__dirname, "../data/notes.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(mergedNotes, null, 2), "utf-8");

  console.log(`✓ Unite e processate ${mergedNotes.length} note → data/notes.json`);

  const totalFiles = mergeFiles(allDirs);
  console.log(`✓ Copiati ${totalFiles} file allegati → public/files/`);

  if (cleanup) {
    console.log("\nPulizia vecchi export:");
    cleanupOldExports(allDirs);
  }

  console.log("✓ Completato.\n");
}

main();
