// app/dashboard/moderateur/page.tsx → DASHBOARD MODÉRATEUR
"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Calendar, MessageCircle } from "lucide-react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function ModeratorDashboard() {
  const [stats, setStats] = useState({
    membres: 0,
    evenements: 0,
    blogs: 0
  });

  useEffect(() => {
    api.get("/clubs/my")
      .then(res => {
        setStats({
          membres: res.data.membresCount,
          evenements: res.data.evenementsCount,
          blogs: res.data.blogsCount || 0 // Si tu as des blogs par club
        });
      })
      .catch(err => toast.error("Erreur chargement"));
  }, []);

  return (
    <div className="p-12">
      <h1 className="text-4xl font-bold mb-8">Dashboard Modérateur</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="p-8 text-center">
          <Users className="w-16 h-16 mx-auto mb-4 text-orange-600" />
          <h3 className="text-4xl font-black">{stats.membres}</h3>
          <p className="text-xl">Membres</p>
        </Card>
        <Card className="p-8 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-orange-600" />
          <h3 className="text-4xl font-black">{stats.evenements}</h3>
          <p className="text-xl">Événements</p>
        </Card>
        <Card className="p-8 text-center">
          <MessageCircle className="w-16 h-16 mx-auto mb-4 text-orange-600" />
          <h3 className="text-4xl font-black">{stats.blogs}</h3>
          <p className="text-xl">Blogs</p>
        </Card>
      </div>
    </div>
  );
}