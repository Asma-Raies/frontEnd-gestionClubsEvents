"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { parseJwt } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LogIn, AlertCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast"; // ✅ ajouter toast

type Authority = { authority: string };

type LoginResponse = {
  token?: string;
  user?: {
    id?: number | string;
    nom?: string;
    email?: string;
    username?: string;
    role?: string;
    enabled?: boolean; // ✅ pour savoir si l'étudiant est activé
    roles?: string[];
    authorities?: Authority[];
  };
};

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const getRoleFromPayload = (payload: any): string => {
    if (!payload) return "ETUDIANT";
    const role =
      payload.role ??
      payload.roles?.[0] ??
      payload.authorities?.[0]?.authority;
    if (!role) return "ETUDIANT";
    return role.replace(/^ROLE_/, "").toUpperCase();
  };

  const redirectBasedOnRole = (role: string) => {
    if (role === "ADMIN") router.push("/dashboard");
    else if (role === "MODERATEUR") router.push("/dashboard-moderateur");
    else router.push("/dashboard-etudiant"); // Étudiant ou par défaut
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:8001/api/auth/login",
        { email: identifier.trim(), password },
        { timeout: 10000 }
      );

      const token = response.data?.token;
      if (!token) {
        setError("Token manquant. Contactez l'administrateur.");
        return;
      }

      localStorage.setItem("token", token);

      const jwtPayload = parseJwt<any>(token) || {};
      const userFromResponse = response.data.user;

      const user = {
        id: userFromResponse?.id || jwtPayload.userId || jwtPayload.sub,
        nom: userFromResponse?.nom || jwtPayload.name || jwtPayload.nom,
        email: userFromResponse?.email || jwtPayload.email || jwtPayload.sub,
        role: getRoleFromPayload(userFromResponse || jwtPayload),
        enabled: userFromResponse?.enabled ?? true, // ✅ vérifier si activé
        roles: userFromResponse?.roles || jwtPayload.roles || [],
      };

      localStorage.setItem("user", JSON.stringify(user));

      // Gestion spéciale pour les étudiants
      if (user.role === "ETUDIANT" && !user.enabled) {
        toast(
          "Votre compte est encore en cours d'entretien ou non activé. Veuillez patienter.",
          { icon: "⏳", duration: 6000 }
        );
      } else {
        // REDIRECTION
        redirectBasedOnRole(user.role);
      }
    } catch (err: any) {
      console.error("Erreur de connexion:", err);
      const msg =
        err.response?.status === 401
          ? "Email ou mot de passe incorrect"
          : "Erreur de connexion. Vérifiez votre réseau.";
      setError(msg);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50 px-4">
      <Toaster /> {/* ✅ Ajouter le composant toast */}
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center">
            <LogIn className="h-10 w-10 text-orange-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Connexion</CardTitle>
          <CardDescription>
            Accédez à votre espace selon votre rôle
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                disabled={loading}
                className="mt-2 h-12"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Mot de passe</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="mt-2 h-12"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-orange-600 hover:bg-orange-700"
              disabled={loading}
            >
              {loading ? (
                "Connexion en cours..."
              ) : (
                <>
                  <LogIn className="mr-2 h-5 w-5" />
                  Se connecter
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
