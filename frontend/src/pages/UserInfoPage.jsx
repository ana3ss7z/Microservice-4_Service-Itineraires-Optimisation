import { useState } from "react";
import {
  Users,
  Search,
  User,
  Mail,
  Phone,
  Package,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  RefreshCw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Truck,
  Box,
  Activity,
  X,
  Info,
} from "lucide-react";
import { getUserInfo, getRouteById } from "../services/api";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

export default function UserInfoPage() {
  const { darkMode } = useTheme();
  const [userId, setUserId] = useState("");
  const [userInfo, setUserInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalDuration: 0,
    totalVolume: 0,
    totalRoutes: 0,
  });

  // Liste des utilisateurs prédéfinis pour faciliter la recherche
  const predefinedUsers = [
    { id: "user123", name: "Ahmed Benali", icon: "👨‍💼" },
    { id: "user456", name: "Fatima Alaoui", icon: "👩‍💼" },
    { id: "user789", name: "Omar Tazi", icon: "👨‍🔧" },
    { id: "user999", name: "Khadija Mansouri", icon: "👩‍🏫" },
    { id: "user_001", name: "Test User 1", icon: "🧪" },
    { id: "user_002", name: "Test User 2", icon: "🧪" },
  ];

  // Mock data for demonstration purposes
  const getMockDataForUser = (uid) => {
    const mockRoutes = {
      user123: [
        {
          id: "route-001",
          fullName: "Ahmed Benali",
          username: "ahmed.benali",
          email: "ahmed@example.com",
          phone: "+212 6 12 34 56 78",
          adresseDepart: "Casablanca",
          adresseDestination: "Rabat",
          totalDistanceKm: 87.5,
          totalDurationMin: 65,
          volume: 12.5,
          natureMarchandise: "Électronique",
          dateDepart: "2024-12-01T10:00:00",
        },
        {
          id: "route-002",
          fullName: "Ahmed Benali",
          username: "ahmed.benali",
          email: "ahmed@example.com",
          phone: "+212 6 12 34 56 78",
          adresseDepart: "Marrakech",
          adresseDestination: "Agadir",
          totalDistanceKm: 252.3,
          totalDurationMin: 180,
          volume: 25.0,
          natureMarchandise: "Textile",
          dateDepart: "2024-11-28T08:30:00",
        },
      ],
      user456: [
        {
          id: "route-003",
          fullName: "Fatima Alaoui",
          username: "fatima.alaoui",
          email: "fatima@example.com",
          phone: "+212 6 98 76 54 32",
          adresseDepart: "Fès",
          adresseDestination: "Meknès",
          totalDistanceKm: 64.2,
          totalDurationMin: 50,
          volume: 8.0,
          natureMarchandise: "Artisanat",
          dateDepart: "2024-12-02T14:00:00",
        },
      ],
      user789: [
        {
          id: "route-004",
          fullName: "Omar Tazi",
          username: "omar.tazi",
          email: "omar@example.com",
          phone: "+212 6 55 44 33 22",
          adresseDepart: "Tanger",
          adresseDestination: "Tétouan",
          totalDistanceKm: 57.8,
          totalDurationMin: 45,
          volume: 15.0,
          natureMarchandise: "Pièces Auto",
          dateDepart: "2024-11-30T09:00:00",
        },
        {
          id: "route-005",
          fullName: "Omar Tazi",
          username: "omar.tazi",
          email: "omar@example.com",
          phone: "+212 6 55 44 33 22",
          adresseDepart: "Oujda",
          adresseDestination: "Nador",
          totalDistanceKm: 152.0,
          totalDurationMin: 110,
          volume: 20.0,
          natureMarchandise: "Alimentaire",
          dateDepart: "2024-11-25T07:00:00",
        },
      ],
      user999: [
        {
          id: "route-006",
          fullName: "Khadija Mansouri",
          username: "khadija.m",
          email: "khadija@example.com",
          phone: "+212 6 11 22 33 44",
          adresseDepart: "Essaouira",
          adresseDestination: "Marrakech",
          totalDistanceKm: 176.5,
          totalDurationMin: 140,
          volume: 5.5,
          natureMarchandise: "Produits de mer",
          dateDepart: "2024-12-03T06:00:00",
        },
      ],
      user_001: [
        {
          id: "route-007",
          fullName: "Test User 1",
          username: "test1",
          email: "test1@example.com",
          phone: "+212 6 00 00 00 01",
          adresseDepart: "Casablanca",
          adresseDestination: "Marrakech",
          totalDistanceKm: 238.0,
          totalDurationMin: 170,
          volume: 30.0,
          natureMarchandise: "Divers",
          dateDepart: "2024-12-01T12:00:00",
        },
        {
          id: "route-008",
          fullName: "Test User 1",
          username: "test1",
          email: "test1@example.com",
          phone: "+212 6 00 00 00 01",
          adresseDepart: "Rabat",
          adresseDestination: "Fès",
          totalDistanceKm: 200.0,
          totalDurationMin: 150,
          volume: 18.0,
          natureMarchandise: "Matériaux",
          dateDepart: "2024-11-29T11:00:00",
        },
        {
          id: "route-009",
          fullName: "Test User 1",
          username: "test1",
          email: "test1@example.com",
          phone: "+212 6 00 00 00 01",
          adresseDepart: "Agadir",
          adresseDestination: "Ouarzazate",
          totalDistanceKm: 365.0,
          totalDurationMin: 280,
          volume: 22.0,
          natureMarchandise: "Équipements",
          dateDepart: "2024-11-27T08:00:00",
        },
      ],
      user_002: [
        {
          id: "route-010",
          fullName: "Test User 2",
          username: "test2",
          email: "test2@example.com",
          phone: "+212 6 00 00 00 02",
          adresseDepart: "Kénitra",
          adresseDestination: "Casablanca",
          totalDistanceKm: 132.0,
          totalDurationMin: 95,
          volume: 10.0,
          natureMarchandise: "Documents",
          dateDepart: "2024-12-02T16:00:00",
        },
      ],
    };
    return mockRoutes[uid] || [];
  };

  const fetchUserInfo = async (uid = userId) => {
    if (!uid.trim()) {
      toast.error("Veuillez sélectionner ou entrer un ID utilisateur");
      return;
    }

    setLoading(true);
    setUsingMockData(false);
    try {
      const response = await getUserInfo(uid, page, pageSize);

      // Handle both array and paginated response
      const data = response.content || response || [];

      if (data.length > 0) {
        setUserInfo(data);
        setTotalPages(
          response.totalPages || Math.ceil(data.length / pageSize) || 1
        );

        // Calculate stats
        const totalDistance = data.reduce(
          (sum, r) => sum + (r.totalDistanceKm || 0),
          0
        );
        const totalDuration = data.reduce(
          (sum, r) => sum + (r.totalDurationMin || 0),
          0
        );
        const totalVolume = data.reduce((sum, r) => sum + (r.volume || 0), 0);
        setStats({
          totalDistance: totalDistance.toFixed(1),
          totalDuration: Math.round(totalDuration),
          totalVolume: totalVolume.toFixed(1),
          totalRoutes: data.length,
        });
        toast.success(`Informations récupérées pour ${uid}`);
      } else {
        // Use mock data if API returns empty
        useMockData(uid);
      }
    } catch (error) {
      // Use mock data on error
      useMockData(uid);
    } finally {
      setLoading(false);
    }
  };

  const useMockData = (uid) => {
    const mockData = getMockDataForUser(uid);
    if (mockData.length > 0) {
      setUserInfo(mockData);
      setTotalPages(1);
      setUsingMockData(true);

      const totalDistance = mockData.reduce(
        (sum, r) => sum + (r.totalDistanceKm || 0),
        0
      );
      const totalDuration = mockData.reduce(
        (sum, r) => sum + (r.totalDurationMin || 0),
        0
      );
      const totalVolume = mockData.reduce((sum, r) => sum + (r.volume || 0), 0);
      setStats({
        totalDistance: totalDistance.toFixed(1),
        totalDuration: Math.round(totalDuration),
        totalVolume: totalVolume.toFixed(1),
        totalRoutes: mockData.length,
      });
      toast.success(`Données de démonstration chargées pour ${uid}`);
    } else {
      setUserInfo([]);
      setStats({
        totalDistance: 0,
        totalDuration: 0,
        totalVolume: 0,
        totalRoutes: 0,
      });
      toast.error("Aucune donnée trouvée pour cet utilisateur");
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
    const mins = Math.round(minutes % 60);
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

  const handleUserSelect = (uid) => {
    setUserId(uid);
    setPage(0);
    fetchUserInfo(uid);
  };

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            Informations Utilisateurs
          </h1>
          <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Consultez les informations détaillées des utilisateurs et leurs
            demandes
          </p>
        </div>
      </div>

      {/* Demo Data Notice */}
      <div
        className={`flex items-center gap-3 p-4 rounded-xl border ${
          darkMode
            ? "bg-amber-900/30 border-amber-700/50 text-amber-300"
            : "bg-amber-50 border-amber-200 text-amber-700"
        }`}
      >
        <Info className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm">
          <span className="font-semibold">Note :</span> Les utilisateurs
          ci-dessous sont des données de démonstration pour tester
          l&apos;application. Les informations affichées sont fictives et
          servent uniquement à illustrer le fonctionnement du système.
        </p>
      </div>

      {/* Predefined Users Grid */}
      <div
        className={`backdrop-blur-sm rounded-2xl shadow-lg border p-6 ${
          darkMode
            ? "bg-slate-800/70 border-slate-700"
            : "bg-white/70 border-white/50"
        }`}
      >
        <h2
          className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          <User className="w-5 h-5 text-indigo-500" />
          Utilisateurs Disponibles
          <span
            className={`ml-2 text-xs px-2 py-1 rounded-full font-normal ${
              darkMode
                ? "bg-amber-900/50 text-amber-300"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            Démo
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {predefinedUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleUserSelect(user.id)}
              className={`p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                userId === user.id
                  ? darkMode
                    ? "border-indigo-500 bg-indigo-900/30 shadow-lg"
                    : "border-indigo-500 bg-indigo-50 shadow-lg"
                  : darkMode
                  ? "border-slate-600 hover:border-indigo-400 bg-slate-700"
                  : "border-gray-200 hover:border-indigo-300 bg-white"
              }`}
            >
              <div className="text-3xl mb-2">{user.icon}</div>
              <p
                className={`font-medium text-sm truncate ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                {user.name}
              </p>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {user.id}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Search */}
      <div
        className={`backdrop-blur-sm rounded-2xl shadow-lg border p-6 ${
          darkMode
            ? "bg-slate-800/70 border-slate-700"
            : "bg-white/70 border-white/50"
        }`}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search
              className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Entrez un ID utilisateur personnalisé..."
              className={`w-full pl-12 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                darkMode
                  ? "bg-slate-700 border-slate-600 text-white placeholder-gray-400"
                  : "bg-white border-gray-200"
              }`}
            />
          </div>
          <button
            onClick={() => fetchUserInfo()}
            disabled={loading || !userId.trim()}
            className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 flex items-center gap-2 font-medium"
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

      {/* Stats Cards */}
      {userInfo.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-blue-100 text-sm">Total Routes</span>
            </div>
            <p className="text-3xl font-bold">{stats.totalRoutes}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-emerald-100 text-sm">Distance Totale</span>
            </div>
            <p className="text-3xl font-bold">
              {stats.totalDistance} <span className="text-lg">km</span>
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-purple-100 text-sm">Durée Totale</span>
            </div>
            <p className="text-3xl font-bold">
              {formatDuration(stats.totalDuration)}
            </p>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Box className="w-5 h-5" />
              </div>
              <span className="text-orange-100 text-sm">Volume Total</span>
            </div>
            <p className="text-3xl font-bold">
              {stats.totalVolume} <span className="text-lg">m³</span>
            </p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      )}

      {/* User Routes List */}
      {!loading && userInfo.length > 0 && (
        <div
          className={`backdrop-blur-sm rounded-2xl shadow-lg border overflow-hidden ${
            darkMode
              ? "bg-slate-800/70 border-slate-700"
              : "bg-white/70 border-white/50"
          }`}
        >
          <div
            className={`p-6 border-b ${
              darkMode ? "border-slate-700" : "border-gray-100"
            }`}
          >
            <h2
              className={`text-lg font-semibold flex items-center gap-2 ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              <Activity className="w-5 h-5 text-indigo-500" />
              Demandes de l&apos;utilisateur ({userInfo.length})
            </h2>
          </div>

          <div
            className={`divide-y ${
              darkMode ? "divide-slate-700" : "divide-gray-100"
            }`}
          >
            {userInfo.map((route, index) => (
              <div
                key={route.id || index}
                className={`p-5 transition-colors ${
                  darkMode ? "hover:bg-slate-700/50" : "hover:bg-gray-50/50"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          darkMode
                            ? "bg-gradient-to-br from-indigo-600 to-indigo-700"
                            : "bg-gradient-to-br from-indigo-100 to-indigo-200"
                        }`}
                      >
                        <User
                          className={`w-6 h-6 ${
                            darkMode ? "text-white" : "text-indigo-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3
                            className={`font-semibold ${
                              darkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {route.fullName || route.username || "Utilisateur"}
                          </h3>
                          {route.username && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs ${
                                darkMode
                                  ? "bg-indigo-900/50 text-indigo-300"
                                  : "bg-indigo-100 text-indigo-700"
                              }`}
                            >
                              @{route.username}
                            </span>
                          )}
                        </div>

                        {/* Contact Info */}
                        <div
                          className={`flex flex-wrap gap-3 mt-2 text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {route.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {route.email}
                            </span>
                          )}
                          {route.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {route.phone}
                            </span>
                          )}
                        </div>

                        {/* Route Info */}
                        <div className="flex items-center gap-2 mt-3 text-sm">
                          <span className="text-emerald-600 font-medium truncate max-w-[200px]">
                            {route.adresseDepart ||
                              route.originAddress ||
                              "Départ"}
                          </span>
                          <ArrowRight
                            className={`w-4 h-4 flex-shrink-0 ${
                              darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          />
                          <span className="text-morocco-red font-medium truncate max-w-[200px]">
                            {route.adresseDestination ||
                              route.destinationAddress ||
                              "Destination"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marchandise & Volume */}
                  {(route.natureMarchandise || route.volume) && (
                    <div
                      className={`lg:w-48 p-3 rounded-xl ${
                        darkMode ? "bg-orange-900/30" : "bg-orange-50"
                      }`}
                    >
                      <div
                        className={`flex items-center gap-2 ${
                          darkMode ? "text-orange-400" : "text-orange-700"
                        }`}
                      >
                        <Package className="w-4 h-4" />
                        <span className="text-sm font-medium">Marchandise</span>
                      </div>
                      {route.natureMarchandise && (
                        <p
                          className={`text-sm mt-1 truncate ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          {route.natureMarchandise}
                        </p>
                      )}
                      {route.volume && (
                        <p
                          className={`text-lg font-bold mt-1 ${
                            darkMode ? "text-orange-400" : "text-orange-600"
                          }`}
                        >
                          {route.volume} m³
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 lg:gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        {route.totalDistanceKm?.toFixed(1) || "-"}
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        km
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {formatDuration(route.totalDurationMin)}
                      </p>
                      <p
                        className={`text-xs ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        durée
                      </p>
                    </div>
                  </div>

                  {/* Date & Actions */}
                  <div className="flex items-center gap-3">
                    {route.dateDepart && (
                      <div className="text-right">
                        <div
                          className={`flex items-center gap-1 text-sm ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(route.dateDepart)}</span>
                        </div>
                      </div>
                    )}
                    {route.id && (
                      <button
                        onClick={() => viewRouteDetails(route.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          darkMode
                            ? "hover:bg-indigo-900/50"
                            : "hover:bg-indigo-100"
                        }`}
                        title="Voir les détails"
                      >
                        <Eye className="w-5 h-5 text-indigo-600" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className={`p-4 border-t flex items-center justify-between ${
                darkMode ? "border-slate-700" : "border-gray-100"
              }`}
            >
              <button
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  darkMode
                    ? "hover:bg-slate-700 text-gray-300"
                    : "hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
                Précédent
              </button>
              <span className={darkMode ? "text-gray-400" : "text-gray-600"}>
                Page {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page >= totalPages - 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  darkMode
                    ? "hover:bg-slate-700 text-gray-300"
                    : "hover:bg-gray-100"
                }`}
              >
                Suivant
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && userInfo.length === 0 && userId && (
        <div
          className={`backdrop-blur-sm rounded-2xl shadow-lg border p-12 text-center ${
            darkMode
              ? "bg-slate-800/70 border-slate-700"
              : "bg-white/70 border-white/50"
          }`}
        >
          <div
            className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              darkMode ? "bg-slate-700" : "bg-gray-100"
            }`}
          >
            <Users
              className={`w-10 h-10 ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
          </div>
          <h3
            className={`text-xl font-semibold mb-2 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Aucune information trouvée
          </h3>
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            Aucune demande trouvée pour l&apos;utilisateur &quot;{userId}&quot;
          </p>
        </div>
      )}

      {/* Initial State */}
      {!loading && userInfo.length === 0 && !userId && (
        <div
          className={`backdrop-blur-sm rounded-2xl shadow-lg border p-12 text-center ${
            darkMode
              ? "bg-slate-800/70 border-slate-700"
              : "bg-white/70 border-white/50"
          }`}
        >
          <div
            className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
              darkMode ? "bg-indigo-900/50" : "bg-indigo-100"
            }`}
          >
            <Users
              className={`w-10 h-10 ${
                darkMode ? "text-indigo-400" : "text-indigo-500"
              }`}
            />
          </div>
          <h3
            className={`text-xl font-semibold mb-2 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Sélectionnez un utilisateur
          </h3>
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            Cliquez sur un utilisateur ci-dessus ou entrez un ID personnalisé
          </p>
        </div>
      )}

      {/* Route Details Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className={`rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-auto ${
              darkMode ? "bg-slate-800" : "bg-white"
            }`}
          >
            <div
              className={`p-6 border-b flex items-center justify-between sticky top-0 ${
                darkMode
                  ? "border-slate-700 bg-slate-800"
                  : "border-gray-100 bg-white"
              }`}
            >
              <h3
                className={`text-xl font-bold ${
                  darkMode ? "text-white" : "text-gray-800"
                }`}
              >
                Détails de la Route
              </h3>
              <button
                onClick={() => setSelectedRoute(null)}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode
                    ? "hover:bg-slate-700 text-gray-400"
                    : "hover:bg-gray-100"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <pre
                className={`rounded-xl p-4 overflow-auto text-sm ${
                  darkMode
                    ? "bg-slate-900 text-gray-300"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                {JSON.stringify(selectedRoute, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
