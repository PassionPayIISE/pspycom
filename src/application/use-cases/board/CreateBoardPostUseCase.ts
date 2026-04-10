// src/application/use-cases/board/CreateBoardPostUseCase.ts
import { BoardPost } from "@/domain/entities/BoardPost";
import { IBoardRepository } from "@/domain/repositories/IBoardRepository";
import { toSlug } from "@/shared/utils/slug";

type CreateBoardPostInput = {
  title: string;
  content: string;
  authorId: string;
};

export class CreateBoardPostUseCase {
  constructor(private readonly boardRepository: IBoardRepository) {}

  async execute(input: CreateBoardPostInput): Promise<BoardPost> {
    const title = input.title.trim();
    const content = input.content.trim();

    if (!title) {
      throw new Error("제목을 입력하세요.");
    }

    if (!content) {
      throw new Error("내용을 입력하세요.");
    }

    const post = new BoardPost(
      crypto.randomUUID(),
      title,
      `${toSlug(title) || "post"}-${crypto.randomUUID().slice(0, 8)}`,
      content,
      input.authorId,
      new Date().toISOString(),
      new Date().toISOString()
    );

    await this.boardRepository.save(post);
    return post;
  }
}