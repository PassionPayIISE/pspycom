// src/container/comment.container.ts
import { createClient } from "@/infrastructure/supabase/server";
import { GetCommentsByPostIdUseCase } from "@/application/use-cases/board/GetCommentsByPostIdUseCase";
import { CreateCommentUseCase } from "@/application/use-cases/board/CreateCommentUseCase";
import { DeleteCommentUseCase } from "@/application/use-cases/board/DeleteCommentUseCase";
import { SupabaseCommentRepository } from "@/infrastructure/repositories/SupabaseCommentRepository";

export async function createCommentContainer() {
  const supabase = await createClient();
  const commentRepository = new SupabaseCommentRepository(supabase);

  return {
    getCommentsByPostIdUseCase: new GetCommentsByPostIdUseCase(commentRepository),
    createCommentUseCase: new CreateCommentUseCase(commentRepository),
    deleteCommentUseCase: new DeleteCommentUseCase(commentRepository),
  };
}