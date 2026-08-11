import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Database, CheckCircle, AlertCircle, HardDrive, Clock, Package } from 'lucide-react';
import { atlasRepository } from '@/db/repositories/AtlasRepository';
import { useNavigate } from 'react-router-dom';
import type { AtlasInstallerState, AtlasInstallerProgress } from '@/types/atlas';

// Sample dataset URL (in production, this would be a real URL)
const ATLAS_DATASET_URL = '/data/atlas-core-v1.json';

export function AtlasInstaller() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<AtlasInstallerProgress>({
    state: 'checking-storage',
    progress: 0,
    message: 'Checking storage space...'
  });

  const [isInstalled, setIsInstalled] = useState(false);
  const [datasetInfo, setDatasetInfo] = useState<{
    version: string;
    size: string;
    entries: number;
  } | null>(null);

  useEffect(() => {
    checkInstallationStatus();
  }, []);

  const checkInstallationStatus = async () => {
    try {
      const version = await atlasRepository.getDatasetVersion();
      const stats = await atlasRepository.getDatasetStats();
      
      if (version && stats.entries > 0) {
        setIsInstalled(true);
        setDatasetInfo({
          version,
          size: '~12.5 MB',
          entries: stats.entries
        });
        setProgress({
          state: 'complete',
          progress: 100,
          message: 'Smriti Atlas is installed and ready'
        });
      } else {
        setProgress({
          state: 'checking-storage',
          progress: 0,
          message: 'Ready to install Smriti Atlas'
        });
      }
    } catch (error) {
      setProgress({
        state: 'error',
        progress: 0,
        message: 'Error checking installation status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const checkStorageSpace = async (): Promise<boolean> => {
    // Check if we have enough storage (simplified check)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const availableSpace = estimate.quota ? estimate.quota - (estimate.usage || 0) : 0;
      return availableSpace > 50 * 1024 * 1024; // Need at least 50MB
    }
    return true; // Assume we have space if we can't check
  };

  const downloadDataset = async (): Promise<Response> => {
    // In development, we'll use a mock dataset
    if (import.meta.env.DEV) {
      // Return mock dataset
      return new Response(JSON.stringify(createMockDataset()), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    const response = await fetch(ATLAS_DATASET_URL);
    if (!response.ok) {
      throw new Error(`Failed to download dataset: ${response.statusText}`);
    }
    return response;
  };

  const installAtlas = async () => {
    try {
      // Step 1: Check storage
      setProgress({
        state: 'checking-storage',
        progress: 0,
        message: 'Checking storage space...'
      });

      const hasSpace = await checkStorageSpace();
      if (!hasSpace) {
        throw new Error('Not enough storage space available');
      }

      // Step 2: Download dataset
      setProgress({
        state: 'downloading',
        progress: 10,
        message: 'Downloading Smriti Atlas dataset...'
      });

      const response = await downloadDataset();
      const dataset = await response.json();

      setProgress({
        state: 'downloading',
        progress: 40,
        message: 'Dataset downloaded successfully'
      });

      // Step 3: Install to database
      setProgress({
        state: 'installing',
        progress: 50,
        message: 'Installing Smriti Atlas to local database...'
      });

      await atlasRepository.installDataset(dataset);

      setProgress({
        state: 'installing',
        progress: 90,
        message: 'Installation complete'
      });

      // Step 4: Verify installation
      setProgress({
        state: 'verifying',
        progress: 95,
        message: 'Verifying installation...'
      });

      const stats = await atlasRepository.getDatasetStats();
      if (stats.entries === 0) {
        throw new Error('Installation verification failed');
      }

      // Complete
      setProgress({
        state: 'complete',
        progress: 100,
        message: `Successfully installed ${stats.entries} stories!`
      });

      setIsInstalled(true);
      setDatasetInfo({
        version: dataset.meta.version,
        size: '~12.5 MB',
        entries: stats.entries
      });

    } catch (error) {
      setProgress({
        state: 'error',
        progress: 0,
        message: 'Installation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const getProgressIcon = () => {
    switch (progress.state) {
      case 'checking-storage':
        return <HardDrive className="w-6 h-6" />;
      case 'downloading':
        return <Download className="w-6 h-6" />;
      case 'installing':
        return <Database className="w-6 h-6" />;
      case 'verifying':
        return <Clock className="w-6 h-6" />;
      case 'complete':
        return <CheckCircle className="w-6 h-6" />;
      case 'error':
        return <AlertCircle className="w-6 h-6" />;
      default:
        return <Package className="w-6 h-6" />;
    }
  };

  const getProgressColor = () => {
    switch (progress.state) {
      case 'complete':
        return 'text-emerald';
      case 'error':
        return 'text-rose';
      default:
        return 'text-accent-primary';
    }
  };

  if (isInstalled && datasetInfo) {
    return (
      <div className="min-h-screen bg-midnight-bg flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="surface-elevated rounded-2xl p-8 max-w-md w-full text-center"
        >
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 text-emerald mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-text-primary mb-2">Smriti Atlas Installed</h1>
            <p className="text-text-primary/70">Your wisdom library is ready</p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-midnight-surface rounded-lg">
              <span className="text-text-primary/60">Version</span>
              <span className="text-text-primary font-medium">{datasetInfo.version}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-midnight-surface rounded-lg">
              <span className="text-text-primary/60">Stories</span>
              <span className="text-text-primary font-medium">{datasetInfo.entries.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-midnight-surface rounded-lg">
              <span className="text-text-primary/60">Size</span>
              <span className="text-text-primary font-medium">{datasetInfo.size}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/discover-world')}
            className="btn btn-primary w-full"
          >
            Explore Smriti Atlas
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-midnight-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="surface-elevated rounded-2xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className={`mb-4 ${getProgressColor()}`}>
            {getProgressIcon()}
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Smriti Atlas</h1>
          <p className="text-text-primary/70">Your curated wisdom library</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-text-primary/60">Progress</span>
            <span className="text-sm text-text-primary/60">{progress.progress}%</span>
          </div>
          <div className="w-full bg-midnight-border rounded-full h-2">
            <motion.div
              className="h-full bg-gradient-cyan rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${progress.progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="mb-8">
          <p className="text-center text-text-primary/80">{progress.message}</p>
          {progress.error && (
            <p className="text-center text-rose text-sm mt-2">{progress.error}</p>
          )}
        </div>

        <AnimatePresence mode="wait">
          {progress.state === 'checking-storage' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="p-4 bg-midnight-surface rounded-lg">
                <h3 className="font-medium text-text-primary mb-2">What is Smriti Atlas?</h3>
                <p className="text-sm text-text-primary/70 mb-4">
                  A curated collection of life-changing stories, films, and series 
                  designed to inspire, teach, and transform. Every entry is carefully 
                  selected for its wisdom and impact.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-text-primary/60">
                    <CheckCircle className="w-4 h-4 text-emerald" />
                    <span>100+ life-changing stories</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-primary/60">
                    <CheckCircle className="w-4 h-4 text-emerald" />
                    <span>Editor collections and themes</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-primary/60">
                    <CheckCircle className="w-4 h-4 text-emerald" />
                    <span>Life phase recommendations</span>
                  </div>
                  <div className="flex items-center gap-2 text-text-primary/60">
                    <CheckCircle className="w-4 h-4 text-emerald" />
                    <span>Completely offline and private</span>
                  </div>
                </div>
              </div>

              <button
                onClick={installAtlas}
                className="btn btn-primary w-full"
              >
                Install Smriti Atlas
              </button>
            </motion.div>
          )}

          {progress.state === 'error' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <button
                onClick={installAtlas}
                className="btn btn-primary w-full"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// Mock dataset for development
function createMockDataset() {
  return {
    meta: {
      name: "Smriti Atlas Core",
      version: "1.0.0",
      entries: 50,
      sizeMB: 12.5,
      createdAt: new Date(),
      curator: "Katha Editorial",
      license: "Personal Use Only"
    },
    entries: [
      {
        id: "1",
        title: "The Shawshank Redemption",
        category: "movie" as const,
        year: 1994,
        genres: ["Drama"],
        themes: ["hope", "friendship", "redemption", "perseverance"],
        impactTags: ["inspiring", "emotional", "life-changing"],
        difficulty: "medium" as const,
        emotionalTone: ["hopeful", "melancholic"],
        runtime: 142,
        description: "A banker sentenced to life in prison forms a friendship over decades.",
        whyWatch: "A masterclass in hope and the human spirit's resilience.",
        lifeLessons: ["Hope is a powerful force", "Friendship transcends boundaries", "Patience leads to redemption"],
        reflectionPrompts: ["What keeps you hopeful in difficult times?", "How do friendships shape your life?"],
        bestWatchedWhen: ["feeling hopeless", "seeking inspiration", "questioning justice"],
        recommendedAge: "16+",
        culturalImpact: "Considered one of the greatest films ever made.",
        createdBy: "Smriti Atlas Editorial",
        version: "atlas-core-v1"
      },
      // Add more entries as needed...
    ],
    collections: [],
    knowledge: [],
    lifePhases: [],
    moodMap: []
  };
}
