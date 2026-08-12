export type StoryCategory = 'anime' | 'series' | 'movie' | 'documentary' | 'youtube' | 'game';
export type StoryStatus = 'planning' | 'watching' | 'completed' | 'paused';

export type UUID = string;

export type Story = {
  id: UUID;
  title: string;
  category: StoryCategory;
  status: StoryStatus;
  rating: number;
  genre: string[];
  platform: string;
  releaseYear?: number;
  posterUrl?: string;
  posterBlurhash?: string;
  watchTimeMinutes: number;
  currentEpisode?: number;
  totalEpisodes?: number;
  currentSeason?: number;
  totalSeasons?: number;
  notes: string;
  tags: string[];
  favorite: boolean;
  impactIndex: number;
  moods: string[];
  lifePhase?: string;
  createdAt: string;
  updatedAt: string;
};

export type Moment = {
  id: UUID;
  storyId: UUID;
  season?: number;
  episode?: number;
  timestamp?: string;
  quote?: string;
  character?: string;
  context: string;
  thoughts: string;
  mood?: string;
  lifePhase?: string;
  date: string;
  isPrivate: boolean;
};

export type Session = {
  id: UUID;
  storyId: UUID;
  date: string;
  duration: number;
  mood?: string;
  notes: string;
};

export type Knowledge = {
  id: UUID;
  storyId: UUID;
  lesson: string;
  principle: string;
  reflection: string;
  date: string;
};

export type TimelineEventType = 'watch' | 'moment' | 'finish' | 'rewatch' | 'knowledge';

export type TimelineEvent = {
  id: UUID;
  type: TimelineEventType;
  refId: UUID;
  date: string;
  mood?: string;
};

export type Settings = {
  id: UUID;
  key: string;
  value: any;
};

export type ApiCacheEntry = {
  id: string; // e.g., 'tmdb_/search/movie?query=interstellar'
  service: string; // 'tmdb', 'omdb', 'youtube'
  data: any;
  timestamp: number;
};
