"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

// shadcn/ui components
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { UserPlus, Trash2, Edit, School } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

interface User {
  id: number;
  nom: string;
  email: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [clubId, setClubId] = useState("");

  const router = useRouter();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Erreur chargement utilisateurs", err);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (id: number) => {
    setSelectedUserId(id);
    setDeleteDialogOpen(true);
  };

  const openAssignDialog = (id: number) => {
    setSelectedUserId(id);
    setAssignDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedUserId) return;
    await api.delete(`/users/${selectedUserId}`);
    setUsers(users.filter((u) => u.id !== selectedUserId));
    setDeleteDialogOpen(false);
  };

  const confirmAssignClub = async () => {
    if (!selectedUserId || !clubId.trim()) return;
    await api.post(`/users/${selectedUserId}/club/${clubId}`);
    setAssignDialogOpen(false);
    setClubId("");
    alert("Club assigné avec succès !");
  };

  const getRoleCount = (role: string) => users.filter(u => u.role === role).length;

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN": return "destructive";
      case "MODERATEUR": return "default";
      case "ETUDIANT": return "secondary";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Utilisateurs</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
          <Button onClick={() => router.push("/dashboard/users/add")} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Ajouter un utilisateur
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border">
          <CardContent className="text-center">
            <CardTitle className="text-lg font-bold">Total Users</CardTitle>
            <p className="text-3xl font-extrabold">{users.length}</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="text-center">
            <CardTitle className="text-lg font-bold">Étudiants</CardTitle>
            <p className="text-3xl font-extrabold">{getRoleCount("ETUDIANT")}</p>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="text-center">
            <CardTitle className="text-lg font-bold">Modérateurs</CardTitle>
            <p className="text-3xl font-extrabold">{getRoleCount("MODERATEUR")}</p>
          </CardContent>
        </Card>
      </div>
        {users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          <div className="rounded-md border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.nom}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/dashboard/users/edit/${user.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => openDeleteDialog(user.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openAssignDialog(user.id)}
                      >
                        <School className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dialog de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog d'assignation de club */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assigner un club</DialogTitle>
            <DialogDescription>
              Entrez l'ID du club à assigner à cet utilisateur
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clubId" className="text-right">
                ID Club
              </Label>
              <Input
                id="clubId"
                value={clubId}
                onChange={(e) => setClubId(e.target.value)}
                className="col-span-3"
                placeholder="Ex: 3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmAssignClub} disabled={!clubId.trim()}>
              Assigner
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}