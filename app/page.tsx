"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Calendar,
  Trophy,
  GraduationCap,
  Eye,
  UserPlus,
  Clock,
  MapPin,
} from "lucide-react";
import api from "@/lib/api";

export default function LandingPage() {
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/clubs");
        setClubs(res.data || []);

        const resu = await api.get("/evenements/public");
        setEvents(resu.data || []);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: GraduationCap,
      title: "À propos d'ITBS",
      description:
        "L'IT Business School est une université moderne qui encourage l'excellence académique et l'engagement étudiant.",
    },
    {
      icon: Users,
      title: "Nos Clubs",
      description:
        "Des clubs variés dans différents domaines : technologie, sport, culture, arts et bien plus encore pour développer vos compétences.",
    },
    {
      icon: Calendar,
      title: "Événements",
      description:
        "Participez à des événements enrichissants : conférences, workshops, compétitions et activités sociales tout au long de l'année.",
    },
    {
      icon: Trophy,
      title: "Opportunités",
      description:
        "Développez votre réseau, acquérez de nouvelles compétences et préparez-vous pour votre future carrière professionnelle.",
    },
  ];

  return (
    <>
      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3">
  {/* Logo Image */}
  <img
    src="/itbs.png"          
    alt="ITBS Logo"
    className="w-22 h-14 object-contain"
  />

</Link>
          <div className="flex items-center gap-10 text-lg font-medium">
            <Link href="#apropos" className="hover:text-orange-600 transition">
              À propos
            </Link>
            <Link href="#clubs" className="hover:text-orange-600 transition">
              Clubs
            </Link>
            <Link href="#evenements" className="hover:text-orange-600 transition">
              Événements
            </Link>
            <Link href="/login">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Connexion
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
  className="relative h-[90vh] w-full flex items-center justify-center text-white"
  style={{
    backgroundImage: "url('/itbs.jpg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>
  {/* Dark Overlay */}
  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

  {/* Content */}
  <div className="relative z-10 max-w-7xl mx-auto px-6 text-center animate-fadeIn">
    <h1 className="text-5xl md:text-7xl font-extrabold mb-8 leading-tight animate-slideUp">
      Bienvenue à{" "}
      <span className="block text-orange-400 drop-shadow-md">
        ITBS Clubs & Events
      </span>
    </h1>

    <p className="text-xl md:text-2xl mb-12 max-w-3xl mx-auto opacity-90 animate-slideUp delay-200">
      Rejoignez une communauté étudiante dynamique, développez vos passions
      et vivez une expérience universitaire inoubliable.
    </p>

    
  </div>
</section>


      {/* À propos */}
      <section id="apropos" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-6">
              À propos de notre plateforme
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez tout ce que ITBS a à offrir à ses étudiants
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {features.map((feature, i) => (
              <Card
                key={i}
                className="p-8 text-center hover:shadow-xl transition-shadow bg-white"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <feature.icon className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>

          <Card className="p-12 bg-white shadow-xl">
            <h3 className="text-4xl font-bold text-center mb-12">
              Comment ça marche ?
            </h3>
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { step: 1, title: "Explorez", desc: "Parcourez les clubs disponibles" },
                { step: 2, title: "Rejoignez", desc: "Cliquez sur Rejoindre" },
                { step: 3, title: "Participez", desc: "Commencez votre aventure" },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                    {item.step}
                  </div>
                  <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                  <p className="text-gray-600 text-lg">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Clubs */}
      <section id="clubs" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Nos Clubs</h2>
            <p className="text-2xl text-gray-600">
              Découvrez les clubs disponibles à ITBS
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {clubs.map((club: any) => (
              <Card
                key={club.id}
                className="overflow-hidden shadow-2xl hover:shadow-3xl transition-all rounded-2xl group"
              >
                <div className="h-64 relative overflow-hidden">
                  <img
                    src={
                      club.pathUrl
                        ? `http://localhost:8001${club.pathUrl}`
                        : "itbs.png"
                    }
                    alt={club.nom}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="p-6">
                  <Badge className="mb-3 bg-orange-600 text-white">
                    {club.category || "Club"}
                  </Badge>

                  <h3 className="text-2xl font-bold mb-3">{club.nom}</h3>

                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {club.description}
                  </p>

                  <div className="flex items-center gap-2 text-gray-500 mb-6">
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Membres</span>
                  </div>

                  <div className="flex gap-3">
                    <Button asChild variant="outline" className="flex-1">
                      <Link
                        href={`/clubs/${club.id}`}
                        className="flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" /> Voir détails
                      </Link>
                    </Button>

                    <Button
                      asChild
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Link
                        href={`/inscription/club?clubId=${club.id}`}
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" /> Rejoindre
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Events */}
      <section id="evenements" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">Événements à Venir</h2>
            <p className="text-2xl text-gray-600">
              Participez aux événements publics organisés par nos clubs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {events.map((event: any) => (
              <Card
                key={event.id}
                className="overflow-hidden shadow-2xl hover:shadow-3xl transition-all rounded-2xl group"
              >
            
                    <Badge className="top-4 right-4 mt-6 mr-8 bg-white text-orange-600 font-bold">
                      Public
                    </Badge>
                  
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-3">{event.titre}</h3>

                  <p className="text-gray-600 mb-5 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-3 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(event.date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{event.heure}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.lieu}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <Button asChild variant="outline" className="flex-1">
                      <Link href={`/evenements/${event.id}`}>
                        Voir détails
                      </Link>
                    </Button>

                    <Button
                      asChild
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      <Link href={`/inscription/evenement?eventId=${event.id}`}>
                        Participer
                      </Link>
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-4">
        <div className="max-w-7xl mx-auto px-6 text-center">
         
          <p className="text-gray-400 text-lg">
            © 2025 IT Business School • Tous droits réservés
          </p>
        </div>
      </footer>
    </>
  );
}
