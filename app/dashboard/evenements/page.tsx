// app/dashboard/evenements/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
} from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar as CalIcon,
  Clock,
  MapPin,
  Users,
  Plus,
  Eye,
  Edit,
  Trash2,
  Archive,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Evenement {
  id: number;
  titre: string;
  description: string;
  dateEvenement: string; // ISO yyyy-MM-dd
  heure?: string;
  lieu?: string;
  estPublic: boolean;
  etat: "A_VENIR" | "EN_COURS" | "TERMINE";
  clubNom: string;
  clubId: number;
  nombreInscrits: number;
  dejaInscrit: boolean;
  peutModifier: boolean;
  peutSupprimer: boolean;
}
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

export default function EvenementsPage() {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [user, setUser] = useState<AppUser | null>(null);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);

  const router = useRouter();

  // view mode: "liste" or "calendrier"
  const [viewMode, setViewMode] = useState<"liste" | "calendrier">("liste");

  // calendar state
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventsOfSelectedDay, setEventsOfSelectedDay] = useState<Evenement[]>(
    []
  );

  useEffect(() => {
    fetchEvenements();
  }, []);

  useEffect(() => {
    // when evenements or selectedDate change, update eventsOfSelectedDay
    if (selectedDate) {
      const sel = format(selectedDate, "yyyy-MM-dd");
      setEventsOfSelectedDay(
        evenements.filter(
          (e) => format(parseISO(e.dateEvenement), "yyyy-MM-dd") === sel
        )
      );
    } else {
      setEventsOfSelectedDay([]);
    }
  }, [evenements, selectedDate]);

  const role = resolveRole(user);
  const isAdmin = role === "ADMIN";

  const fetchEvenements = async () => {
    try {
      const res = await api.get("/evenements");
      setEvenements(res.data);
    } catch (err) {
      toast.error("Impossible de charger les événements");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    try {
      await api.delete(`/evenements/${eventToDelete}`);
      toast.success("Événement supprimé avec succès");
      setEvenements((prev) => prev.filter((e) => e.id !== eventToDelete));
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleArchive = async (id: number) => {
    try {
      await api.patch(`/evenements/${id}/archiver`);
      toast.success("Événement archivé");
      fetchEvenements();
    } catch {
      toast.error("Erreur lors de l'archivage");
    }
  };

  const getEtatBadge = (etat: string) => {
    switch (etat) {
      case "A_VENIR":
        return (
          <Badge className="bg-blue-100 text-blue-800" aria-hidden>
            À venir
          </Badge>
        );
      case "EN_COURS":
        return (
          <Badge className="bg-green-100 text-green-800" aria-hidden>
            En cours
          </Badge>
        );
      case "TERMINE":
        return (
          <Badge className="bg-gray-200 text-gray-700" aria-hidden>
            Terminé
          </Badge>
        );
      default:
        return null;
    }
  };

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Sunday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth((m) => addMonths(m, 1));

  const handleDateSelect = (d: Date) => {
    setSelectedDate(d);
    // eventsOfSelectedDay updated by useEffect
  };

  if (loading) {
    return (
      <div className="space-y-10">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Événements</h1>
          <Skeleton className="h-12 w-52 rounded-full" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-96 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Gestion des Événements</h1>
            <p className="text-gray-600 mt-2">Administrez tous les événements de la plateforme</p>
          </div>

          <div className="flex items-center gap-4">
            {/* View toggle */}
           

            <Button
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 rounded-full shadow-lg"
              onClick={() => router.push("/dashboard/evenements/add")}
            >
              <Plus className="h-6 w-6 mr-2" />
              Créer un événement
            </Button>
          </div>
        </div>

        {/* Statistics (kept) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-white shadow-md border border-orange-100 flex items-center gap-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-orange-100">
              <CalIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total des événements</p>
              <p className="text-2xl font-bold text-gray-900">{evenements.length}</p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-md border border-orange-100 flex items-center gap-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-orange-100">
              <Eye className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Événements publics</p>
              <p className="text-2xl font-bold text-gray-900">
                {evenements.filter((e) => e.estPublic).length}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-md border border-orange-100 flex items-center gap-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-orange-100">
              <Eye className="h-6 w-6 text-orange-600 opacity-40" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Événements privés</p>
              <p className="text-2xl font-bold text-gray-900">
                {evenements.filter((e) => !e.estPublic).length}
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white shadow-md border border-orange-100 flex items-center gap-4">
            <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-orange-100">
              <Archive className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Événements terminés</p>
              <p className="text-2xl font-bold text-gray-900">
                {evenements.filter((e) => e.etat === "TERMINE").length}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
        <div className="bg-white rounded-full p-1 border flex items-center">
              <button
                onClick={() => setViewMode("liste")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  viewMode === "liste"
                    ? "bg-gray-100 text-gray-900 shadow"
                    : "text-gray-600"
                }`}
              >
                Liste
              </button>
              <button
                onClick={() => setViewMode("calendrier")}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  viewMode === "calendrier"
                    ? "bg-gray-100 text-gray-900 shadow"
                    : "text-gray-600"
                }`}
              >
                Calendrier
              </button>
            </div>
          </div>
        {/* MAIN: if liste show existing grid, if calendrier show calendar layout */}
        {viewMode === "liste" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {evenements.length === 0 ? (
              <div className="col-span-full text-center py-20 text-gray-500">
                <p className="text-2xl">Aucun événement</p>
              </div>
            ) : (
              evenements.map((evt) => (
                <Card
                  key={evt.id}
                  className="overflow-hidden rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0 bg-white"
                >
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                      <Badge variant={evt.estPublic ? "default" : "secondary"}>
                        {evt.estPublic ? "Public" : "Privé"}
                      </Badge>
                      {getEtatBadge(evt.etat)}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 line-clamp-2">
                      {evt.titre}
                    </h2>

                    <p className="text-gray-600 line-clamp-3 text-sm">
                      {evt.description || "Aucune description"}
                    </p>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-3">
                        <CalIcon className="h-5 w-5 text-orange-600" />
                        <span>
                          {format(parseISO(evt.dateEvenement), "dd MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                      {evt.heure && (
                        <div className="flex items-center gap-3">
                          <Clock className="h-5 w-5 text-orange-600" />
                          <span>{evt.heure}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-orange-600" />
                        <span>
                          {evt.nombreInscrits} participant{evt.nombreInscrits > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-gray-200">
                      <span className="text-sm font-semibold text-orange-700">
                        {evt.clubNom}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/evenements/${evt.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/dashboard/evenements/edit/${evt.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        {evt.etat !== "TERMINE" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-amber-600 hover:bg-amber-50"
                            onClick={() => handleArchive(evt.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        )}

                        {isAdmin && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setEventToDelete(evt.id);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          // CALENDAR VIEW (two-column style similar to screenshot)
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: calendar card */}
            <div className="p-6 rounded-2xl bg-white shadow-md border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Calendrier</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevMonth}
                    className="p-2 rounded-md hover:bg-gray-100"
                    aria-label="Précédent"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="px-3 py-2 rounded-md text-sm font-medium bg-gray-50">
                    {format(currentMonth, "MMMM yyyy", { locale: fr })}
                  </div>
                  <button
                    onClick={nextMonth}
                    className="p-2 rounded-md hover:bg-gray-100"
                    aria-label="Suivant"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Week labels */}
              <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-2">
                {days.map((day) => {
                  const inMonth = isSameMonth(day, monthStart);
                  const dayIso = format(day, "yyyy-MM-dd");
                  const hasEvent = evenements.some(
                    (e) => format(parseISO(e.dateEvenement), "yyyy-MM-dd") === dayIso
                  );
                  const selected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => handleDateSelect(day)}
                      className={`
                        relative p-2 rounded-lg text-sm w-full text-left
                        ${inMonth ? "text-gray-800" : "text-gray-300"}
                        ${selected ? "bg-orange-600 text-white" : "hover:bg-orange-50"}
                      `}
                      aria-pressed={selected}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{format(day, "d")}</span>
                        {hasEvent && !selected && (
                          <span className="h-2 w-2 bg-orange-500 rounded-full ml-2" />
                        )}
                      </div>

                      {/* Orange pill for selected day (like your screenshot) */}
                      {selected && (
                        <div className="absolute -right-2 -top-2">
                          <div className="bg-orange-600 text-white rounded-full px-2 py-1 text-xs shadow">
                            {format(day, "d")}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: events of selected date */}
            <div className="p-6 rounded-2xl bg-white shadow-md border">
              <h2 className="text-xl font-semibold">
                Événements du {selectedDate ? format(selectedDate, "dd/MM/yyyy") : "…"}
              </h2>

              <div className="mt-6 space-y-4">
                {!selectedDate ? (
                  <p className="text-gray-500">Sélectionnez une date dans le calendrier.</p>
                ) : eventsOfSelectedDay.length === 0 ? (
                  <p className="text-gray-500">Aucun événement ce jour.</p>
                ) : (
                  eventsOfSelectedDay.map((evt) => (
                    <Card key={evt.id} className="p-5 border border-gray-200 rounded-xl">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">{evt.titre}</h3>
                        {getEtatBadge(evt.etat)}
                      </div>

                      <p className="text-gray-600 mt-2">{evt.description}</p>

                      <div className="flex items-center gap-4 mt-4 text-sm">
                        {evt.heure && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-orange-600" />
                            {evt.heure}
                          </span>
                        )}
                        {evt.lieu && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-orange-600" />
                            {evt.lieu}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-600">{evt.clubNom}</div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/evenements/${evt.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => router.push(`/dashboard/evenements/edit/${evt.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          {evt.etat !== "TERMINE" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-amber-600 hover:bg-amber-50"
                              onClick={() => handleArchive(evt.id)}
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          )}

                          {isAdmin && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => {
                                setEventToDelete(evt.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              Supprimer cet événement ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. L'événement et toutes ses inscriptions seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer définitivement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
