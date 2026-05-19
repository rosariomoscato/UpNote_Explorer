"use client";

import { Note } from "@/lib/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NoteSheetProps {
  note: Note | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NoteSheet({ note, open, onOpenChange }: NoteSheetProps) {
  if (!note) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] bg-[#0a0e1f]/95 backdrop-blur-xl border-indigo-500/15">
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
          <SheetTitle className="text-left text-indigo-100">{note.title}</SheetTitle>
          <SheetDescription className="text-left text-indigo-300/40">
            {note.date && `Data: ${note.date}`}
          </SheetDescription>
        </SheetHeader>
        <Separator className="my-4 bg-indigo-500/10" />
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="text-sm text-indigo-200/60 leading-relaxed whitespace-pre-wrap pr-4">
            {note.content}
          </div>
          {note.links.length > 0 && (
            <>
              <Separator className="my-4 bg-indigo-500/10" />
              <div className="space-y-2">
                <p className="text-xs font-medium text-indigo-300/30">Collegamenti</p>
                <div className="flex flex-wrap gap-2">
                  {note.links.map((link, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-300/50 border border-indigo-500/10"
                    >
                      {link}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
