import {
  Bell,
  User,
  Settings,
  Search,
  X,
  MapPin,
  Route,
  Clock,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

// Moroccan cities for search
const moroccanCities = [
  {
    name: "Casablanca",
    lat: 33.5731,
    lng: -7.5898,
    region: "Casablanca-Settat",
  },
  { name: "Rabat", lat: 34.0209, lng: -6.8416, region: "Rabat-Salé-Kénitra" },
  { name: "Marrakech", lat: 31.6295, lng: -7.9811, region: "Marrakech-Safi" },
  { name: "Fès", lat: 33.8959, lng: -5.5544, region: "Fès-Meknès" },
  {
    name: "Tanger",
    lat: 35.7595,
    lng: -5.834,
    region: "Tanger-Tétouan-Al Hoceïma",
  },
  { name: "Agadir", lat: 30.4278, lng: -9.5981, region: "Souss-Massa" },
  { name: "Meknès", lat: 34.0181, lng: -5.0078, region: "Fès-Meknès" },
  { name: "Oujda", lat: 34.6867, lng: -1.9114, region: "Oriental" },
  {
    name: "Tétouan",
    lat: 35.5889,
    lng: -5.3626,
    region: "Tanger-Tétouan-Al Hoceïma",
  },
  {
    name: "El Jadida",
    lat: 33.2316,
    lng: -8.5007,
    region: "Casablanca-Settat",
  },
  { name: "Essaouira", lat: 31.5085, lng: -9.7595, region: "Marrakech-Safi" },
  { name: "Nador", lat: 35.1681, lng: -2.9287, region: "Oriental" },
  { name: "Kénitra", lat: 34.261, lng: -6.5802, region: "Rabat-Salé-Kénitra" },
  {
    name: "Beni Mellal",
    lat: 32.3373,
    lng: -6.3498,
    region: "Béni Mellal-Khénifra",
  },
  { name: "Safi", lat: 32.2994, lng: -9.2372, region: "Marrakech-Safi" },
];

// Quick links for search
const quickLinks = [
  { name: "Calculer un itinéraire", path: "/calculator", icon: Route },
  { name: "Optimiser une tournée", path: "/optimizer", icon: Clock },
  { name: "Voir les villes", path: "/cities", icon: MapPin },
];

export default function Navbar({ onMenuClick, isCollapsed }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  // Handle click outside to close search
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search functionality
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase();
      const cityResults = moroccanCities.filter(
        (city) =>
          city.name.toLowerCase().includes(query) ||
          city.region.toLowerCase().includes(query)
      );
      const linkResults = quickLinks.filter((link) =>
        link.name.toLowerCase().includes(query)
      );
      setSearchResults({ cities: cityResults.slice(0, 5), links: linkResults });
      setShowSearchResults(true);
    } else {
      setSearchResults({ cities: [], links: [] });
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const handleCityClick = (city) => {
    navigate("/cities", { state: { selectedCity: city } });
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const handleLinkClick = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowSearchResults(false);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setShowSearchResults(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 h-16 ${
        darkMode ? "bg-slate-800/90" : "bg-white/80"
      } backdrop-blur-xl border-b ${
        darkMode ? "border-slate-700" : "border-gray-200/50"
      } shadow-sm z-50`}
    >
      <div className="h-full px-4 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Animated Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className={`relative w-10 h-10 rounded-xl ${
              darkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
            } transition-all duration-300 flex items-center justify-center group`}
            aria-label={isCollapsed ? "Ouvrir le menu" : "Fermer le menu"}
          >
            <div className="flex flex-col justify-center items-center w-6 h-6">
              <span
                className={`block h-0.5 w-5 rounded-full transition-all duration-300 ${
                  darkMode ? "bg-gray-300" : "bg-gray-600"
                } ${
                  isCollapsed
                    ? "translate-y-0 rotate-0"
                    : "translate-y-[7px] rotate-45"
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full my-1 transition-all duration-300 ${
                  darkMode ? "bg-gray-300" : "bg-gray-600"
                } ${
                  isCollapsed ? "opacity-100 scale-100" : "opacity-0 scale-0"
                }`}
              />
              <span
                className={`block h-0.5 w-5 rounded-full transition-all duration-300 ${
                  darkMode ? "bg-gray-300" : "bg-gray-600"
                } ${
                  isCollapsed
                    ? "translate-y-0 rotate-0"
                    : "-translate-y-[7px] -rotate-45"
                }`}
              />
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-morocco-red to-morocco-green flex items-center justify-center shadow-lg">
              <span className="text-xl">🚗</span>
            </div>
            <div className="hidden sm:block">
              <h1
                className={`font-bold ${
                  darkMode ? "text-gray-100" : "text-gray-800"
                } text-lg`}
              >
                Itinéraires Maroc
              </h1>
              <p
                className={`text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Optimisation de tournées
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-8" ref={searchRef}>
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher une ville, un trajet..."
              className={`w-full pl-10 pr-10 py-2.5 ${
                darkMode
                  ? "bg-slate-700 text-white placeholder-gray-400 focus:bg-slate-600"
                  : "bg-gray-100 focus:bg-white"
              } border-0 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all outline-none text-sm`}
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            )}

            {/* Search Results Dropdown */}
            {showSearchResults &&
              (searchResults.cities?.length > 0 ||
                searchResults.links?.length > 0) && (
                <div
                  className={`absolute top-full left-0 right-0 mt-2 ${
                    darkMode
                      ? "bg-slate-800 border-slate-700"
                      : "bg-white border-gray-100"
                  } rounded-xl shadow-xl border overflow-hidden animate-fadeIn z-50`}
                >
                  {/* Quick Links */}
                  {searchResults.links?.length > 0 && (
                    <div className="p-2">
                      <p
                        className={`text-xs font-semibold ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } px-2 mb-1`}
                      >
                        Actions rapides
                      </p>
                      {searchResults.links.map((link) => (
                        <button
                          key={link.path}
                          onClick={() => handleLinkClick(link.path)}
                          className={`w-full flex items-center gap-3 px-3 py-2 ${
                            darkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"
                          } rounded-lg transition-colors text-left`}
                        >
                          <link.icon className="w-4 h-4 text-primary-500" />
                          <span
                            className={`text-sm ${
                              darkMode ? "text-gray-200" : "text-gray-700"
                            }`}
                          >
                            {link.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Cities */}
                  {searchResults.cities?.length > 0 && (
                    <div
                      className={`p-2 ${
                        searchResults.links?.length > 0
                          ? `border-t ${
                              darkMode ? "border-slate-700" : "border-gray-100"
                            }`
                          : ""
                      }`}
                    >
                      <p
                        className={`text-xs font-semibold ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        } px-2 mb-1`}
                      >
                        Villes
                      </p>
                      {searchResults.cities.map((city) => (
                        <button
                          key={city.name}
                          onClick={() => handleCityClick(city)}
                          className={`w-full flex items-center gap-3 px-3 py-2 ${
                            darkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"
                          } rounded-lg transition-colors text-left`}
                        >
                          <MapPin className="w-4 h-4 text-morocco-red" />
                          <div>
                            <p
                              className={`text-sm font-medium ${
                                darkMode ? "text-gray-200" : "text-gray-700"
                              }`}
                            >
                              {city.name}
                            </p>
                            <p
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {city.region}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Link
            to="/notifications"
            className={`relative p-2.5 rounded-xl ${
              darkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
            } transition-colors`}
          >
            <Bell
              className={`w-5 h-5 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </Link>

          {/* Settings */}
          <Link
            to="/settings"
            className={`p-2.5 rounded-xl ${
              darkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
            } transition-colors`}
          >
            <Settings
              className={`w-5 h-5 ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            />
          </Link>

          {/* User Menu */}
          <div className="relative ml-2">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`flex items-center gap-3 p-2 rounded-xl ${
                darkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
              } transition-colors`}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="hidden lg:block text-left">
                <p
                  className={`text-sm font-medium ${
                    darkMode ? "text-gray-100" : "text-gray-800"
                  }`}
                >
                  Admin
                </p>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Transport Maroc
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div
                className={`absolute right-0 top-full mt-2 w-48 ${
                  darkMode
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-100"
                } rounded-xl shadow-xl border py-2 animate-fadeIn`}
              >
                <Link
                  to="/user-info"
                  onClick={() => setShowUserMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm ${
                    darkMode
                      ? "text-gray-200 hover:bg-slate-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <User className="w-4 h-4" /> Mon Profil
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className={`flex items-center gap-3 px-4 py-2 text-sm ${
                    darkMode
                      ? "text-gray-200 hover:bg-slate-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Settings className="w-4 h-4" /> Paramètres
                </Link>
                <hr
                  className={`my-2 ${
                    darkMode ? "border-slate-700" : "border-gray-100"
                  }`}
                />
                <button
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm ${
                    darkMode
                      ? "text-red-400 hover:bg-red-900/20"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
