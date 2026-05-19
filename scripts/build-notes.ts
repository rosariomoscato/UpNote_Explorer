import * as fs from "fs";
import * as path from "path";
import matter from "gray-matter";
import { Note, extractCategory, CATEGORY_COLORS } from "../lib/types";

const NOTES_DIR = path.resolve(
  __dirname,
  "../../UpNote_2026-05-19_21-39-47"
);

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

function processNotes(): Note[] {
  const files = fs.readdirSync(NOTES_DIR).filter((f) => f.endsWith(".md"));
  const notes: Note[] = [];

  for (const file of files) {
    const raw = fs.readFileSync(path.join(NOTES_DIR, file), "utf-8");
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
  const notes = processNotes();
  const outPath = path.resolve(__dirname, "../data/notes.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(notes, null, 2), "utf-8");
  console.log(`Processed ${notes.length} notes → ${outPath}`);
}

main();
