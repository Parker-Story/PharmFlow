import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/upload/upload-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Folder } from "@/types/database";

export const metadata = { title: "Practice Exam Generator — PharmFlow" };

export default async function UploadPage() {
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
    <div className="mx-auto max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Practice Exam Generator</h1>
        <p className="text-muted-foreground">
          Upload a lecture PDF and configure your exam — we extract the text and generate questions. The PDF is never stored.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New Exam</CardTitle>
          <CardDescription>
            Configure your options, then drop in your PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadForm folders={folders} />
        </CardContent>
      </Card>
    </div>
  );
}
