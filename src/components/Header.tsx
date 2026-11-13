import { useEffect, useRef, useState } from "react";
import { User } from "../types";
import { AppButton } from "./AppButton";
import { Brand } from "./Brand";
import { Icon } from "./Icon";

export function Header({
  currentPath,
  onNavigate,
  user,
  savedCount,
  pendingCount = 0,
  onOpenSaved,
  onOpenContribute,
  onOpenAuth,
  onLogout,
}: {
  currentPath: string;
  onNavigate: (path: string) => void;
  user: User | null;
  savedCount: number;
  pendingCount?: number;
  onOpenSaved: () => void;
  onOpenContribute: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNavClick = (path: string) => {
    setMenuOpen(false);
    setAccountOpen(false);
    onNavigate(path);
  };

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <Brand onNavigate={handleNavClick} />
        <nav className={`main-nav ${menuOpen ? "open" : ""}`} aria-label="Điều hướng chính">
          <a
            className={currentPath.startsWith("/ly-thuyet") ? "active" : ""}
            href="/ly-thuyet"
            onClick={(event) => {
              event.preventDefault();
              handleNavClick("/ly-thuyet");
            }}
          >
            Lý thuyết
          </a>
          <a
            className={currentPath.startsWith("/dien-dan") ? "active" : ""}
            href="/dien-dan"
            onClick={(event) => {
              event.preventDefault();
              handleNavClick("/dien-dan");
            }}
          >
            Diễn đàn
          </a>
          <a
            className={currentPath.startsWith("/cong-cu") ? "active" : ""}
            href="/cong-cu"
            onClick={(event) => {
              event.preventDefault();
              handleNavClick("/cong-cu");
            }}
          >
            Công cụ
          </a>

          {!user && (
            <button
              type="button"
              className="mobile-nav-auth-btn"
              onClick={() => {
                setMenuOpen(false);
                onOpenAuth();
              }}
            >
              Đăng nhập / Tham gia miễn phí →
            </button>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <div className="user-menu-wrap" ref={accountRef}>
              <button
                type="button"
                className={`user-trigger-btn ${accountOpen ? "open" : ""}`}
                onClick={() => setAccountOpen((prev) => !prev)}
                aria-expanded={accountOpen}
                aria-haspopup="menu"
              >
                <span className={`avatar ${user.role === "admin" ? "avatar-gold" : "avatar-mint"}`}>
                  {user.initials}
                </span>
                <span className="user-trigger-name">{user.name}</span>
                {user.role === "admin" && (
                  <span className="user-admin-dot">
                    ADMIN{pendingCount > 0 ? ` · ${pendingCount}` : ""}
                  </span>
                )}
                <span className="user-caret">▾</span>
              </button>

              {accountOpen && (
                <div className="user-dropdown" role="menu">
                  <div className="user-dropdown-head">
                    <span className={`avatar ${user.role === "admin" ? "avatar-gold" : "avatar-mint"}`}>
                      {user.initials}
                    </span>
                    <div>
                      <strong>{user.name}</strong>
                      <span className={`role-pill ${user.role === "admin" ? "is-admin" : ""}`}>
                        {user.role === "admin" ? "Quản trị viên (Admin)" : "Giáo viên thành viên"}
                      </span>
                    </div>
                  </div>

                  {user.role === "admin" && (
                    <div className="user-dropdown-section">
                      <span className="dropdown-section-label">Quản trị hệ thống</span>
                      <button
                        type="button"
                        role="menuitem"
                        className="dropdown-item is-admin-action"
                        onClick={() => handleNavClick("/admin")}
                      >
                        <Icon name="sparkle" size={16} />
                        <span>
                          Cổng đăng bài & Duyệt bài
                          {pendingCount > 0 ? ` (${pendingCount} chờ duyệt)` : ""}
                        </span>
                      </button>
                    </div>
                  )}

                  <div className="user-dropdown-section">
                    <span className="dropdown-section-label">Tài khoản cá nhân</span>
                    <button
                      type="button"
                      role="menuitem"
                      className="dropdown-item"
                      onClick={() => {
                        setAccountOpen(false);
                        onOpenContribute();
                      }}
                    >
                      <Icon name="book" size={16} />
                      <span>+ Đóng góp tài liệu</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="dropdown-item"
                      onClick={() => {
                        setAccountOpen(false);
                        onOpenSaved();
                      }}
                    >
                      <Icon name="heart" size={16} />
                      <span>Tài liệu đã lưu ({savedCount})</span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="dropdown-item"
                      onClick={() => handleNavClick("/dien-dan")}
                    >
                      <Icon name="users" size={16} />
                      <span>Thảo luận cộng đồng</span>
                    </button>
                  </div>

                  <div className="user-dropdown-footer">
                    <button
                      type="button"
                      role="menuitem"
                      className="dropdown-item is-logout"
                      onClick={() => {
                        setAccountOpen(false);
                        onLogout();
                      }}
                    >
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <AppButton className="login-button" onClick={onOpenAuth}>
                Đăng nhập
              </AppButton>
              <AppButton className="join-button" onClick={onOpenAuth}>
                Tham gia miễn phí <Icon name="arrow" size={16} />
              </AppButton>
            </>
          )}
        </div>

        <AppButton
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          ariaLabel="Mở menu"
        >
          <Icon name={menuOpen ? "close" : "menu"} size={23} />
        </AppButton>
      </div>
    </header>
  );
}