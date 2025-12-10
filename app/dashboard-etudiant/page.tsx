// app/dashboard-etudiant/page.tsx → DASHBOARD ÉTUDIANT SIMPLE & CLAIR
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { 
  Building2, 
  Calendar, 
  Users, 
  BookOpen, 
  Bell, 
  LogOut,
  ArrowRight,
  Clock
} from "lucide-react";
import Link from "next/link";

export default function StudentDashboard() {
  const [stats, setStats] = useState({
    mesClubs: 0,
    evenementsInscrits: 0,
    evenementsAVenir: 0
  });
  const [mesClubs, setMesClubs] = useState<any[]>([]);
  const [evenements, setEvenements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // 1. Mes clubs
        const clubsRes = await api.get("/evenements/my-clubs");
        setMesClubs(clubsRes.data);
        setStats(prev => ({ ...prev, mesClubs: clubsRes.data.length }));

        // 2. Événements (publics + mes clubs)
        const eventsRes = await api.get("/evenements/student");
        setEvenements(eventsRes.data);
        setStats(prev => ({
          ...prev,
          evenementsInscrits: eventsRes.data.filter((e: any) => e.dejaInscrit).length,
          evenementsAVenir: eventsRes.data.filter((e: any) => new Date(e.dateEvenement) > new Date()).length
        }));

      } catch (err) {
        toast.error("Erreur chargement du dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-10">
        <div className="animate-pulse space-y-8">
          <div className="h-12 bg-gray-200 rounded w-96"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1,2,3].map(i => (
              <Card key={i} className="p-8">
                <div className="h-32 bg-gray-100 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">

        {/* EN-TÊTE */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-gray-800 mb-4">
            Bienvenue sur votre espace étudiant
          </h1>
          <p className="text-xl text-gray-600">
            Gérez vos clubs, événements et actualités en toute simplicité
          </p>
        </div>

        {/* STATISTIQUES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-lg">Mes clubs</p>
                <p className="text-5xl font-black text-orange-600 mt-2">{stats.mesClubs}</p>
              </div>
              <Building2 className="w-16 h-16 text-orange-600" />
            </div>
            <Link href="/dashboard-etudiant/mes-clubs">
              <Button variant="link" className="mt-4 text-orange-600">
                Voir tous <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </Card>

          <Card className="p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-lg">Événements inscrits</p>
                <p className="text-5xl font-black text-green-600 mt-2">{stats.evenementsInscrits}</p>
              </div>
              <Calendar className="w-16 h-16 text-green-600" />
            </div>
            <Link href="/dashboard-etudiant/evenements">
              <Button variant="link" className="mt-4 text-green-600">
                Voir les événements <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </Card>

          <Card className="p-8 bg-white shadow-lg rounded-2xl border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-lg">Événements à venir</p>
                <p className="text-5xl font-black text-blue-600 mt-2">{stats.evenementsAVenir}</p>
              </div>
              <Clock className="w-16 h-16 text-blue-600" />
            </div>
          </Card>
        </div>

        {/* MES CLUBS */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
            <Users className="w-10 h-10 text-orange-600" />
            Mes clubs ({mesClubs.length})
          </h2>

          {mesClubs.length === 0 ? (
            <Card className="p-16 text-center bg-white rounded-2xl">
              <Building2 className="w-20 h-20 mx-auto text-gray-300 mb-6" />
              <p className="text-xl text-gray-600">
                Vous n'êtes membre d'aucun club
              </p>
              <Link href="/dashboard-etudiant/clubs">
                <Button className="mt-6 bg-orange-600 hover:bg-orange-700">
                  Découvrir les clubs
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {mesClubs.map((club) => (
                <Card key={club.id} className="overflow-hidden hover:shadow-xl transition-shadow rounded-2xl">
                  {club.pathUrl && (
                    <img
                      src={`http://localhost:8001${club.pathUrl}`}
                      alt={club.nom}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-3">{club.nom}</h3>
                    <p className="text-gray-600 line-clamp-2 mb-4">{club.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">
                        {club.membresCount || 0} membres
                      </span>
                      <Link href={`/dashboard-etudiant/clubs/${club.id}`}>
                        <Button size="sm" className="bg-orange-600 hover:bg-orange-700">
                          Voir le club
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ÉVÉNEMENTS À VENIR */}
        <section>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-4">
            <Calendar className="w-10 h-10 text-orange-600" />
            Événements à venir
          </h2>

          {evenements.length === 0 ? (
            <Card className="p-16 text-center bg-white rounded-2xl">
              <Calendar className="w-20 h-20 mx-auto text-gray-300 mb-6" />
              <p className="text-xl text-gray-600">Aucun événement prévu</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {evenements.slice(0, 4).map((event) => (
                <Card key={event.id} className="p-6 hover:shadow-lg transition-shadow rounded-2xl">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold">{event.titre}</h3>
                    {event.estPublic ? (
                      <span className="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full">Public</span>
                    ) : (
                      <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full">Privé</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-4">{event.clubNom}</p>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>{new Date(event.dateEvenement).toLocaleDateString("fr-FR")}</p>
                    <p>{event.heure} • {event.lieu}</p>
                  </div>
                  <div className="mt-6 flex gap-4">
                    {event.dejaInscrit ? (
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        Inscrit
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => inscrire(event.id)}
                        className="flex-1 bg-orange-600 hover:bg-orange-700"
                      >
                        S'inscrire
                      </Button>
                    )}
                    <Link href={`/evenements/${event.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Détails
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}