// ─── App ─────────────────────────────────────────────────────────────────────

export type AppStatus = 'pending' | 'active' | 'flagged' | 'removed';
export type ScanStatus = 'queued' | 'scanning' | 'clean' | 'flagged';

export interface App {
  id: string;
  slug: string;
  title: string;
  tagline: string | null;
  description: string;
  how_to_run: string | null;
  demo_url: string | null;
  tags: string[];
  status: AppStatus;
  scan_status: ScanStatus;
  download_count: number;
  remix_count: number;
  parent_id: string | null;
  root_id: string | null;
  parent_version_id: string | null;
  creator_id: string;
  zip_path: string;
  preview_url: string | null;
  screenshots: string[];
  /** Parsed from the zip's package.json at upload time */
  packages: Record<string, string>;
  current_version_id: string | null;
  created_at: string;
  updated_at: string;
}

// ─── App Version ──────────────────────────────────────────────────────────────

export interface AppVersion {
  id: string;
  app_id: string;
  version_number: number;
  zip_path: string;
  changelog: string | null;
  scan_status: ScanStatus;
  created_at: string;
}

// ─── Comment ──────────────────────────────────────────────────────────────────

export interface Comment {
  id: string;
  app_id: string;
  user_id: string;
  body: string;
  created_at: string;
  deleted_at: string | null;
  /** Joined from profiles */
  profile?: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string; // matches auth.users.id
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

// ─── Download ─────────────────────────────────────────────────────────────────

export interface Download {
  id: string;
  app_id: string;
  /** nullable — anonymous downloads are allowed */
  downloader_id: string | null;
  created_at: string;
}

// ─── Report ──────────────────────────────────────────────────────────────────

export type ReportReason = 'spam' | 'malware' | 'copyright' | 'other';

export interface Report {
  id: string;
  app_id: string;
  reporter_id: string;
  reason: ReportReason;
  notes: string | null;
  created_at: string;
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export interface UploadPayload {
  title: string;
  tagline?: string;
  description: string;
  how_to_run?: string;
  demo_url?: string;
  tags: string[];
  /** Optional parent app id when this is a remix */
  parent_id?: string;
  parent_version_id?: string;
  /** Present when re-uploading an existing app */
  update_app_id?: string;
  changelog?: string;
}

export interface DownloadResponse {
  url: string;
  filename: string;
  expires_at: string;
}

export interface ReportPayload {
  app_id: string;
  reason: ReportReason;
  notes?: string;
}

// ─── Feed / pagination ────────────────────────────────────────────────────────

export interface FeedPage {
  apps: App[];
  next_cursor: string | null;
}
