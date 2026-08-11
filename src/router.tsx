import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { LoadingScreen } from '@/components/system/LoadingScreen';
import { AuthGuard } from '@/components/auth/AuthGuard';

const LoginPage = React.lazy(() => import('@/features/auth/LoginPage'));
const HomePage = React.lazy(() => import('@/features/home/HomePage'));
const LibraryPage = React.lazy(() => import('@/features/library/LibraryPage'));
const StoryPage = React.lazy(() => import('@/features/story/StoryPage'));
const StoryPageEnhanced = React.lazy(() => import('@/features/story/StoryPageEnhanced'));
const AddStoryPage = React.lazy(() => import('@/features/story/AddStoryPage'));
const MemoryPage = React.lazy(() => import('@/features/memory/MemoryPage').then(module => ({ default: module.MemoryPage })));
const MemoryWorldPage = React.lazy(() => import('@/features/memory/MemoryWorldPage'));
const DiscoverPage = React.lazy(() => import('@/features/discover/DiscoverPage'));
const DiscoverWorldPage = React.lazy(() => import('@/features/discover/DiscoverWorldPage'));
const ExportPage = React.lazy(() => import('@/features/export/ExportPage'));
const ExportSystemPage = React.lazy(() => import('@/features/export/ExportSystemPage').then(module => ({ default: module.ExportSystemPage })));
const SettingsPage = React.lazy(() => import('@/features/settings/SettingsPage'));
const SettingsVaultPage = React.lazy(() => import('@/features/settings/SettingsVaultPage'));
const SmritiEnginePage = React.lazy(() => import('@/features/intelligence/SmritiEnginePage'));
const AtlasInstaller = React.lazy(() => import('@/features/atlas/AtlasInstaller').then(module => ({ default: module.AtlasInstaller })));
const AtlasBrowser = React.lazy(() => import('@/features/atlas/AtlasBrowser').then(module => ({ default: module.AtlasBrowser })));
const EditorialCollections = React.lazy(() => import('@/features/atlas/EditorialCollections').then(module => ({ default: module.EditorialCollections })));
const LifePhaseRecommendations = React.lazy(() => import('@/features/atlas/LifePhaseRecommendations').then(module => ({ default: module.LifePhaseRecommendations })));
const MoodDiscovery = React.lazy(() => import('@/features/atlas/MoodDiscovery').then(module => ({ default: module.MoodDiscovery })));
const DecisionEngine = React.lazy(() => import('@/features/atlas/DecisionEngine').then(module => ({ default: module.DecisionEngine })));
const PersonalProfile = React.lazy(() => import('@/features/atlas/PersonalProfile').then(module => ({ default: module.PersonalProfile })));
const WisdomDashboard = React.lazy(() => import('@/features/atlas/WisdomDashboard').then(module => ({ default: module.WisdomDashboard })));
const UserOnboarding = React.lazy(() => import('@/features/onboarding/UserOnboarding').then(module => ({ default: module.UserOnboarding })));
const HelpDocumentation = React.lazy(() => import('@/features/help/HelpDocumentation').then(module => ({ default: module.HelpDocumentation })));
const WatchCalendar = React.lazy(() => import('@/features/calendar/WatchCalendar'));
const AchievementsSystem = React.lazy(() => import('@/features/achievements/AchievementsSystem'));

function suspense(node: React.ReactElement, title: string) {
  return (
    <React.Suspense fallback={<LoadingScreen title={title} />}>
      {node}
    </React.Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: suspense(<LoginPage />, 'Preparing Authentication System'),
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      { index: true, element: suspense(<HomePage />, 'Opening Your Stories') },
      { path: 'library', element: suspense(<LibraryPage />, 'Opening Story Library') },
      { path: 'story/:storyId', element: suspense(<StoryPage />, 'Opening Story Details') },
      { path: 'story/:storyId/enhanced', element: suspense(<StoryPageEnhanced />, 'Opening Enhanced Story Details') },
      { path: 'add-story', element: suspense(<AddStoryPage />, 'Adding New Story') },
      { path: 'memory', element: suspense(<MemoryPage />, 'Opening Your Memories') },
      { path: 'memory-world', element: suspense(<MemoryWorldPage />, 'Opening Memory World') },
      { path: 'discover', element: suspense(<DiscoverPage />, 'Opening Discover') },
      { path: 'discover-world', element: suspense(<DiscoverWorldPage />, 'Opening Smriti Atlas') },
      { path: 'export', element: suspense(<ExportPage />, 'Creating Storybook') },
      { path: 'export-system', element: suspense(<ExportSystemPage />, 'Opening Export System') },
      { path: 'settings', element: suspense(<SettingsPage />, 'Opening Katha Settings') },
      { path: 'settings-vault', element: suspense(<SettingsVaultPage />, 'Opening Settings Vault') },
      { path: 'intelligence', element: suspense(<SmritiEnginePage />, 'Opening Smriti Intelligence') },
      { path: 'atlas-installer', element: suspense(<AtlasInstaller />, 'Installing Smriti Atlas') },
      { path: 'atlas', element: suspense(<AtlasBrowser />, 'Browsing Smriti Atlas') },
      { path: 'atlas/collections', element: suspense(<EditorialCollections />, 'Viewing Editorial Collections') },
      { path: 'atlas/life-phases', element: suspense(<LifePhaseRecommendations />, 'Life Phase Recommendations') },
      { path: 'atlas/moods', element: suspense(<MoodDiscovery />, 'Mood-Based Discovery') },
      { path: 'atlas/decision-engine', element: suspense(<DecisionEngine />, 'Decision Engine') },
      { path: 'atlas/profile', element: suspense(<PersonalProfile />, 'Personal Profile') },
      { path: 'atlas/wisdom', element: suspense(<WisdomDashboard />, 'Wisdom Dashboard') },
      { path: 'calendar', element: suspense(<WatchCalendar />, 'Watch Calendar') },
      { path: 'achievements', element: suspense(<AchievementsSystem />, 'Achievements') },
      { path: 'help', element: suspense(<HelpDocumentation />, 'Help Documentation') },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
