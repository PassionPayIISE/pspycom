// src/application/dto/member/MemberSummaryDto.ts
export type MemberSummaryDto = {
  id: string;
  name: string;
  role: string | null;
  team: string | null;
  image_url: string | null;
  is_active: boolean | null;
  sort_order: number | null;
  created_at: string | null;
  updated_at: string | null;
};