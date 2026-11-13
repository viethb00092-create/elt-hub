import { ReactNode } from "react";

export function AppButton({
  children,
  className = "",
  onClick,
  type = "button",
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  ariaLabel?: string;
}) {
  return (
    <button type={type} className={className} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </button>
  );
}