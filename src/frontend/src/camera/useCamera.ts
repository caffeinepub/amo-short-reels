import { useCallback, useEffect, useRef, useState } from "react";

export type CameraFacing = "user" | "environment";

export type CameraState =
  | "idle"
  | "requesting"
  | "active"
  | "denied"
  | "unavailable"
  | "error";

export interface UseCameraReturn {
  state: CameraState;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  facing: CameraFacing;
  start: (facing?: CameraFacing) => Promise<void>;
  stop: () => void;
  flip: () => Promise<void>;
  retry: () => Promise<void>;
}

export function useCamera(
  initialFacing: CameraFacing = "environment",
): UseCameraReturn {
  const [state, setState] = useState<CameraState>("idle");
  const [facing, setFacing] = useState<CameraFacing>(initialFacing);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);

  // biome-ignore lint/correctness/useExhaustiveDependencies: stable ref-only function, no deps needed
  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      releaseStream();
    };
  }, [releaseStream]);

  const start = useCallback(
    async (newFacing?: CameraFacing) => {
      const targetFacing = newFacing ?? facing;

      if (!navigator.mediaDevices?.getUserMedia) {
        if (mountedRef.current) setState("unavailable");
        return;
      }

      releaseStream();
      if (mountedRef.current) setState("requesting");

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: targetFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!mountedRef.current) {
          for (const t of stream.getTracks()) t.stop();
          return;
        }

        streamRef.current = stream;
        setFacing(targetFacing);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }

        if (mountedRef.current) setState("active");
      } catch (err: unknown) {
        if (!mountedRef.current) return;
        const name = (err as { name?: string }).name ?? "";
        if (name === "NotAllowedError" || name === "PermissionDeniedError") {
          setState("denied");
        } else if (
          name === "NotFoundError" ||
          name === "DevicesNotFoundError"
        ) {
          setState("unavailable");
        } else {
          setState("error");
        }
      }
    },
    [facing, releaseStream],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: releaseStream is stable
  const stop = useCallback(() => {
    releaseStream();
    if (mountedRef.current) setState("idle");
  }, [releaseStream]);

  const flip = useCallback(async () => {
    const next: CameraFacing =
      facing === "environment" ? "user" : "environment";
    await start(next);
  }, [facing, start]);

  const retry = useCallback(async () => {
    await start(facing);
  }, [facing, start]);

  return { state, videoRef, canvasRef, facing, start, stop, flip, retry };
}
