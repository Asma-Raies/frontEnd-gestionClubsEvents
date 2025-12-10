"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ClubsPage() {
  const [tab, setTab] = useState("all");
  const [allClubs, setAllClubs] = useState<any[]>([]);
  const [myClubs, setMyClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      const all = await api.get("/clubs");
      const mine = await api.get("/evenements/my-clubs");

      setAllClubs(all.data);
      setMyClubs(mine.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // ⭐ Fonction Rejoindre un club
  async function handleJoinClub(clubId: number) {
    try {
      const res = await api.post(`/clubs/${clubId}/join`);
      toast.success("Vous avez rejoint le club !");
      load(); // refresh
    } catch (e: any) {
      toast.error(e?.response?.data || "Erreur lors de la demande");
    }
  }

  if (loading) return <p className="p-10">Chargement...</p>;

  const availableClubs = allClubs.filter(
    (club: any) => !myClubs.some((c: any) => c.id === club.id)
  );

  const displayed =
    tab === "all" ? allClubs : tab === "mine" ? myClubs : availableClubs;

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-2">Explorer les Clubs</h1>
      <p className="text-gray-600 mb-8">
        Découvrez et rejoignez les clubs qui vous intéressent
      </p>

      {/* TABS */}
      <div className="flex gap-4 mb-10">
        <button
          onClick={() => setTab("all")}
          className={`px-6 py-2 rounded-full text-sm font-medium ${
            tab === "all"
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Tous les clubs ({allClubs.length})
        </button>

        <button
          onClick={() => setTab("mine")}
          className={`px-6 py-2 rounded-full text-sm font-medium ${
            tab === "mine"
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Mes clubs ({myClubs.length})
        </button>

        <button
          onClick={() => setTab("available")}
          className={`px-6 py-2 rounded-full text-sm font-medium ${
            tab === "available"
              ? "bg-black text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          Disponibles ({availableClubs.length})
        </button>
      </div>

      {/* LISTE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {displayed.map((club: any) => (
          <Card
            key={club.id}
            className="rounded-2xl shadow hover:shadow-xl transition overflow-hidden"
          >
            <img
              src={`http://localhost:8001${club.pathUrl}`}
              alt={club.nom}
              className="w-full h-48 object-cover"
            />

            <div className="p-6">
              <h3 className="text-2xl font-bold mb-2">{club.nom}</h3>
              <p className="text-gray-600 mb-4">{club.description}</p>

              <div className="flex items-center gap-4 text-gray-700 text-sm mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-orange-600" />
                  {club.membresCount} membres
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-orange-600" />
                  {club.evenementsCount} événements
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Modérateur: {club.moderateurNom}
              </p>

              <div className="flex flex-col gap-2">
                <Link href={`/dashboard-etudiant/clubs/${club.id}`}>
                  <Button className="w-full bg-black text-white hover:bg-gray-800">
                    Voir les détails
                  </Button>
                </Link>

                {!myClubs.some(c => c.id === club.id) && (
  <Button
    onClick={() => handleJoinClub(club.id)}
    className="w-full bg-orange-600 text-white hover:bg-orange-700"
  >
    Rejoindre
  </Button>
)}

              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
