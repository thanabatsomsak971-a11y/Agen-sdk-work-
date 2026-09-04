CREATE TABLE IF NOT EXISTS `subjects` (
  `id` text PRIMARY KEY NOT NULL,
  `owner_id` text,
  `kind` text NOT NULL,
  `label` text NOT NULL,
  `ctx` text NOT NULL DEFAULT '{}',
  `active` integer NOT NULL DEFAULT 1,
  `created_at` integer NOT NULL DEFAULT (unixepoch()),
  `updated_at` integer NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS `subjects_owner_idx` ON `subjects` (`owner_id`);
CREATE INDEX IF NOT EXISTS `subjects_kind_idx` ON `subjects` (`kind`);
CREATE INDEX IF NOT EXISTS `subjects_active_idx` ON `subjects` (`active`);

CREATE TABLE IF NOT EXISTS `reports` (
  `id` text PRIMARY KEY NOT NULL,
  `subject_id` text NOT NULL,
  `subject_kind` text NOT NULL,
  `status` text NOT NULL,
  `score` integer NOT NULL,
  `summary` text NOT NULL,
  `detail` text NOT NULL DEFAULT '{}',
  `ai_provider` text,
  `created_at` integer NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS `reports_subject_idx` ON `reports` (`subject_id`, `created_at`);
CREATE INDEX IF NOT EXISTS `reports_status_idx` ON `reports` (`status`);
CREATE INDEX IF NOT EXISTS `reports_created_idx` ON `reports` (`created_at`);
