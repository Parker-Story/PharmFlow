import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { NotecardEditor } from "@/components/notecards/notecard-editor";
import type { NotecardItem } from "@/types/notecards";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function NotecardEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [{ data: rawSet }, { data: rawCards }] = await Promise.all([
    supabase
      .from("notecard_sets")
      .select("id, title")
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

  const cards: NotecardItem[] = (rawCards ?? []).map((c) => ({
    id: c.id,
    front: c.front,
    back: c.back,
    orderIndex: c.order_index,
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <NotecardEditor
        setId={rawSet.id}
        initialTitle={rawSet.title}
        initialCards={cards}
      />
    </div>
  );
}
