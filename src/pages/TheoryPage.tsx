import { useMemo, useState } from "react";
import { AppButton } from "../components/AppButton";
import { Icon } from "../components/Icon";
import { theoryFilters } from "../data/mockData";
import { TheoryModule } from "../types";

export function TheoryPage({
  modules: allModules,
  onOpenModule,
}: {
  modules: TheoryModule[];
  onOpenModule: (module: TheoryModule) => void;
}) {
  const [filter, setFilter] = useState("Tất cả");
  const [query, setQuery] = useState("");

  const modules = useMemo(() => {
    const term = query.trim().toLowerCase();
    return allModules.filter((item) => {
      const matchesFilter = filter === "Tất cả" || item.label === filter;
      const matchesQuery =
        !term || `${item.title} ${item.label} ${item.text}`.toLowerCase().includes(term);
      return matchesFilter && matchesQuery;
    });
  }, [allModules, filter, query]);

  return (
    <main className="route-page">
      <section className="route-hero theory-hero">
        <div className="route-hero-inner">
          <span className="section-kicker">Thư viện kiến thức</span>
          <h1>Kiến thức & phương pháp giảng dạy ELT</h1>
          <p>
            Nền tảng học thuật trực quan, dễ ứng dụng để thầy cô tự tin hơn trong mỗi quyết định sư
            phạm.
          </p>
          <form className="route-search" onSubmit={(event) => event.preventDefault()}>
            <Icon name="search" size={20} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Tìm phương pháp"
              placeholder="Tìm phương pháp, ví dụ: PPP, TBLT..."
            />
            <AppButton type="submit" className="join-button">
              Tìm phương pháp
            </AppButton>
          </form>
        </div>
      </section>
      <section className="route-content">
        <div className="filter-bar route-filters">
          {theoryFilters.map((item) => (
            <AppButton
              key={item}
              className={`filter-chip ${filter === item ? "active" : ""}`}
              onClick={() => setFilter(item)}
            >
              {item}
            </AppButton>
          ))}
        </div>
        <div className="route-title-row">
          <div>
            <span className="section-kicker">Học theo chủ đề</span>
            <h2>Danh sách module kiến thức</h2>
          </div>
          <span>{modules.length} module</span>
        </div>
        <div className="module-grid">
          {modules.map((module) => (
            <article className="module-card" key={module.id}>
              <img src={module.image} alt={module.title} />
              <div>
                <span>{module.label}</span>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
                <AppButton className="text-action" onClick={() => onOpenModule(module)}>
                  Đọc module <Icon name="arrow" size={17} />
                </AppButton>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}