import re
import os

with open('src/features/story/AddStoryPage.tsx', 'r') as f:
    content = f.read()

# 1. Add new lucide icons to imports
import_match = re.search(r'import {([^}]+)} from \'lucide-react\';', content)
if import_match:
    icons = import_match.group(1)
    if 'ChevronRight' not in icons:
        new_icons = icons + '  ChevronRight,\n  ChevronLeft,\n  Check,\n'
        content = content.replace(import_match.group(0), f"import {{{new_icons}}} from 'lucide-react';")

# 2. Add Wizard State after form data setup
wizard_state = """
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('left');

  const validateStep = (step: number) => {
    if (step === 1) {
      if (!formData.title.trim()) return 'Title is required';
      if (!formData.category) return 'Category is required';
      if (!formData.platform.trim()) return 'Platform is required';
    }
    if (step === 2) {
      if (formData.currentEpisode && formData.totalEpisodes) {
        if (formData.currentEpisode > formData.totalEpisodes) {
          return 'Current episode cannot be greater than total episodes';
        }
      }
      if (formData.currentSeason && formData.totalSeasons) {
        if (formData.currentSeason > formData.totalSeasons) {
          return 'Current season cannot be greater than total seasons';
        }
      }
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep(currentStep);
    if (error) {
      alert(error);
      return;
    }
    setSlideDirection('left');
    setCurrentStep(prev => Math.min(prev + 1, 4));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSlideDirection('right');
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const slideVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'left' ? 30 : -30,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right') => ({
      zIndex: 0,
      x: direction === 'left' ? -30 : 30,
      opacity: 0
    })
  };
"""

content = content.replace("const [draftSaved, setDraftSaved] = useState(false);", "const [draftSaved, setDraftSaved] = useState(false);\n" + wizard_state)

# 3. We will find the EXACT `return (` that is for the component.
# In the original file, it looks like this:
#   return (
#     <div className="min-h-screen bg-transparent py-page relative z-10 pointer-events-auto">
# We can search for `  return (\n    <div className="min-h-screen`

jsx_start_idx = content.find('  return (\n    <div className="min-h-screen')

if jsx_start_idx == -1:
    print("Could not find the start of the JSX return!")
    exit(1)

with open('.gemini/scratch/new_jsx.txt', 'r') as f:
    new_jsx = f.read()

# Replace everything from the return statement onwards
content = content[:jsx_start_idx] + new_jsx

with open('src/features/story/AddStoryPage.tsx', 'w') as f:
    f.write(content)
print("Updated AddStoryPage.tsx")
