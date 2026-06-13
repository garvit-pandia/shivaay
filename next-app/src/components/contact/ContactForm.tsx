"use client";

import { useState, type FormEvent } from "react";
import { Send, Check } from "lucide-react";
import { serviceOptions } from "@/lib/data";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [sending, setSending] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const honeypot = (data.get("website") as string || "").trim();
    if (honeypot) return;

    const name = (data.get("name") as string || "").trim();
    const phone = (data.get("phone") as string || "").trim();
    const newErrors: { name?: string; phone?: string } = {};
    if (!name) newErrors.name = "Please enter your name";
    if (!phone) newErrors.phone = "Please enter your phone number";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    setErrors({});
    setSending(true);

    const company = (data.get("company") as string || "").trim();
    const email = (data.get("email") as string || "").trim();
    const service = data.get("service") as string || "";
    const message = (data.get("message") as string || "").trim();

    const mailto = `mailto:shivaaylogistics2022@gmail.com?subject=${encodeURIComponent(`Inquiry from ${name}${company ? ` (${company})` : ""}`)}&body=${encodeURIComponent(`Name: ${name}\nCompany: ${company}\nPhone: ${phone}\nEmail: ${email}\nService: ${service}\nMessage: ${message}`)}`;

    setTimeout(() => {
      window.location.href = mailto;
      setSubmitted(true);
      setSending(false);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="bg-white border border-border rounded-2xl p-10 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(15, 118, 110, 0.08)" }}>
          <Check size={32} className="text-teal" />
        </div>
        <h2 className="text-2xl font-semibold text-ink mb-2">Thank You!</h2>
        <p className="text-ink-dim text-sm">
          Your inquiry has been received. You&apos;ll be redirected to your email client shortly. We&apos;ll get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-2xl p-8">
      <h2 className="text-2xl font-semibold text-ink mb-1">Send an Inquiry</h2>
      <p className="text-ink-dim text-sm mb-6">Fill the form below and we&apos;ll get back to you within 24 hours.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px]" />

        <div>
          <label htmlFor="name" className="form-label">Full Name <span className="text-error">*</span></label>
          <input id="name" name="name" type="text" className="form-input" placeholder="Your full name..." autoComplete="name" required />
          {errors.name && <p className="form-error">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="company" className="form-label">Company Name</label>
          <input id="company" name="company" type="text" className="form-input" placeholder="Your company (optional)..." autoComplete="organization" />
        </div>

        <div>
          <label htmlFor="phone" className="form-label">Phone Number <span className="text-error">*</span></label>
          <input id="phone" name="phone" type="tel" className="form-input" placeholder="Your phone number..." autoComplete="tel" required />
          {errors.phone && <p className="form-error">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="email" className="form-label">Email Address</label>
          <input id="email" name="email" type="email" className="form-input" placeholder="your@email.com..." autoComplete="email" />
        </div>

        <div>
          <label htmlFor="service" className="form-label">Service Interested In</label>
          <select id="service" name="service" className="form-input">
            <option value="">Select a service...</option>
            {serviceOptions.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="form-label">Message</label>
          <textarea id="message" name="message" rows={4} className="form-input resize-y" placeholder="Tell us about your requirements..." />
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={sending} className="inline-flex items-center gap-2 btn-primary px-6 py-3 text-base font-semibold no-underline disabled:opacity-50">
            <Send size={18} aria-hidden="true" />
            {sending ? "Sending..." : "Send Inquiry"}
          </button>
        </div>
      </form>
    </div>
  );
}
