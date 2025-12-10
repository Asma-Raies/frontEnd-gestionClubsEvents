// components/Sidebar.tsx → PARFAIT COMME ÇA
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Newspaper, 
  UserCheck,
  LogOut,
  Building2,
  Bell,
  Home,
  UserCircle2
} from "lucide-react";

export default function Sidebar({ role }: { role?: string }) {
  const pathname = usePathname();
  const roleUpper = role?.toUpperCase();

  const isAdmin = roleUpper === "ADMIN";
  const isModerator = roleUpper === "MODERATEUR";
  const isStudent = roleUpper === "ETUDIANT";
  console.log(isStudent)
  console.log(roleUpper)
  const links = [
    
    ...(isAdmin ? [
      { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/dashboard/clubs", label: "Clubs", icon: Users },
      { href: "/dashboard/evenements", label: "Événements", icon: Calendar },
      { href: "/dashboard/demandes", label: "Demandes", icon: FileText },
      { href: "/dashboard/blogs", label: "Blogs", icon: Newspaper },

      { href: "/dashboard/users", label: "Utilisateurs", icon: UserCheck },
    ] : []),

    // MODÉRATEUR
    ...(isModerator ? [
      { href: "/dashboard-moderateur", label: "Tableau de bord", icon: LayoutDashboard },
      { href: "/dashboard-moderateur/myClub", label: "Mon Club", icon: Building2 },
      { href: "/dashboard-moderateur/myClub/members", label: "Membres", icon: Users },
      { href: "/dashboard-moderateur/myClub/evenements", label: "Événements", icon: Calendar },
      { href: "/dashboard-moderateur/blogs", label: "Blogs", icon: Newspaper },
      { href: "/dashboard-moderateur/demandes", label: "Demandes", icon: FileText },
      { href: "/dashboard-moderateur/comptes_enables", label: "Comptes en attente", icon: UserCircle2 },
    ] : []),

    // ÉTUDIANT
    ...(isStudent ? [
      { href: "/dashboard-etudiant", label: "Accueil", icon: Home },
      { href: "/dashboard-etudiant/clubs", label: "Découvrir les clubs", icon: Building2 },
      //{ href: "/dashboard-etudiant/mes-clubs", label: "Mes clubs", icon: Users },
      { href: "/dashboard-etudiant/evenements", label: "Événements", icon: Calendar },
      { href: "/dashboard-etudiant/blogs", label: "Blogs", icon: Newspaper },
     // { href: "/dashboard-etudiant/notifications", label: "Notifications", icon: Bell },
    ] : []),
    // COMMUN À TOUS
    { href: "/login", label: "Déconnexion", icon: LogOut },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-xl">IT</span>
          </div>
          <h1 className="text-xl font-bold">Business School</h1>
        </div>
      </div>

      <nav className="mt-6">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 px-8 py-4 transition-all duration-200 ${
                isActive
                  ? "bg-orange-600 text-white border-r-4 border-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}