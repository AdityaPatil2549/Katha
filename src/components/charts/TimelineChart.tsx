import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';

interface TimelineEvent {
  date: string;
  type: 'watch' | 'moment' | 'finish' | 'rewatch' | 'knowledge';
  storyTitle: string;
  mood?: string;
  impact?: number;
}

interface MoodTimeline {
  date: string;
  mood: number;
  stories: number;
  moments: number;
}

interface ActivityHeatmap {
  day: string;
  hour: number;
  activity: number;
}

const EVENT_COLORS = {
  'watch': '#22D3EE',
  'moment': '#EC4899',
  'finish': '#10B981',
  'rewatch': '#8B5CF6',
  'knowledge': '#F59E0B'
};

const MOOD_COLORS = {
  'Inspired': '#10B981',
  'Emotional': '#EC4899',
  'Thoughtful': '#8B5CF6',
  'Calm': '#22D3EE',
  'Intense': '#F59E0B',
  'Melancholic': '#6B7280'
};

interface TimelineChartProps {
  timelineEvents: TimelineEvent[];
  moodTimeline: MoodTimeline[];
  activityHeatmap: ActivityHeatmap[];
}

export function TimelineChart({ timelineEvents, moodTimeline, activityHeatmap }: TimelineChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="surface-elevated p-3 rounded-lg border border-midnight-border">
          <p className="text-text-primary font-medium">{label}</p>
          {data.storyTitle && (
            <p className="text-sm text-text-primary/70">{data.storyTitle}</p>
          )}
          {data.type && (
            <p className="text-sm text-text-primary/70">Type: {data.type}</p>
          )}
          {data.mood && (
            <p className="text-sm text-text-primary/70">Mood: {data.mood}</p>
          )}
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-text-primary/70">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Process timeline data for charts
  const eventsByDate = timelineEvents.reduce((acc, event) => {
    const date = event.date.split('T')[0] || '';
    if (!acc[date]) {
      acc[date] = { date, watch: 0, moment: 0, finish: 0, rewatch: 0, knowledge: 0 };
    }
    const eventDate = acc[date];
    switch (event.type) {
      case 'watch': eventDate.watch++; break;
      case 'moment': eventDate.moment++; break;
      case 'finish': eventDate.finish++; break;
      case 'rewatch': eventDate.rewatch++; break;
      case 'knowledge': eventDate.knowledge++; break;
    }
    return acc;
  }, {} as Record<string, any>);

  const timelineData = Object.values(eventsByDate);

  return (
    <div className="space-y-8">
      {/* Timeline Activity */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Story Timeline Activity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232B45" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="watch"
              stackId="1"
              stroke={EVENT_COLORS.watch}
              fill={EVENT_COLORS.watch}
              fillOpacity={0.6}
              name="Watching"
            />
            <Area
              type="monotone"
              dataKey="moment"
              stackId="1"
              stroke={EVENT_COLORS.moment}
              fill={EVENT_COLORS.moment}
              fillOpacity={0.6}
              name="Moments"
            />
            <Area
              type="monotone"
              dataKey="finish"
              stackId="1"
              stroke={EVENT_COLORS.finish}
              fill={EVENT_COLORS.finish}
              fillOpacity={0.6}
              name="Finished"
            />
            <Area
              type="monotone"
              dataKey="rewatch"
              stackId="1"
              stroke={EVENT_COLORS.rewatch}
              fill={EVENT_COLORS.rewatch}
              fillOpacity={0.6}
              name="Rewatched"
            />
            <Area
              type="monotone"
              dataKey="knowledge"
              stackId="1"
              stroke={EVENT_COLORS.knowledge}
              fill={EVENT_COLORS.knowledge}
              fillOpacity={0.6}
              name="Knowledge"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Mood Evolution */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Emotional Journey</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={moodTimeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232B45" />
            <XAxis 
              dataKey="date" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#EC4899"
              strokeWidth={3}
              dot={{ fill: '#EC4899', r: 6 }}
              name="Mood Score"
            />
            <Line
              type="monotone"
              dataKey="stories"
              stroke="#22D3EE"
              strokeWidth={2}
              dot={{ fill: '#22D3EE', r: 4 }}
              name="Stories"
            />
            <Line
              type="monotone"
              dataKey="moments"
              stroke="#8B5CF6"
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 4 }}
              name="Moments"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Event Type Distribution */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Event Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Object.entries(EVENT_COLORS).map(([type, color]) => {
            const count = timelineEvents.filter(e => e.type === type).length;
            return (
              <div key={type} className="text-center">
                <div 
                  className="w-16 h-16 rounded-lg mx-auto mb-2 flex items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <div 
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
                <p className="text-sm font-medium text-text-primary capitalize">{type}</p>
                <p className="text-2xl font-bold text-text-primary">{count}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Recent Activity</h3>
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {timelineEvents.slice(0, 10).map((event, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-midnight-surface/50">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: EVENT_COLORS[event.type] }}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{event.storyTitle}</p>
                <p className="text-xs text-text-primary/70 capitalize">{event.type} • {new Date(event.date).toLocaleDateString()}</p>
              </div>
              {event.mood && (
                <span className="px-2 py-1 bg-midnight-border rounded-full text-xs text-text-primary/70">
                  {event.mood}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
