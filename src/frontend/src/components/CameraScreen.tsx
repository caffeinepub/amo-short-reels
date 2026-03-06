import { useCamera } from "@/camera/useCamera";
import {
  ChevronDown,
  FlipHorizontal,
  Gauge,
  Grid3x3,
  Image,
  Mic,
  MicOff,
  Music,
  Play,
  RefreshCw,
  Sparkles,
  Timer,
  Upload,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

type Screen = "home" | "discover" | "create" | "notifications" | "profile";

interface CameraScreenProps {
  onClose: () => void;
  onNavigate: (screen: Screen) => void;
}

type Flash = "off" | "on" | "auto";
type Speed = "0.3x" | "0.5x" | "1x" | "2x" | "3x";
type Duration = 15 | 30 | 60;
type AppMode = "camera" | "preview";

export default function CameraScreen({ onClose }: CameraScreenProps) {
  const cam = useCamera("environment");

  const [flash, setFlash] = useState<Flash>("off");
  const [beauty, setBeauty] = useState(false);
  const [timer, setTimer] = useState<0 | 3 | 10>(0);
  const [showGrid, setShowGrid] = useState(false);
  const [speed, setSpeed] = useState<Speed>("1x");
  const [showSpeed, setShowSpeed] = useState(false);
  const [duration, setDuration] = useState<Duration>(15);
  const [micMuted, setMicMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordTime, setRecordTime] = useState(0);
  const [appMode, setAppMode] = useState<AppMode>("camera");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start camera on mount
  // biome-ignore lint/correctness/useExhaustiveDependencies: start once
  useEffect(() => {
    cam.start();
    return () => cam.stop();
  }, []);

  // Auto-retry when tab becomes visible again (after permission grant in settings)
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible" && cam.state !== "active") {
        setTimeout(() => cam.retry(), 400);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [cam.state, cam.retry]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordTimerRef.current = setInterval(() => {
        setRecordTime((t) => {
          const next = t + 0.1;
          setRecordProgress((next / duration) * 100);
          if (next >= duration) stopRecording();
          return next;
        });
      }, 100);
    } else {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    }
    return () => {
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [isRecording, duration]);

  const startRecording = useCallback(() => {
    setIsRecording(true);
    setRecordProgress(0);
    setRecordTime(0);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    setAppMode("preview");
  }, []);

  const handleGalleryOpen = useCallback(
    () => fileInputRef.current?.click(),
    [],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setPreviewUrl(URL.createObjectURL(file));
        setAppMode("preview");
      }
    },
    [],
  );

  const FlashIcon = flash === "on" ? Zap : flash === "auto" ? Zap : ZapOff;
  const isActive = cam.state === "active";
  const isRequesting = cam.state === "requesting";
  const isDenied = cam.state === "denied";
  const isUnavailable = cam.state === "unavailable" || cam.state === "error";

  if (appMode === "preview") {
    return (
      <UploadScreen
        previewUrl={previewUrl}
        caption={caption}
        setCaption={setCaption}
        hashtags={hashtags}
        setHashtags={setHashtags}
        onBack={() => {
          setAppMode("camera");
          setPreviewUrl(null);
        }}
        onClose={onClose}
      />
    );
  }

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col"
      style={{ background: "oklch(0.00 0 0)" }}
    >
      {/* ── Viewfinder ── */}
      <div className="absolute inset-0">
        {/* Video element — always in DOM so ref is always ready */}
        <video
          ref={cam.videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{
            display: isActive ? "block" : "none",
            transform: cam.facing === "user" ? "scaleX(-1)" : "none",
          }}
        />

        {/* Overlay states when camera is not active */}
        {!isActive && (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-4 px-5"
            style={{ background: "oklch(0.07 0 0)" }}
          >
            {isRequesting && (
              <>
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-white/50 text-sm">
                  Camera shuru ho raha hai...
                </p>
              </>
            )}

            {isDenied && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xs rounded-3xl p-6 flex flex-col items-center gap-4"
                style={{
                  background: "oklch(0.12 0 0)",
                  border: "1px solid oklch(0.22 0 0)",
                }}
                data-ocid="camera.error_state"
              >
                {/* Gallery — primary action */}
                <motion.button
                  type="button"
                  data-ocid="camera.gallery_upload_button"
                  onClick={handleGalleryOpen}
                  whileTap={{ scale: 0.96 }}
                  animate={{
                    boxShadow: [
                      "0 0 0px 0px oklch(0.55 0.22 145 / 0)",
                      "0 0 22px 8px oklch(0.55 0.22 145 / 0.45)",
                      "0 0 0px 0px oklch(0.55 0.22 145 / 0)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2.4,
                      repeat: Number.POSITIVE_INFINITY,
                    },
                  }}
                  className="w-full h-14 rounded-2xl font-bold text-white flex items-center justify-center gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.22 145), oklch(0.45 0.20 165))",
                  }}
                >
                  <Image className="w-5 h-5" />
                  Gallery se Video Upload Karo
                </motion.button>

                <div
                  className="flex items-center gap-3 w-full"
                  style={{ color: "oklch(0.30 0 0)" }}
                >
                  <div
                    className="flex-1 h-px"
                    style={{ background: "oklch(0.22 0 0)" }}
                  />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">
                    ya phir
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: "oklch(0.22 0 0)" }}
                  />
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-white text-sm mb-1">
                    Camera Permission Chahiye
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.50 0 0)" }}
                  >
                    Browser ne camera block kar rakha hai. Neeche diye steps
                    follow karo:
                  </p>
                </div>

                <div
                  className="w-full rounded-2xl p-4 space-y-3"
                  style={{ background: "oklch(0.09 0 0)" }}
                >
                  {[
                    "Browser address bar mein Lock icon tap karo",
                    "Permissions ya Site Settings mein jao",
                    'Camera ko "Allow" par set karo',
                    "Wapas aa ke Retry button dabao",
                  ].map((text, i) => (
                    <div key={text} className="flex items-start gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: "var(--amo-gradient)" }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {text}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  data-ocid="camera.retry_button"
                  onClick={() => cam.retry()}
                  className="w-full h-12 rounded-2xl font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: "var(--amo-gradient)" }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry — Camera Dobara Kholne Ki Koshish
                </button>
              </motion.div>
            )}

            {isUnavailable && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xs rounded-3xl p-6 flex flex-col items-center gap-4"
                style={{
                  background: "oklch(0.12 0 0)",
                  border: "1px solid oklch(0.22 0 0)",
                }}
                data-ocid="camera.error_state"
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: "oklch(0.62 0.26 25 / 0.15)",
                    border: "1px solid oklch(0.62 0.26 25 / 0.4)",
                  }}
                >
                  <X
                    className="w-6 h-6"
                    style={{ color: "oklch(0.72 0.22 25)" }}
                  />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-sm mb-1">
                    Camera Nahi Mila
                  </h3>
                  <p className="text-xs" style={{ color: "oklch(0.50 0 0)" }}>
                    Device mein camera detect nahi hua. Gallery se upload
                    karein.
                  </p>
                </div>
                <motion.button
                  type="button"
                  data-ocid="camera.gallery_upload_button"
                  onClick={handleGalleryOpen}
                  whileTap={{ scale: 0.96 }}
                  animate={{
                    boxShadow: [
                      "0 0 0px 0px oklch(0.55 0.22 145 / 0)",
                      "0 0 20px 6px oklch(0.55 0.22 145 / 0.4)",
                      "0 0 0px 0px oklch(0.55 0.22 145 / 0)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2.4,
                      repeat: Number.POSITIVE_INFINITY,
                    },
                  }}
                  className="w-full h-14 rounded-2xl font-bold text-white flex items-center justify-center gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.22 145), oklch(0.45 0.20 165))",
                  }}
                >
                  <Image className="w-5 h-5" />
                  Gallery se Video Upload Karo
                </motion.button>
              </motion.div>
            )}
          </div>
        )}

        {/* Grid overlay */}
        {showGrid && isActive && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.3 }}
          >
            <svg
              aria-hidden="true"
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <line
                x1="33.33"
                y1="0"
                x2="33.33"
                y2="100"
                stroke="white"
                strokeWidth="0.3"
              />
              <line
                x1="66.66"
                y1="0"
                x2="66.66"
                y2="100"
                stroke="white"
                strokeWidth="0.3"
              />
              <line
                x1="0"
                y1="33.33"
                x2="100"
                y2="33.33"
                stroke="white"
                strokeWidth="0.3"
              />
              <line
                x1="0"
                y1="66.66"
                x2="100"
                y2="66.66"
                stroke="white"
                strokeWidth="0.3"
              />
            </svg>
          </div>
        )}

        {/* Recording progress bar */}
        {isRecording && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: "var(--amo-gradient)",
                  width: `${recordProgress}%`,
                }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-white text-sm font-bold tabular-nums">
                {Math.floor(recordTime).toString().padStart(2, "0")}:
                {Math.round((recordTime % 1) * 10)}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-12 pb-3">
        <button
          type="button"
          data-ocid="camera.close_button"
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.10 0 0 / 0.75)" }}
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-3">
          {/* Flash */}
          <button
            type="button"
            data-ocid="camera.flash_toggle"
            onClick={() =>
              setFlash((f) =>
                f === "off" ? "on" : f === "on" ? "auto" : "off",
              )
            }
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background:
                flash !== "off"
                  ? "oklch(0.78 0.22 60 / 0.25)"
                  : "oklch(0.10 0 0 / 0.75)",
              border:
                flash !== "off"
                  ? "1px solid oklch(0.78 0.22 60 / 0.5)"
                  : "1px solid transparent",
            }}
          >
            <FlashIcon
              className="w-5 h-5"
              style={{
                color: flash !== "off" ? "oklch(0.88 0.22 60)" : "white",
              }}
            />
            {flash === "auto" && (
              <span
                className="absolute text-[7px] font-bold"
                style={{ color: "oklch(0.88 0.22 60)" }}
              >
                A
              </span>
            )}
          </button>

          {/* Beauty */}
          <button
            type="button"
            data-ocid="camera.beauty_toggle"
            onClick={() => setBeauty((b) => !b)}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background: beauty
                ? "oklch(0.72 0.28 335 / 0.25)"
                : "oklch(0.10 0 0 / 0.75)",
              border: beauty
                ? "1px solid oklch(0.72 0.28 335 / 0.5)"
                : "1px solid transparent",
            }}
          >
            <Sparkles
              className="w-5 h-5"
              style={{ color: beauty ? "oklch(0.82 0.28 335)" : "white" }}
            />
          </button>

          {/* Timer */}
          <button
            type="button"
            data-ocid="camera.timer_toggle"
            onClick={() => setTimer((t) => (t === 0 ? 3 : t === 3 ? 10 : 0))}
            className="w-10 h-10 rounded-full flex items-center justify-center relative active:scale-90 transition-transform"
            style={{
              background:
                timer !== 0
                  ? "oklch(0.65 0.28 290 / 0.25)"
                  : "oklch(0.10 0 0 / 0.75)",
              border:
                timer !== 0
                  ? "1px solid oklch(0.65 0.28 290 / 0.5)"
                  : "1px solid transparent",
            }}
          >
            <Timer
              className="w-5 h-5"
              style={{ color: timer !== 0 ? "oklch(0.75 0.28 290)" : "white" }}
            />
            {timer !== 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                style={{ background: "var(--amo-gradient)" }}
              >
                {timer}
              </span>
            )}
          </button>

          {/* Grid */}
          <button
            type="button"
            data-ocid="camera.grid_toggle"
            onClick={() => setShowGrid((g) => !g)}
            className="w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background: showGrid
                ? "oklch(0.50 0.20 200 / 0.25)"
                : "oklch(0.10 0 0 / 0.75)",
              border: showGrid
                ? "1px solid oklch(0.60 0.20 200 / 0.5)"
                : "1px solid transparent",
            }}
          >
            <Grid3x3
              className="w-5 h-5"
              style={{ color: showGrid ? "oklch(0.70 0.20 200)" : "white" }}
            />
          </button>
        </div>
      </div>

      {/* ── Right side strip ── */}
      <div className="absolute right-3 top-1/4 z-10 flex flex-col items-center gap-4">
        {/* Flip */}
        <button
          type="button"
          data-ocid="camera.flip_button"
          onClick={() => cam.flip()}
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "oklch(0.10 0 0 / 0.75)" }}
        >
          <FlipHorizontal className="w-5 h-5 text-white" />
        </button>

        {/* Speed */}
        <div className="relative">
          <button
            type="button"
            data-ocid="camera.speed_select"
            onClick={() => setShowSpeed((s) => !s)}
            className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{
              background:
                speed !== "1x"
                  ? "oklch(0.65 0.28 290 / 0.35)"
                  : "oklch(0.10 0 0 / 0.75)",
              border:
                speed !== "1x"
                  ? "1px solid oklch(0.65 0.28 290 / 0.5)"
                  : "1px solid transparent",
            }}
          >
            <span
              className="text-xs font-bold"
              style={{
                color: speed !== "1x" ? "oklch(0.75 0.28 290)" : "white",
              }}
            >
              {speed}
            </span>
          </button>
          <AnimatePresence>
            {showSpeed && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute right-14 top-0 flex flex-col rounded-2xl overflow-hidden shadow-xl"
                style={{ background: "oklch(0.15 0 0)" }}
              >
                {(["0.3x", "0.5x", "1x", "2x", "3x"] as Speed[]).map((s) => (
                  <button
                    type="button"
                    key={s}
                    onClick={() => {
                      setSpeed(s);
                      setShowSpeed(false);
                    }}
                    className="px-5 py-2.5 text-sm font-semibold hover:bg-white/5 transition-colors"
                    style={{
                      color: speed === s ? "oklch(0.72 0.28 335)" : "white",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Filters */}
        <button
          type="button"
          data-ocid="camera.filter_button"
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "oklch(0.10 0 0 / 0.75)" }}
        >
          <Gauge className="w-5 h-5 text-white" />
        </button>

        {/* Music */}
        <button
          type="button"
          data-ocid="camera.music_button"
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "oklch(0.10 0 0 / 0.75)" }}
        >
          <Music className="w-5 h-5 text-white" />
        </button>

        {/* Gallery side button */}
        <button
          type="button"
          data-ocid="camera.gallery_button"
          onClick={handleGalleryOpen}
          className="w-11 h-11 rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ background: "oklch(0.10 0 0 / 0.75)" }}
        >
          <Image className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* ── Bottom controls ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-8 px-4">
        {/* Duration tabs */}
        <div className="flex justify-center mb-6">
          <div
            className="flex rounded-full overflow-hidden p-0.5"
            style={{ background: "oklch(0.12 0 0 / 0.85)" }}
          >
            {([15, 30, 60] as Duration[]).map((d) => (
              <button
                type="button"
                key={d}
                data-ocid={`camera.duration_${d}_tab`}
                onClick={() => setDuration(d)}
                className="px-5 py-2 text-sm font-bold transition-all duration-200 rounded-full"
                style={{
                  color: duration === d ? "white" : "oklch(0.45 0 0)",
                  background:
                    duration === d ? "var(--amo-gradient)" : "transparent",
                }}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* Record row */}
        <div className="flex items-center justify-center gap-8">
          {/* Flip (bottom) */}
          <button
            type="button"
            data-ocid="camera.flip_bottom_button"
            onClick={() => cam.flip()}
            className="w-12 h-12 rounded-full flex items-center justify-center active:scale-90 transition-transform"
            style={{ background: "oklch(0.15 0 0 / 0.85)" }}
          >
            <FlipHorizontal className="w-6 h-6 text-white" />
          </button>

          {/* Record button */}
          <div className="relative flex flex-col items-center">
            {!isActive && !isRecording && (
              <div
                className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold text-white"
                style={{ background: "oklch(0.62 0.26 25 / 0.9)" }}
                data-ocid="camera.record_button.error_state"
              >
                {isDenied ? "Camera permission do" : "Camera unavailable"}
              </div>
            )}

            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border-4"
              style={{
                borderColor: isRecording
                  ? "oklch(0.62 0.26 25 / 0.8)"
                  : isActive
                    ? "oklch(1.00 0 0 / 0.35)"
                    : "oklch(0.28 0 0 / 0.5)",
              }}
            >
              <motion.button
                type="button"
                data-ocid="camera.record_button"
                whileTap={isActive ? { scale: 0.88 } : {}}
                onClick={
                  isRecording
                    ? stopRecording
                    : isActive
                      ? startRecording
                      : undefined
                }
                disabled={!isActive && !isRecording}
                className="w-14 h-14 rounded-full transition-all duration-200"
                style={{
                  background: isRecording
                    ? "oklch(0.62 0.26 25)"
                    : isActive
                      ? "white"
                      : "oklch(0.22 0 0)",
                  opacity: !isActive && !isRecording ? 0.4 : 1,
                  cursor: !isActive && !isRecording ? "not-allowed" : "pointer",
                }}
                animate={
                  isRecording
                    ? { borderRadius: "10px", width: "40px", height: "40px" }
                    : {}
                }
                transition={{ duration: 0.2 }}
              />
            </div>

            {isRecording && (
              <svg
                aria-hidden="true"
                className="absolute -inset-1 pointer-events-none"
                width="88"
                height="88"
                style={{ transform: "rotate(-90deg)" }}
              >
                <circle
                  cx="44"
                  cy="44"
                  r="40"
                  fill="none"
                  stroke="oklch(0.30 0 0)"
                  strokeWidth="3"
                />
                <circle
                  cx="44"
                  cy="44"
                  r="40"
                  fill="none"
                  stroke="oklch(0.62 0.26 25)"
                  strokeWidth="3"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - recordProgress / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.1s linear" }}
                />
              </svg>
            )}
          </div>

          {/* Gallery upload (bottom right) */}
          <button
            type="button"
            data-ocid="camera.upload_button"
            onClick={handleGalleryOpen}
            className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.52 0.22 145), oklch(0.45 0.20 165))",
                border: "1px solid oklch(0.55 0.18 145 / 0.5)",
              }}
            >
              <Upload className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-white/70">
              Upload
            </span>
          </button>
        </div>

        {/* Mic toggle */}
        <div className="flex justify-center mt-4">
          <button
            type="button"
            data-ocid="camera.mic_toggle"
            onClick={() => setMicMuted((m) => !m)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium active:scale-95 transition-transform"
            style={{
              background: micMuted
                ? "oklch(0.62 0.26 25 / 0.15)"
                : "oklch(0.12 0 0 / 0.85)",
              border: micMuted
                ? "1px solid oklch(0.62 0.26 25 / 0.4)"
                : "1px solid transparent",
            }}
          >
            {micMuted ? (
              <MicOff
                className="w-4 h-4"
                style={{ color: "oklch(0.72 0.26 25)" }}
              />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
            <span style={{ color: micMuted ? "oklch(0.72 0.26 25)" : "white" }}>
              {micMuted ? "Mic Off" : "Mic On"}
            </span>
          </button>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Hidden canvas for photo capture */}
      <canvas ref={cam.canvasRef} className="hidden" />
    </div>
  );
}

