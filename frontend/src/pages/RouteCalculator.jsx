import { useState } from "react";
import {
  MapPin,
  Navigation,
  Calculator,
  ArrowRight,
  RefreshCw,
  Crosshair,
  Locate,
  Star,
  Printer,
} from "lucide-react";
import {
  calculateRouteFromCoordinates,
  calculateRouteFromAddress,
} from "../services/api";
import {
  getCurrentPosition,
  findNearestCity,
  isInMorocco,
} from "../utils/geolocationUtils";
import {
  addToFavorites,
  addToRecentRoutes,
  updateStats,
} from "../utils/favoritesUtils";
import { printRoute } from "../utils/pdfUtils";
import MapView from "../components/MapView";
import RouteResultCard from "../components/RouteResultCard";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

// Villes marocaines prédéfinies pour faciliter la saisie
const moroccanCities = [
  { name: "Casablanca", lat: 33.5731, lng: -7.5898 },
  { name: "Rabat", lat: 34.0209, lng: -6.8416 },
  { name: "Marrakech", lat: 31.6295, lng: -7.9811 },
  { name: "Fès", lat: 33.8959, lng: -5.5544 },
  { name: "Meknès", lat: 34.0181, lng: -5.0078 },
  { name: "Tanger", lat: 35.7595, lng: -5.834 },
  { name: "Agadir", lat: 30.4278, lng: -9.5981 },
  { name: "Oujda", lat: 34.6814, lng: -1.9086 },
  { name: "Tétouan", lat: 35.5889, lng: -5.3626 },
  { name: "El Jadida", lat: 33.2316, lng: -8.5007 },
  { name: "Essaouira", lat: 31.5085, lng: -9.7595 },
  { name: "Safi", lat: 32.2917, lng: -9.2372 },
  { name: "Ouarzazate", lat: 30.9335, lng: -6.893 },
  { name: "Beni Mellal", lat: 32.3394, lng: -6.3498 },
  { name: "Kénitra", lat: 34.261, lng: -6.58 },
  { name: "Laayoune", lat: 27.1216, lng: -13.1625 },
];

