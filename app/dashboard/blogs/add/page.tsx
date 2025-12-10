// app/dashboard/blogs/add/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function AddBlogPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [selectedClub, setSelectedClub] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [categorie, setCategorie] = useState("ANNONCE");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fichier, setFichier] = useState<File | null>(null);

  useEffect(() => {
    const fetch = async () => {
      const [userRes, clubsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/clubs")
      ]);
      setCurrentUser(userRes.data);
      setClubs(clubsRes.data);

      if (userRes.data.role === "MODERATEUR" && userRes.data.clubId) {
        setSelectedClub(userRes.data.clubId);
      }
    };
    fetch();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("blog", new Blob([JSON.stringify({
      titre, contenu, categorie,
      clubId: selectedClub
    })], { type: "application/json" }));

    if (imageFile) formData.append("image", imageFile);
    if (fichier) formData.append("fichier", fichier);

    try {
      await api.post("/blogs", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      toast.success("Publié !");
      router.push("/dashboard/blogs");
    } catch (err) {
      toast.error("Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) return <div>Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Nouvelle publication</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl">
        {/* Club */}
        {currentUser.role === "ADMIN" && (
          <Select onValueChange={(v) => setSelectedClub(Number(v))} required>
            <SelectTrigger><SelectValue placeholder="Choisir un club" /></SelectTrigger>
            <SelectContent>
              {clubs.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
        {currentUser.role === "MODERATEUR" && selectedClub && (
          <p className="text-lg font-medium">Club : {clubs.find(c => c.id === selectedClub)?.nom}</p>
        )}

        <Input placeholder="Titre" value={titre} onChange={e => setTitre(e.target.value)} required />
        <Textarea placeholder="Contenu" rows={6} value={contenu} onChange={e => setContenu(e.target.value)} required />
        <Select value={categorie} onValueChange={setCategorie}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ANNONCE">Annonce</SelectItem>
            <SelectItem value="EVENEMENT">Événement</SelectItem>
            <SelectItem value="RESULTAT">Résultat</SelectItem>
            <SelectItem value="DISCUSSION">Discussion</SelectItem>
          </SelectContent>
        </Select>

        <div>
          <Label>Image</Label>
          <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <Label>Fichier (PDF, TXT...)</Label>
          <Input type="file" onChange={e => setFichier(e.target.files?.[0] || null)} />
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-orange-600 hover:bg-orange-700">
          {loading ? "Publication..." : "Publier"}
        </Button>
      </form>
    </div>
  );
}