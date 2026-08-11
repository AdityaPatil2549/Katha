import Dexie, { type Table } from 'dexie';
import type { Knowledge, Moment, Session, Story, TimelineEvent } from '@/types/models';

export class KathaDb extends Dexie {
  stories!: Table<Story, string>;
  moments!: Table<Moment, string>;
  sessions!: Table<Session, string>;
  knowledge!: Table<Knowledge, string>;
  timeline!: Table<TimelineEvent, string>;

  constructor() {
    super('katha');

    this.version(1).stores({
      stories: 'id, category, status, favorite, impactIndex, updatedAt, createdAt, *tags, *moods',
      moments: 'id, storyId, date, mood, isPrivate',
      sessions: 'id, storyId, date, duration, mood',
      knowledge: 'id, storyId, date',
      timeline: 'id, type, refId, date, mood'
    });

    // Version 2: Added as migration scaffolding
    // Any future schema changes must be added to a new version block.
    this.version(2).stores({
      stories: 'id, category, status, favorite, impactIndex, updatedAt, createdAt, *tags, *moods',
      moments: 'id, storyId, date, mood, isPrivate',
      sessions: 'id, storyId, date, duration, mood',
      knowledge: 'id, storyId, date',
      timeline: 'id, type, refId, date, mood'
    }).upgrade(tx => {
      // Future data migrations go here
    });
  }
}

export const db = new KathaDb();
