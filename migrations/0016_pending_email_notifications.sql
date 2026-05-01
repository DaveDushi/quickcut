CREATE TABLE `pending_email_notifications` (
  `id` text PRIMARY KEY NOT NULL,
  `recipient_user_id` text NOT NULL,
  `kind` text NOT NULL,
  `comment_id` text,
  `video_id` text NOT NULL,
  `attempts` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  FOREIGN KEY (`recipient_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`video_id`) REFERENCES `videos`(`id`) ON UPDATE no action ON DELETE cascade,
  CHECK (`kind` IN ('comment_uploader', 'comment_reply', 'video_ready'))
);

CREATE INDEX `pending_email_notifications_recipient_idx`
  ON `pending_email_notifications` (`recipient_user_id`);
