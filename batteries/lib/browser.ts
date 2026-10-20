import { useCallback, useEffect, useRef, useState } from "react";

// Vendor-prefixed / newer APIs that older TS lib.dom versions don't declare.
type FsDocument = Document & {
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};
type FsElement = HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void };
type WakeLockSentinelLike = { release: () => Promise<void>; addEventListener: (type: "release", cb: () => void) => void };
type WakeLockNav = Navigator & { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> } };

export const prefersReducedMotion = () => {
  try {
    return matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
};

export const isCoarsePointer = () => {
  try {
    return matchMedia("(pointer: coarse)").matches;
  } catch {
    return false;
  }
};

const fsDoc = () => document as FsDocument;
const fullscreenSupported = () => !!(fsDoc().fullscreenEnabled || fsDoc().webkitFullscreenEnabled);
const fullscreenActive = () => !!(fsDoc().fullscreenElement || fsDoc().webkitFullscreenElement);

/** Best effort: needs a user gesture and may be refused; never throws. */
export async function enterFullscreen() {
  try {
    const el = document.documentElement as FsElement;
    if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: "hide" });
    else await el.webkitRequestFullscreen?.();
  } catch {}
}

export async function exitFullscreen() {
  try {
    if (document.exitFullscreen) await document.exitFullscreen();
    else await fsDoc().webkitExitFullscreen?.();
  } catch {}
}

/** `supported` is false until mounted (and on iPhone Safari), so the button stays hidden. */
export function useFullscreen() {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  useEffect(() => {
    setSupported(fullscreenSupported());
    const sync = () => setActive(fullscreenActive());
    sync();
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, []);
  const toggle = useCallback(() => {
    if (!fullscreenSupported()) return;
    if (fullscreenActive()) exitFullscreen();
    else enterFullscreen();
  }, []);
  return { supported, active, toggle };
}

/** Keeps the screen awake while `active`; the browser drops the lock when the tab hides, so re-acquire on return. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    const wakeLock = (navigator as WakeLockNav).wakeLock;
    if (!active || !wakeLock) return;
    let sentinel: WakeLockSentinelLike | null = null;
    let cancelled = false;
    const acquire = async () => {
      if (cancelled || document.hidden || sentinel) return;
      try {
        const s = await wakeLock.request("screen");
        if (cancelled) return void s.release().catch(() => {});
        sentinel = s;
        s.addEventListener("release", () => {
          if (sentinel === s) sentinel = null;
        });
      } catch {}
    };
    const onVisible = () => {
      if (!document.hidden) acquire();
    };
    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, [active]);
}

export type MediaSessionHandlers = {
  play: () => void;
  pause: () => void;
  previous: () => void;
  next: () => void;
  seek: (deltaSeconds: number) => void;
};

const SESSION_ACTIONS = ["play", "pause", "previoustrack", "nexttrack", "seekbackward", "seekforward"] as const;

/** Lock-screen / headphone controls and "now playing" info while `active`. */
export function useMediaSession(
  active: boolean,
  info: { title: string; artist: string; album: string },
  paused: boolean,
  handlers: MediaSessionHandlers,
) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    if (!active || !("mediaSession" in navigator)) return;
    const ms = navigator.mediaSession;
    const set = (action: (typeof SESSION_ACTIONS)[number], fn: ((d: any) => void) | null) => {
      try {
        ms.setActionHandler(action as any, fn);
      } catch {}
    };
    const h = () => handlersRef.current;
    set("play", () => h().play());
    set("pause", () => h().pause());
    set("previoustrack", () => h().previous());
    set("nexttrack", () => h().next());
    set("seekbackward", (d) => h().seek(-(d?.seekOffset ?? 5)));
    set("seekforward", (d) => h().seek(d?.seekOffset ?? 5));
    return () => {
      SESSION_ACTIONS.forEach((a) => set(a, null));
      try {
        ms.metadata = null;
        ms.playbackState = "none";
      } catch {}
    };
  }, [active]);

  useEffect(() => {
    if (!active || !("mediaSession" in navigator) || typeof MediaMetadata === "undefined") return;
    try {
      navigator.mediaSession.metadata = new MediaMetadata({ title: info.title, artist: info.artist, album: info.album });
    } catch {}
  }, [active, info.title, info.artist, info.album]);

  useEffect(() => {
    if (!active || !("mediaSession" in navigator)) return;
    try {
      navigator.mediaSession.playbackState = paused ? "paused" : "playing";
    } catch {}
  }, [active, paused]);
}
