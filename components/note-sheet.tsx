"use client";

import { Note } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { FileText, Image, Paperclip } from "lucide-react";

interface NoteSheetProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) {
    return <Image className="h-3.5 w-3.5" />;
  }
  return <FileText className="h-3.5 w-3.5" />;
}

export function NoteSheet({ note, open, onOpenChange }: NoteSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] bg-[#0a0e1f]/95 backdrop-blur-xl border-indigo-500/15">
        <AnimatePresence mode="wait">
          {note && (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <SheetHeader>
          <span
            className="w-fit text-xs px-2.5 py-1 rounded-full border mb-2"
            style={{
              borderColor: `${note.categoryColor}40`,
              color: note.categoryColor,
              backgroundColor: `${note.categoryColor}10`,
            }}
          >
            #{note.category.replace(/_/g, " ")}
          </span>
          <SheetTitle className="text-left text-foreground">{note.title}</SheetTitle>
          <SheetDescription className="text-left text-muted-foreground">
            {note.date && `Data: ${note.date}`}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4 opacity-20" />
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap pr-4">
            {note.content}
          </div>

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
                  {note.links.map((link, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-muted text-muted-foreground border"
                    >
                      {link}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
