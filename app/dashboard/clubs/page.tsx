"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Trash2, UserCheck, Eye, Plus, Building2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface Club {
  id: number;
  nom: string;
  description?: string;
  moderateurId?: number | null;
  membresCount?: number;
  moderateurPrenom?: string | null;
  moderateurNom?: string | null;
  category: string;
  pathUrl: string | null;
}
const categoryLabels: Record<string, string> = {
  ACADEMIC: "Académique",
  SPORTS: "Sportif",
  CULTURAL: "Culturel",
  TECHNICAL: "Technique",
  SOCIAL: "Social",
  ARTISTIC: "Artistique",
  SCIENTIFIC: "Scientifique",
  ENTREPRENEURSHIP: "Entrepreneuriat",
  ENVIRONMENTAL: "Environnemental",
  OTHER: "Autre",
};
interface AppUser {
  id?: number | string;
  nom?: string;
  email?: string;
  role?: string;
  roles?: string[];
  authorities?: { authority: string }[];
}

const resolveRole = (u?: AppUser): string => {
  if (!u) return "ETUDIANT";
  const raw =
    u.role ?? u.roles?.[0] ?? u.authorities?.[0]?.authority ?? "ETUDIANT";
  return raw.replace(/^ROLE_/, "");
};

export default function ClubsPage() {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch (e) {
        console.error("Corrupted user in localStorage");
      }
    }
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await api.get("/clubs");
      setClubs(res.data);
    } catch (err) {
      toast.error("Erreur lors du chargement des clubs");
    } finally {
      setLoading(false);
    }
  };

  const role = resolveRole(user);
  const isAdmin = role === "ADMIN";

  const canDeleteClub = (club: Club) =>
    !club.moderateurId && (!club.membresCount || club.membresCount === 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des Clubs</h1>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Clubs</h1>
          {isAdmin && (
            <Button onClick={() => router.push("/dashboard/clubs/add")} className="gap-2 bg-orange-600">
              <Plus className="h-4 w-4" /> Ajouter un club
            </Button>
          )}
        </div>
{/* Statistic Cards */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

  {/* Total Clubs */}
  <div className="p-6 rounded-2xl bg-white shadow-md border border-orange-100 flex items-center gap-4">
    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-orange-100">
      <Building2 className="h-6 w-6 text-orange-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500">Total des clubs</p>
      <p className="text-2xl font-bold text-gray-900">{clubs.length}</p>
    </div>
  </div>

  {/* Clubs avec modérateurs */}
  <div className="p-6 rounded-2xl bg-white shadow-md border border-orange-100 flex items-center gap-4">
    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-orange-100">
      <UserCheck className="h-6 w-6 text-orange-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500">Clubs avec modérateur</p>
      <p className="text-2xl font-bold text-gray-900">
        {clubs.filter((c) => c.moderateurId).length}
      </p>
    </div>
  </div>

  {/* Clubs sans modérateur */}
  <div className="p-6 rounded-2xl bg-white shadow-md border border-orange-100 flex items-center gap-4">
    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-orange-100">
      <UserCheck className="h-6 w-6 text-orange-600 opacity-40" />
    </div>
    <div>
      <p className="text-sm text-gray-500">Clubs sans modérateur</p>
      <p className="text-2xl font-bold text-gray-900">
        {clubs.filter((c) => !c.moderateurId).length}
      </p>
    </div>
  </div>

  {/* Total Membres */}
  <div className="p-6 rounded-2xl bg-white shadow-md border border-orange-100 flex items-center gap-4">
    <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-orange-100">
      <UserCheck className="h-6 w-6 text-orange-600" />
    </div>
    <div>
      <p className="text-sm text-gray-500">Total des membres</p>
      <p className="text-2xl font-bold text-gray-900">
        {clubs.reduce((sum, c) => sum + (c.membresCount ?? 0), 0)}
      </p>
    </div>
  </div>

</div>

        {/* Club Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="border rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow bg-white"
            >
              {/* Image */}
              <div className="relative h-48 w-full">
              {club.pathUrl ? (
                <img
                  src={`http://localhost:8001${club.pathUrl}`}
                  alt={club.nom}
                  className="h-32 w-32 md:h-40 md:w-40 object-cover rounded-2xl shadow-2xl ring-4 ring-white/50"
                />
              ) : (
                <div className="h-32 w-32 md:h-40 md:w-40 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                  <Building2 className="h-16 w-16 md:h-20 md:w-20 text-orange-500" />
                </div>
              )}
                {club.category && (
                  <Badge
                    className="absolute top-3 right-3 bg-orange-500 text-white"
                  >
                    {club.category}
                  </Badge>
                )}
              </div>

              {/* Info */}
              <div className="p-4 space-y-2">
                <h2 className="text-lg font-semibold">{club.nom}</h2>
                <p className="text-sm text-muted-foreground">
                  {club.description || "Aucune description"}
                </p>

                <div className="flex justify-between text-sm text-muted-foreground mt-2">
                  <span>{club.membresCount ?? 0} membres</span>
                  <span>{club.moderateurPrenom ? `Modérateur: ${club.moderateurPrenom} ${club.moderateurNom}` : ""}</span>
                </div>

                {/* Actions */}
                <div className="flex justify-between mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/dashboard/clubs/${club.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-1" /> Voir les détails
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/dashboard/clubs/edit/${club.id}`)}
                    >
                      <Edit className="h-4 w-4" /> Modifier
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-destructive"
                        disabled={!canDeleteClub(club)}
                        onClick={() => toast("Fonction supprimer")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
