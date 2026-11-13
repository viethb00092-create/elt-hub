import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppButton } from "../components/AppButton";
import { Icon } from "../components/Icon";
import { RichTextBody, VideoEmbed } from "../components/RichContent";
import { SafeImage } from "../components/SafeImage";
import { isFirebaseConfigured } from "../lib/firebase";
import { incrementResourceDownloadInDb } from "../lib/firestoreService";
import { ArticleLayout, ArticleSection, Resource, TheoryModule } from "../types";

export type ArticleDetailData = {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  level?: string;
  author: string;
  initials: string;
  color: string;
  publishedAt: string;
  coverImage: string;
  layout?: ArticleLayout;
  videoUrl?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  downloadsText?: string;
  sections: ArticleSection[];
  isResource: boolean;
};

function detectFileTypeLabel(url?: string, name?: string): string {
  const combined = `${name || ""} ${url || ""}`.toLowerCase();
  if (combined.includes(".doc")) return "WORD (.DOCX)";
  if (combined.includes(".ppt")) return "SLIDE (.PPTX)";
  if (combined.includes(".pdf")) return "TÀI LIỆU PDF";
  if (combined.includes("drive.google.com")) return "GOOGLE DRIVE";
  return "TỆP GIÁO ÁN GỐC";
}

export function ArticleDetailPage({
  type,
  resources,
  theoryModules,
  loading = false,
  savedIds,
  onToggleSave,
}: {
  type: "resource" | "theory";
  resources: Resource[];
  theoryModules: TheoryModule[];
  loading?: boolean;
  savedIds: string[];
  onToggleSave: (id: string) => void;
}) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const article: ArticleDetailData | null = (() => {
    if (!id) return null;
    if (type === "resource") {
      const found = resources.find((r) => r.id === id);
      if (!found) return null;
      return {
        id: found.id,
        title: found.title,
        subtitle: found.description,
        badge: found.category,
        level: found.level,
        author: found.author,
        initials: found.initials,
        color: found.color,
        publishedAt: found.publishedAt,
        coverImage: found.image,
        layout: found.layout || "zigzag",
        videoUrl: found.videoUrl,
        attachmentUrl: found.attachmentUrl,
        attachmentName: found.attachmentName,
        downloadsText:
          found.downloadCount !== undefined ? String(found.downloadCount) : found.downloads,
        sections: found.sections,
        isResource: true,
      };
    } else {
      const found = theoryModules.find((m) => m.id === id);
      if (!found) return null;
      return {
        id: found.id,
        title: found.title,
        subtitle: found.text,
        badge: found.label,
        author: found.author,
        initials: found.initials,
        color: found.color,
        publishedAt: found.publishedAt,
        coverImage: found.image,
        layout: found.layout || "zigzag",
        videoUrl: found.videoUrl,
        sections: found.sections,
        isResource: false,
      };
    }
  })();

  if (loading && !article) {
    return (
      <main className="not-found">
        <span className="section-kicker">ELT Hub</span>
        <h1>Đang tải nội dung bài viết...</h1>
      </main>
    );
  }

  if (!article) {
    return (
      <main className="not-found">
        <span className="section-kicker">404</span>
        <h1>Không tìm thấy bài viết</h1>
        <p>Bài viết có thể đã được cập nhật hoặc đường dẫn chưa chính xác.</p>
        <AppButton
          className="join-button"
          onClick={() => navigate(type === "resource" ? "/" : "/ly-thuyet")}
        >
          {type === "resource" ? "Về trang chủ" : "Về thư viện lý thuyết"}
        </AppButton>
      </main>
    );
  }

  const isZigzag = article.layout === "zigzag";
  const isSaved = article.isResource && savedIds.includes(article.id);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      alert("Thầy cô hãy sao chép đường dẫn trên thanh địa chỉ trình duyệt nhé.");
    }
  };

  const handleDownloadAttachment = async () => {
    if (article.isResource && isFirebaseConfigured) {
      await incrementResourceDownloadInDb(article.id);
    }

    if (article.attachmentUrl) {
      window.open(article.attachmentUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const bodyText = article.sections
      .map((s) => `${s.heading ? s.heading + "\n" : ""}${s.body}`)
      .join("\n\n");
    const content =
      `HỌC LIỆU ELT HUB: ${article.title.toUpperCase()}\n` +
      `=====================================================\n` +
      `Chuyên mục: ${article.badge} | Tác giả: ${article.author}\n\n` +
      `${article.subtitle}\n\n${bodyText}\n` +
      `-----------------------------------------------------\n` +
      `Chia sẻ miễn phí từ Cộng đồng Giáo viên Tiếng Anh ELT Hub.`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ELTHub_${article.title.replace(/\s+/g, "_")}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="article-page">
      <div className="article-container">
        <div className="article-topbar">
          <button
            type="button"
            className="article-back-btn"
            onClick={() => navigate(type === "resource" ? "/" : "/ly-thuyet")}
          >
            ← {type === "resource" ? "Quay lại danh sách tài liệu" : "Quay lại thư viện lý thuyết"}
          </button>

          <div className="article-topbar-actions">
            <button type="button" className="workspace-ghost-btn" onClick={handleCopyLink}>
              {copied ? "✓ Đã sao chép link!" : "🔗 Sao chép link chia sẻ"}
            </button>
            <button type="button" className="workspace-ghost-btn" onClick={() => window.print()}>
              🖨️ In / Lưu PDF
            </button>
            {article.isResource && (
              <button
                type="button"
                className={`article-save-pill ${isSaved ? "saved" : ""}`}
                onClick={() => onToggleSave(article.id)}
              >
                <Icon name="heart" size={17} />
                <span>{isSaved ? "Đã lưu bài viết" : "Lưu bài viết"}</span>
              </button>
            )}
          </div>
        </div>

        <header className="article-header">
          <div className="article-badges">
            <span className="category-tag static">{article.badge}</span>
            {article.level && <span className="level-label">{article.level}</span>}
          </div>

          <h1>{article.title}</h1>
          <p className="article-lead">{article.subtitle}</p>

          <div className="article-author-bar">
            <div className="author">
              <span className={`avatar ${article.color}`}>{article.initials}</span>
              <span>
                <small>Biên soạn & chia sẻ bởi</small>
                <strong>{article.author}</strong>
              </span>
            </div>
            <span className="article-date">Cập nhật: {article.publishedAt}</span>
          </div>
        </header>

        {article.isResource && (
          <div className="resource-attachment-box">
            <div>
              <span className="attachment-type-badge">
                {detectFileTypeLabel(article.attachmentUrl, article.attachmentName)}
              </span>
              <h3>
                {article.attachmentName ||
                  (article.attachmentUrl
                    ? `Tài liệu gốc: ${article.title}`
                    : `Bản tóm tắt giáo án: ${article.title}`)}
              </h3>
              <p>
                {article.attachmentUrl
                  ? "Tải về hoặc mở trực tiếp tệp giáo án, slide trình chiếu để chỉnh sửa theo lớp học của thầy cô."
                  : "Tải về bản hướng dẫn triển khai nhanh dạng văn bản để sử dụng ngoại tuyến."}
                {article.downloadsText ? ` · Đã có ${article.downloadsText} lượt tải` : ""}
              </p>
            </div>
            <AppButton className="join-button" onClick={handleDownloadAttachment}>
              {article.attachmentUrl ? "Tải tài liệu gốc" : "Tải bản tóm tắt"}{" "}
              <Icon name="download" size={17} />
            </AppButton>
          </div>
        )}

        <figure className="article-cover" style={{ position: "relative" }}>
          <SafeImage src={article.coverImage} alt={article.title} />
        </figure>

        {article.videoUrl && (
          <div style={{ marginBottom: "44px" }}>
            <VideoEmbed url={article.videoUrl} title={article.title} />
          </div>
        )}

        {isZigzag ? (
          <div className="zigzag-list">
            {article.sections.map((section, index) => {
              const hasMedia = Boolean(section.image || section.videoUrl);
              return (
                <section
                  key={`${section.heading}-${index}`}
                  className={`zigzag-block ${index % 2 === 1 ? "reverse" : ""} ${
                    !hasMedia ? "full-width" : ""
                  }`}
                >
                  <div className="zigzag-text">
                    {section.heading && <h2>{section.heading}</h2>}
                    <RichTextBody content={section.body} />
                  </div>

                  {hasMedia && (
                    <div className="zigzag-media-col">
                      {section.videoUrl && (
                        <VideoEmbed url={section.videoUrl} title={section.heading || article.title} />
                      )}
                      {section.image && (
                        <figure className="zigzag-media" style={{ position: "relative" }}>
                          <SafeImage src={section.image} alt={section.heading || article.title} />
                          {section.caption && <figcaption>{section.caption}</figcaption>}
                        </figure>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        ) : (
          <div className="standard-article-body">
            {article.sections.map((section, index) => (
              <section key={`${section.heading}-${index}`} className="standard-section">
                {section.heading && <h2>{section.heading}</h2>}
                {section.body && <RichTextBody content={section.body} />}

                {section.videoUrl && (
                  <div className="standard-media-box">
                    <VideoEmbed url={section.videoUrl} title={section.heading || article.title} />
                  </div>
                )}

                {section.image && (
                  <figure className="standard-figure" style={{ position: "relative" }}>
                    <SafeImage src={section.image} alt={section.heading || article.title} />
                    {section.caption && <figcaption>{section.caption}</figcaption>}
                  </figure>
                )}
              </section>
            ))}
          </div>
        )}

        <div className="article-next-box">
          <div>
            <span className="section-kicker">Áp dụng ngay vào lớp học</span>
            <h3>Biến nội dung bài học thành trò chơi tương tác</h3>
            <p>
              Sử dụng bộ công cụ thông minh của ELT Hub để tạo nhanh vòng quay từ vựng, quiz hoặc
              phiếu bài tập in ấn chỉ trong vài giây.
            </p>
          </div>
          <AppButton
            className="join-button"
            onClick={() => {
              navigate("/cong-cu");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Mở bộ công cụ <Icon name="arrow" size={17} />
          </AppButton>
        </div>
      </div>
    </main>
  );
}