// ── Upload / Preview Screen ──────────────────────────────────────────────────

interface UploadScreenProps {
  previewUrl: string | null;
  caption: string;
  setCaption: (v: string) => void;
  hashtags: string;
  setHashtags: (v: string) => void;
  onBack: () => void;
  onClose: () => void;
}

function UploadScreen({
  previewUrl,
  caption,
  setCaption,
  hashtags,
  setHashtags,
  onBack,
  onClose,
}: UploadScreenProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  const handlePost = useCallback(async () => {
    setIsPosting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsPosting(false);
    setPosted(true);
    setTimeout(onClose, 1000);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto"
      style={{ background: "oklch(0.07 0 0)" }}
    >
      <div
        className="flex items-center justify-between px-4 pt-12 pb-4"
        style={{ borderBottom: "1px solid oklch(0.15 0 0)" }}
      >
        <button type="button" onClick={onBack}>
          <ChevronDown className="w-6 h-6 text-white rotate-90" />
        </button>
        <h2 className="font-display font-bold text-white text-lg">
          Post Your Reel
        </h2>
        <button type="button" onClick={onClose}>
          <X className="w-6 h-6" style={{ color: "oklch(0.45 0 0)" }} />
        </button>
      </div>

      <div className="flex-1 p-4 space-y-5">
        <div className="flex gap-4 items-start">
          <div
            className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ background: "var(--amo-gradient)" }}
          >
            {previewUrl ? (
              // biome-ignore lint/a11y/useMediaCaption: user preview thumbnail
              <video src={previewUrl} className="w-full h-full object-cover" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white" />
            )}
          </div>
          <div className="flex-1">
            <textarea
              data-ocid="upload.caption_input"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Apna reel describe karo... 🎬"
              rows={4}
              className="w-full resize-none text-sm text-white placeholder:text-white/30 bg-transparent outline-none leading-relaxed"
            />
          </div>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{ background: "oklch(0.11 0 0)" }}
        >
          <label
            htmlFor="hashtags-input"
            className="text-xs font-semibold mb-2 block"
            style={{ color: "oklch(0.55 0 0)" }}
          >
            HASHTAGS
          </label>
          <input
            id="hashtags-input"
            data-ocid="upload.hashtags_input"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#trending #viral #reels"
            className="w-full text-sm bg-transparent outline-none text-white placeholder:text-white/25"
          />
        </div>

        <div
          className="rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
          style={{ background: "oklch(0.11 0 0)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "var(--amo-gradient)" }}
            >
              <Music className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Add Music</p>
              <p className="text-xs" style={{ color: "oklch(0.45 0 0)" }}>
                Original sound
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-white/40 -rotate-90" />
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "oklch(0.11 0 0)" }}
        >
          {[
            { label: "Who can view", value: "Everyone" },
            { label: "Allow comments", value: "On" },
            { label: "Allow duet", value: "On" },
          ].map((opt, i) => (
            <div key={opt.label}>
              {i > 0 && (
                <div style={{ background: "oklch(0.16 0 0)", height: "1px" }} />
              )}
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm text-white">{opt.label}</span>
                <span className="text-sm font-semibold amo-gradient-text">
                  {opt.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-8 pt-4">
        <motion.button
          type="button"
          data-ocid="upload.post_button"
          whileTap={{ scale: 0.96 }}
          onClick={handlePost}
          disabled={isPosting || posted}
          className="w-full h-14 rounded-2xl text-lg font-bold text-white disabled:opacity-80"
          style={{ background: "var(--amo-gradient)" }}
        >
          {posted ? (
            "Posted!"
          ) : isPosting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            "Post Reel"
          )}
        </motion.button>
      </div>
    </div>
  );
}
