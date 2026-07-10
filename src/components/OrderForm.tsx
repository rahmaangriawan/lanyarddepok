"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

interface ValidationErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

type TurnstileConfig = {
  enabled: boolean;
  siteKey: string;
};

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          theme?: "light" | "dark" | "auto";
          callback?: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function OrderForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [success, setSuccess] = useState(false);
  const [turnstileConfig, setTurnstileConfig] = useState<TurnstileConfig>({ enabled: false, siteKey: "" });
  const [turnstileToken, setTurnstileToken] = useState("");
  const [turnstileReady, setTurnstileReady] = useState(false);
  const [turnstileError, setTurnstileError] = useState("");
  const [showTurnstile, setShowTurnstile] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchTurnstileConfig = async () => {
      try {
        const res = await fetch("/api/turnstile-config", { cache: "no-store" });
        const data = await res.json();
        setTurnstileConfig({
          enabled: Boolean(data.enabled && data.siteKey),
          siteKey: typeof data.siteKey === "string" ? data.siteKey : "",
        });
      } catch (err) {
        console.error("Failed to load Turnstile config:", err);
        setTurnstileConfig({ enabled: false, siteKey: "" });
      }
    };

    fetchTurnstileConfig();
  }, []);

  useEffect(() => {
    if (!showTurnstile || !turnstileConfig.enabled || !turnstileConfig.siteKey) return;

    const scriptId = "cloudflare-turnstile-script";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    const renderWidget = () => {
      if (!turnstileRef.current || !window.turnstile || turnstileWidgetIdRef.current) return;

      turnstileWidgetIdRef.current = window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileConfig.siteKey,
        theme: "light",
        callback: (token) => {
          setTurnstileToken(token);
          setTurnstileError("");
        },
        "expired-callback": () => {
          setTurnstileToken("");
          setTurnstileError("Verifikasi keamanan kedaluwarsa. Silakan centang ulang.");
        },
        "error-callback": () => {
          setTurnstileToken("");
          setTurnstileError("Verifikasi keamanan gagal dimuat. Silakan coba ulang.");
        },
      });
      setTurnstileReady(true);
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }

    const script = existingScript || document.createElement("script");
    script.id = scriptId;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = renderWidget;

    if (!existingScript) {
      document.head.appendChild(script);
    }

    return () => {
      if (turnstileWidgetIdRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetIdRef.current);
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [showTurnstile, turnstileConfig.enabled, turnstileConfig.siteKey]);

  const resetTurnstile = () => {
    if (turnstileWidgetIdRef.current && window.turnstile) {
      window.turnstile.reset(turnstileWidgetIdRef.current);
    }
    setTurnstileToken("");
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    // Name validation
    if (!name.trim()) {
      errors.name = "Nama lengkap wajib diisi";
    } else if (name.trim().length < 3) {
      errors.name = "Nama minimal terdiri dari 3 karakter";
    }

    // Email validation
    if (!email.trim()) {
      errors.email = "Alamat email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Format email tidak valid (contoh: nama@email.com)";
    }

    // Phone validation
    if (!phone.trim()) {
      errors.phone = "Nomor telepon / WhatsApp wajib diisi";
    } else if (!/^\d+$/.test(phone.trim())) {
      errors.phone = "Nomor telepon hanya boleh berisi angka";
    } else {
      const cleanPhone = phone.trim();
      if (cleanPhone.length < 8 || cleanPhone.length > 15) {
        errors.phone = "Nomor telepon harus berkisar antara 8 hingga 15 digit";
      }
    }

    // Message validation
    if (!message.trim()) {
      errors.message = "Pesan Anda wajib diisi";
    } else if (message.trim().length < 10) {
      errors.message = "Pesan minimal terdiri dari 10 karakter";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validate form fields first
    if (!validateForm()) {
      return;
    }

    if (turnstileConfig.enabled && !turnstileToken) {
      setShowTurnstile(true);
      setTurnstileError("Silakan selesaikan verifikasi keamanan terlebih dahulu.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, turnstileToken }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim pesan.");
      }

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
      setFieldErrors({});
      resetTurnstile();
      setShowTurnstile(false);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="contact" className="contact-section">
      <div className="contact-section-container">
        <div className="contact-section-grid">
          {/* Contact Details */}
          <div className="contact-section-copy">
            <div>
              <div className="contact-section-kicker">
                <strong>Hubungi Kami</strong>
              </div>
              <h2 className="contact-section-title">
                Ada Pertanyaan?<br />
                Hubungi <span>Kami</span>
              </h2>
              <p className="contact-section-description">
                Butuh bantuan mengenai spesifikasi desain, penawaran harga khusus instansi
                pemerintah/perusahaan skala besar, atau info stok aksesoris? Kirimkan pesan Anda langsung
                di samping.
              </p>
            </div>

            <hr className="contact-section-divider" />

            <div className="contact-section-info-list">
              {/* Alamat Produksi */}
              <div className="contact-section-info-item">
                <div className="contact-section-info-icon">
                  <Icon icon="lucide:map-pin" className="h-5 w-5" />
                </div>
                <div>
                  <h3>Alamat Produksi</h3>
                  <p>
                    Bogor, Indonesia
                  </p>
                </div>
              </div>

              {/* WhatsApp HotLine */}
              <div className="contact-section-info-item">
                <div className="contact-section-info-icon">
                  <Icon icon="lucide:phone" className="h-5 w-5" />
                </div>
                <div>
                  <h3>WhatsApp HotLine</h3>
                  <a
                    href="https://wa.me/6282210200700"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-section-info-link contact-section-info-link-strong"
                  >
                    +62 822-1020-0700
                  </a>
                </div>
              </div>

              {/* Email Support */}
              <div className="contact-section-info-item">
                <div className="contact-section-info-icon">
                  <Icon icon="lucide:mail" className="h-5 w-5" />
                </div>
                <div>
                  <h3>Email Support</h3>
                  <a
                    href="mailto:info@lanyarddepok.com"
                    className="contact-section-info-link"
                  >
                    info@lanyarddepok.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="contact-section-form-panel">
            <form onSubmit={handleSubmit} className="contact-section-form" noValidate>
              <div className="contact-section-form-grid">
                <div>
                  <label htmlFor="inquiryName" className="contact-section-label">
                    Nama Lengkap
                  </label>
                  <input
                    id="inquiryName"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Masukkan nama Anda..."
                    className={`contact-section-input ${
                      fieldErrors.name ? "contact-section-input-error" : ""
                    }`}
                  />
                  {fieldErrors.name && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center space-x-1">
                      <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.name}</span>
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="inquiryEmail" className="contact-section-label">
                    Alamat Email
                  </label>
                  <input
                    id="inquiryEmail"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="nama@email.com..."
                    className={`contact-section-input ${
                      fieldErrors.email ? "contact-section-input-error" : ""
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center space-x-1">
                      <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="inquiryPhone" className="contact-section-label">
                  Nomor Telepon / WhatsApp (Aktif)
                </label>
                <input
                  id="inquiryPhone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={15}
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, ""));
                    if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                  }}
                  placeholder="Contoh: 0812XXXXXXXX..."
                  className={`contact-section-input ${
                    fieldErrors.phone ? "contact-section-input-error" : ""
                  }`}
                />
                {fieldErrors.phone && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center space-x-1">
                    <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="inquiryMessage" className="contact-section-label">
                  Pesan Anda
                </label>
                <textarea
                  id="inquiryMessage"
                  rows={5}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (fieldErrors.message) setFieldErrors((prev) => ({ ...prev, message: undefined }));
                  }}
                  placeholder="Ketik detail pertanyaan Anda..."
                  className={`contact-section-input contact-section-textarea ${
                    fieldErrors.message ? "contact-section-input-error" : ""
                  }`}
                />
                {fieldErrors.message && (
                  <p className="mt-1.5 text-xs font-semibold text-red-500 flex items-center space-x-1">
                    <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5 shrink-0" />
                    <span>{fieldErrors.message}</span>
                  </p>
                )}
              </div>

              {error && (
                <div className="flex p-4 text-xs font-semibold text-red-800 rounded-xl bg-red-50 border border-red-150" role="alert">
                  <Icon icon="lucide:alert-triangle" className="flex-shrink-0 inline w-4.5 h-4.5 mr-2.5 mt-0.5" />
                  <div>
                    <span className="font-bold">Gagal mengirim:</span> {error}
                  </div>
                </div>
              )}

              {success && (
                <div className="flex p-4 text-xs font-semibold text-green-800 rounded-xl bg-green-50 border border-green-150" role="alert">
                  <Icon icon="lucide:check-circle-2" className="flex-shrink-0 inline w-4.5 h-4.5 mr-2.5 mt-0.5" />
                  <div>
                    <span className="font-bold">Pesan Terkirim!</span> Tim Lanyard Bogor akan segera menghubungi Anda melalui nomor telepon / WhatsApp yang dicantumkan. Terima kasih.
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="contact-section-submit"
              >
                <Icon icon="lucide:send" className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                <span>{loading ? "Mengirim..." : "Kirim Pertanyaan"}</span>
              </button>

              {turnstileConfig.enabled && showTurnstile && (
                <div className="space-y-2">
                  <div ref={turnstileRef} className="min-h-[65px]" />
                  {!turnstileReady && (
                    <p className="text-xs font-semibold text-gray-400">Memuat verifikasi keamanan...</p>
                  )}
                  {turnstileError && (
                    <p className="text-xs font-semibold text-red-500 flex items-center space-x-1">
                      <Icon icon="lucide:alert-circle" className="h-3.5 w-3.5 shrink-0" />
                      <span>{turnstileError}</span>
                    </p>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
