import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AppButton } from "../components/AppButton";
import { Icon } from "../components/Icon";
import { ResourceCard } from "../components/ResourceCard";
import { SearchBox } from "../components/SearchBox";
import { Resource, User } from "../types";

const homeFilters = ["Tất cả", "Đã lưu", "Tài liệu", "Kinh nghiệm", "Công cụ", "Kids", "Teens"];

export function HomePage({
  user = null,
  resources,
  loading = false,
  onSelectResource,
  savedIds,
  onToggleSaved,
  onOpenAuth,
  onOpenContribute,
  onNavigateForum,
}: {
  user?: User | null;
  resources: Resource[];
  loading?: boolean;
  onSelectResource: (item: Resource) => void;
  savedIds: string[];
  onToggleSaved: (id: string) => void;
  onOpenAuth: () => void;
  onOpenContribute: () => void;
  onNavigateForum?: () => void;
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");

  useEffect(() => {
    if (searchParams.get("filter") === "saved") {
      setActiveFilter("Đã lưu");
      setAppliedSearch("");
      setSearch("");
      searchParams.delete("filter");
      setSearchParams(searchParams, { replace: true });
      window.setTimeout(() => {
        document.querySelector("#resources")?.scrollIntoView({ behavior: "smooth" });
      }, 80);
    }
  }, [searchParams, setSearchParams]);

  // Chỉ hiển thị các bài đã được duyệt ngoài Trang chủ
  const approvedResources = useMemo(
    () => resources.filter((item) => item.status !== "pending"),
    [resources],
  );

  const filtered = useMemo(() => {
    const term = appliedSearch.trim().toLowerCase();
    return approvedResources.filter((item) => {
      const matchesFilter =
        activeFilter === "Tất cả" ||
        (activeFilter === "Đã lưu" && savedIds.includes(item.id)) ||
        item.category === activeFilter ||
        item.level === activeFilter;

      const matchesSearch =
        !term ||
        `${item.title} ${item.description} ${item.category} ${item.level}`
          .toLowerCase()
          .includes(term);

      return matchesFilter && matchesSearch;
    });
  }, [approvedResources, activeFilter, appliedSearch, savedIds]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setAppliedSearch(search);
    document.querySelector("#resources")?.scrollIntoView({ behavior: "smooth" });
  }

  function handleResetFilters() {
    setAppliedSearch("");
    setSearch("");
    setActiveFilter("Tất cả");
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-orb hero-orb-one" />
        <div className="hero-orb hero-orb-two" />
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="eyebrow">
              <Icon name="sparkle" size={17} /> Miễn phí 100% cho giáo viên
            </div>
            <h1>
              Nơi thầy cô tìm thấy <em>cảm hứng</em> cho mỗi giờ dạy.
            </h1>
            <p className="hero-lead">
              Kho tri thức, tài liệu và công cụ thông minh được tạo nên bởi cộng đồng giáo viên
              tiếng Anh Việt Nam.
            </p>
            <SearchBox value={search} setValue={setSearch} onSubmit={handleSearch} />
            <div className="search-hints">
              <span>Gợi ý:</span>
              <AppButton
                onClick={() => {
                  setSearch("Warm-up games");
                  setAppliedSearch("game");
                }}
              >
                Warm-up games
              </AppButton>
              <AppButton
                onClick={() => {
                  setSearch("Lesson plan");
                  setAppliedSearch("lesson plan");
                }}
              >
                Lesson plan
              </AppButton>
              <AppButton
                onClick={() => {
                  setSearch("Kids");
                  setAppliedSearch("kids");
                }}
              >
                Kids
              </AppButton>
            </div>
          </div>
          <div className="hero-visual">
            <div className="image-frame">
              <img
                src="https://images.unsplash.com/photo-1577896851231-70ef18881754?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&q=90&w=1200&h=1450"
                alt="Giáo viên đang hướng dẫn học sinh trong lớp học"
              />
              <div className="photo-credit">Ảnh: National Cancer Institute / Unsplash</div>
            </div>
            <div className="stat-card stat-teachers">
              <span className="stat-icon">
                <Icon name="users" size={22} />
              </span>
              <span>
                <strong>1,200+</strong>
                <small>Giáo viên đồng hành</small>
              </span>
            </div>
            <div className="stat-card stat-resources">
              <span className="stat-icon">
                <Icon name="book" size={22} />
              </span>
              <span>
                <strong>5,400+</strong>
                <small>Tài liệu miễn phí</small>
              </span>
            </div>
            <div className="doodle doodle-arrow">
              <svg viewBox="0 0 70 58" aria-hidden="true">
                <path d="M4 48c23-2 36-15 45-36M38 14l13-4 2 14" />
              </svg>
            </div>
          </div>
        </div>
        <div className="trust-strip">
          <div>
            <Icon name="check" size={17} />
            <span>Kiểm duyệt bởi giáo viên</span>
          </div>
          <div>
            <Icon name="check" size={17} />
            <span>Tải xuống không giới hạn</span>
          </div>
          <div>
            <Icon name="check" size={17} />
            <span>Cập nhật mỗi tuần</span>
          </div>
        </div>
      </section>

      <section className="resources-section" id="resources">
        <div className="section-inner">
          <div className="section-heading">
            <div>
              <span className="section-kicker">Được cộng đồng yêu thích</span>
              <h2>Tài liệu nổi bật trong tuần</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "12px" }}>
              <p>
                Những tài nguyên thiết thực, sáng tạo được giáo viên ELT sử dụng và đánh giá cao.
              </p>
              <AppButton className="join-button" onClick={onOpenContribute}>
                + Đóng góp tài liệu <Icon name="arrow" size={16} />
              </AppButton>
            </div>
          </div>

          <div className="filter-bar" aria-label="Lọc tài liệu">
            {homeFilters.map((filter) => (
              <AppButton
                key={filter}
                className={activeFilter === filter ? "filter-chip active" : "filter-chip"}
                onClick={() => setActiveFilter(filter)}
              >
                {filter === "Đã lưu" ? `Đã lưu (${savedIds.length})` : filter}
              </AppButton>
            ))}
            <span className="result-count">{filtered.length} tài liệu</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <h3>Đang tải dữ liệu từ thư viện...</h3>
              <p>Vui lòng đợi trong giây lát.</p>
            </div>
          ) : filtered.length > 0 ? (
            <div className="resource-grid">
              {filtered.map((item) => (
                <ResourceCard
                  key={item.id}
                  item={item}
                  onOpen={() => onSelectResource(item)}
                  saved={savedIds.includes(item.id)}
                  onSave={() => onToggleSaved(item.id)}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>
                <Icon name="search" size={30} />
              </span>
              <h3>
                {activeFilter === "Đã lưu"
                  ? "Thầy cô chưa lưu tài liệu nào"
                  : approvedResources.length === 0
                    ? "Thư viện trên Firestore đang trống"
                    : "Chưa tìm thấy tài liệu phù hợp"}
              </h3>
              <p>
                {activeFilter === "Đã lưu"
                  ? "Hãy bấm vào biểu tượng trái tim trên mỗi thẻ tài liệu để lưu lại dùng sau."
                  : approvedResources.length === 0
                    ? "Admin hãy đăng nhập vào Cổng Admin và bấm 'Nạp dữ liệu mẫu lên Firebase' để khởi tạo bài viết."
                    : "Thử một từ khóa khác hoặc quay về xem tất cả tài liệu."}
              </p>
              <AppButton className="join-button" onClick={handleResetFilters}>
                Xem tất cả
              </AppButton>
            </div>
          )}

          <div className="browse-row">
            <AppButton className="browse-button" onClick={handleResetFilters}>
              Khám phá toàn bộ thư viện <Icon name="arrow" size={18} />
            </AppButton>
          </div>
        </div>
      </section>

      <section className="community-banner">
        <div className="community-inner">
          <div className="community-art">
            <span className="bubble bubble-one">Aa</span>
            <span className="bubble bubble-two">?</span>
            <span className="bubble bubble-three">
              <Icon name="heart" size={22} />
            </span>
            <span className="community-avatar ca-one">MA</span>
            <span className="community-avatar ca-two">TH</span>
            <span className="community-avatar ca-three">HN</span>
          </div>
          <div className="community-copy">
            <span className="section-kicker light">Cùng nhau phát triển</span>
            <h2>Không ai phải dạy học một mình.</h2>
            <p>
              Tham gia cộng đồng để đặt câu hỏi, chia sẻ kinh nghiệm và cùng hàng nghìn thầy cô tạo
              nên những giờ học ý nghĩa hơn.
            </p>
            <AppButton
              className="community-button"
              onClick={() => {
                if (user && onNavigateForum) onNavigateForum();
                else onOpenAuth();
              }}
            >
              {user ? "Vào diễn đàn thảo luận" : "Tham gia cộng đồng"}{" "}
              <Icon name="arrow" size={18} />
            </AppButton>
          </div>
        </div>
      </section>
    </main>
  );
}