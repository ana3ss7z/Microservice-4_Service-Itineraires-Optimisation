import { useState } from "react";
import {
  Book,
  ExternalLink,
  Code,
  Route,
  Globe,
  Package,
  History,
  Building2,
  Server,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  Play,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8082";

const endpoints = [
  {
    category: "Routes",
    icon: Route,
    color: "from-emerald-500 to-teal-500",
    items: [
      {
        method: "POST",
        path: "/routes/coordinates",
        description: "Calcul d'itinéraire depuis coordonnées GPS",
        body: {
          origin: { latitude: 33.5731, longitude: -7.5898 },
          destination: { latitude: 34.0209, longitude: -6.8416 },
          includeReturn: true,
          userId: "user123",
        },
      },
      {
        method: "POST",
        path: "/routes/address",
        description: "Calcul depuis adresses textuelles",
        body: {
          originAddress: "Casablanca, Morocco",
          destinationAddress: "Rabat, Morocco",
          includeReturn: true,
          userId: "user123",
        },
      },
      {
        method: "POST",
        path: "/routes/optimize",
        description: "Optimisation de tournée multi-points (TSP)",
        body: {
          origin: { latitude: 33.5731, longitude: -7.5898, name: "Casablanca" },
          destination: {
            latitude: 33.5731,
            longitude: -7.5898,
            name: "Casablanca",
          },
          waypoints: [
            { latitude: 34.0209, longitude: -6.8416, name: "Rabat" },
            { latitude: 31.6295, longitude: -7.9811, name: "Marrakech" },
          ],
          includeReturn: true,
          userId: "user123",
        },
      },
      {
        method: "GET",
        path: "/routes/{id}",
        description: "Détail d'un trajet par ID",
        params: [{ name: "id", type: "UUID", required: true }],
      },
      {
        method: "GET",
        path: "/routes/health",
        description: "Vérification que le service est opérationnel",
      },
    ],
  },
  {
    category: "Demande & Volume",
    icon: Package,
    color: "from-orange-500 to-amber-500",
    items: [
      {
        method: "POST",
        path: "/routes/demande-info",
        description:
          "Calcul d'itinéraire avec infos de demande (volume, marchandise)",
        body: {
          userId: "user123",
          username: "ahmed_benali",
          email: "ahmed.benali@email.com",
          fullName: "Ahmed Ben Ali",
          phone: "+212 6 12 34 56 78",
          volume: 15.5,
          natureMarchandise: "Meubles de salon",
          dateDepart: "2025-12-15T10:00:00",
          adresseDepart: "Casablanca, Morocco",
          adresseDestination: "Rabat, Morocco",
        },
      },
      {
        method: "GET",
        path: "/routes/user-info",
        description: "Informations complètes utilisateur avec volume",
        params: [
          { name: "userId", type: "string", required: true },
          { name: "page", type: "int", required: false, default: 0 },
          { name: "size", type: "int", required: false, default: 10 },
        ],
      },
    ],
  },
  {
    category: "Historique",
    icon: History,
    color: "from-cyan-500 to-blue-500",
    items: [
      {
        method: "GET",
        path: "/routes/history",
        description: "Historique des trajets d'un utilisateur",
        params: [
          { name: "userId", type: "string", required: true },
          { name: "page", type: "int", required: false, default: 0 },
          { name: "size", type: "int", required: false, default: 10 },
        ],
      },
    ],
  },
  {
    category: "Villes",
    icon: Building2,
    color: "from-purple-500 to-indigo-500",
    items: [
      {
        method: "GET",
        path: "/routes/ville",
        description: "Liste de toutes les villes marocaines",
      },
    ],
  },
  {
    category: "Localisation",
    icon: Globe,
    color: "from-pink-500 to-rose-500",
    items: [
      {
        method: "GET",
        path: "/location/current",
        description: "Localisation actuelle (auto-détection IP client)",
      },
      {
        method: "GET",
        path: "/location/ip/{ipAddress}",
        description: "Localisation pour une IP spécifique",
        params: [{ name: "ipAddress", type: "string", required: true }],
      },
      {
        method: "GET",
        path: "/location/lookup",
        description: "Recherche localisation par query param",
        params: [{ name: "ip", type: "string", required: true }],
      },
      {
        method: "POST",
        path: "/location/refresh",
        description: "Forcer mise à jour de la localisation",
      },
      {
        method: "GET",
        path: "/location/server-info",
        description: "Informations du serveur (hostname, IP, OS, Java)",
      },
    ],
  },
];

const methodColors = {
  GET: "bg-emerald-100 text-emerald-700",
  POST: "bg-blue-100 text-blue-700",
  PUT: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
};

export default function ApiDocsPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success("Copié!");
    setTimeout(() => setCopiedText(null), 2000);
  };

  const openSwagger = () => {
    window.open(`${API_BASE_URL}/api/swagger-ui.html`, "_blank");
  };

  const openOpenAPI = () => {
    window.open(`${API_BASE_URL}/api/v3/api-docs`, "_blank");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
              <Book className="w-6 h-6 text-white" />
            </div>
            Documentation API
          </h1>
          <p className="text-gray-500 mt-1">
            Référence complète des endpoints de l&apos;API Itinéraires &
            Optimisation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openSwagger}
            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-md"
          >
            <Zap className="w-4 h-4" />
            Swagger UI
            <ExternalLink className="w-4 h-4" />
          </button>
          <button
            onClick={openOpenAPI}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 shadow-md"
          >
            <Code className="w-4 h-4" />
            OpenAPI JSON
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Base URL */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-6 text-white">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Server className="w-5 h-5" />
          Base URL
        </h3>
        <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
          <code className="flex-1 font-mono text-lg">{API_BASE_URL}/api</code>
          <button
            onClick={() => copyToClipboard(`${API_BASE_URL}/api`, "baseUrl")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {copiedText === "baseUrl" ? (
              <Check className="w-5 h-5" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Endpoints by Category */}
      <div className="space-y-6">
        {endpoints.map((category) => (
          <div
            key={category.category}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            {/* Category Header */}
            <div className={`px-6 py-4 bg-gradient-to-r ${category.color}`}>
              <h2 className="text-white font-bold text-lg flex items-center gap-2">
                <category.icon className="w-5 h-5" />
                {category.category}
              </h2>
            </div>

            {/* Endpoints List */}
            <div className="divide-y divide-gray-100">
              {category.items.map((endpoint, idx) => {
                const key = `${category.category}-${idx}`;
                const isExpanded = expandedEndpoint === key;

                return (
                  <div key={key} className="hover:bg-gray-50 transition-colors">
                    {/* Endpoint Row */}
                    <button
                      onClick={() =>
                        setExpandedEndpoint(isExpanded ? null : key)
                      }
                      className="w-full px-6 py-4 flex items-center gap-4 text-left"
                    >
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-bold ${
                          methodColors[endpoint.method]
                        }`}
                      >
                        {endpoint.method}
                      </span>
                      <code className="flex-1 font-mono text-gray-700">
                        {endpoint.path}
                      </code>
                      <span className="text-gray-500 text-sm hidden md:block">
                        {endpoint.description}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-6 pb-6 space-y-4 bg-gray-50 border-t border-gray-100">
                        <p className="text-gray-600 pt-4">
                          {endpoint.description}
                        </p>

                        {/* Parameters */}
                        {endpoint.params && (
                          <div>
                            <h4 className="font-semibold text-gray-700 mb-2">
                              Paramètres
                            </h4>
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="text-left text-gray-500">
                                    <th className="pb-2">Nom</th>
                                    <th className="pb-2">Type</th>
                                    <th className="pb-2">Requis</th>
                                    <th className="pb-2">Défaut</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {endpoint.params.map((param) => (
                                    <tr key={param.name}>
                                      <td className="py-2 font-mono text-orange-600">
                                        {param.name}
                                      </td>
                                      <td className="py-2 text-gray-600">
                                        {param.type}
                                      </td>
                                      <td className="py-2">
                                        {param.required ? (
                                          <span className="text-red-500">
                                            Oui
                                          </span>
                                        ) : (
                                          <span className="text-gray-400">
                                            Non
                                          </span>
                                        )}
                                      </td>
                                      <td className="py-2 text-gray-500">
                                        {param.default ?? "-"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Request Body */}
                        {endpoint.body && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-gray-700">
                                Corps de la requête
                              </h4>
                              <button
                                onClick={() =>
                                  copyToClipboard(
                                    JSON.stringify(endpoint.body, null, 2),
                                    key
                                  )
                                }
                                className="text-sm text-gray-500 hover:text-orange-500 flex items-center gap-1"
                              >
                                {copiedText === key ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                                Copier
                              </button>
                            </div>
                            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm">
                              <code>
                                {JSON.stringify(endpoint.body, null, 2)}
                              </code>
                            </pre>
                          </div>
                        )}

                        {/* Full URL */}
                        <div>
                          <h4 className="font-semibold text-gray-700 mb-2">
                            URL complète
                          </h4>
                          <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-200">
                            <code className="flex-1 font-mono text-sm text-gray-700 break-all">
                              {API_BASE_URL}/api{endpoint.path}
                            </code>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  `${API_BASE_URL}/api${endpoint.path}`,
                                  `url-${key}`
                                )
                              }
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                            >
                              {copiedText === `url-${key}` ? (
                                <Check className="w-4 h-4 text-emerald-500" />
                              ) : (
                                <Copy className="w-4 h-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rate Limits */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
            ⚠️ Limitations
          </h3>
          <ul className="space-y-2 text-amber-700 text-sm">
            <li>• Max 15 waypoints par optimisation</li>
            <li>• Nominatim: 1 requête/seconde (reverse geocoding)</li>
            <li>• Distance calculée à vol d&apos;oiseau (Haversine)</li>
            <li>• Vitesse moyenne estimée: 60 km/h</li>
          </ul>
        </div>

        {/* Response Format */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h3 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
            📝 Format de réponse
          </h3>
          <p className="text-blue-700 text-sm mb-3">
            Toutes les réponses sont en JSON avec les champs suivants:
          </p>
          <ul className="space-y-1 text-blue-600 text-sm font-mono">
            <li>• status: &quot;SUCCESS&quot; | &quot;ERROR&quot;</li>
            <li>• message: Description</li>
            <li>• data: Données de réponse</li>
          </ul>
        </div>
      </div>

      {/* Postman Collection */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg mb-1">
              📮 Collection Postman disponible
            </h3>
            <p className="text-orange-100">
              Téléchargez la collection Postman pour tester rapidement tous les
              endpoints
            </p>
          </div>
          <a
            href="/Postman_Collection_Server.json"
            download
            className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            Télécharger
          </a>
        </div>
      </div>
    </div>
  );
}
