"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();

  const isAdmin = role?.toUpperCase() === "ADMIN";

  const links = [
    { href: "/dashboard", label: "Tableau de bord" },
    { href: "/dashboard/clubs", label: "Clubs" },
    { href: "/dashboard/profile", label: "Mon profil" },
    ...(isAdmin ? [{ href: "/dashboard/users", label: "Utilisateurs" }] : []),
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white">
      <div className="p-6 text-2xl font-bold">Gestion Clubs</div>

      <nav className="mt-10">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-8 py-4 transition ${
              pathname === link.href ? "bg-gray-800" : "hover:bg-gray-800"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
