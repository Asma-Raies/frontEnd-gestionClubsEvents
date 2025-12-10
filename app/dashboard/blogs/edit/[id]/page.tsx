// app/dashboard/blogs/edit/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function EditBlogPage() {
  const router = useRouter();
  const { id } = useParams();
  const [blog, setBlog] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [clubs, setClubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [titre, setTitre] = useState("");
  const [contenu, setContenu] = useState("");
  const [categorie, setCategorie] = useState("");
  const [selectedClub, setSelectedClub] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [fichier, setFichier] = useState<File | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, blogRes, clubsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get(`/blogs/${id}`),
          api.get("/clubs")
        ]);
        setCurrentUser(userRes.data);
        setClubs(clubsRes.data);
        const b = blogRes.data;
        setBlog(b);
        setTitre(b.titre);
        setContenu(b.contenu);
        setCategorie(b.categorie);
        setSelectedClub(b.clubId);
      } catch (err) {
        toast.error("Erreur chargement");
        router.push("/dashboard/blogs");
      }
    };
    fetchData();
  }, [id, router]);

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
      await api.put(`/blogs/${id}`, formData);
      toast.success("Blog mis à jour !");
      router.push("/dashboard/blogs");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur mise à jour");
    } finally {
      setLoading(false);
    }
  };

  if (!blog || !currentUser) return <div className="p-20 text-center">Chargement...</div>;

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Modifier la publication</h1>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-xl">

        {/* Club (Admin uniquement) */}
        {currentUser.role === "ADMIN" && (
          <Select value={selectedClub?.toString()} onValueChange={(v) => setSelectedClub(Number(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {clubs.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.nom}</SelectItem>)}
            </SelectContent>
          </Select>
        )}

        <Input value={titre} onChange={e => setTitre(e.target.value)} required />
        <Textarea value={contenu} onChange={e => setContenu(e.target.value)} rows={8} required />
        
        <Select value={categorie} onValueChange={setCategorie}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ANNONCE">Annonce</SelectItem>
            <SelectItem value="EVENEMENT">Événement</SelectItem>
            <SelectItem value="RESULTAT">Résultat</SelectItem>
            <SelectItem value="DISCUSSION">Discussion</SelectItem>
          </SelectContent>
        </Select>

        {blog.imageUrl && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Image actuelle :</p>
            <img src={`http://localhost:8001${blog.imageUrl}`} alt="" className="w-full max-h-64 object-cover rounded-lg" />
          </div>
        )}
        <div>
          <Label>Nouvelle image (facultatif)</Label>
          <Input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} />
        </div>

        {blog.fichierUrl && (
          <a href={`http://localhost:8001${blog.fichierUrl}`} className="text-orange-600">
            Fichier actuel : {blog.fichierNom}
          </a>
        )}
        <div>
          <Label>Nouveau fichier (facultatif)</Label>
          <Input type="file" onChange={e => setFichier(e.target.files?.[0] || null)} />
        </div>

        <div className="flex gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-700">
            {loading ? "Mise à jour..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </div>
  );
}