// app/dashboard-moderateur/layout.tsx
import Sidebar from "@/components/SideBar";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";

export default async function ModeratorLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role="MODERATEUR" />
      <main className="flex-1 ml-8 p-8">
        {children}
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 5000,
          }}
        />
      </main>
    </div>
  );
}