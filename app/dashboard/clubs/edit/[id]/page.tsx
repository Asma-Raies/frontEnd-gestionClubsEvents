"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Building2, Image as ImageIcon, Loader2, X, Trash2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

type Category =
  | "ACADEMIC"
  | "SPORTS"
  | "CULTURAL"
  | "TECHNICAL"
  | "SOCIAL"
  | "ARTISTIC"
  | "SCIENTIFIC"
  | "ENTREPRENEURSHIP"
  | "ENVIRONMENTAL"
  | "OTHER";

const categories = [
  { value: "ACADEMIC", label: "Académique" },
  { value: "SPORTS", label: "Sportif" },
  { value: "CULTURAL", label: "Culturel" },
  { value: "TECHNICAL", label: "Technique" },
  { value: "SOCIAL", label: "Social" },
  { value: "ARTISTIC", label: "Artistique" },
  { value: "SCIENTIFIC", label: "Scientifique" },
  { value: "ENTREPRENEURSHIP", label: "Entrepreneuriat" },
  { value: "ENVIRONMENTAL", label: "Environnemental" },
  { value: "OTHER", label: "Autre" },
];

type Moderateur = {
  id: number;
  nom: string;
  prenom: string;
  email?: string;
};

type ClubData = {
  id: number;
  nom: string;
  description: string | null;
  category: Category;
  foundedDate: string | null;
  pathUrl: string | null;
  moderateurId: number | null;
};

export default function EditClubPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    category: "" as Category | "",
    foundedDate: "",
    moderateurId: "", // sera "" ou "none" ou un ID
  });

  const [currentLogo, setCurrentLogo] = useState<string | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [moderateurs, setModerateurs] = useState<Moderateur[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubRes, modsRes] = await Promise.all([
          api.get(`/clubs/${id}`),
          api.get("/moderateurs/available"),
        ]);

        const club: ClubData = clubRes.data;

        setFormData({
          nom: club.nom,
          description: club.description || "",
          category: club.category,
          foundedDate: club.foundedDate || "",
          moderateurId: club.moderateurId ? club.moderateurId.toString() : "none",
        });

        setCurrentLogo(club.pathUrl ? `http://localhost:8001${club.pathUrl}` : null);
        setModerateurs(modsRes.data);
      } catch (err) {
        toast.error("Impossible de charger le club");
        router.push("/dashboard/clubs");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setNewFile(file);
      setPreview(URL.createObjectURL(file));
    } else if (file) {
      toast.error("Veuillez sélectionner une image valide");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setNewFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeNewLogo = () => {
    setNewFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom.trim()) return toast.error("Le nom est requis");
    if (!formData.category) return toast.error("La catégorie est requise");

    setSaving(true);

    try {
      const form = new FormData();

      const clubPayload = {
        nom: formData.nom.trim(),
        description: formData.description || null,
        category: formData.category,
        foundedDate: formData.foundedDate || null,
        moderateurId:
          formData.moderateurId && formData.moderateurId !== "none"
            ? Number(formData.moderateurId)
            : null,
      };

      form.append("club", new Blob([JSON.stringify(clubPayload)], { type: "application/json" }));
      if (newFile) form.append("logo", newFile);

      await api.put(`/clubs/${id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Club mis à jour avec succès !");
      router.push("/dashboard/clubs");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Toaster position="top-right" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/clubs")} disabled={saving}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Building2 className="h-9 w-9 text-primary" />
              <CardTitle className="text-3xl font-bold">Modifier le club</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-2">
              <Label htmlFor="nom">Nom du club *</Label>
              <Input id="nom" value={formData.nom} onChange={(e) => setFormData({ ...formData, nom: e.target.value })} disabled={saving} />
            </div>

            <div className="space-y-2">
              <Label>Catégorie *</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v as Category })} disabled={saving}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Modérateur responsable</Label>
              <Select
                value={formData.moderateurId || "none"}
                onValueChange={(v) => setFormData({ ...formData, moderateurId: v === "none" ? "" : v })}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Laisser vide pour ne pas changer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Aucun changement</SelectItem>
                  {moderateurs.map((mod) => (
                    <SelectItem key={mod.id} value={mod.id.toString()}>
                      {mod.prenom} {mod.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={saving}
                className="resize-none"
              />
            </div>

            {currentLogo && (
              <div className="space-y-3">
                <Label>Logo actuel</Label>
                <img src={currentLogo} alt="Logo actuel" className="h-40 w-40 object-cover rounded-xl border-2 border-gray-200 shadow-md" />
              </div>
            )}

            <div className="space-y-3">
              <Label>Nouveau logo (facultatif)</Label>
              {!preview ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${dragging ? "border-primary bg-primary/5" : "border-gray-300"}`}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">Glissez une image ou cliquez pour changer le logo</p>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </div>
              ) : (
                <div className="relative inline-block">
                  <img src={preview} alt="Nouveau logo" className="h-40 w-40 object-cover rounded-xl border-2 border-primary shadow-lg" />
                  <Button type="button" size="icon" variant="destructive" className="absolute -top-3 -right-3 rounded-full" onClick={removeNewLogo}>
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>

        

            <div className="flex gap-4 pt-10">
              <Button type="submit" size="lg" className="flex-1" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  "Enregistrer les modifications"
                )}
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => router.push("/dashboard/clubs")} disabled={saving}>
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}