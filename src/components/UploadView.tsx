import { useRef, useState } from "react";
import * as tus from "tus-js-client";
import { estimateUploadTime, formatDuration, formatMbps, type UploadEstimate } from "../lib/upload-estimate";

const ALLOWED_EXTENSIONS = ["mp4", "mov", "webm", "avi", "mkv"];
const MAX_FILE_SIZE = 30 * 1024 * 1024 * 1024;

type UploadState = "idle" | "selected" | "uploading" | "processing" | "error";

interface UploadViewProps {
  videoId: string;
  title: string;
  description: string;
  isFirstCut: boolean;
  transcriptsEnabled: boolean;
}

function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export function UploadView({
  videoId,
  title: initialTitle,
  description: initialDescription,
  isFirstCut,
  transcriptsEnabled,
}: UploadViewProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [generateTranscript, setGenerateTranscript] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [estimate, setEstimate] = useState<UploadEstimate | null>(null);

  const validateFile = (selectedFile: File): string | null => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      return "Unsupported file type. Please upload MP4, MOV, WebM, AVI, or MKV.";
    }
    if (selectedFile.size > MAX_FILE_SIZE) return "File exceeds the 30GB limit.";
    return null;
  };

  const selectFile = (selectedFile: File) => {
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      setState("error");
      return;
    }
    setFile(selectedFile);
    setError("");
    setState("selected");
    setEstimate(null);
    setEstimating(true);
    estimateUploadTime(selectedFile.size)
      .then((result) => setEstimate(result))
      .finally(() => setEstimating(false));
  };

  const upload = async () => {
    if (!file) return;

    setState("uploading");
    setError("");
    setProgress(0);

    try {
      const res = await fetch(`/api/videos/${videoId}/${isFirstCut ? "first-cut" : "versions"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file.name,
          fileSize: file.size,
          title: isFirstCut ? undefined : title.trim() || undefined,
          description: isFirstCut ? undefined : description.trim(),
          generateTranscript: transcriptsEnabled ? generateTranscript : false,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { videoId?: string; uploadUrl?: string; error?: string }
        | null;

      if (!res.ok || !data?.uploadUrl) throw new Error(data?.error || "Failed to create upload");

      const targetVideoId = data.videoId || videoId;

      // Chunked + resumable tus upload. 25 MB chunks keep individual PATCHes
      // short enough to dodge middlebox/edge TCP RSTs, while staying under
      // Cloudflare Stream's 200 MB per-chunk cap and meeting the 256 KiB
      // alignment requirement.
      const tusUpload = new tus.Upload(file, {
        endpoint: data.uploadUrl,
        uploadUrl: data.uploadUrl,
        chunkSize: 25 * 1024 * 1024,
        retryDelays: [0, 1000, 3000, 6000, 12000, 24000, 60000],
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        onShouldRetry: (err) => {
          const status =
            (err as tus.DetailedError).originalResponse?.getStatus?.() ?? 0;
          if (status === 0) return true;
          if (status === 408 || status === 429) return true;
          if (status >= 500 && status < 600) return true;
          return false;
        },
        onError: (err) => {
          const status =
            (err as tus.DetailedError).originalResponse?.getStatus?.() ?? null;
          const detail = status ? `${status} ${err.message}` : err.message;
          setError(`Upload failed: ${detail}`);
          setState("error");
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          if (bytesTotal > 0) {
            setProgress(Math.round((bytesUploaded / bytesTotal) * 100));
          }
        },
        onSuccess: () => {
          setState("processing");
          window.location.href = `/videos/${targetVideoId}?tab=video`;
        },
      });
      tusUpload.start();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
      setState("error");
    }
  };

  return (
    <section className="rounded-xl border border-border-default bg-bg-secondary p-5">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-text-primary">
          {isFirstCut ? "Upload Video" : "Upload new version"}
        </h2>
        <p className="mt-1 text-sm text-text-secondary">
          {isFirstCut
            ? "Upload a video when you are ready to share a cut for feedback."
            : "Create the next version in this stack. Existing comments stay on their original version."}
        </p>
      </div>

      <div className="space-y-4">
        {!file && (
          <div
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              const selectedFile = event.dataTransfer.files[0];
              if (selectedFile) selectFile(selectedFile);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => inputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${dragOver ? "border-accent-primary bg-accent-primary/5" : "border-border-default hover:border-border-hover"}`}
          >
            <p className="text-sm font-medium text-text-primary">Drop your video here</p>
            <p className="mt-1 text-xs text-text-tertiary">or click to browse MP4, MOV, WebM, AVI, or MKV</p>
            <input
              ref={inputRef}
              type="file"
              accept=".mp4,.mov,.webm,.avi,.mkv"
              className="hidden"
              onChange={(event) => {
                const selectedFile = event.target.files?.[0];
                if (selectedFile) selectFile(selectedFile);
              }}
            />
          </div>
        )}

        {file && (
          <div className="flex items-center gap-3 rounded-xl border border-border-default bg-bg-tertiary p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{file.name}</p>
              <p className="text-xs text-text-tertiary">{formatFileSize(file.size)}</p>
            </div>
            {state === "selected" && (estimating || estimate) && (
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-medium uppercase tracking-wide text-text-tertiary/80">
                  Est. upload time
                </p>
                {estimating ? (
                  <p className="text-xs text-text-tertiary">estimating…</p>
                ) : (
                  estimate && (
                    <>
                      <p className="text-sm font-semibold text-text-primary">
                        ~{formatDuration(estimate.estimatedSeconds)}
                      </p>
                      <p className="text-[10px] text-text-tertiary/70">
                        your connection: {formatMbps(estimate.bytesPerSecond)}
                      </p>
                    </>
                  )
                )}
              </div>
            )}
          </div>
        )}

        {!isFirstCut && (
          <>
            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Title</label>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={state === "uploading"}
                className="w-full rounded-lg border border-border-default bg-bg-input px-4 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-text-secondary">Description</label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={state === "uploading"}
                rows={3}
                className="w-full resize-none rounded-lg border border-border-default bg-bg-input px-4 py-2.5 text-sm text-text-primary focus:border-accent-primary focus:outline-none disabled:opacity-50"
              />
            </div>
          </>
        )}

        {transcriptsEnabled && (
          <label className="flex cursor-pointer gap-3 rounded-xl border border-border-default bg-bg-tertiary p-3 transition-colors hover:border-border-hover">
            <input
              type="checkbox"
              checked={generateTranscript}
              onChange={(event) => setGenerateTranscript(event.target.checked)}
              disabled={state === "uploading"}
              className="mt-1 h-4 w-4 rounded border-border-default bg-bg-input text-accent-primary focus:ring-accent-primary disabled:opacity-50"
            />
            <span>
              <span className="block text-sm font-medium text-text-primary">Generate transcript after upload</span>
              <span className="mt-1 block text-xs text-text-tertiary">Create a transcript after the upload finishes processing.</span>
            </span>
          </label>
        )}

        {state === "uploading" && (
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Uploading...</span>
              <span className="font-mono text-text-primary">{progress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-tertiary">
              <div className="h-full rounded-full bg-accent-primary transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {state === "processing" && (
          <p className="rounded-lg bg-accent-secondary/15 px-4 py-2 text-sm text-accent-secondary">
            Upload complete. Returning to the project...
          </p>
        )}

        {error && <div className="rounded-lg bg-accent-danger/15 px-4 py-2 text-sm text-accent-danger">{error}</div>}

        <div className="flex justify-end">
          <button
            type="button"
            onClick={upload}
            disabled={!file || (!isFirstCut && !title.trim()) || state === "uploading"}
            className="rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-medium text-white transition-all duration-150 hover:bg-accent-hover disabled:opacity-50"
          >
            {state === "uploading" ? "Uploading..." : isFirstCut ? "Upload Video" : "Upload Version"}
          </button>
        </div>
      </div>
    </section>
  );
}
