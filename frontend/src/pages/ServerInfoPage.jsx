import { useState, useEffect } from "react";
import {
  Server,
  Cpu,
  Globe,
  Activity,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  Wifi,
  Database,
  Code,
} from "lucide-react";
import { getServerInfo } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

export default function ServerInfoPage() {
  const { darkMode } = useTheme();
  const [serverInfo, setServerInfo] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchServerInfo = async () => {
    setLoading(true);
    try {
      const serverData = await getServerInfo();
      setServerInfo(serverData);
      // Skip health check to prevent proxy errors when backend is down
      setHealthStatus({ status: "unknown", message: "Health check disabled to prevent errors" });
      setLastRefresh(new Date());
      toast.success("Informations serveur actualisées");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la récupération");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServerInfo();
    // Auto-refresh every 2 minutes (120000ms) to reduce proxy errors when backend is down
    const interval = setInterval(fetchServerInfo, 120000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy =
    healthStatus?.status === "UP" ||
    healthStatus?.status === "healthy" ||
    healthStatus?.status === "SUCCESS" ||
    healthStatus === "OK" ||
    serverInfo?.status === "SUCCESS";

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className={`text-2xl md:text-3xl font-bold ${
              darkMode ? "text-white" : "text-gray-800"
            } flex items-center gap-3`}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
              <Server className="w-6 h-6 text-white" />
            </div>
            Informations Serveur
          </h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>
            État et informations du microservice
          </p>
        </div>
        <button
          onClick={fetchServerInfo}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Last Refresh */}
      {lastRefresh && (
        <div
          className={`flex items-center gap-2 text-sm ${
            darkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          <Clock className="w-4 h-4" />
          Dernière mise à jour:{" "}
          {lastRefresh.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      )}

      {loading && !serverInfo ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* Health Status Banner */}
          <div
            className={`rounded-2xl p-6 ${
              isHealthy
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                : "bg-gradient-to-r from-red-500 to-red-600"
            } text-white shadow-lg`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isHealthy ? (
                  <CheckCircle className="w-12 h-12" />
                ) : (
                  <XCircle className="w-12 h-12" />
                )}
                <div>
                  <h2 className="text-2xl font-bold">
                    {isHealthy
                      ? "Service Opérationnel"
                      : "Service Indisponible"}
                  </h2>
                  <p className="text-white/80">
                    {isHealthy
                      ? "Tous les systèmes fonctionnent normalement"
                      : "Le service rencontre des problèmes"}
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Activity className="w-6 h-6 animate-pulse" />
                <span className="text-lg font-medium">
                  {healthStatus?.status || "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Server Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Hostname */}
            <div
              className={`${
                darkMode
                  ? "bg-slate-800/70 border-slate-700/50"
                  : "bg-white/70 border-white/50"
              } backdrop-blur-sm rounded-2xl shadow-lg border p-6`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Hostname
                  </p>
                  <p
                    className={`font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    } text-lg`}
                  >
                    {serverInfo?.serverHostname ||
                      serverInfo?.hostname ||
                      serverInfo?.host ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* IP Address */}
            <div
              className={`${
                darkMode
                  ? "bg-slate-800/70 border-slate-700/50"
                  : "bg-white/70 border-white/50"
              } backdrop-blur-sm rounded-2xl shadow-lg border p-6`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Adresse IP Serveur</p>
                  <p className="font-bold text-gray-800 text-lg">
                    {serverInfo?.serverIp ||
                      serverInfo?.ip ||
                      serverInfo?.ipAddress ||
                      "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Port */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Port</p>
                  <p className="font-bold text-gray-800 text-lg">
                    {serverInfo?.serverPort || serverInfo?.port || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* OS */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">
                    Système d&apos;Exploitation
                  </p>
                  <p className="font-bold text-gray-800">
                    {serverInfo?.osName && serverInfo?.osVersion
                      ? `${serverInfo.osName} ${serverInfo.osVersion}`
                      : serverInfo?.osName ||
                        serverInfo?.os ||
                        serverInfo?.operatingSystem ||
                        "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Java Version */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Version Java</p>
                  <p className="font-bold text-gray-800">
                    {serverInfo?.javaVersion || serverInfo?.java || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Localisation</p>
                  <p className="font-bold text-gray-800">
                    {serverInfo?.city && serverInfo?.country
                      ? `${serverInfo.city}, ${serverInfo.country}`
                      : serverInfo?.regionName || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Timezone */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fuseau Horaire</p>
                  <p className="font-bold text-gray-800">
                    {serverInfo?.timezone || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* ISP */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">ISP / Organisation</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {serverInfo?.isp || serverInfo?.org || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Client IP */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                  <Globe className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">IP Client</p>
                  <p className="font-bold text-gray-800 text-lg">
                    {serverInfo?.clientIp || "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coordinates */}
          {serverInfo?.latitude && serverInfo?.longitude && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-500" />
                Coordonnées Géographiques
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Latitude</p>
                  <p className="font-bold text-gray-800">
                    {serverInfo.latitude}°
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Longitude</p>
                  <p className="font-bold text-gray-800">
                    {serverInfo.longitude}°
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Région</p>
                  <p className="font-bold text-gray-800">
                    {serverInfo.regionName || "-"}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p className="font-bold text-gray-800 text-sm">
                    {serverInfo.timestamp || "-"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Raw Server Info */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Database className="w-5 h-5 text-slate-500" />
                Données Brutes du Serveur
              </h2>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-6 overflow-auto text-sm font-mono">
                {JSON.stringify(serverInfo, null, 2)}
              </pre>
            </div>
          </div>

          {/* Health Check Response */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Réponse Health Check
              </h2>
            </div>
            <div className="p-6">
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-6 overflow-auto text-sm font-mono">
                {JSON.stringify(healthStatus, null, 2)}
              </pre>
            </div>
          </div>

          {/* API Endpoints Info */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                Endpoints API Disponibles
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    method: "POST",
                    path: "/api/routes/coordinates",
                    desc: "Calcul itinéraire par coordonnées",
                  },
                  {
                    method: "POST",
                    path: "/api/routes/address",
                    desc: "Calcul itinéraire par adresses",
                  },
                  {
                    method: "POST",
                    path: "/api/routes/optimize",
                    desc: "Optimisation de tournée",
                  },
                  {
                    method: "POST",
                    path: "/api/routes/demande-info",
                    desc: "Demande avec infos utilisateur",
                  },
                  {
                    method: "GET",
                    path: "/api/routes/history",
                    desc: "Historique des trajets",
                  },
                  {
                    method: "GET",
                    path: "/api/routes/user-info",
                    desc: "Infos utilisateur complètes",
                  },
                  {
                    method: "GET",
                    path: "/api/routes/{id}",
                    desc: "Détail d'un trajet",
                  },
                  {
                    method: "GET",
                    path: "/api/routes/ville",
                    desc: "Liste des villes",
                  },
                  {
                    method: "GET",
                    path: "/api/routes/health",
                    desc: "Health check",
                  },
                  {
                    method: "GET",
                    path: "/api/location/current",
                    desc: "Localisation actuelle",
                  },
                  {
                    method: "GET",
                    path: "/api/location/ip/{ip}",
                    desc: "Localisation par IP",
                  },
                  {
                    method: "GET",
                    path: "/api/location/lookup",
                    desc: "Recherche localisation",
                  },
                  {
                    method: "POST",
                    path: "/api/location/refresh",
                    desc: "Rafraîchir localisation",
                  },
                  {
                    method: "GET",
                    path: "/api/location/server-info",
                    desc: "Infos serveur",
                  },
                ].map((endpoint, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        endpoint.method === "GET"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {endpoint.method}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-sm text-gray-700 truncate">
                        {endpoint.path}
                      </p>
                      <p className="text-xs text-gray-500">{endpoint.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
