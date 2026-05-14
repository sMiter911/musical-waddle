"use client";

import { useState } from "react";
import SectionHeading from "@/components/ui/SectionHeading";
import { Mail, Phone, MapPin, Send, CheckCircle, AlertCircle } from "lucide-react";

type FormState = "idle" | "submitting" | "success" | "error";

export default function ContactPage() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name:    (form.elements.namedItem("name")    as HTMLInputElement).value,
      email:   (form.elements.namedItem("email")   as HTMLInputElement).value,
      phone:   (form.elements.namedItem("phone")   as HTMLInputElement).value,
      subject: (form.elements.namedItem("subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value,
      _hp:     (form.elements.namedItem("_hp")     as HTMLInputElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? "Something went wrong. Please try again.");
      }

      setState("success");
    } catch (err: any) {
      setErrorMsg(err.message ?? "Failed to send message.");
      setState("error");
    }
  }

  return (
    <main>
      <section className="section mt-12">
        <div className="container">
          <SectionHeading title="Get In Touch" subtitle="Have questions or want to learn more? Reach out to our team." />

          <div className="grid lg:grid-cols-3 gap-12 mt-12">
            {/* Contact info */}
            <div className="lg:col-span-1 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Main Office</h4>
                  <p className="text-gray-600">P.O. Box 1000, Manzini<br />Eswatini</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Phone</h4>
                  <p className="text-gray-600">+268 2505 0000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Email</h4>
                  <p className="text-gray-600">info@pudemo.org</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-2 card p-8 md:p-12">
              {state === "success" ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                  <CheckCircle size={48} className="text-green-600" />
                  <h3 className="text-xl font-bold">Message Sent</h3>
                  <p className="text-gray-500 max-w-sm">
                    Thank you for reaching out. Our team will review your message and get back to you soon.
                  </p>
                  <button
                    className="btn btn-primary mt-4"
                    onClick={() => setState("idle")}
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Honeypot — hidden from real users */}
                  <input
                    type="text"
                    name="_hp"
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0 }}
                    aria-hidden="true"
                  />

                  <div>
                    <label className="form-label" htmlFor="name">Full Name *</label>
                    <input
                      type="text" id="name" name="name"
                      className="form-input" placeholder="Jane Doe"
                      required minLength={2} maxLength={120}
                      disabled={state === "submitting"}
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="email">Email Address *</label>
                    <input
                      type="email" id="email" name="email"
                      className="form-input" placeholder="jane@example.com"
                      required
                      disabled={state === "submitting"}
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="phone">Phone (optional)</label>
                    <input
                      type="tel" id="phone" name="phone"
                      className="form-input" placeholder="+268 7600 0000"
                      maxLength={30}
                      disabled={state === "submitting"}
                    />
                  </div>

                  <div>
                    <label className="form-label" htmlFor="subject">Subject *</label>
                    <input
                      type="text" id="subject" name="subject"
                      className="form-input" placeholder="How can we help?"
                      required minLength={2} maxLength={200}
                      disabled={state === "submitting"}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="form-label" htmlFor="message">Message *</label>
                    <textarea
                      id="message" name="message"
                      className="form-input form-textarea"
                      placeholder="Your message here…"
                      required minLength={10} maxLength={5000}
                      disabled={state === "submitting"}
                    />
                  </div>

                  {state === "error" && (
                    <div className="md:col-span-2 flex items-center gap-2 text-red-600 text-sm font-medium">
                      <AlertCircle size={16} />
                      {errorMsg}
                    </div>
                  )}

                  <div className="md:col-span-2 text-right">
                    <button
                      type="submit"
                      className="btn btn-primary btn-lg w-full md:w-auto"
                      disabled={state === "submitting"}
                    >
                      <Send size={18} className="mr-2" />
                      {state === "submitting" ? "Sending…" : "Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="h-[400px] w-full bg-gray-200 flex items-center justify-center text-gray-400">
        [Interactive Map Placeholder]
      </div>
    </main>
  );
}
