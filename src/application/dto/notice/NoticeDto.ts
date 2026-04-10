// src/application/dto/notice/NoticeDto.ts
export type NoticeDto = {
  id: number | string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  pinned: boolean;
  visibility: "public" | "member" | "private";
  author_id: string | null;
  created_at: string;
  updated_at: string;
};