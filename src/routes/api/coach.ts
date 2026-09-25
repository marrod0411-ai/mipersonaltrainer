import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/coach")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleCoachChat } = await import("@/lib/coach.server");
        return handleCoachChat(request);
      },
    },
  },
});
