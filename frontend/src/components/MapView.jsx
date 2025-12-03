import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { useTheme } from "../context/ThemeContext";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom marker icons
const createCustomIcon = (color) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background: linear-gradient(135deg, ${color} 0%, ${color}cc 100%);
        width: 30px;
        height: 30px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 10px;
          height: 10px;
          background: white;
          border-radius: 50%;
          transform: rotate(45deg);
        "></div>
      </div>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const originIcon = createCustomIcon("#10b981");
const destinationIcon = createCustomIcon("#ef4444");
const waypointIcon = createCustomIcon("#3b82f6");
const selectionIcon = createCustomIcon("#f59e0b");

// Component to fit bounds
function FitBounds({ bounds }) {
  const map = useMap();

  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);

  return null;
}

// Component to handle map clicks for point selection
function MapClickHandler({ onMapClick, selectionMode }) {
  useMapEvents({
    click: (e) => {
      if (selectionMode && onMapClick) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function MapView({
  waypoints = [],
  routePolyline = null,
  center = [31.7917, -7.0926], // Center of Morocco
  zoom = 6,
  height = "400px",
  selectionMode = false,
  onMapClick = null,
  selectionPoint = null,
}) {
  const { getMapTileUrl, getMapAttribution } = useTheme();

  // Filter valid waypoints (within reasonable Morocco bounds)
  const validWaypoints = useMemo(() => {
    return waypoints.filter((wp) => {
      const lat = wp.latitude;
      const lng = wp.longitude;
      // Morocco approximate bounds: lat 21-36, lng -17 to -1
      return (
        lat &&
        lng &&
        !isNaN(lat) &&
        !isNaN(lng) &&
        lat >= 21 &&
        lat <= 36 &&
        lng >= -17 &&
        lng <= -1
      );
    });
  }, [waypoints]);

  // Parse polyline string to coordinates
  const polylineCoords = useMemo(() => {
    if (!routePolyline) return [];

    try {
      return routePolyline.split("|").map((coord) => {
        const [lat, lng] = coord.split(",").map(Number);
        return [lat, lng];
      });
    } catch (e) {
      console.error("Error parsing polyline:", e);
      return [];
    }
  }, [routePolyline]);

  // Calculate bounds from valid waypoints
  const bounds = useMemo(() => {
    if (validWaypoints.length === 0) return null;
    return validWaypoints.map((wp) => [wp.latitude, wp.longitude]);
  }, [validWaypoints]);

  return (
    <div
      style={{ height }}
      className={`rounded-xl overflow-hidden shadow-lg border ${
        selectionMode
          ? "border-amber-400 ring-2 ring-amber-200"
          : "border-gray-200"
      }`}
    >
      {selectionMode && (
        <div className="bg-amber-100 text-amber-800 text-sm py-2 px-4 flex items-center gap-2">
          <span className="animate-pulse">📍</span>
          <span>Cliquez sur la carte pour sélectionner un point</span>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer attribution={getMapAttribution()} url={getMapTileUrl()} />

        {/* Map click handler for selection mode */}
        <MapClickHandler
          onMapClick={onMapClick}
          selectionMode={selectionMode}
        />

        {/* Selection point marker */}
        {selectionPoint && (
          <Marker
            position={[selectionPoint.latitude, selectionPoint.longitude]}
            icon={selectionIcon}
          >
            <Popup>
              <div className="text-center">
                <p className="font-bold text-amber-700">Point sélectionné</p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectionPoint.latitude.toFixed(4)},{" "}
                  {selectionPoint.longitude.toFixed(4)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Markers - use validWaypoints to only show points within Morocco */}
        {validWaypoints.map((wp, index) => {
          let icon = waypointIcon;
          if (index === 0) icon = originIcon;
          else if (index === validWaypoints.length - 1) icon = destinationIcon;

          return (
            <Marker
              key={index}
              position={[wp.latitude, wp.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-gray-800">
                    {wp.name || `Point ${index + 1}`}
                  </p>
                  {wp.city && (
                    <p className="text-sm text-gray-500">{wp.city}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {wp.latitude.toFixed(4)}, {wp.longitude.toFixed(4)}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Route polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            positions={polylineCoords}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
            dashArray="10, 10"
          />
        )}

        {/* Fit bounds */}
        {bounds && <FitBounds bounds={bounds} />}
      </MapContainer>
    </div>
  );
}
