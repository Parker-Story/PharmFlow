import { createClient } from "@/lib/supabase/server";
import { UnifiedUploadForm } from "@/components/upload/unified-upload-form";
import type { Folder } from "@/types/database";

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
    .select("id, name")
    .eq("user_id", user!.id)
    .is("parent_id", null)
    .order("created_at");

  const folders = (rawFolders ?? []) as Pick<Folder, "id" | "name">[];

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Generate Study Materials</h1>
        <p className="text-muted-foreground">
          Upload one or more lecture PDFs and choose what to generate. The PDF is never stored.
        </p>
      </div>
      <UnifiedUploadForm folders={folders} initialGenerate={generate} />
    </div>
  );
}
