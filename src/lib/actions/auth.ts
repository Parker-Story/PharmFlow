"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password } = parsed.data;
  const fullName = formData.get("full_name") as string | null;

  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName ?? "" },
    },
  });

  if (signUpError) {
    return { error: signUpError.message };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    return { error: "Account created. Please sign in." };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const { email, password } = parsed.data;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateDisplayName(
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient();
  const fullName = (formData.get("full_name") as string)?.trim();

  if (!fullName) return { error: "Name cannot be empty." };

  const { error } = await supabase.auth.updateUser({
    data: { full_name: fullName },
  });

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: "Display name updated." };
}

export async function updateEmail(
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient();
  const email = (formData.get("email") as string)?.trim();

  const parsed = z.string().email().safeParse(email);
  if (!parsed.success) return { error: "Invalid email address." };

  const { error } = await supabase.auth.updateUser({ email: parsed.data });
  if (error) return { error: error.message };

  return { success: "Check your new email address to confirm the change." };
}

export async function updatePassword(
  formData: FormData
): Promise<{ error?: string; success?: string }> {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm_password") as string;

  if (password !== confirm) return { error: "Passwords do not match." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };

  return { success: "Password updated successfully." };
}

export async function deleteAccount(): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const userId = user.id;

  // Delete user data — questions and attempts cascade from quizzes
  await supabase.from("quizzes").delete().eq("user_id", userId);
  await supabase.from("profiles").delete().eq("id", userId);

  // Sign out before deleting the auth record
  await supabase.auth.signOut();

  // Hard-delete the auth user via service role
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) console.error("Auth user deletion failed:", error.message);

  redirect("/login");
}
