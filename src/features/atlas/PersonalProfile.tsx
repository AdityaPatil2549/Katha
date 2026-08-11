import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { Dropdown } from '@/components/ui/Dropdown';
import { User, Brain, Heart, Target, TrendingUp, Calendar, Clock, Star, BookOpen, Settings, ChevronRight, Save, Edit2 } from 'lucide-react';
import { personalRepository } from '@/db/repositories/PersonalRepository';
import type { PersonalProfile, EmotionalProfile, StoryPreferences, LearningProfile } from '@/types/personal';

export function PersonalProfile() {
  const [profile, setProfile] = useState<PersonalProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'emotional' | 'preferences' | 'learning'>('overview');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const existingProfile = await personalRepository.getProfile();
      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        // Create initial profile
        const newProfile = await createInitialProfile();
        setProfile(newProfile);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createInitialProfile = async (): Promise<PersonalProfile> => {
    const initialProfile: Omit<PersonalProfile, 'id' | 'createdAt' | 'updatedAt'> = {
      lifePhase: 'Career',
      interests: [],
      emotionalProfile: {
        currentMood: 'neutral',
        energyLevel: 5,
        stressLevel: 5,
        opennessLevel: 7,
        moodPatterns: {
          morning: [],
          afternoon: [],
          evening: [],
          weekend: []
        },
        positiveTriggers: [],
        negativeTriggers: [],
        selfAwareness: 5,
        emotionalRegulation: 5,
        empathy: 6
      },
      moodHistory: [],
      storyPreferences: {
        preferredCategories: [],
        preferredGenres: [],
        preferredThemes: [],
        avoidedThemes: [],
        preferredDifficulty: ['medium'],
        preferredLength: 'medium',
        preferredPace: 'moderate',
        seekingImpacts: ['inspiring', 'thought-provoking'],
        avoidingImpacts: ['depressing'],
        learningStyle: 'visual',
        reflectionStyle: 'immediate'
      },
      viewingHistory: [],
      learningProfile: {
        bestLearningTimes: ['evening'],
        focusDuration: 45,
        comprehensionLevel: 6,
        shortTermMemory: 6,
        longTermRetention: 7,
        associationStrength: 6,
        analyticalVsIntuitive: 0,
        concreteVsAbstract: 2,
        sequentialVsGlobal: -1,
        growthMindset: 7,
        curiosity: 8,
        adaptability: 6
      },
      impactResponses: [],
      personalGoals: [],
      growthAreas: []
    };

    const id = await personalRepository.createProfile(initialProfile);
    return { ...initialProfile, id, createdAt: new Date(), updatedAt: new Date() };
  };

  const saveProfile = async () => {
    if (!profile) return;
    
    setSaving(true);
    try {
      await personalRepository.updateProfile({
        ...profile,
        updatedAt: new Date()
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateEmotionalProfile = (updates: Partial<EmotionalProfile>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      emotionalProfile: { ...profile.emotionalProfile, ...updates }
    });
  };

  const updateStoryPreferences = (updates: Partial<StoryPreferences>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      storyPreferences: { ...profile.storyPreferences, ...updates }
    });
  };

  const updateLearningProfile = (updates: Partial<LearningProfile>) => {
    if (!profile) return;
    setProfile({
      ...profile,
      learningProfile: { ...profile.learningProfile, ...updates }
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-midnight flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-accent-primary animate-spin mb-4" />
          <p className="text-secondary">Loading Personal Profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const lifePhases = [
    { value: 'College', label: 'College/University' },
    { value: 'Career', label: 'Career Building' },
    { value: 'Midlife', label: 'Midlife Journey' },
    { value: 'Rebuilding', label: 'Rebuilding Phase' },
    { value: 'Retirement', label: 'Retirement' }
  ];

  const moods = [
    { value: 'terrible', label: 'Terrible', color: 'text-rose' },
    { value: 'bad', label: 'Bad', color: 'text-orange' },
    { value: 'neutral', label: 'Neutral', color: 'text-yellow' },
    { value: 'good', label: 'Good', color: 'text-emerald' },
    { value: 'excellent', label: 'Excellent', color: 'text-cyan' }
  ];

  const categories = [
    { value: 'movie', label: 'Movies' },
    { value: 'series', label: 'TV Series' },
    { value: 'anime', label: 'Anime' },
    { value: 'documentary', label: 'Documentaries' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'heavy', label: 'Heavy' }
  ];

  const lengths = [
    { value: 'short', label: 'Short (< 1 hour)' },
    { value: 'medium', label: 'Medium (1-2 hours)' },
    { value: 'long', label: 'Long (> 2 hours)' }
  ];

  const impacts = [
    { value: 'inspiring', label: 'Inspiring' },
    { value: 'thought-provoking', label: 'Thought-provoking' },
    { value: 'emotional', label: 'Emotional' },
    { value: 'educational', label: 'Educational' },
    { value: 'entertaining', label: 'Entertaining' },
    { value: 'relaxing', label: 'Relaxing' },
    { value: 'motivating', label: 'Motivating' },
    { value: 'challenging', label: 'Challenging' }
  ];

  return (
    <div className="min-h-screen bg-gradient-midnight p-page">
      <div className="max-w-6xl mx-auto">
        <StaggerContainer>
        {/* Header */}
        <BlurReveal>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-page gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-violet rounded-xl shadow-elevation">
              <User className="w-8 h-8 text-text-primary" />
            </div>
            <div>
              <h1 className="heading-1 text-primary">Personal Profile</h1>
              <p className="text-secondary">Your personal intelligence and preferences</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {isEditing && (
              <button
                onClick={saveProfile}
                disabled={saving}
                className="btn btn-primary flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save'}
              </button>
            )}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Edit2 className="w-4 h-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </button>
          </div>
        </div>
        </BlurReveal>

        <FadeIn>
        <div className="flex gap-2 mb-8 border-b border-midnight-border">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'emotional', label: 'Emotional', icon: Heart },
            { id: 'preferences', label: 'Preferences', icon: BookOpen },
            { id: 'learning', label: 'Learning', icon: Brain }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'overview' | 'emotional' | 'preferences' | 'learning')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-accent-primary text-accent-primary'
                  : 'border-transparent text-text-primary/60 hover:text-text-primary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="grid gap-6 md:grid-cols-2"
            >
              <div className="surface-elevated rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-accent-primary" />
                  Basic Information
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Life Phase</label>
                    {isEditing ? (
                      <Dropdown
                        value={profile.lifePhase}
                        onChange={(val) => setProfile({ ...profile, lifePhase: val as PersonalProfile['lifePhase'] })}
                        options={lifePhases}
                      />
                    ) : (
                      <p className="text-text-primary/70">{lifePhases.find(p => p.value === profile.lifePhase)?.label}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Current Mood</label>
                    {isEditing ? (
                      <Dropdown
                        value={profile.emotionalProfile.currentMood}
                        onChange={(val) => updateEmotionalProfile({ currentMood: val })}
                        options={moods.map(m => ({ value: m.value, label: m.label }))}
                      />
                    ) : (
                      <p className={`font-medium ${moods.find(m => m.value === profile.emotionalProfile.currentMood)?.color}`}>
                        {moods.find(m => m.value === profile.emotionalProfile.currentMood)?.label}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-primary/80 mb-2">Energy</label>
                      {isEditing ? (
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={profile.emotionalProfile.energyLevel}
                          onChange={(e) => updateEmotionalProfile({ energyLevel: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      ) : (
                        <p className="text-text-primary/70">{profile.emotionalProfile.energyLevel}/10</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary/80 mb-2">Stress</label>
                      {isEditing ? (
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={profile.emotionalProfile.stressLevel}
                          onChange={(e) => updateEmotionalProfile({ stressLevel: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      ) : (
                        <p className="text-text-primary/70">{profile.emotionalProfile.stressLevel}/10</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-primary/80 mb-2">Openness</label>
                      {isEditing ? (
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={profile.emotionalProfile.opennessLevel}
                          onChange={(e) => updateEmotionalProfile({ opennessLevel: parseInt(e.target.value) })}
                          className="w-full"
                        />
                      ) : (
                        <p className="text-text-primary/70">{profile.emotionalProfile.opennessLevel}/10</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="surface-elevated rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald" />
                  Quick Stats
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary/60">Stories Watched</span>
                    <span className="text-text-primary font-medium">{profile.viewingHistory.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary/60">Mood Entries</span>
                    <span className="text-text-primary font-medium">{profile.moodHistory.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary/60">Impact Responses</span>
                    <span className="text-text-primary font-medium">{profile.impactResponses.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary/60">Personal Goals</span>
                    <span className="text-text-primary font-medium">{profile.personalGoals.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary/60">Growth Areas</span>
                    <span className="text-text-primary font-medium">{profile.growthAreas.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Emotional Tab */}
          {activeTab === 'emotional' && (
            <motion.div
              key="emotional"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="surface-elevated rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose" />
                  Emotional Intelligence
                </h3>
                
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Self-Awareness</label>
                    {isEditing ? (
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={profile.emotionalProfile.selfAwareness}
                        onChange={(e) => updateEmotionalProfile({ selfAwareness: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-text-primary/70">{profile.emotionalProfile.selfAwareness}/10</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Emotional Regulation</label>
                    {isEditing ? (
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={profile.emotionalProfile.emotionalRegulation}
                        onChange={(e) => updateEmotionalProfile({ emotionalRegulation: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-text-primary/70">{profile.emotionalProfile.emotionalRegulation}/10</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Empathy</label>
                    {isEditing ? (
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={profile.emotionalProfile.empathy}
                        onChange={(e) => updateEmotionalProfile({ empathy: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-text-primary/70">{profile.emotionalProfile.empathy}/10</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="surface-elevated rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4">Emotional Triggers</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Positive Triggers</label>
                    <textarea
                      value={profile.emotionalProfile.positiveTriggers.join(', ')}
                      onChange={(e) => updateEmotionalProfile({ 
                        positiveTriggers: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                      })}
                      disabled={!isEditing}
                      placeholder="Things that improve your mood..."
                      className="w-full px-4 py-2 surface-elevated rounded-lg text-text-primary placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 resize-none"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Negative Triggers</label>
                    <textarea
                      value={profile.emotionalProfile.negativeTriggers.join(', ')}
                      onChange={(e) => updateEmotionalProfile({ 
                        negativeTriggers: e.target.value.split(',').map(t => t.trim()).filter(t => t) 
                      })}
                      disabled={!isEditing}
                      placeholder="Things that negatively affect your mood..."
                      className="w-full px-4 py-2 surface-elevated rounded-lg text-text-primary placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-accent-primary disabled:opacity-50 resize-none"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="surface-elevated rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-cyan" />
                  Story Preferences
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Preferred Categories</label>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <label key={category.value} className="flex items-center gap-2 text-text-primary/60">
                          <input
                            type="checkbox"
                            checked={profile.storyPreferences.preferredCategories.includes(category.value)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...profile.storyPreferences.preferredCategories, category.value]
                                : profile.storyPreferences.preferredCategories.filter(c => c !== category.value);
                              updateStoryPreferences({ preferredCategories: updated });
                            }}
                            disabled={!isEditing}
                            className="rounded disabled:opacity-50"
                          />
                          <span>{category.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Preferred Difficulty</label>
                    <div className="space-y-2">
                      {difficulties.map(difficulty => (
                        <label key={difficulty.value} className="flex items-center gap-2 text-text-primary/60">
                          <input
                            type="checkbox"
                            checked={profile.storyPreferences.preferredDifficulty.includes(difficulty.value)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...profile.storyPreferences.preferredDifficulty, difficulty.value]
                                : profile.storyPreferences.preferredDifficulty.filter(d => d !== difficulty.value);
                              updateStoryPreferences({ preferredDifficulty: updated });
                            }}
                            disabled={!isEditing}
                            className="rounded disabled:opacity-50"
                          />
                          <span>{difficulty.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Preferred Length</label>
                    {isEditing ? (
                      <Dropdown
                        value={profile.storyPreferences.preferredLength}
                        onChange={(val) => updateStoryPreferences({ preferredLength: val as any })}
                        options={lengths}
                      />
                    ) : (
                      <p className="text-text-primary/70">{lengths.find(l => l.value === profile.storyPreferences.preferredLength)?.label}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Seeking Impacts</label>
                    <div className="space-y-2">
                      {impacts.map(impact => (
                        <label key={impact.value} className="flex items-center gap-2 text-text-primary/60">
                          <input
                            type="checkbox"
                            checked={profile.storyPreferences.seekingImpacts.includes(impact.value)}
                            onChange={(e) => {
                              const updated = e.target.checked
                                ? [...profile.storyPreferences.seekingImpacts, impact.value]
                                : profile.storyPreferences.seekingImpacts.filter(i => i !== impact.value);
                              updateStoryPreferences({ seekingImpacts: updated });
                            }}
                            disabled={!isEditing}
                            className="rounded disabled:opacity-50"
                          />
                          <span>{impact.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Learning Tab */}
          {activeTab === 'learning' && (
            <motion.div
              key="learning"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <div className="surface-elevated rounded-xl p-6">
                <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple" />
                  Learning Profile
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Focus Duration (minutes)</label>
                    {isEditing ? (
                      <input
                        type="number"
                        min="15"
                        max="180"
                        value={profile.learningProfile.focusDuration}
                        onChange={(e) => updateLearningProfile({ focusDuration: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 surface-elevated rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary"
                      />
                    ) : (
                      <p className="text-text-primary/70">{profile.learningProfile.focusDuration} minutes</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Comprehension Level</label>
                    {isEditing ? (
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={profile.learningProfile.comprehensionLevel}
                        onChange={(e) => updateLearningProfile({ comprehensionLevel: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-text-primary/70">{profile.learningProfile.comprehensionLevel}/10</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Growth Mindset</label>
                    {isEditing ? (
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={profile.learningProfile.growthMindset}
                        onChange={(e) => updateLearningProfile({ growthMindset: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-text-primary/70">{profile.learningProfile.growthMindset}/10</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary/80 mb-2">Curiosity</label>
                    {isEditing ? (
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={profile.learningProfile.curiosity}
                        onChange={(e) => updateLearningProfile({ curiosity: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    ) : (
                      <p className="text-text-primary/70">{profile.learningProfile.curiosity}/10</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </FadeIn>
        </StaggerContainer>
      </div>
    </div>
  );
}
