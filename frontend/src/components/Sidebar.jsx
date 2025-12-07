import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MapPin,
  Route,
  Package,
  History,
  Globe,
  Building2,
  Users,
  Server,
  X,
  ChevronRight,
  Book,
  Star,
  BarChart3,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// Grouped menu items for better organization
const menuGroups = [
  {
    title: "Principal",
    items: [
      {
        path: "/",
        name: "Dashboard",
        icon: LayoutDashboard,
        color: "from-blue-500 to-blue-600",
      },
    ],
  },
  {
    title: "Itinéraires",
    items: [
      {
        path: "/calculator",
        name: "Calculer Itinéraire",
        icon: MapPin,
        color: "from-emerald-500 to-emerald-600",
      },
      {
        path: "/optimizer",
        name: "Optimiser Tournée",
        icon: Route,
        color: "from-purple-500 to-purple-600",
      },
      {
        path: "/demande",
        name: "Demande Transport",
        icon: Package,
        color: "from-orange-500 to-orange-600",
      },
    ],
  },
  {
    title: "Mes Données",
    items: [
      {
        path: "/history",
        name: "Historique",
        icon: History,
        color: "from-cyan-500 to-cyan-600",
      },
      {
        path: "/favorites",
        name: "Mes Favoris",
        icon: Star,
        color: "from-yellow-500 to-orange-500",
      },
      {
        path: "/statistics",
        name: "Statistiques",
        icon: BarChart3,
        color: "from-violet-500 to-purple-600",
      },
    ],
  },
  {
    title: "Utilisateur",
    items: [
      {
        path: "/users",
        name: "Info Utilisateurs",
        icon: Users,
        color: "from-indigo-500 to-indigo-600",
      },
      {
        path: "/profile",
        name: "Mon Profil",
        icon: Users,
        color: "from-purple-500 to-pink-600",
      },
      {
        path: "/location",
        name: "Localisation",
        icon: Globe,
        color: "from-pink-500 to-pink-600",
      },
    ],
  },
  {
    title: "Données",
    items: [
      {
        path: "/cities",
        name: "Villes Maroc",
        icon: Building2,
        color: "from-amber-500 to-amber-600",
      },
    ],
  },
  {
    title: "Système",
    items: [
      {
        path: "/server",
        name: "Infos Serveur",
        icon: Server,
        color: "from-slate-500 to-slate-600",
      },
      {
        path: "/api-docs",
        name: "Documentation API",
        icon: Book,
        color: "from-violet-500 to-purple-600",
      },
    ],
  },
];

export default function Sidebar({ isOpen, onClose, isCollapsed }) {
  const location = useLocation();
  const { darkMode } = useTheme();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden animate-fadeIn"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] ${
          isCollapsed ? "lg:w-20" : "lg:w-72"
        } w-72 ${
          darkMode ? "bg-slate-800/90" : "bg-white/90"
        } backdrop-blur-xl border-r ${
          darkMode ? "border-slate-700" : "border-gray-200/50"
        } shadow-xl z-40 transition-all duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 lg:hidden p-2 rounded-lg ${
            darkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
          } transition-all duration-200 hover:rotate-90 z-10`}
        >
          <X
            className={`w-5 h-5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </button>

        {/* Navigation - Scrollable */}
        <nav
          className={`${
            isCollapsed ? "lg:px-2 px-4" : "px-4"
          } py-5 space-y-4 stagger-animate flex-1 overflow-y-auto overflow-x-hidden`}
        >
          {menuGroups.map((group, groupIndex) => (
            <div key={group.title} className="space-y-1.5">
              {/* Group Title */}
              {!isCollapsed && (
                <h3
                  className={`px-4 py-1 text-xs font-semibold uppercase tracking-wider ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {group.title}
                </h3>
              )}
              {isCollapsed && groupIndex > 0 && (
                <div
                  className={`hidden lg:block mx-2 border-t ${
                    darkMode ? "border-slate-700" : "border-gray-200"
                  }`}
                />
              )}

              {/* Group Items */}
              {group.items.map((item, index) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={isCollapsed ? item.name : ""}
                    style={{
                      animationDelay: `${(groupIndex * 3 + index) * 30}ms`,
                    }}
                    className={`group flex items-center ${
                      isCollapsed ? "lg:justify-center justify-start" : "gap-4"
                    } ${
                      isCollapsed ? "lg:px-2 px-4" : "px-4"
                    } py-3 rounded-xl transition-all duration-200 animate-slideIn hover:scale-[1.02] ${
                      isActive
                        ? `bg-gradient-to-r ${
                            item.color
                          } text-white shadow-lg shadow-${
                            item.color.split("-")[1]
                          }-500/30`
                        : `${
                            darkMode
                              ? "hover:bg-slate-700 text-gray-300 hover:text-white"
                              : "hover:bg-gray-100 text-gray-600 hover:text-gray-900"
                          }`
                    }`}
                  >
                    <div
                      className={`p-2 rounded-xl transition-transform duration-200 group-hover:scale-110 ${
                        isActive
                          ? "bg-white/20"
                          : `bg-gradient-to-br ${item.color}`
                      }`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <span
                      className={`font-medium flex-1 text-sm whitespace-nowrap transition-all duration-300 ${
                        isCollapsed
                          ? "lg:hidden lg:opacity-0 lg:w-0"
                          : "opacity-100"
                      }`}
                    >
                      {item.name}
                    </span>
                    {isActive && !isCollapsed && (
                      <ChevronRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer - Fixed at bottom */}
        <div
          className={`flex-shrink-0 p-4 border-t transition-all duration-300 ${
            isCollapsed ? "lg:hidden" : ""
          } ${
            darkMode
              ? "border-slate-700 bg-slate-800"
              : "border-gray-200 bg-white"
          }`}
        >
          <div className="text-center">
            <p
              className={`text-xs ${
                darkMode ? "text-gray-500" : "text-gray-400"
              }`}
            >
              Microservice 4
            </p>
            <p
              className={`text-sm font-medium ${
                darkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Itinéraires & Optimisation
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
