"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function EditUserPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const params = useParams();

  // SAFEST WAY: extract + convert to number
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const userId = rawId ? Number(rawId) : null;

  useEffect(() => {
    if (!userId || isNaN(userId)) {
      setError("ID invalide");
      setLoading(false);
      return;
    }

    console.log("Fetching user with ID:", userId); // ← check this in console!

    api
      .get(`/users/${userId}`)   // ← number, not string
      .then((res) => {
        console.log("User loaded:", res.data);
        setUser(res.data);
        setError(null);
      })
      .catch((err) => {
        console.error("Full error:", err);
        console.error("Response:", err.response?.data);
        console.error("Status:", err.response?.status);

        if (err.response?.status === 401) {
          setError("Vous n'êtes pas authentifié. Réconnectez-vous.");
        } else if (err.response?.status === 404) {
          setError(`Utilisateur non trouvé (ID: ${userId})`);
        } else {
          setError("Erreur serveur. Voir la console.");
        }
      })
      .finally(() => setLoading(false));
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      await api.put(`/users/${userId}`, user);
      router.push("/dashboard/users");
    } catch (err: any) {
      alert(err.response?.data?.message || "Erreur lors de la sauvegarde");
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{error}</p>
            <Button onClick={() => router.push("/dashboard/users")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour à la liste
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/users")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-2xl">
              Modifier l'utilisateur : {user.nom}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={user.nom || ""}
                onChange={(e) => setUser({ ...user, nom: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Prenom</Label>
              <Input
                value={user.prenom || ""}
                onChange={(e) => setUser({ ...user, prenom: e.target.value })}
                required
              />
            </div>


            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={user.email || ""}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                required />
            </div>

            

            <Button type="submit" className="w-full" size="lg">
              Sauvegarder
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}