"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Folder as FolderType } from "@/types/database";

interface LibrarySidebarProps {
  folders: FolderType[];
}

export function LibrarySidebar({ folders }: LibrarySidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r bg-card flex flex-col sticky top-0 h-screen overflow-y-auto">
      <div className="px-4 py-5 border-b shrink-0">
        <h2 className="text-base font-semibold">My Library</h2>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5">
        <Link
          href="/library"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/library"
              ? "bg-accent/15 text-foreground"
              : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
          )}
        >
          <Folder className="h-4 w-4 shrink-0" />
          All Files
        </Link>

        {folders.map((folder) => {
          const isActive =
            pathname === `/library/${folder.id}` ||
            pathname.startsWith(`/library/${folder.id}/`);
          return (
            <Link
              key={folder.id}
              href={`/library/${folder.id}`}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent/15 text-foreground"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              )}
            >
              {isActive ? (
                <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
              ) : (
                <Folder className="h-4 w-4 shrink-0" />
              )}
              <span className="truncate">{folder.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
