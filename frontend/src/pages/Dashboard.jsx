import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Route,
  BarChart3,
  History,
  Globe,
  Building2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Activity,
  ArrowRight,
  Users,
  Server,
} from "lucide-react";
import {
  getCurrentLocation,
  fetchServerInfoWithMeta,
  fetchAllCitiesWithMeta,
} from "../services/api";
import { useTheme } from "../context/ThemeContext";
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
    color: "from-green-500 to-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    title: "Statistiques",
    description: "Analyse des trajets",
    icon: BarChart3,
    path: "/statistics",
    color: "from-red-500 to-purple-600",
    bgColor: "bg-violet-50",
  },
  {
    title: "Historique",
    description: "Voir vos trajets",
    icon: History,
    path: "/history",
    color: "from-cyan-500 to-yellow-600",
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

export default function Dashboard() {
  const { darkMode } = useTheme();
  const [serviceStatus, setServiceStatus] = useState("checking");
  const [citiesCount, setCitiesCount] = useState(0);
  const [location, setLocation] = useState(null);
  const [, setLocationFallback] = useState(false);
  const [serverInfo, setServerInfo] = useState(null);
  const [serverCached, setServerCached] = useState(false);
  const [serverTs, setServerTs] = useState(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      let citiesOk = false;
      let serverOk = false;
      try {
        // start checking
        setServiceStatus("checking");

        // Get cities count
        try {
          const citiesMeta = await fetchAllCitiesWithMeta();
          setCitiesCount(citiesMeta.data?.length || 30); // Default to 30 Moroccan cities
          const now = Date.now();
          const citiesFresh =
            !citiesMeta.cached || now - citiesMeta.ts < 60 * 1000;
          if (citiesMeta.data && citiesFresh) citiesOk = true;
        } catch (e) {
          setCitiesCount(30); // Fallback to known city count
          console.log("Cities count fallback");
        }

        // Get server info (with metadata)
        try {
          const server = await fetchServerInfoWithMeta();
          setServerInfo(server.data);
          setServerCached(!!server.cached);
          setServerTs(server.ts || null);
          // serverOk if it was fetched freshly or cached recently (within TTL)
          const now = Date.now();
          const serverFresh = !server.cached || now - server.ts < 60 * 1000;
          if (server.data && serverFresh) {
            serverOk = true;
          }
        } catch (e) {
          console.log("Server info not available");
        }

        // Get location
        try {
          const loc = await getCurrentLocation();
          setLocation(loc);
        } catch (e) {
          // Fallback to default location (Casablanca)
          setLocation({ city: "Casablanca", country: "Morocco" });
          setLocationFallback(true);
          console.log("Location not available, using default");
        }
      } catch (error) {
        setServiceStatus("offline");
        toast.error("Service indisponible");
      } finally {
        // If serviceStatus wasn't set online by server result, determine based on cached successes
        if (serverOk || citiesOk) {
          setServiceStatus("online");
        } else {
          setServiceStatus("offline");
        }
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
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
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2
          className={`text-xl font-bold mb-4 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          Actions Rapides
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-animate">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.path}
                to={action.path}
                className={`group rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 animate-card hover-lift ${
                  darkMode
                    ? "bg-slate-800 border border-slate-700"
                    : "bg-white border border-gray-100"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                >
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3
                  className={`font-bold text-lg mb-1 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {action.title}
                </h3>
                <p
                  className={`text-sm mb-4 ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {action.description}
                </p>
                <div className="flex items-center text-primary-600 font-medium text-sm group-hover:gap-2 transition-all">
                  <span>Commencer</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-2 transition-transform duration-300" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Endpoints Card */}
        <div
          className={`rounded-2xl p-6 shadow-lg ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-100"
          }`}
        >
          <h3
            className={`font-bold text-lg mb-4 flex items-center gap-2 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                darkMode ? "bg-blue-900/50" : "bg-blue-100"
              }`}
            >
              <Activity
                className={`w-5 h-5 ${
                  darkMode ? "text-blue-400" : "text-blue-600"
                }`}
              />
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
                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                  darkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"
                }`}
              >
                <span
                  className={`px-2 py-1 rounded text-xs font-bold ${
                    endpoint.method === "POST"
                      ? darkMode
                        ? "bg-green-900/50 text-green-400"
                        : "bg-green-100 text-green-700"
                      : darkMode
                      ? "bg-blue-900/50 text-blue-400"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {endpoint.method}
                </span>
                <code
                  className={`text-sm flex-1 truncate ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {endpoint.path}
                </code>
                <span
                  className={`text-xs ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {endpoint.desc}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Server Info Card */}
        <div
          className={`rounded-2xl p-6 shadow-lg ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-100"
          }`}
        >
          <h3
            className={`font-bold text-lg mb-4 flex items-center gap-2 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                darkMode ? "bg-slate-700" : "bg-slate-100"
              }`}
            >
              <Server
                className={`w-5 h-5 ${
                  darkMode ? "text-slate-400" : "text-slate-600"
                }`}
              />
            </div>
            Informations Serveur
            {serverCached && (
              <span
                className={`ml-3 text-xs px-2 py-1 rounded-full font-semibold ${
                  serverTs && Date.now() - serverTs >= 60 * 1000
                    ? "bg-red-600 text-white"
                    : "bg-yellow-400 text-black"
                }`}
              >
                {serverTs && Date.now() - serverTs >= 60 * 1000
                  ? "Cache périmé"
                  : "Cache"}
              </span>
            )}
          </h3>
          {serverInfo ? (
            <>
              {!(
                serverInfo.serverHostname ||
                serverInfo.serverIp ||
                serverInfo.osName ||
                serverInfo.javaVersion
              ) && (
                <div
                  className={`text-sm text-yellow-500 mb-2 ${
                    darkMode ? "text-yellow-300" : "text-yellow-700"
                  }`}
                >
                  Some server information is missing (hostname / OS). It may be
                  due to the running environment (container / local).
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-xl ${
                      darkMode ? "bg-slate-700" : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Hostname
                    </p>
                    <p
                      className={`font-semibold truncate ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {serverInfo.serverHostname ||
                        serverInfo.hostname ||
                        serverInfo.host ||
                        "-"}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-xl ${
                      darkMode ? "bg-slate-700" : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      IP Serveur
                    </p>
                    <p
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {serverInfo.serverIp ||
                        serverInfo.ip ||
                        serverInfo.ipAddress ||
                        "-"}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-xl ${
                      darkMode ? "bg-slate-700" : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      OS
                    </p>
                    <p
                      className={`font-semibold truncate ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {serverInfo.osName && serverInfo.osVersion
                        ? `${serverInfo.osName} ${serverInfo.osVersion}`
                        : serverInfo.osName ||
                          serverInfo.os ||
                          serverInfo.operatingSystem ||
                          "-"}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-xl ${
                      darkMode ? "bg-slate-700" : "bg-gray-50"
                    }`}
                  >
                    <p
                      className={`text-xs mb-1 ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Java
                    </p>
                    <p
                      className={`font-semibold truncate ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {serverInfo.javaVersion || serverInfo.java || "-"}
                    </p>
                  </div>
                </div>
                <Link
                  to="/server"
                  className={`block w-full text-center py-3 rounded-xl font-medium transition-colors ${
                    darkMode
                      ? "bg-slate-700 hover:bg-slate-600 text-gray-200"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Voir plus de détails
                </Link>
              </div>
            </>
          ) : (
            <div
              className={`text-center py-8 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <Server className={`w-12 h-12 mx-auto mb-2 opacity-50`} />
              <p>Chargement des infos serveur...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
div;
