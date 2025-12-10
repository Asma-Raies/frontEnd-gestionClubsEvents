// app/dashboard-moderateur/my-club/events/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";

export default function EditEventPage() {
  const router = useRouter();
  const { id } = useParams();
  const [event, setEvent] = useState<any>(null);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    dateEvenement: "",
    heure: "",
    lieu: "",
    estPublic: true
  });

  useEffect(() => {
    api.get(`/evenements/${id}`)
      .then(res => {
        const e = res.data;
        setEvent(e);
        setForm({
          titre: e.titre,
          description: e.description || "",
          dateEvenement: e.dateEvenement,
          heure: e.heure,
          lieu: e.lieu || "",
          estPublic: e.estPublic
        });
      })
      .catch(() => toast.error("Erreur chargement"));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/evenements/my-club/${id}`, form);
      toast.success("Événement modifié !");
      router.push("/dashboard-moderateur/myClub/evenements");
    } catch (err) {
      toast.error("Erreur modification");
    }
  };

  if (!event) return <div>Chargement...</div>;

  return (
    <div className="p-10 max-w-4xl mx-auto">
      <h1 className="text-5xl font-extrabold mb-10">
        Modifier <span className="text-orange-600">Modifier</span> l’événement
      </h1>
      <Card className="p-10 shadow-2xl rounded-3xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="text-lg font-bold text-gray-700">Titre de l’événement</label>
            <Input
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              placeholder="Ex: Hackathon ITBS 2025"
              required
              className="mt-2 text-lg"
            />
          </div>

          <div>
            <label className="text-lg font-bold text-gray-700">Description</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Décrivez l'événement..."
              rows={6}
              required
              className="mt-2"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="text-lg font-bold text-gray-700">Date</label>
              <Input
                type="date"
                value={form.dateEvenement}
                onChange={(e) => setForm({ ...form, dateEvenement: e.target.value })}
                required
                className="mt-2"
              />
            </div>
            <div>
              <label className="text-lg font-bold text-gray-700">Heure</label>
              <Input
                type="time"
                value={form.heure}
                onChange={(e) => setForm({ ...form, heure: e.target.value })}
                required
                className="mt-2"
              />
            </div>
          </div>

          <div>
            <label className="text-lg font-bold text-gray-700">Lieu</label>
            <Input
              value={form.lieu}
              onChange={(e) => setForm({ ...form, lieu: e.target.value })}
              placeholder="Ex: Amphithéâtre A, Salle B12..."
              required
              className="mt-2"
            />
          </div>

          <div className="flex items-center gap-4">
            <Switch
              checked={form.estPublic}
              onCheckedChange={(checked) => setForm({ ...form, estPublic: checked })}
            />
            <label className="text-lg font-medium">
              {form.estPublic ? "Événement Public" : "Événement Privé (membres seulement)"}
            </label>
          </div>

          <div className="flex gap-6 pt-8">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              size="lg"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              Modifier l’événement
            </Button>
          </div>
        </form>
        </Card>
    </div>
  );
}