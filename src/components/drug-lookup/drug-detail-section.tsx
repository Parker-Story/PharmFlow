"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface DrugDetailSectionProps {
  title: string;
  content: string;
  defaultOpen?: boolean;
}

export function DrugDetailSection({ title, content, defaultOpen = false }: DrugDetailSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="font-semibold text-sm">{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      <div className={isOpen ? undefined : "hidden"}>
        <div className="px-4 pb-4 pt-2 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed border-t">
          {content}
        </div>
      </div>
    </div>
  );
}
