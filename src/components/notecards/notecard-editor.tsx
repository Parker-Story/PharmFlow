"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Pencil, Check, X, Trash2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateNotecardSetTitle, updateCard, deleteCard, addCard } from "@/lib/actions/notecards";
import type { NotecardItem } from "@/types/notecards";

interface NotecardEditorProps {
  setId: string;
  initialTitle: string;
  initialCards: NotecardItem[];
}

export function NotecardEditor({ setId, initialTitle, initialCards }: NotecardEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(initialTitle);
  const [titlePending, startTitleTransition] = useTransition();

  const [cards, setCards] = useState<NotecardItem[]>(initialCards);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ front: "", back: "" });
  const [cardPending, startCardTransition] = useTransition();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();
  const [addPending, startAddTransition] = useTransition();

  function saveTitle() {
    if (!titleDraft.trim()) return;
    startTitleTransition(async () => {
      const { error } = await updateNotecardSetTitle(setId, titleDraft.trim());
      if (!error) {
        setTitle(titleDraft.trim());
        setEditingTitle(false);
      }
    });
  }

  function startEdit(card: NotecardItem) {
    setEditingId(card.id);
    setEditDraft({ front: card.front, back: card.back });
    setConfirmDeleteId(null);
  }

  function saveCard() {
    if (!editingId) return;
    startCardTransition(async () => {
      const { error } = await updateCard(editingId, editDraft.front, editDraft.back);
      if (!error) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === editingId ? { ...c, front: editDraft.front, back: editDraft.back } : c
          )
        );
        setEditingId(null);
      }
    });
  }

  function handleDelete(cardId: string) {
    startDeleteTransition(async () => {
      const { error } = await deleteCard(cardId);
      if (!error) {
        setCards((prev) => prev.filter((c) => c.id !== cardId));
        setConfirmDeleteId(null);
      }
    });
  }

  function handleAddCard() {
    startAddTransition(async () => {
      const { error, cardId } = await addCard(setId, "New term", "New definition");
      if (!error && cardId) {
        const newCard: NotecardItem = {
          id: cardId,
          front: "New term",
          back: "New definition",
          orderIndex: cards.length,
        };
        setCards((prev) => [...prev, newCard]);
        setEditingId(cardId);
        setEditDraft({ front: "New term", back: "New definition" });
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={`/notecards/${setId}`}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Study
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          {editingTitle ? (
            <>
              <Input
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                className="text-xl font-bold"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveTitle();
                  if (e.key === "Escape") { setEditingTitle(false); setTitleDraft(title); }
                }}
                autoFocus
              />
              <button
                onClick={saveTitle}
                disabled={titlePending}
                className="text-green-600 hover:text-green-700 disabled:opacity-50"
              >
                {titlePending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              </button>
              <button
                onClick={() => { setEditingTitle(false); setTitleDraft(title); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">{title}</h1>
              <button
                onClick={() => { setEditingTitle(true); setTitleDraft(title); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">{cards.length} cards</p>
      </div>

      <div className="space-y-2">
        {cards.map((card) => {
          if (confirmDeleteId === card.id) {
            return (
              <div key={card.id} className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <span className="flex-1 text-sm font-medium text-red-800 truncate">
                  Delete this card?
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setConfirmDeleteId(null)}
                  disabled={deletePending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleDelete(card.id)}
                  disabled={deletePending}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {deletePending ? "Deleting…" : "Delete"}
                </Button>
              </div>
            );
          }

          if (editingId === card.id) {
            return (
              <div key={card.id} className="rounded-xl border bg-card p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Front</p>
                    <textarea
                      value={editDraft.front}
                      onChange={(e) => setEditDraft((d) => ({ ...d, front: e.target.value }))}
                      rows={3}
                      className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Back</p>
                    <textarea
                      value={editDraft.back}
                      onChange={(e) => setEditDraft((d) => ({ ...d, back: e.target.value }))}
                      rows={3}
                      className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setEditingId(null)} disabled={cardPending}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={saveCard} disabled={cardPending}>
                    {cardPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                    Save
                  </Button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={card.id}
              className="group flex items-start gap-4 rounded-xl border bg-card px-4 py-3 hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => startEdit(card)}
            >
              <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Front</p>
                  <p className="text-sm">{card.front}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Back</p>
                  <p className="text-sm text-muted-foreground">{card.back}</p>
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(card.id); setEditingId(null); }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-600 transition-all p-1 rounded mt-1"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        className="w-full"
        onClick={handleAddCard}
        disabled={addPending}
      >
        {addPending ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        Add Card
      </Button>
    </div>
  );
}
