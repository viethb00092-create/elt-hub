import { FormEvent, useState } from "react";
import { Brand } from "./Brand";
import { SearchBox } from "./SearchBox";

export function Footer({
  onNavigate,
  onOpenContribute,
}: {
  onNavigate: (path: string) => void;
  onOpenContribute: () => void;
}) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Brand onNavigate={onNavigate} />
          <p>
            Trợ lý giảng dạy thông minh dành riêng cho cộng đồng giáo viên tiếng Anh Việt Nam.
          </p>
          <span>Made with care for Vietnamese teachers.</span>
        </div>
        <div className="footer-column">
          <h3>Khám phá</h3>
          <a
            href="/ly-thuyet"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/ly-thuyet");
            }}
          >
            Lý thuyết
          </a>
          <a
            href="/dien-dan"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/dien-dan");
            }}
          >
            Diễn đàn
          </a>
          <a
            href="/cong-cu"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/cong-cu");
            }}
          >
            Công cụ
          </a>
        </div>
        <div className="footer-column">
          <h3>Cộng đồng</h3>
          <a
            href="#contribute"
            onClick={(event) => {
              event.preventDefault();
              onOpenContribute();
            }}
          >
            Đóng góp tài liệu
          </a>
          <a
            href="/dien-dan"
            onClick={(event) => {
              event.preventDefault();
              onNavigate("/dien-dan");
            }}
          >
            Thảo luận & Hỏi đáp
          </a>
        </div>
        <div className="footer-column newsletter">
          <h3>Bản tin cho giáo viên</h3>
          <p>
            {subscribed
              ? "Cảm ơn thầy cô đã đăng ký nhận bản tin!"
              : "Một email hữu ích mỗi tuần. Không spam."}
          </p>
          <SearchBox
            value={email}
            setValue={(val) => {
              setEmail(val);
              if (subscribed) setSubscribed(false);
            }}
            onSubmit={handleSubscribe}
            placeholder="Nhập email của thầy cô..."
            compact
          />
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 ELT Hub. Vì giáo dục là để sẻ chia.</span>
        <div>
          <a href="#top">Điều khoản</a>
          <a href="#top">Bảo mật</a>
        </div>
      </div>
    </footer>
  );
}