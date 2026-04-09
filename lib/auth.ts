import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ProfileRole = "pending" | "member" | "admin" | "banned";

export type AuthProfile = {
  id: string;
  email: string | null;
  name: string | null;
  role: ProfileRole;
  approved: boolean;
  is_active: boolean | null;
  deleted_at: string | null;
};

export async function requireApprovedUser() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, name, role, approved, is_active, deleted_at")
    .eq("id", user.id)
    .single<AuthProfile>();

  if (error || !profile) {
    redirect("/login");
  }

  if (profile.role === "banned" || profile.is_active === false) {
    redirect("/blocked");
  }

  if (profile.approved !== true) {
    redirect("/pending");
  }

  return { supabase, user, profile };
}

export async function requireAdminUser() {
  const result = await requireApprovedUser();

  if (result.profile.role !== "admin") {
    redirect("/");
  }

  return result;
}