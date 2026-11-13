import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { initialDiscussions, initialResources, initialTheoryModules } from "../data/mockData";
import { Comment, Discussion, Resource, TheoryModule, ToolDeck, ToolId } from "../types";
import { db } from "./firebase";

function cleanData<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// 1. Lắng nghe thời gian thực danh sách Tài liệu Trang chủ
export function subscribeResources(
  onData: (items: Resource[]) => void,
  onError?: (err: Error) => void,
) {
  return onSnapshot(
    collection(db, "resources"),
    (snapshot) => {
      const list: Resource[] = snapshot.docs.map((d) => ({
        ...(d.data() as Omit<Resource, "id">),
        id: d.id,
      }));
      list.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
      onData(list);
    },
    (error) => onError?.(error),
  );
}

// 2. Lắng nghe thời gian thực danh sách Module Lý thuyết
export function subscribeTheoryModules(
  onData: (items: TheoryModule[]) => void,
  onError?: (err: Error) => void,
) {
  return onSnapshot(
    collection(db, "theoryModules"),
    (snapshot) => {
      const list: TheoryModule[] = snapshot.docs.map((d) => ({
        ...(d.data() as Omit<TheoryModule, "id">),
        id: d.id,
      }));
      list.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
      onData(list);
    },
    (error) => onError?.(error),
  );
}

// 3. Lắng nghe thời gian thực danh sách Thảo luận Diễn đàn
export function subscribeDiscussions(
  onData: (items: Discussion[]) => void,
  onError?: (err: Error) => void,
) {
  return onSnapshot(
    collection(db, "discussions"),
    (snapshot) => {
      const list: Discussion[] = snapshot.docs.map((d) => ({
        ...(d.data() as Omit<Discussion, "id">),
        id: d.id,
      }));
      list.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0));
      onData(list);
    },
    (error) => onError?.(error),
  );
}

// 4. Lắng nghe danh sách tài liệu đã lưu của người dùng
export function subscribeUserSaved(uid: string, onData: (savedIds: string[]) => void) {
  return onSnapshot(doc(db, "userProfiles", uid), (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      onData(Array.isArray(data.savedIds) ? data.savedIds : []);
    } else {
      onData([]);
    }
  });
}

export async function updateUserSavedInDb(uid: string, savedIds: string[]) {
  await setDoc(doc(db, "userProfiles", uid), { savedIds }, { merge: true });
}

// 5. Thêm / Cập nhật / Duyệt / Xóa Tài liệu
export async function saveResourceToDb(item: Resource) {
  const payload = cleanData({
    ...item,
    status: item.status || "approved",
    createdAtMs: item.createdAtMs || Date.now(),
  });
  await setDoc(doc(db, "resources", item.id), payload);
}

export async function approveResourceInDb(id: string) {
  await updateDoc(doc(db, "resources", id), {
    status: "approved",
  });
}

export async function incrementResourceDownloadInDb(id: string) {
  try {
    await updateDoc(doc(db, "resources", id), {
      downloadCount: increment(1),
    });
  } catch {
    // Bỏ qua nếu bản ghi chưa tồn tại trên Firestore
  }
}

export async function deleteResourceFromDb(id: string) {
  await deleteDoc(doc(db, "resources", id));
}

// 6. Thêm / Cập nhật / Xóa Module Lý thuyết
export async function saveTheoryToDb(item: TheoryModule) {
  const payload = cleanData({
    ...item,
    createdAtMs: item.createdAtMs || Date.now(),
  });
  await setDoc(doc(db, "theoryModules", item.id), payload);
}

export async function deleteTheoryFromDb(id: string) {
  await deleteDoc(doc(db, "theoryModules", id));
}

// 7. Thao tác Diễn đàn (Tạo bài, Bình luận, Upvote)
export async function createDiscussionInDb(post: Discussion) {
  const payload = cleanData({
    ...post,
    createdAtMs: post.createdAtMs || Date.now(),
  });
  await setDoc(doc(db, "discussions", post.id), payload);
}

export async function updateDiscussionCommentsInDb(threadId: string, comments: Comment[]) {
  await updateDoc(doc(db, "discussions", threadId), {
    comments: cleanData(comments),
  });
}

