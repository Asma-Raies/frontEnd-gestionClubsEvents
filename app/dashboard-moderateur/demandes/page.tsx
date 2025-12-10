// app/admin/demandes/page.tsx → DASHBOARD ADMIN : LISTE DES DEMANDES EN ATTENTE
"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import api from "@/lib/api";
import { CheckCircle, XCircle, Calendar, Mail, User, Phone, Clock, Building } from "lucide-react";

interface Demande {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  niveau: string;
  motivation: string;
  dateDemande: string;
  club: { id: number; nom: string };
}

export default function AdminDemandesPage() {
  const [demandes, setDemandes] = useState<Demande[]>([]);
  const [selectedDemande, setSelectedDemande] = useState<Demande | null>(null);
  const [dateEntretien, setDateEntretien] = useState("");

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const res = await api.get("/inscriptions/attente");
      setDemandes(res.data);
    } catch (err) {
      toast.error("Erreur chargement des demandes");
    }
  };

  const approuverDemande = async (demandeId: number) => {
    if (!dateEntretien) {
      toast.error("Veuillez sélectionner une date d'entretien");
      return;
    }

    try {
      await api.post(`/inscriptions/${demandeId}/approuver`, null, {
        params: { dateEntretien }
      });
      toast.success("Demande approuvée ! Email envoyé au candidat");
      setDemandes(demandes.filter(d => d.id !== demandeId));
      setSelectedDemande(null);
      setDateEntretien("");
    } catch (err: any) {
      toast.error(err.response?.data || "Erreur lors de l'approbation");
    }
  };

  const refuserDemande = async (demandeId: number) => {
    if (!confirm("Refuser cette demande ?")) return;

    try {
      await api.post(`/inscriptions/${demandeId}/refuser`);
      toast.success("Demande refusée");
      setDemandes(demandes.filter(d => d.id !== demandeId));
    } catch (err) {
      toast.error("Erreur");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black mb-4 text-orange-600">Demandes d'Inscription</h1>
          <p className="text-xl text-gray-600">Gérez les nouvelles demandes d'adhésion aux clubs</p>
        </div>

        {demandes.length === 0 ? (
          <Card className="p-20 text-center">
            <p className="text-2xl text-gray-500">Aucune demande en attente</p>
          </Card>
        ) : (
          <div className="grid gap-8">
            {demandes.map((demande) => (
              <Card key={demande.id} className="overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">
                        {demande.prenom} {demande.nom}
                      </h3>
                      <div className="flex items-center gap-6 text-gray-600">
                        <div className="flex items-center gap-2">
                          <Building className="w-5 h-5" />
                          <span className="font-medium">{demande.club.nom}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5" />
                          <span>{format(new Date(demande.dateDemande), "dd MMMM yyyy à HH:mm", { locale: fr })}</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-700 text-lg px-4 py-2">
                      En attente
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" />
                        <span>{demande.email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span>{demande.telephone}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <span>{demande.niveau}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-700 leading-relaxed italic">
                        "{demande.motivation}"
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-4">
                    <Button
                      onClick={() => setSelectedDemande(demande)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Approuver
                    </Button>
                    <Button
                      onClick={() => refuserDemande(demande.id)}
                      variant="outline"
                      className="flex-1 border-red-600 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-5 h-5 mr-2" />
                      Refuser
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modal Approbation */}
        {selectedDemande && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">
                Approuver la demande
              </h2>
              <p className="text-center text-gray-600 mb-8">
                <strong>{selectedDemande.prenom} {selectedDemande.nom}</strong><br />
                souhaite rejoindre <strong>{selectedDemande.club.nom}</strong>
              </p>

              <div className="mb-8">
                <label className="block text-lg font-medium mb-3">
                  <Clock className="inline w-5 h-5 mr-2" />
                  Date et heure de l'entretien
                </label>
                <Input
                  type="datetime-local"
                  value={dateEntretien}
                  onChange={(e) => setDateEntretien(e.target.value)}
                  className="w-full text-lg"
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setSelectedDemande(null);
                    setDateEntretien("");
                  }}
                >
                  Annuler
                </Button>
                <Button
                  onClick={() => approuverDemande(selectedDemande.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Confirmer & Envoyer Email
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}