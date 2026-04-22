import { Navigation } from "@/components/store/Navigation";
import { Footer } from "@/components/store/Footer";
import { ChatWidget } from "@/components/store/ChatWidget";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navigation />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
