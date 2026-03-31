import { useState, useRef, useCallback } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import Header from "./components/Header";
import PublicLayout from "./components/PublicLayout";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import NodeHistory from "./pages/NodeHistory";
import Profile from "./pages/Profile";
import SavedLocations from "./pages/SavedLocations";
import OAuth2RedirectHandler from "./pages/OAuth2RedirectHandler";
import CompleteProfile from "./pages/CompleteProfile";
import { useAuth } from "./context/AuthContext";
import "./index.css";

export interface RefreshContext {
  onRefreshRef: (fn: () => void) => void;
  onRefreshingChange: (v: boolean) => void;
  onLastRefreshChange: (d: Date) => void;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <>{children}</>;
};

/** Redirects authenticated users whose profile is still incomplete. */
const ProfileGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (user?.profileComplete === false) {
    return <Navigate to="/complete-profile" replace />;
  }
  return <>{children}</>;
};

function MainLayout() {
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const refreshFnRef = useRef<() => void>(() => {});

  const setRefreshFn = useCallback((fn: () => void) => {
    refreshFnRef.current = fn;
  }, []);

  const ctx: RefreshContext = {
    onRefreshRef: setRefreshFn,
    onRefreshingChange: setRefreshing,
    onLastRefreshChange: setLastRefresh,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        lastRefresh={lastRefresh}
        refreshing={refreshing}
        onRefresh={() => refreshFnRef.current()}
      />
      <main className="flex-1 flex flex-col">
        <Outlet context={ctx} />
      </main>
      <footer className="h-10 flex items-center justify-center border-t border-slate-800/60">
        <p className="text-xs text-slate-700">
          PolluSense Geo &mdash; IoT Air Quality Monitoring
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* ── Public pages with shared layout ── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>

      {/* ── Auth pages (no layout chrome) ── */}
      <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />

      {/* ── Protected dashboard ── */}
      <Route
        element={
          <ProtectedRoute>
            <ProfileGuard>
              <MainLayout />
            </ProfileGuard>
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/node/:nodeId" element={<NodeHistory />} />
        <Route path="/locations" element={<SavedLocations />} />
        <Route path="/profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

