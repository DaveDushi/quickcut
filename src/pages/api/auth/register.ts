import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { createDb } from "../../../db";
import { users, spaces, spaceMembers, spaceInvites } from "../../../db/schema";
import { hashPassword, createSession, makeSessionCookie } from "../../../lib/auth";
import { and, eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request, redirect }) => {
  const db = createDb(env.DB);

  let email: string;
  let password: string;
  let confirmPassword: string;
  let displayName: string;
  let inviteToken: string | undefined;

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const body = await request.json();
    email = body.email?.trim().toLowerCase();
    password = body.password;
    confirmPassword = body.confirmPassword;
    displayName = body.displayName?.trim();
    inviteToken = body.inviteToken?.trim() || undefined;
  } else {
    const formData = await request.formData();
    email = (formData.get("email") as string)?.trim().toLowerCase();
    password = formData.get("password") as string;
    confirmPassword = formData.get("confirmPassword") as string;
    displayName = (formData.get("displayName") as string)?.trim();
    inviteToken = (formData.get("inviteToken") as string)?.trim() || undefined;
  }

  const errorRedirect = (msg: string) => {
    const path = inviteToken
      ? `/register?inviteToken=${encodeURIComponent(inviteToken)}&error=${encodeURIComponent(msg)}`
      : `/register?error=${encodeURIComponent(msg)}`;
    return redirect(path);
  };

  // Validation
  if (!email || !password || !confirmPassword || !displayName) {
    return errorRedirect("All fields are required");
  }

  if (password.length < 8) {
    return errorRedirect("Password must be at least 8 characters");
  }

  if (password !== confirmPassword) {
    return errorRedirect("Passwords do not match");
  }

  // Resolve invite (if any) before doing the domain check, so that a valid
  // invite token bypasses the @wellrox.com whitelist for external collaborators.
  let invite: typeof spaceInvites.$inferSelect | null = null;
  if (inviteToken) {
    const found = await db
      .select()
      .from(spaceInvites)
      .where(eq(spaceInvites.token, inviteToken))
      .limit(1);
    invite = found[0] ?? null;

    if (!invite) {
      return errorRedirect("This invite link is invalid or has expired");
    }
    if (invite.status !== "pending") {
      return errorRedirect(`This invite has already been ${invite.status}`);
    }
    if (invite.email.toLowerCase() !== email) {
      return errorRedirect("Email must match the invited address");
    }
  }

  if (!invite && !email.endsWith("@wellrox.com")) {
    return errorRedirect("Wellrox Video Review is limited to wellrox.com email addresses");
  }

  // Check if email exists
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return errorRedirect("An account with this email already exists");
  }

  // Create user
  const passwordHash = await hashPassword(password);
  const userId = crypto.randomUUID();

  await db.insert(users).values({
    id: userId,
    email,
    passwordHash,
    displayName,
  });

  if (invite) {
    // External invitee path: join the inviting space directly, mark invite accepted.
    // No Personal space is created — the invite is the trust boundary.
    const existingMembership = await db
      .select({ id: spaceMembers.id })
      .from(spaceMembers)
      .where(
        and(
          eq(spaceMembers.spaceId, invite.spaceId),
          eq(spaceMembers.userId, userId),
        ),
      )
      .limit(1);

    if (existingMembership.length === 0) {
      await db.insert(spaceMembers).values({
        id: crypto.randomUUID(),
        spaceId: invite.spaceId,
        userId,
        role: "member",
      });
    }

    await db
      .update(spaceInvites)
      .set({ status: "accepted", acceptedAt: new Date().toISOString() })
      .where(eq(spaceInvites.id, invite.id));
  } else {
    // Self-serve @wellrox.com path: create a default Personal space.
    const spaceId = crypto.randomUUID();
    await db.insert(spaces).values({
      id: spaceId,
      name: "Personal",
      ownerId: userId,
      requiredApprovals: 0,
    });

    await db.insert(spaceMembers).values({
      id: crypto.randomUUID(),
      spaceId,
      userId,
      role: "owner",
    });
  }

  // Create session
  const sessionId = await createSession(db, userId);
  const cookie = makeSessionCookie(sessionId);

  const redirectTo = invite ? `/dashboard?space=${invite.spaceId}` : "/dashboard";

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": cookie,
    },
  });
};
