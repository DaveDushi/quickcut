import { eq } from "drizzle-orm";
import type { Database } from "../db";
import {
  comments,
  pendingEmailNotifications,
  spaceMembers,
  videos,
} from "../db/schema";
import {
  inviteSubject,
  renderInviteEmail,
  sendEmail,
} from "./email";

type NewCommentRow = {
  id: string;
  videoId: string;
  parentId: string | null;
  authorType: "user" | "anonymous";
  authorUserId: string | null;
};

/**
 * Queue an email notification for a freshly created comment.
 *
 * - Top-level comment → email the video uploader.
 * - Reply → email the direct parent comment author (only if a known user).
 * - Skips when the recipient is the author themselves, missing, or anonymous.
 *
 * Caller MUST wrap in try/catch — failure to enqueue should never fail the
 * comment write.
 */
export async function enqueueCommentNotification(
  db: Database,
  comment: NewCommentRow,
): Promise<void> {
  let recipientId: string | null = null;
  let kind: "comment_uploader" | "comment_reply";

  if (comment.parentId == null) {
    const videoRow = await db
      .select({ uploadedBy: videos.uploadedBy })
      .from(videos)
      .where(eq(videos.id, comment.videoId))
      .limit(1);
    if (videoRow.length === 0) return;
    recipientId = videoRow[0].uploadedBy;
    kind = "comment_uploader";
  } else {
    const parentRow = await db
      .select({
        authorType: comments.authorType,
        authorUserId: comments.authorUserId,
      })
      .from(comments)
      .where(eq(comments.id, comment.parentId))
      .limit(1);
    if (parentRow.length === 0) return;
    if (
      parentRow[0].authorType !== "user" ||
      parentRow[0].authorUserId == null
    ) {
      return;
    }
    recipientId = parentRow[0].authorUserId;
    kind = "comment_reply";
  }

  if (recipientId == null) return;
  if (recipientId === comment.authorUserId) return;

  await db.insert(pendingEmailNotifications).values({
    id: crypto.randomUUID(),
    recipientUserId: recipientId,
    kind,
    commentId: comment.id,
    videoId: comment.videoId,
  });
}

/**
 * Queue email notifications when a video first transitions to status=ready.
 * Fans out to every space member except the uploader.
 *
 * Caller MUST wrap in try/catch — failure to enqueue should never fail the
 * webhook.
 */
export async function enqueueVideoReadyNotification(
  db: Database,
  video: { id: string; spaceId: string; uploadedBy: string | null },
): Promise<void> {
  const members = await db
    .select({ userId: spaceMembers.userId })
    .from(spaceMembers)
    .where(eq(spaceMembers.spaceId, video.spaceId));

  const rows = members
    .filter((m) => m.userId !== video.uploadedBy)
    .map((m) => ({
      id: crypto.randomUUID(),
      recipientUserId: m.userId,
      kind: "video_ready" as const,
      commentId: null,
      videoId: video.id,
    }));

  if (rows.length === 0) return;
  await db.insert(pendingEmailNotifications).values(rows);
}

/**
 * Send an invite email immediately (not via the digest queue).
 *
 * Caller MUST wrap in try/catch — failure to send should never fail the
 * invite POST. The space_invites row is the source of truth; the link can
 * always be re-shared manually.
 */
export async function sendInviteEmailNow(
  env: { RESEND_API_KEY?: string; EMAIL_FROM?: string; APP_URL?: string },
  args: {
    inviteToken: string;
    inviteeEmail: string;
    inviterName: string;
    spaceName: string;
  },
): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.warn(
      "[notifications] RESEND_API_KEY missing — skipping invite email",
    );
    return;
  }
  const from = env.EMAIL_FROM ?? "Wellrox Video Review <noreply@wellrox.com>";
  const appUrl = env.APP_URL ?? "https://review.wellrox.com";
  const acceptUrl = `${appUrl}/invites/${args.inviteToken}`;

  const subject = inviteSubject({
    inviterName: args.inviterName,
    spaceName: args.spaceName,
    acceptUrl,
  });
  const html = renderInviteEmail({
    inviterName: args.inviterName,
    spaceName: args.spaceName,
    acceptUrl,
  });

  await sendEmail(env.RESEND_API_KEY, from, {
    to: args.inviteeEmail,
    subject,
    html,
  });
}
