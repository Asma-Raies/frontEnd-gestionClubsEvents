// app/dashboard/evenements/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, Calendar, Clock, MapPin, Users, UserCheck, 
  Building2, CalendarCheck, UserPlus, UserMinus, Sparkles 
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

interface EvenementDetail {
  id: number;
  titre: string;
  description: string;
  dateEvenement: string;
  heure?: string;
  lieu?: string;
  estPublic: boolean;
  etat: "A_VENIR" | "EN_COURS" | "TERMINE";
  clubNom: string;
  nombreInscrits: number;
  dejaInscrit: boolean;
  inscrits: { id: number; nom: string; prenom: string; email: string }[];
}

export default function EvenementDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [evenement, setEvenement] = useState<EvenementDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvenement();
  }, [id]);

  const fetchEvenement = async () => {
    try {
      const res = await api.get(`/evenements/${id}`);
      setEvenement(res.data);
    } catch (err: any) {
      toast.error(err.response?.status === 404 ? "Événement non trouvé" : "Impossible de charger l'événement");
      router.push("/dashboard/evenements");
    } finally {
      setLoading(false);
    }
  };

  const handleInscription = async () => {
    try {
      await api.post(`/evenements/${id}/inscrire`);
      toast.success("Inscription confirmée !");
      setEvenement(prev => prev ? { ...prev, dejaInscrit: true, nombreInscrits: prev.nombreInscrits + 1 } : null);
      fetchEvenement();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Impossible de s'inscrire");
    }
  };

  const handleDesinscription = async () => {
    try {
      await api.delete(`/evenements/${id}/desinscrire`);
      toast.success("Désinscription effectuée");
      setEvenement(prev => prev ? { ...prev, dejaInscrit: false, nombreInscrits: prev.nombreInscrits - 1 } : null);
      fetchEvenement();
    } catch {
      toast.error("Erreur lors de la désinscription");
    }
  };

  const getEtatBadge = (etat: string) => {
    switch (etat) {
      case "A_VENIR": return <Badge variant="default">À venir</Badge>;
      case "EN_COURS": return <Badge variant="default">En cours</Badge>;
      case "TERMINE": return <Badge variant="default">Terminé</Badge>;
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-gray-300"></div>
    </div>
  );

  if (!evenement) return null;

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />

      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto">

          {/* Bouton Retour */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-6 text-gray-700 flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" /> Retour
          </Button>

          {/* HERO ÉVÉNEMENT */}
          <Card className="mb-8 border">
            <CardHeader className="space-y-2">
              <div className="flex items-center  gap-2">
                <Badge variant="outline">{evenement.estPublic ? "Public" : "Privé"}</Badge>
                {getEtatBadge(evenement.etat)}
              </div>
              <CardTitle className="text-2xl font-bold">{evenement.titre}</CardTitle>
              <p className="text-gray-600 text-sm flex items-center gap-1">
                <Building2 className="h-4 w-4" /> {evenement.clubNom}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>{format(new Date(evenement.dateEvenement), "d MMM yyyy", { locale: fr })}</span>
                </div>
                {evenement.heure && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>{evenement.heure}</span>
                  </div>
                )}
                {evenement.lieu && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span>{evenement.lieu}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-500" />
                  <span>{evenement.nombreInscrits} participants</span>
                </div>
              </div>

             

              {evenement.etat === "EN_COURS" && evenement.dejaInscrit && (
                <div className="p-4 bg-green-50 text-green-700 rounded">
                  <CalendarCheck className="inline h-5 w-5 mr-1" /> Vous participez à cet événement
                </div>
              )}

              <Separator className="my-4" />

              {/* Description */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-1">
                  <Sparkles className="h-5 w-5 text-yellow-500" /> À propos
                </h3>
                <p className="text-gray-700">{evenement.description || "Aucune description fournie."}</p>
              </div>

              <Separator className="my-4" />

              {/* Liste des inscrits */}
              <div>
                <h3 className="font-semibold text-lg mb-2 flex items-center gap-1">
                  <UserCheck className="h-5 w-5 text-blue-500" /> Liste des Participants
                </h3>
                {evenement.inscrits.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {evenement.inscrits.map(inscrit => (
                      <Card key={inscrit.id} className="border p-2 text-center">
                        <Avatar className="h-12 w-12 mx-auto mb-2">
                          <AvatarFallback className="bg-orange-500 text-white font-bold">{inscrit.prenom[0]}{inscrit.nom[0]}</AvatarFallback>
                        </Avatar>
                        <p className="text-sm font-medium">{inscrit.prenom} {inscrit.nom}</p>
                        <p className="text-xs text-gray-500">{inscrit.email}</p>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Aucun inscrit pour le moment.</p>
                )}
              </div>

            </CardContent>
          </Card>

        </div>
      </div>
    </>
  );
}
