import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlurReveal } from '@/components/ui/motion/BlurReveal';
import { FadeIn } from '@/components/ui/motion/FadeIn';
import { StaggerContainer } from '@/components/ui/motion/StaggerContainer';
import { 
  BookOpen, 
  Search, 
  ChevronRight, 
  ChevronDown, 
  HelpCircle, 
  Compass, 
  Brain, 
  Heart, 
  Target, 
  Lightbulb, 
  Shield, 
  Settings, 
  Users, 
  Database,
  Filter,
  ArrowLeft,
  ExternalLink
} from 'lucide-react';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  articles: HelpArticle[];
}

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  related?: string[];
}

export function HelpDocumentation() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <Compass className="w-5 h-5" />,
      description: 'Everything you need to begin your journey',
      articles: [
        {
          id: 'installation',
          title: 'Installing Smriti Atlas',
          content: `
# Installing Smriti Atlas

## Step 1: Install the Atlas Dataset
The first step is to install our curated collection of transformative stories.

1. Navigate to the **Atlas Installer** from the main navigation
2. Click "Install Dataset" to download the core collection
3. Wait for the installation to complete (usually 1-2 minutes)
4. Verify the installation by checking the status indicator

## Step 2: Create Your Personal Profile
Personalize your experience by telling us about yourself.

1. Go to **Personal Profile** in the navigation
2. Fill in your basic information (age, life phase, interests)
3. Set your emotional intelligence preferences
4. Configure your story preferences and learning style

## Step 3: Explore the Atlas
Start discovering stories that match your needs.

1. Browse **Editorial Collections** for curated themes
2. Try the **Decision Engine** for personalized recommendations
3. Use **Mood Discovery** to find stories for your current feeling
4. Check **Life Phase Recommendations** for age-appropriate content

## Tips for Success
- Start with the Decision Engine for the best personalized experience
- Complete your profile for better recommendations
- Record your viewing history to track your growth journey
- Visit the Wisdom Dashboard regularly to review your insights
          `,
          category: 'setup',
          tags: ['installation', 'setup', 'beginner']
        },
        {
          id: 'first-story',
          title: 'Your First Story Experience',
          content: `
# Your First Story Experience

## Choosing Your First Story

### Using the Decision Engine
The Decision Engine is the best way to start:

1. **Current Mood**: Select how you're feeling right now
2. **Available Time**: Choose how much time you have (15min to 3hrs)
3. **Life Phase**: Select your current life situation
4. **Goals**: What do you want to achieve? (inspiration, learning, relaxation)
5. **Energy Level**: How much energy do you have?

The engine will analyze your responses and recommend 3-5 perfect stories.

### Alternative Discovery Methods

**Editorial Collections**: Browse curated themes like "Overcoming Adversity" or "Finding Purpose"

**Mood Discovery**: Select your current emotional state for mood-appropriate stories

**Life Phase**: Get recommendations based on your age and life situation

## During Your Story

### Active Viewing Tips
- Take notes on insights that resonate with you
- Pay attention to emotional shifts during the story
- Consider how the story relates to your life
- Think about what you learned or how you grew

### Recording Your Experience
After watching, record:
- Your rating (1-10)
- How you felt before and after
- The impact level on your personal growth
- Whether you'd recommend it to others
- Key insights or lessons learned

## After Your Story

### Reflect and Integrate
- Spend 5-10 minutes reflecting on the experience
- Write down any personal insights in your Wisdom Dashboard
- Consider how you can apply the lessons to your life
- Share your experience with others if you found it valuable

### Track Your Growth
- View your progress in the Personal Profile
- Monitor emotional patterns over time
- Celebrate milestones in your growth journey
- Adjust your preferences based on what you've learned
          `,
          category: 'usage',
          tags: ['first-time', 'viewing', 'experience']
        }
      ]
    },
    {
      id: 'features',
      title: 'Features & Tools',
      icon: <Lightbulb className="w-5 h-5" />,
      description: 'Learn about all available features',
      articles: [
        {
          id: 'decision-engine',
          title: 'Decision Engine',
          content: `
# Decision Engine

## Overview
The Decision Engine is your personal recommendation system that analyzes your current state and needs to suggest the perfect stories.

## How It Works
The engine considers multiple factors:

### Emotional State
- **Current Mood**: How you're feeling right now
- **Energy Level**: Your physical and mental energy
- **Stress Level**: Current stress and anxiety levels
- **Openness**: How receptive you are to new ideas

### Contextual Factors
- **Available Time**: How much time you have (15min to 3hrs)
- **Life Phase**: Your current life situation
- **Goals**: What you want to achieve
- **Social Context**: Whether you're alone or with others

### Personal Preferences
- **Learning Style**: Visual, auditory, or kinesthetic
- **Content Preferences**: Genres, themes, and topics you enjoy
- **Impact Goals**: What kind of transformation you're seeking
- **Past History**: Your previous viewing patterns and feedback

## Using the Decision Engine

### Step-by-Step Guide
1. **Access**: Click "Decision Engine" in the Atlas Navigation
2. **Answer Questions**: Complete the 5-step questionnaire
3. **Analysis**: Wait for the AI to analyze your responses
4. **Recommendations**: Review your personalized suggestions
5. **Choose**: Select a story that resonates with you

### Understanding Recommendations
Each recommendation includes:
- **Why This Story**: The reasoning behind the suggestion
- **Expected Impact**: What you might gain from this story
- **Time Commitment**: How long the experience will take
- **Emotional Journey**: The likely emotional arc
- **Learning Opportunities**: Key insights and lessons

### Tips for Best Results
- Be honest about your current state
- Consider your true goals, not what you think you "should" want
- Trust your intuition when choosing between recommendations
- Record your feedback to improve future suggestions
          `,
          category: 'feature',
          tags: ['recommendations', 'ai', 'personalization']
        },
        {
          id: 'wisdom-dashboard',
          title: 'Wisdom Dashboard',
          content: `
# Wisdom Dashboard

## Overview
The Wisdom Dashboard is your personal knowledge management system where you collect, organize, and reflect on insights gained from your story experiences.

## Key Components

### Personal Insights
Capture meaningful realizations and "aha moments":
- **Title**: A brief, memorable name for the insight
- **Description**: Detailed explanation of what you learned
- **Category**: Type of insight (emotional, intellectual, spiritual, etc.)
- **Depth**: How profound the insight is (1-10)
- **Context**: When and how you discovered this
- **Action Steps**: How you can apply this insight

### Personal Principles
Document your core beliefs and guiding principles:
- **Name**: A clear, concise statement of the principle
- **Description**: What this principle means to you
- **Category**: Life area this applies to (work, relationships, etc.)
- **Importance**: How central this is to your life (1-10)
- **Origin Story**: How you discovered this principle
- **Application**: Where and how you apply it

### Meaningful Quotes
Collect quotes that resonate with you:
- **Content**: The exact quote
- **Source**: Where it comes from
- **Personal Meaning**: What it means to you
- **Context**: When you discovered it
- **Resonance**: How strongly it affects you (1-10)

### Life Lessons
Track important lessons learned:
- **Title**: A clear name for the lesson
- **Description**: What you learned and why it matters
- **Category**: Type of lesson (personal, professional, etc.)
- **Difficulty**: How hard this lesson was to learn (1-10)
- **Value**: How valuable this lesson is to you (1-10)
- **Application**: How you use this lesson

## Best Practices

### Regular Reflection
- Review your insights weekly
- Look for patterns in your learning
- Update principles as you grow
- Celebrate your progress

### Organization
- Use categories to organize content
- Tag items for easy searching
- Link related insights together
- Create collections for specific themes

### Sharing and Legacy
- Export your wisdom for safekeeping
- Share insights with trusted friends
- Create a personal philosophy document
- Build your legacy of wisdom
          `,
          category: 'feature',
          tags: ['wisdom', 'insights', 'tracking']
        }
      ]
    },
    {
      id: 'personal-intelligence',
      title: 'Personal Intelligence',
      icon: <Brain className="w-5 h-5" />,
      description: 'Understanding your AI companion',
      articles: [
        {
          id: 'emotional-intelligence',
          title: 'Emotional Intelligence Tracking',
          content: `
# Emotional Intelligence Tracking

## Overview
Smriti Atlas tracks your emotional intelligence patterns to help you understand yourself better and provide more personalized recommendations.

## What We Track

### Emotional Patterns
- **Mood Trends**: How your mood changes over time
- **Triggers**: What causes emotional shifts
- **Responses**: How you react to different situations
- **Regulation**: How well you manage your emotions
- **Awareness**: Your level of emotional self-awareness

### Story Impact Analysis
- **Emotional Journey**: How stories affect your emotions
- **Resonance**: Which content connects with you deeply
- **Transformation**: How stories change your perspective
- **Application**: How you apply insights to your life
- **Growth**: Your progress in emotional intelligence

### Learning Patterns
- **Optimal Times**: When you learn best
- **Focus Duration**: How long you can maintain attention
- **Comprehension**: How well you understand complex ideas
- **Retention**: How well you remember what you learn
- **Application**: How you apply new knowledge

## Using This Information

### Personal Growth
- Identify areas for emotional development
- Understand your learning patterns
- Optimize your viewing schedule
- Track your progress over time

### Better Recommendations
- Get content that matches your emotional state
- Receive stories that align with your growth goals
- Find content that fits your learning style
- Discover stories that resonate with your values

### Self-Awareness
- Recognize emotional patterns
- Understand your triggers and responses
- Develop better emotional regulation
- Build emotional intelligence

## Privacy and Control
- All emotional data is stored locally on your device
- You control what gets tracked and recorded
- You can delete or modify any emotional data
- No emotional data is ever shared or transmitted
          `,
          category: 'intelligence',
          tags: ['emotions', 'tracking', 'privacy']
        }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      icon: <Shield className="w-5 h-5" />,
      description: 'Solve common issues and problems',
      articles: [
        {
          id: 'common-issues',
          title: 'Common Issues and Solutions',
          content: `
# Common Issues and Solutions

## Installation Problems

### Dataset Won't Install
**Problem**: Installation gets stuck or fails
**Solutions**:
- Check your internet connection
- Ensure you have at least 500MB of free storage
- Try refreshing the page and restarting the installation
- Clear your browser cache and try again

### Installation is Slow
**Problem**: Installation is taking longer than expected
**Solutions**:
- Large datasets can take 2-5 minutes to install
- Check your internet speed
- Close other tabs and applications
- Try installing during off-peak hours

## Performance Issues

### Slow Loading
**Problem**: Pages are loading slowly
**Solutions**:
- Check your device's memory usage
- Close unnecessary browser tabs
- Restart your browser
- Check the System Health dashboard for issues

### Crashes or Freezes
**Problem**: Application crashes or becomes unresponsive
**Solutions**:
- Refresh the page
- Check browser console for errors
- Try a different browser
- Report the issue with details

## Data Issues

### Missing Profile Data
**Problem**: Personal profile information disappeared
**Solutions**:
- Check if you're using the same browser/device
- Clear browser cache and reload
- Check System Health for database issues
- Recreate your profile if necessary

### Viewing History Not Saving
**Problem**: Recently viewed stories aren't being recorded
**Solutions**:
- Ensure you're logged in to your profile
- Check browser storage permissions
- Try recording a viewing manually
- Check System Health for database status

## Feature Issues

### Recommendations Not Working
**Problem**: Decision Engine isn't giving good suggestions
**Solutions**:
- Complete your profile information
- Be more specific in your answers
- Try different mood/goal combinations
- Provide feedback on recommendations

### Search Not Finding Results
**Problem**: Search returns no results for common terms
**Solutions**:
- Check spelling of search terms
- Try broader search terms
- Use different keywords
- Browse categories instead

## Getting Help

### System Health Dashboard
Check the System Health dashboard for:
- Database status and integrity
- Performance metrics
- Error logs and reports
- Storage availability

### Contact Support
If issues persist:
- Document the problem with screenshots
- Note what you were doing when it occurred
- Check error messages in the console
- Report through the help system

### Self-Service Options
- Browse this help documentation
- Check the FAQ section
- Try the troubleshooting wizard
- Review community forums
          `,
          category: 'support',
          tags: ['troubleshooting', 'issues', 'solutions']
        }
      ]
    }
  ];

  const filteredSections = helpSections.map(section => ({
    ...section,
    articles: section.articles.filter(article =>
      article.title.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
    )
  })).filter(section => section.articles.length > 0);

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const selectArticle = (article: HelpArticle) => {
    setSelectedArticle(article);
  };

  const goBack = () => {
    setSelectedArticle(null);
  };

  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gradient-midnight p-page">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <BlurReveal>
          <div className="flex items-center gap-4 mb-page">
            <button
              onClick={goBack}
              className="btn btn-secondary flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Help
            </button>
            <div className="flex-1">
              <h1 className="heading-1 text-primary">{selectedArticle.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="text-secondary text-sm capitalize">{selectedArticle.category}</span>
                {selectedArticle.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-1 bg-midnight-surface rounded-full text-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
          </BlurReveal>

          {/* Content */}
          <FadeIn>
          <div className="surface-elevated rounded-card p-8">
            <div className="prose prose-invert max-w-none">
              {selectedArticle.content.split('\n').map((line, index) => {
                if (line.startsWith('# ')) {
                  return <h1 key={index} className="heading-1 text-primary mt-8 mb-4">{line.slice(2)}</h1>;
                } else if (line.startsWith('## ')) {
                  return <h2 key={index} className="heading-2 text-primary mt-6 mb-3">{line.slice(3)}</h2>;
                } else if (line.startsWith('### ')) {
                  return <h3 key={index} className="heading-3 text-primary mt-4 mb-2">{line.slice(4)}</h3>;
                } else if (line.startsWith('- ')) {
                  return <li key={index} className="text-secondary ml-6 mb-1">{line.slice(2)}</li>;
                } else if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={index} className="text-primary font-semibold mb-2">{line.slice(2, -2)}</p>;
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return <p key={index} className="text-secondary mb-2">{line}</p>;
                }
              })}
            </div>
          </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-midnight p-page">
      <div className="max-w-6xl mx-auto">
        <StaggerContainer>
        {/* Header */}
        <BlurReveal>
        <div className="flex items-center gap-4 mb-page">
          <div className="p-3 bg-gradient-violet rounded-xl shadow-elevation">
            <BookOpen className="w-8 h-8 text-text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="heading-1 text-primary">Help Documentation</h1>
            <p className="text-secondary">Everything you need to master Smriti Atlas</p>
          </div>
        </div>
        </BlurReveal>

        {/* Search */}
        <FadeIn>
        <div className="relative mb-section">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search for help articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 surface-elevated rounded-card text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
          />
        </div>

        {/* Help Sections */}
        <div className="space-y-4">
          {filteredSections.map((section) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="surface-elevated rounded-card overflow-hidden"
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full p-6 flex items-center justify-between hover:surface-hover transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="heading-3 text-primary">{section.title}</h3>
                    <p className="text-secondary text-sm">{section.description}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-secondary transition-transform ${
                    expandedSection === section.id ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {expandedSection === section.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="border-t border-midnight-border"
                  >
                    <div className="p-6 space-y-2">
                      {section.articles.map((article) => (
                        <button
                          key={article.id}
                          onClick={() => selectArticle(article)}
                          className="w-full p-4 surface-hover rounded-card flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <HelpCircle className="w-4 h-4 text-secondary" />
                            <div className="text-left">
                              <h4 className="text-primary font-medium">{article.title}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-secondary capitalize">{article.category}</span>
                                {article.tags.slice(0, 2).map(tag => (
                                  <span key={tag} className="text-xs px-2 py-0.5 bg-midnight-surface rounded-full text-secondary">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-secondary group-hover:text-accent-primary transition-colors" />
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredSections.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-muted mx-auto mb-4" />
            <h3 className="heading-3 text-primary mb-2">No Results Found</h3>
            <p className="text-secondary">Try searching with different keywords</p>
          </div>
        )}
        </FadeIn>
        </StaggerContainer>
      </div>
    </div>
  );
}
