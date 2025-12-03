import { useState, useEffect } from "react";
import {
  History,
  Search,
  User,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { getRouteHistory, getUserInfo, getRouteById } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function RouteHistory() {
  const [userId, setUserId] = useState("user_001");
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [viewMode, setViewMode] = useState("history"); // 'history' or 'user-info'

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
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    return `${hours}h ${mins}min`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
              <History className="w-6 h-6 text-white" />
            </div>
            Historique des Trajets
          </h1>
          <p className="text-gray-500 mt-1">
            Consultez l'historique de vos calculs de routes
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => {
              setViewMode("history");
              setRoutes([]);
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              viewMode === "history"
                ? "bg-white text-cyan-600 shadow-md"
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
                ? "bg-white text-cyan-600 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Info Utilisateur
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-gray-600 mb-2 block">
              Identifiant Utilisateur
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
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
          <div className="flex items-end">
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
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Routes List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">
              {viewMode === "history"
                ? "Historique"
                : "Informations Utilisateur"}
            </h3>
            <span className="text-sm text-gray-500">
              {routes.length} résultat(s)
            </span>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <LoadingSpinner text="Chargement..." />
            </div>
          ) : routes.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <History className="w-8 h-8 text-gray-400" />
              </div>
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Aucun résultat
              </h4>
              <p className="text-gray-500">
                Entrez un ID utilisateur et cliquez sur rechercher
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100">
                {routes.map((route, index) => (
                  <div
                    key={route.routeId || route.id || index}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      selectedRoute?.routeId === route.routeId
                        ? "bg-cyan-50 border-l-4 border-cyan-500"
                        : ""
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

                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span className="truncate max-w-xs">
                            {route.originCity || route.adresseDepart || "N/A"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-xs">
                            {route.destinationCity ||
                              route.adresseDestination ||
                              "N/A"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {route.totalDistanceKm?.toFixed(1) ||
                              route.distanceKm?.toFixed(1) ||
                              "-"}{" "}
                            km
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
                        <p className="text-xs text-gray-400">
                          {formatDate(route.createdAt || route.calculatedAt)}
                        </p>
                        <button className="mt-2 text-cyan-600 hover:text-cyan-700">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Précédent
                  </button>
                  <span className="text-sm text-gray-500">
                    Page {page + 1} sur {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                    disabled={page >= totalPages - 1}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    Suivant
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Route Details Panel */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-cyan-500 to-cyan-600">
            <h3 className="font-bold text-white">Détails du Trajet</h3>
          </div>

          {selectedRoute ? (
            <div className="p-6 space-y-4">
              {/* Route ID */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Route ID
                </p>
                <code className="text-sm bg-gray-100 px-2 py-1 rounded block mt-1 overflow-x-auto">
                  {selectedRoute.routeId || selectedRoute.id}
                </code>
              </div>

              {/* Status */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
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
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Distance</p>
                  <p className="text-xl font-bold text-gray-800">
                    {selectedRoute.totalDistanceKm?.toFixed(1) ||
                      selectedRoute.distanceKm?.toFixed(1) ||
                      "-"}{" "}
                    km
                  </p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-500">Durée</p>
                  <p className="text-xl font-bold text-gray-800">
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
                    <p className="text-xs text-gray-500">Origine</p>
                    <p className="font-medium">
                      {selectedRoute.originCity ||
                        selectedRoute.adresseDepart ||
                        "N/A"}
                    </p>
                    {selectedRoute.originLatitude && (
                      <p className="text-xs text-gray-400">
                        {selectedRoute.originLatitude?.toFixed(4)},{" "}
                        {selectedRoute.originLongitude?.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-4"></div>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 mt-1.5"></div>
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="font-medium">
                      {selectedRoute.destinationCity ||
                        selectedRoute.adresseDestination ||
                        "N/A"}
                    </p>
                    {selectedRoute.destinationLatitude && (
                      <p className="text-xs text-gray-400">
                        {selectedRoute.destinationLatitude?.toFixed(4)},{" "}
                        {selectedRoute.destinationLongitude?.toFixed(4)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Info */}
              {(selectedRoute.volume || selectedRoute.natureMarchandise) && (
                <div className="p-4 bg-orange-50 rounded-xl">
                  <p className="text-sm font-medium text-orange-700">
                    Marchandise
                  </p>
                  {selectedRoute.volume && (
                    <p className="text-sm text-orange-600">
                      Volume: {selectedRoute.volume} m³
                    </p>
                  )}
                  {selectedRoute.natureMarchandise && (
                    <p className="text-sm text-orange-600">
                      Nature: {selectedRoute.natureMarchandise}
                    </p>
                  )}
                </div>
              )}

              {/* Date */}
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Créé le
                </p>
                <p className="text-sm font-medium text-gray-700 mt-1">
                  {formatDate(
                    selectedRoute.createdAt || selectedRoute.calculatedAt
                  )}
                </p>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Eye className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Sélectionnez un trajet pour voir les détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
