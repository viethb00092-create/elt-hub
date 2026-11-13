import { Icon } from "./Icon";

export function Brand({ onNavigate }: { onNavigate?: (path: string) => void }) {
  return (
    <a
      className="brand"
      href="/"
      aria-label="ELT Hub - Trang chủ"
      onClick={(event) => {
        if (!onNavigate) return;
        event.preventDefault();
        onNavigate("/");
      }}
    >
      <span className="brand-mark">
        <Icon name="book" size={23} />
      </span>
      <span className="brand-type">
        <strong>ELT</strong>
        <span>HUB</span>
      </span>
    </a>
  );
}