import { useState, useEffect } from "react";
import { Building2, Search, MapPin, RefreshCw, Map } from "lucide-react";
import { getAllCities } from "../services/api";
import MapView from "../components/MapView";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = cities.filter(
        (city) =>
          city.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.nom?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities(cities);
    }
  }, [searchTerm, cities]);

  const fetchCities = async () => {
    setLoading(true);
    try {
      const data = await getAllCities();
      setCities(data || []);
      setFilteredCities(data || []);
      toast.success(`${data?.length || 0} villes chargées`);
    } catch (error) {
      toast.error("Erreur lors du chargement des villes");
      setCities([]);
      setFilteredCities([]);
    } finally {
      setLoading(false);
    }
  };

  // Convert cities to waypoints for map
  const mapWaypoints = selectedCity
    ? [
        {
          latitude: selectedCity.latitude || selectedCity.lat,
          longitude: selectedCity.longitude || selectedCity.lng,
          name: selectedCity.name || selectedCity.nom,
        },
      ]
    : filteredCities
        .slice(0, 20)
        .map((city) => ({
          latitude: city.latitude || city.lat || 33,
          longitude: city.longitude || city.lng || -7,
          name: city.name || city.nom,
        }))
        .filter((c) => c.latitude && c.longitude);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            Villes du Maroc 🇲🇦
          </h1>
          <p className="text-gray-500 mt-1">
            Liste des villes disponibles dans le système
          </p>
        </div>

        <button
          onClick={fetchCities}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          Actualiser
        </button>
      </div>

      {/* Search & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une ville..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-amber-100 text-sm">Total des villes</p>
              <p className="text-3xl font-bold">{cities.length}</p>
            </div>
            <Building2 className="w-12 h-12 text-white/30" />
          </div>
          {searchTerm && (
            <p className="text-amber-100 text-sm mt-2">
              {filteredCities.length} résultat(s) trouvé(s)
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cities List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-orange-500">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Liste des Villes
            </h3>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center">
              <LoadingSpinner text="Chargement des villes..." />
            </div>
          ) : filteredCities.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-700 mb-2">
                Aucune ville trouvée
              </h4>
              <p className="text-gray-500">
                {searchTerm
                  ? "Essayez une autre recherche"
                  : "Les villes ne sont pas encore chargées"}
              </p>
            </div>
          ) : (
            <div className="max-h-[500px] overflow-y-auto">
              <div className="divide-y divide-gray-100">
                {filteredCities.map((city, index) => (
                  <div
                    key={city.id || index}
                    className={`p-4 hover:bg-amber-50 cursor-pointer transition-colors ${
                      selectedCity?.id === city.id ||
                      selectedCity?.name === city.name
                        ? "bg-amber-50 border-l-4 border-amber-500"
                        : ""
                    }`}
                    onClick={() => setSelectedCity(city)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                        <span className="text-lg">🏙️</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">
                          {city.name || city.nom || "N/A"}
                        </h4>
                        {(city.latitude || city.lat) && (
                          <p className="text-sm text-gray-500">
                            {(city.latitude || city.lat)?.toFixed(4)},{" "}
                            {(city.longitude || city.lng)?.toFixed(4)}
                          </p>
                        )}
                      </div>
                      <MapPin className="w-5 h-5 text-amber-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Map & Selected City Info */}
        <div className="space-y-6">
          {/* Map */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <Map className="w-5 h-5 text-amber-500" />
                Carte
              </h3>
              <span className="text-sm text-gray-500">
                {mapWaypoints.length} point(s) affiché(s)
              </span>
            </div>
            <div className="p-4">
              <MapView
                waypoints={mapWaypoints}
                height="300px"
                center={
                  selectedCity
                    ? [
                        selectedCity.latitude || selectedCity.lat,
                        selectedCity.longitude || selectedCity.lng,
                      ]
                    : [31.7917, -7.0926]
                }
                zoom={selectedCity ? 10 : 5}
              />
            </div>
          </div>

          {/* Selected City Details */}
          {selectedCity && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-orange-500">
                <h3 className="text-white font-bold text-lg">
                  Détails de la ville
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <span className="text-3xl">🏙️</span>
                  </div>
                  <div>
                    <h4 className="text-2xl font-bold text-gray-800">
                      {selectedCity.name || selectedCity.nom}
                    </h4>
                    <p className="text-gray-500">Maroc 🇲🇦</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Latitude
                    </p>
                    <p className="text-lg font-mono font-medium">
                      {(selectedCity.latitude || selectedCity.lat)?.toFixed(
                        6
                      ) || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Longitude
                    </p>
                    <p className="text-lg font-mono font-medium">
                      {(selectedCity.longitude || selectedCity.lng)?.toFixed(
                        6
                      ) || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedCity.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      ID
                    </p>
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {selectedCity.id}
                    </code>
                  </div>
                )}

                <button
                  onClick={() => setSelectedCity(null)}
                  className="mt-6 w-full py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

          {/* Popular Cities */}
          {!selectedCity && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6">
              <h3 className="font-bold text-gray-700 mb-4">
                Villes Principales
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Casablanca", emoji: "🏢" },
                  { name: "Rabat", emoji: "🏛️" },
                  { name: "Marrakech", emoji: "🕌" },
                  { name: "Fès", emoji: "🏺" },
                  { name: "Tanger", emoji: "⛴️" },
                  { name: "Agadir", emoji: "🏖️" },
                ].map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      const found = cities.find((c) =>
                        (c.name || c.nom)
                          ?.toLowerCase()
                          .includes(city.name.toLowerCase())
                      );
                      if (found) setSelectedCity(found);
                      else toast.error(`${city.name} non trouvée`);
                    }}
                    className="flex items-center gap-2 p-3 bg-white rounded-xl hover:shadow-md transition-all text-left"
                  >
                    <span className="text-2xl">{city.emoji}</span>
                    <span className="font-medium text-gray-700">
                      {city.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
