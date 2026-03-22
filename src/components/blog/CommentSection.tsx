"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { addComment, addReply, deleteComment } from "@/lib/actions/posts";
import type { CommentRow, ReplyRow } from "@/lib/actions/posts";

function formatRelative(date: Date): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: "var(--primary, #c8102e)",
      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 700, fontSize: size * 0.39, flexShrink: 0,
    }}>
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

interface Props {
  postId: string;
  initialComments: CommentRow[];
}

export default function CommentSection({ postId, initialComments }: Props) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentRow[]>(initialComments);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Reply state
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  const userId = session?.user?.id;
  const isAdmin = (session?.user as any)?.role === "admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await addComment(postId, body);
      const optimistic: CommentRow = {
        id: `opt-${Date.now()}`,
        userId: userId!,
        body: body.trim(),
        createdAt: new Date(),
        user: { name: session!.user.name, image: session!.user.image ?? null },
        replies: [],
      };
      setComments([optimistic, ...comments]);
      setBody("");
    } catch (err: any) {
      setError(err.message ?? "Failed to post comment.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReply(e: React.FormEvent, parentId: string) {
    e.preventDefault();
    if (!replyBody.trim()) return;
    setReplySubmitting(true);
    setReplyError("");
    try {
      await addReply(parentId, replyBody);
      const optimisticReply: ReplyRow = {
        id: `opt-reply-${Date.now()}`,
        userId: userId!,
        body: replyBody.trim(),
        createdAt: new Date(),
        user: { name: session!.user.name, image: session!.user.image ?? null },
      };
      setComments(comments.map((c) =>
        c.id === parentId
          ? { ...c, replies: [...c.replies, optimisticReply] }
          : c
      ));
      setReplyBody("");
      setReplyingTo(null);
    } catch (err: any) {
      setReplyError(err.message ?? "Failed to post reply.");
    } finally {
      setReplySubmitting(false);
    }
  }

  async function handleDelete(commentId: string, parentId?: string) {
    try {
      await deleteComment(commentId);
      if (parentId) {
        setComments(comments.map((c) =>
          c.id === parentId
            ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
            : c
        ));
      } else {
        setComments(comments.filter((c) => c.id !== commentId));
      }
    } catch {
      // silent
    }
  }

  const totalCount = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0);

  return (
    <>
      <style>{`
        .cs-root { margin-top: 3rem; padding-top: 2.5rem; border-top: 2px solid var(--gray-200, #e5e7eb); }
        .cs-heading { font-size: 1.25rem; font-weight: 700; color: var(--dark, #1a1a1a); margin-bottom: 1.5rem; }
        .cs-count { font-size: 0.875rem; color: var(--gray-500, #6b7280); font-weight: 400; margin-left: 6px; }

        .cs-gate {
          background: var(--light, #f7f6f3);
          border: 1.5px solid var(--gray-200, #e5e7eb);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          margin-bottom: 2rem;
        }
        .cs-gate-text { font-size: 1rem; color: var(--gray-600, #4b5563); margin-bottom: 1rem; }

        .cs-form { margin-bottom: 2.5rem; }
        .cs-textarea {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1.5px solid var(--gray-300, #d1d5db);
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.9375rem;
          line-height: 1.6;
          resize: vertical;
          min-height: 100px;
          outline: none;
          transition: border-color 0.2s;
          color: var(--dark, #1a1a1a);
          background: #fff;
        }
        .cs-textarea:focus { border-color: var(--primary, #c8102e); box-shadow: 0 0 0 3px rgba(200,16,46,0.08); }
        .cs-form-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 0.75rem; gap: 12px; }
        .cs-char-hint { font-size: 12px; color: var(--gray-400, #9ca3af); }
        .cs-error { font-size: 13px; color: #be123c; }

        .cs-list { display: flex; flex-direction: column; gap: 0; }
        .cs-item { display: flex; gap: 12px; padding: 1.25rem 0; border-bottom: 1px solid var(--gray-100, #f3f4f6); }
        .cs-item:last-child { border-bottom: none; }
        .cs-item-body { flex: 1; min-width: 0; }
        .cs-item-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; flex-wrap: wrap; }
        .cs-item-name { font-weight: 700; font-size: 0.9rem; color: var(--dark, #1a1a1a); }
        .cs-item-time { font-size: 0.8rem; color: var(--gray-400, #9ca3af); }
        .cs-item-text { font-size: 0.9375rem; color: var(--gray-700, #374151); line-height: 1.6; word-break: break-word; white-space: pre-wrap; }
        .cs-delete {
          background: none; border: none; cursor: pointer;
          color: var(--gray-400, #9ca3af); font-size: 14px;
          padding: 2px 4px; border-radius: 4px;
          transition: color 0.15s, background 0.15s;
          line-height: 1;
        }
        .cs-delete:hover { color: #be123c; background: rgba(190,18,60,0.08); }

        .cs-reply-btn {
          margin-top: 6px;
          background: none; border: none; cursor: pointer;
          color: var(--gray-500, #6b7280); font-size: 13px; font-weight: 600;
          padding: 2px 0;
          font-family: inherit;
          transition: color 0.15s;
        }
        .cs-reply-btn:hover { color: var(--primary, #c8102e); }

        .cs-reply-form { margin-top: 12px; }
        .cs-reply-textarea {
          width: 100%;
          padding: 0.625rem 0.875rem;
          border: 1.5px solid var(--gray-300, #d1d5db);
          border-radius: 8px;
          font-family: inherit;
          font-size: 0.875rem;
          line-height: 1.6;
          resize: vertical;
          min-height: 72px;
          outline: none;
          transition: border-color 0.2s;
          color: var(--dark, #1a1a1a);
          background: #fff;
        }
        .cs-reply-textarea:focus { border-color: var(--primary, #c8102e); box-shadow: 0 0 0 3px rgba(200,16,46,0.08); }
        .cs-reply-actions { display: flex; gap: 8px; margin-top: 6px; align-items: center; }
        .cs-cancel-btn {
          background: none; border: 1px solid var(--gray-300, #d1d5db);
          border-radius: 6px; cursor: pointer; font-family: inherit;
          font-size: 13px; font-weight: 500; padding: 5px 12px;
          color: var(--gray-600, #4b5563); transition: all 0.15s;
        }
        .cs-cancel-btn:hover { border-color: var(--gray-400); background: var(--gray-50, #f9fafb); }

        .cs-replies { margin-top: 12px; padding-left: 16px; border-left: 2px solid var(--gray-100, #f3f4f6); display: flex; flex-direction: column; gap: 0; }
        .cs-reply-item { display: flex; gap: 10px; padding: 0.875rem 0; border-bottom: 1px solid var(--gray-100, #f3f4f6); }
        .cs-reply-item:last-child { border-bottom: none; }
        .cs-reply-item-body { flex: 1; min-width: 0; }

        .cs-empty { padding: 2rem 0; text-align: center; color: var(--gray-400, #9ca3af); font-size: 0.9rem; }
      `}</style>

      <div className="cs-root">
        <h2 className="cs-heading">
          Comments
          <span className="cs-count">({totalCount})</span>
        </h2>

        {!mounted || !session ? (
          <div className="cs-gate">
            <p className="cs-gate-text">Join the conversation — sign in to leave a comment.</p>
            <Link href="/login" className="btn btn-primary">Sign In</Link>
          </div>
        ) : (
          <form className="cs-form" onSubmit={handleSubmit}>
            <textarea
              className="cs-textarea"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Share your thoughts..."
              maxLength={2000}
            />
            <div className="cs-form-footer">
              <span className={body.length > 1800 ? "cs-error" : "cs-char-hint"}>
                {body.length}/2000
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {error && <span className="cs-error">{error}</span>}
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting || !body.trim()}
                  style={{ opacity: submitting || !body.trim() ? 0.6 : 1 }}
                >
                  {submitting ? "Posting…" : "Post Comment"}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="cs-list">
          {comments.length === 0 ? (
            <div className="cs-empty">No comments yet. Be the first to start the conversation.</div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="cs-item">
                <Avatar name={comment.user.name} />
                <div className="cs-item-body">
                  <div className="cs-item-header">
                    <span className="cs-item-name">{comment.user.name}</span>
                    <span className="cs-item-time">{formatRelative(comment.createdAt)}</span>
                    {(isAdmin || userId === comment.userId) && (
                      <button
                        className="cs-delete"
                        title="Delete comment"
                        onClick={() => handleDelete(comment.id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="cs-item-text">{comment.body}</p>

                  {mounted && session && (
                    <button
                      className="cs-reply-btn"
                      onClick={() => {
                        setReplyingTo(replyingTo === comment.id ? null : comment.id);
                        setReplyBody("");
                        setReplyError("");
                      }}
                    >
                      {replyingTo === comment.id ? "Cancel" : "↩ Reply"}
                    </button>
                  )}

                  {replyingTo === comment.id && (
                    <form
                      className="cs-reply-form"
                      onSubmit={(e) => handleReply(e, comment.id)}
                    >
                      <textarea
                        className="cs-reply-textarea"
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        placeholder={`Reply to ${comment.user.name}…`}
                        maxLength={2000}
                        autoFocus
                      />
                      <div className="cs-reply-actions">
                        {replyError && <span className="cs-error">{replyError}</span>}
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={replySubmitting || !replyBody.trim()}
                          style={{ fontSize: "0.8125rem", padding: "6px 14px", opacity: replySubmitting || !replyBody.trim() ? 0.6 : 1 }}
                        >
                          {replySubmitting ? "Posting…" : "Post Reply"}
                        </button>
                        <button
                          type="button"
                          className="cs-cancel-btn"
                          onClick={() => { setReplyingTo(null); setReplyBody(""); setReplyError(""); }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {comment.replies.length > 0 && (
                    <div className="cs-replies">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="cs-reply-item">
                          <Avatar name={reply.user.name} size={28} />
                          <div className="cs-reply-item-body">
                            <div className="cs-item-header">
                              <span className="cs-item-name">{reply.user.name}</span>
                              <span className="cs-item-time">{formatRelative(reply.createdAt)}</span>
                              {(isAdmin || userId === reply.userId) && (
                                <button
                                  className="cs-delete"
                                  title="Delete reply"
                                  onClick={() => handleDelete(reply.id, comment.id)}
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                            <p className="cs-item-text">{reply.body}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
