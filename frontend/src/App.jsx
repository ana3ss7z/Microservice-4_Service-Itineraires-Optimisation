import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import RouteCalculator from "./pages/RouteCalculator";
import RouteOptimizer from "./pages/RouteOptimizer";
import DemandeRoute from "./pages/DemandeRoute";
import RouteHistory from "./pages/RouteHistory";
import UserInfoPage from "./pages/UserInfoPage";
import LocationPage from "./pages/LocationPage";
import CitiesPage from "./pages/CitiesPage";
import ServerInfoPage from "./pages/ServerInfoPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import { useState } from "react";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#333",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              borderRadius: "12px",
              padding: "16px",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />

        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <div className="flex">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          <main
            className={`flex-1 transition-all duration-300 ${
              sidebarOpen ? "ml-72" : "ml-0"
            } pt-16`}
          >
            <div className="p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/calculator" element={<RouteCalculator />} />
                <Route path="/optimizer" element={<RouteOptimizer />} />
                <Route path="/demande" element={<DemandeRoute />} />
                <Route path="/history" element={<RouteHistory />} />
                <Route path="/users" element={<UserInfoPage />} />
                <Route path="/location" element={<LocationPage />} />
                <Route path="/cities" element={<CitiesPage />} />
                <Route path="/server" element={<ServerInfoPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
