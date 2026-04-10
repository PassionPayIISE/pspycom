import { BoardPost } from "@/domain/entities/BoardPost";

export interface IBoardRepository {
  findAll(): Promise<BoardPost[]>;
  findBySlug(slug: string): Promise<BoardPost | null>;
  save(post: BoardPost): Promise<void>;
  delete(postId: string): Promise<void>;
}
