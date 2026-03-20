import { useState, useRef, useCallback } from "react";
import type { AppRoute } from "./types";
import Header from "./components/Header";
import Dashboard from "./pages/Dashboard";
import NodeHistory from "./pages/NodeHistory";
import "./index.css";

export default function App() {
  const [route, setRoute] = useState<AppRoute>({ view: "dashboard" });
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refreshFnRef = useRef<() => void>(() => {});
  const setRefreshFn = useCallback((fn: () => void) => {
    refreshFnRef.current = fn;
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        route={route}
        onNavigate={setRoute}
        lastRefresh={lastRefresh}
        refreshing={refreshing}
        onRefresh={() => refreshFnRef.current()}
      />

      <main className="flex-1 flex flex-col">
        {route.view === "dashboard" && (
          <Dashboard
            onSelectNode={(nodeId) => setRoute({ view: "history", nodeId })}
            onRefreshRef={setRefreshFn}
            onRefreshingChange={setRefreshing}
            onLastRefreshChange={setLastRefresh}
          />
        )}
        {route.view === "history" && route.nodeId && (
          <NodeHistory
            nodeId={route.nodeId}
            onRefreshRef={setRefreshFn}
            onRefreshingChange={setRefreshing}
            onLastRefreshChange={setLastRefresh}
          />
        )}
      </main>

      <footer className="h-10 flex items-center justify-center border-t border-slate-800">
        <p className="text-xs text-slate-700">
          PolluSense Geo — IoT Air Quality Monitoring — auto-refreshes every 10
          s
        </p>
      </footer>
    </div>
  );
}
