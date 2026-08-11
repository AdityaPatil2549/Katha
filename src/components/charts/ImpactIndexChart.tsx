import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell
} from 'recharts';

interface StoryImpact {
  title: string;
  impact: number;
  emotional: number;
  intellectual: number;
  rewatch: number;
  recommendation: number;
}

interface ImpactScatter {
  x: number; // Rating
  y: number; // Impact Index
  title: string;
  category: string;
}

const CATEGORY_COLORS = {
  'anime': '#8B5CF6',
  'movie': '#22D3EE',
  'series': '#EC4899',
  'documentary': '#10B981',
  'youtube': '#F59E0B'
};

interface ImpactIndexChartProps {
  storyImpacts: StoryImpact[];
  scatterData: ImpactScatter[];
}

export function ImpactIndexChart({ storyImpacts, scatterData }: ImpactIndexChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="surface-elevated p-3 rounded-lg border border-midnight-border">
          <p className="text-text-primary font-medium">{data.title}</p>
          {data.category && (
            <p className="text-sm text-text-primary/70">Category: {data.category}</p>
          )}
          {data.impact !== undefined && (
            <p className="text-sm text-text-primary/70">Impact: {data.impact}</p>
          )}
          {data.rating !== undefined && (
            <p className="text-sm text-text-primary/70">Rating: {data.rating}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Impact Radar Chart */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Story Impact Analysis</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={storyImpacts}>
            <PolarGrid 
              gridType="polygon" 
              stroke="#232B45"
              radialLines={true}
            />
            <PolarAngleAxis 
              dataKey="title"
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              className="max-w-[100px]"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: '#9CA3AF' }}
            />
            <Radar
              name="Impact"
              dataKey="impact"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <Radar
              name="Emotional"
              dataKey="emotional"
              stroke="#EC4899"
              fill="#EC4899"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Radar
              name="Intellectual"
              dataKey="intellectual"
              stroke="#22D3EE"
              fill="#22D3EE"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Rating vs Impact Scatter */}
      <div className="surface-elevated rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Rating vs Impact Correlation</h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="#232B45" />
            <XAxis
              type="number"
              dataKey="x"
              name="Rating"
              unit="/10"
              domain={[0, 10]}
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              label={{ value: 'Rating', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Impact"
              unit="/100"
              domain={[0, 100]}
              stroke="#9CA3AF"
              tick={{ fill: '#9CA3AF' }}
              label={{ value: 'Impact Index', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter name="Stories" data={scatterData} fill="#8B5CF6">
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category as keyof typeof CATEGORY_COLORS] || '#6B7280'} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 justify-center">
          {Object.entries(CATEGORY_COLORS).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-text-primary/70 capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
