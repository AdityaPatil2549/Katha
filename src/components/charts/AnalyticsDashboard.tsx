import { useEffect, useMemo } from 'react';
import { useStoriesStore, useMomentsStore, useSessionsStore } from '@/store';
import { MoodAnalyticsChart } from './MoodAnalyticsChart';
import { StoryStatsChart } from './StoryStatsChart';
import { ImpactIndexChart } from './ImpactIndexChart';
import { TimelineChart } from './TimelineChart';

const MOOD_COLORS = ['#10B981', '#EC4899', '#8B5CF6', '#22D3EE', '#F59E0B', '#6B7280'];

export function AnalyticsDashboard() {
  const { allStories, loadStories } = useStoriesStore();
  const { moments, loadMoments } = useMomentsStore();
  const { sessions, loadSessions } = useSessionsStore();

  useEffect(() => {
    void loadStories();
    void loadMoments();
    void loadSessions();
  }, [loadStories, loadMoments, loadSessions]);

  const {
    moodData,
    timelineData,
    categoryData,
    storyImpacts,
    scatterData,
    watchTimeData,
    completionData,
    timelineEvents,
    moodTimeline,
    activityHeatmap,
  } = useMemo(() => {
    const moodMap = new Map<string, number>();
    moments.forEach((m) => {
      if (m.mood) {
        moodMap.set(m.mood, (moodMap.get(m.mood) || 0) + 1);
      }
    });
    const computedMoods = Array.from(moodMap.entries()).map(([mood, count], idx) => ({
      mood,
      count,
      color: MOOD_COLORS[idx % MOOD_COLORS.length] ?? '#38BDF8',
    }));

    const catMap = new Map<string, { count: number; minutes: number; ratingSum: number }>();
    allStories.forEach((s) => {
      const prev = catMap.get(s.category) || { count: 0, minutes: 0, ratingSum: 0 };
      catMap.set(s.category, {
        count: prev.count + 1,
        minutes: prev.minutes + (s.watchTimeMinutes || 0),
        ratingSum: prev.ratingSum + (s.rating || 0),
      });
    });
    const computedCategories = Array.from(catMap.entries()).map(([category, v]) => ({
      category,
      count: v.count,
      hours: Math.round(v.minutes / 60),
      avgRating: v.count > 0 ? Number((v.ratingSum / v.count).toFixed(1)) : 0,
    }));

    const computedImpacts = [...allStories]
      .sort((a, b) => (b.impactIndex || 0) - (a.impactIndex || 0))
      .slice(0, 6)
      .map((s) => ({
        title: s.title,
        impact: s.impactIndex || 0,
        emotional: Math.min(100, (s.moods?.length || 1) * 20),
        intellectual: Math.min(100, (s.tags?.length || 1) * 18),
        rewatch: s.favorite ? 85 : 40,
        recommendation: (s.rating || 0) * 10,
      }));

    const computedScatter = allStories.map((s) => ({
      x: s.rating || 0,
      y: s.impactIndex || 0,
      title: s.title,
      category: s.category,
    }));

    const byMonth = new Map<string, { hours: number; stories: Set<string>; completed: number; started: number; moments: number }>();
    sessions.forEach((sess) => {
      const d = new Date(sess.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = byMonth.get(key) || { hours: 0, stories: new Set<string>(), completed: 0, started: 0, moments: 0 };
      bucket.hours += (sess.duration || 0) / 60;
      bucket.stories.add(sess.storyId);
      byMonth.set(key, bucket);
    });
    allStories.forEach((st) => {
      const d = new Date(st.createdAt);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = byMonth.get(key) || { hours: 0, stories: new Set<string>(), completed: 0, started: 0, moments: 0 };
      bucket.started += 1;
      if (st.status === 'completed') bucket.completed += 1;
      byMonth.set(key, bucket);
    });
    moments.forEach((m) => {
      const d = new Date(m.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const bucket = byMonth.get(key) || { hours: 0, stories: new Set<string>(), completed: 0, started: 0, moments: 0 };
      bucket.moments += 1;
      byMonth.set(key, bucket);
    });

    const sortedMonths = Array.from(byMonth.entries()).sort(([a], [b]) => a.localeCompare(b));
    const computedWatchTime = sortedMonths.map(([date, b]) => ({
      date,
      hours: Number(b.hours.toFixed(1)),
      stories: b.stories.size,
    }));
    const computedCompletion = sortedMonths.map(([month, b]) => ({
      month,
      completed: b.completed,
      started: b.started,
      dropped: 0,
    }));
    const computedTimeline = sortedMonths.map(([date, b]) => ({
      date,
      stories: b.stories.size,
      moments: b.moments,
      mood: b.moments > 0 ? 7 : 5,
    }));

    const storyTitleMap = new Map(allStories.map((s) => [s.id, s.title]));
    const computedEvents = sessions.slice(0, 20).map((sess) => ({
      date: sess.date,
      type: 'watch' as const,
      storyTitle: storyTitleMap.get(sess.storyId) || 'Story',
      mood: sess.mood,
    }));

    const computedMoodTimeline = sortedMonths.map(([date, b]) => ({
      date,
      mood: b.moments > 0 ? 7 : 5,
      stories: b.started,
      moments: b.moments,
    }));

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const heatMapCounts = new Map<string, number>();
    sessions.forEach((sess) => {
      const d = new Date(sess.date);
      if (Number.isNaN(d.getTime())) return;
      const key = `${dayNames[d.getDay()]}_${d.getHours()}`;
      heatMapCounts.set(key, (heatMapCounts.get(key) || 0) + 1);
    });
    const computedHeatmap = Array.from(heatMapCounts.entries()).map(([k, activity]) => {
      const [day, hourStr] = k.split('_');
      return { day: day ?? 'Mon', hour: Number(hourStr), activity };
    });

    return {
      moodData: computedMoods,
      timelineData: computedTimeline,
      categoryData: computedCategories,
      storyImpacts: computedImpacts,
      scatterData: computedScatter,
      watchTimeData: computedWatchTime,
      completionData: computedCompletion,
      timelineEvents: computedEvents,
      moodTimeline: computedMoodTimeline,
      activityHeatmap: computedHeatmap,
    };
  }, [allStories, moments, sessions]);

  if (allStories.length === 0 && moments.length === 0 && sessions.length === 0) {
    return (
      <div className="surface-elevated p-8 rounded-card text-center">
        <h2 className="heading-2 text-primary mb-2">Your Story Analytics</h2>
        <p className="text-secondary">
          Add stories, moments, and viewing sessions to unlock live visualizations from your archive.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Your Story Analytics</h2>
        <p className="text-text-secondary">Live insights computed from your story vault</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-span-2">
          <StoryStatsChart
            watchTimeData={watchTimeData}
            categoryData={categoryData}
            completionData={completionData}
          />
        </div>

        <div>
          <MoodAnalyticsChart
            moodData={moodData}
            timelineData={timelineData}
            genreData={categoryData.map((item) => ({ ...item, genre: item.category }))}
          />
        </div>

        <div>
          <ImpactIndexChart
            storyImpacts={storyImpacts}
            scatterData={scatterData}
          />
        </div>

        <div className="lg:col-span-2">
          <TimelineChart
            timelineEvents={timelineEvents}
            moodTimeline={moodTimeline}
            activityHeatmap={activityHeatmap}
          />
        </div>
      </div>
    </div>
  );
}
