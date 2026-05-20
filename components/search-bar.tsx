"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, Sparkles, FileText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SearchMode } from "@/lib/types";

interface SearchBarProps {
  onSearch: (query: string, mode: SearchMode) => void;
  isLoading: boolean;
}

export function SearchBar({ onSearch, isLoading }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("text");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Tab" && document.activeElement?.getAttribute("data-search-input") !== null && !query) {
        e.preventDefault();
        setMode((m) => (m === "text" ? "rag" : "text"));
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [query]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        onSearch(query.trim(), mode);
      }
    },
    [query, mode, onSearch]
  );

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 w-full max-w-3xl mx-auto">
      <div className="relative flex-1 search-glow rounded-xl transition-all duration-300">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          data-search-input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={
            mode === "text"
              ? "Cerca nelle tue note..."
              : "Chiedi alle tue note..."
          }
          className="pl-11 h-12 text-base bg-background/60 border-border rounded-xl placeholder:text-muted-foreground/50 transition-all duration-300"
        />
      </div>

      <button
        type="button"
        onClick={() => setMode("text")}
        className={`h-12 w-12 shrink-0 inline-flex items-center justify-center rounded-xl border transition-all duration-300 ${
          mode === "text"
            ? "bg-primary/15 border-primary/30 text-primary shadow-sm dark:shadow-lg dark:shadow-primary/20"
            : "bg-background/40 border-border text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
        title="Ricerca testuale"
      >
        <FileText className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={() => setMode("rag")}
        className={`h-12 w-12 shrink-0 inline-flex items-center justify-center rounded-xl border transition-all duration-300 ${
          mode === "rag"
            ? "bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-300 shadow-sm dark:shadow-lg dark:shadow-cyan-500/20"
            : "bg-background/40 border-border text-muted-foreground hover:bg-accent hover:text-foreground"
        }`}
        title="Chiedi all'AI"
      >
        <Sparkles className="h-5 w-5" />
      </button>

      <Button
        type="submit"
        disabled={isLoading || !query.trim()}
        className="h-12 px-6 shrink-0 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white border-0 rounded-xl shadow-md dark:shadow-lg dark:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-40"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {mode === "rag" ? "Penso..." : "Cercando..."}
          </span>
        ) : mode === "rag" ? (
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Chiedi
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Cerca
          </span>
        )}
      </Button>
    </form>
  );
}
