import { NextResponse } from "next/server";
import { fetchMeloQuestions, getGeminiModels } from "../../utils/geminiClient";

type RequestBody = {
  model?: string;
  prompt?: string;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const allowedModels = getGeminiModels();
    const model = body.model || allowedModels[0] || "gemini-2.5-flash";
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    if (!allowedModels.includes(model)) {
      return NextResponse.json(
        {
          error: "Unsupported Gemini model",
          allowedModels,
        },
        { status: 400 },
      );
    }

    const { questions } = await fetchMeloQuestions(prompt, model);
    return NextResponse.json({ model, questions });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Failed to fetch response from AI provider";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
