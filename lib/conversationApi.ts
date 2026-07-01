import { supabase } from "@/utils/supabase";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  english?: string;
  romanization?: string;
}

export interface ScenarioChatResponse {
  reply: string;
  english: string;
  romanization: string;
  completedTaskIndexes: number[];
  conversationComplete: boolean;
}

async function readFunctionError(error: unknown): Promise<string> {
  if (!error || typeof error !== "object") {
    return "Failed to reach conversation service";
  }

  const err = error as { message?: string; context?: Response };

  if (err.context && typeof err.context.json === "function") {
    try {
      const body = (await err.context.json()) as { error?: string };
      if (body?.error) {
        return body.error;
      }
    } catch {
      try {
        const text = await err.context.text();
        if (text) return text;
      } catch {
        // Fall through to message below.
      }
    }
  }

  const message = err.message ?? "Failed to reach conversation service";

  if (message.includes("non-2xx")) {
    return "Conversation service error. Set GROQ_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in Supabase secrets.";
  }

  return message;
}

export async function invokeScenarioChat(params: {
  scenarioId: string;
  messages: ChatMessage[];
  userMessage?: string;
  startConversation?: boolean;
  completedTaskIndexes?: number[];
}): Promise<ScenarioChatResponse> {
  const { data, error } = await supabase.functions.invoke("scenario-chat", {
    body: params,
  });

  if (error) {
    throw new Error(await readFunctionError(error));
  }

  if (data && typeof data === "object" && "error" in data && data.error) {
    throw new Error(String(data.error));
  }

  return data as ScenarioChatResponse;
}

export function isScenarioUnlocked(
  isFree: boolean,
  isPremium: boolean,
): boolean {
  return isFree || isPremium;
}
