import { onAuthStateChanged, signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { AskModal } from "./components/AskModal";
import { AuthModal } from "./components/AuthModal";
import { ContributeModal } from "./components/ContributeModal";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { ThreadModal } from "./components/ThreadModal";
import { initialDiscussions, initialResources, initialTheoryModules } from "./data/mockData";
import { auth, isAdminEmail, isFirebaseConfigured } from "./lib/firebase";
import {
  approveResourceInDb,
  createDiscussionInDb,
  deleteResourceFromDb,
  deleteTheoryFromDb,
  saveResourceToDb,
  saveTheoryToDb,
  seedInitialDataToFirestore,
  subscribeDiscussions,
  subscribeResources,
  subscribeTheoryModules,
  subscribeUserSaved,
  updateDiscussionCommentsInDb,
  updateDiscussionUpvoteInDb,
  updateUserSavedInDb,
} from "./lib/firestoreService";
import { AdminPage } from "./pages/AdminPage";
import { ArticleDetailPage } from "./pages/ArticleDetailPage";
import { ForumPage } from "./pages/ForumPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TheoryPage } from "./pages/TheoryPage";
import { ToolsPage } from "./pages/ToolsPage";
import { Discussion, Resource, TheoryModule, User } from "./types";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GV";
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAskOpen, setIsAskOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(isFirebaseConfigured);

  const [resources, setResources] = useState<Resource[]>(
    isFirebaseConfigured ? [] : initialResources,
  );
  const [theoryModules, setTheoryModules] = useState<TheoryModule[]>(
    isFirebaseConfigured ? [] : initialTheoryModules,
  );
  const [forumThreads, setForumThreads] = useState<Discussion[]>(
    isFirebaseConfigured ? [] : initialDiscussions,
  );

  const [user, setUser] = useState<User | null>(null);
  const [saved, setSaved] = useState<string[]>([]);

  const activeThread = forumThreads.find((t) => t.id === activeThreadId) || null;
  const pendingCount = resources.filter((r) => r.status === "pending").length;

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const displayName =
          firebaseUser.displayName ||
          (firebaseUser.email ? firebaseUser.email.split("@")[0] : "Giáo viên");
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: displayName,
          initials: getInitials(displayName),
          role: isAdminEmail(firebaseUser.email) ? "admin" : "member",
        });
      } else {
        setUser(null);
        setSaved([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) return;

    const unsubResources = subscribeResources(
      (items) => {
        setResources(items);
        setLoadingData(false);
      },
      () => setLoadingData(false),
    );

    const unsubTheory = subscribeTheoryModules((items) => {
      setTheoryModules(items);
    });

    const unsubForum = subscribeDiscussions((items) => {
      setForumThreads(items);
    });

    return () => {
      unsubResources();
      unsubTheory();
      unsubForum();
    };
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !user) return;
    const unsubSaved = subscribeUserSaved(user.uid, (savedIds) => {
      setSaved(savedIds);
    });
    return () => unsubSaved();
  }, [user]);

  function handleNavigate(path: string) {
    navigate(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleOpenSaved() {
    navigate("/?filter=saved");
  }

  function handleOpenContribute() {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    setIsContributeOpen(true);
  }

  async function toggleSaved(id: string) {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    const nextSaved = saved.includes(id)
      ? saved.filter((item) => item !== id)
      : [...saved, id];
    setSaved(nextSaved);
    if (isFirebaseConfigured) {
      await updateUserSavedInDb(user.uid, nextSaved);
    }
  }

  async function handleSaveResource(item: Resource) {
    if (isFirebaseConfigured) {
      await saveResourceToDb(item);
    } else {
      setResources((curr) => [item, ...curr.filter((r) => r.id !== item.id)]);
    }
  }

  async function handleApproveResource(id: string) {
    if (isFirebaseConfigured) {
      await approveResourceInDb(id);
    } else {
      setResources((curr) =>
        curr.map((r) => (r.id === id ? { ...r, status: "approved" } : r)),
      );
    }
  }

  async function handleDeleteResource(id: string) {
    if (isFirebaseConfigured) {
      await deleteResourceFromDb(id);
    } else {
      setResources((curr) => curr.filter((r) => r.id !== id));
    }
  }

  async function handleSaveTheory(item: TheoryModule) {
    if (isFirebaseConfigured) {
      await saveTheoryToDb(item);
    } else {
      setTheoryModules((curr) => [item, ...curr.filter((m) => m.id !== item.id)]);
    }
  }

  async function handleDeleteTheory(id: string) {
    if (isFirebaseConfigured) {
      await deleteTheoryFromDb(id);
    } else {
      setTheoryModules((curr) => curr.filter((m) => m.id !== id));
    }
  }

  async function handleSeedFirestore() {
    if (!isFirebaseConfigured) {
      alert("Vui lòng điền thông tin Firebase vào file .env trước.");
      return;
    }
    await seedInitialDataToFirestore();
  }

  async function handleLogout() {
    if (isFirebaseConfigured) {
      await signOut(auth);
    }
    setUser(null);
    if (location.pathname === "/admin") {
      handleNavigate("/");
    }
  }

  async function handlePostQuestion(newPost: Discussion) {
    if (isFirebaseConfigured) {
      await createDiscussionInDb(newPost);
    } else {
      setForumThreads((curr) => [newPost, ...curr]);
    }
    setIsAskOpen(false);
    setActiveThreadId(newPost.id);
  }

  async function handleAddComment(threadId: string, content: string) {
    if (!user) return;
    const target = forumThreads.find((t) => t.id === threadId);
    if (!target) return;

    const newComment = {
      id: String(Date.now()),
      author: user.name,
      initials: user.initials,
      color: "avatar-mint",
      content,
      createdAt: "Vừa xong",
      upvotes: 1,
      upvotedBy: [user.name],
    };

    const updatedComments = [...target.comments, newComment];
    if (isFirebaseConfigured) {
      await updateDiscussionCommentsInDb(threadId, updatedComments);
    } else {
      setForumThreads((curr) =>
        curr.map((t) => (t.id === threadId ? { ...t, comments: updatedComments } : t)),
      );
    }
  }

  async function handleToggleUpvoteThread(threadId: string) {
    if (!user) return;
    const target = forumThreads.find((t) => t.id === threadId);
    if (!target) return;

    const upvotedBy = target.upvotedBy ?? [];
    const hasUpvoted = upvotedBy.includes(user.name);
    const currentCount = target.upvotes ?? 0;
    const nextUpvotes = hasUpvoted ? Math.max(0, currentCount - 1) : currentCount + 1;
    const nextUpvotedBy = hasUpvoted
      ? upvotedBy.filter((name) => name !== user.name)
      : [...upvotedBy, user.name];

    if (isFirebaseConfigured) {
      await updateDiscussionUpvoteInDb(threadId, nextUpvotes, nextUpvotedBy);
    } else {
      setForumThreads((curr) =>
        curr.map((t) =>
          t.id === threadId ? { ...t, upvotes: nextUpvotes, upvotedBy: nextUpvotedBy } : t,
        ),
      );
    }
  }

  async function handleToggleUpvoteComment(threadId: string, commentId: string) {
    if (!user) return;
    const target = forumThreads.find((t) => t.id === threadId);
    if (!target) return;

    const updatedComments = target.comments.map((c) => {
      if (c.id !== commentId) return c;
      const upvotedBy = c.upvotedBy ?? [];
      const hasUpvoted = upvotedBy.includes(user.name);
      const currentCount = c.upvotes ?? 0;

      return {
        ...c,
        upvotes: hasUpvoted ? Math.max(0, currentCount - 1) : currentCount + 1,
        upvotedBy: hasUpvoted
          ? upvotedBy.filter((name) => name !== user.name)
          : [...upvotedBy, user.name],
      };
    });

    if (isFirebaseConfigured) {
      await updateDiscussionCommentsInDb(threadId, updatedComments);
    } else {
      setForumThreads((curr) =>
        curr.map((t) => (t.id === threadId ? { ...t, comments: updatedComments } : t)),
      );
    }
  }

  return (
    <div id="top" className="site-shell">
      {!isFirebaseConfigured && (
        <div className="firebase-setup-banner">
          Chế độ xem trước cục bộ: Hãy điền cấu hình Firebase vào file <code>.env</code> để kích
          hoạt đăng nhập thật & lưu trữ đám mây.
        </div>
      )}

      <Header
        currentPath={location.pathname}
        onNavigate={handleNavigate}
        user={user}
        savedCount={saved.length}
        pendingCount={pendingCount}
        onOpenSaved={handleOpenSaved}
        onOpenContribute={handleOpenContribute}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              user={user}
              resources={resources}
              loading={loadingData}
              onSelectResource={(item) => handleNavigate(`/tai-lieu/${item.id}`)}
              savedIds={saved}
              onToggleSaved={toggleSaved}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenContribute={handleOpenContribute}
              onNavigateForum={() => handleNavigate("/dien-dan")}
            />
          }
        />
        <Route
          path="/tai-lieu/:id"
          element={
            <ArticleDetailPage
              type="resource"
              resources={resources}
              theoryModules={theoryModules}
              loading={loadingData}
              savedIds={saved}
              onToggleSave={toggleSaved}
            />
          }
        />
        <Route
          path="/ly-thuyet"
          element={
            <TheoryPage
              modules={theoryModules}
              onOpenModule={(mod) => handleNavigate(`/ly-thuyet/${mod.id}`)}
            />
          }
        />
        <Route
          path="/ly-thuyet/:id"
          element={
            <ArticleDetailPage
              type="theory"
              resources={resources}
              theoryModules={theoryModules}
              loading={loadingData}
              savedIds={saved}
              onToggleSave={toggleSaved}
            />
          }
        />
        <Route
          path="/dien-dan"
          element={
            <ForumPage
              user={user}
              threads={forumThreads}
              onOpenAskModal={() => setIsAskOpen(true)}
              onOpenThread={(t) => setActiveThreadId(t.id)}
              onToggleUpvoteThread={handleToggleUpvoteThread}
              onRequestAuth={() => setIsAuthOpen(true)}
            />
          }
        />
        <Route
          path="/cong-cu"
          element={<ToolsPage user={user} onOpenAuth={() => setIsAuthOpen(true)} />}
        />
        <Route
          path="/cong-cu/:toolId"
          element={<ToolsPage user={user} onOpenAuth={() => setIsAuthOpen(true)} />}
        />
        <Route
          path="/admin"
          element={
            <AdminPage
              user={user}
              resources={resources}
              theoryModules={theoryModules}
              onSaveResource={handleSaveResource}
              onApproveResource={handleApproveResource}
              onDeleteResource={handleDeleteResource}
              onSaveTheory={handleSaveTheory}
              onDeleteTheory={handleDeleteTheory}
              onPreviewResource={(item) => handleNavigate(`/tai-lieu/${item.id}`)}
              onPreviewTheory={(mod) => handleNavigate(`/ly-thuyet/${mod.id}`)}
              onSeedFirestore={handleSeedFirestore}
              onOpenAuth={() => setIsAuthOpen(true)}
              onNavigateHome={() => handleNavigate("/")}
            />
          }
        />
        <Route path="*" element={<NotFoundPage onNavigate={handleNavigate} />} />
      </Routes>

      <Footer onNavigate={handleNavigate} onOpenContribute={handleOpenContribute} />

      {isAuthOpen && <AuthModal onClose={() => setIsAuthOpen(false)} />}
      {isContributeOpen && user && (
        <ContributeModal
          user={user}
          onClose={() => setIsContributeOpen(false)}
          onSubmitResource={handleSaveResource}
        />
      )}
      {isAskOpen && (
        <AskModal user={user} onClose={() => setIsAskOpen(false)} onSubmit={handlePostQuestion} />
      )}
      {activeThread && (
        <ThreadModal
          user={user}
          thread={activeThread}
          allThreads={forumThreads}
          onClose={() => setActiveThreadId(null)}
          onAddComment={handleAddComment}
          onToggleUpvoteThread={handleToggleUpvoteThread}
          onToggleUpvoteComment={handleToggleUpvoteComment}
          onSelectThread={(t) => setActiveThreadId(t.id)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}
    </div>
  );
}