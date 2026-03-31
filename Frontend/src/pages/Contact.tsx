import React, { useState } from "react";
import { Mail, MapPin, Phone, Send, MessageSquare } from "lucide-react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, wire this to a backend endpoint or email service
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden">
        <div className="absolute top-[-5%] left-[20%] w-[30vw] h-[30vw] max-w-100 max-h-100 bg-indigo-600/12 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-[10%] w-[25vw] h-[25vw] max-w-87.5 max-h-87.5 bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-6 pt-28 pb-14 sm:pt-36 sm:pb-18 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
            Get in{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-indigo-400 to-cyan-400">
              Touch
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto leading-relaxed">
            Have questions about PolluSense Geo, want to deploy sensor nodes, or
            interested in collaborating? We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── Info Cards + Form ── */}
      <section className="max-w-5xl mx-auto px-6 pb-20 sm:pb-28 w-full">
        {/* Contact info cards */}
        <div className="grid sm:grid-cols-3 gap-5 mb-12">
          {[
            {
              icon: Mail,
              title: "Email",
              value: "team@pollusense.io",
              href: "mailto:team@pollusense.io",
            },
            {
              icon: MapPin,
              title: "Location",
              value: "Pune, Maharashtra, India",
              href: undefined,
            },
            {
              icon: Phone,
              title: "Phone",
              value: "+91 98765 43210",
              href: "tel:+919876543210",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="card p-5 flex items-start gap-4 hover:border-indigo-500/30 transition-all"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <item.icon className="w-4 h-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">{item.title}</p>
                {item.href ? (
                  <a
                    href={item.href}
                    className="text-sm text-white hover:text-indigo-400 transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="text-sm text-white">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="panel p-8 sm:p-10 max-w-2xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[50%] h-px bg-linear-to-r from-transparent via-indigo-500/30 to-transparent" />

          {submitted ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
                <MessageSquare className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Message Sent!
              </h3>
              <p className="text-sm text-slate-400">
                Thanks for reaching out, {form.name}. We'll get back to you
                shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setForm({ name: "", email: "", subject: "", message: "" });
                }}
                className="mt-6 text-xs text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2"
              >
                Send another message
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-bold text-white mb-1">
                Send Us a Message
              </h2>
              <p className="text-xs text-slate-400 mb-6">
                Fill out the form below and we'll respond within 24 hours.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder="you@example.com"
                      className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Subject
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white text-sm transition-all"
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>
                    <option value="general">General Inquiry</option>
                    <option value="deployment">Node Deployment</option>
                    <option value="partnership">Partnership / Collaboration</option>
                    <option value="bug">Bug Report</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="Tell us how we can help..."
                    className="w-full px-4 py-2.5 bg-slate-900/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-slate-500 text-sm transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold shadow-lg shadow-indigo-600/25 transition-all text-sm"
                >
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
