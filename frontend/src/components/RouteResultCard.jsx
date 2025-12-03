import { MapPin, Clock, Navigation, ArrowRight, RotateCcw } from "lucide-react";

export default function RouteResultCard({ result }) {
  if (!result) return null;

  const formatDuration = (minutes) => {
    if (!minutes) return "-";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} min`;
    return `${hours}h ${mins}min`;
  };

  const formatDistance = (km) => {
    if (!km) return "-";
    return `${km.toFixed(2)} km`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-bold text-lg">Résultat du calcul</h3>
            <p className="text-primary-100 text-sm">
              {result.status === "SUCCESS" ? "✓ Calcul réussi" : "⚠ Erreur"}
            </p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              result.status === "SUCCESS"
                ? "bg-green-400/20 text-green-100"
                : "bg-red-400/20 text-red-100"
            }`}
          >
            {result.status}
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50">
        {/* Distance Aller */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Navigation className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">
              Distance Aller
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatDistance(result.distanceKm)}
          </p>
        </div>

        {/* Durée Aller */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Durée Aller</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatDuration(result.durationMin)}
          </p>
        </div>

        {/* Distance Retour */}
        {result.returnDistanceKm && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <RotateCcw className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wide">
                Distance Retour
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {formatDistance(result.returnDistanceKm)}
            </p>
          </div>
        )}

        {/* Durée Retour */}
        {result.returnDurationMin && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 text-orange-500 mb-2">
              <Clock className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wide">
                Durée Retour
              </span>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {formatDuration(result.returnDurationMin)}
            </p>
          </div>
        )}
      </div>

      {/* Total */}
      {(result.totalDistanceKm || result.totalDurationMin) && (
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Distance Totale</p>
              <p className="text-white text-2xl font-bold">
                {formatDistance(result.totalDistanceKm)}
              </p>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-right">
              <p className="text-emerald-100 text-sm">Durée Totale</p>
              <p className="text-white text-2xl font-bold">
                {formatDuration(result.totalDurationMin)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Steps/Instructions */}
      {result.instructions && result.instructions.length > 0 && (
        <div className="p-6">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            Instructions de route
          </h4>
          <div className="space-y-3">
            {result.instructions.map((instruction, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-700 text-sm">{instruction}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Route Info */}
      {result.routeId && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Route ID:</span>
            <code className="bg-gray-200 px-2 py-1 rounded text-xs">
              {result.routeId}
            </code>
          </div>
          {result.calculatedAt && (
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-500">Calculé le:</span>
              <span className="text-gray-700">{result.calculatedAt}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
