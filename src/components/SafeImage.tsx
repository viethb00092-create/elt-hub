import { ImgHTMLAttributes, useEffect, useState } from "react";
import { Icon } from "./Icon";

interface SafeImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackIcon?: "image" | "file";
  fallbackBg?: string;
  fallbackColor?: string;
}

export function SafeImage({
  src,
  alt = "Image",
  className = "",
  fallbackIcon = "image",
  fallbackBg = "var(--cream)",
  fallbackColor = "var(--muted)",
  ...props
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState<string | undefined>(src);
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
    setImgSrc(undefined);
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  if (hasError || !imgSrc) {
    return (
      <div
        className={`safe-image-fallback ${className}`}
        style={{
          backgroundColor: fallbackBg,
          color: fallbackColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          minHeight: "120px",
        }}
        title={`Lỗi tải ảnh: ${alt}`}
      >
        <Icon name={fallbackIcon === "file" ? "book" : "sparkle"} size={32} />
      </div>
    );
  }

  return (
    <>
      {!isLoaded && (
        <div
          className={`safe-image-skeleton ${className}`}
          style={{
            backgroundColor: fallbackBg,
            width: "100%",
            height: "100%",
            position: "absolute",
            inset: 0,
            zIndex: 1,
            animation: "pulse 1.5s infinite ease-in-out",
          }}
        />
      )}
      <img
        {...props}
        src={imgSrc}
        alt={alt}
        className={`${className} ${isLoaded ? "loaded" : "loading"}`}
        onError={handleError}
        onLoad={handleLoad}
        style={{
          ...props.style,
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
        }}
      />
    </>
  );
}