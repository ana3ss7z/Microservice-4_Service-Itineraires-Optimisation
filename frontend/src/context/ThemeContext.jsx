import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export function ThemeProvider({ children }) {
  // Load settings from localStorage
  const loadSettings = () => {
    try {
      const saved = localStorage.getItem("transport-maroc-settings");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Error loading settings:", e);
    }
    return {
      darkMode: false,
      mapStyle: "streets",
      distanceUnit: "km",
      notifications: {
        email: true,
        push: true,
        routeAlerts: true,
        updates: false,
      },
    };
  };

  const [settings, setSettings] = useState(loadSettings);

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem("transport-maroc-settings", JSON.stringify(settings));

    // Apply dark mode to document
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings]);

  const updateSettings = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const updateNotification = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      },
    }));
  };

  const toggleDarkMode = () => {
    setSettings((prev) => ({
      ...prev,
      darkMode: !prev.darkMode,
    }));
  };

  const setMapStyle = (style) => {
    setSettings((prev) => ({
      ...prev,
      mapStyle: style,
    }));
  };

  const setDistanceUnit = (unit) => {
    setSettings((prev) => ({
      ...prev,
      distanceUnit: unit,
    }));
  };

  // Get map tile URL based on style
  const getMapTileUrl = () => {
    const styles = {
      streets: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      satellite:
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      terrain: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      dark: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
    };
    return styles[settings.mapStyle] || styles.streets;
  };

  const getMapAttribution = () => {
    const attributions = {
      streets:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      satellite:
        "&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye",
      terrain:
        '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
      dark: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
    };
    return attributions[settings.mapStyle] || attributions.streets;
  };

  // Convert distance based on unit preference
  const formatDistance = (km) => {
    if (settings.distanceUnit === "miles") {
      return `${(km * 0.621371).toFixed(1)} mi`;
    }
    return `${km.toFixed(1)} km`;
  };

  return (
    <ThemeContext.Provider
      value={{
        settings,
        darkMode: settings.darkMode,
        mapStyle: settings.mapStyle,
        distanceUnit: settings.distanceUnit,
        notifications: settings.notifications,
        updateSettings,
        updateNotification,
        toggleDarkMode,
        setMapStyle,
        setDistanceUnit,
        getMapTileUrl,
        getMapAttribution,
        formatDistance,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeContext;
