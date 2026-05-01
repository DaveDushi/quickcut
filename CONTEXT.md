# Context

Wellrox Video Review is **in-house software** at Wellrox — not a public SaaS. This file records domain language that isn't obvious from the code.

## Glossary

### Launchpad

The unauthenticated `/` route (`src/pages/index.astro`). The internal-staff entry surface — sign-in, register, and quick-action links into the app. **Not a marketing page.** No acquisition copy, no pricing, no prospect FAQ. Signed-in users redirect straight to `/dashboard` and never see it.

### Wellrox staff

A user with a `@wellrox.com` email address. Self-serve registers at `/register` without an invite. Sees the launchpad before signing in.

### External collaborator

A non-staff user invited into a Space. Cannot self-serve register; the only path to an account is an **invite token** delivered via `/invites/[token]`. Once accepted, behaves like any other authenticated member of the spaces they were invited into.

### Reviewer (anonymous)

Someone using a public **share link** (`/s/[token]`). Enters a display name on page load, leaves timestamped comments, never creates an account, never sees the launchpad. Revoking the share link is the only way to remove their access.

### Space

A workspace scoping members, videos, version stacks, invites, and required-approval settings. One Space per team or client. Switching Space switches the current scope across the whole app.

### Version stack

The ordered set of cuts uploaded against the same logical video. Comments, share links, and approvals are pinned to a specific version, not the stack as a whole.

### Cut

Informal team term for a single uploaded video version. Used in UI copy ("Upload a cut", "12 cuts in review") because "video" is overloaded — every Space has many videos, and editors think in cuts.
