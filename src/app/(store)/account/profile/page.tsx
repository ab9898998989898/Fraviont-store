import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth";

export default async function ProfilePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen pt-32 pb-24 px-8 max-w-4xl mx-auto">
      <div className="mb-12">
        <h1 className="font-display text-ivory font-light text-4xl mb-2">My Account</h1>
        <p className="text-ash font-sans font-light text-sm">{session.user.email}</p>
      </div>

      <div className="mb-8 flex gap-6 border-b border-iron pb-4">
        <Link href="/account" className="text-ash text-xs tracking-[0.14em] uppercase font-sans hover:text-ivory transition-colors">
          Orders
        </Link>
        <Link href="/account/profile" className="text-gold-warm text-xs tracking-[0.14em] uppercase font-sans">
          Profile
        </Link>
      </div>

      <div className="max-w-md space-y-6">
        <div className="space-y-2">
          <label className="text-ash text-xs tracking-[0.14em] uppercase font-sans">Name</label>
          <p className="text-ivory font-sans font-light text-base border-b border-iron pb-3">
            {session.user.name ?? "—"}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-ash text-xs tracking-[0.14em] uppercase font-sans">Email</label>
          <p className="text-ivory font-sans font-light text-base border-b border-iron pb-3">
            {session.user.email}
          </p>
        </div>
      </div>
    </div>
  );
}