export async function updateDiscussionUpvoteInDb(
  threadId: string,
  upvotes: number,
  upvotedBy: string[],
) {
  await updateDoc(doc(db, "discussions", threadId), {
    upvotes,
    upvotedBy,
  });
}

// 8. Nén ảnh thông minh
function compressImageToDataUrl(
  file: File,
  maxWidth = 820,
  quality = 0.74,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        let dataUrl = canvas.toDataURL("image/jpeg", quality);

        if (dataUrl.length > 480000) {
          const smallCanvas = document.createElement("canvas");
          smallCanvas.width = Math.round(canvas.width * 0.75);
          smallCanvas.height = Math.round(canvas.height * 0.75);
          const smallCtx = smallCanvas.getContext("2d");
          if (smallCtx) {
            smallCtx.drawImage(canvas, 0, 0, smallCanvas.width, smallCanvas.height);
            dataUrl = smallCanvas.toDataURL("image/jpeg", 0.65);
          }
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Không thể đọc file ảnh"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Lỗi tải file"));
    reader.readAsDataURL(file);
  });
}

export async function processAndUploadImage(file: File): Promise<string> {
  const compressedDataUrl = await compressImageToDataUrl(file);
  const imgbbKey = (import.meta.env.VITE_IMGBB_API_KEY || "").trim();

  if (imgbbKey) {
    const base64Only = compressedDataUrl.split(",")[1];
    const formData = new FormData();
    formData.append("image", base64Only);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
      method: "POST",
      body: formData,
    });
    const result = await response.json();
    if (result?.success && result?.data?.url) {
      return result.data.url as string;
    }
    throw new Error("Upload ImgBB thất bại");
  }

  return compressedDataUrl;
}

// 9. Nạp dữ liệu mẫu ban đầu lên Firestore
export async function seedInitialDataToFirestore() {
  const batch = writeBatch(db);
  const baseTime = Date.now();

  initialResources.forEach((res, idx) => {
    const refDoc = doc(db, "resources", res.id);
    batch.set(
      refDoc,
      cleanData({
        ...res,
        status: "approved",
        createdAtMs: baseTime - idx * 60000,
      }),
    );
  });

  initialTheoryModules.forEach((mod, idx) => {
    const refDoc = doc(db, "theoryModules", mod.id);
    batch.set(
      refDoc,
      cleanData({
        ...mod,
        createdAtMs: baseTime - idx * 60000,
      }),
    );
  });

  initialDiscussions.forEach((disc, idx) => {
    const refDoc = doc(db, "discussions", disc.id);
    batch.set(
      refDoc,
      cleanData({
        ...disc,
        createdAtMs: baseTime - idx * 60000,
      }),
    );
  });

  await batch.commit();
}

// 10. Lưu, Tải và Chia sẻ Bộ công cụ giảng dạy
export function subscribeUserToolDecks(
  uid: string,
  toolId: ToolId,
  onData: (decks: ToolDeck[]) => void,
) {
  const q = query(collection(db, "toolDecks"), where("ownerUid", "==", uid));
  return onSnapshot(q, (snapshot) => {
    const list: ToolDeck[] = snapshot.docs
      .map((d) => ({
        ...(d.data() as Omit<ToolDeck, "id">),
        id: d.id,
      }))
      .filter((item) => item.toolId === toolId);
    list.sort((a, b) => (b.updatedAtMs || 0) - (a.updatedAtMs || 0));
    onData(list);
  });
}

export async function saveToolDeckToDb(deck: ToolDeck) {
  await setDoc(doc(db, "toolDecks", deck.id), cleanData(deck));
}

export async function deleteToolDeckFromDb(deckId: string) {
  await deleteDoc(doc(db, "toolDecks", deckId));
}

export async function getToolDeckById(deckId: string): Promise<ToolDeck | null> {
  const snap = await getDoc(doc(db, "toolDecks", deckId));
  if (!snap.exists()) return null;
  return {
    ...(snap.data() as Omit<ToolDeck, "id">),
    id: snap.id,
  };
}