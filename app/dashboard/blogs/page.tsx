// app/dashboard/blogs/page.tsx → VERSION FINALE (menu parfaitement aligné avec le badge)
"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Heart, MessageCircle, Download, Plus, Filter, Ban, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import Link from "next/link";
import api from "@/lib/api";
import { useRouter } from "next/navigation";

export default function BlogsFeedPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([]);
  const [clubs, setClubs] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>({});
  const [visibleComments, setVisibleComments] = useState<{ [key: number]: boolean }>({});

  const [selectedClub, setSelectedClub] = useState<string>("all");
  const [selectedCategorie, setSelectedCategorie] = useState<string>("all");

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, blogsRes, clubsRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/blogs/club/all?page=0&size=50"),
          api.get("/clubs")
        ]);
        setCurrentUser(userRes.data);
        setClubs(clubsRes.data);
        const allBlogs = blogsRes.data.content || [];
        setBlogs(allBlogs);
        setFilteredBlogs(allBlogs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // Filtre
  useEffect(() => {
    let filtered = blogs;
    if (selectedClub !== "all") filtered = filtered.filter(b => b.clubId === Number(selectedClub));
    if (selectedCategorie !== "all") filtered = filtered.filter(b => b.categorie === selectedCategorie);
    setFilteredBlogs(filtered);
  }, [selectedClub, selectedCategorie, blogs]);

  // Like
  const toggleLike = async (blogId: number) => {
    try {
      const res = await api.post(`/blogs/${blogId}/like`);
      setBlogs(blogs.map(b => b.id === blogId ? {
        ...b,
        likedByCurrentUser: res.data.liked,
        likesCount: res.data.likesCount
      } : b));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Impossible d'aimer");
    }
  };

  // Commentaire
  const addComment = async (blogId: number) => {
    const content = commentInputs[blogId];
    if (!content?.trim()) return;
    try {
      const res = await api.post(`/blogs/${blogId}/comment`, { contenu: content });
      setBlogs(blogs.map(b => b.id === blogId ? {
        ...b,
        commentaires: [...(b.commentaires || []), res.data]
      } : b));
      setCommentInputs({ ...commentInputs, [blogId]: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Impossible de commenter");
    }
  };

  // Supprimer
  const deleteBlog = async (blogId: number) => {
    if (!confirm("Supprimer cette publication ?")) return;
    try {
      await api.delete(`/blogs/${blogId}`);
      setBlogs(prev => prev.filter(b => b.id !== blogId));
      toast.success("Publication supprimée");
    } catch {
      toast.error("Erreur suppression");
    }
  };

  const toggleComments = (blogId: number) => {
    setVisibleComments(prev => ({ ...prev, [blogId]: !prev[blogId] }));
  };

  const canCreate = currentUser?.role === "ADMIN" || currentUser?.role === "MODERATEUR";
  const canEditDelete = (blog: any) =>
    currentUser?.role === "ADMIN" || (currentUser?.role === "MODERATEUR" && blog.clubId === currentUser.clubId);
  console.log(currentUser)
  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl text-gray-600">
        Chargement...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Blog & Interactions</h1>
            <p className="text-gray-600">Partagez et découvrez les actualités des clubs</p>
          </div>
          {canCreate && (
            <Button
              onClick={() => router.push("/dashboard/blogs/add")}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-6 py-3 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle publication
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

           {/* === FILTRES === */}
           <div className="lg:col-span-1">
            <Card className="p-6 shadow-lg rounded-2xl sticky top-24">
              <div className="flex items-center gap-3 mb-6">
                <Filter className="w-6 h-6 text-gray-700" />
                <h3 className="text-xl font-bold">Filtres</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Club</label>
                  <Select value={selectedClub} onValueChange={setSelectedClub}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tous les clubs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les clubs</SelectItem>
                      {clubs.map(club => (
                        <SelectItem key={club.id} value={club.id.toString()}>
                          {club.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 block mb-2">Catégorie</label>
                  <Select value={selectedCategorie} onValueChange={setSelectedCategorie}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes</SelectItem>
                      <SelectItem value="ANNONCE">Annonce</SelectItem>
                      <SelectItem value="EVENEMENT">Événement</SelectItem>
                      <SelectItem value="RESULTAT">Résultat</SelectItem>
                      <SelectItem value="DISCUSSION">Discussion</SelectItem>
                      <SelectItem value="TUTORIEL">Tutoriel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* Feed */}
          <div className="lg:col-span-3 space-y-6">
            {filteredBlogs.length === 0 ? (
              <Card className="p-20 text-center text-gray-500">Aucune publication trouvée</Card>
            ) : (
              filteredBlogs.map(blog => (
                <Card key={blog.id} className="overflow-hidden bg-white shadow-lg rounded-2xl">
                  {/* Header avec badge + menu alignés horizontalement */}
                  <div className="p-5 bg-white">
                    <div className="flex items-start justify-between">
                      {/* Auteur + infos */}
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 ring-2 ring-orange-200">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-pink-500 text-white font-bold">
                            {blog.auteurNomComplet.split(" ").map((n: string) => n[0]).join("").substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-bold text-gray-900">{blog.auteurNomComplet}</p>
                          <p className="text-sm text-gray-500">
                            <Link href={`/clubs/${blog.clubId}`} className="text-orange-600 font-medium hover:underline">
                              {blog.clubNom}
                            </Link>
                            {" • "}
                            {formatDistanceToNow(new Date(blog.datePublication), { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>

                      {/* Badge + Menu sur la même ligne */}
                      <div className="flex items-center gap-3">
                        <Badge className="bg-orange-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                          {blog.categorie}
                        </Badge>

                        {canEditDelete(blog) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-gray-100">
                                <MoreHorizontal className="h-5 w-5 text-gray-600" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => router.push(`/dashboard/blogs/edit/${blog.id}`)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                <Edit className="w-4 h-4" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => deleteBlog(blog.id)}
                                className="flex items-center gap-2 text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Contenu */}
                  <CardContent className="pt-4 pb-6 px-5">
                    <p className="text-gray-800 leading-relaxed text-lg">{blog.contenu}</p>

                    {blog.imageUrl && (
                      <img
                        src={`http://localhost:8001${blog.imageUrl}`}
                        alt={blog.titre}
                        className="w-full mt-5 rounded-xl shadow-md object-cover max-h-96"
                      />
                    )}

                    {blog.fichierUrl && (
                      <a
                        href={`http://localhost:8001${blog.fichierUrl}`}
                        download={blog.fichierNom}
                        className="inline-flex items-center gap-2 mt-4 text-orange-600 hover:underline font-medium"
                      >
                        <Download className="w-5 h-5" />
                        {blog.fichierNom || "Télécharger le fichier"}
                      </a>
                    )}
                  </CardContent>

                  {/* Interactions */}
                  <div className="px-5 py-4 border-t flex items-center justify-between text-gray-600">
                    <div className="flex items-center gap-8">
                      <button
                        onClick={() => toggleLike(blog.id)}
                        className="flex items-center gap-2 hover:text-red-600 transition font-medium"
                      >
                        <Heart className={`w-6 h-6 ${blog.likedByCurrentUser ? "fill-red-600 text-red-600" : ""}`} />
                        <span>{blog.likesCount}</span>
                      </button>

                      <button
                        onClick={() => toggleComments(blog.id)}
                        className="flex items-center gap-2 hover:text-orange-600 transition font-medium"
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span>{blog.commentaires?.length || 0}</span>
                      </button>
                    </div>
                  </div>

                  {/* Commentaires */}
                  {visibleComments[blog.id] && (
                    <div className="border-t px-5 py-5 space-y-4 bg-gray-50">
                      {blog.commentaires?.map((c: any) => (
                        <div key={c.id} className="flex gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{c.auteurNomComplet[0]}</AvatarFallback>
                          </Avatar>
                          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm flex-1">
                            <p className="font-semibold text-sm">{c.auteurNomComplet}</p>
                            <p className="text-gray-700">{c.contenu}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <Textarea
                          placeholder="Écrire un commentaire..."
                          value={commentInputs[blog.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [blog.id]: e.target.value })}
                          className="flex-1 resize-none"
                          rows={2}
                        />
                        <Button onClick={() => addComment(blog.id)} size="sm" className="h-12 bg-orange-600 hover:bg-orange-700">
                          Envoyer
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}