import { appendFile } from "node:fs/promises";
import path from "node:path";

type GeminiQuestionResponse = {
  questions: string[];
};

function parseGeminiModels(
  raw = process.env.GEMINI_MODELS || "gemini-2.5-flash",
) {
  return String(raw)
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);
}

export function getGeminiModels() {
  return parseGeminiModels();
}

type GeminiApiResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
    output?: unknown;
    text?: unknown;
    finishReason?: string;
  }>;
  output?: unknown;
  content?: unknown;
  text?: unknown;
};

type GeminiTraceEntry = {
  timestamp: string;
  model: string;
  promptPreview?: string;
  status?: number;
  finishReason?: string;
  outcome: "success" | "http_error" | "parse_error" | "empty_text";
  topLevelKeys?: string[];
  responseShape?: Record<string, unknown>;
  rawTextPreview?: string;
  rawTextTailPreview?: string;
  rawTextLength?: number;
  errorMessage?: string;
};

const infoLogPath = path.join(process.cwd(), "info.log");

async function appendGeminiTrace(entry: GeminiTraceEntry) {
  const line = `${JSON.stringify(entry)}\n`;
  await appendFile(infoLogPath, line, "utf8").catch(() => {
    // Logging should never block the request.
  });
}

function summarizeGeminiResponse(data: GeminiApiResponse) {
  const candidate = data.candidates?.[0] ?? {};
  const parts = candidate.content?.parts ?? [];

  return {
    hasCandidates: Array.isArray(data.candidates),
    candidateCount: data.candidates?.length ?? 0,
    firstCandidateKeys: Object.keys(candidate),
    hasContent: Boolean(candidate.content),
    partCount: parts.length,
    firstPartKeys: parts[0] ? Object.keys(parts[0]) : [],
    finishReason: candidate.finishReason ?? null,
    textType: typeof candidate.content?.parts?.[0]?.text,
    topLevelTextType: typeof data.text,
    topLevelContentType: typeof data.content,
    topLevelOutputType: typeof data.output,
  };
}

function extractGeminiText(data: GeminiApiResponse) {
  const candidateParts = data.candidates?.[0]?.content?.parts ?? [];
  const candidateText = candidateParts
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  if (candidateText) return candidateText;

  if (typeof data.text === "string" && data.text.trim())
    return data.text.trim();

  if (typeof data.content === "string" && data.content.trim()) {
    return data.content.trim();
  }

  if (typeof data.output === "string" && data.output.trim()) {
    return data.output.trim();
  }

  return "";
}

function stripMarkdownFences(text: string) {
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();
}

function extractJsonCandidate(text: string) {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    return trimmed;
  }

  return trimmed.slice(start, end + 1).trim();
}

function extractQuestionsFromPartialText(text: string) {
  const questionsMarker = text.indexOf('"questions"');
  if (questionsMarker === -1) return [] as string[];

  const arrayStart = text.indexOf("[", questionsMarker);
  if (arrayStart === -1) return [] as string[];

  const questions: string[] = [];
  let index = arrayStart + 1;

  while (index < text.length) {
    while (index < text.length && /[\s,]/.test(text[index] ?? "")) {
      index += 1;
    }

    if (index >= text.length || text[index] === "]") break;
    if (text[index] !== '"') break;

    index += 1;
    let question = "";
    let escaped = false;

    while (index < text.length) {
      const char = text[index] ?? "";

      if (escaped) {
        question += char;
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        index += 1;
        break;
      } else {
        question += char;
      }

      index += 1;
    }

    const trimmedQuestion = question.trim();
    if (trimmedQuestion) {
      questions.push(trimmedQuestion);
    }

    if (index >= text.length) break;
  }

  return questions.slice(0, 3);
}

function parseGeminiQuestions(rawText: string) {
  const jsonCandidate = extractJsonCandidate(rawText);

  try {
    const parsed = JSON.parse(jsonCandidate) as GeminiQuestionResponse;
    if (!parsed || !Array.isArray(parsed.questions)) {
      throw new Error("Gemini response did not include questions");
    }

    const questions = parsed.questions
      .map((question) => (typeof question === "string" ? question.trim() : ""))
      .filter(Boolean)
      .slice(0, 3);

    if (questions.length === 0) {
      throw new Error("Gemini response contained no usable questions");
    }

    return questions;
  } catch {
    return extractQuestionsFromPartialText(rawText);
  }
}

function previewTail(text: string, length = 400) {
  return text.length <= length ? text : text.slice(-length);
}

export async function fetchMeloQuestions(
  prompt: string,
  model = "gemini-2.5-flash",
): Promise<GeminiQuestionResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const systemInstruction =
    "You are an expert technical recruiter and founding partner at an early-stage HRTech startup. " +
    "Your goal is to extract deep, behavioral, and situational insight from candidates. " +
    "Avoid generic or cliché interview questions. Focus heavily on adaptability, handling ambiguity, " +
    "cross-functional communication with non-technical stakeholders, and proactive problem-solving.";

  const userPrompt =
    `Generate exactly 3 concise, thoughtful interview questions for the role: "${prompt.trim()}".\n\n` +
    `Return only valid JSON in this exact shape: { "questions": ["string", "string", "string"] }.\n` +
    `Keep each question under 25 words and avoid long scenarios.\n` +
    `Question 1: situational execution.\n` +
    `Question 2: collaboration or communication.\n` +
    `Question 3: ownership or ambiguity.`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: "user",
        parts: [
          {
            text: userPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      responseMimeType: "application/json",
    },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const bodyText = await response.text().catch(() => "");
    await appendGeminiTrace({
      timestamp: new Date().toISOString(),
      model,
      promptPreview: prompt.trim().slice(0, 120),
      status: response.status,
      finishReason: undefined,
      outcome: "http_error",
      errorMessage: bodyText.slice(0, 1000),
    });
    throw new Error(
      `Gemini request failed with ${response.status}: ${bodyText}`,
    );
  }

  const data = (await response.json()) as GeminiApiResponse;
  const rawText = stripMarkdownFences(extractGeminiText(data));
  const finishReason = data.candidates?.[0]?.finishReason;

  await appendGeminiTrace({
    timestamp: new Date().toISOString(),
    model,
    promptPreview: prompt.trim().slice(0, 120),
    status: response.status,
    finishReason,
    outcome: rawText ? "success" : "empty_text",
    topLevelKeys: Object.keys(data),
    responseShape: summarizeGeminiResponse(data),
    rawTextPreview: rawText.slice(0, 1000),
  });

  if (!rawText) {
    throw new Error("Gemini returned an empty response");
  }

  try {
    const questions = parseGeminiQuestions(rawText);

    if (questions.length === 0) {
      throw new Error("Gemini response contained no usable questions");
    }

    return { questions };
  } catch {
    await appendGeminiTrace({
      timestamp: new Date().toISOString(),
      model,
      promptPreview: prompt.trim().slice(0, 120),
      status: response.status,
      outcome: "parse_error",
      topLevelKeys: Object.keys(data),
      responseShape: summarizeGeminiResponse(data),
      rawTextPreview: rawText.slice(0, 1000),
      rawTextTailPreview: previewTail(rawText),
      rawTextLength: rawText.length,
      errorMessage: "Gemini returned invalid JSON for questions",
    });
    throw new Error(
      `Gemini returned invalid JSON for questions: ${rawText.slice(0, 200)}`,
    );
  }
}
