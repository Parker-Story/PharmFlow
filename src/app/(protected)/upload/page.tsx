import { createClient } from "@/lib/supabase/server";
import { UnifiedUploadForm } from "@/components/upload/unified-upload-form";
import { PointsHint } from "@/components/ui/points-hint";
import type { Folder } from "@/types/database";

const HINT_IDS: Record<string, string[]> = {
  exam:      ["exam_gen_1", "exam_gen_5", "exam_gen_10", "exam_gen_25"],
  notecards: ["notecard_1", "notecard_5", "notecard_10"],
  summary:   ["summary_1", "summary_5", "summary_10"],
};

export const metadata = { title: "Generate Study Materials | PharmFlow" };

interface PageProps {
  searchParams: Promise<{ generate?: string }>;
}

export default async function UploadPage({ searchParams }: PageProps) {
  const { generate } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawFolders } = await supabase
    .from("folders")
    .select("id, name, parent_id")
    .eq("user_id", user!.id)
    .order("created_at");

  const folders = (rawFolders ?? []) as Pick<Folder, "id" | "name" | "parent_id">[];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Generate Study Materials</h1>
        <p className="text-muted-foreground">
          Upload one or more lecture PDFs and choose what to generate. The PDF is never stored.
        </p>
        {generate && HINT_IDS[generate] && <PointsHint ids={HINT_IDS[generate]} />}
      </div>
      <UnifiedUploadForm folders={folders} initialGenerate={generate} />
    </div>
  );
}
