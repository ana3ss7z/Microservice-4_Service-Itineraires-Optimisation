import { useState } from "react";
import {
  Settings,
  Bell,
  Globe,
  Moon,
  Sun,
  Shield,
  Database,
  Palette,
  Volume2,
  Monitor,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    soundEffects: true,
    autoRefresh: true,
    language: "fr",
    mapStyle: "streets",
    units: "metric",
    refreshInterval: 30,
  });

  const updateSetting = (key, value) => {
    setSettings({ ...settings, [key]: value });
    toast.success("Paramètre mis à jour!");
  };

  const Toggle = ({ enabled, onChange }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative w-12 h-6 rounded-full transition-colors ${
        enabled ? "bg-emerald-500" : "bg-gray-300"
      }`}
    >
      <div
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          enabled ? "translate-x-6" : "translate-x-0.5"
        }`}
      />
    </button>
  );

  const settingSections = [
    {
      title: "Apparence",
      icon: Palette,
      color: "from-purple-500 to-purple-600",
      settings: [
        {
          key: "darkMode",
          label: "Mode sombre",
          description: "Activer le thème sombre pour l'interface",
          icon: settings.darkMode ? Moon : Sun,
          type: "toggle",
        },
        {
          key: "mapStyle",
          label: "Style de carte",
          description: "Choisir l'apparence de la carte",
          icon: Monitor,
          type: "select",
          options: [
            { value: "streets", label: "Rues" },
            { value: "satellite", label: "Satellite" },
            { value: "terrain", label: "Terrain" },
          ],
        },
      ],
    },
    {
      title: "Notifications",
      icon: Bell,
      color: "from-orange-500 to-orange-600",
      settings: [
        {
          key: "notifications",
          label: "Notifications push",
          description: "Recevoir des alertes pour les calculs terminés",
          icon: Bell,
          type: "toggle",
        },
        {
          key: "soundEffects",
          label: "Sons",
          description: "Activer les effets sonores",
          icon: Volume2,
          type: "toggle",
        },
      ],
    },
    {
      title: "Données & Synchronisation",
      icon: Database,
      color: "from-blue-500 to-blue-600",
      settings: [
        {
          key: "autoRefresh",
          label: "Actualisation automatique",
          description: "Rafraîchir automatiquement les données",
          icon: Database,
          type: "toggle",
        },
        {
          key: "refreshInterval",
          label: "Intervalle de rafraîchissement",
          description: "Fréquence de mise à jour (secondes)",
          icon: Database,
          type: "select",
          options: [
            { value: 15, label: "15 secondes" },
            { value: 30, label: "30 secondes" },
            { value: 60, label: "1 minute" },
            { value: 300, label: "5 minutes" },
          ],
        },
      ],
    },
    {
      title: "Langue & Région",
      icon: Globe,
      color: "from-emerald-500 to-emerald-600",
      settings: [
        {
          key: "language",
          label: "Langue",
          description: "Choisir la langue de l'interface",
          icon: Globe,
          type: "select",
          options: [
            { value: "fr", label: "🇫🇷 Français" },
            { value: "ar", label: "🇲🇦 العربية" },
            { value: "en", label: "🇬🇧 English" },
          ],
        },
        {
          key: "units",
          label: "Unités",
          description: "Système d'unités pour les distances",
          icon: Monitor,
          type: "select",
          options: [
            { value: "metric", label: "Métrique (km)" },
            { value: "imperial", label: "Impérial (miles)" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-500 to-slate-600 flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            Paramètres
          </h1>
          <p className="text-gray-500 mt-1">
            Personnalisez votre expérience utilisateur
          </p>
        </div>

        <button
          onClick={() => {
            setSettings({
              darkMode: false,
              notifications: true,
              soundEffects: true,
              autoRefresh: true,
              language: "fr",
              mapStyle: "streets",
              units: "metric",
              refreshInterval: 30,
            });
            toast.success("Paramètres réinitialisés!");
          }}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          🔄 Réinitialiser
        </button>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settingSections.map((section) => (
          <div
            key={section.title}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
          >
            <div className={`bg-gradient-to-r ${section.color} px-6 py-4`}>
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <section.icon className="w-5 h-5" />
                {section.title}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {section.settings.map((setting) => (
                <div
                  key={setting.key}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white shadow flex items-center justify-center">
                      <setting.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {setting.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {setting.description}
                      </p>
                    </div>
                  </div>

                  {setting.type === "toggle" ? (
                    <Toggle
                      enabled={settings[setting.key]}
                      onChange={(value) => updateSetting(setting.key, value)}
                    />
                  ) : (
                    <select
                      value={settings[setting.key]}
                      onChange={(e) =>
                        updateSetting(setting.key, e.target.value)
                      }
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                    >
                      {setting.options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Security Section */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Sécurité & Confidentialité
          </h2>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
              <p className="font-medium text-gray-800">
                Changer le mot de passe
              </p>
              <p className="text-sm text-gray-500">
                Dernière modification: il y a 30 jours
              </p>
            </button>
            <button className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
              <p className="font-medium text-gray-800">Sessions actives</p>
              <p className="text-sm text-gray-500">2 appareils connectés</p>
            </button>
            <button className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
              <p className="font-medium text-gray-800">Exporter mes données</p>
              <p className="text-sm text-gray-500">
                Télécharger un export complet
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-lg">
              Transport Maroc - Microservice 4
            </h3>
            <p className="text-gray-400 text-sm">
              Version 1.0.0 • Itinéraires & Optimisation
            </p>
          </div>
          <div className="text-right">
            <p className="text-emerald-400 font-medium flex items-center gap-2">
              <Check className="w-4 h-4" /> Système à jour
            </p>
            <p className="text-gray-400 text-sm">
              Dernière vérification: aujourd&apos;hui
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
