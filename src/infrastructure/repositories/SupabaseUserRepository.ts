// src/infrastructure/repositories/SupabaseUserRepository.ts
import { MemberSummaryDto } from "@/application/dto/member/MemberSummaryDto";
import { UserProfile, ProfileRole } from "@/domain/entities/UserProfile";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import type { SupabaseClient } from "@supabase/supabase-js";

type MemberRow = {
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

type ProfileRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: ProfileRole;
  approved: boolean;
  is_active: boolean | null;
  deleted_at: string | null;
};

export class SupabaseUserRepository implements IUserRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findActiveMembers(): Promise<MemberSummaryDto[]> {
    const { data, error } = await this.supabase
      .from("members")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error) {
      throw new Error(`멤버 조회 실패: ${error.message}`);
    }

    return ((data ?? []) as MemberRow[]).map((row) => ({
      id: row.id,
      name: row.name,
      role: row.role ?? null,
      team: row.team ?? null,
      image_url: row.image_url ?? null,
      is_active: row.is_active ?? null,
      sort_order: row.sort_order ?? null,
      created_at: row.created_at ?? null,
      updated_at: row.updated_at ?? null,
    }));
  }

  async getCurrentAuthUser(): Promise<{ id: string } | null> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return { id: user.id };
  }

  async findProfileById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("id, email, name, role, approved, is_active, deleted_at")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw new Error(`프로필 조회 실패: ${error.message}`);
    }

    if (!data) {
      return null;
    }

    const row = data as ProfileRow;

    return new UserProfile(
      row.id,
      row.email,
      row.name,
      row.role,
      row.approved,
      row.is_active,
      row.deleted_at
    );
  }

  async approveMember(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("profiles")
      .update({
        approved: true,
        is_active: true,
        role: "member",
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`멤버 승인 실패: ${error.message}`);
    }
  }

  async deactivateMember(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("profiles")
      .update({
        is_active: false,
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`멤버 비활성화 실패: ${error.message}`);
    }
  }

  async activateMember(userId: string): Promise<void> {
    const { error } = await this.supabase
      .from("profiles")
      .update({
        is_active: true,
      })
      .eq("id", userId);

    if (error) {
      throw new Error(`멤버 활성화 실패: ${error.message}`);
    }
  }

  async changeRole(userId: string, role: ProfileRole): Promise<void> {
    const { error } = await this.supabase
      .from("profiles")
      .update({ role })
      .eq("id", userId);

    if (error) {
      throw new Error(`권한 변경 실패: ${error.message}`);
    }
  }
}