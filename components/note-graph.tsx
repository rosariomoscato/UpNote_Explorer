"use client";

import { useEffect, useRef, useCallback } from "react";
import { Note, CATEGORY_COLORS } from "@/lib/types";

interface NoteGraphProps {
  notes: Note[];
  onNodeClick: (noteId: string) => void;
}

interface VisNode {
  id: string;
  label: string;
  group: string;
  color: { background: string; border: string; highlight: { background: string; border: string }; hover: { background: string; border: string } };
  font: { size: number; color: string };
  size: number;
  shape: string;
  borderWidth: number;
}

interface VisEdge {
  from: string;
  to: string;
  dashes?: boolean;
  color?: { color: string; highlight: string; hover: string };
  title?: string;
  width?: number;
}

export function NoteGraph({ notes, onNodeClick }: NoteGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<unknown>(null);

  const buildGraph = useCallback(() => {
    if (!containerRef.current) return;

    const catFolderIds = new Map<string, string>();
    const categories = [...new Set(notes.map((n) => n.category))];
    categories.forEach((cat) => catFolderIds.set(cat, `folder_${cat}`));

    const colorMap: Record<string, { bg: string; border: string }> = {};
    for (const [cat, color] of Object.entries(CATEGORY_COLORS)) {
      colorMap[cat] = { bg: color, border: color };
    }

    const visNodes: VisNode[] = [];

    visNodes.push({
      id: "root",
      label: "UpNote",
      group: "root",
      color: {
        background: "#6366f1",
        border: "#818cf8",
        highlight: { background: "#6366f1", border: "#fff" },
        hover: { background: "#6366f1", border: "#fff" },
      },
      font: { size: 16, color: "#fff" },
      size: 30,
      shape: "dot",
      borderWidth: 3,
    });

    for (const cat of categories) {
      const c = colorMap[cat] || { bg: "#95a5a6", border: "#95a5a6" };
      visNodes.push({
        id: `folder_${cat}`,
        label: `#${cat.replace(/_/g, " ")}`,
        group: cat,
        color: {
          background: c.bg,
          border: c.border,
          highlight: { background: c.bg, border: "#fff" },
          hover: { background: c.bg, border: "#fff" },
        },
        font: { size: 13, color: "#e0e0e0" },
        size: 22,
        shape: "dot",
        borderWidth: 2,
      });
    }

    for (const note of notes) {
      const c = colorMap[note.category] || { bg: "#95a5a6", border: "#95a5a6" };
      visNodes.push({
        id: note.id,
        label: note.title.length > 30 ? note.title.slice(0, 27) + "..." : note.title,
        group: note.category,
        color: {
          background: c.bg,
          border: c.border,
          highlight: { background: c.bg, border: "#fff" },
          hover: { background: c.bg, border: "#fff" },
        },
        font: { size: 11, color: "#ccc" },
        size: 12,
        shape: "dot",
        borderWidth: 1,
      });
    }

    const visEdges: VisEdge[] = [];

    for (const cat of categories) {
      visEdges.push({ from: "root", to: `folder_${cat}`, width: 1.5 });
    }

    for (const note of notes) {
      visEdges.push({
        from: `folder_${note.category}`,
        to: note.id,
        width: 0.5,
        color: { color: "#333", highlight: "#fff", hover: "#666" },
      });
    }

    const noteIdSet = new Set(notes.map((n) => n.id));
    const addedLinks = new Set<string>();
    for (const note of notes) {
      for (const linkTitle of note.links) {
        const target = notes.find(
          (n) =>
            n.id === linkTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "") ||
            n.title.toLowerCase().includes(linkTitle.toLowerCase())
        );
        if (target && target.id !== note.id && noteIdSet.has(target.id)) {
          const key = [note.id, target.id].sort().join("-");
          if (!addedLinks.has(key)) {
            addedLinks.add(key);
            visEdges.push({
              from: note.id,
              to: target.id,
              dashes: true,
              color: { color: "#fbbf24", highlight: "#fbbf24", hover: "#fbbf24" },
              width: 1,
              title: `${note.title} ↔ ${target.title}`,
            });
          }
        }
      }
    }

    import("vis-network").then(({ Network } ) => {
      if (networkRef.current) {
        (networkRef.current as { destroy: () => void }).destroy();
      }

      const options = {
        physics: {
          barnesHut: {
            gravitationalConstant: -5000,
            centralGravity: 0.15,
            springLength: 100,
            springConstant: 0.03,
          },
          stabilization: { iterations: 150 },
        },
        interaction: {
          hover: true,
          tooltipDelay: 150,
          navigationButtons: true,
          keyboard: true,
        },
        edges: {
          smooth: { enabled: true, type: "continuous", roundness: 0.5 } as const,
          color: { color: "#444", highlight: "#fff", hover: "#aaa" },
        },
      };

      const network = new Network(
        containerRef.current!,
        { nodes: visNodes, edges: visEdges },
        options
      );

      network.on("click", (params: { nodes: string[] }) => {
        if (params.nodes.length === 1) {
          const nodeId = params.nodes[0];
          if (noteIdSet.has(nodeId)) {
            onNodeClick(nodeId);
          }
        }
      });

      networkRef.current = network;
    });
  }, [notes, onNodeClick]);

  useEffect(() => {
    buildGraph();
    return () => {
      if (networkRef.current) {
        (networkRef.current as { destroy: () => void }).destroy();
      }
    };
  }, [buildGraph]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full rounded-lg border border-border/50 bg-background/50"
    />
  );
}
