"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { Notice } from "@/types/supabase";

type Props = {
  initialNotices: Notice[];
};

type EditState = {
  id: number | null;
  title: string;
  slug: string;
  summary: string;
  content: string;
  publishedAt: string;
  pinned: boolean;
  published: boolean;
};

const emptyEditState: EditState = {
  id: null,
  title: "",
  slug: "",
  summary: "",
  content: "",
  publishedAt: "",
  pinned: false,
  published: true,
};

export default function AdminNoticeManager({ initialNotices }: Props) {
  const supabase = createClient();

  const [notices, setNotices] = useState<Notice[]>(initialNotices);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [pinned, setPinned] = useState(false);
  const [published, setPublished] = useState(true);

  const [editState, setEditState] = useState<EditState>(emptyEditState);

  const refreshNotices = async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .order("pinned", { ascending: false })
      .order("published_at", { ascending: false });

    if (!error && data) {
      setNotices(data as Notice[]);
    }
  };

  const resetCreateForm = () => {
    setTitle("");
    setSlug("");
    setSummary("");
    setContent("");
    setPublishedAt("");
    setPinned(false);
    setPublished(true);
  };

  const handleCreate = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("notices").insert({
      title,
      slug,
      summary: summary || null,
      content,
      published,
      pinned,
      published_at: publishedAt || null,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("공지 등록 완료");
    resetCreateForm();
    await refreshNotices();
  };

  const startEdit = (notice: Notice) => {
    setEditState({
      id: notice.id,
      title: notice.title,
      slug: notice.slug,
      summary: notice.summary ?? "",
      content: notice.content,
      publishedAt: notice.published_at ?? "",
      pinned: notice.pinned,
      published: notice.published,
    });
    setMessage("");
  };

  const cancelEdit = () => {
    setEditState(emptyEditState);
  };

  const handleUpdate = async () => {
    if (!editState.id) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase
      .from("notices")
      .update({
        title: editState.title,
        slug: editState.slug,
        summary: editState.summary || null,
        content: editState.content,
        published_at: editState.publishedAt || null,
        pinned: editState.pinned,
        published: editState.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editState.id);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("공지 수정 완료");
    setEditState(emptyEditState);
    await refreshNotices();
  };

  const handleDelete = async (id: number) => {
    const ok = window.confirm("이 공지를 삭제할까?");
    if (!ok) return;

    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("notices").delete().eq("id", id);

    setLoading(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("공지 삭제 완료");
    await refreshNotices();
  };

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-[#e7e5df] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#1f1f1f]">새 공지 작성</h2>

        <div className="mt-6 grid gap-4">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="제목"
            className="rounded-xl border border-[#e7e5df] px-4 py-3"
          />

          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="slug"
            className="rounded-xl border border-[#e7e5df] px-4 py-3"
          />

          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="요약"
            className="rounded-xl border border-[#e7e5df] px-4 py-3"
          />

          <input
            type="date"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
            className="rounded-xl border border-[#e7e5df] px-4 py-3"
          />

          <div className="flex flex-wrap gap-6 text-sm text-[#444]">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              중요 공지
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              공개 상태
            </label>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="본문"
            rows={10}
            className="rounded-xl border border-[#e7e5df] px-4 py-3"
          />

          <button
            onClick={handleCreate}
            disabled={loading}
            className="w-fit rounded-xl bg-[#fbaf45] px-5 py-3 font-semibold text-[#1f1f1f] disabled:opacity-60"
          >
            공지 등록
          </button>
        </div>
      </section>

      {editState.id && (
        <section className="rounded-3xl border border-[#e7e5df] bg-[#fff8e8] p-6">
          <h2 className="text-xl font-semibold text-[#1f1f1f]">공지 수정</h2>

          <div className="mt-6 grid gap-4">
            <input
              value={editState.title}
              onChange={(e) =>
                setEditState((prev) => ({ ...prev, title: e.target.value }))
              }
              placeholder="제목"
              className="rounded-xl border border-[#e7e5df] px-4 py-3"
            />

            <input
              value={editState.slug}
              onChange={(e) =>
                setEditState((prev) => ({ ...prev, slug: e.target.value }))
              }
              placeholder="slug"
              className="rounded-xl border border-[#e7e5df] px-4 py-3"
            />

            <input
              value={editState.summary}
              onChange={(e) =>
                setEditState((prev) => ({ ...prev, summary: e.target.value }))
              }
              placeholder="요약"
              className="rounded-xl border border-[#e7e5df] px-4 py-3"
            />

            <input
              type="date"
              value={editState.publishedAt}
              onChange={(e) =>
                setEditState((prev) => ({
                  ...prev,
                  publishedAt: e.target.value,
                }))
              }
              className="rounded-xl border border-[#e7e5df] px-4 py-3"
            />

            <div className="flex flex-wrap gap-6 text-sm text-[#444]">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editState.pinned}
                  onChange={(e) =>
                    setEditState((prev) => ({
                      ...prev,
                      pinned: e.target.checked,
                    }))
                  }
                />
                중요 공지
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editState.published}
                  onChange={(e) =>
                    setEditState((prev) => ({
                      ...prev,
                      published: e.target.checked,
                    }))
                  }
                />
                공개 상태
              </label>
            </div>

            <textarea
              value={editState.content}
              onChange={(e) =>
                setEditState((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder="본문"
              rows={10}
              className="rounded-xl border border-[#e7e5df] px-4 py-3"
            />

            <div className="flex gap-3">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="rounded-xl bg-[#fbaf45] px-5 py-3 font-semibold text-[#1f1f1f] disabled:opacity-60"
              >
                수정 저장
              </button>

              <button
                onClick={cancelEdit}
                className="rounded-xl border border-[#e7e5df] bg-white px-5 py-3 font-semibold text-[#1f1f1f]"
              >
                취소
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-[#e7e5df] bg-white p-6">
        <h2 className="text-xl font-semibold text-[#1f1f1f]">기존 공지</h2>

        <div className="mt-6 space-y-4">
          {notices.length === 0 ? (
            <p className="text-sm text-[#6b7280]">등록된 공지가 없다.</p>
          ) : (
            notices.map((notice) => (
              <div
                key={notice.id}
                className="rounded-2xl border border-[#e7e5df] p-4"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-[#1f1f1f]">
                        {notice.title}
                      </p>
                      {notice.pinned && (
                        <span className="rounded-full bg-[#fff3dd] px-2 py-1 text-xs font-semibold text-[#b96d00]">
                          중요
                        </span>
                      )}
                      {!notice.published && (
                        <span className="rounded-full bg-[#f2f2f0] px-2 py-1 text-xs font-semibold text-[#666]">
                          비공개
                        </span>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-[#6b7280]">{notice.slug}</p>

                    {notice.summary && (
                      <p className="mt-2 text-sm text-[#6b7280]">
                        {notice.summary}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <button
                      onClick={() => startEdit(notice)}
                      className="rounded-xl border border-[#e7e5df] px-4 py-2 text-sm text-[#1f1f1f]"
                    >
                      수정
                    </button>

                    <button
                      onClick={() => handleDelete(notice.id)}
                      className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {message && <p className="mt-6 text-sm text-[#6b7280]">{message}</p>}
      </section>
    </div>
  );
}