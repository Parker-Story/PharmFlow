"use client";

import { useState, useTransition, useRef } from "react";
import { FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFolder } from "@/lib/actions/library";

interface NewFolderFormProps {
  parentId?: string;
}

export function NewFolderForm({ parentId }: NewFolderFormProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleOpen() {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await createFolder(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setOpen(false);
        setError(null);
        (e.target as HTMLFormElement).reset();
      }
    });
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={handleOpen} className="gap-2">
        <FolderPlus className="h-4 w-4" />
        New Folder
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      {parentId && <input type="hidden" name="parent_id" value={parentId} />}
      <Input
        ref={inputRef}
        name="name"
        placeholder="Folder name"
        className="w-48"
        required
        disabled={isPending}
      />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Creating…" : "Create"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => { setOpen(false); setError(null); }}
      >
        Cancel
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
