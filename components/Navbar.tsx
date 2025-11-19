"use client";

export default function Navbar({ user, onLogout }: { user: any; onLogout: () => void }) {
  // Safe fallback values if user is null
  const nom = user?.nom || user?.email || "Utilisateur";
  const role = user?.role || "—";

  return (
    <header className="flex h-16 items-center justify-between bg-white px-8 shadow">
      <h1 className="text-xl font-semibold">
        Bienvenue, {nom} ({role})
      </h1>

      <button
        onClick={onLogout}
        className="rounded bg-red-600 px-6 py-2 text-white hover:bg-red-700"
      >
        Déconnexion
      </button>
    </header>
  );
}
