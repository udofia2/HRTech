import { NextResponse } from "next/server";
import { getGeminiModels } from "../../utils/geminiClient";

export function GET() {
  const models = getGeminiModels();
  return NextResponse.json({ models });
}
