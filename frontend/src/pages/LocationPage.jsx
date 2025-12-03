import { useState, useEffect } from "react";
import {
  Globe,
  MapPin,
  Server,
  Search,
  RefreshCw,
  Wifi,
  Clock,
  Building,
} from "lucide-react";
import {
  getCurrentLocation,
  getLocationByIp,
  lookupLocation,
  refreshLocation,
  getServerInfo,
} from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function LocationPage() {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [serverInfo, setServerInfo] = useState(null);
  const [searchIp, setSearchIp] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [locData, serverData] = await Promise.all([
        getCurrentLocation().catch(() => null),
        getServerInfo().catch(() => null),
      ]);
      setCurrentLocation(locData);
      setServerInfo(serverData);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const data = await refreshLocation();
      setCurrentLocation(data);
      toast.success("Localisation mise à jour!");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchIp.trim()) {
      toast.error("Veuillez entrer une adresse IP");
      return;
    }

    setSearching(true);
    setSearchResult(null);
    try {
      const data = await getLocationByIp(searchIp);
      setSearchResult(data);
      toast.success("Localisation trouvée!");
    } catch (error) {
      toast.error(error.message || "Erreur lors de la recherche");
    } finally {
      setSearching(false);
    }
  };

  const LocationCard = ({ data, title, icon: Icon, gradient }) => (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      <div className={`px-6 py-4 bg-gradient-to-r ${gradient}`}>
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <Icon className="w-5 h-5" />
          {title}
        </h3>
      </div>

      {data ? (
        <div className="p-6 space-y-4">
          {/* IP Address */}
          {data.ipAddress && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <Wifi className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-xs text-gray-500">Adresse IP</p>
                <p className="font-mono font-medium">{data.ipAddress}</p>
              </div>
            </div>
          )}

          {/* Location Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Pays
              </p>
              <p className="font-medium text-lg">{data.country || "N/A"}</p>
              {data.countryCode && (
                <span className="text-2xl">
                  {getCountryFlag(data.countryCode)}
                </span>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Région
              </p>
              <p className="font-medium">
                {data.regionName || data.region || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Ville
              </p>
              <p className="font-medium text-lg">{data.city || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">
                Code Postal
              </p>
              <p className="font-medium">{data.zip || "N/A"}</p>
            </div>
          </div>

          {/* Coordinates */}
          {data.latitude && data.longitude && (
            <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                Coordonnées GPS
              </p>
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-sm text-gray-500">Lat:</span>
                  <span className="ml-2 font-mono font-medium">
                    {data.latitude?.toFixed(4)}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Lng:</span>
                  <span className="ml-2 font-mono font-medium">
                    {data.longitude?.toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ISP Info */}
          {(data.isp || data.org) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  FAI
                </p>
                <p className="font-medium text-sm">{data.isp || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Organisation
                </p>
                <p className="font-medium text-sm">{data.org || "N/A"}</p>
              </div>
            </div>
          )}

          {/* Timezone */}
          {data.timezone && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Fuseau horaire</p>
                <p className="font-medium">{data.timezone}</p>
              </div>
            </div>
          )}

          {/* Status */}
          {data.status && (
            <div className="pt-4 border-t border-gray-100">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  data.status === "SUCCESS"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {data.status === "SUCCESS" ? "✓" : "✗"} {data.status}
              </span>
              {data.message && (
                <p className="text-sm text-gray-500 mt-2">{data.message}</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Données non disponibles</p>
        </div>
      )}
    </div>
  );

  const getCountryFlag = (code) => {
    const flags = {
      MA: "🇲🇦",
      FR: "🇫🇷",
      US: "🇺🇸",
      GB: "🇬🇧",
      DE: "🇩🇪",
      ES: "🇪🇸",
    };
    return flags[code] || "🏳️";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Chargement de la localisation..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
              <Globe className="w-6 h-6 text-white" />
            </div>
            Localisation
          </h1>
          <p className="text-gray-500 mt-1">
            Géolocalisation basée sur l'adresse IP
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={loading}
          className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          Rafraîchir
        </button>
      </div>

      {/* IP Search */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-pink-500" />
          Rechercher par IP
        </h3>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Wifi className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchIp}
              onChange={(e) => setSearchIp(e.target.value)}
              placeholder="Ex: 8.8.8.8, 41.140.0.1"
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setSearchIp("8.8.8.8")}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Google DNS
            </button>
            <button
              onClick={() => setSearchIp("41.140.0.1")}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Maroc 🇲🇦
            </button>
            <button
              onClick={handleSearch}
              disabled={searching}
              className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {searching ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Location */}
        <LocationCard
          data={currentLocation}
          title="Votre Localisation"
          icon={MapPin}
          gradient="from-pink-500 to-rose-500"
        />

        {/* Search Result or Server Info */}
        {searchResult ? (
          <LocationCard
            data={searchResult}
            title={`Résultat: ${searchIp}`}
            icon={Search}
            gradient="from-purple-500 to-indigo-500"
          />
        ) : (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-500">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <Server className="w-5 h-5" />
                Informations Serveur
              </h3>
            </div>

            {serverInfo ? (
              <div className="p-6 space-y-4">
                {serverInfo.serverHostname && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Building className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500">Hostname</p>
                      <p className="font-medium">{serverInfo.serverHostname}</p>
                    </div>
                  </div>
                )}

                {serverInfo.serverIp && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Wifi className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500">IP Serveur</p>
                      <p className="font-mono font-medium">
                        {serverInfo.serverIp}
                      </p>
                    </div>
                  </div>
                )}

                {serverInfo.serverPort && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                      Port
                    </p>
                    <p className="font-mono font-medium text-lg">
                      {serverInfo.serverPort}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  {serverInfo.osName && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Système
                      </p>
                      <p className="font-medium">{serverInfo.osName}</p>
                      {serverInfo.osVersion && (
                        <p className="text-sm text-gray-500">
                          {serverInfo.osVersion}
                        </p>
                      )}
                    </div>
                  )}
                  {serverInfo.javaVersion && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wide">
                        Java
                      </p>
                      <p className="font-medium">{serverInfo.javaVersion}</p>
                    </div>
                  )}
                </div>

                {serverInfo.timestamp && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <Clock className="w-4 h-4" />
                    {serverInfo.timestamp}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-12 text-center">
                <Server className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Informations non disponibles</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick IP Examples */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
        <h3 className="font-bold text-gray-700 mb-4">Exemples d'adresses IP</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { ip: "8.8.8.8", name: "Google DNS", flag: "🇺🇸" },
            { ip: "1.1.1.1", name: "Cloudflare", flag: "🇺🇸" },
            { ip: "41.140.0.1", name: "Maroc Telecom", flag: "🇲🇦" },
            { ip: "105.158.0.1", name: "Orange Maroc", flag: "🇲🇦" },
          ].map((item) => (
            <button
              key={item.ip}
              onClick={() => {
                setSearchIp(item.ip);
                handleSearch();
              }}
              className="p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.flag}</span>
                <div>
                  <p className="font-mono text-sm group-hover:text-pink-600 transition-colors">
                    {item.ip}
                  </p>
                  <p className="text-xs text-gray-500">{item.name}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
