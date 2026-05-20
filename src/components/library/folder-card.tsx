"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Folder } from "lucide-react";
import { deleteFolder } from "@/lib/actions/library";
import type { Folder as FolderType } from "@/types/database";

interface FolderCardProps {
  folder: FolderType;
}

export function FolderCard({ folder }: FolderCardProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    startTransition(async () => {
      await deleteFolder(folder.id);
    });
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
        onClick={handleDelete}
        disabled={isPending}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground hover:text-destructive px-1 disabled:opacity-30"
        title="Delete folder"
      >
        ✕
      </button>
    </div>
  );
}
