"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { CheckCircle, XCircle, User } from "lucide-react";

interface PendingAccount {
  userId: number;
  prenom: string;
  nom: string;
  email: string;
  dateEntretien: string;
}

export default function PendingAccountsPage() {
  const [accounts, setAccounts] = useState<PendingAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/inscriptions/my-club/pending-accounts")
      .then(res => setAccounts(res.data))
      .catch(() => toast.error("Erreur chargement"))
      .finally(() => setLoading(false));
  }, []);

  const handleAccept = (userId: number, prenom: string) => {
    toast((t) => (
      <div className="p-4">
        <p className="mb-4">Voulez-vous accepter {prenom} ?</p>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Annuler</Button>
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={async () => {
              try {
                await api.post(`/inscriptions/moderateur/accept/${userId}`);
                setAccounts(prev => prev.filter(a => a.userId !== userId));
                toast.success(`${prenom} accepté !`);
              } catch {
                toast.error("Erreur lors de l'acceptation");
              } finally {
                toast.dismiss(t.id);
              }
            }}
          >
            Accepter
          </Button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  const handleReject = (userId: number, prenom: string) => {
    toast((t) => (
      <div className="p-4">
        <p className="mb-4">Voulez-vous supprimer le compte de {prenom} ?</p>
        <div className="flex gap-2 justify-end">
          <Button size="sm" variant="outline" onClick={() => toast.dismiss(t.id)}>Annuler</Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={async () => {
              try {
                await api.post(`/inscriptions/moderateur/refuse/${userId}`);
                setAccounts(prev => prev.filter(a => a.userId !== userId));
                toast.success(`${prenom} supprimé !`);
              } catch {
                toast.error("Erreur lors de la suppression");
              } finally {
                toast.dismiss(t.id);
              }
            }}
          >
            Supprimer
          </Button>
        </div>
      </div>
    ), { duration: 5000 });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Comptes en attente d'acceptation
      </h1>

      {accounts.length === 0 ? (
        <p className="text-center text-gray-500 text-xl">Aucune décision à prendre</p>
      ) : (
        <div className="space-y-6">
          {accounts.map(acc => (
            <Card key={acc.userId} className="p-4 border rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-4">
                <User className="w-10 h-10 text-orange-600" />
                <div>
                  <h2 className="font-semibold text-lg">{acc.prenom} {acc.nom}</h2>
                  <p className="text-sm text-gray-600">{acc.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(acc.userId, acc.prenom)}
                >
                  <XCircle className="w-4 h-4 mr-1" /> Refuser
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleAccept(acc.userId, acc.prenom)}
                >
                  <CheckCircle className="w-4 h-4 mr-1" /> Accepter
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
