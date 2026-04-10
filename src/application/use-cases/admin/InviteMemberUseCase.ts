// src/application/use-cases/admin/InviteMemberUseCase.ts
type InviteMemberInput = {
  email: string;
  redirectTo: string;
};

type AdminAuthLike = {
  admin: {
    inviteUserByEmail: (
      email: string,
      options?: { redirectTo?: string }
    ) => Promise<{ error: { message: string } | null }>;
  };
};

type AdminClientLike = {
  auth: AdminAuthLike;
};

export class InviteMemberUseCase {
  constructor(private readonly supabaseAdmin: AdminClientLike) {}

  async execute(input: InviteMemberInput): Promise<void> {
    const email = input.email.trim().toLowerCase();
    const redirectTo = input.redirectTo.trim();

    if (!email) {
      throw new Error("이메일이 필요합니다.");
    }

    if (!redirectTo) {
      throw new Error("redirectTo가 필요합니다.");
    }

    const { error } = await this.supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      { redirectTo }
    );

    if (error) {
      throw new Error(error.message);
    }
  }
}