import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  MapPin,
  Route,
  Package,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "../context/ThemeContext";

export default function NotificationsPage() {
  const { darkMode } = useTheme();
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "success",
      title: "Itinéraire calculé avec succès",
      message: "Le trajet Casablanca → Rabat a été optimisé (87 km, 1h15)",
      time: "Il y a 5 minutes",
      read: false,
      icon: Route,
    },
    {
      id: 2,
      type: "info",
      title: "Nouvelle demande de transport",
      message: "Ahmed Ben Ali a soumis une demande pour 15.5 m³ de marchandise",
      time: "Il y a 15 minutes",
      read: false,
      icon: Package,
    },
    {
      id: 3,
      type: "warning",
      title: "Trafic dense détecté",
      message:
        "Ralentissements sur l'autoroute A3 entre Casablanca et Mohammedia",
      time: "Il y a 30 minutes",
      read: true,
      icon: AlertCircle,
    },
    {
      id: 4,
      type: "success",
      title: "Tournée optimisée",
      message: "8 points de livraison réorganisés, économie de 45 km",
      time: "Il y a 1 heure",
      read: true,
      icon: CheckCircle,
    },
    {
      id: 5,
      type: "info",
      title: "Mise à jour des données",
      message: "Les informations de 12 villes ont été actualisées",
      time: "Il y a 2 heures",
      read: true,
      icon: Info,
    },
    {
      id: 6,
      type: "success",
      title: "Localisation mise à jour",
      message: "Position actuelle: Marrakech (31.6295° N, 7.9811° W)",
      time: "Il y a 3 heures",
      read: true,
      icon: MapPin,
    },
    {
      id: 7,
      type: "warning",
      title: "Connexion lente",
      message: "Le serveur répond plus lentement que d'habitude",
      time: "Hier à 18:30",
      read: true,
      icon: AlertCircle,
    },
    {
      id: 8,
      type: "info",
      title: "Bienvenue!",
      message: "Votre compte a été configuré avec succès",
      time: "Hier à 10:00",
      read: true,
      icon: Info,
    },
  ]);

  const typeColors = {
    success: {
      bg: "bg-emerald-100",
      text: "text-emerald-600",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
    },
    info: {
      bg: "bg-blue-100",
      text: "text-blue-600",
      border: "border-blue-200",
      dot: "bg-blue-500",
    },
    warning: {
      bg: "bg-amber-100",
      text: "text-amber-600",
      border: "border-amber-200",
      dot: "bg-amber-500",
    },
    error: {
      bg: "bg-red-100",
      text: "text-red-600",
      border: "border-red-200",
      dot: "bg-red-500",
    },
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    toast.success("Notification marquée comme lue");
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success("Toutes les notifications marquées comme lues");
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
    toast.success("Notification supprimée");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("Toutes les notifications supprimées");
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg relative">
              <Bell className="w-6 h-6 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
            Notifications
          </h1>
          <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {unreadCount > 0
              ? `${unreadCount} notification(s) non lue(s)`
              : "Toutes les notifications sont lues"}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className={`px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              darkMode
                ? "bg-blue-900/50 text-blue-300 hover:bg-blue-900"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <CheckCheck className="w-4 h-4" /> Tout marquer lu
          </button>
          <button
            onClick={clearAll}
            disabled={notifications.length === 0}
            className={`px-4 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
              darkMode
                ? "bg-red-900/50 text-red-300 hover:bg-red-900"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            <Trash2 className="w-4 h-4" /> Tout effacer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Toutes", icon: Bell },
          { key: "unread", label: "Non lues", icon: Clock },
          { key: "success", label: "Succès", icon: CheckCircle },
          { key: "info", label: "Info", icon: Info },
          { key: "warning", label: "Alertes", icon: AlertCircle },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-2 ${
              filter === f.key
                ? "bg-primary-600 text-white shadow-lg"
                : darkMode
                ? "bg-slate-800 text-gray-300 hover:bg-slate-700 border border-slate-600"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
            {f.key === "unread" && unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div
        className={`rounded-2xl shadow-xl overflow-hidden ${
          darkMode
            ? "bg-slate-800 border border-slate-700"
            : "bg-white border border-gray-100"
        }`}
      >
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div
              className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                darkMode ? "bg-slate-700" : "bg-gray-100"
              }`}
            >
              <Bell
                className={`w-8 h-8 ${
                  darkMode ? "text-gray-500" : "text-gray-400"
                }`}
              />
            </div>
            <h3
              className={`text-lg font-semibold ${
                darkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Aucune notification
            </h3>
            <p
              className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}
            >
              {filter === "all"
                ? "Vous n'avez aucune notification"
                : "Aucune notification dans cette catégorie"}
            </p>
          </div>
        ) : (
          <div
            className={`divide-y ${
              darkMode ? "divide-slate-700" : "divide-gray-100"
            }`}
          >
            {filteredNotifications.map((notification) => {
              const colors = typeColors[notification.type];
              const Icon = notification.icon;

              return (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors ${
                    !notification.read
                      ? darkMode
                        ? "bg-blue-900/20"
                        : "bg-blue-50/50"
                      : ""
                  } ${darkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"}`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center flex-shrink-0`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4
                            className={`font-semibold ${
                              !notification.read
                                ? darkMode
                                  ? "text-white"
                                  : "text-gray-900"
                                : darkMode
                                ? "text-gray-200"
                                : "text-gray-700"
                            }`}
                          >
                            {notification.title}
                            {!notification.read && (
                              <span
                                className={`ml-2 inline-block w-2 h-2 rounded-full ${colors.dot}`}
                              />
                            )}
                          </h4>
                          <p
                            className={`text-sm mt-0.5 ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <p
                            className={`text-xs mt-1 flex items-center gap-1 ${
                              darkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            {notification.time}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                darkMode
                                  ? "hover:bg-slate-600"
                                  : "hover:bg-gray-200"
                              }`}
                              title="Marquer comme lu"
                            >
                              <Check
                                className={`w-4 h-4 ${
                                  darkMode ? "text-gray-400" : "text-gray-500"
                                }`}
                              />
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className={`p-2 rounded-lg transition-colors group ${
                              darkMode
                                ? "hover:bg-red-900/50"
                                : "hover:bg-red-100"
                            }`}
                            title="Supprimer / Fermer"
                          >
                            <X
                              className={`w-5 h-5 ${
                                darkMode
                                  ? "text-gray-400 group-hover:text-red-400"
                                  : "text-gray-500 group-hover:text-red-500"
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total",
            value: notifications.length,
            color: "from-gray-500 to-gray-600",
            icon: Bell,
          },
          {
            label: "Non lues",
            value: unreadCount,
            color: "from-blue-500 to-blue-600",
            icon: Clock,
          },
          {
            label: "Succès",
            value: notifications.filter((n) => n.type === "success").length,
            color: "from-emerald-500 to-emerald-600",
            icon: CheckCircle,
          },
          {
            label: "Alertes",
            value: notifications.filter((n) => n.type === "warning").length,
            color: "from-amber-500 to-amber-600",
            icon: AlertCircle,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl p-4 shadow ${
              darkMode
                ? "bg-slate-800 border border-slate-700"
                : "bg-white border border-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}
              >
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p
                  className={`text-2xl font-bold ${
                    darkMode ? "text-white" : "text-gray-800"
                  }`}
                >
                  {stat.value}
                </p>
                <p
                  className={`text-sm ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
