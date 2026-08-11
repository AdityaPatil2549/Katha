import { Virtuoso } from 'react-virtuoso';
import type { Story } from '@/types/models';
import { AccessibleButton } from '@/components/ui/AccessibleButton';
import { formatTimeAgo, formatProgress } from '@/utils/formatters';
import { FadeIn } from '@/components/ui/motion/FadeIn';

interface VirtualStoryListProps {
  stories: Story[];
  onStoryClick: (story: Story) => void;
  onContinue: (story: Story) => void;
  onFavorite: (story: Story) => void;
  onEdit: (story: Story) => void;
}

export function VirtualStoryList({
  stories,
  onStoryClick,
  onContinue,
  onFavorite,
  onEdit
}: VirtualStoryListProps) {
  const renderStory = (index: number, story: Story) => (
    <FadeIn delay={0.05 * (index % 10)} className="mb-4">
    <div
      key={story.id}
      className="card card-interactive p-4 cursor-pointer"
      onClick={() => onStoryClick(story)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onStoryClick(story);
        }
      }}
      aria-label={`Story: ${story.title}, Category: ${story.category}, Rating: ${story.rating}/10`}
    >
      <div className="flex gap-4">
        {/* Poster */}
        <div className="flex-shrink-0">
          {story.posterUrl ? (
            <img
              src={story.posterUrl}
              alt={`${story.title} poster`}
              className="w-16 h-24 object-cover rounded-md"
              loading="lazy"
            />
          ) : (
            <div className="w-16 h-24 bg-midnight-border rounded-md flex items-center justify-center">
              <span className="text-muted text-xs">No Poster</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-primary truncate">{story.title}</h3>
              <p className="text-sm text-secondary capitalize">{story.category}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted">{story.releaseYear}</span>
                <span className="text-xs text-muted">•</span>
                <span className="text-xs text-muted">{story.platform}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {story.favorite && (
                <span className="text-accent-rose" aria-label="Favorite">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M10 18l-1.45-1.32C3.4 12.36 0 9.28 0 5.5 0 2.42 2.42 0 5.5 0c1.74 0 3.41.81 4.5 2.09C11.09.81 12.76 0 14.5 0 17.58 0 20 2.42 20 5.5c0 3.78-3.4 6.86-8.55 11.18L10 18z"/>
                  </svg>
                </span>
              )}
              <span className="text-sm font-medium text-accent-primary">
                {story.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Progress */}
          {story.status === 'watching' && story.totalEpisodes && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-muted mb-1">
                <span>Progress</span>
                <span>{formatProgress(story.currentEpisode || 0, story.totalEpisodes)}</span>
              </div>
              <div className="w-full bg-midnight-border rounded-full h-1.5">
                <div
                  className="h-full w-1/3 animate-pulse rounded-full bg-gradient-cyan"
                  style={{ width: formatProgress(story.currentEpisode || 0, story.totalEpisodes) }}
                />
              </div>
            </div>
          )}

          {/* Tags and Moods */}
          {(story.tags.length > 0 || story.moods.length > 0) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {story.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="chip text-xs py-0.5"
                >
                  {tag}
                </span>
              ))}
              {story.moods.slice(0, 2).map((mood, idx) => (
                <span
                  key={idx}
                  className="chip chip-violet text-xs py-0.5"
                >
                  {mood}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            {story.status === 'watching' && (
              <AccessibleButton
                size="sm"
                variant="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onContinue(story);
                }}
                aria-label={`Continue watching ${story.title}`}
              >
                Continue
              </AccessibleButton>
            )}
            <AccessibleButton
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onFavorite(story);
              }}
              aria-label={`${story.favorite ? 'Remove from' : 'Add to'} favorites: ${story.title}`}
            >
              {story.favorite ? 'Unfavorite' : 'Favorite'}
            </AccessibleButton>
            <AccessibleButton
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(story);
              }}
              aria-label={`Edit story: ${story.title}`}
            >
              Edit
            </AccessibleButton>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      <div className="mt-3 text-xs text-muted">
        Updated {formatTimeAgo(story.updatedAt)}
      </div>
    </div>
    </FadeIn>
  );

  return (
    <div className="h-full">
      <Virtuoso
        data={stories}
        itemContent={renderStory}
        className="h-full"
        overscan={200}
        components={{
          Header: () => (
            <div className="p-4 border-b border-midnight-border mb-4">
              <h2 className="text-h3 font-semibold text-primary">
                Your Stories ({stories.length})
              </h2>
            </div>
          ),
          Footer: () => (
            <div className="p-4 text-center text-muted text-sm mt-4">
              End of your story library
            </div>
          )
        }}
      />
    </div>
  );
}
