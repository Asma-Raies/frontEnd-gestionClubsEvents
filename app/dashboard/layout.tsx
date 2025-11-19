"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/SideBar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    // Redirect ONLY if no token
    if (!token) {
      router.push("/login");
      return;
    }

    // Dashboard is ready
    setIsReady(true);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        Chargement...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* No user info yet — backend does not return user */}
      <Sidebar role="ADMIN" /> {/* TEMP: default role */}
      
      <div className="flex flex-1 flex-col">
        <Navbar user={null} onLogout={handleLogout} /> {/* user is null safely */}
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </div>
  );
}
