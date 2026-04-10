export type CommentAuthor = {
  id: string;
  name: string | null;
  email: string | null;
};

export type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  updated_at: string;
  author: CommentAuthor | null;
};

export type CommentNode = CommentRow & {
  children: CommentNode[];
};