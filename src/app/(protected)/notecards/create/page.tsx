import { createClient } from "@/lib/supabase/server";
import { NotecardForm } from "@/components/notecards/notecard-form";

export const metadata = { title: "Notecard Generator — PharmFlow" };

export default async function NotecardCreatePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawFolders } = await supabase
    .from("folders")
    .select("id, name")
    .eq("user_id", user!.id)
    .is("parent_id", null)
    .order("created_at");

  const folders = (rawFolders ?? []) as { id: string; name: string }[];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Notecard Generator</h1>
        <p className="text-muted-foreground">Upload a lecture PDF and generate flashcards.</p>
      </div>
      <NotecardForm folders={folders} />
    </div>
  );
}
