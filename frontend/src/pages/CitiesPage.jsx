import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Building2,
  Search,
  MapPin,
  RefreshCw,
  Map,
  Navigation,
  Globe,
  Info,
  Users,
  Thermometer,
  Clock,
  Phone,
  ExternalLink,
} from "lucide-react";
import { getAllCities } from "../services/api";
import { useTheme } from "../context/ThemeContext";
import MapView from "../components/MapView";
import LoadingSpinner from "../components/LoadingSpinner";

// Extended city info (local data since API doesn't provide this)
const cityInfoMap = {
  casablanca: {
    population: "3,359,818",
    region: "Casablanca-Settat",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Plus grande ville du Maroc et capitale économique",
    attractions: ["Mosquée Hassan II", "Corniche", "Morocco Mall"],
    code: "+212 522",
  },
  rabat: {
    population: "577,827",
    region: "Rabat-Salé-Kénitra",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Capitale du Maroc et centre administratif",
    attractions: ["Tour Hassan", "Kasbah des Oudayas", "Chellah"],
    code: "+212 537",
  },
  marrakech: {
    population: "928,850",
    region: "Marrakech-Safi",
    timezone: "GMT+1",
    climate: "Semi-aride",
    description: "Ville impériale et capitale touristique",
    attractions: ["Jemaa el-Fna", "Jardin Majorelle", "Palais Bahia"],
    code: "+212 524",
  },
  fès: {
    population: "1,112,072",
    region: "Fès-Meknès",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Plus ancienne ville impériale et capitale spirituelle",
    attractions: ["Médina de Fès", "Université Al Quaraouiyine", "Tanneries"],
    code: "+212 535",
  },
  tanger: {
    population: "947,952",
    region: "Tanger-Tétouan-Al Hoceïma",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Porte de l'Afrique sur le détroit de Gibraltar",
    attractions: ["Kasbah", "Grottes d'Hercule", "Cap Spartel"],
    code: "+212 539",
  },
  agadir: {
    population: "421,844",
    region: "Souss-Massa",
    timezone: "GMT+1",
    climate: "Semi-aride",
    description: "Station balnéaire sur la côte atlantique",
    attractions: ["Plage d'Agadir", "Kasbah", "Vallée du Paradis"],
    code: "+212 528",
  },
  meknès: {
    population: "632,079",
    region: "Fès-Meknès",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Ville impériale fondée au XIe siècle",
    attractions: ["Bab Mansour", "Mausolée Moulay Ismaïl", "Volubilis"],
    code: "+212 535",
  },
  oujda: {
    population: "494,252",
    region: "Oriental",
    timezone: "GMT+1",
    climate: "Semi-aride",
    description: "Capitale de l'Oriental à la frontière algérienne",
    attractions: ["Parc Lalla Meryem", "Médina", "Sidi Yahia"],
    code: "+212 536",
  },
  tétouan: {
    population: "380,787",
    region: "Tanger-Tétouan-Al Hoceïma",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Ville blanche au pied des montagnes du Rif",
    attractions: ["Médina UNESCO", "Place Hassan II", "Musée archéologique"],
    code: "+212 539",
  },
  "el jadida": {
    population: "194,934",
    region: "Casablanca-Settat",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Ancienne cité portugaise classée UNESCO",
    attractions: ["Cité Portugaise", "Citerne portugaise", "Plage"],
    code: "+212 523",
  },
  essaouira: {
    population: "77,966",
    region: "Marrakech-Safi",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Ville côtière connue pour ses vents et son art",
    attractions: ["Médina UNESCO", "Port de pêche", "Îles Purpuraires"],
    code: "+212 524",
  },
  nador: {
    population: "161,726",
    region: "Oriental",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Ville portuaire sur la lagune de Marchica",
    attractions: [
      "Lagune de Marchica",
      "Mont Gourougou",
      "Cap des Trois Fourches",
    ],
    code: "+212 536",
  },
  kénitra: {
    population: "431,282",
    region: "Rabat-Salé-Kénitra",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Ville portuaire sur le fleuve Sebou",
    attractions: ["Forêt de Maâmora", "Plage Mehdia", "Kasbah Mehdia"],
    code: "+212 537",
  },
  "beni mellal": {
    population: "192,676",
    region: "Béni Mellal-Khénifra",
    timezone: "GMT+1",
    climate: "Semi-aride",
    description: "Ville agricole au pied du Moyen Atlas",
    attractions: [
      "Cascades d'Ouzoud",
      "Ain Asserdoun",
      "Kasbah de Beni Mellal",
    ],
    code: "+212 523",
  },
  safi: {
    population: "308,508",
    region: "Marrakech-Safi",
    timezone: "GMT+1",
    climate: "Méditerranéen",
    description: "Capitale de la céramique marocaine",
    attractions: ["Poteries", "Château de Mer", "Médina"],
    code: "+212 524",
  },
};

