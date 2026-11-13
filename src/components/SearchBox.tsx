import { FormEvent } from "react";
import { AppButton } from "./AppButton";
import { Icon } from "./Icon";

export function SearchBox({
  value,
  setValue,
  onSubmit,
  compact = false,
  placeholder = "Tìm worksheet, game, lý thuyết...",
}: {
  value: string;
  setValue: (value: string) => void;
  onSubmit: (event: FormEvent) => void;
  compact?: boolean;
  placeholder?: string;
}) {
  return (
    <form className={`search-box ${compact ? "compact" : ""}`} onSubmit={onSubmit} role="search">
      <Icon name="search" size={compact ? 18 : 21} />
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
      />
      <AppButton className="search-button" type="submit">
        Tìm kiếm <Icon name="arrow" size={18} />
      </AppButton>
    </form>
  );
}