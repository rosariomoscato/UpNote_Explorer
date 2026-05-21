"use client";

import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Note } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { marked } from "marked";
import { FileText, Image, Paperclip, X, ChevronRight } from "lucide-react";

interface NoteSheetProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteHistory: Note[];
  onBreadcrumbClick: (noteId: string) => void;
  onLinkClick: (linkTitle: string) => void;
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
    return <Image className="h-3.5 w-3.5" />;
  }
  return <FileText className="h-3.5 w-3.5" />;
}

function NoteContent({ content, onLinkClick }: { content: string; onLinkClick: (title: string) => void }) {
  const html = useMemo(() => {
    const cleaned = content.replace(/\\_/g, "_");
    const renderer = new marked.Renderer();
    renderer.link = function ({ href, text }) {
      if (href.startsWith("#") || href.startsWith("%23")) {
        const title = decodeURIComponent(href.replace(/^%23|^#/, ""));
        return `<a href="#" data-internal-link="${title}">${text}</a>`;
      }
      return `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    };
    marked.setOptions({
      breaks: true,
      gfm: true,
      renderer,
    });
    return marked.parse(cleaned) as string;
  }, [content]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (anchor) {
      const internalLink = anchor.getAttribute("data-internal-link");
      if (internalLink) {
        e.preventDefault();
        onLinkClick(internalLink);
      }
    }
  };

  return (
    <div
      className="note-content text-sm leading-relaxed"
      onClick={handleClick}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function NoteSheet({ note, open, onOpenChange, noteHistory, onBreadcrumbClick, onLinkClick }: NoteSheetProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {open && note && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            className="fixed inset-y-0 right-0 z-50 w-[480px] sm:max-w-[480px] bg-[#0a0e1f]/95 backdrop-blur-xl border-l border-indigo-500/15 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border/10">
              <div className="flex flex-col gap-1 min-w-0">
                <span
                  className="w-fit text-xs px-2.5 py-1 rounded-full border"
                  style={{
                    borderColor: `${note.categoryColor}40`,
                    color: note.categoryColor,
                    backgroundColor: `${note.categoryColor}10`,
                  }}
                >
                  #{note.category.replace(/_/g, " ")}
                </span>
                <h2 className="text-base font-medium text-foreground truncate">{note.title}</h2>
                {note.date && (
                  <p className="text-xs text-muted-foreground">Data: {note.date}</p>
                )}
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="h-8 w-8 shrink-0 inline-flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {noteHistory.length > 1 && (
              <div className="px-4 py-2 border-b border-border/10 flex items-center gap-1 overflow-x-auto scrollbar-none">
                {noteHistory.map((n, i) => (
                  <span key={n.id} className="flex items-center gap-1 shrink-0">
                    {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/30" />}
                    {i === noteHistory.length - 1 ? (
                      <span className="text-xs text-foreground font-medium truncate max-w-[140px]">
                        {n.title}
                      </span>
                    ) : (
                      <button
                        className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors truncate max-w-[140px] underline decoration-muted-foreground/20 underline-offset-2 hover:decoration-foreground/50"
                        onClick={() => onBreadcrumbClick(n.id)}
                      >
                        {n.title}
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-4">
                <NoteContent content={note.content} onLinkClick={onLinkClick} />

                {note.attachments.length > 0 && (
                  <>
                    <Separator className="my-4 opacity-20" />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground/50 flex items-center gap-1.5">
                        <Paperclip className="h-3.5 w-3.5" />
                        Allegati ({note.attachments.length})
                      </p>
                      <div className="space-y-1">
                        {note.attachments.map((file, i) => (
                          <a
                            key={i}
                            href={`/files/${encodeURIComponent(file)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-primary/10 text-primary/70 border border-primary/10 hover:bg-primary/15 hover:text-primary transition-colors"
                          >
                            {getFileIcon(file)}
                            <span className="truncate">{file}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {note.links.length > 0 && (
                  <>
                    <Separator className="my-4 opacity-20" />
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground/30">Collegamenti</p>
                      <div className="flex flex-wrap gap-2">
                        {note.links.map((link, i) => {
                          let displayTitle = link;
                          if (displayTitle.startsWith("#")) {
                            const pipeIdx = displayTitle.indexOf(" | ");
                            if (pipeIdx >= 0) {
                              displayTitle = displayTitle.substring(pipeIdx + 3);
                            } else {
                              displayTitle = displayTitle.substring(1);
                            }
                          }
                          displayTitle = displayTitle.replace(/\\_/g, "_");
                          return (
                            <button
                              key={i}
                              onClick={() => onLinkClick(link)}
                              className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground border hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
                            >
                              {displayTitle}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}
