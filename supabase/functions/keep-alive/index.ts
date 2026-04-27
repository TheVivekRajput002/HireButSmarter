// Minimal heartbeat endpoint used for uptime checks if needed.
Deno.serve(() => {
  return new Response(
    JSON.stringify({
      status: "alive",
      ts: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    },
  );
});
