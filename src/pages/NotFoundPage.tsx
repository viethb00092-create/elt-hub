import { AppButton } from "../components/AppButton";

export function NotFoundPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <main className="not-found">
      <span className="section-kicker">404</span>
      <h1>Trang này chưa tồn tại</h1>
      <p>Quay lại ELT Hub để tiếp tục khám phá tài nguyên dành cho giáo viên.</p>
      <AppButton className="join-button" onClick={() => onNavigate("/")}>
        Về trang chủ
      </AppButton>
    </main>
  );
}