import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface WatchTimeData {
  date: string;
  hours: number;
  stories: number;
}

interface CategoryData {
  category: string;
  count: number;
  hours: number;
  avgRating: number;
}

interface CompletionData {
  month: string;
  completed: number;
  started: number;
  dropped: number;
}

const CATEGORY_COLORS = {
  'anime': '#8B5CF6',
  'movie': '#22D3EE', 
  'series': '#EC4899',
  'documentary': '#10B981',
  'youtube': '#F59E0B'
};

interface StoryStatsChartProps {
  watchTimeData: WatchTimeData[];
  categoryData: CategoryData[];
  completionData: CompletionData[];
}

export function StoryStatsChart({ watchTimeData, categoryData, completionData }: StoryStatsChartProps) {
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

  const totalHours = watchTimeData.reduce((sum, item) => sum + item.hours, 0);
  const totalStories = categoryData.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="surface-elevated rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary/70">Total Watch Time</p>
              <p className="text-2xl font-bold text-text-primary">{totalHours}h</p>
            </div>
            <div className="w-12 h-12 bg-accent-primary/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="surface-elevated rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary/70">Total Stories</p>
              <p className="text-2xl font-bold text-text-primary">{totalStories}</p>
            </div>
            <div className="w-12 h-12 bg-accent-cyan/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>
        </div>

        <div className="surface-elevated rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-primary/70">Avg Rating</p>
              <p className="text-2xl font-bold text-text-primary">
                {(categoryData.reduce((sum, item) => sum + item.avgRating, 0) / categoryData.length).toFixed(1)}
              </p>
            </div>
            <div className="w-12 h-12 bg-accent-rose/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-accent-rose" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Watch Time Trend */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Watch Time Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={watchTimeData}>
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
              dataKey="hours"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.3}
              strokeWidth={2}
              name="Hours Watched"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Story Categories</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || '#6B7280'} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Comparison */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Category Comparison</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232B45" />
            <XAxis 
              dataKey="category" 
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
            <Bar dataKey="avgRating" fill="#EC4899" name="Avg Rating" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Completion Rate */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Completion Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={completionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232B45" />
            <XAxis 
              dataKey="month" 
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
              dataKey="completed"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ fill: '#10B981' }}
              name="Completed"
            />
            <Line
              type="monotone"
              dataKey="started"
              stroke="#22D3EE"
              strokeWidth={2}
              dot={{ fill: '#22D3EE' }}
              name="Started"
            />
            <Line
              type="monotone"
              dataKey="dropped"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ fill: '#EF4444' }}
              name="Dropped"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
