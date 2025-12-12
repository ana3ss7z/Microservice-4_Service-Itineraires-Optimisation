import axios from "axios";

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Track backend status to avoid excessive requests when down
let backendStatus = {
  isAvailable: true,
  lastCheck: null,
  consecutiveFailures: 0,
  failureThreshold: 3, // After 3 failures, assume backend is down
  retryAfter: 30000, // Wait 30 seconds before retrying
};

// In-memory simple cache for frequently used, read-only endpoints
const CACHE_TTL_MS = 60 * 1000; // 1 minute
const simpleCache = {
  cities: { data: null, ts: 0 },
  serverInfo: { data: null, ts: 0 },
};
const inFlightRequests = new Map();

// Throttle repeated error logs for same endpoint+message
const recentErrorTimestamps = new Map();
const ERROR_LOG_THROTTLE_MS = 5 * 1000; // 5 seconds

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Increased timeout to 60 seconds for complex operations like optimization
});

// Request interceptor to track start time
api.interceptors.request.use((config) => {
  // Check if the backend is known to be unavailable and it's been less than retryAfter time
  const now = new Date().getTime();
  if (!backendStatus.isAvailable && backendStatus.lastCheck) {
    const timeSinceLastCheck = now - backendStatus.lastCheck.getTime();
    if (
      timeSinceLastCheck < backendStatus.retryAfter &&
      !config.url.includes("/health")
    ) {
      // Reject the request early to prevent proxy errors
      return Promise.reject(new Error("Backend is temporarily unavailable"));
    } else if (timeSinceLastCheck >= backendStatus.retryAfter) {
      // Reset status after retryAfter time has passed
      backendStatus.isAvailable = true;
      backendStatus.consecutiveFailures = 0;
    }
  }

  config.metadata = { startTime: new Date() };
  // Only log for non-health check endpoints to reduce console spam
  const reqUrl = config.url || "";
  if (!reqUrl.includes("/health") && import.meta.env.DEV) {
    console.debug(
      `🔄 Request starting: ${config.method?.toUpperCase()} ${reqUrl}`
    );
  }
  return config;
});

// Response interceptor to track response times
api.interceptors.response.use(
  (response) => {
    // Reset failure counter on success
    backendStatus.consecutiveFailures = 0;
    backendStatus.isAvailable = true;
    backendStatus.lastCheck = new Date();

    const responseTime = new Date() - response.config.metadata.startTime;
    // Only log for non-health check endpoints to reduce console spam
    const respUrl = response.config.url || "";
    if (!respUrl.includes("/health") && import.meta.env.DEV) {
      console.debug(
        `✅ Request completed: ${respUrl} - ${responseTime}ms - Status: ${response.status}`
      );
    }
    return response;
  },
  async (error) => {
    const requestTime = new Date() - error.config.metadata.startTime;

    // Update backend status based on error
    const isNetworkError =
      error.code === "ECONNREFUSED" ||
      error.code === "ERR_NETWORK" ||
      error.message.includes("ECONNREFUSED") ||
      error.message.includes("Network Error");

    if (isNetworkError || error.response?.status >= 500) {
      // Increment failure counter
      backendStatus.consecutiveFailures++;
      backendStatus.lastCheck = new Date();

      // Mark backend as unavailable if threshold reached
      if (backendStatus.consecutiveFailures >= backendStatus.failureThreshold) {
        backendStatus.isAvailable = false;
      }
    }

    // Only log for non-health check endpoints to reduce console spam,
    // but still log 500 errors to help with debugging
    const isHealthCheck = (error.config?.url || "").includes("/health");

    // Throttle identical error logs within a small window
    const errKey = `${error.config?.url}::${error.message}`;
    const now = Date.now();
    const lastTs = recentErrorTimestamps.get(errKey) || 0;
    if (now - lastTs > ERROR_LOG_THROTTLE_MS) {
      if (!isHealthCheck || error.response?.status === 500) {
        console.error(
          `❌ Request failed: ${error.config?.url} - ${requestTime}ms - Error: ${error.message}`
        );
      }
      recentErrorTimestamps.set(errKey, now);
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      "Une erreur de connexion est survenue";
    if (!isHealthCheck) {
      // Don't double log for health checks
      console.error("API Error:", message);
    }
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
  const now = Date.now();
  if (simpleCache.cities.data && now - simpleCache.cities.ts < CACHE_TTL_MS) {
    return simpleCache.cities.data;
  }
  try {
    if (inFlightRequests.has("cities")) {
      return await inFlightRequests.get("cities");
    }
    const requestPromise = api.get("/routes/ville").then((r) => r.data || []);
    inFlightRequests.set("cities", requestPromise);
    const data = await requestPromise;
    simpleCache.cities = { data, ts: now };
    return data;
  } catch (err) {
    // Return cached data if available to avoid emptying the UI
    if (simpleCache.cities.data) return simpleCache.cities.data;
    return [];
  } finally {
    inFlightRequests.delete("cities");
  }
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
  const now = Date.now();
  if (
    simpleCache.serverInfo.data &&
    now - simpleCache.serverInfo.ts < CACHE_TTL_MS
  ) {
    return simpleCache.serverInfo.data;
  }
  try {
    if (inFlightRequests.has("serverInfo")) {
      return await inFlightRequests.get("serverInfo");
    }
    const requestPromise = api
      .get("/location/server-info")
      .then((r) => r.data || null);
    inFlightRequests.set("serverInfo", requestPromise);
    const data = await requestPromise;
    simpleCache.serverInfo = { data, ts: now };
    return data;
  } catch (err) {
    if (simpleCache.serverInfo.data) return simpleCache.serverInfo.data;
    return null;
  } finally {
    inFlightRequests.delete("serverInfo");
  }
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
export default api;
