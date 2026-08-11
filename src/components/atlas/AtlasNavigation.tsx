import { Link } from 'react-router-dom';
import { Compass, Database, BookOpen, Sparkles, Heart, Brain, Users, Target, User, Lightbulb } from 'lucide-react';

export function AtlasNavigation() {
  return (
    <div className="surface-elevated rounded-xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Compass className="w-6 h-6 text-accent-primary" />
        <h2 className="text-xl font-semibold text-text-primary">Smriti Atlas</h2>
      </div>
      
      <p className="text-text-primary/70 mb-6">
        Your curated wisdom library of life-changing stories, films, and series designed to inspire and transform.
      </p>

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Link
          to="/atlas-installer"
          className="flex items-center gap-3 p-4 surface-elevated rounded-lg hover:surface-hover transition-all group"
        >
          <div className="p-2 bg-gradient-cyan/20 rounded-lg group-hover:bg-gradient-cyan/30 transition-colors">
            <Database className="w-5 h-5 text-cyan" />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-medium mb-1">Install Atlas</h3>
            <p className="text-text-primary/60 text-sm">Set up your wisdom library</p>
          </div>
        </Link>

        <Link
          to="/atlas"
          className="flex items-center gap-3 p-4 surface-elevated rounded-lg hover:surface-hover transition-all group"
        >
          <div className="p-2 bg-accent-primary/20 rounded-lg group-hover:bg-accent-primary/30 transition-colors">
            <BookOpen className="w-5 h-5 text-accent-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-medium mb-1">Browse Atlas</h3>
            <p className="text-text-primary/60 text-sm">Explore curated stories</p>
          </div>
        </Link>

        <Link
          to="/atlas/collections"
          className="flex items-center gap-3 p-4 surface-elevated rounded-lg hover:surface-hover transition-all group"
        >
          <div className="p-2 bg-gradient-amber/20 rounded-lg group-hover:bg-gradient-amber/30 transition-colors">
            <Sparkles className="w-5 h-5 text-amber" />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-medium mb-1">Editorial Collections</h3>
            <p className="text-text-primary/60 text-sm">Curated thematic journeys</p>
          </div>
        </Link>

        <Link
          to="/atlas/life-phases"
          className="flex items-center gap-3 p-4 surface-elevated rounded-lg hover:surface-hover transition-all group"
        >
          <div className="p-2 bg-gradient-emerald/20 rounded-lg group-hover:bg-gradient-emerald/30 transition-colors">
            <Users className="w-5 h-5 text-emerald" />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-medium mb-1">Life Phases</h3>
            <p className="text-text-primary/60 text-sm">Stories for your journey</p>
          </div>
        </Link>

        <Link
          to="/atlas/moods"
          className="flex items-center gap-3 p-4 surface-elevated rounded-lg hover:surface-hover transition-all group"
        >
          <div className="p-2 bg-gradient-rose/20 rounded-lg group-hover:bg-gradient-rose/30 transition-colors">
            <Heart className="w-5 h-5 text-rose" />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-medium mb-1">Mood Discovery</h3>
            <p className="text-text-primary/60 text-sm">Find stories for your feelings</p>
          </div>
        </Link>

        <Link
          to="/atlas/decision-engine"
          className="flex items-center gap-3 p-4 surface-elevated rounded-lg hover:surface-hover transition-all group"
        >
          <div className="p-2 bg-gradient-purple/20 rounded-lg group-hover:bg-gradient-purple/30 transition-colors">
            <Brain className="w-5 h-5 text-purple" />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-medium mb-1">Decision Engine</h3>
            <p className="text-text-primary/60 text-sm">What should I watch?</p>
          </div>
        </Link>

        <Link
          to="/atlas/profile"
          className="flex items-center gap-3 p-4 surface-elevated rounded-lg hover:surface-hover transition-all group"
        >
          <div className="p-2 bg-gradient-indigo/20 rounded-lg group-hover:bg-gradient-indigo/30 transition-colors">
            <User className="w-5 h-5 text-indigo" />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-medium mb-1">Personal Profile</h3>
            <p className="text-text-primary/60 text-sm">Your intelligence data</p>
          </div>
        </Link>

        <Link
          to="/atlas/wisdom"
          className="flex items-center gap-3 p-4 surface-elevated rounded-lg hover:surface-hover transition-all group"
        >
          <div className="p-2 bg-gradient-amber/20 rounded-lg group-hover:bg-gradient-amber/30 transition-colors">
            <Lightbulb className="w-5 h-5 text-amber" />
          </div>
          <div className="flex-1">
            <h3 className="text-text-primary font-medium mb-1">Wisdom Dashboard</h3>
            <p className="text-text-primary/60 text-sm">Knowledge & legacy</p>
          </div>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-4 bg-midnight-surface rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-accent-primary" />
            <span className="text-sm font-medium text-text-primary">How It Works</span>
          </div>
          <ul className="space-y-1 text-xs text-text-primary/60">
            <li>• Stories curated for emotional impact</li>
            <li>• Matched to your life stage</li>
            <li>• Aligned with your current mood</li>
            <li>• Designed for personal growth</li>
          </ul>
        </div>

        <div className="p-4 bg-midnight-surface rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-amber" />
            <span className="text-sm font-medium text-text-primary">Atlas Features</span>
          </div>
          <ul className="space-y-1 text-xs text-text-primary/60">
            <li>• 25+ life-changing stories</li>
            <li>• Editorial collections</li>
            <li>• Life phase recommendations</li>
            <li>• Mood-based discovery</li>
            <li>• Completely offline & private</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
