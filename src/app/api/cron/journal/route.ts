import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { db } from "@/server/db";
import { journals } from "@/server/db/schema";

async function handler() {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing GROQ_API_KEY" }, { status: 500 });
    }

    // Call Groq to generate a monthly journal
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", 
        messages: [{
          role: "system",
          content: "You are an editorial writer for a high-end luxury e-commerce brand specializing in perfumes, cosmetics, and jewelry. Write a sophisticated, elegant journal article for this month. Return JSON ONLY with keys: title, excerpt, content (HTML formatted paragraphs and headings), category (e.g. Beauty, Fragrance), readTime (e.g. '5 min read'). No markdown code blocks formatting around the output."
        }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: "Groq API error", details: err }, { status: 500 });
    }

    const data = await response.json();
    const contentText = data.choices?.[0]?.message?.content || "{}";
    
    // Parse JSON
    let parsed;
    try {
      const cleanJson = contentText.replace(/```json\n?|\n?```/g, "").trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({ error: "Failed to parse Groq response", raw: contentText }, { status: 500 });
    }

    const slug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-" + Math.floor(Math.random()*1000);

    const result = await db.insert(journals).values({
      slug,
      title: parsed.title,
      excerpt: parsed.excerpt,
      content: parsed.content,
      category: parsed.category,
      readTime: parsed.readTime,
      isFeatured: false,
    }).returning();

    return NextResponse.json({ success: true, journal: result[0] });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: errMessage }, { status: 500 });
  }
}

export const POST = verifySignatureAppRouter(handler);
