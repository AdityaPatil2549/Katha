import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TextEffect } from '@/components/ui/motion/TextEffect';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Magnetic } from '@/components/ui/motion/Magnetic';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Play, 
  Film,
  Activity,
  TrendingUp,
  BarChart3,
  Flame,
  Award
} from 'lucide-react';
import { useMomentsStore, useStoriesStore } from '@/store';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday } from 'date-fns';

interface DayData {
  date: Date;
  count: number;
  duration: number;
  stories: string[];
  intensity: 'none' | 'low' | 'medium' | 'high' | 'binge';
}

export default function WatchCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const momentsStore: any = useMomentsStore();
  const { moments, sessions = [] } = momentsStore;
  const { stories } = useStoriesStore();

  // Calculate calendar data
  const calendarData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const dayDataMap = new Map<string, DayData>();
    
    // Initialize all days
    days.forEach(day => {
      dayDataMap.set(format(day, 'yyyy-MM-dd'), {
        date: day,
        count: 0,
        duration: 0,
        stories: [],
        intensity: 'none'
      });
    });
    
    // Process sessions
    sessions.forEach((session: any) => {
      const dateKey = format(session.date, 'yyyy-MM-dd');
      const existing = dayDataMap.get(dateKey);
      
      if (existing) {
        existing.count += 1;
        existing.duration += session.duration || 0;
        if (session.storyId && !existing.stories.includes(session.storyId)) {
          existing.stories.push(session.storyId);
        }
        
        // Determine intensity based on duration and count
        if (existing.duration > 240 || existing.count > 3) {
          existing.intensity = 'binge';
        } else if (existing.duration > 120 || existing.count > 2) {
          existing.intensity = 'high';
        } else if (existing.duration > 60 || existing.count > 1) {
          existing.intensity = 'medium';
        } else if (existing.duration > 0 || existing.count > 0) {
          existing.intensity = 'low';
        }
      }
    });
    
    return Array.from(dayDataMap.values());
  }, [currentMonth, sessions]);

  // Calculate month stats
  const monthStats = useMemo(() => {
    const totalDays = calendarData.filter(d => d.intensity !== 'none').length;
    const totalDuration = calendarData.reduce((sum, d) => sum + d.duration, 0);
    const totalSessions = calendarData.reduce((sum, d) => sum + d.count, 0);
    const bingeDays = calendarData.filter(d => d.intensity === 'binge').length;
    
    return {
      totalDays,
      totalDuration,
      totalSessions,
      bingeDays,
      avgDailyDuration: totalDays > 0 ? Math.round(totalDuration / totalDays) : 0
    };
  }, [calendarData]);

  // Get week days
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const firstDayOfMonth = getDay(startOfMonth(currentMonth));

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  // Get story titles
  const getStoryTitles = (storyIds: string[]) => {
    return storyIds.map(id => {
      const story = stories.find(s => s.id === id);
      return story?.title || 'Unknown Story';
    });
  };

  return (
    <div className="p-page min-h-screen bg-transparent pt-24 pb-32">
      <StaggerContainer>
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12">
          <div>
            <TextEffect
              preset="blur"
              per="word"
              className="font-serif text-5xl md:text-7xl font-bold text-text-primary leading-none mb-4 drop-shadow-2xl flex items-center gap-4"
              delay={0.1}
            >
              Temporal Engine
            </TextEffect>
            <TextEffect
              preset="fade-in-blur"
              per="line"
              className="font-sans text-lg text-text-muted max-w-xl font-light"
              delay={0.2}
            >
              Visualize your cinematic footprint across spacetime. Track binge pulses, active streaks, and watch sessions.
            </TextEffect>
          </div>
          
          <FadeIn delay={0.3}>
            <div className="glass-card rounded-[100px] p-2 inline-flex items-center gap-2 shadow-glass">
              <Magnetic>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-3 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-primary"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </Magnetic>
              
              <div className="w-[140px] text-center">
                <span className="font-semibold text-primary tracking-wide">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
              </div>
              
              <Magnetic>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-3 hover:bg-white/10 rounded-full transition-colors text-text-secondary hover:text-primary"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </Magnetic>

              <div className="w-px h-6 bg-white/10 mx-1"></div>

              <Magnetic>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-4 py-2 hover:bg-white/10 rounded-full transition-colors text-accent-cyan font-medium text-sm"
                >
                  Today
                </button>
              </Magnetic>
            </div>
          </FadeIn>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Main Calendar Grid */}
          <FadeIn delay={0.4} className="xl:col-span-8">
            <div className="glass-card rounded-card p-6 md:p-8 shadow-glass relative overflow-hidden h-full">
              {/* Subtle glowing orb in background */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10">
                {/* Week day headers */}
                <div className="grid grid-cols-7 gap-4 mb-6">
                  {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-bold tracking-widest uppercase text-text-muted">
                      {day}
                    </div>
                  ))}
                </div>
                
                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-3 md:gap-4">
                  {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                    <div key={`empty-${index}`} className="aspect-square" />
                  ))}
                  
                  {calendarData.map((dayData, index) => {
                    const isSelected = selectedDate && isSameDay(selectedDate, dayData.date);
                    const hasActivity = dayData.intensity !== 'none';
                    
                    return (
                      <div key={format(dayData.date, 'yyyy-MM-dd')} className="relative aspect-square flex items-center justify-center">
                        {isSelected && (
                          <motion.div
                            layoutId="active-day-ring"
                            className="absolute inset-0 border-2 border-accent-cyan rounded-full shadow-[0_0_15px_rgba(0,242,254,0.4)]"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                        
                        <button
                          onClick={() => setSelectedDate(dayData.date)}
                          className={`
                            relative w-full h-full rounded-full flex flex-col items-center justify-center group transition-all duration-300
                            ${!isSelected && 'hover:bg-white/5'}
                            ${isToday(dayData.date) ? 'font-bold text-accent-cyan' : 'text-primary'}
                          `}
                        >
                          <span className="text-sm md:text-base relative z-10">{format(dayData.date, 'd')}</span>
                          
                          {/* Intensity Orb */}
                          {hasActivity && (
                            <div className="absolute inset-2 md:inset-3 rounded-full opacity-30 group-hover:opacity-50 transition-opacity" style={{
                              background: 
                                dayData.intensity === 'binge' ? 'radial-gradient(circle, #F43F5E 0%, transparent 70%)' :
                                dayData.intensity === 'high' ? 'radial-gradient(circle, #F59E0B 0%, transparent 70%)' :
                                dayData.intensity === 'medium' ? 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' :
                                'radial-gradient(circle, #10B981 0%, transparent 70%)',
                              boxShadow: dayData.intensity === 'binge' ? '0 0 20px rgba(244,63,94,0.6)' : 'none'
                            }} />
                          )}

                          {/* Minimal Dot for Binge Indicator */}
                          {dayData.intensity === 'binge' && (
                            <div className="absolute bottom-[10%] w-1.5 h-1.5 bg-accent-rose rounded-full shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Inline Legend */}
                <div className="flex items-center justify-center gap-6 mt-10">
                  {[
                    { label: 'Light', color: '#10B981', shadow: 'rgba(16, 185, 129, 0.4)' },
                    { label: 'Medium', color: '#8B5CF6', shadow: 'rgba(139, 92, 246, 0.4)' },
                    { label: 'High', color: '#F59E0B', shadow: 'rgba(245, 158, 11, 0.4)' },
                    { label: 'Binge', color: '#F43F5E', shadow: 'rgba(244, 63, 94, 0.6)' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.shadow}` }} 
                      />
                      <span className="text-xs text-text-muted font-medium tracking-wide">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Right Side: Bento Box Stats & Detail View */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            
            {/* Bento Stats */}
            <FadeIn delay={0.5}>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card p-5 rounded-card shadow-glass flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-accent-cyan mb-3">
                    <Activity className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Active Days</span>
                  </div>
                  <div className="text-4xl font-bold text-primary">{monthStats.totalDays}</div>
                  <div className="text-xs text-text-muted mt-2">this month</div>
                </div>

                <div className="glass-card p-5 rounded-card shadow-glass flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-accent-emerald mb-3">
                    <Clock className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Total Time</span>
                  </div>
                  <div className="text-3xl font-bold text-primary truncate">{formatDuration(monthStats.totalDuration)}</div>
                  <div className="text-xs text-text-muted mt-2">logged</div>
                </div>

                <div className="glass-card p-5 rounded-card shadow-glass flex flex-col justify-between">
                  <div className="flex items-center gap-2 text-accent-primary mb-3">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Daily Avg</span>
                  </div>
                  <div className="text-3xl font-bold text-primary">{formatDuration(monthStats.avgDailyDuration)}</div>
                  <div className="text-xs text-text-muted mt-2">per day</div>
                </div>

                <div className="glass-card p-5 rounded-card shadow-glass flex flex-col justify-between bg-accent-rose/5 border-accent-rose/20">
                  <div className="flex items-center gap-2 text-accent-rose mb-3">
                    <Flame className="w-5 h-5" />
                    <span className="text-xs font-bold uppercase tracking-wider">Binge Days</span>
                  </div>
                  <div className="text-4xl font-bold text-accent-rose drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">{monthStats.bingeDays}</div>
                  <div className="text-xs text-text-muted mt-2">extreme watch</div>
                </div>
              </div>
            </FadeIn>

            {/* Selected Date Detail View */}
            <AnimatePresence mode="wait">
              {selectedDate ? (
                <motion.div
                  key={format(selectedDate, 'yyyy-MM-dd')}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  className="glass-card rounded-card p-6 shadow-glass relative overflow-hidden flex-1"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-cyan via-accent-primary to-accent-rose opacity-50" />
                  
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="font-serif text-2xl font-bold text-primary">
                        {format(selectedDate, 'MMMM d')}
                      </h3>
                      <p className="text-sm text-text-muted">{format(selectedDate, 'EEEE, yyyy')}</p>
                    </div>
                    {isToday(selectedDate) && (
                      <span className="px-3 py-1 bg-accent-cyan/20 text-accent-cyan text-xs font-bold uppercase tracking-wider rounded-full border border-accent-cyan/30">
                        Today
                      </span>
                    )}
                  </div>

                  {(() => {
                    const dateKey = format(selectedDate, 'yyyy-MM-dd');
                    const dayData = calendarData.find(d => format(d.date, 'yyyy-MM-dd') === dateKey);
                    
                    if (!dayData || dayData.intensity === 'none') {
                      return (
                        <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                          <div className="w-16 h-16 rounded-full bg-midnight-bg/50 flex items-center justify-center mb-4 border border-white/5">
                            <CalendarIcon className="w-6 h-6 text-text-muted" />
                          </div>
                          <p className="text-primary font-medium mb-1">No temporal traces found</p>
                          <p className="text-sm text-text-muted">The timeline is silent on this day.</p>
                        </div>
                      );
                    }
                    
                    return (
                      <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 rounded-xl bg-midnight-bg/40 border border-white/5">
                          <div className="flex-1">
                            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Total Time</div>
                            <div className="text-2xl font-bold text-accent-emerald">{formatDuration(dayData.duration)}</div>
                          </div>
                          <div className="w-px h-10 bg-white/10" />
                          <div className="flex-1">
                            <div className="text-xs text-text-muted uppercase tracking-wider mb-1">Sessions</div>
                            <div className="text-2xl font-bold text-primary">{dayData.count}</div>
                          </div>
                        </div>
                        
                        {dayData.stories.length > 0 && (
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <Film className="w-4 h-4 text-accent-primary" />
                              <h4 className="text-sm font-bold uppercase tracking-wider text-primary">Media Engaged</h4>
                            </div>
                            <div className="space-y-2">
                              {getStoryTitles(dayData.stories).map((title, index) => (
                                <div key={index} className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg flex items-center justify-between group hover:bg-white/10 transition-colors">
                                  <span className="text-sm text-primary font-medium truncate pr-4">{title}</span>
                                  <Award className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>
              ) : (
                <div className="glass-card rounded-card p-6 shadow-glass flex items-center justify-center h-[300px] border-dashed border-2 border-white/10">
                  <p className="text-text-muted text-sm tracking-wide">Select a date in the temporal engine</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </StaggerContainer>
    </div>
  );
}
