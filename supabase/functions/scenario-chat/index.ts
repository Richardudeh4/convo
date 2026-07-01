import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_TURNS = 30;

interface ScenarioMeta {
  id: string;
  title: string;
  isFree: boolean;
  description: string;
  goal: string;
  tasks: string[];
  npcRole: string;
}

const SCENARIOS: Record<string, ScenarioMeta> = {
  "1": {
    id: "1",
    title: "Ordering at a Tapas Bar",
    isFree: true,
    description:
      "You are in a lively tapas bar in Seville and the waiter is heading over.",
    goal: "Order food and drinks",
    tasks: [
      "Ask what tapas are available",
      "Order a drink",
      "Pay the bill",
    ],
    npcRole: "friendly waiter at a tapas bar in Seville",
  },
  "2": {
    id: "2",
    title: "Checking into a Hotel",
    isFree: false,
    description:
      "You have just arrived at your hotel after a long flight.",
    goal: "Check in",
    tasks: ["State your name", "Ask about breakfast", "Ask for Wi-Fi"],
    npcRole: "hotel receptionist at the front desk",
  },
  "3": {
    id: "3",
    title: "Shopping for Souvenirs",
    isFree: false,
    description: "You are in a local gift shop looking for a present.",
    goal: "Buy a gift",
    tasks: [
      "Ask for a recommendation",
      "Ask for gift wrap",
      "Ask for price",
    ],
    npcRole: "helpful shopkeeper in a souvenir store",
  },
  "4": {
    id: "4",
    title: "Asking for Directions",
    isFree: false,
    description: "You are lost in the city centre.",
    goal: "Find the nearest metro station",
    tasks: [
      "Excuse yourself",
      "Ask where the metro is",
      "Ask how far",
    ],
    npcRole: "friendly local passerby on the street",
  },
};

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ScenarioChatRequest {
  scenarioId: string;
  messages: ChatMessage[];
  userMessage?: string;
  startConversation?: boolean;
  completedTaskIndexes?: number[];
}

interface ScenarioChatResponse {
  reply: string;
  english: string;
  romanization: string;
  completedTaskIndexes: number[];
  conversationComplete: boolean;
}

function isPremiumActive(
  isPremium: boolean | null,
  expiresAt: string | null,
): boolean {
  if (!isPremium) return false;
  if (!expiresAt) return true;
  return new Date(expiresAt).getTime() > Date.now();
}

function buildSystemPrompt(
  scenario: ScenarioMeta,
  spanishLevel: string | null,
  interests: string[] | null,
  completedTaskIndexes: number[],
): string {
  const tasksList = scenario.tasks
    .map((task, i) => `${i}: ${task}${completedTaskIndexes.includes(i) ? " (DONE)" : ""}`)
    .join("\n");

  return `You are a ${scenario.npcRole} in a Spanish language learning roleplay.

Scenario: ${scenario.title}
Setting: ${scenario.description}
User's goal: ${scenario.goal}
Tasks (index: description):
${tasksList}

Learner level: ${spanishLevel ?? "beginner"}
Learner interests: ${(interests ?? []).join(", ") || "general"}

Rules:
- Reply ONLY in Spanish in the "reply" field (1-3 short, natural spoken sentences).
- Stay in character. Do not break the fourth wall unless the user is completely stuck.
- If the user writes in English, gently encourage them to try Spanish but still respond in character in Spanish.
- Match vocabulary and complexity to the learner level.
- Mark completedTaskIndexes (0-based) for tasks the user has clearly accomplished in this turn or earlier context.
- Set conversationComplete true only when ALL tasks are done and you give a natural closing line.
- Provide english translation and simple phonetic romanization for your Spanish reply.

Respond with valid JSON only, no markdown:
{"reply":"...","english":"...","romanization":"...","completedTaskIndexes":[0],"conversationComplete":false}`;
}

