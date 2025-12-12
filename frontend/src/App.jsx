import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import toast, { Toaster, ToastBar } from "react-hot-toast";
import { X } from "lucide-react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import MobileBottomNav from "./components/MobileBottomNav";
import Dashboard from "./pages/Dashboard";
import RouteCalculator from "./pages/RouteCalculator";
import RouteOptimizer from "./pages/RouteOptimizer";
import RouteHistory from "./pages/RouteHistory";
import RouteDetailPage from "./pages/RouteDetailPage";
import UserProfilePage from "./pages/UserProfilePage";
import LocationPage from "./pages/LocationPage";
import CitiesPage from "./pages/CitiesPage";
import ServerInfoPage from "./pages/ServerInfoPage";
import SettingsPage from "./pages/SettingsPage";
import ApiDocsPage from "./pages/ApiDocsPage";
import StatisticsPage from "./pages/StatisticsPage";
import FavoritesPage from "./pages/FavoritesPage";
import { useState } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleMenuClick = () => {
    if (window.innerWidth >= 1024) {
      // Desktop: toggle collapse
      setIsCollapsed(!isCollapsed);
    } else {
      // Mobile: toggle sidebar open/close
      setSidebarOpen(!sidebarOpen);
    }
  };

  return (
    <Router future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Toaster
          position="top-right"
          gutter={12}
          containerStyle={{
            top: 80,
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#333",
              boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
              borderRadius: "12px",
              padding: "12px 16px",
              maxWidth: "380px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
              style: {
                border: "1px solid #d1fae5",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
              style: {
                border: "1px solid #fecaca",
              },
            },
          }}
        >
          {(t) => (
            <ToastBar toast={t}>
              {({ icon, message }) => (
                <div className="flex items-center gap-2 w-full">
                  {icon}
                  <div className="flex-1">{message}</div>
                  {t.type !== "loading" && (
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all focus:outline-none ml-2"
                      aria-label="Fermer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>

        <Navbar onMenuClick={handleMenuClick} isCollapsed={isCollapsed} />

        <div className="flex">
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            isCollapsed={isCollapsed}
          />

          <main
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? (isCollapsed ? "lg:ml-20" : "lg:ml-72") : "ml-0"
            } pt-16`}
          >
            <div className="p-6 lg:p-8 pb-24 lg:pb-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calculator" element={<RouteCalculator />} />
                <Route path="/optimizer" element={<RouteOptimizer />} />
                <Route path="/history" element={<RouteHistory />} />
                <Route path="/route/:id" element={<RouteDetailPage />} />
                <Route path="/profile" element={<UserProfilePage />} />
                <Route path="/location" element={<LocationPage />} />
                <Route path="/cities" element={<CitiesPage />} />
                <Route path="/server" element={<ServerInfoPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/api-docs" element={<ApiDocsPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
              </Routes>
            </div>
          </main>
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav onMenuClick={() => setSidebarOpen(true)} />
      </div>
    </Router>
  );
}

export default App;
