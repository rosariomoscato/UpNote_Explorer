"use client";

import { Note } from "@/lib/types";
import { Sparkles, BookOpen } from "lucide-react";

interface RagAnswerProps {
  answer: string;
  sources: Note[];
  isStreaming: boolean;
  onSourceClick: (noteId: string) => void;
}

export function RagAnswer({ answer, sources, isStreaming, onSourceClick }: RagAnswerProps) {
  if (!answer && !isStreaming) return null;

  return (
    <div className="space-y-6">
      <div className="glass-card glow-border rounded-xl overflow-hidden">
        <div className="p-5 border-b border-indigo-500/10">
          <h3 className="text-base font-medium flex items-center gap-2.5">
            <div className="relative">
              <Sparkles className="h-5 w-5 text-cyan-400" />
              <div className="absolute inset-0 blur-sm bg-cyan-400/40" />
            </div>
            <span className="shimmer-text font-semibold">Risposta AI</span>
          </h3>
        </div>
        <div className="p-5">
          <div className="text-sm leading-relaxed text-indigo-100/80 whitespace-pre-wrap">
            {renderAnswerWithCitations(answer, sources, onSourceClick)}
            {isStreaming && (
              <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1 rounded-sm" />
            )}
          </div>
        </div>
      </div>

      {sources.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-indigo-300/50 flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Fonti citate
          </h3>
          <div className="flex flex-wrap gap-2">
            {sources.map((note) => (
              <span
                key={note.id}
                className="source-highlight text-xs py-1.5 px-3 rounded-lg cursor-pointer border border-amber-500/20 hover:border-amber-400/40 transition-colors"
                onClick={() => onSourceClick(note.id)}
              >
                {note.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function renderAnswerWithCitations(
  answer: string,
  sources: Note[],
  onSourceClick: (id: string) => void
) {
  const sourcePattern = /\*([^*]+)\*/g;
  const sourceTitles = sources.map((s) => s.title);
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = sourcePattern.exec(answer)) !== null) {
    if (match.index > lastIndex) {
      parts.push(answer.slice(lastIndex, match.index));
    }
    const cited = match[1];
    const isSource = sourceTitles.some(
      (t) => t.toLowerCase().includes(cited.toLowerCase()) || cited.toLowerCase().includes(t.toLowerCase())
    );

    if (isSource) {
      const found = sources.find(
        (s) => s.title.toLowerCase().includes(cited.toLowerCase()) || cited.toLowerCase().includes(s.title.toLowerCase())
      );
      parts.push(
        <span
          key={match.index}
          className="source-highlight"
          onClick={() => found && onSourceClick(found.id)}
        >
          *{cited}*
        </span>
      );
    } else {
      parts.push(<em key={match.index} className="text-indigo-300/40">*{cited}*</em>);
    }
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < answer.length) {
    parts.push(answer.slice(lastIndex));
  }

  return parts;
}
