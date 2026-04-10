import { createClient } from "@/infrastructure/supabase/server";
import { SupabaseNoticeRepository } from "@/infrastructure/repositories/SupabaseNoticeRepository";
import { GetPublishedNoticesUseCase } from "@/application/use-cases/notice/GetPublishedNoticesUseCase";
import { GetNoticeDetailUseCase } from "@/application/use-cases/notice/GetNoticeDetailUseCase";

export async function createNoticeContainer() {
  const supabase = await createClient();
  const noticeRepository = new SupabaseNoticeRepository(supabase);

  return {
    getPublishedNoticesUseCase: new GetPublishedNoticesUseCase(noticeRepository),
    getNoticeDetailUseCase: new GetNoticeDetailUseCase(noticeRepository),
  };
}
