import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { generateToolContent } from "../lib/aiToolGenerator";
import { isFirebaseConfigured } from "../lib/firebase";
import {
  deleteToolDeckFromDb,
  getToolDeckById,
  saveToolDeckToDb,
  subscribeUserToolDecks,
} from "../lib/firestoreService";
import { ToolDeck, ToolId, ToolItem, User } from "../types";
import { AppButton } from "./AppButton";
import { Icon } from "./Icon";

const toolPresets: Record<
  ToolId,
  {
    defaultTitle: string;
    inputLabel: string;
    helperText: string;
    sampleInput: string;
  }
> = {
  gameshow: {
    defaultTitle: "English Grammar Showdown — Unit 4",
    inputLabel: "Danh sách câu hỏi (Câu hỏi | Đáp án A | B | C | Đáp án đúng)",
    helperText: "Mỗi dòng 1 câu hỏi, ngăn cách bằng dấu gạch đứng (|). Đáp án đúng ghi A, B hoặc C.",
    sampleInput:
      'What is the past simple form of "go"? | went | goed | gone | A\n' +
      "Which word is an adjective? | quickly | beautiful | happiness | B\n" +
      "Choose the correct sentence: | She don't like milk. | She doesn't likes milk. | She doesn't like milk. | C\n" +
      '"Apple, Banana, Mango" belong to which group? | Fruits | Vegetables | Drinks | A',
  },
  wheel: {
    defaultTitle: "Vocabulary Wheel — Fruits & Food",
    inputLabel: "Danh sách từ vựng hoặc tên học sinh (mỗi dòng 1 mục)",
    helperText: "Vòng quay sẽ tự động chia ô theo số lượng từ bạn nhập bên dưới.",
    sampleInput: "Apple\nWatermelon\nStrawberry\nPineapple\nAvocado\nMango\nSandwich\nLemonade",
  },
  bingo: {
    defaultTitle: "Classroom Vocabulary Bingo",
    inputLabel: "Danh sách từ vựng Bingo (mỗi dòng 1 từ hoặc cách nhau bởi dấu phẩy)",
    helperText: "Nhập tối thiểu 9 từ (lưới 3×3) hoặc 16 từ (lưới 4×4) để tạo thẻ ngẫu nhiên.",
    sampleInput:
      "Teacher, Student, Whiteboard, Notebook, Pencil, Backpack, Library, Homework, Classroom, Dictionary, Eraser, Ruler, Scissors, Marker, Globe, Calendar",
  },
  quiz: {
    defaultTitle: "Quick Check Quiz — Present Simple",
    inputLabel: "Bộ câu hỏi trắc nghiệm nhanh (Câu hỏi | A | B | C | Đáp án đúng)",
    helperText: "Trình chiếu trực tiếp lên bảng để cả lớp chọn nhanh đáp án.",
    sampleInput:
      "My brother _____ to school by bike every day. | go | goes | going | B\n" +
      "_____ they play football on Sundays? | Do | Does | Are | A\n" +
      "Water _____ at 100 degrees Celsius. | boil | boiling | boils | C",
  },
  scramble: {
    defaultTitle: "Word Scramble Warm-up",
    inputLabel: "Danh sách từ xáo trộn (TỪ KHÓA | Gợi ý tiếng Anh)",
    helperText: "Hệ thống tự động đảo lộn chữ cái để học sinh đoán từ gốc.",
    sampleInput:
      "ELEPHANT | A very large gray animal with a long trunk\n" +
      "BUTTERFLY | A colorful insect with big wings\n" +
      "ASTRONAUT | A person who travels into space\n" +
      "LIBRARY | A quiet place where you borrow books\n" +
      "BREAKFAST | The first meal of the day",
  },
  "exit-ticket": {
    defaultTitle: "Exit Ticket — Tổng kết cuối tiết học",
    inputLabel: "Các câu hỏi phản hồi cuối giờ (mỗi dòng 1 câu hỏi)",
    helperText: "Phát nhanh 2 phút cuối giờ để kiểm tra mức độ hiểu bài của học sinh.",
    sampleInput:
      "1. Ba từ vựng tiếng Anh mới em nhớ nhất trong tiết học hôm nay:\n" +
      "2. Một mẫu câu hoàn chỉnh em có thể tự đặt với từ vừa học:\n" +
      "3. Một điều em còn băn khoăn hoặc muốn thầy/cô giải thích thêm:",
  },
  worksheet: {
    defaultTitle: "Practice Worksheet: Fill in the Blanks",
    inputLabel: "Nội dung bài tập điền từ (đặt từ cần đục lỗ trong dấu ngoặc vuông [ ])",
    helperText:
      "Các từ nằm trong [ngoặc vuông] sẽ tự động trích xuất lên khung Word Bank và biến thành chỗ trống.",
    sampleInput:
      "She [goes] to school by bicycle every morning.\n" +
      "They are [playing] football in the schoolyard right now.\n" +
      "Yesterday, my family [visited] the history museum.\n" +
      "We should [protect] the environment by planting more trees.\n" +
      "What [time] do you usually have breakfast?",
  },
};

