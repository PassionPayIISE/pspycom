// src/domain/entities/BoardComment.ts
export class BoardComment {
  constructor(
    public readonly id: string,
    public readonly postId: string,
    public readonly authorId: string,
    public content: string,
    public readonly createdAt: string,
    public updatedAt: string,
    public readonly parentId: string | null = null
  ) {}

  canDelete(userId: string): boolean {
    return this.authorId === userId;
  }

  updateContent(nextContent: string) {
    const trimmed = nextContent.trim();

    if (!trimmed) {
      throw new Error("댓글 내용은 비어 있을 수 없습니다.");
    }

    this.content = trimmed;
    this.updatedAt = new Date().toISOString();
  }
}