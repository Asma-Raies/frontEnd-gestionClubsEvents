"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Edit, 
  Trash2, 
  Plus,
  Globe,
  Lock,
  Badge
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Evenement {
  id: number;
  titre: string;
  description: string;
  dateEvenement: string;
  heure: string;
  lieu: string;
  estPublic: boolean;
  etat: string;
  clubNom: string;
  nombreInscrits: number;
}

export default function MyClubEventsPage() {
  const [events, setEvents] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get("/evenements/my-club");
        setEvents(Array.isArray(res.data) ? res.data : []);
      } catch (err: any) {
        toast.error("Impossible de charger les événements");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const deleteEvent = async (id: number) => {
    if (!confirm("Supprimer cet événement ?")) return;

    try {
      await api.delete(`/evenements/${id}`);
      setEvents(events.filter(e => e.id !== id));
      toast.success("Événement supprimé");
    } catch (err) {
      toast.error("Erreur suppression");
    }
  };

  if (loading) {
    return (
      <div className="p-10">
        <div className="animate-pulse space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="h-24 bg-gray-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-6xl mx-auto space-y-8">
      {/* TITRE + BOUTON AJOUT */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-800">
          Événements de <span className="text-orange-600 font-extrabold">Mon Club</span>
        </h1>
       
        <Button
              size="lg"
              className="bg-orange-50 hover:bg-orange-100 text-orange-600 px-6 py-3 rounded-full shadow-sm font-medium flex items-center gap-2"
              onClick={() => router.push("/dashboard-moderateur/myClub/evenements/add")}
            >
              <Plus className="h-6 w-6 mr-2" />
              Créer un événement
            </Button>
      </div>

      {/* COMPTEUR */}
      <div className="text-lg sm:text-xl font-semibold text-gray-700 bg-gray-50 inline-block px-6 py-2 rounded-full">
        {events.length} événement{events.length > 1 ? "s" : ""}
      </div>

      {/* LISTE DES ÉVÉNEMENTS */}
      {events.length === 0 ? (
        <Card className="p-16 text-center bg-gray-50">
          <Calendar className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <p className="text-xl sm:text-2xl text-gray-500 font-semibold">Aucun événement pour le moment</p>
          <p className="text-gray-400 mt-2">Cliquez sur "Nouvel Événement" pour commencer</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden shadow hover:shadow-lg transition-all duration-200 rounded-2xl">
              
              <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-gray-800">{event.titre}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>
                        {new Date(event.dateEvenement).toLocaleDateString("fr-FR", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span>{event.heure}</span>
                    </div>
                    <Badge className={`px-2 py-1 text-xs font-medium ${
                      event.estPublic 
                        ? "bg-orange-100 text-orange-600" 
                        : "bg-gray-200 text-gray-600"
                    } flex items-center gap-1`}>
                      {event.estPublic ? <><Globe className="w-3 h-3" /> Public</> : <><Lock className="w-3 h-3" /> Privé</>}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-800">{event.nombreInscrits}</p>
                  <p className="text-xs text-gray-400">{event.nombreInscrits > 1 ? "inscrits" : "inscrit"}</p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <p className="text-gray-700">{event.description || "Aucune description"}</p>
                <div className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{event.lieu || "Lieu non défini"}</span>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/dashboard-moderateur/myClub/evenements/edit/${event.id}`}>
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </Link>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => deleteEvent(event.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              </div>

            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
