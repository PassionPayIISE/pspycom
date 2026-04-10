import { NoticeDto } from "@/application/dto/notice/NoticeDto";
import { INoticeRepository } from "@/domain/repositories/INoticeRepository";

export class GetPublishedNoticesUseCase {
  constructor(private readonly noticeRepository: INoticeRepository) {}

  async execute(): Promise<NoticeDto[]> {
    return this.noticeRepository.findPublishedNotices();
  }
}
