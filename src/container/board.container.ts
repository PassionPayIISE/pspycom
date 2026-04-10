// src/container/board.container.ts
import { createClient } from "@/infrastructure/supabase/server";
import { GetBoardPostDetailUseCase } from "@/application/use-cases/board/GetBoardPostDetailUseCase";
import { GetBoardPostsUseCase } from "@/application/use-cases/board/GetBoardPostsUseCase";
import { CreateBoardPostUseCase } from "@/application/use-cases/board/CreateBoardPostUseCase";
import { UpdateBoardPostUseCase } from "@/application/use-cases/board/UpdateBoardPostUseCase";
import { SupabaseBoardRepository } from "@/infrastructure/repositories/SupabaseBoardRepository";

export async function createBoardContainer() {
  const supabase = await createClient();
  const boardRepository = new SupabaseBoardRepository(supabase);

  return {
    getBoardPostsUseCase: new GetBoardPostsUseCase(boardRepository),
    getBoardPostDetailUseCase: new GetBoardPostDetailUseCase(boardRepository),
    createBoardPostUseCase: new CreateBoardPostUseCase(boardRepository),
    updateBoardPostUseCase: new UpdateBoardPostUseCase(boardRepository),
  };
}