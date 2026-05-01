import { Resend } from "resend";

export interface SendEmailArgs {
  to: string;
  subject: string;
  html: string;
}

export interface CommentItem {
  kind: "comment_uploader" | "comment_reply";
  videoId: string;
  videoTitle: string;
  commentId: string;
  authorName: string;
  text: string;
  timestamp: number | null;
  urgency: "idea" | "suggestion" | "important" | "critical";
}

export interface VideoReadyItem {
  kind: "video_ready";
  videoId: string;
  videoTitle: string;
  uploaderName: string;
  spaceName: string;
}

export type DigestItem = CommentItem | VideoReadyItem;

export interface DigestEmailArgs {
  recipientName: string;
  appUrl: string;
  items: DigestItem[];
}

export interface InviteEmailArgs {
  inviterName: string;
  spaceName: string;
  acceptUrl: string;
}

export async function sendEmail(
  apiKey: string,
  from: string,
  args: SendEmailArgs,
): Promise<void> {
  const resend = new Resend(apiKey);
  const result = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
  });
  if (result.error) {
    throw new Error(
      `Resend error: ${result.error.name} ${result.error.message}`,
    );
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncate(s: string, max = 280): string {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

function commentDeepLink(
  appUrl: string,
  videoId: string,
  commentId: string,
  timestamp: number | null,
): string {
  const params = new URLSearchParams();
  if (timestamp != null) params.set("t", String(Math.floor(timestamp)));
  params.set("c", commentId);
  return `${appUrl}/videos/${videoId}?${params.toString()}`;
}

function videoDeepLink(appUrl: string, videoId: string): string {
  return `${appUrl}/videos/${videoId}`;
}

export function digestSubject(items: DigestItem[]): string {
  if (items.length === 0) return "Wellrox Video Review";
  if (items.length === 1) {
    const item = items[0];
    if (item.kind === "comment_uploader") {
      return `New comment on "${item.videoTitle}" — ${item.authorName}`;
    }
    if (item.kind === "comment_reply") {
      return `${item.authorName} replied to your comment on "${item.videoTitle}"`;
    }
    return `New video ready to review: "${item.videoTitle}"`;
  }
  const allComments = items.every((i) => i.kind !== "video_ready");
  if (allComments) {
    const titles = new Set(items.map((i) => i.videoTitle));
    if (titles.size === 1) {
      return `${items.length} new comments on "${[...titles][0]}"`;
    }
  }
  return `${items.length} new notifications on Wellrox Video Review`;
}

export function renderDigestEmail(args: DigestEmailArgs): string {
  const comments = args.items.filter(
    (i): i is CommentItem => i.kind !== "video_ready",
  );
  const videos = args.items.filter(
    (i): i is VideoReadyItem => i.kind === "video_ready",
  );

  const sections: string[] = [];

  if (comments.length > 0) {
    const rows = comments
      .map((c) => {
        const link = commentDeepLink(
          args.appUrl,
          c.videoId,
          c.commentId,
          c.timestamp,
        );
        const urgencyBadge =
          c.urgency === "important" || c.urgency === "critical"
            ? `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;text-transform:uppercase;background:${
                c.urgency === "critical" ? "#dc2626" : "#d97706"
              };color:#fff;margin-right:8px;">${escapeHtml(c.urgency)}</span>`
            : "";
        const headerLabel =
          c.kind === "comment_reply"
            ? `${escapeHtml(c.authorName)} replied`
            : `${escapeHtml(c.authorName)} commented`;
        return `
          <tr><td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
            <div style="font-size:13px;color:#6b7280;margin-bottom:4px;">
              ${urgencyBadge}<strong style="color:#111827;">${headerLabel}</strong> on <a href="${link}" style="color:#2563eb;text-decoration:none;">${escapeHtml(c.videoTitle)}</a>
            </div>
            <div style="font-size:14px;color:#111827;line-height:1.5;">${escapeHtml(truncate(c.text))}</div>
            <div style="margin-top:6px;"><a href="${link}" style="color:#2563eb;font-size:13px;text-decoration:none;">Open comment →</a></div>
          </td></tr>`;
      })
      .join("");
    sections.push(`
      <h2 style="font-size:16px;font-weight:600;color:#111827;margin:24px 0 8px;">Comments</h2>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    `);
  }

  if (videos.length > 0) {
    const rows = videos
      .map((v) => {
        const link = videoDeepLink(args.appUrl, v.videoId);
        return `
          <tr><td style="padding:12px 0;border-bottom:1px solid #e5e7eb;">
            <div style="font-size:14px;color:#111827;">
              <strong>${escapeHtml(v.videoTitle)}</strong>
            </div>
            <div style="font-size:13px;color:#6b7280;margin-top:2px;">
              uploaded by ${escapeHtml(v.uploaderName)} in ${escapeHtml(v.spaceName)}
            </div>
            <div style="margin-top:6px;"><a href="${link}" style="color:#2563eb;font-size:13px;text-decoration:none;">Watch and review →</a></div>
          </td></tr>`;
      })
      .join("");
    sections.push(`
      <h2 style="font-size:16px;font-weight:600;color:#111827;margin:24px 0 8px;">New videos ready to review</h2>
      <table style="width:100%;border-collapse:collapse;">${rows}</table>
    `);
  }

  const reasonLines: string[] = [];
  if (comments.some((c) => c.kind === "comment_uploader"))
    reasonLines.push("you uploaded videos that received new comments");
  if (comments.some((c) => c.kind === "comment_reply"))
    reasonLines.push("someone replied to your comments");
  if (videos.length > 0) reasonLines.push("you're a member of these spaces");
  const footerReason =
    reasonLines.length > 0
      ? `You're receiving this because ${reasonLines.join(" and ")}.`
      : "";

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table style="width:100%;background:#f9fafb;padding:32px 0;">
    <tr><td align="center">
      <table style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;padding:32px;">
        <tr><td>
          <h1 style="font-size:18px;font-weight:600;color:#111827;margin:0 0 4px;">Hi ${escapeHtml(args.recipientName)},</h1>
          <p style="font-size:14px;color:#6b7280;margin:0 0 8px;">Here's what's new in Wellrox Video Review.</p>
          ${sections.join("")}
          <p style="font-size:12px;color:#9ca3af;margin:32px 0 0;line-height:1.5;">${escapeHtml(footerReason)}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export function inviteSubject(args: InviteEmailArgs): string {
  return `${args.inviterName} invited you to ${args.spaceName} on Wellrox Video Review`;
}

export function renderInviteEmail(args: InviteEmailArgs): string {
  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table style="width:100%;background:#f9fafb;padding:32px 0;">
    <tr><td align="center">
      <table style="width:100%;max-width:560px;background:#ffffff;border-radius:8px;padding:40px;">
        <tr><td>
          <h1 style="font-size:20px;font-weight:600;color:#111827;margin:0 0 12px;">You've been invited to ${escapeHtml(args.spaceName)}</h1>
          <p style="font-size:15px;color:#374151;line-height:1.6;margin:0 0 24px;">
            ${escapeHtml(args.inviterName)} invited you to join <strong>${escapeHtml(args.spaceName)}</strong> on Wellrox Video Review — the space where their team reviews and approves video work together.
          </p>
          <p style="margin:0 0 24px;">
            <a href="${args.acceptUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:6px;font-size:15px;font-weight:600;">Accept invite</a>
          </p>
          <p style="font-size:13px;color:#6b7280;margin:0 0 4px;">Or paste this link into your browser:</p>
          <p style="font-size:13px;color:#2563eb;word-break:break-all;margin:0 0 32px;">${escapeHtml(args.acceptUrl)}</p>
          <p style="font-size:12px;color:#9ca3af;margin:0;">You're receiving this because someone invited you to a workspace on Wellrox Video Review.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
