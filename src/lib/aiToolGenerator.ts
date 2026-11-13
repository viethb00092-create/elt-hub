import { ToolId } from "../types";

export type GeneratedToolResult = {
  title: string;
  rawInput: string;
  source: "gemini" | "template";
  warning?: string;
};

function getFormatInstruction(toolId: ToolId): string {
  switch (toolId) {
    case "gameshow":
    case "quiz":
      return (
        "Create 6 practical English multiple-choice questions for this topic. " +
        "Format each line strictly as:\n" +
        "Question | Option A | Option B | Option C | Correct letter (A, B, or C)\n" +
        "No numbering, no markdown, no extra text."
      );
    case "wheel":
      return (
        "List 10 English vocabulary words or short phrases for this topic. " +
        "One item per line, no numbering, no explanations."
      );
    case "bingo":
      return (
        "List 16 single English vocabulary words for this topic. " +
        "One word per line, no numbering, no explanations."
      );
    case "scramble":
      return (
        "Create 6 English vocabulary words with simple English clues. " +
        "Format each line strictly as:\n" +
        "UPPERCASE_WORD | Simple English clue\n" +
        "No numbering, no extra text."
      );
    case "exit-ticket":
      return (
        "Tạo 3 câu hỏi phản hồi cuối tiết học bằng tiếng Việt (kết hợp từ khóa tiếng Anh) để kiểm tra mức độ hiểu bài. " +
        "Mỗi dòng 1 câu hỏi đánh số 1., 2., 3."
      );
    case "worksheet":
      return (
        "Create 6 English fill-in-the-blank sentences, putting the target word inside square brackets [ ]. " +
        "Example: She [goes] to school every day.\n" +
        "One sentence per line, no numbering."
      );
  }
}

function sanitizeAiLines(raw: string, toolId: ToolId): string {
  const withoutFences = raw
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .trim();

  if (toolId === "exit-ticket") return withoutFences;

  return withoutFences
    .split("\n")
    .map((line) => line.trim().replace(/^(\d+[.)]\s*|[-*•]\s+)/, ""))
    .filter(Boolean)
    .join("\n");
}

