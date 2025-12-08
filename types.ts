export enum Language {
  BM = 'Malay (Bahasa Melayu)',
  MANDARIN = 'Mandarin (Chinese)',
  AUTO = 'Detect Language'
}

export enum AppMode {
  TEXT = 'Text Translation',
  LIVE = 'Live Conversation'
}

export interface TranslationMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  language?: Language;
  timestamp: number;
}