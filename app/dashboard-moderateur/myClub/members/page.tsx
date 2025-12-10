"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { User, Phone, Mail, GraduationCap, Users } from "lucide-react";

export default function MyClubMembersPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoading(true);
        const res = await api.get("/clubs/my/members");
        // Protection contre null ou undefined
        setMembers(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        console.error("Erreur chargement membres:", err);
        toast.error(err.response?.data?.message || "Impossible de charger les membres");
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-10">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded w-96 mb-8"></div>
          <div className="bg-white rounded-2xl shadow-md p-8">
            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
            <div className="h-64 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* TITRE */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-medium text-gray-800">
          Liste des <span >Membres</span>
        </h1>
        <div className="text-2xl font-bold text-orange-600 bg-orange-50 px-6 py-3 rounded-full">
          {members.length} membre{members.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* CARD */}
      <Card className="shadow-2xl rounded-xl overflow-hidden border border-orange-100">
        {members.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-24 h-24 mx-auto text-gray-300 mb-6" />
            <p className="text-2xl text-gray-500">Aucun membre pour le moment</p>
            <p className="text-gray-400 mt-2">Les étudiants rejoindront bientôt votre club !</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-black">
                  <th className="px-8 py-6 text-left font-bold text-lg rounded-tl-2xl">Membre</th>
                  <th className="px-8 py-6 text-left font-bold text-lg">Email</th>
                  <th className="px-8 py-6 text-left font-bold text-lg">Téléphone</th>
                  <th className="px-8 py-6 text-left font-bold text-lg rounded-tr-2xl">Niveau</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m, index) => (
                  <tr
                    key={m.id}
                    className={`border-b last:border-0 hover:bg-orange-50 transition-all duration-200 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                          {m.prenom?.[0] || "A"}{m.nom?.[0] || "N"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 text-lg">
                            {m.prenom || "Prénom"} {m.nom || "Nom"}
                          </p>
                          <p className="text-sm text-gray-500">Membre actif</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-orange-600" />
                        <span className="text-gray-700 font-medium">{m.email || "—"}</span>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-orange-600" />
                        <span className="text-gray-700">{m.telephone || "—"}</span>
                      </div>
                    </td>

                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5 text-orange-600" />
                        <span className="text-gray-700 font-medium">{m.niveau || "Non renseigné"}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Pied de page sympa */}
      {members.length > 0 && (
        <div className="text-center mt-12 text-gray-500">
          <p>Liste mise à jour automatiquement • {new Date().toLocaleDateString("fr-FR")}</p>
        </div>
      )}
    </div>
  );
}