function buildSmartTemplateContent(
  toolId: ToolId,
  topic: string,
  level: string,
): string {
  const cleanTopic = topic.trim() || "Classroom English";
  const lower = cleanTopic.toLowerCase();

  const isTravel = /travel|holiday|tourism|transport|vacation|du lịch/.test(lower);
  const isEnvironment = /environment|green|earth|nature|recycle|môi trường/.test(lower);
  const isPast = /past|yesterday|ago|quá khứ/.test(lower);
  const isHealth = /health|sport|hobby|lifestyle|sức khỏe|thể thao/.test(lower);
  const isTech = /tech|ai|computer|internet|future|công nghệ/.test(lower);

  if (toolId === "gameshow" || toolId === "quiz") {
    if (isTravel) {
      return (
        "What do you need to show before boarding an airplane? | Boarding pass | Library card | Menu | A\n" +
        "We stayed at a cozy _____ near the beach during our holiday. | hospital | resort | factory | B\n" +
        "Choose the correct sentence: | She go to Da Nang last summer. | She went to Da Nang last summer. | She going to Da Nang last summer. | B\n" +
        "A person who shows tourists around famous places is a _____. | tour guide | mechanic | pharmacist | A\n" +
        "Don't forget to pack your _____ when traveling abroad! | blackboard | passport | microscope | B\n" +
        'Which word means "a planned route or journey"? | Itinerary | Ingredient | Instrument | A'
      );
    }
    if (isEnvironment) {
      return (
        "Which action helps protect the environment? | Throwing trash in rivers | Recycling plastic bottles | Cutting down trees | B\n" +
        "Solar energy and wind power are examples of _____ energy. | renewable | polluted | disposable | A\n" +
        "We should _____ the lights when leaving the classroom. | turn on | turn off | turn up | B\n" +
        "Planting more trees helps reduce air _____. | pollution | celebration | population | A\n" +
        'What does "reduce, reuse, recycle" encourage us to do? | Waste more paper | Protect Earth resources | Buy more plastic | B\n' +
        "Which item is eco-friendly? | Reusable cloth bag | Single-use plastic straw | Foam box | A"
      );
    }
    if (isPast) {
      return (
        'What is the past simple form of "buy"? | buyed | bought | buys | B\n' +
        "Yesterday, my classmates _____ a tree in the school garden. | planted | plant | planting | A\n" +
        "_____ you finish your English homework last night? | Do | Were | Did | C\n" +
        "They _____ at the museum two days ago. | was | were | are | B\n" +
        'Which time expression goes with Past Simple? | Tomorrow | Right now | Last weekend | C\n' +
        'What is the negative form of "He visited Hue"? | He didn\'t visit Hue. | He didn\'t visited Hue. | He not visit Hue. | A'
      );
    }
    if (isHealth) {
      return (
        "Eating plenty of vegetables and fruits keeps us _____. | healthy | sleepy | noisy | A\n" +
        "How _____ water do you drink every day? | many | much | often | B\n" +
        "Badminton, swimming, and cycling are popular _____. | subjects | sports | seasons | B\n" +
        "You have a toothache. You should see a _____. | dentist | pilot | chef | A\n" +
        "Doing morning exercise gives us more _____ for studying. | energy | homework | traffic | A\n" +
        "Which habit is good for your eyes? | Reading in good light | Using phones in the dark | Never taking breaks | A"
      );
    }
    if (isTech) {
      return (
        "Which device is portable and used for typing documents? | Laptop | Refrigerator | Washing machine | A\n" +
        "In the future, smart robots will help us do _____. | housework | weather | traffic | A\n" +
        "Always keep your online password _____ and safe. | public | private | loud | B\n" +
        "Students can join online classes using video _____. | conferencing | gardening | cooking | A\n" +
        "Which verb means 'to transfer a file from the Internet to your computer'? | Download | Decorate | Deliver | A\n" +
        "Artificial Intelligence is commonly abbreviated as _____. | IT | AI | VR | B"
      );
    }

    const levelTag = level.includes("Kids") ? "basic" : "practical";
    return (
      `Topic "${cleanTopic}": Which word best fits this ${levelTag} context? | Vocabulary | Grammar | Pronunciation | A\n` +
      `Complete the sentence about ${cleanTopic}: "We _____ learning new English words today." | is | are | am | B\n` +
      `How do we ask a classmate about "${cleanTopic}" politely? | Can you share your idea about ${cleanTopic}? | Give me ${cleanTopic} now. | No ${cleanTopic} here. | A\n` +
      `Which skill helps us present "${cleanTopic}" clearly in front of the class? | Speaking with confidence | Whispering quietly | Looking at the floor | A\n` +
      `Choose the correct question word: "_____ do you practice ${cleanTopic} every week?" | How often | Who | Which | A\n` +
      `In a group project on "${cleanTopic}", good teammates always _____. | listen and cooperate | ignore others | work alone | A`
    );
  }

  if (toolId === "wheel") {
    if (isTravel) {
      return "Passport\nSuitcase\nAirport\nSouvenir\nSightseeing\nBeach Resort\nCamping\nCompass\nAdventure\nSunscreen";
    }
    if (isEnvironment) {
      return "Recycle\nSolar Energy\nRainforest\nWildlife\nEco-friendly\nClean Water\nPlant Trees\nZero Waste\nOcean\nAtmosphere";
    }
    return `${cleanTopic} — Idea 1\n${cleanTopic} — Vocabulary\n${cleanTopic} — Role-play\n${cleanTopic} — Example\n${cleanTopic} — Question\n${cleanTopic} — Challenge\n${cleanTopic} — Team A\n${cleanTopic} — Team B`;
  }

  if (toolId === "bingo") {
    if (isTravel) {
      return "Airport, Passport, Ticket, Hotel, Beach, Mountain, Camera, Map, Suitcase, Train, Taxi, Museum, Souvenir, Island, Compass, Tour Guide";
    }
    return `${cleanTopic}, Listen, Speak, Read, Write, Practice, Partner, Group, Question, Answer, Example, Story, Picture, Game, Winner, Review`;
  }

  if (toolId === "scramble") {
    if (isTravel) {
      return (
        "PASSPORT | An official document needed to travel to other countries\n" +
        "SUITCASE | A large bag used to pack your clothes for a trip\n" +
        "SOUVENIR | Something you buy to remember a holiday place\n" +
        "AIRPORT | A place where airplanes take off and land\n" +
        "COMPASS | A tool that shows North, South, East, and West"
      );
    }
    return (
      "VOCABULARY | New words and phrases we learn in English class\n" +
      "CONFIDENCE | Feeling sure about your ability to speak English\n" +
      "TEAMWORK | Working together nicely with your classmates\n" +
      "QUESTION | Something you ask when you want to know more"
    );
  }

  if (toolId === "exit-ticket") {
    return (
      `1. Ba từ vựng hoặc mẫu câu tiếng Anh mới em học được về chủ đề "${cleanTopic}":\n` +
      `2. Đặt một câu tiếng Anh hoàn chỉnh liên quan đến "${cleanTopic}":\n` +
      `3. Mức độ tự tin của em sau tiết học hôm nay (1–5 sao) và điều em muốn hỏi thêm:`
    );
  }

  return (
    `Today our English class is learning about [${cleanTopic}].\n` +
    "Students [practice] speaking in pairs for five minutes.\n" +
    "Please [listen] carefully to your partner's ideas.\n" +
    "We can [share] our answers with the whole class.\n" +
    "Learning English every day makes us more [confident]."
  );
}

