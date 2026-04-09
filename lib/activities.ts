import { createClient } from "@/lib/supabase-browser";

type Member = {
  id: string;
  name: string;
  role?: string | null;
  team?: string | null;
  image_url?: string | null;
  is_active?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function getAllMembers(): Promise<Member[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllMembers error:", error.message);
    return [];
  }

  return (data ?? []) as Member[];
}