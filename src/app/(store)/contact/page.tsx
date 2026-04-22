"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap/config";
import { MapPin, Mail, Phone, Clock, Shield, Truck, Headphones } from "lucide-react";

const TRUST_BADGES = [
  { icon: Shield, label: "Secure Payments", sub: "SSL encrypted checkout" },
  { icon: Truck, label: "Free Shipping", sub: "On orders over R1,500" },
  { icon: Headphones, label: "Dedicated Support", sub: "Response within 24hrs" },
];

export default function ContactPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const els = containerRef.current?.querySelectorAll("[data-reveal]");
    if (els) gsap.from(els, { y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out" });
  }, { scope: containerRef });

  return (
    <div
      ref={containerRef}
      className="min-h-screen pt-32 pb-24"
      style={{
        background:
          "radial-gradient(ellipse at 70% 20%, rgba(200,160,60,0.04) 0%, transparent 50%), #0A0A0A",
      }}
    >
      <div className="max-w-5xl mx-auto px-8">
        <p data-reveal className="text-gold-warm text-xs tracking-[0.2em] uppercase font-sans mb-4">Get in Touch</p>
        <h1 data-reveal className="font-display text-ivory font-light text-5xl mb-6">Contact Us</h1>
        <div data-reveal className="w-16 h-px bg-gold-warm mb-16" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div data-reveal>
            <form
              action="https://formsubmit.co/hello@fraviont.com"
              method="POST"
              className="space-y-6"
            >
              <input type="hidden" name="_subject" value="New Contact from Fraviont Website" />
              <input type="hidden" name="_template" value="box" />
              <input type="hidden" name="_captcha" value="false" />
              <div>
                <label className="text-ash text-xs tracking-[0.14em] uppercase font-sans block mb-2">Name</label>
                <input
                  type="text" name="name" required
                  className="w-full bg-transparent border border-iron text-ivory text-sm font-sans font-light px-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="text-ash text-xs tracking-[0.14em] uppercase font-sans block mb-2">Email</label>
                <input
                  type="email" name="email" required
                  className="w-full bg-transparent border border-iron text-ivory text-sm font-sans font-light px-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors"
                  placeholder="Your email"
                />
              </div>
              <div>
                <label className="text-ash text-xs tracking-[0.14em] uppercase font-sans block mb-2">Subject</label>
                <select
                  name="subject"
                  className="w-full bg-transparent border border-iron text-ivory text-sm font-sans font-light px-4 py-3 focus:outline-none focus:border-gold-antique transition-colors"
                >
                  <option className="bg-black" value="general">General Enquiry</option>
                  <option className="bg-black" value="order">Order Support</option>
                  <option className="bg-black" value="wholesale">Wholesale / Partnership</option>
                  <option className="bg-black" value="press">Press / Media</option>
                </select>
              </div>
              <div>
                <label className="text-ash text-xs tracking-[0.14em] uppercase font-sans block mb-2">Message</label>
                <textarea
                  name="message" required rows={5}
                  className="w-full bg-transparent border border-iron text-ivory text-sm font-sans font-light px-4 py-3 placeholder:text-ash focus:outline-none focus:border-gold-antique transition-colors resize-none"
                  placeholder="How can we help you?"
                />
              </div>
              <button
                type="submit"
                className="bg-gold-warm text-obsidian text-xs tracking-[0.14em] uppercase font-sans font-medium px-10 py-4 hover:bg-gold-bright transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div data-reveal className="space-y-10">
            <div className="flex gap-4">
              <MapPin size={18} className="text-gold-warm mt-1 shrink-0" />
              <div>
                <h3 className="text-ivory text-sm font-sans font-medium mb-1">Visit Our Atelier</h3>
                <p className="text-parchment text-sm font-sans font-light leading-relaxed">
                  42 Waterfront Drive, Victoria &amp; Alfred Waterfront<br />Cape Town, 8001, South Africa
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Mail size={18} className="text-gold-warm mt-1 shrink-0" />
              <div>
                <h3 className="text-ivory text-sm font-sans font-medium mb-1">Email Us</h3>
                <p className="text-parchment text-sm font-sans font-light">hello@fraviont.com</p>
                <p className="text-ash text-xs font-sans mt-1">For returns: returns@fraviont.com</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Phone size={18} className="text-gold-warm mt-1 shrink-0" />
              <div>
                <h3 className="text-ivory text-sm font-sans font-medium mb-1">Call Us</h3>
                <p className="text-parchment text-sm font-sans font-light">+27 21 418 2900</p>
                <p className="text-ash text-xs font-sans mt-1">Mon — Fri · 9:00 — 18:00 SAST</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock size={18} className="text-gold-warm mt-1 shrink-0" />
              <div>
                <h3 className="text-ivory text-sm font-sans font-medium mb-1">Opening Hours</h3>
                <p className="text-parchment text-sm font-sans font-light leading-relaxed">
                  Monday — Friday: 9:00 — 18:00<br />Saturday: 10:00 — 16:00<br />Sunday: Closed
                </p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="mt-8 border border-iron/30 overflow-hidden aspect-video relative" style={{ background: "linear-gradient(135deg, rgba(200,160,60,0.06) 0%, #111111 50%, rgba(200,160,60,0.03) 100%)" }}>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <MapPin size={32} className="text-gold-warm mb-3 opacity-40" />
                <p className="text-ivory text-sm font-sans font-light">Cape Town, South Africa</p>
                <p className="text-ash text-xs font-sans mt-1">V&A Waterfront</p>
              </div>
              {/* Decorative grid */}
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(200,160,60,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,160,60,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div data-reveal className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 pt-16 border-t border-iron/20">
          {TRUST_BADGES.map((b, i) => (
            <div key={i} className="flex items-center gap-4 p-5 bg-[#111111] border border-[#1E1E1E]">
              <div className="w-10 h-10 bg-gold-warm/10 flex items-center justify-center shrink-0">
                <b.icon size={18} className="text-gold-warm" />
              </div>
              <div>
                <p className="text-ivory text-sm font-sans font-medium">{b.label}</p>
                <p className="text-ash text-xs font-sans">{b.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