export default function RouteCalculator() {
  const { darkMode } = useTheme();
  const [mode, setMode] = useState("coordinates"); // 'coordinates' or 'address'
  const [includeReturn, setIncludeReturn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Form state for coordinates mode
  const [originLat, setOriginLat] = useState("33.5731");
  const [originLng, setOriginLng] = useState("-7.5898");
  const [destLat, setDestLat] = useState("34.0209");
  const [destLng, setDestLng] = useState("-6.8416");

  // Form state for address mode
  const [originAddress, setOriginAddress] = useState("Casablanca, Morocco");
  const [destAddress, setDestAddress] = useState("Rabat, Morocco");

  const [userId, setUserId] = useState("user_001");
  const [geoLoading, setGeoLoading] = useState(false);

  // Map selection state
  const [mapSelectionMode, setMapSelectionMode] = useState(null); // null, 'origin', 'destination'

  const handleMapClick = (lat, lng) => {
    if (mapSelectionMode === "origin") {
      setOriginLat(lat.toFixed(6));
      setOriginLng(lng.toFixed(6));
      toast.success(`Départ: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setMapSelectionMode("destination");
      toast("Cliquez maintenant pour la destination", { icon: "📍" });
    } else if (mapSelectionMode === "destination") {
      setDestLat(lat.toFixed(6));
      setDestLng(lng.toFixed(6));
      toast.success(`Arrivée: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setMapSelectionMode(null);
    }
  };

  const startMapSelection = () => {
    setMode("coordinates");
    setMapSelectionMode("origin");
    toast("Cliquez sur la carte pour le point de départ", { icon: "🟢" });
  };

  // Geolocation: detect current position
  const detectCurrentPosition = async (forOrigin = true) => {
    setGeoLoading(true);
    try {
      const position = await getCurrentPosition();

      if (!isInMorocco(position.latitude, position.longitude)) {
        toast.error(
          "Votre position est hors du Maroc. Utilisation de Casablanca par défaut."
        );
        if (forOrigin) {
          setOriginLat("33.5731");
          setOriginLng("-7.5898");
          setOriginAddress("Casablanca, Morocco");
        }
        return;
      }

      // Find nearest city
      const nearestCity = findNearestCity(
        position.latitude,
        position.longitude,
        moroccanCities
      );

      if (forOrigin) {
        setOriginLat(position.latitude.toFixed(6));
        setOriginLng(position.longitude.toFixed(6));
        if (nearestCity) {
          setOriginAddress(`${nearestCity.name}, Morocco`);
          toast.success(`Position détectée près de ${nearestCity.name}`);
        } else {
          toast.success("Position détectée!");
        }
      } else {
        setDestLat(position.latitude.toFixed(6));
        setDestLng(position.longitude.toFixed(6));
        if (nearestCity) {
          setDestAddress(`${nearestCity.name}, Morocco`);
        }
        toast.success("Position détectée!");
      }
      setMode("coordinates");
    } catch (error) {
      toast.error(error.message || "Impossible de détecter votre position");
    } finally {
      setGeoLoading(false);
    }
  };

  const handleCalculate = async () => {
    setLoading(true);
    setResult(null);

    try {
      let response;

      if (mode === "coordinates") {
        const request = {
          userId,
          origin: {
            latitude: parseFloat(originLat),
            longitude: parseFloat(originLng),
          },
          destination: {
            latitude: parseFloat(destLat),
            longitude: parseFloat(destLng),
          },
          includeReturn,
        };
        response = await calculateRouteFromCoordinates(request);
      } else {
        const request = {
          userId,
          originAddress,
          destinationAddress: destAddress,
          includeReturn,
        };
        response = await calculateRouteFromAddress(request);
      }

      setResult(response);

      // Save to recent routes and update stats
      addToRecentRoutes({
        ...response,
        originCity: originAddress.split(",")[0],
        destinationCity: destAddress.split(",")[0],
      });
      updateStats(response);

      toast.success("Itinéraire calculé avec succès!");
    } catch (error) {
      toast.error(error.message || "Erreur lors du calcul");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToFavorites = () => {
    if (!result) return;
    const success = addToFavorites({
      ...result,
      originCity: originAddress.split(",")[0],
      destinationCity: destAddress.split(",")[0],
      adresseDepart: originAddress,
      adresseDestination: destAddress,
    });
    if (success) {
      toast.success("Ajouté aux favoris!");
    } else {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  const handlePrintRoute = () => {
    if (!result) return;
    printRoute({
      ...result,
      originCity: originAddress.split(",")[0],
      destinationCity: destAddress.split(",")[0],
      adresseDepart: originAddress,
      adresseDestination: destAddress,
    });
  };

  const selectCity = (type, city) => {
    if (type === "origin") {
      setOriginLat(city.lat.toString());
      setOriginLng(city.lng.toString());
      setOriginAddress(`${city.name}, Morocco`);
    } else {
      setDestLat(city.lat.toString());
      setDestLng(city.lng.toString());
      setDestAddress(`${city.name}, Morocco`);
    }
  };

  const waypoints = result?.steps || [
    {
      latitude: parseFloat(originLat),
      longitude: parseFloat(originLng),
      name: "Départ",
    },
    {
      latitude: parseFloat(destLat),
      longitude: parseFloat(destLng),
      name: "Arrivée",
    },
  ];

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            Calculer un Itinéraire
          </h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>
            Calcul de route entre deux points au Maroc
          </p>
        </div>

        {/* Mode Toggle */}
        <div
          className={`flex items-center gap-2 ${
            darkMode ? "bg-slate-700" : "bg-gray-100"
          } p-1 rounded-xl`}
        >
          <button
            onClick={() => setMode("coordinates")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              mode === "coordinates"
                ? darkMode
                  ? "bg-slate-600 text-emerald-400 shadow-md"
                  : "bg-white text-primary-600 shadow-md"
                : darkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <MapPin className="w-4 h-4 inline mr-2" />
            Coordonnées
          </button>
          <button
            onClick={() => setMode("address")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              mode === "address"
                ? darkMode
                  ? "bg-slate-600 text-emerald-400 shadow-md"
                  : "bg-white text-primary-600 shadow-md"
                : darkMode
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <Navigation className="w-4 h-4 inline mr-2" />
            Adresses
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form Card */}
        <div
          className={`${
            darkMode
              ? "bg-slate-800 border-slate-700"
              : "bg-white border-gray-100"
          } rounded-2xl shadow-xl border overflow-hidden`}
        >
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
            <h2 className="text-white font-bold text-lg">
              Paramètres du trajet
            </h2>
            <p className="text-emerald-100 text-sm">
              Renseignez les points de départ et d&apos;arrivée
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Quick City Select */}
            <div className="space-y-3">
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Sélection rapide
              </label>
              <div className="flex flex-wrap gap-2">
                {moroccanCities.slice(0, 8).map((city) => (
                  <div key={city.name} className="flex gap-1">
                    <button
                      onClick={() => selectCity("origin", city)}
                      className={`px-3 py-1.5 text-xs rounded-l-lg ${
                        darkMode
                          ? "bg-emerald-900/50 text-emerald-400 hover:bg-emerald-800/50"
                          : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                      } transition-colors`}
                      title={`Départ: ${city.name}`}
                    >
                      ↗ {city.name}
                    </button>
                    <button
                      onClick={() => selectCity("dest", city)}
                      className={`px-3 py-1.5 text-xs rounded-r-lg ${
                        darkMode
                          ? "bg-rose-900/50 text-rose-400 hover:bg-rose-800/50"
                          : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      } transition-colors`}
                      title={`Arrivée: ${city.name}`}
                    >
                      ↘
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {mode === "coordinates" ? (
              <>
                {/* Origin Coordinates */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      className={`flex items-center gap-2 text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      Point de Départ
                    </label>
                    <button
                      onClick={() => detectCurrentPosition(true)}
                      disabled={geoLoading}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all ${
                        geoLoading
                          ? "opacity-50 cursor-not-allowed"
                          : darkMode
                          ? "bg-blue-900/50 text-blue-400 hover:bg-blue-800/50"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                      title="Utiliser ma position actuelle"
                    >
                      <Locate
                        className={`w-3 h-3 ${
                          geoLoading ? "animate-spin" : ""
                        }`}
                      />
                      {geoLoading ? "Détection..." : "📍 Ma Position"}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="any"
                      value={originLat}
                      onChange={(e) => setOriginLat(e.target.value)}
                      placeholder="Latitude"
                      className={`input-field ${
                        darkMode
                          ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          : ""
                      }`}
                    />
                    <input
                      type="number"
                      step="any"
                      value={originLng}
                      onChange={(e) => setOriginLng(e.target.value)}
                      placeholder="Longitude"
                      className={`input-field ${
                        darkMode
                          ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Destination Coordinates */}
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-2 text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    Point d&apos;Arrivée
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      step="any"
                      value={destLat}
                      onChange={(e) => setDestLat(e.target.value)}
                      placeholder="Latitude"
                      className={`input-field ${
                        darkMode
                          ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          : ""
                      }`}
                    />
                    <input
                      type="number"
                      step="any"
                      value={destLng}
                      onChange={(e) => setDestLng(e.target.value)}
                      placeholder="Longitude"
                      className={`input-field ${
                        darkMode
                          ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                          : ""
                      }`}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Origin Address */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label
                      className={`flex items-center gap-2 text-sm font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-700"
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                      Adresse de Départ
                    </label>
                    <button
                      onClick={() => detectCurrentPosition(true)}
                      disabled={geoLoading}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg transition-all ${
                        geoLoading
                          ? "opacity-50 cursor-not-allowed"
                          : darkMode
                          ? "bg-blue-900/50 text-blue-400 hover:bg-blue-800/50"
                          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      }`}
                      title="Utiliser ma position actuelle"
                    >
                      <Locate
                        className={`w-3 h-3 ${
                          geoLoading ? "animate-spin" : ""
                        }`}
                      />
                      {geoLoading ? "Détection..." : "📍 Ma Position"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={originAddress}
                    onChange={(e) => setOriginAddress(e.target.value)}
                    placeholder="Ex: Casablanca, Morocco"
                    className={`input-field ${
                      darkMode
                        ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                        : ""
                    }`}
                  />
                </div>

                {/* Destination Address */}
                <div className="space-y-3">
                  <label
                    className={`flex items-center gap-2 text-sm font-medium ${
                      darkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    Adresse d&apos;Arrivée
                  </label>
                  <input
                    type="text"
                    value={destAddress}
                    onChange={(e) => setDestAddress(e.target.value)}
                    placeholder="Ex: Rabat, Morocco"
                    className={`input-field ${
                      darkMode
                        ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                        : ""
                    }`}
                  />
                </div>
              </>
            )}

            {/* User ID */}
            <div className="space-y-3">
              <label
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                Identifiant Utilisateur
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="user_001"
                className={`input-field ${
                  darkMode
                    ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    : ""
                }`}
              />
            </div>

            {/* Include Return Toggle */}
            <div
              className={`flex items-center justify-between p-4 ${
                darkMode ? "bg-slate-700" : "bg-gray-50"
              } rounded-xl`}
            >
              <div>
                <p
                  className={`font-medium ${
                    darkMode ? "text-white" : "text-gray-700"
                  }`}
                >
                  Inclure le retour
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Calcule aussi le trajet retour
                </p>
              </div>
              <button
                onClick={() => setIncludeReturn(!includeReturn)}
                className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${
                  includeReturn
                    ? "bg-emerald-500"
                    : darkMode
                    ? "bg-slate-600"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform ${
                    includeReturn ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleCalculate}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Calcul en cours...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Calculer l&apos;itinéraire
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Map & Results */}
        <div className="space-y-6">
          {/* Map */}
          <div
            className={`${
              darkMode
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-100"
            } rounded-2xl shadow-xl border overflow-hidden`}
          >
            <div
              className={`px-6 py-4 border-b ${
                darkMode ? "border-slate-700" : "border-gray-100"
              } flex items-center justify-between`}
            >
              <h3
                className={`font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Carte
              </h3>
              <button
                onClick={startMapSelection}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  mapSelectionMode
                    ? "bg-amber-500 text-white shadow-lg"
                    : darkMode
                    ? "bg-slate-700 text-gray-300 hover:bg-emerald-900/50 hover:text-emerald-400"
                    : "bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700"
                }`}
              >
                <Crosshair className="w-4 h-4" />
                {mapSelectionMode === "origin"
                  ? "Sélectionnez départ..."
                  : mapSelectionMode === "destination"
                  ? "Sélectionnez arrivée..."
                  : "Sélectionner depuis carte"}
              </button>
            </div>
            <div className="p-4">
              <MapView
                waypoints={waypoints}
                routePolyline={result?.routePolyline}
                height="350px"
                selectionMode={!!mapSelectionMode}
                onMapClick={handleMapClick}
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div
              className={`${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-100"
              } rounded-2xl shadow-xl border p-8 flex items-center justify-center`}
            >
              <LoadingSpinner text="Calcul de l'itinéraire..." />
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="space-y-4">
              <RouteResultCard result={result} />

              {/* Action Buttons */}
              <div
                className={`${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-100"
                } rounded-xl shadow-lg border p-4 flex flex-wrap gap-3 justify-center`}
              >
                <button
                  onClick={handleSaveToFavorites}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    darkMode
                      ? "bg-amber-900/50 text-amber-400 hover:bg-amber-800/50"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  }`}
                >
                  <Star className="w-4 h-4" />
                  Ajouter aux favoris
                </button>
                <button
                  onClick={handlePrintRoute}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    darkMode
                      ? "bg-slate-700 text-gray-300 hover:bg-slate-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Printer className="w-4 h-4" />
                  Imprimer / PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