async function callGeminiModel(
  model: string,
  apiKey: string,
  prompt: string,
  timeoutMs = 7000,
) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        }),
      },
    );
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } finally {
    window.clearTimeout(timer);
  }
}

export async function generateToolContent(
  toolId: ToolId,
  topic: string,
  level: string,
): Promise<GeneratedToolResult> {
  const cleanTopic = topic.trim() || "English Communication";
  const geminiKey = (import.meta.env.VITE_GEMINI_API_KEY || "").trim();

  if (!geminiKey || geminiKey.includes("dan_ma_api_key")) {
    return {
      title: `${cleanTopic} (${level})`,
      rawInput: buildSmartTemplateContent(toolId, cleanTopic, level),
      source: "template",
      warning:
        "Chưa nhận được VITE_GEMINI_API_KEY. Thầy cô hãy kiểm tra file .env và tắt/bật lại lệnh npm run dev.",
    };
  }

  const prompt =
    `Role: ELT curriculum designer for Vietnamese teachers.\n` +
    `Topic: "${cleanTopic}". Level: "${level}".\n` +
    `${getFormatInstruction(toolId)}`;

  // Ưu tiên bản Flash-Lite phản hồi nhanh 1-2s và ít nghẽn tải nhất
  const modelsToTry = ["gemini-3.8-flash-lite", "gemini-3.8-flash"];

  let lastErrorMsg = "";

  for (const model of modelsToTry) {
    try {
      const res = await callGeminiModel(model, geminiKey, prompt, 7000);

      if (res.ok) {
        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (typeof text === "string" && text.trim()) {
          return {
            title: `${cleanTopic} (${level})`,
            rawInput: sanitizeAiLines(text, toolId),
            source: "gemini",
          };
        }
      }

      lastErrorMsg = res.data?.error?.message || `HTTP ${res.status}`;
      if (res.status === 400 || res.status === 401 || res.status === 403) {
        break;
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") {
        lastErrorMsg = `Model ${model} phản hồi quá 7 giây (đang quá tải).`;
      } else {
        lastErrorMsg = err instanceof Error ? err.message : "Lỗi kết nối mạng";
      }
    }
  }

  return {
    title: `${cleanTopic} (${level})`,
    rawInput: buildSmartTemplateContent(toolId, cleanTopic, level),
    source: "template",
    warning: `Gemini AI tạm thời bận: ${lastErrorMsg}`,
  };
}