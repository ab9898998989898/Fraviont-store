interface AICallOptions {
  model?: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  system?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function callAI({
  model = "anthropic/claude-3-5-haiku",
  messages,
  system,
  temperature = 0.7,
  max_tokens = 1000,
}: AICallOptions): Promise<string> {
  const allMessages = system
    ? [{ role: "system" as const, content: system }, ...messages]
    : messages;

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "HTTP-Referer": process.env.NEXTAUTH_URL ?? "http://localhost:3000",
      "X-Title": "Fraviont",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: allMessages,
      temperature,
      max_tokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenRouter error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json() as {
    choices: { message: { content: string } }[];
  };

  return data.choices[0]?.message.content ?? "";
}
