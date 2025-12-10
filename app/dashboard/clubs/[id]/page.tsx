// app/dashboard/clubs/[id]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  Calendar,
  Building2,
  Mail,
  User,
  Hash,
  CheckCircle2,
  XCircle,
  Sparkles,
  CalendarDays,
  TrendingUp,
  Info,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

type ClubDetails = {
  id: number;
  nom: string;
  description: string;
  category: string;
  pathUrl: string | null;
  foundedDate: string | null;
  isActive: boolean;
  moderateurId: number | null;
  moderateurPrenom: string | null;
  moderateurNom: string | null;
  moderateurEmail: string | null;
  membresCount: number;
  evenementsCount: number;
  evenementsAVenirCount: number;
  membres: { id: number; nom: string; prenom: string; email: string; isModerator?: boolean }[];
  evenements: {
    id: number;
    titre: string;
    dateEvenement: string;
    heure: string | null;
    etat: string; // "A_VENIR" | "EN_COURS" | "TERMINE"
    nombreInscrits: number;
  }[];
};

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

const eventStatusLabels: Record<string, { label: string; color: string }> = {
  A_VENIR: { label: "À venir", color: "bg-blue-100 text-blue-800" },
  EN_COURS: { label: "En cours", color: "bg-yellow-100 text-yellow-800" },
  TERMINE: { label: "Terminé", color: "bg-green-100 text-green-800" },
};

