import { useState } from "react";
import {
  Package,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Truck,
  Weight,
  Send,
  RefreshCw,
} from "lucide-react";
import { calculateRouteWithDemande } from "../services/api";
import MapView from "../components/MapView";
import LoadingSpinner from "../components/LoadingSpinner";
import toast from "react-hot-toast";

export default function DemandeRoute() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [formData, setFormData] = useState({
    userId: "user_001",
    username: "",
    email: "",
    fullName: "",
    phone: "",
    volume: "",
    natureMarchandise: "",
    departDate: "",
    departTime: "",
    adresseDepart: "",
    adresseDestination: "",
  });

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.adresseDepart || !formData.adresseDestination) {
      toast.error("Veuillez renseigner les adresses");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Combine date and time into ISO format with seconds
      let dateDepart = null;
      if (formData.departDate && formData.departTime) {
        dateDepart = `${formData.departDate}T${formData.departTime}:00`;
      } else if (formData.departDate) {
        dateDepart = `${formData.departDate}T00:00:00`;
      }

      const request = {
        ...formData,
        volume: formData.volume ? parseFloat(formData.volume) : null,
        dateDepart: dateDepart,
      };

      const response = await calculateRouteWithDemande(request);
      setResult(response);
      toast.success("Demande calculée avec succès!");
    } catch (error) {
      toast.error(error.message || "Erreur lors du calcul");
    } finally {
      setLoading(false);
    }
  };

  const loadExample = () => {
    setFormData({
      userId: "user_123",
      username: "ahmed_benali",
      email: "ahmed.benali@email.com",
      fullName: "Ahmed Ben Ali",
      phone: "+212 6 12 34 56 78",
      volume: "15.5",
      natureMarchandise: "Meubles de salon",
      departDate: "2025-12-15",
      departTime: "10:00",
      adresseDepart: "Casablanca, Morocco",
      adresseDestination: "Rabat, Morocco",
    });
    toast.success("Exemple chargé!");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            Demande de Transport
          </h1>
          <p className="text-gray-500 mt-1">
            Calcul avec volume et informations de marchandise
          </p>
        </div>

        <button
          onClick={loadExample}
          className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-medium"
        >
          📋 Charger un exemple
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
            <h2 className="text-white font-bold text-lg">
              Informations de la demande
            </h2>
            <p className="text-orange-100 text-sm">
              Remplissez tous les champs nécessaires
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* User Information Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 pb-2 border-b border-gray-100">
                <User className="w-5 h-5 text-orange-500" />
                Informations Client
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => updateField("fullName", e.target.value)}
                      placeholder="Ahmed Ben Ali"
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Nom d'utilisateur
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => updateField("username", e.target.value)}
                    placeholder="ahmed_benali"
                    className="input-field"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="email@example.com"
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="+212 6 XX XX XX XX"
                      className="input-field pl-12"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Route Information Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 pb-2 border-b border-gray-100">
                <MapPin className="w-5 h-5 text-orange-500" />
                Itinéraire
              </h3>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Adresse de départ *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-emerald-500"></div>
                  <input
                    type="text"
                    value={formData.adresseDepart}
                    onChange={(e) =>
                      updateField("adresseDepart", e.target.value)
                    }
                    placeholder="123 Rue Mohammed V, Casablanca"
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Adresse de destination *
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-rose-500"></div>
                  <input
                    type="text"
                    value={formData.adresseDestination}
                    onChange={(e) =>
                      updateField("adresseDestination", e.target.value)
                    }
                    placeholder="456 Avenue Hassan II, Rabat"
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600 mb-1 block">
                  Date et heure de départ
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.departDate}
                      onChange={(e) =>
                        updateField("departDate", e.target.value)
                      }
                      className="input-field pl-12"
                      placeholder="jj/mm/aaaa"
                      lang="fr-FR"
                    />
                  </div>
                  <div className="relative">
                    <svg
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path
                        strokeWidth="2"
                        strokeLinecap="round"
                        d="M12 6v6l4 2"
                      />
                    </svg>
                    <input
                      type="time"
                      value={formData.departTime}
                      onChange={(e) =>
                        updateField("departTime", e.target.value)
                      }
                      className="input-field pl-12 time-24h"
                      step="60"
                      lang="fr-FR"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Format: Date (AAAA-MM-JJ) + Heure 24h (HH:MM)
                </p>
              </div>
            </div>

            {/* Merchandise Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 flex items-center gap-2 pb-2 border-b border-gray-100">
                <Truck className="w-5 h-5 text-orange-500" />
                Marchandise
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Volume (m³)
                  </label>
                  <div className="relative">
                    <Weight className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={formData.volume}
                      onChange={(e) => updateField("volume", e.target.value)}
                      placeholder="15.5"
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600 mb-1 block">
                    Nature de la marchandise
                  </label>
                  <input
                    type="text"
                    value={formData.natureMarchandise}
                    onChange={(e) =>
                      updateField("natureMarchandise", e.target.value)
                    }
                    placeholder="Meubles de salon"
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Calcul en cours...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Soumettre la demande
                </>
              )}
            </button>
          </div>
        </form>

        {/* Result Section */}
        <div className="space-y-6">
          {/* Loading */}
          {loading && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 flex items-center justify-center">
              <LoadingSpinner text="Calcul de l'itinéraire..." />
            </div>
          )}

          {/* Result */}
          {result && !loading && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
                <h3 className="text-white font-bold text-lg">
                  Résultat de la demande
                </h3>
                <p className="text-orange-100 text-sm">
                  Route ID: {result.routeId}
                </p>
              </div>

              {/* User Info */}
              <div className="p-6 border-b border-gray-100">
                <h4 className="font-semibold text-gray-700 mb-4">
                  Informations Client
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nom:</span>
                    <p className="font-medium">{result.fullName || "-"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <p className="font-medium">{result.email || "-"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Téléphone:</span>
                    <p className="font-medium">{result.phone || "-"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Username:</span>
                    <p className="font-medium">{result.username || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Route Info */}
              <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100">
                <h4 className="font-semibold text-gray-700 mb-4">
                  Informations de Route
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">
                      Distance Totale
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {result.totalDistanceKm?.toFixed(2) || "-"} km
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">
                      Durée Totale
                    </p>
                    <p className="text-2xl font-bold text-emerald-600">
                      {result.totalDurationMin || "-"} min
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Volume</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {result.volume || "-"} m³
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-gray-500 uppercase">Statut</p>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        result.status === "SUCCESS"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {result.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-700 mb-4">Trajet</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 mt-1.5"></div>
                    <div>
                      <p className="text-sm text-gray-500">Départ</p>
                      <p className="font-medium">{result.adresseDepart}</p>
                    </div>
                  </div>
                  <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-6"></div>
                  <div className="flex items-start gap-3">
                    <div className="w-3 h-3 rounded-full bg-rose-500 mt-1.5"></div>
                    <div>
                      <p className="text-sm text-gray-500">Destination</p>
                      <p className="font-medium">{result.adresseDestination}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Merchandise */}
              {result.natureMarchandise && (
                <div className="px-6 pb-6">
                  <div className="p-4 bg-amber-50 rounded-xl">
                    <p className="text-sm text-amber-700">
                      <strong>Marchandise:</strong> {result.natureMarchandise}
                    </p>
                    {result.dateDepart && (
                      <p className="text-sm text-amber-700 mt-1">
                        <strong>Date de départ:</strong> {result.dateDepart}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && !result && (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Aucune demande
              </h3>
              <p className="text-gray-500">
                Remplissez le formulaire pour calculer un itinéraire avec les
                informations de transport.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
