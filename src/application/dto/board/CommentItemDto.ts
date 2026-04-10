export type CommentItemDto = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  deleted_at: string | null;
  author_name: string | null;
  author_email: string | null;
};