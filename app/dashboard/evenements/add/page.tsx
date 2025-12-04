"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Club {
  id: number;
  nom: string;
}
type etat =
  | "A_VENIR" | "EN_COURS" | "TERMINE" ;
const EtatEvenement = [
    { value: "A_VENIR", label: "A VENIR" },
    { value: "EN_COURS", label: "EN COURS" },
    { value: "TERMINE", label: "TERMINE" },];

export default function CreerEvenementPage() {
  const [form, setForm] = useState({
    titre: "",
    description: "",
    dateEvenement: "",
    heure: "",
    lieu: "",
    estPublic: false,
    clubId: "",
    etat: "" as etat | "",
    
  });
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        // CORRIGÉ : bonne route
        const res = await api.get("/clubs/mes-clubs");
        setClubs(res.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          toast.error("Vous n'êtes pas autorisé à créer un événement");
          router.push("/dashboard");
        } else {
          toast.error("Impossible de charger vos clubs");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/evenements", {
        ...form,
        clubId: Number(form.clubId),
      });
      toast.success("Événement créé avec succès !");
      router.push("/dashboard/evenements");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la création");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (clubs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Aucun club trouvé</h1>
        <p className="text-gray-600">
          Vous devez être modérateur d'un club pour créer un événement.
        </p>
        <Button className="mt-6" onClick={() => router.push("/dashboard/clubs")}>
          Voir les clubs
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h1 className="text-4xl font-bold text-center mb-10">Créer un nouvel événement</h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-10 rounded-3xl shadow-2xl">
        {/* Tous tes champs ici (identiques) */}
        <div className="space-y-2">
          <Label>Titre de l'événement</Label>
          <Input
            required
            value={form.titre}
            onChange={(e) => setForm({ ...form, titre: e.target.value })}
            placeholder="Journée Portes Ouvertes, Conférence IA..."
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            required
            rows={6}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <Label>Date</Label>
            <Input type="date" required value={form.dateEvenement} onChange={(e) => setForm({ ...form, dateEvenement: e.target.value })} />
          </div>
          <div>
            <Label>Heure</Label>
            <Input type="time" value={form.heure} onChange={(e) => setForm({ ...form, heure: e.target.value })} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Lieu</Label>
          <Input value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} placeholder="Amphi 1, Salle B12..." />
        </div>
        <div className="space-y-2">
              <Label>
                etat <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.etat}
                onValueChange={(v) => setForm({ ...form, etat: v as etat })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner l'etat" />
                </SelectTrigger>
                <SelectContent>
                  {EtatEvenement.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
        <div className="flex items-center space-x-3">
          <Checkbox
            id="public"
            checked={form.estPublic}
            onCheckedChange={(c) => setForm({ ...form, estPublic: c as boolean })}
          />
          <Label htmlFor="public">Événement public (tous les étudiants peuvent s'inscrire)</Label>
        </div>

        <div className="space-y-2">
          <Label>Organisé par</Label>
          <Select value={form.clubId} onValueChange={(v) => setForm({ ...form, clubId: v })} required>
            <SelectTrigger>
              <SelectValue placeholder="Choisir votre club" />
            </SelectTrigger>
            <SelectContent>
              {clubs.map((club) => (
                <SelectItem key={club.id} value={String(club.id)}>
                  {club.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" size="lg" className="bg-orange-600 hover:bg-orange-700">
            Créer l'événement
          </Button>
        </div>
      </form>
    </div>
  );
}