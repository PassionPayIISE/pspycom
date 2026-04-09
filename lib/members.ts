import { createClient } from "@/lib/supabase-browser";

export type Member = {
  id: string;
  name: string;
  role?: string | null;
  team?: string | null;
  image_url?: string | null;
  created_at?: string | null;
};

export async function getAllMembers(): Promise<Member[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getAllMembers error:", error.message);
    return [];
  }

  return (data ?? []) as Member[];
}