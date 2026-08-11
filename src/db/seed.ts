import { formatISO, subDays } from 'date-fns';
import { db } from '@/db/KathaDb';
import { uuid } from '@/utils/id';
import type { Story, Moment, Session, Knowledge, TimelineEvent } from '@/types/models';

export async function seedIfEmpty() {
  const storyCount = await db.stories.count();
  if (storyCount > 0) return;

  const now = formatISO(new Date());
  const yesterday = formatISO(subDays(new Date(), 1));
  const twoDaysAgo = formatISO(subDays(new Date(), 2));
  const threeDaysAgo = formatISO(subDays(new Date(), 3));

  // Stories
  const stories: Story[] = [
    {
      id: uuid(),
      title: 'Vinland Saga',
      category: 'anime',
      status: 'watching',
      rating: 9,
      genre: ['action', 'drama', 'historical'],
      platform: 'Local',
      releaseYear: 2019,
      watchTimeMinutes: 450,
      currentEpisode: 18,
      totalEpisodes: 24,
      currentSeason: 1,
      totalSeasons: 2,
      notes: 'A profound story about violence, peace, and finding meaning.',
      tags: ['philosophy', 'character-development', 'historical'],
      favorite: true,
      impactIndex: 92,
      moods: ['thoughtful', 'emotional', 'inspired'],
      lifePhase: 'Growth Journey',
      createdAt: threeDaysAgo,
      updatedAt: yesterday
    },
    {
      id: uuid(),
      title: 'Attack on Titan',
      category: 'anime',
      status: 'completed',
      rating: 10,
      genre: ['action', 'dark-fantasy', 'post-apocalyptic'],
      platform: 'Local',
      releaseYear: 2013,
      watchTimeMinutes: 1440,
      totalEpisodes: 87,
      totalSeasons: 4,
      notes: 'Humanity\'s struggle for freedom against overwhelming odds.',
      tags: ['epic', 'dark', 'mystery'],
      favorite: true,
      impactIndex: 95,
      moods: ['intense', 'emotional', 'thoughtful'],
      lifePhase: 'College Era',
      createdAt: now,
      updatedAt: now
    },
    {
      id: uuid(),
      title: 'Demon Slayer',
      category: 'anime',
      status: 'watching',
      rating: 8,
      genre: ['action', 'dark-fantasy', 'historical'],
      platform: 'Local',
      releaseYear: 2019,
      watchTimeMinutes: 275,
      currentEpisode: 11,
      totalEpisodes: 26,
      currentSeason: 3,
      totalSeasons: 4,
      notes: 'Beautiful animation and heartfelt story about family bonds.',
      tags: ['beautiful-animation', 'family', 'supernatural'],
      favorite: false,
      impactIndex: 78,
      moods: ['emotional', 'inspired', 'calm'],
      lifePhase: 'Growth Journey',
      createdAt: twoDaysAgo,
      updatedAt: yesterday
    },
    {
      id: uuid(),
      title: 'Interstellar',
      category: 'movie',
      status: 'completed',
      rating: 9,
      genre: ['sci-fi', 'drama', 'adventure'],
      platform: 'Local',
      releaseYear: 2014,
      watchTimeMinutes: 169,
      notes: 'Love transcends dimensions. A masterpiece of sci-fi cinema.',
      tags: ['space', 'time', 'love', 'science'],
      favorite: true,
      impactIndex: 88,
      moods: ['inspired', 'thoughtful', 'emotional'],
      lifePhase: 'Lockdown Phase',
      createdAt: now,
      updatedAt: now
    },
    {
      id: uuid(),
      title: 'Spirited Away',
      category: 'movie',
      status: 'completed',
      rating: 9,
      genre: ['fantasy', 'coming-of-age', 'adventure'],
      platform: 'Local',
      releaseYear: 2001,
      watchTimeMinutes: 125,
      notes: 'A magical journey of self-discovery and courage.',
      tags: ['ghibli', 'magic', 'growth'],
      favorite: true,
      impactIndex: 85,
      moods: ['wonder', 'comfort', 'inspired'],
      lifePhase: 'Childhood',
      createdAt: now,
      updatedAt: now
    }
  ];

  // Moments
  const moments: Moment[] = [
    {
      id: uuid(),
      storyId: stories[0]!.id, // Vinland Saga
      season: 1,
      episode: 18,
      timestamp: '18:45',
      quote: "I have no enemies.",
      character: 'Thorfinn',
      context: 'Thorfinn realizes the true meaning of strength and peace.',
      thoughts: 'This moment changed my perspective on conflict and resolution. True strength isn\'t about defeating others, but about ending the cycle of violence.',
      mood: 'thoughtful',
      lifePhase: 'Growth Journey',
      date: yesterday,
      isPrivate: false
    },
    {
      id: uuid(),
      storyId: stories[3]!.id, // Interstellar
      timestamp: '2:28:15',
      quote: "Love is the one thing that transcends dimensions of time and space.",
      character: 'Brand',
      context: 'The realization that love is a quantifiable force that connects across dimensions.',
      thoughts: 'This scene perfectly captures the intersection of science and emotion. Love isn\'t just metaphorical - it\'s fundamental to the universe.',
      mood: 'inspired',
      lifePhase: 'Lockdown Phase',
      date: twoDaysAgo,
      isPrivate: false
    },
    {
      id: uuid(),
      storyId: stories[4]!.id, // Spirited Away
      timestamp: '1:15:30',
      quote: "Once you meet someone, you never really forget them.",
      character: 'Zeniba',
      context: 'The wisdom that connections with others leave lasting impressions.',
      thoughts: 'Such a simple yet profound truth about human connections and memory.',
      mood: 'emotional',
      lifePhase: 'Childhood',
      date: threeDaysAgo,
      isPrivate: false
    }
  ];

  // Sessions
  const sessions: Session[] = [
    {
      id: uuid(),
      storyId: stories[0]!.id, // Vinland Saga
      date: yesterday,
      duration: 45,
      mood: 'thoughtful',
      notes: 'Watched episode 18 - the "no enemies" scene was powerful'
    },
    {
      id: uuid(),
      storyId: stories[2]!.id, // Demon Slayer
      date: twoDaysAgo,
      duration: 25,
      mood: 'emotional',
      notes: 'The animation quality in episode 11 was stunning'
    },
    {
      id: uuid(),
      storyId: stories[3]!.id, // Interstellar
      date: threeDaysAgo,
      duration: 169,
      mood: 'inspired',
      notes: 'Rewatched with fresh perspective after learning more about physics'
    }
  ];

  // Knowledge
  const knowledge: Knowledge[] = [
    {
      id: uuid(),
      storyId: stories[0]!.id, // Vinland Saga
      lesson: 'True strength lies in ending violence, not perpetuating it.',
      principle: 'Peace over Revenge',
      reflection: 'Thorfinn\'s journey from revenge-seeking to peace-making shows that real courage is choosing not to fight.',
      date: yesterday
    },
    {
      id: uuid(),
      storyId: stories[3]!.id, // Interstellar
      lesson: 'Love is a fundamental force that transcends time and space.',
      principle: 'Love as Universal Constant',
      reflection: 'The film suggests that love isn\'t just emotion but a tangible force in the universe.',
      date: twoDaysAgo
    },
    {
      id: uuid(),
      storyId: stories[1]!.id, // Attack on Titan
      lesson: 'Freedom requires constant vigilance and sacrifice.',
      principle: 'Freedom Through Struggle',
      reflection: 'The series shows that freedom is never given - it must be fought for and protected.',
      date: threeDaysAgo
    }
  ];

  // Timeline Events
  const timeline: TimelineEvent[] = [
    {
      id: uuid(),
      type: 'watch',
      refId: sessions[0]!.id,
      date: yesterday,
      mood: 'thoughtful'
    },
    {
      id: uuid(),
      type: 'moment',
      refId: moments[0]!.id,
      date: yesterday,
      mood: 'thoughtful'
    },
    {
      id: uuid(),
      type: 'watch',
      refId: sessions[1]!.id,
      date: twoDaysAgo,
      mood: 'emotional'
    },
    {
      id: uuid(),
      type: 'moment',
      refId: moments[1]!.id,
      date: twoDaysAgo,
      mood: 'inspired'
    },
    {
      id: uuid(),
      type: 'finish',
      refId: stories[1]!.id,
      date: threeDaysAgo,
      mood: 'emotional'
    },
    {
      id: uuid(),
      type: 'knowledge',
      refId: knowledge[0]!.id,
      date: yesterday,
      mood: 'thoughtful'
    }
  ];

  // Add all data to database
  await db.transaction('rw', [db.stories, db.moments, db.sessions, db.knowledge, db.timeline], async () => {
    await db.stories.bulkAdd(stories);
    await db.moments.bulkAdd(moments);
    await db.sessions.bulkAdd(sessions);
    await db.knowledge.bulkAdd(knowledge);
    await db.timeline.bulkAdd(timeline);
  });

  console.log('Database seeded with sample data');
}
