import { db } from "@/server/db";
import { journals } from "@/server/db/schema";
import { desc } from "drizzle-orm";
import { JournalClient } from "./JournalClient";

export default async function JournalPage() {
  const allJournals = await db.select().from(journals).orderBy(desc(journals.createdAt));
  return <JournalClient journals={allJournals} />;
}
