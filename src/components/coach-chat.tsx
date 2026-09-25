import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Conversation, ConversationContent, ConversationScrollButton } from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputFooter,
  PromptInputSubmit,
  PromptInputTextarea,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import coachAvatar from "@/assets/coach-avatar.svg";

const QUICK = [
  "Dame tips para este ejercicio",
  "Cámbiame este ejercicio por otro",
  "¿Cuánto peso debería usar?",
  "Me duele un poco, ¿qué hago?",
];

export function CoachChatButton({ context, exerciseName }: { context: string; exerciseName?: string | undefined }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Hablar con el coach"
        className="fixed bottom-20 right-4 z-30 flex items-center gap-2 rounded-full chip-active py-1.5 pl-1.5 pr-4 shadow-lg sm:right-[calc(50%-200px)]"
      >
        <img src={coachAvatar} alt="" className="h-9 w-9 rounded-full" />
        <span className="font-display text-[13px] tracking-[0.08em] text-bg">COACH IA</span>
      </button>
      {open && <CoachSheet context={context} exerciseName={exerciseName} onClose={() => setOpen(false)} />}
    </>
  );
}

function CoachSheet({ context, exerciseName, onClose }: { context: string; exerciseName?: string | undefined; onClose: () => void }) {
  const [initial, setInitial] = useState<UIMessage[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data, error } = await supabase
        .from("coach_messages")
        .select("message")
        .order("created_at", { ascending: true })
        .limit(200);
      if (!alive) return;
      if (error) setLoadError("No pude cargar tu conversación anterior.");
      setInitial((data ?? []).map((r) => r.message as unknown as UIMessage));
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
      <button type="button" aria-label="Cerrar" onClick={onClose} className="absolute inset-0 h-full w-full cursor-default" />
      <div className="relative z-10 flex h-[88vh] w-full max-w-[430px] flex-col rounded-t-[32px] bg-card ring-1 ring-black/40">
        <header className="flex items-center gap-3 border-b border-line/60 px-5 py-4">
          <img src={coachAvatar} alt="Coach IA" className="h-10 w-10 rounded-full" />
          <div className="flex-1">
            <div className="font-display text-[16px] leading-none tracking-tight text-ink">TU COACH IA</div>
            <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.15em] text-mute">
              {exerciseName ? `Ahora: ${exerciseName}` : "Pregúntame lo que quieras"}
            </div>
          </div>
          <button type="button" onClick={onClose} className="font-mono text-[10px] uppercase tracking-[0.15em] text-mute">
            Cerrar
          </button>
        </header>
        {loadError && <p className="px-5 pt-2 text-[12px] text-flame">{loadError}</p>}
        {initial ? (
          <CoachChat initial={initial} context={context} />
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <Shimmer>Cargando conversación…</Shimmer>
          </div>
        )}
      </div>
    </div>
  );
}

function CoachChat({ initial, context }: { initial: UIMessage[]; context: string }) {
  const contextRef = useRef(context);
  contextRef.current = context;
  const [error, setError] = useState<string | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/coach",
        headers: async (): Promise<Record<string, string>> => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return token ? { Authorization: `Bearer ${token}` } : {};
        },
        body: () => ({ context: contextRef.current }),
      }),
    [],
  );

  const { messages, sendMessage, status, stop } = useChat({
    id: "coach",
    messages: initial,
    transport,
    onError: (e) => {
      const msg = e.message || "";
      if (msg.includes("Unauthorized")) setError("Tu sesión expiró. Vuelve a iniciar sesión.");
      else setError(msg.length < 160 ? msg : "El coach no pudo responder. Intenta de nuevo.");
    },
  });

  const busy = status === "submitted" || status === "streaming";
  const send = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    setError(null);
    sendMessage({ text: t });
  };
  const lastIsUser = messages[messages.length - 1]?.role === "user";

  return (
    <>
      <Conversation className="flex-1">
        <ConversationContent className="px-5">
          {messages.length === 0 && (
            <div className="py-6 text-center">
              <img src={coachAvatar} alt="" className="mx-auto h-16 w-16 rounded-full" />
              <p className="mt-3 text-[13px] leading-relaxed text-mute">
                Estoy contigo en el entrenamiento. Pídeme tips, un cambio de ejercicio o ayuda con las cargas.
              </p>
            </div>
          )}
          {messages.map((m) => (
            <Message key={m.id} from={m.role}>
              <MessageContent
                className={
                  m.role === "user"
                    ? "group-[.is-user]:rounded-2xl group-[.is-user]:bg-flame group-[.is-user]:text-bg"
                    : "text-ink"
                }
              >
                {m.parts.map((p, i) =>
                  p.type === "text" ? (
                    m.role === "user" ? (
                      <span key={i} className="whitespace-pre-wrap text-[14px]">{p.text}</span>
                    ) : (
                      <MessageResponse key={i} className="text-[14px] leading-relaxed text-ink">
                        {p.text}
                      </MessageResponse>
                    )
                  ) : null,
                )}
              </MessageContent>
            </Message>
          ))}
          {busy && lastIsUser && <Shimmer className="text-[13px]">El coach está pensando…</Shimmer>}
          {error && <p className="text-[12px] text-flame">{error}</p>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-line/60 px-4 pb-4 pt-3">
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              disabled={busy}
              onClick={() => send(q)}
              className="shrink-0 rounded-full chip px-3 py-1.5 text-[11px] text-ink disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <PromptInput onSubmit={(msg) => send(msg.text)} className="rounded-2xl bg-bg">
          <PromptInputTextarea placeholder="Escribe a tu coach…" className="text-ink" />
          <PromptInputFooter className="justify-end">
            <PromptInputSubmit status={status} onStop={stop} className="bg-flame text-bg" />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </>
  );
}
