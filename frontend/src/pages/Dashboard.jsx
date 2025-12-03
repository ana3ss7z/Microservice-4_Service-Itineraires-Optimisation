import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Route,
  Package,
  History,
  Globe,
  Building2,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  ArrowRight,
  Users,
  Server,
  User,
} from "lucide-react";
import {
  healthCheck,
  getAllCities,
  getCurrentLocation,
  getServerInfo,
} from "../services/api";
import toast from "react-hot-toast";

const quickActions = [
  {
    title: "Calculer Itinéraire",
    description: "Route entre deux points GPS",
    icon: MapPin,
    path: "/calculator",
    color: "from-emerald-500 to-emerald-600",
    bgColor: "bg-emerald-50",
  },
  {
    title: "Optimiser Tournée",
    description: "Multi-points TSP",
    icon: Route,
    path: "/optimizer",
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Demande Transport",
    description: "Avec volume & marchandise",
    icon: Package,
    path: "/demande",
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
  },
  {
    title: "Historique",
    description: "Voir vos trajets",
    icon: History,
    path: "/history",
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    title: "Infos Utilisateurs",
    description: "Données complètes",
    icon: Users,
    path: "/users",
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
  },
  {
    title: "Infos Serveur",
    description: "État du microservice",
    icon: Server,
    path: "/server",
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-50",
  },
];

// Utilisateurs prédéfinis basés sur la collection Postman
const predefinedUsers = [
  {
    id: "user123",
    name: "Ahmed Benali",
    email: "ahmed.benali@email.com",
    icon: "👨‍💼",
  },
  {
    id: "user456",
    name: "Fatima Alaoui",
    email: "fatima.alaoui@email.com",
    icon: "👩‍💼",
  },
  {
    id: "user789",
    name: "Omar Tazi",
    email: "omar.tazi@entreprise.ma",
    icon: "👨‍🔧",
  },
  {
    id: "user999",
    name: "Khadija Mansouri",
    email: "khadija@email.com",
    icon: "👩‍🏫",
  },
];

