import { FormEvent, useEffect, useMemo, useState } from "react";
import { AppButton } from "../components/AppButton";
import { Icon } from "../components/Icon";
import { ImageUploader } from "../components/ImageUploader";
import { getVideoEmbedInfo, RichTextBody, VideoEmbed } from "../components/RichContent";
import { theoryFilters } from "../data/mockData";
import { ArticleLayout, ArticleSection, Resource, TheoryModule, User } from "../types";

const resourceCategories = ["Tài liệu", "Kinh nghiệm", "Công cụ", "Lý thuyết"];
const resourceLevels = ["Mọi cấp độ", "Kids", "Teens"];
const avatarColors = [
  "avatar-mint",
  "avatar-gold",
  "avatar-blue",
  "avatar-coral",
  "avatar-purple",
  "avatar-green",
];

const defaultCover =
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620";

const aiSampleTemplate =
  `## 1. Mục tiêu bài học & Từ vựng trọng tâm\n` +
  `- Học sinh ghi nhớ **12 từ vựng** chủ đề Du lịch (*itinerary, departure, boarding pass, luggage*).\n` +
  `- Vận dụng thành thạo mẫu câu hỏi đường và đặt phòng khách sạn trong giao tiếp thực tế.\n\n` +
  `## 2. Video khởi động & Tình huống mẫu\n` +
  `https://www.youtube.com/watch?v=dQw4w9WgXcQ\n` +
  `Giáo viên cho cả lớp xem đoạn hội thoại ngắn 2 phút, sau đó đặt câu hỏi **ICQs** để kiểm tra mức độ nắm bắt tình huống.\n\n` +
  `## 3. Hoạt động thực hành theo cặp (Role-play)\n` +
  `- Chia lớp thành các cặp đóng vai **Nhân viên lễ tân** và **Du khách**.\n` +
  `- Khuyến khích học sinh sử dụng ngữ điệu tự nhiên và ghi chú lại thông tin đặt phòng của bạn mình.`;

function createEmptySection(index: number): ArticleSection {
  return {
    heading: `${index + 1}. `,
    body: "",
    image: "",
    caption: "",
    videoUrl: "",
  };
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "AD";
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatToday(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseAiTextToSections(rawText: string): ArticleSection[] {
  const lines = rawText.split("\n");
  const result: ArticleSection[] = [];
  let current: ArticleSection = { heading: "", body: "" };

  const pushCurrentIfNotEmpty = () => {
    if (
      current.heading.trim() ||
      current.body.trim() ||
      current.image?.trim() ||
      current.videoUrl?.trim()
    ) {
      result.push({
        heading: current.heading.trim(),
        body: current.body.trim(),
        image: current.image?.trim() || undefined,
        caption: current.caption?.trim() || undefined,
        videoUrl: current.videoUrl?.trim() || undefined,
      });
    }
  };

  for (const rawLine of lines) {
    const trimmed = rawLine.trim();
    if (!trimmed) continue;

    const mdHeadingMatch = trimmed.match(/^#{1,4}\s+(.+)$/);
    if (mdHeadingMatch) {
      pushCurrentIfNotEmpty();
      current = { heading: mdHeadingMatch[1].replace(/\*\*/g, "").trim(), body: "" };
      continue;
    }

    const boldHeadingMatch = trimmed.match(/^\*\*([^*]{4,95})\*\*$/);
    if (boldHeadingMatch && !trimmed.endsWith(".")) {
      pushCurrentIfNotEmpty();
      current = { heading: boldHeadingMatch[1].trim(), body: "" };
      continue;
    }

    const mdImageMatch = trimmed.match(/^!\[([^\]]*)\]\((https?:\/\/[^)]+)\)$/);
    if (mdImageMatch) {
      if (current.image) {
        pushCurrentIfNotEmpty();
        current = { heading: "", body: "" };
      }
      current.caption = mdImageMatch[1].trim() || undefined;
      current.image = mdImageMatch[2].trim();
      continue;
    }

    const mdVideoMatch = trimmed.match(/^\[video\]\((https?:\/\/[^)]+)\)$/i);
    const candidateVideoUrl = mdVideoMatch ? mdVideoMatch[1].trim() : trimmed;
    if (/^https?:\/\/\S+$/i.test(candidateVideoUrl)) {
      const videoCheck = getVideoEmbedInfo(candidateVideoUrl);
      if (videoCheck.type !== "invalid") {
        if (current.videoUrl) {
          pushCurrentIfNotEmpty();
          current = { heading: "", body: "" };
        }
        current.videoUrl = candidateVideoUrl;
        continue;
      }

      if (
        /\.(jpg|jpeg|png|webp|gif)(\?.*)?$/i.test(candidateVideoUrl) ||
        candidateVideoUrl.includes("images.unsplash.com")
      ) {
        if (current.image) {
          pushCurrentIfNotEmpty();
          current = { heading: "", body: "" };
        }
        current.image = candidateVideoUrl;
        continue;
      }
    }

    current.body = current.body ? `${current.body}\n${trimmed}` : trimmed;
  }

  pushCurrentIfNotEmpty();
  return result;
}

