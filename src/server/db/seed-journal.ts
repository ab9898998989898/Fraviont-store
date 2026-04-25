import { db } from "./index";
import { journals } from "./schema";

async function main() {
  const apiKey = process.env.OPENROUTER2_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENROUTER2_API_KEY");
    process.exit(1);
  }

  console.log("Fetching journal entry from OpenRouter...");
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "Fraviont Store"
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      max_tokens: 2000,
      messages: [{
        role: "system",
        content: "You are an editorial writer for a high-end luxury e-commerce brand specializing in perfumes, cosmetics, and jewelry. Write a sophisticated, elegant journal article for this month. Return JSON ONLY with keys: title, excerpt, content (HTML formatted paragraphs and headings), category (e.g. Beauty, Fragrance), readTime (e.g. '5 min read'). No markdown code blocks formatting around the output. Only return raw JSON."
      }],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    console.error("OpenRouter API error:", await response.text());
    process.exit(1);
  }

  const data = await response.json();
  const contentText = data.choices?.[0]?.message?.content || "{}";
  
  let parsed;
  try {
    const cleanJson = contentText.replace(/```json\n?|\n?```/g, "").trim();
    parsed = JSON.parse(cleanJson);
  } catch (err) {
    console.error("Failed to parse response:", contentText);
    process.exit(1);
  }

  const slug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-" + Math.floor(Math.random()*1000);

  console.log("Inserting journal entry...");
  await db.insert(journals).values({
    slug,
    title: parsed.title,
    excerpt: parsed.excerpt,
    content: parsed.content,
    category: parsed.category,
    readTime: parsed.readTime,
    isFeatured: true,
  });

  console.log("Journal entry created successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
