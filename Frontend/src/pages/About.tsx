import { Code, Link as LinkIcon, Mail } from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  links?: { type: "github" | "linkedin" | "email"; url: string }[];
}

const team: TeamMember[] = [
  {
    name: "Vitthal Biradar",
    role: "Full-Stack Developer",
    bio: "Designed the system architecture and developed the Spring Boot backend, REST APIs, database layer, and the React real-time dashboard.",
  },
  {
    name: "Shivanshi Yadav",
    role: "Frontend Developer",
    bio: "Built the responsive glassmorphism UI, implemented interactive data visualizations, and ensured a seamless user experience across devices.",
  },
  {
    name: "Sumit Tippanbone",
    role: "Hardware & IoT",
    bio: "Developed the Arduino sensor firmware, GPS integration, and Wi-Fi communication protocol for the field-deployed IoT nodes.",
  },
  {
    name: "Rupali Jinke",
    role: "Documentation & Research",
    bio: "Conducted air quality research, prepared project documentation, and contributed to system design and testing methodologies.",
  },
];

const techStack = [
  { category: "Frontend", items: ["React 19", "TypeScript", "Tailwind CSS v4", "Recharts", "Vite"] },
  { category: "Backend", items: ["Spring Boot", "Spring Security", "JWT / OAuth2", "PostgreSQL", "Gradle"] },
  { category: "IoT / Hardware", items: ["Arduino", "MQ-135 Gas Sensor", "PMS5003 PM Sensor", "NEO-6M GPS", "ESP8266 WiFi"] },
  { category: "DevOps", items: ["Docker", "Neon (Serverless Postgres)", "Vercel", "GitHub Actions"] },
];

export default function About() {
  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute top-[-5%] right-[15%] w-[35vw] h-[35vw] max-w-125 max-h-125 bg-indigo-600/12 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute bottom-0 left-[10%] w-[25vw] h-[25vw] max-w-87.5 max-h-87.5 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-16 sm:pt-36 sm:pb-20 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            About{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-cyan-400">
              PolluSense Geo
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            An end-to-end IoT platform that deploys GPS-enabled sensor nodes to
            capture hyper-local air quality data, processes it through a secure
            cloud backend, and presents actionable insights on a real-time
            dashboard.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="border-t border-slate-800/60 bg-slate-900/20">
        <div className="max-w-4xl mx-auto px-6 py-16 sm:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                Our Mission
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Air pollution kills an estimated 7 million people worldwide every
                year, yet most cities have fewer than five monitoring stations.
                PolluSense Geo is built to change that — by making environmental
                monitoring affordable, distributed, and accessible. Our
                low-cost sensor nodes can be deployed at scale to fill the data
                gap and empower communities, researchers, and policymakers with
                real-time, street-level air quality intelligence.
              </p>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                The Problem We Solve
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Government monitoring stations cost tens of thousands of dollars
                and coverage is sparse. PolluSense Geo provides a 100× cheaper
                alternative with Arduino-based sensor nodes that report PM2.5,
                PM10, CO₂, and other pollutants — geo-tagged and streamed to a
                central dashboard every 10 seconds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Meet the Team
          </h2>
          <p className="mt-3 text-slate-400 max-w-lg mx-auto">
            Built with passion by four engineers committed to environmental
            sustainability.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div
              key={member.name}
              className="card p-6 text-center hover:border-indigo-500/30 transition-all group"
            >
              {/* Avatar placeholder */}
              <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-600/20">
                <span className="text-lg font-bold text-white">
                  {member.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-white">
                {member.name}
              </h3>
              <p className="text-xs text-indigo-400 mt-0.5">{member.role}</p>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                {member.bio}
              </p>
              {member.links && (
                <div className="flex items-center justify-center gap-3 mt-4">
                  {member.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-indigo-400 transition-colors"
                    >
                      {link.type === "github" && (
                        <Code className="w-4 h-4" />
                      )}
                      {link.type === "linkedin" && (
                        <LinkIcon className="w-4 h-4" />
                      )}
                      {link.type === "email" && <Mail className="w-4 h-4" />}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="border-t border-slate-800/60 bg-slate-900/20">
        <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Technology Stack
            </h2>
            <p className="mt-3 text-slate-400 max-w-lg mx-auto">
              A modern, production-ready stack from sensor firmware to cloud deployment.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((group) => (
              <div key={group.category} className="card p-5">
                <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-3">
                  {group.category}
                </h3>
                <ul className="space-y-2">
                  {group.items.map((item) => (
                    <li
                      key={item}
                      className="text-xs text-slate-300 flex items-center gap-2"
                    >
                      <span className="w-1 h-1 rounded-full bg-indigo-500/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="max-w-4xl mx-auto px-6 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Project Journey
          </h2>
        </div>

        <div className="space-y-8">
          {[
            {
              date: "Jan 2026",
              title: "Idea & Research",
              desc: "Identified the gap in affordable, hyper-local air quality monitoring. Evaluated sensor options and system architectures.",
            },
            {
              date: "Feb 2026",
              title: "Hardware Prototyping",
              desc: "Built the first Arduino sensor node with MQ-135, PMS5003, and NEO-6M GPS. Validated Wi-Fi data transmission.",
            },
            {
              date: "Mar 2026",
              title: "Backend & Frontend Development",
              desc: "Developed the Spring Boot REST API with JWT/OAuth2 authentication and the React real-time dashboard.",
            },
            {
              date: "Apr 2026",
              title: "Integration & Launch",
              desc: "End-to-end integration of IoT nodes, backend, and dashboard. Deployed to production on Vercel & Neon.",
            },
          ].map((item, i) => (
            <div key={i} className="flex gap-6 items-start">
              <div className="shrink-0 w-20 text-right">
                <span className="text-xs font-medium text-indigo-400">
                  {item.date}
                </span>
              </div>
              <div className="relative pt-0.5">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 border-2 border-indigo-400/30 shrink-0" />
                {i < 3 && (
                  <div className="absolute top-3 left-[4.5px] w-px h-full bg-slate-700/60" />
                )}
              </div>
              <div className="pb-4">
                <h3 className="text-sm font-semibold text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