export default function Dashboard() {
  const [serviceStatus, setServiceStatus] = useState("checking");
  const [citiesCount, setCitiesCount] = useState(0);
  const [location, setLocation] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check service health
        await healthCheck();
        setServiceStatus("online");

        // Get cities count
        const cities = await getAllCities();
        setCitiesCount(cities.length);

        // Get server info
        try {
          const server = await getServerInfo();
          setServerInfo(server);
        } catch (e) {
          console.log("Server info not available");
        }

        // Get location
        try {
          const loc = await getCurrentLocation();
          setLocation(loc);
        } catch (e) {
          console.log("Location not available");
        }
      } catch (error) {
        setServiceStatus("offline");
        toast.error("Service indisponible");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-700 rounded-3xl p-8 text-white shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Bienvenue sur Itinéraires Maroc 🇲🇦
            </h1>
            <p className="text-primary-100 text-lg">
              Calculez et optimisez vos itinéraires à travers le Maroc
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                serviceStatus === "online"
                  ? "bg-green-400/20 text-green-100"
                  : serviceStatus === "offline"
                  ? "bg-red-400/20 text-red-100"
                  : "bg-yellow-400/20 text-yellow-100"
              }`}
            >
              {serviceStatus === "online" ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Service Opérationnel</span>
                </>
              ) : serviceStatus === "offline" ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Service Hors Ligne</span>
                </>
              ) : (
                <>
                  <Activity className="w-5 h-5 animate-pulse" />
                  <span className="font-medium">Vérification...</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-primary-200" />
              <div>
                <p className="text-primary-200 text-sm">Villes</p>
                <p className="text-2xl font-bold">{citiesCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Globe className="w-8 h-8 text-primary-200" />
              <div>
                <p className="text-primary-200 text-sm">Votre Position</p>
                <p className="text-lg font-bold truncate">
                  {location?.city || "N/A"}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-primary-200" />
              <div>
                <p className="text-primary-200 text-sm">Algorithme</p>
                <p className="text-lg font-bold">TSP Optimisé</p>
              </div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary-200" />
              <div>
                <p className="text-primary-200 text-sm">Vitesse Moy.</p>
                <p className="text-2xl font-bold">60 km/h</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Actions Rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 card-hover"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">
                  {action.title}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  {action.description}
                </p>
                <div className="flex items-center text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                  <span>Commencer</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 text-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            Utilisateurs Disponibles
          </h3>
          <Link
            to="/users"
            className="text-indigo-600 hover:text-indigo-800 font-medium text-sm flex items-center gap-1"
          >
            Voir tous
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {predefinedUsers.map((user) => (
            <Link
              key={user.id}
              to={`/users`}
              className="group p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl hover:from-indigo-50 hover:to-indigo-100 transition-all duration-200 border border-gray-200 hover:border-indigo-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white shadow flex items-center justify-center text-2xl">
                  {user.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.id}</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Endpoints Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            Endpoints API Disponibles
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {[
              {
                method: "POST",
                path: "/routes/coordinates",
                desc: "Calcul par GPS",
              },
              {
                method: "POST",
                path: "/routes/address",
                desc: "Calcul par adresse",
              },
              {
                method: "POST",
                path: "/routes/optimize",
                desc: "Optimisation TSP",
              },
              {
                method: "POST",
                path: "/routes/demande-info",
                desc: "Avec volume",
              },
              { method: "GET", path: "/routes/history", desc: "Historique" },
              {
                method: "GET",
                path: "/routes/user-info",
                desc: "Infos utilisateur",
              },
              { method: "GET", path: "/routes/{id}", desc: "Détail trajet" },
              { method: "GET", path: "/routes/ville", desc: "Villes" },
              { method: "GET", path: "/routes/health", desc: "Health check" },
              {
                method: "GET",
                path: "/location/current",
                desc: "Localisation",
              },
              { method: "GET", path: "/location/ip/{ip}", desc: "IP lookup" },
              { method: "POST", path: "/location/refresh", desc: "Refresh" },
              { method: "GET", path: "/location/server-info", desc: "Serveur" },
            ].map((endpoint, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    endpoint.method === "POST"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {endpoint.method}
                </span>
                <code className="text-sm text-gray-600 flex-1 truncate">
                  {endpoint.path}
                </code>
                <span className="text-xs text-gray-400">{endpoint.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Server Info Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
              <Server className="w-5 h-5 text-slate-600" />
            </div>
            Informations Serveur
          </h3>
          {serverInfo ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Hostname</p>
                  <p className="font-semibold text-gray-800 truncate">
                    {serverInfo.hostname || serverInfo.host || "-"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">IP Serveur</p>
                  <p className="font-semibold text-gray-800">
                    {serverInfo.ip || serverInfo.ipAddress || "-"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">OS</p>
                  <p className="font-semibold text-gray-800 truncate">
                    {serverInfo.os || serverInfo.operatingSystem || "-"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Java</p>
                  <p className="font-semibold text-gray-800 truncate">
                    {serverInfo.javaVersion || serverInfo.java || "-"}
                  </p>
                </div>
              </div>
              <Link
                to="/server"
                className="block w-full text-center py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
              >
                Voir plus de détails
              </Link>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Server className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Chargement des infos serveur...</p>
            </div>
          )}
        </div>
      </div>

      {/* Features Card */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          Fonctionnalités
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            {
              title: "Calcul Haversine",
              desc: "Distance à vol d'oiseau précise",
              icon: "📐",
            },
            {
              title: "Optimisation TSP",
              desc: "Algorithme du plus proche voisin",
              icon: "🔄",
            },
            {
              title: "Reverse Geocoding",
              desc: "Via Nominatim/OpenStreetMap",
              icon: "🗺️",
            },
            {
              title: "Multi-waypoints",
              desc: "Jusqu'à 15 points intermédiaires",
              icon: "📍",
            },
            {
              title: "Géolocalisation IP",
              desc: "Détection automatique position",
              icon: "🌍",
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
            >
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <p className="font-medium text-gray-800">{feature.title}</p>
                <p className="text-xs text-gray-500">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Info */}
      {location && (
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 text-white shadow-xl">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Globe className="w-6 h-6" />
            Votre Localisation Détectée
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-pink-100 text-sm">Ville</p>
              <p className="font-bold text-lg">{location.city || "N/A"}</p>
            </div>
            <div>
              <p className="text-pink-100 text-sm">Région</p>
              <p className="font-bold text-lg">
                {location.regionName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-pink-100 text-sm">Pays</p>
              <p className="font-bold text-lg">{location.country || "N/A"}</p>
            </div>
            <div>
              <p className="text-pink-100 text-sm">IP</p>
              <p className="font-bold text-lg">{location.ipAddress || "N/A"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
