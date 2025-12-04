
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Building2, CalendarCheck, TrendingUp } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

interface Stats {
  totalUsers: number;
  totalClubs: number;
  totalEvents: number;
  upcomingEvents: number;
  monthlyActivity: { month: string; members: number; events: number }[];
  clubDistribution: { name: string; count: number; percentage: number; color: string }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/admin/stats")
      .then((res) => setStats(res.data))
      .catch(() => toast.error("Erreur de chargement des stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-96 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-10 text-center text-slate-500">
        Aucune statistique disponible
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />

      <div className="min-h-screen bg-gradient-to-b from-white via-orange-50/20 to-white">
        <div className="max-w-7xl mx-auto p-6 md:p-10 space-y-8">
          {/* HEADER */}
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
              Tableau de bord Admin
            </h1>
            <p className="text-slate-600">
              Suivi en temps réel de la plateforme
            </p>
          </div>

          {/* KPI CARDS — top of page */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <KpiCard
              icon={<Users className="w-5 h-5 text-orange-600" />}
              label="Utilisateurs"
              value={stats.totalUsers}
              badgeColor="bg-orange-100"
            />
            <KpiCard
              icon={<Building2 className="w-5 h-5 text-orange-600" />}
              label="Clubs"
              value={stats.totalClubs}
              badgeColor="bg-orange-100"
            />
            <KpiCard
              icon={<CalendarCheck className="w-5 h-5 text-orange-600" />}
              label="Événements"
              value={stats.totalEvents}
              badgeColor="bg-orange-100"
            />
            <KpiCard
              icon={<TrendingUp className="w-5 h-5 text-orange-600" />}
              label="À venir"
              value={stats.upcomingEvents}
              badgeColor="bg-orange-100"
            />
          </div>

          {/* CHARTS */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Activité Mensuelle */}
            <Card className="rounded-xl border border-orange-100/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800 flex items-center justify-between">
                  <span>Activité mensuelle</span>
                  <span className="text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    Membres & Événements
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.monthlyActivity || []} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: "#475569" }}
                        tickMargin={8}
                        axisLine={{ stroke: "#e2e8f0" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#475569" }}
                        axisLine={{ stroke: "#e2e8f0" }}
                        tickMargin={8}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid #f1f5f9",
                          boxShadow: "0 10px 24px rgba(2, 6, 23, 0.06)",
                        }}
                        labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="members"
                        name="Membres"
                        stroke="#0f172a"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#0f172a" }}
                        activeDot={{ r: 5 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="events"
                        name="Événements"
                        stroke="#f97316"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#f97316" }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Distribution des Clubs */}
            <Card className="rounded-xl border border-orange-100/50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-slate-800">Distribution des clubs</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[340px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.clubDistribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={2}
                        dataKey="count"
                        stroke="#fff"
                        strokeWidth={2}
                      >
                        {stats.clubDistribution?.map((entry, i) => (
                          <Cell key={i} fill={entry.color || "#f97316"} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          borderRadius: 10,
                          border: "1px solid #f1f5f9",
                          boxShadow: "0 10px 24px rgba(2, 6, 23, 0.06)",
                        }}
                        labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                        formatter={(value: any, _name: any, { payload }: any) => [
                          `${value} (${payload.percentage}%)`,
                          payload.name,
                        ]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
                  {stats.clubDistribution?.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3.5 h-3.5 rounded-full ring-2 ring-white shadow"
                          style={{ backgroundColor: c.color }}
                        />
                        <span className="text-sm font-medium text-slate-800">{c.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-700">
                        {c.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}

/** --- Small presentational component for KPIs --- */
function KpiCard({
  icon,
  label,
  value,
  badgeColor = "bg-orange-100",
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  badgeColor?: string;
}) {
  return (
    <Card className="rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 ${badgeColor} flex items-center justify-center rounded-full`}>
            {icon}
          </div>
          <div className="ml-auto text-right">
            <div className="text-2xl font-extrabold tracking-tight text-slate-900">
              {value}
            </div>
            <div className="text-xs uppercase tracking-wide text-slate-500">
              {label}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
