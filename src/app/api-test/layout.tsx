import { Sidebar } from "@/components/Sidebar/index";
import { sidebarItems } from "../layout";

export default function ApiTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar items={sidebarItems} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
} 