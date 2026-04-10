// src/application/use-cases/board/UpdateBoardPostUseCase.ts
import { BoardPost } from "@/domain/entities/BoardPost";
import { IBoardRepository } from "@/domain/repositories/IBoardRepository";

type UpdateBoardPostInput = {
  slug: string;
  currentUserId: string;
  title: string;
  content: string;
};

export class UpdateBoardPostUseCase {
  constructor(private readonly boardRepository: IBoardRepository) {}

  async execute(input: UpdateBoardPostInput): Promise<BoardPost> {
    const post = await this.boardRepository.findBySlug(input.slug);

    if (!post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    if (!post.canEdit(input.currentUserId)) {
      throw new Error("수정 권한이 없습니다.");
    }

    post.update(input.title, input.content);
    await this.boardRepository.save(post);

    return post;
  }
}