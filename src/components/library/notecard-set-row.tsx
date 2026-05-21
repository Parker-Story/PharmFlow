"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { StickyNote, Clock, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils/date";
import { deleteNotecardSet } from "@/lib/actions/notecards";
import { Button } from "@/components/ui/button";
import type { NotecardSet } from "@/types/database";

interface NotecardSetRowProps {
  set: NotecardSet;
}

export function NotecardSetRow({ set }: NotecardSetRowProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      await deleteNotecardSet(set.id);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
        <StickyNote className="h-4 w-4 shrink-0 text-red-400" />
        <span className="flex-1 text-sm font-medium text-red-800 truncate">
          Delete &ldquo;{set.title}&rdquo;?
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          {isPending ? "Deleting…" : "Delete"}
        </Button>
      </div>
    );
  }

  return (
    <div className={`group relative flex items-center gap-3 rounded-xl border bg-card px-4 py-3 transition-shadow ${set.status !== "ready" ? "opacity-60 cursor-not-allowed" : "hover:shadow-sm"}`}>
      {set.status === "ready" && (
        <Link href={`/notecards/${set.id}`} className="absolute inset-0 rounded-xl" />
      )}
      <StickyNote className="relative z-10 h-4 w-4 shrink-0 text-primary/70" />
      <span className="relative z-10 flex-1 text-sm font-medium truncate">{set.title}</span>
      <span className="relative z-10 text-xs font-medium text-muted-foreground whitespace-nowrap">
        {set.card_count} {set.card_count === 1 ? "card" : "cards"}
      </span>
      <span className="relative z-10 text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {formatDistanceToNow(set.created_at)}
      </span>
      {set.status !== "ready" && (
        <span className="relative z-10 text-xs text-muted-foreground capitalize">{set.status}</span>
      )}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(true);
        }}
        className="relative z-10 ml-1 rounded-md p-1 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-50 hover:text-red-600"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
