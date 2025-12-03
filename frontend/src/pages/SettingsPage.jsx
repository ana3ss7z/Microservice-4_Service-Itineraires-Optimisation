import { useState } from "react";
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Shield,
  Map,
  Ruler,
  Save,
  Check,
  Palette,
  Eye,
  Database,
  Trash2,
  Download,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const {
    darkMode,
    mapStyle,
    distanceUnit,
    notifications,
    toggleDarkMode,
    setMapStyle,
    setDistanceUnit,
    updateNotification,
  } = useTheme();

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Paramètres enregistrés!");
    setTimeout(() => setSaved(false), 2000);
  };

  const handleClearCache = () => {
    if (window.confirm("Voulez-vous vraiment effacer le cache?")) {
      localStorage.removeItem("transport-maroc-cache");
      toast.success("Cache effacé!");
    }
  };

  const handleExportData = () => {
    const data = {
      settings: {
        darkMode,
        mapStyle,
        distanceUnit,
        notifications,
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transport-maroc-settings.json";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Paramètres exportés!");
  };

  const mapStyles = [
    {
      id: "streets",
      name: "Rues",
      description: "Carte standard avec rues et bâtiments",
      icon: "🗺️",
    },
    {
      id: "satellite",
      name: "Satellite",
      description: "Vue satellite avec imagerie aérienne",
      icon: "🛰️",
    },
    {
      id: "terrain",
      name: "Terrain",
      description: "Relief topographique avec élévations",
      icon: "⛰️",
    },
    {
      id: "dark",
      name: "Sombre",
      description: "Thème sombre pour la carte",
      icon: "🌙",
    },
  ];

  const distanceUnits = [
    { id: "km", name: "Kilomètres", symbol: "km" },
    { id: "miles", name: "Miles", symbol: "mi" },
  ];

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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            Paramètres
          </h1>
          <p className={`mt-1 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            Personnalisez votre expérience
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
        >
          {saved ? (
            <>
              <Check className="w-5 h-5" />
              Enregistré!
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Enregistrer
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Appearance Section */}
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-100"
          }`}
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-500 to-purple-600">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Apparence
            </h3>
          </div>
          <div className="p-6 space-y-6">
            {/* Dark Mode Toggle */}
            <div
              className={`flex items-center justify-between p-4 rounded-xl ${
                darkMode ? "bg-slate-700" : "bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    darkMode ? "bg-indigo-900/50" : "bg-amber-100"
                  }`}
                >
                  {darkMode ? (
                    <Moon className="w-6 h-6 text-indigo-400" />
                  ) : (
                    <Sun className="w-6 h-6 text-amber-600" />
                  )}
                </div>
                <div>
                  <h4
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Mode sombre
                  </h4>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {darkMode ? "Activé" : "Désactivé"}
                  </p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={`relative w-14 h-8 rounded-full transition-colors ${
                  darkMode ? "bg-indigo-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                    darkMode ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Theme Preview */}
            <div
              className={`p-4 rounded-xl ${
                darkMode ? "border border-slate-600" : "border border-gray-200"
              }`}
            >
              <p
                className={`text-sm mb-3 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Aperçu du thème
              </p>
              <div
                className={`p-4 rounded-lg transition-colors ${
                  darkMode
                    ? "bg-slate-900 text-white border border-slate-700"
                    : "bg-white text-gray-800 border border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600" />
                  <div>
                    <p className="font-semibold text-sm">Exemple de carte</p>
                    <p
                      className={`text-xs ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Description
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Style Section */}
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-100"
          }`}
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-500 to-emerald-600">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Map className="w-5 h-5" />
              Style de carte
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3">
              {mapStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setMapStyle(style.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    mapStyle === style.id
                      ? darkMode
                        ? "border-emerald-500 bg-emerald-900/30"
                        : "border-emerald-500 bg-emerald-50"
                      : darkMode
                      ? "border-slate-600 hover:border-slate-500 bg-slate-700/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{style.icon}</span>
                    <div className="flex-1">
                      <p
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {style.name}
                      </p>
                    </div>
                    {mapStyle === style.id && (
                      <Check className="w-5 h-5 text-emerald-500" />
                    )}
                  </div>
                  <p
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {style.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Distance Units Section */}
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-100"
          }`}
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-500 to-blue-600">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Ruler className="w-5 h-5" />
              Unités de mesure
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {distanceUnits.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => setDistanceUnit(unit.id)}
                  className={`w-full p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
                    distanceUnit === unit.id
                      ? darkMode
                        ? "border-blue-500 bg-blue-900/30"
                        : "border-blue-500 bg-blue-50"
                      : darkMode
                      ? "border-slate-600 hover:border-slate-500 bg-slate-700/50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        distanceUnit === unit.id
                          ? darkMode
                            ? "bg-blue-900/50 text-blue-400"
                            : "bg-blue-100 text-blue-600"
                          : darkMode
                          ? "bg-slate-600 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {unit.symbol}
                    </div>
                    <div className="text-left">
                      <p
                        className={`font-semibold ${
                          darkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {unit.name}
                      </p>
                      <p
                        className={`text-sm ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {unit.id === "km"
                          ? "100 km = 62.14 mi"
                          : "100 mi = 160.93 km"}
                      </p>
                    </div>
                  </div>
                  {distanceUnit === unit.id && (
                    <Check className="w-5 h-5 text-blue-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div
          className={`rounded-2xl shadow-xl overflow-hidden ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-100"
          }`}
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-500 to-amber-600">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {[
              { key: "email", label: "Notifications par email", icon: "📧" },
              { key: "push", label: "Notifications push", icon: "🔔" },
              { key: "routeAlerts", label: "Alertes de trajet", icon: "🚨" },
              { key: "updates", label: "Mises à jour système", icon: "🔄" },
            ].map((item) => (
              <div
                key={item.key}
                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                  darkMode ? "hover:bg-slate-700" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{item.icon}</span>
                  <span
                    className={darkMode ? "text-gray-200" : "text-gray-700"}
                  >
                    {item.label}
                  </span>
                </div>
                <button
                  onClick={() =>
                    updateNotification(item.key, !notifications[item.key])
                  }
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications[item.key]
                      ? "bg-amber-500"
                      : darkMode
                      ? "bg-slate-600"
                      : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      notifications[item.key]
                        ? "translate-x-5"
                        : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Data Management Section */}
        <div
          className={`rounded-2xl shadow-xl overflow-hidden lg:col-span-2 ${
            darkMode
              ? "bg-slate-800 border border-slate-700"
              : "bg-white border border-gray-100"
          }`}
        >
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-rose-500 to-rose-600">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <Database className="w-5 h-5" />
              Gestion des données
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleExportData}
                className={`p-4 rounded-xl transition-colors flex items-center gap-3 ${
                  darkMode
                    ? "border border-slate-600 hover:bg-slate-700"
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    darkMode ? "bg-blue-900/50" : "bg-blue-100"
                  }`}
                >
                  <Download
                    className={`w-5 h-5 ${
                      darkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                </div>
                <div className="text-left">
                  <p
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Exporter les données
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Télécharger vos paramètres
                  </p>
                </div>
              </button>

              <button
                onClick={handleClearCache}
                className={`p-4 rounded-xl transition-colors flex items-center gap-3 ${
                  darkMode
                    ? "border border-slate-600 hover:bg-slate-700"
                    : "border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    darkMode ? "bg-amber-900/50" : "bg-amber-100"
                  }`}
                >
                  <Trash2
                    className={`w-5 h-5 ${
                      darkMode ? "text-amber-400" : "text-amber-600"
                    }`}
                  />
                </div>
                <div className="text-left">
                  <p
                    className={`font-semibold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    Effacer le cache
                  </p>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Libérer de l&apos;espace
                  </p>
                </div>
              </button>

              <div
                className={`p-4 rounded-xl ${
                  darkMode
                    ? "border border-slate-600 bg-slate-700/50"
                    : "border border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      darkMode ? "bg-slate-600" : "bg-gray-200"
                    }`}
                  >
                    <Shield
                      className={`w-5 h-5 ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`font-semibold ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      Confidentialité
                    </p>
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Données stockées localement
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div
        className={`rounded-2xl p-6 ${
          darkMode
            ? "bg-slate-800 border border-slate-700"
            : "bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center flex-shrink-0">
            <Eye className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4
              className={`font-bold mb-1 ${
                darkMode ? "text-white" : "text-primary-900"
              }`}
            >
              Vos préférences sont sauvegardées automatiquement
            </h4>
            <p
              className={`text-sm ${
                darkMode ? "text-gray-400" : "text-primary-700"
              }`}
            >
              Toutes vos modifications sont enregistrées localement dans votre
              navigateur. Elles seront conservées même après la fermeture de
              l&apos;application.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