function buildChatMessages(
  systemPrompt: string,
  messages: ChatMessage[],
  userMessage: string | undefined,
  startConversation: boolean,
): { role: string; content: string }[] {
  const chatMessages: { role: string; content: string }[] = [
    { role: "system", content: systemPrompt },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  if (startConversation) {
    chatMessages.push({
      role: "user",
      content:
        "[The learner just walked into the scene. Greet them in Spanish and start the roleplay naturally.]",
    });
  } else if (userMessage) {
    chatMessages.push({ role: "user", content: userMessage });
  }

  return chatMessages;
}

function parseLlmJson(raw: string): ScenarioChatResponse {
  const parsed = JSON.parse(raw) as ScenarioChatResponse;
  if (!parsed.reply) {
    throw new Error("AI returned an invalid response shape");
  }
  return {
    reply: parsed.reply ?? "",
    english: parsed.english ?? "",
    romanization: parsed.romanization ?? "",
    completedTaskIndexes: Array.isArray(parsed.completedTaskIndexes)
      ? parsed.completedTaskIndexes.filter((n) => typeof n === "number")
      : [],
    conversationComplete: Boolean(parsed.conversationComplete),
  };
}

/** Groq — free tier, OpenAI-compatible: https://console.groq.com */
async function callGroq(
  chatMessages: { role: string; content: string }[],
): Promise<ScenarioChatResponse> {
  const apiKey = Deno.env.get("GROQ_API_KEY");
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: chatMessages,
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from Groq");
  }

  return parseLlmJson(raw);
}

/** Google Gemini — free tier: https://aistudio.google.com/apikey */
async function callGemini(
  systemPrompt: string,
  messages: ChatMessage[],
  userMessage: string | undefined,
  startConversation: boolean,
): Promise<ScenarioChatResponse> {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const contents: { role: string; parts: { text: string }[] }[] = messages.map(
    (m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }),
  );

  if (startConversation) {
    contents.push({
      role: "user",
      parts: [{
        text:
          "[The learner just walked into the scene. Greet them in Spanish and start the roleplay naturally.]",
      }],
    });
  } else if (userMessage) {
    contents.push({ role: "user", parts: [{ text: userMessage }] });
  }

  const model = Deno.env.get("GEMINI_MODEL") ?? "gemini-2.0-flash";
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.8,
        maxOutputTokens: 400,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) {
    throw new Error("Empty response from Gemini");
  }

  return parseLlmJson(raw);
}

async function callOpenAI(
  chatMessages: { role: string; content: string }[],
): Promise<ScenarioChatResponse> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: chatMessages,
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from OpenAI");
  }

  return parseLlmJson(raw);
}

type AiProvider = "groq" | "gemini" | "openai";

function resolveProvider(): AiProvider {
  const explicit = Deno.env.get("AI_PROVIDER")?.toLowerCase();
  if (explicit === "groq" || explicit === "gemini" || explicit === "openai") {
    return explicit;
  }
  if (Deno.env.get("GROQ_API_KEY")) return "groq";
  if (Deno.env.get("GEMINI_API_KEY")) return "gemini";
  if (Deno.env.get("OPENAI_API_KEY")) return "openai";
  throw new Error(
    "No AI API key configured. Set GROQ_API_KEY (free), GEMINI_API_KEY (free), or OPENAI_API_KEY in Supabase secrets.",
  );
}

async function callLlm(
  systemPrompt: string,
  messages: ChatMessage[],
  userMessage: string | undefined,
  startConversation: boolean,
): Promise<ScenarioChatResponse> {
  const provider = resolveProvider();
  const chatMessages = buildChatMessages(
    systemPrompt,
    messages,
    userMessage,
    startConversation,
  );

  switch (provider) {
    case "groq":
      return callGroq(chatMessages);
    case "gemini":
      return callGemini(systemPrompt, messages, userMessage, startConversation);
    case "openai":
      return callOpenAI(chatMessages);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as ScenarioChatRequest;
    const {
      scenarioId,
      messages = [],
      userMessage,
      startConversation,
      completedTaskIndexes = [],
    } = body;

    if (!scenarioId) {
      return new Response(JSON.stringify({ error: "scenarioId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scenario = SCENARIOS[scenarioId];
    if (!scenario) {
      return new Response(JSON.stringify({ error: "Scenario not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userTurns = messages.filter((m) => m.role === "user").length;
    if (!startConversation && userTurns >= MAX_TURNS) {
      return new Response(
        JSON.stringify({ error: "Conversation turn limit reached" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("is_premium, premium_expires_at, spanish_level, interests")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[scenario-chat] profile lookup failed:", profileError.message);
    }

    if (
      !scenario.isFree &&
      !isPremiumActive(profile?.is_premium, profile?.premium_expires_at)
    ) {
      return new Response(JSON.stringify({ error: "Premium required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priorCompleted = new Set(
      completedTaskIndexes.filter((n) => typeof n === "number"),
    );
    const systemPrompt = buildSystemPrompt(
      scenario,
      profile?.spanish_level ?? null,
      profile?.interests ?? null,
      [...priorCompleted],
    );

    const result = await callLlm(
      systemPrompt,
      messages,
      userMessage,
      Boolean(startConversation),
    );

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
