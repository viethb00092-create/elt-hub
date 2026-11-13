import { FormEvent, useEffect, useState } from "react";
import { forumCategories } from "../data/mockData";
import { Discussion } from "../types";
import { AppButton } from "./AppButton";
import { Icon } from "./Icon";

export function AskModal({
  user,
  onClose,
  onSubmit,
}: {
  user: { name: string; initials: string } | null;
  onClose: () => void;
  onSubmit: (newPost: Discussion) => void;
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState(forumCategories[1]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return;

    const authorName = user?.name || "Giáo viên ẩn danh";
    const newPost: Discussion = {
      id: String(Date.now()),
      title: title.trim(),
      content: content.trim(),
      author: authorName,
      initials: user?.initials || "GV",
      color: "avatar-blue",
      category,
      createdAt: "Vừa xong",
      createdAtMs: Date.now(),
      upvotes: 1,
      upvotedBy: user ? [user.name] : [],
      comments: [],
    };
    onSubmit(newPost);
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="resource-modal"
        style={{ display: "block", maxWidth: "600px", padding: "36px 30px", margin: "auto" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ask-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <AppButton className="modal-close" onClick={onClose} ariaLabel="Đóng">
          <Icon name="close" size={21} />
        </AppButton>
        <div style={{ marginBottom: "22px" }}>
          <h2 id="ask-modal-title" style={{ fontSize: "24px", fontWeight: 700, marginBottom: "6px" }}>
            Đặt câu hỏi thảo luận
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Chia sẻ những băn khoăn về giảng dạy để cộng đồng cùng hỗ trợ.
          </p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label
              htmlFor="ask-category"
              style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700 }}
            >
              Danh mục chủ đề
            </label>
            <select
              id="ask-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid var(--line)",
                borderRadius: "10px",
                background: "white",
                fontSize: "14px",
              }}
            >
              {forumCategories.slice(1).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="ask-title"
              style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700 }}
            >
              Tiêu đề câu hỏi
            </label>
            <input
              id="ask-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="VD: Làm sao để quản lý lớp học 50 học sinh?"
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid var(--line)",
                borderRadius: "10px",
                fontSize: "14px",
              }}
              autoFocus
              required
            />
          </div>
          <div>
            <label
              htmlFor="ask-content"
              style={{ display: "block", marginBottom: "6px", fontSize: "13px", fontWeight: 700 }}
            >
              Nội dung chi tiết
            </label>
            <textarea
              id="ask-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Mô tả cụ thể bối cảnh và khó khăn thầy cô đang gặp phải..."
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1px solid var(--line)",
                borderRadius: "10px",
                minHeight: "140px",
                resize: "vertical",
                fontSize: "14px",
              }}
              required
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "11px 18px", color: "var(--muted)", fontWeight: 700, fontSize: "14px" }}
            >
              Hủy
            </button>
            <AppButton type="submit" className="join-button">
              Đăng bài <Icon name="arrow" size={16} />
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
}