export default function ClubDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [club, setClub] = useState<ClubDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await api.get(`/clubs/${id}/details`);
        const data = res.data as ClubDetails;
        // Mark moderator in members list
        const membresWithRole = data.membres.map((m) => ({
          ...m,
          isModerator: m.id === data.moderateurId,
        }));
        setClub({ ...data, membres: membresWithRole });
      } catch (err) {
        toast.error("Impossible de charger les détails du club");
        router.push("/dashboard/clubs");
      } finally {
        setLoading(false);
      }
    };
    fetchClub();
  }, [id, router]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-orange-500"></div>
      </div>
    );
  if (!club) return null;

  const formatDateIfExists = (dateStr: string | null) => {
    if (!dateStr) return "Non spécifiée";
    return format(parseISO(dateStr), "dd MMMM yyyy", { locale: fr });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" size="lg" onClick={() => router.back()} className="mb-8">
          <ArrowLeft className="mr-2 h-5 w-5" /> Retour
        </Button>

        {/* Hero Banner */}
        <section className="relative bg-white rounded-2xl shadow-lg overflow-hidden p-6 md:p-8 mb-8">
{/* soft orange blur */}
<div className="absolute -right-24 -top-24 w-64 h-64 bg-gradient-to-br from-orange-200 to-orange-400 opacity-30 rounded-full filter blur-3xl pointer-events-none"></div>


<div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
<div className="col-span-1 flex items-center justify-center md:justify-start">
<div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center shadow-inner">
{club.pathUrl ? (
<img
src={`http://localhost:8001${club.pathUrl}`}
alt={club.nom}
className="w-full h-full object-cover"
/>
) : (
<div className="flex items-center justify-center w-full h-full">
<Building2 className="h-12 w-12 text-orange-500" />
</div>
)}
</div>
</div>


<div className="col-span-3">
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
<div>
<h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">{club.nom}</h2>
<Badge className="mt-1 px-3 py-1 rounded-full bg-gradient-to-r from-orange-300 to-orange-400 text-orange-800 text-sm font-medium">{categoryLabels[club.category] || club.category}</Badge>
<div className="mt-3 flex items-center gap-3">
<div className="grid grid-cols-3 gap-8 mt-8">
                  <div className="text-center">
                    <Users className="h-6 w-6 mx-auto mb-3 opacity-90" />
                    <p className="text-xl text-orange-700 ">{club.membresCount}</p>
                    <p className="text-lg text-orange-700 opacity-90">Membres</p>
                  </div>
                  <div className="text-center">
                    <CalendarDays className="h-6 w-6 mx-auto mb-3 opacity-90" />
                    <p className="text-xl text-orange-700 font-black">{club.evenementsCount}</p>
                    <p className="text-lg text-orange-700 opacity-90">Événements</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-6 w-6 mx-auto mb-3 opacity-90" />
                    <p className="text-xl text-orange-700">{club.evenementsAVenirCount}</p>
                    <p className="text-lg text-orange-700 opacity-90">À venir</p>
                  </div>
                </div>
</div>
</div>



</div>
</div>
</div>
</section>

        {/* Tabs */}
        <Tabs defaultValue="infos" className="space-y-8">
        <TabsList className="grid w-full grid-cols-3 h-14 text-lg">
            <TabsTrigger value="infos">Informations</TabsTrigger>
            <TabsTrigger value="membres">Membres ({club.membresCount})</TabsTrigger>
            <TabsTrigger value="evenements">Événements ({club.evenementsCount})</TabsTrigger>
           
          </TabsList>
  {/* Tab: Informations */}
  <TabsContent value="infos">
  <div className="grid lg:grid-cols-2 gap-8 px-2 md:px-4">
    {/* CARD 1 : Détails du club */}
    <Card className="rounded-2xl shadow-sm border border-orange-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-900">Détails du club</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 text-gray-700 p-6">
        {/* Description */}
        <p className="whitespace-pre-line leading-relaxed">
          {club.description || "Aucune description disponible."}
        </p>

        {/* Catégorie */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Catégorie</p>
          <p className="font-semibold text-gray-800">
            {categoryLabels[club.category] || club.category}
          </p>
        </div>

        {/* Date */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Date de création</p>
          <p className="font-semibold text-gray-800">
            {formatDateIfExists(club.foundedDate)}
          </p>
        </div>

        {/* Statut */}
        <div className="space-y-1">
          <p className="text-sm text-gray-500">Statut</p>
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            {club.isActive ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span>{club.isActive ? "Actif" : "Inactif"}</span>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* CARD 2 : Modérateur */}
    <Card className="rounded-2xl shadow-sm border border-orange-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-gray-900">Détails du modérateur</CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        {club.moderateurId ? (
          <div className="space-y-6">

            {/* Avatar + Nom */}
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-28 w-28 ring-4 ring-orange-500 shadow-lg mb-4">
                <AvatarImage src="" />
                <AvatarFallback className="text-3xl font-black bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                  {club.moderateurPrenom?.[0]}
                  {club.moderateurNom?.[0]}
                </AvatarFallback>
              </Avatar>

              <h3 className="text-2xl font-bold text-gray-900">
                {club.moderateurPrenom} {club.moderateurNom}
              </h3>
              <p className="text-orange-600 font-semibold text-sm">
                Responsable du club
              </p>
            </div>

            {/* Email */}
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200 shadow-sm">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-orange-600" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 mb-1">Email de contact</p>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {club.moderateurEmail}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Aucun modérateur assigné</p>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
</TabsContent>

          {/* Tab: Membres */}
          <TabsContent value="membres">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Liste des membres</CardTitle>
              </CardHeader>
              <CardContent>
                {club.membres.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucun membre pour le moment.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {club.membres.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-start gap-4 p-5 rounded-xl bg-white border hover:shadow-md transition"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-orange-500 text-white font-bold">
                            {m.prenom[0]}
                            {m.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate">
                              {m.prenom} {m.nom}
                            </p>
                            {m.isModerator && (
                              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                                Modérateur
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 truncate">{m.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Événements */}
          <TabsContent value="evenements">
            {club.evenements.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  Aucun événement programmé pour ce club.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {club.evenements.map((evt) => {
                  const status = eventStatusLabels[evt.etat] || {
                    label: evt.etat,
                    color: "bg-gray-100 text-gray-800",
                  };
                  const eventDate = parseISO(evt.dateEvenement);
                  const isFuture = eventDate > new Date();

                  return (
                    <Card key={evt.id} className="hover:shadow-md transition">
                      <CardContent className="pt-6 pb-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{evt.titre}</h3>
                            <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(eventDate, "dd MMM yyyy", { locale: fr })}
                                {isFuture && (
                                  <Sparkles className="h-3.5 w-3.5 text-orange-500 ml-1" />
                                )}
                              </span>
                              {evt.heure && <span className="font-mono">{evt.heure}</span>}
                              <Badge className={status.color}>{status.label}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-orange-600">{evt.nombreInscrits}</p>
                            <p className="text-sm text-gray-600">inscrits</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

        
        </Tabs>
      </div>
    </div>
  );
}