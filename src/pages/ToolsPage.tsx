import { useNavigate, useParams } from "react-router-dom";
import { AppButton } from "../components/AppButton";
import { Icon } from "../components/Icon";
import { WorkspaceCreator } from "../components/WorkspaceCreator";
import { featuredTool, tools } from "../data/mockData";
import { User } from "../types";

export function ToolsPage({
  user,
  onOpenAuth,
}: {
  user: User | null;
  onOpenAuth: () => void;
}) {
  const { toolId } = useParams<{ toolId?: string }>();
  const navigate = useNavigate();

  const allTools = [featuredTool, ...tools];
  const activeTool = toolId ? allTools.find((t) => t.id === toolId) || null : null;

  if (activeTool) {
    return (
      <WorkspaceCreator
        tool={activeTool}
        user={user}
        onOpenAuth={onOpenAuth}
        onBack={() => {
          navigate("/cong-cu");
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    );
  }

  return (
    <main className="route-page tools-page">
      <section className="tools-heading">
        <span className="section-kicker">Bộ công cụ thông minh</span>
        <h1>
          Ít thời gian soạn bài.
          <br />
          <em>Nhiều khoảnh khắc đáng nhớ.</em>
        </h1>
        <p>
          Biến nội dung của thầy cô thành trò chơi tương tác và phiếu bài tập chỉ trong vài giây.
        </p>
      </section>
      <section className="tools-grid">
        <article className="featured-tool">
          <div>
            <span className="tool-badge">Công cụ nổi bật</span>
            <h2>{featuredTool.title}</h2>
            <p>{featuredTool.description}</p>
            <ul>
              <li>
                <Icon name="check" size={16} /> Không cần cài đặt
              </li>
              <li>
                <Icon name="check" size={16} /> Chơi trực tiếp trên lớp
              </li>
            </ul>
            <AppButton
              className="join-button"
              onClick={() => {
                navigate(`/cong-cu/${featuredTool.id}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Bắt đầu tạo game <Icon name="arrow" size={17} />
            </AppButton>
          </div>
          <div className="game-preview">
            <span className="game-star">
              <Icon name="sparkle" size={30} />
            </span>
            <strong>READY?</strong>
            <div>
              <span>A</span>
              <span>B</span>
              <span>C</span>
            </div>
          </div>
        </article>
        {tools.map((tool) => (
          <article className={`tool-card ${tool.themeClass}`} key={tool.id}>
            <span className="tool-icon">{tool.badge}</span>
            <div>
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
            </div>
            <AppButton
              className="text-action"
              onClick={() => {
                navigate(`/cong-cu/${tool.id}`);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              Bắt đầu <Icon name="arrow" size={16} />
            </AppButton>
          </article>
        ))}
      </section>
    </main>
  );
}