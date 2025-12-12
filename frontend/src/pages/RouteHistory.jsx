import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  History,
  Search,
  User,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Download,
  Filter,
  X,
} from "lucide-react";
import { getRouteHistory, getUserInfo, getRouteById } from "../services/api";
import { exportRoutesReport } from "../utils/exportUtils";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

export default function RouteHistory() {
  const { darkMode } = useTheme();
  const [userId, setUserId] = useState("user_001");
  const [routes, setRoutes] = useState([]);
  const [filteredRoutes, setFilteredRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [viewMode, setViewMode] = useState("history"); // 'history' or 'user-info'

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Apply filters whenever routes or filters change
  useEffect(() => {
    let result = [...routes];

    // Status filter
    if (statusFilter !== "all") {
      result = result.filter((r) => r.status === statusFilter);
    }

    // Search query filter - search in multiple fields
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((r) => {
        // Get all searchable text from the route
        const searchableFields = [
          r.originCity,
          r.destinationCity,
          r.adresseDepart,
          r.adresseDestination,
          r.originAddress,
          r.destinationAddress,
          r.natureMarchandise,
          r.routeId,
          r.id,
          r.userId,
          r.fullName,
          r.username,
        ];

        // Check if any field contains the search query
        return searchableFields.some(
          (field) => field && String(field).toLowerCase().includes(query)
        );
      });
    }

    setFilteredRoutes(result);
  }, [routes, statusFilter, searchQuery]);

  const handleExport = (format) => {
    if (filteredRoutes.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }
    exportRoutesReport(filteredRoutes, format);
    toast.success(`Export ${format.toUpperCase()} réussi!`);
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearchQuery("");
  };

  const fetchHistory = async () => {
    if (!userId.trim()) {
      toast.error("Veuillez entrer un ID utilisateur");
      return;
    }

    setLoading(true);
    try {
      if (viewMode === "history") {
        const response = await getRouteHistory(userId, page, pageSize);
        setRoutes(response.content || []);
        setTotalPages(response.totalPages || 0);
      } else {
        const response = await getUserInfo(userId, page, pageSize);
        setRoutes(response || []);
        setTotalPages(Math.ceil((response?.length || 0) / pageSize));
      }
    } catch (error) {
      toast.error(error.message || "Erreur lors de la récupération");
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const viewRouteDetails = async (routeId) => {
    try {
      const route = await getRouteById(routeId);
      setSelectedRoute(route);
    } catch (error) {
      toast.error("Erreur lors de la récupération des détails");
    }
  };

  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return "Non calculé";
    if (minutes === 0) return "Non calculé";
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours === 0) return `${mins} min`;
    return `${hours}h ${mins}min`;
  };

  const formatDistance = (km) => {
    if (km === null || km === undefined || km === 0) return "Non calculé";
    return `${km.toFixed(1)} km`;
  };

  // Clean city name - keep only first part (remove Arabic/Tifinagh scripts)
  const cleanCityName = (name) => {
    if (!name) return "N/A";
    // Split by space and take first part, or remove non-Latin characters
    const cleaned = name.split(" ")[0];
    // If the first part is still non-Latin, try to extract Latin text
    if (/^[\u0600-\u06FF\u2D30-\u2D7F]/.test(cleaned)) {
      // Arabic or Tifinagh first - try to find Latin text
      const latinMatch = name.match(/[A-Za-zÀ-ÿ]+/);
      return latinMatch ? latinMatch[0] : name.split(" ")[0];
    }
    return cleaned;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "Non disponible";
    try {
      // Handle various date formats from Java backend
      let date;
      if (Array.isArray(dateStr)) {
        // Handle LocalDateTime array format [year, month, day, hour, minute, second, nano]
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateStr;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else if (typeof dateStr === "string") {
        // Handle ISO string or other string formats
        date = new Date(dateStr);
      } else {
        return "Non disponible";
      }

      if (isNaN(date.getTime())) return "Non disponible";

      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Non disponible";
    }
  };

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <History className="w-6 h-6 text-white" />
            </div>
            Historique des Trajets
          </h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>
            Consultez l&apos;historique de vos calculs de routes
          </p>
        </div>

        {/* View Mode Toggle */}
        <div
          className={`flex items-center gap-2 ${
            darkMode ? "bg-slate-700" : "bg-gray-100"
          } p-1 rounded-xl`}
        >
          <button
            onClick={() => {
              setViewMode("history");
              setRoutes([]);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === "history"
                ? darkMode
                  ? "bg-slate-600 text-cyan-400 shadow-md"
                  : "bg-white text-cyan-600 shadow-md"
                : darkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <History className="w-4 h-4 inline mr-2" />
            Historique
          </button>
          <button
            onClick={() => {
              setViewMode("user-info");
              setRoutes([]);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === "user-info"
                ? darkMode
                  ? "bg-slate-600 text-cyan-400 shadow-md"
                  : "bg-white text-cyan-600 shadow-md"
                : darkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Info Utilisateur
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div
        className={`${
          darkMode
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-100"
        } rounded-2xl shadow-xl border p-6`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label
              className={`text-sm font-medium ${
                darkMode ? "text-gray-400" : "text-gray-600"
              } mb-2 block`}
            >
              Identifiant Utilisateur
            </label>
            <div className="relative">
              <User
                className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Ex: user_001, driver_007"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
                onKeyPress={(e) => e.key === "Enter" && fetchHistory()}
              />
            </div>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={fetchHistory}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Rechercher
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border transition-all flex items-center gap-2 ${
                showFilters
                  ? "bg-cyan-50 border-cyan-300 text-cyan-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search in results */}
              <div className="flex-1 min-w-[200px]">
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Rechercher dans les résultats
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ville, marchandise..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Statut
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                >
                  <option value="all">Tous</option>
                  <option value="SUCCESS">Succès</option>
                  <option value="ERROR">Erreur</option>
                </select>
              </div>

              {/* Export Buttons */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  Exporter
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleExport("json")}
                    className="px-3 py-2 bg-gray-700 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    JSON
                  </button>
                  <button
                    onClick={() => handleExport("csv")}
                    className="px-3 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    CSV
                  </button>
                </div>
              </div>

              {/* Clear Filters */}
              {(statusFilter !== "all" || searchQuery) && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Réinitialiser
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Area - Conditional based on viewMode */}
        <div
          className={`lg:col-span-2 rounded-2xl shadow-xl border overflow-hidden ${
            darkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-100"
          }`}
        >
          <div
            className={`px-6 py-4 border-b flex items-center justify-between ${
              darkMode ? "border-slate-700" : "border-gray-100"
            }`}
          >
            <h3
              className={`font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {viewMode === "history"
                ? "Historique des Trajets"
                : "Informations Utilisateur"}
            </h3>
            {viewMode === "history" && (
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {filteredRoutes.length} résultat(s)
                {filteredRoutes.length !== routes.length &&
                  ` (${routes.length} total)`}
              </span>
            )}
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <LoadingSpinner text="Chargement..." />
            </div>
          ) : viewMode === "user-info" ? (
            /* User Info Display */
            routes.length === 0 ? (
              <div className="p-12 text-center">
                <div
                  className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    darkMode ? "bg-slate-700" : "bg-gray-100"
                  }`}
                >
                  <User
                    className={`w-8 h-8 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
                <h4
                  className={`text-lg font-medium mb-2 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Aucune information
                </h4>
                <p className={darkMode ? "text-gray-500" : "text-gray-500"}>
                  Entrez un ID utilisateur et cliquez sur rechercher
                </p>
              </div>
            ) : (
              <div className="p-6">
                {/* User Profile Card */}
                <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl p-6 text-white mb-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {routes[0]?.fullName ||
                          routes[0]?.username ||
                          "Utilisateur"}
                      </h3>
                      <p className="text-cyan-100">
                        ID: {routes[0]?.userId || userId}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {routes[0]?.email && (
                      <div className="bg-white/10 rounded-xl p-3">
                        <p className="text-xs text-cyan-200 mb-1">Email</p>
                        <p className="font-medium truncate">
                          {routes[0].email}
                        </p>
                      </div>
                    )}
                    {routes[0]?.phone && (
                      <div className="bg-white/10 rounded-xl p-3">
                        <p className="text-xs text-cyan-200 mb-1">Téléphone</p>
                        <p className="font-medium">{routes[0].phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics Cards */}
                <h4
                  className={`font-semibold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Statistiques
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div
                    className={`rounded-xl p-4 text-center ${
                      darkMode ? "bg-emerald-900/30" : "bg-emerald-50"
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        darkMode ? "text-emerald-400" : "text-emerald-600"
                      }`}
                    >
                      {routes.length}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-emerald-300" : "text-emerald-700"
                      }`}
                    >
                      Total Trajets
                    </p>
                  </div>
                  <div
                    className={`rounded-xl p-4 text-center ${
                      darkMode ? "bg-blue-900/30" : "bg-blue-50"
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    >
                      {routes
                        .reduce(
                          (sum, r) =>
                            sum + (r.totalDistanceKm || r.distanceKm || 0),
                          0
                        )
                        .toFixed(1)}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      Distance totale (km)
                    </p>
                  </div>
                  <div
                    className={`rounded-xl p-4 text-center ${
                      darkMode ? "bg-purple-900/30" : "bg-purple-50"
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        darkMode ? "text-purple-400" : "text-purple-600"
                      }`}
                    >
                      {routes.filter((r) => r.status === "SUCCESS").length}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-purple-300" : "text-purple-700"
                      }`}
                    >
                      Trajets réussis
                    </p>
                  </div>
                  <div
                    className={`rounded-xl p-4 text-center ${
                      darkMode ? "bg-orange-900/30" : "bg-orange-50"
                    }`}
                  >
                    <p
                      className={`text-2xl font-bold ${
                        darkMode ? "text-orange-400" : "text-orange-600"
                      }`}
                    >
                      {routes
                        .reduce((sum, r) => sum + (r.volume || 0), 0)
                        .toFixed(1)}
                    </p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-orange-300" : "text-orange-700"
                      }`}
                    >
                      Volume total (m³)
                    </p>
                  </div>
                </div>

                {/* Recent Activity Summary */}
                <h4
                  className={`font-semibold mb-4 ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Activité récente
                </h4>
                <div className="space-y-3">
                  {routes.slice(0, 3).map((route, index) => (
                    <div
                      key={route.routeId || index}
                      className={`flex items-center gap-3 p-3 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          route.status === "SUCCESS"
                            ? "bg-emerald-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {cleanCityName(
                            route.originCity || route.adresseDepart
                          )}{" "}
                          →{" "}
                          {cleanCityName(
                            route.destinationCity || route.adresseDestination
                          )}
                        </p>
                        <p
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {formatDate(route.createdAt || route.calculatedAt)}
                        </p>
                      </div>
                      <span
                        className={`text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {formatDistance(
                          route.totalDistanceKm || route.distanceKm
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ) : filteredRoutes.length === 0 ? (
            <div className="p-12 text-center">
              <div
                className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  darkMode ? "bg-slate-700" : "bg-gray-100"
                }`}
              >
                <History
                  className={`w-8 h-8 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
              </div>
              <h4
                className={`text-lg font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Aucun résultat
              </h4>
              <p className={darkMode ? "text-gray-500" : "text-gray-500"}>
                {routes.length > 0
                  ? "Aucun trajet ne correspond aux filtres"
                  : "Entrez un ID utilisateur et cliquez sur rechercher"}
              </p>
            </div>
          ) : (
            <>
              <div
                className={`divide-y ${
                  darkMode ? "divide-slate-700" : "divide-gray-100"
                }`}
              >
                {filteredRoutes.map((route, index) => (
                  <div
                    key={route.routeId || route.id || index}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedRoute?.routeId === route.routeId
                        ? darkMode
                          ? "bg-cyan-900/30 border-l-4 border-cyan-500"
                          : "bg-cyan-50 border-l-4 border-cyan-500"
                        : darkMode
                        ? "hover:bg-slate-700"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => viewRouteDetails(route.routeId || route.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              route.status === "SUCCESS"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {route.status || "N/A"}
                          </span>
                          {route.isOptimized && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700">
                              Optimisé
                            </span>
                          )}
                        </div>

                        <div
                          className={`flex items-center gap-2 text-sm mb-1 ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span className="truncate max-w-xs">
                            {cleanCityName(
                              route.originCity || route.adresseDepart
                            )}
                          </span>
                          <ArrowRight
                            className={`w-4 h-4 ${
                              darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          />
                          <span className="truncate max-w-xs">
                            {cleanCityName(
                              route.destinationCity || route.adresseDestination
                            )}
                          </span>
                        </div>

                        <div
                          className={`flex items-center gap-4 text-sm mt-2 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {formatDistance(
                              route.totalDistanceKm || route.distanceKm
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDuration(
                              route.totalDurationMin || route.durationMin
                            )}
                          </span>
                          {route.volume && (
                            <span className="flex items-center gap-1 text-orange-600">
                              📦 {route.volume} m³
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p
                          className={`text-xs ${
                            darkMode ? "text-gray-500" : "text-gray-400"
                          }`}
                        >
                          {formatDate(route.createdAt || route.calculatedAt)}
                        </p>
                        <Link
                          to={`/route/${route.routeId || route.id}`}
                          className="mt-2 text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-5 h-5" />
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  className={`px-6 py-4 border-t flex items-center justify-between ${
                    darkMode ? "border-slate-700" : "border-gray-100"
                  }`}
                >
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className={`flex items-center gap-1 px-3 py-2 text-sm disabled:opacity-50 ${
                      darkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>
                  <span
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Page {page + 1} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className={`flex items-center gap-1 px-3 py-2 text-sm disabled:opacity-50 ${
                      darkMode
                        ? "text-gray-400 hover:text-gray-200"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Details Panel - Conditional based on viewMode */}
        <div
          className={`rounded-2xl shadow-xl border overflow-hidden ${
            darkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-100"
          }`}
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-500 to-cyan-600">
            <h3 className="font-bold text-white">
              {viewMode === "user-info" ? "Résumé" : "Détails du Trajet"}
            </h3>
          </div>

          {viewMode === "user-info" ? (
            /* User Summary Panel */
            routes.length > 0 ? (
              <div className="p-6 space-y-4">
                {/* User ID */}
                <div>
                  <p
                    className={`text-xs uppercase tracking-wide ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    ID Utilisateur
                  </p>
                  <code
                    className={`text-sm px-2 py-1 rounded block mt-1 overflow-x-auto ${
                      darkMode
                        ? "bg-slate-700 text-gray-300"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {routes[0]?.userId || userId}
                  </code>
                </div>

                {/* User Name */}
                {(routes[0]?.fullName || routes[0]?.username) && (
                  <div>
                    <p
                      className={`text-xs uppercase tracking-wide ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Nom
                    </p>
                    <p
                      className={`text-lg font-semibold mt-1 ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {routes[0]?.fullName || routes[0]?.username}
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="space-y-2">
                  {routes[0]?.email && (
                    <div
                      className={`flex items-center gap-2 p-3 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-gray-50"
                      }`}
                    >
                      <span className="text-gray-400">📧</span>
                      <div>
                        <p
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Email
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {routes[0].email}
                        </p>
                      </div>
                    </div>
                  )}
                  {routes[0]?.phone && (
                    <div
                      className={`flex items-center gap-2 p-3 rounded-xl ${
                        darkMode ? "bg-slate-700" : "bg-gray-50"
                      }`}
                    >
                      <span className="text-gray-400">📱</span>
                      <div>
                        <p
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Téléphone
                        </p>
                        <p
                          className={`text-sm font-medium ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {routes[0].phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-cyan-900/30" : "bg-cyan-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-2 ${
                      darkMode ? "text-cyan-300" : "text-cyan-700"
                    }`}
                  >
                    Récapitulatif
                  </p>
                  <div
                    className={`space-y-1 text-sm ${
                      darkMode ? "text-cyan-400" : "text-cyan-600"
                    }`}
                  >
                    <p>📊 {routes.length} trajet(s) total</p>
                    <p>
                      ✅ {routes.filter((r) => r.status === "SUCCESS").length}{" "}
                      réussi(s)
                    </p>
                    <p>
                      ❌ {routes.filter((r) => r.status !== "SUCCESS").length}{" "}
                      échoué(s)
                    </p>
                  </div>
                </div>

                {/* Distance Summary */}
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-emerald-900/30" : "bg-emerald-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-2 ${
                      darkMode ? "text-emerald-300" : "text-emerald-700"
                    }`}
                  >
                    Distance Parcourue
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      darkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    {routes
                      .reduce(
                        (sum, r) =>
                          sum + (r.totalDistanceKm || r.distanceKm || 0),
                        0
                      )
                      .toFixed(1)}{" "}
                    km
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <User
                  className={`w-12 h-12 mx-auto mb-4 ${
                    darkMode ? "text-gray-600" : "text-gray-300"
                  }`}
                />
                <p className={darkMode ? "text-gray-500" : "text-gray-500"}>
                  Recherchez un utilisateur pour voir son profil
                </p>
              </div>
            )
          ) : selectedRoute ? (
            <div className="p-6 space-y-4">
              {/* Route ID */}
              <div>
                <p
                  className={`text-xs uppercase tracking-wide ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Route ID
                </p>
                <code
                  className={`text-sm px-2 py-1 rounded block mt-1 overflow-x-auto ${
                    darkMode
                      ? "bg-slate-700 text-gray-300"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedRoute.routeId || selectedRoute.id}
                </code>
              </div>

              {/* Status */}
              <div>
                <p
                  className={`text-xs uppercase tracking-wide ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Statut
                </p>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                    selectedRoute.status === "SUCCESS"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {selectedRoute.status}
                </span>
              </div>

              {/* Distance & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  className={`rounded-xl p-4 ${
                    darkMode ? "bg-slate-700" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Distance
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {selectedRoute.totalDistanceKm?.toFixed(1) ||
                      selectedRoute.distanceKm?.toFixed(1) ||
                      "-"}{" "}
                    km
                  </p>
                </div>
                <div
                  className={`rounded-xl p-4 ${
                    darkMode ? "bg-slate-700" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Durée
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {formatDuration(
                      selectedRoute.totalDurationMin ||
                        selectedRoute.durationMin
                    )}
                  </p>
                </div>
              </div>

              {/* Origin & Destination */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5"></div>
                  <div>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Origine
                    </p>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {selectedRoute.originCity ||
                        selectedRoute.adresseDepart ||
                        "N/A"}
                    </p>
                    {selectedRoute.originLatitude && (
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {selectedRoute.originLatitude?.toFixed(4)},{" "}
                        {selectedRoute.originLongitude?.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
                <div
                  className={`ml-1.5 border-l-2 border-dashed h-4 ${
                    darkMode ? "border-gray-600" : "border-gray-300"
                  }`}
                ></div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 mt-1.5"></div>
                  <div>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Destination
                    </p>
                    <p
                      className={`font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {selectedRoute.destinationCity ||
                        selectedRoute.adresseDestination ||
                        "N/A"}
                    </p>
                    {selectedRoute.destinationLatitude && (
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      >
                        {selectedRoute.destinationLatitude?.toFixed(4)},{" "}
                        {selectedRoute.destinationLongitude?.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Waypoints (if available) - Show the route order between origin and destination */}
              {selectedRoute.steps && selectedRoute.steps.length > 0 && (
                <div
                  className={`rounded-xl p-4 ${
                    darkMode ? "bg-slate-700" : "bg-gray-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium mb-3 flex items-center gap-2 ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <ArrowRight className="w-4 h-4 text-emerald-500" />
                    Ordre du parcours
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedRoute.steps.map((step, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            index === 0
                              ? "bg-emerald-100 text-emerald-700 border border-emerald-500"
                              : index === selectedRoute.steps.length - 1
                              ? "bg-rose-100 text-rose-700 border border-rose-500"
                              : "bg-purple-100 text-purple-700 border border-purple-500"
                          }`}
                        >
                          <span className="font-bold mr-1">
                            {step.order || index + 1}.
                          </span>
                          {step.name || step.city || `Point ${index + 1}`}
                        </div>
                        {index < selectedRoute.steps.length - 1 && (
                          <ArrowRight className="w-3 h-3 text-gray-400 mx-1" />
                        )}
                      </div>
                    ))}
                    {selectedRoute.returnDistanceKm > 0 &&
                      selectedRoute.steps.length > 0 && (
                        <>
                          <ArrowRight className="w-3 h-3 text-orange-400 mx-1" />
                          <div className="px-2 py-1 rounded text-xs font-medium bg-orange-100 text-orange-700 border border-orange-500">
                            <span className="font-bold mr-1">Retour.</span>
                            {selectedRoute.steps[0].name ||
                              selectedRoute.steps[0].city ||
                              "Retour"}
                          </div>
                        </>
                      )}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {(selectedRoute.volume || selectedRoute.natureMarchandise) && (
                <div
                  className={`p-4 rounded-xl ${
                    darkMode ? "bg-orange-900/30" : "bg-orange-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      darkMode ? "text-orange-300" : "text-orange-700"
                    }`}
                  >
                    Marchandise
                  </p>
                  {selectedRoute.volume && (
                    <p
                      className={`text-sm ${
                        darkMode ? "text-orange-400" : "text-orange-600"
                      }`}
                    >
                      Volume: {selectedRoute.volume} m³
                    </p>
                  )}
                  {selectedRoute.natureMarchandise && (
                    <p
                      className={`text-sm ${
                        darkMode ? "text-orange-400" : "text-orange-600"
                      }`}
                    >
                      Nature: {selectedRoute.natureMarchandise}
                    </p>
                  )}
                </div>
              )}

              {/* Date */}
              <div>
                <p
                  className={`text-xs uppercase tracking-wide ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Créé le
                </p>
                <p
                  className={`text-sm font-medium mt-1 ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {formatDate(
                    selectedRoute.createdAt || selectedRoute.calculatedAt
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Eye
                className={`w-12 h-12 mx-auto mb-4 ${
                  darkMode ? "text-gray-600" : "text-gray-300"
                }`}
              />
              <p className={darkMode ? "text-gray-500" : "text-gray-500"}>
                Sélectionnez un trajet pour voir les détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
