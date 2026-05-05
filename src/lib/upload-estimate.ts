// Quick browser-side upload-throughput probe + ETA formatter. Used by the
// upload forms to give users a rough "this will take ~X minutes" before they
// commit to an upload that could run for hours.

const PROBE_BYTES = 3 * 1024 * 1024; // 3 MB — large enough to ride out TCP slow-start, small enough to finish in <5s on most connections
const PROBE_TIMEOUT_MS = 15_000;

export interface UploadEstimate {
  /** Effective upload throughput in bytes per second. */
  bytesPerSecond: number;
  /** Estimated upload time for the target file, in seconds. */
  estimatedSeconds: number;
}

/**
 * Probes the user's upload bandwidth by POSTing PROBE_BYTES bytes of zeros to
 * /api/speed-test, measuring elapsed time, and extrapolating to fileSize.
 *
 * Returns null if the probe fails (network error, timeout, auth) — callers
 * should fall back to a generic "depends on your connection" message.
 */
export async function estimateUploadTime(fileSize: number): Promise<UploadEstimate | null> {
  const payload = new Uint8Array(PROBE_BYTES);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    const start = performance.now();
    const res = await fetch("/api/speed-test", {
      method: "POST",
      body: payload,
      signal: controller.signal,
    });
    const elapsedSeconds = (performance.now() - start) / 1000;

    if (!res.ok || elapsedSeconds <= 0) return null;

    const bytesPerSecond = PROBE_BYTES / elapsedSeconds;
    const estimatedSeconds = fileSize / bytesPerSecond;

    return { bytesPerSecond, estimatedSeconds };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Renders a duration in seconds as a compact human-readable string. */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 1) return "<1s";
  if (seconds < 60) return `${Math.round(seconds)}s`;

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remMinutes = minutes % 60;
  return remMinutes ? `${hours}h ${remMinutes}m` : `${hours}h`;
}

/** Renders bytes-per-second as Mbps for display. */
export function formatMbps(bytesPerSecond: number): string {
  const mbps = (bytesPerSecond * 8) / 1_000_000;
  return mbps >= 10 ? `${Math.round(mbps)} Mbps` : `${mbps.toFixed(1)} Mbps`;
}
