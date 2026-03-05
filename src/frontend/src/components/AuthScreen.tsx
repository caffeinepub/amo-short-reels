import { Button } from "@/components/ui/button";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Play, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function AuthScreen() {
  const { login, isLoggingIn } = useInternetIdentity();

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

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center gap-8 px-8 max-w-sm w-full"
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
            Apna talent share karo, duniya dekhegi. India ka best short video
            platform.
          </p>
        </motion.div>

        {/* Features list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full space-y-3"
        >
          {[
            "🎬 Short reels banao aur share karo",
            "🔥 Trending content dekho",
            "💫 Apne favorite creators ko follow karo",
          ].map((feature) => (
            <div
              key={feature}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "oklch(0.12 0 0)" }}
            >
              <span className="text-sm text-white/80">{feature}</span>
            </div>
          ))}
        </motion.div>

        {/* Login button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full"
        >
          <Button
            className="w-full h-14 text-lg font-bold rounded-2xl text-white border-0 shadow-glow"
            style={{ background: "var(--amo-gradient)" }}
            onClick={login}
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Connecting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Login / Sign Up
              </span>
            )}
          </Button>
          <p
            className="text-xs text-center mt-3"
            style={{ color: "oklch(0.40 0 0)" }}
          >
            Internet Identity se secure login
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
