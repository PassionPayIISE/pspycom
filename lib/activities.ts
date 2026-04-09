import { supabase } from "@/lib/supabase";
import { Member } from "@/types/supabase";

export async function getAllMembers(): Promise<Member[]> {
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getAllMembers error:", error);
    return [];
  }

  return data as Member[];
}