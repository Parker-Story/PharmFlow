import { createClient } from "@/lib/supabase/server";
import { SettingsForms } from "@/components/settings/settings-forms";

export const metadata = { title: "Settings — PharmFlow" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account</p>
      </div>

      <SettingsForms
        displayName={user?.user_metadata?.full_name ?? ""}
        email={user?.email ?? ""}
      />
    </div>
  );
}
