export interface ClipboardItem {
  id: string;
  pair_id: string;
  content: string; // Encrypted content
  content_type: 'text' | 'link' | 'file';
  source_device: string;
  file_name?: string;
  file_size?: number;
  file_mime_type?: string;
  created_at: string;
}

export interface DevicePair {
  id: string;
  name: string;
  encryption_salt: string;
  created_at: string;
}

export interface AppConfig {
  supabaseUrl: string;
  supabaseKey: string;
}
