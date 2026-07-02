"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react";

type ValidationErrors = {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
};

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
        },
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const inputBase =
  "min-h-12 w-full rounded-xl border border-public-border bg-white px-4 text-sm font-semibold text-[#111827] outline-none transition-colors placeholder:text-[#94a3b8] focus:border-public-amber focus:ring-4 focus:ring-public-amber/20";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<ValidationErrors>({});
  const [turnstileConfig, setTurnstileConfig] = useState<TurnstileConfig>({
    enabled: false,
    siteKey: "",
  });
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
    if (!showTurnstile || !turnstileConfig.enabled || !turnstileConfig.siteKey) {
      return;
    }

    const scriptId = "cloudflare-turnstile-script";
    const existingScript = document.getElementById(
      scriptId,
    ) as HTMLScriptElement | null;

    const renderWidget = () => {
      if (!turnstileRef.current || !window.turnstile || turnstileWidgetIdRef.current) {
        return;
      }

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

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!name.trim()) {
      errors.name = "Nama lengkap wajib diisi";
    } else if (name.trim().length < 3) {
      errors.name = "Nama minimal terdiri dari 3 karakter";
    }

    if (!phone.trim()) {
      errors.phone = "Nomor WhatsApp wajib diisi";
    } else if (!/^\d+$/.test(phone.trim())) {
      errors.phone = "Nomor WhatsApp hanya boleh berisi angka";
    } else if (phone.trim().length < 8 || phone.trim().length > 15) {
      errors.phone = "Nomor WhatsApp harus berkisar antara 8 hingga 15 digit";
    }

    if (!email.trim()) {
      errors.email = "Alamat email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Format email tidak valid";
    }

    if (!message.trim()) {
      errors.message = "Pesan atau kebutuhan wajib diisi";
    } else if (message.trim().length < 10) {
      errors.message = "Pesan minimal terdiri dari 10 karakter";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    if (turnstileConfig.enabled && !turnstileToken) {
      setShowTurnstile(true);
      setTurnstileError("Silakan selesaikan verifikasi keamanan terlebih dahulu.");
      return;
    }

    setLoading(true);

    const mergedMessage = company.trim()
      ? `Perusahaan / Instansi: ${company.trim()}\n\n${message.trim()}`
      : message.trim();

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          message: mergedMessage,
          turnstileToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengirim pesan.");
      }

      setSuccess(true);
      setName("");
      setPhone("");
      setEmail("");
      setCompany("");
      setMessage("");
      setFieldErrors({});
      resetTurnstile();
      setShowTurnstile(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan. Silakan coba lagi.");
      resetTurnstile();
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-public-border bg-white p-6 shadow-xs sm:p-8">
      <h2 className="text-2xl font-extrabold text-[#111827]">Kirim Pesan</h2>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[#64748b]">
        Sampaikan kebutuhan Anda dan tim kami akan segera menghubungi Anda
        kembali.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <FieldError error={fieldErrors.name}>
            <input
              type="text"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (fieldErrors.name) {
                  setFieldErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="Nama Lengkap"
              className={`${inputBase} ${fieldErrors.name ? "border-red-300" : ""}`}
              autoComplete="name"
            />
          </FieldError>

          <FieldError error={fieldErrors.phone}>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={15}
              value={phone}
              onChange={(event) => {
                setPhone(event.target.value.replace(/\D/g, ""));
                if (fieldErrors.phone) {
                  setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                }
              }}
              placeholder="No. WhatsApp"
              className={`${inputBase} ${fieldErrors.phone ? "border-red-300" : ""}`}
              autoComplete="tel"
            />
          </FieldError>
        </div>

        <FieldError error={fieldErrors.email}>
          <input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (fieldErrors.email) {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            placeholder="Email"
            className={`${inputBase} ${fieldErrors.email ? "border-red-300" : ""}`}
            autoComplete="email"
          />
        </FieldError>

        <input
          type="text"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          placeholder="Perusahaan / Instansi (Opsional)"
          className={inputBase}
          autoComplete="organization"
        />

        <FieldError error={fieldErrors.message}>
          <textarea
            rows={6}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              if (fieldErrors.message) {
                setFieldErrors((prev) => ({ ...prev, message: undefined }));
              }
            }}
            placeholder="Pesan / Kebutuhan Anda"
            className={`${inputBase} min-h-36 resize-none py-4 ${fieldErrors.message ? "border-red-300" : ""}`}
          />
        </FieldError>

        <div className="flex items-start gap-3 py-2 text-sm leading-6 text-[#64748b]">
          <Icon icon="lucide:shield-check" className="mt-0.5 h-6 w-6 shrink-0 text-[#64748b]" />
          <p>Data Anda aman bersama kami dan tidak akan kami bagikan ke pihak lain.</p>
        </div>

        {error && (
          <div
            className="flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-semibold text-red-700"
            role="alert"
          >
            <Icon icon="lucide:alert-triangle" className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div
            className="flex gap-3 rounded-xl border border-green-100 bg-green-50 p-4 text-sm font-semibold text-green-700"
            role="alert"
          >
            <Icon icon="lucide:check-circle-2" className="mt-0.5 h-5 w-5 shrink-0" />
            <span>Pesan terkirim. Tim Lanyard Bogor akan segera menghubungi Anda.</span>
          </div>
        )}

        {turnstileConfig.enabled && showTurnstile && (
          <div className="space-y-2">
            <div ref={turnstileRef} className="min-h-[65px]" />
            {!turnstileReady && (
              <p className="text-xs font-semibold text-[#64748b]">
                Memuat verifikasi keamanan...
              </p>
            )}
            {turnstileError && (
              <p className="flex items-center gap-2 text-xs font-semibold text-red-500">
                <Icon icon="lucide:alert-circle" className="h-4 w-4 shrink-0" />
                <span>{turnstileError}</span>
              </p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center rounded-xl bg-public-amber px-6 text-sm font-extrabold text-[#111827] transition-colors hover:bg-public-amber-strong hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-public-amber/30 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Mengirim..." : "Kirim Pesan"}
        </button>
      </form>
    </section>
  );
}

function FieldError({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-500">
          <Icon icon="lucide:alert-circle" className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
}
