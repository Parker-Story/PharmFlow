import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { AchievementNotifier } from "@/components/achievement-notifier";
import { syncAchievements } from "@/lib/actions/achievements";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { newlyEarned } = await syncAchievements();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-8 py-8 min-h-screen overflow-x-hidden">
        {children}
      </main>
      <AchievementNotifier newlyEarned={newlyEarned} />
    </div>
  );
}
