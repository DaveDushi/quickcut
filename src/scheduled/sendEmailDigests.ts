import { eq, inArray } from "drizzle-orm";
import { createDb, type Database } from "../db";
import {
  comments,
  pendingEmailNotifications,
  spaces,
  users,
  videos,
} from "../db/schema";
import {
  digestSubject,
  renderDigestEmail,
  sendEmail,
  type CommentItem,
  type DigestItem,
  type VideoReadyItem,
} from "../lib/email";

const MAX_ATTEMPTS = 3;

interface PendingRow {
  id: string;
  recipientUserId: string;
  kind: "comment_uploader" | "comment_reply" | "video_ready";
  commentId: string | null;
  videoId: string;
  attempts: number;
}

export async function sendEmailDigests(env: Env): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.warn(
      "[sendEmailDigests] RESEND_API_KEY missing — skipping cron run",
    );
    return;
  }
  const from = env.EMAIL_FROM ?? "Wellrox Video Review <noreply@wellrox.com>";
  const appUrl = env.APP_URL ?? "https://review.wellrox.com";

  const db = createDb(env.DB);

  const pending = (await db
    .select({
      id: pendingEmailNotifications.id,
      recipientUserId: pendingEmailNotifications.recipientUserId,
      kind: pendingEmailNotifications.kind,
      commentId: pendingEmailNotifications.commentId,
      videoId: pendingEmailNotifications.videoId,
      attempts: pendingEmailNotifications.attempts,
    })
    .from(pendingEmailNotifications)) as PendingRow[];

  if (pending.length === 0) return;

  const groups = new Map<string, PendingRow[]>();
  for (const row of pending) {
    const list = groups.get(row.recipientUserId) ?? [];
    list.push(row);
    groups.set(row.recipientUserId, list);
  }

  const recipientIds = [...groups.keys()];
  const recipientUsers = await db
    .select({
      id: users.id,
      email: users.email,
      displayName: users.displayName,
    })
    .from(users)
    .where(inArray(users.id, recipientIds));
  const userMap = new Map(recipientUsers.map((u) => [u.id, u]));

  const videoIds = [...new Set(pending.map((p) => p.videoId))];
  const videoRows = await db
    .select({
      id: videos.id,
      title: videos.title,
      spaceId: videos.spaceId,
      uploadedBy: videos.uploadedBy,
    })
    .from(videos)
    .where(inArray(videos.id, videoIds));
  const videoMap = new Map(videoRows.map((v) => [v.id, v]));

  const spaceIds = [...new Set(videoRows.map((v) => v.spaceId))];
  const spaceRows =
    spaceIds.length > 0
      ? await db
          .select({ id: spaces.id, name: spaces.name })
          .from(spaces)
          .where(inArray(spaces.id, spaceIds))
      : [];
  const spaceMap = new Map(spaceRows.map((s) => [s.id, s]));

  const uploaderIds = [
    ...new Set(
      videoRows.map((v) => v.uploadedBy).filter((x): x is string => x != null),
    ),
  ];
  const uploaderRows =
    uploaderIds.length > 0
      ? await db
          .select({ id: users.id, displayName: users.displayName })
          .from(users)
          .where(inArray(users.id, uploaderIds))
      : [];
  const uploaderMap = new Map(uploaderRows.map((u) => [u.id, u]));

  const commentIds = pending
    .map((p) => p.commentId)
    .filter((x): x is string => x != null);
  const commentRows =
    commentIds.length > 0
      ? await db
          .select({
            id: comments.id,
            text: comments.text,
            timestamp: comments.timestamp,
            urgency: comments.urgency,
            authorType: comments.authorType,
            authorUserId: comments.authorUserId,
            authorDisplayName: comments.authorDisplayName,
          })
          .from(comments)
          .where(inArray(comments.id, commentIds))
      : [];
  const commentMap = new Map(commentRows.map((c) => [c.id, c]));

  const commentAuthorIds = [
    ...new Set(
      commentRows
        .map((c) => c.authorUserId)
        .filter((x): x is string => x != null),
    ),
  ];
  const commentAuthorRows =
    commentAuthorIds.length > 0
      ? await db
          .select({ id: users.id, displayName: users.displayName })
          .from(users)
          .where(inArray(users.id, commentAuthorIds))
      : [];
  const commentAuthorMap = new Map(
    commentAuthorRows.map((u) => [u.id, u]),
  );

  for (const [recipientId, rows] of groups) {
    const recipient = userMap.get(recipientId);
    if (!recipient) {
      await dropRows(
        db,
        rows.map((r) => r.id),
      );
      continue;
    }

    const items: DigestItem[] = [];
    const validRowIds: string[] = [];

    for (const row of rows) {
      const video = videoMap.get(row.videoId);
      if (!video) continue;

      if (row.kind === "video_ready") {
        const space = spaceMap.get(video.spaceId);
        const uploader = video.uploadedBy
          ? uploaderMap.get(video.uploadedBy)
          : undefined;
        const item: VideoReadyItem = {
          kind: "video_ready",
          videoId: video.id,
          videoTitle: video.title,
          uploaderName: uploader?.displayName ?? "Someone",
          spaceName: space?.name ?? "your space",
        };
        items.push(item);
        validRowIds.push(row.id);
        continue;
      }

      if (!row.commentId) continue;
      const comment = commentMap.get(row.commentId);
      if (!comment) continue;
      const authorName =
        comment.authorType === "user" && comment.authorUserId
          ? commentAuthorMap.get(comment.authorUserId)?.displayName ??
            "Someone"
          : comment.authorDisplayName ?? "Anonymous";
      const item: CommentItem = {
        kind: row.kind,
        videoId: video.id,
        videoTitle: video.title,
        commentId: comment.id,
        authorName,
        text: comment.text,
        timestamp: comment.timestamp,
        urgency: comment.urgency,
      };
      items.push(item);
      validRowIds.push(row.id);
    }

    const orphanIds = rows
      .map((r) => r.id)
      .filter((id) => !validRowIds.includes(id));
    if (orphanIds.length > 0) {
      await dropRows(db, orphanIds);
    }

    if (items.length === 0) continue;

    const subject = digestSubject(items);
    const html = renderDigestEmail({
      recipientName: recipient.displayName,
      appUrl,
      items,
    });

    try {
      await sendEmail(env.RESEND_API_KEY, from, {
        to: recipient.email,
        subject,
        html,
      });
      await dropRows(db, validRowIds);
    } catch (err) {
      console.error(
        `[sendEmailDigests] send failed for ${recipient.email}:`,
        err,
      );
      await bumpAttempts(db, validRowIds);
    }
  }
}

async function dropRows(db: Database, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  await db
    .delete(pendingEmailNotifications)
    .where(inArray(pendingEmailNotifications.id, ids));
}

async function bumpAttempts(db: Database, ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  for (const id of ids) {
    const row = await db
      .select({ attempts: pendingEmailNotifications.attempts })
      .from(pendingEmailNotifications)
      .where(eq(pendingEmailNotifications.id, id))
      .limit(1);
    if (row.length === 0) continue;
    const next = row[0].attempts + 1;
    if (next >= MAX_ATTEMPTS) {
      console.error(
        `[sendEmailDigests] dropping notification ${id} after ${MAX_ATTEMPTS} failed attempts`,
      );
      await db
        .delete(pendingEmailNotifications)
        .where(eq(pendingEmailNotifications.id, id));
    } else {
      await db
        .update(pendingEmailNotifications)
        .set({ attempts: next })
        .where(eq(pendingEmailNotifications.id, id));
    }
  }
}
