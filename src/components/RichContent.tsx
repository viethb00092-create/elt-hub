import { Fragment } from "react";

export function getVideoEmbedInfo(url?: string): {
  type: "youtube" | "video" | "invalid";
  src: string;
} {
  if (!url) return { type: "invalid", src: "" };
  const trimmed = url.trim();
  if (!trimmed) return { type: "invalid", src: "" };

  // Nhận diện các dạng link YouTube (watch, youtu.be, shorts, embed)
  const ytMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      src: `https://www.youtube.com/embed/${ytMatch[1]}`,
    };
  }

  // Nhận diện file video trực tiếp
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(trimmed)) {
    return { type: "video", src: trimmed };
  }

  return { type: "invalid", src: trimmed };
}

export function VideoEmbed({ url, title = "Video minh họa" }: { url?: string; title?: string }) {
  const info = getVideoEmbedInfo(url);
  if (info.type === "invalid") return null;

  return (
    <div className="article-video-wrap">
      {info.type === "youtube" ? (
        <iframe
          src={info.src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <video controls src={info.src} preload="metadata" />
      )}
    </div>
  );
}

function renderInlineFormatting(text: string) {
  // Tách các cụm **in đậm** và *in nghiêng*
  const tokens = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith("**") && token.endsWith("**") && token.length > 4) {
      return (
        <strong key={idx} className="rich-keyword">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("*") && token.endsWith("*") && token.length > 2) {
      return <em key={idx}>{token.slice(1, -1)}</em>;
    }
    return <Fragment key={idx}>{token}</Fragment>;
  });
}

export function RichTextBody({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="rich-body">
      {lines.map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) return null;

        // Nhận diện dòng gạch đầu dòng (- , * , • )
        if (/^[-*•]\s+/.test(line)) {
          const cleanBullet = line.replace(/^[-*•]\s+/, "");
          return (
            <div key={index} className="rich-bullet-row">
              <span className="rich-bullet-dot">•</span>
              <span>{renderInlineFormatting(cleanBullet)}</span>
            </div>
          );
        }

        return <p key={index}>{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
}