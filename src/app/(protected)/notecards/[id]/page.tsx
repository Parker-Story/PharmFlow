import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NotecardPlayer } from "@/components/notecards/notecard-player";
import { Button } from "@/components/ui/button";
import type { NotecardItem } from "@/types/notecards";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NotecardStudyPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: rawSet }, { data: rawCards }] = await Promise.all([
    supabase
      .from("notecard_sets")
      .select("id, title, card_count, status, folder_id")
      .eq("id", id)
      .eq("user_id", user!.id)
      .single(),
    supabase
      .from("notecards")
      .select("id, front, back, order_index")
      .eq("set_id", id)
      .order("order_index"),
  ]);

  if (!rawSet) notFound();

  const set = rawSet as { id: string; title: string; card_count: number; status: string; folder_id: string | null };
  const cards: NotecardItem[] = (rawCards ?? []).map((c) => ({
    id: c.id,
    front: c.front,
    back: c.back,
    orderIndex: c.order_index,
  }));

  const backHref = set.folder_id ? `/library/${set.folder_id}` : "/library";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={backHref}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Library
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold truncate">{set.title}</h1>
          <p className="text-sm text-muted-foreground">{cards.length} cards</p>
        </div>
      </div>

      {set.status !== "ready" || cards.length === 0 ? (
        <p className="text-muted-foreground py-12 text-center">
          {set.status === "processing" ? "Still generating cards…" : "No cards found."}
        </p>
      ) : (
        <NotecardPlayer setId={set.id} cards={cards} />
      )}
    </div>
  );
}