// Get city info based on name
const getCityInfo = (cityName) => {
  if (!cityName) return null;
  const key = cityName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  for (const [name, info] of Object.entries(cityInfoMap)) {
    const normalizedName = name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
    if (key.includes(normalizedName) || normalizedName.includes(key)) {
      return info;
    }
  }
  return null;
};

// City avatar generator - creates colorful avatar icons with city initials
const getCityImage = (cityName) => {
  if (!cityName) return null;

  // Generate a consistent color based on city name
  const getColorFromName = (name) => {
    const colors = [
      "F59E0B",
      "EF4444",
      "10B981",
      "3B82F6",
      "8B5CF6",
      "EC4899",
      "06B6D4",
      "F97316",
      "84CC16",
      "6366F1",
      "14B8A6",
      "F43F5E",
      "A855F7",
      "22C55E",
      "0EA5E9",
      "D946EF",
      "FB7185",
      "4ADE80",
      "38BDF8",
      "C084FC",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from city name
  const getInitials = (name) => {
    const words = name.split(/[\s-]+/);
    if (words.length > 1) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const initials = getInitials(cityName);
  const color = getColorFromName(cityName);
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    initials
  )}&background=${color}&color=fff&size=100&bold=true&format=svg`;
};

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState(null);
  const location = useLocation();
  const { darkMode } = useTheme();

  // Handle navigation from search
  useEffect(() => {
    if (location.state?.selectedCity) {
      const navCity = location.state.selectedCity;
      setSelectedCity({
        name: navCity.name,
        latitude: navCity.lat,
        longitude: navCity.lng,
      });
    }
  }, [location.state]);

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

  // Mock data fallback for when API is not available
  const mockCities = [
    { id: 1, name: "Casablanca", latitude: 33.5731, longitude: -7.5898 },
    { id: 2, name: "Rabat", latitude: 34.0209, longitude: -6.8416 },
    { id: 3, name: "Marrakech", latitude: 31.6295, longitude: -7.9811 },
    { id: 4, name: "Fès", latitude: 34.0181, longitude: -5.0078 },
    { id: 5, name: "Tanger", latitude: 35.7595, longitude: -5.834 },
    { id: 6, name: "Agadir", latitude: 30.4278, longitude: -9.5981 },
    { id: 7, name: "Meknès", latitude: 33.8935, longitude: -5.5547 },
    { id: 8, name: "Oujda", latitude: 34.6814, longitude: -1.9086 },
    { id: 9, name: "Tétouan", latitude: 35.5785, longitude: -5.3684 },
    { id: 10, name: "El Jadida", latitude: 33.2316, longitude: -8.5007 },
    { id: 11, name: "Essaouira", latitude: 31.5085, longitude: -9.7595 },
    { id: 12, name: "Nador", latitude: 35.1681, longitude: -2.9287 },
    { id: 13, name: "Kénitra", latitude: 34.261, longitude: -6.5802 },
    { id: 14, name: "Beni Mellal", latitude: 32.3373, longitude: -6.3498 },
    { id: 15, name: "Safi", latitude: 32.2994, longitude: -9.2372 },
    { id: 16, name: "Mohammedia", latitude: 33.6861, longitude: -7.3828 },
    { id: 17, name: "Ifrane", latitude: 33.5228, longitude: -5.1106 },
    { id: 18, name: "Ouarzazate", latitude: 30.9189, longitude: -6.8936 },
    { id: 19, name: "Errachidia", latitude: 31.9314, longitude: -4.4288 },
    { id: 20, name: "Laâyoune", latitude: 27.1536, longitude: -13.2034 },
  ];

  const fetchCities = async () => {
    setLoading(true);
    try {
      const data = await getAllCities();
      if (data && data.length > 0) {
        setCities(data);
        setFilteredCities(data);
      } else {
        // Use mock data if API returns empty
        setCities(mockCities);
        setFilteredCities(mockCities);
      }
    } catch (error) {
      // Use mock data on error
      setCities(mockCities);
      setFilteredCities(mockCities);
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

  // Get extended info for selected city
  const selectedCityInfo = selectedCity
    ? getCityInfo(selectedCity.name || selectedCity.nom)
    : null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1
            className={`text-2xl md:text-3xl font-bold flex items-center gap-3 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            Villes du Maroc 🇲🇦
          </h1>
          <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
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
        <div
          className={`md:col-span-2 rounded-2xl shadow-xl p-4 ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-100"
          }`}
        >
          <div className="relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher une ville..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none ${
                darkMode
                  ? "bg-slate-700 border border-slate-600 text-white placeholder-gray-400"
                  : "bg-gray-50 border border-gray-200 text-gray-800"
              }`}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Cities List */}
        <div
          className={`rounded-2xl shadow-xl lg:h-[600px] flex flex-col ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-100"
          }`}
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-orange-500 rounded-t-2xl">
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
              <Building2
                className={`w-16 h-16 mx-auto mb-4 ${
                  darkMode ? "text-gray-600" : "text-gray-300"
                }`}
              />
              <h4
                className={`text-lg font-medium mb-2 ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Aucune ville trouvée
              </h4>
              <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                {searchTerm
                  ? "Essayez une autre recherche"
                  : "Les villes ne sont pas encore chargées"}
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div
                className={`divide-y ${
                  darkMode ? "divide-slate-700" : "divide-gray-100"
                }`}
              >
                {filteredCities.map((city, index) => (
                  <div
                    key={city.id || index}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedCity?.id === city.id ||
                      selectedCity?.name === city.name
                        ? darkMode
                          ? "bg-amber-900/30 border-l-4 border-amber-500"
                          : "bg-amber-50 border-l-4 border-amber-500"
                        : darkMode
                        ? "hover:bg-slate-700"
                        : "hover:bg-amber-50"
                    }`}
                    onClick={() => setSelectedCity(city)}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ${
                          darkMode
                            ? "bg-amber-900/50"
                            : "bg-gradient-to-br from-amber-100 to-orange-100"
                        }`}
                      >
                        <img
                          src={getCityImage(city.name || city.nom)}
                          alt={city.name || city.nom}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<span class="text-2xl flex items-center justify-center w-full h-full">🏙️</span>';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {city.name || city.nom || "N/A"}
                        </h4>
                        {(city.latitude || city.lat) && (
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
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
        <div className="lg:h-[600px] flex flex-col gap-6">
          {/* Map */}
          <div
            className={`rounded-2xl shadow-xl overflow-hidden flex-shrink-0 ${
              darkMode
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-100"
            }`}
          >
            <div
              className={`px-6 py-4 flex items-center justify-between ${
                darkMode
                  ? "border-b border-slate-700"
                  : "border-b border-gray-100"
              }`}
            >
              <h3
                className={`font-bold flex items-center gap-2 ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                <Map className="w-5 h-5 text-amber-500" />
                Carte
              </h3>
              <span
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {mapWaypoints.length} point(s) affiché(s)
              </span>
            </div>
            <div className="p-4">
              <MapView
                waypoints={mapWaypoints}
                height="250px"
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
            <div
              className={`rounded-2xl shadow-xl overflow-hidden flex-1 overflow-y-auto animate-fadeIn ${
                darkMode
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-white border border-gray-100"
              }`}
            >
              <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-orange-500">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Informations de la ville
                </h3>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      darkMode
                        ? "bg-amber-900/50"
                        : "bg-gradient-to-br from-amber-100 to-orange-100"
                    }`}
                  >
                    <span className="text-3xl">🏙️</span>
                  </div>
                  <div>
                    <h4
                      className={`text-2xl font-bold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {selectedCity.name || selectedCity.nom}
                    </h4>
                    <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
                      Maroc 🇲🇦
                    </p>
                  </div>
                </div>

                {/* Extended Info */}
                {selectedCityInfo && (
                  <div className="space-y-4 mb-6">
                    {/* Description */}
                    <div
                      className={`p-4 rounded-xl ${
                        darkMode
                          ? "bg-slate-700"
                          : "bg-gradient-to-br from-amber-50 to-orange-50"
                      }`}
                    >
                      <p
                        className={darkMode ? "text-gray-200" : "text-gray-700"}
                      >
                        {selectedCityInfo.description}
                      </p>
                    </div>

                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div
                        className={`p-3 rounded-xl flex items-center gap-3 ${
                          darkMode ? "bg-slate-700" : "bg-gray-50"
                        }`}
                      >
                        <Users className="w-5 h-5 text-amber-500" />
                        <div>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Population
                          </p>
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {selectedCityInfo.population}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-xl flex items-center gap-3 ${
                          darkMode ? "bg-slate-700" : "bg-gray-50"
                        }`}
                      >
                        <Globe className="w-5 h-5 text-amber-500" />
                        <div>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Région
                          </p>
                          <p
                            className={`font-semibold text-sm ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {selectedCityInfo.region}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-xl flex items-center gap-3 ${
                          darkMode ? "bg-slate-700" : "bg-gray-50"
                        }`}
                      >
                        <Clock className="w-5 h-5 text-amber-500" />
                        <div>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Fuseau horaire
                          </p>
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {selectedCityInfo.timezone}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`p-3 rounded-xl flex items-center gap-3 ${
                          darkMode ? "bg-slate-700" : "bg-gray-50"
                        }`}
                      >
                        <Thermometer className="w-5 h-5 text-amber-500" />
                        <div>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            Climat
                          </p>
                          <p
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {selectedCityInfo.climate}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Phone Code */}
                    <div
                      className={`p-3 rounded-xl flex items-center gap-3 ${
                        darkMode ? "bg-slate-700" : "bg-gray-50"
                      }`}
                    >
                      <Phone className="w-5 h-5 text-amber-500" />
                      <div>
                        <p
                          className={`text-xs ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Code téléphonique
                        </p>
                        <p
                          className={`font-semibold ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {selectedCityInfo.code}
                        </p>
                      </div>
                    </div>

                    {/* Attractions */}
                    {selectedCityInfo.attractions && (
                      <div>
                        <p
                          className={`text-xs uppercase tracking-wide mb-2 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Sites d&apos;intérêt
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedCityInfo.attractions.map(
                            (attraction, idx) => (
                              <span
                                key={idx}
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  darkMode
                                    ? "bg-amber-900/50 text-amber-300"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {attraction}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* GPS Coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div
                    className={`p-4 rounded-xl ${
                      darkMode ? "bg-slate-700" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Navigation
                        className={`w-4 h-4 ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                      <p
                        className={`text-xs uppercase tracking-wide ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Latitude
                      </p>
                    </div>
                    <p
                      className={`text-lg font-mono font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {(selectedCity.latitude || selectedCity.lat)?.toFixed(
                        6
                      ) || "N/A"}
                    </p>
                  </div>
                  <div
                    className={`p-4 rounded-xl ${
                      darkMode ? "bg-slate-700" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Navigation
                        className={`w-4 h-4 rotate-90 ${
                          darkMode ? "text-gray-500" : "text-gray-400"
                        }`}
                      />
                      <p
                        className={`text-xs uppercase tracking-wide ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        Longitude
                      </p>
                    </div>
                    <p
                      className={`text-lg font-mono font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {(selectedCity.longitude || selectedCity.lng)?.toFixed(
                        6
                      ) || "N/A"}
                    </p>
                  </div>
                </div>

                {selectedCity.id && (
                  <div
                    className={`mt-4 pt-4 ${
                      darkMode
                        ? "border-t border-slate-600"
                        : "border-t border-gray-100"
                    }`}
                  >
                    <p
                      className={`text-xs uppercase tracking-wide ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      ID
                    </p>
                    <code
                      className={`text-sm px-2 py-1 rounded ${
                        darkMode
                          ? "bg-slate-700 text-gray-200"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedCity.id}
                    </code>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${
                      selectedCity.latitude || selectedCity.lat
                    },${selectedCity.longitude || selectedCity.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Voir sur Google Maps
                  </a>
                  <button
                    onClick={() => setSelectedCity(null)}
                    className={`px-6 py-3 rounded-xl transition-colors ${
                      darkMode
                        ? "border border-slate-600 text-gray-300 hover:bg-slate-700"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Fermer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Popular Cities */}
          {!selectedCity && (
            <div
              className={`rounded-2xl p-6 ${
                darkMode
                  ? "bg-slate-800 border border-slate-700"
                  : "bg-gradient-to-br from-amber-50 to-orange-50"
              }`}
            >
              <h3
                className={`font-bold mb-4 ${
                  darkMode ? "text-white" : "text-gray-700"
                }`}
              >
                Villes Principales
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    name: "Casablanca",
                    emoji: "🏢",
                    lat: 33.5731,
                    lng: -7.5898,
                  },
                  { name: "Rabat", emoji: "🏛️", lat: 34.0209, lng: -6.8416 },
                  {
                    name: "Marrakech",
                    emoji: "🕌",
                    lat: 31.6295,
                    lng: -7.9811,
                  },
                  { name: "Fès", emoji: "🏺", lat: 34.0181, lng: -5.0078 },
                  { name: "Tanger", emoji: "⛴️", lat: 35.7595, lng: -5.834 },
                  { name: "Agadir", emoji: "🏖️", lat: 30.4278, lng: -9.5981 },
                ].map((city) => (
                  <button
                    key={city.name}
                    onClick={() => {
                      // Normalize function for comparison
                      const normalize = (str) =>
                        str
                          ?.toLowerCase()
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .trim() || "";

                      const cityNameNorm = normalize(city.name);

                      // Try to find in API cities
                      const found = cities.find((c) => {
                        const apiName = normalize(c.name || c.nom);
                        return (
                          apiName.includes(cityNameNorm) ||
                          cityNameNorm.includes(apiName)
                        );
                      });

                      if (found) {
                        setSelectedCity(found);
                      } else {
                        // Fallback: create city object with known coordinates
                        const fallbackCity = {
                          name: city.name,
                          nom: city.name,
                          latitude: city.lat,
                          longitude: city.lng,
                          lat: city.lat,
                          lng: city.lng,
                        };
                        setSelectedCity(fallbackCity);
                      }
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl hover:shadow-md transition-all text-left ${
                      darkMode ? "bg-slate-700 hover:bg-slate-600" : "bg-white"
                    }`}
                  >
                    <span className="text-2xl">{city.emoji}</span>
                    <span
                      className={`font-medium ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
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
