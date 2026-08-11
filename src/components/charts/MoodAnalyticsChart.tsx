import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

interface MoodData {
  mood: string;
  count: number;
  color: string;
}

interface TimelineData {
  date: string;
  stories: number;
  moments: number;
  mood: number;
}

interface GenreData {
  genre: string;
  count: number;
  hours: number;
}

const MOOD_COLORS = {
  'Inspired': '#10B981',
  'Emotional': '#EC4899',
  'Thoughtful': '#8B5CF6',
  'Calm': '#22D3EE',
  'Intense': '#F59E0B',
  'Melancholic': '#6B7280'
};

interface MoodAnalyticsChartProps {
  moodData: MoodData[];
  timelineData: TimelineData[];
  genreData: GenreData[];
}

export function MoodAnalyticsChart({ moodData, timelineData, genreData }: MoodAnalyticsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="surface-elevated p-3 rounded-lg border border-midnight-border">
          <p className="text-text-primary font-medium">{label}</p>
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

  return (
    <div className="space-y-8">
      {/* Mood Distribution */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Emotional Journey</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={moodData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ mood, percent }: any) => `${mood} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {moodData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline Activity */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Story Activity Timeline</h3>
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
              dataKey="stories"
              stackId="1"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.6}
              name="Stories"
            />
            <Area
              type="monotone"
              dataKey="moments"
              stackId="1"
              stroke="#22D3EE"
              fill="#22D3EE"
              fillOpacity={0.6}
              name="Moments"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Genre Preferences */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Genre Preferences</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={genreData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232B45" />
            <XAxis 
              dataKey="genre" 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <YAxis 
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#8B5CF6" name="Stories" />
            <Bar dataKey="hours" fill="#22D3EE" name="Hours" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Mood Trend */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Mood Evolution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={timelineData}>
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
              strokeWidth={2}
              dot={{ fill: '#EC4899', r: 4 }}
              name="Mood Score"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
