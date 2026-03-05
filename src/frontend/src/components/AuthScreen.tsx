import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { ArrowLeft, Play, Shield, Sparkles, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type LoginView = "main" | "info";

export default function AuthScreen() {
  const { login, isLoggingIn } = useInternetIdentity();
  const [view, setView] = useState<LoginView>("main");

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "oklch(0.07 0 0)" }}
    >
      {/* Gradient orbs background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -left-20 w-72 h-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "oklch(0.65 0.28 290)" }}
        />
        <div
          className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full opacity-30 blur-3xl"
          style={{ background: "oklch(0.72 0.28 335)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15 blur-3xl"
          style={{ background: "oklch(0.78 0.22 30)" }}
        />
      </div>

      <AnimatePresence mode="wait">
        {view === "main" ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center gap-6 px-8 max-w-sm w-full"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center amo-gradient shadow-glow-lg">
                <Play className="w-10 h-10 text-white fill-white" />
              </div>
              <h1 className="text-6xl font-display font-black tracking-tight amo-gradient-text">
                AMO
              </h1>
              <p
                className="text-sm text-center"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                SHORT REELS
              </p>
            </motion.div>

            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                Create. Share. Go Viral.
              </h2>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "oklch(0.55 0 0)" }}
              >
                Apna talent share karo, duniya dekhegi.
              </p>
            </motion.div>

            {/* Main Login Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="w-full space-y-4"
            >
              {/* Secure login info box */}
              <div
                className="rounded-2xl p-4 border flex items-start gap-3"
                style={{
                  background: "oklch(0.12 0.04 290 / 0.5)",
                  borderColor: "oklch(0.30 0.10 290 / 0.4)",
                }}
              >
                <Shield
                  className="w-5 h-5 mt-0.5 flex-shrink-0"
                  style={{ color: "oklch(0.72 0.20 290)" }}
                />
                <div>
                  <p
                    className="text-sm font-semibold mb-0.5"
                    style={{ color: "oklch(0.85 0.08 290)" }}
                  >
                    AMO pe securely login karo
                  </p>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.55 0 0)" }}
                  >
                    Koi password zaroori nahi — secure &amp; fast login sirf ek
                    click mein.
                  </p>
                </div>
              </div>

              {/* PRIMARY: Internet Identity Login */}
              <Button
                data-ocid="auth.internet_identity.button"
                className="w-full h-16 text-lg font-black rounded-2xl text-white border-0 transition-all active:scale-95"
                style={{
                  background: "var(--amo-gradient)",
                  boxShadow:
                    "0 0 40px oklch(0.65 0.28 290 / 0.5), 0 4px 20px rgba(0,0,0,0.4)",
                }}
                onClick={login}
                disabled={isLoggingIn}
              >
                {isLoggingIn ? (
                  <span className="flex items-center gap-3">
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Login ho raha hai...
                  </span>
                ) : (
                  <span className="flex items-center gap-3">
                    <Sparkles className="w-6 h-6" />
                    AMO mein Login karo
                    <Zap className="w-5 h-5 opacity-80" />
                  </span>
                )}
              </Button>

              {/* Feature badges row */}
              <div className="flex items-center justify-center gap-3">
                <span
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    color: "oklch(0.65 0.15 290)",
                    borderColor: "oklch(0.25 0.08 290 / 0.5)",
                    background: "oklch(0.12 0.04 290 / 0.3)",
                  }}
                >
                  ⚡ Instant
                </span>
                <span
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    color: "oklch(0.65 0.15 335)",
                    borderColor: "oklch(0.25 0.08 335 / 0.5)",
                    background: "oklch(0.12 0.04 335 / 0.3)",
                  }}
                >
                  🔒 Secure
                </span>
                <span
                  className="text-xs px-3 py-1 rounded-full border"
                  style={{
                    color: "oklch(0.65 0.15 30)",
                    borderColor: "oklch(0.25 0.08 30 / 0.5)",
                    background: "oklch(0.12 0.04 30 / 0.3)",
                  }}
                >
                  ✓ Free
                </span>
              </div>

              {/* Learn more link */}
              <button
                type="button"
                data-ocid="auth.learn_more.button"
                className="w-full text-sm text-center underline underline-offset-4 py-1 transition-opacity hover:opacity-70"
                style={{ color: "oklch(0.50 0 0)" }}
                onClick={() => setView("info")}
              >
                Login kaise kaam karta hai? Janiye →
              </button>
            </motion.div>

            <p
              className="text-xs text-center"
              style={{ color: "oklch(0.30 0 0)" }}
            >
              Login karke aap hamare Terms &amp; Privacy Policy se agree karte
              hain
            </p>
          </motion.div>
        ) : (
          /* Info View */
          <motion.div
            key="info"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 flex flex-col gap-6 px-8 max-w-sm w-full"
          >
            {/* Back button */}
            <button
              type="button"
              data-ocid="auth.info.back_button"
              className="flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
              style={{ color: "oklch(0.55 0 0)" }}
              onClick={() => setView("main")}
            >
              <ArrowLeft className="w-4 h-4" />
              Wapas jao
            </button>

            <div className="flex flex-col items-center gap-3 text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "oklch(0.13 0 0)" }}
              >
                <Shield
                  className="w-8 h-8"
                  style={{ color: "oklch(0.72 0.20 290)" }}
                />
              </div>
              <h2 className="text-2xl font-display font-bold text-white">
                AMO Login Kaise Kare?
              </h2>
            </div>

            <div className="space-y-3">
              {[
                {
                  step: "1",
                  title: "Button dabao",
                  desc: '"AMO mein Login karo" button click karo',
                },
                {
                  step: "2",
                  title: "Browser popup aayega",
                  desc: "Ek secure popup window khulegi Internet Identity ke liye",
                },
                {
                  step: "3",
                  title: "Approve karo",
                  desc: "Apna device passcode, fingerprint ya Face ID use karo",
                },
                {
                  step: "4",
                  title: "Ho gaya!",
                  desc: "Aap AMO mein logged in ho jayenge — koi password nahi",
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex items-start gap-4 p-4 rounded-2xl border"
                  style={{
                    background: "oklch(0.10 0 0)",
                    borderColor: "oklch(0.18 0 0)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-black text-white"
                    style={{ background: "var(--amo-gradient)" }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {item.title}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "oklch(0.50 0 0)" }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              data-ocid="auth.info.login.button"
              className="w-full h-14 text-base font-black rounded-2xl text-white border-0 transition-all active:scale-95"
              style={{
                background: "var(--amo-gradient)",
                boxShadow: "0 0 30px oklch(0.65 0.28 290 / 0.4)",
              }}
              onClick={login}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Login ho raha hai...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Abhi Login karo
                </span>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
