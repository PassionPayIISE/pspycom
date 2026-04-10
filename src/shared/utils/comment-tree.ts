import { CommentItemDto } from "@/application/dto/board/CommentItemDto";

export type CommentTreeItem = CommentItemDto & {
  children: CommentTreeItem[];
};

export function buildCommentTree(comments: CommentItemDto[]): CommentTreeItem[] {
  const map = new Map<string, CommentTreeItem>();
  const roots: CommentTreeItem[] = [];

  for (const comment of comments) {
    map.set(comment.id, {
      ...comment,
      children: [],
    });
  }

  for (const comment of comments) {
    const node = map.get(comment.id);
    if (!node) continue;

    if (comment.parent_id) {
      const parent = map.get(comment.parent_id);

      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  }

  const sortNodes = (nodes: CommentTreeItem[]) => {
    nodes.sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    for (const node of nodes) {
      sortNodes(node.children);
    }
  };

  sortNodes(roots);
  return roots;
}