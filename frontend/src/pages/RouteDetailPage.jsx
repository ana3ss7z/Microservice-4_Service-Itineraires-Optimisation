import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  MapPin,
  Clock,
  Navigation,
  ArrowLeft,
  User,
  Package,
  Route,
  CheckCircle,
  AlertCircle,
  Copy,
  ArrowRight,
  Download,
  Share2,
  Map,
} from "lucide-react";
import { getRouteById } from "../services/api";
import MapView from "../components/MapView";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

export default function RouteDetailPage() {
  const { darkMode } = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchRouteDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchRouteDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRouteById(id);
      setRoute(data);
    } catch (err) {
      setError(err.message || "Impossible de charger les détails du trajet");
      toast.error("Erreur lors du chargement du trajet");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copié dans le presse-papier");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins} min`;
  };

  const exportRouteData = () => {
    const dataStr = JSON.stringify(route, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `route-${id}.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Données exportées avec succès");
  };

  const shareRoute = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Trajet ${route?.originCity || ""} → ${
          route?.destinationCity || ""
        }`,
        text: `Distance: ${route?.totalDistanceKm?.toFixed(1) || "N/A"} km`,
        url: url,
      });
    } else {
      copyToClipboard(url);
      toast.success("Lien copié dans le presse-papier");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div
          className={`rounded-2xl shadow-lg p-8 text-center ${
            darkMode ? "bg-slate-800" : "bg-white"
          }`}
        >
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2
            className={`text-xl font-bold mb-2 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Trajet non trouvé
          </h2>
          <p className={`mb-6 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate(-1)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                darkMode
                  ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <ArrowLeft className="w-4 h-4" />
              Retour
            </button>
            <button
              onClick={fetchRouteDetail}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!route) return null;

  const mapPoints = [];
  if (route.originLatitude && route.originLongitude) {
    mapPoints.push({
      lat: route.originLatitude,
      lng: route.originLongitude,
      label: route.originCity || "Départ",
      type: "origin",
    });
  }
  if (route.destinationLatitude && route.destinationLongitude) {
    mapPoints.push({
      lat: route.destinationLatitude,
      lng: route.destinationLongitude,
      label: route.destinationCity || "Arrivée",
      type: "destination",
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`p-2 rounded-lg shadow-sm hover:shadow-md transition-all ${
              darkMode ? "bg-slate-800 text-gray-300" : "bg-white text-gray-600"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1
              className={`text-2xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              Détails du Trajet
            </h1>
            <p
              className={`text-sm flex items-center gap-2 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <span
                className={`font-mono px-2 py-0.5 rounded text-xs ${
                  darkMode ? "bg-slate-700" : "bg-gray-100"
                }`}
              >
                {id.substring(0, 8)}...
              </span>
              <button
                onClick={() => copyToClipboard(id)}
                className={`transition-colors ${
                  darkMode
                    ? "text-gray-500 hover:text-orange-400"
                    : "text-gray-400 hover:text-orange-500"
                }`}
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportRouteData}
            className={`px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2 ${
              darkMode ? "bg-slate-800 text-gray-300" : "bg-white text-gray-700"
            }`}
          >
            <Download className="w-4 h-4" />
            Exporter
          </button>
          <button
            onClick={shareRoute}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg shadow-sm hover:shadow-md transition-all flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Partager
          </button>
        </div>
      </div>

      {/* Status Badge */}
      <div
        className={`rounded-2xl shadow-lg p-6 ${
          darkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${
                route.status === "SUCCESS"
                  ? darkMode
                    ? "bg-emerald-900/50"
                    : "bg-emerald-100"
                  : darkMode
                  ? "bg-amber-900/50"
                  : "bg-amber-100"
              }`}
            >
              {route.status === "SUCCESS" ? (
                <CheckCircle
                  className={`w-8 h-8 ${
                    darkMode ? "text-emerald-400" : "text-emerald-600"
                  }`}
                />
              ) : (
                <AlertCircle
                  className={`w-8 h-8 ${
                    darkMode ? "text-amber-400" : "text-amber-600"
                  }`}
                />
              )}
            </div>
            <div>
              <h2
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {route.originCity || "Départ"} →{" "}
                {route.destinationCity || "Arrivée"}
              </h2>
              <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                Calculé le {formatDate(route.createdAt || route.calculatedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {route.isOptimized && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode
                    ? "bg-purple-900/50 text-purple-300"
                    : "bg-purple-100 text-purple-700"
                }`}
              >
                Optimisé
              </span>
            )}
            {route.includeReturn && (
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  darkMode
                    ? "bg-blue-900/50 text-blue-300"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                Aller-Retour
              </span>
            )}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                route.status === "SUCCESS"
                  ? darkMode
                    ? "bg-emerald-900/50 text-emerald-300"
                    : "bg-emerald-100 text-emerald-700"
                  : darkMode
                  ? "bg-amber-900/50 text-amber-300"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {route.status || "INCONNU"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Stats & Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Distance & Duration Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl p-4 text-white">
              <Navigation className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">
                {route.totalDistanceKm?.toFixed(1) ||
                  route.distanceKm?.toFixed(1) ||
                  "N/A"}
              </p>
              <p className="text-sm opacity-80">km total</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl p-4 text-white">
              <Clock className="w-6 h-6 mb-2 opacity-80" />
              <p className="text-2xl font-bold">
                {formatDuration(route.totalDurationMin || route.durationMin)}
              </p>
              <p className="text-sm opacity-80">durée totale</p>
            </div>
          </div>

          {/* Detailed Stats */}
          <div
            className={`rounded-2xl shadow-lg p-5 ${
              darkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <h3
              className={`font-semibold mb-4 flex items-center gap-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              <Route className="w-5 h-5 text-orange-500" />
              Détails du Parcours
            </h3>
            <div className="space-y-3">
              {route.distanceKm && (
                <div
                  className={`flex justify-between items-center py-2 border-b ${
                    darkMode ? "border-slate-700" : "border-gray-100"
                  }`}
                >
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Distance aller
                  </span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {route.distanceKm?.toFixed(1)} km
                  </span>
                </div>
              )}
              {route.durationMin && (
                <div
                  className={`flex justify-between items-center py-2 border-b ${
                    darkMode ? "border-slate-700" : "border-gray-100"
                  }`}
                >
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Durée aller
                  </span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {formatDuration(route.durationMin)}
                  </span>
                </div>
              )}
              {route.returnDistanceKm && (
                <div
                  className={`flex justify-between items-center py-2 border-b ${
                    darkMode ? "border-slate-700" : "border-gray-100"
                  }`}
                >
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Distance retour
                  </span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {route.returnDistanceKm?.toFixed(1)} km
                  </span>
                </div>
              )}
              {route.returnDurationMin && (
                <div
                  className={`flex justify-between items-center py-2 border-b ${
                    darkMode ? "border-slate-700" : "border-gray-100"
                  }`}
                >
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Durée retour
                  </span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {formatDuration(route.returnDurationMin)}
                  </span>
                </div>
              )}
              {route.calculatedBy && (
                <div className="flex justify-between items-center py-2">
                  <span
                    className={darkMode ? "text-gray-400" : "text-gray-600"}
                  >
                    Méthode
                  </span>
                  <span
                    className={`font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {route.calculatedBy}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* User Info */}
          {(route.userId || route.username || route.email) && (
            <div
              className={`rounded-2xl shadow-lg p-5 ${
                darkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <h3
                className={`font-semibold mb-4 flex items-center gap-2 ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <User className="w-5 h-5 text-orange-500" />
                Informations Utilisateur
              </h3>
              <div className="space-y-3">
                {route.fullName && (
                  <div
                    className={`flex justify-between items-center py-2 border-b ${
                      darkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                  >
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Nom
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {route.fullName}
                    </span>
                  </div>
                )}
                {route.username && (
                  <div
                    className={`flex justify-between items-center py-2 border-b ${
                      darkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                  >
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Username
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      @{route.username}
                    </span>
                  </div>
                )}
                {route.email && (
                  <div
                    className={`flex justify-between items-center py-2 border-b ${
                      darkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                  >
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Email
                    </span>
                    <span
                      className={`font-medium text-sm ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {route.email}
                    </span>
                  </div>
                )}
                {route.phone && (
                  <div
                    className={`flex justify-between items-center py-2 border-b ${
                      darkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                  >
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Téléphone
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {route.phone}
                    </span>
                  </div>
                )}
                {route.userId && (
                  <div className="flex justify-between items-center py-2">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      User ID
                    </span>
                    <span
                      className={`font-mono text-xs px-2 py-1 rounded ${
                        darkMode ? "bg-slate-700 text-gray-300" : "bg-gray-100"
                      }`}
                    >
                      {route.userId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Merchandise Info */}
          {(route.volume || route.natureMarchandise) && (
            <div
              className={`rounded-2xl shadow-lg p-5 ${
                darkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <h3
                className={`font-semibold mb-4 flex items-center gap-2 ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <Package className="w-5 h-5 text-orange-500" />
                Marchandise
              </h3>
              <div className="space-y-3">
                {route.volume && (
                  <div
                    className={`flex justify-between items-center py-2 border-b ${
                      darkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                  >
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Volume
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {route.volume} m³
                    </span>
                  </div>
                )}
                {route.natureMarchandise && (
                  <div
                    className={`flex justify-between items-center py-2 border-b ${
                      darkMode ? "border-slate-700" : "border-gray-100"
                    }`}
                  >
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Nature
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {route.natureMarchandise}
                    </span>
                  </div>
                )}
                {route.dateDepart && (
                  <div className="flex justify-between items-center py-2">
                    <span
                      className={darkMode ? "text-gray-400" : "text-gray-600"}
                    >
                      Date départ
                    </span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-800"
                      }`}
                    >
                      {formatDate(route.dateDepart)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Map & Addresses */}
        <div className="lg:col-span-2 space-y-6">
          {/* Map */}
          {mapPoints.length > 0 && (
            <div
              className={`rounded-2xl shadow-lg p-5 ${
                darkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <h3
                className={`font-semibold mb-4 flex items-center gap-2 ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <Map className="w-5 h-5 text-orange-500" />
                Carte du Trajet
              </h3>
              <div className="h-[400px] rounded-xl overflow-hidden">
                <MapView points={mapPoints} showRoute={true} zoom={7} />
              </div>
            </div>
          )}

          {/* Addresses */}
          <div
            className={`rounded-2xl shadow-lg p-5 ${
              darkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <h3
              className={`font-semibold mb-4 flex items-center gap-2 ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              <MapPin className="w-5 h-5 text-orange-500" />
              Adresses
            </h3>
            <div className="space-y-4">
              {/* Origin */}
              <div
                className={`flex items-start gap-4 p-4 rounded-xl ${
                  darkMode ? "bg-emerald-900/30" : "bg-emerald-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium mb-1 ${
                      darkMode ? "text-emerald-400" : "text-emerald-600"
                    }`}
                  >
                    Point de départ
                  </p>
                  <p
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {route.originCity || route.adresseDepart || "Non spécifié"}
                  </p>
                  {route.adresseDepart && route.originCity && (
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {route.adresseDepart}
                    </p>
                  )}
                  {route.originLatitude && route.originLongitude && (
                    <p
                      className={`text-xs mt-1 font-mono ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {route.originLatitude.toFixed(4)},{" "}
                      {route.originLongitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    darkMode ? "bg-slate-700" : "bg-gray-100"
                  }`}
                >
                  <ArrowRight
                    className={`w-4 h-4 rotate-90 ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    }`}
                  />
                </div>
              </div>

              {/* Destination */}
              <div
                className={`flex items-start gap-4 p-4 rounded-xl ${
                  darkMode ? "bg-rose-900/30" : "bg-rose-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p
                    className={`text-sm font-medium mb-1 ${
                      darkMode ? "text-rose-400" : "text-rose-600"
                    }`}
                  >
                    Point d&apos;arrivée
                  </p>
                  <p
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {route.destinationCity ||
                      route.adresseDestination ||
                      "Non spécifié"}
                  </p>
                  {route.adresseDestination && route.destinationCity && (
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      {route.adresseDestination}
                    </p>
                  )}
                  {route.destinationLatitude && route.destinationLongitude && (
                    <p
                      className={`text-xs mt-1 font-mono ${
                        darkMode ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {route.destinationLatitude.toFixed(4)},{" "}
                      {route.destinationLongitude.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Instructions (if available) */}
          {route.instructions && route.instructions.length > 0 && (
            <div
              className={`rounded-2xl shadow-lg p-5 ${
                darkMode ? "bg-slate-800" : "bg-white"
              }`}
            >
              <h3
                className={`font-semibold mb-4 flex items-center gap-2 ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                <Navigation className="w-5 h-5 text-orange-500" />
                Instructions
              </h3>
              <div className="space-y-2">
                {route.instructions.map((instruction, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-lg ${
                      darkMode ? "bg-slate-700" : "bg-gray-50"
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                        darkMode
                          ? "bg-orange-900/50 text-orange-400"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <p className={darkMode ? "text-gray-300" : "text-gray-700"}>
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Actions */}
      <div
        className={`rounded-2xl shadow-lg p-6 ${
          darkMode ? "bg-slate-800" : "bg-white"
        }`}
      >
        <h3
          className={`font-semibold mb-4 ${
            darkMode ? "text-gray-200" : "text-gray-700"
          }`}
        >
          Actions Rapides
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/calculator"
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              darkMode
                ? "bg-emerald-900/50 text-emerald-300 hover:bg-emerald-900/70"
                : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
            }`}
          >
            <MapPin className="w-4 h-4" />
            Nouveau calcul
          </Link>
          <Link
            to="/optimizer"
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              darkMode
                ? "bg-purple-900/50 text-purple-300 hover:bg-purple-900/70"
                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            }`}
          >
            <Route className="w-4 h-4" />
            Optimiser une tournée
          </Link>
          <Link
            to="/history"
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              darkMode
                ? "bg-cyan-900/50 text-cyan-300 hover:bg-cyan-900/70"
                : "bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
            }`}
          >
            <Clock className="w-4 h-4" />
            Voir l&apos;historique
          </Link>
          {route.userId && (
            <Link
              to={`/users?userId=${route.userId}`}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                darkMode
                  ? "bg-indigo-900/50 text-indigo-300 hover:bg-indigo-900/70"
                  : "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
              }`}
            >
              <User className="w-4 h-4" />
              Voir utilisateur
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
