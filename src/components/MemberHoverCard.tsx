import { useMemo, useRef, useState } from "react";
import { memberProfiles } from "../data/mockData";
import { Discussion } from "../types";

export function MemberHoverCard({
  author,
  initials,
  color,
  threads,
  nameClassName = "",
  align = "left",
  onSelectThread,
}: {
  author: string;
  initials: string;
  color: string;
  threads: Discussion[];
  nameClassName?: string;
  align?: "left" | "right";
  onSelectThread?: (thread: Discussion) => void;
}) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<number | null>(null);

  const handleMouseEnter = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = window.setTimeout(() => {
      setOpen(false);
    }, 180);
  };

  const activity = useMemo(() => {
    const writtenPosts = threads.filter((t) => t.author === author);
    const writtenComments: {
      commentId: string;
      content: string;
      upvotes: number;
      thread: Discussion;
    }[] = [];

    let totalUpvotes = 0;

    threads.forEach((t) => {
      if (t.author === author) {
        totalUpvotes += t.upvotes ?? 0;
      }
      t.comments.forEach((c) => {
        if (c.author === author) {
          totalUpvotes += c.upvotes ?? 0;
          writtenComments.push({
            commentId: c.id,
            content: c.content,
            upvotes: c.upvotes ?? 0,
            thread: t,
          });
        }
      });
    });

    const profile = memberProfiles[author] || {
      role: "Thành viên cộng đồng ELT",
      school: "Giáo viên Tiếng Anh",
      bio: "Tích cực chia sẻ kinh nghiệm giảng dạy và học liệu mở cùng đồng nghiệp.",
    };

    return { writtenPosts, writtenComments, totalUpvotes, profile };
  }, [author, threads]);

  return (
    <span
      className="member-hover-wrap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(event) => event.stopPropagation()}
    >
      <span className={`member-trigger-name ${nameClassName}`}>{author}</span>

      {open && (
        <div
          className={`member-popover ${align === "right" ? "align-right" : ""}`}
          role="tooltip"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className="member-popover-head">
            <span className={`avatar ${color}`}>{initials}</span>
            <div>
              <strong>{author}</strong>
              <span className="member-role-tag">{activity.profile.role}</span>
              <small>{activity.profile.school}</small>
            </div>
          </div>

          <p className="member-bio">{activity.profile.bio}</p>

          <div className="member-stats-row">
            <div>
              <strong>{activity.writtenPosts.length}</strong>
              <span>Bài viết</span>
            </div>
            <div>
              <strong>{activity.writtenComments.length}</strong>
              <span>Bình luận</span>
            </div>
            <div>
              <strong>{activity.totalUpvotes}</strong>
              <span>Upvote</span>
            </div>
          </div>

          <div className="member-history">
            <div className="member-history-group">
              <h4>Bài đã viết ({activity.writtenPosts.length})</h4>
              {activity.writtenPosts.length > 0 ? (
                <ul>
                  {activity.writtenPosts.slice(0, 2).map((post) => (
                    <li key={post.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onSelectThread?.(post);
                        }}
                      >
                        • {post.title}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="member-empty-note">Chưa đăng chủ đề mới.</p>
              )}
            </div>

            <div className="member-history-group">
              <h4>Bình luận gần đây ({activity.writtenComments.length})</h4>
              {activity.writtenComments.length > 0 ? (
                <ul>
                  {activity.writtenComments.slice(0, 2).map((item) => (
                    <li key={item.commentId}>
                      <button
                        type="button"
                        onClick={() => {
                          setOpen(false);
                          onSelectThread?.(item.thread);
                        }}
                      >
                        “{item.content.slice(0, 58)}
                        {item.content.length > 58 ? "..." : ""}”
                        <small>trong: {item.thread.title}</small>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="member-empty-note">Chưa có bình luận nào.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </span>
  );
}