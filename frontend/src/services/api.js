import axios from "axios";

// Configuration de base de l'API
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Une erreur est survenue";
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

export default api;
