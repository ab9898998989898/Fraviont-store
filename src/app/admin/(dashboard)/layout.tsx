import { auth } from "@/server/auth";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8">
        <p className="text-ivory mb-4">No session found.</p>
        <Link href="/admin/login" className="text-gold-warm underline">Go to Login</Link>
      </div>
    );
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-8">
        <p className="text-ivory mb-4">Access Restricted. Role: {session.user.role}</p>
        <Link href="/" className="text-gold-warm underline">Go to Store</Link>
      </div>
    );
  }

  return (
    <AdminShell session={session}>{children}</AdminShell>
  );
}
