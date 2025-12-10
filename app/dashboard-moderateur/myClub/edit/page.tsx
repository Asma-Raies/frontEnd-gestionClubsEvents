// app/dashboard/clubs/my/edit/page.tsx → MODIFIER LE CLUB
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function EditMyClubPage() {
  const router = useRouter();
  const [club, setClub] = useState<any>(null);
  const [form, setForm] = useState({
    nom: "",
    description: "",
    category: "",
    logo: null as File | null
  });

  useEffect(() => {
    api.get("/api/clubs/my")
      .then(res => {
        setClub(res.data);
        setForm({
          nom: res.data.nom,
          description: res.data.description,
          category: res.data.category,
          logo: null
        });
      })
      .catch(err => toast.error("Erreur"));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("club", new Blob([JSON.stringify(form)], { type: "application/json" }));
    if (form.logo) formData.append("logo", form.logo);

    try {
      await api.put("/clubs/my/" + club.id, formData);
      toast.success("Club mis à jour !");
      router.push("/dashboard/clubs/my");
    } catch (err) {
      toast.error("Erreur");
    }
  };

  if (!club) return <div>Chargement...</div>;

  return (
    <div className="p-12">
      <h1 className="text-4xl font-bold mb-8">Modifier Mon Club</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
        <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
        <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TECHNOLOGIE">Technologie</SelectItem>
            <SelectItem value="SPORT">Sport</SelectItem>
            <SelectItem value="ARTS">Arts & Culture</SelectItem>
            <SelectItem value="BUSINESS">Business</SelectItem>
          </SelectContent>
        </Select>
        <Input type="file" accept="image/*" onChange={e => setForm({ ...form, logo: e.target.files?.[0] || null })} />

        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">Enregistrer</Button>
      </form>
    </div>
  );
}