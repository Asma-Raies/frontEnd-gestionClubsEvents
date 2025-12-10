// app/dashboard/clubs/my/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Edit, Users, CalendarDays } from "lucide-react";
import router from "next/router";

export default function MyClubPage() {
  const [club, setClub] = useState<any>(null);

  useEffect(() => {
    api
      .get("/clubs/my")
      .then((res) => setClub(res.data))
      .catch(() => toast.error("Erreur chargement du club"));
  }, []);

  if (!club)
    return <div className="p-20 text-center text-gray-600">Chargement...</div>;

  return (
<div className="p-6 max-w-5xl ml-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900">
            {club.nom}
          </h1>
          <p className="text-gray-500">{club.category}</p>
        </div>

        <Button
          onClick={() => router.push("/dashboard/clubs/my/edit")}
          className="flex items-center gap-2"
        >
          <Edit size={18} /> Modifier
        </Button>
      </div>

      {/* CARD INFO */}
      <Card className="p-8 shadow-lg mb-10 border border-gray-200">
        <div className="grid md:grid-cols-2 gap-8">

          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {club.description}
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800">Fondé le</p>
              <p className="text-gray-600">{club.foundedDate}</p>
            </div>

            <div>
              <p className="font-semibold text-gray-800">Actif</p>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  club.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {club.isActive ? "Oui" : "Non"}
              </span>
            </div>

            {/* LOGO */}
            {club.pathUrl && (
              <img
                src={`http://localhost:8001${club.pathUrl}`}
                alt={club.nom}
                className="w-32 rounded-lg shadow mt-4 border"
              />
            )}
          </div>

        </div>
      </Card>

      {/* MEMBRES */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <Users /> Membres ({club.membresCount})
        </h2>

        <Card className="p-6 shadow-md border border-gray-200">
          {(!club.membres || club.membres.length === 0) ? (
            <p className="text-gray-500 italic">
              Aucun membre pour le moment.
            </p>
          ) : (
            <ul className="space-y-4">
              {club.membres.map((m: any) => (
                <li
                  key={m.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <span className="font-medium">
                    {m.prenom} {m.nom}
                  </span>
                  <span className="text-gray-500">{m.email}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* EVENEMENTS */}
      <div>
        <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <CalendarDays /> Événements
        </h2>

        <Card className="p-6 shadow-md border border-gray-200">
          {(!club.evenements || club.evenements.length === 0) ? (
            <p className="text-gray-500 italic">
              Aucun événement prévu pour le moment.
            </p>
          ) : (
            <ul className="space-y-4">
              {club.evenements.map((e: any) => (
                <li
                  key={e.id}
                  className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border border-gray-200"
                >
                  <span className="font-medium">{e.titre}</span>
                  <span className="text-gray-500">{e.dateEvenement}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
