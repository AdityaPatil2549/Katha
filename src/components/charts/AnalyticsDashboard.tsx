import { MoodAnalyticsChart } from './MoodAnalyticsChart';
import { StoryStatsChart } from './StoryStatsChart';
import { ImpactIndexChart } from './ImpactIndexChart';
import { TimelineChart } from './TimelineChart';

// Mock data for demonstration
const mockMoodData = [
  { mood: 'Inspired', count: 45, color: '#10B981' },
  { mood: 'Emotional', count: 32, color: '#EC4899' },
  { mood: 'Thoughtful', count: 28, color: '#8B5CF6' },
  { mood: 'Calm', count: 25, color: '#22D3EE' },
  { mood: 'Intense', count: 18, color: '#F59E0B' },
  { mood: 'Melancholic', count: 12, color: '#6B7280' }
];

const mockTimelineData = [
  { date: 'Jan 1', stories: 3, moments: 5, mood: 7 },
  { date: 'Jan 8', stories: 2, moments: 3, mood: 6 },
  { date: 'Jan 15', stories: 4, moments: 7, mood: 8 },
  { date: 'Jan 22', stories: 1, moments: 2, mood: 5 },
  { date: 'Jan 29', stories: 3, moments: 4, mood: 7 }
];

const mockGenreData = [
  { category: 'Anime', count: 15, hours: 45, avgRating: 8.5 },
  { category: 'Movie', count: 23, hours: 58, avgRating: 7.8 },
  { category: 'Series', count: 12, hours: 72, avgRating: 8.2 },
  { category: 'Documentary', count: 8, hours: 24, avgRating: 8.9 },
  { category: 'YouTube', count: 5, hours: 12, avgRating: 7.5 }
];

const mockStoryImpacts = [
  { title: 'Vinland Saga', impact: 92, emotional: 88, intellectual: 85, rewatch: 78, recommendation: 90 },
  { title: 'Interstellar', impact: 88, emotional: 92, intellectual: 95, rewatch: 85, recommendation: 88 },
  { title: 'Attack on Titan', impact: 85, emotional: 90, intellectual: 80, rewatch: 88, recommendation: 86 },
  { title: 'Your Name', impact: 82, emotional: 95, intellectual: 75, rewatch: 80, recommendation: 84 }
];

const mockScatterData = [
  { x: 9.0, y: 92, title: 'Vinland Saga', category: 'anime' },
  { x: 8.5, y: 88, title: 'Interstellar', category: 'movie' },
  { x: 9.2, y: 85, title: 'Attack on Titan', category: 'anime' },
  { x: 8.0, y: 82, title: 'Your Name', category: 'movie' },
  { x: 7.5, y: 78, title: 'Demon Slayer', category: 'anime' }
];

const mockWatchTimeData = [
  { date: 'Week 1', hours: 12, stories: 4 },
  { date: 'Week 2', hours: 18, stories: 6 },
  { date: 'Week 3', hours: 15, stories: 5 },
  { date: 'Week 4', hours: 22, stories: 8 }
];

const mockCompletionData = [
  { month: 'Jan', completed: 8, started: 12, dropped: 2 },
  { month: 'Feb', completed: 10, started: 14, dropped: 1 },
  { month: 'Mar', completed: 6, started: 9, dropped: 3 }
];

const mockTimelineEvents = [
  { date: '2024-01-15T10:00:00Z', type: 'watch' as const, storyTitle: 'Vinland Saga', mood: 'Inspired', impact: 92 },
  { date: '2024-01-15T12:30:00Z', type: 'moment' as const, storyTitle: 'Vinland Saga', mood: 'Thoughtful' },
  { date: '2024-01-16T20:00:00Z', type: 'finish' as const, storyTitle: 'Interstellar', mood: 'Emotional', impact: 88 },
  { date: '2024-01-17T19:00:00Z', type: 'rewatch' as const, storyTitle: 'Your Name', mood: 'Calm' },
  { date: '2024-01-18T21:00:00Z', type: 'knowledge' as const, storyTitle: 'Attack on Titan', mood: 'Inspired' }
];

const mockMoodTimeline = [
  { date: 'Jan 15', mood: 8, stories: 2, moments: 3 },
  { date: 'Jan 16', mood: 9, stories: 1, moments: 2 },
  { date: 'Jan 17', mood: 7, stories: 3, moments: 1 },
  { date: 'Jan 18', mood: 8, stories: 2, moments: 4 }
];

const mockActivityHeatmap = [
  { day: 'Mon', hour: 9, activity: 2 },
  { day: 'Mon', hour: 20, activity: 5 },
  { day: 'Tue', hour: 19, activity: 3 },
  { day: 'Wed', hour: 21, activity: 4 },
  { day: 'Thu', hour: 20, activity: 6 }
];

export function AnalyticsDashboard() {
  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Your Story Analytics</h2>
        <p className="text-text-primary/70">Insights from your entertainment journey</p>
      </div>

      {/* Main Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Story Statistics */}
        <div className="lg:col-span-2">
          <StoryStatsChart
            watchTimeData={mockWatchTimeData}
            categoryData={mockGenreData}
            completionData={mockCompletionData}
          />
        </div>

        {/* Mood Analytics */}
        <div>
          <MoodAnalyticsChart
            moodData={mockMoodData}
            timelineData={mockTimelineData}
            genreData={mockGenreData.map(item => ({ ...item, genre: item.category }))}
          />
        </div>

        {/* Impact Analysis */}
        <div>
          <ImpactIndexChart
            storyImpacts={mockStoryImpacts}
            scatterData={mockScatterData}
          />
        </div>

        {/* Timeline Analysis */}
        <div className="lg:col-span-2">
          <TimelineChart
            timelineEvents={mockTimelineEvents}
            moodTimeline={mockMoodTimeline}
            activityHeatmap={mockActivityHeatmap}
          />
        </div>
      </div>
    </div>
  );
}
