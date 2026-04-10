// src/domain/entities/UserProfile.ts
export type ProfileRole = "pending" | "member" | "admin" | "banned";

export class UserProfile {
  constructor(
    public readonly id: string,
    public readonly email: string | null,
    public readonly name: string | null,
    public readonly role: ProfileRole,
    public readonly approved: boolean,
    public readonly isActive: boolean | null,
    public readonly deletedAt: string | null
  ) {}

  isAdmin(): boolean {
    return this.role === "admin";
  }

  isBlocked(): boolean {
    return this.role === "banned" || this.isActive === false;
  }

  isApproved(): boolean {
    return this.approved === true;
  }
}