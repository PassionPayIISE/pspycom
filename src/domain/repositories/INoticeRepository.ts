import { NoticeDto } from "@/application/dto/notice/NoticeDto";

export interface INoticeRepository {
  findPublishedNotices(): Promise<NoticeDto[]>;
  findPublishedBySlug(slug: string): Promise<NoticeDto | null>;
}
