import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Film, Play, Eye, Info } from 'lucide-react';
import { mdblistService, MDBListRating } from '@/services/MDBListService';
import { fanartService } from '@/services/FanartService';

export interface MediaCardProps {
  id: string | number;
  title: string;
  year?: number;
  type: 'movie' | 'show';
  posterUrl?: string;
  watchers?: number;
  onClick?: () => void;
}

export function MediaCard({ id, title, year, type, posterUrl, watchers, onClick }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [ratings, setRatings] = useState<MDBListRating[] | null>(null);
  const [fanartBg, setFanartBg] = useState<string | null>(null);
  const [fanartLogo, setFanartLogo] = useState<string | null>(null);
  const [isLoadingRichData, setIsLoadingRichData] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Determine the correct Fanart type ('movies' or 'tv')
  const fanartType = type === 'show' ? 'tv' : 'movies';

  useEffect(() => {
    // Only fetch rich data when hovered for the first time, to save bandwidth & API quotas
    if (isHovered && !hasFetched && id) {
      const fetchRichData = async () => {
        setIsLoadingRichData(true);
        try {
          // Fetch concurrently
          const [mdbRes, fanartRes] = await Promise.all([
            mdblistService.getRatings(id),
            fanartService.getImages(id, fanartType)
          ]);

          if (mdbRes && mdbRes.ratings) {
            setRatings(mdbRes.ratings);
          }

          if (fanartRes) {
            // Find clearart (logo)
            const cleararts = type === 'movie' ? fanartRes.hdmovieclearart : fanartRes.hdtvclearart;
            if (cleararts && cleararts.length > 0) {
              setFanartLogo(cleararts[0].url);
            }
            
            // Find a nice background or poster replacement if we want
            // Actually, we'll keep the TMDB poster as the main image, but maybe fade to a background?
            // Let's just use the logo for now to overlay on the poster!
          }
        } catch (error) {
          console.error("Failed to load rich media data", error);
        } finally {
          setIsLoadingRichData(false);
          setHasFetched(true);
        }
      };
      
      fetchRichData();
    }
  }, [isHovered, hasFetched, id, type, fanartType]);

  // Helper to map MDBList source to colors
  const getRatingStyle = (source: string) => {
    switch(source.toLowerCase()) {
      case 'imdb': return 'bg-[#f5c518] text-black border-[#f5c518]';
      case 'tomatoes': return 'bg-[#fa320a] text-white border-[#fa320a]';
      case 'metacritic': return 'bg-[#66cc33] text-white border-[#66cc33]';
      case 'letterboxd': return 'bg-[#00e054] text-[#14181c] border-[#00e054]';
      case 'trakt': return 'bg-[#ed1c24] text-white border-[#ed1c24]';
      case 'tmdb': return 'bg-[#01b4e4] text-white border-[#01b4e4]';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative min-w-[160px] max-w-[160px] sm:min-w-[200px] sm:max-w-[200px] snap-start shrink-0 cursor-pointer group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="h-[240px] sm:h-[300px] bg-midnight-surface rounded-[16px] overflow-hidden relative mb-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_25px_rgba(0,242,254,0.3)] transition-all duration-500 border border-white/5 group-hover:border-accent-cyan/30">
        
        {/* Base Poster */}
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-muted">
            <Film className="w-8 h-8 opacity-50" />
            <span className="text-xs uppercase tracking-wider font-bold">No Image</span>
          </div>
        )}

        {/* Watchers Badge */}
        {watchers && (
          <div className="absolute top-2 right-2 z-20">
            <div className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold text-accent-cyan border border-white/10 flex items-center gap-1 shadow-lg">
              <Eye className="w-3 h-3" />
              {watchers}
            </div>
          </div>
        )}

        {/* Hover Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-10 bg-gradient-to-t from-[#0f0e13] via-[#0f0e13]/80 to-transparent flex flex-col justify-end p-4"
            >
              {/* Fanart ClearArt Logo (if available) */}
              {fanartLogo && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-4 left-4 right-4 flex justify-center drop-shadow-[0_0_15px_rgba(0,0,0,0.8)]"
                >
                  <img src={fanartLogo} alt={title} className="max-h-[60px] object-contain" />
                </motion.div>
              )}

              {/* Rich Ratings Injection */}
              <div className="flex flex-col gap-2 mt-auto">
                {isLoadingRichData && !ratings && (
                  <div className="flex items-center gap-2 text-accent-cyan text-xs font-medium">
                    <div className="w-3 h-3 border-2 border-accent-cyan border-t-transparent rounded-full animate-spin" />
                    Fetching scores...
                  </div>
                )}

                {ratings && ratings.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap gap-1.5"
                  >
                    {ratings.slice(0, 4).map((rating, i) => (
                      <div 
                        key={i} 
                        className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded border ${getRatingStyle(rating.source)} shadow-sm uppercase tracking-wide flex items-center gap-1`}
                        title={`${rating.source}: ${rating.value}`}
                      >
                        {rating.source === 'imdb' ? 'IMDB' : rating.source.substring(0,4)} {rating.value}
                      </div>
                    ))}
                  </motion.div>
                )}
                
                <div className="mt-2 w-full">
                   <button className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-xs font-bold transition-colors border border-white/10 flex items-center justify-center gap-1.5">
                     <Info className="w-3 h-3" />
                     Details
                   </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="px-1">
        <h4 className="text-primary font-bold text-sm sm:text-base truncate group-hover:text-accent-cyan transition-colors">{title}</h4>
        {year && <p className="text-xs sm:text-sm text-secondary/80 font-medium">{year}</p>}
      </div>
    </motion.div>
  );
}
