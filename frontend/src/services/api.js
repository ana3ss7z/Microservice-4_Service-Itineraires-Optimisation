import axios from "axios";

// Configuration des serveurs avec ordre de priorité
const SERVERS = [
  { url: "/api", name: "Vite Proxy (Primary)", priority: 1 }, // This goes through vite proxy
  { url: "http://localhost:8082/api", name: "Localhost", priority: 2 },
  { url: "http://172.30.80.11:31030/api", name: "Remote Server", priority: 3 },
];

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Track server response times to optimize selection
const serverResponseTimes = new Map();
let currentPrimaryServer = API_BASE_URL; // Default to primary config

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Increased timeout to 60 seconds for complex operations like optimization
});

// Request interceptor to track start time
api.interceptors.request.use((config) => {
  config.metadata = { startTime: new Date() };
  console.log(`🔄 Request starting: ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});

// Response interceptor to track response times
api.interceptors.response.use(
  (response) => {
    const responseTime = new Date() - response.config.metadata.startTime;
    console.log(`✅ Request completed: ${response.config.url} - ${responseTime}ms - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    const requestTime = new Date() - error.config.metadata.startTime;
    console.error(`❌ Request failed: ${error.config.url} - ${requestTime}ms - Error: ${error.message}`);

    // Try to switch to working server if we have multiple options
    if (SERVERS.length > 1) {
      console.log("Attempting fallback to other servers...");
      // Try other servers in sequence
      for (const server of SERVERS) {
        if (server.url !== currentPrimaryServer) {
          try {
            console.log(`Trying fallback server: ${server.name} (${server.url})`);

            // Create temporary axios instance for this request only
            const tempApi = axios.create({
              baseURL: server.url,
              headers: {
                "Content-Type": "application/json",
              },
              timeout: 15000, // Appropriate timeout for fallback requests
            });

            // Retry the same request with new base URL
            const fallbackConfig = {
              ...error.config,
              baseURL: server.url,
            };

            const response = await tempApi(fallbackConfig);
            currentPrimaryServer = server.url;
            console.log(`✅ Fallback succeeded, switching to: ${server.name}`);
            return response;
          } catch (fallbackError) {
            console.log(`❌ Fallback failed for server: ${server.name}`);
            continue; // Try next server
          }
        }
      }
    }

    const message = error.response?.data?.message ||
                   error.message ||
                   "Une erreur de connexion est survenue";
    console.error("API Error:", message);
    return Promise.reject(new Error(message));
  }
);

// ==================== ROUTES API ====================

/**
 * Calcul d'itinéraire depuis coordonnées GPS
 */
export const calculateRouteFromCoordinates = async (routeRequest) => {
  const response = await api.post("/routes/coordinates", routeRequest);
  return response.data;
};

/**
 * Calcul d'itinéraire depuis adresses
 */
export const calculateRouteFromAddress = async (routeRequest) => {
  const response = await api.post("/routes/address", routeRequest);
  return response.data;
};

/**
 * Optimisation de tournée multi-points
 */
export const optimizeRoute = async (routeRequest) => {
  const response = await api.post("/routes/optimize", routeRequest);
  return response.data;
};

/**
 * Calcul d'itinéraire avec informations de demande (volume, marchandise)
 */
export const calculateRouteWithDemande = async (demandeRequest) => {
  const response = await api.post("/routes/demande-info", demandeRequest);
  return response.data;
};

/**
 * Démarrer une route (bouton Start)
 */
export const startRoute = async (routeId) => {
  const response = await api.put(`/routes/${routeId}/start`);
  return response.data;
};

/**
 * Arrêter une route
 */
export const stopRoute = async (routeId) => {
  const response = await api.put(`/routes/${routeId}/stop`);
  return response.data;
};

/**
 * Récupérer toutes les routes démarrées
 */
export const getStartedRoutes = async () => {
  const response = await api.get("/routes/started");
  return response.data;
};

/**
 * Récupérer les routes démarrées d'un chauffeur
 */
export const getStartedRoutesByChauffeur = async (chauffeurId) => {
  const response = await api.get(`/routes/chauffeur/${chauffeurId}/started`);
  return response.data;
};

/**
 * Récupérer les routes par userId et chauffeurId
 */
export const getRoutesByUserAndChauffeur = async (userId, chauffeurId) => {
  const response = await api.get("/routes/user-chauffeur", {
    params: { userId, chauffeurId },
  });
  return response.data;
};

/**
 * Calculer la distance totale des routes démarrées
 */
export const getTotalDistanceOfStartedRoutes = async () => {
  const response = await api.get("/routes/started/total-distance");
  return response.data;
};

/**
 * Récupérer l'historique des routes d'un utilisateur
 */
export const getRouteHistory = async (userId, page = 0, size = 20) => {
  const response = await api.get("/routes/history", {
    params: { userId, page, size },
  });
  return response.data;
};

/**
 * Récupérer les informations complètes d'un utilisateur
 */
export const getUserInfo = async (userId, page = 0, size = 20) => {
  const response = await api.get("/routes/user-info", {
    params: { userId, page, size },
  });
  return response.data;
};

/**
 * Récupérer un trajet par ID
 */
export const getRouteById = async (id) => {
  const response = await api.get(`/routes/${id}`);
  return response.data;
};

/**
 * Récupérer la liste de toutes les villes
 */
export const getAllCities = async () => {
  const response = await api.get("/routes/ville");
  return response.data;
};

/**
 * Vérifier l'état du service
 */
export const healthCheck = async () => {
  const response = await api.get("/routes/health");
  return response.data;
};

// ==================== LOCATION API ====================

/**
 * Récupérer la localisation actuelle (basée sur IP client)
 */
export const getCurrentLocation = async () => {
  const response = await api.get("/location/current");
  return response.data;
};

/**
 * Récupérer la localisation pour une IP spécifique
 */
export const getLocationByIp = async (ipAddress) => {
  const response = await api.get(`/location/ip/${ipAddress}`);
  return response.data;
};

/**
 * Recherche de localisation par query param
 */
export const lookupLocation = async (ip) => {
  const response = await api.get("/location/lookup", {
    params: { ip },
  });
  return response.data;
};

/**
 * Rafraîchir la localisation
 */
export const refreshLocation = async () => {
  const response = await api.post("/location/refresh");
  return response.data;
};

/**
 * Récupérer les informations du serveur
 */
export const getServerInfo = async () => {
  const response = await api.get("/location/server-info");
  return response.data;
};

// ==================== DEMANDES EXTERNES API ====================

/**
 * Récupérer une demande depuis le microservice externe Demandes
 * @param {number} demandeId - ID de la demande
 */
export const getDemandeExterne = async (demandeId) => {
  const response = await api.get(`/routes/demande-externe/${demandeId}`);
  return response.data;
};

/**
 * Récupérer le volume d'une demande depuis le microservice externe
 * @param {number} demandeId - ID de la demande
 */
export const getVolumeFromDemande = async (demandeId) => {
  const response = await api.get(`/routes/demande-externe/${demandeId}/volume`);
  return response.data;
};

/**
 * Calculer un itinéraire à partir d'une demande externe
 * @param {number} demandeId - ID de la demande dans le microservice externe
 * @param {string} userId - ID de l'utilisateur (optionnel)
 * @param {string} chauffeurId - ID du chauffeur (optionnel)
 */
export const calculateRouteFromDemande = async (
  demandeId,
  userId = null,
  chauffeurId = null
) => {
  const params = {};
  if (userId) params.userId = userId;
  if (chauffeurId) params.chauffeurId = chauffeurId;

  const response = await api.post(
    `/routes/calculate-from-demande/${demandeId}`,
    null,
    { params }
  );
  return response.data;
};

/**
 * Vérifier la disponibilité du service Demandes
 */
export const checkDemandeServiceHealth = async () => {
  const response = await api.get("/routes/demande-service/health");
  return response.data;
};

// Function to check server health quickly
export const checkServerHealth = async (serverUrl) => {
  try {
    const healthUrl = serverUrl.replace('/api', '/api/routes/health');
    const response = await axios.get(healthUrl, {
      timeout: 5000, // Reasonable timeout for health check
      headers: { "Content-Type": "application/json" }
    });
    return response.data && response.status === 200;
  } catch (error) {
    console.log(`Health check failed for: ${serverUrl}`, error.message);
    return false;
  }
};

// Function to find the best available server
export const findBestServer = async () => {
  for (const server of SERVERS) {
    if (await checkServerHealth(server.url)) {
      console.log(`✅ Server available: ${server.name} (${server.url})`);
      return server.url;
    }
    console.log(`❌ Server unavailable: ${server.name}`);
  }
  // If no server is available, return primary
  return API_BASE_URL;
};

export default api;
