// app/dashboard/evenements/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, Clock, MapPin,
  Building2, Globe, Lock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import api from "@/lib/api";
import toast from "react-hot-toast";

interface Club {
  id: number;
  nom: string;
}

type EtatEvenement = "A_VENIR" | "EN_COURS" | "TERMINE";

const EtatOptions = [
  { value: "A_VENIR", label: "À venir" },
  { value: "EN_COURS", label: "En cours" },
  { value: "TERMINE", label: "Terminé" },
];

export default function EditerEvenementPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [form, setForm] = useState({
    titre: "",
    description: "",
    dateEvenement: "",
    heure: "",
    lieu: "",
    estPublic: false,
    clubId: "",
    etat: "" as EtatEvenement | "",
  });

  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ---------------------- FETCH DATA ----------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const evtRes = await api.get(`/evenements/${id}`);
        const evt = evtRes.data;

        setForm({
          titre: evt.titre,
          description: evt.description,
          dateEvenement: evt.dateEvenement,
          heure: evt.heure,
          lieu: evt.lieu,
          estPublic: evt.estPublic || false,
          clubId: String(evt.clubId),
          etat: evt.etat || "A_VENIR",
        });

        const clubsRes = await api.get("/clubs/mes-clubs");
        setClubs(clubsRes.data);
      } catch (e: any) {
        toast.error("Erreur de chargement des données");
        router.push("/dashboard/evenements");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ---------------------- SUBMIT ----------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.clubId || !form.etat) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/evenements/${id}`, {
        ...form,
        clubId: Number(form.clubId),
      });

      toast.success("Événement modifié avec succès !");
      router.push("/dashboard/evenements");
    } catch (err: any) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------------- LOADING ----------------------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-orange-500 border-b-4"></div>
      </div>
    );
  }

  // ---------------------- PAGE UI ----------------------
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">

        {/* BACK BUTTON */}
        <Button
          variant="ghost"
          className="mb-6 flex items-center gap-2 text-gray-700 hover:text-orange-600"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-5 h-5" />
          Retour
        </Button>

        {/* MAIN CARD */}
        <Card className="border-none shadow-lg rounded-2xl">
          <CardHeader className="border-b bg-white px-8 py-6">
            <CardTitle className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Calendar className="w-8 h-8 text-orange-600" />
              Modifier l'événement
            </CardTitle>
            <p className="text-gray-600 mt-1">
              Modifiez les informations et mettez à jour votre événement.
            </p>
          </CardHeader>

          <CardContent className="px-8 py-10">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* TITLE */}
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Titre</Label>
                <Input
                  value={form.titre}
                  onChange={(e) => setForm({ ...form, titre: e.target.value })}
                  className="h-12"
                  required
                />
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <Label className="font-semibold text-gray-700">Description</Label>
                <Textarea
                  rows={6}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* DATE – HEURE */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={form.dateEvenement}
                    onChange={(e) => setForm({ ...form, dateEvenement: e.target.value })}
                    className="h-12"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Heure</Label>
                  <Input
                    type="time"
                    value={form.heure}
                    onChange={(e) => setForm({ ...form, heure: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>

              {/* LIEU */}
              <div className="space-y-2">
                <Label>Lieu</Label>
                <Input
                  value={form.lieu}
                  onChange={(e) => setForm({ ...form, lieu: e.target.value })}
                  className="h-12"
                />
              </div>

              {/* ETAT */}
              <div className="space-y-2">
                <Label>État</Label>
                <Select
                  value={form.etat}
                  onValueChange={(v) => setForm({ ...form, etat: v as EtatEvenement })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choisir l'état" />
                  </SelectTrigger>
                  <SelectContent>
                    {EtatOptions.map(o => (
                      <SelectItem value={o.value} key={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* VISIBILITY */}
              <div className="rounded-xl p-5 bg-orange-50 border border-orange-200">
                <div className="flex gap-3 items-start">
                  <Checkbox
                    checked={form.estPublic}
                    onCheckedChange={(v) => setForm({ ...form, estPublic: v as boolean })}
                  />
                  <div>
                    <p className="font-semibold flex gap-2">
                      {form.estPublic ? (
                        <Globe className="w-5 h-5 text-green-600" />
                      ) : (
                        <Lock className="w-5 h-5 text-orange-600" />
                      )}
                      {form.estPublic ? "Événement public" : "Événement privé"}
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      {form.estPublic
                        ? "Accessible à tous les étudiants."
                        : "Réservé aux membres du club."}
                    </p>
                  </div>
                </div>
              </div>

              {/* CLUB */}
              <div className="space-y-2">
                <Label>Club organisateur</Label>
                <Select
                  value={form.clubId}
                  onValueChange={(v) => setForm({ ...form, clubId: v })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {clubs.map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* BUTTONS */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Button variant="outline" onClick={() => router.back()}>
                  Annuler
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-8 py-6"
                >
                  {submitting ? "Mise à jour..." : "Enregistrer les modifications"}
                </Button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
