import { useState } from "react";
import {
  Route,
  Plus,
  Trash2,
  GripVertical,
  Zap,
  RefreshCw,
  MapPin,
  MousePointer,
} from "lucide-react";
import { optimizeRoute } from "../services/api";
import MapView from "../components/MapView";
import RouteResultCard from "../components/RouteResultCard";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

// Villes marocaines prédéfinies
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
  { name: "Settat", lat: 33.001, lng: -7.6194 },
  { name: "Khouribga", lat: 32.885, lng: -6.9063 },
];

export default function RouteOptimizer() {
  const { darkMode } = useTheme();
  const [waypoints, setWaypoints] = useState([
    { id: 1, name: "Casablanca", latitude: 33.5731, longitude: -7.5898 },
    { id: 2, name: "Rabat", latitude: 34.0209, longitude: -6.8416 },
    { id: 3, name: "Marrakech", latitude: 31.6295, longitude: -7.9811 },
  ]);
  const [includeReturn, setIncludeReturn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [userId, setUserId] = useState("driver_001");
  const [mapSelectionMode, setMapSelectionMode] = useState(false);

  const handleMapClick = (lat, lng) => {
    if (waypoints.length >= 15) {
      toast.error("Maximum 15 points autorisés");
      return;
    }
    const newId = Math.max(...waypoints.map((w) => w.id), 0) + 1;
    setWaypoints([
      ...waypoints,
      {
        id: newId,
        name: `Point ${newId}`,
        latitude: lat,
        longitude: lng,
      },
    ]);
    toast.success(`Point ajouté: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  const addWaypoint = () => {
    setWaypoints((prevWaypoints) => {
      if (prevWaypoints.length >= 15) {
        toast.error("Maximum 15 points autorisés");
        return prevWaypoints;
      }
      const newId = Math.max(...prevWaypoints.map((w) => w.id), 0) + 1;
      // Use center of Morocco as default coordinates
      return [
        ...prevWaypoints,
        {
          id: newId,
          name: "",
          latitude: 31.7917,
          longitude: -7.0926,
        },
      ];
    });
  };

  const removeWaypoint = (id) => {
    setWaypoints((prevWaypoints) => {
      if (prevWaypoints.length <= 2) {
        toast.error("Minimum 2 points requis");
        return prevWaypoints;
      }
      return prevWaypoints.filter((w) => w.id !== id);
    });
  };

  const updateWaypoint = (id, field, value) => {
    setWaypoints((prevWaypoints) =>
      prevWaypoints.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const selectCity = (id, city) => {
    if (!city || !city.name) {
      console.warn("Invalid city selection:", city);
      return;
    }
    setWaypoints((prevWaypoints) =>
      prevWaypoints.map((w) =>
        w.id === id
          ? {
              ...w,
              name: city.name,
              latitude: city.lat,
              longitude: city.lng,
            }
          : w
      )
    );
  };

  const handleOptimize = async () => {
    if (waypoints.length < 2) {
      toast.error("Ajoutez au moins 2 points");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const request = {
        userId,
        origin: {
          latitude: waypoints[0].latitude,
          longitude: waypoints[0].longitude,
          name: waypoints[0].name,
        },
        destination: {
          latitude: waypoints[waypoints.length - 1].latitude,
          longitude: waypoints[waypoints.length - 1].longitude,
          name: waypoints[waypoints.length - 1].name,
        },
        waypoints: waypoints.slice(1, -1).map((w) => ({
          latitude: w.latitude,
          longitude: w.longitude,
          name: w.name,
        })),
        includeReturn,
      };

      const response = await optimizeRoute(request);
      setResult(response);
      toast.success("Tournée optimisée avec succès!");
    } catch (error) {
      toast.error(error.message || "Erreur lors de l'optimisation");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = (type) => {
    const examples = {
      "grand-tour": [
        { id: 1, name: "Casablanca", latitude: 33.5731, longitude: -7.5898 },
        { id: 2, name: "Rabat", latitude: 34.0209, longitude: -6.8416 },
        { id: 3, name: "Fès", latitude: 33.8959, longitude: -5.5544 },
        { id: 4, name: "Meknès", latitude: 34.0181, longitude: -5.0078 },
        { id: 5, name: "Marrakech", latitude: 31.6295, longitude: -7.9811 },
        { id: 6, name: "Agadir", latitude: 30.4278, longitude: -9.5981 },
      ],
      coastal: [
        { id: 1, name: "Tanger", latitude: 35.7595, longitude: -5.834 },
        { id: 2, name: "Rabat", latitude: 34.0209, longitude: -6.8416 },
        { id: 3, name: "Casablanca", latitude: 33.5731, longitude: -7.5898 },
        { id: 4, name: "El Jadida", latitude: 33.2316, longitude: -8.5007 },
        { id: 5, name: "Essaouira", latitude: 31.5085, longitude: -9.7595 },
        { id: 6, name: "Agadir", latitude: 30.4278, longitude: -9.5981 },
      ],
      imperial: [
        { id: 1, name: "Rabat", latitude: 34.0209, longitude: -6.8416 },
        { id: 2, name: "Meknès", latitude: 34.0181, longitude: -5.0078 },
        { id: 3, name: "Fès", latitude: 33.8959, longitude: -5.5544 },
        { id: 4, name: "Marrakech", latitude: 31.6295, longitude: -7.9811 },
      ],
    };
    setWaypoints(examples[type]);
    setResult(null);
    toast.success("Exemple chargé!");
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Route className="w-6 h-6 text-white" />
            </div>
            Optimiser une Tournée
          </h1>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-500"} mt-1`}>
            Algorithme TSP - Plus proche voisin
          </p>
        </div>

        {/* Example Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => loadExample("grand-tour")}
            className={`px-4 py-2 ${
              darkMode
                ? "bg-purple-900/50 text-purple-400 hover:bg-purple-800/50"
                : "bg-purple-100 text-purple-700 hover:bg-purple-200"
            } rounded-lg transition-colors text-sm font-medium`}
          >
            🏛️ Grand Tour
          </button>
          <button
            onClick={() => loadExample("coastal")}
            className={`px-4 py-2 ${
              darkMode
                ? "bg-blue-900/50 text-blue-400 hover:bg-blue-800/50"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            } rounded-lg transition-colors text-sm font-medium`}
          >
            🌊 Côte Atlantique
          </button>
          <button
            onClick={() => loadExample("imperial")}
            className={`px-4 py-2 ${
              darkMode
                ? "bg-amber-900/50 text-amber-400 hover:bg-amber-800/50"
                : "bg-amber-100 text-amber-700 hover:bg-amber-200"
            } rounded-lg transition-colors text-sm font-medium`}
          >
            👑 Villes Impériales
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
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 px-6 py-4">
            <h2 className="text-white font-bold text-lg">Points de passage</h2>
            <p className="text-purple-100 text-sm">
              Maximum 15 points • Ordre optimisé automatiquement
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Quick Add Cities */}
            <div
              className={`flex flex-wrap gap-1.5 p-3 ${
                darkMode ? "bg-slate-700" : "bg-gray-50"
              } rounded-xl`}
            >
              {moroccanCities.slice(0, 10).map((city) => (
                <button
                  key={city.name}
                  onClick={() => {
                    setWaypoints((prevWaypoints) => {
                      if (prevWaypoints.length >= 15) {
                        toast.error("Maximum 15 points");
                        return prevWaypoints;
                      }
                      // Check if city already exists
                      const exists = prevWaypoints.some(
                        (w) => w.name === city.name
                      );
                      if (exists) {
                        toast.error(`${city.name} est déjà dans la liste`);
                        return prevWaypoints;
                      }
                      const newId =
                        Math.max(...prevWaypoints.map((w) => w.id), 0) + 1;
                      toast.success(`${city.name} ajouté`);
                      return [
                        ...prevWaypoints,
                        {
                          id: newId,
                          name: city.name,
                          latitude: city.lat,
                          longitude: city.lng,
                        },
                      ];
                    });
                  }}
                  className={`px-2 py-1 text-xs rounded-md ${
                    darkMode
                      ? "bg-slate-600 text-gray-300 hover:bg-purple-900/50 hover:text-purple-400 border-slate-600"
                      : "bg-white text-gray-600 hover:bg-purple-100 hover:text-purple-700 border-gray-200"
                  } transition-colors border`}
                >
                  + {city.name}
                </button>
              ))}
            </div>

            {/* Waypoints List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {waypoints.map((wp, index) => (
                <div
                  key={wp.id}
                  className={`flex items-center gap-3 p-4 ${
                    darkMode
                      ? "bg-slate-700 border-slate-600 hover:border-purple-500"
                      : "bg-gray-50 border-gray-100 hover:border-purple-200"
                  } rounded-xl border transition-colors group`}
                >
                  <div
                    className={`flex items-center gap-2 ${
                      darkMode ? "text-gray-400" : "text-gray-400"
                    }`}
                  >
                    <GripVertical className="w-4 h-4 cursor-grab" />
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                        index === 0
                          ? "bg-emerald-500"
                          : index === waypoints.length - 1
                          ? "bg-rose-500"
                          : "bg-purple-500"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <select
                      value={
                        moroccanCities.find((c) => c.name === wp.name)?.name ||
                        ""
                      }
                      onChange={(e) => {
                        const city = moroccanCities.find(
                          (c) => c.name === e.target.value
                        );
                        if (city) selectCity(wp.id, city);
                      }}
                      className={`px-3 py-2 ${
                        darkMode
                          ? "bg-slate-600 border-slate-500 text-white"
                          : "bg-white border-gray-200"
                      } border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none`}
                    >
                      <option value="">Ville...</option>
                      {moroccanCities.map((city) => (
                        <option key={city.name} value={city.name}>
                          {city.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      step="any"
                      value={wp.latitude}
                      onChange={(e) =>
                        updateWaypoint(
                          wp.id,
                          "latitude",
                          parseFloat(e.target.value)
                        )
                      }
                      className={`px-3 py-2 ${
                        darkMode
                          ? "bg-slate-600 border-slate-500 text-white"
                          : "bg-white border-gray-200"
                      } border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none`}
                      placeholder="Lat"
                    />
                    <input
                      type="number"
                      step="any"
                      value={wp.longitude}
                      onChange={(e) =>
                        updateWaypoint(
                          wp.id,
                          "longitude",
                          parseFloat(e.target.value)
                        )
                      }
                      className={`px-3 py-2 ${
                        darkMode
                          ? "bg-slate-600 border-slate-500 text-white"
                          : "bg-white border-gray-200"
                      } border rounded-lg text-sm focus:ring-2 focus:ring-purple-500 outline-none`}
                      placeholder="Lng"
                    />
                  </div>

                  <button
                    onClick={() => removeWaypoint(wp.id)}
                    className={`p-2 ${
                      darkMode
                        ? "text-gray-400 hover:text-red-400 hover:bg-red-900/30"
                        : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                    } rounded-lg transition-colors opacity-0 group-hover:opacity-100`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Waypoint */}
            <button
              onClick={addWaypoint}
              disabled={waypoints.length >= 15}
              className={`w-full py-3 border-2 border-dashed ${
                darkMode
                  ? "border-slate-600 text-gray-400 hover:border-purple-500 hover:text-purple-400"
                  : "border-gray-300 text-gray-500 hover:border-purple-400 hover:text-purple-600"
              } rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50`}
            >
              <Plus className="w-5 h-5" />
              Ajouter un point ({waypoints.length}/15)
            </button>

            {/* User ID */}
            <div className="space-y-2">
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
                placeholder="driver_001"
                className={`input-field ${
                  darkMode
                    ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                    : ""
                }`}
              />
            </div>

            {/* Include Return */}
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
                  Retour au départ
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Circuit fermé
                </p>
              </div>
              <button
                onClick={() => setIncludeReturn(!includeReturn)}
                className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${
                  includeReturn
                    ? "bg-purple-500"
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

            {/* Submit */}
            <button
              onClick={handleOptimize}
              disabled={loading || waypoints.length < 2}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Optimisation en cours...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Optimiser la tournée
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
              <div>
                <h3
                  className={`font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  Carte des points
                </h3>
                <span
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {waypoints.length} points
                </span>
              </div>
              <button
                onClick={() => setMapSelectionMode(!mapSelectionMode)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  mapSelectionMode
                    ? "bg-amber-500 text-white shadow-lg"
                    : darkMode
                    ? "bg-slate-700 text-gray-300 hover:bg-amber-900/50 hover:text-amber-400"
                    : "bg-gray-100 text-gray-700 hover:bg-amber-100 hover:text-amber-700"
                }`}
              >
                <MousePointer className="w-4 h-4" />
                {mapSelectionMode
                  ? "Mode sélection actif"
                  : "Ajouter depuis carte"}
              </button>
            </div>
            <div className="p-4">
              <MapView
                waypoints={waypoints}
                routePolyline={result?.routePolyline}
                height="400px"
                selectionMode={mapSelectionMode}
                onMapClick={handleMapClick}
              />
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div
              className={`${
                darkMode
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-100"
              } rounded-2xl shadow-xl border p-8 flex items-center justify-center`}
            >
              <LoadingSpinner text="Optimisation de la tournée..." />
            </div>
          )}

          {/* Result */}
          {result && !loading && <RouteResultCard result={result} />}
        </div>
      </div>
    </div>
  );
}