const wheelColors = [
  "#174d43",
  "#e86f3b",
  "#0284c7",
  "#d97706",
  "#2f6f5e",
  "#c2410c",
  "#0369a1",
  "#b45309",
];

function scrambleWord(word: string, seed: number): string {
  const letters = word.trim().toUpperCase().split("");
  if (letters.length <= 1) return letters.join("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = (i * 7 + seed * 13 + letters.length) % (i + 1);
    const temp = letters[i];
    letters[i] = letters[j];
    letters[j] = temp;
  }
  const result = letters.join("");
  return result === word.trim().toUpperCase() ? letters.reverse().join("") : result;
}

function formatToday(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function WorkspaceCreator({
  tool,
  user,
  onOpenAuth,
  onBack,
}: {
  tool: ToolItem;
  user: User | null;
  onOpenAuth: () => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const deckIdParam = searchParams.get("deck");

  const preset = toolPresets[tool.id];
  const [lessonTitle, setLessonTitle] = useState(preset.defaultTitle);
  const [rawInput, setRawInput] = useState(preset.sampleInput);

  // State lưu trữ Cloud & Chia sẻ link
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(deckIdParam);
  const [myDecks, setMyDecks] = useState<ToolDeck[]>([]);
  const [savingDeck, setSavingDeck] = useState(false);
  const [statusNotice, setStatusNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "warning">("success");
  const [copiedLink, setCopiedLink] = useState(false);

  // State Trợ lý tạo nội dung tự động theo chủ đề
  const [aiTopic, setAiTopic] = useState("");
  const [aiLevel, setAiLevel] = useState("Kids (Tiểu học)");
  const [generatingAi, setGeneratingAi] = useState(false);

  // State Chế độ trình chiếu toàn màn hình trên lớp
  const [isPresentationMode, setIsPresentationMode] = useState(false);

  // State cho Game Show & Quiz
  const [qIndex, setQIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // State cho Vòng quay từ vựng
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [pickedWord, setPickedWord] = useState<string | null>(null);
  const [hiddenWords, setHiddenWords] = useState<string[]>([]);

  // State cho Bingo Creator
  const [bingoSize, setBingoSize] = useState<3 | 4>(4);
  const [bingoSeed, setBingoSeed] = useState(1);
  const [markedCells, setMarkedCells] = useState<number[]>([]);

  // State cho Word Scramble
  const [scrambleSeed, setScrambleSeed] = useState(1);
  const [revealedWords, setRevealedWords] = useState<number[]>([]);

  // State cho Worksheet Maker
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  const resetPlayStates = () => {
    setQIndex(0);
    setSelectedChoice(null);
    setScore(0);
    setQuizFinished(false);
    setPickedWord(null);
    setHiddenWords([]);
    setMarkedCells([]);
    setRevealedWords([]);
    setShowAnswerKey(false);
  };

  useEffect(() => {
    if (!isPresentationMode) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsPresentationMode(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPresentationMode]);

  useEffect(() => {
    if (!user || !isFirebaseConfigured) {
      setMyDecks([]);
      return;
    }
    const unsub = subscribeUserToolDecks(user.uid, tool.id, (decks) => {
      setMyDecks(decks);
    });
    return () => unsub();
  }, [user, tool.id]);

  useEffect(() => {
    if (!deckIdParam || !isFirebaseConfigured) return;

    let cancelled = false;
    getToolDeckById(deckIdParam)
      .then((deck) => {
        if (cancelled || !deck) return;
        if (deck.toolId !== tool.id) {
          navigate(`/cong-cu/${deck.toolId}?deck=${deck.id}`, { replace: true });
          return;
        }
        setCurrentDeckId(deck.id);
        setLessonTitle(deck.title);
        setRawInput(deck.rawInput);
        if (deck.bingoSize === 3 || deck.bingoSize === 4) {
          setBingoSize(deck.bingoSize);
        }
        resetPlayStates();
        setNoticeType("success");
        setStatusNotice(`Đang mở bộ nội dung: "${deck.title}" (tác giả: ${deck.ownerName})`);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [deckIdParam, tool.id, navigate]);

  const handleResetSample = () => {
    setCurrentDeckId(null);
    setLessonTitle(preset.defaultTitle);
    setRawInput(preset.sampleInput);
    resetPlayStates();
    setStatusNotice("");
    if (deckIdParam) {
      searchParams.delete("deck");
      setSearchParams(searchParams, { replace: true });
    }
  };

  // Tạo nội dung tự động từ chủ đề
  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      alert("Thầy cô hãy nhập chủ đề bài học (VD: Body parts, Food & Drink...) trước nhé!");
      return;
    }
    setGeneratingAi(true);
    try {
      const result = await generateToolContent(tool.id, aiTopic, aiLevel);
      setCurrentDeckId(null);
      setLessonTitle(result.title);
      setRawInput(result.rawInput);
      resetPlayStates();

      if (result.source === "gemini") {
        setNoticeType("success");
        setStatusNotice(`✨ Gemini AI đã tạo xong bộ câu hỏi thật cho chủ đề "${aiTopic.trim()}"!`);
      } else {
        setNoticeType("warning");
        setStatusNotice(
          `⚠️ Đang dùng mẫu có sẵn cho "${aiTopic.trim()}". ${result.warning || ""}`,
        );
      }
    } finally {
      setGeneratingAi(false);
    }
  };

  // Lưu bộ nội dung lên Firestore
  const handleSaveDeck = async (): Promise<string | null> => {
    if (!user) {
      onOpenAuth();
      return null;
    }
    if (!isFirebaseConfigured) {
      alert("Vui lòng cấu hình Firebase trong file .env để lưu bộ nội dung.");
      return null;
    }

    setSavingDeck(true);
    try {
      const deckId = currentDeckId || `${tool.id}_${Date.now()}`;
      const payload: ToolDeck = {
        id: deckId,
        ownerUid: user.uid,
        ownerName: user.name,
        toolId: tool.id,
        title: lessonTitle.trim() || preset.defaultTitle,
        rawInput,
        bingoSize: tool.id === "bingo" ? bingoSize : undefined,
        updatedAt: formatToday(),
        updatedAtMs: Date.now(),
      };
      await saveToolDeckToDb(payload);
      setCurrentDeckId(deckId);
      setSearchParams({ deck: deckId }, { replace: true });
      setNoticeType("success");
      setStatusNotice(`✓ Đã lưu "${payload.title}" vào tài khoản của thầy cô!`);
      return deckId;
    } catch {
      alert("Không thể lưu bộ nội dung. Vui lòng kiểm tra Firestore Rules cho collection toolDecks.");
      return null;
    } finally {
      setSavingDeck(false);
    }
  };

  const handleCopyClassroomLink = async () => {
    let targetDeckId = currentDeckId;
    if (!targetDeckId) {
      if (!user) {
        onOpenAuth();
        return;
      }
      targetDeckId = await handleSaveDeck();
    }
    if (!targetDeckId) return;

    const shareUrl = `${window.location.origin}/cong-cu/${tool.id}?deck=${targetDeckId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2600);
    } catch {
      alert(`Link trình chiếu của thầy cô: ${shareUrl}`);
    }
  };

  const handleLoadDeck = (deck: ToolDeck) => {
    setCurrentDeckId(deck.id);
    setLessonTitle(deck.title);
    setRawInput(deck.rawInput);
    if (deck.bingoSize === 3 || deck.bingoSize === 4) {
      setBingoSize(deck.bingoSize);
    }
    resetPlayStates();
    setSearchParams({ deck: deck.id }, { replace: true });
    setNoticeType("success");
    setStatusNotice(`Đã nạp bộ nội dung "${deck.title}".`);
  };

  const parsedQuestions = useMemo(() => {
    return rawInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((p) => p.trim());
        const answerLetter = (parts[4] || "A").toUpperCase();
        return {
          question: parts[0] || "Câu hỏi mẫu?",
          options: [
            { key: "A", text: parts[1] || "Đáp án A" },
            { key: "B", text: parts[2] || "Đáp án B" },
            { key: "C", text: parts[3] || "Đáp án C" },
          ],
          correct: ["A", "B", "C"].includes(answerLetter) ? answerLetter : "A",
        };
      });
  }, [rawInput]);

  const wheelItems = useMemo(() => {
    const items = rawInput
      .split("\n")
      .map((line) => line.trim())
      .filter((item) => item.length > 0 && !hiddenWords.includes(item));
    return items.length > 0 ? items : ["Nhập từ vựng bên trái"];
  }, [rawInput, hiddenWords]);

  const bingoCells = useMemo(() => {
    const words = rawInput
      .split(/[\n,]+/)
      .map((w) => w.trim())
      .filter(Boolean);
    const total = bingoSize * bingoSize;
    const pool = words.length > 0 ? [...words] : ["ELT Hub"];
    while (pool.length < total) {
      pool.push(words[pool.length % Math.max(1, words.length)] || `Word ${pool.length + 1}`);
    }
    const sliced = pool.slice(0, total);
    for (let i = sliced.length - 1; i > 0; i--) {
      const j = (i * 11 + bingoSeed * 17) % (i + 1);
      const temp = sliced[i];
      sliced[i] = sliced[j];
      sliced[j] = temp;
    }
    return sliced;
  }, [rawInput, bingoSize, bingoSeed]);

  const scrambleItems = useMemo(() => {
    return rawInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [wordPart, hintPart] = line.split("|").map((p) => p.trim());
        const cleanWord = (wordPart || "ENGLISH").toUpperCase();
        return {
          original: cleanWord,
          scrambled: scrambleWord(cleanWord, scrambleSeed),
          hint: hintPart || "Sắp xếp lại các chữ cái thành từ đúng",
        };
      });
  }, [rawInput, scrambleSeed]);

  const exitPrompts = useMemo(() => {
    const lines = rawInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.length > 0 ? lines : ["1. Điều em tâm đắc nhất trong bài học hôm nay:"];
  }, [rawInput]);

  const worksheetData = useMemo(() => {
    const lines = rawInput
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const extractedAnswers: string[] = [];

    const sentences = lines.map((line) => {
      const match = line.match(/\[([^\]]+)\]/);
      const answer = match ? match[1].trim() : "";
      if (answer) extractedAnswers.push(answer);
      const blanked = match ? line.replace(/\[([^\]]+)\]/, "______________") : line;
      return { blanked, answer, original: line.replace(/\[|\]/g, "") };
    });

    const wordBank = [...extractedAnswers].sort((a, b) => a.localeCompare(b));
    return { sentences, wordBank };
  }, [rawInput]);

  const handleSpinWheel = () => {
    if (spinning || wheelItems.length === 0) return;
    setSpinning(true);
    setPickedWord(null);

    const sliceAngle = 360 / wheelItems.length;
    const randomExtra = Math.floor(Math.random() * 360);
    const nextRotation = rotation + 1440 + randomExtra;
    setRotation(nextRotation);

    window.setTimeout(() => {
      const normalized = ((nextRotation % 360) + 360) % 360;
      const pointerAngle = (360 - normalized) % 360;
      const chosenIndex = Math.floor(pointerAngle / sliceAngle) % wheelItems.length;
      setPickedWord(wheelItems[chosenIndex]);
      setSpinning(false);
    }, 3100);
  };

  return (
    <main className="workspace-page">
      <div className="workspace-container">
        <div className="workspace-topbar">
          <button type="button" className="article-back-btn" onClick={onBack}>
            ← Quay lại kho công cụ
          </button>
          <div className="workspace-topbar-actions">
            <button type="button" className="workspace-ghost-btn" onClick={handleResetSample}>
              Nạp mẫu gốc
            </button>
            <button
              type="button"
              className="workspace-ghost-btn"
              disabled={savingDeck}
              onClick={handleSaveDeck}
            >
              {savingDeck
                ? "Đang lưu..."
                : currentDeckId
                  ? "💾 Cập nhật bộ đã lưu"
                  : "💾 Lưu bộ câu hỏi"}
            </button>
            <button
              type="button"
              className="workspace-ghost-btn"
              onClick={handleCopyClassroomLink}
            >
              {copiedLink ? "✓ Đã sao chép link!" : "🔗 Link trình chiếu lớp"}
            </button>
            <AppButton className="join-button" onClick={() => window.print()}>
              In / Xuất PDF <Icon name="download" size={16} />
            </AppButton>
          </div>
        </div>

        {statusNotice && (
          <div
            className={
              noticeType === "warning" ? "admin-warning-banner" : "admin-success-banner"
            }
            style={{ marginBottom: "18px" }}
          >
            <span>{statusNotice}</span>
            <button type="button" onClick={() => setStatusNotice("")}>
              Đóng
            </button>
          </div>
        )}

        <div className="workspace-split">
          <div className="workspace-left">
            <div className="workspace-info-card">
              <div className="workspace-info-head">
                <span className={`workspace-badge ${tool.themeClass}`}>{tool.badge}</span>
                <div>
                  <span className="section-kicker" style={{ marginBottom: "2px" }}>
                    {tool.title}
                  </span>
                  <input
                    type="text"
                    value={lessonTitle}
                    onChange={(event) => setLessonTitle(event.target.value)}
                    className="workspace-title-input"
                    aria-label="Tên bài tập hoặc trò chơi"
                    placeholder="Nhập tiêu đề bài giảng..."
                  />
                </div>
              </div>
              <p className="workspace-info-desc">{tool.description}</p>
            </div>

            <div className="workspace-ai-card">
              <div className="workspace-ai-head">
                <Icon name="sparkle" size={16} />
                <strong>Trợ lý tạo nội dung tự động theo chủ đề</strong>
              </div>
              <div className="workspace-ai-row">
                <input
                  type="text"
                  value={aiTopic}
                  onChange={(event) => setAiTopic(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleAiGenerate();
                    }
                  }}
                  placeholder="VD: Body parts, Travel & Holidays, Past Simple..."
                  className="admin-input"
                />
                <select
                  value={aiLevel}
                  onChange={(event) => setAiLevel(event.target.value)}
                  className="admin-input workspace-ai-select"
                  aria-label="Chọn cấp độ học sinh"
                >
                  <option value="Kids (Tiểu học)">Kids (Tiểu học)</option>
                  <option value="Teens (THCS / THPT)">Teens (THCS/THPT)</option>
                  <option value="Giao tiếp tổng quát">Giao tiếp</option>
                </select>
                <button
                  type="button"
                  className="workspace-ai-btn"
                  disabled={generatingAi}
                  onClick={handleAiGenerate}
                >
                  {generatingAi ? "Đang tạo..." : "✨ Tạo tự động"}
                </button>
              </div>
            </div>

            <div className="workspace-input-card">
              <div className="workspace-input-header">
                <label htmlFor="workspace-data-input">{preset.inputLabel}</label>
              </div>
              <p className="workspace-helper">{preset.helperText}</p>

              {tool.id === "bingo" && (
                <div className="workspace-subcontrols">
                  <span>Kích thước thẻ:</span>
                  <button
                    type="button"
                    className={`filter-chip ${bingoSize === 3 ? "active" : ""}`}
                    onClick={() => {
                      setBingoSize(3);
                      setMarkedCells([]);
                    }}
                  >
                    3 × 3 (9 ô)
                  </button>
                  <button
                    type="button"
                    className={`filter-chip ${bingoSize === 4 ? "active" : ""}`}
                    onClick={() => {
                      setBingoSize(4);
                      setMarkedCells([]);
                    }}
                  >
                    4 × 4 (16 ô)
                  </button>
                </div>
              )}

              <textarea
                id="workspace-data-input"
                className="workspace-textarea"
                value={rawInput}
                onChange={(event) => {
                  setRawInput(event.target.value);
                  setQIndex(0);
                  setSelectedChoice(null);
                  setQuizFinished(false);
                }}
                rows={9}
              />
            </div>

            <div className="workspace-saved-card">
              <div className="workspace-saved-head">
                <strong>Bộ nội dung đã lưu của tôi ({myDecks.length})</strong>
                {!user && (
                  <button type="button" onClick={onOpenAuth}>
                    Đăng nhập để lưu →
                  </button>
                )}
              </div>

              {user ? (
                myDecks.length > 0 ? (
                  <div className="workspace-saved-list">
                    {myDecks.map((deck) => (
                      <div
                        key={deck.id}
                        className={`workspace-saved-item ${currentDeckId === deck.id ? "active" : ""}`}
                      >
                        <button
                          type="button"
                          className="saved-deck-title"
                          onClick={() => handleLoadDeck(deck)}
                        >
                          <strong>{deck.title}</strong>
                          <small>Cập nhật: {deck.updatedAt}</small>
                        </button>
                        <button
                          type="button"
                          className="saved-deck-del"
                          title="Xóa bộ này"
                          onClick={async () => {
                            if (window.confirm(`Xóa bộ nội dung "${deck.title}"?`)) {
                              await deleteToolDeckFromDb(deck.id);
                              if (currentDeckId === deck.id) setCurrentDeckId(null);
                            }
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="workspace-saved-empty">
                    Thầy cô chưa lưu bộ nào cho công cụ này. Hãy soạn nội dung rồi bấm{" "}
                    <strong>“💾 Lưu bộ câu hỏi”</strong> phía trên.
                  </p>
                )
              ) : (
                <p className="workspace-saved-empty">
                  Đăng nhập tài khoản giáo viên để lưu trữ bộ đề trên đám mây và tạo link trình
                  chiếu nhanh cho lớp học.
                </p>
              )}
            </div>
          </div>

          <div className="workspace-right">
            <div className={`preview-canvas ${isPresentationMode ? "is-fullscreen-stage" : ""}`}>
              <div className="preview-bar">
                <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                  <span className="preview-live-dot">
                    <i /> {isPresentationMode ? "TRÌNH CHIẾU LỚP HỌC" : "LIVE PREVIEW"}
                  </span>
                  <strong>{lessonTitle || tool.title}</strong>
                </div>
                <button
                  type="button"
                  className="workspace-ghost-btn"
                  onClick={() => setIsPresentationMode((v) => !v)}
                >
                  {isPresentationMode ? "✕ Thoát toàn màn hình (Esc)" : "⛶ Trình chiếu lớp học"}
                </button>
              </div>

              {(tool.id === "gameshow" || tool.id === "quiz") && (
                <div className={`preview-quiz-stage ${tool.id === "gameshow" ? "is-gameshow" : ""}`}>
                  {parsedQuestions.length === 0 ? (
                    <p className="preview-empty">Hãy nhập ít nhất 1 câu hỏi ở khung bên trái.</p>
                  ) : quizFinished ? (
                    <div className="quiz-result-box">
                      <span className="quiz-trophy">★</span>
                      <h3>Hoàn thành phần thi!</h3>
                      <p>
                        Tổng điểm đạt được:{" "}
                        <strong>
                          {score} / {parsedQuestions.length * 10} điểm
                        </strong>
                      </p>
                      <AppButton
                        className="join-button"
                        onClick={() => {
                          setQIndex(0);
                          setScore(0);
                          setSelectedChoice(null);
                          setQuizFinished(false);
                        }}
                      >
                        Chơi lại từ đầu
                      </AppButton>
                    </div>
                  ) : (
                    (() => {
                      const safeIndex = Math.min(qIndex, parsedQuestions.length - 1);
                      const currentQ = parsedQuestions[safeIndex];
                      return (
                        <div className="quiz-live-card">
                          <div className="quiz-status-row">
                            <span>
                              Câu hỏi {safeIndex + 1} / {parsedQuestions.length}
                            </span>
                            <span className="quiz-score-pill">Điểm lớp: {score}</span>
                          </div>

                          <h3 className="quiz-question-text">{currentQ.question}</h3>

                          <div className="quiz-options-grid">
                            {currentQ.options.map((opt) => {
                              const isPicked = selectedChoice === opt.key;
                              const isCorrect = currentQ.correct === opt.key;
                              let stateClass = "";
                              if (selectedChoice) {
                                if (isCorrect) stateClass = "correct";
                                else if (isPicked) stateClass = "wrong";
                              }

                              return (
                                <button
                                  key={opt.key}
                                  type="button"
                                  className={`quiz-option-btn ${stateClass}`}
                                  disabled={selectedChoice !== null}
                                  onClick={() => {
                                    setSelectedChoice(opt.key);
                                    if (opt.key === currentQ.correct) {
                                      setScore((s) => s + 10);
                                    }
                                  }}
                                >
                                  <span className="opt-letter">{opt.key}</span>
                                  <span>{opt.text}</span>
                                </button>
                              );
                            })}
                          </div>

                          {selectedChoice && (
                            <div className="quiz-feedback-footer">
                              <span>
                                {selectedChoice === currentQ.correct
                                  ? "Chính xác! +10 điểm cho cả lớp."
                                  : `Chưa đúng rồi! Đáp án đúng là ${currentQ.correct}.`}
                              </span>
                              <AppButton
                                className="join-button"
                                onClick={() => {
                                  if (safeIndex + 1 < parsedQuestions.length) {
                                    setQIndex(safeIndex + 1);
                                    setSelectedChoice(null);
                                  } else {
                                    setQuizFinished(true);
                                  }
                                }}
                              >
                                {safeIndex + 1 < parsedQuestions.length
                                  ? "Câu tiếp theo →"
                                  : "Xem tổng kết"}
                              </AppButton>
                            </div>
                          )}
                        </div>
                      );
                    })()
                  )}
                </div>
              )}

              {tool.id === "wheel" && (
                <div className="preview-wheel-stage">
                  <div className="wheel-wrapper">
                    <div className="wheel-pointer">▼</div>
                    <svg
                      viewBox="0 0 320 320"
                      className="wheel-svg"
                      style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: spinning
                          ? "transform 3.1s cubic-bezier(0.15, 0.85, 0.2, 1)"
                          : "none",
                      }}
                    >
                      {wheelItems.map((label, idx) => {
                        const count = wheelItems.length;
                        const angle = 360 / count;
                        const startAngle = idx * angle - 90;
                        const endAngle = startAngle + angle;
                        const startRad = (startAngle * Math.PI) / 180;
                        const endRad = (endAngle * Math.PI) / 180;
                        const x1 = 160 + 150 * Math.cos(startRad);
                        const y1 = 160 + 150 * Math.sin(startRad);
                        const x2 = 160 + 150 * Math.cos(endRad);
                        const y2 = 160 + 150 * Math.sin(endRad);
                        const largeArc = angle > 180 ? 1 : 0;
                        const midAngle = startAngle + angle / 2;

                        return (
                          <g key={`${label}-${idx}`}>
                            <path
                              d={`M160,160 L${x1},${y1} A150,150 0 ${largeArc},1 ${x2},${y2} Z`}
                              fill={wheelColors[idx % wheelColors.length]}
                              stroke="#fffdf8"
                              strokeWidth="2"
                            />
                            <text
                              x="160"
                              y="160"
                              fill="#ffffff"
                              fontSize={count > 10 ? "11" : "13"}
                              fontWeight="700"
                              textAnchor="end"
                              dominantBaseline="middle"
                              transform={`rotate(${midAngle}, 160, 160) translate(136, 0)`}
                            >
                              {label.length > 14 ? `${label.slice(0, 13)}…` : label}
                            </text>
                          </g>
                        );
                      })}
                      <circle cx="160" cy="160" r="22" fill="#fffdf8" stroke="#15332e" strokeWidth="3" />
                    </svg>
                  </div>

                  <div className="wheel-controls">
                    <AppButton className="join-button" onClick={handleSpinWheel}>
                      {spinning ? "Đang quay..." : "QUAY NGAY!"}
                    </AppButton>
                    {hiddenWords.length > 0 && (
                      <button
                        type="button"
                        className="workspace-ghost-btn"
                        onClick={() => setHiddenWords([])}
                      >
                        Khôi phục {hiddenWords.length} từ đã ẩn
                      </button>
                    )}
                  </div>

                  {pickedWord && (
                    <div className="wheel-winner-banner">
                      <span>Từ được chọn:</span>
                      <strong>{pickedWord}</strong>
                      {wheelItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setHiddenWords((prev) => [...prev, pickedWord]);
                            setPickedWord(null);
                          }}
                        >
                          Ẩn từ này khỏi vòng quay
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {tool.id === "bingo" && (
                <div className="preview-sheet-stage">
                  <div className="bingo-sheet">
                    <div className="bingo-sheet-header">
                      <h3>BINGO: {lessonTitle}</h3>
                      <button
                        type="button"
                        className="workspace-ghost-btn"
                        onClick={() => {
                          setBingoSeed((s) => s + 1);
                          setMarkedCells([]);
                        }}
                      >
                        Trộn thẻ ngẫu nhiên
                      </button>
                    </div>

                    <div
                      className="bingo-grid"
                      style={{ gridTemplateColumns: `repeat(${bingoSize}, 1fr)` }}
                    >
                      {bingoCells.map((word, idx) => {
                        const isMarked = markedCells.includes(idx);
                        return (
                          <button
                            key={`${word}-${idx}`}
                            type="button"
                            className={`bingo-cell ${isMarked ? "marked" : ""}`}
                            onClick={() =>
                              setMarkedCells((prev) =>
                                prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
                              )
                            }
                          >
                            <span>{word}</span>
                            {isMarked && <small>✓ Đã gọi</small>}
                          </button>
                        );
                      })}
                    </div>
                    <p className="sheet-footnote">
                      Mẹo trên lớp: Bấm vào từng ô để đánh dấu từ vựng giáo viên vừa đọc to.
                    </p>
                  </div>
                </div>
              )}

              {tool.id === "scramble" && (
                <div className="preview-sheet-stage">
                  <div className="scramble-toolbar">
                    <span>Click vào từng từ để kiểm tra đáp án</span>
                    <button
                      type="button"
                      className="workspace-ghost-btn"
                      onClick={() => {
                        setScrambleSeed((s) => s + 1);
                        setRevealedWords([]);
                      }}
                    >
                      Xáo trộn lại chữ cái
                    </button>
                  </div>

                  <div className="scramble-list">
                    {scrambleItems.map((item, idx) => {
                      const isRevealed = revealedWords.includes(idx);
                      return (
                        <div key={`${item.original}-${idx}`} className="scramble-card">
                          <div className="scramble-tiles">
                            {(isRevealed ? item.original : item.scrambled)
                              .split("")
                              .map((char, cIdx) => (
                                <span
                                  key={cIdx}
                                  className={`letter-tile ${isRevealed ? "revealed" : ""}`}
                                >
                                  {char}
                                </span>
                              ))}
                          </div>
                          <p className="scramble-hint">Gợi ý: {item.hint}</p>
                          <button
                            type="button"
                            className="text-action"
                            onClick={() =>
                              setRevealedWords((prev) =>
                                prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx],
                              )
                            }
                          >
                            {isRevealed ? "Ẩn đáp án" : "Hiện đáp án"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {tool.id === "exit-ticket" && (
                <div className="preview-sheet-stage">
                  <div className="a4-sheet exit-ticket-sheet">
                    <div className="sheet-top-meta">
                      <span>ELT HUB · EXIT TICKET</span>
                      <span>Thời gian: 2 phút cuối giờ</span>
                    </div>
                    <h3>{lessonTitle}</h3>
                    <div className="student-info-line">
                      <span>Họ và tên: ........................................</span>
                      <span>Lớp: ................</span>
                    </div>

                    <div className="exit-prompts-list">
                      {exitPrompts.map((prompt, idx) => (
                        <div key={idx} className="exit-prompt-item">
                          <label>{prompt}</label>
                          <input
                            type="text"
                            placeholder="Học sinh điền nhanh câu trả lời tại đây..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {tool.id === "worksheet" && (
                <div className="preview-sheet-stage">
                  <div className="a4-sheet">
                    <div className="sheet-top-meta">
                      <span>ELT HUB · PRINTABLE WORKSHEET</span>
                      <button
                        type="button"
                        className="workspace-ghost-btn"
                        onClick={() => setShowAnswerKey((v) => !v)}
                      >
                        {showAnswerKey ? "Ẩn đáp án (Answer Key)" : "Hiện đáp án (Answer Key)"}
                      </button>
                    </div>
                    <h3>{lessonTitle}</h3>
                    <div className="student-info-line">
                      <span>Name: ..............................................</span>
                      <span>Class: ................</span>
                    </div>

                    {worksheetData.wordBank.length > 0 && (
                      <div className="word-bank-box">
                        <strong>WORD BANK:</strong>
                        <div className="word-bank-pills">
                          {worksheetData.wordBank.map((word, idx) => (
                            <span key={`${word}-${idx}`}>{word}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    <ol className="worksheet-questions">
                      {worksheetData.sentences.map((item, idx) => (
                        <li key={idx}>
                          {showAnswerKey ? (
                            <span>
                              {item.original}{" "}
                              {item.answer && (
                                <strong className="answer-highlight">[{item.answer}]</strong>
                              )}
                            </span>
                          ) : (
                            item.blanked
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}