function sectionsToAiMarkdown(sections: ArticleSection[]): string {
  return sections
    .map((sec) => {
      const chunks: string[] = [];
      if (sec.heading.trim()) chunks.push(`## ${sec.heading.trim()}`);
      if (sec.body.trim()) chunks.push(sec.body.trim());
      if (sec.videoUrl?.trim()) chunks.push(sec.videoUrl.trim());
      if (sec.image?.trim()) {
        chunks.push(`![${sec.caption || ""}](${sec.image.trim()})`);
      }
      return chunks.join("\n");
    })
    .join("\n\n");
}

export function AdminPage({
  user,
  resources,
  theoryModules,
  onSaveResource,
  onApproveResource,
  onDeleteResource,
  onSaveTheory,
  onDeleteTheory,
  onPreviewResource,
  onPreviewTheory,
  onSeedFirestore,
  onOpenAuth,
  onNavigateHome,
}: {
  user: User | null;
  resources: Resource[];
  theoryModules: TheoryModule[];
  onSaveResource: (item: Resource) => Promise<void>;
  onApproveResource: (id: string) => Promise<void>;
  onDeleteResource: (id: string) => Promise<void>;
  onSaveTheory: (item: TheoryModule) => Promise<void>;
  onDeleteTheory: (id: string) => Promise<void>;
  onPreviewResource: (item: Resource) => void;
  onPreviewTheory: (item: TheoryModule) => void;
  onSeedFirestore: () => Promise<void>;
  onOpenAuth: () => void;
  onNavigateHome: () => void;
}) {
  const [activeTab, setActiveTab] = useState<"resources" | "theory">("resources");
  const [editorMode, setEditorMode] = useState<"ai-paste" | "manual">("ai-paste");
  const [rightPane, setRightPane] = useState<"preview" | "list">("preview");
  const [isFullPreview, setIsFullPreview] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  const [editingTheoryId, setEditingTheoryId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState(resourceCategories[0]);
  const [theoryLabel, setTheoryLabel] = useState(theoryFilters[1]);
  const [level, setLevel] = useState(resourceLevels[0]);
  const [author, setAuthor] = useState(user?.name || "Ban Biên Tập ELT Hub");
  const [coverImage, setCoverImage] = useState(defaultCover);
  const [mainVideoUrl, setMainVideoUrl] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [layout, setLayout] = useState<ArticleLayout>("standard");

  const [aiRawText, setAiRawText] = useState("");
  const [sections, setSections] = useState<ArticleSection[]>([
    {
      heading: "1. Mục tiêu & Bối cảnh áp dụng",
      body: "",
      image: "",
      caption: "",
      videoUrl: "",
    },
  ]);
  const [savedNotice, setSavedNotice] = useState("");

  const pendingResources = useMemo(
    () => resources.filter((r) => r.status === "pending"),
    [resources],
  );

  useEffect(() => {
    if (!isFullPreview) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsFullPreview(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullPreview]);

  const parsedAiPreview = useMemo(() => parseAiTextToSections(aiRawText), [aiRawText]);

  const livePreviewSections = useMemo(() => {
    if (editorMode === "ai-paste") {
      return parsedAiPreview;
    }
    return sections
      .filter((s) => s.heading.trim() || s.body.trim() || s.image?.trim() || s.videoUrl?.trim())
      .map((s) => ({
        heading: s.heading.trim(),
        body: s.body.trim(),
        image: s.image?.trim() || undefined,
        caption: s.caption?.trim() || undefined,
        videoUrl: s.videoUrl?.trim() || undefined,
      }));
  }, [editorMode, parsedAiPreview, sections]);

  if (!user || user.role !== "admin") {
    return (
      <main className="admin-gate-page">
        <div className="admin-gate-card">
          <span className="section-kicker">Giới hạn quyền truy cập</span>
          <h1>Khu vực Quản trị viên</h1>
          <p>
            Trang quản lý nội dung chỉ khả dụng khi bạn đăng nhập bằng email thuộc danh sách{" "}
            <strong>Quản trị viên (Admin)</strong>.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <AppButton className="join-button modal-cta" onClick={onOpenAuth}>
              Đăng nhập tài khoản Admin <Icon name="arrow" size={18} />
            </AppButton>
            <button
              type="button"
              className="workspace-ghost-btn"
              style={{ width: "100%", padding: "11px" }}
              onClick={onNavigateHome}
            >
              Quay về Trang chủ
            </button>
          </div>
        </div>
      </main>
    );
  }

  const isEditing =
    (activeTab === "resources" && editingResourceId !== null) ||
    (activeTab === "theory" && editingTheoryId !== null);

  const resetForm = () => {
    setEditingResourceId(null);
    setEditingTheoryId(null);
    setTitle("");
    setSummary("");
    setCategory(resourceCategories[0]);
    setTheoryLabel(theoryFilters[1]);
    setLevel(resourceLevels[0]);
    setAuthor(user.name);
    setCoverImage(defaultCover);
    setMainVideoUrl("");
    setAttachmentName("");
    setAttachmentUrl("");
    setLayout("standard");
    setAiRawText("");
    setSections([createEmptySection(0)]);
  };

  const handleSwitchTab = (tab: "resources" | "theory") => {
    setActiveTab(tab);
    resetForm();
    setSavedNotice("");
  };

  const handleSwitchEditorMode = (nextMode: "ai-paste" | "manual") => {
    if (nextMode === "manual" && editorMode === "ai-paste" && aiRawText.trim()) {
      const parsed = parseAiTextToSections(aiRawText);
      if (parsed.length > 0) setSections(parsed);
    } else if (nextMode === "ai-paste" && editorMode === "manual") {
      const hasContent = sections.some((s) => s.body.trim() || s.image || s.videoUrl);
      if (hasContent) setAiRawText(sectionsToAiMarkdown(sections));
    }
    setEditorMode(nextMode);
  };

  const handleEditResource = (item: Resource) => {
    setActiveTab("resources");
    setEditingResourceId(item.id);
    setTitle(item.title);
    setSummary(item.description);
    setCategory(item.category);
    setLevel(item.level);
    setAuthor(item.author);
    setCoverImage(item.image);
    setMainVideoUrl(item.videoUrl || "");
    setAttachmentName(item.attachmentName || "");
    setAttachmentUrl(item.attachmentUrl || "");
    setLayout(item.layout || "zigzag");
    setSections(
      item.sections.length > 0 ? item.sections.map((s) => ({ ...s })) : [createEmptySection(0)],
    );
    setAiRawText(sectionsToAiMarkdown(item.sections));
    setRightPane("preview");
    setSavedNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditTheory = (item: TheoryModule) => {
    setActiveTab("theory");
    setEditingTheoryId(item.id);
    setTitle(item.title);
    setSummary(item.text);
    setTheoryLabel(item.label);
    setAuthor(item.author);
    setCoverImage(item.image);
    setMainVideoUrl(item.videoUrl || "");
    setLayout(item.layout || "zigzag");
    setSections(
      item.sections.length > 0 ? item.sections.map((s) => ({ ...s })) : [createEmptySection(0)],
    );
    setAiRawText(sectionsToAiMarkdown(item.sections));
    setRightPane("preview");
    setSavedNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateSection = (index: number, patch: Partial<ArticleSection>) => {
    setSections((prev) =>
      prev.map((sec, idx) => (idx === index ? { ...sec, ...patch } : sec)),
    );
  };

  const handlePublish = async (event: FormEvent) => {
    event.preventDefault();
    if (!title.trim() || !summary.trim()) return;

    setSaving(true);
    try {
      const finalSections: ArticleSection[] =
        livePreviewSections.length > 0
          ? livePreviewSections
          : [
              {
                heading: "",
                body: summary.trim(),
              },
            ];

      const authorName = author.trim() || user.name;
      const colorPick = avatarColors[authorName.length % avatarColors.length];

      if (activeTab === "resources") {
        const existing = resources.find((r) => r.id === editingResourceId);
        const resourcePayload: Resource = {
          id: existing ? existing.id : String(Date.now()),
          title: title.trim(),
          description: summary.trim(),
          category,
          level,
          author: authorName,
          initials: getInitials(authorName),
          color: existing ? existing.color : colorPick,
          image: coverImage.trim() || defaultCover,
          downloads: existing ? existing.downloads : "0",
          downloadCount: existing?.downloadCount ?? 0,
          attachmentName: attachmentName.trim() || undefined,
          attachmentUrl: attachmentUrl.trim() || undefined,
          status: "approved",
          publishedAt: formatToday(),
          createdAtMs: existing?.createdAtMs || Date.now(),
          layout,
          videoUrl: mainVideoUrl.trim() || undefined,
          sections: finalSections,
        };
        await onSaveResource(resourcePayload);
        setSavedNotice(
          existing
            ? "Đã cập nhật & xuất bản bài viết lên Firestore!"
            : "Đã xuất bản bài viết mới lên Trang chủ!",
        );
      } else {
        const existing = theoryModules.find((m) => m.id === editingTheoryId);
        const slug =
          title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "") || `module-${Date.now()}`;

        const theoryPayload: TheoryModule = {
          id: existing ? existing.id : `${slug}-${Date.now()}`,
          title: title.trim(),
          label: theoryLabel,
          text: summary.trim(),
          author: authorName,
          initials: getInitials(authorName),
          color: existing ? existing.color : colorPick,
          publishedAt: formatToday(),
          createdAtMs: existing?.createdAtMs || Date.now(),
          image: coverImage.trim() || defaultCover,
          layout,
          videoUrl: mainVideoUrl.trim() || undefined,
          sections: finalSections,
        };
        await onSaveTheory(theoryPayload);
        setSavedNotice(
          existing
            ? "Đã cập nhật module lý thuyết lên Firestore!"
            : "Đã xuất bản module mới lên Trang Lý thuyết!",
        );
      }

      resetForm();
    } catch {
      alert("Lỗi khi lưu lên Firestore. Thầy cô hãy kiểm tra Firestore Rules và kết nối mạng.");
    } finally {
      setSaving(false);
    }
  };

  const previewTitle = title.trim() || "Tiêu đề bài viết xem trước";
  const previewSummary =
    summary.trim() ||
    "Mô tả tóm tắt nội dung bài viết sẽ hiển thị tại đây để giáo viên nắm nhanh trọng tâm.";
  const previewBadge = activeTab === "resources" ? category : theoryLabel;
  const previewAuthor = author.trim() || user.name;
  const previewInitials = getInitials(previewAuthor);

  return (
    <main className="admin-page">
      <div className="admin-container">
        <div className="admin-header-bar">
          <div>
            <span className="section-kicker">Admin Content Studio · {user.name}</span>
            <h1>Cổng Đăng Bài & Quản Lý Nội Dung</h1>
            <p>
              Đồng bộ trực tiếp với Firebase Firestore. Dán nhanh bài từ AI, đính kèm giáo án gốc và
              duyệt bài đóng góp của giáo viên.
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              type="button"
              className="workspace-ghost-btn"
              onClick={async () => {
                if (
                  window.confirm(
                    "Nạp toàn bộ 6 bài tài liệu, 6 module lý thuyết và 4 chủ đề diễn đàn mẫu lên Firestore?",
                  )
                ) {
                  await onSeedFirestore();
                  setSavedNotice("Đã nạp thành công dữ liệu mẫu lên Firebase Firestore!");
                }
              }}
            >
              ⚡ Nạp dữ liệu mẫu lên Firebase
            </button>
            <button type="button" className="workspace-ghost-btn" onClick={onNavigateHome}>
              Về Trang chủ
            </button>
          </div>
        </div>

        {/* Khu vực kiểm duyệt bài đóng góp từ giáo viên */}
        {pendingResources.length > 0 && (
          <div className="admin-pending-panel">
            <div className="admin-pending-head">
              <div>
                <strong>📥 Có {pendingResources.length} tài liệu đóng góp đang chờ duyệt</strong>
                <span>Xem trước nội dung và duyệt xuất bản lên Trang chủ chỉ với 1 cú nhấp chuột.</span>
              </div>
            </div>
            <div className="admin-pending-list">
              {pendingResources.map((item) => (
                <div key={item.id} className="admin-pending-item">
                  <div className="pending-item-meta">
                    <span className="admin-item-tag">
                      {item.category} · {item.level} · Gửi bởi {item.author}
                    </span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    {item.attachmentUrl && (
                      <small style={{ color: "var(--green)", fontWeight: 700 }}>
                        📎 Đính kèm: {item.attachmentName || item.attachmentUrl}
                      </small>
                    )}
                  </div>
                  <div className="admin-pending-actions">
                    <button
                      type="button"
                      className="workspace-ghost-btn"
                      onClick={() => onPreviewResource(item)}
                    >
                      Xem trước
                    </button>
                    <button
                      type="button"
                      className="workspace-ghost-btn"
                      onClick={() => handleEditResource(item)}
                    >
                      Sửa bài
                    </button>
                    <button
                      type="button"
                      className="workspace-ai-btn"
                      onClick={async () => {
                        await onApproveResource(item.id);
                        setSavedNotice(`✓ Đã duyệt xuất bản bài "${item.title}" lên Trang chủ!`);
                      }}
                    >
                      ✓ Duyệt xuất bản
                    </button>
                    <button
                      type="button"
                      className="admin-remove-sec-btn"
                      onClick={async () => {
                        if (window.confirm(`Từ chối và xóa bài "${item.title}"?`)) {
                          await onDeleteResource(item.id);
                        }
                      }}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "resources" ? "active" : ""}`}
            onClick={() => handleSwitchTab("resources")}
          >
            Tài liệu & Giáo án Trang chủ ({resources.length})
          </button>
          <button
            type="button"
            className={`admin-tab-btn ${activeTab === "theory" ? "active" : ""}`}
            onClick={() => handleSwitchTab("theory")}
          >
            Module Kiến thức Lý thuyết ({theoryModules.length})
          </button>
        </div>

        {savedNotice && (
          <div className="admin-success-banner">
            <span>✓ {savedNotice}</span>
            <button type="button" onClick={() => setSavedNotice("")}>
              Đóng
            </button>
          </div>
        )}

        <div className="admin-grid">
          <form className="admin-editor-card" onSubmit={handlePublish}>
            <div className="admin-editor-head">
              <h2>
                {isEditing
                  ? "Chỉnh sửa bài viết"
                  : activeTab === "resources"
                    ? "Đăng Tài liệu / Giáo án mới"
                    : "Soạn Module Lý thuyết mới"}
              </h2>
              {isEditing && (
                <button type="button" className="workspace-ghost-btn" onClick={resetForm}>
                  + Tạo bài mới
                </button>
              )}
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-post-title">Tiêu đề bài viết *</label>
              <input
                id="admin-post-title"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="VD: Giáo án 45 phút: Speaking — Travel & Holidays"
                className="admin-input"
                required
              />
            </div>

            <div className="admin-form-row">
              {activeTab === "resources" ? (
                <>
                  <div className="admin-form-group">
                    <label htmlFor="admin-cat">Chuyên mục</label>
                    <select
                      id="admin-cat"
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      className="admin-input"
                    >
                      {resourceCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label htmlFor="admin-level">Cấp độ học sinh</label>
                    <select
                      id="admin-level"
                      value={level}
                      onChange={(event) => setLevel(event.target.value)}
                      className="admin-input"
                    >
                      {resourceLevels.map((lv) => (
                        <option key={lv} value={lv}>
                          {lv}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div className="admin-form-group">
                  <label htmlFor="admin-theory-label">Nhóm chủ đề lý thuyết</label>
                  <select
                    id="admin-theory-label"
                    value={theoryLabel}
                    onChange={(event) => setTheoryLabel(event.target.value)}
                    className="admin-input"
                  >
                    {theoryFilters.slice(1).map((lbl) => (
                      <option key={lbl} value={lbl}>
                        {lbl}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="admin-form-group">
                <label htmlFor="admin-author">Tác giả biên soạn</label>
                <input
                  id="admin-author"
                  type="text"
                  value={author}
                  onChange={(event) => setAuthor(event.target.value)}
                  placeholder="Tên giáo viên..."
                  className="admin-input"
                  required
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="admin-summary">Mô tả tóm tắt (hiển thị trên thẻ ngoài danh sách) *</label>
              <textarea
                id="admin-summary"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Tóm tắt ngắn gọn giá trị cốt lõi của bài viết trong 1–2 câu..."
                className="admin-textarea"
                rows={2}
                required
              />
            </div>

            {activeTab === "resources" && (
              <div className="admin-form-row">
                <div className="admin-form-group">
                  <label htmlFor="admin-att-name">Tên file đính kèm (.docx/.pptx/.pdf — tùy chọn)</label>
                  <input
                    id="admin-att-name"
                    type="text"
                    value={attachmentName}
                    onChange={(event) => setAttachmentName(event.target.value)}
                    placeholder="VD: Giao_an_Speaking_Unit4.docx"
                    className="admin-input"
                  />
                </div>
                <div className="admin-form-group">
                  <label htmlFor="admin-att-url">Link tải file giáo án gốc (Google Drive / PDF...)</label>
                  <input
                    id="admin-att-url"
                    type="url"
                    value={attachmentUrl}
                    onChange={(event) => setAttachmentUrl(event.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="admin-input"
                  />
                </div>
              </div>
            )}

            <div className="admin-form-group">
              <label>Bố cục hiển thị bài viết</label>
              <div className="layout-picker-row">
                <button
                  type="button"
                  className={`layout-choice-card ${layout === "standard" ? "active" : ""}`}
                  onClick={() => setLayout("standard")}
                >
                  <strong>Bài viết tiêu chuẩn (1 cột)</strong>
                  <span>Khuyên dùng cho bài dán từ AI, giáo án chi tiết, bài có chèn video.</span>
                </button>
                <button
                  type="button"
                  className={`layout-choice-card ${layout === "zigzag" ? "active" : ""}`}
                  onClick={() => setLayout("zigzag")}
                >
                  <strong>Editorial Zigzag (So le ảnh – chữ)</strong>
                  <span>Ảnh và văn bản đan xen trái – phải luân phiên từng phần.</span>
                </button>
              </div>
            </div>

            <ImageUploader
              label="Ảnh bìa chính của bài viết *"
              value={coverImage}
              onChange={setCoverImage}
            />

            <div className="admin-form-group">
              <label htmlFor="admin-main-video">
                Link Video minh họa chính (YouTube hoặc .mp4 — tùy chọn)
              </label>
              <input
                id="admin-main-video"
                type="text"
                value={mainVideoUrl}
                onChange={(event) => setMainVideoUrl(event.target.value)}
                placeholder="VD: https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                className="admin-input"
              />
            </div>

            <div className="admin-sections-wrapper">
              <div className="editor-mode-switcher">
                <button
                  type="button"
                  className={`editor-mode-btn ${editorMode === "ai-paste" ? "active" : ""}`}
                  onClick={() => handleSwitchEditorMode("ai-paste")}
                >
                  ⚡ Dán nhanh từ AI (1 ô duy nhất)
                </button>
                <button
                  type="button"
                  className={`editor-mode-btn ${editorMode === "manual" ? "active" : ""}`}
                  onClick={() => handleSwitchEditorMode("manual")}
                >
                  Chỉnh sửa từng phần thủ công
                </button>
              </div>

              {editorMode === "ai-paste" ? (
                <div className="ai-paste-box">
                  <div className="ai-paste-tips">
                    <div>
                      <strong>Mẹo dán nhanh từ ChatGPT / Gemini:</strong> Copy toàn bộ bài viết và
                      dán vào ô bên dưới. Hệ thống tự động nhận diện:
                      <ul>
                        <li>
                          <code>## Tiêu đề mục</code> → Tự tách thành tiêu đề lớn
                        </li>
                        <li>
                          <code>**từ khóa**</code> → Tự động <strong>in đậm nổi bật</strong>
                        </li>
                        <li>
                          Dán link <code>https://youtu.be/...</code> riêng 1 dòng → Tự nhúng Video
                        </li>
                        <li>
                          Dán <code>![chú thích](link-ảnh)</code> hoặc link ảnh → Tự chèn hình ảnh
                        </li>
                      </ul>
                    </div>
                    <button
                      type="button"
                      className="workspace-ghost-btn"
                      onClick={() => {
                        setAiRawText(aiSampleTemplate);
                        setRightPane("preview");
                      }}
                    >
                      Dán thử bài mẫu AI
                    </button>
                  </div>

                  <textarea
                    value={aiRawText}
                    onChange={(event) => setAiRawText(event.target.value)}
                    placeholder="Dán toàn bộ nội dung bài viết từ AI vào đây..."
                    className="admin-textarea ai-master-textarea"
                    rows={12}
                  />

                  {parsedAiPreview.length > 0 && (
                    <div className="ai-detect-summary">
                      <span>
                        Đã nhận diện <strong>{parsedAiPreview.length}</strong> phần nội dung
                        {parsedAiPreview.some((s) => s.videoUrl) ? " · Có Video" : ""}
                        {parsedAiPreview.some((s) => s.image) ? " · Có hình ảnh" : ""}.
                      </span>
                      <button type="button" onClick={() => handleSwitchEditorMode("manual")}>
                        Tách ra từng ô để chỉnh ảnh →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div className="admin-sections-top">
                    <div>
                      <h3>Danh sách các phần nội dung</h3>
                      <p>Có thể dùng cú pháp **từ khóa** trong nội dung để tự động in đậm.</p>
                    </div>
                    <button
                      type="button"
                      className="workspace-ghost-btn"
                      onClick={() =>
                        setSections((prev) => [...prev, createEmptySection(prev.length)])
                      }
                    >
                      + Thêm phần nội dung
                    </button>
                  </div>

                  {sections.map((sec, idx) => (
                    <div key={idx} className="admin-section-box">
                      <div className="admin-section-box-head">
                        <strong>Phần {idx + 1}</strong>
                        {sections.length > 1 && (
                          <button
                            type="button"
                            className="admin-remove-sec-btn"
                            onClick={() =>
                              setSections((prev) => prev.filter((_, sIdx) => sIdx !== idx))
                            }
                          >
                            Xóa phần này
                          </button>
                        )}
                      </div>

                      <div className="admin-form-group">
                        <label>Tiêu đề mục (để trống nếu không cần tiêu đề)</label>
                        <input
                          type="text"
                          value={sec.heading}
                          onChange={(event) => updateSection(idx, { heading: event.target.value })}
                          placeholder={`VD: ${idx + 1}. Hướng dẫn tổ chức hoạt động...`}
                          className="admin-input"
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Nội dung trình bày (hỗ trợ **in đậm** và gạch đầu dòng - )</label>
                        <textarea
                          value={sec.body}
                          onChange={(event) => updateSection(idx, { body: event.target.value })}
                          placeholder="Nhập nội dung chi tiết..."
                          className="admin-textarea"
                          rows={4}
                        />
                      </div>

                      <div className="admin-form-group">
                        <label>Link Video YouTube cho Phần {idx + 1} (tùy chọn)</label>
                        <input
                          type="text"
                          value={sec.videoUrl || ""}
                          onChange={(event) => updateSection(idx, { videoUrl: event.target.value })}
                          placeholder="https://www.youtube.com/watch?v=..."
                          className="admin-input"
                        />
                      </div>

                      <ImageUploader
                        label={`Hình ảnh minh họa cho Phần ${idx + 1} (tùy chọn)`}
                        value={sec.image || ""}
                        onChange={(url) => updateSection(idx, { image: url })}
                        compact
                      />

                      <div className="admin-form-group" style={{ marginTop: "10px" }}>
                        <label>Chú thích dưới ảnh (tùy chọn)</label>
                        <input
                          type="text"
                          value={sec.caption || ""}
                          onChange={(event) => updateSection(idx, { caption: event.target.value })}
                          placeholder="VD: Học sinh thảo luận cặp đôi trong 3 phút..."
                          className="admin-input"
                        />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="admin-submit-row">
              {isEditing && (
                <button type="button" className="workspace-ghost-btn" onClick={resetForm}>
                  Hủy chỉnh sửa
                </button>
              )}
              <button
                type="button"
                className="workspace-ghost-btn"
                onClick={() => setIsFullPreview(true)}
              >
                Xem trước toàn trang
              </button>
              <AppButton type="submit" className="join-button">
                {saving
                  ? "Đang lưu..."
                  : isEditing
                    ? "Lưu & Xuất bản bài viết"
                    : "Xuất bản bài viết"}{" "}
                <Icon name="arrow" size={17} />
              </AppButton>
            </div>
          </form>

          <aside className="admin-right-panel">
            <div className="admin-right-tabs">
              <button
                type="button"
                className={`admin-right-tab ${rightPane === "preview" ? "active" : ""}`}
                onClick={() => setRightPane("preview")}
              >
                <span className="live-pulse-dot" /> Xem trước trực tiếp
              </button>
              <button
                type="button"
                className={`admin-right-tab ${rightPane === "list" ? "active" : ""}`}
                onClick={() => setRightPane("list")}
              >
                Bài đã đăng ({activeTab === "resources" ? resources.length : theoryModules.length})
              </button>
            </div>

            {rightPane === "preview" ? (
              <div className="admin-preview-card">
                <div className="admin-preview-toolbar">
                  <span>
                    Bố cục:{" "}
                    <strong>{layout === "zigzag" ? "Editorial Zigzag" : "1 cột tiêu chuẩn"}</strong>
                  </span>
                  <button
                    type="button"
                    className="workspace-ghost-btn"
                    onClick={() => setIsFullPreview(true)}
                  >
                    Phóng to toàn màn hình ↗
                  </button>
                </div>

                <div className="admin-preview-scroll">
                  <div className="preview-block-label">1. Hiển thị dạng thẻ ngoài danh sách</div>
                  <div className="admin-mini-resource-card">
                    <div className="mini-card-thumb">
                      <img src={coverImage || defaultCover} alt={previewTitle} />
                      <span className="category-tag">{previewBadge}</span>
                    </div>
                    <div className="mini-card-body">
                      {activeTab === "resources" && <span className="level-label">{level}</span>}
                      <h4>{previewTitle}</h4>
                      <p>{previewSummary}</p>
                      <div className="mini-card-author">
                        <span className="avatar avatar-mint" style={{ width: "26px", height: "26px" }}>
                          {previewInitials}
                        </span>
                        <strong>{previewAuthor}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="preview-block-label" style={{ marginTop: "24px" }}>
                    2. Hiển thị chi tiết bên trong bài viết
                  </div>

                  <div className="admin-article-sim">
                    <div className="article-badges">
                      <span className="category-tag static">{previewBadge}</span>
                      {activeTab === "resources" && <span className="level-label">{level}</span>}
                    </div>

                    <h2 className="sim-article-title">{previewTitle}</h2>
                    <p className="sim-article-lead">{previewSummary}</p>

                    <div className="sim-author-strip">
                      <span className="avatar avatar-mint" style={{ width: "28px", height: "28px" }}>
                        {previewInitials}
                      </span>
                      <span>
                        Biên soạn bởi <strong>{previewAuthor}</strong> · {formatToday()}
                      </span>
                    </div>

                    {activeTab === "resources" && attachmentUrl && (
                      <div
                        style={{
                          padding: "10px 14px",
                          borderRadius: "10px",
                          background: "#edf5f1",
                          border: "1px solid #cce3d7",
                          fontSize: "12px",
                          marginBottom: "14px",
                          color: "var(--green)",
                          fontWeight: 700,
                        }}
                      >
                        📎 Đính kèm tệp gốc: {attachmentName || attachmentUrl}
                      </div>
                    )}

                    <div className="sim-cover-img">
                      <img src={coverImage || defaultCover} alt={previewTitle} />
                    </div>

                    {mainVideoUrl && (
                      <div style={{ marginBottom: "18px" }}>
                        <VideoEmbed url={mainVideoUrl} title={previewTitle} />
                      </div>
                    )}

                    {livePreviewSections.length === 0 ? (
                      <div className="sim-empty-content">
                        Nội dung chi tiết sẽ tự động hiện tại đây khi thầy cô gõ hoặc dán bài viết ở
                        cột bên trái...
                      </div>
                    ) : layout === "zigzag" ? (
                      <div className="sim-zigzag-list">
                        {livePreviewSections.map((sec, idx) => {
                          const hasMedia = Boolean(sec.image || sec.videoUrl);
                          return (
                            <div
                              key={`${sec.heading}-${idx}`}
                              className={`sim-zigzag-row ${idx % 2 === 1 ? "reverse" : ""} ${
                                !hasMedia ? "single" : ""
                              }`}
                            >
                              <div className="sim-zigzag-text">
                                {sec.heading && <h3>{sec.heading}</h3>}
                                {sec.body && <RichTextBody content={sec.body} />}
                              </div>
                              {hasMedia && (
                                <div className="sim-zigzag-media">
                                  {sec.videoUrl && (
                                    <VideoEmbed url={sec.videoUrl} title={sec.heading || previewTitle} />
                                  )}
                                  {sec.image && (
                                    <figure>
                                      <img src={sec.image} alt={sec.heading || previewTitle} />
                                      {sec.caption && <figcaption>{sec.caption}</figcaption>}
                                    </figure>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="sim-standard-list">
                        {livePreviewSections.map((sec, idx) => (
                          <div key={`${sec.heading}-${idx}`} className="sim-standard-sec">
                            {sec.heading && <h3>{sec.heading}</h3>}
                            {sec.body && <RichTextBody content={sec.body} />}
                            {sec.videoUrl && (
                              <div style={{ marginTop: "12px" }}>
                                <VideoEmbed url={sec.videoUrl} title={sec.heading || previewTitle} />
                              </div>
                            )}
                            {sec.image && (
                              <figure className="sim-standard-fig">
                                <img src={sec.image} alt={sec.heading || previewTitle} />
                                {sec.caption && <figcaption>{sec.caption}</figcaption>}
                              </figure>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="admin-list-card">
                <div className="admin-list-head">
                  <h2>
                    {activeTab === "resources"
                      ? `Bài viết trên Trang chủ (${resources.length})`
                      : `Module trên Trang Lý thuyết (${theoryModules.length})`}
                  </h2>
                </div>

                <div className="admin-items-stack">
                  {activeTab === "resources"
                    ? resources.map((item) => (
                        <article
                          key={item.id}
                          className={`admin-item-row ${editingResourceId === item.id ? "editing" : ""}`}
                        >
                          <img src={item.image} alt={item.title} />
                          <div className="admin-item-info">
                            <span className="admin-item-tag">
                              {item.category} · {item.level}
                              {item.status === "pending" ? " · CHỜ DUYỆT" : ""}
                            </span>
                            <h3>{item.title}</h3>
                            <p>
                              {item.author} · {item.publishedAt}
                            </p>
                            <div className="admin-item-actions">
                              <button type="button" onClick={() => onPreviewResource(item)}>
                                Xem bài
                              </button>
                              <button type="button" onClick={() => handleEditResource(item)}>
                                Sửa
                              </button>
                              <button
                                type="button"
                                className="danger"
                                onClick={async () => {
                                  if (window.confirm(`Xóa bài viết "${item.title}"?`)) {
                                    await onDeleteResource(item.id);
                                    if (editingResourceId === item.id) resetForm();
                                  }
                                }}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </article>
                      ))
                    : theoryModules.map((mod) => (
                        <article
                          key={mod.id}
                          className={`admin-item-row ${editingTheoryId === mod.id ? "editing" : ""}`}
                        >
                          <img src={mod.image} alt={mod.title} />
                          <div className="admin-item-info">
                            <span className="admin-item-tag">{mod.label}</span>
                            <h3>{mod.title}</h3>
                            <p>
                              {mod.author} · {mod.publishedAt}
                            </p>
                            <div className="admin-item-actions">
                              <button type="button" onClick={() => onPreviewTheory(mod)}>
                                Xem bài
                              </button>
                              <button type="button" onClick={() => handleEditTheory(mod)}>
                                Sửa
                              </button>
                              <button
                                type="button"
                                className="danger"
                                onClick={async () => {
                                  if (window.confirm(`Xóa module "${mod.title}"?`)) {
                                    await onDeleteTheory(mod.id);
                                    if (editingTheoryId === mod.id) resetForm();
                                  }
                                }}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {isFullPreview && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={() => setIsFullPreview(false)}
        >
          <div
            className="full-preview-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="full-preview-topbar">
              <span className="preview-live-dot">
                <i /> CHẾ ĐỘ XEM TRƯỚC TOÀN MÀN HÌNH
              </span>
              <button
                type="button"
                className="workspace-ghost-btn"
                onClick={() => setIsFullPreview(false)}
              >
                Đóng xem trước (Esc)
              </button>
            </div>

            <div className="full-preview-content">
              <div className="article-badges">
                <span className="category-tag static">{previewBadge}</span>
                {activeTab === "resources" && <span className="level-label">{level}</span>}
              </div>

              <h1 style={{ fontSize: "clamp(30px, 4vw, 44px)", fontWeight: 700, marginBottom: "12px" }}>
                {previewTitle}
              </h1>
              <p className="article-lead">{previewSummary}</p>

              <div className="article-author-bar">
                <div className="author">
                  <span className="avatar avatar-mint">{previewInitials}</span>
                  <span>
                    <small>Biên soạn & chia sẻ bởi</small>
                    <strong>{previewAuthor}</strong>
                  </span>
                </div>
                <span className="article-date">Cập nhật: {formatToday()}</span>
              </div>

              <figure className="article-cover">
                <img src={coverImage || defaultCover} alt={previewTitle} />
              </figure>

              {mainVideoUrl && (
                <div style={{ marginBottom: "40px" }}>
                  <VideoEmbed url={mainVideoUrl} title={previewTitle} />
                </div>
              )}

              {layout === "zigzag" ? (
                <div className="zigzag-list">
                  {livePreviewSections.map((section, index) => {
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
                              <VideoEmbed
                                url={section.videoUrl}
                                title={section.heading || previewTitle}
                              />
                            )}
                            {section.image && (
                              <figure className="zigzag-media">
                                <img src={section.image} alt={section.heading || previewTitle} />
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
                  {livePreviewSections.map((section, index) => (
                    <section key={`${section.heading}-${index}`} className="standard-section">
                      {section.heading && <h2>{section.heading}</h2>}
                      {section.body && <RichTextBody content={section.body} />}
                      {section.videoUrl && (
                        <div className="standard-media-box">
                          <VideoEmbed
                            url={section.videoUrl}
                            title={section.heading || previewTitle}
                          />
                        </div>
                      )}
                      {section.image && (
                        <figure className="standard-figure">
                          <img src={section.image} alt={section.heading || previewTitle} />
                          {section.caption && <figcaption>{section.caption}</figcaption>}
                        </figure>
                      )}
                    </section>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}