import { useOutletContext } from "react-router-dom";
import {
  Droplets,
  BarChart3,
  MapPin,
  Wifi,
  ArrowRight,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

interface PublicContext {
  openAuth: (tab: "login" | "register") => void;
}

const features = [
  {
    icon: Droplets,
    title: "Real-Time AQI Monitoring",
    desc: "Track air quality index, PM2.5, PM10, CO₂, and other pollutants with live sensor data updated every 10 seconds.",
  },
  {
    icon: MapPin,
    title: "Geo-Tagged Nodes",
    desc: "Each IoT sensor node is GPS-enabled, giving precise location data for hyper-local pollution mapping.",
  },
  {
    icon: BarChart3,
    title: "Historical Analytics",
    desc: "Explore historical trends with interactive charts. Compare data across time periods and sensor nodes.",
  },
  {
    icon: Wifi,
    title: "IoT-Powered Network",
    desc: "Arduino-based sensor nodes communicate over Wi-Fi, forming a scalable mesh for city-wide monitoring.",
  },
  {
    icon: Shield,
    title: "Secure & Authenticated",
    desc: "JWT and OAuth2 (Google) authentication ensure only authorized users access the monitoring dashboard.",
  },
  {
    icon: Zap,
    title: "Instant Alerts",
    desc: "Get notified when air quality deteriorates beyond safe thresholds in your monitored regions.",
  },
];

const stats = [
  { value: "10s", label: "Update Interval" },
  { value: "6+", label: "Pollutant Metrics" },
  { value: "24/7", label: "Continuous Monitoring" },
  { value: "99.9%", label: "Uptime" },
];

export default function Home() {
  const { openAuth } = useOutletContext<PublicContext>();

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-[-10%] left-[10%] w-[45vw] h-[45vw] max-w-150 max-h-150 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[5%] w-[35vw] h-[35vw] max-w-125 max-h-125 bg-cyan-600/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-[40%] left-[60%] w-[20vw] h-[20vw] max-w-75 max-h-75 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-28 pb-20 sm:pt-36 sm:pb-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8">
            <Globe className="w-3.5 h-3.5" />
            IoT-Powered Air Quality Platform
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            <span className="text-white">Monitor Air Quality</span>
            <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 via-cyan-400 to-emerald-400">
              in Real Time
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            PolluSense Geo deploys GPS-enabled IoT sensor nodes to capture
            hyper-local pollution data — giving communities and researchers the
            tools to understand and improve the air they breathe.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openAuth("register")}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all text-sm"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => openAuth("login")}
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg border border-slate-700 hover:border-slate-600 bg-slate-800/40 hover:bg-slate-800/60 text-slate-300 hover:text-white font-semibold transition-all text-sm"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="border-y border-slate-800/60 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-white">
                {s.value}
              </p>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-6 py-20 sm:py-28">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Everything You Need for Air Quality Intelligence
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            From hardware to dashboard — an end-to-end platform for environmental monitoring.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="card p-6 hover:border-indigo-500/30 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-500/15 transition-colors">
                <f.icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">
                {f.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="border-t border-slate-800/60 bg-slate-900/20">
        <div className="max-w-5xl mx-auto px-6 py-20 sm:py-28">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              How It Works
            </h2>
            <p className="mt-3 text-slate-400 max-w-xl mx-auto">
              Three simple layers working together to deliver precise air quality insights.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Sensor Nodes Collect Data",
                desc: "Arduino-powered nodes equipped with gas & particulate sensors read environmental data and tag each reading with GPS coordinates.",
              },
              {
                step: "02",
                title: "Backend Processes & Stores",
                desc: "A Spring Boot API ingests incoming readings, computes AQI, persists data in PostgreSQL, and exposes secure REST endpoints.",
              },
              {
                step: "03",
                title: "Dashboard Visualizes",
                desc: "The React-based dashboard provides live AQI gauges, historical charts, and geo-located node cards — all in real time.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <span className="text-5xl font-extrabold text-indigo-500/10 absolute -top-4 -left-2 select-none">
                  {item.step}
                </span>
                <div className="relative pt-8">
                  <h3 className="text-sm font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-4xl mx-auto px-6 py-20 sm:py-24 text-center">
        <div className="panel p-10 sm:p-14 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px bg-linear-to-r from-transparent via-indigo-500/40 to-transparent" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to Start Monitoring?
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto mb-8">
            Create a free account and connect your IoT sensor nodes in minutes.
          </p>
          <button
            onClick={() => openAuth("register")}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-lg bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all text-sm"
          >
            Create Free Account
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
