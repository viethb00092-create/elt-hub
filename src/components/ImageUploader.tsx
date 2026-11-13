import { ChangeEvent, useRef, useState } from "react";
import { processAndUploadImage } from "../lib/firestoreService";

const sampleImages = [
  {
    label: "Lớp học nhóm",
    url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
  },
  {
    label: "Trò chơi từ vựng",
    url: "https://images.unsplash.com/photo-1527822618093-743f3e57977c?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
  },
  {
    label: "Thuyết trình Teens",
    url: "https://images.unsplash.com/photo-1758270704262-ecc82b23dc37?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
  },
  {
    label: "Hoạt động Kids",
    url: "https://images.unsplash.com/photo-1574130303188-31a915382726?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=85&w=900&h=620",
  },
];

export function ImageUploader({
  label,
  value,
  onChange,
  compact = false,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  compact?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await processAndUploadImage(file);
      onChange(imageUrl);
    } catch {
      alert("Không thể xử lý ảnh này. Thầy cô vui lòng thử ảnh khác (JPG/PNG) hoặc dán link URL ảnh.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className={`img-uploader ${compact ? "compact" : ""}`}>
      <div className="img-uploader-top">
        <label>{label}</label>
        <div className="img-uploader-actions">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            type="button"
            className="workspace-ghost-btn"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? "Đang tối ưu ảnh..." : "📁 Chọn ảnh từ máy"}
          </button>
        </div>
      </div>

      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Hoặc dán đường dẫn hình ảnh (https://...)"
        className="admin-input"
      />

      <div className="sample-img-strip">
        <span>Ảnh mẫu nhanh:</span>
        {sampleImages.map((sample) => (
          <button
            key={sample.label}
            type="button"
            className="sample-img-chip"
            onClick={() => onChange(sample.url)}
          >
            {sample.label}
          </button>
        ))}
      </div>

      {value && (
        <div className="img-uploader-preview">
          <img src={value} alt="Xem trước hình ảnh" />
        </div>
      )}
    </div>
  );
}