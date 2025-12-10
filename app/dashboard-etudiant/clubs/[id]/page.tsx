"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/api";
import { Users, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

export default function ClubDetails() {
  const params = useParams();
  const id = params.id as string;

  const [club, setClub] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    loadUser();
    if (id) loadClub();
  }, [id]);

  // Load current logged user info
  async function loadUser() {
    try {
      const res = await api.get("/auth/me");
      setUserId(res.data.id);
    } catch (err) {
      console.error("Auth error:", err);
    }
  }

  async function loadClub() {
    try {
      const res = await api.get(`/clubs/${id}/details`);
      setClub(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    try {
      await api.post(`/clubs/${id}/join`);
      toast.success("Vous avez rejoint le club !");
      loadClub();
    } catch (error) {
      toast.error("Erreur lors de l'inscription");
    }
  }

  if (loading) return <p className="p-10">Chargement...</p>;
  if (!club) return <p className="p-10">Club introuvable</p>;

  const isMember = club.membres?.some((m: any) => m.id === userId);

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <img
        src={`http://localhost:8001${club.pathUrl}`}
        className="w-full h-64 object-cover rounded-xl mb-6"
      />

      <h1 className="text-4xl font-bold mb-3">{club.nom}</h1>
      <p className="text-gray-700 mb-6">{club.description}</p>

      <div className="flex gap-6 text-gray-700 text-sm mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-orange-600" />
          {club.membresCount} membres
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-600" />
          {club.evenementsCount} événements
        </div>
      </div>

      <p className="mb-6 text-sm text-gray-600">
        Modérateur du club : <b>{club.moderateurNom}</b>
      </p>

      {!isMember && (
        <Button
          onClick={handleJoin}
          className="bg-orange-600 text-white hover:bg-orange-700"
        >
          Rejoindre le club
        </Button>
      )}

      <h2 className="mt-10 text-2xl font-bold mb-4">
        Événements du club
      </h2>

      {club.evenements.length === 0 ? (
        <p className="text-gray-500">Aucun événement pour le moment.</p>
      ) : (
        <ul className="space-y-4">
          {club.evenements.map((ev: any) => (
            <li key={ev.id} className="p-4 border rounded-xl shadow-sm">
              <h3 className="text-xl font-semibold">{ev.titre}</h3>
              <p className="text-gray-600">{ev.description}</p>

              <div className="flex gap-4 mt-2 text-sm text-gray-700">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {ev.dateEvenement}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {ev.lieu}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
