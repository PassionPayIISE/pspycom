// src/domain/entities/BoardPost.ts
export class BoardPost {
  constructor(
    public readonly id: string,
    public title: string,
    public slug: string,
    public content: string,
    public readonly authorId: string,
    public readonly authorName: string | null,
    public readonly createdAt: string,
    public updatedAt: string
  ) {}

  canEdit(userId: string): boolean {
    return this.authorId === userId;
  }

  update(title: string, content: string) {
    const nextTitle = title.trim();
    const nextContent = content.trim();

    if (!nextTitle) {
      throw new Error("제목은 비어 있을 수 없습니다.");
    }

    if (!nextContent) {
      throw new Error("내용은 비어 있을 수 없습니다.");
    }

    this.title = nextTitle;
    this.content = nextContent;
    this.updatedAt = new Date().toISOString();
  }
}