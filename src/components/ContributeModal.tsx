import { FormEvent, useEffect, useState } from "react";
import { ArticleSection, Resource, User } from "../types";
import { AppButton } from "./AppButton";
import { Icon } from "./Icon";
import { ImageUploader } from "./ImageUploader";

const categories = ["Tài liệu", "Kinh nghiệm", "Công cụ", "Lý thuyết"];
const levels = ["Mọi cấp độ", "Kids", "Teens"];
const defaultCover =
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620";

function formatToday(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseSimpleSections(rawText: string): ArticleSection[] {
  const lines = rawText.split("\n");
  const result: ArticleSection[] = [];
  let current: ArticleSection = { heading: "", body: "" };

  const pushCurrent = () => {
    if (current.heading.trim() || current.body.trim()) {
      result.push({
        heading: current.heading.trim(),
        body: current.body.trim(),
      });
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const mdHeading = trimmed.match(/^#{1,4}\s+(.+)$/);
    if (mdHeading) {
      pushCurrent();
      current = { heading: mdHeading[1].replace(/\*\*/g, "").trim(), body: "" };
      continue;
    }

    current.body = current.body ? `${current.body}\n${trimmed}` : trimmed;
  }

  pushCurrent();
  return result;
}

export function ContributeModal({
  user,
  onClose,
  onSubmitResource,
}: {
  user: User;
  onClose: () => void;
  onSubmitResource: (item: Resource) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [level, setLevel] = useState(levels[0]);
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [coverImage, setCoverImage] = useState(defaultCover);
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    setSubmitting(true);
    try {
      const parsedSections = parseSimpleSections(content);
      const finalSections: ArticleSection[] =
        parsedSections.length > 0
          ? parsedSections
          : [{ heading: "Nội dung chi tiết", body: summary.trim() }];

      const isAdmin = user.role === "admin";
      const payload: Resource = {
        id: String(Date.now()),
        title: title.trim(),
        description: summary.trim(),
        category,
        level,
        author: user.name,
        initials: user.initials,
        color: isAdmin ? "avatar-gold" : "avatar-mint",
        image: coverImage.trim() || defaultCover,
        downloads: "0",
        downloadCount: 0,
        attachmentName: attachmentName.trim() || undefined,
        attachmentUrl: attachmentUrl.trim() || undefined,
        status: isAdmin ? "approved" : "pending",
        submittedByUid: user.uid,
        publishedAt: formatToday(),
        createdAtMs: Date.now(),
        layout: "standard",
        sections: finalSections,
      };

      await onSubmitResource(payload);
      alert(
        isAdmin
          ? "Đã xuất bản tài liệu mới lên Trang chủ!"
          : "Cảm ơn thầy cô đã đóng góp! Bài viết đã được gửi tới Ban Quản Trị để kiểm duyệt và sẽ sớm hiển thị trên Trang chủ.",
      );
      onClose();
    } catch {
      alert("Không thể gửi bài đóng góp. Thầy cô vui lòng thử lại sau nhé.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="resource-modal"
        style={{ display: "block", maxWidth: "680px", padding: "34px 30px", margin: "auto" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contribute-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <AppButton className="modal-close" onClick={onClose} ariaLabel="Đóng">
          <Icon name="close" size={21} />
        </AppButton>

        <div style={{ marginBottom: "20px" }}>
          <span className="section-kicker" style={{ marginBottom: "4px" }}>
            Chia sẻ cùng cộng đồng ELT
          </span>
          <h2 id="contribute-modal-title" style={{ fontSize: "26px", fontWeight: 700, marginBottom: "6px" }}>
            Đóng góp giáo án & học liệu
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px" }}>
            Chia sẻ bài giảng, worksheet hoặc kinh nghiệm đứng lớp của thầy cô tới đồng nghiệp cả
            nước.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label
              htmlFor="contrib-title"
              style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}
            >
              Tên tài liệu / Giáo án *
            </label>
            <input
              id="contrib-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="VD: Bộ slide & phiếu bài tập Unit 6: Our Tet Holiday"
              className="admin-input"
              required
              autoFocus
            />
          </div>

          <div className="admin-form-row">
            <div>
              <label
                htmlFor="contrib-cat"
                style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}
              >
                Chuyên mục
              </label>
              <select
                id="contrib-cat"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="admin-input"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="contrib-level"
                style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}
              >
                Cấp độ học sinh
              </label>
              <select
                id="contrib-level"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className="admin-input"
              >
                {levels.map((lv) => (
                  <option key={lv} value={lv}>
                    {lv}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="contrib-summary"
              style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}
            >
              Mô tả ngắn gọn *
            </label>
            <textarea
              id="contrib-summary"
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="Tóm tắt mục tiêu và điểm nổi bật của tài liệu trong 1–2 câu..."
              className="admin-textarea"
              rows={2}
              required
            />
          </div>

          <div className="admin-form-row">
            <div>
              <label
                htmlFor="contrib-file-name"
                style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}
              >
                Tên tệp giáo án gốc (tùy chọn)
              </label>
              <input
                id="contrib-file-name"
                type="text"
                value={attachmentName}
                onChange={(event) => setAttachmentName(event.target.value)}
                placeholder="VD: Giao_an_Unit6.docx"
                className="admin-input"
              />
            </div>
            <div>
              <label
                htmlFor="contrib-file-url"
                style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}
              >
                Link Google Drive / PDF / DOCX (tùy chọn)
              </label>
              <input
                id="contrib-file-url"
                type="url"
                value={attachmentUrl}
                onChange={(event) => setAttachmentUrl(event.target.value)}
                placeholder="https://drive.google.com/..."
                className="admin-input"
              />
            </div>
          </div>

          <ImageUploader
            label="Ảnh minh họa bài viết"
            value={coverImage}
            onChange={setCoverImage}
            compact
          />

          <div>
            <label
              htmlFor="contrib-content"
              style={{ display: "block", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}
            >
              Hướng dẫn triển khai trên lớp (hỗ trợ ## Tiêu đề và **in đậm**)
            </label>
            <textarea
              id="contrib-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="Mô tả các bước tổ chức hoạt động, từ vựng trọng tâm hoặc lưu ý cho giáo viên..."
              className="admin-textarea"
              rows={5}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "6px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "11px 18px", color: "var(--muted)", fontWeight: 700, fontSize: "14px" }}
            >
              Hủy
            </button>
            <AppButton type="submit" className="join-button">
              {submitting ? "Đang gửi..." : "Gửi bài đóng góp"} <Icon name="arrow" size={16} />
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  );
}