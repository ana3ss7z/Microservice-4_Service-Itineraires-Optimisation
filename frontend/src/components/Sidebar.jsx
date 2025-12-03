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
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const menuItems = [
  {
    path: "/",
    name: "Dashboard",
    icon: LayoutDashboard,
    color: "from-blue-500 to-blue-600",
  },
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
  {
    path: "/history",
    name: "Historique",
    icon: History,
    color: "from-cyan-500 to-cyan-600",
  },
  {
    path: "/users",
    name: "Infos Utilisateurs",
    icon: Users,
    color: "from-indigo-500 to-indigo-600",
  },
  {
    path: "/location",
    name: "Localisation",
    icon: Globe,
    color: "from-pink-500 to-pink-600",
  },
  {
    path: "/cities",
    name: "Villes Maroc",
    icon: Building2,
    color: "from-amber-500 to-amber-600",
  },
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
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { darkMode } = useTheme();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 ${
          darkMode ? "bg-slate-800/90" : "bg-white/90"
        } backdrop-blur-xl border-r ${
          darkMode ? "border-slate-700" : "border-gray-200/50"
        } shadow-xl z-40 transition-transform duration-300 overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 lg:hidden p-2 rounded-lg ${
            darkMode ? "hover:bg-slate-700" : "hover:bg-gray-100"
          } transition-colors`}
        >
          <X
            className={`w-5 h-5 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </button>

        {/* Navigation */}
        <nav className="px-4 py-5 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
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
                  className={`p-2.5 rounded-xl ${
                    isActive ? "bg-white/20" : `bg-gradient-to-br ${item.color}`
                  }`}
                >
                  <Icon className={`w-5 h-5 text-white`} />
                </div>
                <span className="font-medium flex-1 text-sm">{item.name}</span>
                {isActive && <ChevronRight className="w-4 h-4" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          className={`absolute bottom-0 left-0 right-0 p-5 border-t ${
            darkMode
              ? "border-slate-700 bg-gradient-to-t from-slate-800 via-slate-800 to-transparent"
              : "border-gray-100 bg-gradient-to-t from-white via-white to-transparent"
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
