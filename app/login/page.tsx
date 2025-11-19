"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:8001/api/auth/login", {
        email: identifier,      // ou "email" selon ton backend
        password,
      });

      // La plupart des backends Spring Boot JWT renvoient quelque chose comme ça :
     
      const { token } = response.data;

      localStorage.setItem("token", token);
     // localStorage.setItem("user", JSON.stringify(user));

      router.push("/dashboard");
    } catch (err: any) {
      setError("Identifiants incorrects invalides ou serveur injoignable");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-xl">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Connexion - Gestion Clubs
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Username ou Email</label>
            <input
              type="text"
              required
              className="w-full rounded border border-gray-300 px-4 py-3 mt-1"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
            <input
              type="password"
              required
              className="w-full rounded border border-gray-300 px-4 py-3 mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            className="w-full rounded bg-indigo-600 py-3 text-white hover:bg-indigo-700"
          >
            Se connecter
          </button>
        </form>

        
      </div>
    </div>
  );
}