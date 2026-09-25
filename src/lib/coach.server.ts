import { createOpenAI } from "@ai-sdk/openai";
import { createClient } from "@supabase/supabase-js";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId, withLovableAiGatewayRunIdHeader } from "./run-id.server";

const SYSTEM = `Eres "Coach", el entrenador personal con IA de la app Mi Personal Trainer. Hablas en español, cercano, motivador y directo, como un buen entrenador en el gimnasio.
Ayudas a la persona durante o después de su entrenamiento: técnica, tips, cambios de ejercicio por uno equivalente (mismo músculo, disponible en su tipo de gimnasio y seguro para sus lesiones), cargas, descansos, cardio, nutrición básica y motivación.
Respuestas cortas y prácticas (máximo ~150 palabras salvo que pidan más), con viñetas cuando ayude. Si hay dolor agudo, mareo o una lesión que duele hoy, recomienda parar y consultar a un médico o fisioterapeuta. No hagas diagnósticos médicos.`;

export async function handleCoachChat(request: Request) {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return new Response("Unauthorized", { status: 401 });
  const supabase = createClient(process.env['SUPABASE_URL']!, process.env['SUPABASE_PUBLISHABLE_KEY']!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: auth } = await supabase.auth.getUser(token);
  if (!auth.user) return new Response("Unauthorized", { status: 401 });
  const userId = auth.user.id;

  let body: { messages?: UIMessage[]; context?: string };
  try {
    body = await request.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const messages = Array.isArray(body.messages) ? body.messages.slice(-40) : [];
  if (!messages.length) return new Response("Bad request", { status: 400 });
  const context = typeof body.context === "string" ? body.context.slice(0, 8000) : "";

  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) return new Response("AI no configurada", { status: 500 });

  const last = messages[messages.length - 1]!;
  if (last.role === "user") {
    await supabase.from("coach_messages").upsert({ id: last.id, user_id: userId, message: last as never });
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: `${SYSTEM}\n\nContexto actual de la persona:\n${context || "(sin datos)"}`,
    messages: await convertToModelMessages(messages),
    abortSignal: request.signal,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  return withLovableAiGatewayRunIdHeader(
    result.toUIMessageStreamResponse({
      originalMessages: messages,
      sendReasoning: false,
      onFinish: async ({ responseMessage }) => {
        const { error } = await supabase
          .from("coach_messages")
          .upsert({ id: responseMessage.id, user_id: userId, message: responseMessage as never });
        if (error) console.error("coach save failed", error.message);
      },
      onError: (e) => {
        const status = (e as { statusCode?: number })?.statusCode;
        if (status === 429) return "Hay muchas consultas ahora mismo. Intenta en un momento.";
        if (status === 402) return "Se acabaron los créditos de IA del espacio de trabajo.";
        return "El coach no pudo responder. Intenta de nuevo.";
      },
    }),
    runIdFetch,
  );
}
