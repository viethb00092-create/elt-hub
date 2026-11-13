import { useMemo, useState } from "react";
import { AppButton } from "../components/AppButton";
import { Icon } from "../components/Icon";
import { MemberHoverCard } from "../components/MemberHoverCard";
import { forumCategories } from "../data/mockData";
import { Discussion } from "../types";

const rankStyles = [
  { badgeClass: "rank-badge-gold", nameClass: "rank-name-gold", title: "Top 1 · Chuyên gia" },
  { badgeClass: "rank-badge-blue", nameClass: "rank-name-blue", title: "Top 2 · Cố vấn" },
  { badgeClass: "rank-badge-orange", nameClass: "rank-name-orange", title: "Top 3 · Truyền lửa" },
];

export function ForumPage({
  user,
  threads,
  onOpenAskModal,
  onOpenThread,
  onToggleUpvoteThread,
  onRequestAuth,
}: {
  user: { name: string; initials: string } | null;
  threads: Discussion[];
  onOpenAskModal: () => void;
  onOpenThread: (thread: Discussion) => void;
  onToggleUpvoteThread: (threadId: string) => void;
  onRequestAuth: () => void;
}) {
  const [category, setCategory] = useState("Tất cả thảo luận");
  const [query, setQuery] = useState("");

  const filteredDiscussions = useMemo(() => {
    const term = query.trim().toLowerCase();
    return threads.filter((item) => {
      const matchesCategory = category === "Tất cả thảo luận" || item.category === category;
      const matchesQuery =
        !term ||
        `${item.title} ${item.content} ${item.author} ${item.category}`
          .toLowerCase()
          .includes(term);
      return matchesCategory && matchesQuery;
    });
  }, [threads, category, query]);

  const leaderboard = useMemo(() => {
    const scoreMap = new Map<
      string,
      { author: string; initials: string; color: string; points: number }
    >([
      [
        "Nguyễn Minh Anh",
        { author: "Nguyễn Minh Anh", initials: "MA", color: "avatar-mint", points: 315 },
      ],
      ["Trần Thu Hà", { author: "Trần Thu Hà", initials: "TH", color: "avatar-gold", points: 250 }],
      ["Lê Hoàng Nam", { author: "Lê Hoàng Nam", initials: "HN", color: "avatar-blue", points: 185 }],
    ]);

    threads.forEach((thread) => {
      const existing = scoreMap.get(thread.author) || {
        author: thread.author,
        initials: thread.initials,
        color: thread.color,
        points: 100,
      };
      existing.points += 25 + (thread.upvotes ?? 0) * 2;
      scoreMap.set(thread.author, existing);

      thread.comments.forEach((c) => {
        const commenter = scoreMap.get(c.author) || {
          author: c.author,
          initials: c.initials,
          color: c.color,
          points: 100,
        };
        commenter.points += 10 + (c.upvotes ?? 0) * 3;
        scoreMap.set(c.author, commenter);
      });
    });

    return Array.from(scoreMap.values())
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);
  }, [threads]);

  const handleAskClick = () => {
    if (user) onOpenAskModal();
    else onRequestAuth();
  };

  return (
    <main className="route-page forum-page">
      <section className="forum-header">
        <div>
          <span className="section-kicker">Kết nối & sẻ chia</span>
          <h1>Diễn đàn thảo luận</h1>
          <p>Nơi mọi câu hỏi nghề nghiệp đều được lắng nghe và giải đáp từ cộng đồng.</p>
        </div>
        <form className="route-search forum-search" onSubmit={(event) => event.preventDefault()}>
          <Icon name="search" size={20} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Tìm thảo luận"
            placeholder="Tìm kiếm thảo luận, câu hỏi..."
          />
        </form>
      </section>
      <section className="forum-layout">
        <aside className="forum-sidebar">
          <h2>Danh mục</h2>
          {forumCategories.map((item) => (
            <AppButton
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              <span>{item}</span>
              <Icon name="chevron" size={15} />
            </AppButton>
          ))}
          <AppButton className="join-button ask-button" onClick={handleAskClick}>
            Đặt câu hỏi <Icon name="arrow" size={16} />
          </AppButton>
        </aside>

        <div className="thread-list">
          <div className="thread-list-heading">
            <h2>Thảo luận mới nhất</h2>
            <span>{filteredDiscussions.length} chủ đề</span>
          </div>
          {filteredDiscussions.length > 0 ? (
            filteredDiscussions.map((item) => {
              const isUpvoted = user ? (item.upvotedBy ?? []).includes(user.name) : false;

              return (
                <article
                  className="thread-card reddit-thread-row"
                  key={item.id}
                  onClick={() => onOpenThread(item)}
                  style={{ cursor: "pointer" }}
                >
                  <button
                    type="button"
                    className={`thread-upvote-col ${isUpvoted ? "active" : ""}`}
                    onClick={(event) => {
                      event.stopPropagation();
                      if (user) onToggleUpvoteThread(item.id);
                      else onRequestAuth();
                    }}
                    title="Upvote thảo luận"
                  >
                    <span>▲</span>
                    <strong>{item.upvotes ?? 0}</strong>
                  </button>

                  <div>
                    <span className="thread-category">#{item.category}</span>
                    <h3>{item.title}</h3>
                    <div className="thread-author-line">
                      <span
                        className={`avatar ${item.color}`}
                        style={{ width: "22px", height: "22px", fontSize: "9px" }}
                      >
                        {item.initials}
                      </span>
                      <MemberHoverCard
                        author={item.author}
                        initials={item.initials}
                        color={item.color}
                        threads={threads}
                        onSelectThread={onOpenThread}
                      />
                      <span>· {item.createdAt}</span>
                    </div>
                  </div>

                  <span className="comment-count">
                    <strong>{item.comments.length}</strong>bình luận
                  </span>
                </article>
              );
            })
          ) : (
            <div style={{ padding: "48px 20px", textAlign: "center", color: "var(--muted)" }}>
              Chưa có bài thảo luận nào phù hợp trong chuyên mục này.
            </div>
          )}
        </div>

        <aside className="forum-right">
          <div className="leaderboard leaderboard-vibrant">
            <div className="leaderboard-head">
              <h2>Thành viên tích cực</h2>
              <span>Rê chuột xem hồ sơ</span>
            </div>
            {leaderboard.map((member, index) => {
              const style = rankStyles[index] || rankStyles[2];
              return (
                <div className={`leaderboard-row rank-row-${index + 1}`} key={member.author}>
                  <strong className={`rank-badge ${style.badgeClass}`}>0{index + 1}</strong>
                  <span className={`avatar ${member.color}`}>{member.initials}</span>
                  <div className="leaderboard-member-info">
                    <MemberHoverCard
                      author={member.author}
                      initials={member.initials}
                      color={member.color}
                      threads={threads}
                      nameClassName={style.nameClass}
                      align="right"
                      onSelectThread={onOpenThread}
                    />
                    <small>
                      {member.points} điểm · {style.title}
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rules-box">
            <Icon name="heart" size={23} />
            <h3>Trao đổi tử tế</h3>
            <p>
              Tôn trọng khác biệt, chia sẻ có nguồn và nhấn Upvote cho những bình luận giải đáp hữu
              ích.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}