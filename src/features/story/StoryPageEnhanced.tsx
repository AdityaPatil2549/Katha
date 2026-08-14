import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Play, 
  Star, 
  Clock, 
  Calendar, 
  BookOpen, 
  MessageSquare,
  Plus,
  Edit,
  Trash2,
  Share2,
  BarChart3,
  Brain,
  Eye,
  Quote,
  Film,
  Tv,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { useStoriesStore, useMomentsStore } from '@/store';
import type { Story, Moment } from '@/types/models';
import { DataEntryModal, EntryType } from '@/components/modals/DataEntryModal';

import { tmdbService } from '@/services/TMDBService';
import { fanartService, FanartResult } from '@/services/FanartService';
import { mdblistService, MDBListRating } from '@/services/MDBListService';
import { watchmodeService } from '@/services/WatchmodeService';
import { youtubeService, YouTubeSearchResult } from '@/services/YouTubeService';

export default function StoryPageEnhanced() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { stories, loading, updateStory, deleteStory } = useStoriesStore();
  const { moments, addMoment, updateMoment, deleteMoment, getMomentsByStory } = useMomentsStore();

  const [story, setStory] = useState<Story | null>(null);
  const [showAddMoment, setShowAddMoment] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'moments' | 'knowledge' | 'stats'>('overview');

  const [showDataModal, setShowDataModal] = useState(false);
  const [modalType, setModalType] = useState<EntryType>('session');

  const [tmdbId, setTmdbId] = useState<number | null>(null);
  const [fanart, setFanart] = useState<FanartResult | null>(null);
  const [ratings, setRatings] = useState<MDBListRating[] | null>(null);
  const [trailer, setTrailer] = useState<YouTubeSearchResult | null>(null);
  const [streaming, setStreaming] = useState<{ primaryPlatform: string; allSourcesText: string } | null>(null);

  const handleSaveData = (data: any) => {
    console.log('Saved', modalType, data);
    alert(`${modalType} added successfully to this story!`);
  };

  useEffect(() => {
    const foundStory = stories.find(s => s.id === id);
    if (foundStory) {
      setStory(foundStory);
      if (id) getMomentsByStory(id);
    }
  }, [id, stories, getMomentsByStory]);

  // Rich Data Fetching
  useEffect(() => {
    if (!story) return;

    const fetchRichData = async () => {
      try {
        // 1. Get TMDB ID
        const searchRes = await tmdbService.search(story.title);
        if (searchRes && searchRes.length > 0) {
          const match = searchRes[0];
          if (!match) return;

          setTmdbId(match.id);
          
          const type = match.media_type === 'tv' ? 'tv' : 'movie';
          const fanartType = type === 'tv' ? 'tv' : 'movies';

          // 2. Fetch everything concurrently
          const [fanartData, ratingsData, streamData, trailerData] = await Promise.all([
            fanartService.getImages(match.id, fanartType),
            mdblistService.getRatings(match.id),
            watchmodeService.getSourcesByTmdbId(match.id, type),
            youtubeService.search(`${story.title} official trailer`)
          ]);

          if (fanartData) setFanart(fanartData);
          if (ratingsData && ratingsData.ratings) setRatings(ratingsData.ratings);
          if (streamData) setStreaming(watchmodeService.processSources(streamData));
          if (trailerData && trailerData.length > 0 && trailerData[0]) setTrailer(trailerData[0]);
        }
      } catch (err) {
        console.error("Failed to load rich data", err);
      }
    };

    fetchRichData();
  }, [story?.id, story?.title]);

  if (loading || !story) {
    return (
      <div className="min-h-screen bg-gradient-midnight flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const storyMoments = moments.filter(m => m.storyId === story.id);

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-32">
      {/* Central Glass Monolith */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <motion.div layoutId={`story-card-${story.id}`} className="glass-card overflow-hidden relative shadow-[0_0_80px_rgba(138,43,226,0.15)]">
      {/* Hero Header */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {(fanart?.movieposter?.[0]?.url || fanart?.tvposter?.[0]?.url || story.posterUrl) && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              transition={{ duration: 1.5 }}
              className="absolute inset-0 bg-cover bg-center blur-3xl mix-blend-overlay"
              style={{ backgroundImage: `url(${fanart?.movieposter?.[0]?.url || fanart?.tvposter?.[0]?.url || story.posterUrl})` }} 
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-midnight-bg via-midnight-surface/60 to-midnight-bg/40 backdrop-blur-md" />
          
          {/* Fanart HD Background Injection */}
          {(fanart?.hdmovieclearart?.[0]?.url || fanart?.hdtvclearart?.[0]?.url) && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 0.15, y: 0 }}
              transition={{ duration: 2 }}
              className="absolute top-10 right-10 w-2/3 h-1/2 bg-contain bg-no-repeat bg-right-top mix-blend-screen"
              style={{ backgroundImage: `url(${fanart?.hdmovieclearart?.[0]?.url || fanart?.hdtvclearart?.[0]?.url})` }}
            />
          )}
        </div>

        <div className="relative z-10 px-6 py-12 md:px-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
            
            {/* Poster */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                className="relative group"
              >
                <div className="aspect-[2/3] rounded-card overflow-hidden shadow-soft border border-midnight-border">
                  {story.posterUrl ? (
                    <img src={story.posterUrl} alt={story.title} 
                         className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-midnight-surface to-midnight-border flex items-center justify-center">
                      {story.category === 'movie' ? <Film className="w-16 h-16 text-text-muted" /> :
                       story.category === 'series' || story.category === 'anime' ? <Tv className="w-16 h-16 text-text-muted" /> :
                       <BookOpen className="w-16 h-16 text-text-muted" />}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Story Details */}
            <div className="lg:col-span-2 space-y-section">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-tight"
              >
                <motion.h1 layoutId={`story-title-${story.id}`} className="heading-1 font-serif text-primary mb-tight">{story.title}</motion.h1>
                
                <div className="flex items-center gap-4 text-body text-secondary">
                  <span className="capitalize">{story.category}</span>
                  <span>•</span>
                  <span>{story.releaseYear}</span>
                  <span>•</span>
                  <span>{story.platform}</span>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber fill-current" />
                    <span className="text-h3 font-semibold text-primary">{story.rating}</span>
                    <span className="text-small text-secondary">/10</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent-primary" />
                    <span className="text-h3 font-semibold text-accent-primary">{story.impactIndex}</span>
                    <span className="text-small text-secondary">Impact</span>
                  </div>
                </div>

                {story.notes && (
                  <p className="text-secondary leading-relaxed">{story.notes}</p>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
      </div>
      {/* Sticky Action Bar */}
      <div className="sticky top-0 z-10 bg-midnight-bg/90 backdrop-blur-md border-b border-midnight-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-small text-secondary">Status:</span>
                {(['planning', 'watching', 'completed', 'paused'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStory(story.id, { status })}
                    className={`px-3 py-1 rounded-chip text-small capitalize transition-all ${
                      story.status === status 
                        ? 'bg-accent-cyan text-midnight-bg' 
                        : 'bg-midnight-surface text-text-secondary hover:bg-midnight-surface-hover'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddMoment(true)} className="btn btn-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />Save Moment
              </button>
              <button onClick={() => { updateStory(story.id, { status: 'watching' }); alert('Resumed watching'); }} className="btn btn-secondary flex items-center gap-2">
                <Eye className="w-4 h-4" />Continue Watching
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-page">
        <div className="surface-elevated rounded-card overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-midnight-border bg-midnight-surface/50">
            {[
              { id: 'overview', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
              { id: 'sessions', label: 'Sessions', icon: <Clock className="w-4 h-4" /> },
              { id: 'moments', label: 'Moments', icon: <Quote className="w-4 h-4" /> },
              { id: 'knowledge', label: 'Knowledge', icon: <Lightbulb className="w-4 h-4" /> },
              { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-4 text-small font-medium transition-all border-b-2 ${
                  activeTab === tab.id 
                    ? 'text-accent-primary border-accent-primary bg-midnight-bg/50' 
                    : 'text-text-secondary border-transparent hover:text-primary hover:bg-midnight-surface/30'
                }`}
              >
                {tab.icon}{tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-section">
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-section">
                
                {/* Where to Watch & Trailer Section */}
                {(streaming?.primaryPlatform || trailer) && (
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-normal mb-section">
                    {/* Where to Watch */}
                    {streaming?.primaryPlatform && (
                      <div className="surface-interactive p-6 rounded-card hover:shadow-glow-cyan border border-white/5">
                        <h3 className="text-small font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Film className="w-4 h-4 text-accent-cyan" /> Where to Watch
                        </h3>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="px-4 py-2 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan font-bold shadow-[0_0_15px_rgba(0,242,254,0.2)]">
                            {streaming.primaryPlatform}
                          </div>
                          <span className="text-small text-secondary">Primary Platform</span>
                        </div>
                        {streaming.allSourcesText && (
                          <div className="text-sm text-secondary/80 whitespace-pre-wrap font-medium p-3 bg-black/40 rounded-lg">
                            {streaming.allSourcesText.replace('[Where to Watch]\n', '')}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Official Trailer */}
                    {trailer && (
                      <div className="surface-interactive p-6 rounded-card hover:shadow-glow-rose border border-white/5 flex flex-col justify-between">
                        <h3 className="text-small font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Play className="w-4 h-4 text-accent-rose" /> Official Trailer
                        </h3>
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-black mb-3 group cursor-pointer border border-white/10" 
                             onClick={() => window.open(`https://youtube.com/watch?v=${trailer.id}`, '_blank')}>
                          <img src={trailer.thumbnailUrl} alt="Trailer" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-accent-rose/20 backdrop-blur-sm border border-accent-rose/50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                              <Play className="w-6 h-6 text-white ml-1" />
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-text-muted truncate">{trailer.title}</p>
                      </div>
                    )}
                  </section>
                )}

                {/* Deep Analytics (MDBList) */}
                {ratings && ratings.length > 0 && (
                  <section className="mb-section">
                     <h3 className="text-small font-bold text-secondary uppercase tracking-wider mb-4 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-accent-emerald" /> Critical Consensus
                     </h3>
                     <div className="flex flex-wrap gap-3">
                       {ratings.map((r, i) => {
                         const getColors = (src: string) => {
                           switch(src.toLowerCase()) {
                             case 'imdb': return 'from-[#f5c518]/20 to-[#f5c518]/5 border-[#f5c518]/40 text-[#f5c518]';
                             case 'tomatoes': return 'from-[#fa320a]/20 to-[#fa320a]/5 border-[#fa320a]/40 text-[#fa320a]';
                             case 'metacritic': return 'from-[#66cc33]/20 to-[#66cc33]/5 border-[#66cc33]/40 text-[#66cc33]';
                             case 'letterboxd': return 'from-[#00e054]/20 to-[#00e054]/5 border-[#00e054]/40 text-[#00e054]';
                             case 'trakt': return 'from-[#ed1c24]/20 to-[#ed1c24]/5 border-[#ed1c24]/40 text-[#ed1c24]';
                             case 'tmdb': return 'from-[#01b4e4]/20 to-[#01b4e4]/5 border-[#01b4e4]/40 text-[#01b4e4]';
                             default: return 'from-white/10 to-transparent border-white/20 text-white';
                           }
                         };
                         const style = getColors(r.source);
                         return (
                           <div key={i} className={`flex items-center gap-3 px-4 py-2 rounded-xl bg-gradient-to-br ${style} border backdrop-blur-sm`}>
                             <span className="font-bold uppercase tracking-wider text-xs opacity-80">{r.source === 'imdb' ? 'IMDB' : r.source}</span>
                             <span className="text-lg font-bold">{r.value}{r.source === 'metacritic' || r.source === 'tomatoes' ? '%' : ''}</span>
                           </div>
                         );
                       })}
                     </div>
                  </section>
                )}

                <section>
                  <h2 className="heading-2 text-primary mb-section flex items-center gap-tight">
                    <Heart className="w-5 h-5 text-accent-rose" />
                    Why This Story Matters
                  </h2>
                  <div className="surface-interactive p-6 rounded-card border-l-4 border-accent-rose hover:shadow-[0_0_40px_rgba(255,0,127,0.2)]">
                    {story.notes ? <p className="text-secondary leading-relaxed">{story.notes}</p> :
                      <p className="text-text-muted italic">Why does this story matter to you? Add your personal reflection.</p>
                    }
                  </div>
                </section>


                <section>
                  <h3 className="heading-3 text-primary mb-section">Story Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-normal">
                    <div className="surface-interactive p-4 rounded-card hover:shadow-glow-cyan">
                      <div className="text-caption text-secondary mb-1">Category</div>
                      <div className="text-small font-medium capitalize text-primary">{story.category}</div>
                    </div>
                    <div className="surface-interactive p-4 rounded-card hover:shadow-glow-amber">
                      <div className="text-caption text-secondary mb-1">Rating</div>
                      <div className="text-small font-medium text-primary">{story.rating}/10</div>
                    </div>
                    <div className="surface-interactive p-4 rounded-card hover:shadow-[0_0_40px_rgba(138,43,226,0.2)]">
                      <div className="text-caption text-secondary mb-1">Impact Index</div>
                      <div className="text-small font-medium text-accent-primary">{story.impactIndex}</div>
                    </div>
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'moments' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-section">
                <div className="flex items-center justify-between">
                  <h2 className="heading-2 text-primary flex items-center gap-tight">
                    <Quote className="w-5 h-5 text-accent-cyan" />
                    Memory Moments ({storyMoments.length})
                  </h2>
                  <button onClick={() => setShowAddMoment(true)} className="btn btn-primary">
                    <Plus className="w-4 h-4 mr-2" />Save Moment
                  </button>
                </div>

                {storyMoments.length === 0 ? (
                  <div className="text-center py-12">
                    <Quote className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                    <h3 className="heading-3 text-primary mb-2">No Moments Yet</h3>
                    <p className="text-secondary mb-6">Capture memorable quotes, scenes, and thoughts from this story.</p>
                    <button onClick={() => setShowAddMoment(true)} className="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-3">
                      <Plus className="w-4 h-4" />Add Your First Moment
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-normal">
                    {storyMoments.map((moment) => (
                      <motion.div key={moment.id} initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="surface-interactive p-6 rounded-card hover:shadow-glow-cyan transition-all">
                        {moment.quote && (
                          <blockquote className="text-quote text-quote mb-4 border-l-4 border-accent-cyan pl-4">
                            "{moment.quote}"
                          </blockquote>
                        )}
                        {moment.character && <p className="text-small text-secondary mb-3">— {moment.character}</p>}
                        {moment.context && <p className="text-secondary mb-3">{moment.context}</p>}
                        {moment.thoughts && <p className="text-primary mb-4">{moment.thoughts}</p>}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 text-caption text-secondary">
                            {moment.mood && <span className={`chip chip-${moment.mood} chip-accent`}>{moment.mood}</span>}
                            <span>{new Date(moment.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => setShowAddMoment(true)} className="btn btn-ghost p-2"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteMoment(moment.id)} className="btn btn-ghost p-2 text-rose">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'stats' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-section">
                <h2 className="heading-2 text-primary flex items-center gap-tight">
                  <BarChart3 className="w-5 h-5 text-accent-emerald" />
                  Story Statistics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-normal">
                  <div className="surface-interactive p-6 rounded-card text-center hover:shadow-[0_0_40px_rgba(0,242,254,0.2)]">
                    <Clock className="w-8 h-8 text-accent-cyan mx-auto mb-3" />
                    <div className="text-caption text-secondary mb-1">Total Watch Time</div>
                    <div className="text-h2 font-semibold text-primary">
                      {Math.floor(story.watchTimeMinutes / 60)}h {story.watchTimeMinutes % 60}m
                    </div>
                  </div>
                  <div className="surface-interactive p-6 rounded-card text-center hover:shadow-[0_0_40px_rgba(138,43,226,0.2)]">
                    <Quote className="w-8 h-8 text-accent-primary mx-auto mb-3" />
                    <div className="text-caption text-secondary mb-1">Moments Captured</div>
                    <div className="text-h2 font-semibold text-primary">{storyMoments.length}</div>
                  </div>
                  <div className="surface-interactive p-6 rounded-card text-center hover:shadow-glow-amber">
                    <Star className="w-8 h-8 text-amber mx-auto mb-3" />
                    <div className="text-caption text-secondary mb-1">Your Rating</div>
                    <div className="text-h2 font-semibold text-primary">{story.rating}</div>
                  </div>
                  <div className="surface-interactive p-6 rounded-card text-center hover:shadow-[0_0_40px_rgba(0,250,154,0.2)]">
                    <TrendingUp className="w-8 h-8 text-accent-rose mx-auto mb-3" />
                    <div className="text-caption text-secondary mb-1">Impact Score</div>
                    <div className="text-h2 font-semibold text-primary">{story.impactIndex}</div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                <h3 className="heading-3 text-primary mb-2">Watch Sessions</h3>
                <p className="text-secondary mb-6">Track your viewing sessions and monitor your watching patterns.</p>
                <button onClick={() => { setModalType('session'); setShowDataModal(true); }} className="btn btn-primary"><Plus className="w-4 h-4 mr-2" />Add Session</button>
              </div>
            )}

            {activeTab === 'knowledge' && (
              <div className="text-center py-12">
                <Lightbulb className="w-16 h-16 mx-auto mb-4 text-text-muted" />
                <h3 className="heading-3 text-primary mb-2">Knowledge & Wisdom</h3>
                <p className="text-secondary mb-6">Extract lessons, principles, and insights from this story.</p>
                <button onClick={() => { setModalType('knowledge'); setShowDataModal(true); }} className="btn btn-primary"><Plus className="w-4 h-4 mr-2" />Add Knowledge</button>
              </div>
            )}
          </div>
        </div>
      </div>
      <DataEntryModal 
        isOpen={showDataModal} 
        onClose={() => setShowDataModal(false)} 
        onSubmit={handleSaveData}
        type={modalType} 
      />
    </div>
  );
}
