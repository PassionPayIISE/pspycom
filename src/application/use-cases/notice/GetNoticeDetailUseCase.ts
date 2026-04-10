import { NoticeDto } from "@/application/dto/notice/NoticeDto";
import { INoticeRepository } from "@/domain/repositories/INoticeRepository";

export class GetNoticeDetailUseCase {
  constructor(private readonly noticeRepository: INoticeRepository) {}

  async execute(slug: string): Promise<NoticeDto | null> {
    return this.noticeRepository.findPublishedBySlug(slug);
  }
}
