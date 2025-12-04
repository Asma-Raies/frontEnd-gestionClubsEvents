"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Building2, Image as ImageIcon, Loader2, X } from "lucide-react";
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

export default function AddClubPage() {
  const [formData, setFormData] = useState({
    nom: "",
    description: "",
    category: "" as Category | "",
    foundedDate: "",
    moderateurId: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [moderateurs, setModerateurs] = useState<Moderateur[]>([]);
  const [loadingMods, setLoadingMods] = useState(true);

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les modérateurs disponibles
  useEffect(() => {
    const fetchModerateurs = async () => {
      try {
        const res = await api.get("/moderateurs/available"); // Ton endpoint
        setModerateurs(res.data);
      } catch (err) {
        toast.error("Erreur lors du chargement des modérateurs");
        console.error(err);
      } finally {
        setLoadingMods(false);
      }
    };
    fetchModerateurs();
  }, []);

  // Gestion du logo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.type.startsWith("image/")) {
        toast.error("Veuillez sélectionner une image valide");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && dropped.type.startsWith("image/")) {
      setFile(dropped);
      setPreview(URL.createObjectURL(dropped));
    } else {
      toast.error("Veuillez déposer une image");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom.trim()) return toast.error("Le nom du club est requis");
    if (!formData.category) return toast.error("Veuillez choisir une catégorie");
    if (!formData.moderateurId) return toast.error("Veuillez sélectionner un modérateur");

    setLoading(true);

    try {
      const form = new FormData();

      const clubPayload = {
        nom: formData.nom.trim(),
        description: formData.description || null,
        category: formData.category,
        foundedDate: formData.foundedDate || null,
        isActive: true,
        moderateurId: Number(formData.moderateurId), // Clé attendue par le backend
      };

      form.append(
        "club",
        new Blob([JSON.stringify(clubPayload)], { type: "application/json" })
      );

      if (file) {
        form.append("logo", file);
      }

      await api.post("/clubs", form);

      toast.success(`Club "${formData.nom}" créé avec succès !`);
      router.push("/dashboard/clubs");
    } catch (err: any) {
      const message = err.response?.data?.message || "Erreur lors de la création du club";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <Toaster position="top-right" />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard/clubs")}
              disabled={loading}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <Building2 className="h-9 w-9 text-primary" />
              <CardTitle className="text-3xl font-bold">Créer un nouveau club</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Nom du club */}
            <div className="space-y-2">
              <Label htmlFor="nom">
                Nom du club <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nom"
                placeholder="Ex: Club Informatique ESI-SBA"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                disabled={loading}
                className="text-lg"
              />
            </div>

            {/* Catégorie */}
            <div className="space-y-2">
              <Label>
                Catégorie <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as Category })}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Modérateur */}
            <div className="space-y-2">
              <Label>
                Modérateur responsable <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.moderateurId}
                onValueChange={(v) => setFormData({ ...formData, moderateurId: v })}
                disabled={loading || loadingMods}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      loadingMods
                        ? "Chargement des modérateurs..."
                        : moderateurs.length === 0
                        ? "Aucun modérateur disponible"
                        : "Choisir un modérateur"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {moderateurs.length === 0 && !loadingMods ? (
                    <SelectItem value="none" disabled>
                      Aucun modérateur disponible
                    </SelectItem>
                  ) : (
                    moderateurs.map((mod) => (
                      <SelectItem key={mod.id} value={mod.id.toString()}>
                        {mod.prenom} {mod.nom}
                        {mod.email && (
                          <span className="text-muted-foreground ml-2 text-xs">
                            ({mod.email})
                          </span>
                        )}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Présentez les objectifs, activités et missions du club..."
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={loading}
                className="resize-none"
              />
            </div>

            {/* Logo */}
            <div className="space-y-3">
              <Label>Logo du club</Label>
              {!preview ? (
                <div
                  className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 ${
                    dragging ? "border-primary bg-primary/5" : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    Glissez-déposez une image ici ou <span className="text-primary underline">cliquez pour sélectionner</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF jusqu'à 5 Mo</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Aperçu du logo"
                      className="h-40 w-40 object-cover rounded-xl border-2 border-gray-200 shadow-md"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute -top-3 -right-3 rounded-full h-9 w-9"
                      onClick={removeImage}
                      disabled={loading}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div>
                    <p className="font-medium">{file?.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file?.size ? (file.size / 1024 / 1024).toFixed(2) : 0)} Mo
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Date de fondation */}
            <div className="space-y-2">
              <Label htmlFor="date">Date de création</Label>
              <Input
                id="date"
                type="date"
                value={formData.foundedDate}
                onChange={(e) => setFormData({ ...formData, foundedDate: e.target.value })}
                disabled={loading}
              />
            </div>

            {/* Boutons */}
            <div className="flex gap-4 pt-10">
              <Button type="submit" size="lg" className="flex-1" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer le club"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.push("/dashboard/clubs")}
                disabled={loading}
              >
                Annuler
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}