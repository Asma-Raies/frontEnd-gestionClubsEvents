// app/inscription/club/page.tsx → FORMULAIRE REJOINDRE UN CLUB (EXACTEMENT COMME TA PHOTO)
"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function JoinClubForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clubId = searchParams.get("clubId");

  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    niveau: "",
    motivation: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await api.post("/inscriptions/club", {
        ...form,
        clubId: Number(clubId)
      });
      toast.success("Demande envoyée ! L'administrateur vous contactera bientôt");
      router.push("/");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        {/* Close Button */}
        <button
          onClick={() => router.push("/")}
          className="absolute top-6 right-6 text-gray-500 hover:text-gray-700 z-10"
        >
          <X className="w-8 h-8" />
        </button>

        <div className="p-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3">Rejoindre Club Informatique</h1>
            <p className="text-gray-600 text-lg">
              Remplissez ce formulaire pour soumettre votre demande. L’administrateur examinera votre candidature et vous contactera.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom & Prénom */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-600">*</span>
                </label>
                <Input
                  placeholder="Votre nom"
                  required
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-red-600">*</span>
                </label>
                <Input
                  placeholder="Votre prénom"
                  required
                  value={form.prenom}
                  onChange={(e) => setForm({ ...form, prenom: e.target.value })}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-600">*</span>
              </label>
              <Input
                type="email"
                placeholder="votre.email@itbs.edu"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="+216 XX XXX XXX"
                required
                value={form.telephone}
                onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              />
            </div>

            {/* Niveau d'études */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d’études
              </label>
              <Input
                placeholder="Ex : L2 Informatique"
                required
                value={form.niveau}
                onChange={(e) => setForm({ ...form, niveau: e.target.value })}
              />
            </div>

            {/* Motivation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivation <span className="text-red-600">*</span>
              </label>
              <Textarea
                placeholder="Expliquez pourquoi vous voulez rejoindre ce club..."
                rows={5}
                required
                value={form.motivation}
                onChange={(e) => setForm({ ...form, motivation: e.target.value })}
                className="resize-none"
              />
            </div>

            {/* Note importante */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
              <p className="text-orange-800 font-medium">
                Note : Après avoir soumis ce formulaire, l’administrateur examinera votre demande. 
                Si elle est approuvée, un compte utilisateur sera créé pour vous et vous recevrez vos identifiants par email.
              </p>
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => router.push("/")}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                size="lg"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
              >
                Envoyer la demande
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}