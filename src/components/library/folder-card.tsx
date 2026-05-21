"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Folder, MoreHorizontal } from "lucide-react";
import { deleteFolder } from "@/lib/actions/library";
import { Button } from "@/components/ui/button";
import type { Folder as FolderType } from "@/types/database";

interface FolderCardProps {
  folder: FolderType;
}

export function FolderCard({ folder }: FolderCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      await deleteFolder(folder.id);
    });
  }

  if (confirming) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border-2 border-red-200 bg-red-50 p-5 text-center">
        <Folder className="h-8 w-8 text-red-400" />
        <p className="text-xs font-medium text-red-800 leading-snug break-words w-full">
          Delete &ldquo;{folder.name}&rdquo;?
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="text-xs h-7"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleDelete}
            disabled={isPending}
            className="text-xs h-7 bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <Link
        href={`/library/${folder.id}`}
        className="flex flex-col items-center gap-2 rounded-xl border-2 bg-card p-5 text-center hover:border-primary/40 hover:shadow-md transition-all"
      >
        <Folder className="h-8 w-8 text-primary/60" />
        <span className="text-sm font-medium leading-snug break-words w-full">{folder.name}</span>
      </Link>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setConfirming(true);
        }}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1 text-muted-foreground hover:bg-red-50 hover:text-red-600"
        title="Delete folder"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </div>
  );
}
