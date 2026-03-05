import { useCamera } from "@/camera/useCamera";
import {
  Check,
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
  Settings,
  Sparkles,
  Timer,
  Upload,
  X,
  Zap,
  ZapIcon,
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
type CameraMode = "camera" | "preview";

export default function CameraScreen({ onClose }: CameraScreenProps) {
  const [flash, setFlash] = useState<Flash>("off");
  const [beauty, setBeauty] = useState(false);
  const [timer, setTimer] = useState<0 | 3 | 10>(0);
  const [showSettings, setShowSettings] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [speed, setSpeed] = useState<Speed>("1x");
  const [showSpeed, setShowSpeed] = useState(false);
  const [duration, setDuration] = useState<Duration>(15);
  const [micMuted, setMicMuted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordTime, setRecordTime] = useState(0);
  const [mode, setMode] = useState<CameraMode>("camera");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">(
    "environment",
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoRetryCountRef = useRef(0);
  const autoRetryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const camera = useCamera({ facingMode: cameraFacing });

  // biome-ignore lint/correctness/useExhaustiveDependencies: start camera once on mount
  useEffect(() => {
    camera.startCamera();
    return () => {
      camera.stopCamera();
    };
  }, []);

  // Auto-retry when user returns to the tab after possibly granting camera permission in browser settings
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "visible" &&
        !camera.isActive &&
        !camera.isLoading
      ) {
        camera.startCamera();
      }
    };
    const handleFocus = () => {
      if (!camera.isActive && !camera.isLoading) {
        camera.startCamera();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [camera.isActive, camera.isLoading, camera.startCamera]);

  // Auto-retry logic: only retry automatically on non-permission errors (permission errors
  // require user interaction to re-grant — auto-retrying a denied permission just spams the error)
  useEffect(() => {
    if (
      camera.error &&
      camera.error.type !== "permission" &&
      autoRetryCountRef.current < 3
    ) {
      autoRetryTimerRef.current = setTimeout(() => {
        autoRetryCountRef.current += 1;
        camera.retry();
      }, 3000);
    }
    return () => {
      if (autoRetryTimerRef.current) {
        clearTimeout(autoRetryTimerRef.current);
        autoRetryTimerRef.current = null;
      }
    };
  }, [camera.error, camera.retry]);

  // Reset auto-retry count when camera becomes active
  useEffect(() => {
    if (camera.isActive) {
      autoRetryCountRef.current = 0;
    }
  }, [camera.isActive]);

  useEffect(() => {
    if (isRecording) {
      recordTimerRef.current = setInterval(() => {
        setRecordTime((t) => {
          const next = t + 0.1;
          setRecordProgress((next / duration) * 100);
          if (next >= duration) {
            stopRecording();
          }
          return next;
        });
      }, 100);
    } else {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
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
    setMode("preview");
  }, []);

  const handleFlipCamera = useCallback(async () => {
    const newFacing = cameraFacing === "environment" ? "user" : "environment";
    setCameraFacing(newFacing);
    await camera.switchCamera(newFacing);
  }, [cameraFacing, camera]);

  const handleFlashCycle = useCallback(() => {
    setFlash((f) => (f === "off" ? "on" : f === "on" ? "auto" : "off"));
  }, []);

  const handleTimerCycle = useCallback(() => {
    setTimer((t) => (t === 0 ? 3 : t === 3 ? 10 : 0));
  }, []);

  const handleGalleryOpen = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setMode("preview");
      }
    },
    [],
  );

  const handleRetry = useCallback(() => {
    autoRetryCountRef.current = 0;
    camera.retry();
  }, [camera]);

  const FlashIcon = flash === "on" ? Zap : flash === "auto" ? ZapIcon : ZapOff;
  const isPermissionError = camera.error?.type === "permission";
  const cameraUnavailable = !camera.isActive && !camera.isLoading;

  if (mode === "preview") {
    return (
      <UploadScreen
        previewUrl={previewUrl}
        caption={caption}
        setCaption={setCaption}
        hashtags={hashtags}
        setHashtags={setHashtags}
        onBack={() => {
          setMode("camera");
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
      {/* Camera viewfinder */}
      <div className="absolute inset-0">
        {camera.isActive ? (
          <video
            ref={camera.videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
            style={{
              transform: cameraFacing === "user" ? "scaleX(-1)" : "none",
            }}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-4"
            style={{ background: "oklch(0.08 0 0)" }}
          >
            {camera.isLoading ? (
              <>
                <div className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-white/50 text-sm">
                  Camera shuru ho raha hai...
                </p>
              </>
            ) : camera.error?.type === "not-found" ? (
              /* No camera hardware found */
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mx-5 rounded-3xl p-6 flex flex-col items-center gap-5 max-w-xs w-full"
                style={{
                  background: "oklch(0.12 0 0)",
                  border: "1px solid oklch(0.22 0 0)",
                }}
                data-ocid="camera.error_state"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{
                    background: "oklch(0.62 0.26 25 / 0.15)",
                    border: "1px solid oklch(0.62 0.26 25 / 0.4)",
                  }}
                >
                  <svg
                    aria-hidden="true"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="oklch(0.72 0.22 25)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-base mb-1">
                    Camera Nahi Mila
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.55 0 0)" }}
                  >
                    Aapke device mein camera nahi mila. Gallery se video upload
                    karo.
                  </p>
                </div>
                {/* Gallery upload — primary action */}
                <motion.button
                  type="button"
                  data-ocid="camera.gallery_upload_button"
                  onClick={handleGalleryOpen}
                  whileTap={{ scale: 0.96 }}
                  animate={{
                    boxShadow: [
                      "0 0 0px 0px oklch(0.62 0.22 145 / 0)",
                      "0 0 20px 6px oklch(0.62 0.22 145 / 0.4)",
                      "0 0 0px 0px oklch(0.62 0.22 145 / 0)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2.2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                  className="w-full h-14 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.22 145), oklch(0.45 0.20 165))",
                  }}
                >
                  <Image className="w-5 h-5" />
                  Gallery se Video Upload Karo
                </motion.button>
              </motion.div>
            ) : isPermissionError ? (
              /* Permission denied — prominent instructions */
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mx-5 rounded-3xl p-6 flex flex-col items-center gap-5 max-w-xs w-full"
                style={{
                  background: "oklch(0.12 0 0)",
                  border: "1px solid oklch(0.22 0 0)",
                }}
                data-ocid="camera.error_state"
              >
                {/* 🟢 Gallery upload button — FIRST and most prominent */}
                <motion.button
                  type="button"
                  data-ocid="camera.gallery_upload_button"
                  onClick={handleGalleryOpen}
                  whileTap={{ scale: 0.96 }}
                  animate={{
                    boxShadow: [
                      "0 0 0px 0px oklch(0.62 0.22 145 / 0)",
                      "0 0 22px 8px oklch(0.62 0.22 145 / 0.45)",
                      "0 0 0px 0px oklch(0.62 0.22 145 / 0)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2.2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                  className="w-full h-14 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.22 145), oklch(0.45 0.20 165))",
                  }}
                >
                  <Image className="w-5 h-5" />
                  Gallery se Video Upload Karo
                </motion.button>

                <div
                  className="w-full flex items-center gap-3"
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

                {/* Camera blocked icon */}
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center"
                  style={{
                    background: "oklch(0.62 0.26 25 / 0.15)",
                    border: "1px solid oklch(0.62 0.26 25 / 0.4)",
                  }}
                >
                  <svg
                    aria-hidden="true"
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="oklch(0.72 0.22 25)"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                </div>

                <div className="text-center">
                  <h3 className="font-bold text-white text-sm mb-1">
                    Camera Permission Chahiye
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "oklch(0.55 0 0)" }}
                  >
                    AMO ko camera use karne ki permission nahi mili
                  </p>
                </div>

                {/* Step-by-step instructions */}
                <div
                  className="w-full rounded-2xl p-4 space-y-3"
                  style={{ background: "oklch(0.09 0 0)" }}
                >
                  <p
                    className="text-xs font-semibold mb-3"
                    style={{ color: "oklch(0.55 0 0)" }}
                  >
                    CAMERA ALLOW KARNE KE LIYE:
                  </p>
                  {[
                    {
                      step: "1",
                      text: "Browser address bar mein lock/camera icon tap karo",
                    },
                    {
                      step: "2",
                      text: '"Site Settings" ya "Permissions" mein jao',
                    },
                    { step: "3", text: 'Camera ko "Allow" karo' },
                    { step: "4", text: "Neeche Retry button dabao" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <span
                        className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                        style={{ background: "var(--amo-gradient)" }}
                      >
                        {item.step}
                      </span>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Retry button */}
                <motion.button
                  type="button"
                  data-ocid="camera.retry_button"
                  onClick={handleRetry}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: [
                      "0 0 0px 0px oklch(0.72 0.28 335 / 0)",
                      "0 0 18px 6px oklch(0.72 0.28 335 / 0.35)",
                      "0 0 0px 0px oklch(0.72 0.28 335 / 0)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                  className="w-full h-12 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: "var(--amo-gradient)" }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry — Camera Kholo
                </motion.button>
              </motion.div>
            ) : (
              /* Generic error / no camera */
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="mx-5 rounded-3xl p-6 flex flex-col items-center gap-5 max-w-xs w-full"
                style={{
                  background: "oklch(0.12 0 0)",
                  border: "1px solid oklch(0.22 0 0)",
                }}
                data-ocid="camera.error_state"
              >
                {/* Gallery first */}
                <motion.button
                  type="button"
                  data-ocid="camera.gallery_upload_button"
                  onClick={handleGalleryOpen}
                  whileTap={{ scale: 0.96 }}
                  animate={{
                    boxShadow: [
                      "0 0 0px 0px oklch(0.62 0.22 145 / 0)",
                      "0 0 20px 6px oklch(0.62 0.22 145 / 0.4)",
                      "0 0 0px 0px oklch(0.62 0.22 145 / 0)",
                    ],
                  }}
                  transition={{
                    boxShadow: {
                      duration: 2.2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    },
                  }}
                  className="w-full h-14 rounded-2xl text-base font-bold text-white flex items-center justify-center gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg, oklch(0.52 0.22 145), oklch(0.45 0.20 165))",
                  }}
                >
                  <Image className="w-5 h-5" />
                  Gallery se Video Upload Karo
                </motion.button>

                <p className="text-white/40 text-sm text-center">
                  {camera.error?.message || "Camera unavailable"}
                </p>
                <button
                  type="button"
                  data-ocid="camera.retry_button"
                  onClick={handleRetry}
                  className="px-5 py-2.5 rounded-full text-sm text-white font-semibold"
                  style={{ background: "var(--amo-gradient)" }}
                >
                  <RefreshCw className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                  Retry
                </button>
              </motion.div>
            )}
          </div>
        )}

        {/* Grid overlay */}
        {showGrid && (
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

        {/* Recording progress */}
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
              <div className="w-2 h-2 bg-red-500 rounded-full animate-record" />
              <span className="text-white text-sm font-bold tabular-nums">
                {Math.floor(recordTime).toString().padStart(2, "0")}:
                {Math.round((recordTime % 1) * 10).toString()}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-12 pb-3">
        <button
          type="button"
          data-ocid="camera.close_button"
          onClick={onClose}
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.10 0 0 / 0.7)" }}
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-3">
          {/* Flash */}
          <button
            type="button"
            data-ocid="camera.flash_toggle"
            onClick={handleFlashCycle}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
            style={{
              background:
                flash !== "off"
                  ? "oklch(0.78 0.22 60 / 0.3)"
                  : "oklch(0.10 0 0 / 0.7)",
              border:
                flash !== "off"
                  ? "1px solid oklch(0.78 0.22 60 / 0.6)"
                  : "1px solid transparent",
            }}
          >
            <FlashIcon
              className="w-5 h-5"
              style={{
                color: flash !== "off" ? "oklch(0.88 0.22 60)" : "white",
              }}
            />
          </button>

          {/* Beauty */}
          <button
            type="button"
            data-ocid="camera.beauty_toggle"
            onClick={() => setBeauty((b) => !b)}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
            style={{
              background: beauty
                ? "oklch(0.72 0.28 335 / 0.3)"
                : "oklch(0.10 0 0 / 0.7)",
              border: beauty
                ? "1px solid oklch(0.72 0.28 335 / 0.6)"
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
            onClick={handleTimerCycle}
            className="w-10 h-10 rounded-full flex items-center justify-center relative transition-all duration-200 active:scale-90"
            style={{
              background:
                timer !== 0
                  ? "oklch(0.65 0.28 290 / 0.3)"
                  : "oklch(0.10 0 0 / 0.7)",
              border:
                timer !== 0
                  ? "1px solid oklch(0.65 0.28 290 / 0.6)"
                  : "1px solid transparent",
            }}
          >
            <Timer
              className="w-5 h-5"
              style={{ color: timer !== 0 ? "oklch(0.75 0.28 290)" : "white" }}
            />
            {timer !== 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center amo-gradient">
                {timer}
              </span>
            )}
          </button>

          {/* Settings */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowSettings((s) => !s)}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
              style={{
                background: showSettings
                  ? "oklch(0.22 0 0)"
                  : "oklch(0.10 0 0 / 0.7)",
              }}
            >
              <Settings className="w-5 h-5 text-white" />
            </button>

            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -5 }}
                  className="absolute top-12 right-0 rounded-2xl overflow-hidden min-w-[160px] z-50 shadow-glow"
                  style={{ background: "oklch(0.15 0 0)" }}
                >
                  <button
                    type="button"
                    data-ocid="camera.grid_toggle"
                    onClick={() => {
                      setShowGrid((g) => !g);
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Grid3x3 className="w-4 h-4" /> Grid
                    </span>
                    {showGrid && (
                      <Check className="w-4 h-4 amo-gradient-text" />
                    )}
                  </button>
                  <div
                    style={{ background: "oklch(0.22 0 0)", height: "1px" }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettings(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <FlipHorizontal className="w-4 h-4" /> Mirror Preview
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Right side controls strip */}
      <div className="absolute right-3 top-1/4 z-10 flex flex-col items-center gap-4">
        {/* Flip camera */}
        <button
          type="button"
          data-ocid="camera.flip_button"
          onClick={handleFlipCamera}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 hover:bg-white/10"
          style={{ background: "oklch(0.10 0 0 / 0.7)" }}
        >
          <FlipHorizontal className="w-5 h-5 text-white" />
        </button>

        {/* Speed selector */}
        <div className="relative">
          <button
            type="button"
            data-ocid="camera.speed_select"
            onClick={() => setShowSpeed((s) => !s)}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
            style={{
              background:
                speed !== "1x"
                  ? "oklch(0.65 0.28 290 / 0.4)"
                  : "oklch(0.10 0 0 / 0.7)",
              border:
                speed !== "1x"
                  ? "1px solid oklch(0.65 0.28 290 / 0.6)"
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
                className="absolute right-14 top-0 flex flex-col rounded-2xl overflow-hidden shadow-glow"
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
                    className="px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-white/5"
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
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 hover:bg-white/10"
          style={{ background: "oklch(0.10 0 0 / 0.7)" }}
        >
          <Gauge className="w-5 h-5 text-white" />
        </button>

        {/* Music */}
        <button
          type="button"
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 hover:bg-white/10"
          style={{ background: "oklch(0.10 0 0 / 0.7)" }}
        >
          <Music className="w-5 h-5 text-white" />
        </button>

        {/* Gallery — always active, uses file picker */}
        <button
          type="button"
          data-ocid="camera.gallery_button"
          onClick={handleGalleryOpen}
          className="w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 hover:bg-white/10"
          style={{ background: "oklch(0.10 0 0 / 0.7)" }}
        >
          <Image className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Bottom controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pb-8 px-4">
        {/* Duration tabs — always active */}
        <div className="flex justify-center mb-6">
          <div
            className="flex rounded-full overflow-hidden"
            style={{ background: "oklch(0.12 0 0 / 0.8)" }}
          >
            {([15, 30, 60] as Duration[]).map((d) => (
              <button
                type="button"
                key={d}
                data-ocid={`camera.switch_duration_${d}`}
                onClick={() => setDuration(d)}
                className="px-5 py-2 text-sm font-bold transition-all duration-200"
                style={{
                  color: duration === d ? "white" : "oklch(0.45 0 0)",
                  background:
                    duration === d ? "var(--amo-gradient)" : "transparent",
                  borderRadius: "9999px",
                  margin: "2px",
                }}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* Record row */}
        <div className="flex items-center justify-center gap-8">
          {/* Switch camera (left of record) */}
          <button
            type="button"
            onClick={handleFlipCamera}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90"
            style={{ background: "oklch(0.15 0 0 / 0.8)" }}
          >
            <FlipHorizontal className="w-6 h-6 text-white" />
          </button>

          {/* Record button */}
          <div className="relative flex flex-col items-center gap-2">
            {/* Tooltip when camera is unavailable */}
            {cameraUnavailable && !isRecording && (
              <div
                className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-full text-[11px] font-semibold text-white"
                style={{ background: "oklch(0.62 0.26 25 / 0.9)" }}
                data-ocid="camera.record_button.error_state"
              >
                Camera permission chahiye
              </div>
            )}

            <div
              className="w-20 h-20 rounded-full flex items-center justify-center border-4"
              style={{
                borderColor: isRecording
                  ? "oklch(0.62 0.26 25 / 0.8)"
                  : cameraUnavailable
                    ? "oklch(0.30 0 0 / 0.5)"
                    : "oklch(1.00 0 0 / 0.3)",
              }}
            >
              <motion.button
                type="button"
                data-ocid="camera.record_button"
                whileTap={camera.isActive ? { scale: 0.9 } : {}}
                onClick={
                  isRecording
                    ? stopRecording
                    : camera.isActive
                      ? startRecording
                      : undefined
                }
                disabled={!camera.isActive && !isRecording}
                className="w-14 h-14 rounded-full transition-all duration-200"
                style={{
                  background: isRecording
                    ? "oklch(0.62 0.26 25)"
                    : cameraUnavailable
                      ? "oklch(0.25 0 0)"
                      : "white",
                  opacity: cameraUnavailable ? 0.45 : 1,
                  cursor: cameraUnavailable ? "not-allowed" : "pointer",
                  ...(isRecording
                    ? { animation: "pulse-ring 1.5s ease-out infinite" }
                    : {}),
                }}
                animate={
                  isRecording
                    ? { borderRadius: "12px", width: "44px", height: "44px" }
                    : {}
                }
                transition={{ duration: 0.2 }}
              />
            </div>

            {/* SVG progress arc for recording */}
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
                  stroke="oklch(0.40 0 0)"
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

          {/* Gallery picker (right of record) — always active */}
          <button
            type="button"
            data-ocid="camera.upload_button"
            onClick={handleGalleryOpen}
            className="flex flex-col items-center gap-1 transition-all duration-200 active:scale-90"
          >
            <div
              className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center"
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

        {/* Mic toggle — always active */}
        <div className="flex justify-center mt-4">
          <button
            type="button"
            data-ocid="camera.mic_toggle"
            onClick={() => setMicMuted((m) => !m)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 active:scale-95"
            style={{
              background: micMuted
                ? "oklch(0.62 0.26 25 / 0.15)"
                : "oklch(0.12 0 0 / 0.8)",
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
    </div>
  );
}

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
      {/* Header */}
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
        {/* Preview thumbnail */}
        <div className="flex gap-4 items-start">
          <div
            className="w-20 h-28 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ background: "var(--amo-gradient)" }}
          >
            {previewUrl ? (
              // biome-ignore lint/a11y/useMediaCaption: Preview thumbnail for user-uploaded video
              <video src={previewUrl} className="w-full h-full object-cover" />
            ) : (
              <Play className="w-6 h-6 text-white fill-white" />
            )}
          </div>

          {/* Caption */}
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

        {/* Hashtags */}
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

        {/* Music selector placeholder */}
        <div
          className="rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
          style={{ background: "oklch(0.11 0 0)" }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full amo-gradient flex items-center justify-center">
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

        {/* Visibility options */}
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
                <span className="text-sm amo-gradient-text font-semibold">
                  {opt.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Post button */}
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
            "✅ Posted!"
          ) : isPosting ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </span>
          ) : (
            "Post Reel 🚀"
          )}
        </motion.button>
      </div>
    </div>
  );
}
