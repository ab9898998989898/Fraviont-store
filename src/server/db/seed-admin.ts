import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

async function seedAdmin() {
  const email = "admin@fraviont.com";
  const password = "Admin@Hassan.com";
  const hashedPassword = await hash(password, 12);

  const existing = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);

  if (existing.length > 0) {
    // Update existing user to ADMIN with new password
    await db
      .update(schema.users)
      .set({ role: "ADMIN", password: hashedPassword, name: "Admin" })
      .where(eq(schema.users.email, email));
    console.log(`✓ Updated existing user ${email} to ADMIN`);
  } else {
    // Insert new admin user
    await db.insert(schema.users).values({
      id: crypto.randomUUID(),
      email,
      name: "Admin",
      role: "ADMIN",
      password: hashedPassword,
    });
    console.log(`✓ Created admin user ${email}`);
  }

  console.log("Done.");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error(err);
  process.exit(1);
});
