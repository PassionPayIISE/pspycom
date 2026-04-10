export class BoardComment {
  constructor(
    public readonly id: string,
    public readonly postId: string,
    public readonly authorId: string,
    public content: string,
    public readonly createdAt: string,
    public updatedAt: string,
    public readonly parentId: string | null = null,
    public deletedAt: string | null = null
  ) {}

  canDelete(userId: string): boolean {
    return this.authorId === userId;
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  updateContent(nextContent: string) {
    const trimmed = nextContent.trim();

    if (!trimmed) {
      throw new Error("댓글 내용은 비어 있을 수 없습니다.");
    }

    this.content = trimmed;
    this.updatedAt = new Date().toISOString();
  }

  markDeleted() {
    this.content = "삭제된 댓글입니다.";
    this.updatedAt = new Date().toISOString();
    this.deletedAt = new Date().toISOString();
  }
}