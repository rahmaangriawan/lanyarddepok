"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal masuk");
      }

      router.push("/kawruh");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Email atau password salah.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/login-bg.webp')" }}
    >
      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/65 to-black/80 z-0 pointer-events-none"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link href="/" className="flex justify-center items-center mb-6">
          <img src="/images/logo.webp" alt="Lanyard Jakarta Logo" className="h-12 w-auto object-contain brightness-0 invert" />
        </Link>
        <h2 className="text-center text-3xl font-extrabold text-white tracking-tight">
          Masuk ke Akun Anda
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl py-8 px-4 sm:rounded-xl sm:px-10">
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-white flex items-center space-x-1.5">
                <Icon icon="lucide:mail" className="h-4 w-4 text-brand-red" />
                <span>Alamat Email</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5"
              />
            </div>

            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-white flex items-center space-x-1.5">
                <Icon icon="lucide:lock" className="h-4 w-4 text-brand-red" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/10 border border-white/20 text-white placeholder-gray-400 text-sm rounded-lg focus:ring-brand-red focus:border-brand-red block w-full p-2.5 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} className="h-5 w-5" />
                </button>
              </div>
            </div>

            {error && (
              <div className="flex p-4 mb-4 text-sm text-red-200 rounded-lg bg-red-950/40 border border-red-800" role="alert">
                <Icon icon="lucide:alert-circle" className="flex-shrink-0 inline w-5 h-5 mr-3 mt-0.5" />
                <div>
                  <span className="font-bold">Gagal:</span> {error}
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full text-white bg-brand-red hover:bg-brand-dark focus:ring-4 focus:ring-red-300 font-bold rounded-lg text-sm px-5 py-3 text-center disabled:opacity-50 cursor-pointer uppercase"
              >
                {loading ? "Memproses..." : "Masuk Akun"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
