import { FormEvent, useEffect, useMemo, useState } from "react";
import { Discussion } from "../types";
import { AppButton } from "./AppButton";
import { Icon } from "./Icon";
import { MemberHoverCard } from "./MemberHoverCard";

export function ThreadModal({
  user,
  thread,
  allThreads,
  onClose,
  onAddComment,
  onToggleUpvoteThread,
  onToggleUpvoteComment,
  onSelectThread,
  onOpenAuth,
}: {
  user: { name: string; initials: string } | null;
  thread: Discussion | null;
  allThreads: Discussion[];
  onClose: () => void;
  onAddComment: (threadId: string, content: string) => void;
  onToggleUpvoteThread: (threadId: string) => void;
  onToggleUpvoteComment: (threadId: string, commentId: string) => void;
  onSelectThread: (thread: Discussion) => void;
  onOpenAuth: () => void;
}) {
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!thread) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [thread, onClose]);

  const sortedComments = useMemo(() => {
    if (!thread) return [];
    return [...thread.comments].sort((a, b) => (b.upvotes ?? 0) - (a.upvotes ?? 0));
  }, [thread]);

  if (!thread) return null;

  const isThreadUpvoted = user ? (thread.upvotedBy ?? []).includes(user.name) : false;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    onAddComment(thread.id, comment.trim());
    setComment("");
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="resource-modal thread-modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="thread-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="thread-modal-head">
          <AppButton className="modal-close" onClick={onClose} ariaLabel="Đóng">
            <Icon name="close" size={21} />
          </AppButton>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <span className="thread-badge-pill">#{thread.category}</span>
            <button
              type="button"
              className={`upvote-pill ${isThreadUpvoted ? "active" : ""}`}
              onClick={() => (user ? onToggleUpvoteThread(thread.id) : onOpenAuth())}
              title="Upvote chủ đề này"
            >
              <span>▲</span>
              <strong>{thread.upvotes ?? 0}</strong>
              <span>Upvote</span>
            </button>
          </div>

          <h2 id="thread-modal-title">{thread.title}</h2>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className={`avatar ${thread.color}`}>{thread.initials}</span>
            <div>
              <MemberHoverCard
                author={thread.author}
                initials={thread.initials}
                color={thread.color}
                threads={allThreads}
                onSelectThread={onSelectThread}
              />
              <span style={{ display: "block", color: "var(--muted)", fontSize: "12px" }}>
                Đăng {thread.createdAt}
              </span>
            </div>
          </div>

          <p className="thread-modal-body">{thread.content}</p>
        </div>

        <div className="thread-comments-area">
          <div className="comments-area-header">
            <h3>Bình luận ({sortedComments.length})</h3>
            <span>Sắp xếp theo: Hữu ích nhất (Upvote)</span>
          </div>

          {sortedComments.length === 0 ? (
            <p style={{ color: "var(--muted)", fontSize: "14px", textAlign: "center", padding: "22px 0" }}>
              Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ kinh nghiệm!
            </p>
          ) : (
            <div className="comment-stack">
              {sortedComments.map((item, index) => {
                const upvotes = item.upvotes ?? 0;
                const isUpvoted = user ? (item.upvotedBy ?? []).includes(user.name) : false;
                const isTopHelpful = index === 0 && upvotes > 0;

                return (
                  <div
                    key={item.id}
                    className={`reddit-comment-card ${isTopHelpful ? "top-helpful" : ""}`}
                  >
                    <button
                      type="button"
                      className={`comment-upvote-box ${isUpvoted ? "active" : ""}`}
                      onClick={() =>
                        user ? onToggleUpvoteComment(thread.id, item.id) : onOpenAuth()
                      }
                      title="Bấm Upvote để đẩy bình luận hay lên đầu"
                    >
                      <span className="upvote-arrow">▲</span>
                      <strong>{upvotes}</strong>
                    </button>

                    <div className="comment-main-content">
                      <div className="comment-meta-row">
                        <span className={`avatar ${item.color}`} style={{ width: "28px", height: "28px" }}>
                          {item.initials}
                        </span>
                        <MemberHoverCard
                          author={item.author}
                          initials={item.initials}
                          color={item.color}
                          threads={allThreads}
                          onSelectThread={onSelectThread}
                        />
                        {isTopHelpful && <span className="top-comment-badge">★ Top hữu ích</span>}
                        <span className="comment-time">{item.createdAt}</span>
                      </div>
                      <p>{item.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="thread-reply-bar">
          {user ? (
            <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span className="avatar avatar-mint">{user.initials}</span>
              <input
                type="text"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Viết bình luận chia sẻ kinh nghiệm..."
                aria-label="Nội dung bình luận"
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  border: "1px solid var(--line)",
                  borderRadius: "99px",
                  fontSize: "14px",
                }}
              />
              <AppButton type="submit" className="join-button">
                Gửi
              </AppButton>
            </form>
          ) : (
            <div style={{ textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
              Vui lòng{" "}
              <button
                type="button"
                style={{ color: "var(--orange)", fontWeight: 700, textDecoration: "underline" }}
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
              >
                Đăng nhập
              </button>{" "}
              để tham gia bình luận và Upvote.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}