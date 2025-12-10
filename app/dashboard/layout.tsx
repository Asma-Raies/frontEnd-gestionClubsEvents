// app/dashboard/layout.tsx
import Sidebar from "@/components/SideBar";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="ADMIN" />
      <main className="flex-1 ml-8 p-8">
        {children}
      </main>
    </div>
  );
}