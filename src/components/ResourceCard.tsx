import { Resource } from "../types";
import { AppButton } from "./AppButton";
import { Icon } from "./Icon";
import { SafeImage } from "./SafeImage";

export function ResourceCard({
  item,
  onOpen,
  saved,
  onSave,
}: {
  item: Resource;
  onOpen: () => void;
  saved: boolean;
  onSave: () => void;
}) {
  const displayDownloads =
    item.downloadCount !== undefined ? String(item.downloadCount) : item.downloads;

  return (
    <article className="resource-card">
      <div className="card-image-wrap" style={{ position: "relative" }}>
        <SafeImage src={item.image} alt={item.title} className="card-image" />
        <span className="category-tag">{item.category}</span>
        <AppButton
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={onSave}
          ariaLabel={saved ? "Bỏ lưu tài liệu" : "Lưu tài liệu"}
        >
          <Icon name="heart" size={18} />
        </AppButton>
      </div>
      <div className="card-body">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <span className="level-label">{item.level}</span>
          {item.attachmentUrl && (
            <span className="card-file-pill">📎 Có file gốc</span>
          )}
        </div>
        <h3>{item.title}</h3>
        <p>{item.description}</p>
        <div className="card-meta">
          <div className="author">
            <span className={`avatar ${item.color}`}>{item.initials}</span>
            <span>
              <small>Chia sẻ bởi</small>
              <strong>{item.author}</strong>
            </span>
          </div>
          <span className="download-count">
            <Icon name="download" size={16} /> {displayDownloads}
          </span>
        </div>
        <AppButton className="detail-button" onClick={onOpen}>
          Xem chi tiết <Icon name="arrow" size={17} />
        </AppButton>
      </div>
    </article>
  );
}