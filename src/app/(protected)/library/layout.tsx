import { createClient } from "@/lib/supabase/server";
import { LibrarySidebar } from "@/components/library/library-sidebar";
import type { Folder } from "@/types/database";

export default async function LibraryLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rawFolders } = await supabase
    .from("folders")
    .select("*")
    .eq("user_id", user!.id)
    .is("parent_id", null)
    .order("created_at");

  const folders = (rawFolders ?? []) as Folder[];

  return (
    <div className="flex -mx-8 -my-8 min-h-screen">
      <LibrarySidebar folders={folders} />
      <div className="flex-1 min-w-0 px-8 py-8">
        {children}
      </div>
    </div>
  );
}
