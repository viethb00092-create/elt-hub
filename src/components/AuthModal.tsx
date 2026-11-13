import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { FormEvent, useEffect, useState } from "react";
import { auth, isFirebaseConfigured } from "../lib/firebase";
import { AppButton } from "./AppButton";
import { Icon } from "./Icon";

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const mapFirebaseError = (code?: string) => {
    switch (code) {
      case "auth/invalid-credential":
      case "auth/user-not-found":
      case "auth/wrong-password":
        return "Email hoặc mật khẩu chưa chính xác.";
      case "auth/email-already-in-use":
        return "Email này đã được đăng ký. Thầy cô hãy chuyển sang tab Đăng nhập nhé.";
      case "auth/weak-password":
        return "Mật khẩu cần có tối thiểu 6 ký tự.";
      case "auth/invalid-email":
        return "Định dạng email chưa hợp lệ.";
      default:
        return "Không thể xác thực tài khoản. Vui lòng kiểm tra cấu hình Firebase (.env).";
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isFirebaseConfigured) {
      setError("Chưa cấu hình biến môi trường Firebase trong file .env.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      if (mode === "register") {
        if (!name.trim()) {
          setError("Vui lòng nhập họ tên hiển thị của thầy cô.");
          setSubmitting(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await updateProfile(cred.user, { displayName: name.trim() });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onClose();
    } catch (err: unknown) {
      const code = typeof err === "object" && err && "code" in err ? String(err.code) : "";
      setError(mapFirebaseError(code));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className="resource-modal"
        style={{ display: "block", maxWidth: "440px", padding: "38px 30px", margin: "auto" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <AppButton className="modal-close" onClick={onClose} ariaLabel="Đóng">
          <Icon name="close" size={21} />
        </AppButton>

        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <span style={{ display: "inline-block", color: "var(--orange)", marginBottom: "8px" }}>
            <Icon name="users" size={44} />
          </span>
          <h2 id="auth-modal-title" style={{ fontSize: "26px", fontWeight: 700, marginBottom: "6px" }}>
            {mode === "login" ? "Chào mừng thầy cô!" : "Tạo tài khoản giáo viên"}
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "14px", lineHeight: 1.55 }}>
            {mode === "login"
              ? "Đăng nhập bằng Email để lưu tài liệu, tham gia diễn đàn hoặc quản trị nội dung."
              : "Đăng ký miễn phí để chia sẻ kinh nghiệm và đồng bộ học liệu của thầy cô."}
          </p>
        </div>

        <div className="auth-role-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={`auth-role-tab ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setError("");
            }}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={`auth-role-tab ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setError("");
            }}
          >
            Đăng ký mới
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {mode === "register" && (
            <div>
              <label
                htmlFor="auth-name-input"
                style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}
              >
                Tên hiển thị của thầy cô
              </label>
              <input
                id="auth-name-input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Ví dụ: Nguyễn Minh Anh"
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  border: "1px solid var(--line)",
                  borderRadius: "10px",
                  fontSize: "15px",
                  outlineColor: "var(--orange)",
                }}
                required
              />
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email-input"
              style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}
            >
              Địa chỉ Email
            </label>
            <input
              id="auth-email-input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="giaovien@elthub.vn"
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "1px solid var(--line)",
                borderRadius: "10px",
                fontSize: "15px",
                outlineColor: "var(--orange)",
              }}
              autoFocus
              required
            />
          </div>

          <div>
            <label
              htmlFor="auth-pass-input"
              style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}
            >
              Mật khẩu
            </label>
            <input
              id="auth-pass-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Tối thiểu 6 ký tự..."
              style={{
                width: "100%",
                padding: "12px 15px",
                border: "1px solid var(--line)",
                borderRadius: "10px",
                fontSize: "15px",
                outlineColor: "var(--orange)",
              }}
              required
            />
          </div>

          {error && <p className="admin-error-text">{error}</p>}

          <AppButton type="submit" className="join-button modal-cta">
            {submitting
              ? "Đang xử lý..."
              : mode === "login"
                ? "Đăng nhập vào ELT Hub"
                : "Hoàn tất đăng ký"}{" "}
            <Icon name="arrow" size={18} />
          </AppButton>
        </form>
      </div>
    </div>
  );
}