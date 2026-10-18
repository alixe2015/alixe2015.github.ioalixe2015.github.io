export type SensoryDimension = 'tactile' | 'breath' | 'scent' | 'unspoken' | 'adventure';

export type PostcardTheme = 'warm-paper' | 'polaroid' | 'darkroom' | 'cool-mist' | 'sepia';

export interface ResonanceComment {
  id: string;
  name: string;
  text: string;
  time: string;
}

export interface SomaticAnchors {
  skinTemp: number; // 1 (冰凉发僵) to 10 (温热发烫)
  breathState: number; // 1 (浅短紧绷) to 10 (深沉舒展)
  heartRhythm: number; // 1 (微弱停顿) to 10 (悸动剧烈)
  vulnerability: number; // 1 (自我防备) to 10 (袒露真实)
  scentNote?: string;
}

export interface PostcardEntry {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  imageUrl: string;
  title: string;
  theme: PostcardTheme;
  moodTag: string;
  moodTemperature: number; // 1 (冷冽抽离) to 10 (热烈丰盈)
  sensoryDimension: SensoryDimension;
  promptQuestion: string;
  reflectionText: string;
  audioUrl?: string; // base64 or audio blob
  audioDuration?: number; // in seconds
  audioWaveformData?: number[]; // simulated or recorded waveform bars
  qrCodeDataUrl?: string;
  listenCount: number;
  resonances: ResonanceComment[];
  somaticAnchors?: SomaticAnchors;
  developedAt?: number; // timestamp when darkroom development completes
  isDeveloping?: boolean;
  fingerprintStamped?: boolean; // whether voice emotion fingerprint stamp is applied to postcard
  fingerprintStyle?: 'rings' | 'waves' | 'seal';
}

export interface GuidedPrompt {
  id: string;
  dimension: SensoryDimension;
  dimensionLabel: string;
  dimensionIcon: string;
  question: string;
  subHint: string;
}

export interface SensoryQuest {
  id: string;
  title: string;
  action: string;
  sensoryTarget: string;
  somaticFocus: string;
}
